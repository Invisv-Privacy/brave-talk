/* eslint-disable @typescript-eslint/no-unused-vars */
import { TranslationKeys } from "./i18n/i18next";
import { loadLocalJwtStore } from "./jwt-store";
import { fetchWithTimeout } from "./lib";
import { Web3RequestBody } from "./components/web3/api";
import { isProduction } from "./environment";

// the subscriptions service is forwarded by CloudFront onto talk.brave* so we're not
// making a cross domain call - see https://github.com/brave/devops/issues/5445.
const SUBSCRIPTIONS_ROOT_URL = "/api";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";
interface RoomRequestBody {
  // is this the first case of this user making a request this month,
  // i.e. it's a new monthly active user
  mauP?: boolean;

  // some requests expect a jwt
  jwt?: string;

  // web3 request payload
  web3?: Web3RequestBody;
}

interface RoomResponse {
  jwt: string;
  refresh?: string;
}

interface RoomsRequestParams {
  roomName: string;
  urlSuffix?: string;
  createP: boolean;
  method: RequestMethod;
  body: RoomRequestBody;
  successCodes: number[];
  failureMessages: { [status: number]: string };
}

const GENERIC_ERROR_MESSAGE =
  "Oops! We were unable to connect to your meeting room. Please try again.";

const roomsRequest = async ({
  roomName,
  urlSuffix = "",
  createP,
  method,
  body,
  successCodes,
  failureMessages,
}: RoomsRequestParams): Promise<RoomResponse> => {
  // Invisv hacks for jwt removal
  // This is just a random hard coded jwt that appeases the local client js
  // though isn't properly signed or anything. The only reason I need it is because
  // I don't understand the rest of this client codebase well enough 🙃
  return {
    jwt: "eyJhbGciOiJSUzI1NiIsImtpZCI6InZwYWFzLW1hZ2ljLWNvb2tpZS1jZDQxMzFlZjc3Njc0YTcxYjczNDExNDA4MjI2ZTIzMi8wZjE2NzgiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJqaXRzaSIsImNvbnRleHQiOnsiZmVhdHVyZXMiOnsibGl2ZXN0cmVhbWluZyI6InRydWUiLCJyZWNvcmRpbmciOiJmYWxzZSJ9LCJtYXVQIjoiZmFsc2UiLCJ1c2VyIjp7ImF2YXRhciI6IiIsImVtYWlsIjoiMEB0YWxrLmJyYXZlLmludGVybmFsIiwiaWQiOiIwIiwibW9kZXJhdG9yIjoidHJ1ZSJ9LCJ4LWJyYXZlLWZlYXR1cmVzIjp7Imdyb3VwLXJvb20iOiJmYWxzZSJ9fSwiZXhwIjoxNjk1OTY5NjMwLCJpYXQiOjE2OTU5NTg4MzAsImlzcyI6ImNoYXQiLCJuYmYiOjE2OTU5NTg4MzAsInJvb20iOiJ3SkNsUGcwX1lXSXJob3FnNkpmckZKampiQy1oY09ISHIteXNUTHgzbUk0Iiwic3ViIjoidnBhYXMtbWFnaWMtY29va2llLWNkNDEzMWVmNzc2NzRhNzFiNzM0MTE0MDgyMjZlMjMyIn0.JMNehcC-tTD0yfEjuz3cdkf1P8JPgPXyqbGC4KrN4tMJSmyMZvkFscfgw6sWOBzMPAM9NAOtyQq6VZ-NKVI0lmGP4UwxW7BOV4Efm-MS6XsdPXUIDx3TM3XwqWSABl9jNXo9vPhLNHJSwukhtEeOzuNil_p-gmC-QPRZEYL2IfCxVLVBa3DqHA_QR4fn7VsKKjPxWjTBJPU8sWiwNmX7vi_fjeKYFZSBeArH6pRkj09x6ERsuQgjIvbzibQN04-C0RuOzs23lo5jssQyUM_gGzXnDRQkawljAOiGVdrcG25unBnud_dQF_BpYRk86bCXaAhD7A9k9oNq16fEut6nyA",
    refresh:
      "eyJhbGciOiJSUzI1NiIsImtpZCI6InZwYWFzLW1hZ2ljLWNvb2tpZS1jZDQxMzFlZjc3Njc0YTcxYjczNDExNDA4MjI2ZTIzMi8wZjE2NzgiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJjaGF0IiwiY29udGV4dCI6e30sImV4cCI6MTY5OTg0NjgzMCwiZ3JvdXAtcm9vbSI6ZmFsc2UsImlhdCI6MTY5NTk1ODgzMCwiaXNzIjoiY2hhdCIsIm1vZGVyYXRvciI6dHJ1ZSwibmJmIjoxNjk1OTY5NjMwLCJyb29tIjoid0pDbFBnMF9ZV0lyaG9xZzZKZnJGSmpqYkMtaGNPSEhyLXlzVEx4M21JNCJ9.aM4luZxnpTJxZQLiTKpe7zNNaxqLcZEQsbWY245K1G2H99jTpa9xpe3cBb1YW6rLu_YoFwdBo-lj8TX92_GP5hNUSLNWLHX8nTaP_8EptjIo6f-FrtI-GLCzandN96JyOvKKbDl6Um_WYQfrnPgpF9dt6iwZ5CzNPDcRES31TWxhinGrvGDDm1i9y2MgifYNl8QhvN0chs9p5_UEHdIPtRO3l4pMBnr9EN59ABWN8Sfd9pNF0jnBq3CdE2Kgt9swmRGKGroKR-VYeYlSUdhnUyIDosiYhezUdetje9fvDxJqhalkWns9cz6CYBfSpGJw1a3nf3Ac8raIZFZXnTVBkw",
  };
  // const optionsUrl = `${SUBSCRIPTIONS_ROOT_URL}/v1/rooms/${encodeURIComponent(
  //   roomName,
  // )}`;
  // const url = `${optionsUrl}${urlSuffix}`;
  // try {
  //   console.log(`>>> OPTIONS ${optionsUrl}`);
  //   const optionsResponse = await fetchWithTimeout(optionsUrl, {
  //     method: "OPTIONS",
  //     credentials: "include",
  //   });

  //   console.log(`<<< OPTIONS ${optionsUrl} ${optionsResponse.status}`);

  //   const csrfToken = optionsResponse.headers.get("x-csrf-token");
  //   if (!csrfToken) {
  //     console.warn(
  //       "!!! OPTIONS request failed to return x-csrf-token, which is likely due to incorrectly configured CORS policy",
  //     );
  //     throw new Error(GENERIC_ERROR_MESSAGE);
  //   }

  //   const reqParams: RequestInit = {
  //     method,
  //     headers: {
  //       "x-csrf-token": csrfToken,
  //       "Content-Type": "application/json",
  //     },
  //     credentials: "include",
  //     body: JSON.stringify(body),
  //   };

  //   console.log(`>>> ${method} ${url}`);
  //   const response = await fetchWithTimeout(url, reqParams);
  //   const { status } = response;
  //   console.log(`<<< ${method} ${url} ${status}`);

  //   if (!successCodes.includes(status)) {
  //     if (createP && status === 409) {
  //       console.log(`!!! retry ${method} ${url} ${status}`);
  //       return await roomsRequest({
  //         roomName,
  //         urlSuffix: urlSuffix,
  //         createP: false,
  //         method: method,
  //         body: body,
  //         successCodes: successCodes,
  //         failureMessages: failureMessages,
  //       });
  //     }
  //     const respText = await response.text();
  //     if (respText.includes("ETH")) {
  //       throw new Error("ETH");
  //     } else if (respText.includes("SOL")) {
  //       throw new Error("SOL");
  //     }
  //     const message =
  //       status == 401
  //         ? respText
  //         : failureMessages[status] ||
  //           `Request failed: ${status} ${response.statusText}`;

  //     console.warn(`!!! body: ${respText}`);
  //     throw new Error(message);
  //   }

  //   const resBody = await response.json();
  //   console.log("RESPONSE BODY", resBody);

  //   if (!resBody.jwt) {
  //     console.warn("!!! response does not include jwt eleement!");
  //     throw new Error("Request failed: internal error(1)");
  //   }

  //   return resBody;
  // } catch (e: any) {
  //   if (e.message === "Failed to fetch") {
  //     console.warn(
  //       "!!! fetch threw an error, which is likely due to incorrectly configured CORS policy",
  //     );
  //     throw new Error(GENERIC_ERROR_MESSAGE);
  //   }

  //   if (e.name === "AbortError") {
  //     throw new Error("Timeout: please try again later");
  //   }

  //   throw e;
  // }
};

const attemptTokenRefresh = async (
  roomName: string,
  refreshToken: string,
): Promise<RoomResponse | undefined> => {
  try {
    const response = await roomsRequest({
      roomName,
      urlSuffix: "/moderator",
      createP: false,
      method: "PUT",
      body: { jwt: refreshToken },
      successCodes: [201],
      failureMessages: {},
    });
    return response;
  } catch (e) {
    console.warn("!!! failed to refresh jwt: ", e);
    // but just ignore the error as we can get a new jwt as we always used to
  }

  return undefined;
};

interface FetchJWTResult {
  url?: string;
  jwt: string;
}

export const fetchJWT = async (
  roomName: string,
  createP: boolean,
  reportProgress: (message: TranslationKeys) => void,
  web3?: Web3RequestBody,
): Promise<FetchJWTResult> => {
  const store = loadLocalJwtStore();

  const jwt = store.findJwtForRoom(roomName);
  if (jwt) {
    if (!isProduction) {
      console.log("!!! found local jwt: ", jwt);
    }
    return { jwt };
  }

  const refreshToken = store.findRefreshTokenForRoom(roomName);
  if (refreshToken) {
    reportProgress("Checking moderator status...");
    if (!isProduction) {
      console.log("!!! attempting refresh: ", refreshToken);
    }
    const response = await attemptTokenRefresh(roomName, refreshToken);
    if (response) {
      store.storeJwtForRoom(roomName, response.jwt, response.refresh);
      return { jwt: response.jwt };
    }
  }

  const body: RoomRequestBody = {
    mauP: store.isNewMonthlyActiveUser() && true,
    web3,
  };

  let method: RequestMethod, success: number;

  if (createP) {
    reportProgress("Creating meeting room...");
    method = "POST";
    success = 201;
  } else {
    reportProgress("Locating meeting room...");
    method = "PUT";
    success = 200;
  }

  if (createP) {
    // need to ensure the subscriber credentials are presented
    const subs = await import("./subscriptions");
    await subs.setTemporaryCredentialCookie();
  }

  const response = await roomsRequest({
    roomName,
    createP,
    method,
    body,
    successCodes: [success],
    failureMessages: {
      400: createP
        ? web3
          ? "Error joining room, please try again"
          : "Sorry, you are not a subscriber"
        : "Sorry, the call is already full",
      401: web3
        ? "Access failure: You must have an approved token to join this call"
        : "Not listed as participant",
      403: "Forbidden",
      404: "The room does not exist",
      405: "Method not allowed",
      408: "Request timeout",
      409: web3
        ? "Sorry, call already exists! (this should not happen)"
        : "Retry as Web3 call",
      417: "Expectation failed",
      420: "Method failure",
      429: "Too many requests",
      500: "Internal server error",
      502: "Bad gateway",
      503: "Service unavailable",
      504: "Gateway timeout",
    },
  });

  store.storeJwtForRoom(roomName, response.jwt, response.refresh);
  return {
    jwt: response.jwt,
    url: "//" + window.location.host + "/" + roomName,
  };
};
