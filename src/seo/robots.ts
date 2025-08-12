export function routeRobots(pathname: string, opts?: { isDraft?: boolean; isEmpty?: boolean }) {
  const noIndexRoutes = [/^\/embed\//, /^\/admin(\/|$)/, /^\/cauta(\/|$)/];
  const shouldNoIndex =
    (opts?.isDraft || opts?.isEmpty) || noIndexRoutes.some((re) => re.test(pathname));
  return shouldNoIndex ? "noindex,nofollow" : "index,follow";
}
