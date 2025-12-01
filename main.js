import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { schools, philosophers } from "./philosophers.js";

const schoolMap = Object.fromEntries(schools.map((p) => [p.id, p]));
const philosopherMap = Object.fromEntries(philosophers.map((p) => [p.id, p]));

/*
|  SCENE SETUP
*/

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const aspect = sizes.width / sizes.height;
const scene = new THREE.Scene();
const orthoBoxHeight = 15;
const camera = new THREE.OrthographicCamera(
  -aspect * orthoBoxHeight,
  aspect * orthoBoxHeight,
  orthoBoxHeight,
  -orthoBoxHeight,
  0.1,
  1000
);

const canvas = document.getElementById("experience-canvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

camera.position.y = 20; // above
camera.position.z = 45; // to the left end of the guqin
camera.rotation.x = -Math.PI / 2; // looking down
camera.rotation.z = Math.PI / 2; // guqin oriented horizontally. On mobile should remain 0 (this would go in resizedisplay

/* const controls = new OrbitControls(camera, canvas);
controls.target.z = 60;
controls.update(); */

const envLoader = new THREE.TextureLoader();
const env = await envLoader.loadAsync("assets/images/footprint_court.jpg");
env.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = env;
scene.environmentIntensity = 0.5;

const directional = new THREE.DirectionalLight(0xffffff, 0.5);
directional.position.set(-8, 60, 50);
directional.target.position.set(8, 0, 16);
scene.add(directional);
scene.add(directional.target);

// timeline lines
const linemat = new THREE.LineBasicMaterial({
  transparent: true,
  opacity: 0,
  color: 0xff0000,
});
const staff_start_z = 62; // positive x is towards the narrow end
const staff_end_z = -56;
const staff_y = 6.5;
const width_start = 0.93;
const width_end = 2.9;
const points = [];
const lines = [];

for (let i = -3; i <= 3; i++) {
  points.push([
    new THREE.Vector3(i * width_start, staff_y, staff_start_z),
    new THREE.Vector3(i * width_end, staff_y, staff_end_z),
  ]);
}
for (let i = 0; i < points.length; i++) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points[i]);
  lines[i] = new THREE.Line(geometry, linemat);
  scene.add(lines[i]);
}

// create philosopher orbs
const staff_start_time = 1000; // 1000 BC
const staff_end_time = 0; // 0 AD
const time_to_z_factor =
  (staff_end_z - staff_start_z) / (staff_end_time - staff_start_time);

function get_orb_position(timePosition, string) {
  const z =
    time_to_z_factor * (timePosition - staff_start_time) + staff_start_z;
  const rc = new THREE.Raycaster(
    new THREE.Vector3(10, staff_y, z),
    new THREE.Vector3(-1, 0, 0)
  );
  // string within the struct is numbered 1-7, so subtract 1
  const intersections = rc.intersectObject(lines[string - 1], false);
  return intersections[0]; // there should only be one intersection
}

const spheregeom = new THREE.SphereGeometry(1, 32, 16);
const orbs = [];
const orbMap = {};
for (const philosopher of philosophers) {
  const color = schoolMap[philosopher.school].color;
  const spheremat = new THREE.MeshBasicMaterial({ color: color });

  const sphere = new THREE.Mesh(spheregeom, spheremat);
  sphere.name = philosopher.id;
  const timePosition = (philosopher.dates[0] + philosopher.dates[1]) / 2; // for now just take the average of the beginning and end
  sphere.position.copy(
    get_orb_position(timePosition, philosopher.string).point
  );
  scene.add(sphere);
  orbs.push(sphere);
  orbMap[philosopher.id] = sphere;
}
let focusedOrbs = orbs.slice();

// guqin model
const loader = new GLTFLoader();
const guqin = await loader.loadAsync("assets/chinese_zither/scene.gltf");

guqin.scene.traverse((obj) => {
  if (obj.name == "Collada_visual_scene_group") {
    obj.position.x = 2.1; // for some reason required to center the guqin
  }
  if (!obj.isMesh) return;
  const mat = obj.material;
  if (!mat || !mat.isMeshStandardMaterial) return;

  // fix guqin appearing as shiny black with no wood texture visible
  mat.vertexColors = false;
  mat.needsUpdate = true;
});

scene.add(guqin.scene);

const planeGeom = new THREE.PlaneGeometry(200, 200, 1, 1);
const planeMat = new THREE.MeshPhysicalMaterial({ transmission: 1, roughness: 0.4, transparent: true, opacity: 0});
const planeMesh = new THREE.Mesh(planeGeom, planeMat);
planeMesh.position.y = 8;
planeMesh.rotation.x = -Math.PI / 2;
scene.add(planeMesh);

/*
| Pointer state
*/

const pointerRayCaster = new THREE.Raycaster();
const pointerPosition = new THREE.Vector2(0, 0);

// these three functions copied from Three.js picking manual
function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  };
}

function setPointerPosition(event) {
  const pos = getCanvasRelativePosition(event);
  pointerPosition.x = (pos.x / canvas.width) * 2 - 1;
  pointerPosition.y = (pos.y / canvas.height) * -2 + 1; // note we flip Y
}

function clearPointerPosition() {
  // unlike the mouse which always has a position
  // if the user stops touching the screen we want
  // to stop picking. For now we just pick a value
  // unlikely to pick something
  pointerPosition.x = -100000;
  pointerPosition.y = -100000;
}

function getPointedOrb() {
  pointerRayCaster.setFromCamera(pointerPosition, camera);
  const intersections = pointerRayCaster.intersectObjects(focusedOrbs, false);
  if (!intersections.length) {
    return null;
  }
  const orb = intersections[0].object;
  return orb;
}

function getPointedPhil() {
    const orb = getPointedOrb();
    if (!orb) return null;
    return orb.name;
}

// scrolling
const scrollArea = document.getElementById("scroll-area");
const scroll_start_z = 50; // positive x is towards the narrow end
const scroll_end_z = -50;
function handleScroll(event) {
  const maxScroll = scrollArea.clientHeight - window.innerHeight;
  const scrollPercent = window.scrollY / maxScroll;

  camera.position.z =
    scrollPercent * (scroll_end_z - scroll_start_z) + scroll_start_z;
}
window.addEventListener("scroll", handleScroll);

// philosopher picking
// full philosopher picking flow (from neutral):
// no hover: philosopher icons are visible on each orb
// hover:
//  romanized name appears in white text under orb
//  if user hasn't clicked any orb yet, show text on bottom of screen: "click a philosopher to change to their view"
// click:
//  zither blurs and darkens into background, non-important orbs disappear
//  important orbs rearrange into shape on left half of screen
//  term-specific info appears on bottom third of screen
//  main description appears on right half of screen
//      exit button/back arrow is on this pane. Revert to neutral when clicked
//
// philosopher picking flow (from specific view of X):
// no hover: only icons
// hover:
//  orb glows
//  romanized name hover text
//  if user hasn't clicked any orb yet from specific view, show text on bottom of screen: "click a philosopher to learn about X's view of them"
// click:
//  orb stays lit, others darken
//  right pane now shows information about X's view on Y
//      exit button/back arrow is on this pane. Revert to previous right pane when clicked
// click (on philosopher X): either revert to default specific view, or do nothing if already in specific view

// Application state (updated on events)
let currentState = "neutral"; // should be "intro" (implemented later), "neutral", or "perspective"
let neutralPosZ = scroll_start_z; // saved state for returning to neutral
let transitioning = false;
let selectedPhilId = null;

const backButton = document.getElementById("back-button");
const infoPanels = document.getElementById("info-panels");
const leftPanel = document.getElementById("left-panel");
const rightPanel = document.getElementById("right-panel");
const bottomPanel = document.getElementById("bottom-panel");
leftPanel.style.opacity = 0;
console.log(rightPanel);
const orbPerspectiveAxis = new THREE.Object3D();
scene.add(orbPerspectiveAxis);
const orbPerspectiveY = 15;

// this will get called outside the animate thread and so can wait and do other stuff
function changeState(state) {
  if (transitioning) return; // should the caller be responsible for this?
  transitioning = true;
  if (state == "neutral") {
    // tween camera to neutralPosZ
    camera.position.z = neutralPosZ;

    // unblur
    planeMesh.material.opacity = 0;
    directional.intensity = 0.5; // magic number

    // reset orbs to original positions
    for (const orb of focusedOrbs) {
        const philosopher = philosopherMap[orb.name];
        scene.add(orb);

        const timePosition = (philosopher.dates[0] + philosopher.dates[1])/2;
        orb.position.copy(get_orb_position(timePosition, philosopher.string).point);
    }
    // reset focus to all orbs
    focusedOrbs = orbs.slice();
    // tween panes to transparency separately
    infoPanels.style.display = "none";
  } else if (state == "perspective") {
    console.assert(currentState == "neutral");
    console.assert(selectedPhilId);

    neutralPosZ = camera.position.z;

    // get relevant orbs
    const philosopher = philosopherMap[selectedPhilId];
    const mainOrb = orbMap[selectedPhilId];
    focusedOrbs = [mainOrb];
    for (const relationship of philosopher.relationships) {
        focusedOrbs.push(orbMap[relationship.targetId]);
    }

    // position perspective axis based on current orb location
    orbPerspectiveAxis.position.z = mainOrb.position.z;
    orbPerspectiveAxis.position.y = orbPerspectiveY;

    // reparent other orbs to axis
    console.log(focusedOrbs);
    for (const orb of focusedOrbs) {
        orbPerspectiveAxis.add(orb);
        orb.position.copy({x: 0, y: 0, z: 0});
        // tween other orbs around this orb
        // make these orbs glow more
    }
    // tween camera z to orb position
    camera.position.z = orbPerspectiveAxis.position.z;
    camera.position.y = 25
    // blur everything that isn't focusedOrbs
    planeMesh.material.opacity = 0.8;
    directional.intensity = 0;
    // fill panes with information
    const heading = document.querySelector("#right-panel > h1:first-of-type");
    const subheading = document.querySelector("#right-panel > h2:first-of-type");
    const description = document.querySelector("#right-panel > p:first-of-type");
    heading.textContent = philosopher.name + " - " + philosopher.chineseName;
    subheading.textContent = schoolMap[philosopher.school].name;
    description.textContent = philosopher.description || "Description pending";

    bottomPanel.replaceChildren();
    //const subpanels = [];
    for (const term of philosopher.keyTerms) {
        const subpanel = document.createElement("div");
        const termHead = document.createElement("h1");
        const termDesc = document.createElement("p");
        termHead.textContent = term.term + " (" + term.pinyin + ")";
        termDesc.textContent = term.description;
        subpanel.appendChild(termHead);
        subpanel.appendChild(termDesc);
        bottomPanel.appendChild(subpanel);
        //subpanels.push(subpanel);
    }
    //console.log(subpanels);
    //bottomPanel.appendChild(subpanels);

    // show panes on right side and bottom
    // tween pane opacity
    infoPanels.style.display = "block";
  } else if (state == "intro") {
    console.assert(currentState == "neutral");
    neutralPosZ = camera.position.z;
  } else {
    throw "Error: invalid state " + state;
  }
  currentState = state;
  transitioning = false;
}

function onPointerDown(event) {
    const pointedPhil = getPointedPhil();
    if (!pointedPhil) return;
    if (currentState == "neutral") {
        selectedPhilId = pointedPhil;
        changeState("perspective")
    }
}

function onBackButtonPress(event) {
    if (currentState == "neutral") {
        // go back to intro
    } else if (currentState == "perspective") {
        // go back to neutral
        selectedPhilId = null;
        changeState("neutral");
    }
}
window.addEventListener("pointerdown", onPointerDown);
backButton.addEventListener("click", onBackButtonPress);

console.assert(!selectedPhilId || currentState == "perspective");

// Hover handling
const hoverTextDiv = document.getElementById("overlay");
let hoveredPhil = null;

function renderHoveredPhil() {
  // handle leftover philosopher text from last frame
  // right now this creates and destroys the label every frame
  if (hoveredPhil) {
    // eventually the hover texts will fade in and out so we have to assume
    // there might be multiple at once
    const lastPhilHovers = hoverTextDiv.getElementsByClassName(hoveredPhil.id);
    // for now just remove all of them (no transition)
    for (const lastPhilHover of lastPhilHovers) {
      hoverTextDiv.removeChild(lastPhilHover);
    }
    hoveredPhil = null;
  }
  // I guess the ideal would be to tween the existing hover if you come back to the same orb before
  // the text fades. Maybe that's indistinguishable from just creating a new one though
  const orb = getPointedOrb();
  if (orb == null) {
    hoveredPhil = null;
    return;
  }

  hoveredPhil = philosopherMap[orb.name];

  const label = document.createElement("div");
  label.textContent = hoveredPhil.name;
  label.classList.add(hoveredPhil.id);
  hoverTextDiv.appendChild(label);
  // get the orb position
  const tempPos = new THREE.Vector3();
  orb.updateWorldMatrix(true, false); // necessary?
  orb.getWorldPosition(tempPos);
  //const tempPos = orb.position.project(camera);
  tempPos.project(camera);
  // convert to CSS coords
  const x = (tempPos.x * 0.5 + 0.5) * canvas.clientWidth;
  const y = (tempPos.y * -0.5 + 0.5) * canvas.clientHeight;
  // I don't understand this at all
  label.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
}

window.addEventListener("mousemove", setPointerPosition);
window.addEventListener("mouseout", clearPointerPosition);
window.addEventListener("mouseleave", clearPointerPosition);

// mobile support
window.addEventListener(
  "touchstart",
  (event) => {
    // prevent the window from scrolling
    event.preventDefault();
    setPointerPosition(event.touches[0]);
  },
  { passive: false }
);

window.addEventListener("touchmove", (event) => {
  setPointerPosition(event.touches[0]);
});

window.addEventListener("touchend", clearPointerPosition);

// window resize handling

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

// rendering

function animate() {
  renderHoveredPhil();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
