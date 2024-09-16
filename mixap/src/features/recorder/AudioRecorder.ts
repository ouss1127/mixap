import RecordRTC from 'recordrtc';

import { Eventifyer } from '../../utils/Eventifyer';

enum RecorderState {
  IDLE,
  RECORDING,
  PAUSED,
  RESUME,
  CLEARED,
}

export class AudioRecorder extends Eventifyer {
  private static instance: AudioRecorder;

  private states;
  private state;
  private recorderRTC;
  private mediaConstraints: MediaStreamConstraints;
  private recordConstraints;
  private stream;

  public streamURL;
  public streamBlob;

  private startRecordingTimer;

  private stateBehaviors = {
    [RecorderState.RECORDING]: {
      cb: () => {
        (async () => {
          await this.initRecorder();
          this.startRecording();
          this.emit('recorder:started');
        })();
      },
    },
    [RecorderState.PAUSED]: {
      cb: () => {
        this.pauseRecording();
      },
    },
    [RecorderState.RESUME]: {
      cb: () => {
        this.resumeRecording();
        this.emit('recorder:resumed');
      },
    },
    [RecorderState.IDLE]: {
      cb: () => {
        this.stopRecording();
      },
    },
    [RecorderState.CLEARED]: {
      cb: () => {
        this.clearRecording();
      },
    },
  };

  constructor(options) {
    super();

    this.states = {
      [RecorderState.RECORDING]: Object.create(
        this.stateBehaviors[RecorderState.RECORDING],
      ),
      [RecorderState.PAUSED]: Object.create(
        this.stateBehaviors[RecorderState.PAUSED],
      ),
      [RecorderState.RESUME]: Object.create(
        this.stateBehaviors[RecorderState.RESUME],
      ),
      [RecorderState.IDLE]: Object.create(
        this.stateBehaviors[RecorderState.IDLE],
      ),
      [RecorderState.CLEARED]: Object.create(
        this.stateBehaviors[RecorderState.CLEARED],
      ),
    };

    this.mediaConstraints = options?.mediaConstraints || {
      video: false,
      audio: true,
    };
    this.recordConstraints = options?.recordConstraints || {
      type: 'audio',
      recorderType: RecordRTC.MediaStreamRecorder,
      disableLogs: true,
      sampleRate: 44100,
      bufferSize: 4096,
      numberOfAudioChannels: 2,
      timeSlice: 1000,
    };
  }

  private onTimeStamp(t, timestamps) {
    this.emit('recorder:duration', {
      duration: (new Date().getTime() - timestamps[0]) / 1000,
    });
  }

  /**
   * Create unique instance for a given HTML surface.
   * @param options.element {Element}
   */
  public static getInstance(options?): AudioRecorder {
    if (!AudioRecorder.instance) {
      AudioRecorder.instance = new AudioRecorder(options);
    }
    return AudioRecorder.instance;
  }

  /**
   * Activate, deactivate the recorder.
   */
  public toggle() {
    if (!this.state || this.isDeactivated() || this.isCleared()) {
      this.setState(RecorderState.RECORDING);
    } else if (this.isRecording() || this.isResumed()) {
      this.setState(RecorderState.PAUSED);
    } else if (this.isPaused()) {
      this.setState(RecorderState.RESUME);
    }
  }

  public stop() {
    this.setState(RecorderState.IDLE);
  }

  public clear() {
    this.setState(RecorderState.CLEARED);
  }

  initRecorder() {
    return this.getUserMedia()
      .then((stream) => {
        this.stream = stream;
        this.recorderRTC = new RecordRTC(this.stream, this.recordConstraints);
      })
      .catch((err) => this.emit('recorder:error', err));
  }

  private startRecording() {
    if (this.startRecordingTimer) {
      clearTimeout(this.startRecordingTimer);
      this.startRecordingTimer = undefined;
    }

    this.startRecordingTimer = setTimeout(() => {
      this.startRecordingTimer = undefined;

      if (!this.recorderRTC) {
        this.startRecording();
      } else {
        this.recorderRTC.startRecording();
      }
    }, 200);
  }

  private stopRecording() {
    if (!this.recorderRTC) return;

    this.recorderRTC.stopRecording((streamURL) => {
      this.streamURL = streamURL;
      this.streamBlob = this.recorderRTC.getBlob();

      this.emit('recorder:ended', {
        streamURL: this.streamURL,
        streamBlob: this.streamBlob,
      });

      // cleanup
      this.recorderRTC.destroy();
      this.recorderRTC = null;
      this.stream.stop();
    });
  }

  private clearRecording() {
    if (!this.recorderRTC) return;

    this.recorderRTC.stopRecording(() => {
      this.emit('recorder:cleared');
      // cleanup
      this.recorderRTC.destroy();
      this.recorderRTC = null;
      this.stream.stop();
    });
  }

  private resumeRecording() {
    this.recorderRTC.resumeRecording();
  }

  private pauseRecording() {
    this.recorderRTC.pauseRecording();

    setTimeout(() => {
      const internal = this.recorderRTC.getInternalRecorder();
      const arrayOfBlobs = internal.getArrayOfBlobs();
      const preview = new Blob(arrayOfBlobs, {
        type: 'audio',
      });
      this.emit('recorder:paused', {
        streamURL: URL.createObjectURL(preview),
      });
    }, 1);
  }

  private getUserMedia() {
    return navigator.mediaDevices
      .getUserMedia(this.mediaConstraints)
      .then((stream) => stream)
      .catch((err) => this.emit('recorder:error', err));
  }

  private isPaused() {
    return this.state === this.states[RecorderState.PAUSED];
  }

  private isResumed() {
    return this.state === this.states[RecorderState.RESUME];
  }

  private isDeactivated() {
    return this.state === this.states[RecorderState.IDLE];
  }

  private isCleared() {
    return this.state === this.states[RecorderState.CLEARED];
  }

  private isRecording() {
    return this.state === this.states[RecorderState.RECORDING];
  }

  private getState() {
    return this.state;
  }

  private setState(state) {
    if (this.getState() !== this.states[state]) {
      this.state = this.states[state];
      this.state.cb();
    }
  }
}
