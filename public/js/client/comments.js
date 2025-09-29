/**
 * Platziert `.comment-wrapper`-Elemente zufällig auf großen Bildschirmen,
 * linear und auf 3 begrenzt auf kleinen (mobile) Geräten.
 */
export function initCommentsLayout() {
    const boardEl = document.querySelector('.comment-board');
    const allWrappers = Array.from(document.querySelectorAll('.comment-wrapper'));
    if (!boardEl || allWrappers.length === 0)
        return;
    const board = boardEl;
    const wrapperWidth = 320;
    const wrapperHeight = 160;
    const margin = 100; // Abstand zum Rand
    const spacing = 150; // Abstand zu anderen Kommentaren
    const fillRatio = 0.5; // Wie viel Fläche max. genutzt wird (50%)
    function clearPositions() {
        allWrappers.forEach(w => {
            w.style.display = 'none';
            w.style.position = 'absolute';
        });
    }
    function layoutComments() {
        clearPositions();
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            allWrappers.forEach((wrapper, index) => {
                wrapper.style.position = 'relative';
                wrapper.style.left = '';
                wrapper.style.top = '';
                wrapper.style.display = index < 3 ? 'flex' : 'none';
                wrapper.style.visibility = 'visible';
            });
            return;
        }
        const boardRect = board.getBoundingClientRect();
        const boardW = boardRect.width;
        const boardH = boardRect.height;
        const area = boardW * boardH;
        const commentArea = (wrapperWidth + spacing) * (wrapperHeight + spacing);
        const maxCount = Math.min(allWrappers.length, Math.floor((area * fillRatio) / commentArea));
        const active = allWrappers.slice(0, maxCount);
        const placed = [];
        active.forEach(wrapper => {
            let x, y, tries = 0, collides;
            wrapper.style.visibility = 'hidden';
            board.appendChild(wrapper);
            do {
                x = Math.floor(Math.random() * (boardW - wrapperWidth - 2 * margin)) + margin;
                y = Math.floor(Math.random() * (boardH - wrapperHeight - 2 * margin)) + margin;
                const rect = {
                    x: x - spacing / 2,
                    y: y - spacing / 2,
                    w: wrapperWidth + spacing,
                    h: wrapperHeight + spacing
                };
                collides = placed.some(p => !(rect.x + rect.w < p.x || rect.x > p.x + p.w || rect.y + rect.h < p.y || rect.y > p.y + p.h));
                tries++;
            } while (collides && tries < 150);
            if (tries < 150) {
                wrapper.style.left = `${x}px`;
                wrapper.style.top = `${y}px`;
                wrapper.style.display = 'flex';
                wrapper.style.visibility = 'visible';
                placed.push({ x, y, w: wrapperWidth, h: wrapperHeight });
            }
        });
    }
    layoutComments();
    window.addEventListener('resize', layoutComments);
}
