import request from 'supertest';
import { createApp } from '../../../../src/server/app';
import * as cheerio from 'cheerio';
import { describe, it, expect, beforeAll } from 'vitest';

const app = createApp( { logging: false } );

describe( 'GET /', () =>
{
    let $: cheerio.Root;

    beforeAll( async () =>
    {
        const response = await request( app ).get( '/' );
        $ = cheerio.load( response.text );
    } );

    it( 'enthält das Suchformular', () =>
    {
        expect( $( 'form[action="/"]' ).length ).toBeGreaterThan( 0 );
        expect( $( 'input[name="search"]' ).length ).toBeGreaterThan( 0 );
    } );

    it( 'zeigt die Überschrift "Neueste Beiträge"', () =>
    {
        expect( $( 'h2' ).filter( ( _, el ) => $( el ).text().includes( 'Neueste Beiträge' ) ).length ).toBe( 1 );
    } );

    it( 'listet mindestens einen Blogpost auf', () =>
    {
        expect( $( '.blogpost-list' ).find( '.blogpost-preview' ).length ).toBeGreaterThan( 0 );
    } );

    it( 'zeigt die Überschrift "Populärste Kommentare"', () =>
    {
        expect( $( 'h2' ).filter( ( _, el ) => $( el ).text().includes( 'Populärste Kommentare' ) ).length ).toBe( 1 );
    } );

    it( 'enthält Paginierung', () =>
    {
        expect( $( '.pagination-block' ).length ).toBeGreaterThanOrEqual( 1 );
        expect( $( 'select[name="limit"]' ).length ).toBeGreaterThan( 0 );
    } );
} );