export interface User {
    id: number;
    author: string;
    firstname: string;
    lastname: string;
    avatar: string;
    skills: string[];
    passwordHash: string;
}
  