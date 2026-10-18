import { error } from '@sveltejs/kit';
import { notes } from '#lib/content.ts';
export function entries() { return notes.map(({ slug }) => ({ slug })); }
export function load({ params }: { params: { slug: string } }) {
  const note = notes.find((note) => note.slug === params.slug);
  if (!note) error(404, 'Note not found');
  return { note };
}
