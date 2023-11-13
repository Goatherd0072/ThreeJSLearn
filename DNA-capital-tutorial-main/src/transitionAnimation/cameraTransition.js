import * as THREE from "three";
import gsap from "gsap";
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

/**
* 相机移动到目标位置
* @param easing 渐入渐出效果详见：https://gsap.com/resources/getting-started/Easing
*/
var useCameraMove = function moveTo(camera, pos, lookAt, duration, easing = "none"){
    gsap.to(camera.position, {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        duration: duration,
        ease: easing,
        onUpdate(){
            camera.lookAt(lookAt);
        }
    })
}
export {useCameraMove};

/**
 * 贝塞尔曲线运动
 */
var useCameraBezierMove = function bezierMoveTo(camera, path, lookAt, duration, easing = "none"){
    gsap.to(camera.position, {
        duration: duration,
        ease: easing,
        motionPath: {
            path: path,
            type: "cubic"               //贝塞尔曲线方法
        },
        onUpdate: () => {
            camera.lookAt(lookAt)
        }
      })
}
export {useCameraBezierMove};

/**
 * 曲线运动
 */
var useCameraCurveMove = function curveMoveTo(camera, path, lookAt, duration, easing = "none"){
    gsap.to(camera.position, {
        duration: duration,
        ease: easing,
        motionPath: {
            path: path
        },
        onUpdate: () => {
            camera.lookAt(lookAt)
        }
      })
}
export {useCameraCurveMove};