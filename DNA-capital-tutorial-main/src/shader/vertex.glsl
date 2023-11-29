uniform float u_time;
varying vec2 vUv;
varying float vColorRandom;
varying vec3 vPosition;//need
uniform sampler2D texture1;//need
uniform float pointSize;

float PI = 3.141592653589793238;

attribute float randoms;
attribute float colorRandoms;


void main() {
    vUv = uv;
    vColorRandom = colorRandoms;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
    gl_PointSize = (30. * randoms + 5.) * (1.0 / -mvPosition.z) * pointSize;
    //    gl_PointSize = 10.0;
    gl_Position = projectionMatrix * mvPosition;
}