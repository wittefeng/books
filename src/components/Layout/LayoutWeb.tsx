/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import * as React from 'react';
import {MarkdownPage, MarkdownProps} from './MarkdownPage';
import {RouteItem} from 'components/Layout/useRouteMeta';
import {Page} from './Page';
import sidebarWeb from '../../sidebarWeb.json';
interface PageFrontmatter {
  title: string;
}

export default function withWeb(meta: PageFrontmatter) {
  function LayoutLearn(props: MarkdownProps<PageFrontmatter>) {
    return <MarkdownPage {...props} meta={meta} />;
  }
  LayoutLearn.appShell = AppShell;
  return LayoutLearn;
}

function AppShell(props: {children: React.ReactNode}) {
  return <Page {...props} routeTree={sidebarWeb as RouteItem} />;
}
