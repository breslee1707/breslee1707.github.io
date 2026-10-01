import * as THREE from "three";

/**
 * The visible sheet of a line laser: a single triangle from the emitter to
 * the two ends of the stripe, brightest at the aperture, soft at its edges.
 * Additive on dark grounds; plain alpha on paper, where additive vanishes.
 */
const vertex = /* glsl */ `
attribute vec2 aFan; // x: 0 at the emitter → 1 at the surface; y: −1…1 across
varying vec2 vFan;
void main() {
  vFan = aFan;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vFan;
void main() {
  float across = 1.0 - pow(clamp(abs(vFan.y) / max(vFan.x, 1e-3), 0.0, 1.0), 6.0);
  float a = (0.42 * (1.0 - vFan.x) + 0.07) * across * uOpacity;
  gl_FragColor = vec4(uColor, a);
}
`;

export class LaserFan {
  readonly mesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private readonly pos = new Float32Array(9);

  constructor() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    geometry.setAttribute(
      "aFan",
      new THREE.BufferAttribute(new Float32Array([0, 0, 1, -1, 1, 1]), 2),
    );
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Vector3(0.95, 0.69, 0.28) },
        uOpacity: { value: 0 },
      },
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
  }

  set(emitter: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, opacity: number) {
    this.pos.set([emitter.x, emitter.y, emitter.z, a.x, a.y, a.z, b.x, b.y, b.z]);
    this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh.material.uniforms.uOpacity.value = opacity;
    this.mesh.visible = opacity > 0.002;
  }

  hide() {
    this.mesh.visible = false;
  }

  setColor(rgb: THREE.Vector3, onPaper: boolean) {
    this.mesh.material.uniforms.uColor.value.copy(rgb);
    this.mesh.material.blending = onPaper ? THREE.NormalBlending : THREE.AdditiveBlending;
    this.mesh.material.needsUpdate = true;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
