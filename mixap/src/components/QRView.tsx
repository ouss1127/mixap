import React, { useState, useRef, useCallback } from 'react';
import { Button, Modal, Space, Typography, notification, Anchor } from 'antd';

import useLogger from '../hooks/useLogger';
import useStore from '../hooks/useStore';

import { useTranslation } from 'react-i18next';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import qrcodegen from '@ribpay/qr-code-generator';
import { drawCanvas } from '@ribpay/qr-code-generator/utils';
import supabase from '../db/supabase';

export function QRView({ userId, activityId, visible, onCancel }: any) {
  const log = useLogger('QRView');
  const { t } = useTranslation();

  const openQRViewModal = useStore(
    (state) => state.activitySlice.openQRViewModal,
  );
  const hideQRViewModal = useStore(
    (state) => state.activitySlice.hideQRViewModal,
  );

  log.debug('open', openQRViewModal);

  //generate a QR code using activity id based on Nayuki's QR code generator
  //https://www.nayuki.io/page/qr-code-generator-library
  //installed the packaged library with : npm install @ribpay/qr-code-generator --force

  const handleQRView = async () => {
    const origin = window.location.origin;
    const { data: dataAuth, error: errAuth } = await supabase
      .from('Authorization')
      .select()
      .eq('userId', userId)
      .eq('title', activityId);

    if (errAuth) {
      throw Error(errAuth.message);
    }

    // Take first
    const tokenDoc = dataAuth[0];
    // code does not exist
    if (!dataAuth?.length) {
      notification.info({
        message: t('common.activity-not-pushed'),
        placement: 'bottomLeft',
      });

      return;
    }
    const { data: dataAct, error: errAct } = await supabase
      .from('Activity')
      .select()
      .eq('id', activityId);

    if (errAct) {
      throw Error(errAct.message);
    }
    const activityDoc = dataAct[0];

    log.debug('tokenDoc', tokenDoc);
    log.debug('activityDoc', activityDoc);

    const token = tokenDoc.token;
    const activityTitle = activityDoc.title;

    const QRURL = `/share-activity/${userId}/${activityId}/${token}`;

    log.debug('QRURL', QRURL);
    log.debug('userId', userId);
    log.debug('activityId', activityId);
    log.debug('token', token);

    const QRC = qrcodegen.QrCode;
    const qr0 = QRC.encodeText(QRURL, QRC.Ecc.MEDIUM);

    const anchor = document.getElementById(
      'qrcode-anchor',
    ) as HTMLAnchorElement;

    anchor.download = `${activityTitle}_${activityId}.png`;

    const canvas = document.getElementById(
      'qrcode-canvas',
    ) as HTMLCanvasElement;

    log.debug('canvas', canvas);

    drawCanvas(qr0, 10, 3, '#FFFFFF', '#000000', canvas);
    anchor.href = canvas.toDataURL('image/png');
  };

  return (
    <Modal
      title={t('common.view-qr')}
      visible={openQRViewModal}
      open={visible}
      onCancel={hideQRViewModal}
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
            key='show'
            onClick={handleQRView}>
            {t('common.generate-qr-button')}
          </Button>
          <a id='qrcode-anchor'>{t('common.download-qr')}</a>
        </Space>
      }>
      <canvas id='qrcode-canvas'></canvas>
    </Modal>
  );
}
