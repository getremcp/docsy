import { homedir } from "node:os";
import { dirname,join } from "node:path";
import { mkdir,readFile,writeFile } from "node:fs/promises";

export type Agent="claude"|"cursor"|"codex"|"vscode"|"gemini"|"opencode"|"copilot";

const RULE=[
  "# Docsy documentation rule",
  "",
  "Use Docsy whenever library, framework, SDK, API, CLI, or cloud-service documentation could affect correctness.",
  "Resolve the library ID before querying documentation unless an exact /org/project[/version] ID is already known.",
  "Prefer version-specific documentation and preserve source URLs when answering.",
  ""
].join("\n");

async function readJson(path:string):Promise<Record<string,unknown>>{
  try{return JSON.parse(await readFile(path,"utf8")) as Record<string,unknown>;}catch{return {};}
}
async function writeJson(path:string,value:Record<string,unknown>){
  await mkdir(dirname(path),{recursive:true});
  await writeFile(path,JSON.stringify(value,null,2)+"\n");
}
function mergeSection(config:Record<string,unknown>,key:string,entry:Record<string,unknown>){
  const section=(config[key]&&typeof config[key]==="object"?config[key]:{}) as Record<string,unknown>;
  return {...config,[key]:{...section,docsy:entry}};
}
function httpEntry(url:string,apiKey?:string,type?:string):Record<string,unknown>{
  return {...(type?{type}:{}),url,...(apiKey?{headers:{Authorization:"Bearer "+apiKey}}:{})};
}
function home(...parts:string[]){return join(homedir(),...parts);}

async function installRule(agent:Agent,scope:"project"|"global"){
  const cwd=process.cwd();let path:string;let prefix="";
  switch(agent){
    case "cursor":
      path=scope==="global"?home(".cursor","rules","docsy.mdc"):join(cwd,".cursor","rules","docsy.mdc");
      prefix="---\nalwaysApply: true\n---\n\n";break;
    case "claude":
      path=scope==="global"?home(".claude","rules","docsy.md"):join(cwd,".claude","rules","docsy.md");break;
    case "vscode":
      path=scope==="global"?home(".config","Code","User","prompts","docsy.instructions.md"):join(cwd,".github","instructions","docsy.instructions.md");
      prefix='---\napplyTo: "**"\n---\n\n';break;
    default:
      path=scope==="global"?home(".agents","skills","docsy","SKILL.md"):join(cwd,".agents","skills","docsy","SKILL.md");break;
  }
  await mkdir(dirname(path),{recursive:true});
  await writeFile(path,prefix+RULE);
  return path;
}

export async function setup(agent:Agent,scope:"project"|"global",baseUrl:string,apiKey?:string){
  const cwd=process.cwd();
  const mcpUrl=baseUrl.replace(/\/$/,"")+"/mcp";
  let path:string;

  if(agent==="codex"){
    path=scope==="global"?home(".codex","config.toml"):join(cwd,".codex","config.toml");
    let existing="";try{existing=await readFile(path,"utf8");}catch{}
    const marker="# --- docsy managed ---";
    const lines=[marker,"[mcp_servers.docsy]","url = "+JSON.stringify(mcpUrl)];
    if(apiKey)lines.push("","[mcp_servers.docsy.http_headers]","Authorization = "+JSON.stringify("Bearer "+apiKey));
    lines.push(marker);
    const block=lines.join("\n");
    const start=existing.indexOf(marker);
    let next:string;
    if(start>=0){
      const end=existing.indexOf(marker,start+marker.length);
      next=end>=0?existing.slice(0,start)+block+existing.slice(end+marker.length):existing+"\n"+block+"\n";
    }else next=existing.replace(/\s*$/,"")+"\n\n"+block+"\n";
    await mkdir(dirname(path),{recursive:true});await writeFile(path,next);
  }else{
    const specs={
      claude:{project:".mcp.json",global:home(".claude.json"),key:"mcpServers",type:"http"},
      cursor:{project:join(".cursor","mcp.json"),global:home(".cursor","mcp.json"),key:"mcpServers"},
      vscode:{project:join(".vscode","mcp.json"),global:home(".config","Code","User","mcp.json"),key:"servers",type:"http"},
      gemini:{project:join(".gemini","settings.json"),global:home(".gemini","settings.json"),key:"mcpServers",urlKey:"httpUrl"},
      opencode:{project:"opencode.json",global:home(".config","opencode","opencode.json"),key:"mcp",type:"remote"},
      copilot:{project:".mcp.json",global:home(".copilot","mcp-config.json"),key:"mcpServers",type:"http"}
    } as const;
    const spec=specs[agent];
    path=scope==="global"?spec.global:join(cwd,spec.project);
    const cfg=await readJson(path);
    let e=httpEntry(mcpUrl,apiKey,"type" in spec?spec.type:undefined);
    if("urlKey" in spec&&spec.urlKey==="httpUrl"){
      const {url,...rest}=e;e={...rest,httpUrl:url};
    }
    if(agent==="opencode")e={...e,enabled:true};
    if(agent==="copilot")e={...e,tools:["*"]};
    await writeJson(path,mergeSection(cfg,spec.key,e));
  }
  const rulePath=await installRule(agent,scope);
  return {configPath:path,rulePath,mcpUrl};
}
