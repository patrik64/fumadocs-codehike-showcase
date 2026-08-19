import type { Route } from './+types/home';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Link } from 'react-router';
import { baseOptions } from '@/lib/layout.shared';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Fumadocs × Code Hike' },
    {
      name: 'description',
      content: 'A React showcase of Fumadocs and Code Hike, featuring scrollycoding',
    },
  ];
}

export default function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="p-4 flex flex-col items-center justify-center text-center flex-1">
        <h1 className="text-3xl font-bold mb-3">Fumadocs × Code Hike</h1>
        <p className="text-fd-muted-foreground mb-2 max-w-lg">
          A React app where Fumadocs renders the docs and Code Hike renders
          the code — annotations, spotlight, and scroll-driven code walkthroughs.
        </p>
        <div className="flex gap-3 mt-4">
          <Link
            className="text-sm bg-fd-primary text-fd-primary-foreground rounded-full font-medium px-4 py-2.5"
            to="/docs"
          >
            Open Docs
          </Link>
          <Link
            className="text-sm border border-fd-border rounded-full font-medium px-4 py-2.5 hover:bg-fd-accent"
            to="/docs/scrollycoding"
          >
            Scrollycoding Demo
          </Link>
        </div>
      </div>
    </HomeLayout>
  );
}
