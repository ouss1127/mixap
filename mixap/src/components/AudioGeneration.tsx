import React, { useState } from 'react';
import { Button, Input, Modal, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { generateAudioSpeech } from '../AIServer/Api';
import { Spinner } from './Spinner'; // Import the Spinner component

import { CheckOutlined, RedoOutlined } from '@ant-design/icons';

export function AudioGeneration({ visible, onChange, onCancel }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // Add loading state

  const { t } = useTranslation();

  const handleGenerate = async () => {
    setLoading(true); // Set loading to true when starting audio generation
    try {
      const { url } = await generateAudioSpeech(inputPrompt);
      setAudioUrl(url);
      console.log('generatedAudio', url);
    } catch (error) {
      console.error('Error generating audio:', error);
    }
    setLoading(false); // Set loading to false after audio generation
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
          {audioUrl ? (
            <>
              <Button
                shape='round'
                icon={<RedoOutlined />}
                onClick={(e) => {
                  e.preventDefault();
                  setAudioUrl(null);
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
                  onChange(audioUrl);
                  setAudioUrl(null);
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
        onChange={(e) => setInputPrompt(e.target.value)}
        style={{
          height: '40px',
          borderRadius: '5px',
          padding: '10px',
          border: '1px solid grey',
          width: '95%',
        }}
      />
      {loading && <Spinner />} {/* Show Spinner when loading */}
      {audioUrl ? (
        <audio
          controls
          src={audioUrl}
          style={{
            width: '100%',
            marginTop: '20px',
          }}
        />
      ) : null}
    </Modal>
  );
}
