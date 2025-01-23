<script lang="ts">
	let show = $state(false);

    let messageText = $state('');
    // svelte-ignore non_reactive_update
    let messageType: 'default' | 'warn' | 'error' = 'default';

    export function SendMessage(
        message: string, 
        type: 'default' | 'warn' | 'error' = 'default',
        duration: number = 500
    ) {;
        messageText = message;
        messageType = type;

        show = true;
        setTimeout(() => {
            show = false;
        }, duration);        
    }
</script>

<button class="app-message {messageType} {show ? 'show' : ''}" onclick={() => show = false}>
    <p>{messageText}</p>
</button>

<style lang="scss">
    .app-message {
        content-visibility: auto;
        position: fixed;

        top: 1rem;
        left: 50%;
        translate: -50% 0;

        color: white;
        font-family: var(--font-title);
        font-weight: 500;

        opacity: 1;
        background-color: green;

        transition: all 500ms ease-in-out allow-discrete;

        &:not(.show) {
            display: none;
            opacity: 0;
        }

        &.warn {
            background-color: orange;
        }
        &.error {
            background-color: red;
        }
    }
</style>