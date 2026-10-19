<script lang="ts">
  import snapshotData from '../../static/monitoring/collector-public.json';
  import scriptUrl from '#lib/public-monitor.mjs?url';
  import { publicSnapshot, monitorFields, monitorValue, monitorStatus, monitorDescription, publicTime } from '#lib/public-monitor.mjs';
  const snapshot = publicSnapshot(snapshotData);
</script>

<svelte:head><script type="module" src={scriptUrl}></script></svelte:head>
<section class="public-monitor" data-public-monitor data-monitor-fallback={JSON.stringify(snapshot)} aria-labelledby="public-monitor-title">
  <div class="panel-heading"><p class="eyebrow">Read-only / Public monitoring</p><span class="monitor-badge" data-monitor-status role="status">{monitorStatus(snapshot)}</span></div>
  <div class="monitor-overview">
    <div><p class="eyebrow">Read-only observations</p><h2 id="public-monitor-title">Collector — Current Operations</h2><p data-monitor-description>{monitorDescription(snapshot)}</p></div>
    <div class="retained-record"><span class="record-mark">Retained finding indicator</span><p data-monitor-summary>{snapshot.lastRunSummary}</p><a class="text-link" href="#project-results">Documented Research Capture <span aria-hidden="true">↓</span></a></div>
  </div>
  <details class="monitor-telemetry"><summary>Collector telemetry <span>Published values only</span></summary><dl class="telemetry-grid">{#each monitorFields as [key, label]}<div><dt>{label}</dt><dd data-monitor-field={key}>{monitorValue(snapshot, key)}</dd></div>{/each}</dl></details>
  <div class="monitor-footer"><p>Public artifact prepared / published <time data-monitor-prepared datetime={snapshot.preparedAt}>{publicTime(snapshot.preparedAt)}</time></p><p>Checks every 30 seconds. Observations older than 3 minutes are delayed. No collector controls.</p></div>
</section>
