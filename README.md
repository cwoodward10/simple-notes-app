# A simple notes app
A web app with an intentionally simple UI for taking notes.

## Stack
It uses [Svelte and Sveltekit](https://svelte.dev/) as the framework/meta-framework. It uses [VitePWA for Sveltekit](https://github.com/vite-pwa/sveltekit?tab=readme-ov-file) to allow people to install it.

[TinyMDE](https://github.com/jefago/tiny-markdown-editor) takes care of the note taking text editor. Then [idb-keyval](https://github.com/jakearchibald/idb-keyval) and a slightly re-written codebase based off of [secure-webstore](https://github.com/AKASHAorg/secure-webstore) to store the notes - securely where necessary. 