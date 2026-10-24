<p align="center">
  <a href="https://docsy.remcp.site">
    <img src="https://raw.githubusercontent.com/getremcp/docsy-plugin/main/assets/docsy-icon-192.png" width="104" height="104" alt="Docsy — source-linked developer documentation">
  </a>
</p>

<h1 align="center">Docsy SDK & CLI</h1>
<p align="center"><strong>Current documentation. Exact versions. Verifiable sources.</strong></p>
<p align="center">Search current and versioned developer documentation from your terminal or TypeScript app, with original source citations.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@remcp/docsy-sdk"><img alt="SDK latest version on npm" src="https://img.shields.io/npm/v/%40remcp%2Fdocsy-sdk?label=SDK&style=flat-square"></a>
  <a href="https://www.npmjs.com/package/@remcp/docsy-cli"><img alt="CLI latest version on npm" src="https://img.shields.io/npm/v/%40remcp%2Fdocsy-cli?label=CLI&style=flat-square"></a>
  <a href="https://github.com/getremcp/docsy/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/getremcp/docsy?style=flat-square"></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-1f2328?style=flat-square"></a>
  <a href="package.json"><img alt="Node.js 22 or later" src="https://img.shields.io/badge/Node.js-22%2B-1f2328?style=flat-square"></a>
</p>
<p align="center">
  <a href="https://github.com/getremcp/docsy/actions/workflows/public-packages.yml"><img alt="SDK and CLI CI" src="https://img.shields.io/github/actions/workflow/status/getremcp/docsy/public-packages.yml?branch=main&label=build%20%26%20tests&style=flat-square"></a>
  <a href="https://github.com/getremcp/docsy/releases/tag/gemini-v1.0.0"><img alt="Gemini CLI extension version 1.0.0" src="https://img.shields.io/badge/Gemini%20CLI-extension%201.0.0-1f2328?style=flat-square"></a>
  <a href="https://registry.modelcontextprotocol.io/?q=io.github.getremcp%2Fdocsy"><img alt="Official MCP Registry: active" src="https://img.shields.io/badge/MCP%20Registry-active-1f2328?style=flat-square"></a>
  <a href="https://github.com/getremcp/docsy-plugin/blob/main/.claude-plugin/marketplace.json"><img alt="Claude Code community plugin" src="https://img.shields.io/badge/Claude%20Code-community%20plugin-1f2328?style=flat-square"></a>
  <a href="https://github.com/getremcp/docsy-plugin/releases/latest"><img alt="Stable MCP plugin release" src="https://img.shields.io/github/v/release/getremcp/docsy-plugin?label=MCP%20plugin&style=flat-square"></a>
</p>

<p align="center">
  <a href="https://glama.ai/mcp/connectors/io.github.getremcp/docsy"><img alt="Docsy MCP connector – tool definition quality and endpoint health on Glama" src="https://glama.ai/mcp/connectors/io.github.getremcp/docsy/badges/score.svg"></a>
</p>

<p align="center">
  <a href="https://docsy.remcp.site">Website</a> ·
  <a href="https://docsy.remcp.site/docs">Documentation</a> ·
  <a href="https://github.com/getremcp/docsy-plugin"><strong>AI / MCP Plugin ↗</strong></a> ·
  <a href="https://github.com/getremcp/docsy"><strong>SDK & CLI ↗</strong></a> ·
  <a href="https://github.com/getremcp/docsy/releases">Releases</a> ·
  <a href="https://docsy.remcp.site/support">Support</a>
</p>

---

## Choose the right Docsy integration

| I want to… | Use |
| --- | --- |
| **Connect ChatGPT, Claude Code, Codex, Cursor or another AI client** | **[Docsy AI / MCP Plugin →](https://github.com/getremcp/docsy-plugin)** — installation guides, supported-client manifests and versioned ZIP packages |
| **Search documentation in a terminal** | **[Docsy CLI](packages/cli/README.md)** — published on [npm](https://www.npmjs.com/package/@remcp/docsy-cli) |
| **Call Docsy from TypeScript or JavaScript** | **[Docsy SDK](packages/sdk/README.md)** — published on [npm](https://www.npmjs.com/package/@remcp/docsy-sdk) |
| **Use Gemini CLI** | **[Gemini CLI extension](https://github.com/getremcp/docsy/releases/tag/gemini-v1.0.0)** — tagged public GitHub integration |
| **Use MCP directly** | Connect the hosted endpoint `https://docsy.remcp.site/mcp/registry` and authorize your Docsy account |

**The [AI / MCP Plugin repository](https://github.com/getremcp/docsy-plugin) is separate from this SDK / CLI repository.** Both connect to the same remote Docsy documentation service. Neither includes the private crawler, index database or production backend.

## MCP tools for AI assistants

Docsy's companion [AI / MCP Plugin](https://github.com/getremcp/docsy-plugin#tools) offers five read-only tools: `resolve-library-id`, `list-library-versions`, `query-docs`, `search`, and `fetch`. They retrieve versioned public documentation and publisher source links through `https://docsy.remcp.site/mcp/registry` with OAuth 2.1. This repository ships the separate SDK and CLI; the public plugin repository is the installation and tool reference for AI clients.

## Quick start

Requires **Node.js 22 or later**.

### Terminal / CLI

```sh
npm install --global @remcp/docsy-cli

docsy --help
docsy library react
docsy docs /reactjs/react.dev "useEffect cleanup"
docsy search "Next.js caching" --library next.js
```

Run once without a global installation:

```sh
npx --yes --package=@remcp/docsy-cli docsy library react
```

### TypeScript SDK

```sh
npm install @remcp/docsy-sdk
```

```ts
import { Docsy } from "@remcp/docsy-sdk";

const client = new Docsy();
const libraries = await client.searchLibrary("useEffect cleanup", "React");
console.log(libraries.map(({ libraryId, versions }) => ({ libraryId, versions })));
```

Explore the [SDK reference](packages/sdk/README.md) and [CLI reference](packages/cli/README.md) for additional examples.

### MCP for coding agents

MCP is a **hosted service**, not a local executable. Connect with an OAuth 2.1-capable MCP client and complete the sign-in prompt.

```sh
# Claude Code
claude mcp add --transport http docsy https://docsy.remcp.site/mcp/registry

# Codex CLI
codex mcp add docsy --url https://docsy.remcp.site/mcp/registry
codex mcp login docsy
```

An unauthenticated HTTP 401 from this endpoint is expected. For ChatGPT, Cursor and other client-specific instructions, use the **[full AI plugin setup guide](https://github.com/getremcp/docsy-plugin/blob/main/docs/GETTING-STARTED.md)**.

## Verified distribution channels

| Surface | Current release | Install / source |
| --- | --- | --- |
| TypeScript SDK | [`sdk-v0.1.2`](https://github.com/getremcp/docsy/releases/tag/sdk-v0.1.2) | [`@remcp/docsy-sdk` on npm](https://www.npmjs.com/package/@remcp/docsy-sdk) |
| Terminal CLI | [`cli-v0.1.3`](https://github.com/getremcp/docsy/releases/tag/cli-v0.1.3) | [`@remcp/docsy-cli` on npm](https://www.npmjs.com/package/@remcp/docsy-cli) |
| Gemini CLI | [`gemini-v1.0.0`](https://github.com/getremcp/docsy/releases/tag/gemini-v1.0.0) | [Extension metadata](gemini-extension.json) |
| MCP Plugin | [Stable releases](https://github.com/getremcp/docsy-plugin/releases/latest) | [Plugin / AI-client distribution](https://github.com/getremcp/docsy-plugin) |
| Official MCP Registry | [`io.github.getremcp/docsy`](https://registry.modelcontextprotocol.io/?q=io.github.getremcp%2Fdocsy) | Active version `1.0.9` (24 Oct 2026) |
| Glama | [Docsy remote MCP connector](https://glama.ai/mcp/connectors/io.github.getremcp/docsy) | Listed and publisher-claimed (24 Oct 2026); domain DNS verified and OAuth connection tested |
| Claude Code community | [Marketplace manifest](https://github.com/getremcp/docsy-plugin/blob/main/.claude-plugin/marketplace.json) | Install from GitHub; not official Anthropic marketplace approval |

The [Docsy MCP Plugin README](https://github.com/getremcp/docsy-plugin#discover-docsy) tracks the wider community-directory review queue. Those submissions are not official client-store approvals.

CLI v0.1.3 depends on SDK v0.1.2. SDK and CLI releases are published through npm; their GitHub release pages identify immutable source tags and do not need duplicate package archives. A Gemini extension manifest is not a claim of official gallery approval.

## Trust and release policy

This is a **public release-only source snapshot**, not the development repository. The private source is built and tested before approved files are promoted through a protected GitHub pull request. Tags are package-specific (`sdk-vX.Y.Z`, `cli-vX.Y.Z`, `gemini-vX.Y.Z`), and existing published npm versions remain immutable. The server's public documentation tools are read-only.

[MIT License](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md) · [Privacy](https://docsy.remcp.site/privacy) · [Terms](https://docsy.remcp.site/terms) · [Support](https://docsy.remcp.site/support)

<p align="center"><sub>Docsy is an independent documentation service. Third-party trademarks remain with their respective owners.</sub></p>
