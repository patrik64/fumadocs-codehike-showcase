import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Code } from './code';
import { Scrollycoding } from './scrollycoding';
import { Slideshow } from './slideshow';
import { Spotlight } from './spotlight';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // Code Hike: `Code` matches `components.code` in the Code Hike config
    Code,
    Scrollycoding,
    Slideshow,
    Spotlight,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
