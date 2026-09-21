import { useEffect, useRef, useState } from "react";

type ResizePanelProps = {
  children: React.ReactNode;
  direction: "horizontal" | "vertical";
  initialSize?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
};

export function ResizePanel({
  children,
  direction,
  initialSize = 60,
  minSize = 20,
  maxSize = 85,
  className,
}: ResizePanelProps) {
  const [size, setSize] = useState(initialSize);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.parentElement?.getBoundingClientRect();
      if (!rect) return;

      let percent: number;
      if (direction === "horizontal") {
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        percent = ((clientX - rect.left) / rect.width) * 100;
      } else {
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
        percent = ((clientY - rect.top) / rect.height) * 100;
      }

      setSize(Math.max(minSize, Math.min(maxSize, percent)));
    };

    const handleUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
    };
  }, [direction, minSize, maxSize]);

  const isHorizontal = direction === "horizontal";

  return (
    <div ref={containerRef} className={className} style={isHorizontal ? { width: `${size}%` } : { height: `${size}%` }}>
      {children}
      <div
        onMouseDown={() => {
          dragging.current = true;
          document.body.style.cursor = isHorizontal ? "col-resize" : "row-resize";
          document.body.style.userSelect = "none";
        }}
        onTouchStart={() => {
          dragging.current = true;
        }}
        className={`absolute ${
          isHorizontal
            ? "right-0 top-0 h-full w-1 -translate-x-1/2 cursor-col-resize hover:bg-blue-500"
            : "bottom-0 left-0 w-full h-1 -translate-y-1/2 cursor-row-resize hover:bg-blue-500"
        } z-10 transition-colors`}
        aria-label="Resize panel"
        role="separator"
      />
    </div>
  );
}
