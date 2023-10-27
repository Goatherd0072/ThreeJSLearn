import * as THREE from "three";
import * as lilgui from "lil-gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

let container, stats;
let camera, scene, renderer, mesh;
let cameraRig, activeCamera, activeHelper;
let cameraPerspective, cameraOrtho;
let cameraPerspectiveHelper, cameraOrthoHelper;
const frustumSize = 1;

var cube, sphere;

init();
animate();

function init() {
  container = document.createElement("div"); //querySelector("#c");
  document.body.appendChild(container);

  scene = new THREE.Scene();

  //

  camera = new THREE.PerspectiveCamera(50, aspect, 1, 10000);
  camera.position.z = 0;

  cameraPerspective = new THREE.PerspectiveCamera(50, aspect, 150, 1000);

  cameraPerspectiveHelper = new THREE.CameraHelper(cameraPerspective);
  scene.add(cameraPerspectiveHelper);

  //
  cameraOrtho = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    150,
    1000
  );

  cameraOrthoHelper = new THREE.CameraHelper(cameraOrtho);
  scene.add(cameraOrthoHelper);

  //

  activeCamera = cameraOrtho;
  activeHelper = cameraPerspectiveHelper;

  // counteract different front orientation of cameras vs rig

  // cameraOrtho.rotation.y = Math.PI;
  // cameraPerspective.rotation.y = Math.PI;

  cameraRig = new THREE.Group();

  cameraRig.add(cameraPerspective);
  cameraRig.add(cameraOrtho);

  scene.add(cameraRig);

  //
  //生成一个cube模型
  cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: "#ff0000" })
  );

  sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1),
    new THREE.MeshBasicMaterial({ color: "#0270FF" })
  );
  scene.add(cube, sphere);

  cube.position.set(10, 0, 0);
  sphere.position.set(15, 1, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container.appendChild(renderer.domElement);

  renderer.autoClear = false;

  //

  stats = new Stats();
  container.appendChild(stats.dom);

  //

  window.addEventListener("resize", onWindowResize);
  document.addEventListener("keydown", onKeyDown);

  activeCamera.position.set(0, 0, 0);
  activeCamera.lookAt(1, 0, 0);
}

//

function onKeyDown(event) {
  switch (event.keyCode) {
    case 79 /*O*/:
      activeCamera = cameraOrtho;
      activeHelper = cameraOrthoHelper;

      break;

    case 80 /*P*/:
      activeCamera = cameraPerspective;
      activeHelper = cameraPerspectiveHelper;

      break;
  }
}

//

function onWindowResize() {
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight;
  aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

  cameraPerspective.aspect = aspect;
  cameraPerspective.updateProjectionMatrix();

  cameraOrtho.left = (-1 * frustumSize * aspect) / 2;
  cameraOrtho.right = (frustumSize * aspect) / 2;
  cameraOrtho.top = frustumSize / 2;
  cameraOrtho.bottom = -frustumSize / 2;
  cameraOrtho.updateProjectionMatrix();
}

//

function animate() {
  requestAnimationFrame(animate);

  render();
  stats.update();
}

function render() {
  const r = Date.now() * 0.0005;

  // mesh.position.x = 700 * Math.cos(r);
  // mesh.position.z = 700 * Math.sin(r);
  // mesh.position.y = 700 * Math.sin(r);

  // mesh.children[0].position.x = 70 * Math.cos(2 * r);
  // mesh.children[0].position.z = 70 * Math.sin(r);

  if (activeCamera === cameraPerspective) {
    // cameraPerspective.fov = 35 + 30 * Math.sin(0.5 * r);
    // cameraPerspective.far = mesh.position.length();
    cameraPerspective.updateProjectionMatrix();

    cameraPerspectiveHelper.update();
    cameraPerspectiveHelper.visible = true;

    cameraOrthoHelper.visible = false;
  } else {
    // cameraOrtho.far = mesh.position.length();
    cameraOrtho.updateProjectionMatrix();

    cameraOrthoHelper.update();
    cameraOrthoHelper.visible = true;

    cameraPerspectiveHelper.visible = false;
  }

  cameraRig.lookAt(1, 0, 0);

  renderer.clear();

  activeHelper.visible = false;

  renderer.setViewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  renderer.render(scene, activeCamera);

  activeHelper.visible = true;

  // renderer.setViewport(SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT);
  // renderer.render(scene, camera);
}
