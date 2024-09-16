import React, { useState } from 'react';
import { Popover, Button, InputNumber, Slider } from 'antd';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

const InputSlider = ({
  value,
  size,
  onChange,
  style,
  icon,
  min,
  max,
  step = 1,
}: any) => {
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = (newValue: number | null) => {
    setCurrentValue(newValue);
    onChange(newValue);
  };

  const picker = (
    <div
      css={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 220,
        padding: '16px 16px',
        '& .ant-slider-handle': {
          width: 24,
          height: 24,
          marginTop: -10,
          background: '#1890ff',
        },
      }}>
      <Slider
        css={{ width: 120 }}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        value={typeof currentValue === 'number' ? currentValue : 0}
      />
      <InputNumber
        size='large'
        min={min}
        max={max}
        step={step}
        css={{ width: 56, fontSize: '.8rem' }}
        value={currentValue}
        onChange={handleChange}
      />
    </div>
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

export default InputSlider;
