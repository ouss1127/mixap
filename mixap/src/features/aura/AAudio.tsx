import React, { useState, useMemo, useCallback } from 'react';
import { useSpring, a as a3f } from '@react-spring/three';
import { useGesture } from '@use-gesture/react';
import { useThree } from '@react-three/fiber';
import { animated } from '@react-spring/web';
import { Html } from '@react-three/drei';

import { Button, Input, Modal, Popover, Typography } from 'antd';

import {
  DeleteOutlined,
  UploadOutlined,
  AudioOutlined,
  BulbOutlined,
  OpenAIOutlined,
} from '@ant-design/icons';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import useControls from '../../hooks/useControls';
import useLogger from '../../hooks/useLogger';
import useStore from '../../hooks/useStore';
import { Video3f } from '../../components/Video3f';
// import { useAspect } from '../../hooks/useAspect';
import { AuraMode } from '../editor/Board';
import { getType } from '../../utils/mimetype';
import { useTrace } from '../../hooks/useTrace';
import { TRACES } from '../../db/traces';

import { generateAudioSpeech } from '../../AIServer/Api';

import { useTranslation } from 'react-i18next';

export function AAudio({
  canvasRef,
  id,
  anchoring,
  mode,
  onChange,
  onDelete,
}: any) {
  const log = useLogger('AAudio');

  log.debug('Render');

  const { content, cfg, activityId, type } = useStore((store) =>
    store.auraSlice.find(id),
  ) as any;

  const { viewport, size } = useThree();

  const widthFactor = size.width / viewport.width;
  const heightFactor = size.height / viewport.height;

  const [, setDragging] = useState<boolean>(false);
  const [visibleControls, setVisibleControls] = useState<boolean>(true);

  const { trace } = useTrace({});

  const { t } = useTranslation();

  const handleControlsVisibility = (visible) => {
    setVisibleControls(visible);
  };

  // Added by me ////////////////////////////////////////
  const isAI = useStore((state) => state.playerSlice.isAI);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newText, setNewText] = useState('');
  const [generatedAudio, setGeneratedAudio] = useState('');

  const showModal = () => {
    setIsModalVisible(true);
  };

  const openPopup = () => {
    showModal();
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleGenerate = async () => {
    try {
      const apiKey = 'sk-proj-yESQDypXwephO39cjnqlT3BlbkFJUUJMBHHNkoPW2N90wbQ5'; // Replace 'YOUR_API_KEY' with your actual API key

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: 'alloy',
          input: newText,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();

      // Revoke the old blob URL
      if (generatedAudio) {
        URL.revokeObjectURL(generatedAudio);
      }

      const url = URL.createObjectURL(blob);
      setGeneratedAudio(url);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  ///////////////////////////////////////////////////////

  const options = [
    {
      component: 'InputFile',
      icon: <UploadOutlined />,
      width: 46,
      label: 'fileUpload',
      key: 'file',
      defaultValue: 400,
      size: 'large',
      description: '',
      tip: 'un audio',
      accept:
        'audio/mpeg, audio/mp3, audio/webm, audio/wav, audio/ogg, audio/x-m4a',
    },
    // {
    //   component: 'InputFile',
    //   icon: <AudioOutlined />,
    //   width: 46,
    //   label: 'fileUpload-1',
    //   key: 'file',
    //   defaultValue: 400,
    //   size: 'large',
    //   description: '',
    //   tip: 'un audio',
    //   capture: true,
    //   accept:
    //     'audio/mpeg, audio/mp3, audio/webm, audio/wav, audio/ogg, audio/x-m4a',
    // },
    {
      component: 'InputAudio',
      icon: <AudioOutlined />,
      width: 46,
      label: 'fileUpload-2',
      key: 'file',
      defaultValue: 400,
      size: 'large',
      description: '',
      tip: 'un audio',
      accept:
        'audio/mpeg, audio/mp3, audio/webm, audio/wav, audio/ogg, audio/x-m4a',
    },
    // added by me
    isAI && {
      component: 'Button',
      icon: <BulbOutlined />,
      label: 'replaceText',
      key: 'replaceText',
      size: 'large',
      description: '',
      tip: 'audio file',
      capture: true,
      accept: 'audio/mpeg, audio/wav',
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
            handleChange({
              content: {
                file: allFields.file,
                type: getType(allFields.file?.name, type),
              },
            });
        })();
      }
    },
  });

  const [spring, api] = useSpring<any>(() => ({
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
        if (pinching) return cancel();
        api.start({
          position: [x / widthFactor, -y / heightFactor, 0],
        });
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
          scale={[1, 1, 1]}
          position={[
            (cfg.position[0] * cfg.factor + cfg.marker.width / 2) *
              cfg.marker.widthRatio,
            (cfg.position[1] * cfg.factor + cfg.marker.height / 2) *
              cfg.marker.heightRatio,
            0,
          ]}>
          <Video3f
            audioOnly={true}
            position={[0, 0, 0]}
            scale={[1, 1, 1]}
            file={content.file}
            width={cfg.width * cfg.factor}
            height={cfg.height * cfg.factor}
            factor={cfg.factor}
            anchoring={anchoring}
          />
        </group>
      )}

      {mode === AuraMode.ARCANVAS && (
        <group position={cfg.position}>
          <Video3f
            position={cfg.position}
            audioOnly={true}
            scale={[1, 1, 1]}
            file={content.file}
            width={cfg.width}
            height={cfg.height}
            factor={cfg.factor}
          />
        </group>
      )}

      {mode === AuraMode.CANVAS && (
        // @ts-ignore
        <a3f.group {...spring}>
          <Video3f
            audioOnly={true}
            file={content.file}
            width={cfg.width}
            height={cfg.height}
            factor={cfg.factor}
          />
          <Html
            zIndexRange={[100, 100]}
            css={{
              width: cfg.width,
              height: cfg.height,
              left: -cfg.width / 2,
              top: -cfg.height / 2,
              cursor: 'move',
              border: '2px dashed var(--hot-color)',
              '&:active, &:hover': {
                border: '2px solid var(--hot-color)',
              },
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
                  display: 'flex',
                  touchAction: 'none',
                }}>
                {!content.file && (
                  <Typography.Title level={5}>
                    {t('common.click-edit')}
                  </Typography.Title>
                )}
              </animated.div>
            </Popover>
            {/* added by me */}
            <Modal
              title='Enter the text you want to generate audio for:'
              visible={isModalVisible}
              onOk={handleOk}
              onCancel={() => setIsModalVisible(false)}
              bodyStyle={{ padding: '20px' }}
              style={{ top: '150px' }}
              footer={
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    onClick={() => setIsModalVisible(false)}
                    style={{
                      borderColor: '#f44336',
                      color: '#f44336',
                      borderRadius: '50px',
                    }}>
                    Cancel
                  </Button>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}>
                    <Button
                      onClick={handleOk}
                      style={{
                        //backgroundColor: '#4CAF50',
                        borderColor: '#4CAF50',
                        color: '#4CAF50',
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
                <Input
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  style={{ marginBottom: '20px', borderRadius: '50px' }}
                />
                <Button
                  onClick={handleGenerate}
                  style={{ marginBottom: '20px', borderRadius: '50px' }}>
                  Generate
                </Button>
              </div>
              {generatedAudio && (
                <audio
                  controls
                  key={generatedAudio}>
                  <source
                    src={generatedAudio}
                    type='audio/mpeg'
                  />
                  Your browser does not support the audio element.
                </audio>
              )}
            </Modal>
          </Html>
        </a3f.group>
      )}
    </>
  );
}
