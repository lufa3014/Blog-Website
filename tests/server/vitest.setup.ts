import { beforeAll, vi } from 'vitest';
import * as globalsDatabase from '../../src/server/database/globalsDatabase';

// Echte Funktionen einmalig holen
const {
    loadJson: realLoadJson,
} = await vi.importActual<typeof globalsDatabase>( '../../src/server/database/globalsDatabase' );

// RAM-Cache für verschiedene Dateien (z.B. users.json, globals.json, ...)
const cache: Record<string, any> = {};

beforeAll( () =>
{
    // Lesen: Erstmalig aus Datei, danach nur noch aus RAM
    vi.spyOn( globalsDatabase, 'loadJson' ).mockImplementation( async ( filename: string ) =>
    {
        if ( cache[ filename ] !== undefined ) return cache[ filename ];
        const data = await realLoadJson( filename );
        cache[ filename ] = data;
        return data;
    } );
    // Schreiben: Nur in den RAM-Cache
    vi.spyOn( globalsDatabase, 'saveJson' ).mockImplementation( async ( filename: string, data: any ) =>
    {
        cache[ filename ] = data;
    } );
} );