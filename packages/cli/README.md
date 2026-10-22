# @remcp/docsy-cli

Command-line client for the Docsy public documentation API and MCP setup.

## Install

```sh
npm install --global @remcp/docsy-cli
```

## Use

```sh
docsy library react
docsy search "effect cleanup" --library react
docsy docs /reactjs/react.dev "useEffect cleanup"
docsy setup --claude
docsy mcp
```

For one-off use, run `npx @remcp/docsy-cli --help`.

The `@remcp/docsy-cli` package declares an exact compatible `@remcp/docsy-sdk` dependency; the SDK must be published first. Anonymous queries are limited to public documentation. MIT License, copyright Anton Baider.

Documentation: https://docsy.remcp.site/docs
