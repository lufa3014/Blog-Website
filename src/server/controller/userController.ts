import * as dotenv from 'dotenv';
dotenv.config( {
    path: [ '.env', `.env.${ process.env.NODE_ENV }` ],
    override: true
} );

import { User } from '../../shared/user';
import { loadJson, saveJson } from '../database/globalsDatabase';
import { createHash } from '../../shared/utility';

const USERS_FILE = process.env.DATAFILE_USERS || 'users.json';

async function getUsers (): Promise<User[]>
{
    return await loadJson<User[]>( USERS_FILE );
}

async function saveUsers ( users: User[] )
{
    await saveJson( USERS_FILE, users );
}

/**
 * Prüft Benutzername + Passwort und liefert die Nutzer-ID oder `null`.
 *
 * @param username Der Author-Name des Users
 * @param password Das Klartextpasswort
 * @returns Promise, das mit der ID oder `null` aufgelöst wird
 */
export async function login ( username: string, password: string ): Promise<number | null>
{
    const users = await getUsers();
    const hash = createHash( password );
    const user = users.find( u => u.author === username && u.passwordHash === hash );
    return user?.id ?? null;
}

/**
 * Sucht einen User anhand seiner ID.
 *
 * @param userId Interne Nutzer-ID
 * @returns Promise, das mit dem User oder `null` aufgelöst wird
 */
export async function findOneUserById ( userId: number ): Promise<User | null>
{
    const users = await getUsers();
    return users.find( u => u.id === userId ) ?? null;
}

/**
 * Aktualisiert Basisdaten und Avatar eines Users.
 *
 * @param userId    Nutzer-ID
 * @param author    Neuer Benutzername
 * @param firstname Neuer Vorname
 * @param lastname  Neuer Nachname
 * @param avatar    Neue Avatar-URL
 * @returns Promise, das mit `true` bei Erfolg bzw. `false` bei Fehler aufgelöst wird
 */
export async function updateUser ( userId: number, author: string, firstname: string, lastname: string, avatar: URL ): Promise<boolean>
{
    const users = await getUsers();
    const user = users.find( u => u.id === userId );
    if ( !user ) return false;

    // Avatar-URL validieren
    if ( !( avatar instanceof URL ) || !/^https?:\/\//.test( avatar.toString() ) )
    {
        return false;
    }

    user.author = author;
    user.firstname = firstname;
    user.lastname = lastname;
    user.avatar = avatar.toString();

    await saveUsers( users );
    return true;
}

/**
 * Ersetzt einen vorhandenen Skill durch einen neuen.
 *
 * @param userId   Nutzer-ID
 * @param oldSkill Bisheriger Skill
 * @param newSkill Neuer Skill
 * @returns Promise, das `true` zurückgibt, wenn die Änderung gespeichert wurde
 */
export async function updateSkill ( userId: number, oldSkill: string, newSkill: string ): Promise<boolean>
{
    const users = await getUsers();
    const user = users.find( u => u.id === userId );
    if ( !user ) return false;

    const index = user.skills.indexOf( oldSkill );
    if ( index === -1 ) return false;

    if ( oldSkill === newSkill ) return false;

    user.skills[ index ] = newSkill;
    await saveUsers( users );
    return true;
}

/**
 * Entfernt einen Skill aus dem Profil.
 *
 * @param userId Nutzer-ID
 * @param skill  Zu löschender Skill
 * @returns Promise, das bei Erfolg `true` liefert
 */
export async function deleteSkill ( userId: number, skill: string ): Promise<boolean>
{
    const users = await getUsers();
    const user = users.find( u => u.id === userId );
    if ( !user ) return false;

    const index = user.skills.indexOf( skill );
    if ( index === -1 ) return false;

    user.skills.splice( index, 1 );
    await saveUsers( users );
    return true;
}

/**
 * Fügt dem Profil einen neuen Skill hinzu.
 *
 * @param userId Nutzer-ID
 * @param skill  Neuer Skill
 * @returns Promise, das bei Erfolg `true` liefert
 */
export async function addSkill ( userId: number, skill: string ): Promise<boolean>
{
    const users = await getUsers();
    const user = users.find( u => u.id === userId );
    if ( !user ) return false;

    if ( !skill || skill.trim().length === 0 ) return false;

    if ( user.skills.includes( skill ) ) return false;
    user.skills.push( skill );
    await saveUsers( users );
    return true;
}