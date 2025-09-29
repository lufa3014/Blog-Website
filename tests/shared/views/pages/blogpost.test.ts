import request from 'supertest';
import { createApp } from '../../../../src/server/app';
import * as cheerio from 'cheerio';
import { describe, it, expect, beforeAll } from 'vitest';

const app = createApp( { logging: false } );

describe( 'GET /blogpost/:id', () =>
{
    let $: cheerio.Root;

    const blogId = 1;

    beforeAll( async () =>
    {
        const response = await request( app ).get( `/blogpost/${ blogId }` );
        $ = cheerio.load( response.text );
    } );

    it( 'enthält eine Blogpost-Seite mit Titel', () =>
    {
        const title = $( 'h1.blogpost-title' ).text();
        expect( title.length ).toBeGreaterThan( 0 );
    } );

    it( 'zeigt mindestens einen Autor-Link zum Profil', () =>
    {
        const authorLinks = $( 'a.blogpost-author-link' );
        expect( authorLinks.length ).toBeGreaterThan( 0 );
        authorLinks.each( ( _, el ) =>
        {
            expect( $( el ).attr( 'href' ) ).toMatch( /^\/profile\/\d+/ );
        } );
    } );

    it( 'zeigt Kommentare oder einen Hinweis auf keine Kommentare', () =>
    {
        const commentSection = $( 'section.blogpost-comments' );
        expect( commentSection.length ).toBe( 1 );

        const hasComments = commentSection.find( '.comment' ).length > 0;
        const hasNoCommentsText = commentSection.text().includes( 'Noch keine Kommentare' );
        expect( hasComments || hasNoCommentsText ).toBe( true );
    } );

    it( 'zeigt Formular bei eingeloggtem Benutzer ODER Login-Hinweis', () =>
    {
        const hasForm = $( 'form.comment-form' ).length > 0;
        const hasHint = $( 'p.blogpost-login-hint' ).length > 0;
        expect( hasForm || hasHint ).toBe( true );
    } );

    it( 'ist semantisch strukturiert mit <section> und <article>', () =>
    {
        expect( $( 'section' ).length ).toBeGreaterThanOrEqual( 2 );
        expect( $( 'article' ).length ).toBeGreaterThan( 0 );
    } );
} );
