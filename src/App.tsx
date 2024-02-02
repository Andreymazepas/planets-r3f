import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, useTexture } from '@react-three/drei';
import { useRef } from 'react';
import { DoubleSide, Mesh } from 'three';

const Plane = () => {
  const texture = useTexture('../assets/checker_tile.png');
  const planeRef = useRef<Mesh>(
    new Mesh()
  );

  useFrame(() => {
    if (planeRef.current === undefined) return;
    planeRef.current.rotation.x += 0.01;
    planeRef.current.rotation.y += 0.01;
  }
  )

  return (
    <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial map={texture} side={DoubleSide} />
    </mesh>
  )
}

function App() {

  return (
    <Canvas>
      <PerspectiveCamera
        makeDefault
        position={[0, 0, 10]}
        fov={75}
        near={0.1}
        far={1000}
      />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Plane />
    </Canvas>
  )


}

export default App
