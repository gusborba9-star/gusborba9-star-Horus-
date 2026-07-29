'use client';

import { motion } from 'motion/react';
import { useEffect, useState, useRef } from 'react';

export function NeuralFigure() {
  const [nodes, setNodes] = useState<{ id: number; x: number; y: number; z: number; size: number; delay: number; duration: number }[]>([]);
  const [connections, setConnections] = useState<{ id: string; from: number; to: number; opacity: number }[]>([]);

  useEffect(() => {
    // Generate organic neural nodes in 3D-like space
    const nodeCount = 50;
    const newNodes = Array.from({ length: nodeCount }).map((_, i) => {
      // Create a spherical distribution for a 3D feel
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 35 + Math.random() * 15; // radius spread

      return {
        id: i,
        x: 50 + r * Math.sin(phi) * Math.cos(theta),
        y: 50 + r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi), // Used for scale/blur to fake depth
        size: Math.random() * 2 + 1,
        delay: Math.random() * 15,
        duration: 20 + Math.random() * 30, // Very slow movement
      };
    });
    
    // Generate discreet luminous connections
    const newConnections: any[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = newNodes[i].x - newNodes[j].x;
        const dy = newNodes[i].y - newNodes[j].y;
        const dz = newNodes[i].z - newNodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist < 20) { // Connect nodes that are close in 3D space
          newConnections.push({
            id: `${i}-${j}`,
            from: i,
            to: j,
            opacity: 1 - (dist / 20), // Fade out at max distance
          });
        }
      }
    }

    setNodes(newNodes);
    setConnections(newConnections);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      
      {/* Liquid metal ambient glow */}
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
              stroke="url(#premium-gold-grad-home)"
              strokeWidth="0.2"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, conn.opacity * 0.4, 0] }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 20
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

      {/* Neural Nodes / Intelligent Particles */}
      {nodes.map((node) => {
         // Simulate depth: smaller and blurrier if further away (z < 0)
         const depthScale = (node.z + 50) / 100; // 0 to 1
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
         )
      })}
    </div>
  );
}
