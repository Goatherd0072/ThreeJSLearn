import './style.css'
import * as THREE from 'three'
import {AxesHelper} from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import fragmentShader from './shader/fragment.glsl'
import vertexShader from './shader/vertex.glsl'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import {AberrationShader} from './shader/customPass.js'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

import gsap from "gsap";
import ModelPoint from "./PointGenerater";
import {rigistGSAPPlugin} from "./composables/gsapCTRL";

import {AddLine} from "./Addline";

const canvas = document.querySelector('.webgl')
const interval = 10;
const duration = 1;

let curIndex = 0;

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
        this.InitLineData();


        // console.log(CurvePath);
        window.addEventListener('resize', () =>
        {
            this.Resize()
        })

        AddLine(this.scene, this.renderer.domElement, this.camera, this.renderer, this.controls);
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

    InitLineData()
    {
        const CurvePath = new THREE.CurvePath();
        const CurvePath_Lookat = new THREE.CurvePath();
        this.MovePath = {MoveCurve: CurvePath, LookAtCurve: CurvePath_Lookat};

        // LookAt line
        // const curveL1 = new THREE.CatmullRomCurve3(
        //     [
        //         new THREE.Vector3(0.018296016037411943, 2.2793849534441146, -30.580507151294213),
        //         new THREE.Vector3(-1.2834385134549515, -1.2365950207867376, -20.884463506281563),
        //         new THREE.Vector3(2.375688480045702, 0.379855534924074, -10.29535403209438),
        //         new THREE.Vector3(0.049298499412910535, -0.2356612523274516, 2.8617929692406694)
        //     ]
        // )
        const curveL1 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.9179262718514771, 2.0484429648946505, -30.719796594891754),
            new THREE.Vector3(-2.2876584333567522, 1.3956816956215605, -28.446104780969673),
            new THREE.Vector3(-3.1031187907201754, 0.7752661180468414, -23.899774377865114),
            new THREE.Vector3(-0.6072034921274962, -1.4025256152748582, -20.280445161167417)])

        CurvePath_Lookat.add(curveL1);
        const pointsL = CurvePath_Lookat.getPoints(500);
        const pathMeshL = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsL), new THREE.LineBasicMaterial({color: "#c6d410"}));
        this.scene.add(pathMeshL);

        const curve1 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(2.4039321284290622, 4.2314712081787675, -40.916574482678364),
            new THREE.Vector3(-4.39991708298793, -2.764719543948928, -32.8892993216464),
            new THREE.Vector3(4.292829421584311, 0.10628825524337637, -26.324900740344948),
            new THREE.Vector3(8.467181855600257, -0.046905493191901626, -20.0248854235066)]);

        const curve2 = new THREE.CatmullRomCurve3(
            [
                new THREE.Vector3(0, 0, -25),
                new THREE.Vector3(5, 0, -25),
                new THREE.Vector3(5, 0, -15),
                new THREE.Vector3(0, 0, -15)]
        )
        const curve3 = new THREE.CatmullRomCurve3(
            [
                new THREE.Vector3(0, 0, -15),
                new THREE.Vector3(-5, 0, -15),
                new THREE.Vector3(-5, 0, -5),
                new THREE.Vector3(0, 0, -5),
                new THREE.Vector3(5, 0, -5),
                new THREE.Vector3(5, 0, 5),
                new THREE.Vector3(0, 0, 5)]
        )
        const curve4 = new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, 0, -5),
            new THREE.Vector3(5, 0, -5),
            new THREE.Vector3(5, 0, 5),
            new THREE.Vector3(0, 0, 5)
        )


        // Move Line
        CurvePath.add(curve1);
        CurvePath.add(curve2);
        CurvePath.add(curve3);
        // CurvePath.add(curve4);

        const points = CurvePath.getPoints(500);
        const pathMesh = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({color: 0x00ffff}));
        this.scene.add(pathMesh);

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
            Rotation: this.SetAnimation.bind(this),
            Rotation1: this.SetAnimation.bind(this, 0),
            Rotation2: this.SetAnimation.bind(this, 1),
            Rotation3: this.SetAnimation.bind(this, 2),

        }
        this.gui = new dat.GUI();
        let post = this.gui.addFolder('PostProcessing');
        let CameraCtrl = this.gui.addFolder('CameraCtrl');
        post.add(this.settings, 'enabled').name("Post Enabled")
        post.add(this.settings, 'progress', 0, 1, 0.01)
        post.add(this.settings, 'bloomStrength', 0, 10, 0.01)
        post.add(this.settings, 'bloomRadius', 0, 10, 0.01)
        post.add(this.settings, 'bloomThreshold', 0, 10, 0.01)
        CameraCtrl.add(this.settings, 'restore');
        CameraCtrl.add(this.settings, 'expand');
        CameraCtrl.add(this.settings, 'CameraPos');
        CameraCtrl.add(this.settings, 'Rotation');
        CameraCtrl.add(this.controls, 'enabled').name("OrbitControls Enabled");
        CameraCtrl.add(this.settings, 'Rotation1');
        CameraCtrl.add(this.settings, 'Rotation2');
        CameraCtrl.add(this.settings, 'Rotation3');

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
        let axes = new AxesHelper(-100);
        axes.position.set(0, 0, 0);
        this.scene.add(axes);
    }

    AddModel(Scene)
    {
        let model_Logo = [];
        let that = this;
        this.GLTFLoader.load("./model/Logo_p60_newnew.gltf", (gltf) =>
        {
            console.log(gltf);

            for (let i = 0; i < gltf.scene.children.length; i++)
            {
                model_Logo.push(new ModelPoint(gltf.scene.children[i], 0.025, "#00ABD1"));
                //model_Logo[i].geometry.position.set(0, 0, 0);
                model_Logo[i].geometry.scale.set(0.1, 0.1, 0.1);
                Scene.add(model_Logo[i].geometry);
            }
            that.models = (model_Logo);
            this.Expand();
            // console.log(that.models);
        });
    }

    DebugCameraInfo()
    {
        console.log(this.camera.position);
        console.log(this.camera.rotation);
        console.log(this.camera);
    }

    SetAnimation(index)
    {
        let path = [];
        if (index >= curIndex)
        {
            for (let i = curIndex; i <= index; i++)
            {
                // let isReject = i > 0;
                GetArrayItems(path, GetXYZArray(this.MovePath.MoveCurve.curves[i]));
            }
        }
        else if (index < curIndex)
        {
            for (let i = curIndex; i >= index; i--)
            {
                // let isReject = i < curIndex;
                GetArrayItems(path, GetXYZArray(this.MovePath.MoveCurve.curves[i]));
            }
        }

        // console.log(CurvePath.curves)
        //  path = GetXYZArray(CurvePath.curves[index]);

        useCameraCurveMove(this.camera, path, 5);
        CameraLookAtMove(this.MovePath.LookAtCurve.curves, index, this.camera);
        // this.CameraLookAtMove(this.MovePath.LookAtCurve.curves[index]);
        curIndex = index;
        console.log(curIndex);
    }

}

let _APP = null

window.addEventListener('DOMContentLoaded', () =>
{
    _APP = new NewScene()
})

function useCameraCurveMove(camera, path, duration, easing = "none")
{
    gsap.to(camera.position, {
        duration: duration,
        ease: easing,
        motionPath: {
            path: path
        }
    })
}

function CameraLookAtMove(curve, index, camera)
{
    console.log(curve, camera, index)
    index = 0;
    let curves = curve[index];
    // const points = curve.getPoints(500);
    let progress = {value: 0};
    let cam = camera;

    gsap.to(progress, {
        value: 1,
        duration: 5,
        overwrite: true,
        onUpdateParams: [progress],
        onUpdate({value})
        {
            let tempV3 = new THREE.Vector3();
            curves.getPoint(value, tempV3);
            // let lookat = new THREE.Vector3(0, 0, 0);
            // console.log(tempV3)
            cam.lookAt(tempV3);
        }
    });
}

function GetXYZArray(curve)
{
    console.log(curve);
    const path = [];
    // const points = curve.()
    for (let i = 0; i < curve.points.length; i++)
    {
        path.push({x: curve.points[i].x, y: curve.points[i].y, z: curve.points[i].z});
    }
    //
    // path.push({x: curve.v0.x, y: curve.v0.y, z: curve.v0.z});
    // path.push({x: curve.v1.x, y: curve.v1.y, z: curve.v1.z});
    // path.push({x: curve.v2.x, y: curve.v2.y, z: curve.v2.z});
    // path.push({x: curve.v3.x, y: curve.v3.y, z: curve.v3.z});

    return path;
}

function GetArrayItems(gArray, fromA)
{

    for (let i = 0; i < fromA.length; i++)
    {
        // if (isReject && i === 0)
        // {
        //     continue;
        // }
        gArray.push(fromA[i]);
    }
    return gArray;
}
