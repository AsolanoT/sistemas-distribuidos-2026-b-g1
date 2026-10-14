// Stand-in for the host's `shell/session` under Vitest.
interface ShellUser {
  sub: string
  role: string
}

let currentUser: ShellUser | null = null

export const session = {
  user: () => currentUser,
}

export function signInAs(user: ShellUser | null) {
  currentUser = user
}
