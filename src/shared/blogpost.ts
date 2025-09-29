export interface BlogpostMeta {
    author: string;
    author_id: number;
    date: string; // ISO-String
}

export interface BlogpostBody {
    subtitle: string;
    text: string;
    image: string | null;
    layout: 'one-column' | 'two-column';
}

export interface BlogpostComment {
    author: string;
    avatar: string;
    author_id: number;
    post_id: number;
    votes: number;
    text: string;
}

export interface Blogpost {
    id: number;
    meta: BlogpostMeta;
    title: string;
    body: BlogpostBody[];
    comments: BlogpostComment[];
}
