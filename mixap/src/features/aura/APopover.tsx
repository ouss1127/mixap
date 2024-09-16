import React, { useCallback, useMemo, useState } from 'react';
import { Html } from '@react-three/drei';
import { useSpring, a as a3f } from '@react-spring/three';
import { animated, useSpring as useSpringWeb } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import { Resizable } from 're-resizable';
import { useThree } from '@react-three/fiber';
import { debounce } from 'lodash';

import { Typography, Popover, Button, Drawer } from 'antd';

// import SwipeIcon from '@mui/icons-material/Swipe';
// import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';
import TitleOutlinedIcon from '@mui/icons-material/TitleOutlined';
import {
  FontColorsOutlined,
  FontSizeOutlined,
  LineHeightOutlined,
  ItalicOutlined,
  BoldOutlined,
  AlignCenterOutlined,
  DeleteOutlined,
  AlignLeftOutlined,
  HighlightOutlined,
  MessageOutlined,
} from '@ant-design/icons';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import fonts from '../../fonts/fonts';
import useControls from '../../hooks/useControls';
import useStore from '../../hooks/useStore';
import { Text3f } from '../../components/Text3f';
import { Editable } from '../../components/Editable';
import { useAspect } from '../../hooks/useAspect';
import { AuraMode } from '../editor/Board';
import { mxPopbar, mxResizable } from '../../utils/styles';
import { TextArea } from './AText';
import { useTrace } from '../../hooks/useTrace';
import { TRACES } from '../../db/traces';

export function APopover({
  canvasRef,
  id,
  markerCfg,
  anchoring,
  mode,
  onChange,
  onDelete,
}: any) {
  const { content, cfg, activityId, type } = useStore((store) =>
    store.auraSlice.find(id),
  ) as any;

  const { viewport, size } = useThree();

  const { newWidth, newHeight } = useAspect({
    width: markerCfg.worldWidth,
    height: markerCfg.worldHeight,
    maxWidth: size.width / 2,
    maxHeight: size.height / 2,
  });

  const widthFactor = size.width / viewport.width;
  const heightFactor = size.height / viewport.height;

  const [dragging, setDragging] = useState<boolean>(false);
  const [visibleControls, setVisibleControls] = useState<boolean>(true);
  const [visibleDrawer, setVisibleDrawer] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [resizing, setResizing] = useState<boolean>(false);
  const [switchGuesture] = useState<string>('drag');

  const { trace } = useTrace({});

  const options = [
    {
      component: 'Select',
      icon: <TitleOutlinedIcon />,
      label: 'fontFamily',
      key: 'fontFamily',
      defaultValue: 'Roboto',
      width: 100,
      size: 'large',
      options: Object.keys(fonts).map((label) => ({
        key: label,
        label: (
          <Typography.Text css={{ fontSize: '0.6rem', fontFamily: label }}>
            {label}
          </Typography.Text>
        ),
        value: label,
      })),
      description: '',
    },
    {
      component: 'InputSelect',
      icon: <FontSizeOutlined />,
      name: 'fontSize',
      label: 'size',
      key: 'fontSize',
      size: 'large',
      defaultValue: 24,
      max: 200,
      min: 10,
      description: '',
    },
    {
      component: 'InputColor',
      icon: <FontColorsOutlined />,
      label: 'color',
      key: 'color',
      defaultValue: '#000',
      size: 'large',
      description: '',
    },
    {
      component: 'InputColor',
      icon: <HighlightOutlined />,
      label: 'background',
      key: 'background',
      defaultValue: 'transparent',
      size: 'large',
      description: '',
    },
    {
      component: 'RadioButton',
      label: 'textAlign',
      key: 'textAlign',
      defaultValue: 'left',
      size: 'large',
      options: [
        { label: 'Left', value: 'left', icon: <AlignLeftOutlined /> },
        { label: 'Center', value: 'center', icon: <AlignCenterOutlined /> },
      ],
      description: '',
    },
    {
      component: 'RadioButton',
      label: 'fontVariant',
      key: 'fontVariant',
      defaultValue: 'normal',
      size: 'large',
      options: [
        {
          label: 'Normal',
          value: 'normal',
          icon: <LineHeightOutlined />,
        },
        {
          label: 'Small-caps',
          value: 'small-caps',
          icon: <LineHeightOutlined style={{ color: '#eee' }} />,
        },
      ],
      description: '',
    },
    {
      component: 'RadioButton',
      icon: <ItalicOutlined />,
      label: 'fontStyle',
      key: 'fontStyle',
      defaultValue: 'normal',
      size: 'large',
      options: [
        {
          label: 'Normal',
          value: 'normal',
          icon: <ItalicOutlined />,
        },
        {
          label: 'Italic',
          value: 'italic',
          icon: <ItalicOutlined style={{ color: '#eee' }} />,
        },
      ],
      description: '',
    },
    {
      component: 'RadioButton',
      icon: <BoldOutlined />,
      label: 'fontWeight',
      key: 'fontWeight',
      defaultValue: 'normal',
      size: 'large',
      options: [
        {
          label: 'Normal',
          value: 'normal',
          icon: <BoldOutlined />,
        },
        {
          label: 'Bold',
          value: 'bold',
          icon: <BoldOutlined style={{ color: '#eee' }} />,
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

  const handleControlsVisibility = (visible) => {
    setVisibleControls(dragging ? false : visible);
  };

  const initialValues = useCallback(() => {
    const values = {};
    options?.forEach((item) => {
      values[item.key] = item.defaultValue;
    });
    return values;
  }, [options]);

  const { controlsForm } = useControls({
    options,
    fieldsValue: cfg?.style || {},
    initialValues: Object.assign(initialValues(), cfg?.style || []),
    onChange: ({ allFields }) => {
      handleChange({
        cfg: {
          style: allFields,
        },
      });
    },
  });

  const [spring, api] = useSpring<any>(() => ({
    rot: cfg.rotation,
    position: cfg.position,
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

  const debounceChange = useCallback(
    debounce((payload) => handleChange(payload), 500),
    [],
  );

  const styles = useSpringWeb({ opacity: editing ? 1 : 0 });

  const gesture = useGesture(
    {
      onDragEnd: ({ offset: [x, y] }) => {
        setDragging(false);
        setVisibleControls(true);
        handleChange({
          cfg: {
            position: [x / widthFactor, -y / heightFactor, 0],
          },
        });
        trace(TRACES.DRAG_AURA);
      },
      onDragStart: () => {
        setDragging(true);
        setVisibleControls(false);
      },
      onDrag: ({ pinching, cancel, offset: [x, y] }) => {
        if (pinching || resizing || editing) {
          return cancel();
        }

        api.start({
          position: [x / widthFactor, -y / heightFactor, 0],
        });
      },
    },
    {
      drag: {
        bounds: canvasRef,
        rubberband: true,
      },
    },
  );

  const mkCfg = useMemo(() => {
    return {
      width: newWidth,
      height: newHeight,
      widthRatio: markerCfg.worldWidth / newWidth,
      heightRatio: markerCfg.worldHeight / newHeight,
    };
  }, [markerCfg, newWidth, newHeight]);

  return (
    <>
      {mode === AuraMode.ARVIEW && (
        <group
          position={[
            (cfg.position[0] + 0.5 * mkCfg.width) * mkCfg.widthRatio,
            (cfg.position[1] + 0.5 * mkCfg.height) * mkCfg.heightRatio,
            0,
          ]}
          rotation={cfg.rotation}>
          <Html
            style={{
              position: 'absolute',
              left: `${cfg.position[0] * widthFactor}px`,
              top: `${cfg.position[1] * heightFactor}px`,
            }}
            center
            css={{
              visibility: anchoring ? 'visible' : 'hidden',
              '&:hover': {
                cursor: 'pointer',
              },
            }}>
            <div
              style={{ fontSize: cfg.style.fontSize, color: cfg.style.color }}>
              {content.value.title}
            </div>

            <Button
              style={{
                position: 'inherit',
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                padding: '0',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
              type='link'
              size='large'
              onClick={() => {
                setVisibleDrawer(true);
              }}
              icon={<MessageOutlined />}
            />

            <Drawer
              placement='top'
              title={
                <Typography.Paragraph css={{ margin: '0 !important' }}>
                  {content.value.title}
                </Typography.Paragraph>
              }
              onClose={() => {
                setVisibleDrawer(false);
              }}
              open={visibleDrawer}
              css={{
                '.ant-drawer-body': {
                  marginLeft: 'auto',
                  marginRight: 'auto',
                },
              }}>
              <Editable
                content={content.value.content}
                onChange={null}
              />
            </Drawer>
          </Html>
        </group>
      )}

      {mode === AuraMode.ARCANVAS && (
        <group
          scale={[1, 1, 1]}
          position={cfg.position}>
          <Text3f
            {...cfg.style}
            text={content.value.title}
            maxWidth={(cfg.width - 12) / cfg.style.fontSize}
            width={cfg.width}
            height={cfg.height}
          />
        </group>
      )}

      {mode === AuraMode.CANVAS && (
        <a3f.group
          {...spring}
          scale={[1, 1, 1]}>
          <Text3f
            {...cfg.style}
            text={content.value.title}
            maxWidth={(cfg.width - 12) / cfg.style.fontSize}
            width={cfg.width / cfg.style.fontSize}
            height={cfg.height / cfg.style.fontSize}
            scale={[cfg.style?.fontSize / 2000, cfg.style?.fontSize / 2000, 1]}
            position={[-cfg.width / 300, cfg.height / 200, 0]}
          />

          <Html
            zIndexRange={[100, 100]}
            css={{
              left: -cfg.width / 2,
              top: -cfg.height / 2,
            }}>
            {content.value.content && (
              <Button
                style={{
                  position: 'inherit',
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  display: 'flex',
                  fontSize: '12px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
                type='link'
                size='large'
                onClick={() => {
                  setVisibleDrawer(true);
                }}
                icon={<MessageOutlined />}
              />
            )}

            <Drawer
              placement='top'
              height={'60vh'}
              title={
                <Typography.Paragraph
                  css={{ margin: '0 !important' }}
                  editable={{
                    onChange: (title) => {
                      debounceChange({
                        content: {
                          value: {
                            title,
                            content: content.value.content,
                          },
                        },
                      });
                    },
                  }}>
                  {content.value.title}
                </Typography.Paragraph>
              }
              onClose={() => {
                setVisibleDrawer(false);
              }}
              open={visibleDrawer}
              css={{
                zIndex: 200,
                '.ant-drawer-body': {
                  marginLeft: 'auto',
                  marginRight: 'auto',
                },
              }}>
              <Editable
                content={content.value.content}
                onChange={(editorContent) => {
                  debounceChange({
                    content: {
                      value: {
                        title: content.value.title,
                        content: editorContent,
                      },
                    },
                  });
                }}
              />
            </Drawer>

            <Resizable
              css={mxResizable}
              defaultSize={{
                width: cfg.width,
                height: cfg.height,
              }}
              onResizeStop={(e, direction, ref, d) => {
                setResizing(false);
                handleChange({
                  cfg: {
                    width: cfg.width + d.width,
                    height: cfg.height + d.height,
                  },
                });
                trace(TRACES.RESIZE_AURA);
              }}
              onResizeStart={() => {
                setResizing(true);
              }}>
              <Popover
                color='var(--active-color)'
                content={controlsForm}
                visible={visibleControls}
                onVisibleChange={handleControlsVisibility}>
                <animated.div
                  css={mxPopbar}
                  {...gesture()}>
                  <animated.div
                    style={styles}
                    css={{
                      width: '100%',
                      height: '100%',
                      transform: `rotateZ(${-cfg.rotation[2]}rad)`,
                    }}
                    onPointerLeave={() => {
                      setEditing(false);
                    }}
                    onClick={() => {
                      setEditing(true);
                      setVisibleDrawer(true);
                    }}
                  />
                </animated.div>
              </Popover>
            </Resizable>
          </Html>
        </a3f.group>
      )}
    </>
  );
}
