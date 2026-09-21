import { useCallback, useEffect, useState } from "react";
import type { Route } from "@/types";

function parseHash(): Route {
  const hash = window.location.hash.replace("#/", "").replace("#", "");
  const valid: Route[] = [
    "landing",
    "compiler",
    "problems",
    "playground",
    "docs",
    "pricing",
    "login",
    "signup",
  ];
  return (valid.includes(hash as Route) ? hash : "landing") as Route;
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const handler = () => setRoute(parseHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = useCallback((to: Route) => {
    window.location.hash = `/${to}`;
    window.scrollTo(0, 0);
  }, []);

  return { route, navigate };
}
