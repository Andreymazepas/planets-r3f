import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, OrbitControls, Outlines, PerspectiveCamera, Stars, useGLTF, useTexture, } from '@react-three/drei';
import React, { useEffect, useRef } from 'react';
import { AmbientLight, DirectionalLight, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, SpotLight, Texture, Vector3 } from 'three';
import { BrightnessContrast, EffectComposer, FXAA } from '@react-three/postprocessing';
import useSound from 'use-sound';



const PLANET_DATA = [
  {
    name: 'Jupiter',
    subtitle: 'The bringer of jollity',
    position: [-8, 5, -10],
    size: 2,
    text: 'pink',
    color: 'hotpink',
    texture: '2k_jupiter.jpg',
    audioPath: '/assets/HOLST The Planets 4. Jupiter the Bringer of Jollity - The Presidents Own U.S. Marine Band.mp3',
    description: "The largest planet in our solar system, Jupiter is the gas giant named after the king of the Roman gods. It's astrological symbol is a stylized representation of the god's lightning bolt. The music is grand and majestic, reflecting the planet's size and power.",
    tilt: 0.1
  },
  {
    name: 'Neptune',
    subtitle: 'The mystic',
    position: [2, 6, -15],
    size: 1.5,
    text: 'no',
    color: 'green',
    texture: '2k_neptune.jpg',
    audioPath: '/assets/HOLST The Planets 7. Neptune the Mystic - The Presidents Own U.S. Marine Band.mp3',
    description: "Neptune is named after the Roman god of the sea. The music is mysterious and ethereal like the sea, and the planet's deep blue color.",
    tilt: 0
  },
  {
    name: 'Mars',
    subtitle: 'The bringer of war',
    position: [1, -2, -16],
    text: 'blue',
    size: 0.8,
    color: 'blue',
    texture: '2k_mars.jpg',
    audioPath: '/assets/HOLST The Planets 1. Mars the Bringer of War - The Presidents Own U.S. Marine Band.mp3',
    description: "Mars is named after the Roman god of war. The music is martial and aggressive, reflecting the planet's red color and the god's association with war.",
    tilt: 0
  },
  {
    name: 'Earth',
    subtitle: 'The ancestral mother',
    position: [-5, 1, -10],
    size: 0.7,
    text: 'green',
    color: 'green',
    texture: '2k_earth_daymap.jpg',
    audioPath: undefined,
    description: "Our planet doesn't hold any place in Holst's suite. Although it's representation in mythology is as Gaia, the ancestral mother of all life, in astrology it is the point of reference for all other planets.",
    tilt: 0
  },
  {
    name: 'Venus',
    subtitle: 'The bringer of peace',
    position: [-5, -6, -6],
    size: 0.75,
    text: 'yellow',
    color: 'yellow',
    texture: '2k_venus_surface.jpg',
    audioPath: '/assets/HOLST The Planets 2. Venus the Bringer of Peace - The Presidents Own U.S. Marine Band.mp3',
    description: "Venus is named after the Roman goddess of love and beauty. The music is serene and peaceful, reflecting the planet's bright appearance.",
    tilt: 0
  },
  {
    name: 'Mercury',
    subtitle: 'The winged messenger',
    position: [-1, -5, -10],
    size: 0.5,
    text: 'orange',
    color: 'orange',
    texture: '2k_mercury.jpg',
    audioPath: '/assets/HOLST The Planets 3. Mercury the Winged Messenger - The Presidents Own U.S. Marine Band.mp3',
    description: "In Roman mythology, Mercury is the swift messenger god, associated with communication and speed. The planet Mercury, the closest to the sun, reflects this swiftness with its rapid orbit.",
    tilt: 0
  },
  {
    name: 'Uranus',
    subtitle: 'The magician',
    position: [8, 2.6, -10],
    size: 1.5,
    text: 'blue',
    color: 'blue',
    texture: '2k_uranus.jpg',
    audioPath: '/assets/HOLST The Planets 6. Uranus the Magician - The Presidents Own U.S. Marine Band.mp3',
    description: "Uranus, named after the Greek sky god, is associated with the vastness of the cosmos. Its axial tilt is unique among the planets, making it roll on its side as it orbits, symbolizing the unpredictability of the sky.",
    tilt: 0
  },
  {
    name: 'Saturn',
    subtitle: 'The bringer of old age',
    position: [-12, -8, -20],
    size: 1.5,
    text: 'yellow',
    color: 'yellow',
    texture: '2k_saturn.jpg',
    audioPath: '/assets/HOLST The Planets 5. Saturn the Bringer of Old Age - The Presidents Own U.S. Marine Band.mp3',
    description: "Saturn is named after the Roman god of agriculture. The music is slow and melancholic, rising to a climax before fading away, reflecting the planet's golden color and the god's association with time and old age.",
    tilt: -0.2
  }
]

const SATURN_RING = {
  position: PLANET_DATA[7].position,
}

const renderSaturnRing = () => {
  // load glb from assets folder
  const gltf = useGLTF('/assets/saturn_ring.glb');
  // override the material
  gltf.scene.traverse((child) => {
    if (child instanceof Mesh) {
      child.material = new MeshBasicMaterial({
        map: useTexture('/assets/2k_saturn_ring_alpha.png'),

        side: DoubleSide,
        transparent: true,

      });
    }
  });

  return <primitive rotation={[0.2, 0, -0.2]} object={gltf.scene} position={SATURN_RING.position} scale={[2.5, 2.5, 2.5]} />
}

const renderSun = () => {
  const sunTexture = useTexture('/assets/2k_sun.jpg');
  return (
    <mesh position={[10, -10, 3]}>
      <sphereGeometry args={[10, 64, 64]} />
      <meshBasicMaterial map={sunTexture}
      />
    </mesh>
  )
}


const Experience = ({ setSelectedPlanetIndex, reset }: { setSelectedPlanetIndex: (index: number) => void, reset: boolean }) => {
  const [ready, setReady] = React.useState(false);
  const [selectedPlanet, setSelectedPlanet] = React.useState(-1);
  const [planetPos, setPlanetPos] = React.useState<Vector3>(new Vector3(0, 0, 0));
  const [hoverPlanet, setHoverPlanet] = React.useState(-1);
  const hoverSound = "/assets/405159__rayolf__btn_hover_2.wav";


  const [playHover] = useSound(hoverSound, { volume: 0.5 });


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


  const textures: (Texture | null | undefined)[] = [];
  for (let i = 0; i < PLANET_DATA.length; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    textures.push(useTexture(`/assets/${PLANET_DATA[i].texture}`));
  }

  const handleClick = (index: number) => {
    setSelectedPlanet(index);
    setHoverPlanet(-1);
    const correctedY = PLANET_DATA[index].position[1] + (1 - PLANET_DATA[index].size);
    setPlanetPos(new Vector3(-PLANET_DATA[index].position[0] - 2, -correctedY, -PLANET_DATA[index].position[2] + (PLANET_DATA[index].name === 'Saturn' ? 1.5 : 0)));
  }

  // if reset is true, reset the state
  useEffect(() => {
    if (reset) {
      setSelectedPlanet(-1);
      setSelectedPlanetIndex(-1);
      setReady(false);
      setPlanetPos(new Vector3(0, 0, 0));
    }
  }, [reset, setSelectedPlanetIndex]);

  useFrame(() => {
    if (groupRef.current === undefined) return;
    groupRef.current.position.lerp(planetPos, 0.01);
    if (!ready && selectedPlanet !== -1 && groupRef.current.position.distanceTo(planetPos) < 5) {
      setReady(true);
      setSelectedPlanetIndex(selectedPlanet);
    }
    if (ready) {
      if (spotLightRef.current.intensity < 10) {
        spotLightRef.current.intensity += 0.1;
      }
      if ((wallRef.current.material as MeshStandardMaterial).opacity < 1) {
        (wallRef.current.material as MeshStandardMaterial).opacity += 0.01;
        (floorRef.current.material as MeshStandardMaterial).opacity += 0.01;
      }
      if (directionalLightRef.current.intensity > 0) {
        directionalLightRef.current.intensity -= 0.1;
      }
      if (ambientLightRef.current.intensity < 0.5) {
        ambientLightRef.current.intensity += 0.1;
      }
      if (!(wallRef.current.material as MeshStandardMaterial).depthTest) {
        (wallRef.current.material as MeshStandardMaterial).depthTest = true;
        (floorRef.current.material as MeshStandardMaterial).depthTest = true;
      }
    } else {
      if (spotLightRef.current.intensity > 0) {
        spotLightRef.current.intensity -= 0.1;
      }
      if ((wallRef.current.material as MeshStandardMaterial).opacity > 0) {
        (wallRef.current.material as MeshStandardMaterial).opacity -= 0.01;
        (floorRef.current.material as MeshStandardMaterial).opacity -= 0.01;
      }
      if (ambientLightRef.current.intensity > 0.1) {
        ambientLightRef.current.intensity -= 0.1;
      }

      if ((wallRef.current.material as MeshStandardMaterial).depthTest) {
        (wallRef.current.material as MeshStandardMaterial).depthTest = false;
        (floorRef.current.material as MeshStandardMaterial).depthTest = false;
      }
    }
  });

  const onHover = (index: number) => {
    if (hoverPlanet !== index && !ready) {
      document.body.style.cursor = 'pointer';
      playHover();
      setHoverPlanet(index);
    }
  }

  const onUnhover = () => {
    document.body.style.cursor = 'auto';
    setHoverPlanet(-1);
  }

  return (
    <>
      <spotLight ref={spotLightRef} position={[3, 5, 5]} intensity={0} angle={0.8} decay={0} distance={15} castShadow penumbra={0.2} />
      <directionalLight ref={directionalLightRef} position={[5, -3, 5]} intensity={5} />
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
      <ContactShadows opacity={0.5} width={2} height={1} position={[0, -0.99, 0]} scale={10} blur={1} far={10} resolution={256} color="#000000" visible={selectedPlanet !== -1} />
      <group ref={groupRef} position={[0, 0, 30]}>
        {PLANET_DATA.map((planet, index) => (
          <mesh key={index} position={new Vector3(...planet.position)} onClick={() => handleClick(index)} castShadow onPointerEnter={() => onHover(index)} onPointerLeave={onUnhover} rotation={[
            0, 0, planet.tilt
          ]}>
            <sphereGeometry args={[planet.size, 32, 32]} />
            <meshStandardMaterial map={textures[index]} />
            <Outlines visible={hoverPlanet === index} color={"white"} />
          </mesh>))}
        {renderSaturnRing()}
        {renderSun()}
      </group>

    </>
  )
}

function App() {
  const [ready, setReady] = React.useState(false);
  const [selectedPlanet, setSelectedPlanet] = React.useState(-1);
  const startSound = "/assets/symphony-orchestra-tuning-before-concert-34066.mp3";
  const [playStart, { stop }] = useSound(startSound, { volume: 0.5 });
  const [reset, setReset] = React.useState(false);
  const [showCredits, setShowCredits] = React.useState(false);

  const handleClick = () => {
    setReady(true);
    playStart();
  }

  useEffect(() => {
    if (reset) {
      setTimeout(() => {
        setReset(false);
      }, 1000);
    }
  }, [reset]);

  useEffect(() => {
    if (selectedPlanet !== -1) {
      stop();
    }
  }, [selectedPlanet, stop]);

  return (
    <>
      <Canvas shadows="soft" dpr={[1, 2]}
      >
        <EffectComposer >
          <BrightnessContrast brightness={0} contrast={0.1} />
          <FXAA />
        </EffectComposer>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.1}
          maxAzimuthAngle={Math.PI / 10}
          minAzimuthAngle={-Math.PI / 10}
          maxPolarAngle={Math.PI / 2 + (selectedPlanet === -1 ? 0.2 : 0.0)}
          minPolarAngle={Math.PI / 2 - 0.2}
        />
        <color attach="background" args={
          ['black']
        } />
        <PerspectiveCamera makeDefault position={[0, 1, 7]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {ready && <Experience setSelectedPlanetIndex={setSelectedPlanet} reset={reset} />}
      </Canvas>
      {!ready && <div className='glass startScreen'>
        <h1>THE PLANETS</h1>
        <h2>Exploring our solar system with Gustav Holst's celestial compositions</h2>
        <p>Click begin and select a planet!</p>
        <button className="startButton" onClick={handleClick}>begin</button>
      </div>}
      {(selectedPlanet !== -1) && <><div className='glass infoContainer'>

        <h2>{PLANET_DATA[selectedPlanet] ? PLANET_DATA[selectedPlanet].name : ''}</h2>
        <h3>{PLANET_DATA[selectedPlanet] ? PLANET_DATA[selectedPlanet].subtitle : ''}</h3>

        <p>{PLANET_DATA[selectedPlanet] ? PLANET_DATA[selectedPlanet].description : ''}</p>
        <audio autoPlay controls>
          <source
            src={PLANET_DATA[selectedPlanet].audioPath}
            type="audio/mp4" />
        </audio>
      </div>
        <div style={{ position: 'absolute', top: "10%", left: "10%", color: 'white' }}>
          <button className="backButton" onClick={() => setReset(true)}>BACK</button>
        </div>
      </>
      }

      {showCredits && <div className='glass credits'>
        <button className="creditsBackButton" onClick={() => setShowCredits(false)}>CLOSE</button>
        <h3>Textures:</h3>
        <p>Textures for planets and sun are provided by<a href="https://www.solarsystemscope.com/textures/" target="_blank">Solar System Scope</a>.</p>
        <hr />

        <h3>Music:</h3>
        <p>The soundtrack is Gustav Holst's The Planets performed by <a href="https://www.youtube.com/playlist?list=PLA7no0L9zTk43f_g5mrAeTfyAni0FMICG" target="_blank">"The President's Own" U.S. Marine Band</a>.</p>
      </div>
      }

      <div className="bottomInfo">
        <button className="creditsButton" onClick={() => setShowCredits(true)}>Credits</button>
        <a>Github</a>
        <a href="http://twitter.com/amzp_dat">Twitter</a>
        <a>Instagram</a>
      </div>

    </>
  )
}

export default App
