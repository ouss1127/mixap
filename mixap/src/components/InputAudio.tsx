import React, { useEffect, useState } from 'react';
import { Button, Popover, Space, Slider, Tag } from 'antd';

import CircleIcon from '@mui/icons-material/Circle';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

import { AudioRecorder } from '../features/recorder/AudioRecorder';
import useLogger from '../hooks/useLogger';
import { useInterval } from '../hooks';

/** @jsxImportSource @emotion/react */

export default function InputAudio({ style, icon, size, onChange }: any) {
  return (
    <Popover content={<ARecorder onChange={onChange} />}>
      <Button
        size={size}
        style={style}
        type='text'
        icon={icon}
      />
    </Popover>
  );
}

function ARecorder({ onChange }: any) {
  const log = useLogger('ARecorder');

  log.debug('Render');

  const recorder = AudioRecorder.getInstance();

  const [recording, setRecording] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [video, setVideo] = useState<any>(null);
  const [playing, setPlaying] = useState<boolean>(false);

  const [timer, setTimer] = useState<number>(0);
  const [delay] = useState<number | null>(1000);

  useInterval(
    () => {
      setTimer(timer + 1);
    },
    // Delay or null to stop it
    recording ? delay : null,
  );

  useEffect(() => {
    const handleRecordEnded = ({ streamURL, streamBlob }) => {
      setRecording(false);
      if (video) {
        log.debug('recorder:ended set audio', streamURL);
        video.src = streamURL;
        onChange && onChange(streamBlob);
      }
    };
    const handleRecordStarted = () => {
      log.debug('recorder:started ');
      setRecording(true);
      setPlaying(false);
      if (video) {
        video.pause();
      }
    };
    const handleRecordResumed = () => {
      log.debug('recorder:resumed ');
      setRecording(true);
      if (video) {
        video.currentTime = 0;
        video.play();
        video.pause();
      }
    };
    const handleRecordPaused = ({ streamURL }) => {
      log.debug('recorder:paused ');
      setRecording(false);
      if (video) {
        log.debug('recorder:paused set audio', streamURL);
        video.src = streamURL;
        video.currentTime = 0;
        video.play();
        video.pause();
      }
    };

    const handleRecordCleared = () => {
      log.debug('recorder:cleared ');
      setRecording(false);
      if (video) {
        log.debug('recorder:cleared ');
        video.pause();
        video.currentTime = 0;
        video.src = '';
        setCurrentTime(0);
        setTimer(0);
      }
    };

    if (recorder) {
      recorder.on('recorder:cleared', handleRecordCleared);
      recorder.on('recorder:ended', handleRecordEnded);
      recorder.on('recorder:started', handleRecordStarted);
      recorder.on('recorder:resumed', handleRecordResumed);
      recorder.on('recorder:paused', handleRecordPaused);
    }
    return () => {
      recorder.off('recorder:cleared', handleRecordCleared);
      recorder.off('recorder:ended', handleRecordEnded);
      recorder.off('recorder:started', handleRecordStarted);
      recorder.off('recorder:resumed', handleRecordResumed);
      recorder.off('recorder:paused', handleRecordPaused);
    };
  }, [recorder, video]);

  useEffect(() => {
    const handleTimeupdate = (videoElement /*event*/) => {
      setCurrentTime(videoElement.currentTime);
    };

    const handlePlaying = (/*event*/) => {
      setPlaying(true);
    };

    const handlePausing = (/*event*/) => {
      setPlaying(false);
    };

    const handleEnded = (/*event*/) => {
      setPlaying(false);
    };

    if (!video) {
      const videoElement = window.document.createElement('audio');

      videoElement.src = '';
      videoElement.crossOrigin = 'Anonymous';
      videoElement.loop = false;
      videoElement.muted = false; //!shallPlayAudio;
      videoElement.volume = 1;
      videoElement.preload = 'metadata';

      setVideo(videoElement);

      videoElement.addEventListener('playing', handlePlaying);
      videoElement.addEventListener('pause', handlePausing);
      videoElement.addEventListener('ended', handleEnded);
      videoElement.addEventListener(
        'timeupdate',
        handleTimeupdate.bind(null, videoElement),
      );
    }

    return () => {
      if (!video) return;

      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePausing);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeupdate);

      video.pause();
      video.currentTime = 0;
      setCurrentTime(video.currentTime);
    };
  }, [video]);

  const play = () => {
    if (!video) return;
    video.play();
  };

  const pause = () => {
    if (!video) return;
    video.pause();
  };

  const handleSeeking = (value: number) => {
    if (!video) return;
    video.currentTime = value / 1000;
  };

  return (
    <>
      <Space
        direction='vertical'
        css={{ padding: 18, alignItems: 'center', justifyContent: 'center' }}>
        <Space direction='horizontal'>
          <Slider
            min={0}
            step={1}
            max={(video?.duration * 1000 || 0) + 1}
            value={currentTime * 1000}
            onChange={handleSeeking}
            tipFormatter={(value) => {
              value = value || 0;
              return value > 1000 ? (
                <>{Math.ceil(value / 1000)} s</>
              ) : (
                <>{value} ms</>
              );
            }}
            css={{
              width: 100,
              '& .ant-slider-handle, .ant-slider-track': {
                transition: 'all 500ms ease',
              },
            }}
          />
          <Tag>{timer}</Tag>
        </Space>

        <Space
          direction='horizontal'
          size={[18, 18]}>
          <Button
            disabled={recording}
            size='middle'
            type='default'
            shape='circle'
            onClick={playing ? pause : play}
            icon={playing ? <PauseIcon /> : <PlayArrowIcon />}
          />

          <Button
            size='large'
            shape='circle'
            type='text'
            style={
              recording
                ? { background: '#f5222d', border: '3px solid #eee' }
                : { background: '#87d068', border: '3px solid #eee' }
            }
            onClick={recorder.toggle.bind(recorder)}
            icon={
              recording ? (
                <PauseIcon />
              ) : (
                <CircleIcon css={{ color: '#87d068' }} />
              )
            }
          />

          <Button
            disabled={recording}
            size='middle'
            type='default'
            shape='circle'
            onClick={recorder.stop.bind(recorder)}
            icon={<CheckIcon />}
          />

          <Button
            disabled={recording}
            size='middle'
            type='default'
            shape='circle'
            onClick={recorder.clear.bind(recorder)}
            icon={<ClearIcon />}
          />
        </Space>
      </Space>
    </>
  );
}
