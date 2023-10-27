import * as THREE from "three";
import * as lilgui from "lil-gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

var numbers = new Float32Array();

function readLocalTextFile(file) {
  const reader = new FileReader();

  reader.onload = function (event) {
    const content = event.target.result;
    console.log(content);
    // 在这里处理读取到的文本内容
    const lines = content.split("\n"); // 将文本内容按行分割成数组
    numbers = new Float32Array(lines.length * 3); // 创建 Float32Array 数组
    lines.forEach((line, index) => {
      const parts = line.trim().split("\t"); // 将每行内容按制表符分割成数组
      parts.forEach((part, i) => {
        numbers[index * 3 + i] = parseFloat(part); // 将字符串转换为浮点数并存储到数组中
      });
    });
    var scene = InitScene();
    GenerateModel(numbers, scene);
    console.log(numbers);
  };

  reader.readAsText(file);
}

// 获取文件选择的 input 元素
const fileInput = document.getElementById("file-input");

// 监听文件选择的 change 事件
fileInput.addEventListener("change", function () {
  const file = this.files[0];
  readLocalTextFile(file);
});

function InitScene() {
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

  return scene;
}

function GenerateModel(numbers, scene) {
  var geomObj = new THREE.BufferGeometry();

  var modelMat = GetPointMaterial(0.0001);
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

    return pointMaterial;
  }

  geomObj.setAttribute("position", new THREE.BufferAttribute(numbers, 3));

  var model = new THREE.Points(geomObj, modelMat);
  // model.scale.set(5, 5, 5);
  scene.add(model);
}
