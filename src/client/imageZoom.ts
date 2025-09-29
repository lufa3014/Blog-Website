/**
 * Aktiviert das Umschalten der Klasse `.zoomed` beim Klick auf `.zoomable`-Elemente.
 */
export function initImageZoom (): void
{
    document.querySelectorAll<HTMLElement>( '.zoomable' ).forEach( ( img ) =>
    {
        img.addEventListener( 'click', () =>
        {
            img.classList.toggle( 'zoomed' );
        } );
    } );
}