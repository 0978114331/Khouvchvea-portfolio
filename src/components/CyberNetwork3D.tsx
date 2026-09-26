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
      <Box position={centerNode} args={[1.2, 1.2, 1.2]}>
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} wireframe />
      </Box>
      <Sphere position={centerNode} args={[0.4, 16, 16]}>
         <meshBasicMaterial color="#00ffff" />
      </Sphere>

      {satelliteNodes.map((pos, i) => (
        <group key={i}>
          <Box position={pos} args={[0.6, 0.6, 0.6]}>
            <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} opacity={0.7} transparent />
          </Box>
          <Sphere position={[pos[0], pos[1] + 0.4, pos[2]]} args={[0.06, 16, 16]}>
            <meshBasicMaterial color="#ffffff" />
          </Sphere>
          
          <Line points={[centerNode, pos]} color="#3b82f6" lineWidth={1.5} transparent opacity={0.3} />
          
          <DataPacket start={centerNode} end={pos} delay={i * 0.5} />
          <DataPacket start={pos} end={centerNode} delay={i * 0.5 + 0.5} />
        </group>
      ))}

      {satelliteNodes.map((pos, i) => {
        const nextPos = satelliteNodes[(i + 1) % satelliteNodes.length];
        return <Line key={`link-${i}`} points={[pos, nextPos]} color="#0ea5e9" lineWidth={0.5} transparent opacity={0.15} />;
      })}
    </group>
  );
}

export default function CyberNetwork3D({ profileImage }: { profileImage?: string }) {
  const finalImage = profileImage && profileImage.trim() !== '' ? profileImage : 'https://i.ibb.co/ycLc9HHj/IMG-0620.jpg';

  return (
    <div className="w-full h-[450px] lg:h-[500px] cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 2, 9], fov: 60 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />
        
        <Float speed={2} rotationIntensity={0.4} floatIntensity={1} floatingRange={[-0.2, 0.2]}>
          <Html position={[0, 3.8, 0]} center transform zIndexRange={[100, 0]} className="pointer-events-none">
            <div className="bg-[#0b0f19]/80 border border-blue-500/50 backdrop-blur-md p-5 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.4)] w-[320px] flex flex-col gap-4">
              <div className="flex items-center gap-4 border-b border-blue-500/30 pb-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/40"></div>
                  <img src={finalImage} alt="Profile" className="w-14 h-14 rounded-full border-2 border-blue-400 object-cover relative z-10" />
                </div>
                <div>
                  <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest block mb-0.5">Developer System</span>
                  <div className="text-green-400 text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> ONLINE ACTIVE
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">Role</div>
                  <div className="text-sm font-bold text-white mt-0.5">IT Student</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">Focus</div>
                  <div className="text-sm font-bold text-blue-400 mt-0.5">Web Dev</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">Projects</div>
                  <div className="text-lg font-bold text-white mt-0.5">12<span className="text-xs text-blue-500">+</span></div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">Experience</div>
                  <div className="text-lg font-bold text-white mt-0.5">2<span className="text-xs text-blue-500">+ Yrs</span></div>
                </div>
              </div>
            </div>
          </Html>
        </Float>

        <NetworkTopology />
        
        <OrbitControls enableZoom={false} autoRotate={false} />
      </Canvas>
    </div>
  );
}