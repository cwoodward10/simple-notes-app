import { SecureStore } from "./secure-storage";
import type { Note } from "./notes";

export class NotesStore {
    private _storeName = 'PrivateNotes';
    private _store: SecureStore;

    public get mounted() {
        return this._store.mounted;
    }

    constructor() {
        this._store = new SecureStore(this._storeName);
    }

    async init() {
        return this._store.init();
    }

    async mount(passphrase: string) {
        return this._store.mount(passphrase);
    }

    async getKeys(): Promise<IDBValidKey[]> {
        return this._store.keys();
    }

    async get(key: IDBValidKey): Promise<Note | null> {
        return this._store.get(key);
    }

    async getAll() {
        const keys = await this.getKeys();
        const all = await Promise.all(keys.map(k => {
            return this.get(k);
        }))

        return all.filter(n => n !== null);
    }

    async set(note: Note) {
        await this._store.set(note.id, note).catch(e => {
            return false;
        });
        return true;
    }

    async delete(note: Note) {
        return this._store.del(note.id);
    }

    destroy() {
        return this._store.destroy();
    }

    async export(): Promise<Record<string | number, any>> {
        return this._store.export();
    }

    import(data: Record<string | number, any>) {
        return this._store.import(data);
    }
}