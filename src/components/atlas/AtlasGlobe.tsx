"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { CONTINENTS, type Continent } from "@/lib/constants";

const ORDER: readonly Continent[] = CONTINENTS.map((continent) => continent.value);
const GLOBE_SIZE = { width: 1100, height: 594 };
const src = (region: Continent) => `/atlas/globes/${region}.webp`;

// Distancia que recorre la textura al girar, en porcentaje del ancho del globo.
const TRAVEL = 70;
const variants = {
  enter: (direction: number) => ({ x: `${direction * TRAVEL}%`, scaleX: 0.8, opacity: 0 }),
  center: { x: "0%", scaleX: 1, opacity: 1 },
  exit: (direction: number) => ({ x: `${-direction * TRAVEL}%`, scaleX: 0.8, opacity: 0 }),
};

// Media esfera al pie de la lista móvil. Al cambiar de región, la textura saliente se desliza hacia
// un lado y la entrante llega del otro dentro del círculo, de modo que parece que el mundo gira.
export function AtlasGlobe({ region }: { region: Continent }) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState({ region, direction: 1 });

  // Ajuste de estado durante el render: la dirección depende de la región anterior y la nueva.
  if (shown.region !== region) {
    const step = ORDER.indexOf(region) - ORDER.indexOf(shown.region);
    setShown({ region, direction: step < 0 ? -1 : 1 });
  }

  // Se precargan las otras regiones para que el giro no espere a la imagen.
  useEffect(() => {
    for (const other of ORDER) new window.Image().src = src(other);
  }, []);

  return (
    <div aria-hidden="true" className="atlas-globe-dock">
      <div className="atlas-globe-halo" />
      <div className="atlas-globe-stage">
        <AnimatePresence initial={false} custom={shown.direction}>
          <motion.div
            key={shown.region}
            custom={shown.direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={reduceMotion ? { duration: 0 } : { duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={src(shown.region)}
              alt=""
              width={GLOBE_SIZE.width}
              height={GLOBE_SIZE.height}
              unoptimized
              priority
              className="size-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
