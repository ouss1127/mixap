import React, { useCallback, useLayoutEffect, useState } from 'react';
import { isEqualWith } from 'lodash';
import { RxColOp } from '../../db/types';
import useStore from '../../hooks/useStore';
import { useLayer} from '../../hooks/useLayer';
import { EditorStatus } from './slice';
import useLogger from '../../hooks/useLogger';
import { useThree } from '@react-three/fiber';
import { useTrace } from '../../hooks/useTrace';
import { TRACES } from '../../db/traces';
import Layer from '../layers/layer';
import Aura from '../aura/aura';

export function LayerMake({ canvasRef, activityId, activity, meta = {} }: any) {
  const log = useLogger('LayerMake');
  log.debug('Render');

  const { onRxColLayer, addNewAuraToLayer } = useLayer();
  const [delayed, setDelayed] = useState(true);

  const { layerKey = undefined } = meta;
  const { trace } = useTrace({});

  let layers = useStore(
    (state) =>
      state.layerSlice.layers?.filter((layer) => layer.activityId === activityId),
    (l1, l2) =>
      isEqualWith(l1, l2, (l1v, l2v) => l1v.id === l2v.id) &&
      l1.length === l2.length,
  );

  const setStatus = useStore((state) => state.editorSlice.setStatus);

  layers = layers.filter((layer) => layer?.meta?.layerKey === layerKey);

  useLayoutEffect(() => {
    setStatus(EditorStatus.LayerMake);
    const timeout = setTimeout(() => setDelayed(false), 1000);
    return () => clearTimeout(timeout);
  }, [setStatus]);

  const handleChange = useCallback(
    (layer : Layer) => {
      onRxColLayer(RxColOp.Update, layer, []);
      let type;
      if (layer.content) {
        type = TRACES.UPDATE_LAYER;
      } else if (layer.cfg?.position) {
        type = TRACES.DRAG_LAYER;
      } else if (layer.cfg?.rotation) {
        type = TRACES.ROTATE_LAYER;
      } else if (layer.cfg?.scale) {
        type = TRACES.RESIZE_LAYER;
      } else {
        type = TRACES.STYLE_LAYER;
      }

      trace(type, { layerId: layer.id });
    },
    [onRxColLayer, trace],
  );

  const handleDelete = useCallback(
    (layer) => {
      onRxColLayer(RxColOp.Remove, layer, []);
      trace(TRACES.REMOVE_LAYER, { layerId: layer.id });
    },
    [onRxColLayer, trace],
  );

  const handleAddAura = useCallback(
    (layerId: string, aura: Aura) => {
      addNewAuraToLayer(layerId, aura);
    },
    [addNewAuraToLayer],
  );

  const camera = useThree(({ camera }) => camera);

  useLayoutEffect(() => {
    camera.fov = 75;
    camera.near = 0.1;
    camera.far = 1000;
    camera.updateProjectionMatrix();
  }, [camera]);

  return delayed ? null : (
    <div>
      <group visible={true} position={[0, 0, 0]}>
        {layers.map((layer) => (
          <Layer
            key={layer.id}
            id={layer.id}
            name={layer.name}
            visible={layer.visible}
            opacity={layer.opacity}
            zIndex={layer.zIndex}
            content={layer.content}
            onChange={handleChange}
            onDelete={handleDelete.bind(null, layer)}
          >
          {layer.auras.map((aura) => (
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
          <button onClick={() => handleAddAura(layer.id, { id: Date.now().toString(), type: 'NewAura', visible: true, opacity: 1, zIndex: 0, content: {} })}>
            Add Aura
          </button>
        </Layer>
      ))}
    </group>
  </div>
);
}
