import { useCallback } from 'react';
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker';

import useLogger from '../hooks/useLogger';
import useStore from './useStore';
import { useActivity } from './useActivity';
import { ActivityDocType, RxColOp } from '../db/types';
import { calcAspect } from './useAspect';

import { useTrace } from './useTrace';
import { TRACES } from '../db/traces';
import { compile, stats } from '../features/compiler/compile';
import { fill } from '@tensorflow/tfjs';

const createWorker = createWorkerFactory(
  () => import('../features/markerUpload/compiler'),
);

export function useMkUpload({
  activityId,
}: {
  activityId: string | undefined;
}) {
  const log = useLogger('useMkUpload');

  log.debug('Render');

  const { trace } = useTrace({});

  const worker = useWorker(createWorker);

  const { onRxColActivity } = useActivity();

  const compiling = useStore((state) => state.mkUploadSlice.compiling);
  const cropping = useStore((state) => state.mkUploadSlice.cropping);
  const markerCfg = useStore((state) => state.mkUploadSlice.markerCfg);
  const setMarkerCfg = useStore((state) => state.mkUploadSlice.setMarkerCfg);
  const setCompiling = useStore((state) => state.mkUploadSlice.setCompiling);

  const activity = useStore((state) =>
    state.activitySlice.activities.find((a) => a.id === activityId),
  ) as ActivityDocType;

  const compileMarker = useCallback(() => {
    const images = activity?.markerImages;

    log.debug('compiling markerImages', images);

    return new Promise<{}>((resolve ) => {
      if (images?.length !== 0) {
        (async () => {
          const { blob, files, imagesBase64, imagesCfg, statsArray } = await compile({
            fileList: images,
            compress: true,
          });
          log.debug('compiling results', blob, images, imagesBase64, imagesCfg, statsArray);

          const { newWidth, newHeight } = calcAspect({
            width: imagesCfg?.[0]?.worldWidth,
            height: imagesCfg?.[0]?.worldHeight,
            maxWidth: (2 * markerCfg?.size?.width || 0) / 3,
            maxHeight: (2 * markerCfg?.size?.height || 0) / 3,
          });

          
          setMarkerCfg({
            marker: {
              width: newWidth,
              height: newHeight,
              widthRatio: imagesCfg?.[0]?.worldWidth / newWidth,
              heightRatio: imagesCfg?.[0]?.worldHeight / newHeight,
            },
          });

          onRxColActivity(RxColOp.UpdateMarker, {
            id: activityId,
            markerFile: blob,
            markerImages: files,
            markerImagesBase64: imagesBase64,
            markerImagesCfg: imagesCfg,
          });

          trace(TRACES.ADD_MARKER);
          if(stats !== undefined)
          {
            //return resolve({fill : stats?.fill, unique : stats?.unique, dimensions : stats?.dimensions, resultImage:stats?.resultImage});
            return resolve(statsArray);
          }
          else
          {
            //return resolve({fill : 0, unique : 0, dimensions : 0, resultImage: new Image()});
            return resolve(statsArray);
          }

        })();
      } else {
        return resolve(stats);
      }
    });
  }, [activity]);

  const onChange = ({ markerImages, markerFile, imagesCfg }) => {
    log.debug('onChange', markerImages, markerFile, imagesCfg);

    onRxColActivity(RxColOp.RemoveMarker, {
      id: activityId,
      markerFile: null,
      markerImages: markerImages,
      markerImagesCfg: imagesCfg,
    });

    trace(TRACES.REMOVE_MARKER);
  };

  return {
    onChange,
    compiling,
    cropping,
    markerCfg,
    compileMarker,
    setCompiling,
  };
}

