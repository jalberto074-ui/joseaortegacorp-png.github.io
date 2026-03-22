import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = null;
        this.particleCount = 15000;

        this.canvas = document.createElement('canvas');
        this.canvas.width = 1024;
        this.canvas.height = 1024;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

        this.targets = [];
        this.colors = [];

        // Static Universe Arrays to keep background stars still during morphs
        this.universePos = new Float32Array(this.particleCount * 3);
        this.universeCol = new Float32Array(this.particleCount * 3);

        // Particle budget: last starReserve are always background stars
        this.starReserve = 5000;
        this.iconBudget = this.particleCount - this.starReserve;

        this.init();
    }

    init() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);

        const spherePos = new Float32Array(this.particleCount * 3);
        const sphereCol = new Float32Array(this.particleCount * 3);

        for (let i = 0; i < this.particleCount; i++) {
            // --- Planet sphere: surface-only + Saturn rings ---
            // First 80% of particles form the planet surface
            // Last 20% form a tilted ring around the planet
            let px, py, pz;
            const ringStart = this.particleCount; // No ring — all particles form the planet surface

            if (i < ringStart) {
                // Surface sphere — Fibonacci distribution for even coverage
                const phi2 = Math.acos(-1 + (2 * i) / ringStart);
                const theta2 = Math.sqrt(ringStart * Math.PI) * phi2;
                const r2 = 100;
                px = r2 * Math.sin(phi2) * Math.cos(theta2);
                py = r2 * Math.sin(phi2) * Math.sin(theta2);
                pz = r2 * Math.cos(phi2);
            } else {
                // Ring particles — thin tilted disc like Saturn
                const ringAngle = ((i - ringStart) / (this.particleCount - ringStart)) * Math.PI * 2;
                const ringR = 180 + Math.random() * 80; // radius 180-260, frames the title
                const tilt = 0.75; // ~37 degree diagonal tilt
                px = ringR * Math.cos(ringAngle);
                py = ringR * Math.sin(ringAngle) * tilt;
                pz = (Math.random() - 0.5) * 10;
            }

            positions[i * 3] = px;
            positions[i * 3 + 1] = py;
            positions[i * 3 + 2] = pz;

            spherePos[i * 3] = px;
            spherePos[i * 3 + 1] = py;
            spherePos[i * 3 + 2] = pz;

            // Planet/ring color: cool blue-white
            const bright = 0.5 + Math.random() * 0.5;
            const r = bright * 0.7;
            const g = bright * 0.85;
            const b = bright;

            colors[i * 3] = r; colors[i * 3 + 1] = g; colors[i * 3 + 2] = b;
            sphereCol[i * 3] = r; sphereCol[i * 3 + 1] = g; sphereCol[i * 3 + 2] = b;

            // Pre-calculate the Static Universe Shell (for stars)
            // Use a Fibonacci sphere for even distribution
            const phi = Math.acos(-1 + (2 * i) / this.particleCount);
            const theta = Math.sqrt(this.particleCount * Math.PI) * phi;
            // Stars at radius 200-750: close enough to be visible, far enough to look fine
            const radius = 200 + Math.random() * 550;

            this.universePos[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
            this.universePos[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
            this.universePos[i * 3 + 2] = radius * Math.cos(phi);

            // Exclusion zone: push stars away from icon area (XY plane, radius 185)
            const ux = this.universePos[i * 3];
            const uy = this.universePos[i * 3 + 1];
            const xyDist = Math.sqrt(ux * ux + uy * uy);
            if (xyDist < 45) {
                const push = 45 / Math.max(xyDist, 1);
                this.universePos[i * 3] = ux * push;
                this.universePos[i * 3 + 1] = uy * push;
            }

            // White/blue distant stars with varying brightness
            const brightness = 0.5 + Math.random() * 0.5;
            this.universeCol[i * 3] = brightness;
            this.universeCol[i * 3 + 1] = brightness * (0.85 + Math.random() * 0.15);
            this.universeCol[i * 3 + 2] = 1.0;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 1.0,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            opacity: 0.95
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        this.targets.push(spherePos);
        this.colors.push(sphereCol);
    }

    // Helper to draw icons on canvas
    drawIcon(type) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        switch (type) {
            case 'ANALYSIS': { // Magnifying Glass — large and clear
                ctx.lineWidth = 70;
                // Circle of the magnifier
                ctx.beginPath();
                ctx.arc(cx - 60, cy - 60, 200, 0, Math.PI * 2);
                ctx.stroke();
                // Handle
                ctx.beginPath();
                ctx.moveTo(cx + 90, cy + 90);
                ctx.lineTo(cx + 300, cy + 300);
                ctx.stroke();
                break;
            }

            case 'SQL': { // Database — 3 clearly stacked cylinders
                ctx.lineWidth = 45;
                const positions = [-160, -40, 80];
                for (let i = 0; i < positions.length; i++) {
                    const yOff = positions[i];
                    // Top ellipse
                    ctx.beginPath();
                    ctx.ellipse(cx, cy + yOff, 220, 55, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    // Side lines
                    if (i < positions.length - 1) {
                        ctx.beginPath();
                        ctx.moveTo(cx - 220, cy + yOff);
                        ctx.lineTo(cx - 220, cy + yOff + 120);
                        ctx.moveTo(cx + 220, cy + yOff);
                        ctx.lineTo(cx + 220, cy + yOff + 120);
                        ctx.stroke();
                    }
                }
                break;
            }

            case 'MARKETING': { // Line Chart with arrow
                ctx.lineWidth = 55;
                // Axes
                ctx.beginPath();
                ctx.moveTo(cx - 350, cy - 300);
                ctx.lineTo(cx - 350, cy + 250);
                ctx.lineTo(cx + 350, cy + 250);
                ctx.stroke();
                // Line
                ctx.lineWidth = 60;
                ctx.beginPath();
                ctx.moveTo(cx - 280, cy + 100);
                ctx.lineTo(cx - 100, cy + 0);
                ctx.lineTo(cx + 80, cy + 80);
                ctx.lineTo(cx + 200, cy - 150);
                ctx.lineTo(cx + 320, cy - 280);
                ctx.stroke();
                // Arrow tip
                ctx.beginPath();
                ctx.moveTo(cx + 270, cy - 320);
                ctx.lineTo(cx + 320, cy - 280);
                ctx.lineTo(cx + 280, cy - 230);
                ctx.stroke();
                break;
            }

            case 'ENGINEER': { // Gear — large and clear
                const outerR = 300;
                const innerR = 140;
                const numTeeth = 8;
                ctx.lineWidth = 55;
                // Inner circle
                ctx.beginPath();
                ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
                ctx.stroke();
                // Outer circle
                ctx.beginPath();
                ctx.arc(cx, cy, outerR - 40, 0, Math.PI * 2);
                ctx.stroke();
                // Teeth
                ctx.lineWidth = 80;
                for (let i = 0; i < numTeeth; i++) {
                    const angle = (i / numTeeth) * Math.PI * 2;
                    const x1 = cx + Math.cos(angle) * (outerR - 40);
                    const y1 = cy + Math.sin(angle) * (outerR - 40);
                    const x2 = cx + Math.cos(angle) * (outerR + 40);
                    const y2 = cy + Math.sin(angle) * (outerR + 40);
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
                break;
            }

            case 'IT': { // Monitor — large screen with text lines
                ctx.lineWidth = 45;
                // Screen rectangle
                ctx.strokeRect(cx - 350, cy - 260, 700, 440);
                // Stand
                ctx.beginPath();
                ctx.moveTo(cx, cy + 180);
                ctx.lineTo(cx, cy + 310);
                ctx.stroke();
                // Base
                ctx.beginPath();
                ctx.moveTo(cx - 160, cy + 310);
                ctx.lineTo(cx + 160, cy + 310);
                ctx.stroke();
                // Text lines on screen
                ctx.lineWidth = 30;
                ctx.beginPath();
                ctx.moveTo(cx - 260, cy - 130); ctx.lineTo(cx + 200, cy - 130);
                ctx.moveTo(cx - 260, cy - 30); ctx.lineTo(cx + 250, cy - 30);
                ctx.moveTo(cx - 260, cy + 70); ctx.lineTo(cx + 130, cy + 70);
                ctx.stroke();
                break;
            }

            case 'BI': { // Bar Chart — 3 tall filled bars
                ctx.fillStyle = 'white';
                // 3 bars of different heights
                ctx.fillRect(cx - 330, cy - 80, 190, 330);   // short left
                ctx.fillRect(cx - 100, cy - 310, 190, 560);   // tall center
                ctx.fillRect(cx + 130, cy - 210, 190, 460);   // medium right
                break;
            }
        }
    }

    generateState(type, colorHex) {
        this.drawIcon(type);

        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const validPoints = [];

        // Dense sampling to get enough points
        for (let y = 0; y < this.canvas.height; y += 3) {
            for (let x = 0; x < this.canvas.width; x += 3) {
                const index = (y * this.canvas.width + x) * 4;
                if (data[index] > 64) {
                    const isMobile = window.innerWidth < 768;
                    const scale = isMobile ? 0.25 : 0.38; // Smaller icons for mobile
                    validPoints.push({
                        x: (x - this.canvas.width / 2) * scale,
                        y: -(y - this.canvas.height / 2) * scale,
                        z: 0
                    });
                }
            }
        }

        const targetPos = new Float32Array(this.particleCount * 3);
        const targetCol = new Float32Array(this.particleCount * 3);
        const c = new THREE.Color(colorHex);

        // Always reserve the last 5000 particles for background stars
        // This ensures the starfield is always visible regardless of icon density
        const starReserve = 5000;
        const iconBudget = this.particleCount - starReserve;

        // Shuffle valid points for more organic distribution
        for (let i = validPoints.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [validPoints[i], validPoints[j]] = [validPoints[j], validPoints[i]];
        }

        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            if (i < iconBudget && i < validPoints.length) {
                // Icon Particles — first iconBudget particles form the icon
                targetPos[i3] = validPoints[i].x;
                targetPos[i3 + 1] = validPoints[i].y;
                targetPos[i3 + 2] = validPoints[i].z;

                // Add slight random scatter for organic look
                targetPos[i3] += (Math.random() - 0.5) * 3;
                targetPos[i3 + 1] += (Math.random() - 0.5) * 3;
                targetPos[i3 + 2] += (Math.random() - 0.5) * 10;

                targetCol[i3] = c.r;
                targetCol[i3 + 1] = c.g;
                targetCol[i3 + 2] = c.b;
            } else {
                // Background Stars — always go to universe positions
                targetPos[i3] = this.universePos[i3];
                targetPos[i3 + 1] = this.universePos[i3 + 1];
                targetPos[i3 + 2] = this.universePos[i3 + 2];

                targetCol[i3] = this.universeCol[i3];
                targetCol[i3 + 1] = this.universeCol[i3 + 1];
                targetCol[i3 + 2] = this.universeCol[i3 + 2];
            }
        }

        this.targets.push(targetPos);
        this.colors.push(targetCol);
    }

    getRandomSpherePoint(radius) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random()) * radius;
        const sinPhi = Math.sin(phi);
        const x = r * sinPhi * Math.cos(theta);
        const y = r * sinPhi * Math.sin(theta);
        const z = r * Math.cos(phi);
        return { x, y, z };
    }

    seek(progress) {
        if (!this.particles || this.targets.length < 2) return;

        const totalStates = this.targets.length;
        const floatIndex = progress * (totalStates - 1);
        const startIndex = Math.floor(floatIndex);
        let endIndex = startIndex + 1;

        let t = floatIndex - startIndex;

        if (endIndex >= totalStates) {
            endIndex = totalStates - 1;
            t = 1;
        }

        const positions = this.particles.geometry.attributes.position.array;
        const colors = this.particles.geometry.attributes.color.array;

        const startPos = this.targets[startIndex];
        const endPos = this.targets[endIndex];

        const startCol = this.colors[startIndex];
        const endCol = this.colors[endIndex];

        const rawT = t; // save pre-eased t for icon scatter
        // Easing (Smoothstep)
        t = t * t * (3 - 2 * t);

        // Hyperspace warp magnitude — peaks at t=0.5, returns to 0 at t=1
        // (stars rush past then settle at the new icon position)
        const warpFactor = Math.sin(rawT * Math.PI);
        const radialPush = warpFactor * 420;  // stars spread outward from center
        const zPush = warpFactor * 220;  // stars also rush toward camera
        const scatter = warpFactor * 130;  // icon disintegration in XY

        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = startPos[i3] + (endPos[i3] - startPos[i3]) * t;
            positions[i3 + 1] = startPos[i3 + 1] + (endPos[i3 + 1] - startPos[i3 + 1]) * t;
            positions[i3 + 2] = startPos[i3 + 2] + (endPos[i3 + 2] - startPos[i3 + 2]) * t;

            if (i < this.iconBudget) {
                // Icon particles — disintegrate / reform in XY
                const angle = i * 2.399963229;
                positions[i3] += Math.cos(angle) * scatter;
                positions[i3 + 1] += Math.sin(angle) * scatter;
            } else {
                // Star particles — HYPERSPACE: fly outward from center + toward camera
                const sx = positions[i3];
                const sy = positions[i3 + 1];
                const xyLen = Math.sqrt(sx * sx + sy * sy) || 1;
                positions[i3] += (sx / xyLen) * radialPush;
                positions[i3 + 1] += (sy / xyLen) * radialPush;
                positions[i3 + 2] += zPush;
            }

            colors[i3] = startCol[i3] + (endCol[i3] - startCol[i3]) * t;
            colors[i3 + 1] = startCol[i3 + 1] + (endCol[i3 + 1] - startCol[i3 + 1]) * t;
            colors[i3 + 2] = startCol[i3 + 2] + (endCol[i3 + 2] - startCol[i3 + 2]) * t;
        }

        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.geometry.attributes.color.needsUpdate = true;
    }
}
