import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const root = resolve('build');
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(directory, entry.name)) : join(directory, entry.name)))).flat();
}
const allFiles = await files(root);
const htmlFiles = allFiles.filter((file) => file.endsWith('.html'));
assert.equal(htmlFiles.length, 13, 'Expected 12 public routes and the static 404 page');
const titles = new Set();
let links = 0;
let maximumPageBytes = 0;
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert.ok(title, `Missing title: ${file}`);
  assert.ok(!titles.has(title), `Duplicate title: ${title}`);
  titles.add(title);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /name="description" content="[^"]+"/);
  assert.match(html, /rel="canonical"/);
  assert.match(html, /property="og:image"/);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, `One h1 per page: ${file}`);
  assert.doesNotMatch(html, /<script[^>]+src=/, `Static pages must not load client JavaScript: ${file}`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, `Duplicate IDs: ${file}`);
  for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
    if (/^(https?:|mailto:)/.test(href)) continue;
    const target = new URL(href, `https://portfolio.tcx086.com/${file.slice(root.length + 1).replaceAll('\\', '/')}`);
    const targetFile = target.pathname.endsWith('/') ? join(root, decodeURIComponent(target.pathname), 'index.html') : join(root, decodeURIComponent(target.pathname));
    assert.ok(targetFile.startsWith(root), `Path escaped build: ${href}`);
    await stat(targetFile);
    if (target.hash) assert.match(await readFile(targetFile, 'utf8'), new RegExp(`id="${target.hash.slice(1)}"`), `Missing fragment: ${href}`);
    links++;
  }
  assert.doesNotMatch(html, /linkedin\.com|(?:\d{1,3}\.){3}\d{1,3}|\b\d{3}[-. ]\d{3}[-. ]\d{4}\b|(?:ssh|smb):\/\/|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY|github_pat_|ghp_[A-Za-z0-9]{20,}|\b[A-Z]:[\\/]/i, `Potential private data: ${file}`);
  for (const [email] of html.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) assert.equal(email, 'tom863631@gmail.com', `Unapproved email: ${file}`);
  maximumPageBytes = Math.max(maximumPageBytes, gzipSync(html).byteLength);
}
assert.ok(maximumPageBytes < 18_000, 'HTML gzip budget: 18 KB');
const cssBytes = (await Promise.all(allFiles.filter((file) => file.endsWith('.css')).map(async (file) => gzipSync(await readFile(file)).byteLength))).reduce((sum, size) => sum + size, 0);
assert.ok(cssBytes < 12_000, 'CSS gzip budget: 12 KB');
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
assert.equal((sitemap.match(/<loc>/g) ?? []).length, 12);
assert.match(await readFile(join(root, 'robots.txt'), 'utf8'), /Sitemap: https:\/\/portfolio\.tcx086\.com\/sitemap\.xml/);
assert.ok(!allFiles.some((file) => file.endsWith('_worker.js')), 'No server runtime');
assert.ok((await stat(join(root, 'og.png'))).size > 1000, 'Raster Open Graph image exists');
const resume = JSON.parse(await readFile('src/lib/resume.json', 'utf8'));
const resumeArtifacts = JSON.parse(await readFile('src/lib/resume-artifacts.json', 'utf8'));
for (const [key, path] of Object.entries({ source: 'src/lib/resume.json', txt: 'build/tom-chen-resume.txt', pdf: 'build/tom-chen-resume.pdf' })) {
  const bytes = await readFile(path);
  const content = key === 'pdf' ? bytes : bytes.toString('utf8').replaceAll('\r\n', '\n');
  assert.equal(createHash('sha256').update(content).digest('hex'), resumeArtifacts[key], `Stale resume ${key}; run scripts/generate-resume.py`);
}
const resumeHtml = await readFile(join(root, 'resume/index.html'), 'utf8');
const resumeTxt = await readFile(join(root, 'tom-chen-resume.txt'), 'utf8');
const normalize = (text) => text.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"').replace(/\s+/g, ' ').trim();
const visibleResume = normalize(resumeHtml.replace(/<[^>]*>/g, ' '));
const facts = (value) => typeof value === 'string' ? [value] : Object.values(value).flatMap(facts);
for (const fact of facts(resume)) {
  assert.ok(normalize(resumeTxt).includes(normalize(fact)), `TXT resume missing: ${fact}`);
  assert.ok(fact.startsWith('https://') ? resumeHtml.includes(`href="${fact}"`) : visibleResume.includes(normalize(fact)), `HTML resume missing: ${fact}`);
}
assert.doesNotMatch(resumeHtml + resumeTxt, /CCC Motors|Hull Chrysler|Boba Green|linkedin\.com|\b\d{3}[-. ]\d{3}[-. ]\d{4}\b/i);
for (const [email] of resumeTxt.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) assert.equal(email, resume.email);
console.log(JSON.stringify({ routes: 12, htmlFiles: htmlFiles.length, internalLinksChecked: links, maximumHtmlGzipBytes: maximumPageBytes, totalCssGzipBytes: cssBytes, privacyScan: 'passed', resumeConsistency: 'HTML/TXT facts and generated PDF hash verified', runtime: 'static; no client JavaScript loaded' }, null, 2));
