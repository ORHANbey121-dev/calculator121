
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { DrawingTool } from './AIAssistant';

interface DrawingCanvasProps {
  onCanvasChange: (dataUrl: string | null) => void;
  language: Language;
  color?: string;
  tool?: DrawingTool;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ 
  onCanvasChange, 
  language, 
  color = '#10b981', 
  tool = 'pen' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const [height, setHeight] = useState(256);
  const isResizingRef = useRef(false);
  const t = translations[language];

  // Background color constant used for eraser
  const BG_COLOR = '#020617';

  // Helper to re-apply drawing settings
  const applyContextSettings = useCallback((ctx: CanvasRenderingContext2D) => {
    if (tool === 'eraser') {
      ctx.strokeStyle = BG_COLOR;
      ctx.lineWidth = 15; // Thicker for erasing
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [color, tool]);

  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    // Store existing content before resizing clears it
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    // Update internal resolution
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Reset transform and scale to handle DPR
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Fill background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Restore old content at 1:1 scale (since tempCanvas is already DPR scaled)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    
    // Reset transform to CSS pixels for drawing commands
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    
    applyContextSettings(ctx);
  }, [applyContextSettings]);

  useEffect(() => {
    // Initial setup
    updateCanvasSize();

    const resizeObserver = new ResizeObserver(() => {
      // Small timeout to ensure layout has finished
      requestAnimationFrame(updateCanvasSize);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateCanvasSize);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      resizeObserver.disconnect();
    };
  }, [updateCanvasSize]);

  // Effect to handle property changes (color/tool) without clearing the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) applyContextSettings(ctx);
    }
  }, [color, tool, applyContextSettings]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawingRef.current = true;
    const pos = getCoordinates(e.nativeEvent);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getCoordinates(e.nativeEvent);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      onCanvasChange(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, rect.width, rect.height);
    onCanvasChange(null);
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'ns-resize';
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizingRef.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    // Clamping height between 150px and 800px
    const newHeight = Math.max(150, Math.min(800, e.clientY - containerRect.top));
    setHeight(newHeight);
  };

  const stopResizing = () => {
    isResizingRef.current = false;
    window.removeEventListener('mousemove', handleResize);
    window.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = '';
    // Export change after final resize
    const canvas = canvasRef.current;
    if (canvas) {
      onCanvasChange(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{ height: `${height}px` }}
      className="relative w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner group"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-full cursor-crosshair touch-none block"
      />
      
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={clearCanvas}
          className="bg-slate-800/90 backdrop-blur hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-md border border-slate-700 transition-colors shadow-lg active:scale-95"
        >
          {t.drawClear}
        </button>
      </div>

      <div 
        onMouseDown={startResizing}
        className="absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize group/handle flex items-center justify-center bg-slate-900/10 hover:bg-emerald-500/10 transition-colors z-10"
      >
        <div className="w-12 h-1 bg-slate-800 rounded-full group-hover/handle:bg-emerald-500/50 transition-colors"></div>
      </div>

      <div className="absolute bottom-4 left-3 text-[10px] text-slate-600 pointer-events-none select-none font-medium">
        {t.drawHint} {tool === 'eraser' ? '(Silgi Modu)' : ''}
      </div>
    </div>
  );
};
