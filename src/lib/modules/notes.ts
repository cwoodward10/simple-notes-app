export type Note = {
    id: string;
    // to be parsed and created by a Date object
    created: number;
    // to be parsed and created by a Date object. undefined if never modified
    modified: number | undefined;
    title: string;
    tags: string[];
    content: string;
    visibility: 'public' | 'private';
}