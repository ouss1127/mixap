import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

import { Steps, Button, Typography, Space } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

const { Step } = Steps;

export function Steps3f({ steps }: any) {
  const { viewport, size } = useThree();
  const [current, setCurrent] = useState(0);

  const { t } = useTranslation();

  const stepHeight = 46;
  // const stepHeightUnit = (stepHeight * viewport.height) / size.height;

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  return (
    <group position={[-viewport.width / 2, viewport.height / 2, 0]}>
      <mesh>
        <Html
          style={{
            // border: '3px dashed orange',
            width: size.width - 2 * stepHeight,
            height: stepHeight,
            left: stepHeight,
          }}
          calculatePosition={() => [0, 0]}>
          <Steps current={current}>
            {steps.map((item) => (
              <Step
                key={item.title}
                title={
                  <Typography.Title level={5}>{item.title}</Typography.Title>
                }
              />
            ))}
          </Steps>
        </Html>
      </mesh>

      <group>
        <Html
          calculatePosition={() => [0, 0]}
          style={{
            border: '2px dashed #1890ff',
            width: size.width,
            height: size.height - 2 * stepHeight,
            top: 46,
          }}></Html>
        {steps[current].content}
      </group>

      <Html
        calculatePosition={() => [0, 0]}
        style={{
          top: size.height - stepHeight,
          left: 0,
          width: size.width - 16,
          height: stepHeight,
          marginTop: 5,
        }}>
        <Space
          direction='horizontal'
          style={{ width: '100%', justifyContent: 'flex-end' }}>
          {current > 0 && (
            <Button
              icon={<ArrowLeftOutlined />}
              size='large'
              shape='round'
              style={{ margin: '0 8px' }}
              onClick={() => prev()}>
              {t('common.previous')}
            </Button>
          )}
          {steps[current].actions}
          {current !== steps.length - 1 && !steps[current].await && (
            <Button
              icon={<ArrowRightOutlined />}
              size='large'
              shape='round'
              type='primary'
              onClick={() => next()}>
              {t('common.next')}
            </Button>
          )}
        </Space>
      </Html>
    </group>
  );
}
