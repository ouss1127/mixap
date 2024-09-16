import React, { CSSProperties } from 'react';
import { Button } from 'antd';

import { CheckOutlined } from '@ant-design/icons';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

export function Checkbox({
  checked = false,
  style = {},
  onClick,
}: {
  checked: boolean;
  style?: CSSProperties;
  onClick: (checked: boolean) => void;
}) {
  return (
    <Button
      onClick={(e) => {
        e.preventDefault();
        onClick(!checked);
      }}
      className='mix-card_select'
      css={{
        border: '1px solid #fff',
        ...style,
      }}
      size='middle'
      shape='circle'
      // type={checked ? 'primary' : 'ghost'}
    >
      {/*  */}
      {checked ? <CheckOutlined /> : <CheckOutlined className='mix-card_selectIco' />}
    </Button>
  );
}
