import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const orthoBoxHeight = 15

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const aspect = sizes.width / sizes.height;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
    -aspect * orthoBoxHeight,
    aspect * orthoBoxHeight,
    orthoBoxHeight,
    -orthoBoxHeight,
    0.1,
    1000
);
// camera.rotation.x = 0;
// camera.rotation.y = 90;

const canvas = document.getElementById("experience-canvas");
const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

camera.position.y = 20; // above
camera.position.z = 50;
camera.rotation.x = - Math.PI / 2; // looking down
camera.rotation.z = Math.PI / 2; // guqin oriented horizontally. On mobile should remain 0 (this would go in resizedisplay

const controls = new OrbitControls(camera, canvas);
controls.target.z = 60;
controls.update();

const envLoader = new THREE.TextureLoader();
const env = await envLoader.loadAsync('assets/images/footprint_court.jpg');
env.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = env;

// const ambient = new THREE.AmbientLight(0x404040);
// scene.add(ambient);
const directional = new THREE.DirectionalLight(0xFFFFFF, 1);
directional.position.set(0, 60, 0);
directional.target.position.set(-5, 0, 0);
scene.add(directional);
scene.add(directional.target);
const lightHelper = new THREE.DirectionalLightHelper(directional, 5);
scene.add(lightHelper);

const loader = new GLTFLoader();
const guqin = await loader.loadAsync('assets/chinese_zither/scene.gltf');
// guqin.scene.traverse((child) => {
//     if (child.isMesh) {
// 	child.material.color = new THREE.Color().setRGB(1, 1, 1);
// 	console.log(child.material);
//     }
// });

// this makes the texture show up, but really ugly
// guqin.scene.traverse((obj) => {
//      if (obj.isMesh) obj.material = new THREE.MeshBasicMaterial({ map: obj.material.map });
// });
guqin.scene.traverse((obj) => {
    if (!obj.isMesh) return;
    const mat = obj.material;
    if (!mat || !mat.isMeshStandardMaterial) return;

    // Make sure base color isn’t killing the texture
    // mat.color.set(0xffffff);
    mat.vertexColors = false;

    // Make it less mirror-like
    // mat.metalness = 0.1;   // or something small like 0.1
    // mat.roughness = 0.6;   // higher = more diffuse, texture more obvious

    // If you’re using an environment map:
    mat.envMapIntensity = 0.05; // or even lower if it’s too shiny

    mat.needsUpdate = true;
});

console.log(guqin);
scene.add(guqin.scene);

/* const geometry = new THREE.BoxGeometry(4,1,1);
const material = new THREE.MeshBasicMaterial({color: 0x0000ff});
const cube = new THREE.Mesh(geometry, material);

scene.add(cube); */


function handleResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    const aspect = sizes.width / sizes.height;
    //duplicated
    camera.left = -aspect * orthoBoxHeight;
    camera.right = aspect * orthoBoxHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener("resize", handleResize);

function animate() {
    renderer.render(scene, camera);
    /* cube.rotation.x += 0.01;
    cube.rotation.y += 0.01; */
}

renderer.setAnimationLoop(animate);
