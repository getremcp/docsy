# Docsy CLI

**Find version-aware library documentation from the terminal**, with original source links, and configure supported AI coding clients to connect to Docsy.

[Website](https://docsy.remcp.site) · [Documentation](https://docsy.remcp.site/docs) · [npm](https://www.npmjs.com/package/@remcp/docsy-cli) · [Source and releases](https://github.com/getremcp/docsy) · [Issues](https://github.com/getremcp/docsy/issues)

## Install

Requires Node.js 22 or newer.

~~~sh
npm install --global @remcp/docsy-cli
docsy --help
~~~

For a one-off run without global installation:

~~~sh
npx --yes --package=@remcp/docsy-cli docsy library react
~~~

## Search documentation

~~~sh
# Find an indexed library and its versions
docsy library react

# Retrieve documentation context with source links
docsy docs /reactjs/react.dev "useEffect cleanup"

# Search within one library
docsy search "useEffect cleanup" --library react

# Retrieve structured output for automation
docsy library react --json

# Print the Docsy MCP server URL (does not start a local server)
docsy mcp
~~~

## Detect local dependencies (CLI 0.1.5)

The `detect` command reads local project manifests to list dependencies from npm, Python, Cargo and Go without accessing the network, reading lockfile secrets, running package scripts, or uploading manifest contents.

~~~sh
docsy detect
docsy detect ./my-project --json
~~~

Use the output to choose exact package versions before asking Docsy for version-aware documentation. Project detection is local-only and does not change the remote MCP service.

You can use `docsy --help`, `docsy -h` or `docsy help` to see the command reference.

## Connect an AI coding client

Docsy provides a **remote** Streamable HTTP MCP server. You do not need to run the Docsy backend yourself.

~~~sh
# OpenCode V2: add, authorize in browser, verify
opencode mcp add docsy --url https://docsy.remcp.site/mcp/registry
opencode mcp auth docsy
opencode mcp list

# Codex CLI: add, login if OAuth did not start automatically, verify
codex mcp add docsy --url https://docsy.remcp.site/mcp/registry
codex mcp login docsy
codex mcp list

# Devin CLI: add, login, verify
devin mcp add docsy https://docsy.remcp.site/mcp/registry
devin mcp login docsy
devin mcp list

# Claude Code: add, login, verify; /mcp works inside Claude Code too
claude mcp add --transport http docsy https://docsy.remcp.site/mcp/registry
claude mcp login docsy
claude mcp list

# Gemini CLI: add and check; run /mcp auth docsy INSIDE Gemini CLI
gemini mcp add --transport http docsy https://docsy.remcp.site/mcp/registry
gemini mcp list

# Or generate a client-specific configuration
docsy setup --cursor
docsy setup --claude
docsy setup --codex
docsy setup --vscode
docsy setup --gemini
docsy setup --opencode
docsy setup --copilot
~~~

The **MCP endpoint requires OAuth authorization**. Run the relevant client login command or interactive slash command after adding the server, approve Docsy access in the browser, then verify that Docsy tools can be called. Codex may initiate OAuth during the `add` command, so a second login is only needed if sign-in was not completed. For Cursor, VS Code/Copilot, Kiro, Antigravity and other GUI clients, authorize from their MCP server manager. A direct HTTP `401` before authentication is expected; do not change the endpoint or paste tokens into project files. `docsy setup` only writes configuration and prints client-specific next steps—it does not grant OAuth access.

## API key and custom deployment

Public documentation lookup through the HTTP API can be anonymous, subject to rate limits. For operations that require a Docsy API key, set `DOCSY_API_KEY` in your local environment, or pass `--api-key`; avoid placing keys in shared scripts or terminal history.

~~~sh
docsy library react --base-url https://docsy.remcp.site
docsy --help
~~~

Supported commands include `library`, `docs`, `search`, `mcp`, `setup`, `metrics`, `refresh` and authenticated source-management operations. Run `docsy help` for flags.

## Troubleshooting

- **`docsy: command not found`:** install the package globally, or use `npx` as above.
- **HTTP 401 from MCP:** complete OAuth authorization in your MCP-capable client.
- **No results:** check the library ID with `docsy library <name>`; use an exact version when available.
- **Need support?** See https://docsy.remcp.site/support.

This CLI depends on a compatible exact version of [@remcp/docsy-sdk](https://www.npmjs.com/package/@remcp/docsy-sdk) and contains no hosted backend code. MIT License.
