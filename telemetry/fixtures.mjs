// Synthetic only. Never loaded by the portfolio or installed on a collector.
export function dashboardFixture(now = Date.now(), counter = 100) {
  const at = new Date(now).toISOString();
  const lanes = ['binance', 'okx', 'bybit'].flatMap(venue => ['BTCUSDT', 'ETHUSDT'].map(symbol => ({ venue, symbol, persisted: counter, sequence_mismatches: 0 })));
  return { schema_version: 'collector-dashboard-v1', read_only: true,
    run: { run_id: 'PRIVATE_TEST_RUN', status: 'RUNNING', start: new Date(now - 60_000).toISOString() },
    sources: { telemetry: { captured_at: at }, status: { captured_at: at } }, l2_lanes: lanes, trade_lanes: lanes,
    run_root: '/PRIVATE_TEST_PATH', logs: ['PRIVATE_TEST_LOG'] };
}
export function publicFixture(now = Date.now(), counter = 100) {
  const at = new Date(now).toISOString().replace(/\.\d{3}Z$/, 'Z');
  return { schemaVersion: 1, mode: 'synthetic', preparedAt: at, observedAt: at, runId: 'public-test-pipeline',
    collectorState: 'collecting', elapsedSeconds: counter, tradesPersisted: counter, l2Persisted: counter,
    sequenceErrors: 0, campaignResult: 'not_published', lastRunSummary: 'Synthetic pipeline fixture. Not a real collector observation.' };
}
