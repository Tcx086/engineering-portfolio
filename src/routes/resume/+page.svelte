<script lang="ts">
  import resume from '#lib/resume.json';
  import artifacts from '#lib/resume-artifacts.json';
</script>

<div class="page-intro resume-intro">
  <p class="eyebrow">Tom Chen / Professional background</p><h1>Resume & Experience</h1>
  <p>The full resume covers my engineering work, data systems, financial research and analytical projects. Choose the concise version for a quick review.</p>
</div>
<section class="resume-options" aria-label="Resume downloads">
  <article class="resume-option recommended">
    <p class="eyebrow">Recommended · {artifacts.fullPages} pages</p><h2>Full Resume</h2>
    <p>A comprehensive overview based on Master Resume v4.4, including all six projects, professional and volunteer work, skills and languages.</p>
    <a class="button" href="/tom-chen-master-resume-public.pdf" download>Download Full Resume (PDF) <span aria-hidden="true">↓</span></a>
  </article>
  <article class="resume-option">
    <p class="eyebrow">Quick review · 1 page</p><h2>Concise Resume</h2>
    <p>An engineering-focused summary of my backend work, selected independent projects and technical skills.</p>
    <a class="button button-secondary" href="/tom-chen-resume.pdf" download>Download Concise Resume (PDF) <span aria-hidden="true">↓</span></a>
    <a class="text-link" href="/tom-chen-resume.txt" download>Plain text version <span aria-hidden="true">↓</span></a>
  </article>
</section>
<div class="resume-layout">
  <aside><p>{resume.headline}</p><p class="eyebrow">Contact</p><p>{resume.location}</p><a href={`mailto:${resume.email}`}>{resume.email}</a><a href={resume.github}>github.com/Tcx086</a><a href={resume.website}>portfolio.tcx086.com</a><p class="eyebrow mt-10">Technical skills</p>{#each resume.skills as skill}<p>{skill}</p>{/each}</aside>
  <div class="article-body resume-body">
    <section><h2>Profile</h2><p>{resume.profile}</p></section>
    <section><h2>Engineering experience</h2>{#each resume.experience as item}<h3>{item.name}</h3><p class="resume-role">{item.role}<br />{item.dates}</p><ul>{#each item.bullets as bullet}<li>{bullet}</li>{/each}</ul>{/each}</section>
    <section><h2>Independent projects</h2>{#each resume.projects.filter((project) => project.concise) as item}<h3>{item.name}</h3><p class="resume-role">{item.role}<br />{item.dates}</p><ul>{#each item.bullets as bullet}<li>{bullet}</li>{/each}</ul>{/each}</section>
    <section><h2>Volunteer experience</h2><h3>{resume.volunteer.name}</h3><p class="resume-role">{resume.volunteer.role}<br />{resume.volunteer.dates}</p><ul>{#each resume.volunteer.bullets as bullet}<li>{bullet}</li>{/each}</ul></section>
    <section><h2>Education</h2><p><strong>{resume.education.school}</strong><br />{resume.education.credential}</p></section>
    <section><h2>HOBBY</h2><p>{resume.hobby}</p></section>
  </div>
</div>
