import { APIResponse } from "./types";

export default async function safeFetch<T extends APIResponse>(
  input: RequestInfo,
  init: RequestInit
): Promise<T> {
  try {
    const res = await fetch(input, init);
    const data = await res.json();
    return { ...data, status: res.status };
  } catch {
    return {
      success: false,
      message: "Something went wrong",
      status: 500,
    } as T;
  }
}
