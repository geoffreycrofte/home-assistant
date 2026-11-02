import { motion } from "motion/react";

const BUBBLES = 8;

/** Petite gerbe de bulles quand un appareil s'allume. */
export function Pop() {
  return (
    <span className="pop" aria-hidden="true">
      {Array.from({ length: BUBBLES }, (_, i) => {
        const angle = (i / BUBBLES) * Math.PI * 2 + 0.3;
        const distance = 34 + (i % 3) * 8;
        return (
          <motion.span
            key={i}
            className="pop__bubble"
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: [0.4, 1, 0],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        );
      })}
    </span>
  );
}
