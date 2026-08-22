import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import { Eraser } from 'lucide-react';

export interface SignaturePadHandle {
  isEmpty: () => boolean;
  toDataURL: () => string;
  clear: () => void;
}

/** Canvas signature pad (pointer/touch). Exposes toDataURL via ref. */
export const SignaturePad = forwardRef<SignaturePadHandle>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    // Scale for crisp lines on HiDPI.
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#054A91';
  }, []);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    last.current = pos(e);
    canvasRef.current!.setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.current!.x, last.current!.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    dirty.current = true;
  };
  const end = () => {
    drawing.current = false;
    last.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    dirty.current = false;
  };

  useImperativeHandle(ref, () => ({
    isEmpty: () => !dirty.current,
    toDataURL: () => canvasRef.current!.toDataURL('image/png'),
    clear,
  }));

  return (
    <div>
      <div className="relative rounded-input border border-ala-grey-200 bg-white">
        <canvas
          ref={canvasRef}
          className="h-40 w-full touch-none rounded-input"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-xs text-ala-grey-300">
          Sign above
        </span>
      </div>
      <button type="button" onClick={clear} className="mt-1.5 inline-flex items-center gap-1 text-xs text-ala-grey-500 hover:text-ala-red">
        <Eraser className="h-3.5 w-3.5" /> Clear
      </button>
    </div>
  );
});
SignaturePad.displayName = 'SignaturePad';
