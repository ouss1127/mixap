import React from 'react';
import { useNavigate } from 'react-router-dom';
import { use100vh } from 'react-div-100vh';

import { Button, Layout, Typography } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import { HomeOutlined } from '@ant-design/icons';

import useStore from '../../hooks/useStore';
console.log('Editor useStore imported');

import { Board } from './Board';
// import { useActivity } from '../../hooks/useActivity';
// import { RxColOp } from '../../db/types';

const { Header, Content } = Layout;

export default function Editor() {
  console.log('Editor function start');
  const navigate = useNavigate();
  const height = use100vh();

  // const { onRxColActivity } = useActivity();

  const currActitityId = useStore(
    (state) => state.activitySlice.currActitityId,
  );
  const activity = useStore((state) =>
    state.activitySlice.activities.find((a) => a.id === currActitityId),
  ) as any;

  const tabReturn = document.location.href.endsWith('group') ? 'group' : document.location.href.endsWith('path') ? 'path' : 'activity';

  console.log('Editor function end');

  return (
    <Layout
      css={{
        width: '100%',
        height: height || 0,
        background: 'none',
        overflow: 'hidden',
        position: 'absolute',
        zIndex: '0',
      }}>
      <Header
        css={{
          background: 'transparent',
          height: 42,
          padding: '0 18px',
          marginBottom: 12,
        }}>
        <PageHeader
          css={{
            height: 42,
            padding: 0,
          }}
          title={
            <Typography.Title
              level={5}
              css={{
                marginTop: '0px !important',
                marginBottom: '0px !important',
                marginLeft: 12,
              }}>
              <Typography.Text
                css={{
                  width: 300,
                  '@media (max-width: 532px)': {
                    width: 120,
                  },
                }}
                ellipsis>
                {activity?.title}
              </Typography.Text>
            </Typography.Title>
          }
          onBack={() => navigate('/',{state:{ancre: tabReturn}})}
          extra={
            <Button
              shape='circle'
              type='text'
              size='large'
              onClick={() => {
                navigate('/',{state:{ancre: tabReturn}});
              }}
              icon={<HomeOutlined />}></Button>
          }
        />
      </Header>

      <Layout
        style={{
          overflowY: 'hidden',
          width: '100%',
          height: '100%',
          background: 'none',
          position: 'relative',
        }}>
        <Content
          style={{
            width: 'calc(100% -64px)',
            height: '100%',
            padding: '0 2px',
          }}>
          {activity && <Board activity={activity} />}
        </Content>
      </Layout>
    </Layout>
  );
}
