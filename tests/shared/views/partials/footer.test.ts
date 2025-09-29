import request from 'supertest';
import { createApp } from '../../../../src/server/app';
import * as cheerio from 'cheerio';
import { describe, it, expect, beforeAll } from 'vitest';

const app = createApp( { logging: false } );

describe( 'Footer', () =>
{
    let $: cheerio.Root;

    beforeAll( async () =>
    {
        const response = await request( app ).get( '/blogpost/1' );
        $ = cheerio.load( response.text );
    } );

    it( 'enthält ein <footer>-Element', () =>
    {
        expect( $( 'footer' ).length ).toBeGreaterThan( 0 );
    } );

    it( 'zeigt die Autoren mit Bild und Namen', () =>
    {
        expect( $( '.authorImg1' ).length ).toBeGreaterThan( 0 );
        expect( $( '.authorImg2' ).length ).toBeGreaterThan( 0 );
        expect( $( '.author' ).text() ).toMatch( /Florian Köster|Lukas Frahm/ );
    } );

    it( 'enthält einen Link zum Impressum', () =>
    {
        const impressumLinks = $( 'a.footer-link[href="/impressum"]' );
        expect( impressumLinks.length ).toBeGreaterThan( 0 );
        expect( impressumLinks.text() ).toContain( 'Impressum' );
    } );

    it( 'zeigt einen Zeitstempel an', () =>
    {
        expect( $( '.footer-timestamp' ).length ).toBeGreaterThan( 0 );
        expect( $( '.footer-timestamp' ).text().length ).toBeGreaterThan( 0 );
    } );

    it( 'enthält eine Live-Uhrzeit mit <time id="clock">', () =>
    {
        expect( $( '#clock' ).length ).toBe( 1 );
    } );
} );