import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
//import { RGBELoader } from "./js/RGBELoader.js";
import { GUI } from "lil-gui";
import gsap from "gsap";

// 当前的相机，透视相机，正交相机
let curCamera, perCamera, orthCamera;
let scene, renderer;

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
let cameraRig;

const changeTime = 100;
const canvas = document.querySelector("#c");

init();
animate();

function init() {
  curCamera = new THREE.Camera();
  initScene();
  initCamera();
  initRenderer();
  addLights();
  // initOrbitControls();
  addObject3Ds();
  addGUI();
  window.addEventListener("resize", onWindowResize);
}

function initScene() {
  // 场景，背景色
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#C9C9C9");

  // AxesHelper
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);
}

function initRenderer() {
  // 渲染器
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    premultipliedAlpha: true,
  });
  // renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
}

function initCamera() {
  perCamera = new THREE.PerspectiveCamera(60, aspect, 1, 10000);
  orthCamera = new THREE.OrthographicCamera(
    SCREEN_WIDTH / -10,
    SCREEN_WIDTH / 10,
    SCREEN_HEIGHT / 10,
    SCREEN_HEIGHT / -10,
    1,
    100
  );

  cameraRig = new THREE.Group();

  cameraRig.add(perCamera);
  cameraRig.add(orthCamera);
  //cameraRig.add(curCamera);

  cameraRig.position.set(0, 10, 40);
  curCamera = new THREE.PerspectiveCamera(60, aspect, 1, 10000);
  curCamera.position.set(0, 10, 40);
  scene.add(curCamera);
  //scene.add(cameraRig);
  //curCamera = createPerCamera();
}

function createPerCamera() {
  if (perCamera == null) {
    perCamera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    perCamera.position = originPos; //set(0, 10, 50);
  }

  return perCamera;
}

function createPerCameraToOrthCamera(perCamera) {
  if (perCamera == null) {
    console.error(" perCamera is null");
    return null;
  }

  if (orthCamera == null) {
    //1.计算透视相机到场景 scene 的深度距离 depth
    let target = scene.position.clone();
    let camPos = perCamera.position.clone();
    let depth = camPos.sub(target).length();

    //2.得到透视相机的宽高比和垂直可视角度
    let aspect = perCamera.aspect;
    let fov = perCamera.fov;

    //3.根据上述变量计算正交投影相机的视口矩形
    let top_ortho = depth * Math.atan(((Math.PI / 180) * fov) / 2);
    let right_ortho = top_ortho * aspect;
    let bottom_ortho = -top_ortho;
    let left_ortho = -right_ortho;

    //4.最后创建正交投影相机
    let near = perCamera.near;
    let far = perCamera.far;
    orthCamera = new THREE.OrthographicCamera(
      left_ortho,
      right_ortho,
      top_ortho,
      bottom_ortho,
      near,
      far
    );
  }
  return orthCamera;
}

function addLights() {
  scene.add(new THREE.AmbientLight(0xffffff, 1));

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
  hemiLight.position.set(0, 100, 0);
  scene.add(hemiLight);
}

// function initOrbitControls() {
//   const controls = new OrbitControls(curCamera, renderer.domElement);
//   controls.minDistance = 5;
//   controls.maxDistance = 50;
//   controls.enablePan = false; // 禁止 移动操作
//   controls.update();
// }

function addObject3Ds() {
  const material1 = new THREE.MeshStandardMaterial({
    color: "#0077FF",
    metalness: 0.0,
    roughness: 0.5,
  });
  const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(10, 3, 5), material1);
  mesh1.castShadow = true;
  mesh1.receiveShadow = true;
  mesh1.position.set(0, 0, 0);
  scene.add(mesh1);

  const material2 = new THREE.MeshStandardMaterial({
    color: "#ff00cc",
    metalness: 0.0,
    roughness: 0.1,
  });
  const mesh2 = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), material2);
  mesh2.position.set(3, 2, -10);
  scene.add(mesh2);

  const material3 = new THREE.MeshStandardMaterial({
    color: "#ffcc00",
    metalness: 0.1,
    roughness: 0.1,
  });
  const mesh3 = new THREE.Mesh(
    new THREE.SphereGeometry(Math.PI, 30),
    material3
  );
  mesh3.position.set(-2, -2, 10);
  scene.add(mesh3);
}

function addGUI() {
  const param = {
    透视转正交: orthCameraView,
    正交转透视: orthCameraBackPerCamera,
    切换: SwtichCamera,
  };

  const gui = new GUI();
  gui.add(param, "透视转正交");
  gui.add(param, "正交转透视");
  gui.add(param, "切换");
  gui.add(curCamera, "fov", 1, 180);
}

function SwtichCamera() {
  // if (curCamera === perCamera) {
  //   curCamera = orthCamera;
  // } else if (curCamera === orthCamera) {
  //   curCamera = perCamera;
  // } else {
  //   console.error("curCamera is Wrong");
  // }
  // curCamera.fov = 50;
  // // 设置目标参数
  // gsap.to(curCamera, {
  //   fov: 1, // 正交相机的fov
  //   duration: 1,
  // });
  let preMart = curCamera.projectionMatrix;
  gsap.to(curCamera, {
    fov: 1
  });
}

function orthCameraView() {
  const tmpCamera = createPerCameraToOrthCamera(perCamera);
  tmpCamera.position.set(
    perCamera.position.x,
    perCamera.position.y,
    perCamera.position.z
  );
  tmpCamera.rotation.set(
    perCamera.rotation.x,
    perCamera.rotation.y,
    perCamera.rotation.z
  );

  curCamera = tmpCamera;
}

function orthCameraBackPerCamera() {
  curCamera = createPerCamera();
}

function animate() {
  requestAnimationFrame(animate);

  SwtichCameraView();
  render();
}

function render() {
  curCamera.aspect = aspect;
  curCamera.updateProjectionMatrix();
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  renderer.render(scene, curCamera);
}

function onWindowResize() {
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight;
  aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

  curCamera.aspect = aspect;
  curCamera.updateProjectionMatrix();

  perCamera.aspect = aspect;
  perCamera.updateProjectionMatrix();

  orthCamera.left = SCREEN_WIDTH / -10;
  orthCamera.right = SCREEN_WIDTH / 10;
  orthCamera.top = SCREEN_HEIGHT / 10;
  orthCamera.bottom = SCREEN_HEIGHT / -10;
  orthCamera.updateProjectionMatrix();
}

var change = false;
var startT = 0;
var endT = -1;

function SwtichCameraView() {
  if (!change) {
    return;
  }

  let orthM = new THREE.Matrix4();
  let perM = new THREE.Matrix4();

  perM = curCamera.projectionMatrix.clone();
  orthM = curCamera.projectionMatrix.makeOrthographic();

  if (endT == -1) {
    endT = changeTime;
  }
  // console.log("d " + Date.now());
  // console.log("e " + endT);
  if (endT - startT > 0.1) {
    curCamera.projectionMatrix = Matrix4Lerp(
      perM,
      orthM,
      Math.sqrt(Date.now())
    );
    startT += 0.5;
    console.log("startT " + startT + " //nendT " + endT);
    console.log(curCamera.projectionMatrix.elements);
  } else {
    change = false;
    endT = -1;
    startT = 0;
  }
}

function Matrix4Lerp(from, to, t) {
  t = Clamp(t, 0.0, 1.0);
  var newMatrix = new THREE.Matrix4();
  // newMatrix.SetRow(0, Vector4.Lerp(from.GetRow(0), to.GetRow(0), t));
  // newMatrix.SetRow(1, Vector4.Lerp(from.GetRow(1), to.GetRow(1), t));
  // newMatrix.SetRow(2, Vector4.Lerp(from.GetRow(2), to.GetRow(2), t));
  // newMatrix.SetRow(3, Vector4.Lerp(from.GetRow(3), to.GetRow(3), t));
  let fromA, toA;
  from.toArray(fromA);
  to.toArray(toA);
  let newM = [];

  for (let i = 0; i < 16; i++) {
    newM.push(THREE.MathUtils.lerp(fromA, toA, t));
  }
  newMatrix.fromArray(newM); //
  return newMatrix;

  function Clamp(value, min, max) {
    return Math.max(Math.min(value, max), min);
  }

  function SetMatrixRow() { }

  function GetMartixRow() { }
}
