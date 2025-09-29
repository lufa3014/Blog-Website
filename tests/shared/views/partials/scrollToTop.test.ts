import request from 'supertest';
import { createApp } from '../../../../src/server/app';
import * as cheerio from 'cheerio';
import { describe, it, expect, beforeAll } from 'vitest';

const app = createApp( { logging: false } );

describe( 'scrollToTop Partial', () =>
{
    let $: cheerio.Root;

    beforeAll( async () =>
    {
        const response = await request( app ).get( '/blogpost/1' );
        $ = cheerio.load( response.text );
    } );

    it( 'enthält einen Button mit id="scrollToTop" und Klasse "scroll-to-top"', () =>
    {
        const btn = $( '#scrollToTop.scroll-to-top' );
        expect( btn.length ).toBe( 1 );
    } );

    it( 'hat das Attribut type="button"', () =>
    {
        const btn = $( '#scrollToTop' );
        expect( btn.attr( 'type' ) ).toBe( 'button' );
    } );

    it( 'hat das Attribut aria-label für Barrierefreiheit', () =>
    {
        const btn = $( '#scrollToTop' );
        expect( btn.attr( 'aria-label' ) ).toBeDefined();
        expect( btn.attr( 'aria-label' ) ).toMatch( /oben|scrollen/i );
    } );

    it( 'hat das data-scroll-threshold-Attribut', () =>
    {
        const btn = $( '#scrollToTop' );
        expect( btn.attr( 'data-scroll-threshold' ) ).toBeDefined();
        expect( Number( btn.attr( 'data-scroll-threshold' ) ) ).toBeGreaterThanOrEqual( 0 );
    } );

    it( 'zeigt als Inhalt einen Pfeil oder ähnliches Symbol', () =>
    {
        const btn = $( '#scrollToTop' );
        expect( btn.text().trim() ).toMatch( /↑|⇧|top/i );
    } );
} );