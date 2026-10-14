import { resolveScreen } from './routes'

// The module the host mounts as `productsPortal/App`. It renders the screen for
// the location the host routed to, and nothing for a route the portal does not own.
// It reads the location when it renders and does not listen to history itself: the
// host's history-based router re-renders it on every location change, whether the
// menu or `navigateTo` made it (checked in the real host; see the README).
export default function App() {
  return resolveScreen(window.location.pathname)
}
