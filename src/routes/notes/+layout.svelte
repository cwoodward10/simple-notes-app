<script lang="ts">
    import { onMount } from "svelte";

    const { children, data } = $props();

    let mounted = $state(false);
    let hasLogin = $state(false);
    let loggedIn = $state(false);

    let errorWrongPassword = $state(false);
    let errorPassphrasesNoMatch = $state(false);
    let errorMessage: string | null =$state(null);

    onMount(async () => {
        try {
            hasLogin = await data.notesStore.init();
            mounted = true;
        } catch (e: any) {
            console.warn(`error creating store - ${e.message}`);
            await data.notesStore.destroy();
        }
    })

    const handleLoginAttempt = async (e: SubmitEvent) => {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);
        const passphrase = formData.get('passphrase')?.toString();

        if (!passphrase) {
            return;
        }

        try {
            loggedIn = await data.notesStore.mount(passphrase);
            errorWrongPassword = loggedIn;
        } catch (e) {
            errorWrongPassword = true;
            errorMessage = 'Incorrect passphrase';
        }
    }

    const tryCreatePassphrase = async (e: SubmitEvent) => {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);
        const passphrase = formData.get('passphrase')?.toString();
        const confirm = formData.get('confirm')?.toString();

        if (!passphrase || !confirm) {
            return;
        }

        if (passphrase !== confirm) {
            errorPassphrasesNoMatch = true;
            errorMessage = 'Passphrases do not match';
            return;
        }

        try {
            loggedIn = await data.notesStore.mount(passphrase);
        } catch (e: any) {
            console.error(e);
            errorMessage = e.message;
        }
    }
</script>

{#if mounted}
    {#if loggedIn}
    {@render children?.()}
    {:else}
        {#if hasLogin}
            <h1 class="h3">Please login</h1>
            <form 
                class="login"
                onsubmit={(e) => handleLoginAttempt(e)}
            >
                <input 
                    id="passphrase"
                    class="{errorWrongPassword ? 'error' : ''}"
                    name="passphrase" 
                    type="password" 
                    required
                />
                {#if errorMessage}
                <p class="error">{errorMessage}</p>
                {/if}
                <button type="submit">Login</button>
            </form>
        {:else}
            <h1 class="h3">Create login</h1>
            <p>
                In order to protect your notes, let's create a passphrase and/or pin. 
                Please use something that you will not forget as there is not way to recover
                this if you forget it.
            </p>
            <form class="create" onsubmit={(e) => tryCreatePassphrase(e)}>
                <label for='passphrase'>Passphrase</label>
                <input 
                    id="passphrase"
                    name="passphrase" 
                    type="password" 
                    required 
                />
                <label for='confirm'>Confirm passphrase</label>
                <input 
                    id="confirm"
                    class="{errorPassphrasesNoMatch ? 'error' : ''}"
                    name="confirm" 
                    type="password" 
                    required 
                />
                {#if errorMessage}
                <p class="error">{errorMessage}</p>
                {/if}
                <button type="submit">Create</button>
            </form>
        {/if}
    {/if}
{:else}
<p>loading...</p>
{/if}

<style lang="scss">
    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        input[type="password"] {
            width: clamp(260px, 100%, 400px);
        }
    }
</style>