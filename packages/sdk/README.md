# Docsy TypeScript SDK

**Get version-aware developer documentation with links back to the original sources.** The [Docsy website](https://docsy.remcp.site) hosts the public documentation search API used by this SDK.

[Website](https://docsy.remcp.site) · [Documentation](https://docsy.remcp.site/docs) · [npm](https://www.npmjs.com/package/@remcp/docsy-sdk) · [Source and releases](https://github.com/getremcp/docsy) · [Issues](https://github.com/getremcp/docsy/issues)

## Install

Requires Node.js 22 or newer.

~~~sh
npm install @remcp/docsy-sdk
~~~

## Quick start

~~~ts
import { Docsy } from "@remcp/docsy-sdk";

const docsy = new Docsy();
const libraries = await docsy.searchLibrary("useEffect cleanup", "React");
const officialReact = libraries.find((library) => library.libraryId === "/reactjs/react.dev");

if (officialReact) {
  const context = await docsy.getContext("useEffect cleanup", officialReact.libraryId, {
    type: "txt"
  });
  console.log(context);
}
~~~

The first argument to `searchLibrary(query, libraryName)` is your **documentation question**; the second is the **library name**.

## Authentication and configuration

Public documentation search routes can be used without an API key, subject to service limits. Some account-specific or administrative API operations require authorization. When you have a Docsy API key, provide it through an environment variable—never commit the key to source control:

~~~ts
const docsy = new Docsy({
  baseUrl: "https://docsy.remcp.site",
  apiKey: process.env.DOCSY_API_KEY,
  timeoutMs: 45_000
});
~~~

The **hosted MCP connection is separate from the SDK** and currently requires account authorization via OAuth 2.1. Connect your MCP client to https://docsy.remcp.site/mcp; a `401` from an unauthenticated MCP request is expected.

## Common methods

| Method | Purpose |
| --- | --- |
| `searchLibrary(query, libraryName)` | Resolve documentation libraries and discover versions |
| `getContext(query, libraryId, options)` | Retrieve source-linked context for one library |
| `search(query, options)` | Search indexed documentation across libraries |
| `searchDocuments(query, options)` | Retrieve matching public documentation pages |

For `getContext` and `search`, choose `type: "txt"` for readable context, or `type: "json"` for structured data. See the [documentation](https://docsy.remcp.site/docs) for API behavior and limits.

## Other ways to use Docsy

- **CLI:** [@remcp/docsy-cli](https://www.npmjs.com/package/@remcp/docsy-cli)
- **MCP plugin:** [getremcp/docsy-plugin](https://github.com/getremcp/docsy-plugin)
- **MCP endpoint:** https://docsy.remcp.site/mcp
- **Support:** https://docsy.remcp.site/support

The published SDK contains client code and TypeScript declarations, **not** the hosted Docsy backend, indexing infrastructure or credentials. MIT License.
