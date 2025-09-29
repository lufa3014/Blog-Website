import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../../src/server/app';

describe( 'Blogpost routes', () =>
{
    let app: ReturnType<typeof createApp>;

    beforeEach( () =>
    {
        app = createApp();
    } );

    it( 'GET /blogpost/:id liefert Blogpost-Seite für existierenden Post', async () =>
    {
        const response = await request( app ).get( '/blogpost/1' );
        expect( response.status ).toBe( 200 );
        expect( response.text ).toContain( 'Kommentare' );
        expect( response.text ).toMatch( /Geschrieben von <a.*>.*<\/a> am/ );
    } );

    it( 'GET /blogpost/:id gibt 404 für nicht existierenden Post', async () =>
    {
        const response = await request( app ).get( '/blogpost/99999' );
        expect( response.status ).toBe( 404 );
        expect( response.text ).toContain( 'Die angeforderte Ressource wurde nicht gefunden.' );
    } );

    it( 'GET /blogpost/:id gibt 404 für ungültige ID', async () =>
    {
        const response = await request( app ).get( '/blogpost/abc' );
        expect( response.status ).toBe( 404 );
        expect( response.text ).toContain( 'Die angeforderte Ressource wurde nicht gefunden.' );
    } );

    it( 'POST /blogpost/:id/comment/:commentIndex/upvote ohne Login wird weitergeleitet', async () =>
    {
        const response = await request( app )
            .post( '/blogpost/1/comment/0/upvote' )
            .redirects( 0 );
        expect( response.status ).toBe( 302 );
        expect( response.headers.location ).toBe( '/login' );
    } );

    it( 'POST /blogpost/:id/comment/:commentIndex/downvote ohne Login wird weitergeleitet', async () =>
    {
        const response = await request( app )
            .post( '/blogpost/1/comment/0/downvote' )
            .redirects( 0 );
        expect( response.status ).toBe( 302 );
        expect( response.headers.location ).toBe( '/login' );
    } );

    it( 'POST /blogpost/:id/comment ohne Login wird weitergeleitet', async () =>
    {
        const response = await request( app )
            .post( '/blogpost/1/comment' )
            .send( { text: 'Testkommentar' } )
            .redirects( 0 );
        expect( response.status ).toBe( 302 );
        expect( response.headers.location ).toBe( '/login' );
    } );

    it( 'POST /blogpost/:id/comment gibt 400 bei leerem Kommentartext', async () =>
    {
        const agent = request.agent( app );

        await agent.post( '/login' ).send( { author: 'Crazy', password: 'fhwedel' } );

        const response = await agent
            .post( '/blogpost/1/comment' )
            .send( { text: '' } );
        expect( response.status ).toBe( 404 );
        expect( response.text ).toContain( 'Die angeforderte Ressource wurde nicht gefunden.' );
    } );

    it( 'POST /blogpost/:id/comment/:commentIndex/upvote gibt 404 bei ungültiger ID', async () =>
    {
        const agent = request.agent( app );
        await agent.post( '/login' ).send( { author: 'Crazy', password: 'fhwedel' } );

        const response = await agent
            .post( '/blogpost/abc/comment/xyz/upvote' );
        expect( response.status ).toBe( 404 );
        expect( response.text ).toContain( 'Die angeforderte Ressource wurde nicht gefunden.' );
    } );

    it( 'POST /blogpost/:id/comment/:commentIndex/downvote gibt 404 bei ungültiger ID', async () =>
    {
        const agent = request.agent( app );
        await agent.post( '/login' ).send( { author: 'Crazy', password: 'fhwedel' } );

        const response = await agent
            .post( '/blogpost/abc/comment/xyz/downvote' );
        expect( response.status ).toBe( 404 );
        expect( response.text ).toContain( 'Die angeforderte Ressource wurde nicht gefunden.' );
    } );
} );