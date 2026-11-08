# Bountixx Rush SDK Instructions

Read `PROJECT_CONTEXT.md` and `README.md` first. When this repository is in the Drips workspace, also read `../HANDOFF.md`. This repository is a public, small, dependency-light TypeScript SDK. Keep app-only UI and server secrets out of it.

Public types must represent what the app, verifier, and contracts can actually guarantee. Do not encode claims of trustlessness where the verifier is the authorized attester.
