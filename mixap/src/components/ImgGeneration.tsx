import React, { useState, useCallback } from 'react';
import { Button, Input, Modal, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { generateImage } from '../AIServer/Api';
import { Spinner } from './Spinner'; // Make sure to import the Spinner component

import { CheckOutlined, RedoOutlined } from '@ant-design/icons';

export function ImgGeneration({ visible, onChange, onCancel }: any) {
  const [picture, setPicture] = useState<string | null>(null);
  const [inputPrompt, setinputPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // Add loading state

  const { t } = useTranslation();

  const handleGenerate = async () => {
    setLoading(true); // Set loading to true when starting image generation
    const { imageB64, file } = (await generateImage(inputPrompt)) as any;
    setPicture(imageB64);
    console.log('generatedImage', imageB64, file);
    setLoading(false); // Set loading to false after image generation
  };

  return (
    <Modal
      title={t('common.generate-content')}
      visible={visible}
      onCancel={() => {
        onCancel();
      }}
      destroyOnClose
      bodyStyle={{
        padding: 2,
      }}
      footer={
        <Space direction='horizontal'>
          {picture ? (
            <>
              <Button
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
              shape='round'
              type='primary'
              onClick={handleGenerate}>
              <Typography.Text className='snap-btn-label'>
                {t('common.generate')}
              </Typography.Text>
            </Button>
          )}
        </Space>
      }>
      <textarea
        value={inputPrompt}
        onChange={(e) => setinputPrompt(e.target.value)}
        style={{
          height: '40px',
          borderRadius: '5px',
          padding: '10px',
          border: '1px solid grey',
          width: '95%',
        }}
      />
      {loading && <Spinner />} {/* Show Spinner when loading */}
      {picture ? (
        <img
          src={picture}
          style={{
            width: '100%',
            height: '50%',
            objectFit: 'cover',
          }}
        />
      ) : null}
    </Modal>
  );
}
