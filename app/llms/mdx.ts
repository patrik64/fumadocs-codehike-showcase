import type { Route } from './+types/mdx';
import { getLLMText, source } from '@/lib/source';

export async function loader({ params }: Route.LoaderArgs) {
  const slugs = params['*'].split('/').filter((v) => v.length > 0);
  // remove the appended "content.md"
  slugs.pop();
  const page = source.getPage(slugs);
  if (!page) {
    return new Response('not found', { status: 404 });
  }
  return new Response(await getLLMText(page), {
    headers: {
      // explicit charset: opened directly in a browser, a bare text/markdown
      // is decoded as windows-1252 and every em dash turns into mojibake
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
