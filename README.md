# FDC3 Multi-Runtime Demonstration

This is a project demonstrating a minimally functional implementation of cross-runtime context sharing between multiple FDC3 providers. This example shows how to acheive the implementation through a side-by-side helper module; however, a simpler implementation would be to add this or similar code to the FDC3 Provider logic itself. 


## Get started

To run the demo:

```
npm install
npm run dev
```

The run script will start a local webserver and automatically launch two instances of OpenFin from files _app1.json_ and _app2.json_.

**Note:** although changes to page content are hot-reloadable; changes provider logic require manually pressing the refresh button.

## Capabilities

The entirety of the helper functionality is contained within a single JS module located at _public/patch-iab.js_. This code should exist exactly once per Runtime version, and so for simplicity is currently run within the Platform Provider window; as before, this code should ideally be part of the FDC3 provider itself.

Functionally, the helper module enable multi-Runtime FDC3 for the following APIs:

```
// Currently joined channel:
fdc3.addContextListener(ctx => ...);
fdc3.broadcast(ctx);

// Pre-defined System channels:
Channel.addContextListener(ctx => ...);
Channel.broadcast(ctx);
```

_Application-defined custom channels not covered in this example_

## How it works

### Requirements

- When a local context change occurs for a given channel, that change should be published to all other running providers
- When a remote context is received, its value is broadcast to the local instance _if and only if it is newer than the most recent context update_
- If a provider receives a remote context which is older than its current context value, it should reply to the sender with its current context
- If a channel has no members locally, remote context changes are broadcast to the local instance but not cached
- When a channel changes from having no members to having some members, a _null context_ is broadcast to the other providers to initializes the local channel context

### Context Versioning

Synchronizing revisions across multiple processes is non-trivial as it requires shared access to a distinct and monotonically increasing sequence number for each context change. However, it is possible to approximate this requirement by using the local epoch time `Date.now()` as the revision number. As long as context changes on a given channel occur in the super-millisecond timescale, there will be no data races or edge conditions to contend with.

### Known Edge Cases and Behaviors

- If a channel context is set from two or more providers on the same millisecond, the final selected context is non-deterministic for all providers
- If a channel context is set locally after a remote context has occurred but before it has been received, the context listener is never called with the intermediate, stale context value
