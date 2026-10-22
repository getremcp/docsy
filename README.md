<p align="center">
  <img src="https://raw.githubusercontent.com/getremcp/docsy-plugin/main/assets/docsy-wordmark.svg" width="230" alt="Docsy">
</p>

<p align="center"><strong>Developer documentation with verifiable source links. Free, version-aware, available over MCP.</strong></p>

<p align="center">
  <a href="https://www.npmjs.com/package/@remcp/docsy-sdk"><img alt="npm SDK" src="https://img.shields.io/npm/v/%40remcp%2Fdocsy-sdk?style=flat-square&label=SDK"></a>
  <a href="https://www.npmjs.com/package/@remcp/docsy-cli"><img alt="npm CLI" src="https://img.shields.io/npm/v/%40remcp%2Fdocsy-cli?style=flat-square&label=CLI"></a>
  <a href="https://www.npmjs.com/package/@remcp/docsy-sdk"><img alt="downloads" src="https://img.shields.io/npm/dm/%40remcp%2Fdocsy-sdk?style=flat-square&label=downloads"></a>
  <a href="./LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-1f2328?style=flat-square"></a>
  <a href="https://github.com/getremcp/docsy/releases"><img alt="GitHub releases" src="https://img.shields.io/github/v/release/getremcp/docsy?style=flat-square"></a>
  <a href="https://github.com/getremcp/docsy-plugin"><img alt="MCP plugin" src="https://img.shields.io/badge/MCP-plugin-1f2328?style=flat-square"></a>
  <a href="https://geminicli.com/docs/extensions/"><img alt="Gemini CLI" src="https://img.shields.io/badge/Gemini%20CLI-extension-1f2328?style=flat-square"></a>
  <a href="https://kiro.dev/docs/powers/installation/"><img alt="Kiro Power" src="https://img.shields.io/badge/Kiro-custom%20power-1f2328?style=flat-square"></a>
</p>

<p align="center"><a href="https://docsy.remcp.site">Website</a> · <a href="https://docsy.remcp.site/docs">Documentation</a> · <a href="https://github.com/getremcp/docsy-plugin">Plugin</a> · <a href="https://github.com/getremcp/docsy/releases">Releases</a> · <a href="https://docsy.remcp.site/privacy">Privacy</a> · <a href="https://docsy.remcp.site/support">Support</a></p>

# Docsy SDK and CLI

**Ask better questions of current developer documentation.** Docsy helps coding agents and developers find version-aware framework and SDK guidance with links to original documentation. Browse [Docsy](https://docsy.remcp.site) or see the [full product documentation](https://docsy.remcp.site/docs).

This public repository contains the reviewed **TypeScript SDK**, **terminal CLI**, and **Gemini CLI extension**. Hosted search, ingestion, private infrastructure and credentials are not included.

## Start in 30 seconds

| I want to… | Do this |
| --- | --- |
| Search documentation in the terminal | `npm install -g @remcp/docsy-cli` |
| Call Docsy in TypeScript | `npm install @remcp/docsy-sdk` |
| Connect an AI assistant with MCP | Add `https://docsy.remcp.site/mcp` and complete OAuth |
| Install the packaged MCP plugin | Visit [getremcp/docsy-plugin](https://github.com/getremcp/docsy-plugin) |
| Browse docs and setup instructions | Open [docsy.remcp.site/docs](https://docsy.remcp.site/docs) |

**Requirements:** Node.js 22+ for the npm packages. Both packages are published to npm under the `@remcp` scope (not `@docsy`).

### CLI quick start

~~~sh
npm install --global @remcp/docsy-cli
docsy --help
docsy library react
docsy docs /reactjs/react.dev "useEffect cleanup"
docsy search "Next.js caching" --library next.js
~~~

For one-off use without global installation:

~~~sh
npx --yes --package=@remcp/docsy-cli docsy library react
~~~

### TypeScript quick start

~~~sh
npm install @remcp/docsy-sdk
~~~

~~~ts
import { Docsy } from "@remcp/docsy-sdk";

const client = new Docsy();
const libraries = await client.searchLibrary("useEffect cleanup", "React");
console.log(libraries.map(({ libraryId, versions }) => ({ libraryId, versions })));
~~~

See [SDK README](packages/sdk/README.md) and [CLI README](packages/cli/README.md) for full examples and troubleshooting.

### Connect MCP clients

The hosted MCP endpoint is **remote** and currently requires Docsy account authorization (OAuth 2.1). Public REST documentation lookup is separate and can be anonymous within service limits.

~~~sh
# Codex
codex mcp add docsy --url https://docsy.remcp.site/mcp
codex mcp login docsy

# Claude Code
claude mcp add --transport http docsy https://docsy.remcp.site/mcp
~~~

If you receive HTTP 401 when calling the MCP endpoint without credentials, complete your client's authorization flow. The `docsy mcp` command prints a URL; it does **not** start a server.

## Official links and packages

| Resource | Link |
| --- | --- |
| Website | https://docsy.remcp.site |
| Documentation | https://docsy.remcp.site/docs |
| SDK (npm) | https://www.npmjs.com/package/@remcp/docsy-sdk |
| CLI (npm) | https://www.npmjs.com/package/@remcp/docsy-cli |
| Public plugin | https://github.com/getremcp/docsy-plugin |
| Support | https://docsy.remcp.site/support |
| Privacy and terms | [Privacy](https://docsy.remcp.site/privacy) · [Terms](https://docsy.remcp.site/terms) |


## Gemini CLI and Kiro

Install the public Docsy Gemini CLI extension (remote, read-only MCP plus
source-link guidance) straight from the tagged repository:

```sh
gemini extensions install https://github.com/getremcp/docsy
```

The `gemini-cli-extension` GitHub topic makes the release eligible for the
Gemini Extension Gallery's periodic indexing. A valid manifest does **not**
guarantee immediate gallery visibility.

For Kiro, the [Docsy Agent Plugin](https://github.com/getremcp/docsy-plugin)
can be imported via **Powers → Add Custom Power → Import from GitHub**.
This is community/custom installation, not a claim of curated Kiro listing.

## Release policy

**No development or feature branches in this public repository.** Changes are authored, reviewed, tested, and versioned in the private source repository before release-only publication here. Public tags are package-specific: `sdk-vX.Y.Z` and `cli-vX.Y.Z`. Each published npm package remains immutable. CI checks both public packages before distribution.

This repository contains no production secrets, credentials, database records, scraper infrastructure, or hosted backend implementation.

## MCP plugin and marketplaces

The separate [Docsy plugin distribution](https://github.com/getremcp/docsy-plugin) provides ChatGPT/Codex, Claude Code and Cursor configuration, catalog status and signed-off ZIP releases. Check its [distribution matrix](https://github.com/getremcp/docsy-plugin/blob/main/docs/DISTRIBUTION-STATUS.md) for confirmed versus pending marketplace listings.

## License

The public SDK and CLI are MIT licensed. See [LICENSE](LICENSE).
