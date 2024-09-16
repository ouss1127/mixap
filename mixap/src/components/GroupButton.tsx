import React, { useState } from 'react';
import { Popover, Button, Space, Typography } from 'antd';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

const GroupButton = ({
  value,
  size,
  // onChange,
  style,
  icon,
  onClick,
  options,
}: any) => {
  // const [currentValue, setCurrentValue] = useState(value);

  // const handleChange = (newValue: number) => {
  //   setCurrentValue(newValue);
  //   //onChange(newValue);
  // };

  const picker = (
    <div
      css={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 16px',
      }}>
      {options.map((option: any) => (
        <Space
          key={option.label}
          direction='vertical'
          align='center'
          css={{ marginLeft: 4 }}>
          <Typography.Text
            type='secondary'
            css={{ fontSize: '0.8rem' }}>
            {option.label}
          </Typography.Text>
          <Button
            css={style}
            type='text'
            size={size}
            key={option.label}
            onClick={onClick.bind(null, option.value)}
            value={option.value}>
            {option.icon || icon}
          </Button>
        </Space>
      ))}
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

export default GroupButton;
