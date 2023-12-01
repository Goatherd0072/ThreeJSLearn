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
import {BokehPass, BokehDepthShader} from 'three/examples/jsm/postprocessing/BokehPass';

const canvas = document.querySelector('.webgl')
const interval = 50;
const duration = 5;
let isExpand = false;
let curIndex = 0;
const timeline = gsap.timeline({paused: true})
let effect;
const dir = {
    isUp: false,
    isDown: false,
    isRight: false,
    isLeft: false,
    isForward: false,
    isBack: false,
    isTargetUp: false,
    isTargetDown: false,
    isTargetRight: false,
    isTargetLeft: false,
    isTargetForward: false,
    isTargetBack: false
}
let camCtrlEnable = false;

class LogoAnimation
{
    constructor()
    {
        this._Init()
    }

    _Init()
    {
        let that = this;
        rigistGSAPPlugin();

        this.scene = new THREE.Scene()
        this.GLTFLoader = new GLTFLoader();
        this.models = [];
        this.AddModel(this.scene);
        this.target = (new THREE.Mesh(
            (new THREE.SphereGeometry(1)),
            (new THREE.MeshBasicMaterial({color: "#ff00aa"}))));
        this.scene.add(this.target);
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

        document.addEventListener('keydown', (e) =>
        {
            if (e.defaultPrevented)
            {
                console.log("return")
                return;
            }
            if (!e.repeat)
            {
                // console.log(e.key)
                that.doMoveEvent(e, true);
            }
            else
            {
            }
        });
        document.addEventListener('keyup', (e) =>
        {
            if (e.defaultPrevented)
            {
                console.log("return")
                return;
            }
            if (!e.repeat)
            {
                that.doMoveEvent(e, false);
            }
            else
            {
            }
        });

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
        this.depthShader = BokehDepthShader;
        this.renderScene = new RenderPass(this.scene, this.camera)
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(0, 0), 1.5, 0.9, 0.05);
        // this.customPass = new ShaderPass(AberrationShader)
        this.composer = new EffectComposer(this.renderer)
        this.bokehPass = new BokehPass(this.scene, this.camera, {
            focus: 0, // 聚焦
            aspect: this.camera.aspect,
            aperture: 0.000005, // 孔径
            maxblur: 1,
            width: window.innerWidth,
            height: window.innerHeight
        });


        this.composer.addPass(this.renderScene)
        // this.composer.addPass(this.customPass)

        this.composer.addPass(this.bloomPass)
        this.composer.addPass(this.bokehPass);
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
        //     ][new THREE.Vector3(-11.764421951009506, 23.56679034773233, -157.85471560183635),
        // 	new THREE.Vector3(196.46045616681047, 13.667270218675487, 168.65084080766593),
        // 	new THREE.Vector3(-10.238224083296704, 3.454664375850792, -89.35277153823496)]
        // )
        const curveL1 = new THREE.CatmullRomCurve3(
            [
                new THREE.Vector3(-11.764421951009506, 23.56679034773233, -157.85471560183635),
                // new THREE.Vector3(196.46045616681047, 103.667270218675487, 168.65084080766593),
                new THREE.Vector3(-10.238224083296704, 3.454664375850792, -89.35277153823496)]);

        const curveL2 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-10.238224083296704, 3.454664375850792, -89.35277153823496),
            new THREE.Vector3(4.545299292331766, 10.678384811611359, -95.06212910904628),
            new THREE.Vector3(-11.259624865955395, -3.8823521779072965, -101.33130441452205)]);

        const curveL3 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-11.227102439344371, -3.882356720174405, -101.22293834326538),
            new THREE.Vector3(-201.1437509297759, -35.14372495646582, -164.94534870709504),
            new THREE.Vector3(-85.72703198897776, 30.892873019671924, -254.4092195725853),
            new THREE.Vector3(-11.68128773580167, 13.20311004398334, -158.75545730000857)]);

        const curveL4 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-12.604783626060788, 13.222477239153294, -159.21447284860764),
            new THREE.Vector3(-12.604783626060788, 13.222477239153294, -159.21447284860764),
            new THREE.Vector3(-5.638305616952007, -14.065584339407454, -107.33798625314107)
        ]);

        const curveL5 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-5.638305616952007, -14.065584339407454, -107.33798625314107),
            new THREE.Vector3(-5.638305616952007, -14.065584339407454, -107.33798625314107),
            new THREE.Vector3(0, 0, 0)
        ]);

        const curveL6 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 0)
        ])

        CurvePath_Lookat.add(curveL1);
        CurvePath_Lookat.add(curveL2);
        CurvePath_Lookat.add(curveL3);
        CurvePath_Lookat.add(curveL4);
        CurvePath_Lookat.add(curveL5);
        CurvePath_Lookat.add(curveL6);

        const pointsL = CurvePath_Lookat.getPoints(500);
        const pathMeshL = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsL), new THREE.LineBasicMaterial({color: "#c6d410"}));


        const curve1 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-17.351256758347148, -87.27859245064224, -166.38835132132087),
            // new THREE.Vector3(27.02787540231489, -24.64524022022103, -74.2897430552669),
            new THREE.Vector3(-33.14287931466795, 87.27446416382537, -26.35586926120866)]);

        const curve2 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-33.14287931466795, 87.27446416382537, -26.35586926120866),
            new THREE.Vector3(-20.14287931466795, 17.27446416382537, -26.35586926120866),
            new THREE.Vector3(10.507031558253656, -95.18624508405821, -179.7973974327407)
        ])
        const curve3 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(10.507031558253656, -95.18624508405821, -179.7973974327407),
            new THREE.Vector3(-42.85347491819384, -78.30157126120932, -203.70369017597457),
            new THREE.Vector3(-10.818613219302247, 121.31903628418618, -158.1799361215729)
        ])
        const curve4 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-12.604720077994253, 129.09296855107493, -159.21438291676546),
            new THREE.Vector3(-12.604720077994253, 129.09296855107493, -159.21438291676546),
            new THREE.Vector3(-29.226864629424043, 93.49930750749509, -52.64032678071544)
        ]);
        const curve5 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-29.226864629424043, 93.49930750749509, -52.64032678071544),
            new THREE.Vector3(-29.226864629424043, 93.49930750749509, -52.64032678071544),
            new THREE.Vector3(0, 0, 450)
        ])
        const curve6 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 450),
            new THREE.Vector3(0, 0, 450),
            new THREE.Vector3(0, 0, 450)
        ])

        // Move Line

        const points = CurvePath.getPoints(500);
        const pathMesh = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({color: 0x00ffff}));
        // this.scene.add(pathMeshL);
        // this.scene.add(pathMesh);
        const points1 = curve1.getPoints(500);
        const pathMesh1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points1), new THREE.LineBasicMaterial({color: '#00ffff'}));
        const points2 = curveL1.getPoints(500);
        const pathMesh2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points2), new THREE.LineBasicMaterial({color: '#f4e001'}));
        this.scene.add(pathMesh1);
        this.scene.add(pathMesh2);
        const points3 = curve2.getPoints(500);
        const pathMesh3 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points1), new THREE.LineBasicMaterial({color: '#00ffff'}));
        const points4 = curveL2.getPoints(500);
        const pathMesh5 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points2), new THREE.LineBasicMaterial({color: '#f4e001'}));
        this.scene.add(pathMesh3);
        this.scene.add(pathMesh5);

        let moveP = GetXYZArray(GetPathArray(this.MovePath.MoveCurve));
        let lookP = (GetPathArray(this.MovePath.LookAtCurve));

        console.log(moveP);
        // console.log(moveP);
        // exportSpline(lookP);
        // const CamPath = {
        //     MoveCurve: [
        //         {
        //             "x": -18.630205576939236, "y": 3.174001195723268, "z": -45.492953175042096
        //         }, {
        //             "x": -15.840320969469527, "y": -2.6952578069203037, "z": -38.23333225190104
        //         }, {
        //             "x": 3.6724346806386032, "y": -3.8010129279502953, "z": -22.457352490864338
        //         }, {
        //             "x": 27.373249169653516, "y": 0.8586995416909649, "z": -25.758425932212745
        //         }, {
        //             "x": 9.909582401881716, "y": 4.855838497697632, "z": -9.01427271125332
        //         }, {
        //             "x": -3.72108146588562, "y": 4.847023905775702, "z": 0.9647526520987912
        //         }, {
        //             "x": -29.55174112366012, "y": 1.9736646378644251, "z": 10.59882117230553
        //         }, {
        //             "x": -26.733974751625517, "y": 0.9504425493265393, "z": 26.557956098924738
        //         }, {
        //             "x": -15.763990762772277, "y": 0.9337524736442688, "z": 39.31175959601513
        //         }, {
        //             "x": 0, "y": 0, "z": 50
        //         }],
        //     LookAtCurve: new THREE.CatmullRomCurve3([new THREE.Vector3(-1.5216947019223503, 1.9934981561189686, -30.719796594891754),
        //         new THREE.Vector3(-3.7254810456497323, 0.7645521694115653, -25.6455492797792),
        //         new THREE.Vector3(-4.850371170770711, -0.7081444126282042, -22.801151618538267),
        //         new THREE.Vector3(-6.100595920156753, -1.3050611269527588, -19.900969537728894),
        //         new THREE.Vector3(-6.100595920156753, -1.3050611269527588, -19.900969537728894),
        //         new THREE.Vector3(-2.0159467333131094, 10.849080805653575, -24.162092382730552),
        //         new THREE.Vector3(10.990080214548204, 9.282728930241298, -17.519053022510647),
        //         new THREE.Vector3(6.303829280540356, -0.3241134915266819, -12.456649845418182),
        //         new THREE.Vector3(6.303829280540356, -0.3241134915266819, -12.456649845418182),
        //         new THREE.Vector3(-36.87442966713062, -25.08096271089035, -25.819144628168452),
        //         new THREE.Vector3(-47.273211458383166, -14.21024783407686, -46.12534810140365),
        //         new THREE.Vector3(-31.091570506994728, -6.701073758943924, -50.967750131548186),
        //         new THREE.Vector3(0, 0, -50)])
        // };
        //
        // moveP = CamPath.MoveCurve;
        // lookP = CamPath.LookAtCurve;
        // console.log(moveP);
        // exportSpline(lookP);
        function exportSpline(Curve3)
        {

            const strplace = [];

            for (let i = 0; i < Curve3.points.length; i++)
            {

                const p = Curve3.points[i];
                // strplace.push(`new THREE.Vector3(${p.x}, ${p.y}, ${p.z})`);
                strplace.push(`{"x":${p.x},"y":${p.y},"z":${p.z}}`);
            }

            // console.log(strplace.join(',\n'));
            const code = '[' + (strplace.join(',\n\t')) + ']';
            // prompt('copy and paste code', code);
            console.log(code);
        }

        // exportSpline(curve1);
        // exportSpline(curve2);
        // exportSpline(curve3);
        // exportSpline(curve4);
        // exportSpline(curve5);


        let moveP1 = GetXYZArray((curve1));
        let lookP1 = curveL1;
        let moveP2 = GetXYZArray((curve2));
        let lookP2 = curveL2;
        let moveP3 = GetXYZArray((curve3));
        let lookP3 = curveL3;
        let moveP4 = GetXYZArray((curve4));
        let lookP4 = curveL4;
        let moveP5 = GetXYZArray((curve5));
        let lookP5 = curveL5;

        const cam = this.camera;
        timeline.to(cam.position, {
            duration: 10,
            ease: "none",
            motionPath: {
                path: moveP1
            },
            onUpdate()
            {
                // console.log(this.progress());
                let tempV3 = new THREE.Vector3();
                lookP1.getPoint(this.progress(), tempV3);
                console.log(tempV3)
                cam.lookAt(tempV3);
            },
        }, 0);

        timeline.to(cam.position, {
            duration: 10,
            ease: "none",
            motionPath: {
                path: moveP2
            },
            onUpdate()
            {
                // console.log(this.progress());
                let tempV3 = new THREE.Vector3();
                lookP2.getPoint(this.progress(), tempV3);
                console.log(tempV3)
                cam.lookAt(tempV3);
            },
        }, 10);

        timeline.to(cam.position, {
            duration: 10,
            ease: "none",
            motionPath: {
                path: moveP3
            },
            onUpdate()
            {
                // console.log(this.progress());
                let tempV3 = new THREE.Vector3();
                lookP3.getPoint(this.progress(), tempV3);
                console.log(tempV3)
                cam.lookAt(tempV3);
            },
        }, 20);

        timeline.to(cam.position, {
            duration: 10,
            ease: "none",
            motionPath: {
                path: moveP4
            },
            onUpdate()
            {
                // console.log(this.progress());
                let tempV3 = new THREE.Vector3();
                lookP4.getPoint(this.progress(), tempV3);
                console.log(tempV3)
                cam.lookAt(tempV3);
            },
        }, 30);

        timeline.to(cam.position, {
            duration: 10,
            ease: "none",
            motionPath: {
                path: moveP5
            },
            onUpdate()
            {
                // console.log(this.progress());
                let tempV3 = new THREE.Vector3();
                lookP5.getPoint(this.progress(), tempV3);
                console.log(tempV3)
                cam.lookAt(tempV3);
            },
        }, 40);


        // timeline.addPause(2.5);
        // timeline.addPause(5);
        // timeline.addPause(7.5);
        // timeline.addPause(10);
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
        this.camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 1, 100000)
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
        this.camera.position.set(26.65614, -18.40766, -77.79627);
        this.camera.lookAt(new THREE.Vector3(-11.359254285677226, 18.22751993117231, -139.66914914670443));
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
        const that = this;
        this.settings = {
            enabled: false,
            progress: 0.0,
            bloomStrength: 0.9,
            bloomRadius: 0.63,
            bloomThreshold: 0.2,
            focus: 500.0,
            aperture: 5,
            maxblur: 0.01,
            restore: this.Restore.bind(this),
            ExpandOrFold: () =>
            {
                ExpandOrFold(that, isExpand);
            },
            CamCtrlEnable: () =>
            {
                timeline.seek(0);
            },
            OrbitCtrl: () =>
            {
                that.controls.enabled = !that.controls.enabled;
                camCtrlEnable = false
            },
            CameraPos: this.DebugCameraInfo.bind(this),
            TimeLineProgess: () =>
            {
                console.log(timeline.progress());
            },
            Rotation: 1,
            Rotation1: 1,
            Rotation2: this.SetAnimation.bind(this, 1),
            Rotation3: this.SetAnimation.bind(this, 2),
            Timeline1: () =>
            {
                SetTimeLineAni(0);
            },
            Timeline2: () =>
            {
                SetTimeLineAni(0.25);
            },
            Timeline3: () =>
            {
                SetTimeLineAni(0.75);
            },
            TimeLine4: () =>
            {
                SetTimeLineAni(1);
            },
            TimeLine5: 0,
            SetPointSize: () =>
            {
                that.models.forEach((value) =>
                {
                    let size = 0.1;
                    if (value.geometry.scale.x === 0.5)
                    {
                        size = 1;
                    }
                    else
                    {
                        size = 0.1;
                    }


                    // value.geometry.scale.set(size, size, size);
                    // value.geometry.scale.set(0.5, 0.5, 0.5)
                })
            }

        }
        this.gui = new dat.GUI();
        let post = this.gui.addFolder('PostProcessing');
        let CameraCtrl = this.gui.addFolder('CameraCtrl');
        post.add(this.settings, 'enabled').name("Post Enabled")
        post.add(this.settings, 'bloomStrength', 0, 10, 0.01)
        post.add(this.settings, 'bloomRadius', 0, 10, 0.01)
        post.add(this.settings, 'bloomThreshold', 0, 10, 0.01)
        post.add(this.settings, 'focus')
        post.add(this.settings, 'aperture')
        post.add(this.settings, 'maxblur')
        CameraCtrl.add(this.settings, 'ExpandOrFold');
        CameraCtrl.add(this.settings, 'CameraPos');
        CameraCtrl.add(this.settings, 'CamCtrlEnable').name("CamControls Enabled");
        CameraCtrl.add(this.settings, 'OrbitCtrl').name("OrbitControls Enabled");
        CameraCtrl.add(this.settings, 'Rotation1', 0, 360, 0.01).onChange((value) =>
        {
            that.camera.rotation.y = value;
        });

        CameraCtrl.add(this.settings, 'Rotation2');
        CameraCtrl.add(this.settings, 'Rotation3');
        CameraCtrl.open();

        CameraCtrl.add(this.settings, 'Timeline1');
        CameraCtrl.add(this.settings, 'Timeline2');
        CameraCtrl.add(this.settings, 'Timeline3');
        CameraCtrl.add(this.settings, 'TimeLine4');
        CameraCtrl.add(this.settings, 'TimeLine5', 0, 1, 0.000001).onChange((value) =>
        {
            that.controls.enabled = false;
            SetTimeLineAni(value);
        });
        CameraCtrl.add(this.settings, 'TimeLineProgess');
        let PointCtrl = this.gui.addFolder('PointCtrl');
        PointCtrl.add(this.settings, 'SetPointSize');


        // this.gui.add(this.camera, 'fov', 1, 180, 0.01);
        // this.gui.add(this.model_Logos,"z",0,100,0.01);

    }

    InitControls()
    {
        this.controls = new OrbitControls(this.camera, canvas)
        this.controls.enableDamping = true
        this.controls.enabled = false;
        this.controls.keys = {
            LEFT: 'ArrowLeft', //left arrow
            UP: 'ArrowUp', // up arrow
            RIGHT: 'ArrowRight', // right arrow
            BOTTOM: 'ArrowDown' // down arrow
        }
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
            this.cameraMove()
            if (this.settings.enabled)
            {
                this.bloomPass.threshold = this.settings.bloomThreshold
                this.bloomPass.strength = this.settings.bloomStrength
                this.bloomPass.radius = this.settings.bloomRadius
                this.bokehPass.uniforms['focus'].value = this.settings.focus
                this.bokehPass.uniforms['aperture'].value = this.settings.aperture * 0.00001
                this.bokehPass.uniforms['maxblur'].value = this.settings.maxblur
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
                this.controls.target = this.target.position;
            }
            this.Update()
        })
    }

    initAxes()
    {
        let axes = new AxesHelper(-500);
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
                model_Logo[i].geometry.scale.set(1, 1, 1);
                Scene.add(model_Logo[i].geometry);
            }
            that.models = (model_Logo);
            ExpandOrFold(that, false);
            // console.log(that.models);
        });
    }

    DebugCameraInfo()
    {
        console.log("camPos")
        console.log(this.camera.position);
        console.log("camLook");
        console.log(this.camera.getWorldDirection(new THREE.Vector3()));
        console.log("targetPos");
        console.log(this.target.position);
        console.log(this.camera);
    }

    SetAnimation(index)
    {
        let path_M = [];
        let path_L = [];
        let isReverse = false;

        if (index >= curIndex)
        {
            for (let i = curIndex; i <= index; i++)
            {
                // let isReject = i > 0;
                GetArrayItems(path_M, GetXYZArray(this.MovePath.MoveCurve.curves[i]));
                GetArrayItems(path_L, this.MovePath.LookAtCurve.curves[i].getPoints(this.MovePath.LookAtCurve.curves[i].points.length));
            }
            isReverse = false;
        }
        else if (index < curIndex)
        {
            for (let i = curIndex; i >= index; i--)
            {
                // let isReject = i < curIndex;
                GetArrayItems(path_M, GetXYZArray(this.MovePath.MoveCurve.curves[i]));
                GetArrayItems(path_L, this.MovePath.LookAtCurve.curves[i].getPoints(this.MovePath.LookAtCurve.curves[i].points.length));
            }
            isReverse = true;
        }

        // console.log(CurvePath.curves)
        //  path_M = GetXYZArray(CurvePath.curves[index]);
        console.log(path_L)
        let MoveA = useCameraCurveMove(this.camera, path_M, 5);
        let LookA = CameraLookAtMove(this.camera, path_L, 5, isReverse);
        // this.CameraLookAtMove(this.MovePath.LookAtCurve.curves[index]);
        curIndex = index;
        console.log(curIndex);

        return [MoveA, LookA];
    }

    cameraMove()
    {
        if (dir.isTargetForward)
        {
            this.target.translateZ(-2);
        }
        if (dir.isTargetBack)
        {
            this.target.translateZ(2);
        }
        if (dir.isTargetUp)
        {
            this.target.translateY(2);
            //mainCamera.rotateX(THREE.MathUtils.degToRad(1));
        }
        if (dir.isTargetDown)
        {
            this.target.translateY(-2);
            //mainCamera.rotateX(-THREE.MathUtils.degToRad(1));
        }
        if (dir.isTargetLeft)
        {
            this.target.translateX(2);
            // mainCamera.rotateY(THREE.MathUtils.degToRad(1));
        }
        if (dir.isTargetRight)
        {
            this.target.translateX(-2);
            // mainCamera.rotateY(-THREE.MathUtils.degToRad(1));
        }
        //this.camera.lookAt(this.target.position);
    }

    doMoveEvent(e, isKeyDown)
    {
        // console.log(`${e.key} [事件${isKeyDown ? 'KeyDown' : 'KeyUp'}]`)
        switch (e.key)
        {
            case 'w':
                dir.isForward = isKeyDown;
                break;
            case 's':
                dir.isBack = isKeyDown;
                break;
            case 'a':
                dir.isLeft = isKeyDown;
                break;
            case 'd':
                dir.isRight = isKeyDown;
                break;
            case 'q':
                dir.isUp = isKeyDown;
                break;
            case 'e':
                dir.isDown = isKeyDown;
                break;
            case 'ArrowUp':
                dir.isTargetForward = isKeyDown;
                break;
            case 'ArrowDown':
                dir.isTargetBack = isKeyDown;
                break;
            case 'ArrowLeft':
                dir.isTargetLeft = isKeyDown;
                break;
            case 'ArrowRight':
                dir.isTargetRight = isKeyDown;
                break;
            case '0':
                dir.isTargetUp = isKeyDown;
                break;
            case '1':
                dir.isTargetDown = isKeyDown;
                break;
        }
    }

}

let _APP = null

window
    .addEventListener('DOMContentLoaded', () =>
    {
        _APP = new LogoAnimation()
    })

function GetPathArray(curvePath)
{
    let path = [];
    for (let i = 0; i < curvePath.curves.length; i++)
    {
        for (let j = 0; j < curvePath.curves[i].points.length; j++)
        {
            path.push(curvePath.curves[i].points[j]);
        }
        // path.push(curvePath.curves[i]);
    }
    // return path;
    return new THREE.CatmullRomCurve3(path);
}

function useCameraCurveMove(camera, path, duration, easing = "expo.inOut")
{
    console.log(camera)
    return gsap.to(camera.position, {
        duration: duration, ease: easing, overwrite: true, // paused: true,
        motionPath: {
            path: path
        }
    });
}

function CameraLookAtMove(camera, curve, duration, isReverse = false)
{
    let curves = new THREE.CatmullRomCurve3(curve);
    let progress = {value: isReverse ? 1 : 0};
    let cam = camera;

    return gsap.to(progress, {
        value: isReverse ? 0 : 1, duration: duration, overwrite: true, ease: "power4.inOut", // paused: true,
        onUpdateParams: [progress], // onStart()
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

/**
 * 展开或复位Logo模型
 * @param logoAni 传入 LogoAnimation类的实列
 * @param isNotExpand 是否展开
 */
function ExpandOrFold(logoAni, isNotExpand)
{
    let size = 25.0;
    if (isNotExpand)
    {
        size = 100.0;
    }
    // console.log(logoAni.models[0].geometry.material.uniforms)
    // value.geometry.scale.set(size, size, size);

    for (let i = 0; i < logoAni.models.length; i++)
    {
        gsap.to(logoAni.models[i].geometry.position, {
            duration: 1,
            z: isNotExpand ? 0 : -(3 - i) * interval
        });
        gsap.to(logoAni.models[i].geometry.material.uniforms.pointSize,
            {
                duration: 1,
                value: size
            });
        // gsap.to(logoAni.models[i].geometry.scale,
        //     {
        //         duration: 1,
        //         x: size, y: size, z: size
        //     });
    }
    isExpand = !isExpand;
}

/**
 * 相机移动到传入进度的位置
 * @param to 动画在时间的位置0-1
 */
function SetTimeLineAni(to)
{
    const progress = {value: 0};
    gsap.fromTo(progress, {value: timeline.progress()}, {
        value: to, duration: 3, onUpdateParams: [progress], onUpdate({value})
        {
            timeline.progress(value);
        },
        // onComplete()
        // {
        //     ExpandOrFold(_APP, true);
        // },
        // onStart()
        // {
        //     ExpandOrFold(_APP, false);
        // }
    });
}