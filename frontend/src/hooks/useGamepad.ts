"use client";

import { useState, useEffect, useRef } from "react";

export function useGamepad(isModalOpen: boolean, closeModal: () => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const lastButtonPress = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const hoveredElement = useRef<HTMLElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setCursorPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const handleConnect = () => {
      setIsConnected(true);
      console.log("GAMEPAD_CONNECTED // DRIVER_INIT");
    };
    const handleDisconnect = () => setIsConnected(false);

    window.addEventListener("gamepadconnected", handleConnect);
    window.addEventListener("gamepaddisconnected", handleDisconnect);

    const updateLoop = () => {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[0];

      if (gp) {
        const now = Date.now();
        
        const deadzone = 0.15;
        const xAxis = Math.abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
        const yAxis = Math.abs(gp.axes[1]) > deadzone ? gp.axes[1] : 0;
        
        if (xAxis !== 0 || yAxis !== 0) {
          const speed = 12;
          const acceleration = Math.max(Math.abs(xAxis), Math.abs(yAxis)) > 0.7 ? 1.5 : 1;
          
          setCursorPos(prev => {
            const newX = Math.max(0, Math.min(window.innerWidth, prev.x + xAxis * speed * acceleration));
            const newY = Math.max(0, Math.min(window.innerHeight, prev.y + yAxis * speed * acceleration));
            
            const elementAtPoint = document.elementFromPoint(newX, newY) as HTMLElement;
            if (elementAtPoint && elementAtPoint !== hoveredElement.current) {
              hoveredElement.current?.classList.remove('gamepad-hover');
              if (elementAtPoint.tagName === 'BUTTON' || elementAtPoint.tagName === 'A' || elementAtPoint.hasAttribute('tabindex')) {
                elementAtPoint.classList.add('gamepad-hover');
                hoveredElement.current = elementAtPoint;
              } else {
                hoveredElement.current = null;
              }
            }
            
            return { x: newX, y: newY };
          });
        }
        
        const scrollX = Math.abs(gp.axes[2]) > deadzone ? gp.axes[2] : 0;
        const scrollY = Math.abs(gp.axes[3]) > deadzone ? gp.axes[3] : 0;
        
        if (scrollX !== 0 || scrollY !== 0) {
          const scrollSpeed = 25;
          window.scrollBy(scrollX * scrollSpeed, scrollY * scrollSpeed);
        }

        if (now - lastButtonPress.current > 150) {
          const up = gp.buttons[12]?.pressed;
          const down = gp.buttons[13]?.pressed;
          const left = gp.buttons[14]?.pressed;
          const right = gp.buttons[15]?.pressed;

          if (up || down || left || right) {
            const focusable = Array.from(document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')) as HTMLElement[];
            const current = document.activeElement;
            const currentIndex = focusable.indexOf(current as HTMLElement);
            
            let nextIndex = 0;
            if (currentIndex > -1) {
                if (up || left) {
                  nextIndex = currentIndex - 1;
                } else {
                  nextIndex = currentIndex + 1;
                }
                if (nextIndex >= focusable.length) nextIndex = 0;
                if (nextIndex < 0) nextIndex = focusable.length - 1;
            }

            focusable[nextIndex]?.focus();
            focusable[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            lastButtonPress.current = now;
          }

          if (gp.buttons[0]?.pressed) {
            if (hoveredElement.current) {
              hoveredElement.current.click();
              hoveredElement.current.classList.add('scale-95', 'opacity-70');
              setTimeout(() => {
                hoveredElement.current?.classList.remove('scale-95', 'opacity-70');
              }, 100);
            }
            lastButtonPress.current = now;
          }

          if (gp.buttons[1]?.pressed) {
            if (isModalOpen) {
              closeModal();
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            lastButtonPress.current = now;
          }

          if (gp.buttons[4]?.pressed) {
            window.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
            lastButtonPress.current = now;
          }
          if (gp.buttons[5]?.pressed) {
            window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
            lastButtonPress.current = now;
          }
        }
      }
      requestRef.current = requestAnimationFrame(updateLoop);
    };

    updateLoop();

    return () => {
      window.removeEventListener("gamepadconnected", handleConnect);
      window.removeEventListener("gamepaddisconnected", handleDisconnect);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isModalOpen, closeModal]);

  return { isConnected, cursorPos };
}
