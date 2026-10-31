import { describe,expect,it } from "vitest";
import { Docsy } from "../src/index.js";

describe("Docsy SDK",()=>{
  it("retries retryable cold recovery responses for GET context calls",async()=>{
    let calls=0;
    const client=new Docsy({
      baseUrl:"https://docsy.example",
      timeoutMs:5_000,
      fetch:async()=>{
        calls++;
        if(calls<=3){
          return new Response(JSON.stringify({
            error:"cold_recovery_pending",
            message:"Cold documentation index is rebuilding; retry shortly."
          }),{
            status:503,
            headers:{"content-type":"application/json","retry-after":"0"}
          });
        }
        return new Response(JSON.stringify({
          documents:[{
            id:"00000000-0000-5000-8000-000000000001",
            libraryId:"/example/docs",
            version:"main",
            title:"Authentication",
            heading:"Middleware",
            url:"https://example.test/docs",
            path:"docs.md",
            content:"ready",
            score:1
          }]
        }),{status:200,headers:{"content-type":"application/json"}});
      }
    });
    const result=await client.getContext("authentication middleware","/example/docs");
    expect(calls).toBe(4);
    expect(typeof result).toBe("object");
    expect((result as {documents?:Array<{content:string}>}).documents?.[0]?.content).toBe("ready");
  });

  it("sends v3 filters and API key headers",async()=>{
    const seen:Array<{url:string;init?:RequestInit}>=[];
    const client=new Docsy({
      baseUrl:"https://docsy.example",
      apiKey:"docsy_test",
      fetch:async(input,init)=>{
        seen.push({url:String(input),init});
        return new Response(JSON.stringify({codeSnippets:[],infoSnippets:[],rules:{libraries:[]}}),{
          status:200,headers:{"content-type":"application/json"}
        });
      }
    });
    await client.search("route handlers",{type:"json",library:["express","fastify"],version:"5.1",language:"typescript"});
    expect(seen).toHaveLength(1);
    const url=new URL(seen[0]!.url);
    expect(url.pathname).toBe("/api/v3/search");
    expect(url.searchParams.getAll("library")).toEqual(["express","fastify"]);
    expect(url.searchParams.get("version")).toBe("5.1");
    expect(url.searchParams.get("language")).toBe("typescript");
    expect(new Headers(seen[0]!.init?.headers).get("authorization")).toBe("Bearer docsy_test");
  });

  it("refreshes a library with authenticated POST JSON",async()=>{
    let seen:RequestInit|undefined;
    const client=new Docsy({
      apiKey:"docsy_test",
      fetch:async(_input,init)=>{
        seen=init;
        return new Response(JSON.stringify({message:"Refresh started successfully.",id:"job-1",status:"queued"}),{
          status:202,headers:{"content-type":"application/json"}
        });
      }
    });
    const result=await client.refreshLibrary("/facebook/react",{branch:"v19"});
    expect(seen?.method).toBe("POST");
    expect(new Headers(seen?.headers).get("content-type")).toBe("application/json");
    expect(JSON.parse(String(seen?.body))).toEqual({libraryName:"/facebook/react",branch:"v19"});
    expect(result.status).toBe("queued");
  });

  it("submits supported source types to Context7-compatible endpoints",async()=>{
    const seen:Array<{url:string;body:unknown}>=[];
    const client=new Docsy({
      baseUrl:"https://docsy.example",
      apiKey:"docsy_test",
      fetch:async(input,init)=>{
        seen.push({url:String(input),body:init?.body?JSON.parse(String(init.body)):null});
        return new Response(JSON.stringify({libraryName:"/source/example",message:"Repository submitted successfully",jobId:"job-1"}),{status:200});
      }
    });
    await client.addGitHubRepository("https://github.com/facebook/react");
    await client.addGitLabRepository("https://gitlab.com/gitlab-org/cli");
    await client.addBitbucketRepository("https://bitbucket.org/example/project");
    await client.addGitRepository("https://codeberg.org/example/project");
    await client.addWebsite("https://docs.example.com/guide",{websiteBaseUrl:"https://docs.example.com/"});
    await client.addLlmsTxt("https://docs.example.com/llms.txt");
    await client.addOpenApi("https://api.example.com/openapi.json");
    expect(seen.map(x=>new URL(x.url).pathname)).toEqual([
      "/api/v2/add/repo/github",
      "/api/v2/add/repo/gitlab",
      "/api/v2/add/repo/bitbucket",
      "/api/v2/add/repo/git",
      "/api/v2/add/website",
      "/api/v2/add/llmstxt",
      "/api/v2/add/openapi"
    ]);
    expect(seen[4]?.body).toEqual({websiteUrl:"https://docs.example.com/guide",websiteBaseUrl:"https://docs.example.com/"});
  });

  it("gets and patches policies with authenticated requests",async()=>{
    const calls:Array<{url:string;init?:RequestInit}>=[];
    const responseBody={
      sourceTypes:{
        public_repos:{enabled:true},private_sources:{enabled:false},confluence:{enabled:false},
        uploaded_files:{enabled:true},websites:{enabled:true},llmstxt:{enabled:true},notion:{enabled:false}
      },
      libraryFilters:{
        mode:"quality",
        quality:{
          requireVerified:false,minTrustScore:null,maxAgeDays:null,blockedLibraries:[],exceptedLibraries:[],
          repoFilters:{minStars:null,allowedLicenses:[]},
          websiteFilters:{minBacklinks:null,minReferringDomains:null,minOrganicTraffic:null}
        },
        select:{allowedLibraries:[]}
      },
      accessibleLibraryCount:10
    };
    const client=new Docsy({
      apiKey:"docsy_test",
      fetch:async(input,init)=>{
        calls.push({url:String(input),init});
        return new Response(JSON.stringify(responseBody),{status:200,headers:{"content-type":"application/json"}});
      }
    });
    await client.getPolicies();
    await client.updatePolicies({sourceTypes:{disable:["websites"]}});
    expect(new URL(calls[0]!.url).pathname).toBe("/api/v2/policies");
    expect(calls[1]!.init?.method).toBe("PATCH");
    expect(JSON.parse(String(calls[1]!.init?.body))).toEqual({sourceTypes:{disable:["websites"]}});
  });

  it("retrieves library metrics",async()=>{
    let requestUrl="";
    const client=new Docsy({
      apiKey:"docsy_test",
      fetch:async(input)=>{
        requestUrl=String(input);
        return new Response(JSON.stringify({
          libraryId:"/facebook/react",name:"React",days:30,
          totals:{apiTxt:1,apiJson:2,mcpRequests:3,pageViews:4},daily:[]
        }),{status:200,headers:{"content-type":"application/json"}});
      }
    });
    const metrics=await client.getLibraryMetrics("/facebook/react",30);
    const url=new URL(requestUrl);
    expect(url.pathname).toBe("/api/v2/libs/metrics");
    expect(url.searchParams.get("libraryId")).toBe("/facebook/react");
    expect(url.searchParams.get("days")).toBe("30");
    expect(metrics.totals.mcpRequests).toBe(3);
  });
});
