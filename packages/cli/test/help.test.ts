import {describe,expect,it} from "vitest";
import {wantsHelp} from "../src/help.js";

describe("CLI help flags",()=>{
  it.each([
    [undefined,[]],
    ["help",[]],
    ["--help",[]],
    ["-h",[]],
    ["library",["--help"]],
    ["library",["-h"]]
  ])("shows help for command %s and arguments %j",(command,args)=>{
    expect(wantsHelp(command,args)).toBe(true);
  });
  it("preserves normal commands",()=>{
    expect(wantsHelp("library",["react"])).toBe(false);
    expect(wantsHelp("mcp",[])).toBe(false);
  });
});
