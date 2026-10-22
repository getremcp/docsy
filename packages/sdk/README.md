# @remcp/docsy-sdk

TypeScript client for the public Docsy documentation API.

Docsy retrieves version-aware library documentation and retains links to its original sources. The hosted API is available at [docsy.remcp.site](https://docsy.remcp.site/docs).

## Install

```sh
npm install @remcp/docsy-sdk
```

## Example

```ts
import { Docsy } from "@remcp/docsy-sdk";

const docsy = new Docsy();
const libraries = await docsy.searchLibrary("React", "react");
console.log(libraries.map(({ libraryId, versions }) => ({ libraryId, versions })));
```

Documentation and MCP setup: https://docsy.remcp.site/docs

The npm package contains built JavaScript and TypeScript declarations only. It does not contain credentials or the Docsy private backend. MIT License, copyright Anton Baider.
