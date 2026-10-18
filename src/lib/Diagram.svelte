<script lang="ts">
  let { kind = 'capture' }: { kind?: 'capture' | 'context' } = $props();
  const context = $derived(kind === 'context');
</script>

<figure class="system-diagram">
  <div class="diagram-bar"><span class="status-dot"></span><span>{context ? 'CONTEXT PIPELINE' : 'MARKET DATA PIPELINE'}</span><span class="ml-auto">FIG. {context ? '02' : '01'}</span></div>
  <svg viewBox="0 0 520 340" role="img" aria-label={context ? 'Sources flow into validation, durable history and as-of research.' : 'Exchange streams flow into acquisition, durable persistence and validated research replay.'}>
    <defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.7" fill="#354345" /></pattern></defs>
    <rect width="520" height="340" fill="url(#dots)" />
    <g fill="none" stroke="#4c6567" stroke-width="1.5"><path d="M128 72h40v98h35M128 170h75M128 268h40v-98"/><path d="M317 170h36v-30h52M452 166v54"/></g>
    <g fill="#a5e7dc"><circle cx="168" cy="170" r="3"/><circle cx="452" cy="193" r="3"/></g>
    <g fill="#182326" stroke="#405254"><rect x="22" y="48" width="106" height="48" rx="4"/><rect x="22" y="146" width="106" height="48" rx="4"/><rect x="22" y="244" width="106" height="48" rx="4"/><rect x="203" y="129" width="114" height="82" rx="4"/><rect x="405" y="114" width="94" height="52" rx="4"/><rect x="405" y="220" width="94" height="52" rx="4"/></g>
    <g font-family="monospace" font-size="11" text-anchor="middle" fill="#dbe5df"><text x="75" y="77">{context ? 'NEWS' : 'EXCHANGE A'}</text><text x="75" y="175">{context ? 'MACRO' : 'EXCHANGE B'}</text><text x="75" y="273">{context ? 'EVENTS' : 'EXCHANGE C'}</text><text x="260" y="159">{context ? 'VALIDATION' : 'ACQUISITION'}</text><text x="260" y="184" fill="#94ada9">{context ? '+ provenance' : '+ continuity'}</text><text x="452" y="136">{context ? 'DURABLE' : 'DURABLE'}</text><text x="452" y="152" fill="#94ada9">{context ? 'history' : 'persistence'}</text><text x="452" y="242">{context ? 'AS-OF' : 'VALIDATED'}</text><text x="452" y="258" fill="#94ada9">{context ? 'research' : 'replay'}</text></g>
    <text x="203" y="246" fill="#83b9b1" font-family="monospace" font-size="10">{context ? 'TIME-AWARE EVIDENCE' : 'SOURCE → STORAGE → EVIDENCE'}</text>
  </svg>
  <figcaption>Conceptual data flow · {context ? 'Source time and availability remain distinct.' : 'Connection health is one part of data integrity.'}</figcaption>
</figure>
