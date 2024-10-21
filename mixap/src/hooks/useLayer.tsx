import create from 'zustand';
import { Layer } from '../enums/layer';

export interface LayerState {
    layers: Layer[];
    addLayer: (name: string, content: any) => void;
    removeLayer: (id: string) => void;
    toggleVisibility: (id: string) => void;
}

export const useLayer = create<LayerState>((set) => ({
    layers: [],
    addLayer: (name, content) => set((state) => ({
        layers: [...state.layers, { id: Date.now().toString(), name, visible: true, opacity: 1, zIndex: state.layers.length, content }]
    })),
    removeLayer: (id) => set((state) => ({
        layers: state.layers.filter(layer => layer.id !== id)
    })),
    toggleVisibility: (id) => set((state) => ({
        layers: state.layers.map(layer => layer.id === id ? { ...layer, visible: !layer.visible } : layer)
    }))
}));