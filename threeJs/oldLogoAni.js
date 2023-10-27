import * as THREE from "three";
import * as lilgui from "lil-gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";

// Canvas
const canvas = document.querySelector("#c");
// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("#D4D4D4");

const camera = new THREE.Group();
// Camera
const cameraP = new THREE.PerspectiveCamera(75, 2, 0.1, 100000);
const cameraO = new THREE.OrthographicCamera((near = 0.1), (far = 100000));
// const camera = new THREE.OrthographicCamera();
// camera.position.set(4, 4, 12);
// camera.position.z = 1;
camera.add(cameraP);
camera.position.set(-1.163540151757753, 1.5505310227873783, 1.2293719229623783);
camera.lookAt(0, 0, 0);

/**
 * Light
 */
const directionLight = new THREE.DirectionalLight();
directionLight.castShadow = true;
directionLight.position.set(5, 5, 6);

const directionLightHelper = new THREE.DirectionalLightHelper(
  directionLight,
  3
);
directionLightHelper.visible = false;
scene.add(directionLightHelper);

const directionalLightCameraHelper = new THREE.CameraHelper(
  directionLight.shadow.camera
);
directionalLightCameraHelper.visible = false;
scene.add(directionalLightCameraHelper);

const ambientLight = new THREE.AmbientLight(new THREE.Color("#C9C9C9"), 0.4);
scene.add(ambientLight, directionLight);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
  premultipliedAlpha: true,
});
// renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

// // Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.zoomSpeed = 0.3;
// controls.target = new THREE.Vector3(0, 0, 0);
// controls.enabled = true;
// controls.autoRotate = false;
// controls.update();

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }

  return needResize;
}

function render(time) {
  time *= 0.001;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
  // controls.update();
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

const gui = new lilgui.GUI();
var fun = {
  DebugCameraPos() {
    console.log(camera.position);
  },
  CameraChange() {},
};
//gui.add(controls, "autoRotate");
gui.add(directionLightHelper, "visible").name("lightHelper visible");
gui
  .add(directionalLightCameraHelper, "visible")
  .name("lightCameraHelper visible");
gui.add(directionLight, "intensity", 0, 10, 0.01).name("light intensity");
gui.add(camera.position, "x", -100, 100).name("Camera X");
gui.add(camera.position, "y", -100, 100).name("Camera Y");
gui.add(camera.position, "z", -100, 100).name("Camera Z");
gui.add(fun, "DebugCameraPos");
gui.add(fun, "CameraChange");
// gui.add(modelMat, "size", 0, 1, 0.01).name("Point Size");
// gui.add(modelMat, "color").name("Point Color");

const stats = new Stats();
stats.dom.style.left = "auto";
stats.dom.style.top = "10px";
stats.dom.style.left = "10px";
document.body.appendChild(stats.dom);

// FPSShower
function FPSShower() {
  stats.begin();
  //renderer.render(scene, camera);
  stats.end();
  requestAnimationFrame(FPSShower);
}

FPSShower();

// AxesHelper
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

// const gLTFLoader = new GLTFLoader();
// var modelLogo = new THREE.Object3D();
// var group = new THREE.Group();

// gLTFLoader.load("./Model/Logo/logo.gltf", (gltf) => {
//   console.log(gltf);
//   modelLogo = gltf.scene;
//   scene.add(modelLogo);
//   console.log(modelLogo);
//   // group.position.set(0, 0, 0);
//   // group.add(modelLogo);
//   // scene.add(group);
//   modelLogo.position.set(5, 5, 5);
//   CameraLookAt();
//   // modelLogo.children[2].visible = false;
// });

// function CameraLookAt() {
//   // modelLogo.rotateOnAxis(new THREE.Vector3(0, 1, 0), 30);
//   modelLogo.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), 0.01);
//   requestAnimationFrame(CameraLookAt);
// }

//生成一个cube模型
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
);

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1),
  new THREE.MeshBasicMaterial({ color: "#0270FF" })
);

cube.position.set(10, 0, 0);
sphere.position.set(15, 1, 0);
camera.lookAt(cube.position);
scene.add(cube, sphere);
