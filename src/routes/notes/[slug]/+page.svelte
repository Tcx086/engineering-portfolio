<script lang="ts">
  import type { PageData } from './$types';
  import ArticleSections from '#lib/ArticleSections.svelte';
  let { data }: { data: PageData } = $props();
</script>
<article class="engineering-note"><div class="article-heading"><a href="/notes/" class="back-link">← All engineering notes</a><p class="eyebrow">{data.note.category}</p><h1>{data.note.title}</h1><p class="article-deck">{data.note.summary}</p><p class="role-line">By Tom Chen</p></div><aside class="note-takeaway" aria-labelledby="note-lesson"><h2 id="note-lesson">The engineering lesson</h2><p>{data.note.takeaway}</p></aside><ArticleSections sections={data.note.sections} /><div class="article-end"><a class="text-link" href="/notes/">More engineering notes <span aria-hidden="true">→</span></a><a class="text-link" href="/projects/microstructure-discovery-factory/">Related project <span aria-hidden="true">↗</span></a></div></article>
