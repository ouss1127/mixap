import { useEffect, useState } from 'react';
import { useLayerStore, Layer } from '../features/layers/slice';

export const useLayer = () => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const { addLayer, removeLayer, toggleVisibility } = useLayerStore();

  useEffect(() => {
    // Example: Fetch initial layers from an API or initialize state
    const fetchLayers = async () => {
      // Replace with actual data fetching logic if needed
      const initialLayers: Layer[] = []; // Example initial data
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