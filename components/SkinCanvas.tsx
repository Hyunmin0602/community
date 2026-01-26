'use client';

import { useEffect, useRef, useState } from 'react';
import { Undo2, Redo2, Paintbrush, Eraser, Droplet, ZoomIn, ZoomOut, Grid3x3 } from 'lucide-react';

interface SkinCanvasProps {
    imageData: string | null;
    onImageChange?: (newImageData: string) => void;
    editable?: boolean;
}

type Tool = 'draw' | 'erase' | 'fill' | 'eyedropper';

export default function SkinCanvas({ imageData, onImageChange, editable = false }: SkinCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const displayCanvasRef = useRef<HTMLCanvasElement>(null);
    const [zoom, setZoom] = useState(8);
    const [showGrid, setShowGrid] = useState(true);
    const [selectedTool, setSelectedTool] = useState<Tool>('draw');
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [isDrawing, setIsDrawing] = useState(false);

    // Undo/Redo stacks
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Minecraft-inspired color palette
    const minecraftColors = [
        '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
        '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
        '#A52A2A', '#808080', '#C0C0C0', '#FFD700', '#00FF7F', '#4169E1',
    ];

    // Initialize canvas with image
    useEffect(() => {
        if (!imageData || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            canvas.width = 64;
            canvas.height = 64;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, 64, 64);

            // Save initial state to history
            saveToHistory();
            updateDisplay();
        };
        img.src = imageData;
    }, [imageData]);

    // Update display canvas
    const updateDisplay = () => {
        if (!canvasRef.current || !displayCanvasRef.current) return;

        const canvas = canvasRef.current;
        const displayCanvas = displayCanvasRef.current;
        const ctx = displayCanvas.getContext('2d');
        if (!ctx) return;

        const size = 64 * zoom;
        displayCanvas.width = size;
        displayCanvas.height = size;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(canvas, 0, 0, size, size);

        // Draw grid
        if (showGrid && zoom >= 4) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 1;

            for (let i = 0; i <= 64; i++) {
                const pos = i * zoom;
                // Vertical lines
                ctx.beginPath();
                ctx.moveTo(pos, 0);
                ctx.lineTo(pos, size);
                ctx.stroke();

                // Horizontal lines
                ctx.beginPath();
                ctx.moveTo(0, pos);
                ctx.lineTo(size, pos);
                ctx.stroke();
            }
        }
    };

    // Update display when zoom or grid changes
    useEffect(() => {
        updateDisplay();
    }, [zoom, showGrid]);

    // Save current state to history
    const saveToHistory = () => {
        if (!canvasRef.current) return;

        const dataUrl = canvasRef.current.toDataURL();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(dataUrl);

        // Limit history to 50 states
        if (newHistory.length > 50) {
            newHistory.shift();
        } else {
            setHistoryIndex(historyIndex + 1);
        }

        setHistory(newHistory);

        if (onImageChange) {
            onImageChange(dataUrl);
        }
    };

    // Undo
    const undo = () => {
        if (historyIndex <= 0 || !canvasRef.current) return;

        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);

        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, 64, 64);
            ctx.drawImage(img, 0, 0);
            updateDisplay();

            if (onImageChange) {
                onImageChange(canvas.toDataURL());
            }
        };
        img.src = history[newIndex];
    };

    // Redo
    const redo = () => {
        if (historyIndex >= history.length - 1 || !canvasRef.current) return;

        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);

        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, 64, 64);
            ctx.drawImage(img, 0, 0);
            updateDisplay();

            if (onImageChange) {
                onImageChange(canvas.toDataURL());
            }
        };
        img.src = history[newIndex];
    };

    // Get pixel coordinates from mouse event
    const getPixelCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = displayCanvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / zoom);
        const y = Math.floor((e.clientY - rect.top) / zoom);

        if (x < 0 || x >= 64 || y < 0 || y >= 64) return null;

        return { x, y };
    };

    // Handle drawing
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!editable) return;

        setIsDrawing(true);
        handleDraw(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!editable || !isDrawing) return;
        handleDraw(e);
    };

    const handleMouseUp = () => {
        if (!editable || !isDrawing) return;

        setIsDrawing(false);
        saveToHistory();
    };

    const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const coords = getPixelCoords(e);
        if (!coords || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = coords;

        if (selectedTool === 'draw') {
            ctx.fillStyle = selectedColor;
            ctx.fillRect(x, y, 1, 1);
        } else if (selectedTool === 'erase') {
            ctx.clearRect(x, y, 1, 1);
        } else if (selectedTool === 'eyedropper') {
            const imageData = ctx.getImageData(x, y, 1, 1);
            const [r, g, b] = imageData.data;
            const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            setSelectedColor(hex);
            setSelectedTool('draw');
        } else if (selectedTool === 'fill') {
            floodFill(ctx, x, y, selectedColor);
        }

        updateDisplay();
    };

    // Flood fill algorithm
    const floodFill = (ctx: CanvasRenderingContext2D, startX: number, startY: number, fillColor: string) => {
        const imageData = ctx.getImageData(0, 0, 64, 64);
        const pixels = imageData.data;

        // Convert fill color to RGB
        const temp = document.createElement('canvas').getContext('2d')!;
        temp.fillStyle = fillColor;
        temp.fillRect(0, 0, 1, 1);
        const fillRGBA = Array.from(temp.getImageData(0, 0, 1, 1).data);

        // Get target color
        const startIdx = (startY * 64 + startX) * 4;
        const targetRGBA = [pixels[startIdx], pixels[startIdx + 1], pixels[startIdx + 2], pixels[startIdx + 3]];

        // If same color, return
        if (targetRGBA.every((v, i) => v === fillRGBA[i])) return;

        // BFS flood fill
        const queue: [number, number][] = [[startX, startY]];
        const visited = new Set<string>();

        while (queue.length > 0) {
            const [x, y] = queue.shift()!;
            const key = `${x},${y}`;

            if (visited.has(key) || x < 0 || x >= 64 || y < 0 || y >= 64) continue;
            visited.add(key);

            const idx = (y * 64 + x) * 4;
            const currentRGBA = [pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3]];

            // Check if matches target color
            if (!currentRGBA.every((v, i) => v === targetRGBA[i])) continue;

            // Fill pixel
            pixels[idx] = fillRGBA[0];
            pixels[idx + 1] = fillRGBA[1];
            pixels[idx + 2] = fillRGBA[2];
            pixels[idx + 3] = fillRGBA[3];

            // Add neighbors
            queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }

        ctx.putImageData(imageData, 0, 0);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            {editable && (
                <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border">
                    {/* Tools */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedTool('draw')}
                            className={`p-2 rounded-lg transition-colors ${selectedTool === 'draw' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200'
                                }`}
                            title="그리기"
                        >
                            <Paintbrush className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setSelectedTool('erase')}
                            className={`p-2 rounded-lg transition-colors ${selectedTool === 'erase' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200'
                                }`}
                            title="지우개"
                        >
                            <Eraser className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setSelectedTool('fill')}
                            className={`p-2 rounded-lg transition-colors ${selectedTool === 'fill' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200'
                                }`}
                            title="채우기"
                        >
                            <Droplet className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setSelectedTool('eyedropper')}
                            className={`p-2 rounded-lg transition-colors ${selectedTool === 'eyedropper' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200'
                                }`}
                            title="스포이드"
                        >
                            🎨
                        </button>
                    </div>

                    <div className="w-px h-8 bg-slate-300 dark:bg-zinc-700" />

                    {/* Undo/Redo */}
                    <div className="flex gap-2">
                        <button
                            onClick={undo}
                            disabled={historyIndex <= 0}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="실행 취소"
                        >
                            <Undo2 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={redo}
                            disabled={historyIndex >= history.length - 1}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="다시 실행"
                        >
                            <Redo2 className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="w-px h-8 bg-slate-300 dark:bg-zinc-700" />

                    {/* Zoom */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setZoom(Math.max(2, zoom - 2))}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 transition-colors"
                            title="축소"
                        >
                            <ZoomOut className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium min-w-[3rem] text-center">{zoom}x</span>
                        <button
                            onClick={() => setZoom(Math.min(16, zoom + 2))}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 transition-colors"
                            title="확대"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200'
                            }`}
                        title="그리드 표시"
                    >
                        <Grid3x3 className="h-4 w-4" />
                    </button>

                    <div className="w-px h-8 bg-slate-300 dark:bg-zinc-700" />

                    {/* Color Picker */}
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className="w-10 h-10 rounded-lg border-2 border-slate-300 dark:border-zinc-600 cursor-pointer"
                        />

                        {/* Minecraft Color Palette */}
                        <div className="flex flex-wrap gap-1 max-w-xs">
                            {minecraftColors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${selectedColor === color ? 'border-indigo-500 scale-110' : 'border-slate-300 dark:border-zinc-600'
                                        }`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Canvas Display */}
            <div className="flex justify-center p-6 bg-slate-100 dark:bg-zinc-900 rounded-xl border">
                <div className="relative inline-block" style={{
                    backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}>
                    <canvas
                        ref={displayCanvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className={editable ? 'cursor-crosshair' : ''}
                        style={{
                            imageRendering: 'pixelated',
                            imageRendering: 'crisp-edges',
                        }}
                    />
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            </div>

            {!editable && !imageData && (
                <div className="text-center text-muted-foreground py-8">
                    <p>AI로 스킨을 생성하거나 이미지를 업로드해주세요</p>
                </div>
            )}
        </div>
    );
}
