import React from 'react';
import { Card, Divider, Skeleton, Space, Typography } from 'antd';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import { ActivityDocType } from '../../db/types';
import { ActivityType } from './ActivityType';

export default function ActivityThumbnail({
  activity,
  active,
  children,
  onCoverClick = undefined,
}: {
  activity: Partial<ActivityDocType>;
  active?: boolean;
  children?: React.ReactNode;
  onCoverClick?: (...args) => void | undefined;
}) {
  const title = (
    <Typography.Text
      css={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        background: '#0009',
        color: '#fff',
        width: 200,
      }}>
      <strong>{activity.title}</strong>
      <br />
      {activity.instruction}
    </Typography.Text>
  );

  return (
    <Card
      css={{
        width: 200,
        height: 140,
        border: '1px solid #eee',
      }}
      // bodyStyle={{ padding: 6 }}
      cover={
        <>
          <Space
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCoverClick && onCoverClick(activity.id);
            }}>
            {activity.markerImages?.[0] &&
            activity.type === ActivityType.Augmentation ? (
              <img
                css={{
                  width: 200,
                  height: 136,
                  objectFit: 'cover',
                  border: '1px solid #eee',
                  cursor: 'pointer',
                }}
                alt=''
                src={activity.markerImages[0]}
              />
            ) : (
              <Skeleton.Image
                style={{
                  width: 200,
                  height: 136,
                  objectFit: 'cover',
                  border: '1px solid #eee',
                }}
              />
            )}
            {title}
          </Space>
          <Divider
            css={{
              margin: 0,
              background: active ? 'var(--primary-color)' : 'transparent',
              borderTopWidth: 2,
            }}
          />
        </>
      }></Card>
  );
}
