import { useCallback, useEffect, useState } from "react";
import type { Route } from "@/types";

export interface RouteState {
  route: Route;
  params: Record<string, string>;
  fullPath: string;
}

function parseLocationHash(): RouteState {
  const raw = window.location.hash.replace(/^#\/?/, "");
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
    "login",
    "signup",
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
    const handler = () => setRouteState(parseLocationHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = useCallback((to: Route | string, navParams?: Record<string, string>) => {
    let path = to;
    if (to === "course" && navParams?.slug) {
      path = `course/${navParams.slug}`;
    } else if (to === "task" && navParams?.taskId) {
      path = `task/${navParams.taskId}`;
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
