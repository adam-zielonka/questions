# Development

Use Node.js 24.22+ (24–26) and pnpm 12. The repository pins the verified package manager and runtime.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm audit --audit-level=high
pnpm test
```

Pull requests run validation without deploying. Pages deployment is restricted to
the default branch. Dependabot checks compatible updates weekly; major updates
are reviewed separately.

The build now uses Vite rather than Create React App. Existing React behavior
is retained. The old CRA service worker is retired within this app’s scope;
new deployments no longer promise offline caching.

The `parser/` application is a separate package: run its install, tests and
build from that directory as well. MobX 5 uses explicit annotations instead of
legacy decorator syntax. UI controls use native HTML elements, local styles and
inline SVG icons. Confirmation and import dialogs use the native `<dialog>`
element for modal focus and background isolation. CSS uses Vite’s default minifier.
