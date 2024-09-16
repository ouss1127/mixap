import React, { useCallback } from 'react';
import { debounce } from 'lodash';

import { Card, Skeleton, Space, Typography } from 'antd';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import { ActivityDocType, RxColOp } from '../../db/types';
import useStore from '../../hooks/useStore';
import useLogger from '../../hooks/useLogger';
import { useActivity } from '../../hooks';

import { useTranslation } from 'react-i18next';

export function ActivityView({ activityId }: any) {
  const log = useLogger('AuraName');

  const { onRxColActivity } = useActivity();

  const { t } = useTranslation();

  const debounceChange = useCallback(
    debounce((payload) => onRxColActivity(RxColOp.Update, payload), 500),
    [onRxColActivity],
  );

  log.debug('Render');

  const activities = useStore((state) => state.activitySlice.activities);
  const activity = activities.find(
    (a) => a.id === activityId,
  ) as ActivityDocType;

  return (
    <Space
      direction='vertical'
      align='center'
      css={{
        width: '100%',
        height: `calc(100% - 64px - 32px)`,
        background: 'none',
        border: '1px dashed var(--active-color)',
        padding: '18px 0px',
        marginLeft: 'auto',
        marginRight: 'auto',
        justifyContent: 'center',
      }}>
      <Card
        css={{
          width: '70vw',
          height: '50vh',
          maxWidth: 500,
          maxHeight: 700,
          border: '1px solid #eee',
        }}
        bodyStyle={{ padding: 0, maxWidth: 500 }}
        cover={
          activity?.markerImages?.[0] ? (
            <img
              css={{
                width: '100%',
                height: '16vh',
                objectFit: 'cover',
                border: '1px solid #eee',
                cursor: 'pointer',
              }}
              alt=''
              src={activity?.markerImages[0]}
            />
          ) : (
            <Skeleton.Image
              style={{
                width: '70vw',
                maxWidth: 500,
                height: '16vh',
              }}
            />
          )
        }>
        <Space
          size={[18, 18]}
          direction='vertical'
          css={{
            padding: 18,
            width: '70vw',
            height: '100%',
            maxWidth: 500,
          }}>
          <Space
            size={[0, 0]}
            direction='vertical'
            css={{
              width: '100%',
              maxWidth: 500,
            }}>
            <Typography.Text
              css={{
                width: 100,
                marginTop: '0px !important',
                marginBottom: '0px !important',
                textAlign: 'right',
                marginRight: 6,
                color: 'rgba(0, 0, 0, 0.45)',
              }}>
              {t('common.title')}
            </Typography.Text>

            <Typography.Text
              css={{
                width: '100%',
                maxWidth: 450,
                marginTop: '0px !important',
                marginBottom: '0px !important',
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
              editable={{
                onChange: (text) => {
                  debounceChange({ id: activity.id, title: text });
                },
              }}>
              {activity?.title}
            </Typography.Text>
          </Space>

          <Space
            size={[0, 0]}
            direction='vertical'
            css={{
              width: '100%',
              maxWidth: 500,
            }}>
            <Typography.Text
              css={{
                width: 100,
                marginTop: '0px !important',
                marginBottom: '0px !important',
                textAlign: 'right',
                marginRight: 6,
                color: 'rgba(0, 0, 0, 0.45)',
              }}>
              {t('common.instruction')}
            </Typography.Text>

            <Typography.Text
              css={{
                width: '100%',
                maxWidth: 450,
                marginTop: '0px !important',
                marginBottom: '0px !important',
                fontWeight: 'bold',
                fontSize: '.8rem',
              }}
              editable={{
                onChange: (text) => {
                  debounceChange({ id: activity.id, instruction: text });
                },
              }}>
              {activity?.instruction}
            </Typography.Text>
          </Space>

          <Space
            size={[0, 0]}
            direction='vertical'
            css={{
              width: '100%',
              maxWidth: 500,
            }}>
            <Typography.Text
              css={{
                width: 100,
                marginTop: '0px !important',
                marginBottom: '0px !important',
                textAlign: 'right',
                marginRight: 6,
                color: 'rgba(0, 0, 0, 0.45)',
              }}>
              {t('common.description')}
            </Typography.Text>

            <Typography.Text
              css={{
                width: '100%',
                maxWidth: 450,
                marginTop: '0px !important',
                marginBottom: '0px !important',
              }}
              editable={{
                autoSize: { minRows: 3 },
                onChange: (text) => {
                  debounceChange({ id: activity.id, description: text });
                },
              }}>
              {activity?.description}
            </Typography.Text>
          </Space>
        </Space>
      </Card>
    </Space>
  );
}
