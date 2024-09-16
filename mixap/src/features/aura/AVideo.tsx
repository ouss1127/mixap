import React, { useState, useMemo, useCallback } from 'react';
import { useSpring, a as a3f } from '@react-spring/three';
import { useGesture } from '@use-gesture/react';
import { useThree } from '@react-three/fiber';
import { animated } from '@react-spring/web';
import { Html } from '@react-three/drei';

import { Popover, Typography } from 'antd';

import SwipeIcon from '@mui/icons-material/Swipe';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';
import {
  DeleteOutlined,
  HolderOutlined,
  UploadOutlined,
  RotateRightOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import useControls from '../../hooks/useControls';
import useLogger from '../../hooks/useLogger';
import useStore from '../../hooks/useStore';
import { calcAspect } from '../../hooks/useAspect';
import { AuraMode } from '../editor/Board';
import { Video3f } from '../../components/Video3f';
import { loadVideoBase64 } from '../../utils/loadImage';
import { getType } from '../../utils/mimetype';
import { mxResizable } from '../../utils/styles';
import { Resizable } from 're-resizable';
import { useTrace } from '../../hooks/useTrace';
import { TRACES } from '../../db/traces';

import { useTranslation } from 'react-i18next';

export function AVideo({
  canvasRef,
  id,
  anchoring,
  mode,
  onChange,
  onDelete,
}: any) {
  const log = useLogger('AVideo');

  log.debug('Render');

  const { content, cfg, activityId, type } = useStore((store) =>
    store.auraSlice.find(id),
  ) as any;

  const { viewport, size } = useThree();
  const widthFactor = size.width / viewport.width;
  const heightFactor = size.height / viewport.height;

  const [switchGuesture, setSwitchGesture] = useState<string>('drag');
  const [, setDragging] = useState<boolean>(false);
  const [visibleControls, setVisibleControls] = useState<boolean>(true);

  const { trace } = useTrace({});

  const { t } = useTranslation();

  const handleControlsVisibility = (visible) => {
    setVisibleControls(visible);
  };

  const handleGuesture = (type) => {
    setSwitchGesture(type);

    switch (type) {
      case 'drag': {
        api.start({
          position: [
            cfg.position[0] + 0.3,
            cfg.position[1] + 0.3,
            cfg.position[2],
          ],
        });
        setTimeout(() => {
          api.start({
            position: [cfg.position[0], cfg.position[1], cfg.position[2]],
          });
        }, 700);
        break;
      }
      case 'rotate2D': {
        api.start({
          rotation: [cfg.rotation[0], cfg.rotation[1], cfg.rotation[2] + 0.3],
        });
        setTimeout(() => {
          api.start({
            rotation: [cfg.rotation[0], cfg.rotation[1], cfg.rotation[2]],
          });
        }, 700);
        break;
      }
      case 'rotate3D': {
        api.start({
          rotation: [
            cfg.otation[0] + 0.3,
            cfg.rotation[1] + 0.3,
            cfg.rotation[2] + 0.3,
          ],
        });
        setTimeout(() => {
          api.start({
            rotation: [cfg.rotation[0], cfg.rotation[1], cfg.rotation[2]],
          });
        }, 700);
        break;
      }
      default:
        break;
    }
  };

  const options = [
    {
      component: 'InputFile',
      icon: <UploadOutlined />,
      label: 'fileUpload',
      key: 'file',
      size: 'large',
      description: '',
      tip: 'une vidéo',
      accept: 'video/mp4, video/*',
    },
    {
      component: 'InputFile',
      icon: <VideoCameraOutlined />,
      width: 46,
      label: 'fileUpload-1',
      key: 'file',
      defaultValue: 400,
      size: 'large',
      description: '',
      tip: 'un audio',
      capture: true,
      accept: 'video/mp4, video/*',
    },
    {
      component: 'GroupButton',
      icon: (
        <SwipeIcon
          css={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      ),
      label: 'guesture',
      key: 'guesture',
      defaultValue: 'holder',
      size: 'large',
      onClick: handleGuesture,
      options: [
        {
          label: 'Drag',
          value: 'drag',
          icon: (
            <HolderOutlined
              css={{
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          ),
        },
        {
          label: 'Rotation 2D',
          value: 'rotate2D',
          icon: (
            <RotateRightOutlined
              css={{
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          ),
        },
        {
          label: 'Rotation 3D',
          value: 'rotate3D',
          icon: (
            <ThreeDRotationIcon
              css={{
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          ),
        },
      ],
      description: '',
    },
    {
      component: 'Button',
      icon: <DeleteOutlined />,
      label: 'delete',
      key: 'delete',
      defaultValue: 400,
      size: 'large',
      onClick: onDelete,
      description: '',
    },
  ];

  const { controlsForm } = useControls({
    options,
    fieldsValue: {},
    initialValues: {},
    onChange: ({ allFields }) => {
      if (allFields?.file) {
        (async () => {
          const { file, worldWidth, worldHeight } = await loadVideoBase64(
            allFields.file,
          );

          const { newWidth: width, newHeight: height } = calcAspect({
            width: worldWidth,
            height: worldHeight,
            maxWidth: 200,
            maxHeight: 156,
          });

          onChange &&
            handleChange({
              content: {
                file,
                type: getType(allFields.file?.name, type),
              },
              cfg: {
                worldWidth,
                worldHeight,
                width,
                height,
              },
            });
        })();
      }
    },
  });

  const [spring, api] = useSpring<any>(() => ({
    position: cfg.position,
    rotation: cfg.rotation,
  }));

  const handleChange = useCallback((payload) => {
    onChange &&
      onChange({
        id,
        activityId,
        type,
        ...payload,
      });
  }, []);

  const gesture = useGesture(
    {
      onDragEnd: ({ offset: [x, y] }) => {
        setDragging(false);
        setVisibleControls(true);

        if (switchGuesture === 'drag') {
          handleChange({
            cfg: {
              position: [x / widthFactor, -y / heightFactor, 0],
            },
          });
          trace(TRACES.DRAG_AURA);
        } else if (switchGuesture === 'rotate2D') {
          handleChange({
            cfg: {
              rotation: [
                cfg.rotation[0],
                cfg.rotation[1],
                (360 * x) / cfg.factor / 100,
              ],
            },
          });
        } else if (switchGuesture === 'rotate3D') {
          handleChange({
            cfg: {
              rotation: [y / 50, x / 50, cfg.rotation[2]],
            },
          });
        }
      },
      onDragStart: () => {
        setDragging(true);
        setVisibleControls(false);
      },
      onDrag: ({ pinching, cancel, offset: [x, y] }) => {
        if (pinching) {
          return cancel();
        }
        if (switchGuesture === 'drag') {
          api.start({
            position: [x / widthFactor, -y / heightFactor, 0],
          });
        } else if (switchGuesture === 'rotate2D') {
          api.start({
            rotation: [
              cfg.rotation[0],
              cfg.rotation[1],
              (360 * x) / cfg.factor / 100,
            ],
          });
        } else if (switchGuesture === 'rotate3D') {
          api.start({
            rotation: [y / 50, x / 50, cfg.rotation[2]],
          });
        }
      },
    },
    {
      drag: {
        bounds: canvasRef,
        rubberband: true,
        pointer: {
          touch: true,
        },
      },
    },
  );

  return (
    <>
      {mode === AuraMode.ARVIEW && (
        // @ts-ignore
        <group
          position={[
            (cfg.position[0] * cfg.factor + cfg.marker.width / 2) *
              cfg.marker.widthRatio,
            (cfg.position[1] * cfg.factor + cfg.marker.height / 2) *
              cfg.marker.heightRatio,
            0,
          ]}
          rotation={cfg.rotation}
          scale={[1, 1, 1]}>
          <Video3f
            file={content.file}
            position={[0, 0, 0]}
            scale={[1, 1, 1]}
            factor={cfg.factor}
            width={cfg.width * cfg.factor * cfg.marker.widthRatio}
            height={cfg.height * cfg.factor * cfg.marker.heightRatio}
            anchoring={anchoring}
          />
        </group>
      )}

      {mode === AuraMode.ARCANVAS && (
        <group
          scale={[1, 1, 1]}
          position={cfg.position}
          rotation={cfg.rotation}>
          <Video3f
            file={content.file}
            position={cfg.position}
            scale={[1, 1, 1]}
            factor={cfg.factor}
            width={cfg.width}
            height={cfg.height}
          />
        </group>
      )}

      {mode === AuraMode.CANVAS && (
        // @ts-ignore
        <a3f.group
          {...spring}
          scale={[1, 1, 1]}>
          {content.file && (
            <Video3f
              file={content.file}
              // position={cfg.position}
              factor={cfg.factor}
              scale={[1, 1, 1]}
              width={cfg.width}
              height={cfg.height}
            />
          )}
          {console.log("INOD AVIDEO CANVAS")}
          <Html
            zIndexRange={[100, 100]}
            css={{
              left: -cfg.width / 2,
              top: -cfg.height / 2,
              cursor: switchGuesture === 'drag' ? 'move' : 'grab',
            }}>
            <Resizable
              css={mxResizable}
              size={{
                width: cfg.width,
                height: cfg.height,
              }}
              onResizeStop={(e, direction, ref, d) => {
                handleChange({
                  cfg: {
                    width: cfg.width + d.width,
                    height: cfg.height + d.height,
                    scale: [
                      (cfg.width + d.width) / cfg.factor,
                      (cfg.height + d.height) / cfg.factor,
                      1,
                    ],
                  },
                });
                trace(TRACES.RESIZE_AURA);
              }}>
              <Popover
                color='var(--active-color)'
                content={controlsForm}
                visible={visibleControls}
                onVisibleChange={handleControlsVisibility}>
                <animated.div
                  {...gesture()}
                  css={{
                    width: '100%',
                    height: '100%',
                    touchAction: 'none',
                    userSelect: 'none',
                    display: 'flex',
                  }}>
                  {!content.file && (
                    <Typography.Paragraph strong>
                      {t('common.click-edit')}
                    </Typography.Paragraph>
                  )}
                </animated.div>
              </Popover>
            </Resizable>
          </Html>
        </a3f.group>
      )}
    </>
  );
}
