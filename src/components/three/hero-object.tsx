"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, MathUtils, type Mesh, type ShaderMaterial } from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vHeight;

  vec3 twist(vec3 p, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return vec3(c * p.x - s * p.z, p.y, s * p.x + c * p.z);
  }

  void main() {
    float angle = position.y * 0.55 + sin(uTime * 0.35) * 0.5;
    vec3 transformed = twist(position, angle);
    vec3 twistedNormal = twist(normal, angle);

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    vNormal = normalize(normalMatrix * twistedNormal);
    vView = normalize(-mvPosition.xyz);
    vHeight = transformed.y;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uBase;
  uniform vec3 uRim;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vHeight;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vec3(-0.5, 0.8, 0.6));

    float diffuse = max(dot(normal, lightDir), 0.0);
    float specular = pow(max(dot(reflect(-lightDir, normal), vView), 0.0), 40.0);
    float fresnel = pow(1.0 - max(dot(normal, vView), 0.0), 2.6);

    // Thin scan lines drifting up the surface, only visible near the rim.
    float scan = smoothstep(0.92, 1.0, sin(vHeight * 22.0 - uTime * 1.6) * 0.5 + 0.5);

    vec3 color = uBase * (0.28 + 0.72 * diffuse);
    color += vec3(0.85) * specular * 0.4;
    color += uRim * fresnel * 1.25;
    color += uRim * scan * fresnel * 0.6;

    gl_FragColor = vec4(color, 1.0);
  }
`;

type HeroObjectProps = {
  animate: boolean;
};

export function HeroObject({ animate }: HeroObjectProps) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const entry = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBase: { value: new Color("#2a2d28") },
      uRim: { value: new Color("#c5f36b") },
    }),
    [],
  );

  // Track the pointer over the whole window — the canvas sits behind the text.
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    if (!mesh.current || !material.current) return;
    const dt = Math.min(delta, 0.05);

    if (!animate) {
      entry.current = 1;
      mesh.current.scale.setScalar(1);
      mesh.current.rotation.set(0.35, 0.6, 0);
      return;
    }

    entry.current = Math.min(entry.current + dt / 1.6, 1);
    const eased = 1 - Math.pow(1 - entry.current, 4);
    mesh.current.scale.setScalar(MathUtils.lerp(0.55, 1, eased));

    material.current.uniforms.uTime.value += dt;
    mesh.current.rotation.y += dt * 0.12;
    mesh.current.rotation.x = MathUtils.damp(mesh.current.rotation.x, 0.3 + pointer.current.y * 0.25, 2, dt);
    mesh.current.rotation.z = MathUtils.damp(mesh.current.rotation.z, -pointer.current.x * 0.2, 2, dt);
  });

  return (
    <mesh ref={mesh}>
      <torusKnotGeometry args={[1, 0.3, 360, 48, 2, 3]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}
