import { MicrosoftEntraId } from 'arctic';
import { json, redirect } from '@sveltejs/kit';

export async function GET({ url, cookies }) {
  const clientID = import.meta.env.VITE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
  const tenantId = import.meta.env.VITE_TENANT_ID;
  const redirectUrl = import.meta.env.VITE_REDIRECT_URL;

  const msEntraId = new MicrosoftEntraId(tenantId, clientID, clientSecret, redirectUrl);

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const codeVerifier = cookies.get('codeVerifier'); // Get codeVerifier from cookies

  if (code && state && codeVerifier) {
    try {
      const tokens = await msEntraId.validateAuthorizationCode(code, codeVerifier);

      // Optionally delete the codeVerifier cookie now that it’s used
      cookies.delete('codeVerifier', { path: '/' });
      
      // Save tokens in cookies or session storage
      cookies.set("accessToken", tokens.accessToken(), { path: '/',httpOnly: false,  // Ensure it's accessible in JavaScript
        sameSite: 'lax' });

       
      //return json({ success: true,tokens:tokens,entra:msEntraId });
      // Redirect to the homepage
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/', // Redirects the user to the homepage
        },
      });
      
    } catch (error) {
      console.error("Token validation error:", error);
      // Redirect to an error page if token validation fails
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/error',
        },
      });
    }
  } else {
    // Redirect to an error page if required parameters are missing
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/error',
      },
    });
  }
}
