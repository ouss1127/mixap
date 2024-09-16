import React from 'react';
import { Button, Tooltip } from 'antd';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

export default function ButtonTip(props: any) {
  const { tip, children, css } = props;

  return (
    <Tooltip title={tip}>
      <Button
        {...props}
        css={css}>
        {children}
      </Button>
    </Tooltip>
  );
}
