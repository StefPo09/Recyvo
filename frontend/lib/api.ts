// Use NEXT_PUBLIC_API_URL from environment or default to localhost:8000
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type AnalyzeRequest = {
  image: string; // base64 without prefix
  mime_type?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export async function analyzeImage(req: AnalyzeRequest) {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
  } catch (err: any) {
    const msg = String(err?.message || err);
    throw new Error(`Network error when calling ${API_URL}/analyze: ${msg}. Is the backend running and reachable?`);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Analyze failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function listBins(bin_type?: string) {
  const url = new URL(`${API_URL}/bins/`);
  if (bin_type) url.searchParams.set("bin_type", bin_type);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`List bins failed: ${res.status}`);
  return res.json();
}

export async function findNearest(lat: number, lng: number, bin_type: string, max_results = 5) {
  const res = await fetch(`${API_URL}/bins/nearest-simple/?lat=${lat}&lng=${lng}&bin_type=${encodeURIComponent(bin_type)}&max_results=${max_results}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Find nearest failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function fetchRecyclingPlaces(lat: number, lng: number, waste_category: string, max_results = 5) {
  const url = new URL(`${API_URL}/places/nearby/`);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lng", String(lng));
  url.searchParams.set("waste_category", waste_category);
  url.searchParams.set("max_results", String(max_results));

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch places failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function addBin({
  lat,
  lng,
  address = "",
  bin_type,
  added_by = "web",
  imageFile,
}: {
  lat: number;
  lng: number;
  address?: string;
  bin_type: string;
  added_by?: string;
  imageFile?: File | null;
}) {
  const form = new FormData();
  form.append("lat", String(lat));
  form.append("lng", String(lng));
  form.append("address", address);
  form.append("bin_type", bin_type);
  form.append("added_by", added_by);
  if (imageFile) form.append("image", imageFile, imageFile.name);

  let res: Response;
  try {
    res = await fetch(`${API_URL}/bins/`, {
      method: "POST",
      body: form,
    });
  } catch (err: any) {
    // network error / CORS / backend not reachable
    const msg = String(err?.message || err);
    throw new Error(`Network error when calling ${API_URL}/bins/: ${msg}. Is the backend running and reachable?`);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Add bin failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function deleteBin(bin_id: string) {
  const res = await fetch(`${API_URL}/bins/${encodeURIComponent(bin_id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Delete bin failed: ${res.status} ${text}`);
  }
  return res.json();
}

// User Authentication Functions
export async function signupUser({
  username,
  nume,
  email,
  parola,
}: {
  username: string;
  nume: string;
  email: string;
  parola: string;
}) {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/users/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        nume,
        email,
        parola,
      }),
    });
  } catch (err: any) {
    const msg = String(err?.message || err);
    throw new Error(`Network error when calling ${API_URL}/users/: ${msg}. Is the backend running and reachable?`);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Signup failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function loginUser({
  username_or_email,
  parola,
}: {
  username_or_email: string;
  parola: string;
}) {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username_or_email,
        parola,
      }),
    });
  } catch (err: any) {
    const msg = String(err?.message || err);
    throw new Error(`Network error when calling ${API_URL}/users/login: ${msg}. Is the backend running and reachable?`);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getUserById(userId: string) {
  const res = await fetch(`${API_URL}/users/${encodeURIComponent(userId)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Get user failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function addUserPoints(username: string, pointsToAdd: number) {
  const res = await fetch(`${API_URL}/users/${encodeURIComponent(username)}/points`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ puncte_adaugate: pointsToAdd }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Add points failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function updateUser(userId: string, data: { username?: string; nume?: string; email?: string; parola?: string }) {
  const res = await fetch(`${API_URL}/users/${encodeURIComponent(userId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update user failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function uploadProfileImage(userId: string, imageFile: File) {
  const form = new FormData();
  form.append("image", imageFile, imageFile.name);

  const res = await fetch(`${API_URL}/users/${encodeURIComponent(userId)}/profile-image`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload profile image failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function deleteUser(userId: string) {
  const res = await fetch(`${API_URL}/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Delete user failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getUserPreferences(userId: string) {
  const res = await fetch(`${API_URL}/users/${encodeURIComponent(userId)}/preferences`);
  if (!res.ok) {
    if (res.status === 404) {
      return {}; // Return empty preferences if user not found
    }
    const text = await res.text();
    throw new Error(`Get preferences failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function saveUserPreferences(userId: string, preferences: any) {
  const res = await fetch(`${API_URL}/users/${encodeURIComponent(userId)}/preferences`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preferences),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Save preferences failed: ${res.status} ${text}`);
  }
  return res.json();
}
