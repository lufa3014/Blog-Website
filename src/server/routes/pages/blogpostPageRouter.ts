import express from 'express';
import
{
    findOneBlogpostById,
    upvoteComment,
    downvoteComment,
    createComment
} from '../../controller/blogController';
import { findOneUserById } from '../../controller/userController';
import { requireAuth } from '../middleware';
import rawGlobals from '../../../../data/globals.json';

const router = express.Router();

function isValidCommentRequest ( id: number, text: unknown ): boolean
{
    return !isNaN( id ) && typeof text === 'string' && text.trim() !== '';
}

function sendNotFound ( res: express.Response ): void
{
    res.status( 404 ).type( 'text' ).send( 'Die angeforderte Ressource wurde nicht gefunden.' );
}

async function resolveAuthorInfo ( name?: string, avatar?: string, author_id?: number ): Promise<{ author: string; avatar: string; }>
{
    if ( name && avatar )
    {
        return { author: name, avatar };
    }
    if ( author_id )
    {
        const user = await findOneUserById( author_id );
        return {
            author: user?.author ?? '',
            avatar: user?.avatar ?? ''
        };
    }
    return { author: '', avatar: '' };
}

router.get( '/:id', async ( req, res ) =>
{
    const id = parseInt( req.params.id, 10 );
    if ( isNaN( id ) )
    {
        res
            .status( 404 )
            .type( 'text' )
            .send( 'Die angeforderte Ressource wurde nicht gefunden.' );
        return;
    }

    const post = await findOneBlogpostById( id );
    if ( !post )
    {
        res
            .status( 404 )
            .type( 'text' )
            .send( 'Die angeforderte Ressource wurde nicht gefunden.' );
        return;
    }

    res.render( 'pages/blogpost', {
        post,
        timestamp: new Date().toLocaleString( 'de-DE' ),
        settings: rawGlobals
    } );
} );


router.post( '/:id/comment/:commentIndex/upvote', requireAuth, async ( req, res ) =>
{
    const id = parseInt( req.params.id, 10 );
    const commentIndex = parseInt( req.params.commentIndex, 10 );
    if ( isNaN( id ) || isNaN( commentIndex ) )
    {
        res
            .status( 404 )
            .type( 'text' )
            .send( 'Die angeforderte Ressource wurde nicht gefunden.' );
        return;
    }

    try
    {
        await upvoteComment( id, commentIndex );
        res.redirect( 302, `/blogpost/${ id }` );
    } catch
    {
        res
            .status( 404 )
            .type( 'text' )
            .send( 'Die angeforderte Ressource wurde nicht gefunden.' );
    }
} );


router.post( '/:id/comment/:commentIndex/downvote', requireAuth, async ( req, res ) =>
{
    const id = parseInt( req.params.id, 10 );
    const commentIndex = parseInt( req.params.commentIndex, 10 );
    if ( isNaN( id ) || isNaN( commentIndex ) )
    {
        res
            .status( 404 )
            .type( 'text' )
            .send( 'Die angeforderte Ressource wurde nicht gefunden.' );
        return;
    }

    try
    {
        await downvoteComment( id, commentIndex );
        res.redirect( 302, `/blogpost/${ id }` );
    } catch
    {
        res
            .status( 404 )
            .type( 'text' )
            .send( 'Die angeforderte Ressource wurde nicht gefunden.' );
    }
} );

router.post( '/:id/comment', requireAuth, async ( req, res ) =>
{
    const id = parseInt( req.params.id, 10 );
    const text = req.body.text;

    if ( !isValidCommentRequest( id, text ) )
    {
        return sendNotFound( res );
    }

    try
    {
        const author_id = req.session?.userId ?? 0;
        const { author, avatar } = await resolveAuthorInfo( req.session?.name, req.session?.avatar, author_id );

        await createComment( {
            text: text,
            votes: 0,
            author: author,
            avatar: avatar,
            post_id: id,
            author_id: author_id
        } );

        res.redirect( 302, `/blogpost/${ id }` );
    } catch
    {
        sendNotFound( res );
    }
} );

export default router;
