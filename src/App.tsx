import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Text, useTexture } from '@react-three/drei';
import React, { ReactElement, useRef } from 'react';
import { DoubleSide, Group, Mesh, PointLight, RepeatWrapping, Vector3 } from 'three';

const Plane = ({ ready, text }: { ready: boolean, text: string }) => {
  const texture = useTexture('../assets/checker_tile.png');
  texture.repeat.set(1, 1);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  const planeRef = useRef<Mesh>(
    new Mesh()
  );
  const planeRef2 = useRef<Mesh>(
    new Mesh()
  );
  const lightRef = useRef<PointLight>(
    new PointLight()
  );

  useFrame(() => {
    if (planeRef.current === undefined) return;
    if (ready) {
      // make planes visible with a fade in effect
      if (planeRef.current.material.opacity < 1) {
        planeRef.current.material.opacity += 0.01;
      }
      if (planeRef2.current.material.opacity < 1) {
        planeRef2.current.material.opacity += 0.01;
      }
      // make light visible with a fade in effect
      if (lightRef.current.intensity < 70) {
        lightRef.current.intensity += 0.1;
      }
    } else {
      if (planeRef.current.material.opacity > 0) {
        planeRef.current.material.opacity -= 0.01;
      }
      if (planeRef2.current.material.opacity > 0) {
        planeRef2.current.material.opacity -= 0.01;
      }
      if (lightRef.current.intensity > 0) {
        lightRef.current.intensity -= 0.1;
      }
    }
  });

  return (
    <>
      <mesh ref={planeRef} position={[0, 0, -5]} receiveShadow castShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial map={texture} side={DoubleSide} transparent opacity={0} />
      </mesh>
      <mesh ref={planeRef2} position={[0, -5, 0]} rotation={
        [-Math.PI / 2, 0, 0]
      } receiveShadow castShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial map={texture} side={DoubleSide} transparent opacity={0} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 0]} intensity={0} />
      <Text
        position={[2, -1, 0]}
        color="black"
        fontSize={1}
        maxWidth={30}
        lineHeight={1}
        letterSpacing={0.02}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {ready ? text : ''}
      </Text>
    </>
  )
}

const CamGroup = ({ children, position, setReady }: { children: ReactElement, position: [x: number, y: number, z: number], setReady: (arg0: boolean) => void }) => {
  const groupRef = useRef<Group>(
    new Group()
  );

  useFrame(() => {
    if (groupRef.current === undefined) return;
    //groupRef.current.rotation.y += 0.01;
    // interpolate between the current position and the target position

    const isResetting = position[0] === 0 && position[1] === 0 && position[2] === 0;
    if (isResetting) {
      // if the group is resetting, set ready to false
      setReady(false);
    }
    groupRef.current.position.lerp(new Vector3(position[0], position[1], position[2]), isResetting ? 0.01 : 0.01);

    // if the group is close enough to the target position, set ready to true
    if (groupRef.current.position.distanceTo(new Vector3(position[0], position[1], position[2])) < 5 && !isResetting) {
      console.log('ready')
      setReady(true);
    }
  }
  )

  return (
    <group ref={groupRef}>
      {children}
    </group>
  )
}

function App() {

  const [ready, setReady] = React.useState(false);
  const [text, setText] = React.useState('' as string);
  const [selectedPos, setSelectedPos] = React.useState<[a: number, b: number, c: number]>([0, 0, 0]);

  return (
    <Canvas
    >
      <color attach="background" args={
        ['black']
      } />
      <CamGroup position={selectedPos} setReady={setReady}
      >
        <>
          <PerspectiveCamera
            makeDefault
            position={[0, 0, 10]}
            fov={75}
            near={0.1}
            far={1000}
          />
          <Plane ready={ready} text={text} />
        </>
      </CamGroup>

      <ambientLight intensity={1} />
      <mesh castShadow receiveShadow position={[-30, -30, -30]} onClick={
        () => { setSelectedPos(selectedPos[2] === 0 ? [-28, -28, -28] : [0, 0, 0]); setText("pink") }
      }>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>

      <mesh castShadow receiveShadow position={[13, 0, -30]} onClick={
        () => { setSelectedPos(selectedPos[2] === 0 ? [15, 2, -28] : [0, 0, 0]); setText("u r gay") }
      }>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="green" />
      </mesh>

      <mesh castShadow receiveShadow position={[-13, 0, -30]} onClick={
        () => { setSelectedPos(selectedPos[2] === 0 ? [-11, 2, -28] : [0, 0, 0]); setText("hi") }
      }>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </Canvas>
  )


}

export default App
