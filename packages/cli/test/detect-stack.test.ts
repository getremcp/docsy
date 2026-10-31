import {describe,expect,it} from "vitest";
import {mkdtemp,writeFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {detectProjectStack} from "../src/detect-stack.js";

describe("local stack detection",()=>{
  it("reads package, Python, Rust, Go without network and never reads lockfiles",async()=>{
    const dir=await mkdtemp(join(tmpdir(),"docsy-detect-"));
    try{
      await writeFile(join(dir,"package.json"),JSON.stringify({dependencies:{"next":"^16.0","react":"^19"},scripts:{postinstall:"secret-key"}}));
      await writeFile(join(dir,"pyproject.toml"),'[project]\ndependencies = [\n "fastapi>=0.100",\n "pydantic>=2",\n]\n');
      await writeFile(join(dir,"Cargo.toml"),'[dependencies]\ntokio = "1.0"\nserde = { version = "1.0", features = ["derive"] }\n');
      await writeFile(join(dir,"go.mod"),'module example.org/local\nrequire (\n github.com/gin-gonic/gin v1.9.1\n)\n');
      const dependencies=await detectProjectStack(dir);
      expect(dependencies.map(x=>x.name)).toEqual(expect.arrayContaining(["react","next","fastapi","pydantic","tokio","serde","github.com/gin-gonic/gin"]));
      expect(JSON.stringify(dependencies)).not.toContain("secret-key");
    }finally{await rm(dir,{recursive:true,force:true});}
  });
  it("handles absent manifest files without throwing",async()=>{
    const dir=await mkdtemp(join(tmpdir(),"docsy-detect-"));
    try{expect(await detectProjectStack(dir)).toEqual([]);}
    finally{await rm(dir,{recursive:true,force:true});}
  });
  it("bounds result size",async()=>{
    const dir=await mkdtemp(join(tmpdir(),"docsy-detect-"));
    try{
      await writeFile(join(dir,"package.json"),JSON.stringify({dependencies:Object.fromEntries(Array.from({length:400},(_,i)=>["pkg-"+i,"1"]))}));
      expect((await detectProjectStack(dir)).length).toBeLessThanOrEqual(250);
    }finally{await rm(dir,{recursive:true,force:true});}
  });
});
