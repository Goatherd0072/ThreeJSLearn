//varying vec2 vUv;
varying float vColorRandom;

uniform float u_time;
varying vec3 vPosition;

uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
float PI = 3.141592653589793238;

varying float fogDepth;

void main() {
    vec2 st = vec2(-1.0) + 2.0 * gl_PointCoord.xy;
    float d = 1.0 - distance(st, vec2(0.));
    d = smoothstep(0., .25, d);

    d = distance(gl_PointCoord, vec2(0.5));

    if (d > 0.5)
    discard;

    float alpha = 1. - smoothstep(0.2, 0.5, length(gl_PointCoord - vec2(0.5)));

    float timeFactor = cos(u_time);
    float t = (timeFactor + 1.0) / 2.0; // 将时间因子映射到 0 到 1 的范围
    if (t < 0.3)
    {
        t = 0.3; // 使用 smoothstep() 调整 t 的范围，使其在 0 到 0.3 之间平滑过渡
    }
    alpha *= t;
    //alpha *= .5;
    vec3 finalColor = u_color1;

    if (vColorRandom > 0.33 && vColorRandom < 0.66) {
        finalColor = u_color2;
    }
    if (vColorRandom > 0.66) {
        finalColor = u_color3;
    }
    //    finalColor = vec3(vPosition.x, vPosition.y, vPosition.z) - vec3(0, 0, 0);
    //    float gradient = smoothstep(0.38, 0.55, vUv.y);
    gl_FragColor = vec4(finalColor, d * fogDepth);
}
