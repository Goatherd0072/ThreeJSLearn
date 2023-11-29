import * as THREE from "three";
import * as lilgui from "lil-gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { ModelPoint } from "./PointGenerater.js";
import CameraControls from "camera-controls";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

CameraControls.install({ THREE: THREE });

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
const frustumSize = 600;

// Canvas
const canvas = document.querySelector("#c");
var camera;
// Scene
var scene, plane;
var directionLight, directionLightHelper;
var directionalLightCameraHelper, ambientLight;
var modelP1, modelP2, modelP3, modelP4;
var renderer;
var controls;
const gui = new lilgui.GUI();
const stats = new Stats();
const clock = new THREE.Clock();
var cameraControls;
const intervalDistance = 100;

const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(98.14949, 17.08268, 35.07652),
  new THREE.Vector3(203.04568, 10.02473, -33.63947),
  new THREE.Vector3(237.95786, 19.76129, 6.08819),
  new THREE.Vector3(295.94692, 15.1528, 70.54862),
  new THREE.Vector3(369.84136, 2.68907, -0.11275),
]);
const curve2 = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-37.33742, 68.700356, 26.75959),
  new THREE.Vector3(21.7817, 45.54021, -87.20534),
  new THREE.Vector3(98.14949, 17.08268, 35.07652),
]);

const lookPos = [
  new THREE.Vector3(100, 0, 0),
  new THREE.Vector3(200, 0, 0),
  new THREE.Vector3(300, 0, 0),
  new THREE.Vector3(300, 0, 0),
];

const animationProgress = { value: 0 };
const animationProgress1 = { value: 0 };
var pathAnimation, pathAnimation1;
const _tmp = new THREE.Vector3();
var tl = gsap.timeline();

init();
animate();

function init() {
  initCamera();
  initScene();
  initModel();
  initRenderer();
  initCameraControl();
  //initControl();
  initGUIPanel();
  initAxesHelper();
  Animation();

  window.addEventListener("resize", onWindowResize);
  window.addEventListener("click", (e) => {
    //console.log(clock.getDelta());
    // pathAnimation.play(1);
  });
  window.addEventListener("scroll", () => {
    scrollY = window.scrollY;
    console.log(scrollY);
  });

  // gsap.to(camera.position, {
  //   scrollTrigger: camera.position,
  //   x: 0,
  //   y: 0,
  //   z: 0,
  //   duration: 1,
  //   ease: "power2.inOut",
  // });
}

function initCameraControl() {
  cameraControls = new CameraControls(camera, renderer.domElement);

  // move Path

  const points = curve.getPoints(500);
  const pathMesh = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x00ffff })
  );
  scene.add(pathMesh);
  const points2 = curve2.getPoints(500);
  const pathMesh2 = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points2),
    new THREE.LineBasicMaterial({ color: 0x00ffff })
  );
  scene.add(pathMesh2);
}

function Animation() {
  //var pathAnimation = gsap.timeline({});
  pathAnimation = gsap.fromTo(
    animationProgress,
    {
      value: 0,
    },
    // {
    //   scrollTrigger: {
    //     start: "top top",
    //     trigger: "#c",
    //   },
    // },
    {
      value: 1,
      duration: 8,
      overwrite: true,
      paused: true,
      onUpdateParams: [animationProgress],
      onUpdate({ value }) {
        //if (!this.isActive()) return;

        curve.getPoint(value, _tmp);
        const cameraX = _tmp.x;
        const cameraY = _tmp.y;
        const cameraZ = _tmp.z;

        let index = parseInt(value / 0.25);

        if (index > 3) return;
        let lookAtX = lookPos[index].x;
        let lookAtY = lookPos[index].y;
        let lookAtZ = lookPos[index].z;

        cameraControls.setLookAt(
          cameraX,
          cameraY,
          cameraZ,
          lookAtX,
          lookAtY,
          lookAtZ,
          false // IMPORTANT! disable cameraControls's transition and leave it to gsap.
        );
        // if (value % 0.25 == 0) {
        //   console.log("index", index);
        //   pathAnimation.pause();
        // }
      },
      onStart() {
        cameraControls.enabled = false;
      },
      onComplete() {
        cameraControls.enabled = true;
      },
    }
  );
  pathAnimation1 = gsap.fromTo(
    animationProgress1,
    {
      value: 0,
    },
    // {
    //   scrollTrigger: {
    //     start: "top top",
    //     trigger: "#c",
    //   },
    // },
    {
      value: 1,
      duration: 8,
      overwrite: true,
      paused: true,
      onUpdateParams: [animationProgress1],
      onUpdate({ value }) {
        //if (!this.isActive()) return;

        curve2.getPoint(value, _tmp);
        const cameraX = _tmp.x;
        const cameraY = _tmp.y;
        const cameraZ = _tmp.z;

        let lookAtX = 0;
        let lookAtY = 0;
        let lookAtZ = 0;

        cameraControls.setLookAt(
          cameraX,
          cameraY,
          cameraZ,
          lookAtX,
          lookAtY,
          lookAtZ,
          false // IMPORTANT! disable cameraControls's transition and leave it to gsap.
        );
        // if (value % 0.25 == 0) {
        //   console.log("index", index);
        //   pathAnimation.pause();
        // }
      },
      onStart() {
        cameraControls.setTarget(0, 0, 0, true);
        cameraControls.enabled = false;
      },
      onComplete() {
        cameraControls.setTarget(100, 0, 0, true);
        cameraControls.enabled = true;
      },
    }
  );
}

function initCamera() {
  // Camera
  camera = new THREE.PerspectiveCamera(75, 2, 0.1, 100000);
  // const camera = new THREE.OrthographicCamera(
  //   window.innerWidth / -2,
  //   window.innerWidth / 2,
  //   window.innerHeight / 2,
  //   window.innerHeight / -2,
  //   0.001,
  //   100000
  // );
  camera.position.set(-70, 105, 60.5);
  // camera.position.z = 1;
  camera.lookAt(0, 0, 0);
}
function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#D4D4D4");
  /**
   * Objects
   */
  // plane
  plane = new THREE.Mesh(
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

  /**
   * Light
   */
  directionLight = new THREE.DirectionalLight();
  directionLight.castShadow = true;
  directionLight.position.set(5, 5, 6);
  // directionLight.shadow.camera.near = 1;
  // directionLight.shadow.camera.far = 20;
  // directionLight.shadow.camera.top = 10;
  // directionLight.shadow.camera.right = 10;
  // directionLight.shadow.camera.bottom = -10;
  // directionLight.shadow.camera.left = -10;

  directionLightHelper = new THREE.DirectionalLightHelper(directionLight, 3);
  directionLightHelper.visible = false;
  scene.add(directionLightHelper);

  directionalLightCameraHelper = new THREE.CameraHelper(
    directionLight.shadow.camera
  );
  directionalLightCameraHelper.visible = false;
  scene.add(directionalLightCameraHelper);

  ambientLight = new THREE.AmbientLight(new THREE.Color("#C9C9C9"), 0.4);
  scene.add(ambientLight, directionLight);
}

function initModel() {
  /// model
  // gltfLoader
  const gltfLoader = new GLTFLoader();

  //./Model/scene.gltf     skull
  // Logo/LOGO_001_VOL.glt
  gltfLoader.load("./Model/E02(1).gltf", (gltf) => {
    console.log("success");
    console.log(gltf);

    addModel(gltf.scene);
    // let mat = GetPointMaterial(0.05, "#079DCA");
    // modelP1 = new ModelPoint(gltf.scene.children[0], mat);
    // // var gtflObj = modelP.GenenratePoints(true);
    // // scene.add(gtflObj);
    // modelP1.geometry.position.set(0, 0, 0);
    // modelP1.geometry.scale.set(0.1, 0.1, 0.1);
    // scene.add(modelP1.geometry);
    // tick(modelP);
    //tick();
    //addPoint(gltf.scene.children[0], 0.1);
  });

  gltfLoader.load("./Model/scene.gltf", (gltf2) => {
    console.log("success");
    console.log(gltf2);
    let mat = GetPointMaterial(0.05, "#F74545");
    modelP2 = new ModelPoint(gltf2.scene, mat);
    modelP2.geometry.position.set(100, 0, 0);
    modelP2.geometry.scale.set(10, 10, 10);
    modelP2.geometry.rotateX(-90);
    scene.add(modelP2.geometry);
  });

  gltfLoader.load("./Model/DamagedHelmet/DamagedHelmet.gltf", (gltf3) => {
    console.log("success");
    console.log(gltf3);

    // scene.add(gltf3.scene);
    let mat = GetPointMaterial(0.5, "#10E060");
    modelP3 = new ModelPoint(gltf3.scene, mat);
    modelP3.geometry.position.set(200, 0, 0);
    modelP3.geometry.scale.set(10, 10, 10);
    modelP3.geometry.rotateX(90);
    scene.add(modelP3.geometry);
  });

  gltfLoader.load("./Model/clock.gltf", (gltf4) => {
    console.log("success");
    console.log(gltf4);

    // scene.add(gltf3.scene);
    let mat = GetPointMaterial(0.5, "#F6FA26");
    modelP4 = new ModelPoint(gltf4.scene, mat);
    modelP4.geometry.position.set(300, 0, 0);
    modelP4.geometry.scale.set(10, 10, 10);
    // modelP4.geometry.rotateX(0);
    scene.add(modelP4.geometry);
  });

  // gltfLoader.load("./Model/Logo/LOGO_UV/LOGO_UV.gltf", (gltf5) => {
  //   console.log("success");
  //   console.log(gltf5);
  //   let mod = gltf5.scene;
  //   mod.traverse(function (obj) {
  //     if (obj.isMesh) {
  //       const textureLoader = new THREE.TextureLoader();
  //       let matB = textureLoader.load(
  //         "./Model/Logo/LOGO_UV/LOGO_UV_BaseColor.png"
  //       );
  //       let matE = textureLoader.load(
  //         "./Model/Logo/LOGO_UV/LOGO_UV_Emissive.png"
  //       );
  //       console.log(obj.isMesh);
  //       obj.material = new THREE.MeshStandardMaterial({
  //         alphaMap: matB,
  //         transparent: true,
  //         emissiveMap: matE,
  //         alphaTest: 0.5,
  //       });
  //     }
  //   });
  //   mod.position.set(0, 100, 0);
  //   mod.scale.set(10, 10, 10);
  //   scene.add(mod);
  // });

  // 中间生成一个cube
  // const geometry = new THREE.BoxGeometry(1, 1, 1);
  // const material = new THREE.MeshBasicMaterial({ color: "#FFFFFF" });
  // const cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);

  function GetPointMaterial(Size = 1, color = "#FFFFFF") {
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
    pointMaterial.vertexColors = false;

    return pointMaterial;
  }

  function addModel(model) {
    scene.add(model);
    model.position.set(200, 0, 0);
    model.castShadow = true;
    model.scale.set(10, 10, 10);
    model.visible = false;
  }
}

function initRenderer() {
  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    premultipliedAlpha: true,
  });
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
}

function initControl() {
  // Controls
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.zoomSpeed = 0.3;
  controls.target = new THREE.Vector3(0, 0, 0);
  controls.enabled = false;
  controls.autoRotate = false;
  controls.update();
}

function initGUIPanel() {
  const fun = {
    GetCameraPos() {
      console.log(camera.position);
    },
    SwitchCamera() {
      if (camera.isPerspectiveCamera) {
        camera = new THREE.OrthographicCamera(aspect);
      }
    },
    CameraPath() {
      // pathAnimation = gsap.fromTo();
      pathAnimation.play();
      // pathAnimation.play(0);
    },
    CameraPath1() {
      pathAnimation1.play();
    },
    Reset() {
      cameraControls.reset(true);
    },
    MoveToStartPos() {
      curve.getPoint(0, _tmp);
      cameraControls.setLookAt(_tmp.x, _tmp.y, _tmp.z, 0, 0, 0, true);
    },
    RePlay() {
      pathAnimation.reverse();
    },
    RePlay1() {
      pathAnimation1.reverse();
    },
  };

  // gui.add(controls, "autoRotate");
  gui.add(directionLightHelper, "visible").name("lightHelper visible");
  gui
    .add(directionalLightCameraHelper, "visible")
    .name("lightCameraHelper visible");
  gui.add(directionLight, "intensity", 0, 10, 0.01).name("light intensity");
  gui.add(plane, "visible").name("Show Plane");
  gui.add(camera.position, "x", -100, 100).name("Camera X");
  gui.add(camera.position, "y", -100, 100).name("Camera Y");
  gui.add(camera.position, "z", -1000, 1000).name("Camera Z");
  gui.add(fun, "GetCameraPos");
  gui.add(fun, "Reset");
  gui.add(fun, "MoveToStartPos");
  gui.add(fun, "CameraPath");
  gui.add(fun, "RePlay");
  gui.add(fun, "CameraPath1");
  gui.add(fun, "RePlay1");
  //gui.add(animationProgress, "value", 0, 1);
  // gui.add(modelMat, "size", 0, 1, 0.01).name("Point Size");
  // gui.add(modelMat, "color").name("Point Color");

  stats.dom.style.left = "auto";
  stats.dom.style.top = "10px";
  stats.dom.style.left = "10px";
  document.body.appendChild(stats.dom);
}

function render(time) {
  time *= 0.001;

  renderer.setViewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

function initAxesHelper() {
  const axesHelper = new THREE.AxesHelper(1000);
  scene.add(axesHelper);
}

function onWindowResize() {
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight;
  let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

  camera.aspect = aspect;
  camera.updateProjectionMatrix();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  cameraControls.update(delta);
  if (typeof controls == OrbitControls) {
    controls.update();
  }
  render();
  stats.update();
}
// // Animations
// const clock = new THREE.Clock();
// function tick() {
//   // const num = getRandomArbitrary(-Math.PI, Math.PI);
//   // const speed = 0.1;

//   // // 让模型在 -5 到 5 之间来回移动
//   // const x = Math.sin(clock.getElapsedTime() * speed) * 5;
//   // const y = Math.sin(clock.getElapsedTime() * speed) * 5;
//   // modelP.geometry.position.setX(x);
//   // modelP.geometry.position.setY(y);

//   // modelP.geometry.translateY(10 * num);
//   for (let i = 0; i < modelP.count; i++) {
//     const num = getRandomArbitrary(-Math.PI, Math.PI);
//     const speed = 0.1;

//     // 让模型在 -5 到 5 之间来回移动
//     const x = Math.sin(clock.getElapsedTime() * speed) * 5;
//     const y = Math.sin(clock.getElapsedTime() * speed) * 5;
//     modelP.buffer.attributes.position.setXYZ(i, x, y, num);
//     // console.log(modelP.buffer.attributes.position);
//     // let x1 = modelP.buffer.attributes.position.getY(i) + Math.sin(num);
//     // modelP.buffer.attributes.position.setY(i, x1);
//   }
//   requestAnimationFrame(tick);

//   function getRandomArbitrary(min, max) {
//     return Math.random() * (max - min) + min;
//   }
// }
