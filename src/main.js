import './style.css'
import * as THREE from 'three'
import { addBoilerPlateMeshes, addStandardMesh, addTextureMesh, addMushroomMesh } from './addDefaultMeshes';
import { addLight } from './addDefaultLights';
import Model from './Model'
import gsap from 'gsap';
import { LumaSplatsThree } from '@lumaai/luma-web';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: false }) //TURN antialias TO FALSE ONLY FOR GUASIAN SPLATS
const clock = new THREE.Clock()

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1, 100
);

const meshes = {}
const lights = {}
const scene = new THREE.Scene();
const mixers = []
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const controls= new OrbitControls(camera, renderer.domElement)

init();


function init() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  meshes.default = addBoilerPlateMeshes()
  meshes.standard = addStandardMesh()
  meshes.physical = addTextureMesh()
  meshes.mushroom = addMushroomMesh()
  meshes.physical.position.set(-2, -2, 0)

  meshes.splat = new LumaSplatsThree({
    source:'https://lumalabs.ai/capture/efdc0126-1e48-4711-a1e9-0080e13108a9',
    // particleRevealEnabled:true,
    loadingAnimationEnabled:false
  }  )
  meshes.splat.onLoad = ()=>{
    meshes.splat.captureCubemap(renderer).then((capturedTexture)=>{
      gsap.to('.loader',{
        opacity:0,
        duration:1.5,
        ease:'power1.out',
        onComplete:()=>{
          gsap.to('.loader',{zIndex:-3})
        }
      })
      scene.environment =capturedTexture
      scene.background = capturedTexture
      scene.backgroundBlurriness=0
    })
  }
  // lights.default = addLight()

  scene.add(meshes.default)
  scene.add(meshes.standard)
  scene.add(meshes.physical)
  scene.add(meshes.mushroom)
  scene.add(meshes.splat)
  // scene.add(lights.default)

  camera.position.set(0, 0, 5)
  raycast()
  resize();
  instances()
  animate();
}

function raycast() {
  window.addEventListener('click', (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)
    for (let i = 0; i < intersects.length; i++) {
      //look for things we want
      let object = intersects[i].object
      while(object){
        if(object.userData.groupName ==="box1"){
          gsap.to(meshes.default.scale,{
            x:5,
            y:5,
            z:5,
            ease:'power1.out'
          })
        }
        if(object.userData.groupName ==="flower"){
          gsap.to(meshes.flower.scale,{
            x:0,
            y:0,
            z:0,
            duration:1.5,
            ease:'power1.out'
          })
        }
          object=object.parent
      }

    }
  })
}

function instances() {
  const car = new Model({
    name: 'car',
    scene: scene,
    meshes: meshes,
    url: 'sports_lite.glb',
    scale: new THREE.Vector3(0.01, 0.01, 0.01),
    position: new THREE.Vector3(-2.5, -1, 1),
    rotation: new THREE.Vector3(0,-Math.PI/4,0),
  })
  car.init()
  const flower = new Model({
    name: 'flower',
    scene: scene,
    meshes: meshes,
    url: 'flowers.glb',
    scale: new THREE.Vector3(2, 2, 2),
    position: new THREE.Vector3(0, -0.8, 3),
    animationState: true,
    mixers: mixers,
    replace: true,
    replaceURL: 'black_matcap.png'
  })
  // flower.init()
}

function resize() {
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  })
}

function animate() {
  // const tick = clock.getElapsedTime()
  const delta = clock.getDelta()

  requestAnimationFrame(animate);
  for (const mixer of mixers) {
    mixer.update(delta)
  }
  if (meshes.flower) {
    meshes.flower.rotation.y -= 0.001;
  }
  // meshes.physical.material.displacementScale = Math.sin(tick)


  meshes.default.rotation.x += 0.01
  meshes.standard.rotation.y += 0.01
  meshes.standard.rotation.z -= 0.01
  meshes.physical.rotation.y += 0.02
  meshes.mushroom.rotation.x += 0.01
  // meshes.physical.rotation.x+=0.01

  renderer.render(scene, camera);
}