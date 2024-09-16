import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useThree } from '@react-three/fiber';
import {
  faces as FaceMeshFaces,
  uvs as FaceMeshUVs,
} from 'mind-ar/src/face-target/face-geometry/face-data';
import { Matrix4, Quaternion, Vector3 } from 'three';

import { atom, useAtom } from 'jotai';

import { Html } from '@react-three/drei';
import { Controller as ImageTargetController } from './Controller';
import Webcam from 'react-webcam';
import { useUpdateAtom } from 'jotai/utils';
import useLogger from '../../hooks/useLogger';
import { PromiseRetry } from '../../utils/promise';
import useStore from '../../hooks/useStore';
import { EditorStatus } from '../editor/slice';
import { Console } from 'console';

export const anchorsAtom = atom([]);
const faceMeshesAtom = atom([]);

export const RenderingOrder = {
  object: 1,
  text: 3,
  video: 2,
  image: 1,
};

const ARProvider = forwardRef(
  (
    {
      children,
      autoplay,
      autocam,
      imageTargets,
      maxTrack,
      strictMode,
      filterMinCF = null,
      filterBeta = null,
      warmupTolerance = null,
      missTolerance = null,
    }: any,
    ref: any,
  ) => {
    const logger = useLogger('ARProvider');
    const log = (...args) => logger.debug(...args);

    const controllerRef = useRef<any>(null);
    const [isWebcamFacingUser, switchCamera] = useState(false);
    const webcamRef = useRef<any>(null);
    const [webcamReady, setWebcamReady] = useState(false);
    const [webcamOn, setWebcamOn] = useState(autocam);
    const { camera, size } = useThree<any>();
    const [anchors] = useAtom(anchorsAtom);
    const setStatus = useStore((state) => state.editorSlice.setStatus);

    // const { width, height } = size; //useWindowSize();

    // const isLandscape = useMemo(() => height <= width, [height, width]);
    // const ratio = useMemo(
    //   () => (isLandscape ? width / height : height / width),
    //   [isLandscape, width, height],
    // );

    useLayoutEffect(() => {
      camera.updateProjectionMatrix();
    }, [camera]);

    useLayoutEffect(() => {
      return () => {
        (async () => {
          await stopCamera();
          await stopTracking();
          setStatus(EditorStatus.Idle);
        })();
      };
    }, []);

    // -------------
    // CAMERA
    // -------------
    const startCamera = useCallback(async () => {
      log('startCamera');
      if (!webcamOn) {
        log('startCamera setWebcamOn');
        setWebcamOn(true);
      }

      let status;
      try {
        status = await PromiseRetry(handleStream, 10);
      } catch (error) {
        status = error;
      }

      log('camera status', status);
      return Promise.resolve(status);
    }, [webcamOn, webcamReady]);

    const handleStream = useCallback(() => {
      return new Promise((resolve, reject) => {
        log('handleStream triggred', webcamRef?.current, webcamReady);
        if (
          (webcamRef?.current && webcamReady) ||
          webcamRef?.current?.stream?.active
        ) {
          log('handleStream already active');
          setWebcamReady(true);
          return resolve(true);
        } else if (
          webcamRef?.current &&
          webcamRef.current?.video &&
          !webcamReady
        ) {
          webcamRef.current.video.onloadedmetadata = () => {
            log('handleStream loadedmetadata');
            setWebcamReady(true);
            return resolve(true);
          };
        } else {
          return reject(false);
        }
      });
    }, [webcamRef, webcamReady]);

    const stopCamera = useCallback(() => {
      setWebcamOn(false);
      setWebcamReady(false);
    }, []);

    const setCameraTrackingOn = useCallback(
      (controller) => {
        const ARprojectionMatrix = controller.getProjectionMatrix();
        camera.fov = (2 * Math.atan(1 / ARprojectionMatrix[5]) * 180) / Math.PI;
        camera.near = ARprojectionMatrix[14] / (ARprojectionMatrix[10] - 1);
        camera.far = ARprojectionMatrix[14] / (ARprojectionMatrix[10] + 1);
        // camera.aspect = ratio;
        camera.updateProjectionMatrix();
        controller.__isCamTrack = true;
      },
      [camera],
    );

    const setCameraTrackingOff = useCallback(
      (controller) => {
        camera.fov = 75;
        camera.near = 0.1;
        camera.far = 1000;
        camera.updateProjectionMatrix();
        controller.__isCamTrack = false;
      },
      [camera],
    );

    // -------------
    // TRACKING
    // -------------

    const beforeTracking = useCallback(async () => {
      log('beforeTracking');

      let status;
      try {
        status = await PromiseRetry(onBeforeTracking, 10);
      } catch (error) {
        status = error;
      }

      log('before tracking status', status);
      return Promise.resolve(status);
    }, [webcamRef, webcamReady]);

    const onBeforeTracking = useCallback(() => {
      return new Promise((resolve, reject) => {
        log('onBeforeTracking triggred', webcamRef?.current?.video);
        if (webcamRef?.current?.stream?.active) {
          log('onBeforeTracking ok');
          return resolve(true);
        } else {
          return reject(false);
        }
      });
    }, [webcamRef]);

    const startImageTracking = useCallback(async () => {
      log('startImageTracking webcamReady', webcamReady);

      if (!imageTargets || !webcamReady) {
        log('tracking check tracking not ready', imageTargets, webcamReady);
        return Promise.resolve(true);
      }

      let controller;
      if (controllerRef?.current) {
        controller = controllerRef.current;
        controller.maxTrack = maxTrack;
      } else {
        controller = new ImageTargetController({
          inputWidth: webcamRef.current.video.videoWidth,
          inputHeight: webcamRef.current.video.videoHeight,
          maxTrack,
          filterMinCF,
          filterBeta,
          missTolerance,
          warmupTolerance,
        });
      }

      controller.__isTrack = true;

      log('tracking check addImageTargets', imageTargets);

      const { dimensions: imageTargetDimensions } =
        await controller.addImageTargets(imageTargets);

      // Matrix in pixels
      const postMatrices = imageTargetDimensions.map(() => {
        /*[markerWidth, markerHeight]*/
        return new Matrix4().compose(
          new Vector3(0, 0, 0), // position
          new Quaternion(), // direction
          new Vector3(1, 1, 1), // scale
        );
      });

      let timer = undefined as any;
      let allFound = false;
      const targetIndices = new Set();
      const maxTrackIndices = Array.from({ length: maxTrack }, (_, i) => i);
      const hasIndex = (index) => targetIndices.has(index);

      controller.onUpdate = (data) => {
        if (data.type === 'updateMatrix') {
          const { targetIndex, worldMatrix } = data;
          if (!controller.__isTrack) {
            return;
          }

          anchors.forEach(
            ({ anchor, target, onAnchorFound, onAnchorLost }: any) => {
              log(
                'tracking check onupdate strictMode, imageTargets',
                strictMode,
                imageTargets,
                controller.__isCamTrack,
                anchor.visible,
              );

              if (!strictMode) {
                // Project anchors of any found marker

                if (target === targetIndex) {
                  if (
                    // !anchor.visible &&
                    worldMatrix !== null &&
                    onAnchorFound
                  ) {
                    log('tracking check onupdate onAnchorFound');
                    !controller.__isCamTrack && setCameraTrackingOn(controller);
                    onAnchorFound();
                  } else if (
                    // anchor.visible &&
                    worldMatrix === null &&
                    onAnchorLost
                  ) {
                    log('tracking check onupdate onAnchorLost');
                    controller.__isCamTrack && setCameraTrackingOff(controller);
                    onAnchorLost();
                  }

                  anchor.visible = worldMatrix !== null;

                  if (worldMatrix !== null) {
                    anchor.matrix = new Matrix4()
                      .fromArray([...worldMatrix])
                      .multiply(postMatrices[targetIndex]);
                  }
                }
              } else {
                log('strictMode targetIndex', strictMode, targetIndices);

                if (!allFound && !timer) {
                  log('timer set new timer');

                  timer = setTimeout(() => {
                    allFound = maxTrackIndices.every(hasIndex);

                    if (allFound) {
                      log('timer set check onAnchorFound');
                      setCameraTrackingOn(controller);
                      onAnchorFound();
                    } else {
                      log('timer set check onAnchorLost');
                      setCameraTrackingOff(controller);
                      onAnchorLost();
                    }

                    log(
                      'timer set check found?',
                      allFound,
                      maxTrackIndices,
                      targetIndices,
                    );

                    clearTimeout(timer);
                    timer = undefined;

                    // anchor.visible = worldMatrix !== null;
                  }, 1000);
                }

                log('timer visible', anchor.visible, worldMatrix);

                if (!targetIndices.has(targetIndex) && worldMatrix !== null) {
                  //anchor found
                  targetIndices.add(targetIndex);
                  // anchor.visible = true;

                  log(
                    'timer set check anchor found add it',
                    targetIndex,
                    targetIndices,
                  );
                } else if (
                  targetIndices.has(targetIndex) &&
                  worldMatrix === null
                ) {
                  // anchor lost
                  targetIndices.delete(targetIndex);
                  // anchor.visible = false;
                  allFound = false;

                  onAnchorLost();

                  if (timer) {
                    clearTimeout(timer);
                    timer = undefined;
                  }

                  log(
                    'timer set check anchor lost delete it',
                    targetIndex,
                    targetIndices,
                  );
                }

                anchor.visible = worldMatrix !== null;

                if (targetIndex !== 0 || !allFound) return;

                if (worldMatrix !== null) {
                  anchor.matrix = new Matrix4()
                    .fromArray([...worldMatrix])
                    .multiply(postMatrices[targetIndex]);
                }
              }
            },
          );
        }
      };

      await controller.dummyRun(webcamRef.current.video);
      controller.processVideo(webcamRef.current.video);

      controllerRef.current = controller;

      return Promise.resolve(true);
    }, [
      webcamReady,
      webcamRef,
      imageTargets,
      maxTrack,
      filterMinCF,
      filterBeta,
      missTolerance,
      warmupTolerance,
      strictMode,
      camera,
      anchors,
    ]);

    const stopTracking = useCallback(() => {
      if (controllerRef.current) {
        log('stopTracking stopProcessVideo');
        controllerRef.current.stopProcessVideo();
        setCameraTrackingOff(controllerRef.current);
        controllerRef.current.__isTrack = false;

        anchors.forEach(({ anchor }: any) => {
          anchor.visible = false;
        });
      }
    }, [controllerRef, anchors]);

    const getScreenshot = useCallback(() => {
      return webcamRef?.current?.getScreenshot();
    }, [webcamRef]);

    useImperativeHandle(
      ref,
      () => ({
        beforeTracking,
        stopTracking,
        startImageTracking,
        startCamera,
        stopCamera,
        switchCamera: () => {
          const wasTracking =
            controllerRef.current && controllerRef.current.processingVideo;
          wasTracking && stopTracking();
          setWebcamReady(false);
          switchCamera((isWebcamFacingUser) => !isWebcamFacingUser);
          wasTracking && startImageTracking();
        },
        getScreenshot,
      }),
      [
        beforeTracking,
        startImageTracking,
        stopTracking,
        startCamera,
        stopCamera,
        getScreenshot,
      ],
    );

    useEffect(() => {
      if (webcamReady && autoplay) {
        startImageTracking();
      }
    }, [autoplay, webcamReady, startImageTracking]);

    return (
      <>
        <Html
          // fullscreen
          zIndexRange={[-1, -1]}
          calculatePosition={() => [0, 0]}
          style={{
            // top: 0,
            // left: 0,
            width: size.width,
            height: size.height,
          }}
          className='webcam'
          wrapperClass='webcam'>
          {webcamOn && (
            <Webcam
              ref={webcamRef}
              // onUserMedia={handleStream}
              width={size.width}
              height={size.height}
              style={{
                width: size.width,
                height: size.height,
                objectFit: 'cover',
              }}
              videoConstraints={{
                facingMode: isWebcamFacingUser ? 'user' : 'environment',
                // aspectRatio: ratio,
              }}
              screenshotQuality={1}
              screenshotFormat='image/jpeg'
            />
          )}
        </Html>
        {children}
      </>
    );
  },
);

const ARView = forwardRef(
  (
    {
      children,
      autoplay = true,
      autocam = false,
      imageTargets,
      maxTrack = 1,
      strictMode = false,
      filterMinCF,
      filterBeta,
      warmupTolerance,
      missTolerance /*,...rest*/,
    }: any,
    ref: any,
  ) => {
    const ARRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      beforeTracking: () => ARRef?.current?.beforeTracking(),
      startImageTracking: () => ARRef?.current?.startImageTracking(),
      stopTracking: () => ARRef?.current?.stopTracking(),
      switchCamera: () => ARRef?.current?.switchCamera(),
      startCamera: () => ARRef?.current?.startCamera(),
      stopCamera: () => ARRef?.current?.stopCamera(),
      getScreenshot: () => ARRef?.current?.getScreenshot(),
    }));

    return (
      <ARProvider
        {...{
          autoplay,
          autocam,
          imageTargets,
          maxTrack,
          strictMode,
          filterMinCF,
          filterBeta,
          warmupTolerance,
          missTolerance,
        }}
        ref={ARRef}>
        {children}
      </ARProvider>
    );
  },
);

const ARAnchor = ({
  children,
  target = 0,
  onAnchorFound,
  onAnchorLost,
  ...rest
}: any) => {
  const ref = useRef<any>();
  const setAnchors: any = useUpdateAtom(anchorsAtom);

  useEffect(() => {
    if (ref.current) {
      setAnchors((anchors: any[]) => {
        if (target === 0) anchors = [];

        const newAnchor = {
          target,
          anchor: ref.current,
          onAnchorFound,
          onAnchorLost,
        };
        const anchorSet = new Set([...anchors, newAnchor]);
        return Array.from(anchorSet);
      });
    }
  }, [ref, setAnchors, target, onAnchorFound, onAnchorLost]);

  return (
    <group
      ref={ref}
      visible={false}
      matrixAutoUpdate={false}
      {...rest}>
      {children}
    </group>
  );
};

const ARFaceMesh = ({ children, onFaceFound, onFaceLost, ...rest }: any) => {
  const ref = useRef<any>();
  const setFaceMeshes: any = useUpdateAtom(faceMeshesAtom);

  const [positions, uvs, indexes] = useMemo(() => {
    const positions = new Float32Array(FaceMeshUVs.length * 3);
    const uvs = new Float32Array(FaceMeshUVs.length * 2);
    const indexes = new Uint32Array(FaceMeshFaces);
    for (let i = 0; i < FaceMeshUVs.length; i++) {
      uvs[i * 2] = FaceMeshUVs[i][0];
      uvs[i * 2 + 1] = FaceMeshUVs[i][1];
    }

    return [positions, uvs, indexes];
  }, []);

  useEffect(() => {
    if (ref.current)
      setFaceMeshes((/*faceMeshes: any*/) => [
        // ...faceMeshes,
        { anchor: ref.current, onFaceFound, onFaceLost },
      ]);
  }, [ref, setFaceMeshes, onFaceFound, onFaceLost]);

  return (
    <mesh
      ref={ref}
      visible={false}
      matrixAutoUpdate={false}
      {...rest}>
      <bufferGeometry attach='geometry'>
        <bufferAttribute
          attach='index'
          array={indexes}
          count={indexes.length}
          itemSize={1}
        />
        <bufferAttribute
          // @ts-ignore
          attachObject={['attributes', 'position']}
          count={positions.length / 3}
          itemSize={3}
          array={positions}
        />

        <bufferAttribute
          // @ts-ignore
          attachObject={['attributes', 'uv']}
          count={uvs.length / 2}
          itemSize={2}
          array={uvs}
        />
      </bufferGeometry>
      {children}
    </mesh>
  );
};

export { ARView, ARAnchor, ARFaceMesh };
