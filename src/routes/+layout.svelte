<script lang="ts">
  import LinkArrow from '#lib/LinkArrow.svelte';
  import '../app.css';
  import { page } from '$app/state';
  import { site, pageMeta } from '#lib/content.ts';
  let { children } = $props();
  const nav = [{ href: '/projects/', label: 'Projects' }, { href: '/notes/', label: 'Notes' }, { href: '/about/', label: 'About' }, { href: '/resume/', label: 'Resume' }];
  const meta = $derived(pageMeta[page.url.pathname] ?? { title: 'Page not found', description: site.description });
</script>

<svelte:head>
  <link rel="preload" href="/fonts/poiret-one-latin.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
  <title>{meta.title} — Tom Chen</title>
  <meta name="description" content={meta.description} />
  <link rel="canonical" href={`${site.url}${page.url.pathname}`} />
  <meta property="og:type" content={page.url.pathname.startsWith('/notes/') && page.url.pathname !== '/notes/' ? 'article' : 'website'} />
  <meta property="og:title" content={`${meta.title} — Tom Chen`} />
  <meta property="og:description" content={meta.description} />
  <meta property="og:url" content={`${site.url}${page.url.pathname}`} />
  <meta property="og:image" content={`${site.url}/og.png`} />
  <meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Tom Chen — Backend, Data & Market Systems Engineering" />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header wrap">
  <a href="/" class="brand" aria-label="Tom Chen home"><span class="brand-mark" aria-hidden="true">TC</span><span>Tom Chen<span class="brand-sub">ENGINEERING PORTFOLIO</span></span></a>
  <nav aria-label="Main navigation">{#each nav as item}<a href={item.href} aria-current={page.url.pathname.startsWith(item.href) ? 'page' : undefined}>{item.label}</a>{/each}<a class="nav-contact" href="/contact/" aria-current={page.url.pathname === '/contact/' ? 'page' : undefined}>Let’s talk <span aria-hidden="true"><LinkArrow /></span></a></nav>
</header>
<main id="main" class="wrap" tabindex="-1">{@render children()}</main>
<footer class="site-footer wrap"><a href="/" class="footer-name">Tom Chen<span>Backend, data & market systems.</span></a><div><a href={site.github}>GitHub <span aria-hidden="true"><LinkArrow /></span></a><a href={`mailto:${site.email}`}>Email <span aria-hidden="true"><LinkArrow /></span></a><span class="footer-year">© 2026 Tom Chen</span></div></footer>
