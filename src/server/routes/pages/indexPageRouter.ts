import express from 'express';
import rawGlobals from '../../../../data/globals.json';
import { findManyBlogposts, getAllBlogposts } from 'src/server/controller/blogController';

const router = express.Router();

router.get( '/', async ( request, response ) =>
{
    const search = request.query.search as string | undefined;

    const allPosts = await getAllBlogposts();

    const filteredPosts = [];
    if ( search )
    {
        filteredPosts.push( ...( await findManyBlogposts( search ) ) );
    }

    // Paginierung berechnen
    const total = allPosts.length;
    const start = parseInt( request.query.start as string ) || 0;
    const limit = request.query.limit === 'all'
        ? allPosts.length
        : parseInt( request.query.limit as string ) || 5;

    const newestPosts = [ ...allPosts ]
        .sort( ( a, b ) => new Date( b.meta.date ).getTime() - new Date( a.meta.date ).getTime() )
        .slice( 0, 9 );

    const pagedPosts = allPosts.slice( start, start + limit );

    const newestDate = allPosts.length > 0
        ? allPosts
            .map( p => new Date( p.meta.date ) )
            .sort( ( a, b ) => b.getTime() - a.getTime() )[ 0 ]
            .toISOString()
            .split( 'T' )[ 0 ]
        : 'n/a';

    const allComments = allPosts.flatMap( p =>
        p.comments.map( c => ( { ...c, postId: p.id } ) )
    ).sort( ( a, b ) => b.votes - a.votes );

    const topCommentVotes = allComments.length > 0
        ? Math.max( ...allComments.map( c => c.votes ) )
        : 0;

    response.render( 'pages/index', {
        timestamp: new Date().toLocaleString( 'de-DE' ),
        search,
        posts: pagedPosts,
        filteredPosts,
        newestPosts,
        newestDate,
        topCommentVotes,
        comments: allComments,
        limit,
        start,
        total,
        settings: rawGlobals // Werte aus globals.json für Scroll & Uhrzeit
    } );
} );

export default router;
