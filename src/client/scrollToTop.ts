/**
 * Initialisiert die Scroll-to-Top-Schaltfläche.
 * Erwartet ein Element mit ID `scrollToTop` und data-Attribut `data-scroll-threshold`.
 */
export function initScrollToTop (): void
{
    const btn = document.getElementById( 'scrollToTop' );
    if ( !btn ) return;

    const thresholdAttr = ( btn.dataset.scrollThreshold ?? '300' ).trim();
    const threshold = Number.parseInt( thresholdAttr, 10 ) || 300;

    const updateVisibility = (): void =>
    {
        if ( window.scrollY > threshold )
        {
            btn.classList.add( 'visible' );
        } else
        {
            btn.classList.remove( 'visible' );
        }
    };

    window.addEventListener( 'scroll', updateVisibility );
    updateVisibility(); // Initialzustand prüfen

    btn.addEventListener( 'click', () =>
    {
        window.scrollTo( { top: 0, behavior: 'smooth' } );
    } );
}