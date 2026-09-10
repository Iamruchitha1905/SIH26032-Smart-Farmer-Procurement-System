import React, { useEffect, useRef } from "react";

export default function QRCodeDisplay({ text, size = 160 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);

    // Simple robust QR simulation generator pattern
    const cells = 21;
    const cellSize = size / cells;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = "#0f172a";

    // Hash function to make deterministic QR grid from text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    // Draw finder patterns (corners)
    drawFinder(ctx, 0, 0, cellSize);
    drawFinder(ctx, cells - 7, 0, cellSize);
    drawFinder(ctx, 0, cells - 7, cellSize);

    // Draw data cells
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        // Skip finder areas
        if ((r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7)) continue;

        const val = Math.abs((hash * (r + 1) * 31 + c * 17) % 100);
        if (val > 45) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [text, size]);

  function drawFinder(ctx, xCell, yCell, cellSize) {
    const x = xCell * cellSize;
    const y = yCell * cellSize;
    const w = 7 * cellSize;

    ctx.fillRect(x, y, w, w);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + cellSize, y + cellSize, w - 2 * cellSize, w - 2 * cellSize);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, w - 4 * cellSize, w - 4 * cellSize);
  }

  return (
    <div className="qr-container">
      <canvas ref={canvasRef} width={size} height={size} />
    </div>
  );
}
