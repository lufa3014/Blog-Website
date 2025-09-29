/**
 * Aktiviert das Umschalten der Klasse `.zoomed` beim Klick auf `.zoomable`-Elemente.
 */
export function initImageZoom() {
    document.querySelectorAll('.zoomable').forEach((img) => {
        img.addEventListener('click', () => {
            img.classList.toggle('zoomed');
        });
    });
}
