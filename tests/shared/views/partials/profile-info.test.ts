import request from 'supertest';
import { createApp } from '../../../../src/server/app';
import * as cheerio from 'cheerio';
import { describe, it, expect, beforeAll } from 'vitest';

const app = createApp( { logging: false } );

describe( 'profile-info Partial', () =>
{
    let $: cheerio.Root;

    beforeAll( async () =>
    {
        const response = await request( app ).get( '/profile/5' );
        $ = cheerio.load( response.text );
    } );

    it( 'enthält einen Block mit Klasse .profile-info', () =>
    {
        expect( $( '.profile-info' ).length ).toBeGreaterThan( 0 );
    } );

    it( 'zeigt den Namen und Benutzernamen an', () =>
    {
        const info = $( '.profile-info' ).text();
        expect( info ).toMatch( /Name:/ );
        expect( info ).toMatch( /Benutzername:/ );

        // Es sollte auch ein Name und ein Benutzername angezeigt werden (mind. ein Wort nach dem Label)
        expect( info ).toMatch( /Name:\s+\w+/ );
        expect( info ).toMatch( /Benutzername:\s+\w+/ );
    } );

    it( 'enthält die Daten in <p>-Tags mit <span>-Labels', () =>
    {
        const paragraphs = $( '.profile-info p' );
        expect( paragraphs.length ).toBeGreaterThanOrEqual( 2 );
        paragraphs.each( ( _, el ) =>
        {
            expect( $( el ).find( 'span' ).length ).toBeGreaterThanOrEqual( 1 );
        } );
    } );
} );