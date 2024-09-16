import React, { useState } from 'react';
import { Popover, Button } from 'antd';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import GirdCenter from './GridCenter';

const InputSelect = ({ value, size, onChange, style, icon, options }: any) => {
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = (newValue) => {
    setCurrentValue(newValue);

    onChange(newValue);
  };

  const picker = (
    <div css={{ width: 240 }}>
      <GirdCenter width={60}>
        {(options || []).map((option: any) => (
          <Button
            type='text'
            key={option.label}
            onClick={handleChange.bind(null, option.value)}>
            {option.label}
          </Button>
        ))}
      </GirdCenter>
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

export default InputSelect;
