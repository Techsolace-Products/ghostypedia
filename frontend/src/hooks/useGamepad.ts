import { useState, useEffect, useRef } from "react";

export interface GamepadState {
  isConnected: boolean;
  cursorPos: { x: number; y: number };
  buttons: {
    cross: boolean; // 0
    circle: boolean; // 1
    square: boolean; // 2
    triangle: boolean; // 3
    l1: boolean; // 4
    r1: boolean; // 5
    up: boolean; // 12
    down: boolean; // 13
    left: boolean; // 14
    right: boolean; // 15
  };
  // Axes are raw values -1 to 1
  axes: {
    leftStickX: number;
    leftStickY: number;
    rightStickX: number;
    rightStickY: number;
  };
}

// Map standard gamepad buttons
export const BUTTON_MAP = {
  CROSS: 0,
  CIRCLE: 1,
  SQUARE: 2,
  TRIANGLE: 3,
  L1: 4,
  R1: 5,
  UP: 12,
  DOWN: 13,
  LEFT: 14,
  RIGHT: 15,
};

export const useGamepad = (isModalOpen: boolean = false, closeModal?: () => void) => {
  const [isConnected, setIsConnected] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  // We can expose button states if needed, but for now we consume them internally for navigation
  // to avoid excessive re-renders. 

  const lastButtonPress = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const hoveredElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Initialize cursor position
    if (typeof window !== 'undefined') {
      setCursorPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }

    const handleConnect = () => {
      setIsConnected(true);
      console.log("GAMEPAD_CONNECTED // DRIVER_INIT");
    };
    const handleDisconnect = () => setIsConnected(false);

    window.addEventListener("gamepadconnected", handleConnect);
    window.addEventListener("gamepaddisconnected", handleDisconnect);

    const updateLoop = () => {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[0]; // Assume 1st controller

      if (gp) {
        const now = Date.now();

        // 1. VIRTUAL CURSOR MOVEMENT (Left Stick - Axes 0 and 1)
        const deadzone = 0.15;
        const xAxis = Math.abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
        const yAxis = Math.abs(gp.axes[1]) > deadzone ? gp.axes[1] : 0;

        if (xAxis !== 0 || yAxis !== 0) {
          const speed = 12;
          const acceleration = Math.max(Math.abs(xAxis), Math.abs(yAxis)) > 0.7 ? 1.5 : 1;

          setCursorPos(prev => {
            const newX = Math.max(0, Math.min(window.innerWidth, prev.x + xAxis * speed * acceleration));
            const newY = Math.max(0, Math.min(window.innerHeight, prev.y + yAxis * speed * acceleration));

            // Check what element is under cursor
            const elementAtPoint = document.elementFromPoint(newX, newY) as HTMLElement;
            if (elementAtPoint && elementAtPoint !== hoveredElement.current) {
              // Remove hover from previous element
              hoveredElement.current?.classList.remove('gamepad-hover');
              // Add hover to new element
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

        // 2. SCROLLING (Right Stick - Axes 2 and 3)
        const scrollX = Math.abs(gp.axes[2]) > deadzone ? gp.axes[2] : 0;
        const scrollY = Math.abs(gp.axes[3]) > deadzone ? gp.axes[3] : 0;

        if (scrollX !== 0 || scrollY !== 0) {
          const scrollSpeed = 25;
          window.scrollBy(scrollX * scrollSpeed, scrollY * scrollSpeed);
        }

        // 3. BUTTON INPUTS (Throttled)
        if (now - lastButtonPress.current > 150) {

          // --- FOCUS NAVIGATION (D-Pad) ---
          const up = gp.buttons[12]?.pressed;
          const down = gp.buttons[13]?.pressed;
          const left = gp.buttons[14]?.pressed;
          const right = gp.buttons[15]?.pressed;

          if (up || down || left || right) {
            // Find all focusable elements
            const focusable = Array.from(document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')) as HTMLElement[];
            const current = document.activeElement;
            const currentIndex = focusable.indexOf(current as HTMLElement);

            // Simple linear navigation
            let nextIndex = 0;
            if (currentIndex > -1) {
              if (up || left) {
                nextIndex = currentIndex - 1;
              } else {
                nextIndex = currentIndex + 1;
              }
              // Loop around
              if (nextIndex >= focusable.length) nextIndex = 0;
              if (nextIndex < 0) nextIndex = focusable.length - 1;
            }

            focusable[nextIndex]?.focus();
            focusable[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            lastButtonPress.current = now;
          }

          // --- SELECTION (A Button / Cross - button 0) ---
          if (gp.buttons[0]?.pressed) {
            if (hoveredElement.current) {
              hoveredElement.current.click();
              // Visual feedback
              hoveredElement.current.classList.add('scale-95', 'opacity-70');
              setTimeout(() => {
                hoveredElement.current?.classList.remove('scale-95', 'opacity-70');
              }, 100);
            } else if (document.activeElement && (document.activeElement as HTMLElement).click) {
              // Also click focused element
              (document.activeElement as HTMLElement).click();
            }
            lastButtonPress.current = now;
          }

          // --- BACK/CLOSE (B Button / Circle - button 1) ---
          if (gp.buttons[1]?.pressed) {
            if (isModalOpen && closeModal) {
              closeModal();
            } else {
              // Could trigger a "back" navigation or just scroll to top
              // window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            lastButtonPress.current = now;
          }

          // --- QUICK ACTIONS (Shoulder Buttons) ---
          if (gp.buttons[4]?.pressed) { // L1
            window.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
            lastButtonPress.current = now;
          }
          if (gp.buttons[5]?.pressed) { // R1
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
};
