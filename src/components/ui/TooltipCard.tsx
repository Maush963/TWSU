"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

// Tarjeta flotante que sigue al cursor (basada en Tooltip Card de Aceternity UI). Se abre con
// el ratón, con el foco del teclado y, en pantallas táctiles, con el primer toque. Escape la cierra.
// La tarjeta no recibe el ratón (`pointer-events-none`): el clic llega al elemento de abajo.

const OFFSET = 12;
const ORIGIN = { x: 0, y: 0 };

interface TooltipCardProps {
  content: ReactNode;
  children: ReactNode;
  containerClassName?: string;
}

export function TooltipCard({ content, children, containerClassName = "" }: TooltipCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [height, setHeight] = useState(0);
  const [pointer, setPointer] = useState(ORIGIN);
  const [position, setPosition] = useState(ORIGIN);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const calculatePosition = useCallback((x: number, y: number) => {
    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card) return { x: x + OFFSET, y: y + OFFSET };

    const rect = container.getBoundingClientRect();
    const cardWidth = card.offsetWidth;
    const cardHeight = card.scrollHeight;
    let finalX = x + OFFSET;
    let finalY = y + OFFSET;

    // Si se sale por la derecha o abajo, se abre hacia el otro lado del cursor.
    if (rect.left + x + OFFSET + cardWidth > window.innerWidth) finalX = x - cardWidth - OFFSET;
    if (rect.top + y + OFFSET + cardHeight > window.innerHeight) finalY = y - cardHeight - OFFSET;
    // Y si así se sale por la izquierda o arriba, se pega al borde de la ventana.
    if (rect.left + finalX < 0) finalX = -rect.left + OFFSET;
    if (rect.top + finalY < 0) finalY = -rect.top + OFFSET;

    return { x: finalX, y: finalY };
  }, []);

  const move = useCallback(
    (x: number, y: number) => {
      setPointer({ x, y });
      setPosition(calculatePosition(x, y));
    },
    [calculatePosition],
  );

  const hide = useCallback(() => {
    setIsVisible(false);
    setPointer(ORIGIN);
    setPosition(ORIGIN);
  }, []);

  useEffect(() => {
    if (isVisible && contentRef.current) setHeight(contentRef.current.scrollHeight);
  }, [isVisible, content]);

  // Cuando la tarjeta ya existe y se midió, se recalcula la posición.
  useEffect(() => {
    if (isVisible && cardRef.current) setPosition(calculatePosition(pointer.x, pointer.y));
  }, [isVisible, height, pointer.x, pointer.y, calculatePosition]);

  useEffect(() => {
    if (!isVisible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isVisible, hide]);

  const canHover = () => window.matchMedia("(hover: hover)").matches;

  const pointerPoint = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const onMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    if (!canHover()) return;
    setIsVisible(true);
    const point = pointerPoint(event);
    move(point.x, point.y);
  };

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!isVisible || !canHover()) return;
    const point = pointerPoint(event);
    move(point.x, point.y);
  };

  // Con teclado no hay cursor: la tarjeta se ancla al centro del elemento enfocado.
  const onFocus = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    setIsVisible(true);
    if (rect) move(rect.width / 2, rect.height / 2);
  };

  // En pantallas táctiles el primer toque abre la tarjeta y el segundo sigue el enlace.
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (canHover() || isVisible) return;
    event.preventDefault();
    const point = pointerPoint(event);
    setIsVisible(true);
    move(point.x, point.y);
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${containerClassName}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={hide}
      onMouseMove={onMouseMove}
      onFocus={onFocus}
      onBlur={hide}
      onClick={onClick}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={cardRef}
            initial={{ height: 0, opacity: 1 }}
            animate={{ height, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 20 }}
            className="pointer-events-none absolute z-50 w-tooltip overflow-hidden rounded-md bg-surface shadow-lg ring-1 ring-gold-soft"
            style={{ top: position.y, left: position.x }}
          >
            <div ref={contentRef} className="p-4 text-sm text-text">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
