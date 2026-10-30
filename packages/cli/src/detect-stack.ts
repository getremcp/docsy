import {readFile} from "node:fs/promises";
import {resolve,join} from "node:path";

export type DetectedDependency={name:string;version?:string;ecosystem:"npm"|"pypi"|"cargo"|"go"};
const MAX_MANIFEST_BYTES=512*1024;
const MAX_RESULT=250;

/** Offline-only dependency discovery. No lockfiles, package scripts, or network calls. */
export async function detectProjectStack(directory:string):Promise<DetectedDependency[]>{
  const root=resolve(directory);
  const results=new Map<string,DetectedDependency>();
  const add=(name:string,ecosystem:DetectedDependency["ecosystem"],version?:string)=>{
    const cleaned=name.trim();
    if(!cleaned||cleaned.length>150||!/^[A-Za-z0-9@_][A-Za-z0-9@_./+\-]*$/.test(cleaned))return;
    if(results.size>=MAX_RESULT)return;
    const key=ecosystem+":"+cleaned.toLowerCase();
    if(!results.has(key))results.set(key,{name:cleaned,ecosystem,...(version?{version:version.slice(0,100)}:{})});
  };
  const manifest=async(name:string)=>{
    try {
      const {stat}=await import("node:fs/promises");
      const file=join(root,name);
      const info=await stat(file);
      if(!info.isFile()||info.size>MAX_MANIFEST_BYTES)return null;
      return await readFile(file,"utf8");
    }catch{return null;}
  };
  const npm=await manifest("package.json");
  if(npm){
    try{
      const pkg=JSON.parse(npm) as Record<string,unknown>;
      for(const field of ["dependencies","devDependencies","optionalDependencies","peerDependencies"]){
        const deps=pkg[field];
        if(!deps||typeof deps!=="object"||Array.isArray(deps))continue;
        for(const [name,version] of Object.entries(deps)){
          if(typeof version==="string")add(name,"npm",version);
        }
      }
    }catch{/* malformed or unrelated file is ignored */}
  }
  const pyproject=await manifest("pyproject.toml");
  if(pyproject){
    const sections=pyproject.split(/^\[([^\]]+)\]\s*$/m);
    const projectSection=sections.indexOf("project");
    const body=projectSection>=0?sections[projectSection+1]??"":"";
    const dependencies=body.match(/^dependencies\s*=\s*\[([\s\S]*?)^\s*\]/m)?.[1]??"";
    for(const m of dependencies.matchAll(/["']([A-Za-z0-9._-]+)(?:\[[\w, -]+\])?([^"']*)["']/g)){
      add(m[1]!,"pypi",m[2]?.trim()||undefined);
    }
  }
  const cargo=await manifest("Cargo.toml");
  if(cargo){
    const sections=cargo.split(/^\[([^\]]+)\]\s*$/m);
    for(let i=1;i<sections.length;i+=2){
      if(!/^(?:dev-|build-)?dependencies$/.test(sections[i]!))continue;
      for(const line of sections[i+1]!.split("\n")){
        const m=line.match(/^\s*([\w-]+)\s*=\s*(?:"([^"]+)"|\{[^\n]*?version\s*=\s*"([^"]+)")/);
        if(m)add(m[1]!,"cargo",m[2]||m[3]);
      }
    }
  }
  const gomod=await manifest("go.mod");
  if(gomod){
    const lines=gomod.split("\n");
    let inRequire=false;
    for(const raw of lines){
      const line=raw.replace(/\/\/.*$/,"").trim();
      if(line==="require ("){inRequire=true;continue;}
      if(inRequire&&line===")"){inRequire=false;continue;}
      const value=inRequire?line:line.startsWith("require ")?line.slice(8):"";
      const m=value.match(/^([A-Za-z0-9._+\-/]+)\s+(v[\w.+\-]+)/);
      if(m)add(m[1]!,"go",m[2]);
    }
  }
  return [...results.values()].sort((a,b)=>a.ecosystem.localeCompare(b.ecosystem)||a.name.localeCompare(b.name));
}
