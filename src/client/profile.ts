type TemplateFunction = ( data: Record<string, unknown> ) => string;
interface PugStandalone
{
    compile: ( pugText: string ) => TemplateFunction;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pug: PugStandalone = require( 'pug' );

function toggleSection ( id: string, btn: HTMLElement )
{
    const section = document.getElementById( id );
    if ( !section ) return;
    const isHidden = section.classList.toggle( 'hidden' );
    btn.textContent = isHidden ? 'Fähigkeiten bearbeiten' : 'Schließen';
}

( window as Window & typeof globalThis & { toggleSection: typeof toggleSection; } ).toggleSection = toggleSection;

/**
 * Aktiviert das Formular zum Bearbeiten persönlicher Profildaten
 * (Name & Avatar) auf der Profilseite.
 *
 * - Sendet beim Submit die Formulardaten per `fetch` als JSON an den Server.
 * - Ersetzt anschließend dynamisch die HTML-Fragmente
 *   **profile-info** und **profile-avatar** durch die vom Server
 *   zurückgelieferten, frisch gerenderten Pug-Vorlagen.
 * - Registriert sich danach **erneut** selbst, um mit dem neu eingefügten
 *   Formular weiter zu funktionieren.
 *
 * @remarks
 * Diese Funktion erwartet, dass auf der Seite folgende Selektoren existieren:
 * - `#profile-data-form`
 * - `.profile-info`
 * - `.profile-block.avatar-only`
 *
 * @throws `Error` wenn das Nachladen oder Ersetzen der Fragmente fehlschlägt.
 */
export function initProfileForm (): void
{
    const form = document.querySelector<HTMLFormElement>( '#profile-data-form' );
    const infoContainer = document.querySelector<HTMLElement>( '.profile-info' );
    const avatarContainer = document.querySelector<HTMLElement>( '.profile-block.avatar-only' );
    if ( !form || !infoContainer || !avatarContainer ) return;

    form.addEventListener( 'submit', async event =>
    {
        event.preventDefault();

        try
        {
            const formData = new FormData( form );
            const payload = Object.fromEntries( formData.entries() );
            const response = await fetch( form.action, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( payload ),
            } );
            if ( !response.ok )
            {
                throw new Error( `Fehler beim Speichern (Status ${ response.status })` );
            }
            const data = await response.json();

            {
                const res = await fetch( '/partials/profile-info.pug' );
                const pugText = await res.text();
                const template = pug.compile( pugText );
                const newHtml = template( data );
                const wrapper = document.createElement( 'div' );
                wrapper.innerHTML = newHtml;
                const newInfo = wrapper.querySelector<HTMLElement>( '.profile-info' );
                if ( !newInfo ) throw new Error( 'Kein .profile-info gefunden' );
                infoContainer.replaceWith( newInfo );
            }

            {
                const res = await fetch( '/partials/profile-avatar.pug' );
                const pugText = await res.text();
                const template = pug.compile( pugText );
                const newHtml = template( { user: data } );
                const wrapper = document.createElement( 'div' );
                wrapper.innerHTML = newHtml;
                const newAvatar = wrapper.querySelector<HTMLElement>( '.profile-block.avatar-only' );
                if ( !newAvatar ) throw new Error( 'Kein .profile-block.avatar-only-Block gefunden' );
                avatarContainer.replaceWith( newAvatar );
            }

            initProfileForm();
        }
        catch ( err )
        {
            console.error( 'Profilaktualisierung fehlgeschlagen:', err );
        }
    } );
}

/**
 * Initialisiert die Skill-Verwaltung auf der Profilseite.
 *
 * Funktionen:
 * 1. **Skill hinzufügen** – schickt einen POST-Request und rendert
 *    sofort ein neues `<li>` mittels `<template id="skill-template">`.
 * 2. **Skill löschen** – schickt einen DELETE-ähnlichen POST-Request
 *    (Payload `{ method: 'delete' }`) und entfernt das entsprechende
 *    `<li>` bei Erfolg.
 *
 * @remarks
 * Erfordert folgende Elemente im DOM:
 * - `.profile[data-user-id]`      (Haupt-Wrapper mit `data-user-id`)
 * - `#skill-list`                 `<ul>` der Skills
 * - `#skill-edit-form`            Formular zum Hinzufügen
 * - `#skill-template`             `<template>` mit einem `<li>`
 *
 * @example
 * ```html
 * <ul id="skill-list"></ul>
 * <form id="skill-edit-form" action="/profile/7/skill">
 *   <input name="skill" />
 *   <button type="submit">Add</button>
 * </form>
 * <template id="skill-template">
 *   <li data-skill="">
 *     <span class="skill-name"></span>
 *     <button class="delete">x</button>
 *   </li>
 * </template>
 * ```
 */
export function initSkills (): void
{
    const mainEl = document.querySelector<HTMLElement>( '.profile[data-user-id]' );
    const userId = mainEl?.dataset.userId;
    if ( !mainEl || !userId ) return;

    const list = document.getElementById( 'skill-list' ) as HTMLUListElement | null;
    const formAdd = document.getElementById( 'skill-edit-form' ) as HTMLFormElement | null;
    const tpl = document.getElementById( 'skill-template' ) as HTMLTemplateElement | null;
    if ( !list || !formAdd || !tpl ) return;

    formAdd.addEventListener( 'submit', async e =>
    {
        e.preventDefault();
        const input = formAdd.elements.namedItem( 'skill' ) as HTMLInputElement;
        const skill = input.value.trim();
        if ( !skill ) return;

        const res = await fetch( formAdd.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { method: 'post', skill } ),
        } );
        if ( !res.ok )
        {
            console.error( 'Fehler beim Hinzufügen' );
            return;
        }

        const clone = tpl.content.firstElementChild!.cloneNode( true ) as HTMLElement;
        clone.setAttribute( 'data-skill', skill );
        clone.querySelector( '.skill-name' )!.textContent = skill;
        list.appendChild( clone );

        input.value = '';
    } );

    list.addEventListener( 'click', async e =>
    {
        const btn = ( e.target as HTMLElement ).closest( 'button.delete' );
        if ( !btn ) return;

        const li = btn.closest( 'li' )!;
        const skill = li.getAttribute( 'data-skill' )!;
        const res = await fetch( `/profile/${ userId }/skill`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { method: 'delete', skill } ),
        } );

        if ( res.ok )
        {
            li.remove();
        } else
        {
            console.error( 'Fehler beim Löschen' );
        }
    } );
}