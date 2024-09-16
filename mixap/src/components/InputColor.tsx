import React, { useState } from 'react';
import { Popover, Button } from 'antd';
import { TwitterPicker } from 'react-color';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

const InputColor = ({ value, size, onChange, style, icon }: any) => {
  const [currentColor, setCurrentColor] = useState(value);

  const handleChange = (color) => {
    setCurrentColor(color.hex);
    onChange(color.hex);
  };

  const picker = (
    <TwitterPicker
      color={currentColor}
      triangle='hide'
      css={{
        width: '240px !important',
      }}
      colors={[
        '#FF6900',
        '#FCB900',
        '#7BDCB5',
        '#00D084',
        '#8ED1FC',
        '#0693E3',
        '#ABB8C3',
        '#EB144C',
        '#F78DA7',
        '#9900EF',
        '#8dd3c7',
        '#ffffb3',
        '#bebada',
        '#fb8072',
        '#80b1d3',
        '#fdb462',
        '#b3de69',
        '#fccde5',
        '#d9d9d9',
        '#bc80bd',
        '#ccebc5',
        '#ffed6f',
        '#5F95FF',
        '#FAF9F6',
        '#000',
        'transparent',
      ]}
      onChangeComplete={handleChange}
    />
  );

  return (
    <Popover content={picker}>
      <Button
        size={size}
        style={style}
        type='text'
        icon={icon}
      />
    </Popover>
  );
};

export default InputColor;
