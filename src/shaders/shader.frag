precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;

void main() {
  vec4 alphaMark = texture2D(u_texture, v_texcoord);
  if (alphaMark.a < 0.1)
    discard;
  gl_FragColor = alphaMark;
}