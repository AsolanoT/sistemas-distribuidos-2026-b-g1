/**
 * Which modules each role may see (AC2–AC4). This single list drives both the
 * sidebar and the route guards, so a role can never reach a screen its nav
 * does not offer.
 */
export const MODULES = [
  {
    key: 'summary',
    path: '/summary',
    label: 'Summary',
    icon: 'grid',
    roles: ['ADMIN'],
  },
  {
    key: 'customers',
    path: '/customers',
    label: 'Customers',
    icon: 'users',
    roles: ['ADMIN', 'SALESPERSON'],
  },
  {
    key: 'sales',
    path: '/sales',
    label: 'Sales',
    icon: 'receipt',
    roles: ['ADMIN', 'SALESPERSON'],
  },
  {
    key: 'products',
    path: '/products',
    label: 'Products',
    icon: 'box',
    roles: ['ADMIN', 'INVENTORY'],
  },
  {
    // AC3: a salesperson may look stock up, but never edit the catalogue.
    key: 'stock',
    path: '/stock',
    label: 'Stock lookup',
    icon: 'search',
    roles: ['SALESPERSON'],
  },
];

export const ROLE_LABELS = {
  ADMIN: 'Administrator',
  SALESPERSON: 'Salesperson',
  INVENTORY: 'Inventory',
};

export function modulesFor(role) {
  return MODULES.filter((module) => module.roles.includes(role));
}

export function canAccess(role, path) {
  return modulesFor(role).some((module) => module.path === path);
}

/** Where each role lands right after picking their user. */
export function defaultPathFor(role) {
  return modulesFor(role)[0]?.path ?? '/login';
}
