/* eslint-disable prefer-const */
import React, {
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useLayoutEffect,
} from 'react';
import { Html } from '@react-three/drei';
import { useSpring, animated, useSpringRef } from 'react-spring';
import Icon, {
  CheckOutlined,
  QuestionOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { ScanSvg } from '../../components/ScanSvg';
import * as msgpack from '@msgpack/msgpack';
import { Button, Drawer, message, Space, Typography } from 'antd';

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BuildOutlined,
} from '@ant-design/icons';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import useStore from '../../hooks/useStore';
import useLogger from '../../hooks/useLogger';
import Spinner3f from '../../components/Spinner';
import { Aura } from '../aura/Aura';
import { ARAnchor, ARView } from '../arview';
import { useRequestLocalStream } from '../arview/utils';
import { EditorStatus } from './slice';
import { AuraMode } from './Board';
// import { useAuraScan } from '../../hooks/useAuraScan';
import { ActivityDocType, RxColOp } from '../../db/types';

import { ActivityType } from '../activity/ActivityType';
import GroupThumbnail from '../activity/GroupThumbnail';
import { useAura } from '../../hooks';

import { useTranslation } from 'react-i18next';
import { FloatButton } from 'antd/lib';
import { describeImage } from '@/AIServer/Api';
import { isValueNode } from 'graphql';
import { decode } from 'punycode';

let urlFile;

export const AuraPlay = forwardRef(
  ({ canvasRef, activityId, meta = {} }: any, ref: any) => {
    const log = useLogger('AuraPlay');

    const arRef = useRef<any>();

    const get = useStore((state) => state.activitySlice.get);
    const isFullScreen = useStore((state) => state.playerSlice.isFullScreen);
    const activity = get(activityId);

    // const arStatus = useStore((state) => state.editorSlice.arStatus);
    const setArStatus = useStore((state) => state.editorSlice.setArStatus);
    const setStatus = useStore((state) => state.editorSlice.setStatus);

    const beforeTracking = () => arRef?.current?.beforeTracking();
    const startImageTracking = () => arRef?.current?.startImageTracking();
    const startTracking = () => arRef?.current?.startImageTracking();
    const startCamera = () => arRef?.current?.startCamera();
    const stopTracking = () => arRef.current.stopTracking();
    const stopCamera = () => arRef.current.stopCamera();
    const switchCamera = () => arRef?.current?.switchCamera();
    const setAnchoring = useStore((state) => state.editorSlice.setAnchoring);

    const { t } = useTranslation();

    const requestStream = useRequestLocalStream();

    useEffect(() => {
      setStatus(EditorStatus.AuraPlay);
    }, []);

    useEffect(() => {
      (async () => {
        if (isFullScreen) {
          await stopTracking();
          await stopCamera();
          setAnchoring(false);
        } else {
          startAR();
        }
      })();
    }, [isFullScreen]);

    const startAR = useCallback(async () => {
      setArStatus(t('common.loading-camera'));
      await requestStream(message);

      const cameraReady = await startCamera();
      log.debug('camera ready ', cameraReady);

      setArStatus(t('common.loading-object-detection'));

      setTimeout(async () => {
        const canTracking = await beforeTracking();
        log.debug('before tracking ', canTracking);

        setTimeout(async () => {
          setArStatus(t('common.loading-ar'));
          const trackingReady = await startTracking();
          log.debug('tracking ready', trackingReady);
          setArStatus('tracking');

          setStatus(EditorStatus.Tracking);

          return Promise.resolve(true);
        }, 500);
      }, 500);
    }, []);

    const stopAR = useCallback(() => {
      setArStatus('');
      setStatus(EditorStatus.Idle);
    }, []);

    useImperativeHandle(ref, () => ({ switchCamera }), [switchCamera]);

    useEffect(() => {
      (async () => {
        log.debug('=== startAR');
        await startAR();
      })();

      return () => {
        log.debug('=== stopAR');
        stopAR();
      };
    }, [stopAR, startAR]);

    let ARViewComponent;
    let activities = new Array<Partial<ActivityDocType>>();
    activity?.comboIds?.map((id) => activities.push(get(id)));
    //AddMarker(activities);

    switch (activity.type) {
      case ActivityType.Path:
      case ActivityType.Group: {
        ARViewComponent = (
          <GroupARView
            activityId={activityId}
            activity={activity}
            meta={meta}
            canvasRef={canvasRef}
            arRef={arRef}
          />
        );
        break;
      }
      case ActivityType.SmartGroup: {
        ARViewComponent = (
          <ActivitiesARView
            activitiesId={activity?.comboIds}
            activities={activities}
            meta={meta}
            canvasRef={canvasRef}
            arRef={arRef}
          />
        );
        break;
      }

      default:
        ARViewComponent = (
          <ActivityARView
            activityId={activityId}
            activity={activity}
            meta={meta}
            canvasRef={canvasRef}
            arRef={arRef}
          />
        );
        break;
    }

    return ARViewComponent;
  },
);

function ActivityARView({
  activityId,
  activity,
  meta,
  canvasRef,
  arRef,
}: {
  activityId: string;
  activity: Partial<ActivityDocType> | undefined;
  canvasRef: any;
  arRef: any;
  meta: Record<string, any>;
}) {
  const log = useLogger('ActivityARView');

  const [url, setUrl] = useState<string | undefined>(undefined);

  const arStatus = useStore((state) => state.editorSlice.arStatus);
  const anchoring = useStore((state) => state.editorSlice.anchoring);
  const isAI = useStore((state) => state.playerSlice.isAI);
  const setAnchoring = useStore((state) => state.editorSlice.setAnchoring);
  const getScreenshot = () => arRef?.current?.getScreenshot();
  const [textResponse, setTextResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Add loading state
  const isFullScreen = useStore((state) => state.playerSlice.isFullScreen);
  const { t } = useTranslation();

  const { strictMode = false, maxTrack = 1 } = meta;
  // const { AuraScan } = useAuraScan({ activity });

  useEffect(() => {
    if (
      !activity?.markerFile ||
      !(
        activity.markerFile instanceof Blob ||
        activity.markerFile instanceof File
      )
    ) {
      log.warn(t('common.marker-retry'));
      return;
    }

    const urlCreator = window.URL || window.webkitURL;

    const objectUrl = urlCreator.createObjectURL(activity.markerFile);
    setUrl(objectUrl);

    setTimeout(() => {
      log.debug('=== startImageTracking ', objectUrl);
      arRef?.current?.startImageTracking();
    }, 1000);

    return () => {
      log.debug('=== stopTracking ', objectUrl);

      arRef?.current?.stopTracking();
      setAnchoring(false);

      urlCreator.revokeObjectURL(objectUrl);
    };
  }, [activity, arRef]);

  log.debug('Render', activity, meta, url);

  return (
    <>
      <Html
        style={{
          display: 'flex',
          position: 'absolute',
          bottom: 24,
          right: 24,
        }}>
        {isAI && (
          <FloatButton.Group
            trigger='click'
            type='primary'
            css={{
              position: 'absolute',
              right: '-50vw',
              top: '5vw',
            }}
            icon={<RobotOutlined />}>
            {/* <FloatButton
            icon={<QuestionOutlined />}
            onClick={() => {
              setLoading(true); // Add loading state
              ///prendre une image---
              console.log('GPT: take ScreenShot', arRef?.current);

              const image = getScreenshot();
              console.log('GPT: ScreenShot', image);

              //envoyer l'image avec un prompt
              const prompt =
                // 'Est ce que le tag (étiquette) est correctement positionné sur la carte?';
                //'This is the map of the tectonics plates. Is the position of the tags correct on the map. Just validate if its correct or not ';
                //'Is the tag correctly placed on the map?';
                //'read the highlighted question and the Response format and answear.';
                'this is an association game. Analyse the scene then answer the question very concisely. some tags can be messing.';
              //do not provide the solution just the validation
              //generer le text
              const completion = await describeImage(prompt, [image]);
              console.log('GPT: ScreenShot Response', completion);

              setTextResponse(completion.choices[0].message.content || '');
              setLoading(false); // Add loading state
            }}
          /> */}
            <FloatButton
              icon={<CheckOutlined />}
              onClick={async () => {
                setLoading(true); // Add loading state
                ///prendre une image---
                console.log('GPT: take ScreenShot', arRef?.current);

                const image = getScreenshot();
                console.log('GPT: ScreenShot', image);

                //envoyer l'image avec un prompt
                const prompt =
                  // 'Est ce que le tag (étiquette) est correctement positionné sur la carte?';
                  //'This is the map of the tectonics plates. Is the position of the tags correct on the map. Just validate if its correct or not ';
                  //'Is the tag correctly placed on the map?';
                  //'read the highlighted question and the Response format and answear.';
                  'this is an association game. Analyse the scene then answer the question very concisely. some tags can be messing. A';
                //do not provide the solution just the validation
                //generer le text
                const completion = await describeImage(prompt, [image]);
                console.log('GPT: ScreenShot Response', completion);

                setTextResponse(completion.choices[0].message.content || '');
                setLoading(false); // Add loading state

                //recevoir la reponse text

                // ajouter le text en canvas

                //mettre un button ajouter un audio pour avoir ecouter la reponse en audio

                //recevoir la reponse audio
              }}
            />
          </FloatButton.Group>
        )}
      </Html>
      {loading && <Spinner3f tip='Loading...' />}
      {textResponse && (
        <Html
          center
          style={{
            position: 'fixed',
            width: '40vw',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000, // Ensure it appears above other elements
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}>
          <div>{textResponse}</div>
        </Html>
      )}

      <ARView
        ref={arRef}
        autoplay={false}
        autocam={false}
        imageTargets={url}
        // filterMinCF={0}
        // filterBeta={10000}
        // warmupTolerance={1}
        // missTolerance={10}
        maxTrack={maxTrack}
        strictMode={strictMode}>
        <ARAnchor
          target={0}
          onAnchorFound={() => {
            setAnchoring(true);
          }}
          onAnchorLost={() => {
            setAnchoring(false);
          }}>
          <AuraList
            canvasRef={canvasRef}
            activity={activity}
            activityId={activityId}
            anchoring={anchoring}
            meta={meta}
            mode={AuraMode.ARVIEW}
          />
        </ARAnchor>
      </ARView>

      <NonAnchoringARView
        canvasRef={canvasRef}
        activity={activity}
        activityId={activityId}
        anchoring={false}
        meta={meta}
        mode={AuraMode.ARCANVAS}
      />

      {!anchoring && !isFullScreen && <AuraScan activity={activity} />}
      {arStatus !== 'tracking' && (
        <>{arStatus !== 'idle' && <Spinner3f tip={arStatus} />}</>
      )}
    </>
  );
}

function ActivitiesARView({
  activitiesId,
  activities,
  meta,
  canvasRef,
  arRef,
}: {
  activitiesId: string[] | undefined;
  activities: Partial<ActivityDocType>[] | undefined;
  canvasRef: any;
  arRef: any;
  meta: Record<string, any>;
}) {
  function decodeMsgPack(buffer: Uint8Array) {
    return msgpack.decode(new Uint8Array(buffer));
  }

  async function decodeMind(markerFile) {
    if (markerFile != undefined) {
      const arrayBuffer = await markerFile.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      return decodeMsgPack(buffer);
    }
  }

  async function AddMarker(activities) {
    let data: any = { dataList: [] };
    console.log('DATA', data);

    for (let i = 0; i < activities.length; i++) {
      let imageData: any;
      imageData = await decodeMind(activities[i].markerFile);
      console.log('IMAGEDATA', imageData);
      const newItem = {
        targetImage: {
          width: imageData.dataList[0].targetImage.width,
          height: imageData.dataList[0].targetImage.height,
        },
        trackingData: imageData.dataList[0].trackingData,
        matchingData: imageData.dataList[0].matchingData,
      };

      data.dataList.push(newItem);
    }

    const dataList = data.dataList;
    console.log('DATA 2', data.dataList);
    meta.maxTrack = Object.keys(dataList).length;

    const buffer = msgpack.encode({
      v: 2,
      dataList,
    });

    const blob = new Blob([buffer], { type: 'text/plain' });

    const urlCreator = window.URL || window.webkitURL;
    urlFile = urlCreator.createObjectURL(blob);
    setUrl(urlFile);
  }
  const log = useLogger('ActivitiesARView');
  const { onRxColAura } = useAura();

  const [url, setUrl] = useState<string | undefined>(undefined);

  const arStatus = useStore((state) => state.editorSlice.arStatus);
  const anchoring = useStore((state) => state.editorSlice.anchoring);
  const setAnchoring = useStore((state) => state.editorSlice.setAnchoring);

  const get = useStore((state) => state.activitySlice.get);

  const { t } = useTranslation();

  const { strictMode = false, maxTrack = 1 } = meta;
  // const { AuraScan } = useAuraScan({ activity });

  const setActivityAuras = useCallback(
    (activityId, activitiesId) => {
      onRxColAura(
        RxColOp.FindAll,
        {
          selector: {
            activityId,
          },
        } as any,
        activitiesId,
      );
    },
    [onRxColAura, get],
  );

  const setActivitiesAuras = useCallback(
    (activityId, activitiesId) => {
      onRxColAura(
        RxColOp.FindAllActivities,
        {
          selector: {
            activityId,
          },
        } as any,
        activitiesId,
      );
    },
    [onRxColAura, get],
  );

  // const ActivitiesAura = activitiesId?.map((activityid) =>
  //   setActivityAuras(activityid),
  // );
  //console.log('ACTIVITY AURA', ActivitiesAura);
  if (activitiesId) setActivitiesAuras(activitiesId[0], activitiesId);

  useEffect(() => {
    AddMarker(activities);
  }, []);

  useEffect(() => {
    activities?.map((element) => {
      if (
        !element?.markerFile ||
        !(
          element.markerFile instanceof Blob ||
          element.markerFile instanceof File
        )
      ) {
        log.warn(t('common.marker-retry', element));
        return;
      }
    });

    setTimeout(() => {
      log.debug('=== startImageTracking ', url);
      arRef?.current?.startImageTracking();
    }, 1000);

    return () => {
      log.debug('=== stopTracking ', url);

      arRef?.current?.stopTracking();
      setAnchoring(false);
    };
  }, [url, arRef]);

  log.debug('Render', activities, meta, url);

  return (
    <>
      <ARView
        ref={arRef}
        autoplay={false}
        autocam={false}
        imageTargets={url}
        // filterMinCF={0}
        // filterBeta={10000}
        // warmupTolerance={1}
        // missTolerance={10}
        maxTrack={meta.maxTrack}
        // IF TRUE, REQUIRE ALL MARKER TO BE VISIBLE TO DISPLAY AUGMENT
        strictMode={strictMode}>
        {activities?.map((activity, index) => {
          return (
            <ARAnchor
              target={index}
              onAnchorFound={() => {
                setAnchoring(true);
              }}
              onAnchorLost={() => {
                setAnchoring(false);
              }}>
              <AuraList
                canvasRef={canvasRef}
                activity={activity}
                activityId={activity.id}
                anchoring={anchoring}
                meta={meta}
                mode={AuraMode.ARVIEW}
              />
            </ARAnchor>
          );
        })}
      </ARView>

      {/* <NonAnchoringARView
        canvasRef={canvasRef}
        activity={activity}
        activityId={activityId}
        anchoring={false}
        meta={meta}
        mode={AuraMode.ARCANVAS}
      /> */}

      {!anchoring && <AuraMultiScan activities={activities} />}

      {arStatus !== 'tracking' && (
        <>{arStatus !== 'idle' && <Spinner3f tip={arStatus} />}</>
      )}
    </>
  );
}

function NonAnchoringARView({
  canvasRef,
  activityId,
  activity,
  meta,
  mode,
}: any) {
  const anchoring = useStore((state) => state.editorSlice.anchoring);
  const { timer = null, includesNonAnchoring = {} } = meta;
  const { auraKey } = includesNonAnchoring;
  const [up, setUp] = useState(false);

  const handleTimerReset = () => {
    if (!anchoring) {
      setUp(true);
    }
  };

  useEffect(() => {
    if (!anchoring) {
      setUp(false);
    }
  }, [anchoring]);

  return (
    <>
      {timer && !anchoring && (
        <Html
          // center
          zIndexRange={[99999777999, 99999777999]}
          wrapperClass='fullScreenTopLeft'
          css={{
            top: 2,
            left: 2,
            // width: 30,
            // height: 30,
          }}
          className='timerrrr'>
          <Timer
            timer={timer}
            onReset={handleTimerReset}
          />
        </Html>
      )}

      {timer && up && !anchoring && (
        <group>
          <AuraList
            position={[0, 0, 0]}
            canvasRef={canvasRef}
            activity={activity}
            activityId={activityId}
            anchoring={false}
            meta={{ auraKey }}
            mode={mode}
          />
        </group>
      )}
    </>
  );
}

function Timer({ timer, onReset }: any) {
  const [activeIndex] = useState(0);
  const springApi = useSpringRef();

  const springs = useSpring({
    from: {
      strokeDashoffset: 120,
    },
    to: {
      strokeDashoffset: 0,
    },
    config: {
      duration: timer * 1000,
    },
    loop: true,
    ref: springApi,
    onRest: onReset,
  });

  useLayoutEffect(() => {
    springApi.start();
  }, [activeIndex]);

  return (
    <div
      css={{
        background: '#fff',
        borderRadius: '50%',
        width: 41,
        height: 41,
        display: 'flex',
        alignItems: 'center',
      }}>
      <animated.svg
        width='40'
        height='40'
        viewBox='0 0 40 40'
        fill='none'
        stroke='var(--primary-color)'
        strokeDasharray={120}
        strokeDashoffset={120}
        strokeWidth={4}
        style={springs}>
        <path d='M19.9999 38.5001C17.5704 38.5001 15.1648 38.0216 12.9203 37.0919C10.6758 36.1622 8.63633 34.7995 6.91845 33.0816C5.20058 31.3638 3.83788 29.3243 2.90817 27.0798C1.97846 24.8353 1.49995 22.4296 1.49995 20.0002C1.49995 17.5707 1.97846 15.1651 2.90817 12.9206C3.83788 10.6761 5.20058 8.63663 6.91846 6.91875C8.63634 5.20087 10.6758 3.83818 12.9203 2.90847C15.1648 1.97876 17.5705 1.50024 19.9999 1.50024C22.4293 1.50024 24.835 1.97876 27.0795 2.90847C29.324 3.83818 31.3635 5.20088 33.0813 6.91876C34.7992 8.63663 36.1619 10.6761 37.0916 12.9206C38.0213 15.1651 38.4998 17.5707 38.4998 20.0002C38.4998 22.4296 38.0213 24.8353 37.0916 27.0798C36.1619 29.3243 34.7992 31.3638 33.0813 33.0816C31.3635 34.7995 29.324 36.1622 27.0795 37.0919C24.835 38.0216 22.4293 38.5001 19.9999 38.5001L19.9999 38.5001Z' />
      </animated.svg>
    </div>
  );
}

function GroupARView({
  activity,
  meta,
  canvasRef,
  arRef,
}: {
  activityId: string;
  activity: Partial<ActivityDocType>;
  canvasRef: any;
  arRef: any;
  meta: Record<string, any>;
}) {
  const comboIds = activity?.comboIds || [];

  const setAnchoring = useStore((state) => state.editorSlice.setAnchoring);
  const [current, setCurrent] = useState(0);
  const [groupActivity, setGroupActivity] =
    useState<Partial<ActivityDocType>>();

  const [openDrawer, setOpenDrawer] = useState(false);
  const { onRxColAura } = useAura();

  const get = useStore((state) => state.activitySlice.get);

  useLayoutEffect(() => {
    setGroupActivity(get(comboIds[0]));

    onRxColAura(
      RxColOp.FindAll,
      {
        selector: {
          activityId: comboIds[0],
        },
      } as any,
      [],
    );
  }, [onRxColAura, get]);

  const setActivityAuras = useCallback(
    (activityId) => {
      setGroupActivity(get(activityId));

      onRxColAura(
        RxColOp.FindAll,
        {
          selector: {
            activityId,
          },
        } as any,
        [],
      );
    },
    [onRxColAura, get],
  );

  const next = () => {
    arRef?.current?.stopTracking();
    setAnchoring(false);
    const index = current < comboIds.length ? current + 1 : comboIds.length;
    setCurrent(index);
    setActivityAuras(comboIds[index]);
    onRxColAura(
      RxColOp.FindAll,
      {
        selector: {
          activityId: comboIds[index],
        },
      } as any,
      [],
    );
    setGroupActivity(get(comboIds[index]));
  };

  const prev = () => {
    arRef?.current?.stopTracking();
    setAnchoring(false);
    const index = current > 0 ? current - 1 : 0;
    setCurrent(index);
    setActivityAuras(comboIds[index]);
    onRxColAura(
      RxColOp.FindAll,
      {
        selector: {
          activityId: comboIds[index],
        },
      } as any,
      [],
    );
    setGroupActivity(get(comboIds[index]));
  };

  const showDrawer = () => {
    setOpenDrawer(true);
  };

  const closeDrawer = () => {
    setOpenDrawer(false);
  };

  switch (groupActivity?.type) {
    case ActivityType.Validation:
      meta = {
        ...meta,
        timer: 15,
        includesNonAnchoring: {
          enabled: true,
          auraKey: 'missedValidation',
        },
      } as any;
      break;
    case ActivityType.Association:
      meta = {
        ...meta,
        strictMode: true,
        maxTrack: 2,
      } as any;
      break;

    default:
      break;
  }

  return (
    <>
      <ActivityARView
        activityId={comboIds[current]}
        activity={groupActivity}
        meta={meta}
        canvasRef={canvasRef}
        arRef={arRef}
      />

      <Html
        center
        zIndexRange={[99999999999, 99999999999]}
        wrapperClass='fullScreenBottomRight'
        css={{
          bottom: 0,
          right: 0,
        }}>
        <Drawer
          title={activity?.title}
          css={{
            zIndex: 99999999999,
          }}
          width={'70vw'}
          placement='right'
          onClose={closeDrawer}
          open={openDrawer}>
          <GroupThumbnail
            activity={activity}
            activeIndex={current}
            onCoverClick={(index) => {
              setCurrent(index);
              setActivityAuras(comboIds[index]);
            }}
          />
        </Drawer>
        {!openDrawer && (
          <Space
            direction='horizontal'
            css={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              transform: 'translate(-180px, -2px)',
            }}>
            <Button
              size='large'
              shape='round'
              type='primary'
              icon={<ArrowLeftOutlined />}
              disabled={current === 0}
              onClick={() => {
                prev();
              }}
            />

            <Button
              size='large'
              shape='round'
              type='primary'
              icon={<ArrowRightOutlined />}
              disabled={current === comboIds?.length - 1}
              onClick={() => {
                next();
              }}></Button>
            <Button
              size='large'
              shape='circle'
              icon={<BuildOutlined />}
              onClick={showDrawer}
            />
          </Space>
        )}
      </Html>
    </>
  );
}

function AuraMultiScan({ activities }: any) {
  /*const markerPreview =
    activity?.markerImages?.[0] && activity.type === ActivityType.Augmentation
      ? ((
        <img
          css={{
            height: 96,
            objectFit: 'cover',
            border: '1px solid #eee',
          }}
          alt='Marqueur'
          src={activity?.markerImages[0]}
        />
      ) as any)
      : null;*/

  const markerPreview = activities.map((activity) =>
    activity?.markerImages?.[0] && activity.type === ActivityType.Augmentation
      ? ((
          <img
            css={{
              height: 96,
              objectFit: 'cover',
              border: '1px solid #eee',
            }}
            alt='Marqueur'
            src={activity?.markerImages[0]}
          />
        ) as any)
      : null,
  );

  const { t } = useTranslation();

  return (
    <Html
      center
      zIndexRange={[99999777999, 99999777999]}
      css={
        {
          // width: size.width,
          // height: size.height,
        }
      }
      className='scan'>
      <Typography.Text
        css={{
          zIndex: 99999777999,
          display: 'flex',
          position: 'absolute',
          top: 18,
          left: '50%',
          transform: 'translate(-50%, 50%)',
          fontSize: '1rem',
          padding: '0px 8px',
          background: '#fff',
          textAlign: 'center',
          borderRadius: 8,
        }}>
        {t('common.place-image-instruction')}
      </Typography.Text>

      <Space
        direction='vertical'
        align='center'
        size={[0, 0]}
        css={{
          zIndex: 99999777999,
          width: '100%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, 4px)',
        }}>
        <Typography.Paragraph
          css={{
            padding: '0px 8px',
            fontSize: '1rem',
            background: '#fff',
            textAlign: 'center',
            borderRadius: 8,
          }}>
          {/*activity?.instruction || activity?.title || activity?.description*/}
        </Typography.Paragraph>
        {markerPreview}
      </Space>
      <Icon
        component={ScanSvg}
        css={{
          zIndex: 99999777999,
          fontSize: 200 * 0.75,
          color: '#eee',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.8,
        }}
      />
    </Html>
  );
}

function AuraScan({ activity }: any) {
  const markerPreview =
    activity?.markerImages?.[0] && activity.type === ActivityType.Augmentation
      ? ((
          <img
            css={{
              height: 96,
              objectFit: 'cover',
              border: '1px solid #eee',
            }}
            alt='Marqueur'
            src={activity?.markerImages[0]}
          />
        ) as any)
      : null;

  const { t } = useTranslation();

  return (
    <Html
      center
      zIndexRange={[99999777999, 99999777999]}
      css={
        {
          // width: size.width,
          // height: size.height,
        }
      }
      className='scan'>
      <Typography.Text
        css={{
          zIndex: 99999777999,
          display: 'flex',
          position: 'absolute',
          top: 18,
          left: '50%',
          transform: 'translate(-50%, 50%)',
          fontSize: '1rem',
          padding: '0px 8px',
          background: '#fff',
          textAlign: 'center',
          borderRadius: 8,
        }}>
        {t('common.place-image-instruction')}
      </Typography.Text>

      <Space
        direction='vertical'
        align='center'
        size={[0, 0]}
        css={{
          zIndex: 99999777999,
          width: '100%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, 4px)',
        }}>
        <Typography.Paragraph
          css={{
            padding: '0px 8px',
            fontSize: '1rem',
            background: '#fff',
            textAlign: 'center',
            borderRadius: 8,
          }}>
          {activity?.instruction || activity?.title || activity?.description}
        </Typography.Paragraph>
        {markerPreview}
      </Space>
      <Icon
        component={ScanSvg}
        css={{
          zIndex: 99999777999,
          fontSize: 200 * 0.75,
          color: '#eee',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.8,
        }}
      />
    </Html>
  );
}

function AuraList({
  canvasRef,
  activity,
  activityId,
  anchoring,
  meta = {},
  mode,
}: any) {
  const log = useLogger('AuraList');

  const { auraKey = undefined } = meta;

  const auras = useStore((state) =>
    state.auraSlice.auras?.filter(
      (aura) =>
        aura.activityId === activityId && aura?.meta?.auraKey === auraKey,
    ),
  );

  const allAuras = useStore((state) => state.auraSlice.auras);

  //log.debug('INOD AURAS Render', allAuras, activityId, auraKey);

  return (
    activity && (
      <group matrixAutoUpdate={false}>
        {auras.map((aura) => (
          <Aura
            key={aura.id}
            id={aura.id}
            type={aura.type}
            mode={mode}
            canvasRef={canvasRef}
            anchoring={anchoring}
            markerCfg={activity.markerImagesCfg[0]}
            onChange={null}
            onDelete={null}
          />
        ))}
      </group>
    )
  );
}
