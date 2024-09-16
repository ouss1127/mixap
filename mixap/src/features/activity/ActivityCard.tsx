import React from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';

import { Button, Card, Skeleton, Space, Typography } from 'antd';

import { PlayCircleOutlined, CloudDownloadOutlined } from '@ant-design/icons';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import ActivityActions from '../activity/Actions';
import { ActivityDocType, RxColOp } from '../../db/types';
import { ActivityType, activityTypeList } from './ActivityType';
import { useActivity } from '../../hooks';

export function ActivityCard({
  activity,
  children,
  style = {},
  onCardClick = undefined,
  tabKey = undefined,
}: {
  activity: ActivityDocType | undefined;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onCardClick?: (...args) => void | undefined;
  tabKey?: string | undefined;
}) {
  const navigate = useNavigate();
  const { onRxColActivity } = useActivity();

  const handlePlay = (activityId, e) => {
    e.preventDefault();
    e.stopPropagation();
    onRxColActivity(RxColOp.SetCurrActivity, {
      id: activityId,
    });

    navigate(`/play-activity/${activityId}/none`);
  };

  const handleEdit = (activityId, e) => {
    e.preventDefault();
    e.stopPropagation();
    onRxColActivity(RxColOp.SetCurrActivity, {
      id: activityId,
    });
    navigate(`/edit-activity/${activityId}/${tabKey}`);
  };

  const handleCardClick = onCardClick || handlePlay;

  /**
   * Traduction du libellé des badges type acticités
   * @param str
   * @returns
   */
  const translateLabel = function (str) {
    let trans = '';
    if (str == 'Augmentation') {
      trans = t('common.augmentation');
    }
    if (str == 'Validation') {
      trans = t('common.validation');
    }
    if (str == 'Assocation') {
      trans = t('common.association');
    }
    if (str == 'Superposition') {
      trans = t('common.superposition');
    }
    if (str == 'Group') {
      trans = t('common.group-title');
    }
    if (str == 'Path') {
      trans = t('common.path-title');
    }
    return trans;
  };

  /**
   * Applique l'icone type comme couverture
   * @param type (type d'activité)
   * @returns
   */
  const coverIcon = (type: string) => {
    let result: any;
    if (
      activity?.type === ActivityType.Group ||
      activity?.type === ActivityType.SmartGroup ||
      activity?.type === ActivityType.Path
    ) {
      result = (
        <img
          className='mix-card_preview'
          alt={activity.type}
          src={activityTypeList[activity.type].cover}
        />
      );
    }
    return result;
  };

  /**
   * Applique l'image comme couverture
   * @param type (type d'activité)
   * @returns
   */
  const coverImg = (type: string) => {
    let result: any;
    if (
      activity?.type === ActivityType.Augmentation ||
      activity?.type === ActivityType.Association
    ) {
      if (activity?.markerImages?.[0]) {
        result = (
          <img
            className='mix-card_preview'
            alt=''
            src={activity.markerImages[0]}
          />
        );
      } else {
        result = (
          <Skeleton.Image
            className='mix-card_skeleton'
            style={{ width: 200, height: 142 }}
          />
        );
      }
    }
    return result;
  };

  /**
   * Applique le placeholder  comme couverture
   * @param type (type d'activité)
   * @returns
   */
  const coverPlaceholder = (type: string) => {
    let result: any;
    if (
      activity?.type === ActivityType.Validation ||
      activity?.type === ActivityType.Superposition
    ) {
      result = (
        <Skeleton.Image
          className='mix-card_skeleton'
          style={{ width: 200, height: 142 }}
        />
      );
    }
    return result;
  };

  return (
    <Card
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleCardClick(activity?.id, e);
      }}
      className={`mix-card ${
        (activity?.group?.length !== undefined &&
          activity?.group?.length > 0) ||
        (activity?.path?.length !== undefined && activity?.path?.length > 0)
          ? activity?.type + ' Exploiter'
          : activity?.type
      }`}
      css={{ width: 200, height: 272, border: '1px solid #eee', ...style }}
      bodyStyle={{ padding: 6 }}
      cover={
        <>
          {/* Icone */}
          {/* Badge */}
          {activity?.type === ActivityType.Augmentation ||
          activity?.type === ActivityType.Association ||
          activity?.type === ActivityType.Validation ||
          activity?.type === ActivityType.Superposition ? (
            <>
              <img
                className='mix-card_ico'
                alt={activity?.type}
                src={activityTypeList[activity?.type].cover}
              />
              <span className='mix-card_badge'>
                <Typography.Text ellipsis>
                  {translateLabel(activity?.type)}
                </Typography.Text>
              </span>
            </>
          ) : (
            <></>
          )}

          {/* Cover Preview */}
          {coverIcon(activity !== undefined ? activity.type : '')}
          {coverImg(activity !== undefined ? activity.type : '')}
          {coverPlaceholder(activity !== undefined ? activity.type : '')}

          {/* Bouton */}
          <Button
            className='mix-card_bt'
            type='link'
            size='large'
            shape='circle'
            icon={
              <PlayCircleOutlined style={{ fontSize: '2rem', color: '#fff' }} />
            }
          />
        </>
      }
      actions={ActivityActions({
        activityId: activity !== undefined ? activity.id : '',
        auth: activity?.auth,
        onEdit: handleEdit.bind(null, activity?.id),
        typeActivity:
          activity?.type === ActivityType.Group ||
          activity?.type === ActivityType.SmartGroup
            ? 'group'
            : activity?.type === ActivityType.Path
            ? 'path'
            : 'activity',
      })}>
      <Space size={[0, 0]}>
        <Card.Meta
          title={
            <div>
              <Typography.Text
                css={{
                  width: 184,
                }}
                ellipsis>
                {activity?.title}
              </Typography.Text>
              <div className='mix-card_pins'>
                {activity?.isDownload ? (
                  <span className='mix-download_ico'>
                    <CloudDownloadOutlined />
                  </span>
                ) : (
                  <React.Fragment />
                )}
                {activity?.type === ActivityType.Group ||
                activity?.type === ActivityType.SmartGroup ||
                activity?.type === ActivityType.Path ? (
                  <span className='mix-grp_nb'>
                    {activity.comboIds?.length !== undefined &&
                    activity.comboIds?.length > 0
                      ? activity?.comboIds?.length
                      : 0}
                  </span>
                ) : (
                  <React.Fragment />
                )}
              </div>
            </div>
          }
          description={
            <Typography.Text
              css={{
                width: 184,
              }}
              ellipsis>
              {activity?.description}
            </Typography.Text>
          }
        />

        <Space
          direction='vertical'
          align='center'
          css={{ marginTop: 12, width: '100%' }}></Space>
        {children}

        {/* Bouton */}
        <Button
          className='mix-card_btListing'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handlePlay(activity?.id, e);
          }}
          type='primary'
          size='small'
          shape='circle'
          icon={<PlayCircleOutlined />}>
          {t('common.start')}
        </Button>
      </Space>
    </Card>
  );
}
