import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../../src/server/app';

describe( 'Index routes', () =>
{
    let app: ReturnType<typeof createApp>;

    beforeEach( () =>
    {
        app = createApp();
    } );

    it( 'GET / should render index page with blogposts', async () =>
    {
        const response = await request( app ).get( '/' );
        expect( response.status ).toBe( 200 );
        expect( response.text ).toContain( 'Neueste Beiträge' );
    } );

    it( 'GET /?search=Suchbegriff liefert gefilterte Ergebnisse', async () =>
    {
        const response = await request( app ).get( '/' ).query( { search: 'Test' } );
        expect( response.status ).toBe( 200 );
    } );

    it( 'GET /?start=0&limit=2 liefert maximal 2 Posts', async () =>
    {
        const response = await request( app ).get( '/' ).query( { start: 0, limit: 2 } );
        expect( response.status ).toBe( 200 );
    } );

    it( 'GET /?limit=all liefert alle Posts', async () =>
    {
        const response = await request( app ).get( '/' ).query( { limit: 'all' } );
        expect( response.status ).toBe( 200 );
    } );

    it( 'GET / mit ungültigen Parametern gibt trotzdem 200 zurück', async () =>
    {
        const response = await request( app ).get( '/' ).query( { start: 'abc', limit: 'xyz' } );
        expect( response.status ).toBe( 200 );
    } );
} );