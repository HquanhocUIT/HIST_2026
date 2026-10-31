import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export type ExhibitId = "drum" | "jar" | "dagger";

type InteractiveSceneProps = {
  selectedId: ExhibitId;
  onSelect: (id: ExhibitId) => void;
};

type SceneState = {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  models: Map<ExhibitId, THREE.Group>;
  focusLight: THREE.PointLight;
};

function addMesh(
  group: THREE.Group,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number],
) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function createDrum() {
  const group = new THREE.Group();
  const bronze = new THREE.MeshStandardMaterial({
    color: 0x98703b,
    metalness: 0.78,
    roughness: 0.32,
  });
  const darkBronze = new THREE.MeshStandardMaterial({
    color: 0x65451f,
    metalness: 0.68,
    roughness: 0.4,
  });

  addMesh(group, new THREE.CylinderGeometry(0.72, 0.72, 1.05, 40), bronze, [
    0,
    0.78,
    0,
  ]);
  addMesh(group, new THREE.CylinderGeometry(0.75, 0.75, 0.1, 40), bronze, [
    0,
    1.34,
    0,
  ]);
  addMesh(group, new THREE.CylinderGeometry(0.62, 0.7, 0.14, 40), darkBronze, [
    0,
    0.16,
    0,
  ]);

  [0.42, 0.78, 1.12].forEach((height) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.73, 0.025, 8, 40),
      darkBronze,
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = height;
    group.add(ring);
  });

  return group;
}

function createJar() {
  const group = new THREE.Group();
  const bronze = new THREE.MeshStandardMaterial({
    color: 0x9a7848,
    metalness: 0.72,
    roughness: 0.36,
  });

  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.38, 0),
    new THREE.Vector2(0.55, 0.16),
    new THREE.Vector2(0.62, 0.5),
    new THREE.Vector2(0.53, 0.85),
    new THREE.Vector2(0.36, 1.08),
    new THREE.Vector2(0.28, 1.24),
    new THREE.Vector2(0.28, 1.57),
    new THREE.Vector2(0.39, 1.63),
  ];

  addMesh(group, new THREE.LatheGeometry(profile, 40), bronze, [0, 0.08, 0]);

  [0.42, 0.72, 1.02].forEach((height) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(height > 0.8 ? 0.4 : 0.57, 0.025, 8, 40),
      bronze,
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = height;
    group.add(ring);
  });

  return group;
}

function createDagger() {
  const group = new THREE.Group();
  const bronze = new THREE.MeshStandardMaterial({
    color: 0xa18452,
    metalness: 0.8,
    roughness: 0.3,
  });
  const darkBronze = new THREE.MeshStandardMaterial({
    color: 0x66502e,
    metalness: 0.7,
    roughness: 0.38,
  });

  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0, 0);
  bladeShape.lineTo(0.13, 0.36);
  bladeShape.lineTo(0.09, 1.15);
  bladeShape.lineTo(0.2, 1.23);
  bladeShape.lineTo(0.2, 1.32);
  bladeShape.lineTo(0.07, 1.35);
  bladeShape.lineTo(0.07, 1.68);
  bladeShape.lineTo(-0.07, 1.68);
  bladeShape.lineTo(-0.07, 1.35);
  bladeShape.lineTo(-0.2, 1.32);
  bladeShape.lineTo(-0.2, 1.23);
  bladeShape.lineTo(-0.09, 1.15);
  bladeShape.lineTo(-0.13, 0.36);
  bladeShape.closePath();

  addMesh(
    group,
    new THREE.ExtrudeGeometry(bladeShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    }),
    bronze,
    [0, 0.08, -0.04],
  );

  addMesh(group, new THREE.CylinderGeometry(0.065, 0.065, 0.3, 12), darkBronze, [
    0,
    1.83,
    0,
  ]);
  addMesh(group, new THREE.SphereGeometry(0.09, 12, 8), bronze, [0, 2, 0]);

  return group;
}

function tagModel(group: THREE.Group, id: ExhibitId) {
  group.userData.exhibitId = id;
  group.traverse((object) => {
    object.userData.exhibitId = id;
  });
}

export function InteractiveScene({
  selectedId,
  onSelect,
}: InteractiveSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneStateRef = useRef<SceneState | null>(null);
  const onSelectRef = useRef(onSelect);

  onSelectRef.current = onSelect;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101311);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 3, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "three-canvas";
    renderer.domElement.setAttribute("aria-label", "Interactive 3D exhibit viewer");
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xe5e4d8, 0x343a32, 2));
    const keyLight = new THREE.DirectionalLight(0xffe0a4, 3);
    keyLight.position.set(-4, 7, 5);
    scene.add(keyLight);

    const focusLight = new THREE.PointLight(0xd8bd82, 12, 5);
    scene.add(focusLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0x171b18, roughness: 1 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.04;
    scene.add(floor);

    const models = new Map<ExhibitId, THREE.Group>([
      ["drum", createDrum()],
      ["jar", createJar()],
      ["dagger", createDagger()],
    ]);

    const positions: Record<ExhibitId, number> = {
      drum: -2.6,
      jar: 0,
      dagger: 2.6,
    };

    models.forEach((model, id) => {
      model.position.x = positions[id];
      tagModel(model, id);
      scene.add(model);
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 3.5;
    controls.maxDistance = 10;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.set(0, 0.9, 0);
    controls.update();

    const resize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pointerStart = new THREE.Vector2();
    let pointerIsDown = false;

    const onPointerDown = (event: PointerEvent) => {
      pointerStart.set(event.clientX, event.clientY);
      pointerIsDown = true;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!pointerIsDown) return;
      pointerIsDown = false;

      const pointerEnd = new THREE.Vector2(event.clientX, event.clientY);
      if (pointerStart.distanceTo(pointerEnd) > 6) return;

      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObjects(
        Array.from(models.values()),
        true,
      );

      for (const intersection of intersections) {
        let object: THREE.Object3D | null = intersection.object;

        while (object && !object.userData.exhibitId) {
          object = object.parent;
        }

        const id = object?.userData.exhibitId as ExhibitId | undefined;
        if (id) {
          onSelectRef.current(id);
          return;
        }
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    let animationFrame = 0;
    const render = () => {
      animationFrame = window.requestAnimationFrame(render);
      controls.update();
      renderer.render(scene, camera);
    };
    render();

    sceneStateRef.current = { camera, controls, models, focusLight };

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.dispose();

      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const meshMaterials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          meshMaterials.forEach((material) => materials.add(material));
        }
      });
      materials.forEach((material) => material.dispose());

      renderer.dispose();
      renderer.domElement.remove();
      sceneStateRef.current = null;
    };
  }, []);

  useEffect(() => {
    const state = sceneStateRef.current;
    if (!state) return;

    const selectedModel = state.models.get(selectedId);
    if (!selectedModel) return;

    state.models.forEach((model, id) => {
      model.scale.setScalar(id === selectedId ? 1.08 : 1);
    });

    state.controls.target.set(selectedModel.position.x, 0.9, 0);
    state.camera.position.set(selectedModel.position.x + 3, 2.8, 6.2);
    state.controls.update();
    state.focusLight.position.set(selectedModel.position.x, 2, 1.2);
  }, [selectedId]);

  return <div className="scene-container" ref={containerRef} />;
}