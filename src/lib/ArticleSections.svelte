<script lang="ts">
  import type { Section } from '#lib/content.ts';
  let { sections }: { sections: Section[] } = $props();
</script>
<div class="article-body">
  {#each sections as section, i}
    <section aria-labelledby={`section-${i}`}>
      <h2 id={`section-${i}`}>{section.title}</h2>
      {#each section.paragraphs as paragraph}<p>{paragraph}</p>{/each}
      {#if section.points}<ul>{#each section.points as point}<li>{point}</li>{/each}</ul>{/if}
    </section>
  {/each}
</div>
