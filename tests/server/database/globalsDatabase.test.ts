import { describe, it, expect } from 'vitest';
import { readGlobals, type Globals } from '../../../src/server/database/globalsDatabase';

describe( 'globalsDatabase', () =>
{
    it( 'should open the globals.json file file', async () =>
    {
        console.log( 'Reading from:', process.env.PATH_TO_DATA, process.env.DATAFILE_GLOBALS );
        const globalsData = await readGlobals();
        expect( globalsData.title ).toBe( "Blossom-Log" );
    } );
} );

