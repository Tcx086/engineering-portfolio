<script lang="ts">
  import type { PageData } from './$types';
  import ArticleSections from '#lib/ArticleSections.svelte';
  import Diagram from '#lib/Diagram.svelte';
  let { data }: { data: PageData } = $props();
</script>
<article class="case-study"><div class="article-heading"><a href="/projects/" class="back-link">← All projects</a><p class="eyebrow">CASE STUDY {data.project.number} / {data.project.category}</p><h1>{data.project.name}</h1><p class="article-deck">{data.project.summary}</p><p class="role-line">{data.project.role}</p><div class="tags">{#each data.project.tags as tag}<span>{tag}</span>{/each}</div></div>
  {#if data.project.diagram}<div class="article-diagram"><Diagram kind={data.project.diagram} /></div>{/if}
  <ArticleSections sections={data.project.sections} />
  <div class="article-end">{#if data.project.link}<a class="button" href={data.project.link.href}>{data.project.link.label} <span aria-hidden="true">↗</span></a>{:else}<a class="button" href="/contact/">Discuss the engineering <span aria-hidden="true">↗</span></a>{/if}<a class="text-link" href="/projects/">Back to projects <span aria-hidden="true">→</span></a></div>
</article>
