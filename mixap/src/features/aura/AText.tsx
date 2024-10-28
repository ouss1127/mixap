import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useSpring, a as a3f } from '@react-spring/three';
import { animated, useSpring as useSpringWeb } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import { Resizable } from 're-resizable';
import { debounce } from 'lodash';

import { Typography, Popover, Button } from 'antd';
import { Modal, Input } from 'antd';

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
  BgColorsOutlined,
  BulbOutlined,
  OpenAIOutlined,
} from '@ant-design/icons';

import { generateText } from '../../AIServer/Api';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import useLogger from '../../hooks/useLogger';
import useStore from '../../hooks/useStore';
import useControls from '../../hooks/useControls';
import fonts from '../../fonts/fonts';
import { Text3f } from '../../components/Text3f';
import { mxPopbar, mxResizable } from '../../utils/styles';
import { AuraMode } from '../editor/Board';
import { useTrace } from '../../hooks/useTrace';
import { TRACES } from '../../db/traces';

import { useTranslation } from 'react-i18next';

export function AText({ canvasRef, id, mode, onChange, onDelete }: any) {
  const log = useLogger('AText');

  const { content, cfg, activityId, type } = useStore((store) =>
    store.auraSlice.find(id),
  ) as any;

  log.debug('Render', cfg);

  const isAI = useStore((state) => state.playerSlice.isAI);
  const textRef = useRef<any>();
  const { viewport, size } = useThree();
  const widthFactor = size.width / viewport.width;
  const heightFactor = size.height / viewport.height;

  const [switchGuesture, setSwitchGesture] = useState<string>('drag');
  const [dragging, setDragging] = useState<boolean>(false);
  const [visibleControls, setVisibleControls] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [resizing, setResizing] = useState<boolean>(false);

  const { trace } = useTrace({});

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
        break;
      }
      default:
        break;
    }
  };

  //  ////////////////////////////////////////
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newText, setNewText] = useState('');
  const [genText, setGenText] = useState('');

  const handleReplaceText = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    handleChange({ content: { value: genText } });
    setIsModalVisible(false);
  };

  const handleGenerate = async () => {
    const generatedText = await generateText(newText);
    setGenText(generatedText);
  };
  ////////////////////////////////////////

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
      component: 'InputSlider',
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
      icon: <BgColorsOutlined />,
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
    // 
    isAI && {
      component: 'Button',
      icon: <OpenAIOutlined />,
      label: 'replaceText',
      key: 'replaceText',
      size: 'large',
      onClick: handleReplaceText,
      description: '',
    },
    // {
    //   component: 'TextGeneration',
    //   icon: <OpenAIOutlined />,
    //   label: 'Generate Text',
    //   key: 'text', // Changed to 'text' as we're dealing with text content
    //   size: 'large',
    //   description: '',
    //   tip: 'Generate text',
    //   capture: false, // Typically not applicable for text
    //   accept: 'text/plain', // Specifying accepted formats if applicable
    // },
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
              style={{
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
      if (item && typeof item !== 'boolean') {
        values[item.key] = item.defaultValue;
      }
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
    rotation: cfg?.rotation,
    position: cfg?.position,
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

  useEffect(() => {
    textRef?.current?.addEventListener('click', () => {
      setEditing(false);
    });

    return () => {
      textRef?.current?.removeEventListener('click', () => {
        setEditing(false);
      });
    };
  }, [textRef?.current]);

  const styles = useSpringWeb({
    opacity: editing ? 1 : content.value ? 0 : 1,
  });

  const gesture = useGesture(
    {
      onDragEnd: ({ offset: [x, y] }) => {
        setEditing(false);
        setDragging(false);
        setVisibleControls(true);

        if (switchGuesture === 'drag') {
          handleChange({
            cfg: {
              position: [x / widthFactor, -y / heightFactor, 0],
            },
          });
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
        setEditing(false);
        setDragging(true);
        setVisibleControls(false);
      },
      onDrag: ({ pinching, cancel, offset: [x, y] }) => {
        if (pinching || resizing) {
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
        pointer: { touch: true },
      },
    },
  );

  return (
    <>
      {mode === AuraMode.ARVIEW && (
        <group
          position={[
            (cfg.position[0] * cfg.factor + cfg.marker.width / 2) *
              cfg.marker.widthRatio,
            (cfg.position[1] * cfg.factor + cfg.marker.height / 2) *
              cfg.marker.heightRatio,
            0,
          ]}
          rotation={cfg.rotation}>
          <Text3f
            {...cfg.style}
            text={content.value}
            visible={true}
            maxWidth={cfg.width / cfg.style.fontSize}
            width={cfg.width * cfg.marker.widthRatio}
            height={cfg.height * cfg.marker.heightRatio}
            factor={1}
            fontSize={1}
            position={[
              (-cfg.width * cfg.marker.widthRatio) / 2,
              (cfg.height * cfg.marker.heightRatio) / 2,
              1,
            ]}
            scale={[
              cfg.style.fontSize * cfg.marker.widthRatio,
              cfg.style.fontSize * cfg.marker.heightRatio,
              0,
            ]}
          />
        </group>
      )}

      {mode === AuraMode.ARCANVAS && (
        <group
          position={cfg.position}
          rotation={cfg.rotation}>
          <Text3f
            {...cfg.style}
            visible={true}
            text={content.value}
            maxWidth={cfg.width / cfg.style.fontSize}
            width={cfg.width}
            height={cfg.height}
            factor={cfg.factor}
            fontSize={1}
            position={[
              -cfg.width / cfg.factor / 2,
              cfg.height / cfg.factor / 2,
              0,
            ]}
            scale={[
              cfg.style.fontSize / cfg.factor,
              cfg.style.fontSize / cfg.factor,
              0,
            ]}
          />
        </group>
      )}

      {mode === AuraMode.CANVAS && (
        <a3f.group
          {...spring}
          scale={[1, 1, 1]}>
          <Text3f
            {...cfg.style}
            //visible={!editing}
            visible={false}
            text={content.value}
            maxWidth={cfg.width / cfg.style.fontSize}
            width={cfg.width}
            height={cfg.height}
            factor={cfg.factor}
            fontSize={1}
            position={[
              -cfg.width / cfg.factor / 2,
              cfg.height / cfg.factor / 2,
              0,
            ]}
            scale={[
              cfg.style.fontSize / cfg.factor,
              cfg.style.fontSize / cfg.factor,
              0,
            ]}
          />
          <Html
            zIndexRange={[100, 100]}
            css={{
              left: -cfg.width / 2,
              top: -cfg.height / 2,
            }}>
            <Resizable
              css={{
                ...mxResizable,
                transform: `rotateZ(${-cfg.rotation[2]}rad)`,
              }}
              size={{
                width: cfg.width,
                height: cfg.height,
              }}
              onResizeStop={(e, direction, ref, d) => {
                setResizing(false);
                setEditing(false);
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
                <div
                  css={mxPopbar}
                  ref={textRef}>
                  <animated.div
                    //style={styles}
                    className={visibleControls ? 'active-aura' : ''}
                    {...gesture()}
                    css={{
                      width: '100%',
                      height: '100%',
                      visibility: 'visible',
                      // transform: `rotateZ(${-cfg.rotation[2]}rad)`,
                      touchAction: 'none',
                    }}
                    onPointerLeave={() => {
                      setEditing(false);
                    }}
                    onClick={() => {
                      setEditing(true);
                      setResizing(false);
                    }}>
                    <TextArea
                      style={{
                        ...cfg.style,
                        width: '100%',
                        height: '100%',
                        margin: '0 !important',
                        overflow: 'hidden',
                        lineHeight: 1.15,
                        resize: 'none',
                        outline: 'none',
                        border: 'none',
                        cursor: editing
                          ? 'cursor'
                          : switchGuesture === 'drag'
                          ? 'move'
                          : 'grab',
                      }}
                      value={content.value}
                      onChange={(value) => {
                        debounceChange({
                          content: { value: value },
                        });
                      }}
                    />
                  </animated.div>
                </div>
              </Popover>
            </Resizable>
            <Modal
              title='Enter the description about the image'
              visible={isModalVisible}
              onOk={handleOk}
              onCancel={() => setIsModalVisible(false)}
              bodyStyle={{ padding: '20px' }}
              style={{ top: '150px' }}
              footer={
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Button
                      onClick={handleOk}
                      style={{
                        marginLeft: '10px',
                        borderRadius: '50px',
                      }}>
                      OK
                    </Button>
                  </div>
                </div>
              }>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  style={{
                    height: '40px',
                    borderRadius: '5px',
                    padding: '10px',
                    border: '1px solid grey',
                    width: '100%',
                  }}
                />
                <Button
                  type='primary'
                  onClick={handleGenerate}
                  style={{ marginBottom: '20px', borderRadius: '50px' }}>
                  Generate
                </Button>
              </div>
              <textarea
                style={{
                  marginTop: '20px',
                  width: '95%',
                  color: 'black',
                  fontSize: '16px',
                  padding: '10px',
                  borderRadius: '5px',
                }}>
                {genText}
              </textarea>
            </Modal>
          </Html>
        </a3f.group>
      )}
    </>
  );
}

export const TextArea = ({
  value,
  onChange,
  onClick,
  style,
  visibleControls,
}: any) => {
  const [val, setVal] = useState(value);

  // Update local state when prop `value` changes /// 
  useEffect(() => {
    setVal(value);
  }, [value]);

  const { t } = useTranslation();

  const handleChange = useCallback((value) => {
    setVal(value);
    onChange(value);
  }, []);

  return (
    <textarea
      onClick={onClick}
      placeholder={t('common.edit-placeholder') as string}
      css={style}
      value={val}
      onChange={(e) => handleChange(e.target.value)}></textarea>
  );
};
