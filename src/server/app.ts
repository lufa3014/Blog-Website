import dotenv from 'dotenv';
dotenv.config( {
    path: [ '.env', `.env.${ process.env.NODE_ENV }` ],
    // Falls dieselbe Variable in beiden Dateien steht, gilt die letzte
    override: true
} );

import express, { type Express } from 'express';
import { join } from 'path';
import pug from 'pug';
import { writeFileSync } from 'fs';
import bodyParser from 'body-parser';
import session from 'express-session';
import morgan from 'morgan';

import indexPageRouter from './routes/pages/indexPageRouter';
import loginPageRouter from './routes/pages/loginPageRouter';
import blogpostPageRouter from './routes/pages/blogpostPageRouter';
import profilePageRouter from './routes/pages/profilePageRouter';

import rawGlobals from '../../data/globals.json';

import headerFragmentRouter from './routes/api/headerFragmentRouter';

if ( !process.env.SESSION_SECRET )
{
    console.error( 'Environment Variable "SESSION_SECRET" is not defined.' );
    process.exit( 1 );  // bricht das Programm sofort ab
}
const sessionSecret = process.env.SESSION_SECRET;

/**
 * Konfigurationsoptionen für die Erstellung einer Express-Anwendung.
 *
 * @property logging Gibt an, ob HTTP-Requests beim Start geloggt werden sollen
 */
export type AppOptions = {
    logging: boolean;
};

/**
 * Erzeugt eine konfigurierte Express-Anwendung.
 *
 * - Setzt Pug als View-Engine und konfiguriert den View-Pfad
 * - Aktiviert Middleware für Logging, Session, Body-Parsing und statische Dateien
 * - Bindet alle Seiten- und API-Router ein
 * - Stellt das Impressum statisch bereit
 * - Setzt den aktuellen Benutzer (sofern eingeloggt) in `res.locals.currentUser`
 *
 * @param options Optionales Konfigurationsobjekt (z.B. für Logging)
 * @returns Eine vollständig konfigurierte Express-Instanz
 */
export function createApp ( options?: Partial<AppOptions> ): Express
{
    const loggingActive = options?.logging ?? false;
    const app: Express = express();

    app.set( 'view engine', 'pug' );
    app.set( 'views', join( __dirname, '..', 'shared', 'views' ) );
    app.locals.basedir = join( __dirname, '..', 'shared', 'views' );
    //app.set('views', join('src', 'shared', 'views')); -> Vorgegeben, aber geht nicht...

    // Statische Dateien aus dem public-Ordner bereitstellen
    app.use( express.static( 'public' ) );

    if ( loggingActive )
    {
        app.use( morgan( 'dev' ) );
    }

    // 6) Body-Parser konfigurieren
    // → form-data (urlencoded) parsen, wie es HTML-Formulare senden
    app.use( bodyParser.urlencoded( { extended: true } ) );
    app.use( bodyParser.json() );

    const sessionMiddleware = session( {
        name: 'session',             // Name des Cookies
        secret: sessionSecret,       // Schlüssel zum Signieren des Cookies
        resave: false,               // speichert Session nur, wenn sie sich geändert hat
        saveUninitialized: false,    // speichert keine leeren Sessions (→ DSGVO)
        cookie: {
            secure: process.env.NODE_ENV === 'production', // nur HTTPS im Produktivbetrieb
            maxAge: 24 * 60 * 60 * 1000,  // Ablaufzeit: 24 Stunden (in ms)
            httpOnly: true,               // kein Zugriff via client-seitigem JavaScript
            sameSite: 'lax'               // schützt vor CSRF-Angriffen
        }
    } );
    app.use( sessionMiddleware );

    app.use( async ( req, res, next ) =>
    {
        if ( req.session.userId )
        {
            const { findOneUserById } = await import( './controller/userController' );
            const user = await findOneUserById( req.session.userId );
            if ( user )
            {
                res.locals.currentUser = user;
            } else
            {
                res.locals.currentUser = null;
            }
        } else
        {
            res.locals.currentUser = null;
        }
        next();
    } );

    app.use( '/', indexPageRouter );
    app.use( '/login', loginPageRouter );
    app.use( '/blogpost', blogpostPageRouter );
    app.use( '/profile', profilePageRouter );

    // API-Route für dynamischen Header
    app.use( '/partials', headerFragmentRouter );

    app.get( '/impressum', ( _req, res ) =>
    {
        res.sendFile( join( __dirname, '..', '..', 'public', 'impressum.html' ) );
    } );

    app.use( ( _req, res ) =>
    {
        res
            .status( 404 )
            .send( 'Die angeforderte Ressource wurde nicht gefunden.' );
    } );

    return app;
}

/**
 * Rendert das Impressum (Pug → HTML) und speichert es beim Serverstart im `public/`-Ordner.
 *
 * Verwendet dafür `views/pages/impressum.pug` und ergänzt die `timestamp`-Variable
 * sowie globale Einstellungen aus `globals.json`.
 *
 * @remarks
 * Die generierte Datei wird später direkt über `/impressum` ausgeliefert.
 */
export function generateStaticImpressum (): void
{
    const templatePath = join( __dirname, '..', 'shared', 'views', 'pages', 'impressum.pug' );
    const outputPath = join( __dirname, '..', '..', 'public', 'impressum.html' );

    const html = pug.renderFile( templatePath, {
        filename: templatePath,
        basedir: join( __dirname, '..', 'shared', 'views' ),
        timestamp: new Date().toLocaleString( 'de-DE' ),
        settings: rawGlobals
    } );

    writeFileSync( outputPath, html, 'utf8' );
}