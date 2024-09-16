import React, { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Modal, Card, Typography, Tooltip } from 'antd';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import { RxColOp } from '../../db/types';
import { useActivity } from '../../hooks/useActivity';
import useStore from '../../hooks/useStore';
import GirdCenter from '../../components/GridCenter';

import { getID } from '../../utils/uniqueId';
import { ActivityType, activityTypeList, AurasDefaults } from './ActivityType';
import { useAura } from '../../hooks';
import { useTrace } from '../../hooks/useTrace';
import { TRACES } from '../../db/traces';

import { useTranslation } from 'react-i18next';

export default function ActivityMenu() {
  const { onRxColActivity } = useActivity();
  const { onRxColAura } = useAura();
  const navigate = useNavigate();
  const user = useStore((state) => state.authSlice.user);
  const markerCfg = useStore((state) => state.mkUploadSlice.markerCfg);
  const visible = useStore((state) => state.activitySlice.visible);
  const addDefaults = useStore((state) => state.activitySlice.addDefaults);

  const { trace } = useTrace({});
  const { t } = useTranslation();

  const setAddDefaults = useStore(
    (state) => state.activitySlice.setAddDefaults,
  );
  const hide = useStore((state) => state.activitySlice.hideMenu);

  const handleAddAuras = useCallback(
    (auras) => {
      onRxColAura(RxColOp.AddMany, auras, []);
    },
    [onRxColAura],
  );

  useEffect(() => {
    if (addDefaults?.id && markerCfg?.marker) {
      setAddDefaults(undefined);

      const auras = AurasDefaults[addDefaults.type];
      auras.forEach((aura) => {
        aura.id = getID();
        aura.activityId = addDefaults.id;

        if (aura.content?.value) {
          aura.content.value = t(aura.content.value);
        }

        aura.cfg = {
          ...aura.cfg,
          ...markerCfg,
        };
      });

      handleAddAuras(auras);
    }
  }, [addDefaults, handleAddAuras, markerCfg?.marker]);

  const locationNavigate = useLocation();

  const cards = Object.keys(activityTypeList).map((type: any) => {
    const isDisabled = activityTypeList[type].disabled;

    return locationNavigate.state?.ancre === 'group' ||
      locationNavigate.pathname.endsWith('group') ? (
      type === ActivityType.Group || type === ActivityType.SmartGroup ? (
        <Card
          key={t(activityTypeList[type].title)}
          onClick={() => {
            if (!isDisabled) {
              trace(TRACES.SELECT_ACTIVITY_TYPE, { activityType: type });
              trace(TRACES.ENTER_NAMING_STEP);
              const id = getID();
              onRxColActivity(RxColOp.Add, {
                id,
                type: type,
                title: t(activityTypeList[type].placeholders.title) as string,
                instruction: t(
                  activityTypeList[type].placeholders.instruction,
                ) as string,
                description: t(
                  activityTypeList[type].placeholders.description,
                ) as string,
                userId: user?.id,
              });

              if (
                type === ActivityType.Validation ||
                type === ActivityType.Association
              ) {
                setAddDefaults({ id, type });
              }

              navigate(`/edit-activity/${id}/group`);
              hide();
            }
          }}
          css={{
            width: 220,
            height: 300,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            border: isDisabled
              ? '1px solid grey'
              : '1px solid var(--active-color)',
            borderRadius: 8,
            opacity: isDisabled ? 0.5 : 1,
          }}
          bodyStyle={{
            padding: 8,
          }}
          cover={
            <img
              style={{
                width: 200,
                height: 150,
                display: 'flex',
                alignItems: 'center',
                margin: 'auto',
                padding: 8,
              }}
              alt='example'
              src={activityTypeList[type].cover}
            />
          }>
          <Card.Meta
            title={
              <Typography.Title
                level={5}
                css={{ margin: 0, marginBottom: '0px !important' }}>
                {t(activityTypeList[type].title)}
              </Typography.Title>
            }
            description={
              <Tooltip title={t(activityTypeList[type].description)}>
                <Typography.Text style={{ fontSize: 13 }}>
                  {t(activityTypeList[type].description)}
                </Typography.Text>
              </Tooltip>
            }
          />
        </Card>
      ) : (
        <React.Fragment />
      )
    ) : (type !== ActivityType.Group &&
        type !== ActivityType.Path &&
        type !== ActivityType.SmartGroup) ||
      locationNavigate.pathname.endsWith('activity') ? (
      <Card
        key={t(activityTypeList[type].title)}
        onClick={() => {
          if (!isDisabled) {
            trace(TRACES.SELECT_ACTIVITY_TYPE, { activityType: type });
            trace(TRACES.ENTER_NAMING_STEP);
            const id = getID();
            onRxColActivity(RxColOp.Add, {
              id,
              type: type,
              title: t(activityTypeList[type].placeholders.title) as string,
              instruction: t(
                activityTypeList[type].placeholders.instruction,
              ) as string,
              description: t(
                activityTypeList[type].placeholders.description,
              ) as string,
              userId: user?.id,
            });

            if (
              type === ActivityType.Validation ||
              type === ActivityType.Association
            ) {
              setAddDefaults({ id, type });
            }

            navigate(`/edit-activity/${id}/activity`);
            hide();
          }
        }}
        css={{
          width: 220,
          height: 300,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          border: isDisabled
            ? '1px solid grey'
            : '1px solid var(--active-color)',
          borderRadius: 8,
          opacity: isDisabled ? 0.5 : 1,
        }}
        bodyStyle={{
          padding: 8,
        }}
        cover={
          <img
            style={{
              width: 200,
              height: 150,
              display: 'flex',
              alignItems: 'center',
              margin: 'auto',
              padding: 8,
            }}
            alt='example'
            src={activityTypeList[type].cover}
          />
        }>
        <Card.Meta
          title={
            <Typography.Title
              level={5}
              css={{ margin: 0, marginBottom: '0px !important' }}>
              {t(activityTypeList[type].title)}
            </Typography.Title>
          }
          description={
            <Tooltip title={t(activityTypeList[type].description)}>
              <Typography.Text style={{ fontSize: 13 }}>
                {t(activityTypeList[type].description)}
              </Typography.Text>
            </Tooltip>
          }
        />
      </Card>
    ) : (
      <React.Fragment />
    );
  });

  return (
    <Modal
      centered
      css={{
        height: '80vh',
        padding: 0,
        overflow: 'hidden',
        borderRadius: 8,
      }}
      bodyStyle={{ overflow: 'auto', height: '80vh' }}
      width={'80%'}
      title={t('common.select-group-type')}
      open={visible}
      footer={null}
      onCancel={hide}>
      <GirdCenter
        width={220}
        style={{ gridGap: 12 }}>
        {cards}
      </GirdCenter>
    </Modal>
  );
}
