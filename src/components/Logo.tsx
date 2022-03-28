/*
 * @Author: 冯伟
 * @description: 请输入文件描述
 * @Date: 2022-02-09 04:46:37
 * @LastEditors: Do not edit
 * @LastEditTime: 2022-02-21 01:54:31
 * @FilePath: /fengwei/src/components/Logo.tsx
 */
/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import * as React from 'react';

export function Logo(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <path
        d="M32 6H22V42H32V6Z"
        fill="none"
        stroke="#333"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M42 6H32V42H42V6Z"
        fill="none"
        stroke="#333"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M10 6L18 7L14.5 42L6 41L10 6Z"
        fill="none"
        stroke="#333"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M37 18V15"
        stroke="#333"
        strokeWidth="4"
        strokeLinecap="butt"
        strokeLinejoin="round"
      />
      <path
        d="M27 18V15"
        stroke="#333"
        strokeWidth="4"
        strokeLinecap="butt"
        strokeLinejoin="round"
      />
    </svg>
  );
}

Logo.displayName = 'Logo';
