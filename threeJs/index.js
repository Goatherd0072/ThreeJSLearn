import * as THREE from "three";

const scene = new THREE.Scene();
const p_camera = new THREE.PerspectiveCamera(90, 800 / 600, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(800, 600);
renderer.setViewport(0, 0, 800, 600);
var hed = 5;
//document.body.appendChild(renderer.domElement);
var canvas = document.getElementById("threeCanvas");
canvas.height = 800;
canvas.width = 600;
canvas.appendChild(renderer.domElement);
// var ctx = canvas.getContext("2d");
// ctx.fillStyle = "green";
// ctx.fillRect(10, 10, 100, 100);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: "#00DB80" });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

p_camera.position.z = 5;
p_camera.lookAt(cube.position);

renderer.render(scene, p_camera);
