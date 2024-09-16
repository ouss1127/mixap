import { StoreSlice } from '../../hooks/useStore';

export enum EditorStatus {
  Idle = 'Idle',
  Marker = 'Marker',
  AuraMake = 'AuraMake',
  AuraPlay = 'AuraPlay',
  Tracking = 'Tracking',
}

interface State {
  status: EditorStatus;
  arStatus: string;
  globalMode: string;
  compiling: boolean;
  anchoring: boolean;
  tracking: boolean;
  percentage: number;
  markerImages: any[];
  markerFile: any;
  setGlobalMode: (mode: string) => void;
  setTracking: (tracking: boolean) => void;
  setAnchoring: (tracking: boolean) => void;
  setMarkerImages: (markerImages: any[]) => void;
  setMarkerFile: (markerFile: any) => void;
  setArStatus: (arStatus: string) => void;
  setStatus: (status: string) => void;
}

interface IState {
  editorSlice: State;
}

const editorSlice: StoreSlice<IState> = (set /*, get*/) => ({
  editorSlice: {
    status: EditorStatus.Idle,
    globalMode: 'editing',
    compiling: false,
    tracking: false,
    anchoring: false,
    percentage: 0,
    markerImages: [],
    markerFile: null,
    arStatus: '',
    setGlobalMode: (globalMode) => {
      set((state): any => ({
        editorSlice: { ...state.editorSlice, globalMode },
      }));
    },
    setTracking: (tracking) => {
      set((state): any => ({
        editorSlice: { ...state.editorSlice, tracking },
      }));
    },
    setAnchoring: (anchoring) => {
      set((state): any => ({
        editorSlice: { ...state.editorSlice, anchoring },
      }));
    },
    setMarkerImages: (markerImages) => {
      set((state): any => ({
        editorSlice: { ...state.editorSlice, markerImages },
      }));
    },
    setMarkerFile: (markerFile) => {
      set((state): any => ({
        editorSlice: { ...state.editorSlice, markerFile },
      }));
    },
    setArStatus: (arStatus) => {
      set((state): any => ({
        editorSlice: { ...state.editorSlice, arStatus },
      }));
    },
    setStatus: (status) => {
      set((state): any => ({
        editorSlice: { ...state.editorSlice, status },
      }));
    },
  },
});

export default editorSlice;
