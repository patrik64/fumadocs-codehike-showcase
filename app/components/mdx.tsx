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
import { PageGraph } from './page-graph';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps } from 'react';
import { HoverContainer, HoverMention } from './annotations/hover';
import { Code } from './code';
import { CodeSwitcher } from './code-switcher';
import { CodeWithTabs } from './code-tabs';
import { Scrollycoding } from './scrollycoding';
import { Slideshow } from './slideshow';
import { Spotlight } from './spotlight';

const DefaultLink = defaultMdxComponents.a;

// `[text](hover:name)` is a code mention rather than a link (see
// annotations/hover.tsx); every other href goes to fumadocs' own link
function MdxLink(props: ComponentProps<typeof DefaultLink>) {
  if (props.href?.startsWith('hover:')) {
    return <HoverMention name={props.href.slice('hover:'.length)}>{props.children}</HoverMention>;
  }

  return <DefaultLink {...props} />;
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    a: MdxLink,
    // Code Hike: `Code` matches `components.code` in the Code Hike config
    Code,
    CodeSwitcher,
    CodeWithTabs,
    HoverContainer,
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
    // added by `npx @fumadocs/cli add graph-view`, wrapped so MDX can use it
    PageGraph,

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
