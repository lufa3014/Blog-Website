import express from 'express';
import { login as loginUser } from '../../controller/userController';

const router = express.Router();

router.get( '/', ( req, res ) =>
{
    res.status( 200 ).render( 'pages/login', {
        error: null,
        timestamp: new Date().toLocaleString( 'de-DE' )
    } );
} );

router.post( '/', async ( req, res ) =>
{
    const { author, password } = req.body;

    if ( !author || !password )
    {
        return res.status( 400 ).render( 'pages/login', {
            error: 'Username and password are required.',
            timestamp: new Date().toLocaleString( 'de-DE' )
        } );
    }

    try
    {
        const userId = await loginUser( author, password );
        if ( userId === null )
        {
            return res.status( 401 ).render( 'pages/login', {
                error: 'Invalid username or password.',
                timestamp: new Date().toLocaleString( 'de-DE' )
            } );
        }

        req.session.userId = userId;
        res.redirect( 302, `/` );
    } catch
    {
        return res.status( 500 ).render( 'pages/login', {
            error: 'Internal server error.',
            timestamp: new Date().toLocaleString( 'de-DE' )
        } );
    }
} );

router.post( '/logout', ( req, res ) =>
{
    req.session.destroy( () =>
    {
        res.clearCookie( 'session' );
        res.redirect( 302, '/' );
    } );
} );

export default router;