function updateClock ( el: HTMLElement ): void
{
    el.textContent = new Date().toLocaleTimeString( 'de-DE' );
}

/**
 * Initialisiert eine Live-Uhr in einem HTML-Element mit der ID `clock`.
 *
 * Das Element kann über das Attribut `data-update-interval` ein benutzerdefiniertes
 * Aktualisierungsintervall in Millisekunden angeben. Falls kein gültiger Wert vorhanden ist,
 * wird ein Fallback von 1000 ms verwendet.
 *
 * @remarks
 * Diese Funktion findet das Uhr-Element im DOM und aktualisiert dessen Inhalt
 * automatisch in regelmäßigen Abständen.
 *
 * @example
 * ```html
 * <span id="clock" data-update-interval="500"></span>
 * ```
 * ```ts
 * initClock()
 * ```
 */
export function initClock (): void
{
    const clockEl = document.getElementById( 'clock' );
    if ( !clockEl ) return;

    const intervalAttr = ( clockEl.dataset.updateInterval ?? '1000' ).trim();
    const interval = Number.parseInt( intervalAttr, 10 ) || 1000;

    updateClock( clockEl );

    window.setInterval( () => updateClock( clockEl ), interval );
}

