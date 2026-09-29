import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Banner } from 'fumadocs-ui/components/banner';
import { File, Files, Folder } from 'fumadocs-ui/components/files';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import { Crosshair, Presentation, Scroll, Tags } from 'lucide-react';
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

    // fumadocs UI components, showcased on /docs/fumadocs-ui.
    // Card, Cards and Callout already come from `defaultMdxComponents`.
    Accordion,
    Accordions,
    Banner,
    File,
    Files,
    Folder,
    ImageZoom,
    InlineTOC,
    Step,
    Steps,
    Tab,
    Tabs,
    TypeTable,

    // icons, for `<Card icon={...} />`
    Crosshair,
    Presentation,
    Scroll,
    Tags,

    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
