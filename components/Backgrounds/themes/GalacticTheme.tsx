import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

export default function GalacticTheme() {
    const ref = useRef<any>(null);
    const { mouse } = useThree();

    // Generate 5000 stars in a sphere
    const sphere = useMemo(() => {
        const positions = new Float32Array(5000 * 3);
        random.inSphere(positions, { radius: 3 });
        return positions;
    }, []);

    useFrame((state, delta) => {
        if (!ref.current) return;

        // Slow constant rotation
        ref.current.rotation.x -= delta / 20;
        ref.current.rotation.y -= delta / 30;

        // Parallax effect based on mouse position
        // Lerp towards the target mouse rotation to make it smooth
        const targetX = (mouse.y * Math.PI) / 10;
        const targetY = (mouse.x * Math.PI) / 10;

        // Dampen the movement
        ref.current.rotation.x += (targetX - ref.current.rotation.x) * 0.05;
        ref.current.rotation.y += (targetY - ref.current.rotation.y) * 0.05;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#94a3b8"
                    size={0.015}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.6}
                />
            </Points>
        </group>
    );
}
