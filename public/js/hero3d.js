(function () {
  'use strict';

  const HERO_SELECTOR = '#home.hero';
  const CANVAS_ID = 'hero-canvas';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  if (prefersReducedMotion || isMobile) return;

  const hero = document.querySelector(HERO_SELECTOR);
  if (!hero) return;

  if (typeof THREE === 'undefined') return;

  let scene, camera, renderer, group, particles;
  let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;
  let isVisible = true, isTabActive = true;
  let animationId = null;

  function init() {
    scene = new THREE.Scene();
    scene.background = null;

    camera = new THREE.PerspectiveCamera(60, hero.offsetWidth / hero.offsetHeight, 0.1, 1000);
    camera.position.z = 28;

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(hero.offsetWidth, hero.offsetHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;

    const canvas = document.createElement('canvas');
    canvas.id = CANVAS_ID;
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.5;';
    canvas.setAttribute('aria-hidden', 'true');
    hero.style.position = 'relative';
    hero.insertBefore(canvas, hero.firstChild);
    canvas.appendChild(renderer.domElement);

    createScene();
    createParticles();
    bindEvents();
    animate();
  }

  function createScene() {
    group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.SphereGeometry(1, 24, 24);
    const colors = [
      new THREE.Color('#1E6A8D'),
      new THREE.Color('#8FBAD9'),
      new THREE.Color('#15455C'),
      new THREE.Color('#B4D3E8'),
      new THREE.Color('#17557A')
    ];

    const sphereCount = 28;
    for (let i = 0; i < sphereCount; i++) {
      const size = 0.4 + Math.random() * 1.2;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(size, 16, 16),
        new THREE.MeshPhysicalMaterial({
          color: colors[Math.floor(Math.random() * colors.length)],
          transparent: true,
          opacity: 0.12 + Math.random() * 0.18,
          roughness: 0.3,
          metalness: 0.1,
          clearcoat: 0.2,
          clearcoatRoughness: 0.4
        })
      );

      const radius = 3 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      mesh.position.set(
        Math.sin(theta) * Math.cos(phi) * radius,
        (Math.random() - 0.5) * 12,
        Math.sin(theta) * Math.sin(phi) * radius
      );
      mesh.rotation.set(Math.random() * 6, Math.random() * 6, 0);

      mesh.userData = {
        speed: 0.0003 + Math.random() * 0.0008,
        rotSpeed: 0.001 + Math.random() * 0.003,
        orbitRadius: radius,
        theta: theta,
        phi: phi,
        phase: Math.random() * Math.PI * 2
      };

      group.add(mesh);
    }

    const glowGeo = new THREE.SphereGeometry(3, 20, 20);
    const glowMat = new THREE.MeshBasicMaterial({
      color: '#8FBAD9',
      transparent: true,
      opacity: 0.04
    });
    const glowSphere = new THREE.Mesh(glowGeo, glowMat);
    glowSphere.position.set(-2, 1, -10);
    group.add(glowSphere);
  }

  function createParticles() {
    const count = 120;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
      sizes[i] = 0.02 + Math.random() * 0.06;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: '#8FBAD9',
      transparent: true,
      opacity: 0.25,
      size: 0.04,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particles = new THREE.Points(geo, mat);
    scene.add(particles);
  }

  function bindEvents() {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      targetMouseX = (e.clientX - rect.left) / rect.width - 0.5;
      targetMouseY = (e.clientY - rect.top) / rect.height - 0.5;
    });

    hero.addEventListener('mouseleave', () => {
      targetMouseX = 0;
      targetMouseY = 0;
    });

    window.addEventListener('resize', () => {
      if (!hero) return;
      const w = hero.offsetWidth;
      const h = hero.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    const ro = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (!isVisible && animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      } else if (isVisible) {
        animate();
      }
    }, { threshold: 0 });
    ro.observe(hero);

    document.addEventListener('visibilitychange', () => {
      isTabActive = !document.hidden;
      if (!isTabActive && animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      } else if (isTabActive) {
        animate();
      }
    });
  }

  function animate() {
    if (!isVisible || !isTabActive) return;

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    if (group) {
      group.rotation.y += 0.0015;
      group.rotation.x += 0.0003;
      group.rotation.x += mouseY * 0.002;
      group.rotation.y += mouseX * 0.004;

      group.children.forEach((child) => {
        if (child.isMesh && child.userData) {
          child.rotation.x += child.userData.rotSpeed;
          child.rotation.y += child.userData.rotSpeed * 0.5;
        }
      });
    }

    if (particles) {
      particles.rotation.y += 0.0002;
      particles.rotation.x += mouseY * 0.0005;
    }

    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
  }

  init();
})();
