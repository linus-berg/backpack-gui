<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="images/backpack-logo-dark.svg">
    <img src="images/backpack-logo.svg" alt="Backpack logo" width="128">
  </picture>
</p>

# Backpack UI

Web interface for [Backpack](../backpack-backend/README.md): browse mirrored
artifacts, add new ones, watch queues and events, and administer processors,
approvals, schedules and API keys.

Built with React 19, [Blueprint 6](https://blueprintjs.com/docs/),
TanStack Query, styled-components 6 and Vite. Every asset (Monaco editor,
Inter font, icons) is bundled, so the UI works on networks without internet
access.

## Development

Requires Node 20.19+ and Yarn 1 (the Docker build and CI use `yarn.lock`).

```shell
yarn install
yarn start        # dev server on http://localhost:3000
yarn build        # type-check and build into ./build
yarn checkTs      # type-check only
yarn prettify src # format
```

The UI calls the Integration API at `<same host>:8004/api` (see
`src/api/config.ts`) and signs in through the OIDC provider that endpoint
advertises at `/api/auth/oidc`. Run the backend stack from
`../backpack-backend/Compose` for local development.

## Layout

| Path | Contents |
| --- | --- |
| `src/api/backpack.tsx` | API client (`useBackpackApi`) |
| `src/api/queries.ts` | Shared query hooks and cache keys; use these instead of ad-hoc `useQuery` keys |
| `src/app/pages/` | One folder per route |
| `src/app/components/common/` | Shared UI kit: page headers, loading/empty/error states, `DateTime`, `MarkdownView`, `CopyButton`, `ErrorBoundary`, `RequireAdmin` |
| `src/app/components/ArtifactActions/` | Artifact action labels/icons (also used by the Help dialog) and `useArtifactActions` |
| `src/app/context/` | User/roles (`useUser`), theme, and the app-wide confirmation dialog (`useConfirm`) |
| `src/utils/` | Error messages, toasts (`notify`), version filters, version sorting, clipboard, dates |

## Conventions

- **Feedback:** every mutation gets an error toast automatically (see the
  `MutationCache` in `src/app/index.tsx`); set `meta.errorTitle` for context.
  Show success with `notify.success(...)`.
- **Destructive actions** go through `useConfirm()` and name what is affected.
- **Roles:** check with `useUser().hasRole('Administrator')`; wrap admin-only
  routes in `<RequireAdmin>`.
- **Styling:** styled-components; use the theme variables in `src/app/app.scss`
  (`--card-bg`, `--code-bg`, `--table-border`, …) or Blueprint classes such as
  `Classes.TEXT_MUTED` instead of hard-coded colors, so both themes work.
- **Shareable state:** browser state (search, filters, open artifact) lives in
  the URL; see `src/app/pages/ProcessorBrowser/useBrowserParams.ts`.

### Blueprint 6 notes

- Class names use the `bp6-` prefix. In TypeScript use `Classes.*` (e.g.
  `Classes.DARK`); SCSS and the theme script in `index.html` use the literal.
- Use `variant="minimal"`, `size="small"` and `endIcon` instead of the
  deprecated `minimal`, `small` and `rightIcon` props, and `PopoverNext`
  instead of `Popover`.
- The app is wrapped in `BlueprintProvider` (hotkeys, overlays, portals).
- Toasts go through `notify` in `src/utils/toaster.ts`; Blueprint 6 creates
  toasters asynchronously.
