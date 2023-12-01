uniform float u_time;
varying vec2 vUv;
varying float vColorRandom;
varying vec3 vPosition;//need
varying float fogDepth;//need

uniform sampler2D texture1;//need
uniform float pointSize;
uniform float focalDistance;
uniform float aperture;

float PI = 3.141592653589793238;

attribute float randoms;
attribute float colorRandoms;


void main() {
    vUv = uv;
    vColorRandom = colorRandoms;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
    float fdAlpha = 0.18;

    float distanceToCamera = -mvPosition.z;
    float fD = mix(focalDistance, 50.0, fdAlpha);
    float CoC = distance(distanceToCamera, fD);

    float ap = mix(aperture, 200.0, fdAlpha);
    float depth = 1.0 - smoothstep(0.0, ap, CoC);
    float size = pointSize;
    size = mix(size / 4.0, size, 1.0 - depth);

    float near = mix(1.0, 0., fdAlpha);
    float far = mix(5000.0, 5000.0, fdAlpha);
    fogDepth = 1.0 - smoothstep(near, far, -mvPosition.z);
    gl_PointSize = (30. * randoms + 5.) * (1.0 / -mvPosition.z) * size;
    //    gl_PointSize = 10.0;
    gl_Position = projectionMatrix * mvPosition;
}