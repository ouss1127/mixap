import React, { useState } from 'react';
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
  RotateRightOutlined,
  UploadOutlined,
} from '@ant-design/icons';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import useLogger from '../../hooks/useLogger';
import useControls from '../../hooks/useControls';
import useStore from '../../hooks/useStore';
import { Object3f } from '../../components/Object3f';
import { AuraMode } from '../editor/Board';
import { getType } from '../../utils/mimetype';
import { Resizable } from 're-resizable';
import { mxResizable } from '../../utils/styles';
import { useTrace } from '../../hooks/useTrace';
import { TRACES } from '../../db/traces';

import { useTranslation } from 'react-i18next';

export function A3d({ canvasRef, id, mode, onChange, onDelete }: any) {
  const log = useLogger('A3d');

  log.debug('Render');

  const { content, cfg, activityId, type } = useStore((store) =>
    store.auraSlice.find(id),
  ) as any;

  const { viewport, size } = useThree();
  const widthFactor = size.width / viewport.width;
  const heightFactor = size.height / viewport.height;

  const [switchGuesture, setSwitchGesture] = useState<any>('drag');
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
            cfg.rotation[0] + 0.3,
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
      tip: 'un objet 3D',
      accept: '.gltf, .fbx, .obj, .glb',
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
          onChange &&
            onChange({
              id,
              activityId,
              type,
              content: {
                file: allFields.file,
                // base64,
                type: getType(allFields.file.name, type),
              },
            });

          return allFields.file;
        })();
      }
    },
  });

  const [spring, api] = useSpring<any>(() => ({
    rotation: cfg.rotation,
    position: cfg.position,
  }));

  const handleChange = (payload) => {
    onChange &&
      onChange({
        id,
        activityId,
        type,
        ...payload,
      });
  };

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
              position: [
                cfg.rotation[0],
                cfg.rotation[1],
                (360 * x) / cfg.factor / 100,
              ],
            },
          });
        } else if (switchGuesture === 'rotate3D') {
          handleChange({
            cfg: {
              position: [y / 50, x / 50, cfg.rotation[2]],
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
      },
    },
  );

  let isDragging = false;

  const gestureOrbit = useGesture(
    {
      onDragStart: () => {
        isDragging = true;
      },

      onDragEnd: () => {
        isDragging = false;
      },

      onDrag: ({ pinching, cancel, offset: [x, y], tap }) => {
        if (pinching) {
          return cancel();
        }
        api.start({
          rotation: [y / 50, x / 50, cfg.rotation[2]],
        });
      },
    },
    {
      drag: {
        filterTaps: true,
        preventScroll: true,
      },
    },
  );

  const setFullScreen = useStore((state) => state.playerSlice.setFullScreen);

  return (
    <>
      {mode === AuraMode.ARVIEW && (
        // @ts-ignore
        <a3f.group
          rotation={cfg.rotation}
          {...spring}
          // @ts-ignore
          // {...gestureOrbit()}
          position={[
            (cfg.position[0] * cfg.factor + cfg.marker.width / 2) *
              cfg.marker.widthRatio,
            (cfg.position[1] * cfg.factor + cfg.marker.height / 2) *
              cfg.marker.heightRatio,
            0,
          ]}>
          {/*  @ts-ignore */}
          <Object3f
            file={content.file}
            type={content.type}
            scale={
              (cfg.width * cfg.marker.widthRatio +
                cfg.height * cfg.marker.heightRatio) /
              2
            }
          />
          <Html
            css={{
              left: -cfg.width / 2,
              top: -cfg.height / 2,
            }}>
            <animated.div
              {...gestureOrbit()}
              onClick={() => {
                if (!isDragging) setFullScreen(true, 'object');
              }}
              css={{
                width: cfg.width,
                height: cfg.height,
                touchAction: 'none',
                userSelect: 'none',
                display: 'flex',
              }}></animated.div>
          </Html>
        </a3f.group>
      )}

      {mode === AuraMode.ARCANVAS && (
        <group
          position={cfg.position}
          rotation={cfg.rotation}>
          <Object3f
            file={content.file}
            type={content.type}
            scale={cfg.scale}
          />
        </group>
      )}

      {mode === AuraMode.CANVAS && (
        // @ts-ignore
        <a3f.group {...spring}>
          {content.file && (
            <Object3f
              file={content.file}
              type={content?.type}
              scale={cfg?.scale}
            />
          )}
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
                    scale:
                      (cfg.width + d.width + cfg.height + d.height) /
                      2 /
                      cfg.factor,
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
                    display: 'flex',
                  }}>
                  {!content.file && (
                    <Typography.Title level={5}>
                      {t('common.click-edit')}
                    </Typography.Title>
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
