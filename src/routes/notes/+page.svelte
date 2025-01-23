<script lang="ts">
    const { data } = $props();
    const getStoredNotes = data.notesStore.getAll();
</script>

<h1>Notes</h1>
{#await getStoredNotes}
<p>loading...</p>
{:then notes}
<p>Testing notes!</p>
{/await}