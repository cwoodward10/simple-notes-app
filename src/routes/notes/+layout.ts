import type { LayoutLoad } from "./$types";

export const ssr = false;
export const csr = true;

export const load: LayoutLoad = async ({ params }) => {
    const store = await import("$lib/modules/store");
	return {
		notesStore: new store.NotesStore()
	}
};