export interface DocsyConfig {
  baseUrl?: string;
  apiKey?: string;
  headers?: Record<string,string>;
  timeoutMs?: number;
  fetch?: typeof fetch;
}

export interface Library {
  libraryId:string;
  name:string;
  description:string;
  codeSnippets:number;
  sourceReputation:"High"|"Medium"|"Low"|"Unknown";
  benchmarkScore:number;
  versions:string[];
  id?:string;
  title?:string;
  totalSnippets?:number;
  trustScore?:number;
  state?:string;
}

export interface Documentation {
  id:string;
  libraryId:string;
  version:string;
  title:string;
  heading:string;
  url:string;
  path:string;
  content:string;
  score:number;
}

export interface CodeSnippet {
  codeTitle:string;
  codeDescription:string;
  codeLanguage:string;
  codeTokens:number;
  codeId:string;
  pageTitle:string;
  codeList:Array<{language:string;code:string}>;
  isDynamic?:boolean;
  sourceFile?:string;
  libraryId?:string;
  version?:string;
}

export interface InfoSnippet {
  pageId?:string;
  breadcrumb?:string;
  content:string;
  contentTokens:number;
  libraryId?:string;
  version?:string;
}

export interface ContextResponse {
  codeSnippets:CodeSnippet[];
  infoSnippets:InfoSnippet[];
  rules?:{
    global?:string[];
    libraryOwn?:string[];
    libraryTeam?:string[];
    libraries?:Array<{libraryId:string;libraryOwn:string[];libraryTeam:string[]}>;
  };
  documents?:Documentation[];
}

export interface AddSourceResult {
  libraryName:string;
  message:string;
  jobId?:string;
}

export interface LibraryMetrics {
  libraryId:string;
  name:string;
  days:number;
  total:{page:number;txt:number;mcp:number;cli:number};
  totals:{
    apiTxt:number;
    apiJson:number;
    mcpRequests:number;
    cliRequests:number;
    pageViews:number;
  };
  daily:Array<{
    day:string;
    date:string;
    apiTxt:number;
    apiJson:number;
    mcpRequests:number;
    cliRequests:number;
    pageViews:number;
    page:number;
    txt:number;
    mcp:number;
    cli:number;
    total:number;
  }>;
  mcpClients:{dailyData:unknown[]};
  topics:unknown[];
  countries:unknown[];
}

export type PolicySourceType="public_repos"|"private_sources"|"confluence"|"uploaded_files"|"websites"|"llmstxt"|"notion";

export interface PolicyResponse {
  sourceTypes:Record<PolicySourceType,{enabled:boolean}>;
  libraryFilters:{
    mode:"quality"|"select";
    quality:{
      requireVerified:boolean;
      minTrustScore:number|null;
      maxAgeDays:number|null;
      blockedLibraries:string[];
      exceptedLibraries:string[];
      repoFilters:{minStars:number|null;allowedLicenses:string[]};
      websiteFilters:{minBacklinks:number|null;minReferringDomains:number|null;minOrganicTraffic:number|null};
    };
    select:{allowedLibraries:string[]};
  };
  accessibleLibraryCount:number;
}

export type PolicyPatch=Record<string,unknown>;

export class DocsyError extends Error {
  constructor(
    message:string,
    public readonly status?:number,
    public readonly code?:string,
    public readonly retryAfterSeconds?:number
  ){
    super(message);
    this.name="DocsyError";
  }
}

export class Docsy {
  private readonly baseUrl:string;
  private readonly apiKey?:string;
  private readonly headers:Record<string,string>;
  private readonly timeoutMs:number;
  private readonly fetcher:typeof fetch;

  constructor(config:DocsyConfig={}){
    this.baseUrl=(config.baseUrl??"https://docsy.remcp.site").replace(/\/$/,"");
    this.apiKey=config.apiKey;
    this.headers=config.headers??{};
    this.timeoutMs=config.timeoutMs??45_000;
    this.fetcher=config.fetch??fetch;
  }

  private async request(path:string,options:{accept?:string;method?:"GET"|"POST"|"PATCH";body?:unknown}={}):Promise<Response>{
    const headers:Record<string,string>={accept:options.accept??"application/json",...this.headers};
    if(this.apiKey)headers.authorization="Bearer "+this.apiKey;
    if(options.body!==undefined)headers["content-type"]="application/json";
    const method=options.method??"GET";
    const deadline=Date.now()+this.timeoutMs;
    for(let attempt=0;;attempt++){
      const remaining=deadline-Date.now();
      if(remaining<=0)throw new DocsyError("Docsy request timed out",408);
      const response=await this.fetcher(this.baseUrl+path,{
        method,
        headers,
        ...(options.body!==undefined?{body:JSON.stringify(options.body)}:{}),
        signal:AbortSignal.timeout(remaining)
      });
      if(response.ok)return response;

      let message="Docsy request failed with HTTP "+response.status;
      let code:string|undefined;
      try{
        const value=await response.json() as {error?:string;message?:string};
        code=value.error;
        message=value.message??value.error??message;
      }catch{}
      const retryHeader=response.headers.get("retry-after");
      const parsedRetry=retryHeader==null?NaN:Number(retryHeader);
      const retryAfterSeconds=Number.isFinite(parsedRetry)&&parsedRetry>=0?parsedRetry:undefined;
      const retryable=method==="GET"&&response.status===503&&
        (code==="cold_recovery_pending"||code==="cold_recovery_busy");
      if(retryable){
        const delay=Math.max(0,Math.min(
          retryAfterSeconds===undefined?5_000:retryAfterSeconds*1000,
          deadline-Date.now()-50
        ));
        if(delay>=0&&deadline-Date.now()>50){
          if(delay>0)await new Promise(resolve=>setTimeout(resolve,delay));
          continue;
        }
      }
      throw new DocsyError(message,response.status,code,retryAfterSeconds);
    }
  }

  async searchLibrary(query:string,libraryName:string):Promise<Library[]>{
    const p=new URLSearchParams({query,libraryName});
    const body=await (await this.request("/api/v2/libs/search?"+p)).json() as {results?:Library[]};
    return body.results??[];
  }

  async getContext(query:string,libraryId:string,options:{type?:"json"|"txt";limit?:number;fast?:boolean}={}):Promise<ContextResponse|string>{
    const type=options.type??"json";
    const p=new URLSearchParams({query,libraryId,type});
    if(options.limit)p.set("limit",String(options.limit));
    if(options.fast)p.set("fast","true");
    const response=await this.request("/api/v2/context?"+p,{accept:type==="txt"?"text/plain":"application/json"});
    if(type==="txt")return response.text();
    return response.json() as Promise<ContextResponse>;
  }

  async search(query:string,options:{
    type?:"json"|"txt";
    library?:string|string[];
    version?:string;
    language?:string;
  }={}):Promise<ContextResponse|string>{
    const type=options.type??"json";
    const p=new URLSearchParams({query,type});
    const libraries=Array.isArray(options.library)?options.library:options.library?[options.library]:[];
    for(const library of libraries.slice(0,4))p.append("library",library);
    if(options.version)p.set("version",options.version);
    if(options.language)p.set("language",options.language);
    const response=await this.request("/api/v3/search?"+p,{accept:type==="txt"?"text/plain":"application/json"});
    if(type==="txt")return response.text();
    return response.json() as Promise<ContextResponse>;
  }

  async searchDocuments(query:string,options:{type?:"json"|"txt";limit?:number}={}):Promise<Documentation[]|string>{
    const type=options.type??"json";
    const p=new URLSearchParams({query,type});
    if(options.limit)p.set("limit",String(options.limit));
    const response=await this.request("/v2/search?"+p,{accept:type==="txt"?"text/plain":"application/json"});
    if(type==="txt")return response.text();
    const body=await response.json() as {documents?:Documentation[]};
    return body.documents??[];
  }

  async refreshLibrary(libraryName:string,options:{branch?:string}={}):Promise<{message:string;id?:string;status?:string}>{
    const response=await this.request("/api/v1/refresh",{
      method:"POST",
      body:{libraryName,...(options.branch?{branch:options.branch}:{})}
    });
    return response.json() as Promise<{message:string;id?:string;status?:string}>;
  }

  async getLibraryMetrics(libraryId:string,days=30):Promise<LibraryMetrics>{
    const p=new URLSearchParams({libraryId,days:String(days)});
    const response=await this.request("/api/v2/libs/metrics?"+p);
    return response.json() as Promise<LibraryMetrics>;
  }

  async getPolicies():Promise<PolicyResponse>{
    const response=await this.request("/api/v2/policies");
    return response.json() as Promise<PolicyResponse>;
  }

  async updatePolicies(patch:PolicyPatch):Promise<PolicyResponse>{
    const response=await this.request("/api/v2/policies",{method:"PATCH",body:patch});
    return response.json() as Promise<PolicyResponse>;
  }

  async addGitHubRepository(docsRepoUrl:string):Promise<AddSourceResult>{
    const response=await this.request("/api/v2/add/repo/github",{method:"POST",body:{docsRepoUrl}});
    return response.json() as Promise<AddSourceResult>;
  }

  async addGitLabRepository(docsRepoUrl:string):Promise<AddSourceResult>{
    const response=await this.request("/api/v2/add/repo/gitlab",{method:"POST",body:{docsRepoUrl}});
    return response.json() as Promise<AddSourceResult>;
  }

  async addBitbucketRepository(docsRepoUrl:string):Promise<AddSourceResult>{
    const response=await this.request("/api/v2/add/repo/bitbucket",{method:"POST",body:{docsRepoUrl}});
    return response.json() as Promise<AddSourceResult>;
  }

  async addGitRepository(docsRepoUrl:string):Promise<AddSourceResult>{
    const response=await this.request("/api/v2/add/repo/git",{method:"POST",body:{docsRepoUrl}});
    return response.json() as Promise<AddSourceResult>;
  }

  async addWebsite(websiteUrl:string,options:{websiteBaseUrl?:string}={}):Promise<AddSourceResult>{
    const response=await this.request("/api/v2/add/website",{
      method:"POST",
      body:{websiteUrl,...(options.websiteBaseUrl?{websiteBaseUrl:options.websiteBaseUrl}:{})}
    });
    return response.json() as Promise<AddSourceResult>;
  }

  async addLlmsTxt(llmstxtUrl:string):Promise<AddSourceResult>{
    const response=await this.request("/api/v2/add/llmstxt",{method:"POST",body:{llmstxtUrl}});
    return response.json() as Promise<AddSourceResult>;
  }

  async addOpenApi(openApiUrl:string):Promise<AddSourceResult>{
    const response=await this.request("/api/v2/add/openapi",{method:"POST",body:{openApiUrl}});
    return response.json() as Promise<AddSourceResult>;
  }
}
