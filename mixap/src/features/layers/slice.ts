import { StoreSlice } from '../../hooks/useStore';
import { Layer } from '../../enums/Layer';

interface LayerState {
  layers: Layer[];
  getLayers: (activityId: string) => Layer[];
  findLayer: (layerId: string) => Layer | undefined;
  addLayer: (layer: Partial<Layer>) => void;
  removeLayer: (id: string | number) => void;
  updateLayer: (layer: Partial<Layer>) => void;
  toggleLayerVisibility: (id: string | number) => void;
}

interface Slice {
  layerSlice: LayerState;
}

const layerSlice: StoreSlice<Slice> = (set, get) => ({
  layerSlice: {
    layers: [],
    getLayers: (activityId: string) => {
      return get().layerSlice.layers.filter(
        (layer) => layer.activityId === activityId
      );
    },
    findLayer: (layerId: string) => {
      return get().layerSlice.layers.find((layer) => layer.id === layerId);
    },
    addLayer: (layer) => {
      set((state): any => ({
        layerSlice: {
          ...state.layerSlice,
          layers: [layer, ...state.layerSlice.layers],
        },
      }));
    },
    removeLayer: (id) => {
      set((state): any => ({
        layerSlice: {
          ...state.layerSlice,
          layers: state.layerSlice.layers.filter((layer) => layer.id !== id),
        },
      }));
    },
    updateLayer: (layer) => {
      set((state): any => ({
        layerSlice: {
          ...state.layerSlice,
          layers: state.layerSlice.layers.map((item) => {
            if (item.id === layer.id) {
              return {
                ...item,
                ...layer,
              };
            } else {
              return item;
            }
          }),
        },
      }));
    },
    toggleLayerVisibility: (id) => {
      set((state): any => ({
        layerSlice: {
          ...state.layerSlice,
          layers: state.layerSlice.layers.map((layer) =>
            layer.id === id ? { ...layer, visible: !layer.visible } : layer
          ),
        },
      }));
    },
  },
});
console.log(layerSlice, 'layerSlice');
export default layerSlice;
