import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Color } from 'three';

const DROP_COUNT = 2000;

export default function RainTheme() {
    const meshRef = useRef<InstancedMesh>(null);

    // Create a single dummy object to help calculate transformation matrices
    const dummy = useMemo(() => new Object3D(), []);

    // Initialize drop positions and speeds
    const drops = useMemo(() => {
        return Array.from({ length: DROP_COUNT }, () => ({
            x: (Math.random() - 0.5) * 20,
            y: Math.random() * 20, // Start high
            z: (Math.random() - 0.5) * 10 - 2,
            speed: 0.1 + Math.random() * 0.2,
            scale: 0.5 + Math.random() * 1.5
        }));
    }, []);

    useFrame(() => {
        if (!meshRef.current) return;

        // Update each drop
        drops.forEach((drop, i) => {
            // Fall down
            drop.y -= drop.speed;

            // Reset if fell past the bottom
            if (drop.y < -10) {
                drop.y = 10;
                drop.x = (Math.random() - 0.5) * 20;
            }

            // Apply transform to dummy
            dummy.position.set(drop.x, drop.y, drop.z);
            // Make them look long and thin like falling rain
            dummy.scale.set(0.02, drop.scale * 0.3, 0.02);
            dummy.updateMatrix();

            // Update instanced mesh matrix
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });

        // Tell WebGL to update the buffers
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, DROP_COUNT]}>
            {/* Box geometry for the raindrops */}
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial
                color={new Color('#818cf8').multiplyScalar(0.7)} // Tinted indigo
                transparent
                opacity={0.4}
                depthWrite={false}
            />
        </instancedMesh>
    );
}
