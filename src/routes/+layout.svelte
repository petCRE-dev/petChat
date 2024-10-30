<script lang="ts">
  import "../app.postcss"; // Import Tailwind CSS with DaisyUI
  import DarkModeSwitch from "../components/DarkModeSwitch.svelte";
  import HamburgerMenu from "../components/HamburgerMenu.svelte";

  let menuIsOpen = false;
 

  function handleToggle(event: any) {
    menuIsOpen = event.detail.isChecked; // Correct the typo here to access `isChecked`
    console.log(menuIsOpen)
  }
</script>

<!-- Navbar -->
<div class="navbar bg-base-100 shadow-md">
  <!-- Navbar start (logo or title) -->
  <div class="navbar-start">
    <a class="text-xl font-bold" href="/">petCHAT</a>
  </div>

  <!-- Navbar end (actions) -->
  <div class="navbar-end space-x-4">
    <DarkModeSwitch />
    <!-- Use `menuIsOpen` correctly and add the event listener -->
    <HamburgerMenu isChecked={menuIsOpen} on:toggle={handleToggle} />
  </div>
</div>

<!-- Page Route Content -->
<div class="drawer">
  <!-- Bind isExpanded to the drawer toggle checkbox -->
  <input id="my-drawer" type="checkbox" class="drawer-toggle" bind:checked={menuIsOpen} />

  <!-- Main page content here -->
  <div class="drawer-content">
    <!-- This slot will hold the main page content when drawer is open/closed -->
    <slot />
  </div>

  <!-- Drawer side content (sidebar) -->
  <div class="drawer-side">
    <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
    <ul class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
      <!-- Sidebar content here -->
      <li><a>Sidebar Item 1</a></li>
      <li><a>Sidebar Item 2</a></li>
    </ul>
  </div>
</div>

