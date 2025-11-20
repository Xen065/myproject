/**
 * Image Occlusion Editor Component
 * Allows teachers to draw shapes on an image to create quiz regions
 * Enhanced with zoom, pan, and keyboard shortcuts
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ImageOcclusionEditor.css';

const ImageOcclusionEditor = ({ imageUrl, regions, onChange }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(null);

  // Enhanced interaction states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 });

  // Advanced drawing tools
  const [drawingShape, setDrawingShape] = useState('rectangle'); // 'rectangle', 'circle', 'polygon'
  const [isMoving, setIsMoving] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null); // 'nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'
  const [polygonPoints, setPolygonPoints] = useState([]);

  // Load and draw image
  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const img = new Image();

    img.onload = () => {
      // Set canvas size to match image
      const maxWidth = 800;
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

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
  }, [regions, currentRegion, selectedRegionIndex, zoom, pan, redrawCanvas]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle if not typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedRegionIndex !== null) {
            e.preventDefault();
            deleteRegion(selectedRegionIndex);
          }
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleResetZoom();
          break;
        case 'Escape':
          setSelectedRegionIndex(null);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRegionIndex, zoom, deleteRegion]);

  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    // Save context state
    ctx.save();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations for zoom and pan
    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw all regions
    regions.forEach((region, index) => {
      drawRegion(ctx, region, index === selectedRegionIndex);
    });

    // Draw current region being drawn
    if (currentRegion) {
      drawRegion(ctx, currentRegion, false, true);
    }

    // Restore context state
    ctx.restore();
  }, [regions, currentRegion, selectedRegionIndex, zoom, pan]);

  const drawRegion = (ctx, region, isSelected, isDrawing = false) => {
    const shape = region.shape || 'rectangle';

    // Draw semi-transparent fill
    ctx.fillStyle = isDrawing ? 'rgba(255, 165, 0, 0.4)' :
                    isSelected ? 'rgba(59, 130, 246, 0.4)' :
                    'rgba(0, 0, 0, 0.6)';

    if (shape === 'rectangle') {
      ctx.fillRect(region.x, region.y, region.width, region.height);
    } else if (shape === 'circle') {
      const centerX = region.x + region.width / 2;
      const centerY = region.y + region.height / 2;
      const radiusX = Math.abs(region.width / 2);
      const radiusY = Math.abs(region.height / 2);

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.fill();
    } else if (shape === 'polygon' && region.points) {
      ctx.beginPath();
      region.points.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.fill();
    }

    // Draw border
    ctx.strokeStyle = isSelected ? '#3b82f6' : '#ffffff';
    ctx.lineWidth = isSelected ? 3 : 2;

    if (shape === 'rectangle') {
      ctx.strokeRect(region.x, region.y, region.width, region.height);
    } else if (shape === 'circle') {
      const centerX = region.x + region.width / 2;
      const centerY = region.y + region.height / 2;
      const radiusX = Math.abs(region.width / 2);
      const radiusY = Math.abs(region.height / 2);

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (shape === 'polygon' && region.points) {
      ctx.beginPath();
      region.points.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.stroke();
    }

    // Draw resize handles for selected region
    if (isSelected && shape === 'rectangle') {
      const handleSize = 8;
      ctx.fillStyle = '#3b82f6';

      // Corner handles
      ctx.fillRect(region.x - handleSize/2, region.y - handleSize/2, handleSize, handleSize);
      ctx.fillRect(region.x + region.width - handleSize/2, region.y - handleSize/2, handleSize, handleSize);
      ctx.fillRect(region.x - handleSize/2, region.y + region.height - handleSize/2, handleSize, handleSize);
      ctx.fillRect(region.x + region.width - handleSize/2, region.y + region.height - handleSize/2, handleSize, handleSize);

      // Edge handles
      ctx.fillRect(region.x + region.width/2 - handleSize/2, region.y - handleSize/2, handleSize, handleSize);
      ctx.fillRect(region.x + region.width/2 - handleSize/2, region.y + region.height - handleSize/2, handleSize, handleSize);
      ctx.fillRect(region.x - handleSize/2, region.y + region.height/2 - handleSize/2, handleSize, handleSize);
      ctx.fillRect(region.x + region.width - handleSize/2, region.y + region.height/2 - handleSize/2, handleSize, handleSize);
    }

    // Draw label
    if (region.answer) {
      ctx.fillStyle = isSelected ? '#3b82f6' : '#ffffff';
      ctx.font = '14px Arial';
      const labelX = shape === 'rectangle' ? region.x + 5 : region.x + region.width / 2 - 40;
      const labelY = shape === 'rectangle' ? region.y + 20 : region.y + region.height / 2;
      ctx.fillText(
        region.answer.substring(0, 20) + (region.answer.length > 20 ? '...' : ''),
        labelX,
        labelY
      );
    }
  };

  // Helper functions for resize/move detection
  const getResizeHandle = (pos, region) => {
    const handleSize = 8;
    const threshold = handleSize;

    const handles = [
      { name: 'nw', x: region.x, y: region.y },
      { name: 'ne', x: region.x + region.width, y: region.y },
      { name: 'sw', x: region.x, y: region.y + region.height },
      { name: 'se', x: region.x + region.width, y: region.y + region.height },
      { name: 'n', x: region.x + region.width/2, y: region.y },
      { name: 's', x: region.x + region.width/2, y: region.y + region.height },
      { name: 'w', x: region.x, y: region.y + region.height/2 },
      { name: 'e', x: region.x + region.width, y: region.y + region.height/2 },
    ];

    for (const handle of handles) {
      if (Math.abs(pos.x - handle.x) <= threshold && Math.abs(pos.y - handle.y) <= threshold) {
        return handle.name;
      }
    }

    return null;
  };

  const isPointInRegion = (pos, region) => {
    const shape = region.shape || 'rectangle';

    if (shape === 'rectangle') {
      return pos.x >= region.x && pos.x <= region.x + region.width &&
             pos.y >= region.y && pos.y <= region.y + region.height;
    } else if (shape === 'circle') {
      const centerX = region.x + region.width / 2;
      const centerY = region.y + region.height / 2;
      const radiusX = Math.abs(region.width / 2);
      const radiusY = Math.abs(region.height / 2);

      const normalizedX = (pos.x - centerX) / radiusX;
      const normalizedY = (pos.y - centerY) / radiusY;

      return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
    } else if (shape === 'polygon' && region.points) {
      // Point-in-polygon test (ray casting algorithm)
      let inside = false;
      const points = region.points;

      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x, yi = points[i].y;
        const xj = points[j].x, yj = points[j].y;

        const intersect = ((yi > pos.y) !== (yj > pos.y))
            && (pos.x < (xj - xi) * (pos.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }

      return inside;
    }

    return false;
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Account for canvas scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Get raw canvas coordinates
    let x = (e.clientX - rect.left) * scaleX;
    let y = (e.clientY - rect.top) * scaleY;

    // Account for zoom and pan transformations
    // Reverse the transformation: translate back, scale back, translate back
    x = (x - canvas.width / 2 - pan.x) / zoom + canvas.width / 2;
    y = (y - canvas.height / 2 - pan.y) / zoom + canvas.height / 2;

    return { x, y };
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleMouseDown = (e) => {
    // Right click or Ctrl+click for panning
    if (e.button === 2 || e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setIsPanning(true);
      setLastPanPos({ x: e.clientX, y: e.clientY });
      return;
    }

    const pos = getMousePos(e);

    // Check if clicking on selected region's resize handle
    if (selectedRegionIndex !== null && regions[selectedRegionIndex].shape === 'rectangle') {
      const handle = getResizeHandle(pos, regions[selectedRegionIndex]);
      if (handle) {
        setIsResizing(true);
        setResizeHandle(handle);
        setStartPos(pos);
        return;
      }
    }

    // Check if clicking on existing region
    const clickedRegionIndex = regions.findIndex(r => isPointInRegion(pos, r));

    if (clickedRegionIndex !== -1) {
      setSelectedRegionIndex(clickedRegionIndex);

      // Check if we should start moving
      if (e.shiftKey) {
        setIsMoving(true);
        setStartPos(pos);
      }
      return;
    }

    // Polygon drawing mode
    if (drawingShape === 'polygon') {
      // Add point to polygon
      setPolygonPoints([...polygonPoints, pos]);
      return;
    }

    // Start drawing new region (rectangle or circle)
    setSelectedRegionIndex(null);
    setIsDrawing(true);
    setStartPos(pos);
    setCurrentRegion({ x: pos.x, y: pos.y, width: 0, height: 0, shape: drawingShape });
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPos.x;
      const dy = e.clientY - lastPanPos.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPanPos({ x: e.clientX, y: e.clientY });
      return;
    }

    const pos = getMousePos(e);

    // Handle moving a region
    if (isMoving && selectedRegionIndex !== null) {
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;

      const newRegions = [...regions];
      newRegions[selectedRegionIndex] = {
        ...newRegions[selectedRegionIndex],
        x: newRegions[selectedRegionIndex].x + dx,
        y: newRegions[selectedRegionIndex].y + dy
      };

      onChange(newRegions);
      setStartPos(pos);
      return;
    }

    // Handle resizing a region
    if (isResizing && selectedRegionIndex !== null) {
      const region = regions[selectedRegionIndex];
      const newRegions = [...regions];
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;

      let newRegion = { ...region };

      switch (resizeHandle) {
        case 'nw':
          newRegion.x += dx;
          newRegion.y += dy;
          newRegion.width -= dx;
          newRegion.height -= dy;
          break;
        case 'ne':
          newRegion.y += dy;
          newRegion.width += dx;
          newRegion.height -= dy;
          break;
        case 'sw':
          newRegion.x += dx;
          newRegion.width -= dx;
          newRegion.height += dy;
          break;
        case 'se':
          newRegion.width += dx;
          newRegion.height += dy;
          break;
        case 'n':
          newRegion.y += dy;
          newRegion.height -= dy;
          break;
        case 's':
          newRegion.height += dy;
          break;
        case 'w':
          newRegion.x += dx;
          newRegion.width -= dx;
          break;
        case 'e':
          newRegion.width += dx;
          break;
        default:
          break;
      }

      newRegions[selectedRegionIndex] = newRegion;
      onChange(newRegions);
      setStartPos(pos);
      return;
    }

    // Handle drawing new region
    if (!isDrawing) return;

    const width = pos.x - startPos.x;
    const height = pos.y - startPos.y;

    setCurrentRegion({
      x: width > 0 ? startPos.x : pos.x,
      y: height > 0 ? startPos.y : pos.y,
      width: Math.abs(width),
      height: Math.abs(height),
      shape: drawingShape
    });
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isMoving) {
      setIsMoving(false);
      return;
    }

    if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
      return;
    }

    if (!isDrawing || !currentRegion) return;

    // Only add region if it has meaningful size
    if (currentRegion.width > 10 && currentRegion.height > 10) {
      const newRegion = {
        ...currentRegion,
        id: Date.now(),
        answer: '', // Will be filled by user
        shape: drawingShape
      };

      const newRegions = [...regions, newRegion];
      onChange(newRegions);
      setSelectedRegionIndex(newRegions.length - 1);
    }

    setIsDrawing(false);
    setStartPos(null);
    setCurrentRegion(null);
  };

  // Complete polygon drawing
  const completePolygon = () => {
    if (polygonPoints.length < 3) {
      alert('A polygon needs at least 3 points');
      setPolygonPoints([]);
      return;
    }

    // Calculate bounding box
    const xs = polygonPoints.map(p => p.x);
    const ys = polygonPoints.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const newRegion = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      shape: 'polygon',
      points: polygonPoints,
      id: Date.now(),
      answer: ''
    };

    const newRegions = [...regions, newRegion];
    onChange(newRegions);
    setPolygonPoints([]);
    setSelectedRegionIndex(newRegions.length - 1);
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
    <div className="picture-quiz-editor">
      <div className="editor-instructions">
        <h4>How to create quizs:</h4>
        <ol>
          <li>Select a shape (Rectangle, Circle, or Polygon) from the toolbar</li>
          <li>Click and drag to draw rectangles/circles, or click points for polygons</li>
          <li>Shift+drag to move a selected region, or drag resize handles</li>
          <li>Enter the answer for each occluded region in the list below</li>
          <li>Delete/Backspace to remove selected region, Esc to deselect</li>
          <li>Ctrl+drag or right-click drag to pan, mouse wheel or +/- to zoom</li>
        </ol>
      </div>

      {/* Toolbar */}
      <div className="editor-toolbar">
        {/* Shape Selector */}
        <div className="shape-selector">
          <label>Shape:</label>
          <select value={drawingShape} onChange={(e) => setDrawingShape(e.target.value)}>
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="polygon">Polygon</option>
          </select>
          {drawingShape === 'polygon' && polygonPoints.length > 0 && (
            <button onClick={completePolygon} className="complete-polygon-btn">
              Complete Polygon ({polygonPoints.length} points)
            </button>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="zoom-controls">
          <button onClick={handleZoomOut} className="zoom-btn" title="Zoom Out (-)">
            −
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="zoom-btn" title="Zoom In (+)">
            +
          </button>
          <button onClick={handleResetZoom} className="zoom-btn reset-btn" title="Reset (0)">
            ⟲
          </button>
        </div>
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            cursor: isPanning ? 'grabbing' :
                   isDrawing ? 'crosshair' :
                   zoom > 1 ? 'grab' : 'pointer',
            maxWidth: '100%'
          }}
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
          <p>No regions created yet. Draw rectangles on the image to create quizs.</p>
        </div>
      )}
    </div>
  );
};

export default ImageOcclusionEditor;
