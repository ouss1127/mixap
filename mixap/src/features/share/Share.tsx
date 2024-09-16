import React from 'react';
import { Button, Modal, Space, Typography } from 'antd';

import PageHeader from '../navigation/PageHeader';

import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSync } from '../../hooks/useSync';

export default function Share() {
  const { userId, activityId, token } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onPullSingleActivity } = useSync();

  const handleDownload = (userId, activityId, token) => {
    onPullSingleActivity(userId, activityId, token);

    navigate('/library');
  };
  return (
    <Space
      direction='vertical'
      style={{ width: '100%', height: '100%' }}>
      <PageHeader
        route='/share-activity/:userId/:activityId/:token'
        content={null}
      />

      <Modal
        centered
        css={{
          zIndex: 300,
        }}
        bodyStyle={{
          padding: 2,
          zIndex: 300,
        }}
        width={'80%'}
        visible={true}
        title={t('common.download-activity')}
        footer={
          <Space
            direction='horizontal'
            css={{
              '@media (max-width: 532px)': {
                '& .snap-btn-label': {
                  display: 'none',
                },
                '& .ant-btn-icon': {
                  margin: '0px !important',
                },
              },
            }}>
            <Button
              css={{
                '@media (max-width: 532px)': {
                  width: 32,
                  height: 32,
                },
              }}
              shape='round'
              icon={<CheckIcon />}
              onClick={() => {
                handleDownload(userId, activityId, token);
              }}>
              <Typography.Text className='snap-btn-label'>
                {t('common.yes')}
              </Typography.Text>
            </Button>
            <Button
              css={{
                '@media (max-width: 532px)': {
                  width: 32,
                  height: 32,
                },
              }}
              shape='round'
              icon={<ClearIcon />}
              onClick={() => {
                navigate('/library');
              }}>
              <Typography.Text className='snap-btn-label'>
                {t('common.no')}
              </Typography.Text>
            </Button>
          </Space>
        }></Modal>
    </Space>
  );
}
