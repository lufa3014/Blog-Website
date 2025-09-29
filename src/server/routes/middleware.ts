import express from 'express';


export function requireAuth ( req: express.Request, res: express.Response, next: express.NextFunction )
{
    if ( !req.session?.userId )
    {
        res.redirect( 302, '/login' );
        return;
    }
    next();
}