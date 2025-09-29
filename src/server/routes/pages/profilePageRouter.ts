import express from 'express';
import { findOneUserById, updateUser, updateSkill, deleteSkill, addSkill } from '../../controller/userController';
import { requireAuth } from '../middleware';

const router = express.Router();

function isOwnUser ( req: express.Request, id: number ): boolean
{
    return !isNaN( id ) && req.session.userId === id;
}

function isJson ( req: express.Request ): boolean
{
    return req.headers[ 'content-type' ]?.includes( 'application/json' ) ?? false;
}

function sendBadRequest ( res: express.Response, what: string ): void
{
    res.status( 400 ).type( 'text' ).send( `Bad request: ${ what } fehlt oder ungültig.` );
}

function sendForbidden ( res: express.Response ): void
{
    res.status( 403 ).type( 'text' ).send( 'Forbidden: Nur das eigene Profil darf geändert werden.' );
}

function sendNotFound ( res: express.Response ): void
{
    res.status( 404 ).type( 'text' ).send( 'User not found.' );
}

function sendServerError ( res: express.Response, err: unknown ): void
{
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    res.status( 500 ).type( 'text' ).send( msg );
}

async function handleSkillChange (
    id: number,
    method: string,
    skill: string,
    newSkill?: string
): Promise<boolean>
{
    switch ( method )
    {
        case 'post':
            return addSkill( id, skill );
        case 'put':
            if ( !newSkill ) return false;
            return updateSkill( id, skill, newSkill );
        case 'delete':
            return deleteSkill( id, skill );
        default:
            return false;
    }
}

router.get( '/', requireAuth, async ( req, res ) =>
{
    const id = req.session.userId;
    res.redirect( `/profile/${ id }` );
} );

router.get( '/:id', async ( req, res ) =>
{
    const id = parseInt( req.params.id, 10 );
    if ( isNaN( id ) )
    {
        res.status( 404 ).type( 'text' ).send( 'Die angeforderte Ressource wurde nicht gefunden.' );
        return;
    }
    const user = await findOneUserById( id );
    if ( !user )
    {
        res.status( 404 ).type( 'text' ).send( 'Die angeforderte Ressource wurde nicht gefunden.' );
        return;
    }

    res.render( 'pages/profile', {
        user,
        ownProfile: req.session?.userId === id,
        timestamp: new Date().toLocaleString( 'de-DE' )
    } );
} );

router.post( '/:id', requireAuth, async ( req, res ) =>
{
    const id = parseInt( req.params.id, 10 );
    if ( !isOwnUser( req, id ) ) return sendForbidden( res );

    const { author, firstname, lastname, avatar } = req.body;
    if ( ![ author, firstname, lastname, avatar ].every( Boolean ) )
        return sendBadRequest( res, 'author, firstname, lastname, avatar' );

    try
    {
        const ok = await updateUser( id, author, firstname, lastname, new URL( avatar ) );
        if ( !ok ) return sendNotFound( res );

        if ( isJson( req ) )
        {
            res.json( await findOneUserById( id ) );
            return;
        }
        res.redirect( 302, `/profile/${ id }` );
    } catch ( err )
    {
        sendServerError( res, err );
    }
} );

router.post( '/:id/skill', requireAuth, async ( req, res ) =>
{
    const id = parseInt( req.params.id, 10 );
    if ( !isOwnUser( req, id ) ) return sendForbidden( res );

    const { method, skill, newSkill } = req.body;
    if ( !method || !skill ) return sendBadRequest( res, 'method, skill' );

    try
    {
        const ok = await handleSkillChange( id, method, skill, newSkill );
        if ( !ok ) return sendBadRequest( res, 'Skill operation failed' );
        res.redirect( 302, `/profile/${ id }` );
    } catch ( err )
    {
        sendServerError( res, err );
    }
} );


export default router;