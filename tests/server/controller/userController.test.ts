import { describe, it, expect } from 'vitest';
import
{
    login,
    findOneUserById,
    updateUser,
    updateSkill,
    deleteSkill,
    addSkill
} from '../../../src/server/controller/userController';

describe( 'userController', () =>
{
    describe( 'login', () =>
    {
        it( 'success with correct credentials', async () =>
        {
            const id = await login( 'Crazy', 'fhwedel' );
            expect( id ).toBe( 5 );
        } );

        it( 'fails with wrong password', async () =>
        {
            const id = await login( 'Alliterierende Alina', 'wrong' );
            expect( id ).toBeNull();
        } );

        it( 'fails with unknown username', async () =>
        {
            const id = await login( 'NichtVorhanden', 'irgendwas' );
            expect( id ).toBeNull();
        } );

        it( 'fails with leeren Passwort', async () =>
        {
            const id = await login( 'Crazy', '' );
            expect( id ).toBeNull();
        } );
    } );

    describe( 'findOneUserById', () =>
    {
        it( 'returns user for valid ID', async () =>
        {
            const user = await findOneUserById( 2 );
            expect( user?.author ).toBe( 'Traumhaft Theisen' );
        } );

        it( 'returns null for unknown ID', async () =>
        {
            const user = await findOneUserById( 999 );
            expect( user ).toBeNull();
        } );

        it( 'returns null for negative ID', async () =>
        {
            const user = await findOneUserById( -1 );
            expect( user ).toBeNull();
        } );
    } );

    describe( 'updateUser', () =>
    {
        it( 'updates user info successfully', async () =>
        {
            const success = await updateUser( 3, 'Neuer Autor', 'Vor', 'Nach', new URL( 'https://x.de' ) );
            expect( success ).toBe( true );
        } );

        it( 'fails on unknown ID', async () =>
        {
            const success = await updateUser( 999, 'A', 'B', 'C', new URL( 'https://x.de' ) );
            expect( success ).toBe( false );
        } );

        it( 'fails with ungültiger Avatar-URL', async () =>
        {
            // Hier wird ein falscher Typ übergeben, sollte TypeScript-Fehler geben, aber zur Laufzeit evtl. auch abfangen
            // @ts-expect-error
            const success = await updateUser( 1, 'A', 'B', 'C', 'keine-url' );
            expect( success ).toBe( false );
        } );
    } );

    describe( 'updateSkill', () =>
    {
        it( 'updates existing skill', async () =>
        {
            const success = await updateSkill( 1, 'MMORPG', 'Updated Skill' );
            expect( success ).toBe( true );
        } );

        it( 'fails if skill does not exist', async () =>
        {
            const success = await updateSkill( 1, 'NonExistent', 'X' );
            expect( success ).toBe( false );
        } );

        it( 'fails if user does not exist', async () =>
        {
            const success = await updateSkill( 999, 'MMORPG', 'X' );
            expect( success ).toBe( false );
        } );

        it( 'fails if oldSkill === newSkill', async () =>
        {
            const success = await updateSkill( 1, 'MMORPG', 'MMORPG' );
            expect( success ).toBe( false );
        } );
    } );

    describe( 'deleteSkill', () =>
    {
        it( 'deletes existing skill', async () =>
        {
            const success = await deleteSkill( 2, 'Wufoo' );
            expect( success ).toBe( true );
        } );

        it( 'fails for non-existing skill', async () =>
        {
            const success = await deleteSkill( 2, 'NotThere' );
            expect( success ).toBe( false );
        } );

        it( 'fails for non-existing user', async () =>
        {
            const success = await deleteSkill( 999, 'Wufoo' );
            expect( success ).toBe( false );
        } );

        it( 'fails for leere skill-strings', async () =>
        {
            const success = await deleteSkill( 2, '' );
            expect( success ).toBe( false );
        } );
    } );

    describe( 'addSkill', () =>
    {
        it( 'adds new skill', async () =>
        {
            const success = await addSkill( 4, 'NewSkill123' );
            expect( success ).toBe( true );
        } );

        it( 'fails on duplicate skill', async () =>
        {
            const success = await addSkill( 4, 'JIRA' );
            expect( success ).toBe( false );
        } );

        it( 'fails for non-existing user', async () =>
        {
            const success = await addSkill( 999, 'SkillX' );
            expect( success ).toBe( false );
        } );

        it( 'fails for leeren skill', async () =>
        {
            const success = await addSkill( 4, '' );
            expect( success ).toBe( false );
        } );

        it( 'fails für skill mit nur Leerzeichen', async () =>
        {
            const success = await addSkill( 4, '   ' );
            expect( success ).toBe( false );
        } );
    } );
} );