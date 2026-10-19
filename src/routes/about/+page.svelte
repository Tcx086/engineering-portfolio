<script lang="ts">
  import LinkArrow from '#lib/LinkArrow.svelte';
  import { site } from '#lib/content.ts';
  import resume from '#lib/resume.json';
</script>

<div class="page-intro"><p class="eyebrow">About me</p><h1>Commerce background.<br />Building software.</h1><p>I'm Tom Chen, a University of Toronto Mississauga graduate working on backend services, data pipelines and financial research tools.</p></div>
<div class="about-grid">
  <div class="about-statement"><span class="large-monogram" aria-hidden="true">tc<span>_</span></span><p class="eyebrow">Python · APIs · SQL<br />Market data · AI integrations</p></div>
  <div class="article-body">
    <section><h2>My work today</h2><p>I contribute backend and data engineering at Lomidance under a part-time contract arrangement. My work includes Python/FastAPI services, PostgreSQL models, external AI integrations and tests in a shared codebase.</p><p>Alongside that role, I build independent market data and financial technology projects. Those projects give me room to investigate how software handles busy data streams, interruptions and historical analysis.</p><a class="text-link" href="/projects/">Explore my projects <span aria-hidden="true"><LinkArrow /></span></a></section>
    <section><h2>Experience</h2><h3>Lomidance</h3><p>{resume.experience[0].role}<br />{resume.experience[0].dates}</p><h3>{resume.volunteer.name}</h3><p>{resume.volunteer.role}<br />{resume.volunteer.dates}</p><p>{resume.volunteer.bullets[0]}</p></section>
    <section><h2>Education</h2><p><strong>{resume.education.school}</strong><br />{resume.education.credential}</p><p>My commerce background informs my interest in financial markets. My portfolio shows the software and data engineering work I have built around that interest.</p></section>
    <section><h2>Outside work</h2><p>{resume.hobby}</p></section>
    <section><h2>What I'm looking for</h2><p>Backend/Python development, data engineering, market data and trading systems roles, quantitative development, and AI integration or automation work.</p><a class="text-link" href={`mailto:${site.email}`}>Contact me <span aria-hidden="true"><LinkArrow /></span></a></section>
  </div>
</div>
