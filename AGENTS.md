# Project Instructions & AI Rules

## Material UI (MUI) TypeScript Rules

This codebase uses modern Material UI (`@mui/material`). Strict TypeScript checking is enabled.
AI agents MUST follow these rules to avoid breaking TypeScript compilation:

### 1. Typography (`<Typography>`)
- **NEVER** pass `fontWeight`, `fontSize`, `mb`, `mt`, `p`, `px`, `lineHeight`, `textAlign` as direct props to `<Typography>`.
- **ALWAYS** pass them inside `sx`:
  - ❌ Bad: `<Typography variant="h3" fontWeight={700}>Title</Typography>`
  - ❌ Bad: `<Typography fontWeight={600} mb={2}>Text</Typography>`
  - ✅ Good: `<Typography variant="h3" sx={{ fontWeight: 700 }}>Title</Typography>`
  - ✅ Good: `<Typography sx={{ fontWeight: 600, mb: 2 }}>Text</Typography>`

### 2. Stack (`<Stack>`)
- In MUI 9.x, `<Stack>` ONLY accepts `direction`, `spacing`, `divider`, `useFlexGap`, `children`, and `sx` as direct props.
- **NEVER** pass `alignItems`, `justifyContent`, `flexWrap`, `mb`, `mt`, `m`, `p`, `width`, `height` as direct props.
- **ALWAYS** place them inside `sx`:
  - ❌ Bad: `<Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap">`
  - ✅ Good: `<Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap' }}>`

### 3. TextField (`<TextField>`)
- This project uses `@mui/material` 9.x.
- Do NOT use deprecated `InputProps`. Use `slotProps={{ input: { ... } }}` instead:
  - ❌ Bad: `<TextField InputProps={{ startAdornment: <Search /> }} />`
  - ✅ Good: `<TextField slotProps={{ input: { startAdornment: <Search /> } }} />`

### 4. General Rule
- Any CSS style property that is not an explicit top-level prop of an MUI component MUST go inside the `sx` prop.

### 5. Dynamic Theme & Dark Mode Rules
- **NEVER** use hardcoded light-only colors like `#ffffff`, `#fff`, `#f8fafc`, `#f1f5f9` or dark-only text colors like `#1e293b`, `#0f172a`, `#334155` directly for backgrounds or typography. Doing so completely breaks Dark Mode.
- **ALWAYS** use theme-aware colors:
  - **Backgrounds**: `theme.palette.background.paper`, `theme.palette.background.default`, or `theme.palette.mode === 'dark' ? ... : ...` (or `alpha(...)`).
  - **Text**: `theme.palette.text.primary`, `theme.palette.text.secondary`, or inherit from Typography variant.
  - **Borders & Dividers**: `theme.palette.divider` instead of hardcoded `#e2e8f0`.
  - **Cards & Papers**: `elevation={0}` with `bgcolor: theme.palette.background.paper` and `border: '1px solid', borderColor: theme.palette.divider`.
  - **Accent / Badge Backgrounds**: Use `alpha(theme.palette.<color>.main, theme.palette.mode === 'dark' ? 0.2 : 0.08)`.

