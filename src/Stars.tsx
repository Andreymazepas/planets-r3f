import React, { useMemo } from 'react';
import { Vector3, BufferGeometry, PointsMaterial, Points } from 'three';
import { useLoader } from '@react-three/fiber';

const Stars = ({ count = 5000 }) => {
    const positions = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 100; // Random value between -50 and 50
        }
        return positions;
    }, [count]);

    return (
        <points>
            <bufferGeometry attach="geometry">
                <bufferAttribute
                    attachObject={['attributes', 'position']}
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial attach="material" size={0.1} sizeAttenuation color="white" />
        </points>
    );
};

export default Stars;