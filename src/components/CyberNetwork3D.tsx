import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Box, Line, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';

function DataPacket({ start, end, delay }: { start: [number, number, number], end: [number, number, number], delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = ((clock.getElapsedTime() + delay) * 0.4) % 1; 
      meshRef.current.position.lerpVectors(startVec, endVec, t);
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.08, 16, 16]}>
      <meshBasicMaterial color="#00ffff" />
    </Sphere>
  );
}

function NetworkTopology() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.2) * 0.05;
    }
  });

  const centerNode: [number, number, number] = [0, 0, 0];
  const satelliteNodes: [number, number, number][] = [
    [-2.5, 1.5, -2],
    [3, 1, -1.5],
    [2, -1.5, 2.5],
    [-3, -1, 1.5],
    [0, 3, 1.5],
    [0, -3, -1.5]
  ];

  return (
    <group ref={groupRef}>
      <Box position={centerNode} args={[1, 1, 1]}>
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} wireframe />
      </Box>
      <Sphere position={centerNode} args={[0.3, 16, 16]}>
         <meshBasicMaterial color="#00ffff" />
      </Sphere>

      {satelliteNodes.map((pos, i) => (
        <group key={i}>
          <Box position={pos} args={[0.5, 0.5, 0.5]}>
            <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.6} opacity={0.6} transparent />
          </Box>
          <Sphere position={[pos[0], pos[1] + 0.3, pos[2]]} args={[0.05, 16, 16]}>
            <meshBasicMaterial color="#ffffff" />
          </Sphere>
          
          <Line points={[centerNode, pos]} color="#3b82f6" lineWidth={1.2} transparent opacity={0.25} />
          
          <DataPacket start={centerNode} end={pos} delay={i * 0.5} />
          <DataPacket start={pos} end={centerNode} delay={i * 0.5 + 0.5} />
        </group>
      ))}

      {satelliteNodes.map((pos, i) => {
        const nextPos = satelliteNodes[(i + 1) % satelliteNodes.length];
        return <Line key={`link-${i}`} points={[pos, nextPos]} color="#0ea5e9" lineWidth={0.4} transparent opacity={0.15} />;
      })}
    </group>
  );
}

export default function CyberNetwork3D({ 
  profileImage, 
  projectsCount = "5"
}: { 
  profileImage?: string;
  projectsCount?: string | number;
}) {
  const finalImage = profileImage && profileImage.trim() !== '' ? profileImage : 'https://i.ibb.co/ycLc9HHj/IMG-0620.jpg';

  return (
    <div className="w-full h-[450px] lg:h-[500px] cursor-grab active:cursor-grabbing relative">
      <Canvas 
        camera={{ position: [0, 1.5, 8], fov: 60 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />
        
        <Float speed={2.5} rotationIntensity={0.1} floatIntensity={1.5} floatingRange={[-0.15, 0.15]}>
          <Html position={[0, 1.5, 2]} center transform zIndexRange={[100, 0]} className="pointer-events-none">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-purple-500 shadow-[0_0_40px_rgba(59,130,246,0.6)]">
                <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/30"></div>
                <img 
                  src={finalImage} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover border-[3px] border-[#070b14]" 
                  style={{ imageRendering: 'high-quality' }}
                />
              </div>
            </div>
          </Html>
        </Float>

        <NetworkTopology />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}