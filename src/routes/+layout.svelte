<script lang="ts">
  import "../app.postcss"; // Import Tailwind CSS with DaisyUI
  import DarkModeSwitch from "../components/DarkModeSwitch.svelte";
  import HamburgerMenu from "../components/HamburgerMenu.svelte";
  import { onMount } from "svelte";
  import { MicrosoftEntraId, generateState, generateCodeVerifier } from "arctic";
  import { parse } from "cookie"; // Use to parse cookies
  let menuIsOpen = false;
  let userLoggedIn = false;

  let msEntraId: MicrosoftEntraId;
  const clientID = import.meta.env.VITE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
  const tenantId = import.meta.env.VITE_TENANT_ID;
  const redirectUrl = import.meta.env.VITE_REDIRECT_URL;
  msEntraId = new MicrosoftEntraId(tenantId, clientID, clientSecret, redirectUrl);
  onMount(() => {
    const cookies = parse(document.cookie);
    
    const accessToken = cookies.accessToken;
    if (accessToken) {
    // Move token to sessionStorage and set userLoggedIn to true
    sessionStorage.setItem("accessToken", accessToken);
    userLoggedIn = true;

    // Optionally, delete the token from cookies after transferring it
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
  } else {
    userLoggedIn = sessionStorage.getItem("accessToken") ? true : false;
  }

  console.log("User logged in:", userLoggedIn);
  });
  function login() {
    
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    // Set codeVerifier as a cookie
    document.cookie = `codeVerifier=${codeVerifier}; path=/; SameSite=Lax`;

    const scopes = ["user.read"];
    const authorizationURL = msEntraId.createAuthorizationURL(state, codeVerifier, scopes);
    window.location.href = authorizationURL.href;

  }

  function handleToggle(event: any) {
    menuIsOpen = event.detail.isChecked; // Correct the typo here to access `isChecked`
    console.log(menuIsOpen);
  }
</script>

{#if !userLoggedIn}
  <!--here comes the authentication part -->
  <button class="btn" on:click={login}>Login with Microsoft</button>
  not logged in
{:else}
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
{/if}
