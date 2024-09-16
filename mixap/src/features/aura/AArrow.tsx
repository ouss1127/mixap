import React, {
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useThree } from '@react-three/fiber';
import { Circle, Html, Line, QuadraticBezierLine } from '@react-three/drei';
import { useSpring, a as a3f } from '@react-spring/three';
import { useSpring as useSpringWeb, animated } from '@react-spring/web';
import { useDrag, useGesture } from '@use-gesture/react';

import SwipeIcon from '@mui/icons-material/Swipe';
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
  RotateRightOutlined,
  HolderOutlined,
  HighlightOutlined,
} from '@ant-design/icons';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import useControls from '../../hooks/useControls';
import fonts from '../../fonts/fonts';
import { Typography } from 'antd';
import useStore from '../../hooks/useStore';
import { useTrace } from '../../hooks/useTrace';
import { TRACES } from '../../db/traces';

import { useTranslation } from 'react-i18next';

export function AArrow({
  id,
  markerCfg,
  canvasRef,
  document,
  onChange,
  onDelete,
}: any) {
  const { content, cfg, activityId, type } = useStore((store) =>
    store.auraSlice.find(id),
  ) as any;

  const { t } = useTranslation();

  const [value, setValue] = useState<string>(
    content || t('common.edit-title2'),
  );

  const ref = useRef<any>(null);
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

  const [position, setPosition] = useState<any>(cfg?.position || [0, 0, 0]);

  const [ps, setPs] = useState<any>([0, 0, 0]);
  const [pe, setPe] = useState<any>([2, 2, 0]);

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

  const handleControlsVisibility = (visible) => {
    setVisibleControls(dragging ? false : visible);
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
      // [
      //   { label: 'Arial', value: 'Arial' },
      //   { label: 'Verdana', value: 'Verdana' },
      //   { label: 'Helvetica', value: 'Sans-serif' },
      //   { label: 'Optima', value: 'Optima' },
      //   { label: 'Brush Script MT', value: 'Brush Script MT' },
      //   { label: 'Times New Roman', value: 'Times New Roman' },
      // ]
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
      defaultValue: 'rgba(255, 255, 255, 0.5)',
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

  const [springs, apis] = useSpring<any>(() => ({
    position: ps,
    // y: ps[1],
  }));

  const [springe, apie] = useSpring<any>(() => ({
    position: pe,
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
        },
      });
  }, [value, position, scale, rotation, allFields, widthHeight]);

  const gestures = useGesture(
    {
      onDragEnd: ({ offset: [x, y] }) => {
        setPs([x / widthFactor, -y / heightFactor, 0]);
        trace(TRACES.DRAG_AURA);
      },
      onDragStart: () => {
        //
      },
      onDrag: ({ pinching, cancel, offset: [x, y] }) => {
        if (pinching) {
          return cancel();
        }
        apis.start({
          position: [x / widthFactor, -y / heightFactor, 0],
        });
      },
    },
    {
      // target: mesh,
      drag: { bounds: canvasRef, rubberband: true },
    },
  );

  const gesturee = useGesture(
    {
      onDragEnd: ({ offset: [x, y] }) => {
        setPe([x / widthFactor, -y / heightFactor, 0]);
      },
      onDragStart: () => {
        //
      },
      onDrag: ({ pinching, cancel, offset: [x, y] }) => {
        if (pinching) {
          return cancel();
        }
        apie.start({
          position: [x / widthFactor, -y / heightFactor, 0],
        });
      },
    },
    {
      // target: mesh,
      drag: { bounds: canvasRef, rubberband: true },
    },
  );

  const mkCfg = useMemo(() => {
    const width = 332;
    const height = 183.24035608308606;
    return {
      width,
      height,
      widthRatio: markerCfg.worldWidth / width,
      heightRatio: markerCfg.worldHeight / height,
    };
  }, [markerCfg]);

  return (
    <>
      {!onChange && (
        <group
          position={[
            (position[0] * factor + mkCfg.width / 2) * mkCfg.widthRatio,
            (position[1] * factor + mkCfg.height / 2) * mkCfg.heightRatio,
            1,
          ]}></group>
      )}

      <group scale={[1, 1, 1]}>
        {/* @ts-ignore  */}
        <a3f.group {...springs}>
          <Html>
            <animated.div
              {...gestures()}
              css={{
                width: 20,
                height: 20,
                background: 'blue',
                borderRadius: '50%',
                touchAction: 'none',
              }}></animated.div>
          </Html>
        </a3f.group>
        {/* <Circle args={[0.1, 100]}>
          <meshBasicMaterial color='hotpink' />
        </Circle> */}
        {/* line */}
        <QuadraticBezierLine
          start={ps} // Starting point, can be an array or a vec3
          end={pe} // Ending point, can be an array or a vec3
          mid={[(ps[0] + pe[0]) / 2, (ps[1] + pe[1]) / 2, 0]} // Optional control point, can be an array or a vec3
          color='black' // Default
          lineWidth={1} // In pixels (default)
          dashed={false} // Default
        />
        {/* @ts-ignore  */}
        <a3f.group {...springe}>
          <Html>
            <animated.div
              {...gesturee()}
              css={{
                width: 20,
                height: 20,
                background: 'hotpink',
                borderRadius: '50%',
                touchAction: 'none',
              }}></animated.div>
          </Html>
        </a3f.group>
      </group>
    </>
  );
}
