/**
 * Picture Quiz Study Component
 * Displays picture quiz cards during study sessions
 * Enhanced with zoom, pan, keyboard shortcuts, and touch support
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './PictureQuizStudy.css';

const PictureQuizStudy = ({ card, isRevealed }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [currentRegionIndex, setCurrentRegionIndex] = useState(0);

  // Enhanced interaction states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 });

  // Visual experience states
  const [occlusionStyle, setOcclusionStyle] = useState('solid'); // 'solid', 'blur', 'pixelate'
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get full image URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const imageUrl = card.imageUrl.startsWith('http')
    ? card.imageUrl
    : `${API_BASE_URL}${card.imageUrl}`;

  const regions = useMemo(() => card.occludedRegions || [], [card.occludedRegions]);

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const img = new Image();

    img.onload = () => {
      // Set canvas size to match image
      const maxWidth = 600;
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      imageRef.current = img;
      redrawCanvas();
    };

    img.onerror = () => {
      console.error('Failed to load image:', imageUrl);
    };

    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    redrawCanvas();
  }, [isRevealed, currentRegionIndex, zoom, pan, animationProgress, occlusionStyle, redrawCanvas]);

  // Animation effect when revealing
  useEffect(() => {
    if (isRevealed && isAnimating) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.05;
        if (progress >= 1) {
          progress = 1;
          clearInterval(interval);
          setIsAnimating(false);
        }
        setAnimationProgress(progress);
      }, 16); // ~60fps

      return () => clearInterval(interval);
    } else if (!isRevealed) {
      setAnimationProgress(0);
      setIsAnimating(true);
    }
  }, [isRevealed, currentRegionIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevRegion();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNextRegion();
          break;
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          // Trigger reveal (handled by parent)
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
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRegionIndex, regions.length, zoom, handleNextRegion, handlePrevRegion]);

  // Helper function to draw occlusion based on style
  const drawOcclusion = useCallback((ctx, region, index) => {
    const isCurrentRegion = index === currentRegionIndex;
    const shouldReveal = isRevealed && isCurrentRegion;
    const opacity = shouldReveal ? 1 - animationProgress * 0.8 : 1;

    if (occlusionStyle === 'solid') {
      // Solid black overlay
      ctx.fillStyle = `rgba(0, 0, 0, ${0.8 * opacity})`;
      ctx.fillRect(region.x, region.y, region.width, region.height);
    } else if (occlusionStyle === 'blur') {
      // Blur effect using multiple semi-transparent layers
      const blurAmount = 10 * opacity;
      for (let i = 0; i < blurAmount; i++) {
        ctx.fillStyle = `rgba(100, 100, 100, ${0.1 * opacity})`;
        ctx.fillRect(
          region.x - i, region.y - i,
          region.width + i * 2, region.height + i * 2
        );
      }
    } else if (occlusionStyle === 'pixelate') {
      // Pixelation effect
      const pixelSize = Math.max(8, Math.floor(20 * opacity));
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');

      tempCanvas.width = region.width;
      tempCanvas.height = region.height;

      // Draw the region from the image
      tempCtx.drawImage(
        imageRef.current,
        region.x, region.y, region.width, region.height,
        0, 0, region.width, region.height
      );

      // Pixelate
      const smallWidth = Math.ceil(region.width / pixelSize);
      const smallHeight = Math.ceil(region.height / pixelSize);

      tempCtx.drawImage(tempCanvas, 0, 0, smallWidth, smallHeight);
      tempCtx.drawImage(tempCanvas, 0, 0, smallWidth, smallHeight, 0, 0, region.width, region.height);

      ctx.drawImage(tempCanvas, region.x, region.y);
    }

    // Draw border with color coding
    const borderColor = shouldReveal
      ? `rgba(76, 175, 80, ${animationProgress})` // Green when revealed
      : index % 3 === 0 ? '#6366F1' // Purple
      : index % 3 === 1 ? '#F59E0B' // Amber
      : '#EC4899'; // Pink

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = shouldReveal ? 3 : 2;
    ctx.strokeRect(region.x, region.y, region.width, region.height);

    // Draw question mark or region number
    if (!shouldReveal || animationProgress < 0.5) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const text = '?';
      ctx.fillText(text, region.x + region.width / 2, region.y + region.height / 2);
    }
  }, [isRevealed, currentRegionIndex, animationProgress, occlusionStyle]);

  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    // Save context state
    ctx.save();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw occlusions
    regions.forEach((region, index) => {
      drawOcclusion(ctx, region, index);
    });

    // Restore context state
    ctx.restore();
  }, [isRevealed, currentRegionIndex, zoom, pan, regions, drawOcclusion]);

  const handleNextRegion = useCallback(() => {
    if (currentRegionIndex < regions.length - 1) {
      setCurrentRegionIndex(currentRegionIndex + 1);
    }
  }, [currentRegionIndex, regions.length]);

  const handlePrevRegion = useCallback(() => {
    if (currentRegionIndex > 0) {
      setCurrentRegionIndex(currentRegionIndex - 1);
    }
  }, [currentRegionIndex]);

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

  // Pan handlers (mouse)
  const handleMouseDown = (e) => {
    if (e.button === 0 && (e.ctrlKey || e.metaKey || zoom > 1)) {
      setIsPanning(true);
      setLastPanPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPos.x;
      const dy = e.clientY - lastPanPos.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPanPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch handlers
  const touchStartPos = useRef(null);
  const lastTouchDistance = useRef(null);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    } else if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistance.current = distance;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && touchStartPos.current) {
      const dx = e.touches[0].clientX - touchStartPos.current.x;
      const dy = e.touches[0].clientY - touchStartPos.current.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    } else if (e.touches.length === 2 && lastTouchDistance.current) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (distance - lastTouchDistance.current) * 0.01;
      setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
      lastTouchDistance.current = distance;
    }
  };

  const handleTouchEnd = () => {
    touchStartPos.current = null;
    lastTouchDistance.current = null;
  };

  if (regions.length === 0) {
    return (
      <div className="picture-quiz-study-error">
        <p>No quiz regions defined for this card.</p>
      </div>
    );
  }

  const currentRegion = regions[currentRegionIndex];

  return (
    <div className="picture-quiz-study">
      {/* Progress Bar */}
      {regions.length > 0 && (
        <div className="progress-container">
          <div className="progress-bar-wrapper">
            <div
              className="progress-bar-fill"
              style={{ width: `${(currentRegionIndex / (regions.length - 1)) * 100}%` }}
            >
              <span className="progress-text">
                {currentRegionIndex + 1} / {regions.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="control-panel">
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

        {/* Occlusion Style Selector */}
        <div className="style-selector">
          <label>Style:</label>
          <select value={occlusionStyle} onChange={(e) => setOcclusionStyle(e.target.value)}>
            <option value="solid">Solid</option>
            <option value="blur">Blur</option>
            <option value="pixelate">Pixelate</option>
          </select>
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="shortcuts-hint">
        <small>
          <strong>Shortcuts:</strong> ← → Navigate | +/- Zoom | 0 Reset | {zoom > 1 ? 'Drag to pan' : 'Ctrl+Drag to pan'}
        </small>
      </div>

      <div className="canvas-container" ref={containerRef}>
        <canvas
          ref={canvasRef}
          style={{
            maxWidth: '100%',
            cursor: isPanning ? 'grabbing' : (zoom > 1 ? 'grab' : 'default')
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      {isRevealed && (
        <div className="region-info">
          <div className="region-navigation">
            <button
              onClick={handlePrevRegion}
              disabled={currentRegionIndex === 0}
              className="nav-btn"
            >
              ← Previous
            </button>
            <span className="region-counter">
              Region {currentRegionIndex + 1} of {regions.length}
            </span>
            <button
              onClick={handleNextRegion}
              disabled={currentRegionIndex === regions.length - 1}
              className="nav-btn"
            >
              Next →
            </button>
          </div>
          <div className="region-answer">
            <strong>Answer:</strong> {currentRegion.answer}
          </div>
        </div>
      )}

      {!isRevealed && regions.length > 1 && (
        <div className="region-hint">
          <p>{regions.length} regions to identify</p>
        </div>
      )}
    </div>
  );
};

export default PictureQuizStudy;
