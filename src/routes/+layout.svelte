<script lang="ts">
  import "../app.postcss";
  import { AppShell, AppBar, Avatar,LightSwitch  } from "@skeletonlabs/skeleton";

  // Floating UI for Popups
  import {
    computePosition,
    autoUpdate,
    flip,
    shift,
    offset,
    arrow,
  } from "@floating-ui/dom";
  import { storePopup } from "@skeletonlabs/skeleton";
  storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>

<!-- App Shell -->
<AppShell>
  <svelte:fragment slot="header">
    <!-- App Bar -->
    <AppBar >
      <svelte:fragment slot="lead">
        <strong class="text-xl">petCHAT</strong>
      </svelte:fragment>
      <svelte:fragment slot="trail">
        <!-- 	<a
					class="btn btn-sm variant-ghost-surface"
					href="https://discord.gg/EXqV7W8MtY"
					target="_blank"
					rel="noreferrer"
				>
					Discord
				</a> -->
		<LightSwitch />
        <Avatar
          border="border-4 border-surface-300-600-token hover:!border-primary-500"
          cursor="cursor-pointer"
		  width="w-10"
		  initials="pC"
        />
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>
  <!-- Page Route Content -->
  <slot />
</AppShell>
