import React from 'react';
import { Button, Tabs } from 'antd';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import { Imager } from '../../components';
import { CloseOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

export function MarkerPreview({ aspect, markerImages, cross = false }: any) {
  const { size } = useThree();

  const maxWidth = (2 * size.width) / 3;
  const maxHeight = (2 * size.height) / 3;

  return (
    <Html
      center
      css={{
        opacity: 0.2,
        width: maxWidth,
        pointerEvents: 'none',
        '& .ant-carousel': {
          width: '100%',
        },
      }}
      zIndexRange={[-1000000000000001, -1000000000000001]}>
      {cross && (
        <CloseOutlined
          css={{
            fontSize: maxWidth,
            position: 'absolute',
            zIndex: -1,
            transform: `scale(.6)`,
          }}
        />
      )}
      <Tabs
        tabPosition='right'
        css={{
          width: maxWidth,
          height: maxHeight,
          '& .ant-tabs-nav': {
            position: 'absolute',
            right: '-36px',
            padding: `2px 4px`,
          },
          '& .ant-tabs-content-holder': {
            border: 'none',
          },
          '&  .ant-tabs-tab': {
            paddingLeft: '4px !important',
            paddingRight: '4px !important',
            margin: `0px 0 0 0 !important`,
          },
          '& .ant-tabs-content': {
            width: 'auto !important',
          },
          '& .ant-tabs-tabpane': {
            padding: '0px !important',
          },
          '& .ant-tabs-ink-bar': {
            opacity: 0.1,
          },
          '&  .ant-tabs-content-holder': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
        centered>
        {markerImages?.map((file, index) => (
          <TabPane
            tab={
              <Button
                size='small'
                shape='circle'
                disabled>
                {index + 1}
              </Button>
            }
            key={index}
            closable={false}
            css={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'cen',
              height: maxWidth,
            }}>
            <Imager
              aspect={aspect}
              key={file.uid || file}
              file={file}
              maxWidth={maxWidth}
              maxHeight={maxHeight}
            // width={markerImagesCfg[index]?.worldWidth}
            // height={markerImagesCfg[index]?.worldHeight}
            />
          </TabPane>
        ))}
      </Tabs>
    </Html>
  );
}
