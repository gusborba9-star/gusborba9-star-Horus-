'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function ParticleBackground() {
  const [nodes, setNodes] = useState<{ id: number; x: number; y: number; size: number; delay: number; duration: number }[]>([]);
  const [connections, setConnections] = useState<{ id: string; from: number; to: number; opacity: number }[]>([]);

  useEffect(() => {
    // Generate organic neural nodes
    const nodeCount = 35;
    const newNodes = Array.from({ length: nodeCount }).map((_, i) => ({
      id: i,
      x: 10 + Math.random() * 80, // Keep mostly in center 80%
      y: 10 + Math.random() * 80,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 20,
    }));
    
    // Generate discreet luminous connections
    const newConnections: any[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = newNodes[i].x - newNodes[j].x;
        const dy = newNodes[i].y - newNodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 15) { // Only connect close nodes
          newConnections.push({
            id: `${i}-${j}`,
            from: i,
            to: j,
            opacity: 1 - (dist / 15), // Fade out at max distance
          });
        }
      }
    }

    setNodes(newNodes);
    setConnections(newConnections);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#080808]">
      {/* Deep premium gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-[#1C1C1C]/30 via-[#080808] to-[#080808]"></div>
      
      {/* Liquid glass / Liquid metal ambient glow */}
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

      {/* SVG Canvas for Connections */}
      <svg className="absolute inset-0 w-full h-full" style={{ filter: 'blur(0.5px)' }}>
        {connections.map((conn) => {
          const fromNode = nodes[conn.from];
          const toNode = nodes[conn.to];
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
                duration: 8 + Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 10
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

      {/* Neural Nodes / Intelligent Particles */}
      {nodes.map((node) => (
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
