# Public collector telemetry

The viewer reads only `/api/collector-public/`, a read-only endpoint backed by isolated public storage. Its publisher selects approved observations from an existing read-only source; it does not implement collection, certification, recovery or a second monitoring model. Private source configuration and operational verification evidence are excluded from Git and public assets.

The strict public allowlist is `schemaVersion`, `mode`, `preparedAt`, `observedAt`, `runId`, `collectorState`, `elapsedSeconds`, `tradesPersisted`, `l2Persisted`, `sequenceErrors`, `campaignResult`, and `lastRunSummary`. Null means unpublished, never zero. Trade totals include option trades. Reported L2 sequence errors are operational counters, not certification results. Historical research evidence remains separate.

Snapshots use Ed25519 signatures. The private signing and alias keys stay in owner-restricted publisher configuration; the ingestion service holds only a public verification key. It rejects unsigned, altered, oversized, stale, replayed and regressing observations. Only the latest public row is stored. Source URLs, operational identifiers, logs, filesystem paths, hosts, credentials and raw records are never public fields.

Publication runs once per minute with no overlapping instances or immediate retries. HTTP requests have five-second timeouts; source responses are capped at 2 MiB and public payloads at 4 KiB. Public reads cannot trigger a source request. The viewer polls every thirty seconds, marks observations older than three minutes delayed, retains verified values on failure and never advances elapsed time from old data. Changed values respect reduced motion.

The `LIVE_VERIFIED` gate defaults false, including redeployments. `mode=observed` means verification pending. Enable LIVE only after two genuine observations from the same public run have been displayed through the production endpoint and browser; synthetic fixtures do not qualify. The static HTML is a fallback.

Install the independent limited-user task with `install-publisher.ps1 -ConfigPath <private configuration>`. Keep configuration outside Git and public assets with owner-only access. Disable only the named publisher task or set its private enabled flag false; do not signal other services. Ingestion can independently be disabled with `PUBLISH_ENABLED=false` or by removing its public verification key. Publisher-host unavailability makes the view stale and does not affect collection.

`npm test` checks the schema, signatures, boundary validation, data selection and actual SQLite storage invariants. Browser tests cover routes, accessibility, keyboard navigation, responsive diagrams, reduced motion and failure states. `node telemetry/verify-live.mjs` records two real production browser updates without mocked network, synthetic data or accelerated clocks. Verification artifacts are saved under ignored `.local/`.
