import * as THREE from "three";
import * as lilgui from "lil-gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { ModelPoint } from "./PointGenerater.js";
import { gsap } from "gsap";

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

// AxesHelper
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

/// model
// gltfLoader

var geomObj = new THREE.BufferGeometry();

var modelMat = GetPointMaterial(0.1);
function GetPointMaterial(Size = 0.25, color = "#FFFFFF") {
  const textureLoader = new THREE.TextureLoader();
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

//初始生成20000个
const count = 20000;
const positions = new Float32Array(count * 3); // 每个点由三个坐标值组成（x, y, z）
const colors = new Float32Array(count * 3); // 每个颜色由三个rgb组成
for (let i = 0; i < count * 3; i += 1) {
  positions[i] = (Math.random() - 0.5) * 1;
  colors[i] = Math.random();
}
geomObj.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geomObj.setAttribute("color", new THREE.BufferAttribute(colors, 3));

var particles = new THREE.Points(geomObj, modelMat);
scene.add(particles);

var modelList = [];
LoadGltfModels(
  ["./Model/scene.gltf", "./Model/DamagedHelmet/DamagedHelmet.gltf"],
  modelList
);

console.log(modelList);

//加载GLtf模型并把顶点position信息存到数组中
function LoadGltfModels(urls, array) {
  const gltfLoader = new GLTFLoader();
  //遍历urls
  urls.forEach(function (item) {
    gltfLoader.load(item, (gltf) => {
      console.log("success");
      console.log(gltf);
      AddModelPos(gltf.scene, array);
    });
  });

  //将读取到的模型的postion信息存为THREE.BufferAttribute类并存到数组中
  function AddModelPos(loadedModel, array) {
    var tempPos = new THREE.BufferAttribute();
    tempPos = CombineBuffer(loadedModel, "position");
    let buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", tempPos);
    buffer.applyQuaternion(loadedModel.quaternion);
    tempPos = buffer.attributes.position;
    //tempPos.applyQuaternion(loadedModel.quaternion);
    array.push(tempPos);
  }
}

function CombineBuffer(model, bufferName) {
  let count = 0;

  model.traverse(function (child) {
    if (child.isMesh) {
      const buffer = child.geometry.attributes[bufferName];
      console.log(buffer);

      count += buffer.array.length;
    }
  });

  const combined = new Float32Array(count);

  let offset = 0;

  model.traverse(function (child) {
    if (child.isMesh) {
      const buffer = child.geometry.attributes[bufferName];

      combined.set(buffer.array, offset);
      offset += buffer.array.length;
    }
  });

  return new THREE.BufferAttribute(combined, 3);
}

function TranslateModel(index) {
  let tempAttribute = modelList[index];
  for (let i = 0; i < count; i++) {
    let x = tempAttribute.getX(i);
    let y = tempAttribute.getY(i);
    let z = tempAttribute.getZ(i);

    geomObj.attributes.position.setXYZ(i, x, y, z);
    // geomObj.attributes.position.setY(i, y);
    // geomObj.attributes.position.setZ(i, z);
    geomObj.attributes.position.needsUpdate = true;
    // geomObj.applyQuaternion(THREE.Quaternion.identity);
  }
}

var currtModelNum = 0;
function clickEvent() {
  console.log("click " + currtModelNum);
  TranslateModel(currtModelNum);
  currtModelNum++;
  if (currtModelNum >= modelList.length) {
    currtModelNum = 0;
  }
}

document.addEventListener("click", clickEvent);
