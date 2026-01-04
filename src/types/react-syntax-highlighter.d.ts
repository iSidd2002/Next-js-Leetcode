declare module 'react-syntax-highlighter' {
  import * as React from 'react';

  export const Prism: React.ComponentType<any>;
  export const Light: React.ComponentType<any>;

  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    showLineNumbers?: boolean;
    wrapLines?: boolean;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export const SyntaxHighlighter: React.ComponentType<SyntaxHighlighterProps>;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const vscDarkPlus: any;
  export const atomDark: any;
  export const tomorrow: any;
  export const oneLight: any;
  export const nightOwl: any;
  export const dracula: any;
}
