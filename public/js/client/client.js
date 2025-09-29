import { initClock } from "./clock.js";
import { initCommentsLayout } from "./comments.js";
import { initImageZoom } from "./imageZoom.js";
import { initImpressum } from "./impressum.js";
import { initProfileForm, initSkills } from "./profile.js";
import { initScrollToTop } from "./scrollToTop.js";
import { toggleSection } from "./toggleSection.js";
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initScrollToTop();
    initImpressum();
    initProfileForm();
    initSkills();
    initImageZoom();
    initCommentsLayout();
    // Globaler Delegate für alle [data-toggle-target]
    document
        .querySelectorAll('[data-toggle-target]')
        .forEach(btn => btn.addEventListener('click', () => {
        const targetId = btn.dataset.toggleTarget;
        if (targetId)
            toggleSection(targetId, btn);
    }));
});
