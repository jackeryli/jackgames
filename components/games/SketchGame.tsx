import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import { guessDrawing } from '../../services/geminiService';
import { Eraser, Pen, Undo, RotateCcw, Loader2, Share2 } from 'lucide-react';

export const SketchGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [result, setResult] = useState<{ guess: string; confidence: string; comment: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Fill with white for better AI recognition (transparent sometimes confuses models)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setResult(null);
  };

  const handleGuess = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setLoading(true);
    try {
      // Get base64 without prefix for Gemini service (handled inside or stripped)
      // The service expects the full data uri usually or we strip it there. 
      // The GoogleGenAI library often wants just the base64 string.
      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];
      
      const responseText = await guessDrawing(base64);
      // Clean JSON string if it has markdown code blocks
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      setResult(parsed);
    } catch (err) {
      console.error(err);
      setResult({ guess: "Error", confidence: "0", comment: "I couldn't process that. Try again!" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
        // Initialize white background
        const ctx = canvas.getContext('2d');
        if(ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      
      // Handle resize
      const resize = () => {
        const parent = canvas.parentElement;
        if (parent) {
          // Save current content
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx?.drawImage(canvas, 0, 0);

          canvas.width = parent.clientWidth;
          canvas.height = 400; // Fixed height for drawing area

          // Restore content
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.fillStyle = '#ffffff';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             ctx.drawImage(tempCanvas, 0, 0);
          }
        }
      };
      window.addEventListener('resize', resize);
      resize();
      return () => window.removeEventListener('resize', resize);
    }
  }, []);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 gap-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack}>← Back</Button>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Sketch & Guess AI</h2>
        <div className="w-20"></div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-black relative">
         <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="touch-none cursor-crosshair w-full"
          style={{ height: '400px' }}
        />
        
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
            <p className="text-xl font-bold text-purple-800 animate-pulse">Analyzing masterpiece...</p>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex gap-2">
          <button onClick={() => setColor('#000000')} className={`w-8 h-8 rounded-full bg-black ${color === '#000000' ? 'ring-2 ring-offset-2 ring-black' : ''}`} />
          <button onClick={() => setColor('#ef4444')} className={`w-8 h-8 rounded-full bg-red-500 ${color === '#ef4444' ? 'ring-2 ring-offset-2 ring-red-500' : ''}`} />
          <button onClick={() => setColor('#3b82f6')} className={`w-8 h-8 rounded-full bg-blue-500 ${color === '#3b82f6' ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`} />
          <button onClick={() => setColor('#22c55e')} className={`w-8 h-8 rounded-full bg-green-500 ${color === '#22c55e' ? 'ring-2 ring-offset-2 ring-green-500' : ''}`} />
           <div className="w-px h-8 bg-gray-300 mx-2"></div>
          <button onClick={clearCanvas} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Clear"><RotateCcw size={20} /></button>
        </div>
        
        <div className="flex gap-3">
           <input 
            type="range" 
            min="1" 
            max="20" 
            value={lineWidth} 
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-24"
           />
        </div>

        <Button onClick={handleGuess} disabled={loading} className="w-full md:w-auto min-w-[150px]">
          {loading ? 'Thinking...' : 'AI Guess'}
        </Button>
      </div>

      {result && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg transform transition-all duration-500 hover:scale-[1.02]">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
               <span className="text-4xl">🎨</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-1">{result.guess}</h3>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-black/30 px-2 py-0.5 rounded text-xs font-mono">CONFIDENCE: {result.confidence}%</div>
              </div>
              <p className="text-lg italic opacity-90">"{result.comment}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
