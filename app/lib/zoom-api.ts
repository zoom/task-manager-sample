"use server";

import axios from "axios";
import { URL } from "url";
import crypto from "crypto";

const ZOOM_HOST = process.env.ZOOM_HOST || "https://zoom.us";
const ZOOM_API_HOST = process.env.ZOOM_API_HOST || "https://api.zoom.us";

/**
 * Get a base64 encoded URL
 * @param {string} str
 * @returns {string}
 */
function base64URL(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Get a random string of format and depth
 * @param {BufferEncoding} fmt
 * @param {number} depth
 * @returns {string} random string of format and depth
 */
function rand(fmt: BufferEncoding, depth = 32): string {
  return crypto.randomBytes(depth).toString(fmt);
}

/**
 * Generic function for getting access or refresh tokens
 * @param {URLSearchParams} params - Request parameters (form-urlencoded)
 * @param {string} [id=''] - Username for Basic Auth
 * @param {string} [secret=''] - Password for Basic Auth
 */
function tokenRequest(
  params: URLSearchParams,
  id: string = "",
  secret: string = ""
) {
  const username = id || process.env.ZOOM_CLIENT_ID;
  const password = secret || process.env.ZOOM_CLIENT_SECRET;

  return axios({
    data: new URLSearchParams(params).toString(),
    baseURL: ZOOM_HOST,
    url: "/oauth/token",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    auth: {
      username,
      password,
    },
  } as import("axios").AxiosRequestConfig).then(({ data }) => Promise.resolve(data));
}

/**
 * Generic function for making requests to the Zoom API
 * @param {string} method - Request method
 * @param {string | URL} endpoint - Zoom API Endpoint
 * @param {string} token - Access Token
 * @param {object | null} [data=null] - Request data
 */
function apiRequest(method: string, endpoint: string, token: string, data: object | null = null) {
  return axios({
    data,
    method,
    baseURL: ZOOM_API_HOST,
    url: `/v2${endpoint}`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }).then(({ data }) => Promise.resolve(data));
}

/**
 * Return the URL, state and verifier for the Zoom App Install.
 * @returns {Promise<{ url: URL; state: string; verifier: string }>}
 */
export async function getInstallURL(): Promise<{ url: URL; state: string; verifier: string }> {
  const state = rand("base64");
  const verifier = rand("ascii");

  const digest = crypto.createHash("sha256").update(verifier).digest("base64").toString();
  const challenge = base64URL(digest);

  const url = new URL("/oauth/authorize", ZOOM_HOST);

  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", process.env.ZOOM_CLIENT_ID || "");
  url.searchParams.set("redirect_uri", process.env.ZOOM_REDIRECT_URL || "");
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", state);

  return { url, state, verifier };
}

/**
 * Obtains an OAuth access token from Zoom.
 * @param {string} code - Authorization code from user authorization
 * @param {string} verifier - code_verifier for PKCE
 * @returns {Promise<any>} Promise resolving to the access token object
 */
export async function getToken(code: string, verifier: string): Promise<any> {

  return tokenRequest(
    new URLSearchParams({
      code,
      code_verifier: verifier,
      redirect_uri: process.env.ZOOM_REDIRECT_URL || "",
      grant_type: "authorization_code",
    })
  );
}

/**
 * Obtains a new Access Token from a Zoom Refresh Token.
 * @param {string} token - Refresh token to use
 * @returns {Promise<any>}
 */
export async function refreshToken(token: string): Promise<any> {
  return tokenRequest(
    new URLSearchParams({
      refresh_token: token,
      grant_type: "refresh_token",
    })
  );
}

/**
 * Use the Zoom API to get a Zoom User.
 * @param {string} uid - User ID to query on
 * @param {string} token - Zoom App Access Token
 * @returns {Promise<any>}
 */
export async function getZoomUser(uid: string, token: string): Promise<any> {
  return apiRequest("GET", `/users/${uid}`, token);
}

/**
 * Obtain Zoom access token via custom helper
 * @param zoomAuthorizationCode - authorization code from Zoom
 * @param redirect_uri - redirect URI used in OAuth
 * @param pkceVerifier - optional PKCE code verifier
 */
export async function getZoomAccessToken(
  zoomAuthorizationCode: string,
  redirect_uri: string = process.env.ZOOM_REDIRECT_URL!,
  pkceVerifier?: string
): Promise<any> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code: zoomAuthorizationCode,
    redirect_uri,
  });
  if (pkceVerifier) {
    params.set("code_verifier", pkceVerifier);
  }
  return tokenRequest(params);
}


export async function getZoomAccessTokenRaw(
  code: string,
  pkceVerifier?: string
): Promise<any> {
  const redirectUri = process.env.ZOOM_REDIRECT_URL!;
  if (!pkceVerifier) {
    throw new Error("PKCE verifier is required for token exchange");
  }

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: pkceVerifier,
  }).toString();

  const url = `${ZOOM_HOST}/oauth/token?${params}`;
  const clientId = process.env.ZOOM_CLIENT_ID!;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET!;

  const response = await axios.request({
    method: "POST",
    url,
    auth: { username: clientId, password: clientSecret },
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    maxBodyLength: Infinity,
  });

  return response.data;
}

/**
 * Return the DeepLink for opening Zoom.
 * @param {string | null | undefined} token - Zoom App Access Token
 * @returns {Promise<string | undefined>}
 */

export async function getDeeplink(
  token: string | null | undefined,
  data: { action?: string } = {}
): Promise<string | undefined> {

  console.log("🔗 Requesting Zoom Deeplink with token:", token, "and action:", data.action);

  if (!token ) {
    console.warn("Missing token payload");
    return undefined;
  }

  try {
    
    // Zoom injects the act field into the decrypted x-zoom-app-context when the Zoom App is opened via the deeplink.
    const body = { action: data.action }; 

    const response = await apiRequest("POST", "/zoomapp/deeplink", token, body);
    
    console.log("✅ Zoom Deeplink API response:", response);

    return response.deeplink;
  } catch (e: any) {
    console.error("❌ Zoom Deeplink API failed:", e?.response?.data || e.message);
    return undefined;
  }
}

