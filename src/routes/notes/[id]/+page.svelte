<script lang="ts">
    import NoteEditor from "$lib/components/NoteEditor.svelte";
    import { onMount } from "svelte";

    const { data } = $props();

    let note = $state(data.note);
    onMount(async () => {
        if(!data.note) {
            note = await data.notesStore.get(data.id);
        }
    })
</script>

{#if note}
<NoteEditor notesStore={data.notesStore} note={note}/>
{/if}