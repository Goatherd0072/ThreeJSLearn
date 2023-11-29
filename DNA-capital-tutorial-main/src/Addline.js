import * as THREE from 'three';

import * as GUI from 'dat.gui'

import {TransformControls} from 'three/examples/jsm/controls/TransformControls';
import * as dat from "dat.gui";

let container;
let camera, scene, renderer;
const splineHelperObjects = [];
let splinePointsLength = 4;
const positions = [];
const point = new THREE.Vector3();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const onUpPosition = new THREE.Vector2();
const onDownPosition = new THREE.Vector2();

const geometry = new THREE.BoxGeometry(1, 1, 1);
let transformControl;

const ARC_SEGMENTS = 200;

const splines = {};

const params = {
    uniform: true,
    tension: 0.5,
    centripetal: true,
    chordal: true,
    addPoint: addPoint,
    removePoint: removePoint,
    exportSpline: exportSpline,
};

export {AddLine};
var AddLine = function init(Scene, Container, Camera, Renderer, Controls)
{
    scene = Scene;
    container = Container;
    camera = Camera;

    const helper = new THREE.GridHelper(2, 100);
    helper.position.y = -199;
    helper.material.opacity = 0.25;
    helper.material.transparent = true;
    scene.add(helper);

    renderer = Renderer;

    const gui = new GUI.GUI();

    gui.add(params, 'uniform').onChange(render);
    gui.add(params, 'tension', 0, 1).step(0.01).onChange(function (value)
    {

        splines.uniform.tension = value;
        updateSplineOutline();
        render();

    });
    gui.add(params, 'centripetal').onChange(render);
    gui.add(params, 'chordal').onChange(render);
    gui.add(params, 'addPoint');
    gui.add(params, 'removePoint');
    gui.add(params, 'exportSpline');
    gui.close();

    let controls = Controls;

    transformControl = new TransformControls(camera, renderer.domElement);
    transformControl.addEventListener('change', render);
    transformControl.addEventListener('dragging-changed', function (event)
    {

        controls.enabled = !event.value;

    });
    // transformControl.size = (0.1);
    // transformControl.s
    scene.add(transformControl);

    transformControl.addEventListener('objectChange', function ()
    {

        updateSplineOutline();

    });

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointermove', onPointerMove);

    /*******
     * Curves
     *********/

    for (let i = 0; i < splinePointsLength; i++)
    {

        addSplineObject(positions[i]);

    }

    positions.length = 0;

    for (let i = 0; i < splinePointsLength; i++)
    {

        positions.push(splineHelperObjects[i].position);

    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3));

    let curve = new THREE.CatmullRomCurve3(positions);
    curve.curveType = 'catmullrom';
    curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
        color: 0xff0000,
        opacity: 0.35
    }));
    curve.mesh.castShadow = true;
    splines.uniform = curve;

    curve = new THREE.CatmullRomCurve3(positions);
    curve.curveType = 'centripetal';
    curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
        color: 0x00ff00,
        opacity: 0.35
    }));
    curve.mesh.castShadow = true;
    splines.centripetal = curve;

    curve = new THREE.CatmullRomCurve3(positions);
    curve.curveType = 'chordal';
    curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
        color: 0x0000ff,
        opacity: 0.35
    }));
    curve.mesh.castShadow = true;
    splines.chordal = curve;

    for (const k in splines)
    {

        const spline = splines[k];
        scene.add(spline.mesh);

    }

    load([
        new THREE.Vector3(6.303829280540356, -0.3241134915266819, -12.230508810485986),
        new THREE.Vector3(3.6595027237150775, 0.00783014282619332, 1.4490332874108454),
        new THREE.Vector3(0.08479965123167776, -1.3592394669421424, -28.249941694738066),
        new THREE.Vector3(0, 0, -50)]);

    render();

}

function addSplineObject(position)
{

    const material = new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff});
    const object = new THREE.Mesh(geometry, material);

    if (position)
    {

        object.position.copy(position);

    }
    else
    {

        object.position.copy(camera.position);
        // object.position.x = Math.random() * 5;
        // object.position.y = Math.random() * 5;
        // object.position.z = Math.random() * 5;
    }

    object.castShadow = true;
    object.receiveShadow = true;
    scene.add(object);
    splineHelperObjects.push(object);
    return object;

}

function addPoint()
{

    splinePointsLength++;

    positions.push(addSplineObject().position);

    updateSplineOutline();

    render();

}

function removePoint()
{

    if (splinePointsLength <= 2)
    {

        return;

    }

    const point = splineHelperObjects.pop();
    splinePointsLength--;
    positions.pop();

    if (transformControl.object === point) transformControl.detach();
    scene.remove(point);

    updateSplineOutline();

    render();

}

function updateSplineOutline()
{

    for (const k in splines)
    {

        const spline = splines[k];

        const splineMesh = spline.mesh;
        const position = splineMesh.geometry.attributes.position;

        for (let i = 0; i < ARC_SEGMENTS; i++)
        {

            const t = i / (ARC_SEGMENTS - 1);
            spline.getPoint(t, point);
            position.setXYZ(i, point.x, point.y, point.z);

        }

        position.needsUpdate = true;

    }

}

function exportSpline()
{

    const strplace = [];

    for (let i = 0; i < splinePointsLength; i++)
    {

        const p = splineHelperObjects[i].position;
        strplace.push(`new THREE.Vector3(${p.x}, ${p.y}, ${p.z})`);

    }

    console.log(strplace.join(',\n'));
    const code = '[' + (strplace.join(',\n\t')) + ']';
    prompt('copy and paste code', code);

}

function load(new_positions)
{

    while (new_positions.length > positions.length)
    {

        addPoint();

    }

    while (new_positions.length < positions.length)
    {

        removePoint();

    }

    for (let i = 0; i < positions.length; i++)
    {

        positions[i].copy(new_positions[i]);

    }

    updateSplineOutline();

}

function render()
{

    splines.uniform.mesh.visible = params.uniform;
    splines.centripetal.mesh.visible = params.centripetal;
    splines.chordal.mesh.visible = params.chordal;
    renderer.render(scene, camera);

}

function onPointerDown(event)
{

    onDownPosition.x = event.clientX;
    onDownPosition.y = event.clientY;

}

function onPointerUp(event)
{

    onUpPosition.x = event.clientX;
    onUpPosition.y = event.clientY;

    if (onDownPosition.distanceTo(onUpPosition) === 0)
    {

        transformControl.detach();
        render();

    }

}

function onPointerMove(event)
{

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(splineHelperObjects, false);

    if (intersects.length > 0)
    {

        const object = intersects[0].object;

        if (object !== transformControl.object)
        {

            transformControl.attach(object);

        }

    }

}
