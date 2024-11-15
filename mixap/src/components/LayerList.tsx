import React from 'react';
import useStore from '../hooks/useStore';

const LayerList = () => {
  // Access layers from the Zustand store
  const layers = useStore((state) => state.layerSlice.layers);

  // Zustand actions for managing layers
  const toggleVisibility = useStore(
    (state) => state.layerSlice.toggleLayerVisibility,
  );
  const removeLayer = useStore((state) => state.layerSlice.removeLayer);

  return (
    <div>
      <h3>Layers</h3>
      <ul>
        {layers.map((layer) => (
          <li key={layer.id}>
            {/* Layer name and ID */}
            <span>{layer.name || `Layer ${layer.id}`}</span>

            {/* Button to toggle visibility */}
            <button onClick={() => toggleVisibility(layer.id)}>
              {layer.visible ? 'Hide' : 'Show'}
            </button>

            {/* Button to remove a layer */}
            <button onClick={() => removeLayer(layer.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LayerList;
