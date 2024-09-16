import { StoreSlice } from '../../hooks/useStore';

interface State {
  compiling: boolean;
  cropping: boolean;
  percentage: number;
  markerImages: any[];
  markerImagesCfg: any[];
  markerCfg: Record<string, any>;
  markerFile: any;
  markerUrl: any;
  markerFileId: string;
  markerImageIds: string[];
  setMarkerCfg: (markerCfg: Record<string, unknown>) => void;
  setCompiling: (compiling: boolean) => void;
  setCropping: (compiling: boolean) => void;
  setMarkerImages: (markerImages: any[]) => void;
  setMarkerImagesCfg: (markerImagesCfg: any[]) => void;
  setMarkerFile: (markerFile: any) => void;
  setMarkerUrl: (markerUrl: string | undefined) => void;
  setMarkerFileId: (id: string) => void;
  setMarkerImageIds: (ids: string[]) => void;
}

interface Slice {
  mkUploadSlice: State;
}

const mkUploadSlice: StoreSlice<Slice> = (set /*, get*/) => ({
  mkUploadSlice: {
    compiling: false,
    cropping: false,
    markerCfg: {},
    percentage: 0,
    markerImages: [],
    markerImagesCfg: [],
    markerFileId: '',
    markerImageIds: [],
    markerFile: '',
    markerUrl: '',
    setMarkerCfg: (markerCfg) => {
      set((state): any => ({
        mkUploadSlice: {
          ...state.mkUploadSlice,
          markerCfg: {
            ...state.mkUploadSlice.markerCfg,
            ...markerCfg,
          },
        },
      }));
    },
    setCompiling: (compiling) => {
      set((state): any => ({
        mkUploadSlice: { ...state.mkUploadSlice, compiling },
      }));
    },
    setCropping: (cropping) => {
      set((state): any => ({
        mkUploadSlice: { ...state.mkUploadSlice, cropping },
      }));
    },
    setMarkerImages: (markerImages) => {
      set((state): any => ({
        mkUploadSlice: { ...state.mkUploadSlice, markerImages },
      }));
    },
    setMarkerImagesCfg: (markerImagesCfg) => {
      set((state): any => ({
        mkUploadSlice: {
          ...state.mkUploadSlice,
          markerImagesCfg,
        },
      }));
    },
    setMarkerFile: (markerFile) => {
      set((state): any => ({
        mkUploadSlice: { ...state.mkUploadSlice, markerFile },
      }));
    },
    setMarkerUrl: (markerUrl) => {
      set((state): any => ({
        mkUploadSlice: { ...state.mkUploadSlice, markerUrl },
      }));
    },
    setMarkerFileId: (markerFileId) => {
      set((state): any => ({
        mkUploadSlice: { ...state.mkUploadSlice, markerFileId },
      }));
    },
    setMarkerImageIds: (markerImageIds) => {
      set((state): any => ({
        mkUploadSlice: { ...state.mkUploadSlice, markerImageIds },
      }));
    },
  },
});

export default mkUploadSlice;
