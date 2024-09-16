import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Html, Plane } from '@react-three/drei';
import { useSpring, a as a3f } from '@react-spring/three';
import { animated, useSpring as useSpringWeb } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import { Resizable } from 're-resizable';

import { Typography, Popover } from 'antd';

import SwipeIcon from '@mui/icons-material/Swipe';
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
  RotateRightOutlined,
  HolderOutlined,
  HighlightOutlined,
} from '@ant-design/icons';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import fonts from '../../fonts/fonts';
import useControls from '../../hooks/useControls';
import { Text3f } from '../../components/Text3f';
import { mxPopbar, mxResizable } from '../../utils/styles';
import { useAspect } from '../../hooks/useAspect';
import { AuraMode } from '../editor/Board';
import { useTrace } from '../../hooks/useTrace';
import { TRACES } from '../../db/traces';

import { useTranslation } from 'react-i18next';

export function AText({
  markerCfg,
  canvasRef,
  document,
  mode,
  onChange,
  onDelete,
}: any) {
  const { id, activityId, content, cfg, type } = document;

  const { t } = useTranslation();

  const [value, setValue] = useState<string>(
    content || t('common.edit-title2'),
  );

  const [widthHeight, setWidthHeight] = useState<{
    width: number;
    height: number;
  }>({
    width: cfg?.style?.width || 200,
    height: cfg?.style?.height || 100,
  });

  const { viewport, size } = useThree();
  const { factor } = viewport;
  const widthFactor = size.width / viewport.width;
  const heightFactor = size.height / viewport.height;

  const { newWidth, newHeight } = useAspect({
    width: markerCfg.worldWidth,
    height: markerCfg.worldHeight,
    maxWidth: (2 * size.width) / 3,
    maxHeight: (2 * size.height) / 3,
  });

  const [position, setPosition] = useState<any>(cfg?.position || [0, 0, 0]);
  const [scale] = useState<any>(cfg?.scale || [1, 1, 1]);
  const [rotation, setRotation] = useState<[number, number, number]>(
    cfg?.rotation || [0, 0, 0],
  );
  const [switchGuesture, setSwitchGesture] = useState<string>('drag');
  const [dragging, setDragging] = useState<boolean>(false);
  const [visibleControls, setVisibleControls] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [resizing, setResizing] = useState<boolean>(false);

  const { trace } = useTrace({});

  const handleTextChange = (value) => {
    setValue(value);
  };

  const handleControlsVisibility = (visible) => {
    setVisibleControls(dragging ? false : visible);
  };

  const handleGuesture = (type) => {
    setSwitchGesture(type);

    switch (type) {
      case 'drag': {
        api.start({
          position: [position[0] + 0.3, position[1] + 0.3, position[2]],
        });
        setTimeout(() => {
          api.start({
            position: [position[0], position[1], position[2]],
          });
        }, 700);
        break;
      }
      case 'rotate2D': {
        api.start({
          rotation: [rotation[0], rotation[1], rotation[2] + 0.3],
        });
        setTimeout(() => {
          api.start({
            rotation: [rotation[0], rotation[1], rotation[2]],
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
      ],
      description: '',
    },
    {
      component: 'Button',
      icon: <DeleteOutlined />,
      label: 'delete',
      key: 'delete',
      size: 'large',
      onClick: onDelete,
      description: '',
    },
  ];

  const initialValues = useCallback(() => {
    const values = {};
    options?.forEach((item) => {
      values[item.key] = item.defaultValue;
    });
    return values;
  }, [options]);

  const {
    controls: { /*changedField,*/ allFields },
    controlsForm,
  } = useControls({
    options,
    fieldsValue: cfg?.style || {},
    initialValues: Object.assign(initialValues(), cfg?.style || []),
  });

  const [spring, api] = useSpring<any>(() => ({
    rotation: cfg?.rotation || [0, 0, 0],
    scale: cfg?.scale || [1, 1, 1],
    position: cfg?.position || [0, 0, 0],
  }));

  useEffect(() => {
    onChange &&
      onChange({
        id,
        activityId,
        type,
        content: value,
        cfg: {
          style: {
            ...allFields,
            width: widthHeight.width,
            height: widthHeight.height,
          },
          position,
          scale,
          rotation,
          pFactor: factor,
        },
      });
  }, [value, factor, position, scale, rotation, allFields, widthHeight]);

  const styles = useSpringWeb({ opacity: editing ? 1 : 0 });

  const gesture = useGesture(
    {
      onPinchEnd: ({ offset: [s, a] }) => {
        setRotation([rotation[0], rotation[1], -a / 50]);
      },
      onDragEnd: ({ offset: [x, y] }) => {
        setDragging(false);
        setVisibleControls(true);

        if (switchGuesture === 'drag') {
          setPosition([x / widthFactor, -y / heightFactor, 0]);
          trace(TRACES.DRAG_AURA);
        } else if (switchGuesture === 'rotate2D') {
          setRotation([rotation[0], rotation[1], (360 * x) / factor / 100]);
        } else if (switchGuesture === 'rotate3D') {
          setRotation([y / 50, x / 50, rotation[2]]);
        }
      },
      onDragStart: () => {
        setDragging(true);
        setVisibleControls(false);
      },
      onDrag: ({ pinching, cancel, offset: [x, y] }) => {
        if (pinching || resizing || editing) {
          return cancel();
        }
        if (switchGuesture === 'drag') {
          api.start({
            position: [x / widthFactor, -y / heightFactor, 0],
          });
        } else if (switchGuesture === 'rotate2D') {
          api.start({
            rotation: [rotation[0], rotation[1], (360 * x) / factor / 100],
          });
        } else if (switchGuesture === 'rotate3D') {
          api.start({
            rotation: [y / 50, x / 50, rotation[2]],
          });
        }
      },
      onPinch: ({
        // origin: [ox, oy],
        // first,
        // movement: [ms],
        offset: [, a],
        memo,
      }) => {
        // if (first) {
        //   const { width, height, x, y } = ref.current.getBoundingClientRect();
        //   const tx = ox - (x + width / 2);
        //   const ty = oy - (y + height / 2);
        //   memo = [position[0], position[1], tx, ty];
        // }

        // const x = memo[0] - (ms - 1) * memo[2];
        // const y = memo[1] - (ms - 1) * memo[3];

        api.start({
          // position: [x / widthFactor, -y / heightFactor, 0],
          // scale: s,
          rotation: [rotation[0], rotation[1], -a / 50],
        });
        return memo;
      },
    },
    {
      drag: {
        bounds: canvasRef,
        rubberband: true,
      },
      pinch: { scaleBounds: { min: 0.5, max: 2 }, rubberband: false },
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

  console.log('markerCfg', markerCfg);

  return (
    <>
      <Html
        css={{ top: 0, left: 0, background: '#eee' }}
        zIndexRange={[0, 0]}>
        {factor}
        <br />
        {cfg.pFactor}
        <br />
        {newWidth}
        <br />
        {newHeight}
        <br />
        {JSON.stringify(markerCfg)}
      </Html>

      {mode === AuraMode.ARVIEW && (
        <group
          position={[markerCfg.worldWidth / 2, markerCfg.worldHeight / 2, 0]}
          rotation={rotation}>
          {/* @ts-ignore */}
          <Plane args={[markerCfg.worldWidth, markerCfg.worldHeight]}>
            <meshStandardMaterial
              toneMapped={false}
              color={'hotpink'}
              opacity={0}
              transparent={false}
            />
          </Plane>
        </group>
      )}

      {mode === AuraMode.ARCANVAS && (
        <group
          position={position}
          rotation={rotation}>
          <Text3f
            {...allFields}
            visible={true}
            text={value}
            maxWidth={(cfg.style?.width - 12) / cfg.style?.fontSize}
            width={cfg.style?.width}
            height={cfg.style?.height}
          />
        </group>
      )}

      {mode === AuraMode.CANVAS && (
        <a3f.group
          {...spring}
          scale={[1, 1, 1]}>
          <Text3f
            {...allFields}
            visible={!editing}
            text={value}
            maxWidth={(cfg.style?.width - 12) / cfg.style?.fontSize}
            width={cfg.style?.width}
            height={cfg.style?.height}
          />
          <Html
            css={{
              left: -cfg.style?.width / 2,
              top: -cfg.style?.height / 2,
            }}>
            <Resizable
              css={mxResizable}
              defaultSize={{
                width: widthHeight.width,
                height: widthHeight.height,
              }}
              onResizeStop={(e, direction, ref, d) => {
                setResizing(false);
                setWidthHeight((prev) => ({
                  width: prev.width + d.width,
                  height: prev.height + d.height,
                }));
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
                  {/* <Button
                    type='link'
                    css={{
                      position: 'absolute',
                      right: 18,
                      bottom: 18,
                      zIndex: 100,
                    }}
                    icon={
                      <EditOutlined
                        css={{ fontSize: '1.8rem' }}
                        onClick={() => {
                          toggle.bind(true, allFields);
                          setEditing(true);
                        }}
                      />
                    }
                  /> */}

                  <animated.div
                    style={styles}
                    css={{
                      width: '100%',
                      height: '100%',
                      transform: `rotateZ(${-rotation[2]}rad)`,
                    }}
                    onPointerLeave={() => {
                      setEditing(false);
                    }}>
                    <TextArea
                      onClick={() => {
                        setEditing(true);
                      }}
                      style={{
                        ...allFields,
                        width: '100%',
                        height: '100%',
                        margin: '0 !important',
                        overflow: 'hidden',
                        resize: 'none',
                        outline: 'none',
                        border: 'none',
                        cursor: editing
                          ? 'cursor'
                          : switchGuesture === 'drag'
                          ? 'move'
                          : 'grab',
                      }}
                      value={value}
                      onChange={handleTextChange}
                    />
                  </animated.div>
                </animated.div>
              </Popover>
            </Resizable>
          </Html>
        </a3f.group>
      )}
    </>
  );
}

const TextArea = ({ value, onChange, onClick, style }: any) => {
  const [val, setVal] = useState(value);

  const handleChange = (val) => {
    setVal(val);
    onChange(val);
  };

  return (
    <textarea
      onClick={onClick}
      css={style}
      value={val}
      onChange={(e) => handleChange(e.target.value)}></textarea>
  );
};
