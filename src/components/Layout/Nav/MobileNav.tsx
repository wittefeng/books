/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import * as React from 'react';
import cn from 'classnames';
import {RouteItem} from 'components/Layout/useRouteMeta';
import {useRouter} from 'next/router';
import {SidebarRouteTree} from '../Sidebar';
import sidebarHome from '../../../sidebarHome.json';
import sidebarWeb from '../../../sidebarWeb.json';
import sidebarReference from '../../../sidebarReference.json';

function inferSection(pathname: string): 'apis' | 'web' | 'home' {
  if (pathname.startsWith('/web')) {
    return 'web';
  } else if (pathname.startsWith('/apis')) {
    return 'apis';
  } else {
    return 'home';
  }
}

export function MobileNav() {
  const {pathname} = useRouter();
  const [section, setSection] = React.useState(() => inferSection(pathname));

  let tree = null;
  switch (section) {
    case 'home':
      tree = sidebarHome.routes[0];
      break;
    case 'web':
      tree = sidebarWeb.routes[0];
      break;
    case 'apis':
      tree = sidebarReference.routes[0];
      break;
  }

  return (
    <>
      <div className="sticky top-0 px-5 mb-2 bg-wash dark:bg-wash-dark flex justify-end border-b border-border dark:border-border-dark items-center self-center w-full z-10">
        <TabButton
          isActive={section === 'home'}
          onClick={() => setSection('home')}>
          首页
        </TabButton>
        <TabButton
          isActive={section === 'web'}
          onClick={() => setSection('web')}>
          web
        </TabButton>
      </div>
      <SidebarRouteTree routeTree={tree as RouteItem} isMobile={true} />
    </>
  );
}

function TabButton({
  children,
  onClick,
  isActive,
}: {
  children: any;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  isActive: boolean;
}) {
  const classes = cn(
    'inline-flex items-center w-full border-b-2 justify-center text-base leading-9 px-3 py-0.5 hover:text-link hover:gray-5',
    {
      'text-link dark:text-link-dark dark:border-link-dark border-link font-bold':
        isActive,
      'border-transparent': !isActive,
    }
  );
  return (
    <button className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
