import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as dat from "lil-gui";

// Canvas
const canvas = document.querySelector("#c");

// Scene
const scene = new THREE.Scene();

/**
 * Particles
 */
// geometry
// geometry
const particlesGeometry = new THREE.BufferGeometry();
const count = 500000;
const positions = new Float32Array(count * 3); // 每个点由三个坐标值组成（x, y, z）
for (let i = 0; i < count * 3; i += 1) {
  positions[i] = (Math.random() - 0.5) * 5;
}
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

// material
const pointMaterial = new THREE.PointsMaterial({
  size: 0.02,
  sizeAttenuation: true,
});
pointMaterial.color = new THREE.Color("#ff88cc");
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load("./Png/noise04.png");
pointMaterial.map = particleTexture;

const particles = new THREE.Points(particlesGeometry, pointMaterial);
scene.add(particles);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight("#ffffff", 0.4);
scene.add(ambientLight);

// Size
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(2, 1.8, 2);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
// controls.autoRotateSpeed = 0.2
controls.zoomSpeed = 0.3;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Animations
const tick = () => {
  controls.update();
  pointMaterial.needsUpdate = true;

  // Render
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};

tick();

/**
 * Debug
 */
const gui = new dat.GUI();

gui.add(controls, "autoRotate");
gui.add(controls, "autoRotateSpeed", 0.1, 10, 0.01);
gui.add(pointMaterial, "size", 0.01, 0.1, 0.001);
gui.add(pointMaterial, "sizeAttenuation");
