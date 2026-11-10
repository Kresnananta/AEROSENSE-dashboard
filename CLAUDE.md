# AEROSENSE project instructions

Read [docs/PROJECT_HANDOFF.md](docs/PROJECT_HANDOFF.md) before the first change. It records the starting commit, entry points, verified results, and gaps. Verify current code and runtime evidence when they differ from the snapshot.

- Use `feat/environment-insights` as the integration base. Work in a task branch, keep changes scoped, and leave deployment to the explicitly assigned operator.
- Use Node.js 22 and pnpm for the web. Start with `pnpm install --frozen-lockfile`, then run the tests that cover the change. Use fixtures for cloud UI work.
- Keep station or node measurements, modeled regional data, forecasts, GRU estimates, and test fixtures distinguishable. Label optical dust and modeled ISPU/US AQI with their actual source and scope.
- Keep access decisions in the API/database. Preserve site assignments, device-specific credentials, and the private n8n endpoints.
- Preserve actuator duration limits, TTL, deduplication, battery cutoff, stop behavior, and lost-link handling. Test with a fixture or pump output disconnected. A broker ACK does not prove physical operation.
- Never copy production credentials into a PR, a prompt, or a fixture. Use example configuration and local synthetic values.
- Record the base commit, branch, changed files, checks, runtime evidence, and open questions in the task handoff. Different agents should avoid editing the same files in parallel.
