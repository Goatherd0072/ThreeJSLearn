import * as THREE from "three";

export class ModelPoint {
  constructor(model, material) {
    this.model = model;
    this.material = material;
    this.count = 0;

    this.buffer = this.GenenrateBuffer(false);
    this.geometry = this.GenenratePoints();
    //this.geometry.translateY(2);
  }

  GenenrateBuffer(randomColor = false) {
    let cakevertices = ModelPoint._combineBuffer(this.model, "position");
    this.count = cakevertices.count;
    //  cakeuv = combineBuffer(this.model, "uv");

    let cakebuffer = new THREE.BufferGeometry();
    cakebuffer.setAttribute("position", cakevertices);
    //cakebuffer.setAttribute("uv", cakeuv);
    // cakebuffer.applyMatrix4(this.model.matrixWorld);
    cakebuffer.scale(1, 1, 1);
    cakebuffer.applyQuaternion(this.model.quaternion);

    if (randomColor) {
      const colors = new Float32Array(this.count * 3); // 每个颜色由三个rgb组成
      for (let i = 0; i < this.count * 3; i += 1) {
        colors[i] = Math.random();
      }

      //随机颜色后把原颜色改成白色，避免叠加
      this.material.color = new THREE.Color("#FFFFFF");
      this.material.vertexColors = true;
      cakebuffer.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    }
    cakebuffer.attributes.position.needsUpdate = true;

    return cakebuffer;
  }

  GenenratePoints() {
    let cakepoint = new THREE.Points(this.buffer, this.material);
    // this.buffer = cakebuffer;

    return cakepoint;

    // console.log(cakebuffer === this.bufferGeometry);
    // console.log(this.geometry);
    // console.log(this.geometry === cakepoint);

    // const clock = new THREE.Clock();
    // const tick = () => {
    //   const elapsedTime = clock.getElapsedTime();
    //   // particles.position.x = 0.1 * Math.sin(elapsedTime)

    //   for (let i = 0; i < this.count; i += 1) {
    //     const x = this.buffer.attributes.position.getY(i);
    //     this.buffer.attributes.position.setY(
    //       i,
    //       x + Math.sin(elapsedTime) * 0.1
    //     );
    //   }
    //   this.buffer.attributes.position.needsUpdate = true;
    //   // pointMaterial.needsUpdate = true

    //   requestAnimationFrame(tick);
    // };
    // tick();
    // return this.geometry;
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

    return new THREE.BufferAttribute(combined, 3);
  }

  static _GetElapTime() {
    return new THREE.Clock().getElapsedTime();
  }
}

export default ModelPoint;
