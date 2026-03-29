import { skillData } from './data_eng.js';

export class UIManager {
    constructor() {
        this.overlay = document.getElementById('content-overlay');
        if (this.overlay) this.overlay.style.display = 'none';

        // Grouped Label & Hint Container
        this.labelContainer = document.createElement('div');
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

        // Click Hint
        this.clickHint = document.createElement('div');
        this.clickHint.id = 'click-hint';
        this.clickHint.textContent = "CLICK TO EXPLORE";
        this.labelContainer.appendChild(this.clickHint);

        // Label element
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

        // Touch Tracking
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isScrolling = false;

        // Contact Popup
        this.headerContactBtn = document.getElementById('header-contact-btn');
        this.mobileContactBtn = document.getElementById('mobile-contact-btn');
        this.contactPopup = document.getElementById('contact-popup');

        this.setupEvents();
    }

    setupEvents() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeDetail();
            });
            this.closeBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeDetail();
            });
        }

        const toggleContact = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.contactPopup.classList.toggle('active');
        };

        if (this.headerContactBtn) {
            this.headerContactBtn.addEventListener('click', toggleContact);
            this.headerContactBtn.addEventListener('touchend', toggleContact);
        }
        if (this.mobileContactBtn) {
            this.mobileContactBtn.addEventListener('click', toggleContact);
            this.mobileContactBtn.addEventListener('touchend', toggleContact);
        }

        window.addEventListener('click', (e) => {
            if (this.contactPopup && this.contactPopup.classList.contains('active')) {
                if (!this.contactPopup.contains(e.target) && 
                    e.target !== this.headerContactBtn && 
                    e.target !== this.mobileContactBtn) {
                    this.contactPopup.classList.remove('active');
                }
            }
        });

        window.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.isScrolling = false;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            const dx = e.touches[0].clientX - this.touchStartX;
            const dy = e.touches[0].clientY - this.touchStartY;
            if (Math.abs(dx) > 15 || Math.abs(dy) > 15) {
                this.isScrolling = true;
            }
        }, { passive: true });

        const handleInteraction = (e) => {
            if (this.isScrolling || this.isDetailOpen) return;
            if (e.defaultPrevented) return;

            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.target.closest('.contact-section')) return;

            if (this.currentLabel && this.currentLabel !== "") {
                this.openDetail(this.currentLabel);
            }
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchend', handleInteraction);
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
                let htmlContent = `
                    <p style="font-size: 1.15rem; line-height: 1.65; margin-bottom: 2rem; color: #ffffff; opacity: 0.9;">${data.description}</p>
                    <div class="portfolio-card">
                `;
                if (data.impact && data.impact.length > 0) {
                    htmlContent += `
                        <div class="impact-grid">
                            ${data.impact.map(stat => `
                                <div class="impact-stat">
                                    <span class="stat-value">${stat.value}</span>
                                    <span class="stat-label">${stat.label}</span>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
                htmlContent += `
                    <ul style="list-style: none; padding: 0; margin-bottom: 2.5rem;">
                        ${data.bullets.map(b => `
                            <li style="margin-bottom: 1.2rem; padding-left: 1.8rem; position: relative; font-size: 1rem; color: #ccc;">
                                <span style="position: absolute; left: 0; color: #66fcf1; font-weight: bold;">▹</span>
                                ${b}
                            </li>
                        `).join('')}
                    </ul>
                `;
                if (data.images && data.images.length > 0) {
                    htmlContent += `
                        <div class="portfolio-images">
                            ${data.images.map(img => `
                                <div class="project-image-wrap">
                                    <img src="${img.url}" alt="${img.caption}" loading="lazy">
                                    <div class="image-caption">// ${img.caption}</div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
                htmlContent += `</div>`;
                detailBody.innerHTML = htmlContent;
                document.querySelector('.detail-content').scrollTop = 0;
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
