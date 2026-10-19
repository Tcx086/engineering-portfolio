<script lang="ts">
  import type { PageData } from './$types';
  import ArticleSections from '#lib/ArticleSections.svelte';
  import Diagram from '#lib/Diagram.svelte';
  import CaptureEvidence from '#lib/CaptureEvidence.svelte';
  let { data }: { data: PageData } = $props();
</script>

<article class="case-study">
  <div class="article-heading">
    <a href="/projects/" class="back-link">← All projects</a>
    <p class="eyebrow">{data.project.category}</p>
    <h1>{data.project.name}</h1>
    <p class="article-deck">{data.project.summary}</p>
    <p class="role-line">{data.project.role}</p>
    {#if data.project.link}<a class="text-link" href={data.project.link.href}>{data.project.link.label} <span aria-hidden="true">↗</span></a>{/if}
  </div>
  <ArticleSections sections={data.project.sections} />
  {#if data.project.diagram}<div class="article-diagram"><Diagram kind={data.project.diagram} /></div>{/if}
  <div class="article-body">
    <section class="project-results" aria-labelledby="project-results">
      <h2 id="project-results">What I can demonstrate</h2><p>{data.project.result}</p>
      {#if data.project.slug === 'microstructure-discovery-factory'}<CaptureEvidence />{/if}
    </section>
    <section aria-labelledby="project-tools"><h2 id="project-tools">Tools used</h2><p>{data.project.tools}</p><div class="tags">{#each data.project.tags as tag}<span>{tag}</span>{/each}</div></section>
    <section class="technical-section" aria-labelledby="technical-details">
      <h2 id="technical-details">Engineering details</h2>
      <p class="technical-intro">Open a topic for the implementation decisions and checks behind the overview.</p>
      {#each data.project.technical as section}
        <details class="technical-detail"><summary>{section.title}</summary><div>{#each section.paragraphs as paragraph}<p>{paragraph}</p>{/each}</div></details>
      {/each}
    </section>
    <section class="scope-note" aria-labelledby="current-scope"><h2 id="current-scope">Current scope</h2><p>{data.project.limitations}</p></section>
  </div>
  <div class="article-end">
    {#if data.project.link}<a class="button" href={data.project.link.href}>{data.project.link.label} <span aria-hidden="true">↗</span></a>{:else}<a class="button" href="/contact/">Talk about this work <span aria-hidden="true">↗</span></a>{/if}
    <a class="text-link" href="/projects/">Back to projects <span aria-hidden="true">→</span></a>
  </div>
</article>
