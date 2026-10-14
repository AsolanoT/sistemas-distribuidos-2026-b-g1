// The state of one request the screen shows: it is loading, it failed, or it
// holds the answer.
export type Loadable<T> = { status: 'loading' } | { status: 'error' } | { status: 'ready'; value: T }
