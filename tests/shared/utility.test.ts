import * as dotenv from 'dotenv';
dotenv.config( {
    path: [ '.env', `.env.${ process.env.NODE_ENV }` ],
    override: true
} );

import { describe, it, expect, } from 'vitest';

import { createHash } from '../../src/shared/utility';

describe( 'createHash', () =>
{
    const password = 'my-secret-password';

    it( 'should return a consistent hash for the same password and salt', () =>
    {
        const hash1 = createHash( password );
        const hash2 = createHash( password );
        expect( hash1 ).toBe( hash2 );
    } );

    it( 'should return a different hash for different passwords', () =>
    {
        const hash1 = createHash( password );
        const hash2 = createHash( 'another-password' );
        expect( hash1 ).not.toBe( hash2 );
    } );

    it( 'should return a hash for an empty password', () =>
    {
        const hash = createHash( '' );
        expect( typeof hash ).toBe( 'string' );
        expect( hash.length ).toBeGreaterThan( 0 );
    } );
} );