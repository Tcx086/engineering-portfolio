<script lang="ts">
  let { kind = 'capture' }: { kind?: 'capture' | 'context' } = $props();
  const steps = $derived(kind === 'capture'
    ? [['Exchange feeds', 'Multiple exchanges provide trades, order books and market state.'], ['WebSocket collectors', 'Receive live updates and retain their source identity.'], ['Normalization', 'Give records a consistent format and timing.'], ['Storage', 'Durable landing, Parquet and bounded DuckDB access.'], ['Validation', 'Check gaps, reconcile records and mark usable intervals.'], ['Replay / research', 'Read the data available at a given time.']]
    : [['Source inputs', 'Bring different categories into one processing path.'], ['Parse & validate', 'Normalize records and check source and event identities.'], ['Persistence', 'Save structured event history with Workers and D1.'], ['Temporal controls', 'Keep later information out of earlier historical views.'], ['Dashboard / API', 'Present source-linked context for review and research.']]);
</script>

<figure class="system-diagram" class:capture-architecture={kind === 'capture'}>
  <figcaption><span class="eyebrow">Public architecture / {kind === 'capture' ? 'Collection to research' : 'Inputs to context'}</span><strong>{kind === 'capture' ? 'Exchange data, checked before research uses it.' : 'Many inputs. One structured view of what was known.'}</strong></figcaption>
  <ol class="process-flow">
    {#each steps as [label, description], i}
      <li><span class="step-number">0{i + 1}</span><strong>{label}</strong><p>{description}</p></li>
    {/each}
  </ol>
  {#if kind === 'capture'}<div class="lifecycle-band"><span aria-hidden="true">↳</span><div><strong>Monitoring & lifecycle control</strong><p>Track progress and failures, stop new inputs, finish storage and preserve recovery evidence across the pipeline.</p></div></div>{/if}
</figure>
