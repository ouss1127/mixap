import { useEffect, useState } from 'react';
import layerSlice from '../features/layers/slice';
import type { Layer } from '../features/layers/slice';
import useStore from './useStore';

export const useLayer = () => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const addLayer = useStore((state) => state.layerSlice.addLayer);
  const removeLayer = useStore((state) => state.layerSlice.removeLayer);
  const toggleVisibility = useStore((state) => state.layerSlice.toggleVisibility);

  useEffect(() => {
    const fetchLayers = async () => {
      const initialLayers: Layer[] = [];
      setLayers(initialLayers);
    };

    fetchLayers();
  }, []);

  const addNewLayer = (name: string, content: any) => {
    addLayer(name, content);
  };

  const removeExistingLayer = (id: string) => {
    removeLayer(id);
  };

  const toggleLayerVisibility = (id: string) => {
    toggleVisibility(id);
  };

  return {
    layers,
    addNewLayer,
    removeExistingLayer,
    toggleLayerVisibility,
  };
};
