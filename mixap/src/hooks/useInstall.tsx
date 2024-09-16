import React, { useCallback, useEffect, useState } from 'react';

import { notification, Typography, Button } from 'antd';

import useLogger from './useLogger';

import { useTranslation } from 'react-i18next';

let deferredPrompt;

// https://web.dev/customize-install/
export default function useInstall() {
  const log = useLogger('useInstall');
  const [shoudldInstall, setShouldInstall] = useState(false);

  const { t } = useTranslation();

  log.debug('Render');

  useEffect(() => {
    if (getPWADisplayMode() !== 'browser') return;

    // Initialize deferredPrompt for use later to show browser install prompt.
    const onBeforeinstallprompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      // Update UI notify the user they can install the PWA
      showInstallPromotion();
      // Optionally, send analytics event that PWA install promo was shown.
      log.debug(`beforeinstallprompt' event was fired.`);
    };

    const onAppinstalled = () => {
      // Hide the app-provided install promotion
      hideInstallPromotion();
      // Clear the deferredPrompt so it can be garbage collected
      deferredPrompt = undefined;
      // Optionally, send analytics event to indicate successful install
      log.debug('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', onBeforeinstallprompt);
    window.addEventListener('appinstalled', onAppinstalled);

    // window
    //   .matchMedia('(display-mode: standalone)')
    //   .addEventListener('change', (evt) => {
    //     let displayMode = 'browser';
    //     if (evt.matches) {
    //       displayMode = 'standalone';
    //     }
    //     // Log display mode change to analytics
    //     log.debug('DISPLAY_MODE_CHANGED', displayMode);
    //   });

    return () => {
      if (getPWADisplayMode() !== 'browser') return;
      window.removeEventListener('beforeinstallprompt', onBeforeinstallprompt);
      window.removeEventListener('appinstalled', onAppinstalled);
    };
  }, []);

  const showInstallPromotion = useCallback(() => {
    log.debug('showInstallPromotion', deferredPrompt);

    setShouldInstall(true);

    notification.info({
      message: t('common.install-mixap'),
      description: (
        <Typography.Paragraph>
          {t('common.install-paragraph')}{' '}
          <Button
            size='large'
            shape='round'
            onClick={onInstall}>
            {t('common.install-button')}
          </Button>
        </Typography.Paragraph>
      ),
      duration: 0,
      key: 'appInstall',
      onClose: () => {
        if (!shoudldInstall) setShouldInstall(true);
      },
    });
  }, []);

  const hideInstallPromotion = useCallback(() => {
    log.debug('hideInstallPromotion');
    notification.destroy('appInstall');
  }, []);

  const onInstall = useCallback(async () => {
    log.debug('onInstall', deferredPrompt);

    if (!deferredPrompt) return;

    // Hide the app provided install promotion
    hideInstallPromotion();
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    // Optionally, send analytics event with outcome of user choice
    log.debug(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt = undefined;
  }, []);

  const getPWADisplayMode = useCallback(() => {
    const isStandalone = window.matchMedia(
      '(display-mode: standalone)',
    ).matches;

    if (document.referrer.startsWith('android-app://')) {
      return 'pwa';
      // @ts-ignore
    } else if (navigator.standalone || isStandalone) {
      return 'standalone';
    }
    return 'browser';
  }, []);

  return { onInstall, shoudldInstall };
}
