import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { CustomHotspot } from "./syncStore";

export type ExhibitId = "drum" | "jar" | "dagger";

type InteractiveSceneProps = {
  selectedId: ExhibitId | null;
  onSelect: (id: ExhibitId) => void;
  showDisplayCase?: boolean;
  hideCase?: boolean;
  customHotspots?: CustomHotspot[];
  onSurfaceClick3D?: (localPos: [number, number, number]) => void;
  onHotspotClick?: (hotspot: CustomHotspot) => void;
};

type SceneState = {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  models: Map<ExhibitId, THREE.Group>;
  focusLight: THREE.PointLight;
};

const exhibitIds: ExhibitId[] = ["drum", "jar", "dagger"];
const pedestalTop = 0.86;

const exhibitLabels: Record<ExhibitId, string> = {
  drum: "Trống đồng Ngọc Lũ",
  jar: "Thạp đồng Đào Thịnh",
  dagger: "Dao găm đồng Đông Sơn",
};

const hotspotAnchors: Record<ExhibitId, [number, number, number]> = {
  drum: [0, 0.78, 0.74],
  jar: [0, 0.82, 0.58],
  dagger: [0, 1.03, 0.08],
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

function createPedestalFrustum(
  topRadius: number,
  bottomRadius: number,
  height: number,
) {
  const geometry = new THREE.CylinderGeometry(
    topRadius,
    bottomRadius,
    height,
    4,
  );

  geometry.rotateY(Math.PI / 4);

  return geometry;
}

function createDisplayCase(artifact: THREE.Group) {
  const exhibit = new THREE.Group();
  const caseStructure = new THREE.Group();
  const caseWidth = 2.1;
  const caseDepth = 1.95;
  const caseBottom = 0.08;
  const caseHeight = 3.12;

  const darkBase = new THREE.MeshStandardMaterial({
    color: 0x171a18,
    metalness: 0.42,
    roughness: 0.44,
  });

  const pedestalMaterial = new THREE.MeshStandardMaterial({
    color: 0xe7e4dc,
    metalness: 0.08,
    roughness: 0.72,
  });

  const glassFrame = new THREE.MeshStandardMaterial({
    color: 0x806638,
    metalness: 0.78,
    roughness: 0.27,
  });

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0xb8d2c6,
    metalness: 0.04,
    roughness: 0.12,
    transparent: true,
    opacity: 0.075,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // Low dark base, similar to the reference display case.
  addMesh(
    caseStructure,
    new THREE.BoxGeometry(caseWidth + 0.1, 0.12, caseDepth + 0.1),
    darkBase,
    [0, 0.02, 0],
  );

  // White stepped pedestal.
  addMesh(
    caseStructure,
    createPedestalFrustum(1.12, 1.32, 0.52),
    pedestalMaterial,
    [0, 0.34, 0],
  );

  addMesh(
    caseStructure,
    createPedestalFrustum(0.98, 1.12, 0.18),
    pedestalMaterial,
    [0, 0.69, 0],
  );

  addMesh(
    caseStructure,
    new THREE.BoxGeometry(1.42, 0.08, 1.42),
    pedestalMaterial,
    [0, 0.82, 0],
  );

  // Glass walls and roof.
  const glassCenterY = caseBottom + caseHeight / 2;

  const frontGlass = addMesh(
    caseStructure,
    new THREE.PlaneGeometry(caseWidth, caseHeight),
    glassMaterial,
    [0, glassCenterY, caseDepth / 2],
  );

  const backGlass = addMesh(
    caseStructure,
    new THREE.PlaneGeometry(caseWidth, caseHeight),
    glassMaterial,
    [0, glassCenterY, -caseDepth / 2],
  );

  const leftGlass = addMesh(
    caseStructure,
    new THREE.PlaneGeometry(caseDepth, caseHeight),
    glassMaterial,
    [-caseWidth / 2, glassCenterY, 0],
  );

  const rightGlass = addMesh(
    caseStructure,
    new THREE.PlaneGeometry(caseDepth, caseHeight),
    glassMaterial,
    [caseWidth / 2, glassCenterY, 0],
  );

  leftGlass.rotation.y = Math.PI / 2;
  rightGlass.rotation.y = Math.PI / 2;

  const roofGlass = addMesh(
    caseStructure,
    new THREE.PlaneGeometry(caseWidth, caseDepth),
    glassMaterial,
    [0, caseBottom + caseHeight, 0],
  );

  roofGlass.rotation.x = -Math.PI / 2;

  // Thin upright bronze posts at the corners.
  const postPositions: [number, number, number][] = [
    [-caseWidth / 2, glassCenterY, -caseDepth / 2],
    [-caseWidth / 2, glassCenterY, caseDepth / 2],
    [caseWidth / 2, glassCenterY, -caseDepth / 2],
    [caseWidth / 2, glassCenterY, caseDepth / 2],
  ];

  postPositions.forEach((position) => {
    addMesh(
      caseStructure,
      new THREE.CylinderGeometry(0.018, 0.018, caseHeight, 8),
      glassFrame,
      position,
    );
  });

  // Narrow rails at the top and foot of the glass enclosure.
  const railThickness = 0.035;
  const railHeight = 0.035;
  const caseTop = caseBottom + caseHeight;

  [-1, 1].forEach((side) => {
    const z = side * (caseDepth / 2);
    const x = side * (caseWidth / 2);

    addMesh(
      caseStructure,
      new THREE.BoxGeometry(caseWidth, railHeight, railThickness),
      glassFrame,
      [0, caseBottom + 0.025, z],
    );

    addMesh(
      caseStructure,
      new THREE.BoxGeometry(caseWidth, railHeight, railThickness),
      glassFrame,
      [0, caseTop - 0.02, z],
    );

    addMesh(
      caseStructure,
      new THREE.BoxGeometry(railThickness, railHeight, caseDepth),
      glassFrame,
      [x, caseBottom + 0.025, 0],
    );

    addMesh(
      caseStructure,
      new THREE.BoxGeometry(railThickness, railHeight, caseDepth),
      glassFrame,
      [x, caseTop - 0.02, 0],
    );
  });

  // A soft warm light illuminates the artifact inside the case.
  const caseLight = new THREE.PointLight(0xffdfaa, 1.4, 4);
  caseLight.position.set(0, 2.85, 0.15);
  caseStructure.add(caseLight);

  // Keep the case and artifact in separate groups so detail views can hide the case.
  artifact.position.y = pedestalTop;
  exhibit.add(caseStructure);
  exhibit.add(artifact);
  exhibit.userData.displayCase = caseStructure;
  exhibit.userData.artifact = artifact;

  frontGlass.renderOrder = 2;
  backGlass.renderOrder = 2;
  leftGlass.renderOrder = 2;
  rightGlass.renderOrder = 2;
  roofGlass.renderOrder = 2;

  return exhibit;
}

function createDrum(includeDisplayCase = true, showInterior = false) {
  const artifact = new THREE.Group();

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

  addMesh(
    artifact,
    new THREE.CylinderGeometry(0.72, 0.72, 1.05, 40, 1, showInterior),
    bronze,
    [0, 0.78, 0],
  );

  addMesh(
    artifact,
    new THREE.CylinderGeometry(0.75, 0.75, 0.1, 40),
    bronze,
    [0, 1.34, 0],
  );

  addMesh(
    artifact,
    new THREE.CylinderGeometry(0.62, 0.7, 0.14, 40),
    darkBronze,
    [0, 0.16, 0],
  );

  [0.42, 0.78, 1.12].forEach((height) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.73, 0.025, 8, 40),
      darkBronze,
    );

    ring.rotation.x = Math.PI / 2;
    ring.position.y = height;
    artifact.add(ring);
  });

  return includeDisplayCase ? createDisplayCase(artifact) : artifact;
}

function createJar(includeDisplayCase = true) {
  const artifact = new THREE.Group();

  const bronze = new THREE.MeshStandardMaterial({
    color: 0x9a7848,
    metalness: 0.74,
    roughness: 0.38,
  });

  const bronzeHighlight = new THREE.MeshStandardMaterial({
    color: 0xb18a50,
    metalness: 0.78,
    roughness: 0.34,
  });

  const darkBronze = new THREE.MeshStandardMaterial({
    color: 0x58401f,
    metalness: 0.68,
    roughness: 0.44,
  });

  // A more cylindrical vessel body that gently narrows toward its base.
  const bodyProfile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.34, 0),
    new THREE.Vector2(0.4, 0.08),
    new THREE.Vector2(0.45, 0.22),
    new THREE.Vector2(0.48, 0.48),
    new THREE.Vector2(0.49, 0.92),
    new THREE.Vector2(0.47, 1.24),
    new THREE.Vector2(0.44, 1.48),
  ];

  addMesh(
    artifact,
    new THREE.LatheGeometry(bodyProfile, 48),
    bronze,
    [0, 0.08, 0],
  );

  // Low-relief bronze bands give the body a finished Dong Son look.
  [
    { height: 0.3, radius: 0.46 },
    { height: 0.56, radius: 0.49 },
    { height: 1.02, radius: 0.49 },
    { height: 1.34, radius: 0.46 },
    { height: 1.55, radius: 0.44 },
  ].forEach(({ height, radius }, index) => {
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(radius, index === 4 ? 0.018 : 0.012, 8, 48),
      index % 2 === 0 ? bronzeHighlight : darkBronze,
    );

    band.rotation.x = Math.PI / 2;
    band.position.y = height;
    artifact.add(band);
  });

  // The original thạp has a truncated-cone lid; this covers the open mouth.
  const lidBottomY = 1.56;
  const lidHeight = 0.26;
  const lidTopRadius = 0.2;
  const lidBottomRadius = 0.43;

  addMesh(
    artifact,
    new THREE.CylinderGeometry(
      lidTopRadius,
      lidBottomRadius,
      lidHeight,
      48,
      1,
      false,
    ),
    bronze,
    [0, lidBottomY + lidHeight / 2, 0],
  );

  // Rolled rim where the lid meets the vessel.
  const lidRim = new THREE.Mesh(
    new THREE.TorusGeometry(lidBottomRadius, 0.022, 8, 48),
    darkBronze,
  );
  lidRim.rotation.x = Math.PI / 2;
  lidRim.position.y = lidBottomY;
  artifact.add(lidRim);

  // Eleven restrained bands follow the taper of the lid.
  for (let index = 1; index <= 11; index += 1) {
    const t = index / 12;
    const radius =
      lidBottomRadius + (lidTopRadius - lidBottomRadius) * t + 0.006;
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.006, 6, 48),
      index % 2 === 0 ? darkBronze : bronzeHighlight,
    );

    band.rotation.x = Math.PI / 2;
    band.position.y = lidBottomY + lidHeight * t;
    artifact.add(band);
  }

  const lidTopY = lidBottomY + lidHeight;

  // A small bronze sun medallion replaces the distracting pale open center.
  addMesh(
    artifact,
    new THREE.CylinderGeometry(0.075, 0.075, 0.014, 32),
    darkBronze,
    [0, lidTopY + 0.008, 0],
  );

  const sunRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.105, 0.008, 6, 36),
    bronzeHighlight,
  );
  sunRing.rotation.x = Math.PI / 2;
  sunRing.position.y = lidTopY + 0.017;
  artifact.add(sunRing);

  // Twelve simple rays echo the documented sun motif without adding figures.
  for (let index = 0; index < 12; index += 1) {
    const angle = (index / 12) * Math.PI * 2;
    const radius = 0.148;
    const ray = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.008, 0.09),
      bronzeHighlight,
    );

    ray.position.set(
      Math.sin(angle) * radius,
      lidTopY + 0.018,
      Math.cos(angle) * radius,
    );
    ray.rotation.y = angle;
    ray.castShadow = true;
    artifact.add(ray);
  }

  return includeDisplayCase ? createDisplayCase(artifact) : artifact;
}

function createDagger(includeDisplayCase = true) {
  const artifact = new THREE.Group();

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
    artifact,
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

  addMesh(
    artifact,
    new THREE.CylinderGeometry(0.065, 0.065, 0.3, 12),
    darkBronze,
    [0, 1.83, 0],
  );

  addMesh(
    artifact,
    new THREE.SphereGeometry(0.09, 12, 8),
    bronze,
    [0, 2, 0],
  );

  return includeDisplayCase ? createDisplayCase(artifact) : artifact;
}

export function createExhibitArtifact(id: ExhibitId) {
  switch (id) {
    case "drum":
      return createDrum(false, true);
    case "jar":
      return createJar(false);
    case "dagger":
      return createDagger(false);
  }

  return createDrum(false);
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
  showDisplayCase = true,
  hideCase,
  customHotspots = [],
  onSurfaceClick3D,
  onHotspotClick,
}: InteractiveSceneProps) {
  const effectiveShowDisplayCase =
    hideCase === undefined ? showDisplayCase : !hideCase;

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneStateRef = useRef<SceneState | null>(null);
  const onSelectRef = useRef(onSelect);
  const selectedIdRef = useRef<ExhibitId | null>(selectedId);
  const showDisplayCaseRef = useRef(effectiveShowDisplayCase);
  const hotspotRefs = useRef(new Map<ExhibitId, HTMLButtonElement>());
  const customHotspotRefs = useRef(new Map<string, HTMLButtonElement>());
  const customHotspotsRef = useRef(customHotspots);
  const onSurfaceClick3DRef = useRef(onSurfaceClick3D);
  const onHotspotClickRef = useRef(onHotspotClick);

  onSelectRef.current = onSelect;
  selectedIdRef.current = selectedId;
  showDisplayCaseRef.current = effectiveShowDisplayCase;
  customHotspotsRef.current = customHotspots;
  onSurfaceClick3DRef.current = onSurfaceClick3D;
  onHotspotClickRef.current = onHotspotClick;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 4.3, 10.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "three-canvas";
    renderer.domElement.setAttribute(
      "aria-label",
      "Không gian xem hiện vật 3D tương tác",
    );

    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xe5e4d8, 0x343a32, 2));

    const keyLight = new THREE.DirectionalLight(0xffe0a4, 3);
    keyLight.position.set(-4, 7, 5);
    scene.add(keyLight);

    const focusLight = new THREE.PointLight(0xd8bd82, 12, 8);
    focusLight.position.set(0, 2, 1.2);
    scene.add(focusLight);

    const models = new Map<ExhibitId, THREE.Group>([
      ["drum", createDrum()],
      ["jar", createJar()],
      ["dagger", createDagger()],
    ]);

    const positions: Record<ExhibitId, number> = {
      drum: -2.2,
      jar: 0,
      dagger: 2.2,
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
    controls.maxDistance = 16;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.set(0, 1.95, 0);
    controls.update();

    const resize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;

      renderer.setSize(width, height);
      camera.aspect = width / height;

      const isMobileScan =
        selectedIdRef.current === null && width < 760;

      camera.fov = isMobileScan ? 54 : 42;

      if (selectedIdRef.current === null) {
        camera.position.set(
          0,
          4.3,
          isMobileScan ? 12.2 : 10.4,
        );
      }

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

      const visibleModels = Array.from(models.values()).filter(
        (model) => model.visible,
      );

      const intersections = raycaster.intersectObjects(visibleModels, true);

      for (const intersection of intersections) {
        let object: THREE.Object3D | null = intersection.object;

        while (object && !object.userData.exhibitId) {
          object = object.parent;
        }

        const id = object?.userData.exhibitId as ExhibitId | undefined;
        if (!id) continue;

        const addHotspot = onSurfaceClick3DRef.current;
        if (addHotspot) {
          const model = models.get(id);

          if (model) {
            const artifact =
              (model.userData.artifact as THREE.Group | undefined) ?? model;
            artifact.updateWorldMatrix(true, false);

            const localPoint = artifact.worldToLocal(
              intersection.point.clone(),
            );

            addHotspot([localPoint.x, localPoint.y, localPoint.z]);
            return;
          }
        }

        onSelectRef.current(id);
        return;
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    const projectHotspots = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (!width || !height) return;

      models.forEach((model, id) => {
        const hotspot = hotspotRefs.current.get(id);
        if (!hotspot) return;

        if (selectedIdRef.current !== null || !model.visible) {
          hotspot.style.visibility = "hidden";
          return;
        }

        const [localX, localY, localZ] = hotspotAnchors[id];
        const scale = model.scale.x;
        const pedestalOffset = showDisplayCaseRef.current ? pedestalTop : 0;

        const position = new THREE.Vector3(
          model.position.x + localX * scale,
          model.position.y + (localY + pedestalOffset) * scale,
          model.position.z + localZ * scale,
        );

        position.project(camera);

        const isVisible =
          position.z >= -1 &&
          position.z <= 1 &&
          position.x >= -1 &&
          position.x <= 1 &&
          position.y >= -1 &&
          position.y <= 1;

        hotspot.style.visibility = isVisible ? "visible" : "hidden";

        if (!isVisible) return;

        hotspot.style.left = `${(position.x * 0.5 + 0.5) * width}px`;
        hotspot.style.top = `${(-position.y * 0.5 + 0.5) * height}px`;
      });
    };

    const projectCustomHotspots = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const activeId = selectedIdRef.current;
      const activeModel = activeId ? models.get(activeId) : undefined;

      customHotspotsRef.current.forEach((hotspot) => {
        const button = customHotspotRefs.current.get(hotspot.id);
        if (!button) return;

        if (!activeModel || !activeModel.visible) {
          button.style.visibility = "hidden";
          return;
        }

        // Tọa độ hotspot là tọa độ cục bộ của hiện vật, không phải của tủ kính.
        const artifact =
          (activeModel.userData.artifact as THREE.Group | undefined) ??
          activeModel;
        artifact.updateWorldMatrix(true, false);

        const position = artifact.localToWorld(
          new THREE.Vector3(...hotspot.localPos),
        );
        position.project(camera);

        const isVisible =
          width > 0 &&
          height > 0 &&
          position.z >= -1 &&
          position.z <= 1 &&
          position.x >= -1 &&
          position.x <= 1 &&
          position.y >= -1 &&
          position.y <= 1;

        button.style.visibility = isVisible ? "visible" : "hidden";

        if (!isVisible) return;

        button.style.left = `${(position.x * 0.5 + 0.5) * width}px`;
        button.style.top = `${(-position.y * 0.5 + 0.5) * height}px`;
      });
    };

    let animationFrame = 0;

    const render = () => {
      animationFrame = window.requestAnimationFrame(render);
      controls.update();
      camera.updateMatrixWorld();
      projectHotspots();
      projectCustomHotspots();
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

    state.models.forEach((model, id) => {
      const isSelected = selectedId === id;

      model.visible = selectedId === null || isSelected;
      model.scale.setScalar(isSelected ? 1.08 : 1);

      const displayCase = model.userData.displayCase as THREE.Group | undefined;
      const artifact = model.userData.artifact as THREE.Group | undefined;

      if (displayCase && artifact) {
        displayCase.visible = effectiveShowDisplayCase;
        artifact.position.y = effectiveShowDisplayCase ? pedestalTop : 0;
      }
    });

    if (selectedId === null) {
      const isMobile = window.innerWidth < 760;

      state.camera.fov = isMobile ? 54 : 42;
      state.camera.position.set(
        0,
        4.3,
        isMobile ? 12.2 : 10.4,
      );
      state.controls.target.set(0, 1.95, 0);
      state.focusLight.position.set(0, 2.6, 1.2);
    } else {
      const selectedModel = state.models.get(selectedId);
      if (!selectedModel) return;

      const artifact = selectedModel.userData.artifact as THREE.Group | undefined;
      const focusBounds = new THREE.Box3().setFromObject(artifact ?? selectedModel);
      const focusTarget = focusBounds.getCenter(new THREE.Vector3());

      state.camera.fov = 42;
      state.controls.target.copy(focusTarget);
      state.camera.position.set(
        focusTarget.x + 2.6,
        focusTarget.y + 1.5,
        focusTarget.z + 6.2,
      );
      state.focusLight.position.set(focusTarget.x, focusTarget.y + 0.7, focusTarget.z + 1.2);
    }

    state.camera.updateProjectionMatrix();
    state.controls.update();
  }, [selectedId, effectiveShowDisplayCase]);

  return (
    <div className="scene-container" ref={containerRef}>
      {exhibitIds.map((id) => (
        <button
          key={id}
          ref={(element) => {
            if (element) {
              hotspotRefs.current.set(id, element);
            } else {
              hotspotRefs.current.delete(id);
            }
          }}
          className={`exhibit-hotspot ${
            selectedId === id ? "is-selected" : ""
          }`}
          type="button"
          aria-label={`Chọn ${exhibitLabels[id]}`}
          aria-pressed={selectedId === id}
          style={{ left: "50%", top: "50%" }}
          onClick={() => onSelectRef.current(id)}
        >
          <span className="hotspot-marker" aria-hidden="true" />
        </button>
      ))}
      {customHotspots.map((hotspot) => (
        <button
          key={hotspot.id}
          ref={(element) => {
            if (element) {
              customHotspotRefs.current.set(hotspot.id, element);
            } else {
              customHotspotRefs.current.delete(hotspot.id);
            }
          }}
          className="exhibit-hotspot"
          type="button"
          aria-label={hotspot.title}
          title={hotspot.title}
          style={{ left: "50%", top: "50%" }}
          onClick={() => onHotspotClickRef.current?.(hotspot)}
        >
          <span className="hotspot-marker" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}