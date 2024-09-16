import { List, Skeleton, Typography } from 'antd';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

// import ActivityActions from '../activity/Actions';
import { ActivityDocType } from '../../db/types';

import React from 'react';

export function ActivityListItem({
  activity,
  children,
  onCoverClick = undefined,
}: {
  activity: ActivityDocType;
  children?: React.ReactNode;
  onCoverClick?: (...args) => void | undefined;
}) {
  return (
    <List.Item
      css={{
        width: '100%',
        userSelect: 'none',
        touchAction: 'none',
        marginBottom: 8,
        boxShadow: 'rgba(0, 0, 0, 0.15) 0px 1px 2px 0px',
        borderRadius: 5,
        padding: 0,
        listStyle: 'none',
      }}
      key={activity.title}
      extra={null}>
      <List.Item.Meta
        css={{
          display: 'flex',
          '& .ant-list-item-meta-content': {
            marginLeft: 12,
            padding: 0,
          },
          '& .ant-list-item-meta-title': {
            marginTop: '.5rem',
            marginBottom: '.4rem',
          },
        }}
        avatar={
          activity.markerImages?.[0] ? (
            <img
              css={{
                width: 200,
                height: 92,
                objectFit: 'cover',
                border: '1px solid #eee',
                pointerEvents: 'none',
                borderRadius: 5,
                '@media (max-width: 532px)': {
                  width: 92,
                },
              }}
              alt=''
              src={activity.markerImages[0]}
            />
          ) : (
            <Skeleton.Image
              css={{
                width: '200px !important',
                height: '92px !important',
                cursor: 'pointer',
                borderRadius: 5,
                pointerEvents: 'none',
                '@media (max-width: 532px)': {
                  width: '92px !important',
                },
              }}
            />
          )
        }
        title={activity.title}
        description={
          <>
            <Typography.Text
              css={{
                '@media (max-width: 532px)': {
                  width: '92px !important',
                },
              }}
              ellipsis>
              {activity.instruction}
            </Typography.Text>
            <Typography.Text
              css={{
                '@media (max-width: 532px)': {
                  width: '92px !important',
                },
              }}
              ellipsis>
              {activity.description}
            </Typography.Text>
          </>
        }
      />
      {children}
    </List.Item>
  );
}
