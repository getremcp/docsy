import { mkdtemp,readFile,rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach,describe,expect,it } from "vitest";
import { setup } from "../src/setup.js";

const originalCwd=process.cwd();
afterEach(()=>process.chdir(originalCwd));

describe("Docsy CLI setup",()=>{
  it("writes project-scoped Codex MCP config and documentation rule",async()=>{
    const root=await mkdtemp(join(tmpdir(),"docsy-cli-test-"));
    try{
      process.chdir(root);
      const result=await setup("codex","project","https://docsy.example","docsy_test");
      const config=await readFile(result.configPath,"utf8");
      const rule=await readFile(result.rulePath,"utf8");
      expect(config).toContain("[mcp_servers.docsy]");
      expect(config).toContain('url = "https://docsy.example/mcp"');
      expect(config).toContain('Authorization = "Bearer docsy_test"');
      expect(rule).toContain("Use Docsy whenever library");
      expect(result.configPath.startsWith(root)).toBe(true);
      expect(result.rulePath.startsWith(root)).toBe(true);
    }finally{
      process.chdir(originalCwd);
      await rm(root,{recursive:true,force:true});
    }
  });
});
