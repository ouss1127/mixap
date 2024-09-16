import { useTranslation } from 'react-i18next';

const constraints = { audio: true, video: true };

export function useRequestLocalStream() {
  const { t } = useTranslation();

  const requestStream = async (message) => {
    if (!navigator?.mediaDevices) {
      message.warning(t('common.camera-microphone-unavailable'));
      return false;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints,
      );
      message.info(t('common.camera-microphone-enabled'));

      mediaStream?.getAudioTracks()[0].stop();
      mediaStream?.getVideoTracks()[0].stop();

      return true;
    } catch (error) {
      message.warning(t('common.camera-microphone-disabled'));
      console.log('local stream', error);

      return false;
    }
  };

  return requestStream;
}

/* export const requestLocalStream = async (message) => {
  if (!navigator?.mediaDevices) {
    message.warning("Impossible d'utiliser la caméra et/ou le micro !!");
    return false;
  }

  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    message.info('Caméra et micro sont bien activés !!');

    mediaStream?.getAudioTracks()[0].stop();
    mediaStream?.getVideoTracks()[0].stop();

    return true;
  } catch (error) {
    message.warning('Votre micro et/ou caméra est désactivé');
    console.log('local stream', error);

    return false;
  }
}; */
