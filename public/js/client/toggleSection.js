/**
 * Blendet ein Element per ID ein/aus und toggelt optional die Button-Klasse.
 */
export function toggleSection(id, buttonEl) {
    const section = document.getElementById(id);
    if (!section)
        return;
    const isHidden = section.classList.toggle('hidden');
    buttonEl?.classList.toggle('active', !isHidden);
}
