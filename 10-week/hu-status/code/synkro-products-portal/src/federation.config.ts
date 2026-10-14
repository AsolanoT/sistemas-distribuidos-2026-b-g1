// Module Federation contract with the host (synkro-front): its registry loads
// `productsPortal/App` from this remote's `assets/remoteEntry.js`.
const DEFAULT_SHELL_ENTRY_URL = 'http://localhost:5173/assets/remoteEntry.js'

// Same range the host pins, so the host's singleton React is reused.
const REACT_RANGE = '^19.2.8'

export function createFederationConfig(shellEntryUrl = DEFAULT_SHELL_ENTRY_URL) {
  return {
    name: 'productsPortal',
    filename: 'remoteEntry.js',
    exposes: { './App': './src/App.tsx' },
    // `shell` is the host's own federation entry: it exposes the single HTTP
    // client and the session this portal consumes (shell/apiClient, shell/session).
    remotes: { shell: shellEntryUrl },
    shared: {
      react: { requiredVersion: REACT_RANGE },
      'react-dom': { requiredVersion: REACT_RANGE },
    },
  }
}

export const federationConfig = createFederationConfig()
