<script lang="ts">
  let { kind = 'capture' }: { kind?: 'capture' | 'context' } = $props();
  const steps = $derived(kind === 'capture'
    ? [['Exchange data', 'Receive trades and order updates.'], ['Processing', 'Give records a consistent format.'], ['Storage', 'Save the data for later use.'], ['Validation', 'Check for gaps and errors.'], ['Research', 'Analyze an event or replay it.']]
    : [['Sources', 'Collect news and economic events.'], ['Extraction', 'Organize the useful fields.'], ['Validation', 'Check identities and sources.'], ['History', 'Save records with availability times.'], ['Market context', 'Review events and historical views.']]);
</script>

<figure class="system-diagram">
  <figcaption>{kind === 'capture' ? 'From exchange updates to a research dataset' : 'From incoming information to market context'}</figcaption>
  <ol class="process-flow">
    {#each steps as [label, description], i}
      <li><span class="step-number">0{i + 1}</span><strong>{label}</strong><p>{description}</p></li>
    {/each}
  </ol>
</figure>
