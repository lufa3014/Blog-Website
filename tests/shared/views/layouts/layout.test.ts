import request from 'supertest';
import { createApp } from '../../../../src/server/app';
import * as cheerio from 'cheerio';
import { describe, it, expect, beforeAll } from 'vitest';

const app = createApp( { logging: false } );

describe( 'Layout', () =>
{
    let $: cheerio.Root;

    beforeAll( async () =>
    {
        const response = await request( app ).get( '/blogpost/1' );
        $ = cheerio.load( response.text );
    } );

    it( 'enthält das Basis-HTML-Gerüst', () =>
    {
        expect( $( 'html[lang="de"]' ).length ).toBe( 1 );
        expect( $( 'head' ).length ).toBe( 1 );
        expect( $( 'body' ).length ).toBe( 1 );
    } );

    it( 'bindet Header und Footer ein', () =>
    {
        expect( $( 'header' ).length ).toBeGreaterThan( 0 );
        expect( $( 'footer' ).length ).toBeGreaterThan( 0 );
    } );

    it( 'enthält einen <main>-Bereich mit Content', () =>
    {
        expect( $( 'main' ).length ).toBe( 1 );
        expect( $( 'main' ).text().length ).toBeGreaterThan( 0 );
    } );

    it( 'bindet globale Stylesheets und Scripts ein', () =>
    {
        expect( $( 'link[href="/styles/base.css"]' ).length ).toBe( 1 );
        expect( $( 'link[href="/styles/layout.css"]' ).length ).toBe( 1 );
        expect( $( 'script[src="/js/pug.js"]' ).length ).toBe( 1 );
        expect( $( 'script[src="/js/client/client.js"]' ).length ).toBe( 1 );
    } );

    it( 'enthält einen Scroll-to-Top-Button', () =>
    {
        expect( $( '#scrollToTop' ).length ).toBe( 1 );
    } );

    it( 'hat einen Favicon-Link', () =>
    {
        expect( $( 'link[rel="icon"][href="/logo.png"]' ).length ).toBe( 1 );
    } );

    it( 'bindet Google Material Icons ein', () =>
    {
        expect( $( 'link[href*="fonts.googleapis.com"]' ).length ).toBeGreaterThan( 0 );
    } );
} );