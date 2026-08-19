import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { fumadocsMdx } from 'fumadocs-mdx/vite';
import { remarkCodeHike, recmaCodeHike, type CodeHikeConfig } from 'codehike/mdx';

const codeHikeConfig: CodeHikeConfig = {
  components: {
    // every MDX code fence renders through our <Code /> component (app/components/code.tsx)
    code: 'Code',
  },
  syntaxHighlighting: {
    // highlighted at compile time; colors come from the --ch-* variables in app.css
    theme: 'github-from-css',
  },
};

export default defineConfig({
  plugins: [
    fumadocsMdx({
      // Code Hike lives here (not in app/lib/source.ts) because this file never
      // enters the browser module graph — its plugin imports are Node-only.
      globalOptions: {
        mdxOptions: {
          // Code Hike must run before fumadocs' remark plugins so `## !!steps`
          // headings inside <Scrollycoding> don't leak into the table of contents
          remarkPlugins: (v) => [[remarkCodeHike, codeHikeConfig], ...v],
          recmaPlugins: [[recmaCodeHike, codeHikeConfig]],
        },
      },
    }),
    tailwindcss(),
    reactRouter(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  optimizeDeps: {
    // pre-bundle the client-side Code Hike modules; discovering them lazily on
    // the first /docs navigation makes the dev optimizer emit chunks that
    // mismatch the already-served react/jsx-runtime bundle, killing the route
    include: [
      'codehike/blocks',
      'codehike/code',
      'codehike/utils/selection',
      'codehike/utils/token-transitions',
      'zod',
    ],
  },
});
