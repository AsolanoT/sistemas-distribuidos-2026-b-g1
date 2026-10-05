# Patch — `12-ux-ui/design-system.md`

Two small, precise changes. The rest of the file (Brand identity, every
token value, Components, Error handling, Accessibility) is already
correct as written — these tokens were already CSS custom properties
before this HU, which is most of what ADR-011 Decision 4 asked for. What
was missing is the explicit statement of *who* publishes them and *how*
a second framework reads the same ones without redefining them.

---

## 1. Insert a new subsection, right after the `## Design tokens` heading and before `### Colors — Light theme`

**Find:**
```markdown
## Design tokens

### Colors — Light theme
```

**Replace with:**
```markdown
## Design tokens

### How these tokens cross frameworks

`synkro-front` (the host) is the only place these custom properties are
defined — on `:root`, loaded once for the whole application. Every
portal reads them; none redefines them, in either framework (ADR-011
Decision 4):

- **React portals** use the variables directly in CSS, in CSS Modules,
  or through Tailwind's arbitrary-value syntax (`bg-[var(--color-primary-500)]`),
  depending on each portal's own styling choice — the token names below
  are the contract, not the styling method.
- **The Angular portal** (`synkro-customers-portal`) reads the same
  variables in its component styles with plain `var(--token-name)`, the
  same as any CSS. Custom properties inherit through the DOM regardless
  of the custom-element boundary, **as long as the component does not
  opt into `ViewEncapsulation.ShadowDom`** — Angular's default
  encapsulation (`Emulated`) does not create a shadow root, so nothing
  extra is needed for the inherited values to reach it. If a future
  change switches the portal to Shadow DOM encapsulation, the custom
  properties would need to be re-declared or pierced through, and that
  change would need its own review.
- **No component library is shared.** Each framework builds its own
  button, table and form components from these tokens (ADR-011 Decision
  4, Option A); only the values are shared, not the implementation.

### Colors — Light theme
```

---

## 2. Update the Correlations section

**Find** the line in `## Correlations` that starts with:
```markdown
- Current implementation of these tokens →
```

**Add a new line immediately after it:**
```markdown
- Angular Customers portal, mounting and token consumption → `05-architecture/decisions/records/ADR-011-angular-customers-portal.md` Decision 4
- Frontend folder structure and the host/portal contract → `_stacks/frontend.md`
```
