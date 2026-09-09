// Generic client-side fetch helpers shared by ScriptPanel and GenerationPanel.

function extractErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && typeof (data as { error?: unknown }).error === "string") {
    return (data as { error: string }).error;
  }
  return fallback;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, `Request failed with status ${response.status}.`));
  }

  return data as T;
}

export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, `Request failed with status ${response.status}.`));
  }

  return data as T;
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload-asset", { method: "POST", body: formData });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, `Upload failed with status ${response.status}.`));
  }

  if (!data || typeof (data as { url?: unknown }).url !== "string") {
    throw new Error("Unexpected response shape from upload.");
  }

  return (data as { url: string }).url;
}
