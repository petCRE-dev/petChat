<!-- CustomLink.svelte -->
<script>
  export let href = "";
  export let title = undefined;
  export let text = "";
</script>

<a class=" link link-info link-hover" {href} {title} target="_blank" rel="noopener noreferrer">
  {text}
</a>


