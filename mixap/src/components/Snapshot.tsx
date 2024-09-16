import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Modal, Space, Typography } from 'antd';
import Webcam from 'react-webcam';

import { useTranslation } from 'react-i18next';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import CameraswitchOutlinedIcon from '@mui/icons-material/CameraswitchOutlined';
import { CameraOutlined, CheckOutlined, RedoOutlined } from '@ant-design/icons';

export function Snapshot({ visible, onChange, onCancel }: any) {
  const [picture, setPicture] = useState<string | null>(null);
  const [isWebcamFacingUser, switchCamera] = useState(false);
  const webcamRef = useRef<any>(null);

  const { t } = useTranslation();

  const capture = useCallback(() => {
    const pictureSrc = webcamRef?.current?.getScreenshot();
    setPicture(pictureSrc);
  }, []);

  return (
    <Modal
      title={t('common.take-photo')}
      open={visible}
      onCancel={() => {
        picture && setPicture(null);
        onCancel();
      }}
      destroyOnClose
      css={{
        zIndex: 300,
      }}
      bodyStyle={{
        padding: 2,
        zIndex: 300,
      }}
      footer={
        <Space
          direction='horizontal'
          css={{
            '@media (max-width: 532px)': {
              '& .snap-btn-label': {
                display: 'none',
              },
              '& .ant-btn-icon': {
                margin: '0px !important',
              },
            },
          }}>
          <Button
            css={{
              '@media (max-width: 532px)': {
                width: 32,
                height: 32,
              },
            }}
            shape='round'
            icon={<CameraswitchOutlinedIcon />}
            onClick={(e) => {
              e.preventDefault();
              switchCamera((isWebcamFacingUser) => !isWebcamFacingUser);
            }}>
            <Typography.Text className='snap-btn-label'>
              {t('common.camera')}
            </Typography.Text>
          </Button>
          {picture ? (
            <>
              <Button
                css={{
                  '@media (max-width: 532px)': {
                    width: 32,
                    height: 32,
                  },
                }}
                shape='round'
                icon={<RedoOutlined />}
                onClick={(e) => {
                  e.preventDefault();
                  setPicture(null);
                }}>
                <Typography.Text className='snap-btn-label'>
                  {t('common.retry')}
                </Typography.Text>
              </Button>
              <Button
                css={{
                  '@media (max-width: 532px)': {
                    width: 32,
                    height: 32,
                  },
                }}
                shape='round'
                type='primary'
                icon={<CheckOutlined />}
                onClick={(e) => {
                  e.preventDefault();
                  onChange(picture);
                  setPicture(null);
                }}>
                <Typography.Text className='snap-btn-label'>
                  {t('common.save')}
                </Typography.Text>
              </Button>
            </>
          ) : (
            <Button
              css={{
                '@media (max-width: 532px)': {
                  width: 32,
                  height: 32,
                },
              }}
              shape='round'
              type='primary'
              icon={<CameraOutlined />}
              onClick={(e) => {
                e.preventDefault();
                capture();
              }}>
              <Typography.Text className='snap-btn-label'>
                {t('common.snap')}
              </Typography.Text>
            </Button>
          )}
        </Space>
      }>
      {picture ? (
        <img
          src={picture}
          css={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <Webcam
          css={{ zIndex: 300 }}
          audio={false}
          ref={webcamRef}
          screenshotQuality={0.8}
          height={'100%'}
          width={'100%'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          screenshotFormat='image/jpeg'
          videoConstraints={{
            facingMode: isWebcamFacingUser ? 'user' : 'environment',
          }}
        />
      )}
    </Modal>
  );
}
