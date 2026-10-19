<script lang="ts">
  import LinkArrow from '#lib/LinkArrow.svelte';
  import { projects, notes, site } from '#lib/content.ts';
  import CaptureEvidence from '#lib/CaptureEvidence.svelte';
</script>

<section class="hero">
  <div class="hero-copy">
    <p class="eyebrow">Tom Chen / Backend & data engineering</p>
    <h1>Hi, I'm Tom.<br />I build backend &<br /><span>data systems.</span></h1>
    <p class="hero-description">I turn complex market data into software people can inspect and use.</p>
    <p class="hero-detail">My work includes live data collectors, financial research tools and backend integrations with AI services.</p>
    <div class="hero-actions"><a class="button" href="/projects/">Explore my work <span aria-hidden="true"><LinkArrow /></span></a><a class="text-link" href="/resume/">View resume <span aria-hidden="true">→</span></a></div>
  </div>
  <aside class="hero-context" aria-label="Current role and background">
    <p class="eyebrow"><span class="status-dot"></span>Currently at Lomidance</p>
    <h2>Backend &<br />Data Engineer</h2>
    <p class="context-date">Contract Part-time · May 2026 - Present</p>
    <p>I contribute backend services, database models and external AI integrations in a shared product codebase.</p>
    <p class="context-stack">Python · FastAPI · PostgreSQL</p>
    <a href="/projects/lomidance/" class="text-link">My contribution <span aria-hidden="true"><LinkArrow /></span></a>
    <div class="context-education"><p>University of Toronto Mississauga</p><span>Bachelor of Commerce · April 2025</span></div>
  </aside>
</section>

<section class="home-section selected-work" aria-labelledby="selected-work">
  <div class="section-heading"><div><p class="eyebrow">01 / Featured projects</p><h2 id="selected-work">What I've been building.</h2></div><a href="/projects/" class="text-link">All projects <span aria-hidden="true"><LinkArrow /></span></a></div>
  <article class="featured-project">
    <div><p class="eyebrow">Independent / Market data infrastructure</p><h3><a href={`/projects/${projects[0].slug}/`}>{projects[0].name}</a></h3><p>{projects[0].summary}</p><a class="text-link" href={`/projects/${projects[0].slug}/`}>How I built it <span aria-hidden="true"><LinkArrow /></span></a></div>
    <CaptureEvidence />
  </article>
  <div class="supporting-projects">
    {#each projects.slice(1, 3) as project}
      <article class="supporting-project"><p class="eyebrow">{project.category}</p><h3><a href={`/projects/${project.slug}/`}>{project.name}</a></h3><p>{project.summary}</p><a class="text-link" href={`/projects/${project.slug}/`}>Explore the work <span aria-hidden="true"><LinkArrow /></span></a></article>
    {/each}
  </div>
</section>

<section class="home-section focus-section" aria-labelledby="focus">
  <div><p class="eyebrow">02 / Technical skills</p><h2 id="focus">The tools I use,<br />and what I use them for.</h2><p class="muted max-copy">Applied in independent research projects and collaborative backend work.</p></div>
  <div class="focus-list">
    <div><span>01</span><h3>Backend development</h3><p><strong>Python, FastAPI and REST APIs</strong> for backend services and integrations with external AI providers.</p></div>
    <div><span>02</span><h3>Databases & data pipelines</h3><p><strong>PostgreSQL, SQLAlchemy and Alembic</strong> for application data. <strong>Parquet and DuckDB</strong> for stored market data and analysis.</p></div>
    <div><span>03</span><h3>Collection & delivery</h3><p><strong>TypeScript, WebSocket and Linux</strong> for live collection. <strong>Git/GitHub, Cloudflare Workers and D1</strong> for collaboration, APIs and event history.</p></div>
  </div>
</section>

<section class="home-section" aria-labelledby="notes">
  <div class="section-heading"><div><p class="eyebrow">03 / Engineering notes</p><h2 id="notes">Lessons from building and debugging.</h2></div><a href="/notes/" class="text-link">All notes <span aria-hidden="true"><LinkArrow /></span></a></div>
  <div class="notes-grid">{#each notes as note}<article class="note-card"><p class="eyebrow">{note.category}</p><h3><a href={`/notes/${note.slug}/`}>{note.title}</a></h3><p>{note.summary}</p><a class="text-link" href={`/notes/${note.slug}/`}>Read note <span aria-hidden="true"><LinkArrow /></span></a></article>{/each}</div>
</section>

<section class="contact-callout"><p class="eyebrow">Get in touch</p><h2>Have an engineering<br /><span>role in mind?</span></h2><div><p>I'm interested in backend, data engineering, market systems and AI integration opportunities.</p><a class="button" href={`mailto:${site.email}`}>Email Tom <span aria-hidden="true"><LinkArrow /></span></a></div></section>
