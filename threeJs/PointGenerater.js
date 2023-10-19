import * as THREE from "three";

export class PointGenerater {
  constructor(model, material) {
    this.model = model;
    this.material = material;
  }

  GenenratePoints(randomColor = false) {
    let cakevertices = PointGenerater._combineBuffer(this.model, "position");
    //  cakeuv = combineBuffer(this.model, "uv");

    let cakebuffer = new THREE.BufferGeometry();
    cakebuffer.setAttribute("position", cakevertices);
    //cakebuffer.setAttribute("uv", cakeuv);
    // cakebuffer.applyMatrix4(this.model.matrixWorld);
    cakebuffer.scale(1, 1, 1);
    cakebuffer.applyQuaternion(this.model.quaternion);

    if (randomColor) {
      const colors = new Float32Array(cakevertices.count * 3); // 每个颜色由三个rgb组成
      for (let i = 0; i < cakevertices.count * 3; i += 1) {
        colors[i] = Math.random();
      }

      this.material.color = new THREE.Color("#FFFFFF");
      cakebuffer.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    }

    //let pointMat = GetPointMaterial(materialSize, "#1DB482");
    let cakepoint = new THREE.Points(cakebuffer, this.material);
    console.log(cakevertices.count);
    return cakepoint;
  }

  static _combineBuffer(model, bufferName) {
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
    console.log(count);
    return new THREE.BufferAttribute(combined, 3);
  }
}

export default PointGenerater;
