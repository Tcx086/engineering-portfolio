# Public collector telemetry — integration unverified

**Release status: SNAPSHOT ONLY.** The portfolio does not consume this preview service. No exporter has been installed or enabled on the collector. A changing synthetic preview is not a live collector integration.

## Inspection result

The authorized collector repository has an existing read-only dashboard projection with cumulative, per-lane `persisted` and `sequence_mismatches` fields and producer observation timestamps. Its bounded readers reuse telemetry/status artifacts; no market dataset query is needed. The adapter supports that projection, but has only been exercised with labeled fixtures.

The deployed remote health monitor is receiving genuine collector heartbeats. Its strict health envelope includes service state, observation and persistence timestamps, spool depth and certification debt, but **does not transport persisted trade totals, persisted L2 totals, sequence-error totals or elapsed run time**. The private health schema and collector pipeline have not been changed. The documented loopback dashboard endpoint was not listening on this workstation; access to the active collector's full projection has not been established from this task. Consequently, two changing real persisted-counter observations cannot yet be demonstrated.

## Isolated boundary

```text
Existing read-only dashboard projection (source access still required)
  -> exporter.mjs (disabled; no filesystem access or collector imports)
  -> authenticated HTTPS POST /ingest
  -> dedicated Cloudflare Worker + dedicated D1 single-row table
  -> GET /public/collector
  -> portfolio viewer (connection intentionally not enabled)
```

The preview has no binding to the private monitoring service or its database, no collector credentials and no operational control route. It does not expose the original monitoring API. There are no DNS changes. The public read route accepts GET/HEAD only; writes require a separate random bearer secret. The live gate defaults to false; synthetic payloads are explicitly labeled and can never activate the LIVE badge. The service uses the account's existing plan and platform CPU limit.

## Exact public field allowlist

| Field | Meaning |
| --- | --- |
| `schemaVersion` | Schema version 1 |
| `mode` | `snapshot`, `synthetic`, or verified `live` |
| `preparedAt` | Public preparation/publication time; assigned by the service on ingestion |
| `observedAt` | Earlier of the two producer telemetry/status timestamps, never dashboard request time |
| `runId` | Opaque `public-` alias derived using a separate private HMAC key; raw run IDs never leave the exporter |
| `collectorState` | Collecting, draining, stopped, unavailable, or unpublished |
| `elapsedSeconds` | Frozen at the observation timestamp relative to the confirmed run start |
| `tradesPersisted` | Sum of six explicitly reported monitored trade-lane persisted totals |
| `l2Persisted` | Sum of six explicitly reported monitored L2-lane persisted totals |
| `sequenceErrors` | Sum of six monitored L2 lanes' reported sequence mismatches; not dataset certification or a global integrity guarantee |
| `campaignResult` | Published result or unpublished; run completion alone does not imply successful certification |
| `lastRunSummary` | Fixed high-level finding indicator; no copied logs or internal errors |

The adapter requires all six expected venue/instrument combinations for each feed type, complete nonnegative safe-integer counters, a supported read-only schema and confirmed state/start. It fails closed on missing or stale values. A genuine zero stays zero. Unknown keys, malformed dates, private diagnostic strings and oversized bodies are rejected at the public boundary.

## Resource and failure limits

- Proposed publication cycle: 60 seconds **after** the preceding attempt completes, so no overlap, immediate retries or queue. Source GET and outbound POST each have a five-second timeout. Source response cap: 256 KiB. Public payload cap: 4 KiB, enforced while streaming. There is no direct filesystem or raw market-data access.
- Ingestion rejects source observations older than 90 seconds. The database atomically rejects older/equal observation timestamps, writes less than 30 seconds apart and regressing counters within one public run alias. Only the latest row is retained. Reads use one primary-key lookup; read replication is disabled for this isolated database.
- Platform rate limits: reads 30/minute/IP, ingestion attempts 6/minute/IP. These platform counters are approximate; the database's 30-second publication limit is atomic. No IP is included in the response, persisted in the public row or logged by application code.
- Viewer: one GET at a time, 30-second visible-page polling, five-second timeout. After three minutes the observation is delayed, independently of HTTP success; a failed read immediately marks data unavailable and retains the last valid counters. Elapsed time never progresses from an old observation. Only changed values briefly fade; reduced-motion disables that effect.
- The three-minute threshold is a conservative **provisional** budget for a 60-second source cycle, up to ten seconds of bounded exporter work, browser polling and network delay. It has been tested synthetically; real source frequency, end-to-end delay and collector overhead remain unmeasured. Reconfirm it before opening the live gate.

## Shutdown and activation

The repository configuration has `PUBLISH_ENABLED=false` and `LIVE_VERIFIED=false`. The exporter exits without any request unless `PUBLIC_PUBLISH_ENABLED=true`. To disable an installed publisher, stop only its independently managed process and clear that flag; do not signal or restart collection. On the isolated Worker set `PUBLISH_ENABLED=false` and revoke its `PUBLISH_TOKEN`. Retained observations age into STALE; failures retain verified UI values. No capture dependency or lifecycle hook is required.

Do not activate the adapter on an active runtime without specific operator authorization and a measured read-only source check. Prefer extending an already approved observation publication path off the collector when one can safely provide these exact counters. Never broaden the existing health contract as part of this portfolio release.

Before a real release: establish safe access to the full existing projection, validate all persisted-counter semantics against the active run, measure overhead and delays, publish two advancing observations with the same public alias, verify the changed browser values, stale/failure/disable behavior, then explicitly open the service live gate and connect the viewer. The static snapshot guard in `scripts/verify-build.mjs` remains intentional until that evidence exists.

## Verification

`npm test` runs schema, bounded-stream, sanitizer, disabled-exporter, authentication, privacy and actual SQLite storage-contract tests. `npm run test:browser` covers routes, accessibility, keyboard navigation, responsive diagrams, stopped/stale/unavailable states and reduced motion.

`node telemetry/verify-preview.mjs` exercises only the dedicated preview identified by `PUBLIC_TELEMETRY_PREVIEW`, with its token supplied privately through `PUBLIC_PUBLISH_TOKEN`. It submits explicitly synthetic observations, verifies auth/privacy/replay/rate limits, and uses a test-only same-origin adapter to deliver actual deployed Worker responses to the local viewer. It never reads a collector. The test writes its evidence into ignored `.local/v1.4/`. The preview publisher must be disabled after testing.
