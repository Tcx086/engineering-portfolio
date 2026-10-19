<script lang="ts">
  import LinkArrow from '#lib/LinkArrow.svelte';
  import { projects } from '#lib/content.ts';
</script>
<div class="page-intro"><p class="eyebrow">Four projects / Independent & collaborative work</p><h1>What I've built.</h1><p>Live data collection, a market-context dashboard, backend product work and portfolio research. Start with what each project does, then explore the engineering.</p></div>
<div class="project-index">{#each projects as project}<article class="index-project"><div class="index-number">{project.number} <span>/ CASE STUDY</span></div><div><p class="eyebrow">{project.category}</p><h2><a href={`/projects/${project.slug}/`}>{project.name}</a></h2><p>{project.summary}</p><div class="tags">{#each project.tags as tag}<span>{tag}</span>{/each}</div><a class="text-link" href={`/projects/${project.slug}/`}>Explore case study <span aria-hidden="true"><LinkArrow /></span></a></div></article>{/each}</div>
