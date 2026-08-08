'use client';

import { motion } from 'motion/react';

type NeuralNode = {
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  delay: number;
  duration: number;
};

type NeuralConnection = {
  id: string;
  from: number;
  to: number;
  opacity: number;
  duration: number;
  delay: number;
};

function seeded(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function createNeuralNodes(nodeCount: number): NeuralNode[] {
  return Array.from({ length: nodeCount }, (_, i) => {
    const theta = seeded(i * 6 + 1) * 2 * Math.PI;
    const phi = Math.acos(2 * seeded(i * 6 + 2) - 1);
    const r = 35 + seeded(i * 6 + 3) * 15;

    return {
      id: i,
      x: 50 + r * Math.sin(phi) * Math.cos(theta),
      y: 50 + r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi),
      size: seeded(i * 6 + 4) * 2 + 1,
      delay: seeded(i * 6 + 5) * 15,
      duration: 20 + seeded(i * 6 + 6) * 30,
    };
  });
}

function createConnections(nodes: NeuralNode[]): NeuralConnection[] {
  const connections: NeuralConnection[] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dz = nodes[i].z - nodes[j].z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < 20) {
        const seed = i * nodes.length + j;
        connections.push({
          id: `${i}-${j}`,
          from: i,
          to: j,
          opacity: 1 - dist / 20,
          duration: 15 + seeded(seed * 2 + 1) * 10,
          delay: seeded(seed * 2 + 2) * 20,
        });
      }
    }
  }
  return connections;
}

const NEURAL_NODES = createNeuralNodes(50);
const NEURAL_CONNECTIONS = createConnections(NEURAL_NODES);

export function NeuralFigure() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.03, 0.06, 0.03]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[20%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[#FAFAFA]/10 to-transparent blur-[150px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.02, 0.05, 0.02]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 10 }}
        className="absolute bottom-[10%] right-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-bl from-[#D4AF37]/5 to-transparent blur-[150px]"
      />

      <svg className="absolute inset-0 w-full h-full" style={{ filter: 'blur(0.5px)' }}>
        {NEURAL_CONNECTIONS.map((conn) => {
          const fromNode = NEURAL_NODES[conn.from];
          const toNode = NEURAL_NODES[conn.to];
          if (!fromNode || !toNode) return null;

          return (
            <motion.line
              key={conn.id}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke="url(#premium-gold-grad-home)"
              strokeWidth="0.2"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, conn.opacity * 0.4, 0] }}
              transition={{
                duration: conn.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: conn.delay
              }}
            />
          );
        })}
        <defs>
          <linearGradient id="premium-gold-grad-home" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FAFAFA" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>

      {NEURAL_NODES.map((node) => {
        const depthScale = (node.z + 50) / 100;
        const baseScale = 0.5 + depthScale * 1.5;
        const blur = Math.max(0, 2 - depthScale * 2);

        return (
          <motion.div
            key={node.id}
            className="absolute rounded-full"
            style={{
              width: node.size,
              height: node.size,
              left: `${node.x}%`,
              top: `${node.y}%`,
              background: 'radial-gradient(circle, rgba(250,250,250,0.9) 0%, rgba(250,250,250,0) 100%)',
              boxShadow: '0 0 15px rgba(250,250,250,0.3)',
              filter: `blur(${blur}px)`,
              transform: `scale(${baseScale})`
            }}
            animate={{
              y: ['0%', '-3%', '0%'],
              x: ['0%', '2%', '0%'],
              opacity: [0.1, 0.9 * depthScale, 0.1],
            }}
            transition={{
              duration: node.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: node.delay,
            }}
          />
        );
      })}
    </div>
  );
}
