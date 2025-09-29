import request from 'supertest';
import { createApp } from '../../../../src/server/app';
import * as cheerio from 'cheerio';
import { describe, it, expect, beforeAll } from 'vitest';

const app = createApp( { logging: false } );

describe( 'profile-avatar Partial', () =>
{
    let $: cheerio.Root;

    beforeAll( async () =>
    {
        const response = await request( app ).get( '/profile/1' );
        $ = cheerio.load( response.text );
    } );

    it( 'enthält einen Avatar-Block mit Klasse .profile-block.avatar-only', () =>
    {
        expect( $( '.profile-block.avatar-only' ).length ).toBeGreaterThan( 0 );
    } );

    it( 'zeigt ein Avatar-Bild', () =>
    {
        const avatarImg = $( '.profile-block.avatar-only img' );
        expect( avatarImg.length ).toBeGreaterThan( 0 );
        expect( avatarImg.attr( 'src' ) ).toMatch( /\.(jpg|jpeg|png|gif|svg)(\?.*)?$/i );
    } );
} );