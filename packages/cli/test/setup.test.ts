import { mkdtemp,readFile,writeFile,rm } from "node:fs/promises";
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
      expect(config).toContain('url = "https://docsy.example/mcp/registry"');
      expect(config).toContain('Authorization = "Bearer docsy_test"');
      expect(rule).toContain("Use Docsy whenever library");
      expect(result.configPath.startsWith(root)).toBe(true);
      expect(result.rulePath.startsWith(root)).toBe(true);
    }finally{
      process.chdir(originalCwd);
      await rm(root,{recursive:true,force:true});
    }
  });

  it("generates OpenCode V2 mcp.servers and migrates only its legacy Docsy entry",async()=>{
    const root=await mkdtemp(join(tmpdir(),"docsy-opencode-test-"));
    try{
      process.chdir(root);
      await writeFile(join(root,"opencode.json"),JSON.stringify({
        theme:"dark",mcp:{docsy:{type:"remote",url:"https://obsolete.example"},
          servers:{other:{type:"remote",url:"https://other.example/mcp"}}}
      }));
      const result=await setup("opencode","project","https://docsy.remcp.site");
      const config=JSON.parse(await readFile(result.configPath,"utf8"));
      expect(config.theme).toBe("dark");
      expect(config.mcp.servers.other.url).toBe("https://other.example/mcp");
      expect(config.mcp.servers.docsy).toEqual({
        type:"remote",url:"https://docsy.remcp.site/mcp/registry"
      });
      expect(config.mcp.docsy).toBeUndefined();
      expect(result.mcpUrl).toBe("https://docsy.remcp.site/mcp/registry");
    }finally{
      process.chdir(originalCwd);
      await rm(root,{recursive:true,force:true});
    }
  });

  it("preserves the Streamable HTTP configuration for Gemini CLI",async()=>{
    const root=await mkdtemp(join(tmpdir(),"docsy-gemini-test-"));
    try{
      process.chdir(root);
      const result=await setup("gemini","project","https://docsy.remcp.site/mcp/registry");
      const config=JSON.parse(await readFile(result.configPath,"utf8"));
      expect(config.mcpServers.docsy.httpUrl).toBe("https://docsy.remcp.site/mcp/registry");
      expect(config.mcpServers.docsy.url).toBeUndefined();
    }finally{
      process.chdir(originalCwd);
      await rm(root,{recursive:true,force:true});
    }
  });
});
