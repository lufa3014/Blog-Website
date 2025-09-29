import { loadJson, saveJson } from '../database/globalsDatabase';
import { Blogpost, BlogpostComment } from '../../shared/blogpost';

if ( !process.env.DATAFILE_BLOGPOSTS )
{
    throw new Error( 'DATAFILE_BLOGPOSTS is not defined in .env file' );
}

const blogpostsFile = process.env.DATAFILE_BLOGPOSTS;

/**
 * Liefert alle vorhandenen Blogposts.
 *
 * @returns Promise mit einem Array aller Blogposts
 */
export async function getAllBlogposts (): Promise<Blogpost[]>
{
    return await loadJson<Blogpost[]>( blogpostsFile );
}

/**
 * Gibt eine bestimmte Seite von Blogposts zurück.
 *
 * @param page      1-basierte Seitennummer
 * @param pageSize  Anzahl der Blogposts pro Seite
 * @returns Promise mit den Blogposts der gewünschten Seite
 */

export async function getBlogpostsByPage ( page: number, pageSize: number ): Promise<Blogpost[]>
{
    const blogposts = await loadJson<Blogpost[]>( blogpostsFile );
    const start = ( page - 1 ) * pageSize;
    return blogposts.slice( start, start + pageSize );
}

/**
 * Holt die neuesten Blogposts, nach Datum absteigend sortiert.
 *
 * @param [maxAmount=5] Maximale Anzahl zurückzugebender Posts
 * @returns Promise mit den neuesten Blogposts
 */
export async function getRecentBlogposts ( maxAmount = 5 ): Promise<Blogpost[]>
{
    const blogposts = await loadJson<Blogpost[]>( blogpostsFile );
    return blogposts
        .sort( ( a, b ) => new Date( b.meta.date ).getTime() - new Date( a.meta.date ).getTime() )
        .slice( 0, maxAmount );
}

/**
 * Ermittelt die beliebtesten Kommentare aller Blogposts.
 *
 * @param [maxAmount=5] Maximale Anzahl zurückzugebender Kommentare
 * @returns Promise mit den beliebtesten Kommentaren
 */
export async function getPopularComments ( maxAmount = 5 ): Promise<BlogpostComment[]>
{
    const blogposts = await loadJson<Blogpost[]>( blogpostsFile );
    const allComments = blogposts.flatMap( post => post.comments );
    return allComments
        .sort( ( a, b ) => b.votes - a.votes )
        .slice( 0, maxAmount );
}

/**
 * Sucht einen Blogpost anhand seiner ID.
 *
 * @param id Blogpost-ID
 * @returns Promise mit dem gefundenen Blogpost oder `undefined`
 */
export async function findOneBlogpostById ( id: number ): Promise<Blogpost | undefined>
{
    const blogposts = await loadJson<Blogpost[]>( blogpostsFile );
    return blogposts.find( post => post.id === id );
}

/**
 * Fügt einem Blogpost einen neuen Kommentar hinzu.
 *
 * @param comment Kommentarobjekt
 * @returns Promise, das bei erfolgreichem Speichern aufgelöst wird
 * @throws Fehler, wenn der Blogpost nicht existiert oder das Kommentarobjekt ungültig ist
 */
export async function createComment ( comment: BlogpostComment ): Promise<void>
{
    if (
        !comment ||
        typeof comment.author !== 'string' ||
        typeof comment.text !== 'string' ||
        typeof comment.votes !== 'number' ||
        typeof comment.avatar !== 'string' ||
        typeof comment.author_id !== 'number' ||
        typeof comment.post_id !== 'number'
    )
    {
        throw new Error( 'Invalid comment object' );
    }

    const blogposts = await loadJson<Blogpost[]>( blogpostsFile );
    const post = blogposts.find( p => p.id === comment.post_id );
    if ( !post ) throw new Error( 'Blogpost not found' );
    post.comments.push( comment );
    await saveJson( blogpostsFile, blogposts );
}

/**
 * Liefert alle Blogposts eines bestimmten Autors.
 *
 * @param authorId Autoren-ID
 * @returns Promise mit den Blogposts des Autors
 */
export async function findManyBlogpostsByAuthorId ( authorId: number ): Promise<Blogpost[]>
{
    const blogposts = await loadJson<Blogpost[]>( blogpostsFile );
    return blogposts.filter( post => post.meta.author_id === authorId );
}

/**
 * Durchsucht Titel und Inhalt nach einem Suchbegriff.
 *
 * @param query Suchbegriff
 * @returns Promise mit den passenden Blogposts
 */
export async function findManyBlogposts ( query: string ): Promise<Blogpost[]>
{
    const blogposts = await loadJson<Blogpost[]>( blogpostsFile );
    const lowerQuery = query.toLowerCase();
    return blogposts.filter( post =>
        post.title.toLowerCase().includes( lowerQuery ) ||
        post.body.some( section =>
            section.subtitle.toLowerCase().includes( lowerQuery ) ||
            section.text.toLowerCase().includes( lowerQuery )
        )
    );
}

/**
 * Erhöht die Vote-Zahl eines Kommentars um 1.
 *
 * @param postId       Blogpost-ID
 * @param commentIndex Index des Kommentars im `comments`-Array
 * @returns Promise, das nach dem Upvote aufgelöst wird
 * @throws Fehler, wenn Blogpost oder Kommentar nicht gefunden werden
 */
export async function upvoteComment ( postId: number, commentIndex: number ): Promise<void>
{
    const blogposts = await loadJson<Blogpost[]>( blogpostsFile );
    const post = blogposts.find( p => p.id === postId );
    if ( !post || !post.comments[ commentIndex ] ) throw new Error( 'Comment not found' );
    post.comments[ commentIndex ].votes++;
    await saveJson( blogpostsFile, blogposts );
}

/**
 * Verringert die Vote-Zahl eines Kommentars um 1.
 *
 * @param postId       Blogpost-ID
 * @param commentIndex Index des Kommentars im `comments`-Array
 * @returns Promise, das nach dem Downvote aufgelöst wird
 * @throws Fehler, wenn Blogpost oder Kommentar nicht gefunden werden
 */
export async function downvoteComment ( postId: number, commentIndex: number ): Promise<void>
{
    const blogposts = await loadJson<Blogpost[]>( blogpostsFile );
    const post = blogposts.find( p => p.id === postId );
    if ( !post || !post.comments[ commentIndex ] ) throw new Error( 'Comment not found' );
    post.comments[ commentIndex ].votes--;
    await saveJson( blogpostsFile, blogposts );
}