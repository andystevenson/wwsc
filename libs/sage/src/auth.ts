import * as env from "./env";
import { fetch } from "@wwsc/lib-util";

export type Token = {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
  requested_by_id: string;
};

const headers = {
  method: "POST",
  "Content-Type": "application/x-www-form-urlencoded",
  Allow: "application/json",
};

export const getToken = async (code: string) => {
  if (!code) {
    throw Error("null-code for token", {
      cause: { reason: "getToken(code) called with null value" },
    });
  }

  const { client_id, client_secret, grant_type, redirect_uri, accessTokenUrl } =
    env;

  const params = new URLSearchParams({
    client_id,
    client_secret,
    code,
    grant_type,
    redirect_uri,
  });

  const response = await fetch(accessTokenUrl, {
    method: "POST",
    headers,
    body: `${params}`,
  });

  if (response.ok) {
    const token = await response.json();
    return token;
  }

  throw Error("sage-api-error:getToken", {
    cause: { reason: `${response.statusText}`, status: response.status },
  });
};

export const refreshToken = async (token: Token) => {
  const { client_id, client_secret, accessTokenUrl } = env;
  const grant_type = `refresh_token`;
  const refresh_token = token.refresh_token;

  const params = new URLSearchParams({
    client_id,
    client_secret,
    grant_type,
    refresh_token,
  });

  const response = await fetch(accessTokenUrl, {
    method: "POST",
    headers,
    body: `${params}`,
  });

  if (response.ok) {
    const token = await response.json();
    return token;
  }

  throw Error("sage-api-error:refreshToken", {
    cause: { reason: `${response.statusText}`, status: response.status },
  });
};

export const revokeToken = async (token: Token) => {
  const { client_id, client_secret, revokeTokenUrl } = env;
  if (!revokeTokenUrl) {
    throw Error("no-revoke-token-url", { cause: { reason: "no url" } });
  }

  const params = new URLSearchParams({
    client_id,
    client_secret,
    token: token.refresh_token,
  });

  const response = await fetch(revokeTokenUrl, {
    method: "POST",
    headers,
    body: `${params}`,
  });

  if (!response.ok) {
    throw Error("sage-api-error:revokeToken", {
      cause: { reason: "no success" },
    });
  }
  const success = await response.json();
  console.log("revokeToken", success);

  return;
};
