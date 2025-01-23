<!-- src/routes/+layout.svelte -->
<script lang="ts">
    import AppMessage from '$lib/components/AppMessage.svelte';
    
    import { Context } from '$lib/modules/contexts';
    import { onMount, setContext } from 'svelte';
    import { pwaInfo } from 'virtual:pwa-info'; 

    import '$styles/app.css';

    let { children } = $props();

    onMount(async () => {
        if (pwaInfo) {
            const { registerSW } = await import('virtual:pwa-register');
            registerSW({
                immediate: true,
                onRegistered(r) {
                    // uncomment following code if you want check for updates
                    // r && setInterval(() => {
                    //    console.log('Checking for sw update')
                    //    r.update()
                    // }, 20000 /* 20s for testing purposes */)
                    console.log(`SW Registered: ${r}`)
                },
                onRegisterError(error) {
                    console.log('SW registration error', error)
                }
            })
        }

        let persisted = false;
        if ((StorageManager as any)?.persisted) {
            persisted = (StorageManager as any)?.persisted();
        }
        if (!persisted && navigator.storage && navigator.storage.persist) {
            const result = await navigator.storage.persist();
        }
    })
  
    const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

    let AppMessenger: AppMessage;
    const sendMessage = (
        message: string, 
        type: 'default' | 'warn' | 'error' = 'default',
        duration: number = 500
    ) => {
        AppMessenger?.SendMessage(message, type, duration);
    }
    setContext(Context.SendMessage, sendMessage);

    let autoSave = $state(true);
    setContext(Context.AutoSave, () => autoSave);
</script> 

<svelte:head> 
    {@html webManifestLink} 
</svelte:head>

<main>
    {@render children?.()}
    <AppMessage bind:this={AppMessenger} />
</main>

{#await import('$lib/components/ReloadPrompt.svelte') then { default: ReloadPrompt}}
  <ReloadPrompt />
{/await}