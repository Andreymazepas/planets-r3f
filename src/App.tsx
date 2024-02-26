import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Effects, Environment, OrbitControls, PerspectiveCamera, Stars, useTexture, } from '@react-three/drei';
import React, { useEffect, useRef } from 'react';
import { AmbientLight, BackSide, Color, DirectionalLight, DoubleSide, Group, Mesh, SpotLight, SpotLightShadow, Vector3 } from 'three';
import { Bloom, BrightnessContrast, EffectComposer, Noise } from '@react-three/postprocessing';
import useSound from 'use-sound';



const PLANET_DATA = [
  {
    name: 'jupiter',
    position: [-15, -15, -28],
    size: 1,
    text: 'pink',
    color: 'hotpink',
    texture: '2k_jupiter.jpg'
  },
  {
    name: 'neptune',
    position: [15, 1, -28],
    size: 1.5,
    text: 'no',
    color: 'green',
    texture: '2k_neptune.jpg'
  },
  {
    name: 'mars',
    position: [15, -15, -28],
    text: 'blue',
    size: 0.8,
    color: 'blue',
    texture: '2k_mars.jpg'
  },
  {
    name: 'earth',
    position: [-15, 1, -28],
    size: 1,
    text: 'green',
    color: 'green',
    texture: '2k_earth_daymap.jpg'
  },
  {
    name: 'venus',
    position: [0, 0, -28],
    size: 1,
    text: 'yellow',
    color: 'yellow',
    texture: '2k_venus_surface.jpg'
  },
  {
    name: 'mercury',
    position: [0, -15, -28],
    size: 0.5,
    text: 'orange',
    color: 'orange',
    texture: '2k_mercury.jpg'
  },
  {
    name: 'uranus',
    position: [0, 15, -28],
    size: 1.5,
    text: 'blue',
    color: 'blue',
    texture: '2k_uranus.jpg'
  },
  {
    name: 'saturn',
    position: [-15, 15, -28],
    size: 1.5,
    text: 'yellow',
    color: 'yellow',
    texture: '2k_saturn.jpg'
  }

]




const Experience = () => {
  const [ready, setReady] = React.useState(false);
  const [selectedPlanet, setSelectedPlanet] = React.useState(-1);
  const [planetPos, setPlanetPos] = React.useState<Vector3>(new Vector3(0, 0, 0));
  const hoverSound = "../assets/405159__rayolf__btn_hover_2.wav";

  const [play, { stop }] = useSound(hoverSound, { volume: 0.5 });
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

  const directionalLightRef = useRef<DirectionalLight>(
    new DirectionalLight()
  );
  const ambientLightRef = useRef<AmbientLight>(
    new AmbientLight()
  );

  const environmentTexture = useTexture('../assets/2k_stars_milky_way.jpg');
  // make a structure to save all the planets textures, then load then accordinglt
  const textures = [];
  for (let i = 0; i < PLANET_DATA.length; i++) {
    textures.push(useTexture(`../assets/${PLANET_DATA[i].texture}`));
  }

  const handleClick = (index: number) => {
    if (selectedPlanet === index) {
      setSelectedPlanet(-1);
      setReady(false);
      setPlanetPos(new Vector3(0, 0, 0));
      return;
    }
    setSelectedPlanet(index);
    const correctedY = PLANET_DATA[index].position[1] + (1 - PLANET_DATA[index].size);
    setPlanetPos(new Vector3(-PLANET_DATA[index].position[0] - 2, -correctedY, -PLANET_DATA[index].position[2]));
  }

  useFrame(() => {
    if (groupRef.current === undefined) return;
    groupRef.current.position.lerp(planetPos, 0.01);
    if (groupRef.current.position.distanceTo(planetPos) < 5 && selectedPlanet !== -1) {
      setReady(true);
    }
    if (ready) {
      if (spotLightRef.current.intensity < 10) {
        spotLightRef.current.intensity += 0.1;
      }
      if (wallRef.current.material.opacity < 1) {
        wallRef.current.material.opacity += 0.01;
        floorRef.current.material.opacity += 0.01;
      }
      if (directionalLightRef.current.intensity > 0) {
        directionalLightRef.current.intensity -= 0.1;
      }
      if (ambientLightRef.current.intensity < 0.5) {
        ambientLightRef.current.intensity += 0.1;
      }
      if (!wallRef.current.material.depthTest) {
        wallRef.current.material.depthTest = true;
        floorRef.current.material.depthTest = true;
      }
    } else {
      if (spotLightRef.current.intensity > 0) {
        spotLightRef.current.intensity -= 0.1;
      }
      if (wallRef.current.material.opacity > 0) {
        wallRef.current.material.opacity -= 0.01;
        floorRef.current.material.opacity -= 0.01;
      }
      if (ambientLightRef.current.intensity > 0.1) {
        ambientLightRef.current.intensity -= 0.1;
      }

      if (directionalLightRef.current.intensity < 5) {
        directionalLightRef.current.intensity += 0.1;
      }
      if (wallRef.current.material.depthTest) {
        wallRef.current.material.depthTest = false;
        floorRef.current.material.depthTest = false;
      }
    }
  });

  return (
    <>
      <spotLight ref={spotLightRef} position={[3, 5, 5]} intensity={0} angle={0.8} decay={0} distance={15} castShadow penumbra={0.2} />
      <spotLightHelper args={[spotLightRef.current]} />
      <directionalLight ref={directionalLightRef} position={[5, 0, 2]} intensity={5} />
      <ambientLight ref={ambientLightRef} intensity={0.1} />
      <mesh position={[0, 0, -2]} ref={wallRef} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={'gray'} side={DoubleSide} transparent />
      </mesh>
      <mesh position={[0, -1, 0]} receiveShadow rotation={
        [Math.PI / 2, 0, 0]
      } ref={floorRef} >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={'gray'} side={DoubleSide} transparent />
      </mesh>
      <ContactShadows opacity={0.5} width={1} height={1} position={[0, -0.99, 0]} scale={10} blur={2} far={10} resolution={256} color="#000000" />
      <group ref={groupRef}>
        {PLANET_DATA.map((planet, index) => (
          <mesh key={index} position={planet.position} onClick={() => handleClick(index)} onPointerEnter={() => play()} castShadow >
            <sphereGeometry args={[planet.size, 32, 32]} />
            <meshStandardMaterial map={textures[index]} />
          </mesh>))}
      </group>

    </>
  )
}

function App() {

  return (
    <Canvas shadows="soft" dpr={[1, 2]}
    >
      <EffectComposer >
        <Noise opacity={0.02} />
        <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} height={300} />
        <BrightnessContrast brightness={0.1} contrast={0.1} />
      </EffectComposer>
      <OrbitControls />
      <color attach="background" args={
        ['black']
      } />
      <PerspectiveCamera makeDefault position={[0, 1, 7]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Experience />

    </Canvas>
  )
}

export default App
