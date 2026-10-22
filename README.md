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
</p>

<p align="center"><a href="https://docsy.remcp.site">Website</a> · <a href="https://docsy.remcp.site/docs">Documentation</a> · <a href="https://github.com/getremcp/docsy-plugin">Plugin</a> · <a href="https://github.com/getremcp/docsy/releases">Releases</a> · <a href="https://docsy.remcp.site/privacy">Privacy</a> · <a href="https://docsy.remcp.site/support">Support</a></p>

# Docsy SDK and CLI

This repository is the **public release distribution** for Docsy's open-source SDK and CLI. Production APIs, indexing infrastructure, private service code and development branches are deliberately excluded. Development happens in a separate private repository; this repository contains only reviewed snapshots intended for public releases.

## npm installation

```bash
npm install @remcp/docsy-sdk
npm install --global @remcp/docsy-cli
docsy --help
```

For MCP-capable agents, use the hosted endpoint `https://docsy.remcp.site/mcp/registry`. No API key is required for anonymous public documentation queries.

| Published npm package | Source | Purpose |
| --- | --- | --- |
| [`@remcp/docsy-sdk`](https://www.npmjs.com/package/@remcp/docsy-sdk) | [packages/sdk](packages/sdk) | TypeScript/JavaScript API client |
| [`@remcp/docsy-cli`](https://www.npmjs.com/package/@remcp/docsy-cli) | [packages/cli](packages/cli) | Terminal documentation and MCP setup |

## Release policy

**No development or feature branches in this public repository.** Changes are authored, reviewed, tested, and versioned in the private source repository before release-only publication here. Public tags are package-specific: `sdk-vX.Y.Z` and `cli-vX.Y.Z`. Each published npm package remains immutable. CI checks both public packages before distribution.

This repository contains no production secrets, credentials, database records, scraper infrastructure, or hosted backend implementation.

## MCP plugin and marketplaces

The separate [Docsy plugin distribution](https://github.com/getremcp/docsy-plugin) provides ChatGPT/Codex, Claude Code and Cursor configuration, catalog status and signed-off ZIP releases. Check its [distribution matrix](https://github.com/getremcp/docsy-plugin/blob/main/docs/DISTRIBUTION-STATUS.md) for confirmed versus pending marketplace listings.

## License

The public SDK and CLI are MIT licensed. See [LICENSE](LICENSE).
