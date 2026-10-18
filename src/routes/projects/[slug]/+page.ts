import { error } from '@sveltejs/kit';
import { projects } from '#lib/content.ts';
export function entries() { return projects.map(({ slug }) => ({ slug })); }
export function load({ params }: { params: { slug: string } }) {
  const project = projects.find((project) => project.slug === params.slug);
  if (!project) error(404, 'Project not found');
  return { project };
}
