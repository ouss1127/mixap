import React from 'react';
import { Space, Tabs, Typography, Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  MonitorOutlined,
  ContainerOutlined,
  PlusOutlined,
} from '@ant-design/icons';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import PageHeader from '../navigation/PageHeader';
import useStore from '../../hooks/useStore';
import GirdCenter from '../../components/GridCenter';
import { ActivityDocType, RxColOp } from '../../db/types';
import { useActivity } from '../../hooks';
import { ActivityCard } from '../activity/ActivityCard';

import { useTranslation } from 'react-i18next';

const { TabPane } = Tabs;

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <Space
      direction='vertical'
      style={{ width: '100%', height: '100%' }}>
      <PageHeader
        route='/dashboard'
        content={null}
      />
      <Tabs
        defaultActiveKey='1'
        centered>
        <TabPane
          tab={
            <Typography.Title level={4}>
              <ContainerOutlined />
              {t('common.content')}
            </Typography.Title>
          }
          key='1'>
          <Content />
        </TabPane>
        <TabPane
          tab={
            <Typography.Title level={4}>
              <MonitorOutlined />
              {t('common.learner-followup')}
            </Typography.Title>
          }
          key='2'>
          <GirdCenter>
            <Typography.Text
              mark
              italic>
              {t('common.scheduled')}
            </Typography.Text>
          </GirdCenter>
        </TabPane>
      </Tabs>
    </Space>
  );
}

function Content() {
  const user = useStore((state) => state.authSlice.user);
  const activities = useStore((state) =>
    state.activitySlice.activities.filter((a) => a.userId === user?.id),
  );
  const showMenu = useStore((state) => state.activitySlice.showMenu);

  const navigate = useNavigate();

  const { onRxColActivity } = useActivity();

  const { t } = useTranslation();

  const handlePlay = (activityId) => {
    onRxColActivity(RxColOp.SetCurrActivity, {
      id: activityId,
    });

    navigate(`/play-activity/${activityId}`);
  };

  const cards = activities.map((activity: ActivityDocType) => (
    <ActivityCard
      activity={activity}
      key={activity.id}
      onCardClick={handlePlay.bind(null, activity.id)}
    />
  ));

  return (
    <GirdCenter>
      <Card
        css={{
          width: 200,
          height: 270,
          border: '2px dashed #1890ff',
        }}
        bodyStyle={{
          padding: 0,
        }}>
        <div
          css={{
            height: 270,
            display: 'flex',
            alignItems: 'center',
            margin: 'auto',
          }}>
          <Button
            size='large'
            type='primary'
            shape='round'
            css={{
              fontWeight: 500,
              margin: 'auto',
            }}
            icon={<PlusOutlined css={{ fontSize: 22, color: '#eee' }} />}
            onClick={showMenu}>
            {t('common.activity')}
          </Button>
        </div>
      </Card>
      {cards}
    </GirdCenter>
  );
}
