import { StoreSlice } from '../../hooks/useStore';

interface State {
  visible: boolean;
  show: () => void;
  hide: () => void;
  
  setAI: (open : boolean) => void;
  isAI: boolean;
  setFullScreen: (open : boolean,type : string) => void;
  isFullScreen: boolean;

  mediaType: string;
}

interface Slice {
  playerSlice: State;
}

const playerSlice: StoreSlice<Slice> = (set /*, get*/) => ({
  playerSlice: {
    isAI:false,
    isFullScreen:false,
    visible: false,
    mediaType:"",
    show: () => {
      set((state): any => ({
        playerSlice: { ...state.playerSlice, visible: true },
      }));
    },
    hide: () => {
      set((state): any => ({
        playerSlice: { ...state.playerSlice, visible: false },
      }));
    },

    setAI: (open) => {
      set((state): any => ({
        playerSlice: { ...state.playerSlice, isAI: open },
      }));
    },
    setFullScreen: (open, type) => {
      set((state): any => ({
        playerSlice: { ...state.playerSlice, isFullScreen: open , mediaType : type},
      }));
    },
  },
});

export default playerSlice;
