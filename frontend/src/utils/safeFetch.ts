import { APIResponse } from "./types";
import { redirect } from "next/navigation";

export async function routerFetch<T extends APIResponse>(
  input: RequestInfo,
  init: RequestInit,
  router: { push: (url: string) => void },
): Promise<T | void> {
  try {
    const res = await fetch(input, init);
    if (res.status === 401) {
      throw new Error("/accounts/login");
    }
    if (!res.ok) {
      throw new Error("/500");
    }
    return (await res.json()) as T;
  } catch (error) {
    console.log("routerFetch", error);
    if (error instanceof Error) {
      return router?.push(error.message);
    }
    return router?.push("/500");
  }
}

export async function redirectFetch<T extends APIResponse>(
  input: RequestInfo,
  init: RequestInit,
): Promise<T> {
  try {
    const res = await fetch(input, init);
    if (res.status === 401) {
      throw new Error("/accounts/login");
    }
    if (!res.ok) {
      throw new Error("/500");
    }
    return (await res.json()) as T;
  } catch (error) {
    console.log("redirectFetch", error);
    if (error instanceof Error) {
      redirect(error.message);
    }
    redirect("/500");
  }
}

export default async function safeFetch<T extends APIResponse>(
  input: RequestInfo,
  init: RequestInit,
): Promise<T> {
  try {
    const res = await fetch(input, init);
    return (await res.json()) as T;
  } catch (error) {
    console.log("safeFetch", error);
    return { success: false, message: "Internal Server Error" } as T;
  }
}
