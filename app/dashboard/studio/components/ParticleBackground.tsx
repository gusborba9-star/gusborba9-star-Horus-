'use client';

import { motion } from 'motion/react';

type ParticleNode = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
};

type ParticleConnection = {
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

function createParticleNodes(nodeCount: number): ParticleNode[] {
  return Array.from({ length: nodeCount }, (_, i) => ({
    id: i,
    x: 10 + seeded(i * 5 + 1) * 80,
    y: 10 + seeded(i * 5 + 2) * 80,
    size: seeded(i * 5 + 3) * 2 + 0.5,
    delay: seeded(i * 5 + 4) * 10,
    duration: 15 + seeded(i * 5 + 5) * 20,
  }));
}

function createConnections(nodes: ParticleNode[]): ParticleConnection[] {
  const connections: ParticleConnection[] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 15) {
        const seed = i * nodes.length + j;
        connections.push({
          id: `${i}-${j}`,
          from: i,
          to: j,
          opacity: 1 - dist / 15,
          duration: 8 + seeded(seed * 2 + 1) * 5,
          delay: seeded(seed * 2 + 2) * 10,
        });
      }
    }
  }
  return connections;
}

const PARTICLE_NODES = createParticleNodes(35);
const PARTICLE_CONNECTIONS = createConnections(PARTICLE_NODES);

export function ParticleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#080808]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-[#1C1C1C]/30 via-[#080808] to-[#080808]"></div>

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[#FAFAFA]/5 to-transparent blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-bl from-[#D4AF37]/5 to-transparent blur-[140px]"
      />

      <svg className="absolute inset-0 w-full h-full" style={{ filter: 'blur(0.5px)' }}>
        {PARTICLE_CONNECTIONS.map((conn) => {
          const fromNode = PARTICLE_NODES[conn.from];
          const toNode = PARTICLE_NODES[conn.to];
          if (!fromNode || !toNode) return null;

          return (
            <motion.line
              key={conn.id}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke="url(#premium-gold-grad)"
              strokeWidth="0.2"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, conn.opacity * 0.3, 0] }}
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
          <linearGradient id="premium-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FAFAFA" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>

      {PARTICLE_NODES.map((node) => (
        <motion.div
          key={node.id}
          className="absolute rounded-full"
          style={{
            width: node.size,
            height: node.size,
            left: `${node.x}%`,
            top: `${node.y}%`,
            background: 'radial-gradient(circle, rgba(250,250,250,0.8) 0%, rgba(250,250,250,0) 100%)',
            boxShadow: '0 0 10px rgba(250,250,250,0.2)',
          }}
          animate={{
            y: ['0%', '-2%', '0%'],
            x: ['0%', '1%', '0%'],
            opacity: [0.1, 0.8, 0.1],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: node.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: node.delay,
          }}
        />
      ))}
    </div>
  );
}
