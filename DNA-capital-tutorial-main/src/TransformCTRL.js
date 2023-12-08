import {TransformControls} from 'three/examples/jsm/controls/TransformControls';
import * as THREE from 'three'

const initTransformControls = function (camera, renderer, scene, orbit = null)
{
    const controls = new TransformControls(camera, renderer.domElement);
    controls.addEventListener('dragging-changed', function (event)
    {
        // orbitControls.enabled = !event.value;
    });
    scene.add(controls);


    if (orbit)
    {
        controls.addEventListener('dragging-changed', function (event)
        {
            orbit.enabled = !event.value;
        });
    }

    window.addEventListener('keydown', function (event)
    {

        switch (event.keyCode)
        {

            case 81: // Q
                controls.setSpace(controls.space === 'local' ? 'world' : 'local');
                break;

            case 16: // Shift
                controls.setTranslationSnap(100);
                controls.setRotationSnap(THREE.MathUtils.degToRad(15));
                controls.setScaleSnap(0.25);
                break;

            case 87: // W
                controls.setMode('translate');
                break;

            case 69: // E
                controls.setMode('rotate');
                break;

            case 82: // R
                controls.setMode('scale');
                break;

            case 187:
            case 107: // +, =, num+
                controls.setSize(control.size + 0.1);
                break;

            case 189:
            case 109: // -, _, num-
                controls.setSize(Math.max(control.size - 0.1, 0.1));
                break;

            case 88: // X
                controls.showX = !controls.showX;
                break;

            case 89: // Y
                controls.showY = !controls.showY;
                break;

            case 90: // Z
                controls.showZ = !control.showZ;
                break;

            case 32: // Spacebar
                controls.enabled = !control.enabled;
                break;

            case 27: // Esc
                controls.reset();
                break;

        }

    });

    return controls;
}

export {initTransformControls}
