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
import type { Layer as LayerType } from '../features/layers/slice';
import { Aura } from '../aura/Aura';
import { useAura } from '../../hooks/useAura';
import { AuraMode } from './Board';


/**
 * Component responsible for rendering and managing layers and auras within a canvas.
 *
 * @param {Object} props - The component props.
 * @param {React.RefObject<HTMLCanvasElement>} props.canvasRef - Reference to the canvas element.
 * @param {string} props.activityId - The ID of the current activity.
 * @param {Object} props.activity - The activity object containing activity details.
 * @param {Object} [props.meta={}] - Metadata for the component, including optional `auraKey` and `layerKey`.
 *
 * @returns {JSX.Element | null} The rendered component or null if delayed.
 *
 * @example
 * <LayerMake
 *   canvasRef={canvasRef}
 *   activityId="activity123"
 *   activity={activity}
 *   meta={{ auraKey: "aura123", layerKey: "layer123" }}
 * />
 *
 * @remarks
 * This component uses several hooks:
 * - `useLogger` for logging.
 * - `useLayer` and `useAura` for layer and aura management.
 * - `useStore` for accessing the global state.
 * - `useLayoutEffect` for setting the editor status and configuring the camera.
 * - `useCallback` for memoizing event handlers.
 *
 * The component filters layers and auras based on the provided `activityId` and metadata keys.
 * It also sets up a delayed rendering mechanism to avoid initial rendering issues.
 *
 * The `handleAddAura`, `handleChange`, and `handleDelete` functions manage the addition, update, and deletion of layers and auras.
 *
 * The camera configuration is updated within a `useLayoutEffect` hook to set the field of view, near, and far clipping planes.
 */
export function LayerMake({ canvasRef, activityId, activity, meta = {} }: any) {
  const log = useLogger('LayerMake');
  log.debug('Render');

  const { onRxColLayer, addNewLayer, addNewAuraToLayer } = useLayer();
  
  const { onRxColAura } = useAura();
  const { auraKey = undefined } = meta;


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

  let auras = useStore(
    (state) =>
      state.auraSlice.auras?.filter((aura) => aura.activityId === activityId),
    (a1, a2) =>
      isEqualWith(a1, a2, (a1v, a2v) => a1v.id === a2v.id) &&
      a1.length === a2.length,
  );  

  const setStatus = useStore((state) => state.editorSlice.setStatus);

  layers = layers.filter((layer) => layer?.meta?.layerKey === layerKey);
  auras = auras.filter((aura) => aura?.meta?.auraKey === auraKey);

  useLayoutEffect(() => {
    setStatus(EditorStatus.LayerMake);
    const timeout = setTimeout(() => setDelayed(false), 1000);
    return () => clearTimeout(timeout);
  }, [setStatus]);
  const handleAddAura = (selectedLayer: LayerType, p0: { id: string; type: string; visible: boolean; opacity: number; zIndex: number; content: {}; }) => {
    if (selectedLayer) {
      const newAura = {
        id: Date.now().toString(),
        type: 'AText',
        content: { value: 'New Aura' },
      };
      addNewAuraToLayer(selectedLayer, newAura);
      onRxColAura('Add', newAura, []); 
    }
  };
  
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

  const camera = useThree(({ camera }) => camera);

  useLayoutEffect(() => {
    camera.fov = 75;
    camera.near = 0.1;
    camera.far = 1000;
    camera.updateProjectionMatrix();
  }, [camera]);

  return delayed ? null : (
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
);
}
