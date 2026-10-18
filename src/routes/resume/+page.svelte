<script lang="ts">
  import resume from '#lib/resume.json';
</script>

<div class="page-intro resume-intro">
  <p class="eyebrow">Public engineering resume</p><h1>{resume.name}</h1><p>{resume.headline}</p>
  <div class="hero-actions"><a class="button" href="/tom-chen-resume.pdf" download>Download resume <span class="file-type">PDF ↓</span></a><a class="text-link" href="/tom-chen-resume.txt" download>Plain text version <span aria-hidden="true">↓</span></a></div>
</div>
<div class="resume-layout">
  <aside><p class="eyebrow">Contact</p><a href={`mailto:${resume.email}`}>{resume.email}</a><a href={resume.github}>github.com/Tcx086</a><a href={resume.website}>portfolio.tcx086.com</a><p class="eyebrow mt-10">Technical skills</p>{#each resume.skills as skill}<p>{skill}</p>{/each}</aside>
  <div class="article-body resume-body">
    <section><h2>Profile</h2><p>{resume.profile}</p></section>
    <section><h2>Engineering experience</h2>{#each resume.experience as item}<h3>{item.name}</h3><p class="resume-role">{item.role}<br />{item.dates}</p><ul>{#each item.bullets as bullet}<li>{bullet}</li>{/each}</ul>{/each}</section>
    <section><h2>Independent projects</h2>{#each resume.projects as item}<h3>{item.name}</h3><p class="resume-role">{item.role}<br />{item.dates}</p><ul>{#each item.bullets as bullet}<li>{bullet}</li>{/each}</ul>{/each}</section>
    <section><h2>Volunteer experience</h2><h3>{resume.volunteer.name}</h3><p class="resume-role">{resume.volunteer.role}<br />{resume.volunteer.dates}</p><ul>{#each resume.volunteer.bullets as bullet}<li>{bullet}</li>{/each}</ul></section>
    <section><h2>Education</h2><p><strong>{resume.education.school}</strong><br />{resume.education.credential}</p></section>
    <section><h2>HOBBY</h2><p>{resume.hobby}</p></section>
  </div>
</div>
