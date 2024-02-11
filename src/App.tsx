import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, OrbitControls, PerspectiveCamera, } from '@react-three/drei';
import React, { useRef } from 'react';
import { DoubleSide, Group, Mesh, SpotLight, Vector3 } from 'three';


const PLANET_DATA = [
  {
    name: 'hotpink',
    position: [-15, -15, -28],
    size: 1,
    text: 'pink',
    color: 'hotpink'
  },
  {
    name: 'green',
    position: [15, 1, -28],
    size: 1.5,
    text: 'no',
    color: 'green'

  },
  {
    name: 'blue',
    position: [15, -15, -28],
    text: 'blue',
    size: 0.8,
    color: 'blue'
  }
]



const Experience = () => {
  const [ready, setReady] = React.useState(false);
  const [selectedPlanet, setSelectedPlanet] = React.useState(-1);
  const [planetPos, setPlanetPos] = React.useState<Vector3>(new Vector3(0, 0, 0));
  const groupRef = useRef<Group>(
    new Group()
  );
  const spotLightRef = useRef<SpotLight>(
    new SpotLight()
  );
  const wallRef = useRef<Mesh>(
    new Mesh()
  );
  const floorRef = useRef<Mesh>(
    new Mesh()
  );

  const handleClick = (index: number) => {
    if (selectedPlanet === index) {
      setSelectedPlanet(-1);
      setReady(false);
      setPlanetPos(new Vector3(0, 0, 0));
      return;
    }
    setSelectedPlanet(index);
    const correctedY = PLANET_DATA[index].position[1] + (1 - PLANET_DATA[index].size);
    setPlanetPos(new Vector3(-PLANET_DATA[index].position[0], -correctedY, -PLANET_DATA[index].position[2]));
  }

  useFrame(() => {
    if (groupRef.current === undefined) return;
    groupRef.current.position.lerp(planetPos, 0.01);
    if (groupRef.current.position.distanceTo(planetPos) < 5 && selectedPlanet !== -1) {
      setReady(true);
    }
    if (ready) {
      if (spotLightRef.current.intensity < 100) {
        spotLightRef.current.intensity += 0.1;
      }
      if (wallRef.current.material.opacity < 1) {
        wallRef.current.material.opacity += 0.01;
        floorRef.current.material.opacity += 0.01;
      }
    } else {
      if (spotLightRef.current.intensity > 0) {
        spotLightRef.current.intensity -= 0.1;
      }
      if (wallRef.current.material.opacity > 0) {
        wallRef.current.material.opacity -= 0.01;
        floorRef.current.material.opacity -= 0.01;
      }
    }




  });

  return (
    <>
      <spotLight ref={spotLightRef} position={[3, 5, 5]} intensity={0} angle={0.8} castShadow />
      <spotLightHelper args={[spotLightRef.current]} />
      <mesh position={[0, 0, -2]} ref={wallRef} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color={'gray'} side={DoubleSide} transparent />
      </mesh>
      <mesh position={[0, -1, 0]} receiveShadow rotation={
        [Math.PI / 2, 0, 0]
      } ref={floorRef} >
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color={'gray'} side={DoubleSide} transparent />
      </mesh>
      <ContactShadows opacity={1} width={1} height={1} position={[0, -0.99, 0]} scale={10} blur={2} far={10} resolution={256} color="#000000" />
      <group ref={groupRef}>
        {PLANET_DATA.map((planet, index) => (
          <mesh key={index} position={planet.position} onClick={() => handleClick(index)} castShadow >
            <sphereGeometry args={[planet.size, 32, 32]} />
            <meshStandardMaterial color={planet.color} />
          </mesh>))}
      </group>
    </>
  )
}

function App() {


  return (
    <Canvas shadows dpr={[1, 2]}
    >
      <OrbitControls />
      <color attach="background" args={
        ['black']
      } />
      <ambientLight intensity={0.5} />
      <PerspectiveCamera makeDefault position={[3, 4, 7]} />
      <Experience />

    </Canvas>
  )
}

export default App
