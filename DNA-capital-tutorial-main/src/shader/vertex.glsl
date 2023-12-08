uniform float u_time;
uniform float pointSize;
uniform float far;
uniform float near;
//varying vec2 vUv;
varying float vColorRandom;
varying vec3 vPosition;//need
uniform sampler2D texture1;//need
//uniform mat4 viewMatrix;
//uniform mat4 modelMatrix;

float PI = 3.141592653589793238;

attribute float randoms;
attribute float colorRandoms;
attribute vec3 dir;
varying float fogDepth;

vec3 GetWavaEffectPos(float time)
{
    float r = sqrt(position.x * position.x + position.y * position.y + position.z * position.z);
    float theta = acos(position.z / r);
    float phi = atan(position.y / position.x);

    float x = 3.0 * cos(phi) * sin(theta) * sin(r - time) / r;
    float y = 3.0 * sin(phi) * sin(theta) * sin(r - time) / r;
    float z = 3.0 * cos(theta) * sin(r - time) / r;


    return vec3(x, y, z);
}

void main() {
    //    vUv = uv;
    vPosition = normalize(position);
    vColorRandom = colorRandoms;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.);

    //    if (u_time == 0.0)
    //    {
    //        gl_PointSize = (30. * randoms + 5.) * (1.0 / -mvPosition.z) * 10.0;
    //    }
    //    else
    //    {
    float randomSize = abs(cos(u_time * 0.8) * 0.5);

    float offset = 1.0 + abs(cos(u_time * 1.6) * 1.0);
    float moveDistance = 2.0 + 1.0 * offset;
    vec3 movePosition = position + dir * moveDistance;
    //    mvPosition = modelViewMatrix * vec4(movePosition, 1.);

    if (randomSize < randoms)
    {
        randomSize = randoms;
    }

    //    float near = mix(1.0, 0., 0.0);
    //    float far = mix(200.0, 50.0, 0.0);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vec4 mvPos = viewMatrix * worldPosition;
    fogDepth = 1.0 - smoothstep(near, far, -mvPos.z);

    gl_PointSize = (30. * randomSize + 5.) * (1.0 / -mvPosition.z) * pointSize;

//    float ttt= 1.0 - smoothstep(near, 50, -mvPos.z);
    gl_PointSize = fogDepth * 20.0;
    //    }
    //    gl_PointSize = (30. * randoms + 5.) * (1.0 / -mvPosition.z)*10.0;
    //    gl_PointSize = 10.0;
    gl_Position = projectionMatrix * mvPosition;
}

