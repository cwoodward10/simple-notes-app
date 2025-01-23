<script lang="ts">
	import { NotesStore } from '$lib/modules/store';
    import { getContext, onMount } from "svelte";
    
    import { Debounce } from '$lib/modules/utilities';
    import { type Note } from '$lib/modules/notes';
    import { Context } from '$lib/modules/contexts';
    
    import { Editor, CommandBar, type ChangeEvent } from "tiny-markdown-editor";
    import { Icon, Check, XMark, LockOpen, LockClosed } from 'svelte-hero-icons';

    import 'tiny-markdown-editor/dist/tiny-mde.min.css';
    import '$styles/tinyMde-restyle.css';
    
    let { notesStore, note }: { notesStore: NotesStore, note: Note } = $props();
    
    let editor: Editor | null;
    let commandBar: CommandBar | null;

    let currentNote: Note = $state({
        ...note
    })
    
    let editingTitle = $state(false);

    let autoSave: () => boolean = getContext(Context.AutoSave);
    let unsavedChanges = $state(false);
    $effect(() => {
        if (autoSave() && unsavedChanges) {
            console.log('effect');
            handleSave();
        }
    })

    onMount(() => {
        if (!editor) {
            editor = new Editor({ textarea: "content", content: note.content });
            commandBar = new CommandBar({
                element: "toolbar",
                editor: editor,
                commands: ['bold', 'italic', 'strikethrough', '|', 'code', '|', 'h1', 'h2', '|', 'ul', 'ol', '|', 'blockquote', 'hr', '|', 'insertLink'] 
            });

            editor.addEventListener('change', handleEditorContentChanged);
        }
    })

    const sendMessage: any = getContext(Context.SendMessage);

    const changeStack: ChangeEvent[] = [];
    const handleEditorContentChanged = Debounce((e: ChangeEvent) => {
        changeStack.push(e);
        currentNote.content = e.content;

        unsavedChanges = true;
    }, 250);

    const handleBack = () => {
        let yes = true;
        if (unsavedChanges) {
            yes = confirm('are you sure you want to go back?');
        }
        if (yes) {
            history.back();
        }
    }

    const handleSave = Debounce(async () => {
        try {
            const content = editor?.getContent();
            if (!content) {
                return;
            }
            
            const toSave = $state.snapshot(currentNote);
            toSave.modified = Date.now();

            const success = await notesStore.set(toSave).catch(e => {
                throw(e);
            });
    
            if (success) {
                unsavedChanges = false;
                sendMessage('Saved!')
            }
        } catch (error) {
            console.error(error);
            sendMessage('Save failed', 'error');
        }
    })

    const saveTitle = (e: SubmitEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const newTitle = formData.get('title')?.toString();
        
        if (newTitle) {
            currentNote = {
                ...currentNote,
                title: newTitle
            }
        }

        editingTitle = false;
        unsavedChanges = true;
    }
</script>

<section class='menu'>
    <button onclick={() => handleBack()}>Back</button>
    <button onclick={() => handleSave()}>Save</button>
</section>
<section class="title-container">
    {#if editingTitle}
    <form class="title" onsubmit={(e) => saveTitle(e)}>
        <input 
            id="title"
            class="h3" 
            type="text" 
            name="title" 
            value={currentNote.title}
            required 
        />
        <div class="buttons">
            <button aria-label="save">
                <Icon 
                    src={Check} 
                    class="button"
                    type="submit"
                ></Icon>
            </button>
            <button aria-label="cancel">
                <Icon 
                    src={XMark} 
                    class="button"
                    onclick={() => { editingTitle = false; }}
                ></Icon>
            </button>
        </div>
    </form>
    {:else}
    <button class="clean title" onclick={() => {editingTitle = true; }}>
        <h1>{currentNote.title}</h1>
    </button>
    {/if}
</section>
<section class='note-content-container'>
    <div id="toolbar"></div>
    <textarea id="content" name="content"></textarea>
</section>

<style lang="scss">
    :global(main) {
        min-height: 100dvh;
    }

    :global(svg.button) {
        height: 60%;
        aspect-ratio: 1 / 1;
    }

    .menu {
        position: sticky;
        top: 0;

        background-color: var(--color-background);
    }

    .title-container {
        display: flex;
        align-items: center;
        gap: 2rem;
        
        button:not(.title) {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-grow: 0;
            flex-shrink: 0;

            padding: 0;
            height: var(--step-5);
            aspect-ratio: 1 / 1;
        }
        
        form.title {
            width: 100%;
            overflow: hidden;
            position: relative;
    
            input {
                display: flex;
                width: 100%;
            }
    
            .buttons {
                position: absolute;
                top: 50%;
                right: 1rem;
                translate: 0 -50%;
                
                height: 75%;
                width: fit-content;
    
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 0.5rem;

                button {
                    height: 80%;
                }
            }
        }
    }


    .note-content-container {
        height: 100%;
        
        border: var(--color-gray-light) 1px solid;
        box-shadow: var(--shadow-small);

        display: flex;
        flex-direction: column;
        align-self: stretch;
        flex-grow: 1;
    }
</style>