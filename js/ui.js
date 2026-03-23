import { skillData } from './data.js';

export class UIManager {
    constructor() {
        this.overlay = document.getElementById('content-overlay');
        if (this.overlay) this.overlay.style.display = 'none';

        // Grouped Label & Hint Container
        this.labelContainer.className = 'label-group';
        this.labelContainer.style.position = 'fixed';
        this.labelContainer.style.bottom = '8%';
        this.labelContainer.style.width = '100%';
        this.labelContainer.style.display = 'flex';
        this.labelContainer.style.flexDirection = 'column';
        this.labelContainer.style.alignItems = 'center';
        this.labelContainer.style.pointerEvents = 'none';
        this.labelContainer.style.zIndex = '50';
        document.body.appendChild(this.labelContainer);

        // Click Hint (now a child of labelContainer)
        this.clickHint = document.createElement('div');
        this.clickHint.id = 'click-hint';
        this.clickHint.textContent = "CLICK PARA EXPLORAR";
        this.labelContainer.appendChild(this.clickHint);

        // Label element (will be created in updateLabel)
        this.labelElement = document.createElement('h1');
        this.labelElement.className = 'section-label';
        this.labelContainer.appendChild(this.labelElement);

        // Detail Overlay
        this.detailOverlay = document.getElementById('detail-overlay');
        this.detailTitle = document.getElementById('detail-title');
        this.closeBtn = document.querySelector('.close-detail-btn');

        this.currentLabel = null;
        this.hintTimeout = null;
        this.isDetailOpen = false;

        this.setupEvents();
    }

    setupEvents() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeDetail();
            });
        }

        // Global Click & Touch Listener
        const handleInteraction = (e) => {
            if (this.isDetailOpen) return;

            // Ignore interaction elements
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            // Ignore contact section clicks
            if (e.target.closest('.contact-section')) return;

            // If we have a valid label (meaning we are on a skill section), open details
            if (this.currentLabel && this.currentLabel !== "") {
                this.openDetail(this.currentLabel);
            }
        };

        window.addEventListener('click', handleInteraction);
    }

    updateLabel(label, opacity) {
        if (this.currentLabel !== label) {
            this.labelElement.textContent = label;
            this.currentLabel = label;
        }
        this.labelContainer.style.opacity = opacity;

        if (opacity < 0.5) {
            this.hideHint();
        } else {
            if (!this.isDetailOpen && label !== "") this.scheduleHint();
        }
    }

    scheduleHint() {
        if (this.hintTimeout) return;
        this.hintTimeout = setTimeout(() => {
            this.clickHint.style.opacity = 0.6;
        }, 1200);
    }

    hideHint() {
        this.clickHint.style.opacity = 0;
        if (this.hintTimeout) {
            clearTimeout(this.hintTimeout);
            this.hintTimeout = null;
        }
    }

    openDetail(title) {
        this.isDetailOpen = true;
        this.hideHint();
        this.labelContainer.style.opacity = 0;

        const data = skillData[title];
        if (data) {
            if (this.detailTitle) this.detailTitle.textContent = title;
            const detailBody = document.querySelector('.detail-body');
            if (detailBody) {
                detailBody.innerHTML = `
                    <p style="font-size: 1.2rem; line-height: 1.6; margin-bottom: 2rem; color: #66fcf1;">${data.description}</p>
                    <ul style="list-style: none; padding: 0;">
                        ${data.bullets.map(b => `
                            <li style="margin-bottom: 1rem; padding-left: 1.5rem; position: relative;">
                                <span style="position: absolute; left: 0; color: #66fcf1;">▹</span>
                                ${b}
                            </li>
                        `).join('')}
                    </ul>
                `;
            }
        }

        if (this.detailOverlay) this.detailOverlay.classList.add('active');
    }

    closeDetail() {
        this.isDetailOpen = false;
        if (this.detailOverlay) this.detailOverlay.classList.remove('active');
        this.labelContainer.style.opacity = 1;
    }
}
