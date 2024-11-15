<script lang="ts">
  import "../app.postcss"; // Import Tailwind CSS with DaisyUI
  import DarkModeSwitch from "../components/DarkModeSwitch.svelte";
  import HamburgerMenu from "../components/HamburgerMenu.svelte";
  import { onMount } from "svelte";
  import { MicrosoftEntraId, generateState, generateCodeVerifier } from "arctic";
  import { parse } from "cookie"; // Use to parse cookies
  import { type DifyConversations, type UserInfo } from "../types/types";
  import Fa from "svelte-fa";
  import { faMicrosoft } from "@fortawesome/free-brands-svg-icons";

  const appVersion = import.meta.env.VITE_APP_VERSION;

  let menuIsOpen = false;
  let userLoggedIn = false;
  let userInfo: UserInfo | null = null;
  let msEntraId: MicrosoftEntraId;

  const clientID = import.meta.env.VITE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
  const tenantId = import.meta.env.VITE_TENANT_ID;
  const redirectUrl = import.meta.env.VITE_REDIRECT_URL;
  msEntraId = new MicrosoftEntraId(tenantId, clientID, clientSecret, redirectUrl);
  let conversations: DifyConversations | null = null;
  onMount(async () => {
    const cookies = parse(document.cookie);

    const accessToken = cookies.accessToken;
    if (accessToken) {
      // Move token to sessionStorage and set userLoggedIn to true
      sessionStorage.setItem("accessToken", accessToken);
      userLoggedIn = true;

      userInfo = await fetchUserInfo(accessToken);

      sessionStorage.setItem("userInfo", JSON.stringify(userInfo));

      // Optionally, delete the token from cookies after transferring it
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
    } else {
      userLoggedIn = sessionStorage.getItem("accessToken") ? true : false;
      const storedUserInfo = sessionStorage.getItem("userInfo");
      userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;
      //console.log(userInfo);
    }

    //console.log("User logged in:", userLoggedIn);

    conversations = await fetchConversations(userInfo?.id);
  });
  async function fetchConversations(userId: string | undefined) {
    let conversationsFromResponse: DifyConversations | null = null;
    if (userId) {
      const response = await fetch(`/api/conversations?user=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      conversationsFromResponse = await response.json();
      console.log(conversationsFromResponse);
    }
    return conversationsFromResponse;
  }

  function login() {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    // Set codeVerifier as a cookie
    document.cookie = `codeVerifier=${codeVerifier}; path=/; SameSite=Lax`;

    const scopes = ["user.read"];
    const authorizationURL = msEntraId.createAuthorizationURL(state, codeVerifier, scopes);
    window.location.href = authorizationURL.href;
  }
   function handleLogout() {
    alert("Noch nicht implementiert!");
  }
   function handleHelp() {
    alert("Noch nicht implementiert!");
  }
  function handleToggle(event: any) {
    menuIsOpen = event.detail.isChecked; // Correct the typo here to access `isChecked`
  }
  async function fetchUserInfo(token: any) {
    try {
      const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching user info: ${response.statusText}`);
      }

      const data = await response.json();
      let myUser: UserInfo = {
        displayName: data.displayName,
        givenName: data.givenName,
        id: data.id,
        preferredLanguage: data.preferredLanguage,
      };

      return myUser;
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      return null;
    }
  }

  function startNewChat() {
    // Dispatch a global event to reset the chat
    const event = new Event("newChat");
    window.dispatchEvent(event);
  }
</script>

{#if !userLoggedIn}
  <!--here comes the authentication part -->
  <div class="flex flex-col min-h-screen flex-grow justify-center items-center">
    <button class="btn shadow-lg" on:click={login}>
      <Fa icon={faMicrosoft} />
      Login mit Microsoft
    </button>
  </div>
{:else}
  <!-- Navbar -->
  <div class="navbar bg-base-100 shadow-md">
    <!-- Navbar start (logo or title) -->
    <div class="navbar-start">
      <a class="text-xl font-bold" href="/">petCHAT</a>
    </div>

    <!-- Navbar end (actions) -->
    <div class="navbar-end space-x-4">
      <div class="mx-4"><button class="btn btn-wide btn-sm shadow-md btn-warning" on:click={startNewChat}>Neue Chat starten</button></div>
      <h2>Hallo, {userInfo?.givenName}!</h2>
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
      <div class="menu bg-base-100 text-base-content min-h-full w-80">
        <div class="flex flex-grow flex-col justify-between">
          <div class="my-4 text-center text-xl top-0  bg-base-100 bg-opacity-100 p-4">
            Meine Unterhaltungen
          </div>
          <div class="flex flex-col flex-grow gap-4">
            
            {#if conversations && conversations.data.length > 0}
              
                {#each conversations.data as conversation}
                <button class="btn">
                  <p> {conversation.name}</p>

                
                </button>
                {/each}
             
            {/if}
          </div>
          <div class="flex flex-row justify-between items-end bottom-0 sticky bg-base-100 p-4">
            <p>v. {appVersion}</p>
            <button class="btn btn-sm shadow-md btn-neutral btn-outline" on:click={handleHelp}>Hilfe</button>
            <button class="btn btn-sm shadow-md btn-secondary btn-outline" on:click={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
