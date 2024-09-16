import React, { useState } from 'react';
import { Button, Input, Modal, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { generateText } from '../AIServer/Api';

import { CheckOutlined, RedoOutlined } from '@ant-design/icons';

export function TextGeneration({ visible, onChange, onCancel }) {
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [inputPrompt, setInputPrompt] = useState<string>('');

  const { t } = useTranslation();

  const handleGenerate = async () => {
    try {
      const newText = await generateText(inputPrompt);
      setGeneratedText(newText);
      console.log('generatedText', newText);
    } catch (error) {
      console.error('Error generating text:', error);
    }
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
          {generatedText ? (
            <>
              <Button
                shape='round'
                icon={<RedoOutlined />}
                onClick={(e) => {
                  e.preventDefault();
                  setGeneratedText(null);
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
                  onChange(generatedText);
                  setGeneratedText(null);
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
      {generatedText ? (
        <Typography.Text
          style={{
            display: 'block',
            margin: '20px 0',
            whiteSpace: 'pre-wrap',
            background: '#f0f0f0',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #d9d9d9',
            width: '95%',
          }}>
          {generatedText}
        </Typography.Text>
      ) : null}
    </Modal>
  );
}
