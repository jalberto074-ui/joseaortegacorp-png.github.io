import { SceneSetup } from './scene.js';
import { ParticleSystem } from './particles.js';
import { UIManager } from './ui_eng.js';

document.fonts.ready.then(() => {
    initApp();
});

function initApp() {
    console.log("Initializing App...");

    const sceneSetup = new SceneSetup('canvas');
    sceneSetup.camera.position.z = 500;

    const particleSystem = new ParticleSystem(sceneSetup.scene);
    const uiManager = new UIManager();

    // Generate Icons with Neon / Super Bright Colors
    particleSystem.generateState('ANALYSIS', 0x00e5ff); // Bright Cyan
    particleSystem.generateState('SQL', 0x448aff); // Bright Blue
    particleSystem.generateState('MARKETING', 0xff1744); // Bright Red/Pink
    particleSystem.generateState('ENGINEER', 0xffc400); // Bright Amber/Gold
    particleSystem.generateState('IT', 0x00e676); // Bright Green
    particleSystem.generateState('BI', 0xd500f9); // Bright Purple

    const labels = [
        "",
        "Data Analysis",
        "SQL Architecture & Management",
        "Tracking Strategy & Automation",
        "Data Pipeline Engineering",
        "Infrastructure & Technical Support",
        "Visualization & Business Intelligence"
    ];

    const scrollContainer = document.getElementById('scroll-container');

    let targetProgress = 0;
    let currentProgress = 0;

    function onScroll() {
        const totalHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const currentY = scrollContainer.scrollTop;

        let p = currentY / totalHeight;
        if (p < 0) p = 0;
        if (p > 1) p = 1;

        targetProgress = p;

        const bar = document.getElementById('progress-bar');
        if (bar) bar.style.width = `${p * 100}%`;

        const introTitle = document.querySelector('.intro-title');
        if (introTitle) {
            let opacity = 1 - (p * 8);
            if (opacity < 0) opacity = 0;
            introTitle.style.opacity = opacity;
        }
    }

    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', onScroll);
        window.addEventListener('resize', onScroll);
    }

    function animate() {
        requestAnimationFrame(animate);

        // Slow lerp for planet sphere section; fast for icon-to-icon transitions
        const nearSphere = currentProgress < 0.08 || targetProgress < 0.08;
        const lerpRate = nearSphere ? 0.015 : 0.07;
        currentProgress += (targetProgress - currentProgress) * lerpRate;

        if (Math.abs(1 - currentProgress) < 0.001) currentProgress = 1;
        if (Math.abs(0 - currentProgress) < 0.001) currentProgress = 0;

        const totalSections = 8;
        const contactIndex = 7;
        let virtualIndex = currentProgress * (totalSections - 1);

        // --- 1. Camera Logic ---
        // Camera zooms from sphere (500) to icon field (~270) — stays outside the star shell
        // Stars shell is at radius 350-1150, so camera staying at ~270 means stars are visible around/behind
        let zPos;
        if (virtualIndex <= 6) {
            if (virtualIndex < 0.5) {
                // Initial warp: fast zoom from 500 → 290
                let pWarp = virtualIndex / 0.5;
                pWarp = pWarp * pWarp * (3 - 2 * pWarp); // smoothstep
                zPos = 500 - pWarp * 210; // 500 → 290
            } else {
                // Through icon sections: gently settle from 290 → 265
                let pIcons = (virtualIndex - 0.5) / 5.5;
                pIcons = pIcons * pIcons * (3 - 2 * pIcons);
                zPos = 290 - pIcons * 25; // 290 → 265
            }
        } else {
            // Return / pull back for contact section
            let pReturn = virtualIndex - 6;
            zPos = 265 + (pReturn * 400); // 265 → 665
        }
        sceneSetup.camera.position.z = zPos;

        // Camera always centered — icons stay fixed in the middle
        sceneSetup.camera.position.x = 0;
        sceneSetup.camera.position.y = 0;


        // --- 2. Particle Logic ---
        let seekValue;
        if (virtualIndex <= 6) {
            seekValue = virtualIndex / 6;
        } else {
            let pReturn = virtualIndex - 6;
            seekValue = 1.0 - pReturn;
        }
        particleSystem.seek(seekValue);


        // --- 3. UI Logic ---
        const contactSection = document.querySelector('.contact-section');
        const mainHeader = document.querySelector('.main-header');

        const roundedIndex = Math.round(virtualIndex);

        if (roundedIndex === contactIndex) {
            contactSection.classList.add('visible');
            uiManager.labelContainer.style.opacity = 0;
            if (mainHeader) mainHeader.style.opacity = 0;
            contactSection.style.pointerEvents = 'auto';
        } else {
            contactSection.classList.remove('visible');
            if (mainHeader) mainHeader.style.opacity = 1;
            contactSection.style.pointerEvents = 'none';

            if (roundedIndex > 0 && roundedIndex < 7) {
                const diff = Math.abs(virtualIndex - roundedIndex);
                let opacity = 1 - (diff * 2.5);
                if (opacity < 0) opacity = 0;
                uiManager.updateLabel(labels[roundedIndex], opacity);
            } else {
                uiManager.updateLabel("", 0);
            }
        }

        sceneSetup.render();
    }
    animate();
}

import * as THREE from 'three';
window.THREE = THREE;
