import 'express-session';

declare module 'express-session' {
    interface SessionData
    {
        name?: string;
        userId?: number;
        title?: string;
        avatar?: string;
    }
}