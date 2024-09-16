import React, { useMemo, useState } from 'react';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import { Button, Card, Modal, Space } from 'antd';

import { PlusOutlined } from '@ant-design/icons';

import { ActivityDocType, RxColOp } from '../../db/types';
import useStore from '../../hooks/useStore';
import GirdCenter from '../../components/GridCenter';
import { Checkbox } from '../../components/Checkbox';
import useLogger from '../../hooks/useLogger';
import { useActivity } from '../../hooks';
import { ActivityCard } from '../activity/ActivityCard';
import { ActivityType } from '../activity/ActivityType';

import { useTranslation } from 'react-i18next';
import { useRxCollection } from 'rxdb-hooks';

export function AuraSelect({ activityId }: any) {
  const log = useLogger('AuraSelect');

  const { onRxColActivity } = useActivity();

  const { t } = useTranslation();

  log.debug('Render');

  const rxColActivities = useRxCollection('activities');

  const activities = useStore((state) => state.activitySlice.activities);
  const activity = activities.find((a) => a.id === activityId);
  const selection = activities.filter((a) => {
    if (activity?.type === ActivityType.SmartGroup) {
      return a.type === ActivityType.Augmentation;
    } else {
      return (
        a.type !== ActivityType.Group &&
        a.type !== ActivityType.SmartGroup &&
        a.type !== ActivityType.Path
      );
    }
  });
  const combos = selection.filter((a) => activity?.comboIds?.includes(a.id));

  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string[]>(activity?.comboIds || []);

  const handleToggleActivity = (id, checked) => {
    if (checked && !selected.includes(id)) {
      setSelected([...selected, id]);
    } else if (!checked && selected.includes(id)) {
      setSelected(selected.filter((i) => i !== id));
    }
  };

  const handleSave = () => {
    onRxColActivity(RxColOp.Update, {
      id: activityId,
      comboIds: selected,
    });

    //Vérification si on vient d'un groupe ou un parcours
    if (selected.length > 0) {
      const group: any[] = [];
      const path: any[] = [];

      if (
        activity?.type === ActivityType.Group ||
        activity?.type === ActivityType.SmartGroup
      ) {
        group.push(activity.id);
      }

      if (activity?.type === ActivityType.Path) {
        path.push(activity.id);
      }

      removeActivityInGroupOrPath(selected, activity, group, path);

      selected.forEach((idActivityInGroup) => {
        onRxColActivity(RxColOp.Update, {
          id: idActivityInGroup,
          group: group,
          path: path,
        });
      });
    }

    handleCancel();
  };

  /**
   * Permet de retirer une activité d'un groupe ou parcours
   * @param selected activité sélectionné dans le groupe
   * @param activity le groupe
   * @param group les groupes de l'activité
   * @param path les parcours de l'activité
   */
  const removeActivityInGroupOrPath = (
    selected: string[],
    activity: ActivityDocType | undefined,
    group: string[],
    path: string[],
  ) => {
    if (selected.length !== activity?.comboIds?.length) {
      const result = activity?.comboIds?.filter((value) => {
        return !selected.find((deleteActivityId) => {
          return value === deleteActivityId;
        });
      });

      if (result !== undefined && result.length > 0) {
        result?.forEach((idActivityDelete) => {
          const query = rxColActivities?.findOne(idActivityDelete).exec();
          query?.then((value) => {
            const result: any = value?.toJSON();

            if (
              activity?.type === ActivityType.Group ||
              activity?.type === ActivityType.SmartGroup
            ) {
              group = result.group.filter((actId) => {
                return actId !== activity.id;
              });
            }

            if (activity?.type === ActivityType.Path) {
              path = result.group.filter((actId) => {
                return actId !== activity.id;
              });
            }

            onRxColActivity(RxColOp.Update, {
              id: idActivityDelete,
              group: group,
              path: path,
            });
          });
        });
      }
    }
  };

  const handleModalVisibility = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const isChecked = (activity) => selected.includes(activity.id);

  const allCards = useMemo(() => {
    return selection.map((activity: ActivityDocType) => (
      <ActivityCard
        activity={activity}
        key={activity.id}
        onCardClick={handleToggleActivity.bind(
          null,
          activity.id,
          !isChecked(activity),
        )}>
        <Checkbox
          checked={isChecked(activity)}
          style={{ position: 'absolute', top: 1, right: 1 }}
          onClick={handleToggleActivity.bind(
            null,
            activity.id,
            !isChecked(activity),
          )}
        />
      </ActivityCard>
    ));
  }, [selection, selected]);

  const combosCards = useMemo(() => {
    return combos.map((activity: ActivityDocType) => (
      <ActivityCard
        activity={activity}
        key={activity.id}
      />
    ));
  }, [selected, combos]);

  return (
    <div
      css={{
        width: '100%',
        height: `calc(100% - 64px - 32px)`,
        background: 'none',
        border: '1px dashed var(--active-color)',
        padding: '18px 0px',
        overflow: 'clip',
        overflowY: 'scroll',
      }}>
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
              onClick={handleModalVisibility}>
              {t('common.activity')}
            </Button>
          </div>
        </Card>
        {combosCards}
      </GirdCenter>
      <Modal
        className='mix-modal_choiceActivity'
        width={'80%'}
        title={t('common.select-activity-group')}
        open={visible}
        maskClosable={true}
        bodyStyle={{
          padding: '18px 0',
        }}
        onOk={handleSave}
        onCancel={handleCancel}
        footer={
          <Space direction='horizontal'>
            <Button
              key='back'
              onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <Button
              key='submit'
              type='primary'
              onClick={handleSave}>
              {t('common.validate')}
            </Button>
          </Space>
        }>
        <GirdCenter>{allCards}</GirdCenter>
      </Modal>
    </div>
  );
}
