import React from 'react';
import { Button, Input } from 'antd';

/** @jsxImportSource @emotion/react */

export default function RadioButton(props: any) {
  const {
    icon,
    value,
    defaultValue,
    size,
    options,
    onChange,
    style: styles,
  } = props;

  const handleChange = (newValue) => {
    onChange(newValue);
  };

  const style = {
    ...styles,
    border: 'none',
    '&.ant-radio-button-wrapper': {
      border: 'none',
    },
  };

  return (
    <Input.Group size={size}>
      {options.map((option: any) => (
        <>
          {(value && value !== option.value) ||
          (!value && defaultValue === option.value) ? (
            <Button
              key={option.label}
              css={style}
              type='text'
              onClick={() => {
                handleChange(option.value);
                option.onClick?.();
              }}
              value={option.value}>
              {option.icon || icon}
            </Button>
          ) : null}
        </>
      ))}
    </Input.Group>
  );
}
