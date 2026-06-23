"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function NetworkVisualization() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto min-h-[280px]">
      {/* Outer rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-border/30"
          style={{
            scale: 0.5 + i * 0.25,
          }}
          animate={{
            rotate: i % 2 === 0 ? 360 : -360,
          }}
          transition={{
            duration: 40 + i * 10,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {[...Array(4 + i * 2)].map((_, j) => {
            const angle = (j * 360) / (4 + i * 2)

            return (
              <motion.div
                key={j}
                className="absolute w-2 h-2 rounded-full bg-primary/60"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `rotate(${angle}deg) translateX(${(0.5 + i * 0.25) * 140}px) translate(-50%, -50%)`,
                }}
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              />
            )
          })}
        </motion.div>
      ))}

      {/* Center Core */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full glass-elevated flex items-center justify-center"
          animate={{
            boxShadow: [
              "0 0 30px -10px var(--primary)",
              "0 0 50px -10px var(--primary)",
              "0 0 30px -10px var(--primary)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">AI</div>
            <div className="text-xs text-muted-foreground">
              Trust Engine
            </div>
          </div>
        </motion.div>
      </div>

      {/* SVG Lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ transform: "rotate(-90deg)" }}
      >
        <defs>
          <linearGradient
            id="lineGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[...Array(6)].map((_, i) => {
          const angle = (i * 60 * Math.PI) / 180

          const x1 = (50 + 15 * Math.cos(angle)).toFixed(2)
          const y1 = (50 + 15 * Math.sin(angle)).toFixed(2)
          const x2 = (50 + 45 * Math.cos(angle)).toFixed(2)
          const y2 = (50 + 45 * Math.sin(angle)).toFixed(2)

          return (
            <motion.line
              key={i}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          )
        })}
      </svg>
    </div>
  )
}