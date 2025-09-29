import request from 'supertest';
import { createApp } from '../../../../src/server/app';
import { describe, it, expect } from 'vitest';

const app = createApp( { logging: false } );

describe( 'GET /impressum', () =>
{
    it( 'liefert die Impressum-Seite mit Status 200', async () =>
    {
        const response = await request( app ).get( '/impressum' );
        expect( response.status ).toBe( 200 );
        expect( response.text ).toContain( 'Impressum' );
        expect( response.text ).toContain( 'Blossom-Log' );
        expect( response.text ).toContain( 'Kirschblütenweg 1' );
    } );

    it( 'enthält Kontaktinformationen', async () =>
    {
        const response = await request( app ).get( '/impressum' );
        expect( response.text ).toContain( 'Spirit-Blossom@Log.de' );
        expect( response.text ).toContain( '04103-8869' );
    } );

    it( 'enthält einen Hinweis auf den Impressum-Generator', async () =>
    {
        const response = await request( app ).get( '/impressum' );
        expect( response.text ).toContain( 'Impressum-Generator' );
    } );
} );