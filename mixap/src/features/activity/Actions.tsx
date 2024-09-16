import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Dropdown, Menu, notification } from 'antd';

import {
  InfoCircleOutlined,
  LikeOutlined,
  //EyeOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  EditOutlined,
  QrcodeOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

const btnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 'auto',
  marginRight: 'auto',
};

import ButtonTip from '../../components/ButtonTip';
import { useActivity } from '../../hooks/useActivity';
import { RxColOp, ActivityDocType } from '../../db/types';
import { useTrace } from '../../hooks/useTrace';
import { TRACES } from '../../db/traces';

import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import { useSync } from '../../hooks/useSync';
import useStore from '../../hooks/useStore';
import { getCode } from '../../utils/uniqueId';
import { ActivityType } from '../activity/ActivityType';

function DropdownContent({ activityId }: { activityId: string }) {
  const { onRxColActivity } = useActivity();

  const { trace } = useTrace({});

  const { t } = useTranslation();

  const activities = useStore((state) => state.activitySlice.activities);

  const handleDelete = (activityId) => {
    onRxColActivity(RxColOp.Remove, {
      id: activityId,
    });

    const activity = activities.find((a) => a.id === activityId);

    if (
      activity?.type === ActivityType.Group ||
      activity?.type === ActivityType.Path ||
      activity?.type === ActivityType.SmartGroup
    ) {
      //On va retirer l'identifiant du groupe attaché aux activités quand le groupe ou le parcours est supprimé

      if (
        activity.comboIds?.length !== undefined &&
        activity.comboIds?.length > 0
      ) {
        let group: string[] | undefined = [];
        let path: string[] | undefined = [];

        activity.comboIds?.forEach((idChildActivity) => {
          const childActivity = activities.find(
            (act) => act.id === idChildActivity,
          );

          if (
            activity.type === ActivityType.Group ||
            activity.type === ActivityType.SmartGroup
          ) {
            if (childActivity !== null) {
              group = childActivity?.group?.filter((item) => {
                return item !== activityId;
              });

              onRxColActivity(RxColOp.Update, {
                id: idChildActivity,
                group: group,
              });
            }
          }

          if (activity.type === ActivityType.Path) {
            if (childActivity !== null) {
              path = childActivity?.group?.filter((item) => {
                return item !== activityId;
              });

              onRxColActivity(RxColOp.Update, {
                id: idChildActivity,
                path: path,
              });
            }
          }
        });
      }
    } else {
      let replaceComboIdsGroup: string[] | undefined;
      let replaceComboIdsPath: string[] | undefined;

      let groupFind: ActivityDocType | undefined;
      let pathFind: ActivityDocType | undefined;

      if (
        activity?.group?.length !== undefined &&
        activity?.group?.length > 0
      ) {
        activity?.group?.forEach((idGroup) => {
          groupFind = activities.find(
            (a) =>
              a.id === idGroup &&
              (a.type === ActivityType.Group ||
                a.type === ActivityType.SmartGroup),
          );

          if (
            groupFind?.comboIds?.length !== undefined &&
            groupFind?.comboIds?.length > 0
          ) {
            if (groupFind?.comboIds?.length > 0) {
              replaceComboIdsGroup = groupFind?.comboIds.filter((actId) => {
                return actId !== activity.id;
              });
            }
          }
        });
      }

      if (activity?.path?.length !== undefined && activity?.path?.length > 0) {
        activity?.path?.forEach((idPath) => {
          pathFind = activities.find(
            (a) => a.id === idPath && a.type === ActivityType.Path,
          );

          if (
            pathFind?.comboIds?.length !== undefined &&
            pathFind?.comboIds?.length > 0
          ) {
            if (pathFind?.comboIds?.length > 0) {
              replaceComboIdsPath = pathFind?.comboIds.filter((actId) => {
                return actId !== activity.id;
              });
            }
          }
        });
      }

      let concatAllComboIds: string[] | undefined;
      if (
        replaceComboIdsGroup?.length !== undefined &&
        replaceComboIdsGroup?.length > 0 &&
        replaceComboIdsPath?.length !== undefined &&
        replaceComboIdsPath?.length > 0
      ) {
        concatAllComboIds = replaceComboIdsGroup?.concat(replaceComboIdsPath);
      } else {
        if (
          replaceComboIdsGroup?.length !== undefined &&
          replaceComboIdsGroup?.length > 0
        ) {
          onRxColActivity(RxColOp.Update, {
            id: groupFind?.id,
            comboIds: replaceComboIdsGroup,
          });
        }

        if (
          replaceComboIdsPath?.length !== undefined &&
          replaceComboIdsPath?.length > 0
        ) {
          onRxColActivity(RxColOp.Update, {
            id: pathFind?.id,
            comboIds: replaceComboIdsPath,
          });
        }
      }
    }

    notification.info({
      message: t('common.activity-recycle-bin'),
      placement: 'bottomLeft',
    });

    trace(TRACES.REMOVE_ACTIVITY);
  };

  // Contenu Du DropZOne
  return (
    <Menu
      items={[
        {
          key: 'like',
          label: (
            <ButtonTip
              css={btnStyle}
              tip={t('common.like')}
              type='text'
              onClick={(e) => {
                e.preventDefault();
              }}
              icon={<LikeOutlined />}
            />
          ),
        },
        {
          key: 'delete',
          label: (
            <ButtonTip
              danger
              tip={t('common.delete')}
              type='text'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete(activityId);
              }}
              icon={<DeleteOutlined />}
            />
          ),
        },
        // {
        //   key: 'edit',
        //   onClick: handleEdit.bind(null, activityId),
        //   label: (
        //     <ButtonTip
        //       tip='Modifier'
        //       type='text'
        //       icon={<ShareAltOutlined />}
        //     />
        //   ),
        // },
      ]}
    />
  );
}

const DropdownMenu = ({ activityId }: { activityId: string }) => (
  <Dropdown
    arrow
    key='more'
    overlay={<DropdownContent activityId={activityId} />}
    placement='bottomRight'>
    <Button
      css={btnStyle}
      type='text'
      icon={
        <EllipsisOutlined
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        />
      }
    />
  </Dropdown>
);

const Actions = ({
  activityId,
  auth = 'editor',
  onEdit,
  typeActivity,
}: {
  activityId: string;
  auth?: string;
  onEdit?: (...args) => void;
  typeActivity?: string;
}) => {
  const showQRViewModal = useStore(
    (state) => state.activitySlice.showQRViewModal,
  );
  const setCurrActitityId = useStore(
    (state) => state.activitySlice.setCurrActitityId,
  );

  const handleShowQRViewModal = (e) => {
    e.stopPropagation();
    showQRViewModal();
    setCurrActitityId(activityId);
  };

  const { onPushSingleActivity } = useSync();

  const handleUpload = (activityId, e) => {
    const token = getCode();
    onPushSingleActivity(activityId, token);

    e.preventDefault();
    e.stopPropagation();
  };

  const actions = [
    <Link
      to={`/view-activity/${activityId}/${typeActivity}`}
      key='read'>
      <ButtonTip
        onClick={(e) => {
          e.stopPropagation();
        }}
        css={btnStyle}
        tip={t('common.info')}
        type='text'
        icon={<InfoCircleOutlined />}
      />
    </Link>,
    <ButtonTip
      css={btnStyle}
      tip={t('common.upload-single-activity')}
      key='upload'
      type='text'
      onClick={handleUpload.bind(null, activityId)}
      icon={<CloudUploadOutlined />}
    />,
    // <ButtonTip
    //   css={btnStyle}
    //   tip={t('common.show-qr')}
    //   key='qr'
    //   type='text'
    //   icon={<QrcodeOutlined />}
    //   onClick={(e) =>{handleShowQRViewModal(e)}}
    // />,
  ];

  if (auth === 'editor') {
    actions.push(
      <ButtonTip
        css={btnStyle}
        tip={t('common.edit')}
        key='pen'
        type='text'
        onClick={onEdit}
        icon={<EditOutlined />}
      />,
    );
  }
  return [
    ...actions,
    <DropdownMenu
      key='ellipsis'
      activityId={activityId}
    />,
  ];
};

export default Actions;
