import * as dotenv from 'dotenv';
dotenv.config( {
    path: [ '.env', `.env.${ process.env.NODE_ENV }` ],
    override: true
} );

import path, { join } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

export interface Globals
{
    title: string;
}

function getPathToData (): string
{
    const base = process.env.PATH_TO_DATA;
    if ( !base ) throw new Error( 'PATH_TO_DATA is not defined in .env file' );

    return path.isAbsolute( base ) ? base : join( process.cwd(), base );
}

function getPathToGlobals (): string
{
    const file = process.env.DATAFILE_GLOBALS;
    if ( !file ) throw new Error( 'DATAFILE_GLOBALS is not defined in .env file' );

    return join( getPathToData(), file );
}

/**
 * Liest zentrale Einstellungen aus der Globals-Datei.
 *
 * @returns Promise mit den geladenen Global-Daten
 */
export async function readGlobals (): Promise<Globals>
{
    try
    {
        const filePath = getPathToGlobals();
        const raw = await readFile( filePath, 'utf-8' );
        return JSON.parse( raw );
    } catch ( e )
    {
        console.error( 'readGlobals failed:', e );
        return { title: '' };
    }
}

/**
 * Lädt eine JSON-Datei und gibt deren Inhalt zurück.
 *
 * @param filename Dateiname relativ zum Datenordner
 * @returns Promise mit dem eingelesenen Objekt
 */
export async function loadJson<T> ( filename: string ): Promise<T>
{
    const filePath = join( getPathToData(), filename );
    const raw = await readFile( filePath, 'utf-8' );
    return JSON.parse( raw ) as T;
}

/**
 * Speichert ein Objekt als formatiertes JSON.
 *
 * @param filename Dateiname relativ zum Datenordner
 * @param data     Zu speicherndes Objekt
 * @returns Promise, das nach dem Schreiben aufgelöst wird
 */
export async function saveJson<T> ( filename: string, data: T ): Promise<void>
{
    const filePath = join( getPathToData(), filename );
    await writeFile( filePath, JSON.stringify( data, null, 2 ) );
}