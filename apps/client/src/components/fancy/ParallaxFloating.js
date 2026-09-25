import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const FloatingContext = createContext({ mouseX: 0, mouseY: 0, sensitivity: -1 });

export function Floating({ children, sensitivity = -1, className = '' }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const animFrame = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      // Normalized between -1 and 1
      targetPos.current = {
        x: (e.clientX / innerWidth - 0.5) * 2,
        y: (e.clientY / innerHeight - 0.5) * 2,
      };
    };

    // Smooth spring/damping interpolation
    const updateMotion = () => {
      setMousePos((prev) => {
        const dx = targetPos.current.x - prev.x;
        const dy = targetPos.current.y - prev.y;
        return {
          x: prev.x + dx * 0.08,
          y: prev.y + dy * 0.08,
        };
      });
      animFrame.current = requestAnimationFrame(updateMotion);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animFrame.current = requestAnimationFrame(updateMotion);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  return (
    <FloatingContext.Provider value={{ mouseX: mousePos.x, mouseY: mousePos.y, sensitivity }}>
      <div ref={containerRef} className={`parallax-floating-stage ${className}`}>
        {children}
      </div>
    </FloatingContext.Provider>
  );
}

export function FloatingElement({ depth = 1, className = '', children }) {
  const { mouseX, mouseY, sensitivity } = useContext(FloatingContext);

  const moveX = mouseX * depth * sensitivity * 24;
  const moveY = mouseY * depth * sensitivity * 24;

  return (
    <div
      className={`floating-element-item ${className}`}
      style={{
        transform: `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0)`,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

export default Floating;
