import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  createExhibitArtifact,
  type ExhibitId,
} from "./InteractiveScene";
import "./InteractiveStoryScene.css";

export type StoryChapter = "overview" | "crafting";

type InteractiveStorySceneProps = {
  exhibitId: ExhibitId;
  chapter: StoryChapter;
};

type LayerDefinition = {
  id: string;
  name: string;
  title: string;
  story: string;
  isIllustrative: boolean;
};

type RuntimeLayer = {
  definition: LayerDefinition;
  group: THREE.Group;
  assembledPosition: THREE.Vector3;
  assembledCenter: THREE.Vector3;
  rowY: number;
  index: number;
};

type StorySceneState = {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
};

type CastingVisual = {
  root: THREE.Group;
  leftMold: THREE.Mesh;
  rightMold: THREE.Mesh;
  faceMold: THREE.Mesh;
  moltenMetal: THREE.Mesh;
  pourStream: THREE.Mesh;
  clayMaterial: THREE.MeshStandardMaterial;
  moltenMaterial: THREE.MeshStandardMaterial;
  pourMaterial: THREE.MeshStandardMaterial;
  centerX: number;
  centerY: number;
  centerZ: number;
  radius: number;
  baseY: number;
  topY: number;
  faceBaseY: number;
  moldHeight: number;
};

const layerDefinitions: Record<ExhibitId, LayerDefinition[]> = {
  drum: [
    {
      id: "drum-body",
      name: "Thân trống",
      title: "Thân trống: hình khối chính",
      story:
        "Lớp này giúp quan sát phần thân trong mô hình. Các lớp tách ra là cách diễn giải 3D để dễ tìm hiểu, không có nghĩa chiếc trống thật được ghép từ những phần này.",
      isIllustrative: true,
    },
    {
      id: "drum-foot",
      name: "Chân trống",
      title: "Chân trống: phần đế loe",
      story:
        "Phần chân tạo dáng đứng vững cho trống. Mô hình tách riêng khu vực này để du khách quan sát hình dáng từ dưới lên.",
      isIllustrative: true,
    },
    {
      id: "drum-decoration",
      name: "Vành trang trí",
      title: "Những vòng trang trí",
      story:
        "Các vòng nổi là chi tiết giản lược để gợi vị trí trang trí trên thân trống. Đây là lớp minh họa của mô hình, không phải các vòng kim loại có thể tháo rời.",
      isIllustrative: true,
    },
    {
      id: "drum-face",
      name: "Mặt trống",
      title: "Mặt trống: góc nhìn từ phía trên",
      story:
        "Lớp này tập trung vào mặt trống. Xoay mô hình để quan sát từ phía trên và từ nhiều góc khác nhau.",
      isIllustrative: true,
    },
  ],

  jar: [
    {
      id: "jar-body",
      name: "Thân thạp",
      title: "Thân thạp: dáng hình và công năng",
      story:
        "Thân thạp là phần chính của hiện vật. Mô hình thể hiện thân thạp thuôn dần về phía đáy để du khách dễ quan sát hình dáng tổng thể.",
      isIllustrative: false,
    },
    {
      id: "jar-body-decoration",
      name: "Hoa văn thân",
      title: "Những dải trang trí trên thân",
      story:
        "Các dải nổi giúp làm rõ vị trí những đường trang trí trên mô hình. Đây là lớp minh họa bề mặt, không phải bộ phận có thể tháo rời khỏi thạp.",
      isIllustrative: true,
    },
    {
      id: "jar-lid",
      name: "Nắp thạp",
      title: "Nắp: phần riêng của hiện vật",
      story:
        "Nắp là phần riêng đặt trên miệng thạp. Hãy xoay mô hình để quan sát dáng nắp từ bên cạnh và phía trên.",
      isIllustrative: false,
    },
    {
      id: "jar-lid-decoration",
      name: "Hoa văn nắp",
      title: "Chi tiết trang trí trên nắp",
      story:
        "Các vòng và họa tiết trên nắp được đơn giản hóa để làm nổi bật cách trang trí trong mô hình. Đây không phải bản quét chính xác hoa văn của hiện vật.",
      isIllustrative: true,
    },
  ],

  dagger: [
    {
      id: "dagger-blade",
      name: "Lưỡi dao",
      title: "Lưỡi dao: phần tạo hình chính",
      story:
        "Lớp này tập trung vào lưỡi dao trong mô hình. Hình dáng được dựng giản lược để khách tham quan có thể xoay và quan sát.",
      isIllustrative: true,
    },
    {
      id: "dagger-grip",
      name: "Chuôi dao",
      title: "Chuôi dao: nơi cầm nắm",
      story:
        "Chuôi được tách riêng trong mô hình để làm rõ cách các phần được bố trí. Cách tách lớp này phục vụ trải nghiệm, không khẳng định cấu tạo chính xác của hiện vật.",
      isIllustrative: true,
    },
    {
      id: "dagger-pommel",
      name: "Đầu chuôi",
      title: "Đầu chuôi: chi tiết ở phần trên",
      story:
        "Đầu chuôi được phóng tách để du khách dễ quan sát. Đây là hình khối minh họa của mô hình 3D, không phải bản quét hiện vật.",
      isIllustrative: true,
    },
  ],
};

const craftingSteps = [
  {
    id: "mold",
    number: "01",
    name: "Tạo khuôn",
    title: "Bước 1 · Tạo mẫu và khuôn",
    story:
      "Người thợ chuẩn bị mẫu và tạo khuôn theo hình dáng sản phẩm. Khuôn trong cảnh 3D được giản lược để khách tham quan dễ hình dung.",
  },
  {
    id: "pour",
    number: "02",
    name: "Rót đồng",
    title: "Bước 2 · Rót đồng nóng chảy",
    story:
      "Kim loại nóng chảy được rót vào khuôn. Dòng đồng phát sáng trong cảnh là hiệu ứng minh họa cho công đoạn này.",
  },
  {
    id: "release",
    number: "03",
    name: "Tháo khuôn",
    title: "Bước 3 · Lấy vật đúc",
    story:
      "Sau khi vật đúc nguội, người thợ tháo hoặc phá khuôn để lấy sản phẩm. Cấu tạo khuôn cụ thể có thể khác tùy hiện vật.",
  },
  {
    id: "finish",
    number: "04",
    name: "Hoàn thiện",
    title: "Bước 4 · Làm sạch và hoàn thiện",
    story:
      "Vật đúc được làm sạch, kiểm tra và hoàn thiện bề mặt. Ánh sáng trong cảnh mô phỏng công đoạn này, không phải cảnh tư liệu.",
  },
];

const chapterFocus: Record<
  ExhibitId,
  Record<
    StoryChapter,
    { targetY: number; cameraOffset: [number, number, number] }
  >
> = {
  drum: {
    overview: { targetY: 0.85, cameraOffset: [1.8, 1.2, 5.2] },
    crafting: { targetY: 0.85, cameraOffset: [1.8, 1.2, 5.2] },
  },
  jar: {
    overview: { targetY: 0.9, cameraOffset: [1.8, 1.2, 5.2] },
    crafting: { targetY: 0.9, cameraOffset: [1.8, 1.2, 5.2] },
  },
  dagger: {
    overview: { targetY: 1, cameraOffset: [1.8, 1.2, 5.2] },
    crafting: { targetY: 1, cameraOffset: [1.8, 1.2, 5.2] },
  },
};

function getGeometryType(object: THREE.Object3D): string {
  if (object instanceof THREE.Mesh) {
    return object.geometry.type;
  }

  for (const child of object.children) {
    const geometryType = getGeometryType(child);
    if (geometryType) return geometryType;
  }

  return "";
}

function getLayerId(
  exhibitId: ExhibitId,
  object: THREE.Object3D,
): string {
  const definitions = layerDefinitions[exhibitId];
  const taggedId =
    object.userData.storyPartId ??
    object.userData.storyPart?.id;

  if (
    typeof taggedId === "string" &&
    definitions.some((definition) => definition.id === taggedId)
  ) {
    return taggedId;
  }

  const geometryType = getGeometryType(object);
  const y = object.position.y;

  if (exhibitId === "drum") {
    if (geometryType === "TorusGeometry") {
      return "drum-decoration";
    }

    if (y > 1.2) {
      return "drum-face";
    }

    if (y <= 0.25) {
      return "drum-foot";
    }

    return "drum-body";
  }

  if (exhibitId === "jar") {
    if (geometryType === "LatheGeometry") {
      return "jar-body";
    }

    if (y >= 1.76) {
      return "jar-lid-decoration";
    }

    if (geometryType === "TorusGeometry" && y < 1.56) {
      return "jar-body-decoration";
    }

    if (y >= 1.54) {
      return "jar-lid";
    }

    return "jar-body";
  }

  if (geometryType === "SphereGeometry") {
    return "dagger-pommel";
  }

  if (geometryType === "CylinderGeometry") {
    return "dagger-grip";
  }

  return "dagger-blade";
}

function createRuntimeLayers(
  exhibitId: ExhibitId,
  artifact: THREE.Group,
): RuntimeLayer[] {
  const definitions = layerDefinitions[exhibitId];
  const originalChildren = [...artifact.children];
  const groups = new Map<string, THREE.Group>();

  definitions.forEach((definition) => {
    const group = new THREE.Group();
    group.name = `story-layer-${definition.id}`;
    group.userData.storyPartId = definition.id;
    groups.set(definition.id, group);
    artifact.add(group);
  });

  originalChildren.forEach((child) => {
    const layerId = getLayerId(exhibitId, child);
    const group =
      groups.get(layerId) ?? groups.get(definitions[0].id);

    if (!group) return;

    artifact.remove(child);
    group.add(child);
  });

  artifact.updateMatrixWorld(true);

  const artifactBounds = new THREE.Box3().setFromObject(artifact);
  const rowY = artifactBounds.getCenter(new THREE.Vector3()).y;

  return definitions.map((definition, index) => {
    const group = groups.get(definition.id)!;
    const bounds = new THREE.Box3().setFromObject(group);
    const assembledCenter = bounds.isEmpty()
      ? new THREE.Vector3(0, rowY, 0)
      : bounds.getCenter(new THREE.Vector3());

    return {
      definition,
      group,
      assembledPosition: group.position.clone(),
      assembledCenter,
      rowY,
      index,
    };
  });
}

function createCastingVisual(artifact: THREE.Group): CastingVisual {
  const bounds = new THREE.Box3().setFromObject(artifact);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());

  const radius = Math.max(size.x, size.z) * 0.62 + 0.12;
  const moldHeight = Math.max(size.y + 0.24, 1.2);
  const baseY = bounds.min.y;
  const topY = bounds.max.y;
  const faceBaseY = topY + 0.08;

  const root = new THREE.Group();
  root.name = "casting-process";

  const clayMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b5740,
    roughness: 0.94,
    metalness: 0.02,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.86,
    depthWrite: false,
  });

  const moltenMaterial = new THREE.MeshStandardMaterial({
    color: 0xffa334,
    emissive: 0xff6a12,
    emissiveIntensity: 2.2,
    metalness: 0.62,
    roughness: 0.28,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const pourMaterial = new THREE.MeshStandardMaterial({
    color: 0xffa334,
    emissive: 0xff6a12,
    emissiveIntensity: 2.4,
    metalness: 0.62,
    roughness: 0.28,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const leftMold = new THREE.Mesh(
    new THREE.CylinderGeometry(
      radius,
      radius,
      moldHeight,
      48,
      1,
      true,
      0,
      Math.PI,
    ),
    clayMaterial,
  );
  leftMold.position.set(center.x, baseY + moldHeight / 2, center.z);

  const rightMold = new THREE.Mesh(
    new THREE.CylinderGeometry(
      radius,
      radius,
      moldHeight,
      48,
      1,
      true,
      Math.PI,
      Math.PI,
    ),
    clayMaterial,
  );
  rightMold.position.set(center.x, baseY + moldHeight / 2, center.z);

  const faceMold = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.14, 48),
    clayMaterial,
  );
  faceMold.position.set(center.x, faceBaseY, center.z);

  const moltenMetal = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.7, radius * 0.7, 1, 48),
    moltenMaterial,
  );
  moltenMetal.position.set(center.x, baseY, center.z);
  moltenMetal.scale.y = 0.01;

  const pourStream = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.11, 1, 16),
    pourMaterial,
  );
  pourStream.position.set(center.x, topY + 0.65, center.z);
  pourStream.scale.y = 1.2;

  root.add(leftMold, rightMold, faceMold, moltenMetal, pourStream);

  return {
    root,
    leftMold,
    rightMold,
    faceMold,
    moltenMetal,
    pourStream,
    clayMaterial,
    moltenMaterial,
    pourMaterial,
    centerX: center.x,
    centerY: center.y,
    centerZ: center.z,
    radius,
    baseY,
    topY,
    faceBaseY,
    moldHeight,
  };
}

function getZoomProgress(distance: number): number {
  return THREE.MathUtils.smoothstep(distance, 6.2, 10.8);
}

export function InteractiveStoryScene({
  exhibitId,
  chapter,
}: InteractiveStorySceneProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const sceneStateRef = useRef<StorySceneState | null>(null);
  const hotspotRefs = useRef(new Map<string, HTMLButtonElement>());
  const processHotspotRef = useRef<HTMLButtonElement | null>(null);
  const setActiveLayerIdRef = useRef<(id: string) => void>(() => {});
  const chapterRef = useRef(chapter);
  const processStepRef = useRef(0);
  const activeLayerIdRef = useRef("");

  const [layers, setLayers] = useState<LayerDefinition[]>([]);
  const [activeLayerId, setActiveLayerId] = useState("");
  const [processStep, setProcessStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  chapterRef.current = chapter;
  processStepRef.current = processStep;
  activeLayerIdRef.current = activeLayerId;
  setActiveLayerIdRef.current = setActiveLayerId;

  const activeLayer =
    layers.find((layer) => layer.id === activeLayerId) ?? layers[0];

  const activeCraftingStep = craftingSteps[processStep];

  useEffect(() => {
    setProcessStep(0);
    setIsPlaying(false);
  }, [exhibitId, chapter]);

  useEffect(() => {
    if (!isPlaying || chapter !== "crafting") return;

    const intervalId = window.setInterval(() => {
      setProcessStep((currentStep) => {
        if (currentStep >= craftingSteps.length - 1) {
          setIsPlaying(false);
          return currentStep;
        }

        return currentStep + 1;
      });
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [isPlaying, chapter]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    setLayers([]);
    setActiveLayerId("");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d0f);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(1.8, 2, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "story-scene-canvas";
    renderer.domElement.setAttribute(
      "aria-label",
      "Mô hình hiện vật 3D có thể xoay và tách lớp",
    );
    renderer.domElement.style.touchAction = "none";
    viewport.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xf2e8d1, 0x242a26, 2.2));

    const keyLight = new THREE.DirectionalLight(0xffd99a, 3.1);
    keyLight.position.set(-4, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x9aaec1, 16, 12);
    fillLight.position.set(4, 3, -3);
    scene.add(fillLight);

    const finishLight = new THREE.PointLight(0xffba55, 0, 8);
    finishLight.position.set(0, 1.5, 2);
    scene.add(finishLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({
        color: 0x101513,
        roughness: 0.95,
        metalness: 0.05,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.2;
    scene.add(floor);

    const displayBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.85, 1.95, 0.13, 80),
      new THREE.MeshStandardMaterial({
        color: 0x25251e,
        metalness: 0.42,
        roughness: 0.48,
      }),
    );
    displayBase.position.y = -0.13;
    scene.add(displayBase);

    const displayRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.72, 0.023, 8, 100),
      new THREE.MeshStandardMaterial({
        color: 0xc79b4e,
        metalness: 0.8,
        roughness: 0.28,
        emissive: 0x3b2410,
      }),
    );
    displayRing.rotation.x = Math.PI / 2;
    displayRing.position.y = -0.055;
    scene.add(displayRing);

    const artifact = createExhibitArtifact(exhibitId);
    const runtimeLayers = createRuntimeLayers(exhibitId, artifact);
    const castingVisual = createCastingVisual(artifact);

    scene.add(artifact);
    scene.add(castingVisual.root);

    setLayers(runtimeLayers.map((layer) => layer.definition));
    setActiveLayerId(runtimeLayers[0]?.definition.id ?? "");

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minDistance = 2.8;
    controls.maxDistance = 12;
    controls.zoomSpeed = 0.8;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.set(0, 0.85, 0);
    controls.update();

    const resize = () => {
      const width = viewport.clientWidth || 1;
      const height = viewport.clientHeight || 1;

      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(viewport);
    resize();

    const raycaster = new THREE.Raycaster();
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
      const pointer = new THREE.Vector2(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );

      raycaster.setFromCamera(pointer, camera);

      for (const intersection of raycaster.intersectObject(artifact, true)) {
        let object: THREE.Object3D | null = intersection.object;

        while (object && !object.userData.storyPartId) {
          object = object.parent;
        }

        const layerId = object?.userData.storyPartId;
        if (typeof layerId === "string") {
          setActiveLayerIdRef.current(layerId);
          return;
        }
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    const clock = new THREE.Clock();
    const bounds = new THREE.Box3();

    let smoothExplodeProgress = 0;
    let smoothMoldOpenProgress = 0;
    let smoothFaceLift = 0;
    let smoothMoltenOpacity = 0;
    let smoothPourOpacity = 0;
    let smoothMoltenFill = 0;
    let smoothArtifactReveal = 0;
    let smoothFinishLight = 0;

    let animationFrame = 0;

    const projectHotspot = (
      element: HTMLButtonElement | null | undefined,
      position: THREE.Vector3,
      width: number,
      height: number,
    ) => {
      if (!element) return;

      position.project(camera);

      const inView =
        position.z >= -1 &&
        position.z <= 1 &&
        position.x >= -1 &&
        position.x <= 1 &&
        position.y >= -1 &&
        position.y <= 1;

      element.style.visibility = inView ? "visible" : "hidden";

      if (!inView) return;

      element.style.left = `${(position.x * 0.5 + 0.5) * width}px`;
      element.style.top = `${(-position.y * 0.5 + 0.5) * height}px`;
    };

    const render = () => {
      animationFrame = window.requestAnimationFrame(render);
      controls.update();

      const delta = clock.getDelta();
      const elapsed = clock.elapsedTime;
      const distance = camera.position.distanceTo(controls.target);
      const isCrafting = chapterRef.current === "crafting";
      const step = processStepRef.current;
      const lastStep = craftingSteps.length - 1;
      const width = viewport.clientWidth;
      const height = viewport.clientHeight;

      smoothExplodeProgress = THREE.MathUtils.damp(
        smoothExplodeProgress,
        isCrafting ? 0 : getZoomProgress(distance),
        2.8,
        delta,
      );

      const spacing = width < 760 ? 1.2 : 1.9;
      const layerCount = runtimeLayers.length;

      runtimeLayers.forEach((layer) => {
        const targetX =
          (layer.index - (layerCount - 1) / 2) * spacing;

        const explodedPosition = new THREE.Vector3(
          targetX - layer.assembledCenter.x,
          layer.rowY - layer.assembledCenter.y,
          -layer.assembledCenter.z,
        );

        const stagger = layer.index * 0.035;
        const layerProgress = THREE.MathUtils.smoothstep(
          smoothExplodeProgress,
          stagger,
          0.88 + stagger,
        );

        layer.group.position.lerpVectors(
          layer.assembledPosition,
          explodedPosition,
          layerProgress,
        );
      });

      const targetArtifactReveal =
        isCrafting && step === lastStep ? 1 : 0;

      smoothArtifactReveal = THREE.MathUtils.damp(
        smoothArtifactReveal,
        targetArtifactReveal,
        3,
        delta,
      );

      artifact.visible = !isCrafting || step === lastStep;

      castingVisual.root.visible =
        isCrafting && (step < lastStep || smoothArtifactReveal < 0.99);

      castingVisual.clayMaterial.opacity =
        0.86 * (1 - smoothArtifactReveal);

      smoothMoldOpenProgress = THREE.MathUtils.damp(
        smoothMoldOpenProgress,
        isCrafting && step >= 2 ? 1 : 0,
        3,
        delta,
      );

      castingVisual.leftMold.position.x =
        castingVisual.centerX -
        castingVisual.radius * 1.55 * smoothMoldOpenProgress;

      castingVisual.rightMold.position.x =
        castingVisual.centerX +
        castingVisual.radius * 1.55 * smoothMoldOpenProgress;

      const targetFaceLift =
        isCrafting && step === 1
          ? 0.42
          : isCrafting && step >= 2
            ? 0.9
            : 0;

      smoothFaceLift = THREE.MathUtils.damp(
        smoothFaceLift,
        targetFaceLift,
        3,
        delta,
      );

      castingVisual.faceMold.position.y =
        castingVisual.faceBaseY + smoothFaceLift;

      const targetMoltenOpacity =
        isCrafting && (step === 1 || step === 2) ? 1 : 0;

      const targetPourOpacity =
        isCrafting && step === 1 ? 1 : 0;

      const targetMoltenFill =
        isCrafting && step === 1
          ? 0.62
          : isCrafting && step === 2
            ? 1
            : 0;

      smoothMoltenOpacity = THREE.MathUtils.damp(
        smoothMoltenOpacity,
        targetMoltenOpacity,
        3,
        delta,
      );

      smoothPourOpacity = THREE.MathUtils.damp(
        smoothPourOpacity,
        targetPourOpacity,
        3.5,
        delta,
      );

      smoothMoltenFill = THREE.MathUtils.damp(
        smoothMoltenFill,
        targetMoltenFill,
        2.8,
        delta,
      );

      castingVisual.moltenMaterial.opacity = smoothMoltenOpacity;
      castingVisual.pourMaterial.opacity =
        smoothPourOpacity * (0.9 + Math.sin(elapsed * 8) * 0.1);

      castingVisual.moltenMetal.visible =
        smoothMoltenOpacity > 0.01;
      castingVisual.pourStream.visible =
        smoothPourOpacity > 0.01;

      const fillHeight = Math.max(
        0.01,
        castingVisual.moldHeight * smoothMoltenFill,
      );

      castingVisual.moltenMetal.scale.y = fillHeight;
      castingVisual.moltenMetal.position.y =
        castingVisual.baseY + fillHeight / 2;

      castingVisual.pourStream.scale.y =
        1.2 + Math.sin(elapsed * 8) * 0.08;

      smoothFinishLight = THREE.MathUtils.damp(
        smoothFinishLight,
        isCrafting && step === lastStep ? 10 : 0,
        2.5,
        delta,
      );

      finishLight.intensity =
        smoothFinishLight +
        Math.sin(elapsed * 3) * smoothFinishLight * 0.12;

      finishLight.position.x =
        castingVisual.centerX +
        Math.sin(elapsed * 1.2) * castingVisual.radius;

      if (progressRef.current) {
        progressRef.current.style.transform =
          `scaleX(${smoothExplodeProgress})`;
      }

      scene.updateMatrixWorld(true);
      camera.updateMatrixWorld();

      runtimeLayers.forEach((layer) => {
        const hotspot = hotspotRefs.current.get(layer.definition.id);

        if (isCrafting || !hotspot) {
          if (hotspot) hotspot.style.visibility = "hidden";
          return;
        }

        const shouldShow =
          smoothExplodeProgress > 0.12 ||
          layer.definition.id === activeLayerIdRef.current;

        if (!shouldShow) {
          hotspot.style.visibility = "hidden";
          return;
        }

        bounds.setFromObject(layer.group);

        projectHotspot(
          hotspot,
          bounds.getCenter(new THREE.Vector3()),
          width,
          height,
        );
      });

      const processHotspot = processHotspotRef.current;

      if (!isCrafting || !processHotspot) {
        if (processHotspot) {
          processHotspot.style.visibility = "hidden";
        }
      } else {
        let processPoint: THREE.Vector3;

        if (step === 0) {
          processPoint = castingVisual.leftMold.position
            .clone()
            .applyMatrix4(castingVisual.root.matrixWorld);
        } else if (step === 1) {
          processPoint = castingVisual.pourStream.position
            .clone()
            .applyMatrix4(castingVisual.root.matrixWorld);
        } else if (step === 2) {
          processPoint = castingVisual.rightMold.position
            .clone()
            .applyMatrix4(castingVisual.root.matrixWorld);
        } else {
          processPoint = new THREE.Vector3(
            castingVisual.centerX + castingVisual.radius * 0.9,
            castingVisual.topY + 0.3,
            castingVisual.centerZ,
          );
        }

        projectHotspot(processHotspot, processPoint, width, height);
      }

      renderer.render(scene, camera);
    };

    render();

    sceneStateRef.current = { camera, controls };

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();

      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);

      controls.dispose();

      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();

      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;

        geometries.add(object.geometry);

        const meshMaterials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        meshMaterials.forEach((material) => materials.add(material));
      });

      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());

      renderer.dispose();
      renderer.domElement.remove();
      sceneStateRef.current = null;
    };
  }, [exhibitId]);

  useEffect(() => {
    const state = sceneStateRef.current;
    if (!state) return;

    const focus = chapterFocus[exhibitId][chapter];
    const target = new THREE.Vector3(0, focus.targetY, 0);
    const offset = new THREE.Vector3(...focus.cameraOffset);

    state.controls.target.copy(target);
    state.camera.position.copy(target).add(offset);
    state.controls.update();
  }, [exhibitId, chapter]);

  const selectProcessStep = (step: number) => {
    setIsPlaying(false);
    setProcessStep(
      THREE.MathUtils.clamp(step, 0, craftingSteps.length - 1),
    );
  };

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (processStep >= craftingSteps.length - 1) {
      setProcessStep(0);
    }

    setIsPlaying(true);
  };

  return (
    <section
      className="interactive-story-scene"
      aria-label="Khám phá hiện vật theo từng lớp"
    >
      <div className="story-scene-viewport" ref={viewportRef}>
        <div className="story-scene-instructions">
          <span className="story-scene-eyebrow">
            {chapter === "crafting" ? "TÁI DỰNG CHẾ TÁC" : "KHÁM PHÁ 3D"}
          </span>
          <strong>
            {chapter === "crafting"
              ? "Chạm hotspot để xem từng công đoạn"
              : "Thu nhỏ để tách lớp · Phóng to để ráp lại"}
          </strong>
        </div>

        {chapter === "overview" && (
          <div className="story-explosion-meter" aria-hidden="true">
            <span>TÁCH LỚP</span>
            <div className="story-explosion-track">
              <span ref={progressRef} />
            </div>
          </div>
        )}

        {layers.map((layer, index) => (
          <button
            key={layer.id}
            ref={(element) => {
              if (element) {
                hotspotRefs.current.set(layer.id, element);
              } else {
                hotspotRefs.current.delete(layer.id);
              }
            }}
            className={`story-part-hotspot ${
              activeLayer?.id === layer.id ? "is-active" : ""
            }`}
            type="button"
            aria-label={`Xem câu chuyện: ${layer.name}`}
            aria-pressed={activeLayer?.id === layer.id}
            style={{ left: "50%", top: "50%" }}
            onClick={() => setActiveLayerId(layer.id)}
          >
            <span className="story-part-hotspot-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="story-part-hotspot-dot" aria-hidden="true" />
            <span className="story-part-hotspot-name">{layer.name}</span>
          </button>
        ))}

        {chapter === "crafting" && activeCraftingStep && (
          <button
            key={activeCraftingStep.id}
            ref={(element) => {
              processHotspotRef.current = element;
            }}
            className="casting-process-hotspot is-active"
            type="button"
            aria-label={`${activeCraftingStep.number} ${activeCraftingStep.name}`}
            aria-pressed="true"
            style={{ left: "50%", top: "50%" }}
            onClick={() => setIsPlaying(false)}
          >
            <span className="casting-process-number">
              {activeCraftingStep.number}
            </span>
            <span className="casting-process-name">
              {activeCraftingStep.name}
            </span>
          </button>
        )}

        {chapter === "crafting" && activeCraftingStep ? (
          <aside className="casting-story-card">
            <span className="story-scene-eyebrow">
              CÔNG ĐOẠN {activeCraftingStep.number} / 04
            </span>

            <div
              key={activeCraftingStep.id}
              className="casting-step-copy"
            >
              <h3>{activeCraftingStep.title}</h3>
              <p>{activeCraftingStep.story}</p>
            </div>

            <div className="casting-controls">
              <button
                type="button"
                onClick={() => selectProcessStep(processStep - 1)}
                disabled={processStep === 0}
              >
                Trước
              </button>

              <button
                type="button"
                className="casting-play-button"
                onClick={togglePlayback}
              >
                {isPlaying ? "Tạm dừng" : "▶ Tự chạy"}
              </button>

              <button
                type="button"
                onClick={() => selectProcessStep(processStep + 1)}
                disabled={processStep === craftingSteps.length - 1}
              >
                Tiếp
              </button>
            </div>

            <small>
              Đây là mô phỏng quy trình đúc ở mức khái quát, không phải video
              tư liệu hoặc bản phục dựng chính xác từng thao tác của hiện vật.
            </small>
          </aside>
        ) : (
          activeLayer && (
            <article className="story-layer-story">
              <span className="story-scene-eyebrow">
                CÂU CHUYỆN TỪNG PHẦN
              </span>
              <h3>{activeLayer.title}</h3>
              <p>{activeLayer.story}</p>

              {activeLayer.isIllustrative && (
                <small>
                  Lớp tách này được dựng để minh họa, không khẳng định đây là
                  bộ phận tháo rời thật của hiện vật.
                </small>
              )}
            </article>
          )
        )}

        <p className="story-scene-help">
          {chapter === "crafting"
            ? "Kéo để xoay · Chạm hotspot hiện tại để dừng phần tự chạy"
            : "Kéo để xoay · Thu nhỏ để tách lớp · Chạm hotspot để đọc câu chuyện"}
        </p>
      </div>
    </section>
  );
}