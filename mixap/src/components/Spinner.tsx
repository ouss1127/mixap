import React from 'react';
import { Spin } from 'antd';
import { Html } from '@react-three/drei';

import { CodeSandboxOutlined } from '@ant-design/icons';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

export default function Spinner3f(props: any) {
  return (
    <Html
      center
      zIndexRange={[1000000000001, 1000000000001]}
      css={{
        background: '#7775',
        borderRadius: 5,
        padding: 10,
        width: '30vw',
        height: '30vh',
        border: '1px dashed var(--hot-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '5px 5px 10px #ccc',
        color: 'var(--hot-color)',
      }}>
      <Spin
        size='large'
        {...props}
        css={{
          color: 'var(--hot-color)',
        }}
        indicator={
          <CodeSandboxOutlined
            style={{ fontSize: 76 }}
            spin
          />
        }
      />
    </Html>
  );
}

export function Spinner(props: any) {
  return (
    <div
      css={{
        background: '#7775',
        borderRadius: 5,
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 1000000000001,
        padding: 10,
        width: '30vw',
        height: '30vh',
        border: '1px dashed var(--hot-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '5px 5px 10px #ccc',
        color: 'var(--hot-color)',
      }}>
      <Spin
        size='large'
        {...props}
        css={{
          color: 'var(--hot-color)',
        }}
        indicator={
          <CodeSandboxOutlined
            style={{ fontSize: 76 }}
            spin
          />
        }
      />
    </div>
  );
}
