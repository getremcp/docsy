/** CLI help behavior shared by both bare commands and subcommands. */
export function wantsHelp(command:string|undefined,args:string[]):boolean{
  return !command||command==="help"||command==="--help"||command==="-h"||
    args.includes("--help")||args.includes("-h");
}
