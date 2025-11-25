import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height,
    0.1, 1000
);
const canvas = document.getElementById("experience-canvas");
const renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, canvas);
controls.update();

const geometry = new THREE.BoxGeometry(4,1,1);
const material = new THREE.MeshBasicMaterial({color: 0x0000ff});
const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

camera.position.z = 3;

function handleResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener("resize", handleResize);

function animate() {
    renderer.render(scene, camera);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
}

renderer.setAnimationLoop(animate);
