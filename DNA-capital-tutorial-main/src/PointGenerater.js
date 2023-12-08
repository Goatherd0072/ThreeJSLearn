import * as THREE from "three";
//引入性能监视器stats.js
import Stats from 'three/examples/jsm/libs/stats.module.js';
import DNAfrag from "./shader/fragment.glsl";
import DNAver from "./shader/vertex.glsl";

var time = 0;
const stats = new Stats();
//stats.domElement:web页面上输出计算结果,一个div元素，
document.body.appendChild(stats.domElement);

export class ModelPoint
{
    constructor(model, size = 1, color = "#cc3737")
    {
        this.model = model;
        // this.material = this.GetPointMaterial(size, color);
        this.material = this.GetShaderMaterialDNA();
        this.count = 0;

        this.buffer = this.GenenrateBuffer(false);
        this.geometry = this.GenenratePoints();
        // console.log(this.count);
        this.tick = () =>
        {
            time += 0.05;
            this.material.uniforms.time.value = time;
            requestAnimationFrame(this.tick);
            stats.update();
        }
        // this.tick();
    }

    GenenrateBuffer(randomColor = false)
    {
        let cakevertices = ModelPoint._combineBuffer(this.model, "position");
        this.count = cakevertices.count;
        //  cakeuv = combineBuffer(this.model, "uv");

        let cakebuffer = new THREE.BufferGeometry();
        cakebuffer.setAttribute("position", cakevertices);


        let randoms = new Float32Array(this.count)
        let colorRandoms = new Float32Array(this.count)
        let pointSize = new Float32Array(this.count)

        for (let i = 0; i < this.count; i++)
        {
            randoms.set([Math.random()], i)
            colorRandoms.set([Math.random()], i)
        }

        cakebuffer.setAttribute('randoms', new THREE.BufferAttribute(randoms, 1))
        cakebuffer.setAttribute('colorRandoms', new THREE.BufferAttribute(colorRandoms, 1))
        // let t = new Float32Array(this.count * 2);
        // let n = 0;
        // for (let r = 0; r < 128; r++)
        //   for (let o = 0; o < 256; o++)
        //     (t[n * 2] = 1 / 256 + o / 257), (t[n * 2 + 1] = 1 / 128 + r / 129), n++;

        // cakebuffer.setAttribute("uv", new THREE.BufferAttribute(t, 2));

        //cakebuffer.setAttribute("uv", cakeuv);
        // cakebuffer.applyMatrix4(this.model.matrixWorld);
        // cakebuffer.scale(1, 1, 1);
        // cakebuffer.applyQuaternion(this.model.quaternion);

        if (randomColor)
        {
            const colors = new Float32Array(this.count * 3); // 每个颜色由三个rgb组成
            for (let i = 0; i < this.count * 3; i += 1)
            {
                // colors[i] = Math.random();
                let r, g, b;

                if (i < this.count)
                {
                    r = 1;
                    g = 0;
                    b = 0;
                }
                else if (i < this.count * 2)
                {
                    r = 0;
                    g = 1;
                    b = 0;
                }
                else if (i < this.count * 3)
                {
                    r = 0;
                    g = 0;
                    b = 1;
                }

                if (i % 3 == 0) colors[i] = r;
                else if (i % 3 == 1) colors[i] = g;
                else if (i % 3 == 2) colors[i] = b;
            }

            //随机颜色后把原颜色改成白色，避免叠加
            this.material.color = new THREE.Color("#FFFFFF");
            this.material.vertexColors = true;
            cakebuffer.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        }
        cakebuffer.attributes.position.needsUpdate = true;

        return cakebuffer;
    }

    GenenratePoints()
    {
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

    GetPointMaterial(Size = 1, color = "#FFFFFF")
    {
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

        pointMaterial.transparent = true;
        pointMaterial.vertexColors = false;
        pointMaterial.fog = true;

        return pointMaterial;
    }

    GetShaderMaterial()
    {
        var mat = new THREE.RawShaderMaterial({
            // wireframe: true,
            side: THREE.DoubleSide,
            transparent: true,
            vertexShader: vertex,
            fragmentShader: frag,
            // blending: THREE.AdditiveBlending,
            // depthWrite: false,
            uniforms: {
                time: {value: 9},
                resolution: {value: new THREE.Vector4()},
                duration: {
                    value: 10,
                },
                envStart: {
                    value: 1.25,
                },
                fade: {
                    value: 0,
                },
                fdAlpha: {
                    value: 0,
                },
                globalAlpha: {
                    value: 1,
                },
                scale: {
                    value: 1,
                },
                size: {
                    value: 2.6,
                },
                nebula: {
                    value: true,
                },
                focalDistance: {
                    value: 385,
                },
                aperture: {
                    value: 100,
                },
                pointSize: {
                    value: 8,
                },
                tint: {
                    value: new THREE.Color("#fff"),
                },
                glow: {
                    value: false,
                },
                superOpacity: {
                    value: 1,
                },
                superScale: {
                    value: 1,
                },
                hover: {
                    value: 0,
                },
                planets: {
                    value: this.planets,
                },
                hoverPoint: {
                    value: new THREE.Vector3(0, 0, 0),
                },
                nebulaAmp: {
                    value: 1.1
                }
            },
        });

        // var mat = new THREE.RawShaderMaterial();
        // console.log(mat);

        return mat;
    }

    GetShaderMaterialDNA()
    {
        var mat = new THREE.ShaderMaterial({
            // wireframe: true,
            side: THREE.DoubleSide,
            transparent: true,
            vertexShader: DNAver,
            fragmentShader: DNAfrag,
            // blending: THREE.AdditiveBlending,
            // depthWrite: false,
            uniforms: {
                time: {value: 0},
                pointSize: {value: 25.0},
                focalDistance: {value: 385},
                aperture: {value: 100},
                u_color1: {value: new THREE.Color().setRGB(0, 171 / 255, 209 / 255)},
                u_color2: {value: new THREE.Color().setRGB(8 / 255, 110 / 255, 195 / 255)},
                u_color3: {value: new THREE.Color().setRGB(7 / 255, 77 / 255, 135 / 255)},
                far: {value: 700},
                near: {value: 1},
            },
            depthTest: false,
            depthWrite: true,
            blending: THREE.AdditiveBlending,
        });

        return mat;
    }

    static _combineBuffer(model, bufferName)
    {
        let count = 0;

        model.traverse(function (child)
        {
            if (child.isMesh)
            {
                const buffer = child.geometry.attributes[bufferName];
                // console.log(buffer);

                count += buffer.array.length;
            }
        });

        const combined = new Float32Array(count);

        let offset = 0;

        model.traverse(function (child)
        {
            if (child.isMesh)
            {
                const buffer = child.geometry.attributes[bufferName];

                combined.set(buffer.array, offset);
                offset += buffer.array.length;
            }
        });

        // let combined_New = this._DeclinePoints(combined);
        // console.log(combined);
        return new THREE.BufferAttribute(combined, 3);
    }

    static _GetElapTime()
    {
        return new THREE.Clock().getElapsedTime();
    }

    static _DeclinePoints(array32F)
    {
        let length = array32F.length;
        let count = array32F.length / 2;
        let declineArray = new Float32Array(count);
        for (let i = 0; i < length; i += 1)
        {
            declineArray[i * 3] = array32F[i * 3];
            declineArray[i * 3 + 1] = array32F[i * 3 + 1];
            declineArray[i * 3 + 2] = array32F[i * 3 + 2];
        }
        return declineArray;
    }
}


export default ModelPoint;
