import { useLayer } from '../../hooks/useLayer'; 
import { Layer } from '../../enums/layer';
import { nanoid } from 'nanoid';
import { StoreSlice } from '@/hooks/useStore';

export interface LayerState {
  layers: Layer[];
  selectedLayerId: string | null;
}

export const layerSlice: StoreSlice<LayerState> = (set, get) => ({
  layers: [],
  selectedLayerId: null,

  addLayer: (name: string, content: any) => {
    const newLayer: Layer = {
      id: nanoid(),
      name,
      visible: true,
      opacity: 1,
      zIndex: get().layers.length,
      content,
      activityId: ''
    };
    set((state) => ({ layers: [...state.layers, newLayer] }));
  },

  removeLayer: (id: string) => {
    set((state) => ({ layers: state.layers.filter((layer) => layer.id !== id) }));
  },

  selectLayer: (id: string) => {
    set({ selectedLayerId: id });
  },

  toggleLayerVisibility: (id: string) => {
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      ),
    }));
  },

  setLayerOpacity: (id: string, opacity: number) => {
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, opacity } : layer
      ),
    }));
  },

  reorderLayers: (newOrder: Layer[]) => {
    set({ layers: newOrder });
  },

  moveLayerUp: (id: string) => {
    set((state) => {
      const index = state.layers.findIndex((layer) => layer.id === id);
      if (index > 0) {
        const layers = [...state.layers];
        [layers[index], layers[index - 1]] = [layers[index - 1], layers[index]];
        return { layers };
      }
    });
  },

  moveLayerDown: (id: string) => {
    set((state) => {
      const index = state.layers.findIndex((layer) => layer.id === id);
      if (index < state.layers.length - 1) {
        const layers = [...state.layers];
        [layers[index], layers[index + 1]] = [layers[index + 1], layers[index]];
        return { layers };
      }
    });
  },
});
