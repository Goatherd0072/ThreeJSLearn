import * as THREE from "three";

main();
function main() {
  const sceneInfo1 = setupScene1();
  const sceneInfo2 = setupScene2();
}

function makeScene(elem) {
  const scene = new THREE.Scene();

  const fov = 45;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;
  camera.position.set(0, 1, 2);
  camera.lookAt(0, 0, 0);

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  return { scene, camera, elem };
}

function setupScene1() {
  const sceneInfo = makeScene(document.querySelector("#box"));
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({ color: "#0A8EDA" });
  const mesh = new THREE.Mesh(geometry, material);
  sceneInfo.scene.add(mesh);
  sceneInfo.mesh = mesh;
  return sceneInfo;
}

function setupScene2() {
  const sceneInfo = makeScene(document.querySelector("#pyramid"));
  const radius = 0.8;
  const widthSegments = 4;
  const heightSegments = 2;
  const geometry = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments
  );
  const material = new THREE.MeshPhongMaterial({
    color: "#F8440D",
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  sceneInfo.scene.add(mesh);
  sceneInfo.mesh = mesh;
  return sceneInfo;
}
