import React, { useState, useRef } from 'react';
import { Button, Modal, Space, Typography } from 'antd';
import Webcam from 'react-webcam';

import useLogger from '../hooks/useLogger';
import useStore from '../hooks/useStore';

import { useTranslation } from 'react-i18next';

import { QrScanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

export function QRScanner({ visible, onCancel }: any) {
  const log = useLogger('QRScanner');
  const navigate = useNavigate();

  const openQRScannerModal = useStore(
    (state) => state.activitySlice.openQRScannerModal,
  );
  const hideQRScannerModal = useStore(
    (state) => state.activitySlice.hideQRScannerModal,
  );

  const handleDecode = (result) => {
    hideQRScannerModal();
    navigate(result);
  };

  const { t } = useTranslation();

  log.debug('open', openQRScannerModal);

  return (
    <Modal
      title={t('common.scan-qr')}
      visible={openQRScannerModal}
      open={visible}
      onCancel={hideQRScannerModal}
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
          }}></Space>
      }>
      <QrScanner
        onDecode={(result) => handleDecode(result)}
        onError={(error) => console.log(error?.message)}
      />
    </Modal>
  );
}
