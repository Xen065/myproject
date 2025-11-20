/**
 * Image Occlusion Editor Component
 * Allows teachers to draw rectangles on an image to create occlusion regions
 */
import React, { useState, useRef, useEffect } from 'react';
import './ImageOcclusionEditor.css';

const ImageOcclusionEditor = ({ imageUrl, regions, onChange }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Load and draw image
  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas size to match image
      const maxWidth = 800;
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      setImageDimensions({ width: canvas.width, height: canvas.height });
      imageRef.current = img;
      redrawCanvas();
    };

    img.onerror = () => {
      console.error('Failed to load image:', imageUrl);
    };

    // Use the imageUrl directly - QuestionModal now provides full URLs
    img.crossOrigin = 'anonymous'; // Enable CORS for canvas manipulation
    img.src = imageUrl;
  }, [imageUrl]);

  // Redraw canvas whenever regions change
  useEffect(() => {
    redrawCanvas();
  }, [regions, currentRegion, selectedRegionIndex]);

  const redrawCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    // Clear and redraw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw all regions
    regions.forEach((region, index) => {
      drawRegion(ctx, region, index === selectedRegionIndex);
    });

    // Draw current region being drawn
    if (currentRegion) {
      drawRegion(ctx, currentRegion, false, true);
    }
  };

  const drawRegion = (ctx, region, isSelected, isDrawing = false) => {
    // Draw semi-transparent fill
    ctx.fillStyle = isDrawing ? 'rgba(255, 165, 0, 0.4)' :
                    isSelected ? 'rgba(59, 130, 246, 0.4)' :
                    'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(region.x, region.y, region.width, region.height);

    // Draw border
    ctx.strokeStyle = isSelected ? '#3b82f6' : '#ffffff';
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.strokeRect(region.x, region.y, region.width, region.height);

    // Draw label
    if (region.answer) {
      ctx.fillStyle = isSelected ? '#3b82f6' : '#ffffff';
      ctx.font = '14px Arial';
      ctx.fillText(
        region.answer.substring(0, 20) + (region.answer.length > 20 ? '...' : ''),
        region.x + 5,
        region.y + 20
      );
    }
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Account for canvas scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);

    // Check if clicking on existing region
    const clickedRegionIndex = regions.findIndex(r =>
      pos.x >= r.x && pos.x <= r.x + r.width &&
      pos.y >= r.y && pos.y <= r.y + r.height
    );

    if (clickedRegionIndex !== -1) {
      setSelectedRegionIndex(clickedRegionIndex);
      return;
    }

    // Start drawing new region
    setSelectedRegionIndex(null);
    setIsDrawing(true);
    setStartPos(pos);
    setCurrentRegion({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);
    const width = pos.x - startPos.x;
    const height = pos.y - startPos.y;

    setCurrentRegion({
      x: width > 0 ? startPos.x : pos.x,
      y: height > 0 ? startPos.y : pos.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentRegion) return;

    // Only add region if it has meaningful size
    if (currentRegion.width > 10 && currentRegion.height > 10) {
      const newRegion = {
        ...currentRegion,
        id: Date.now(),
        answer: '' // Will be filled by user
      };

      const newRegions = [...regions, newRegion];
      onChange(newRegions);
      setSelectedRegionIndex(newRegions.length - 1);
    }

    setIsDrawing(false);
    setStartPos(null);
    setCurrentRegion(null);
  };

  const updateRegionAnswer = (index, answer) => {
    const newRegions = [...regions];
    newRegions[index] = { ...newRegions[index], answer };
    onChange(newRegions);
  };

  const deleteRegion = (index) => {
    const newRegions = regions.filter((_, i) => i !== index);
    onChange(newRegions);
    setSelectedRegionIndex(null);
  };

  return (
    <div className="image-occlusion-editor">
      <div className="editor-instructions">
        <h4>How to create occlusions:</h4>
        <ol>
          <li>Click and drag on the image to draw a rectangle over the area you want to hide</li>
          <li>Enter the answer for each occluded region in the list below</li>
          <li>Click on a region to select it (you can delete it if needed)</li>
        </ol>
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDrawing ? 'crosshair' : 'pointer', maxWidth: '100%' }}
        />
      </div>

      {regions.length > 0 && (
        <div className="regions-list">
          <h4>Occluded Regions ({regions.length})</h4>
          {regions.map((region, index) => (
            <div
              key={region.id || index}
              className={`region-item ${index === selectedRegionIndex ? 'selected' : ''}`}
              onClick={() => setSelectedRegionIndex(index)}
            >
              <div className="region-info">
                <span className="region-number">#{index + 1}</span>
                <input
                  type="text"
                  value={region.answer || ''}
                  onChange={(e) => updateRegionAnswer(index, e.target.value)}
                  placeholder="What's hidden here?"
                  onClick={(e) => e.stopPropagation()}
                  required
                />
              </div>
              <button
                type="button"
                className="btn-delete-region"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRegion(index);
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {regions.length === 0 && imageUrl && (
        <div className="no-regions-message">
          <p>No regions created yet. Draw rectangles on the image to create occlusions.</p>
        </div>
      )}
    </div>
  );
};

export default ImageOcclusionEditor;
