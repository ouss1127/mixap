import React, { useEffect, useState } from 'react';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

import { Space, Typography } from 'antd';

import Icon from '@ant-design/icons';
import { ScanSvg } from '../components/ScanSvg';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import useStore from './useStore';
import { useInterval } from './useInterval';

import { ActivityDocType } from '../db/types';
import { ActivityType } from '../features/activity/ActivityType';

import { useTranslation } from 'react-i18next';

export function useAuraScan({
  activity,
}: {
  activity?: Partial<ActivityDocType>;
}) {
  const { size } = useThree();

  const { t } = useTranslation();

  let markerPreview = undefined;

  switch (activity?.type) {
    case ActivityType.Superposition:
    case ActivityType.Augmentation:
      markerPreview = (
        <img
          css={{
            height: 96,
            objectFit: 'cover',
            border: '1px solid #eee',
          }}
          alt='Marqueur'
          src={activity?.markerImages?.[0]}
        />
      ) as any;
      break;

    default:
      break;
  }

  const AuraScan = (
    <Html
      center
      zIndexRange={[99999777999, 99999777999]}
      css={
        {
          // width: size.width,
          // height: size.height,
        }
      }
      className='scan'>
      <Typography.Text
        css={{
          zIndex: 99999777999,
          display: 'flex',
          position: 'absolute',
          top: 18,
          left: '50%',
          transform: 'translate(-50%, 50%)',
          fontSize: '1rem',
          padding: '0px 8px',
          background: '#fff',
          textAlign: 'center',
          borderRadius: 8,
        }}>
        {t('common.place-image-instruction')}
      </Typography.Text>

      <Space
        direction='vertical'
        align='center'
        size={[0, 0]}
        css={{
          zIndex: 99999777999,
          width: '100%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, 4px)',
        }}>
        <Typography.Paragraph
          css={{
            padding: '0px 8px',
            fontSize: '1rem',
            background: '#fff',
            textAlign: 'center',
            borderRadius: 8,
          }}>
          {activity?.instruction || activity?.title}
        </Typography.Paragraph>
        {markerPreview}
      </Space>
      <Icon
        component={ScanSvg}
        css={{
          zIndex: 99999777999,
          fontSize: size.width * 0.75,
          color: '#eee',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.8,
        }}
      />
    </Html>
  );

  return { AuraScan };
}
