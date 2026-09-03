# Material UI (MUI) TypeScript and Component Guidelines

## CRITICAL RULES FOR AI ASSISTANTS

This project uses modern Material UI (`@mui/material`). TypeScript is strictly enforced. Passing invalid system props directly to MUI components causes immediate TypeScript compilation errors (`No overload matches this call`, `Property does not exist on type...`) and React runtime DOM warnings.

### 1. Typography Component (`<Typography>`)
- **NEVER** pass system style props directly as component props.
  - ❌ WRONG: `<Typography variant="h3" fontWeight={700} mb={2}>`
  - ❌ WRONG: `<Typography fontWeight={600} color="white">`
  - ❌ WRONG: `<Typography fontSize={14} textAlign="center">`
- **ALWAYS** pass style attributes inside the `sx` prop:
  - ✅ CORRECT: `<Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>`
  - ✅ CORRECT: `<Typography sx={{ fontWeight: 600, color: 'white' }}>`
  - ✅ CORRECT: `<Typography sx={{ fontSize: 14, textAlign: 'center' }}>`
- **Valid direct props for `<Typography>`**:
  `variant`, `component`, `align` ('left' | 'center' | 'right' | 'justify' | 'inherit'), `gutterBottom`, `noWrap`, `children`, `sx`, `color` (theme palette keys).

---

### 2. Stack Component (`<Stack>`)
- In `@mui/material` 9.x, `<Stack>` only accepts `direction`, `spacing`, `divider`, `useFlexGap`, `children`, and `sx`.
- **NEVER** pass `alignItems`, `justifyContent`, `flexWrap`, `mb`, `mt`, `m`, `p`, `width`, `height` as direct props.
  - ❌ WRONG: `<Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap">`
  - ❌ WRONG: `<Stack p={2} mt={1}>`
- **ALWAYS** pass flexbox alignments, spacing, margins, wrap inside `sx`:
  - ✅ CORRECT: `<Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap' }}>`
  - ✅ CORRECT: `<Stack sx={{ p: 2, mt: 1 }}>`
- **Valid direct props for `<Stack>`**:
  `direction`, `spacing`, `divider`, `useFlexGap`, `children`, `sx`.

---

### 3. TextField Component (`<TextField>`)
- In modern MUI versions installed in this project (`@mui/material` 9.x):
  - For adornments and input-level props, use `slotProps={{ input: { ... } }}` or `slotProps={{ htmlInput: { ... } }}`.
  - ❌ WRONG: `<TextField InputProps={{ startAdornment: ... }} />` (causes TS error in strict MUI 9).
  - ✅ CORRECT:
    ```tsx
    <TextField
      size="small"
      slotProps={{
        input: {
          startAdornment: <SearchIcon />
        }
      }}
      sx={{ ... }}
    />
    ```

---

### 4. Autocomplete Component (`<Autocomplete>`)
- Always spread `params` into `TextField`:
  ```tsx
  renderInput={(params) => (
    <TextField {...params} label="Label" size="small" />
  )}
  ```

---

### 5. General Rule for All MUI Components
Whenever applying CSS styling (margins `m/mt/mb/ml/mx/my`, paddings `p/pt/pb/pl/px/py`, `fontWeight`, `fontSize`, `borderRadius`, `display`, `flexWrap`, `width`, `height`, `backgroundColor`, `color`), **ALWAYS put them in the `sx` prop**, unless the component's TypeScript definition explicitly declares it as a top-level prop.
