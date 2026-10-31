#!/usr/bin/env node
import { Docsy } from "@remcp/docsy-sdk";
import { setup,type Agent } from "./setup.js";
import { wantsHelp } from "./help.js";
import { detectProjectStack } from "./detect-stack.js";

const args=process.argv.slice(2);
const command=args.shift();
const value=(flag:string)=>{const i=args.indexOf(flag);return i>=0?args[i+1]:undefined;};
const values=(flag:string)=>args.flatMap((item,index)=>item===flag&&args[index+1]?[args[index+1]!]:[]);
const has=(flag:string)=>args.includes(flag);
const baseUrl=value("--base-url")??process.env.DOCSY_BASE_URL??"https://docsy.remcp.site";
const apiKey=value("--api-key")??process.env.DOCSY_API_KEY;
const client=new Docsy({baseUrl,apiKey,headers:{"x-docsy-client":"cli"}});

function help(){
  console.log([
    "Docsy — current documentation for AI coding agents",
    "",
    "Usage:",
    "  docsy detect [directory] [--json]  # offline; never uploads your manifest",
    "  docsy library <name> [query] [--json]",
    "  docsy docs <libraryId> <query> [--fast] [--json]",
    "  docsy search <query> [--library NAME] [--version VERSION] [--language LANGUAGE] [--json]",
    "  docsy refresh <libraryId> [--branch BRANCH]",
    "  docsy metrics <libraryId> [--days N]",
    "  docsy policies [--patch-json JSON]",
    "  docsy add github <repositoryUrl>",
    "  docsy add gitlab <repositoryUrl>",
    "  docsy add bitbucket <repositoryUrl>",
    "  docsy add git <repositoryUrl>",
    "  docsy add website <url> [--base-url-scope URL]",
    "  docsy add llmstxt <url>",
    "  docsy add openapi <url>",
    "  docsy setup --cursor|--claude|--codex|--vscode|--gemini|--opencode|--copilot [--project] [--api-key KEY]",
    "  docsy mcp",
    "",
    "Options:",
    "  --base-url URL   Docsy deployment root",
    "  --api-key KEY    Personal docsy_ API key",
    "  --json           JSON output",
    "  --project        Configure current project instead of global client config"
  ].join("\n"));
}
async function main(){
  if(wantsHelp(command,args)){help();return;}
  if(command==="mcp"){console.log(baseUrl.replace(/\/$/,"")+"/mcp");return;}
  if(command==="detect"){
    const directory=args[0]&&!args[0].startsWith("--")?args[0]:process.cwd();
    const dependencies=await detectProjectStack(directory);
    if(has("--json"))console.log(JSON.stringify(dependencies,null,2));
    else {
      if(!dependencies.length)console.log("No supported dependency manifests found.");
      for(const entry of dependencies)console.log(`${entry.ecosystem.padEnd(6)} ${entry.name}${entry.version?" "+entry.version:""}`);
    }
    return;
  }
  if(command==="library"){
    const name=args[0];if(!name)throw new Error("library name is required");
    const query=args[1]&&!args[1].startsWith("--")?args[1]:name;
    const results=await client.searchLibrary(query,name);
    if(has("--json")){console.log(JSON.stringify(results,null,2));return;}
    if(!results.length){console.log("No matching libraries.");return;}
    for(let i=0;i<results.length;i++){
      const x=results[i]!;
      console.log((i+1)+". "+x.name+"\n   Library ID: "+x.libraryId+"\n   "+x.description+"\n   Code Snippets: "+x.codeSnippets+"\n   Versions: "+(x.versions.join(", ")||"none")+"\n");
    }
    return;
  }
  if(command==="docs"){
    const libraryId=args[0],query=args[1];
    if(!libraryId||!query)throw new Error("docs requires <libraryId> <query>");
    const result=await client.getContext(query,libraryId,{type:has("--json")?"json":"txt",fast:has("--fast")});
    console.log(typeof result==="string"?result:JSON.stringify(result,null,2));return;
  }
  if(command==="search"){
    const query=args[0];if(!query)throw new Error("search query is required");
    const libraries=values("--library");
    const result=await client.search(query,{
      type:has("--json")?"json":"txt",
      ...(libraries.length?{library:libraries}:{}),
      ...(value("--version")?{version:value("--version")}:{}),
      ...(value("--language")?{language:value("--language")}: {})
    });
    console.log(typeof result==="string"?result:JSON.stringify(result,null,2));return;
  }
  if(command==="refresh"){
    const libraryId=args[0];if(!libraryId)throw new Error("refresh requires <libraryId>");
    const result=await client.refreshLibrary(libraryId,{...(value("--branch")?{branch:value("--branch")}:{})});
    console.log(has("--json")?JSON.stringify(result,null,2):result.message);return;
  }
  if(command==="metrics"){
    const libraryId=args[0];if(!libraryId)throw new Error("metrics requires <libraryId>");
    const daysRaw=value("--days");
    const days=daysRaw?Number(daysRaw):30;
    if(!Number.isInteger(days)||days<1||days>365)throw new Error("--days must be an integer between 1 and 365");
    const result=await client.getLibraryMetrics(libraryId,days);
    console.log(JSON.stringify(result,null,2));return;
  }
  if(command==="policies"){
    const patch=value("--patch-json");
    const result=patch
      ? await client.updatePolicies(JSON.parse(patch) as Record<string,unknown>)
      : await client.getPolicies();
    console.log(JSON.stringify(result,null,2));return;
  }
  if(command==="add"){
    const kind=args[0],sourceUrl=args[1];
    if(!kind||!sourceUrl)throw new Error("add requires <github|gitlab|bitbucket|git|website|llmstxt|openapi> <url>");
    const result=kind==="github"
      ? await client.addGitHubRepository(sourceUrl)
      : kind==="gitlab"
        ? await client.addGitLabRepository(sourceUrl)
        : kind==="bitbucket"
          ? await client.addBitbucketRepository(sourceUrl)
          : kind==="git"
            ? await client.addGitRepository(sourceUrl)
            : kind==="website"
        ? await client.addWebsite(sourceUrl,{...(value("--base-url-scope")?{websiteBaseUrl:value("--base-url-scope")}:{})})
        : kind==="llmstxt"
          ? await client.addLlmsTxt(sourceUrl)
          : kind==="openapi"
            ? await client.addOpenApi(sourceUrl)
            : (()=>{throw new Error("Unknown source type: "+kind);})();
    console.log(has("--json")?JSON.stringify(result,null,2):result.message+"\nLibrary ID: "+result.libraryName);
    return;
  }
  if(command==="setup"){
    const agents:Agent[]=["cursor","claude","codex","vscode","gemini","opencode","copilot"];
    const agent=agents.find(a=>has("--"+a));
    if(!agent)throw new Error("Choose --cursor, --claude, --codex, --vscode, --gemini, --opencode or --copilot");
    const result=await setup(agent,has("--project")?"project":"global",baseUrl,apiKey);
    console.log("Configured Docsy for "+agent+".\nMCP: "+result.mcpUrl+"\nConfig: "+result.configPath+"\nRule: "+result.rulePath);
    return;
  }
  throw new Error("Unknown command: "+command);
}
main().catch(error=>{console.error(error instanceof Error?error.message:String(error));process.exitCode=1;});
