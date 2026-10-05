import { useCallback, useEffect, useState } from "react";
import type { Route } from "@/types";

export interface RouteState {
  route: Route;
  params: Record<string, string>;
  fullPath: string;
}

function parseLocationHash(): RouteState {
  const hash = window.location.hash;
  const search = window.location.search;

  // If recovery password link from Supabase email
  if (
    hash.includes("type=recovery") ||
    search.includes("type=recovery") ||
    hash.startsWith("#/reset-password") ||
    hash.startsWith("#reset-password")
  ) {
    return { route: "reset-password", params: {}, fullPath: "reset-password" };
  }

  // If returning from Google OAuth with tokens in hash, land cleanly on dashboard
  if (hash.includes("access_token=") || hash.includes("refresh_token=")) {
    return { route: "dashboard", params: {}, fullPath: "dashboard" };
  }

  const raw = hash.replace(/^#\/?/, "");
  if (!raw) {
    return { route: "landing", params: {}, fullPath: "landing" };
  }

  const parts = raw.split("/").filter(Boolean);
  const root = parts[0] as string;

  const validRoutes: Route[] = [
    "landing",
    "dashboard",
    "compiler",
    "courses",
    "course",
    "problems",
    "task",
    "admin",
    "leaderboard",
    "playground",
    "docs",
    "pricing",
    "privacy",
    "terms",
    "reset-password",
    "streak",
    "analytics",
    "login",
    "signup",
    "profile",
  ];

  let matchedRoute: Route = "landing";
  const params: Record<string, string> = {};

  if (root === "course" || root === "courses") {
    if (parts.length > 1) {
      matchedRoute = "course";
      params.slug = parts[1];
    } else {
      matchedRoute = "courses";
    }
  } else if (root === "task" || root === "practice") {
    matchedRoute = "task";
    if (parts.length > 1) {
      params.taskId = parts[1];
    }
  } else if (root === "profile") {
    matchedRoute = "profile";
    if (parts.length > 1) {
      params.username = parts[1];
    }
  } else if (validRoutes.includes(root as Route)) {
    matchedRoute = root as Route;
  }

  return {
    route: matchedRoute,
    params,
    fullPath: raw,
  };
}

export function useRouter() {
  const [routeState, setRouteState] = useState<RouteState>(() => parseLocationHash());

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const handler = () => {
      setRouteState(parseLocationHash());
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = useCallback((to: Route | string, navParams?: Record<string, string>) => {
    let path = to;
    if (to === "course" && navParams?.slug) {
      path = `course/${navParams.slug}`;
    } else if (to === "task" && navParams?.taskId) {
      path = `task/${navParams.taskId}`;
    } else if (to === "profile" && navParams?.username) {
      path = `profile/${navParams.username}`;
    } else if (typeof to === "string" && navParams) {
      Object.entries(navParams).forEach(([k, v]) => {
        path = path.replace(`:${k}`, v);
      });
    }

    window.location.hash = `/${path}`;
    window.scrollTo(0, 0);
  }, []);

  return {
    route: routeState.route,
    params: routeState.params,
    fullPath: routeState.fullPath,
    navigate,
  };
}

export default useRouter;
