/* 首页 3D 入口：宇航员推开空间站气闸。
   职责：第三人称走到门前、按住把门推开，穿过后把控制权交还桌面。
   上下游：index.html 的 .intro；完成后派发 proto:enter-desk。 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var intro = document.querySelector('.intro');
  if (!intro || reduceMotion.matches) {
    window.__protoIntroDone = true;
    return;
  }

  var canvas = intro.querySelector('canvas');
  var statusEl = intro.querySelector('.intro-status');
  var enterBtn = intro.querySelector('.intro-enter');
  var skipBtn = intro.querySelector('.intro-skip');
  var finished = false;
  var raf = 0;
  var renderer, scene, camera, clock, earth;
  var astronaut, doorPivot, doorMesh, station;
  var keys = {};
  var dragging = false;
  var lastX = 0;
  var lastY = 0;
  var yaw = 0;
  var pitch = 0.08;
  var pushing = false;
  var doorAngle = 0;
  var cinematic = false;
  var walkPhase = 0;
  var THREE;
  var raycaster;
  var pointer = { x: 0, y: 0 };
  var DOOR_Z = -4.15;
  var OPEN_ANGLE = 1.85;

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function finish() {
    if (finished) return;
    finished = true;
    window.removeEventListener('keydown', onKey, true);
    cancelAnimationFrame(raf);
    intro.setAttribute('data-done', 'true');
    window.setTimeout(function () {
      if (renderer) {
        renderer.dispose();
        if (renderer.forceContextLoss) renderer.forceContextLoss();
      }
      intro.remove();
      window.__protoIntroDone = true;
      window.dispatchEvent(new Event('proto:enter-desk'));
    }, 900);
  }

  function onKey(e) {
    if (e.key === 'Escape') { finish(); return; }
    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      cinematic = true;
    }
    if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
      if (nearDoor()) pushing = true;
    }
  }

  function nearDoor() {
    if (!astronaut) return false;
    var dx = astronaut.position.x;
    var dz = astronaut.position.z - DOOR_Z;
    return Math.sqrt(dx * dx + dz * dz) < 2.4 && astronaut.position.z < -1.6;
  }

  function nebulaTexture() {
    var c = document.createElement('canvas');
    c.width = c.height = 256;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(128, 128, 12, 128, 128, 128);
    grd.addColorStop(0, 'rgba(226,177,90,0.5)');
    grd.addColorStop(0.4, 'rgba(70,110,180,0.16)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    var t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
  }

  function labelTexture(text) {
    var c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    var g = c.getContext('2d');
    g.clearRect(0, 0, 512, 128);
    g.font = '500 52px "Newsreader", "Songti SC", serif';
    g.fillStyle = '#f3eee6';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, 256, 64);
    var t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
  }

  function mat(color, extras) {
    var opt = { color: color, roughness: 0.55, metalness: 0.18 };
    var k;
    if (extras) {
      for (k in extras) {
        if (Object.prototype.hasOwnProperty.call(extras, k)) opt[k] = extras[k];
      }
    }
    return new THREE.MeshStandardMaterial(opt);
  }

  function makeAstronaut() {
    var root = new THREE.Group();
    var suit = mat(0xe8e4dc, { roughness: 0.62, metalness: 0.08 });
    var dark = mat(0x2a2826, { roughness: 0.4, metalness: 0.3 });
    var gold = mat(0xe2b15a, { roughness: 0.18, metalness: 0.72, emissive: 0x6a4a12, emissiveIntensity: 0.2 });

    var torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.55, 8, 16), suit);
    torso.position.y = 1.15;
    root.add(torso);

    var pack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.18), dark);
    pack.position.set(0, 1.18, 0.28);
    root.add(pack);

    var helmet = new THREE.Mesh(new THREE.SphereGeometry(0.27, 32, 24), suit);
    helmet.position.y = 1.74;
    root.add(helmet);

    var visor = new THREE.Mesh(new THREE.SphereGeometry(0.21, 28, 18, 0, Math.PI * 2, 0, Math.PI / 1.65), gold);
    visor.position.set(0, 1.73, -0.1);
    visor.rotation.x = 0.18;
    root.add(visor);

    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.12, 12), suit);
    neck.position.y = 1.5;
    root.add(neck);

    function limb(w, h, d, x, y, z) {
      var m = new THREE.Mesh(new THREE.CapsuleGeometry(w, h, 4, 8), suit);
      m.position.set(x, y, z);
      root.add(m);
      return m;
    }
    root.userData.armL = limb(0.08, 0.42, 0.08, -0.38, 1.12, -0.02);
    root.userData.armR = limb(0.08, 0.42, 0.08, 0.38, 1.12, -0.02);
    root.userData.armR.rotation.z = -0.12;
    root.userData.armL.rotation.z = 0.12;
    limb(0.1, 0.5, 0.1, -0.14, 0.42, 0);
    limb(0.1, 0.5, 0.1, 0.14, 0.42, 0);

    var bootL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.28), dark);
    bootL.position.set(-0.14, 0.08, -0.04);
    root.add(bootL);
    var bootR = bootL.clone();
    bootR.position.x = 0.14;
    root.add(bootR);

    return root;
  }

  function makeStation() {
    var group = new THREE.Group();
    var hull = mat(0xc5c0b8, { roughness: 0.34, metalness: 0.62 });
    var hullDark = mat(0x3d3a38, { roughness: 0.45, metalness: 0.4 });
    var gold = mat(0xe2b15a, { roughness: 0.3, metalness: 0.55, emissive: 0xe2b15a, emissiveIntensity: 0.22 });

    var body = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 16, 32, 1, true), hull);
    body.rotation.x = Math.PI / 2;
    body.position.set(0, 1.7, -12);
    group.add(body);

    var ribs = new THREE.Mesh(new THREE.TorusGeometry(2.62, 0.06, 8, 48), hullDark);
    ribs.position.set(0, 1.7, -8);
    group.add(ribs);
    var ribs2 = ribs.clone();
    ribs2.position.z = -14;
    group.add(ribs2);

    var solar = new THREE.Mesh(new THREE.BoxGeometry(10, 0.04, 2.4), mat(0x1a2740, { metalness: 0.6, roughness: 0.25 }));
    solar.position.set(-7.2, 1.7, -12);
    group.add(solar);
    var solarR = solar.clone();
    solarR.position.x = 7.2;
    group.add(solarR);

    var airlock = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 3.2, 24, 1, true), hull);
    airlock.rotation.x = Math.PI / 2;
    airlock.position.set(0, 1.55, -4.8);
    group.add(airlock);

    var ring = new THREE.Mesh(new THREE.TorusGeometry(1.38, 0.08, 10, 40), gold);
    ring.position.set(0, 1.55, DOOR_Z);
    group.add(ring);

    var floor = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.32, 0.08, 24), hullDark);
    floor.position.set(0, 0.28, -5.4);
    group.add(floor);

    var interior = new THREE.PointLight(0xe2b15a, 0.2, 12);
    interior.position.set(0, 1.6, -6.5);
    interior.name = 'hatchLight';
    group.add(interior);
    group.userData.hatchLight = interior;

    var glow = new THREE.Mesh(
      new THREE.CircleGeometry(1.18, 32),
      new THREE.MeshBasicMaterial({ color: 0xe8c37a, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
    );
    glow.position.set(0, 1.55, DOOR_Z - 0.04);
    group.add(glow);
    group.userData.glow = glow;

    var label = new THREE.Sprite(new THREE.SpriteMaterial({
      map: labelTexture('工作台'), transparent: true, depthWrite: false
    }));
    label.position.set(0, 3.35, DOOR_Z + 0.1);
    label.scale.set(3.6, 0.9, 1);
    group.add(label);

    return group;
  }

  function makeDoor() {
    var pivot = new THREE.Group();
    pivot.position.set(-1.05, 1.55, DOOR_Z);
    var hatch = new THREE.Mesh(
      new THREE.BoxGeometry(2.12, 2.35, 0.1),
      mat(0xb7b1a8, { metalness: 0.5, roughness: 0.32 })
    );
    hatch.position.set(1.05, 0, 0);
    pivot.add(hatch);

    var window = new THREE.Mesh(
      new THREE.CircleGeometry(0.28, 20),
      mat(0xe2b15a, { metalness: 0.8, roughness: 0.12, emissive: 0xe2b15a, emissiveIntensity: 0.35 })
    );
    window.position.set(1.05, 0.35, 0.06);
    pivot.add(window);

    var handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.42, 10), mat(0xe2b15a, { metalness: 0.7, roughness: 0.2 }));
    handle.rotation.z = Math.PI / 2;
    handle.position.set(1.72, 0, 0.08);
    pivot.add(handle);

    pivot.userData.hatch = hatch;
    return pivot;
  }

  function makeStars() {
    var count = 1800;
    var positions = new Float32Array(count * 3);
    var i;
    for (i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 280;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 280;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xf3eee6, size: 0.2, transparent: true, opacity: 0.85
    }));
  }

  function buildWorld() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05040a);
    scene.fog = new THREE.FogExp2(0x05040a, 0.012);

    camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 400);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene.add(new THREE.AmbientLight(0x6b5a48, 0.55));
    var sun = new THREE.DirectionalLight(0xffe6c4, 1.5);
    sun.position.set(10, 14, 8);
    scene.add(sun);

    var nebula = new THREE.Sprite(new THREE.SpriteMaterial({
      map: nebulaTexture(), transparent: true, depthWrite: false, opacity: 0.85
    }));
    nebula.position.set(-24, 8, -60);
    nebula.scale.set(56, 56, 1);
    scene.add(nebula);

    earth = new THREE.Mesh(
      new THREE.SphereGeometry(11, 48, 48),
      new THREE.MeshStandardMaterial({
        color: 0x1c3a4a, roughness: 0.8, metalness: 0.05,
        emissive: 0x0a2030, emissiveIntensity: 0.35
      })
    );
    earth.position.set(-18, -14, -28);
    scene.add(earth);

    scene.add(makeStars());
    station = makeStation();
    scene.add(station);
    doorPivot = makeDoor();
    scene.add(doorPivot);
    doorMesh = doorPivot.userData.hatch;

    astronaut = makeAstronaut();
    astronaut.position.set(0, 0, 5.4);
    scene.add(astronaut);

    raycaster = new THREE.Raycaster();
    clock = new THREE.Clock();

    camera.position.set(2.6, 2.35, 9.4);
    camera.lookAt(0, 1.35, -4);
  }

  function resize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function hitDoor(clientX, clientY) {
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    var hits = raycaster.intersectObject(doorPivot, true);
    return hits.length > 0;
  }

  function tick() {
    if (finished) return;
    raf = requestAnimationFrame(tick);
    var dt = Math.min(clock.getDelta(), 0.05);
    earth.rotation.y += dt * 0.03;

    var forward = (keys.w || keys.W || keys.ArrowUp ? 1 : 0) - (keys.s || keys.S || keys.ArrowDown ? 1 : 0);
    var strafe = (keys.d || keys.D || keys.ArrowRight ? 1 : 0) - (keys.a || keys.A || keys.ArrowLeft ? 1 : 0);

    if (cinematic) {
      yaw = THREE.MathUtils.lerp(yaw, 0, dt * 3);
      astronaut.position.x = THREE.MathUtils.lerp(astronaut.position.x, 0, dt * 2);
      if (astronaut.position.z > DOOR_Z + 1.15) {
        astronaut.position.z -= dt * 1.6;
        forward = 1;
      } else {
        pushing = true;
      }
    }

    if (!cinematic) {
      astronaut.position.x += (Math.sin(yaw) * -forward + Math.cos(yaw) * strafe) * dt * 2.1;
      astronaut.position.z += (Math.cos(yaw) * -forward - Math.sin(yaw) * strafe) * dt * 2.1;
    }
    astronaut.position.x = THREE.MathUtils.clamp(astronaut.position.x, -1.05, 1.05);
    astronaut.position.z = THREE.MathUtils.clamp(astronaut.position.z, doorAngle > 1.2 ? -8.5 : DOOR_Z + 0.95, 6.2);

    walkPhase += dt * (Math.abs(forward) + Math.abs(strafe) + (cinematic ? 1 : 0)) * 8;
    var bob = Math.sin(walkPhase) * 0.03;
    astronaut.position.y = bob;
    astronaut.rotation.y = yaw;

    var reach = doorAngle / OPEN_ANGLE;
    astronaut.userData.armR.rotation.x = THREE.MathUtils.lerp(
      astronaut.userData.armR.rotation.x,
      pushing || reach > 0.05 ? -1.05 : 0.08 * Math.sin(walkPhase),
      dt * 8
    );

    if (pushing && nearDoor()) {
      doorAngle = Math.min(OPEN_ANGLE, doorAngle + dt * 1.15);
    } else if (!cinematic && doorAngle < OPEN_ANGLE) {
      doorAngle = Math.max(0, doorAngle - dt * 0.25);
    }
    doorPivot.rotation.y = -doorAngle;

    var lit = 0.15 + reach * 2.8;
    if (station.userData.hatchLight) station.userData.hatchLight.intensity = lit;
    if (station.userData.glow) station.userData.glow.material.opacity = 0.06 + reach * 0.55;

    if (nearDoor() && doorAngle < OPEN_ANGLE - 0.05) setStatus('点门或按住空格 · 把门推开');
    else if (doorAngle >= OPEN_ANGLE - 0.05) setStatus('走进去');
    else setStatus('WASD 走向气闸 · 拖动转向');

    if (doorAngle > 1.2 && astronaut.position.z < DOOR_Z - 0.8) {
      setStatus('进入工作台');
      finish();
      return;
    }
    if (cinematic && doorAngle >= OPEN_ANGLE - 0.02 && astronaut.position.z <= DOOR_Z + 1.2) {
      astronaut.position.z -= dt * 1.8;
    }

    var camOffset = new THREE.Vector3(2.15, 1.9, 5.6);
    var euler = new THREE.Euler(pitch, yaw, 0, 'YXZ');
    camOffset.applyEuler(euler);
    var target = astronaut.position.clone().add(new THREE.Vector3(0, 1.35, 0));
    var camPos = target.clone().add(camOffset);
    camera.position.lerp(camPos, 1 - Math.pow(0.012, dt));
    camera.lookAt(target.x, target.y + 0.15, target.z - 1.4);

    renderer.render(scene, camera);
  }

  function mountControls() {
    window.addEventListener('keydown', function (e) { keys[e.key] = true; });
    window.addEventListener('keyup', function (e) {
      keys[e.key] = false;
      if (e.key === 'e' || e.key === 'E' || e.key === ' ') pushing = false;
    });
    window.addEventListener('keydown', onKey, true);

    canvas.addEventListener('pointerdown', function (e) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (nearDoor() && (hitDoor(e.clientX, e.clientY) || true)) {
        pushing = true;
        dragging = false;
        return;
      }
      dragging = true;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!dragging || pushing) return;
      yaw -= (e.clientX - lastX) * 0.005;
      pitch = THREE.MathUtils.clamp(pitch - (e.clientY - lastY) * 0.003, -0.4, 0.45);
      lastX = e.clientX;
      lastY = e.clientY;
    });
    var stop = function () {
      dragging = false;
      pushing = false;
    };
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);
    window.addEventListener('resize', resize);
  }

  function start() {
    if (finished) return;
    THREE = window.THREE;
    if (!THREE) {
      setStatus('三维引擎未载入，直接进入');
      finish();
      return;
    }
    try {
      buildWorld();
    } catch (err) {
      setStatus('此设备无法开三维，直接进入');
      finish();
      return;
    }
    mountControls();
    setStatus('WASD 走向气闸 · 拖动转向');
    tick();
  }

  if (enterBtn) {
    enterBtn.addEventListener('click', function () { cinematic = true; });
  }
  if (skipBtn) skipBtn.addEventListener('click', finish);

  var tries = 0;
  function waitThree() {
    if (finished) return;
    if (window.THREE) { start(); return; }
    tries += 1;
    if (tries > 40) { start(); return; }
    window.setTimeout(waitThree, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitThree);
  } else {
    waitThree();
  }
})();
