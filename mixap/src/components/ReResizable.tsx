import React from 'react';
import { Resizable } from 're-resizable';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

export default function ReResizable({ enable, children, ...props }: any) {
  return enable ? (
    <Resizable
      defaultSize={props?.defaultSize}
      {...props}>
      {children}
    </Resizable>
  ) : (
    <div
      {...props}
      css={props?.css}
      style={props?.defaultSize}>
      {children}
    </div>
  );
}
