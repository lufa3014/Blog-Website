import { describe, it, expect } from 'vitest';
import
{
    getAllBlogposts,
    getBlogpostsByPage,
    getRecentBlogposts,
    getPopularComments,
    findOneBlogpostById,
    createComment,
    findManyBlogpostsByAuthorId,
    findManyBlogposts,
    upvoteComment,
    downvoteComment
} from '../../../src/server/controller/blogController';

describe( 'blogController', () =>
{
    it( 'getAllBlogposts returns all posts', async () =>
    {
        const posts = await getAllBlogposts();
        expect( Array.isArray( posts ) ).toBe( true );
        expect( posts.length ).toBeGreaterThan( 0 );
    } );

    it( 'getBlogpostsByPage returns correct number of posts', async () =>
    {
        const posts = await getBlogpostsByPage( 1, 2 );
        expect( posts.length ).toBeLessThanOrEqual( 2 );
    } );

    it( 'getRecentBlogposts returns the most recent posts', async () =>
    {
        const posts = await getRecentBlogposts( 2 );
        expect( posts.length ).toBeLessThanOrEqual( 2 );
        if ( posts.length > 1 )
        {
            expect( new Date( posts[ 0 ].meta.date ).getTime() ).toBeGreaterThanOrEqual(
                new Date( posts[ 1 ].meta.date ).getTime()
            );
        }
    } );

    it( 'getPopularComments returns comments sorted by votes', async () =>
    {
        const comments = await getPopularComments( 3 );
        expect( comments.length ).toBeLessThanOrEqual( 3 );
        if ( comments.length > 1 )
        {
            expect( comments[ 0 ].votes ).toBeGreaterThanOrEqual( comments[ 1 ].votes );
        }
    } );

    it( 'findOneBlogpostById returns correct post', async () =>
    {
        const posts = await getAllBlogposts();
        const post = await findOneBlogpostById( posts[ 0 ].id );
        expect( post ).toBeDefined();
        expect( post?.id ).toBe( posts[ 0 ].id );
    } );

    it( 'findOneBlogpostById returns undefined for unknown id', async () =>
    {
        const post = await findOneBlogpostById( 999999 );
        expect( post ).toBeUndefined();
    } );

    it( 'createComment adds a comment', async () =>
    {
        const posts = await getAllBlogposts();
        const postId = posts[ 0 ].id;
        const oldLength = posts[ 0 ].comments.length;
        await createComment( { author: "Test", text: "Hallo", votes: 0, avatar: "", author_id: 0, post_id: postId } );
        const updated = await findOneBlogpostById( postId );
        expect( updated?.comments.length ).toBe( oldLength + 1 );
        expect( updated?.comments.at( -1 )?.author ).toBe( "Test" );
    } );

    it( 'createComment throws for unknown post', async () =>
    {
        await expect( createComment( { author: "X", text: "Y", votes: 0, avatar: "", author_id: 0, post_id: 999999 } ) ).rejects.toThrow();
    } );

    it( 'findManyBlogpostsByAuthorId returns posts for author', async () =>
    {
        const posts = await getAllBlogposts();
        const authorId = posts[ 0 ].meta.author_id;
        const found = await findManyBlogpostsByAuthorId( authorId );
        expect( found.length ).toBeGreaterThan( 0 );
        expect( found[ 0 ].meta.author_id ).toBe( authorId );
    } );

    it( 'findManyBlogposts finds by title and body', async () =>
    {
        const posts = await getAllBlogposts();
        const title = posts[ 0 ].title;
        let found = await findManyBlogposts( title );
        expect( found.length ).toBeGreaterThan( 0 );

        const bodyText = posts[ 0 ].body[ 0 ]?.text ?? '';
        found = await findManyBlogposts( bodyText.slice( 0, 3 ) );
        expect( found.length ).toBeGreaterThan( 0 );

        found = await findManyBlogposts( 'NichtVorhanden' );
        expect( found.length ).toBe( 0 );
    } );

    it( 'upvoteComment increases votes', async () =>
    {
        const posts = await getAllBlogposts();
        const postId = posts[ 0 ].id;
        if ( posts[ 0 ].comments.length === 0 ) return;
        const oldVotes = posts[ 0 ].comments[ 0 ].votes;
        await upvoteComment( postId, 0 );
        const updated = await findOneBlogpostById( postId );
        expect( updated?.comments[ 0 ].votes ).toBe( oldVotes + 1 );
    } );

    it( 'upvoteComment throws for unknown comment', async () =>
    {
        const posts = await getAllBlogposts();
        const postId = posts[ 0 ].id;
        await expect( upvoteComment( postId, 999 ) ).rejects.toThrow();
    } );

    it( 'downvoteComment decreases votes', async () =>
    {
        const posts = await getAllBlogposts();
        const postId = posts[ 0 ].id;
        if ( posts[ 0 ].comments.length === 0 ) return;
        const oldVotes = posts[ 0 ].comments[ 0 ].votes;
        await downvoteComment( postId, 0 );
        const updated = await findOneBlogpostById( postId );
        expect( updated?.comments[ 0 ].votes ).toBe( oldVotes - 1 );
    } );

    it( 'downvoteComment throws for unknown comment', async () =>
    {
        const posts = await getAllBlogposts();
        const postId = posts[ 0 ].id;
        await expect( downvoteComment( postId, 999 ) ).rejects.toThrow();
    } );

    it( 'getBlogpostsByPage returns empty array for out-of-range page', async () =>
    {
        const posts = await getBlogpostsByPage( 999, 10 );
        expect( posts ).toEqual( [] );
    } );

    it( 'getBlogpostsByPage returns empty array for pageSize 0', async () =>
    {
        const posts = await getBlogpostsByPage( 1, 0 );
        expect( posts ).toEqual( [] );
    } );

    it( 'getRecentBlogposts returns empty array if maxAmount is 0', async () =>
    {
        const posts = await getRecentBlogposts( 0 );
        expect( posts ).toEqual( [] );
    } );

    it( 'getPopularComments returns empty array if maxAmount is 0', async () =>
    {
        const comments = await getPopularComments( 0 );
        expect( comments ).toEqual( [] );
    } );

    it( 'findOneBlogpostById returns undefined for negative id', async () =>
    {
        const post = await findOneBlogpostById( -1 );
        expect( post ).toBeUndefined();
    } );

    it( 'createComment throws if comment is missing required fields', async () =>
    {
        const posts = await getAllBlogposts();
        const postId = posts[ 0 ].id;
        // @ts-expect-error
        await expect( createComment( postId, { text: "Fehler" } ) ).rejects.toThrow();
    } );

    it( 'findManyBlogpostsByAuthorId returns empty array for unknown author', async () =>
    {
        const posts = await findManyBlogpostsByAuthorId( 999999 );
        expect( posts ).toEqual( [] );
    } );

    it( 'findManyBlogposts returns all posts for empty query', async () =>
    {
        const all = await getAllBlogposts();
        const found = await findManyBlogposts( '' );
        expect( found.length ).toBe( all.length );
    } );

    it( 'upvoteComment throws for negative commentIndex', async () =>
    {
        const posts = await getAllBlogposts();
        const postId = posts[ 0 ].id;
        await expect( upvoteComment( postId, -1 ) ).rejects.toThrow();
    } );

    it( 'downvoteComment throws for negative commentIndex', async () =>
    {
        const posts = await getAllBlogposts();
        const postId = posts[ 0 ].id;
        await expect( downvoteComment( postId, -1 ) ).rejects.toThrow();
    } );

    it( 'upvoteComment and downvoteComment do not affect other comments', async () =>
    {
        const posts = await getAllBlogposts();
        const postId = posts[ 0 ].id;
        if ( posts[ 0 ].comments.length < 2 ) return;
        const oldVotes = posts[ 0 ].comments[ 1 ].votes;
        await upvoteComment( postId, 0 );
        await downvoteComment( postId, 0 );
        const updated = await findOneBlogpostById( postId );
        expect( updated?.comments[ 1 ].votes ).toBe( oldVotes );
    } );

    it( 'createComment adds multiple comments in order', async () =>
    {
        const posts = await getAllBlogposts();
        const postId = posts[ 0 ].id;
        const oldLength = posts[ 0 ].comments.length;
        await createComment( { author: "A", text: "1", votes: 0, avatar: "", author_id: 0, post_id: postId } );
        await createComment( { author: "B", text: "2", votes: 0, avatar: "", author_id: 0, post_id: postId } );
        const updated = await findOneBlogpostById( postId );
        expect( updated?.comments.length ).toBe( oldLength + 2 );
        expect( updated?.comments.at( -2 )?.author ).toBe( "A" );
        expect( updated?.comments.at( -1 )?.author ).toBe( "B" );
    } );
} );