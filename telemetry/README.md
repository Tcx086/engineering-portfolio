# Dashboard reuse and public collector telemetry

The publisher consumes the existing private Tailscale Dashboard's `GET /api/collector` response. It never imports a collector model, reads collector files, starts a collector, or changes certification, capture, reliability gates or remote monitoring. The public Portfolio reads only `/api/collector-public/`, a fixed rewrite to isolated Cloudflare storage. Browser CSP permits same-origin connections only.

## Exact Dashboard mapping

The deployed Dashboard's `overviewValues()` uses these authorities; the publisher projects the same fields:

| Public field | Existing Dashboard authority |
| --- | --- |
| `tradesPersisted` | When `v2_observation.raw_landing.state === AVAILABLE`, sum `persisted` for `TRADE` and `OPTION_TRADE` products; otherwise the Dashboard's `trade_lanes[].persisted` fallback |
| `l2Persisted` | `l2_lanes[].persisted`; lane count comes from the Dashboard |
| `sequenceErrors` | `l2_lanes[].sequence_mismatches`; reported L2 counters, not certification |
| `elapsedSeconds` | `active_run.elapsed_ms` (or retained `last_run.elapsed_ms`), converted to seconds without a new clock |
| `collectorState` | Existing `service_state`, `active_run` and `freshness.collector_process.state` |
| `observedAt` | `freshness.collector_process.timestamp`, never API request time |
| `campaignResult` | Native `run.readiness_result`; an active run without a final result stays pending |
| `runId` | Private run identity transformed into an opaque HMAC alias |

The other allowlisted fields are `schemaVersion`, `mode`, `preparedAt` (assigned at ingestion), and fixed high-level `lastRunSummary`. There are twelve public fields. No source URL, logs, filesystem path, IP, host details, worker identity, signing key, operational identifier, certification detail or market record is accepted. The original API remains private.

Trades include option trades and can remain unchanged between durable landing receipts, even while receive telemetry is fresh. Counts are persisted records, not receive volume or proof of completeness. Research findings and historical FOMC figures remain separate.

## Caching and operational impact

The API is not a cached whole-response endpoint: its route calls the existing model. Existing artifact identity caches and thirty-second metadata/receipt caches remain in use. Certification, history and publication metadata may be refreshed by that backend; this publisher adds no recursive scan, dataset query, compatibility file or monitoring calculation. A normal GET is not guaranteed to do zero filesystem work.

Qualification measured Dashboard CPU of 7.9, 23.6 and 15.3 ms per bounded GET, with measured cached model builds of 3.4–9.3 ms. An earlier request reported roughly three seconds of build wall time; this is not a worst-case latency guarantee. At one request/minute, the largest measured CPU increment is approximately 0.04% of one core. I/O accounting was unavailable and was not enabled. Existing Dashboard memory stayed roughly 52–54 MB during samples. These measurements do not establish collection reliability or certification.

The relay runs on Windows, not Alienware. A 1,002-projection test using genuine captured responses took 16 ms CPU and about 62 MB relay-process RSS. The task runs as a limited user, every minute, ignores overlapping instances and has a twenty-second execution limit. Each private GET and signed public POST has a five-second timeout. Private responses are capped at the existing backend's 2 MiB limit; public bodies at 4 KiB while streaming. One attempt per cycle, no queue or immediate retry. Public reads never trigger Dashboard requests.

The relay requires this Windows machine, its existing Tailscale connection and its user task to be available. Relay loss makes public observations stale; it cannot stop or restart collection. No Linux process or service is installed. Capture, Dashboard, heartbeat and campaign processes are preserved.

## Authentication, isolation and LIVE gate

Snapshots use Ed25519 signatures over canonical JSON. Private signing and alias keys stay in owner-restricted local configuration; Cloudflare receives only a public verification key. TLS is mandatory. Production accepts observed snapshots only, rejects unsigned/altered payloads, and atomically rejects older/equal observations, regressing counters within a run, and writes less than thirty seconds apart. Rate limits are six writes/minute/IP and thirty reads/minute/IP. Platform limits are approximate; the database write interval is atomic. Storage is one row in a dedicated database with no private monitoring bindings.

`mode=observed` displays verification pending. The service's `LIVE_VERIFIED` gate defaults false, including on redeployment. Enable it only after two distinct genuine observations from the same run pass through the production endpoint and browser. Synthetic fixtures cannot satisfy that check. The viewer uses GET only, polls every thirty seconds, retains verified values on failure, marks observations older than three minutes delayed, and never advances elapsed time from an old snapshot. Changed values briefly fade unless reduced motion is enabled.

## Install, disable and verify

`install-publisher.ps1 -ConfigPath <private configuration>` registers only `TomChen-Portfolio-Telemetry`. Configuration contains `PUBLIC_PUBLISH_ENABLED`, `PUBLIC_SOURCE_URL`, `PUBLIC_INGEST_URL`, `PUBLIC_SIGNING_KEY` and `PUBLIC_ALIAS_KEY`. Keep it outside public assets and Git with owner-only access. No secrets belong in task arguments or account-wide environment variables.

Disable that task with `Disable-ScheduledTask`, stop only its instance if needed, and set its private enabled flag false. On Cloudflare set `PUBLISH_ENABLED=false` or remove the public verification key. Do not signal capture, Dashboard, certification or heartbeat. Public reads retain the last observation, which the UI ages into STALE.

`npm test` checks schemas, signatures, boundaries, actual SQLite invariants and Dashboard field selection. Browser tests cover accessibility, keyboard navigation, reduced motion, responsive diagrams and stale/failure states. `node telemetry/verify-live.mjs` observes the production page without synthetic data, mocked network, fake counters or accelerated clocks. It saves two changing genuine observations and screenshots and asserts that browser traffic stays on the Portfolio origin. Private inspection files and evidence stay under ignored `.local/dashboard-reuse/`.
