// Interactive 3D Portfolio Logic - Nebula Space with Stars
// Fatima's Digital Portfolio Redesign

document.addEventListener('DOMContentLoaded', () => {
    initThreeNebulaSpace();
    init3DTilt();
});

// ==========================================
// 1. Three.js Nebula Space with Stars
// ==========================================
function initThreeNebulaSpace() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    if (typeof THREE === 'undefined') {
        console.warn('Three.js is not loaded.');
        return;
    }

    let scene, camera, renderer;
    let starsSystem, nebulaSystem;
    
    // Mouse variables for interpolation (lerp)
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    function init() {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.z = 400; // Farther out for deeper perspective

        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        // ------------------------------------------
        // A. Background Stars System (Deep Space)
        // ------------------------------------------
        const starCount = 3000;
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);

        const starColorOptions = [
            new THREE.Color(1.0, 1.0, 1.0),       // Bright white
            new THREE.Color(1.0, 0.95, 0.9),      // Off white warm
            new THREE.Color(1.0, 0.824, 0.659),   // Desert Sand tone
            new THREE.Color(0.878, 0.286, 0.443)  // Crimson tint (faint star)
        ];

        for (let i = 0; i < starCount; i++) {
            // Distribute stars far away in a giant cube
            starPositions[i * 3] = (Math.random() - 0.5) * 1500;
            starPositions[i * 3 + 1] = (Math.random() - 0.5) * 1500;
            starPositions[i * 3 + 2] = (Math.random() - 0.5) * 1000 - 300; // shifted back

            // Random colors for realistic stars
            const color = starColorOptions[Math.floor(Math.random() * starColorOptions.length)];
            starColors[i * 3] = color.r;
            starColors[i * 3 + 1] = color.g;
            starColors[i * 3 + 2] = color.b;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        // Sharp, tiny stars
        const starMaterial = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        starsSystem = new THREE.Points(starGeometry, starMaterial);
        scene.add(starsSystem);

        // ------------------------------------------
        // B. Nebula Dust / Clouds System (Foreground)
        // ------------------------------------------
        const dustCount = 120;
        const nebulaGeometry = new THREE.BufferGeometry();
        const nebulaPositions = new Float32Array(dustCount * 3);
        const nebulaColors = new Float32Array(dustCount * 3);

        const nebulaColorsPalette = [
            new THREE.Color(1.0, 0.505, 0.282), // Solar Orange
            new THREE.Color(0.878, 0.286, 0.443), // Ruby Red
            new THREE.Color(0.341, 0.239, 0.329)  // Dark Plum
        ];

        for (let i = 0; i < dustCount; i++) {
            // Distribute closer to the center of view
            const x = (Math.random() - 0.5) * 600;
            const y = (Math.random() - 0.5) * 600;
            const z = (Math.random() - 0.5) * 400 + 100; // floats in front of stars

            nebulaPositions[i * 3] = x;
            nebulaPositions[i * 3 + 1] = y;
            nebulaPositions[i * 3 + 2] = z;

            // Colors
            const color = nebulaColorsPalette[Math.floor(Math.random() * nebulaColorsPalette.length)];
            nebulaColors[i * 3] = color.r;
            nebulaColors[i * 3 + 1] = color.g;
            nebulaColors[i * 3 + 2] = color.b;
        }

        nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
        nebulaGeometry.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));

        // Create larger soft glowing cloud texture
        const softCloudMaterial = new THREE.PointsMaterial({
            size: 30, // Base size for cloud sprites
            vertexColors: true,
            map: createNebulaCloudTexture(),
            transparent: true,
            opacity: 0.45, // Soft opacity to blend together like a gas cloud
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        nebulaSystem = new THREE.Points(nebulaGeometry, softCloudMaterial);
        scene.add(nebulaSystem);

        window.addEventListener('resize', onWindowResize);
        document.addEventListener('mousemove', onMouseMove);
    }

    // Helper to generate soft fuzzy nebula cloud texture
    function createNebulaCloudTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Radial gradient with fuzzy edge
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(canvas);
    }

    function onMouseMove(event) {
        // Normalize mouse to -1 to 1
        mouse.targetX = (event.clientX - windowHalfX) / windowHalfX;
        mouse.targetY = (event.clientY - windowHalfY) / windowHalfY;
    }

    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);

        // Interpolate mouse movement (lerp)
        mouse.x += (mouse.targetX - mouse.x) * 0.03;
        mouse.y += (mouse.targetY - mouse.y) * 0.03;

        // 1. Slow, passive cosmic rotation for stars and nebula (separate speeds for parallax)
        starsSystem.rotation.y += 0.0003;
        starsSystem.rotation.x += 0.0001;

        nebulaSystem.rotation.y += 0.0006;
        nebulaSystem.rotation.x += 0.0002;

        // 2. Parallax camera float reacting to mouse cursor
        // Tilts the viewport camera to show depth difference between stars and close dust clouds
        camera.position.x += (mouse.x * 120 - camera.position.x) * 0.05;
        camera.position.y += (-mouse.y * 120 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // 3. Animate nebula dust position & local cursor repulsion
        const posAttr = nebulaSystem.geometry.attributes.position;
        const posArray = posAttr.array;

        // Approximate cursor position projected into the 3D space
        const mx = mouse.x * 250;
        const my = -mouse.y * 250;

        for (let i = 0; i < posArray.length / 3; i++) {
            const idx = i * 3;

            // Slowly increment positions by velocities (waving drift)
            posArray[idx] += (Math.sin(Date.now() * 0.001 + i) * 0.02); 
            posArray[idx + 1] += (Math.cos(Date.now() * 0.0012 + i) * 0.02);

            // Local cursor magnetic hover repel
            const dx = posArray[idx] - mx;
            const dy = posArray[idx + 1] - my;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const repelRadius = 90;
            if (dist < repelRadius) {
                const force = (repelRadius - dist) / repelRadius;
                // Soft pushing force
                posArray[idx] += (dx / dist) * force * 1.5;
                posArray[idx + 1] += (dy / dist) * force * 1.5;
            }
        }

        posAttr.needsUpdate = true;
        renderer.render(scene, camera);
    }

    init();
    animate();
}

// ==========================================
// 2. Interactive 3D Tilt Effect
// ==========================================
function init3DTilt() {
    const tiltElements = document.querySelectorAll('.tilt-element');

    tiltElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate tilt angle (-8 to 8 degrees)
            const rotateX = ((centerY - y) / centerY) * 8;
            const rotateY = ((x - centerX) / centerX) * 8;

            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
            element.style.transition = 'transform 0.08s ease-out';
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            element.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    });
}
