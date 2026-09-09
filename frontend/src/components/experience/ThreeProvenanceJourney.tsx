'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeProvenanceJourneyProps {
  scrollProgress: number; // 0 to 1
}

export default function ThreeProvenanceJourney({ scrollProgress }: ThreeProvenanceJourneyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollRef = useRef(scrollProgress);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 580;

    // 1. Scene & Camera Setup (Centered Perspective)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 7.8);

    // 2. High-Performance WebGL Renderer with ACES Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.96; // Golden Hour exposure
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    // =========================================================================
    // 3. DARK CINEMATIC STUDIO ENVIRONMENT MAP (Golden Hour Softboxes)
    // =========================================================================
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envCanvas = document.createElement('canvas');
    envCanvas.width = 1024;
    envCanvas.height = 512;
    const eCtx = envCanvas.getContext('2d')!;

    // Soft studio cyclorama gradient
    const bgGrad = eCtx.createLinearGradient(0, 0, 0, 512);
    bgGrad.addColorStop(0.0, '#1c2438');
    bgGrad.addColorStop(0.4, '#0f172a');
    bgGrad.addColorStop(0.8, '#080c14');
    bgGrad.addColorStop(1.0, '#020408');
    eCtx.fillStyle = bgGrad;
    eCtx.fillRect(0, 0, 1024, 512);

    // Overhead Softbox (Warm Golden Studio Halogen)
    const topSoftbox = eCtx.createRadialGradient(512, 90, 10, 512, 90, 250);
    topSoftbox.addColorStop(0, 'rgba(255, 248, 230, 0.9)');
    topSoftbox.addColorStop(0.5, 'rgba(251, 191, 36, 0.4)');
    topSoftbox.addColorStop(1, 'rgba(0, 0, 0, 0)');
    eCtx.fillStyle = topSoftbox;
    eCtx.beginPath();
    eCtx.ellipse(512, 90, 270, 75, 0, 0, Math.PI * 2);
    eCtx.fill();

    // Pure White Vertical Strip Softbox (Left) - Specular glints
    const leftStrip = eCtx.createLinearGradient(160, 0, 205, 0);
    leftStrip.addColorStop(0, 'rgba(255, 255, 255, 0)');
    leftStrip.addColorStop(0.5, 'rgba(255, 255, 255, 0.92)');
    leftStrip.addColorStop(1, 'rgba(255, 255, 255, 0)');
    eCtx.fillStyle = leftStrip;
    eCtx.fillRect(160, 80, 45, 360);

    // Warm Golden Vertical Strip Softbox (Right) - Golden rim
    const rightStrip = eCtx.createLinearGradient(815, 0, 870, 0);
    rightStrip.addColorStop(0, 'rgba(245, 158, 11, 0)');
    rightStrip.addColorStop(0.5, 'rgba(251, 191, 36, 0.95)');
    rightStrip.addColorStop(1, 'rgba(245, 158, 11, 0)');
    eCtx.fillStyle = rightStrip;
    eCtx.fillRect(815, 80, 55, 360);

    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    const envRenderTarget = pmremGenerator.fromEquirectangular(envTexture);
    scene.environment = envRenderTarget.texture;

    // =========================================================================
    // 4. CALIBRATED GOLDEN HOUR LIGHTING RIG
    // =========================================================================
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    keyLight.position.set(4.5, 6.5, 4.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.radius = 2.0;
    scene.add(keyLight);

    const amberBacklight = new THREE.DirectionalLight(0xf59e0b, 3.6);
    amberBacklight.position.set(0, 2.8, -5.0);
    scene.add(amberBacklight);

    const coolFillLight = new THREE.DirectionalLight(0x94a3b8, 1.2);
    coolFillLight.position.set(-4.8, 3.2, 3.5);
    scene.add(coolFillLight);

    const overheadSpot = new THREE.SpotLight(0xfffae8, 1.8, 16, Math.PI / 4.2, 0.85);
    overheadSpot.position.set(0, 4.8, 1.2);
    overheadSpot.castShadow = true;
    overheadSpot.shadow.bias = -0.0003;
    scene.add(overheadSpot);

    const warmUnderBounce = new THREE.DirectionalLight(0xb45309, 1.1);
    warmUnderBounce.position.set(0, -3.8, 1.6);
    scene.add(warmUnderBounce);

    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.42);
    scene.add(ambientLight);

    const honeyCoreLight = new THREE.PointLight(0xf59e0b, 1.8, 6.5);
    honeyCoreLight.position.set(0, -0.3, 0.3);
    scene.add(honeyCoreLight);

    // =========================================================================
    // 5. NATURAL RADIAL CONTACT SHADOW DISC (Zero Square Box Artifacts in Light/Dark Mode)
    // =========================================================================
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const scCtx = shadowCanvas.getContext('2d')!;
    const scGrad = scCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    scGrad.addColorStop(0.0, 'rgba(15, 23, 42, 0.45)');
    scGrad.addColorStop(0.35, 'rgba(15, 23, 42, 0.22)');
    scGrad.addColorStop(0.7, 'rgba(15, 23, 42, 0.05)');
    scGrad.addColorStop(1.0, 'rgba(15, 23, 42, 0.0)');
    scCtx.fillStyle = scGrad;
    scCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const softGroundDisc = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 3.8),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    softGroundDisc.rotation.x = -Math.PI / 2;
    softGroundDisc.position.y = -1.68;
    scene.add(softGroundDisc);

    // Soft Warm Caustic Halo
    const causticCanvas = document.createElement('canvas');
    causticCanvas.width = 256;
    causticCanvas.height = 256;
    const cstCtx = causticCanvas.getContext('2d')!;
    const cstGrad = cstCtx.createRadialGradient(128, 128, 5, 128, 128, 120);
    cstGrad.addColorStop(0.0, 'rgba(217, 119, 6, 0.25)');
    cstGrad.addColorStop(0.5, 'rgba(180, 83, 9, 0.1)');
    cstGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    cstCtx.fillStyle = cstGrad;
    cstCtx.fillRect(0, 0, 256, 256);

    const causticTexture = new THREE.CanvasTexture(causticCanvas);
    const causticDisc = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 4.2),
      new THREE.MeshBasicMaterial({ map: causticTexture, transparent: true, depthWrite: false })
    );
    causticDisc.rotation.x = -Math.PI / 2;
    causticDisc.position.y = -1.67;
    scene.add(causticDisc);

    // =========================================================================
    // 6. FLOATING GOLDEN POLLEN MOTES
    // =========================================================================
    const pollenCount = 65;
    const pollenGeom = new THREE.BufferGeometry();
    const pollenPositions = new Float32Array(pollenCount * 3);
    const pollenVelocities: { x: number; y: number; z: number; phase: number }[] = [];

    for (let i = 0; i < pollenCount; i++) {
      pollenPositions[i * 3 + 0] = (Math.random() - 0.5) * 8.0;
      pollenPositions[i * 3 + 1] = -1.6 + Math.random() * 4.0;
      pollenPositions[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
      pollenVelocities.push({
        x: (Math.random() - 0.5) * 0.007,
        y: 0.003 + Math.random() * 0.008,
        z: (Math.random() - 0.5) * 0.007,
        phase: Math.random() * Math.PI * 2,
      });
    }
    pollenGeom.setAttribute('position', new THREE.BufferAttribute(pollenPositions, 3));

    const pollenCanvas = document.createElement('canvas');
    pollenCanvas.width = 64;
    pollenCanvas.height = 64;
    const pCtx = pollenCanvas.getContext('2d')!;
    const pGrad = pCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
    pGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
    pGrad.addColorStop(0.4, 'rgba(217, 119, 6, 0.75)');
    pGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);
    const pollenTexture = new THREE.CanvasTexture(pollenCanvas);

    const pollenMaterial = new THREE.PointsMaterial({
      size: 0.14,
      map: pollenTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pollenPoints = new THREE.Points(pollenGeom, pollenMaterial);
    scene.add(pollenPoints);

    // =========================================================================
    // 7. LIGHTWEIGHT, HIGH-CONTRAST PROCEDURAL TEXTURES (1024x768 - Zero Lag)
    // =========================================================================
    const createHoneyGradientTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0.0, '#fed7aa');
      grad.addColorStop(0.12, '#f59e0b');
      grad.addColorStop(0.45, '#d97706');
      grad.addColorStop(0.82, '#92400e');
      grad.addColorStop(1.0, '#581c08');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 512);
      return new THREE.CanvasTexture(canvas);
    };

    const honeyGradientTex = createHoneyGradientTexture();
    const honeyMaterial = new THREE.MeshPhysicalMaterial({
      map: honeyGradientTex,
      emissiveMap: honeyGradientTex,
      emissive: new THREE.Color(0x92400e),
      emissiveIntensity: 0.2,
      roughness: 0.06,
      metalness: 0.02,
      clearcoat: 0.98,
      clearcoatRoughness: 0.02,
      ior: 1.54,
      depthWrite: true,
    });

    // 1024x1024 Cedar Wood Texture (Fast, Smooth, Beautiful)
    const createCedarWoodTextures = () => {
      const diffuseCanvas = document.createElement('canvas');
      diffuseCanvas.width = 1024;
      diffuseCanvas.height = 1024;
      const dCtx = diffuseCanvas.getContext('2d')!;

      const bumpCanvas = document.createElement('canvas');
      bumpCanvas.width = 1024;
      bumpCanvas.height = 1024;
      const bCtx = bumpCanvas.getContext('2d')!;

      const baseGrad = dCtx.createLinearGradient(0, 0, 0, 1024);
      baseGrad.addColorStop(0, '#b87038');
      baseGrad.addColorStop(0.5, '#9e5927');
      baseGrad.addColorStop(1, '#783812');
      dCtx.fillStyle = baseGrad;
      dCtx.fillRect(0, 0, 1024, 1024);

      bCtx.fillStyle = '#808080';
      bCtx.fillRect(0, 0, 1024, 1024);

      const plankHeight = 128;
      for (let y = 0; y < 1024; y += plankHeight) {
        const isAlt = (y / plankHeight) % 2 === 1;
        dCtx.fillStyle = isAlt ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)';
        dCtx.fillRect(0, y, 1024, plankHeight);

        dCtx.strokeStyle = '#381604';
        dCtx.lineWidth = 6;
        dCtx.beginPath();
        dCtx.moveTo(0, y);
        dCtx.lineTo(1024, y);
        dCtx.stroke();

        bCtx.strokeStyle = '#101010';
        bCtx.lineWidth = 7;
        bCtx.beginPath();
        bCtx.moveTo(0, y);
        bCtx.lineTo(1024, y);
        bCtx.stroke();

        dCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        dCtx.lineWidth = 3;
        dCtx.beginPath();
        dCtx.moveTo(0, y + 4);
        dCtx.lineTo(1024, y + 4);
        dCtx.stroke();

        bCtx.strokeStyle = '#ffffff';
        bCtx.lineWidth = 3;
        bCtx.beginPath();
        bCtx.moveTo(0, y + 4);
        bCtx.lineTo(1024, y + 4);
        bCtx.stroke();
      }

      // Box Finger Joints
      const jointW = 55;
      const fingerH = 64;
      for (let fy = 0; fy < 1024; fy += fingerH * 2) {
        dCtx.fillStyle = '#5c2b0d';
        dCtx.fillRect(0, fy, jointW, fingerH);
        dCtx.strokeStyle = '#2d1203';
        dCtx.lineWidth = 2;
        dCtx.strokeRect(0, fy, jointW, fingerH);

        dCtx.fillStyle = '#5c2b0d';
        dCtx.fillRect(1024 - jointW, fy + fingerH, jointW, fingerH);
        dCtx.strokeRect(1024 - jointW, fy + fingerH, jointW, fingerH);
      }

      // Wood Knots
      const knots = [
        { x: 210, y: 170, rx: 35, ry: 20 },
        { x: 770, y: 340, rx: 40, ry: 25 },
        { x: 430, y: 690, rx: 38, ry: 22 },
      ];
      knots.forEach((k) => {
        dCtx.fillStyle = '#291002';
        dCtx.beginPath();
        dCtx.ellipse(k.x, k.y, k.rx * 0.45, k.ry * 0.45, 0.15, 0, Math.PI * 2);
        dCtx.fill();

        dCtx.strokeStyle = 'rgba(56, 22, 6, 0.5)';
        dCtx.lineWidth = 2;
        dCtx.beginPath();
        dCtx.ellipse(k.x, k.y, k.rx, k.ry, 0.15, 0, Math.PI * 2);
        dCtx.stroke();
      });

      // Beekeeping Handhold Scoop
      const hx = 387;
      const hy = 435;
      const hw = 250;
      const hh = 60;
      dCtx.fillStyle = '#240d02';
      dCtx.beginPath();
      dCtx.roundRect(hx, hy, hw, hh, 14);
      dCtx.fill();

      dCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      dCtx.lineWidth = 3;
      dCtx.beginPath();
      dCtx.roundRect(hx, hy, hw, hh, 14);
      dCtx.stroke();

      const diffuseTex = new THREE.CanvasTexture(diffuseCanvas);
      diffuseTex.wrapS = THREE.RepeatWrapping;
      diffuseTex.wrapT = THREE.RepeatWrapping;

      const bumpTex = new THREE.CanvasTexture(bumpCanvas);
      bumpTex.wrapS = THREE.RepeatWrapping;
      bumpTex.wrapT = THREE.RepeatWrapping;

      return { diffuseTex, bumpTex };
    };

    const { diffuseTex: cedarDiffuseTex, bumpTex: cedarBumpTex } = createCedarWoodTextures();

    const woodMaterial = new THREE.MeshStandardMaterial({
      map: cedarDiffuseTex,
      bumpMap: cedarBumpTex,
      bumpScale: 0.045,
      roughness: 0.58,
      metalness: 0.02,
      envMapIntensity: 0.85,
    });

    const darkWoodMaterial = new THREE.MeshStandardMaterial({
      map: cedarDiffuseTex,
      bumpMap: cedarBumpTex,
      bumpScale: 0.04,
      color: 0x5e2d12,
      roughness: 0.68,
      metalness: 0.02,
    });

    // 1024x768 Crisp, Bold, Ultra-Readable Label (Fast & Sharp)
    const createCrispLabelTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 768;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#faf8f5';
      ctx.fillRect(0, 0, 1024, 768);

      // Dark Outer Border
      ctx.strokeStyle = '#0e2017';
      ctx.lineWidth = 12;
      ctx.strokeRect(30, 30, 964, 708);

      // Gold Inner Border
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 5;
      ctx.strokeRect(48, 48, 928, 672);

      // Center Diamond
      ctx.fillStyle = '#d4af37';
      ctx.font = 'bold 36px serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦', 512, 160);

      // Main Title: WILDFLOWER (Bold, Deep Forest Green)
      ctx.fillStyle = '#0c1a12';
      ctx.font = 'bold 84px "Cormorant Garamond", Georgia, serif';
      ctx.letterSpacing = '5px';
      ctx.fillText('WILDFLOWER', 512, 275);

      // Subtitle: HARVEST PASSPORT · EVM
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.letterSpacing = '6px';
      ctx.fillText('HARVEST PASSPORT · EVM', 512, 335);

      // Divider
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(170, 375);
      ctx.lineTo(854, 375);
      ctx.stroke();

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(170, 385);
      ctx.lineTo(854, 385);
      ctx.stroke();
      ctx.setLineDash([]);

      // Lot Number (Deep Rust Amber)
      ctx.fillStyle = '#9a3412';
      ctx.font = 'bold 36px "Courier New", monospace';
      ctx.letterSpacing = '4px';
      ctx.fillText('LOT 26 · 08 · KASHMIR', 512, 465);

      // Coordinates & Time (High Contrast Charcoal)
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 26px "Courier New", monospace';
      ctx.letterSpacing = '2px';
      ctx.fillText('31.6° N · 77.2° E · SEALED 06:45', 512, 540);

      // Verification Badge (Rich Emerald)
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 23px "Courier New", monospace';
      ctx.letterSpacing = '2px';
      ctx.fillText('✔ POLYGON ANCHORED · NTAG 424 SEALED', 512, 620);

      const tex = new THREE.CanvasTexture(canvas);
      tex.anisotropy = 8;
      return tex;
    };

    const crispLabelTex = createCrispLabelTexture();

    // Main World Stage Root
    const stageRoot = new THREE.Group();
    scene.add(stageRoot);

    // =========================================================================
    // STAGE 01: ORIGIN & BOTANY (Artisan Langstroth Hive)
    // =========================================================================
    const stage1Group = new THREE.Group();
    stageRoot.add(stage1Group);

    // 1. Hive Stand Base
    const hiveStand = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.16, 2.05), darkWoodMaterial);
    hiveStand.position.y = -1.22;
    hiveStand.castShadow = true;
    stage1Group.add(hiveStand);

    [
      { x: -1.0, z: -0.85 },
      { x: 1.0, z: -0.85 },
      { x: -1.0, z: 0.85 },
      { x: 1.0, z: 0.85 },
    ].forEach((lp) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.45, 0.16), darkWoodMaterial);
      leg.position.set(lp.x, -1.45, lp.z);
      leg.castShadow = true;
      stage1Group.add(leg);
    });

    const landingBoard = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.1, 0.65), darkWoodMaterial);
    landingBoard.position.set(0, -1.18, 1.25);
    landingBoard.rotation.x = 0.12;
    landingBoard.castShadow = true;
    stage1Group.add(landingBoard);

    const entranceGate = new THREE.Mesh(
      new THREE.BoxGeometry(1.65, 0.16, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x0a0a0a })
    );
    entranceGate.position.set(0, -1.05, 0.93);
    stage1Group.add(entranceGate);

    // 2. Brood Box
    const hiveBrood = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.55, 1.8), woodMaterial);
    hiveBrood.position.y = -0.28;
    hiveBrood.castShadow = true;
    stage1Group.add(hiveBrood);

    // 3. Super Box
    const hiveSuper = new THREE.Mesh(new THREE.BoxGeometry(2.24, 1.15, 1.84), woodMaterial);
    hiveSuper.position.y = 1.1;
    hiveSuper.castShadow = true;
    stage1Group.add(hiveSuper);

    const innerCover = new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.18, 1.96), darkWoodMaterial);
    innerCover.position.y = 1.76;
    innerCover.castShadow = true;
    stage1Group.add(innerCover);

    const metalRoofMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.92,
      roughness: 0.28,
      envMapIntensity: 1.1,
    });
    const metalRoof = new THREE.Mesh(new THREE.BoxGeometry(2.46, 0.14, 2.06), metalRoofMaterial);
    metalRoof.position.y = 1.92;
    metalRoof.castShadow = true;
    stage1Group.add(metalRoof);

    // Brass Inspection Plaque
    const brassPlaqueCanvas = document.createElement('canvas');
    brassPlaqueCanvas.width = 512;
    brassPlaqueCanvas.height = 160;
    const bpCtx = brassPlaqueCanvas.getContext('2d')!;
    bpCtx.fillStyle = '#b45309';
    bpCtx.fillRect(0, 0, 512, 160);
    bpCtx.strokeStyle = '#78350f';
    bpCtx.lineWidth = 10;
    bpCtx.strokeRect(8, 8, 496, 144);
    bpCtx.fillStyle = '#fef3c7';
    bpCtx.font = 'bold 36px monospace';
    bpCtx.textAlign = 'center';
    bpCtx.fillText('SHARMA APIARY · H-019', 256, 65);
    bpCtx.fillStyle = '#fde68a';
    bpCtx.font = 'bold 28px monospace';
    bpCtx.fillText('2,140m MSL · APIS CERANA', 256, 115);

    const brassPlaqueTex = new THREE.CanvasTexture(brassPlaqueCanvas);
    const plaqueMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 0.44),
      new THREE.MeshStandardMaterial({
        map: brassPlaqueTex,
        metalness: 0.85,
        roughness: 0.35,
      })
    );
    plaqueMesh.position.set(0, 0.42, 0.93);
    plaqueMesh.castShadow = true;
    stage1Group.add(plaqueMesh);

    // Mountain Flora
    const floraGroup = new THREE.Group();
    stage1Group.add(floraGroup);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.7 });
    const flowerMatYellow = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    const flowerMatPurple = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.4 });

    const floraStems: { mesh: THREE.Mesh; flower: THREE.Mesh; baseAngle: number; fx: number; fz: number }[] = [];
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const radius = 1.55 + (i % 3) * 0.35;
      const fx = Math.cos(angle) * radius;
      const fz = Math.sin(angle) * radius;

      const stemHeight = 0.65 + (i % 4) * 0.16;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, stemHeight, 8), stemMat);
      stem.position.set(fx, -1.35 + (i % 4) * 0.08, fz);
      stem.castShadow = true;
      floraGroup.add(stem);

      const blossom = new THREE.Mesh(
        new THREE.SphereGeometry(0.095, 8, 8),
        i % 2 === 0 ? flowerMatYellow : flowerMatPurple
      );
      blossom.position.set(fx, stem.position.y + stemHeight * 0.5, fz);
      blossom.castShadow = true;
      floraGroup.add(blossom);

      floraStems.push({ mesh: stem, flower: blossom, baseAngle: angle, fx, fz });
    }

    // Bees
    const bees: {
      mesh: THREE.Group;
      wingL: THREE.Mesh;
      wingR: THREE.Mesh;
      radiusX: number;
      radiusY: number;
      radiusZ: number;
      speed: number;
      phase: number;
      centerY: number;
    }[] = [];

    const beeBodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
    const beeStripeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
    const beeWingMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.88,
      transparent: true,
      roughness: 0.1,
      depthWrite: false,
    });

    for (let b = 0; b < 6; b++) {
      const bee = new THREE.Group();
      const bBody = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), beeBodyMat);
      bBody.scale.set(1.4, 0.9, 0.9);
      bBody.castShadow = true;
      bee.add(bBody);

      const bStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.087, 0.087, 0.055, 12), beeStripeMat);
      bStripe.rotation.z = Math.PI / 2;
      bee.add(bStripe);

      const wingL = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.09), beeWingMat);
      wingL.position.set(0, 0.09, 0.08);
      wingL.rotation.x = -Math.PI / 3;
      bee.add(wingL);

      const wingR = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.09), beeWingMat);
      wingR.position.set(0, 0.09, -0.08);
      wingR.rotation.x = Math.PI / 3;
      bee.add(wingR);

      stage1Group.add(bee);

      bees.push({
        mesh: bee,
        wingL,
        wingR,
        radiusX: 1.6 + (b % 3) * 0.4,
        radiusY: 0.35 + (b % 3) * 0.25,
        radiusZ: 1.1 + (b % 3) * 0.35,
        speed: 1.2 + b * 0.28,
        phase: b * 1.1,
        centerY: 0.2 + (b % 3) * 0.45,
      });
    }

    // =========================================================================
    // STAGE 02: IOT TELEMETRY & ARTISAN COMB EXTRACTION
    // =========================================================================
    const stage2Group = new THREE.Group();
    stageRoot.add(stage2Group);

    const combPineMat = new THREE.MeshStandardMaterial({
      map: cedarDiffuseTex,
      bumpMap: cedarBumpTex,
      bumpScale: 0.035,
      color: 0xca8a04,
      roughness: 0.62,
    });

    const frameTopBar = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.16, 0.12), combPineMat);
    frameTopBar.position.y = 1.35;
    frameTopBar.castShadow = true;
    stage2Group.add(frameTopBar);

    const frameBottomBar = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.12), combPineMat);
    frameBottomBar.position.y = -0.35;
    frameBottomBar.castShadow = true;
    stage2Group.add(frameBottomBar);

    const frameLeftBar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 0.12), combPineMat);
    frameLeftBar.position.set(-1.06, 0.5, 0);
    frameLeftBar.castShadow = true;
    stage2Group.add(frameLeftBar);

    const frameRightBar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 0.12), combPineMat);
    frameRightBar.position.set(1.06, 0.5, 0);
    frameRightBar.castShadow = true;
    stage2Group.add(frameRightBar);

    // 4 Stainless Wires
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
    const eyeletMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });

    for (let w = 0; w < 4; w++) {
      const wy = -0.15 + w * 0.42;
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 2.05, 8), wireMat);
      wire.rotation.z = Math.PI / 2;
      wire.position.set(0, wy, 0.035);
      stage2Group.add(wire);

      const eyeletL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.13, 8), eyeletMat);
      eyeletL.position.set(-1.06, wy, 0);
      stage2Group.add(eyeletL);

      const eyeletR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.13, 8), eyeletMat);
      eyeletR.position.set(1.06, wy, 0);
      stage2Group.add(eyeletR);
    }

    const combCanvas = document.createElement('canvas');
    combCanvas.width = 512;
    combCanvas.height = 384;
    const cCtx = combCanvas.getContext('2d')!;
    cCtx.fillStyle = '#92400e';
    cCtx.fillRect(0, 0, 512, 384);

    const hexRadius = 20;
    const hexH = hexRadius * Math.sqrt(3);
    for (let y = 0; y < 384 + hexH; y += hexH) {
      for (let x = 0; x < 512 + hexRadius * 3; x += hexRadius * 3) {
        cCtx.beginPath();
        for (let a = 0; a < 6; a++) {
          const ang = (Math.PI / 3) * a;
          const px = x + hexRadius * Math.cos(ang);
          const py = y + hexRadius * Math.sin(ang);
          if (a === 0) cCtx.moveTo(px, py);
          else cCtx.lineTo(px, py);
        }
        cCtx.closePath();
        cCtx.fillStyle = '#d97706';
        cCtx.fill();
        cCtx.strokeStyle = '#78350f';
        cCtx.lineWidth = 3;
        cCtx.stroke();
      }
    }

    const combTexture = new THREE.CanvasTexture(combCanvas);
    const combMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 1.5, 0.06),
      new THREE.MeshStandardMaterial({
        map: combTexture,
        roughness: 0.22,
        metalness: 0.04,
      })
    );
    combMesh.position.set(0, 0.5, 0);
    combMesh.castShadow = true;
    stage2Group.add(combMesh);

    // IoT Telemetry Sensor
    const sensorBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.36, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.32, metalness: 0.85 })
    );
    sensorBody.position.set(0.68, 1.48, 0.1);
    sensorBody.castShadow = true;
    stage2Group.add(sensorBody);

    const screwMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
    [
      { x: 0.44, y: 1.62 },
      { x: 0.92, y: 1.62 },
      { x: 0.44, y: 1.34 },
      { x: 0.92, y: 1.34 },
    ].forEach((sp) => {
      const scr = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 6), screwMat);
      scr.rotation.x = Math.PI / 2;
      scr.position.set(sp.x, sp.y, 0.192);
      stage2Group.add(scr);
    });

    const sensorCanvas = document.createElement('canvas');
    sensorCanvas.width = 256;
    sensorCanvas.height = 128;
    const sCtx = sensorCanvas.getContext('2d')!;
    sCtx.fillStyle = '#020617';
    sCtx.fillRect(0, 0, 256, 128);
    sCtx.fillStyle = '#10b981';
    sCtx.font = 'bold 36px monospace';
    sCtx.textAlign = 'center';
    sCtx.fillText('31.4°C', 128, 52);
    sCtx.fillStyle = '#38bdf8';
    sCtx.font = 'bold 22px monospace';
    sCtx.fillText('240 Hz · RH 64%', 128, 92);
    sCtx.fillStyle = '#f59e0b';
    sCtx.font = 'bold 16px monospace';
    sCtx.fillText('EVM SYNC: OK', 128, 118);
    const sensorScreenTex = new THREE.CanvasTexture(sensorCanvas);

    const sensorScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.46, 0.24),
      new THREE.MeshBasicMaterial({ map: sensorScreenTex })
    );
    sensorScreen.position.set(0.68, 1.48, 0.195);
    stage2Group.add(sensorScreen);

    // Faceted Crystal Collection Basin
    const glassCollector = new THREE.Mesh(
      new THREE.CylinderGeometry(1.18, 0.95, 0.92, 32),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.94,
        roughness: 0.04,
        ior: 1.52,
        depthWrite: false,
        transparent: true,
      })
    );
    glassCollector.position.set(0, -1.25, 0);
    glassCollector.renderOrder = 10;
    glassCollector.castShadow = true;
    stage2Group.add(glassCollector);

    const collectorPool = new THREE.Mesh(
      new THREE.CylinderGeometry(1.08, 1.08, 0.45, 32),
      honeyMaterial
    );
    collectorPool.position.set(0, -1.35, 0);
    collectorPool.renderOrder = 1;
    stage2Group.add(collectorPool);

    const stream1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 1.05, 16), honeyMaterial);
    stream1.position.set(-0.35, -0.4, 0.05);
    stream1.castShadow = true;
    stage2Group.add(stream1);

    const stream2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.05, 16), honeyMaterial);
    stream2.position.set(0.32, -0.4, 0.05);
    stream2.castShadow = true;
    stage2Group.add(stream2);

    const drops: { mesh: THREE.Mesh; startY: number; currentY: number; speed: number; x: number; z: number }[] = [];
    const dropPositions = [
      { x: -0.65, z: 0.05 },
      { x: -0.1, z: 0.08 },
      { x: 0.6, z: 0.05 },
      { x: 0.05, z: -0.05 },
    ];

    dropPositions.forEach((pos, idx) => {
      const dropGeom = new THREE.SphereGeometry(0.078, 16, 16);
      dropGeom.scale(0.8, 1.6, 0.8);
      const dropMesh = new THREE.Mesh(dropGeom, honeyMaterial);
      dropMesh.position.set(pos.x, -0.3 - idx * 0.25, pos.z);
      dropMesh.castShadow = true;
      stage2Group.add(dropMesh);

      drops.push({
        mesh: dropMesh,
        startY: -0.2,
        currentY: -0.3 - idx * 0.25,
        speed: 0.018 + idx * 0.005,
        x: pos.x,
        z: pos.z,
      });
    });

    // =========================================================================
    // STAGE 03: COLD-CHAIN ROUTE (Industrial Cryo-Drum)
    // =========================================================================
    const stage3Group = new THREE.Group();
    stageRoot.add(stage3Group);

    const drumCanvas = document.createElement('canvas');
    drumCanvas.width = 512;
    drumCanvas.height = 512;
    const drcCtx = drumCanvas.getContext('2d')!;
    drcCtx.fillStyle = '#94a3b8';
    drcCtx.fillRect(0, 0, 512, 512);
    drcCtx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    drcCtx.lineWidth = 1;
    for (let i = 0; i < 180; i++) {
      const by = Math.random() * 512;
      drcCtx.beginPath();
      drcCtx.moveTo(0, by);
      drcCtx.lineTo(512, by);
      drcCtx.stroke();
    }
    const drumBrushedTex = new THREE.CanvasTexture(drumCanvas);

    const steelMaterial = new THREE.MeshStandardMaterial({
      map: drumBrushedTex,
      color: 0xcfd8dc,
      metalness: 0.94,
      roughness: 0.26,
      envMapIntensity: 1.1,
    });

    const drumBody = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.6, 48), steelMaterial);
    drumBody.position.y = 0.0;
    drumBody.castShadow = true;
    stage3Group.add(drumBody);

    for (let r = -0.8; r <= 0.8; r += 0.8) {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.045, 16, 48), steelMaterial);
      rib.rotation.x = Math.PI / 2;
      rib.position.y = r;
      rib.castShadow = true;
      stage3Group.add(rib);
    }

    const drumLid = new THREE.Mesh(new THREE.CylinderGeometry(1.26, 1.26, 0.22, 48), steelMaterial);
    drumLid.position.y = 1.39;
    drumLid.castShadow = true;
    stage3Group.add(drumLid);

    // Toggle Clamps
    const clampMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.92, roughness: 0.25 });
    for (let c = 0; c < 3; c++) {
      const ang = (c / 3) * Math.PI * 2;
      const clampArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.12), clampMat);
      clampArm.position.set(Math.cos(ang) * 1.26, 1.34, Math.sin(ang) * 1.26);
      clampArm.rotation.y = -ang;
      stage3Group.add(clampArm);
    }

    const displayMonitor = new THREE.Mesh(
      new THREE.BoxGeometry(0.88, 0.54, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.35 })
    );
    displayMonitor.position.set(0, 0.25, 1.22);
    displayMonitor.castShadow = true;
    stage3Group.add(displayMonitor);

    const monitorCanvas = document.createElement('canvas');
    monitorCanvas.width = 512;
    monitorCanvas.height = 256;
    const mCtx = monitorCanvas.getContext('2d')!;
    mCtx.fillStyle = '#020617';
    mCtx.fillRect(0, 0, 512, 256);
    mCtx.fillStyle = '#38bdf8';
    mCtx.font = 'bold 34px monospace';
    mCtx.textAlign = 'center';
    mCtx.fillText('COLD-CHAIN ROUTE', 256, 55);
    mCtx.fillStyle = '#22c55e';
    mCtx.font = 'bold 56px monospace';
    mCtx.fillText('22.1°C OK', 256, 135);
    mCtx.fillStyle = '#f59e0b';
    mCtx.font = 'bold 26px monospace';
    mCtx.fillText('4 MULTI-SIG HANDOFFS', 256, 200);
    const monitorTexture = new THREE.CanvasTexture(monitorCanvas);

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.78, 0.42),
      new THREE.MeshBasicMaterial({ map: monitorTexture })
    );
    screenMesh.position.set(0, 0.25, 1.295);
    stage3Group.add(screenMesh);

    const lockBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    lockBeacon.position.set(0.75, 1.48, 0.85);
    stage3Group.add(lockBeacon);

    const handleGeom = new THREE.TorusGeometry(0.25, 0.045, 12, 24, Math.PI);
    const leftHandle = new THREE.Mesh(handleGeom, steelMaterial);
    leftHandle.position.set(-1.22, 0.7, 0);
    leftHandle.rotation.z = Math.PI / 2;
    leftHandle.castShadow = true;
    stage3Group.add(leftHandle);

    const rightHandle = new THREE.Mesh(handleGeom, steelMaterial);
    rightHandle.position.set(1.22, 0.7, 0);
    rightHandle.rotation.z = -Math.PI / 2;
    rightHandle.castShadow = true;
    stage3Group.add(rightHandle);

    // =========================================================================
    // STAGE 04: NABL LAB TESTING & BOTTLING
    // =========================================================================
    const stage4Group = new THREE.Group();
    stageRoot.add(stage4Group);

    const nozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.09, 0.65, 24),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 })
    );
    nozzle.position.set(0, 1.55, 0);
    nozzle.castShadow = true;
    stage4Group.add(nozzle);

    const fillingStream = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.085, 1.25, 24),
      honeyMaterial
    );
    fillingStream.position.set(0, 0.95, 0);
    stage4Group.add(fillingStream);

    const stage4JarPoints: THREE.Vector2[] = [
      new THREE.Vector2(0, -1.65),
      new THREE.Vector2(1.18, -1.65),
      new THREE.Vector2(1.26, -1.35),
      new THREE.Vector2(1.26, 0.6),
      new THREE.Vector2(1.16, 0.95),
      new THREE.Vector2(0.95, 1.25),
      new THREE.Vector2(0.95, 1.55),
      new THREE.Vector2(0.85, 1.55),
      new THREE.Vector2(0.85, 1.25),
      new THREE.Vector2(1.18, 0.95),
      new THREE.Vector2(1.18, -1.35),
      new THREE.Vector2(0, -1.55),
    ];
    const stage4JarGeom = new THREE.LatheGeometry(stage4JarPoints, 48);
    const stage4Jar = new THREE.Mesh(
      stage4JarGeom,
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.94,
        roughness: 0.03,
        ior: 1.52,
        depthWrite: false,
        transparent: true,
      })
    );
    stage4Jar.renderOrder = 10;
    stage4Jar.castShadow = true;
    stage4Group.add(stage4Jar);

    const stage4HoneyGeom = new THREE.CylinderGeometry(1.14, 1.14, 2.1, 48);
    const stage4Honey = new THREE.Mesh(stage4HoneyGeom, honeyMaterial);
    stage4Honey.position.set(0, -0.4, 0);
    stage4Honey.renderOrder = 1;
    stage4Group.add(stage4Honey);

    const stage4LabelMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.27, 1.27, 1.55, 48, 1, true, -Math.PI * 0.32, Math.PI * 0.64),
      new THREE.MeshStandardMaterial({ map: crispLabelTex, roughness: 0.45, side: THREE.DoubleSide })
    );
    stage4LabelMesh.position.set(0, -0.3, 0);
    stage4LabelMesh.renderOrder = 3;
    stage4Group.add(stage4LabelMesh);

    const labBannerCanvas = document.createElement('canvas');
    labBannerCanvas.width = 512;
    labBannerCanvas.height = 140;
    const lbCtx = labBannerCanvas.getContext('2d')!;
    lbCtx.fillStyle = '#064e3b';
    lbCtx.fillRect(0, 0, 512, 140);
    lbCtx.strokeStyle = '#10b981';
    lbCtx.lineWidth = 6;
    lbCtx.strokeRect(6, 6, 500, 128);
    lbCtx.fillStyle = '#ecfdf5';
    lbCtx.font = 'bold 32px monospace';
    lbCtx.textAlign = 'center';
    lbCtx.fillText('✔ NABL DUAL CERTIFIED', 256, 48);
    lbCtx.fillStyle = '#34d399';
    lbCtx.font = 'bold 24px monospace';
    lbCtx.fillText('NMR 97.2% · C4 0.0% · HMF 11mg', 256, 88);
    lbCtx.fillStyle = '#a7f3d0';
    lbCtx.font = 'bold 18px monospace';
    lbCtx.fillText('NABL LAB #TC-8192 · PASSED', 256, 122);
    const labBannerTex = new THREE.CanvasTexture(labBannerCanvas);

    const labBannerMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 0.46),
      new THREE.MeshBasicMaterial({ map: labBannerTex })
    );
    labBannerMesh.position.set(0, 0.45, 1.2);
    stage4Group.add(labBannerMesh);

    // =========================================================================
    // STAGE 05: NFC PROVENANCE MINT & FINAL PACKAGING
    // =========================================================================
    const stage5Group = new THREE.Group();
    stageRoot.add(stage5Group);

    const finalJarPoints: THREE.Vector2[] = [
      new THREE.Vector2(0, -1.65),
      new THREE.Vector2(1.18, -1.65),
      new THREE.Vector2(1.26, -1.35),
      new THREE.Vector2(1.26, 0.6),
      new THREE.Vector2(1.16, 0.95),
      new THREE.Vector2(0.95, 1.25),
      new THREE.Vector2(0.95, 1.55),
      new THREE.Vector2(0.85, 1.55),
      new THREE.Vector2(0.85, 1.25),
      new THREE.Vector2(1.18, 0.95),
      new THREE.Vector2(1.18, -1.35),
      new THREE.Vector2(0, -1.55),
    ];
    const finalJarGeom = new THREE.LatheGeometry(finalJarPoints, 48);
    const finalJar = new THREE.Mesh(
      finalJarGeom,
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.94,
        roughness: 0.03,
        ior: 1.52,
        depthWrite: false,
        transparent: true,
      })
    );
    finalJar.renderOrder = 10;
    finalJar.castShadow = true;
    stage5Group.add(finalJar);

    const finalHoneyGeom = new THREE.CylinderGeometry(1.14, 1.14, 2.1, 48);
    const finalHoney = new THREE.Mesh(finalHoneyGeom, honeyMaterial);
    finalHoney.position.set(0, -0.4, 0);
    finalHoney.renderOrder = 1;
    stage5Group.add(finalHoney);

    const finalMeniscus = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.15, 0.04, 48),
      new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.08,
        metalness: 0.04,
        emissive: new THREE.Color(0x92400e),
        emissiveIntensity: 0.25,
      })
    );
    finalMeniscus.position.set(0, 0.65, 0);
    finalMeniscus.renderOrder = 1;
    stage5Group.add(finalMeniscus);

    // Micro Bubbles
    const finalBubbleGroup = new THREE.Group();
    finalBubbleGroup.renderOrder = 2;
    stage5Group.add(finalBubbleGroup);
    const bubbleMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      roughness: 0.1,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.25,
    });

    const finalBubbles = [
      { x: -0.45, y: -0.8, z: 0.4, r: 0.055 },
      { x: 0.45, y: -0.3, z: 0.35, r: 0.045 },
      { x: -0.2, y: 0.2, z: 0.5, r: 0.065 },
    ];
    finalBubbles.forEach((b) => {
      const bm = new THREE.Mesh(new THREE.SphereGeometry(b.r, 16, 16), bubbleMat);
      bm.position.set(b.x, b.y, b.z);
      finalBubbleGroup.add(bm);
    });

    // Sharp Crisp Label
    const finalLabelMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.27, 1.27, 1.55, 48, 1, true, -Math.PI * 0.32, Math.PI * 0.64),
      new THREE.MeshStandardMaterial({ map: crispLabelTex, roughness: 0.45, side: THREE.DoubleSide })
    );
    finalLabelMesh.position.set(0, -0.3, 0);
    finalLabelMesh.renderOrder = 3;
    stage5Group.add(finalLabelMesh);

    // Cap
    const capAssembly = new THREE.Group();
    capAssembly.position.set(0, 1.55, 0);
    capAssembly.renderOrder = 15;
    stage5Group.add(capAssembly);

    const capBody = new THREE.Mesh(
      new THREE.CylinderGeometry(1.06, 1.06, 0.38, 48),
      new THREE.MeshStandardMaterial({
        color: 0x12281e,
        roughness: 0.32,
        metalness: 0.12,
      })
    );
    capBody.position.y = 0.24;
    capBody.castShadow = true;
    capAssembly.add(capBody);

    const capGoldBand = new THREE.Mesh(
      new THREE.CylinderGeometry(1.07, 1.07, 0.08, 48),
      new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.88,
        roughness: 0.22,
        envMapIntensity: 1.2,
      })
    );
    capGoldBand.position.y = 0.04;
    capGoldBand.castShadow = true;
    capAssembly.add(capGoldBand);

    const hexCanvas = document.createElement('canvas');
    hexCanvas.width = 128;
    hexCanvas.height = 128;
    const hxCtx = hexCanvas.getContext('2d')!;
    hxCtx.fillStyle = '#d4af37';
    hxCtx.font = 'bold 74px sans-serif';
    hxCtx.textAlign = 'center';
    hxCtx.textBaseline = 'middle';
    hxCtx.fillText('⬢', 64, 64);
    const hexTexture = new THREE.CanvasTexture(hexCanvas);

    const capHexagon = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.22),
      new THREE.MeshBasicMaterial({ map: hexTexture, transparent: true })
    );
    capHexagon.position.set(0, 0.25, 1.07);
    capAssembly.add(capHexagon);

    // Leather Seal
    const sealCanvas = document.createElement('canvas');
    sealCanvas.width = 128;
    sealCanvas.height = 384;
    const slCtx = sealCanvas.getContext('2d')!;
    slCtx.fillStyle = '#b45309';
    slCtx.beginPath();
    slCtx.roundRect(10, 10, 108, 364, 40);
    slCtx.fill();

    slCtx.strokeStyle = '#12281e';
    slCtx.lineWidth = 8;
    slCtx.stroke();

    slCtx.fillStyle = '#fef08a';
    slCtx.strokeStyle = '#fef08a';
    slCtx.lineWidth = 6;
    slCtx.beginPath();
    slCtx.arc(64, 280, 10, 0, Math.PI * 2);
    slCtx.fill();

    slCtx.beginPath();
    slCtx.arc(64, 280, 24, -Math.PI * 0.75, -Math.PI * 0.25);
    slCtx.stroke();

    slCtx.beginPath();
    slCtx.arc(64, 280, 38, -Math.PI * 0.75, -Math.PI * 0.25);
    slCtx.stroke();

    const sealTexture = new THREE.CanvasTexture(sealCanvas);
    const sealStrap = new THREE.Mesh(
      new THREE.PlaneGeometry(0.38, 0.95),
      new THREE.MeshStandardMaterial({
        map: sealTexture,
        roughness: 0.5,
        transparent: true,
      })
    );
    sealStrap.position.set(-0.35, 1.15, 1.16);
    sealStrap.renderOrder = 16;
    stage5Group.add(sealStrap);

    // Floating Pins
    const leftPinCanvas = document.createElement('canvas');
    leftPinCanvas.width = 512;
    leftPinCanvas.height = 128;
    const lpCtx = leftPinCanvas.getContext('2d')!;
    lpCtx.fillStyle = '#334155';
    lpCtx.font = 'bold 28px monospace';
    lpCtx.textAlign = 'left';
    lpCtx.fillText('HIVE / ORIGIN', 10, 48);
    lpCtx.fillStyle = '#0f172a';
    lpCtx.font = 'bold 32px monospace';
    lpCtx.fillText('31.6° N · 77.2° E', 10, 92);
    const leftPinTex = new THREE.CanvasTexture(leftPinCanvas);

    const leftPinMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 0.4),
      new THREE.MeshBasicMaterial({ map: leftPinTex, transparent: true })
    );
    leftPinMesh.position.set(-2.0, 0.95, 0.2);
    stage5Group.add(leftPinMesh);

    const leftDot = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), new THREE.MeshBasicMaterial({ color: 0xd4af37 }));
    leftDot.position.set(-1.08, 0.95, 0.2);
    stage5Group.add(leftDot);

    const rightPinCanvas = document.createElement('canvas');
    rightPinCanvas.width = 512;
    rightPinCanvas.height = 128;
    const rpCtx = rightPinCanvas.getContext('2d')!;
    rpCtx.fillStyle = '#334155';
    rpCtx.font = 'bold 28px monospace';
    rpCtx.textAlign = 'left';
    rpCtx.fillText('SEALED / 06:45', 10, 48);
    rpCtx.fillStyle = '#0f172a';
    rpCtx.font = 'bold 32px monospace';
    rpCtx.fillText('WAX + NFC NTAG 424', 10, 92);
    const rightPinTex = new THREE.CanvasTexture(rightPinCanvas);

    const rightPinMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 0.4),
      new THREE.MeshBasicMaterial({ map: rightPinTex, transparent: true })
    );
    rightPinMesh.position.set(2.0, 0.95, 0.2);
    stage5Group.add(rightPinMesh);

    const rightDot = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), new THREE.MeshBasicMaterial({ color: 0xd4af37 }));
    rightDot.position.set(1.08, 0.95, 0.2);
    stage5Group.add(rightDot);

    // Cute Bee
    const cuteBeeGroup = new THREE.Group();
    stage5Group.add(cuteBeeGroup);

    const cBeeBody = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), beeBodyMat);
    cBeeBody.scale.set(1.4, 0.85, 0.85);
    cuteBeeGroup.add(cBeeBody);

    const cBeeStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.092, 0.05, 12), beeStripeMat);
    cBeeStripe.rotation.z = Math.PI / 2;
    cuteBeeGroup.add(cBeeStripe);

    const cWing1 = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.09), beeWingMat);
    cWing1.position.set(0, 0.1, 0.09);
    cWing1.rotation.x = -Math.PI / 3;
    cuteBeeGroup.add(cWing1);

    const cWing2 = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.09), beeWingMat);
    cWing2.position.set(0, 0.1, -0.09);
    cWing2.rotation.x = Math.PI / 3;
    cuteBeeGroup.add(cWing2);

    // =========================================================================
    // 8. INTERACTIVE EVENT LISTENERS
    // =========================================================================
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      mousePos.current.targetX = x * 0.4;
      mousePos.current.targetY = -y * 0.3;
    };

    const handleMouseLeave = () => {
      mousePos.current.targetX = 0;
      mousePos.current.targetY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // =========================================================================
    // 9. HIGH-PRECISION RENDER & FULL VERTICAL CLEARANCE LOOP
    // =========================================================================
    let animId: number;
    let lastTime = performance.now();
    let elapsedTime = 0;

    const stages = [stage1Group, stage2Group, stage3Group, stage4Group, stage5Group];

    const render = () => {
      animId = requestAnimationFrame(render);
      const now = performance.now();
      const delta = Math.min((now - lastTime) * 0.001, 0.1);
      lastTime = now;
      elapsedTime += delta;

      honeyCoreLight.intensity = 1.8 * (1.0 + Math.sin(elapsedTime * 2.5) * 0.15);

      // Mouse Parallax Lerp
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.08;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.08;

      const progress = scrollRef.current;

      stageRoot.rotation.y = mousePos.current.x + Math.sin(elapsedTime * 0.5) * 0.015;
      stageRoot.rotation.x = mousePos.current.y + Math.cos(elapsedTime * 0.4) * 0.01;

      // Smoothstep Cross-Fade with Full Vertical Clearance (No Peek-In!)
      const currentStageIndex = Math.min(4, Math.max(0, progress * 4.99));

      stages.forEach((grp, idx) => {
        const dist = Math.abs(idx - currentStageIndex);
        if (dist < 0.85) {
          const linearWeight = (0.85 - dist) / 0.85;
          const smoothWeight = linearWeight * linearWeight * (3 - 2 * linearWeight);

          grp.visible = true;
          grp.scale.setScalar(0.72 + smoothWeight * 0.28);
          // Large vertical offset (8.5) ensures inactive stages stay completely outside camera view!
          grp.position.y = (1 - smoothWeight) * (idx > currentStageIndex ? 8.5 : -8.5);
          grp.rotation.y = (1 - smoothWeight) * 1.1;
        } else {
          grp.visible = false;
          grp.position.y = idx > currentStageIndex ? 25.0 : -25.0;
        }
      });

      // Pollen Motes
      const positions = pollenGeom.attributes.position.array as Float32Array;
      for (let p = 0; p < pollenCount; p++) {
        const v = pollenVelocities[p];
        positions[p * 3 + 0] += v.x + Math.sin(elapsedTime * 0.8 + v.phase) * 0.003;
        positions[p * 3 + 1] += v.y;
        positions[p * 3 + 2] += v.z + Math.cos(elapsedTime * 0.7 + v.phase) * 0.003;

        if (positions[p * 3 + 1] > 2.6) {
          positions[p * 3 + 1] = -1.6;
        }
      }
      pollenGeom.attributes.position.needsUpdate = true;

      // Stage Animations
      floraStems.forEach((f) => {
        const sway = Math.sin(elapsedTime * 1.6 + f.fx * 2.0) * 0.04;
        f.mesh.rotation.z = sway;
        f.flower.position.x = f.fx + sway * 0.5;
      });

      bees.forEach((b) => {
        const bTime = elapsedTime * b.speed + b.phase;
        b.mesh.position.x = Math.sin(bTime) * b.radiusX;
        b.mesh.position.y = b.centerY + Math.cos(bTime * 1.3) * b.radiusY;
        b.mesh.position.z = Math.cos(bTime * 0.9) * b.radiusZ + 0.6;

        b.mesh.rotation.y = Math.atan2(Math.cos(bTime) * b.radiusX, -Math.sin(bTime * 0.9) * b.radiusZ);
        b.mesh.rotation.z = Math.sin(bTime * 1.2) * 0.35;

        const wingFlap = Math.sin(elapsedTime * 42 + b.phase) * 0.65;
        b.wingL.rotation.x = -Math.PI / 3 + wingFlap;
        b.wingR.rotation.x = Math.PI / 3 - wingFlap;
      });

      drops.forEach((d) => {
        d.currentY -= d.speed;
        if (d.currentY < -1.1) {
          d.currentY = d.startY;
        }
        d.mesh.position.y = d.currentY;
        const stretch = 1.0 + Math.abs(d.currentY - d.startY) * 0.6;
        d.mesh.scale.set(0.8 / Math.sqrt(stretch), 1.6 * stretch, 0.8 / Math.sqrt(stretch));
      });

      collectorPool.scale.y = 1.0 + Math.sin(elapsedTime * 3) * 0.03;

      drumBody.rotation.y = elapsedTime * 0.12;
      drumLid.rotation.y = elapsedTime * 0.12;
      lockBeacon.scale.setScalar(1.0 + Math.sin(elapsedTime * 4) * 0.2);

      stage4Honey.scale.y = 0.42 + Math.sin(elapsedTime * 2.2) * 0.015 + Math.min(0.58, (progress - 0.6) * 3);
      fillingStream.scale.x = 1.0 + Math.sin(elapsedTime * 8) * 0.08;
      fillingStream.scale.z = 1.0 + Math.cos(elapsedTime * 8) * 0.08;

      cuteBeeGroup.position.x = 1.65 * Math.cos(elapsedTime * 1.1);
      cuteBeeGroup.position.z = 0.6 + 0.7 * Math.sin(elapsedTime * 1.1);
      cuteBeeGroup.position.y = -0.2 + Math.sin(elapsedTime * 2.4) * 0.25;
      cuteBeeGroup.rotation.y = -elapsedTime * 1.1 - Math.PI / 2;

      const cWingFlap = Math.sin(elapsedTime * 45) * 0.65;
      cWing1.rotation.x = -Math.PI / 3 + cWingFlap;
      cWing2.rotation.x = Math.PI / 3 - cWingFlap;

      leftPinMesh.position.y = 0.95 + Math.sin(elapsedTime * 1.8) * 0.03;
      leftDot.position.y = 0.95 + Math.sin(elapsedTime * 1.8) * 0.03;
      rightPinMesh.position.y = 0.95 + Math.sin(elapsedTime * 1.8 + 1) * 0.03;
      rightDot.position.y = 0.95 + Math.sin(elapsedTime * 1.8 + 1) * 0.03;

      finalMeniscus.position.y = 0.65 + Math.sin(elapsedTime * 2.4) * 0.006;

      renderer.render(scene, camera);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      pmremGenerator.dispose();
      envRenderTarget.dispose();
      pollenGeom.dispose();
      pollenMaterial.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
        cursor: 'grab',
      }}
      aria-label="Interactive 3D WebGL Provenance Journey"
    />
  );
}
