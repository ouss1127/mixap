import React, { useState } from 'react';

import { Form, Input, Slider, Switch, InputNumber, Button } from 'antd';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import useLogger from '../hooks/useLogger';

import InputColor from './InputColor';
import InputSlider from './InputSlider';
import RadioButton from './RadioButton';
import InputFile from './InputFile';
import GroupButton from './GroupButton';
import InputSelect from './InputSelect';
import InputAudio from './InputAudio';
import { Snapshot } from './Snapshot';
import { ImgGeneration } from './ImgGeneration';
import { AudioGeneration } from './AudioGeneration';
import { TextGeneration } from './TextGeneration';
import { InputLink } from './InputLink';

function FormItem({ item }: any) {
  const log = useLogger('FormItem');

  const [snapOpen, setSnapOpen] = useState(false);
  const [audioOpen, setAudioOpen] = useState(false);

  const {
    component,
    isSwitch,
    defaultValue: value,
    label,
    key,
    // description,
    // width,
    valuePropName,
    onClick,
    ...otherProps
  } = item;

  const style = {
    width: 38,
    height: 38,
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    margin: 0,
  };

  const handleColorChange = () => {
    //
  };

  const handleInputSelectChange = () => {
    //
  };

  const handleInputAudioChange = () => {
    //
  };

  let fieldComponent;

  switch (component) {
    case 'InputFile':
      fieldComponent = (
        <InputFile
          {...item}
          style={style}
          onChange={handleColorChange}
        />
      );
      break;
    case 'Snapshot':
      fieldComponent = (
        <>
          <Button
            {...item}
            type='text'
            style={style}
            onClick={() => {
              setSnapOpen(true);
            }}
          />
          <Form.Item
            name='file'
            valuePropName='file'
            noStyle>
            <Snapshot
              {...otherProps}
              visible={snapOpen}
              onCancel={() => {
                setSnapOpen(false);
              }}
              onChange={() => {
                setSnapOpen(false);
              }}
              style={style}
            />
          </Form.Item>
        </>
      );
      break;
    case 'InputAudio':
      fieldComponent = (
        <InputAudio
          {...item}
          style={style}
          onChange={handleInputAudioChange}
        />
      );
      break;
    case 'RadioButton':
      fieldComponent = (
        <RadioButton
          {...item}
          style={style}
          onChange={handleColorChange}
        />
      );
      break;
    case 'GroupButton':
      fieldComponent = (
        <GroupButton
          style={style}
          {...item}
        />
      );
      break;
    case 'Slider':
      fieldComponent = (
        <Slider
          placeholder={label}
          {...otherProps}
          style={style}
        />
      );
      break;
    case 'Switch':
      fieldComponent = (
        <Switch
          defaultChecked={value}
          {...otherProps}
        />
      );
      break;
    case 'Input':
      fieldComponent = (
        <Input
          {...otherProps}
          style={style}
        />
      );
      break;
    case 'Select':
      fieldComponent = (
        <InputSelect
          value={value}
          style={style}
          {...otherProps}
          onChange={handleInputSelectChange}
        />
      );
      break;
    case 'InputNumber':
      fieldComponent = (
        <InputNumber
          {...otherProps}
          style={style}
        />
      );
      break;
    case 'InputColor':
      fieldComponent = (
        <InputColor
          value={value}
          style={style}
          {...otherProps}
          onChange={handleColorChange}
        />
      );
      break;
    case 'InputSelect':
      fieldComponent = (
        <InputSelect
          value={value}
          style={style}
          {...otherProps}
          onChange={handleInputSelectChange}
        />
      );
      break;
    case 'InputSlider':
      fieldComponent = (
        <InputSlider
          value={value}
          style={style}
          {...otherProps}
          onChange={handleInputSelectChange}
        />
      );
      break;
    case 'InputLink':
      fieldComponent = (
        <InputLink
          value={value}
          style={style}
          {...otherProps}
          onChange={handleInputSelectChange}
        />
      );
      break;
    case 'Button':
      fieldComponent = (
        <Button
          type='text'
          style={style}
          {...otherProps}
          onClick={onClick}
        />
      );
      break;
    case 'ImgGeneration':
      fieldComponent = (
        <>
          <Button
            {...item}
            type='text'
            style={style}
            onClick={() => {
              setSnapOpen(true);
            }}
          />
          <Form.Item
            name='file'
            valuePropName='file'
            noStyle>
            <ImgGeneration
              {...otherProps}
              visible={snapOpen}
              onCancel={() => {
                setSnapOpen(false);
              }}
              style={style}
            />
          </Form.Item>
        </>
      );
      break;
    case 'TextGeneration':
      fieldComponent = (
        <>
          <Button
            {...item}
            type='text'
            style={style}
            onClick={() => {
              setSnapOpen(true);
            }}
          />
          <Form.Item
            name='text'
            valuePropName='text'
            noStyle>
            <TextGeneration
              {...otherProps}
              visible={snapOpen}
              onCancel={() => {
                setSnapOpen(false);
              }}
              style={style}
            />
          </Form.Item>
        </>
      );
      break;

    case 'AudioGeneration':
      fieldComponent = (
        <>
          <Button
            {...item}
            type='text'
            style={style}
            onClick={() => {
              setAudioOpen(true);
            }}
          />
          <Form.Item
            name='file'
            valuePropName='file'
            noStyle>
            <AudioGeneration
              {...otherProps}
              visible={audioOpen}
              onCancel={() => {
                setAudioOpen(false);
              }}
              style={style}
            />
          </Form.Item>
        </>
      );
      break;

    default:
      break;
  }

  return (
    <Form.Item
      key={key}
      name={key}
      valuePropName={
        isSwitch ? 'checked' : valuePropName ? valuePropName : undefined
      }>
      {fieldComponent}
    </Form.Item>
  );
}

export default function ControlsForm({
  options,
  form,
  initialValues,
  onChange,
}: any) {
  return (
    <Form
      form={form}
      css={{
        display: 'flex',
        alignItems: 'center',
        padding: 0,
        // marginTop: 52,
        '> .ant-row ': {
          margin: 0,
        },
        '> .ant-form-item ': {
          margin: '4px 0px',
        },
      }}
      name='basic'
      layout='inline'
      autoComplete='off'
      initialValues={initialValues}
      onValuesChange={(changedField, allFields) => {
        onChange(changedField, allFields);
      }}>
      {options.map((item: any) => (
        <FormItem
          key={item.label}
          item={item}
        />
      ))}
    </Form>
  );
}
