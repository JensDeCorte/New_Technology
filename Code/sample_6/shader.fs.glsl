precision mediump float;

varying vec2 fragTexCoord;
varying vec3 fragNormal;
uniform sampler2D sampler;

void main() {
  vec3 ambientLightIntensity = vec3(0.2, 0.2, 0.2);
  vec3 sunlightIntensity = vec3(0.9, 0.9, 0.9);
  vec3 sunlightDirection = normalize(vec3(3.0, 4.0, -2.0));
  vec3 surfaceNormal = normalize(fragNormal);

  vec4 texel = texture2D(sampler, fragTexCoord);

  vec3 lightIntensity = ambientLightIntensity +
    sunlightIntensity * max(dot(surfaceNormal, sunlightDirection), 0.0);

  gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);
}