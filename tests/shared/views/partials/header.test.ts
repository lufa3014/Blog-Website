import request from 'supertest';
import { createApp } from '../../../../src/server/app';
import * as cheerio from 'cheerio';
import { describe, it, expect, beforeAll } from 'vitest';

const app = createApp( { logging: false } );

describe( 'Header', () =>
{
    let $: cheerio.Root;

    beforeAll( async () =>
    {
        const response = await request( app ).get( '/blogpost/1' );
        $ = cheerio.load( response.text );
    } );

    it( 'enthält ein <header>-Element mit Logo', () =>
    {
        expect( $( 'header' ).length ).toBeGreaterThan( 0 );
        expect( $( 'header img[alt="Logo"]' ).length ).toBeGreaterThan( 0 );
        expect( $( 'h1.title' ).text() ).toMatch( /Blossom.*Log/ );
    } );

    it( 'enthält eine Navigation mit Link zur Startseite', () =>
    {
        const startLinks = $( 'a.nav-link[href="/"]' );
        expect( startLinks.length ).toBeGreaterThan( 0 );
        expect( startLinks.text() ).toContain( 'Startseite' );
    } );

    it( 'zeigt einen Login- oder Profil-Link', () =>
    {
        const loginLinks = $( 'a.nav-link[href="/login"]' );
        const profilLinks = $( 'a.nav-link[href^="/profile/"]' );
        expect( loginLinks.length + profilLinks.length ).toBeGreaterThan( 0 );
    } );

    it( 'enthält einen Logout-Link, wenn eingeloggt', async () =>
    {
        const agent = request.agent( app );
        await agent.post( '/login' ).send( { author: 'Crazy', password: 'fhwedel' } );
        const response = await agent.get( '/blogpost/1' );
        const $auth = cheerio.load( response.text );

        expect( $auth( 'form[action="/login/logout"] a.nav-link' ).length ).toBeGreaterThan( 0 );
        expect( $auth( 'form[action="/login/logout"] a.nav-link' ).text() ).toContain( 'Logout' );
    } );
} );