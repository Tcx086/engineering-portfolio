<script lang="ts">
  import LinkArrow from '#lib/LinkArrow.svelte';
  import { notes } from '#lib/content.ts';
</script>
<div class="page-intro"><p class="eyebrow">Field notes / Building & debugging</p><h1>Engineering notes.</h1><p>Practical problems from collecting market data, with the investigation, the fix and what the checks established.</p></div>
<div class="notes-index">{#each notes as note}<article class="note-index-row"><span class="row-number">{note.number}</span><div><p class="eyebrow">{note.category}</p><h2><a href={`/notes/${note.slug}/`}>{note.title}</a></h2><p>{note.summary}</p><a class="text-link" href={`/notes/${note.slug}/`}>Read note <span aria-hidden="true"><LinkArrow /></span></a></div></article>{/each}</div>
<p class="editorial-note">These articles go deeper into the implementation. For a quick introduction to the work, start with the <a href="/projects/" class="inline-link">project overviews</a>.</p>
