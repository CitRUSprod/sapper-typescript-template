<script lang="ts">
    export let status: string
    export let error: Error

    const dev = process.env.NODE_ENV === "development"
</script>

<section>
    <h1>{error.message}</h1>
    <h2>{status}</h2>
</section>

{#if dev && error.stack}
    <pre>{error.stack}</pre>
{/if}
