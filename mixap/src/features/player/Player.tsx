import React, { useRef, useContext } from 'react';
import { use100vh } from 'react-div-100vh';
import { useNavigate } from 'react-router-dom';

import { HomeOutlined } from '@ant-design/icons';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import useStore from '../../hooks/useStore';
import useLogger from '../../hooks/useLogger';
import { BoardCanvas } from '../editor/BoardCanvas';
import { AuraPlay } from '../editor/AuraPlay';
import { Layout, Button, Modal } from 'antd';
import { Html } from '@react-three/drei';
import { ActivityType } from '../activity/ActivityType';

export default function Player() {
  const log = useLogger('Player');
  const height = use100vh();
  const navigate = useNavigate();

  log.debug('Render');

  const currActitityId = useStore(
    (state) => state.activitySlice.currActitityId,
  );
  const activity = useStore((state) =>
    state.activitySlice.activities.find((a) => a.id === currActitityId),
  ) as any;

  const canvasRef = useRef<any>();
  const auraPlayRef = useRef<any>();

  let meta = undefined;
  switch (activity.type) {
    case ActivityType.Validation:
      meta = {
        timer: 15,
        includesNonAnchoring: {
          enabled: true,
          auraKey: 'missedValidation',
        },
      } as any;
      break;
    case ActivityType.Association:
      meta = {
        strictMode: true,
        maxTrack: 2,
      } as any;
      break;

    default:
      break;
  }

  return (
    <BoardCanvas
      ref={canvasRef}
      style={{ width: '100%', height: height, border: 'none' }}>
      <Html
        zIndexRange={[99999999999, 99999999999]}
        wrapperClass='fullScreenTopRight'>
        <Button
          css={{
            zIndex: 99999999999,
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'translate(-42px, 2px)',
          }}
          size='large'
          shape='circle'
          type='primary'
          icon={<HomeOutlined />}
          onClick={() => {
            //Seulement pour les ancre des tab activités, groupes, parcours
            const arrayAncre = document.location.href.split('/');
            const valueAncre = arrayAncre[arrayAncre.length - 1];

            if (
              document.location.href.endsWith('path') ||
              document.location.href.endsWith('group')
            ) {
              navigate('/', { state: { ancre: valueAncre } });
            } else if (document.location.href.endsWith('activity')) {
              navigate('/', { state: { ancre: valueAncre } });
            } else {
              navigate(-1);
            }
          }}></Button>
      </Html>
      <AuraPlay
        ref={auraPlayRef}
        canvasRef={canvasRef}
        activity={activity}
        activityId={activity.id}
        meta={meta}
      />
    </BoardCanvas>
  );
}
