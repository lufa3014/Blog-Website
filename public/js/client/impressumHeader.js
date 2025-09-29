document.addEventListener('DOMContentLoaded', () => {
    updateHeader();
});
/**
 * Lädt den aktuellen Header dynamisch vom Server nach und ersetzt das bestehende <header>-Element.
 */
export async function updateHeader() {
    const headerEl = document.querySelector('header');
    if (!headerEl)
        return;
    try {
        const res = await fetch('/partials/header');
        if (!res.ok)
            throw new Error('Fehler beim Laden des Headers');
        const html = await res.text();
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const newHeader = tmp.querySelector('header');
        if (newHeader) {
            headerEl.outerHTML = newHeader.outerHTML;
        }
    }
    catch (err) {
        console.error('Dynamisches Header-Update fehlgeschlagen:', err);
    }
}
