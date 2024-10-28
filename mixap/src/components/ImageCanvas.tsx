import React from 'react';
import useStore from '../hooks/useStore';

const ImageCanvas = () => {
  // Access layers from Zustand store
  const layers = useStore((state) => state.layerSlice.layers);

  return (
    <div className="canvas-container">
      {/* Render the image and its layers */}
      {layers.map((layer) => (
        layer.visible && (
          <div key={layer.id} style={{ opacity: layer.opacity, zIndex: layer.zIndex }}>
            {/* Render the content of the layer */}
            {/* Content could be augmentation data, images, etc. */}
            <img src={layer.content} alt={`Layer ${layer.id}`} />
          </div>
        )
      ))}
    </div>
  );
};

export default ImageCanvas;
