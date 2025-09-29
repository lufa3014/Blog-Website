import express from 'express';
import path from 'path';

const router = express.Router();

router.get( '/header', ( req, res ) =>
{
    res.render( 'partials/header', { layout: false } );
} );

router.get( '/profile-info.pug', ( req, res ) =>
{
    res.sendFile(
        path.resolve( 'src', 'shared', 'views', 'partials', 'profile-info.pug' )
    );
} );

router.get( '/profile-avatar.pug', ( req, res ) =>
{
    res.sendFile(
        path.resolve( 'src', 'shared', 'views', 'partials', 'profile-avatar.pug' )
    );
} );

export default router;