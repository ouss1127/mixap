import React, { useCallback, useLayoutEffect, useState } from 'react';
import { isEqualWith } from 'lodash';

import { RxColOp } from '../../db/types';
import useStore from '../../hooks/useStore';
import { useAura } from '../../hooks/useAura';
import { Aura } from '../aura/Aura';
import { EditorStatus } from './slice';
import { AuraMode } from './Board';
import useLogger from '../../hooks/useLogger';
import { useThree } from '@react-three/fiber';
import { useTrace } from '../../hooks/useTrace';
import { TRACES } from '../../db/traces';

export function AuraMake({ canvasRef, activityId, activity, meta = {} }: any) {
  const log = useLogger('AuraMake');

  log.debug('Render');

  const { onRxColAura } = useAura();
  const [delayed, setDelayed] = useState(true);

  const { auraKey = undefined } = meta;

  const { trace } = useTrace({});

  let auras = useStore(
    (state) =>
      state.auraSlice.auras?.filter((aura) => aura.activityId === activityId),
    (a1, a2) =>
      isEqualWith(a1, a2, (a1v, a2v) => a1v.id === a2v.id) &&
      a1.length === a2.length,
  );
  const setStatus = useStore((state) => state.editorSlice.setStatus);

  auras = auras.filter((aura) => aura?.meta?.auraKey === auraKey);

  useLayoutEffect(() => {
    setStatus(EditorStatus.AuraMake);
    const timeout = setTimeout(() => setDelayed(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  const handleChange = useCallback(
    (aura) => {
      onRxColAura(RxColOp.Update, aura, []);
      let type;
      if (aura.content) {
        type = TRACES.UPDATE_AURA;
      } else if (aura.cfg?.position) {
        type = TRACES.DRAG_AURA;
      } else if (aura.cfg?.rotation) {
        type = TRACES.ROTATE_AURA;
      } else if (aura.cfg?.scale) {
        type = TRACES.RESIZE_AURA;
      } else {
        type = TRACES.STYLE_AURA;
      }

      trace(type, { auraId: aura.id });
    },
    [onRxColAura],
  );

  const handleDelete = useCallback(
    (aura) => {
      onRxColAura(RxColOp.Remove, aura, []);

      trace(TRACES.REMOVE_AURA, { auraId: aura.id });
    },
    [onRxColAura],
  );

  const camera = useThree<any>(({ camera }) => camera);

  useLayoutEffect(() => {
    camera.fov = 75;
    camera.near = 0.1;
    camera.far = 1000;
    camera.updateProjectionMatrix();
  }, []);

  return delayed ? null : (
    <group
      visible={true}
      position={[0, 0, 0]}>
      {auras.map((aura) => (
        <Aura
          key={aura.id}
          id={aura.id}
          type={aura.type}
          mode={AuraMode.CANVAS}
          canvasRef={canvasRef}
          markerCfg={activity.markerImagesCfg[0]}
          onChange={handleChange}
          onDelete={handleDelete.bind(null, aura)}
        />
      ))}
    </group>
  );
}
