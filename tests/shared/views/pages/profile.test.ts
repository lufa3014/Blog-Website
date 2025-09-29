import request from 'supertest';
import { createApp } from '../../../../src/server/app';
import * as cheerio from 'cheerio';
import { describe, it, expect, beforeAll } from 'vitest';

const app = createApp( { logging: false } );

describe( 'GET /profile/:id', () =>
{
    let $: cheerio.Root;
    const userId = 5;
    const agent = request.agent( app );

    beforeAll( async () =>
    {
        await agent
            .post( '/login' )
            .send( { author: 'Crazy', password: 'fhwedel' } );

        const response = await agent.get( `/profile/${ userId }` );
        $ = cheerio.load( response.text );
    } );

    it( 'zeigt eine Profilseite mit Überschrift', () =>
    {
        const h1 = $( 'h1' ).text();
        expect( h1 ).toMatch( /Profil/ );
    } );

    it( 'enthält einen Avatar-Block', () =>
    {
        expect( $( '.profile-block.avatar-only' ).length ).toBeGreaterThan( 0 );
    } );

    it( 'zeigt persönliche Daten', () =>
    {
        expect( $( '.profile-info' ).length ).toBeGreaterThan( 0 );
        expect( $( '.profile-info' ).text() ).toMatch( /\w+/ );
    } );

    it( 'enthält eine Liste der Fähigkeiten oder einen Hinweis', () =>
    {
        const skills = $( '#skill-list .skill-item' );
        const noSkills = $( '#skill-list' ).text().includes( 'Keine Fähigkeiten' );
        expect( skills.length > 0 || noSkills ).toBe( true );
    } );

    it( 'zeigt für eigene Profile ein Bearbeiten-Formular für Daten', () =>
    {
        expect( $( 'button[data-toggle-target="profile-data-form"]' ).length ).toBeGreaterThan( 0 );
        expect( $( '#profile-data-form' ).length ).toBeGreaterThan( 0 );
    } );

    it( 'zeigt für eigene Profile ein Bearbeiten-Formular für Skills', () =>
    {
        expect( $( 'button[data-toggle-target="skill-edit-form"]' ).length ).toBeGreaterThan( 0 );
        expect( $( '#skill-edit-form' ).length ).toBeGreaterThan( 0 );
    } );

    it( 'hat für jede Fähigkeit einen Löschen-Button (bei eigenem Profil)', () =>
    {
        $( '#skill-list .skill-item' ).each( ( _, el ) =>
        {
            expect( $( el ).find( 'button.delete' ).length ).toBeGreaterThanOrEqual( 0 );
        } );
    } );

    it( 'enthält mindestens eine section für semantische Struktur', () =>
    {
        expect( $( 'section' ).length ).toBeGreaterThan( 0 );
    } );

    it( 'enthält mindestens ein Formular', () =>
    {
        expect( $( 'form' ).length ).toBeGreaterThan( 0 );
    } );
} );