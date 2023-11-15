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
const timeline = gsap.timeline({paused: true})

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
        this.InitCamera();
        this.InitLineData();

        this.InitRenderer()
        this.InitPostProcessing()
        this.InitLights()
        this.InitControls()
        this.Update()
        this.initAxes();
        this.InitSettings();


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
            new THREE.Vector3(-1.5216947019223503, 1.9934981561189686, -30.719796594891754),
            new THREE.Vector3(-3.7254810456497323, 0.7645521694115653, -25.6455492797792),
            new THREE.Vector3(-4.850371170770711, -0.7081444126282042, -22.801151618538267),
            new THREE.Vector3(-6.100595920156753, -1.3050611269527588, -19.900969537728894)]);

        const curveL2 = new THREE.CatmullRomCurve3(
            [
                new THREE.Vector3(-6.100595920156753, -1.3050611269527588, -19.900969537728894),
                new THREE.Vector3(-2.0159467333131094, 10.849080805653575, -24.162092382730552),
                new THREE.Vector3(10.990080214548204, 9.282728930241298, -17.519053022510647),
                new THREE.Vector3(6.303829280540356, -0.3241134915266819, -12.456649845418182)]);

        const curveL3 = new THREE.CatmullRomCurve3(
            [
                new THREE.Vector3(6.303829280540356, -0.3241134915266819, -12.456649845418182),
                new THREE.Vector3(-36.87442966713062, -25.08096271089035, -25.819144628168452),
                new THREE.Vector3(-47.273211458383166, -14.21024783407686, -46.12534810140365),
                new THREE.Vector3(-31.091570506994728, -6.701073758943924, -50.967750131548186),
                new THREE.Vector3(0, 0, -50)]
        );

        CurvePath_Lookat.add(curveL1);
        CurvePath_Lookat.add(curveL2);
        CurvePath_Lookat.add(curveL3);
        const pointsL = CurvePath_Lookat.getPoints(500);
        const pathMeshL = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsL), new THREE.LineBasicMaterial({color: "#c6d410"}));


        const curve1 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-18.630205576939236, 3.174001195723268, -45.492953175042096),
            new THREE.Vector3(-15.840320969469527, -2.6952578069203037, -38.23333225190104),
            new THREE.Vector3(3.6724346806386032, -3.8010129279502953, -22.457352490864338),
            new THREE.Vector3(27.373249169653516, 0.8586995416909649, -25.758425932212745)]);

        const curve2 = new THREE.CatmullRomCurve3(
            [
                new THREE.Vector3(27.373249169653516, 0.8586995416909649, -25.758425932212745),
                new THREE.Vector3(9.909582401881716, 4.855838497697632, -9.01427271125332),
                new THREE.Vector3(-3.72108146588562, 4.847023905775702, 0.9647526520987912),
                new THREE.Vector3(-29.55174112366012, 1.9736646378644251, 10.59882117230553)]
        )
        const curve3 = new THREE.CatmullRomCurve3(
            [
                new THREE.Vector3(-29.55174112366012, 1.9736646378644251, 10.59882117230553),
                new THREE.Vector3(-26.733974751625517, 0.9504425493265393, 26.557956098924738),
                new THREE.Vector3(-15.763990762772277, 0.9337524736442688, 39.31175959601513),
                new THREE.Vector3(0, 0, 50)]
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
        this.scene.add(pathMeshL);
        this.scene.add(pathMesh);

        let aniArray = this.SetAnimation(0);
        console.log( aniArray[0]);
        timeline.add(aniArray[0], 0);
        timeline.add(aniArray[1], 0);

        console.log(timeline)
        window.addEventListener("click",()=>{

        })
        // timeline.play();
        // Timeline
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
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.render(this.scene, this.camera)
    }

    InitCamera()
    {
        this.camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 1, 1000)
        // this.camera = new THREE.OrthographicCamera(-window.innerWidth, window.innerWidth, window.innerHeight, -window.innerHeight, 0.1, 1000)
        // this.camera.viewport = new THREE.Vector4(0, 0, 1000, 1000)
        // this.camera.position.set(0, 0, 50)//
        // this.camera.position.set(CameraPos[3].pos.x, CameraPos[3].pos.y, CameraPos[3].pos.z);
        // this.camera.lookAt(0, 0, -15);
        // this.camera.position.set(-1, 3, -50)
        // let camPos = this.MovePath.MoveCurve.curves[0].getPoint(0);
        // let camLook = this.MovePath.LookAtCurve.curves[0].getPoint(0);
        // console.log(camPos, camLook);
        this.scene.add(this.camera)
        this.camera.position.set(-18.630205576939236, 3.174001195723268, -45.492953175042096);
        this.camera.lookAt(-1.5216947019223503, 1.9934981561189686, -30.719796594891754);
        // this.camera.position.set(-4.388497130267792, 2.8820619964812373, -50.870941259502025);
        // this.camera.lookAt(0, 0, -15);

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
            LookAt1: () =>
            {
                this.camera.lookAt(0, 0, -15);
            },
            LookAt2: () =>
            {
                this.camera.lookAt(0, 0, -55);
            },
            LookAt3: () =>
            {
                this.camera.lookAt(0, 0, -100);
            },
            Timeline1: () =>
            {
                console.log(timeline);
                timeline.play();
            }

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
        CameraCtrl.add(this.controls, 'enabled').name("OrbitControls Enabled");
        CameraCtrl.add(this.settings, 'Rotation1');
        CameraCtrl.add(this.settings, 'Rotation2');
        CameraCtrl.add(this.settings, 'Rotation3');
        CameraCtrl.open();

        CameraCtrl.add(this.settings, 'Timeline1');


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
        // let width = canvas.width;
        // let height = canvas.height;
        let width = window.innerWidth;
        let height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
        // this.camera.aspect = window.innerWidth / window.innerHeight
        // this.camera.updateProjectionMatrix()
        // this.renderer.setSize(window.innerWidth, window.innerHeight)
        // this.composer.setSize(window.innerWidth, window.innerHeight)
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
        let path_M = [];
        let path_L = [];

        if (index >= curIndex)
        {
            for (let i = curIndex; i <= index; i++)
            {
                // let isReject = i > 0;
                GetArrayItems(path_M, GetXYZArray(this.MovePath.MoveCurve.curves[i]));
                path_L = this.MovePath.LookAtCurve.curves[i].getPoints(this.MovePath.LookAtCurve.curves[i].getLength())
            }
        }
        else if (index < curIndex)
        {
            for (let i = curIndex; i >= index; i--)
            {
                // let isReject = i < curIndex;
                GetArrayItems(path_M, GetXYZArray(this.MovePath.MoveCurve.curves[i]));
                path_L = this.MovePath.LookAtCurve.curves[i].getPoints(this.MovePath.LookAtCurve.curves[i].getLength());
            }
        }

        // console.log(CurvePath.curves)
        //  path_M = GetXYZArray(CurvePath.curves[index]);

        let MoveA = useCameraCurveMove(this.camera, path_M, 5);
        let LookA = CameraLookAtMove(this.camera, path_L, 5);
        // this.CameraLookAtMove(this.MovePath.LookAtCurve.curves[index]);
        curIndex = index;
        console.log(curIndex);

        return [MoveA, LookA];
    }

}

let _APP = null

window.addEventListener('DOMContentLoaded', () =>
{
    _APP = new NewScene()
})

function useCameraCurveMove(camera, path, duration, easing = "expo.inOut")
{
    console.log(camera)
    return gsap.to(camera.position, {
        duration: duration,
        ease: easing,
        overwrite: true,
        // paused: true,
        motionPath: {
            path: path
        }
    });
}

function CameraLookAtMove(camera, curve, duration)
{
    let curves = new THREE.CatmullRomCurve3(curve);
    let progress = {value: 0};
    let cam = camera;

    return gsap.to(progress, {
        value: 1,
        duration: duration,
        overwrite: true,
        ease: "power4.inOut",
        // paused: true,
        onUpdateParams: [progress],
        // onStart()
        // {
        //     console.log(curves);
        //     let al = new THREE.Vector3();
        //     curves.getPoint(0.45, al);
        //     console.log(al);
        // },
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
