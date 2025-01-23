import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const parentData = await parent();
	const initiated = await parentData.notesStore.init();
	const mounted = parentData.notesStore.mounted;
	if (!initiated || !mounted) {
		return {
			id: params.id,
			note: null,
			notesStore: parentData.notesStore
		}
	}

	const note = await parentData.notesStore.get(params.id)

	if (note) {
		return {
			id: params.id,
			note,
			notesStore: parentData.notesStore
		}
	}

	error(404, 'Note not found');
};