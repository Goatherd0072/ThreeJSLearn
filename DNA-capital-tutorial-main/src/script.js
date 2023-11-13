import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import fragmentShader from './shader/fragment.glsl'
import vertexShader from './shader/vertex.glsl'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import {AberrationShader} from './shader/customPass.js'
import ModelLoader from './ModelLoader.js'
import {AxesHelper, BufferGeometry} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

import gsap from "gsap";
import ModelPoint from "./PointGenerater";
import {useCameraCurveMove, useCameraMove, useCameraBezierMove} from "./transitionAnimation/cameraTransition";
import {rigistGSAPPlugin} from "./composables/gsapCTRL";

import {AddLine} from "./Addline";

const canvas = document.querySelector('.webgl')
const interval = 10;
const duration = 1;
const CurvePath = new THREE.CurvePath();
let moveIndex = 0;

const CameraPos = [
    {
        "pos": {x: -23.93705034667555, y: 25.327463047026054, z: -54.60327123283831},
        "index": 0
    }, {
        "pos": {x: 5.628764889684225, y: 25.67565770246139, z: -25.3449159498728},
        "index": 1
    }, {
        "pos": {x: -10.925966911720845, y: 8.692456343164986, z: 17.194525955074},
        "index": 2
    }, {"pos": {x: 15.850353444783856, y: 7.136313628210299, z: 10.79342456836824}, "index": 3}, {
        "pos": {
            x: 0,
            y: 0,
            z: 50
        }, "index": 3
    }];

class NewScene
{
    constructor()
    {
        this._Init()
    }

    _Init()
    {
        rigistGSAPPlugin();

        this.scene = new THREE.Scene()
        this.clock = new THREE.Clock()
        this.GLTFLoader = new GLTFLoader();
        this.models = [];
        this.AddModel(this.scene);

        // this.InitDisplay()

        this.InitCamera()
        this.InitRenderer()
        this.InitPostProcessing()
        this.InitLights()
        this.InitControls()
        this.Update()
        this.initAxes();
        this.InitSettings();
        // useCameraBezierMove(this.camera, [{x:0, y:0}, {x:20, y:0}, {x:30, y:50}, {x:50, y:50}], new THREE.Vector3(0, 0, 0), 2)
        // useCameraCurveMove(this.camera, [
        //     {x: 0, y: 0}, {x: 20, y: 0}, {x: 30, y: 50}, {
        //         x: 50,
        //         y: 50
        //     }], new THREE.Vector3(10, 0, 0), 2)
        const p1 = new THREE.Vector3(0, 0.515933, -50);
        const p2 = new THREE.Vector3(0, 0, -25);
        const p3 = new THREE.Vector3(-20, 0, -50);
        const p4 = new THREE.Vector3(-20, 0, -25);
        // 三维三次贝赛尔曲线
        const curve1 = new THREE.CubicBezierCurve3(p1, p3, p4, p2);
        const curve2 = new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, 0, -25),
            new THREE.Vector3(5, 0, -25),
            new THREE.Vector3(5, 0, -15),
            new THREE.Vector3(0, 0, -15)
        )
        const curve3 = new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, 0, -15),
            new THREE.Vector3(-5, 0, -15),
            new THREE.Vector3(-5, 0, -5),
            new THREE.Vector3(0, 0, -5)
        )
        const curve4 = new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, 0, -5),
            new THREE.Vector3(5, 0, -5),
            new THREE.Vector3(5, 0, 5),
            new THREE.Vector3(0, 0, 5)
        )


        // const CurvePath = new THREE.CurvePath();
        CurvePath.add(curve1);
        CurvePath.add(curve2);
        CurvePath.add(curve3);
        CurvePath.add(curve4);

        const points = CurvePath.getPoints(500);
        const pathMesh = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({color: 0x00ffff}));
        this.scene.add(pathMesh);
        console.log(CurvePath);
        window.addEventListener('resize', () =>
        {
            this.Resize()
        })

        AddLine(this.scene, this.renderer.domElement, this.camera, this.renderer);
    }

    InitDisplay()
    {
        this.geometry = new THREE.BufferGeometry()

        this.number = 90000;

        // for (let i=0; i <= this.number; i++){

        // }
        //this.number = this.geometry.attributes.position.array.length
        console.log(this.number / 3)
        let positions = new Float32Array(this.number)
        let randoms = new Float32Array(this.number / 3)
        let colorRandoms = new Float32Array(this.number / 3)

        let row = 100;
        for (let i = 0; i < this.number / 3; i++)
        {
            randoms.set([Math.random()], i)
            colorRandoms.set([Math.random()], i)

            let theta = 0.01 * Math.PI * 2 * (Math.floor(i / 100))
            let radius = 0.03 * ((i % 100) - 50)

            let x = radius * Math.cos(theta)
            let y = 0.1 * (Math.floor(i / 100))
            let z = radius * Math.sin(theta)
            positions.set([x, y, z], i * 3)
        }
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        this.geometry.setAttribute('randoms', new THREE.BufferAttribute(randoms, 1))
        this.geometry.setAttribute('colorRandoms', new THREE.BufferAttribute(colorRandoms, 1))
        this.material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide, vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: {
                u_time: {value: 0},
                u_color1: {value: new THREE.Color("#fff").setRGB(0.5, 0.5, 0.5)},
                u_color2: {value: new THREE.Color("#fff").setRGB(0.5, 0.5, 0.5)},
                u_color3: {value: new THREE.Color("#fff").setRGB(0.5, 0.5, 0.5)}
            }, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending
        })

        this.geometry.center()
        //this.geometry = new THREE.PlaneGeometry(1, 1, 10, 10)
        this.plane = new THREE.Points(this.geometry, this.material)
        this.plane.position.set(-5, 0, 0)
        // this.scene.add(this.plane)
    }

    InitPostProcessing()
    {
        this.renderScene = new RenderPass(this.scene, this.camera)
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(0, 0), 1.5, 0.9, 0.05);
        this.customPass = new ShaderPass(AberrationShader)
        this.composer = new EffectComposer(this.renderer)


        this.composer.addPass(this.renderScene)
        this.composer.addPass(this.customPass)

        this.composer.addPass(this.bloomPass)

    }

    InitRenderer()
    {
        this.renderer = new THREE.WebGLRenderer({
            canvas, antialias: true,
        })
        this.renderer.shadowMap.enabled = true
        this.renderer.setClearColor(0x000000, 1)
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        //this.renderer.render(this.scene, this.camera)
    }

    InitCamera()
    {
        this.camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000)
        // this.camera = new THREE.OrthographicCamera(-window.innerWidth, window.innerWidth, window.innerHeight, -window.innerHeight, 0.1, 1000)
        // this.camera.viewport = new THREE.Vector4(0, 0, 1000, 1000)
        // this.camera.position.set(0, 0, 50)//
        // this.camera.position.set(CameraPos[3].pos.x, CameraPos[3].pos.y, CameraPos[3].pos.z);
        // this.camera.lookAt(0, 0, -15);
        this.camera.position.set(-1, 3, -50)
        this.scene.add(this.camera)
    }

    InitLights()
    {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 1)
        this.scene.add(this.ambientLight)
    }

    InitSettings()
    {
        this.settings = {
            enabled: false,
            progress: 0,
            bloomStrength: 0.9,
            bloomRadius: 0.63,
            bloomThreshold: 0.2,
            restore: this.Restore.bind(this),
            expand: this.Expand.bind(this),
            CameraPos: this.DebugCameraInfo.bind(this),
            Rotation: this.Rotation.bind(this),
            Move: this.Move.bind(this)
        }
        this.gui = new dat.GUI();
        this.gui.add(this.settings, 'enabled')
        this.gui.add(this.settings, 'progress', 0, 1, 0.01)
        this.gui.add(this.settings, 'bloomStrength', 0, 10, 0.01)
        this.gui.add(this.settings, 'bloomRadius', 0, 10, 0.01)
        this.gui.add(this.settings, 'bloomThreshold', 0, 10, 0.01)
        this.gui.add(this.settings, 'restore');
        this.gui.add(this.settings, 'expand');
        this.gui.add(this.settings, 'CameraPos');
        this.gui.add(this.settings, 'Rotation');
        this.gui.add(this.settings, 'Move');
        this.gui.add(this.controls, 'enabled');

        // this.gui.add(this.camera, 'fov', 1, 180, 0.01);
        // this.gui.add(this.model_Logos,"z",0,100,0.01);

    }

    InitControls()
    {
        this.controls = new OrbitControls(this.camera, canvas)
        this.controls.enableDamping = true
        this.controls.enabled = false;
        this.controls.update()
    }

    Restore()
    {
        //console.log(this.models);
        for (let i = 0; i < this.models.length; i++)
        {
            gsap.to(this.models[i].geometry.position, {duration: 1, z: 0});
            // this.models[i].geometry.position.set(0,0,0);
            // console.log(this.models[i].geometry.position);
        }
    }

    Expand()
    {
        for (let i = 0; i < this.models.length; i++)
        {
            gsap.to(this.models[i].geometry.position, {duration: 1, z: -(3 - i) * interval});
            // this.models[i].geometry.position.set(0,0,0);
            // console.log(this.models[i].geometry.position);
        }
    }


    Resize()
    {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.composer.setSize(window.innerWidth, window.innerHeight)
    }

    Update()
    {
        requestAnimationFrame(() =>
        {
            if (this.settings.enabled)
            {
                this.bloomPass.threshold = this.settings.bloomThreshold
                this.bloomPass.strength = this.settings.bloomStrength
                this.bloomPass.radius = this.settings.bloomRadius
                this.composer.render(this.scene, this.camera)
            }
            else
            {
                this.renderer.render(this.scene, this.camera)
            }
            // if(this.geometry){
            //     this.plane.rotation.y = this.clock.getElapsedTime()/5
            //     this.material.uniforms.u_time.value = this.clock.getElapsedTime()
            // }
            if (this.controls.enabled)
            {
                this.controls.update()
            }
            this.Update()
        })
    }

    initAxes()
    {
        let axes = new AxesHelper(100);
        axes.position.set(0, 0, 0);
        this.scene.add(axes);
    }

    AddModel(Scene)
    {
        let model_Logo = [];
        let that = this;
        this.GLTFLoader.load("./model/logo60p_pointCenter.gltf", (gltf) =>
        {
            console.log(gltf);

            for (let i = 0; i < gltf.scene.children.length; i++)
            {
                console.log(model_Logo);
                model_Logo.push(new ModelPoint(gltf.scene.children[i], 0.025, "#00ABD1"));
                //model_Logo[i].geometry.position.set(0, 0, 0);
                console.log(typeof model_Logo[i].geometry)
                model_Logo[i].geometry.scale.set(0.1, 0.1, 0.1);

                Scene.add(model_Logo[i].geometry);
            }
            that.models = (model_Logo);
            console.log(that.models);
            // console.log(that.models[1].geometry.position);
            let indax = CameraPos[3].index;
            let lookAt = new THREE.Vector3(that.models[indax].geometry.position.x, that.models[indax].geometry.position.y, that.models[indax].geometry.position.z);
            that.camera.lookAt(lookAt);
            console.log(lookAt);
        });
    }

    DebugCameraInfo()
    {
        console.log(this.camera.position);
        console.log(this.camera.rotation);
        console.log(this.camera);
    }

    Rotation(index)
    {
        // console.log(CurvePath.curves)
        let path = GetXYZArray(CurvePath.curves[index]);
        // console.log(path);
        let lookat = this.models[index].geometry.position;
        console.log(lookat);
        useCameraBezierMove(this.camera, path, lookat, 1);

    }

    Move()
    {
        this.Rotation(moveIndex);
        moveIndex++;
        if (moveIndex > 3)
        {
            moveIndex = 0;
        }
    }

}

let _APP = null

window.addEventListener('DOMContentLoaded', () =>
{
    _APP = new NewScene()
})

function GetXYZArray(curve)
{
    const path = [];
    // const points = curve.()

    path.push({x: curve.v0.x, y: curve.v0.y, z: curve.v0.z});
    path.push({x: curve.v1.x, y: curve.v1.y, z: curve.v1.z});
    path.push({x: curve.v2.x, y: curve.v2.y, z: curve.v2.z});
    path.push({x: curve.v3.x, y: curve.v3.y, z: curve.v3.z});

    return path;
}
