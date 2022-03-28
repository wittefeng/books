/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import React from 'react';
import {
  SandpackProvider,
  SandpackSetup,
  SandpackFile,
} from '@codesandbox/sandpack-react';

import {CustomPreset} from './CustomPreset';

type SandpackProps = {
  children: React.ReactChildren;
  autorun?: boolean;
  setup?: SandpackSetup;
  showDevTools?: boolean;
  type?: 'vanilla' | 'react';
};

const sandboxStyle = `
* {
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  margin: 20px;
  padding: 0;
}

h1 {
  margin-top: 0;
  font-size: 22px;
}

h2 {
  margin-top: 0;
  font-size: 20px;
}

h3 {
  margin-top: 0;
  font-size: 18px;
}

h4 {
  margin-top: 0;
  font-size: 16px;
}

h5 {
  margin-top: 0;
  font-size: 14px;
}

h6 {
  margin-top: 0;
  font-size: 12px;
}

ul {
  padding-left: 20px;
}
`.trim();

function CSandpack(props: SandpackProps) {
  let {
    children,
    setup,
    autorun = true,
    showDevTools = false,
    type = 'react',
  } = props;
  const [devToolsLoaded, setDevToolsLoaded] = React.useState(false);
  let codeSnippets = React.Children.toArray(children) as React.ReactElement[];
  let isSingleFile = true;

  const files = codeSnippets.reduce(
    (result: Record<string, SandpackFile>, codeSnippet: React.ReactElement) => {
      if (codeSnippet.props.mdxType !== 'pre') {
        return result;
      }
      const {props} = codeSnippet.props.children;
      let filePath; // path in the folder structure
      let fileHidden = false; // if the file is available as a tab
      let fileActive = false; // if the file tab is shown by default

      if (props.metastring) {
        const [name, ...params] = props.metastring.split(' ');
        filePath = '/' + name;
        if (params.includes('hidden')) {
          console.log(params);
          fileHidden = true;
        }
        if (params.includes('active')) {
          fileActive = true;
        }
        isSingleFile = false;
      } else {
        if (props.className === 'language-html' && type === 'vanilla') {
          filePath = '/index.html';
        } else if (props.className === 'language-js' && type === 'vanilla') {
          filePath = '/src/index.js';
        } else if (props.className === 'language-js') {
          filePath = '/App.js';
        } else if (props.className === 'language-css') {
          filePath = '/src/styles.css';
        } else {
          throw new Error(
            `Code block is missing a filename: ${props.children}`
          );
        }
      }
      if (result[filePath]) {
        throw new Error(
          `File ${filePath} was defined multiple times. Each file snippet should have a unique path name`
        );
      }
      result[filePath] = {
        code: props.children as string,
        hidden: fileHidden,
        active: fileActive,
      };
      console.log(result);

      return result;
    },
    {}
  );

  if (type === 'react') {
    files['/src/styles.css'] = {
      code: [sandboxStyle, files['/src/styles.css']?.code ?? ''].join('\n\n'),
      hidden: true,
    };
  }

  return (
    <div className="sandpack-container my-8" translate="no">
      <SandpackProvider
        template={type}
        customSetup={{...setup, files: files}}
        autorun={autorun}>
        <CustomPreset
          isSingleFile={isSingleFile}
          showDevTools={showDevTools}
          onDevToolsLoad={() => setDevToolsLoaded(true)}
          devToolsLoaded={devToolsLoaded}
        />
      </SandpackProvider>
    </div>
  );
}

CSandpack.displayName = 'Sandpack';

export default CSandpack;
