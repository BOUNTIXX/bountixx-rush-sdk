# Bountixx Rush SDK

The public TypeScript interface for Community Rush integrations.

## Planned surface

- Campaign and challenge-manifest types.
- Rush Vault and result-attestation payload types.
- Canonical hashing and signature verification helpers.
- Read-only clients for campaign proof pages and community embeds.

`validateRushManifest()` is the shared structural guard for a publishable
manifest. It deliberately does not certify a scoring method as deterministic;
that remains the verifier's responsibility.

The SDK is intentionally platform-neutral: communities can consume Rush proof data without embedding the Bountixx app. Read `PROJECT_CONTEXT.md` before contributing.
