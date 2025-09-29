import * as dotenv from 'dotenv';
import { createApp, generateStaticImpressum } from './app';
dotenv.config( {
    path: [ '.env', `.env.${ process.env.NODE_ENV }` ],
    override: true
} );


if ( !process.env.SERVER_PORT )
{
    console.error( 'Environment Variable "SERVER_PORT" is not defined.' );
    process.exit( 1 );  // bricht das Programm sofort ab
}
const port = parseInt( process.env.SERVER_PORT, 10 );

generateStaticImpressum();

const loggingActive = true;

const app = createApp( { logging: loggingActive } );

app.listen( port, () =>
{
    if ( loggingActive )
    {
        console.log( `Server running: http://localhost:${ port }` );
    }
} );