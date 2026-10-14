// The portal does not share the host's router: the host mounts this app and reads
// the browser's location. To go to another screen without a document load, the
// portal pushes the URL with the History API and announces it with a popstate
// event, which is what the host's history-based router listens to. This couples
// the portal to a history-based host router (see the README for the failure mode).
export function navigateTo(path: string): void {
  const current = window.location.pathname + window.location.search + window.location.hash
  if (path === current) return

  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
