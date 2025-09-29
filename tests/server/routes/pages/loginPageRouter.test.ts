import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../../src/server/app';

describe( 'Login routes', () =>
{
    let app: ReturnType<typeof createApp>;

    beforeEach( () =>
    {
        app = createApp();
    } );

    it( 'GET /login should render login page', async () =>
    {
        const response = await request( app ).get( '/login' );
        expect( response.status ).toBe( 200 );
        expect( response.text ).toContain( 'Login' );
    } );

    it( 'POST /login fails with missing credentials', async () =>
    {
        const response = await request( app )
            .post( '/login' )
            .send( { author: '', password: '' } );
        expect( response.status ).toBe( 400 );
        expect( response.text ).toContain( 'Username and password are required' );
    } );

    it( 'POST /login fails with wrong credentials', async () =>
    {
        const response = await request( app )
            .post( '/login' )
            .send( { author: 'notfound', password: 'wrong' } );
        expect( response.status ).toBe( 401 );
        expect( response.text ).toContain( 'Invalid username or password' );
    } );

    it( 'POST /login/logout destroys session and redirects', async () =>
    {
        const agent = request.agent( app );
        await agent
            .post( '/login' )
            .send( { author: 'Crazy', password: 'fhwedel' } );

        const response = await agent.post( '/login/logout' ).redirects( 0 );
        expect( response.status ).toBe( 302 );
        expect( response.headers.location ).toBe( '/' );
    } );
} );