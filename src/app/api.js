// src/api.js

// fragments microservice API to use, defaults to localhost:8080 if not set in env
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */

export async function getAllFragments(user) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/all`, {
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log("Successfully got all fragments data", { data });
    return data;
  } catch (err) {
    console.error("Unable to call GET /v1/fragment/all", { err });
  }
}
export async function getUserFragments(user) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      // Generate headers with the proper Authorization bearer token to pass.
      // We are using the `authorizationHeaders()` helper method we defined
      // earlier, to automatically attach the user's ID token.
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log("Successfully got user fragments data", { data });
    return data;
  } catch (err) {
    console.error("Unable to call GET /v1/fragment", { err });
  }
}

export async function postFragmentData(user, body, type) {
  try {
    console.log(type);
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      headers: {
        Authorization: user.authorizationHeaders().Authorization,
        "Content-Type": type,
      },
      method: "POST",
      body: body,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log("Successfully got user fragments data", { data });
    return data;
  } catch (err) {
    console.error("Unable to call GET /v1/fragment", { err });
  }
}

export async function putFragmentData(user, body, fragment) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragment.id}`, {
      headers: {
        Authorization: user.authorizationHeaders().Authorization,
        "Content-Type": fragment.type,
      },
      method: "PUT",
      body: body,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log("Successfully update fragments data", { data });
    return data;
  } catch (err) {
    console.error("Unable to call PUT /v1/fragment", { err });
  }
}

export async function deleteFragment(user, id) {
  const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
    headers: {
      Authorization: user.authorizationHeaders().Authorization,
    },
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return true;
}

export async function convertFragment(user, id, ext) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}.${ext}`, {
      headers: {
        Authorization: user.authorizationHeaders().Authorization,
      },
      method: "GET",
    });
    if (!res.ok) {
      throw new Error(
        `Failed to convert fragment: ${res.status} ${res.statusText}`
      );
    }

    let data;
    const contentType = res.headers.get("Content-Type");
    if (
      contentType.startsWith("text/") ||
      contentType.startsWith("application/")
    ) {
      data = await res.text();
    } else {
      // Binary data (images, etc.)
      const arrayBuffer = await res.arrayBuffer();
      data = new Uint8Array(arrayBuffer); // or Blob if you want to display it
    }

    return { data, contentType };
  } catch (err) {
    console.error("Unable to call GET /v1/fragment/:di.ext", { err });
  }
}
