import { StoreSlice } from '../../hooks/useStore';
import { ActivityDocType } from '../../db/types';

interface State {
  visible: boolean;
  openPushModal: boolean;
  openQRScannerModal: boolean;
  openQRViewModal: boolean;
  activities: ActivityDocType[];
  currActitityId: string;
  currMarkerFileURL: string;
  addDefaults: { id: string; type: string } | undefined;
  layer: Layer;
  showMenu: () => void;
  hideMenu: () => void;
  showPushModal: () => void;
  hidePushModal: () => void;
  showQRScannerModal: () => void;
  hideQRScannerModal: () => void;
  showQRViewModal: () => void;
  hideQRViewModal: () => void;
  get: (id: string) => Partial<ActivityDocType>;
  set: (activities: Partial<ActivityDocType>[]) => void;
  add: (activity: Partial<ActivityDocType>) => void;
  remove: (id: string | number) => void;
  update: (activity: Partial<ActivityDocType>) => void;
  setCurrActitityId: (id: string) => void;
  setCurrMarkerFileURL: (markerFile: Blob | File) => void;
  setAddDefaults: (
    addDefaults: { id: string; type: string } | undefined,
  ) => void;
}

interface Slice {
  activitySlice: State;
}

const activitySlice: StoreSlice<Slice> = (set, get) => ({
  activitySlice: {
    activities: [],
    visible: false,
    openPushModal: false,
    openQRScannerModal: false,
    openQRViewModal: false,
    currActitityId: '',
    currMarkerFileURL: '',
    addDefaults: undefined,
    showMenu: () => {
      set((state): any => ({
        activitySlice: { ...state.activitySlice, visible: true },
      }));
    },
    setAddDefaults: (addDefaults: { id: string; type: string } | undefined) => {
      set((state): any => ({
        activitySlice: { ...state.activitySlice, addDefaults },
      }));
    },
    hideMenu: () => {
      set((state): any => ({
        activitySlice: { ...state.activitySlice, visible: false },
      }));
    },
    showPushModal: () => {
      set((state): any => ({
        activitySlice: { ...state.activitySlice, openPushModal: true },
      }));
    },
    hidePushModal: () => {
      set((state): any => ({
        activitySlice: { ...state.activitySlice, openPushModal: false },
      }));
    },
    showQRScannerModal: () => {
      set((state): any => ({
        activitySlice: { ...state.activitySlice, openQRScannerModal: true },
      }));
    },
    hideQRScannerModal: () => {
      set((state): any => ({
        activitySlice: { ...state.activitySlice, openQRScannerModal: false },
      }));
    },
    showQRViewModal: () => {
      set((state): any => ({
        activitySlice: { ...state.activitySlice, openQRViewModal: true },
      }));
    },
    hideQRViewModal: () => {
      set((state): any => ({
        activitySlice: { ...state.activitySlice, openQRViewModal: false },
      }));
    },
    get: (id: string) => {
      return get().activitySlice.activities.find(
        (a) => a.id === id,
      ) as Partial<ActivityDocType>;
    },
    set: (activities: Partial<ActivityDocType>[]) => {
      set((state): any => ({
        activitySlice: { ...state.activitySlice, activities },
      }));
    },
    add: async (doc: Partial<ActivityDocType>) => {
      set((state): any => ({
        activitySlice: {
          ...state.activitySlice,
          activities: [doc, ...state.activitySlice.activities],
        },
      }));
    },
    remove: (id) => {
      set((state): any => ({
        activitySlice: {
          ...state.activitySlice,
          activities: state.activitySlice.activities.filter(
            (activity) => activity.id !== id,
          ),
        },
      }));
    },
    update: (activity) => {
      set((state): any => ({
        activitySlice: {
          ...state.activitySlice,
          activities: state.activitySlice.activities.map((item) => {
            if (item.id === activity.id) {
              return {
                ...item,
                ...activity,
              };
            } else {
              return item;
            }
          }),
        },
      }));
    },
    setCurrActitityId: (id: string) => {
      set((state): any => ({
        activitySlice: { ...state.activitySlice, currActitityId: id },
      }));
    },
    setCurrMarkerFileURL: (markerFile: Blob | File) => {
      const URL = get().activitySlice.currMarkerFileURL;
      if (URL) {
        window?.URL.revokeObjectURL(URL);
      }

      set((state): any => ({
        activitySlice: {
          ...state.activitySlice,
          currMarkerFileURL: window?.URL.createObjectURL(markerFile),
        },
      }));
    },
  },
});

export default activitySlice;
