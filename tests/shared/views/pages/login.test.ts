import request from 'supertest';
import { createApp } from '../../../../src/server/app';
import * as cheerio from 'cheerio';
import { describe, it, expect, beforeAll } from 'vitest';

const app = createApp( { logging: false } );

describe( 'GET /login', () =>
{
    let $: cheerio.Root;

    beforeAll( async () =>
    {
        const response = await request( app ).get( '/login' );
        $ = cheerio.load( response.text );
    } );

    it( 'zeigt die Überschrift "Login"', () =>
    {
        expect( $( 'h1' ).text() ).toContain( 'Login' );
    } );

    it( 'enthält ein Login-Formular mit Benutzername und Passwort', () =>
    {
        const form = $( 'form[action="/login"]' );
        expect( form.length ).toBe( 1 );
        expect( form.find( 'input[name="author"]' ).length ).toBe( 1 );
        expect( form.find( 'input[name="password"]' ).length ).toBe( 1 );
        expect( form.find( 'input[type="submit"]' ).length ).toBe( 1 );
    } );

    it( 'zeigt keine Fehlermeldung ohne Fehler', () =>
    {
        expect( $( 'p.error' ).length ).toBe( 0 );
    } );
} );