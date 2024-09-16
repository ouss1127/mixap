import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useSpring, a as a3f } from '@react-spring/three';
import { animated, useSpring as useSpringWeb } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import { Resizable } from 're-resizable';
import { debounce } from 'lodash';
import { Spinner } from '../../components/Spinner'; // Import the Spinner component

import {
  Typography,
  Popover,
  Button,
  Radio,
  Checkbox,
  Upload,
  Space,
  Divider,
} from 'antd';
import { Modal, Input } from 'antd';

import SwipeIcon from '@mui/icons-material/Swipe';
import TitleOutlinedIcon from '@mui/icons-material/TitleOutlined';

import {
  DeleteOutlined,
  BulbOutlined,
  UploadOutlined,
  InboxOutlined,
  CameraOutlined,
  OpenAIOutlined,
  SaveOutlined,
} from '@ant-design/icons';

import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true,
});

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import useStore from '../../hooks/useStore';
import useControls from '../../hooks/useControls';
import fonts from '../../fonts/fonts';
import { Text3f } from '../../components/Text3f';
import { mxPopbar, mxResizable } from '../../utils/styles';
import { AuraMode } from '../editor/Board';
import { useTrace } from '../../hooks/useTrace';
import { TRACES } from '../../db/traces';

import { useTranslation } from 'react-i18next';
import { data } from '@tensorflow/tfjs';
import { t } from 'i18next';
import { Snapshot } from '@/components/Snapshot';
import { describeImage } from '@/AIServer/Api';
import { getID } from '@/utils/uniqueId';
import { RxColOp } from '@/db/types';
import { useAura } from '@/hooks';
import InputFile from '@/components/InputFile';
import { UploadChangeParam, UploadFile } from 'antd/es/upload';

export function AGeneration({ canvasRef, id, mode, onChange, onDelete }: any) {
  const { content, cfg, activityId, type } = useStore((store) =>
    store.auraSlice.find(id),
  ) as any;

  const markerImages = [];
  console.log(markerImages);

  const textRef = useRef<any>();
  const textGenRef = useRef<any>();
  const { onRxColAura } = useAura();

  const { viewport, size } = useThree();
  const widthFactor = size.width / viewport.width;
  const heightFactor = size.height / viewport.height;
  const markerCfg = useStore((state) => state.mkUploadSlice.markerCfg);

  const [switchGuesture, setSwitchGesture] = useState<string>('drag');
  const [dragging, setDragging] = useState<boolean>(false);
  const [visibleControls, setVisibleControls] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [resizing, setResizing] = useState<boolean>(false);
  const [openSnap, setOpenSnap] = useState<boolean>(false);
  const [imgSnap, setImgSnap] = useState<string | undefined>(undefined);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newText, setNewText] = useState('');
  const [genText, setGenText] = useState('');
  const [loading, setLoading] = useState<boolean>(false); // Add loading state
  const [generatedContent, setGeneratedContent] = useState(false);

  const [selectedContentType, setSelectedContentType] =
    useState<ContentType | null>(null);
  const [imgUpload, setImgUpload] = useState<string | undefined>(undefined);

  const { trace } = useTrace({});

  const handleControlsVisibility = (visible) => {
    setVisibleControls(visible);
  };

  const handleReplaceText = () => {
    setIsModalVisible(true);
  };

  const handleAddAText = ({ activityId, value }) => {
    onRxColAura(
      RxColOp.Add,
      {
        id: getID(),
        activityId,
        type: 'AText',
        content: { value },
        meta: {},
        cfg: {
          style: {
            fontFamily: 'Roboto',
            fontSize: 24,
            color: '#000',
            background: 'transparent',
            textAlign: 'left',
            fontVariant: 'normal',
            fontStyle: 'normal',
            fontWeight: 'normal',
          },
          width: 200,
          height: 50,
          position: [0, 0, 0],
          scale: [1, 1, 1],
          rotation: [0, 0, 0],
          ...markerCfg,
        },
      },
      [],
    );

    trace(TRACES.ADD_AURA);

    //playPop();
  };

  const handleOk = () => {
    //handleChange({ content: { value: genText } });
    setIsModalVisible(false);

    // image tagging
    if (selectedContentType && selectedContentType.includes('Tags')) {
      const content = textGenRef.current.value || '';
      const tags = content.replaceAll(/- |,|;/g, '').split('\n');

      tags.forEach((tag) => {
        handleAddAText({ activityId, value: tag });
      });

      console.log('new tags', tags);
    } else if (
      selectedContentType &&
      selectedContentType.includes('TDescription')
    ) {
      const content = textGenRef.current.value || '';
      handleAddAText({ activityId, value: content });
    }
  };

  type ContentType = 'Tags' | 'TDescription' | 'ADescription';

  const handleRadioChange = (selectedValue: ContentType) => {
    setSelectedContentType(selectedValue);
  };

  const handleGenerate = async () => {
    setLoading(true); // Set loading to true when starting audio generation
    try {
      let prompt = newText;

      if ((selectedContentType as unknown as string[]).includes('Tags')) {
        prompt +=
          ' . Generate just the labels without any other information and numerotation.';
      }
      // if ((selectedContentTypes as string[]).includes('TDescription')) {
      //   prompt += '';
      // }
      if (
        (selectedContentType as unknown as string[]).includes('ADescription')
      ) {
        prompt += ' I want a detailed audio description.';
      }
      const images: any[] = [];
      if (imgSnap) {
        images.push(imgSnap);
      }
      if (imgUpload) {
        images.push(imgUpload);
      }

      const completion = await describeImage(prompt, images);

      //setGenText(completion.choices[0].message.content || '');

      textGenRef.current.value = completion.choices[0].message.content || '';
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false); // Set loading to false after audio generation
    setGeneratedContent(true);
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

    // added by me
    {
      component: 'Button',
      icon: <OpenAIOutlined />,
      label: 'replaceText',
      key: 'replaceText',
      size: 'large',
      onClick: handleReplaceText,
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
            visible={!editing}
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
                    style={styles}
                    className={visibleControls ? 'active-aura' : ''}
                    {...gesture()}
                    css={{
                      width: '100%',
                      height: '100%',
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
              title={t('common.generate-content')}
              visible={isModalVisible}
              onOk={handleOk}
              onCancel={() => setIsModalVisible(false)}
              bodyStyle={{ padding: '20px' }}
              style={{ top: '150px' }}
              footer={null}>
              {loading && <Spinner />} {/* Show Spinner when loading */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}>
                <textarea
                  style={{
                    height: '40px',
                    borderRadius: '5px',
                    padding: '10px',
                    border: '1px solid grey',
                  }}
                  placeholder={t('common.enter-text') || ''}
                  defaultValue={newText}
                  onChange={(e) => setNewText(e.target.value)}
                />
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    flexDirection: 'column',
                    justifyContent: 'right',
                  }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexDirection: 'row',
                      justifyContent: 'right',
                    }}>
                    <Snapshot
                      visible={openSnap}
                      onCancel={() => setOpenSnap(false)}
                      onChange={(imgBase64) => {
                        console.log('snap data', imgBase64);
                        setImgSnap(imgBase64);
                        setOpenSnap(false);
                      }}
                    />
                    <Button
                      onClick={() => setOpenSnap(true)}
                      icon={<CameraOutlined />}></Button>
                    <Upload
                      showUploadList={false}
                      beforeUpload={(file: UploadFile<any>) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file as any);
                        reader.onload = (e) => {
                          setImgUpload(e.target?.result as string);
                        };
                        return false;
                      }}
                      accept={'.jpg,.jpeg,.png,.svg'}
                      multiple={false}>
                      <Button icon={<UploadOutlined />}></Button>
                    </Upload>
                    <Button
                      type='primary'
                      onClick={handleGenerate}
                      icon={<OpenAIOutlined />}></Button>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}>
                    {imgSnap && (
                      <div style={{ position: 'relative' }}>
                        <img
                          style={{
                            objectFit: 'cover',
                            width: '200px', // specify width
                            height: '200px', // specify height
                          }}
                          src={imgSnap}
                          alt=''
                        />
                        <button
                          style={{
                            position: 'absolute',
                            top: 1,
                            right: 1,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            background: '#ff6347',
                            cursor: 'pointer',
                            lineHeight: '20px',
                            textAlign: 'center',
                          }}
                          onClick={() => setImgSnap(undefined)}>
                          X
                        </button>
                      </div>
                    )}
                    {imgUpload && (
                      <div style={{ position: 'relative' }}>
                        <img
                          style={{
                            objectFit: 'cover',
                            width: '200px', // specify width
                            height: '200px', // specify height
                          }}
                          src={imgUpload}
                          alt=''
                        />
                        <button
                          style={{
                            position: 'absolute',
                            top: 1,
                            right: 1,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            background: '#ff6347',
                            cursor: 'pointer',
                            lineHeight: '20px',
                            textAlign: 'center',
                          }}
                          onClick={() => setImgUpload(undefined)}>
                          X
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <Divider></Divider>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                  <Radio.Group
                    optionType='button'
                    buttonStyle='solid'
                    onChange={(e) => handleRadioChange(e.target.value)}>
                    <Radio value='Tags'> {t('common.tagging')}</Radio>
                    <Radio value='TDescription'>
                      {t('common.text-description')}
                    </Radio>
                    <Radio value='ADescription'>
                      {t('common.audio-description')}
                    </Radio>
                  </Radio.Group>
                </div>
                {selectedContentType === 'Tags' && (
                  <p style={{ color: 'red', fontSize: '12px' }}>
                    Merci de structurer le message sous forme d’une tag par
                    ligne
                  </p>
                )}
                <textarea
                  style={{
                    height: '80px',
                    borderRadius: '5px',
                    padding: '10px',
                    border: '1px solid grey',
                  }}
                  ref={textGenRef}
                  defaultValue={''}></textarea>
              </div>
              {generatedContent && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}>
                  <Button
                    onClick={handleOk}
                    style={{
                      marginTop: '10px',
                    }}
                    icon={<SaveOutlined />}></Button>
                </div>
              )}
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

  // Update local state when prop `value` changes /// Added by me
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
      placeholder={t('common.edit-generator') as string}
      css={style}
      value={val}
      onChange={(e) => handleChange(e.target.value)}></textarea>
  );
};
