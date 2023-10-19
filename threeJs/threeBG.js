import * as THREE from "three";
import * as lilgui from "lil-gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { PointGenerater } from "./PointGenerater.js";

var textureLoader = new THREE.TextureLoader();
// Canvas
const canvas = document.querySelector("#c");
// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("#D4D4D4");

// Camera
const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 100000);
// camera.position.set(4, 4, 12);
camera.position.z = 1;

/**
 * Objects
 */
// plane
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 15),
  new THREE.MeshStandardMaterial({
    color: "#607D8B",
  })
);
plane.rotateX(-Math.PI / 2);
plane.position.y = -2;
plane.receiveShadow = true;
scene.add(plane);
plane.visible = false;

/// model
// gltfLoader
const gltfLoader = new GLTFLoader();
var pGenerater = new PointGenerater();

gltfLoader.load("./Model/scene.gltf", (gltf) => {
  console.log("success");
  console.log(gltf);
  //addModel(gltf.scene);
  var mat = GetPointMaterial(0.025, "#1DB482");
  pGenerater = new PointGenerater(gltf.scene.children[0], mat);
  var gtflObj = pGenerater.GenenratePoints(true);
  scene.add(gtflObj);
  //addPoint(gltf.scene.children[0], 0.1);
});

// 中间生成一个cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: "#FFFFFF" });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

function GetPointMaterial(Size = 1, color = "#FFFFFF") {
  // material
  let pointMaterial = new THREE.PointsMaterial({
    size: Size,
    // blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    depthTest: false,
    depthWrite: false,
    // alphaTest: 0.01,
  });
  pointMaterial.color = new THREE.Color(color);

  let particleTexture = textureLoader.load("./Png/planet00.png");
  pointMaterial.alphaMap = particleTexture;
  pointMaterial.transparent = true;
  pointMaterial.vertexColors = true;

  return pointMaterial;
}

function addModel(model) {
  scene.add(model);
  model.position.set(0, 0, 0);
  model.castShadow = true;
  model.scale.set(10, 10, 10);
  model.visible = false;
}

/**
 * Light
 */
const directionLight = new THREE.DirectionalLight();
directionLight.castShadow = true;
directionLight.position.set(5, 5, 6);
// directionLight.shadow.camera.near = 1;
// directionLight.shadow.camera.far = 20;
// directionLight.shadow.camera.top = 10;
// directionLight.shadow.camera.right = 10;
// directionLight.shadow.camera.bottom = -10;
// directionLight.shadow.camera.left = -10;

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

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.zoomSpeed = 0.3;
controls.target = new THREE.Vector3(0, 0, 0);
controls.enabled = true;
controls.autoRotate = false;
controls.update();

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
  controls.update();
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

const gui = new lilgui.GUI();
gui.add(controls, "autoRotate");
gui.add(directionLightHelper, "visible").name("lightHelper visible");
gui
  .add(directionalLightCameraHelper, "visible")
  .name("lightCameraHelper visible");
gui.add(directionLight, "intensity", 0, 10, 0.01).name("light intensity");
gui.add(plane, "visible").name("Show Plane");
gui.add(camera.position, "x", -100, 100).name("Camera X");
gui.add(camera.position, "y", -100, 100).name("Camera Y");
gui.add(camera.position, "z", -100, 100).name("Camera Z");
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
