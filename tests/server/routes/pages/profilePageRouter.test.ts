import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../../src/server/app';

describe( 'Profile routes', () =>
{
    let app: ReturnType<typeof createApp>;

    beforeEach( () =>
    {
        app = createApp();
    } );

    it( 'should return 200 and render profile page for existing user', async () =>
    {
        const response = await request( app ).get( '/profile/1' );
        expect( response.status ).toBe( 200 );
        expect( response.text ).toContain( 'Profil' );
    } );

    it( 'should return 404 for non-existing user', async () =>
    {
        const response = await request( app ).get( '/profile/9999' );
        expect( response.status ).toBe( 404 );
        expect( response.text ).toContain( "Die angeforderte Ressource wurde nicht gefunden." );
    } );

    it( 'should redirect to login for protected route if not logged in', async () =>
    {
        const response = await request( app ).post( '/profile/1' ).send( {
            author: 'Test',
            firstname: 'Test',
            lastname: 'Test',
            avatar: 'https://x.de'
        } ).redirects( 0 );
        expect( response.status ).toBe( 302 );
        expect( response.headers.location ).toBe( '/login' );
    } );
} );