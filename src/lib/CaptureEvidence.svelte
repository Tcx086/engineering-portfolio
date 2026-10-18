<script lang="ts">
  import { captureMetrics } from '#lib/content.ts';
</script>

<div class="capture-evidence">
  <p class="eyebrow">One documented FOMC event capture</p>
  <dl class="capture-grid">
    {#each captureMetrics as metric}
      <div><dt>{metric.label}</dt><dd>{metric.value}</dd></div>
    {/each}
  </dl>
  <p class="evidence-note">Captured around one U.S. Federal Reserve policy announcement. Figures apply to that capture.</p>
</div>
