import React, { useLayoutEffect, useState } from 'react';
import useSound from 'use-sound';
import { useSpring, animated } from '@react-spring/web';
import { useThree } from '@react-three/fiber';

import { Button, Typography } from 'antd';

import {
  EyeOutlined,
  FontSizeOutlined,
  LinkOutlined,
  MessageOutlined,
  OpenAIOutlined,
  PlaySquareOutlined,
  SearchOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import ThreeDRotationOutlinedIcon from '@mui/icons-material/ThreeDRotationOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined'; // Import the chat icon

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import { getID } from '../../utils/uniqueId';
import useStore from '../../hooks/useStore';
import { useAura } from '../../hooks/useAura';
import { RxColOp } from '../../db/types';
import popSnd from '../../assets/sounds/pop.mp3';
import { EditorStatus } from './slice';
import { Html } from '@react-three/drei';
import { calcAspect } from '../../hooks/useAspect';
import { useTrace } from '../../hooks/useTrace';
import { TRACES } from '../../db/traces';

import { useTranslation } from 'react-i18next';
import MediaModal from '@/components/MediaModal';
import { ASticker } from '../aura/ASticker';

export function Palette({ meta }: { meta: Record<string, unknown> }) {
  const [playPop] = useSound(popSnd);
  const { onRxColAura } = useAura();

  const markerCfg = useStore((state) => state.mkUploadSlice.markerCfg);
  const status = useStore((state) => state.editorSlice.status);
  const activityId = useStore((state) => state.activitySlice.currActitityId);
  const isAI = useStore((state) => state.playerSlice.isAI);
  const { markerImagesCfg } = useStore((store) =>
    store.activitySlice.get(activityId),
  ) as any;

  const disable = status === EditorStatus.Marker;
  const remove =
    status === EditorStatus.AuraPlay || status === EditorStatus.Tracking;
  const styles = useSpring({
    opacity: disable ? 0.4 : 1,
  });

  const { size, viewport } = useThree();
  const setMarkerCfg = useStore((state) => state.mkUploadSlice.setMarkerCfg);

  const { trace } = useTrace({});

  const { t } = useTranslation();

  const handleAddAura = ({ activityId, type, content, cfg, meta }) => {
    onRxColAura(
      RxColOp.Add,
      {
        id: getID(),
        activityId,
        type,
        content,
        cfg: {
          ...cfg,
          ...markerCfg,
        },
        meta,
      },
      [],
    );

    trace(TRACES.ADD_AURA);

    playPop();
  };

  useLayoutEffect(() => {
    const { newWidth, newHeight } = calcAspect({
      width: markerImagesCfg?.[0]?.worldWidth,
      height: markerImagesCfg?.[0]?.worldHeight,
      maxWidth: (2 * size?.width) / 3,
      maxHeight: (2 * size?.height) / 3,
    });

    setMarkerCfg({
      factor: viewport.factor,
      size,
      marker: {
        width: newWidth,
        height: newHeight,
        widthRatio: markerImagesCfg?.[0]?.worldWidth / newWidth,
        heightRatio: markerImagesCfg?.[0]?.worldHeight / newHeight,
      },
    });
  }, [markerImagesCfg]);

  const btnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '@media (max-width: 532px)': {
      width: 32,
      height: 32,
      '& .ant-btn-icon': {
        margin: '0px !important',
      },
    },
  };

  const iconBtnStyle = {
    fontSize: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    '@media (max-width: 532px)': {
      fontSize: 20,
      margin: 0,
    },
  };

  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Html wrapperClass='fullScreenLeft'>
      <animated.div
        style={styles}
        css={{
          zIndex: 2,
          with: '32px !important',
          display: remove ? 'none' : 'flex',
          gap: 6,
          overflow: 'hidden',
          flexDirection: 'column',
          background: 'none',
          userSelect: 'none',
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          '@media (max-width: 532px)': {
            '& .palette-btn-label': {
              display: 'none',
            },
          },
        }}
        draggable={false}>
        <Button
          disabled={disable}
          size='middle'
          shape='round'
          icon={<FontSizeOutlined css={iconBtnStyle} />}
          css={btnStyle}
          onClick={handleAddAura.bind(null, {
            activityId,
            type: 'AText',
            content: { value: '' },
            meta,
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
              height: 150,
              position: [0, 0, 0],
              scale: [1, 1, 1],
              rotation: [0, 0, 0],
            },
          })}>
          <Typography.Text className='palette-btn-label'>
            {t('common.text')}
          </Typography.Text>
        </Button>
        <Button
          disabled={disable}
          size='middle'
          shape='round'
          css={btnStyle}
          icon={<ImageOutlinedIcon css={iconBtnStyle} />}
          onClick={handleAddAura.bind(null, {
            activityId,
            type: 'AImage',
            content: {},
            meta,
            cfg: {
              width: 156,
              height: 96,
              position: [0, 0, 0],
              scale: [1, 1, 1],
              rotation: [0, 0, 0],
            },
          })}>
          <Typography.Text className='palette-btn-label'>
            {t('common.image')}
          </Typography.Text>
        </Button>
        <Button
          disabled={disable}
          size='middle'
          shape='round'
          css={btnStyle}
          icon={<PlaySquareOutlined css={iconBtnStyle} />}
          onClick={handleAddAura.bind(null, {
            activityId,
            type: 'AVideo',
            content: {},
            meta,
            cfg: {
              width: 200,
              height: 156,
              position: [0, 0, 0],
              scale: [1, 1, 1],
              rotation: [0, 0, 0],
            },
          })}>
          <Typography.Text className='palette-btn-label'>
            {t('common.video')}
          </Typography.Text>
        </Button>
        <Button
          disabled={disable}
          size='middle'
          shape='round'
          css={btnStyle}
          icon={<SearchOutlined css={iconBtnStyle} />}
          onClick={showModal}>
          <Typography.Text className='palette-btn-label'>
            {t('common.stickers')}
          </Typography.Text>
        </Button>
        <MediaModal
          visible={isModalVisible}
          onClose={handleCancel}
          onImageClick={handleAddAura}
        />
        <Button
          disabled={disable}
          size='middle'
          shape='round'
          css={btnStyle}
          icon={<SoundOutlined css={iconBtnStyle} />}
          onClick={handleAddAura.bind(null, {
            activityId,
            type: 'AAudio',
            content: {},
            meta,
            cfg: {
              width: 200,
              height: 156,
              position: [0, 0, 0],
              scale: [1, 1, 1],
              rotation: [0, 0, 0],
            },
          })}>
          <Typography.Text className='palette-btn-label'>
            {t('common.audio')}
          </Typography.Text>
        </Button>
        <Button
          disabled={disable}
          size='middle'
          shape='round'
          css={btnStyle}
          icon={<MessageOutlined css={iconBtnStyle} />}
          onClick={handleAddAura.bind(null, {
            activityId,
            type: 'APopover',
            content: {
              value: { title: t('common.edit-title') },
            },
            meta,
            cfg: {
              width: 180,
              height: 50,
              position: [0, 0, 0],
              scale: 1,
              rotation: [0, 0, 0],
              style: {
                fontFamily: 'Quicksand',
                fontSize: 24,
                color: '#000000',
                background: '#8ed1fc',
                fontVariant: 'normal',
                fontStyle: 'normal',
                fontWeight: 'bold',
                textAlign: 'left',
              },
            },
          })}>
          <Typography.Text className='palette-btn-label'>
            {t('common.sheet')}
          </Typography.Text>
        </Button>
        <Button
          disabled={disable}
          size='middle'
          shape='round'
          css={btnStyle}
          icon={<ThreeDRotationOutlinedIcon css={iconBtnStyle} />}
          onClick={handleAddAura.bind(null, {
            activityId,
            type: 'A3d',
            content: {},
            meta,
            cfg: {
              width: 200,
              height: 200,
              position: [0, 0, 0],
              scale: [1, 1, 1],
              rotation: [0, 0, 0],
            },
          })}>
          <Typography.Text className='palette-btn-label'>
            {t('common.object')}
          </Typography.Text>
        </Button>
        {isAI && (
          <Button
            disabled={disable}
            size='middle'
            shape='round'
            icon={<OpenAIOutlined css={iconBtnStyle} />}
            css={btnStyle}
            onClick={handleAddAura.bind(null, {
              activityId,
              type: 'AGeneration',
              content: { value: '' },
              meta,
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
                height: 150,
                position: [0, 0, 0],
                scale: [1, 1, 1],
                rotation: [0, 0, 0],
              },
            })}>
            <Typography.Text className='palette-btn-label'>
              {t('common.gpt')}
            </Typography.Text>
          </Button>
        )}
        <Button
          disabled={disable}
          size='middle'
          shape='round'
          icon={<LinkOutlined css={iconBtnStyle} />}
          css={btnStyle}
          onClick={handleAddAura.bind(null, {
            activityId,
            type: 'ALink',
            content: { value: '' }, // Default link text
            meta,
            cfg: {
              style: {
                fontFamily: 'Roboto',
                fontSize: 24,
                color: '#0000EE', // Typically blue for links
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
            },
          })}>
          <Typography.Text className='palette-btn-label'>
            {t('common.link')}
          </Typography.Text>
        </Button>
        {/* <Button
          disabled={disable}
          size='middle'
          shape='round'
          icon={<EyeOutlined css={iconBtnStyle} />}
          css={btnStyle}
          onClick={handleAddAura.bind(null, {
            activityId,
            type: 'AList',
            content: { value: '' },
            meta,
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
              height: 150,
              position: [0, 0, 0],
              scale: [1, 1, 1],
              rotation: [0, 0, 0],
            },
          })}>
          <Typography.Text className='palette-btn-label'>
            {t('List')}
          </Typography.Text>
        </Button> */}
      </animated.div>
    </Html>
  );
}
