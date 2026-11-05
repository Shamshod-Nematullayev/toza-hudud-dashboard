import { ReactNode, useEffect, useState } from 'react';
import { create } from 'zustand';
import { Box, Button, Dialog, DialogActions, DialogContent, Stack, TextField, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { DeleteOutlined, EditNoteOutlined, HelpOutlined, WarningAmberRounded } from '@mui/icons-material';

type ConfirmColor = 'primary' | 'warning' | 'error';

export interface ConfirmOptions {
  title?: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** error — o'chirish kabi qaytarib bo'lmaydigan amallar, warning — ehtiyotkorlik talab qiladigan amallar */
  color?: ConfirmColor;
}

export interface PromptOptions extends Omit<ConfirmOptions, 'message'> {
  message?: ReactNode;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  /** true bo'lsa bo'sh matn bilan tasdiqlab bo'lmaydi */
  required?: boolean;
  multiline?: boolean;
}

type DialogRequest =
  | { kind: 'confirm'; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { kind: 'prompt'; options: PromptOptions; resolve: (value: string | null) => void };

interface ConfirmState {
  request: DialogRequest | null;
  open: (request: DialogRequest) => void;
  /** confirm uchun true/false, prompt uchun matn yoki null */
  close: (value: string | boolean | null) => void;
}

function cancelValue(request: DialogRequest) {
  return request.kind === 'confirm' ? false : null;
}

const useConfirmStore = create<ConfirmState>((set, get) => ({
  request: null,
  open: (request) => {
    // Oldingi so'rov ochiq qolgan bo'lsa, u bekor qilingan hisoblanadi
    const prev = get().request;
    if (prev) (prev.resolve as (v: unknown) => void)(cancelValue(prev));
    set({ request });
  },
  close: (value) => {
    const req = get().request;
    if (!req) return;
    if (req.kind === 'confirm') req.resolve(Boolean(value));
    else req.resolve(typeof value === 'string' ? value : null);
    set({ request: null });
  }
}));

/**
 * window.confirm o'rniga ishlatiladigan tasdiqlash oynasi.
 * @example if (!(await confirmDialog({ message: "O'chirilsinmi?", color: 'error' }))) return;
 */
export function confirmDialog(options: ConfirmOptions | string): Promise<boolean> {
  return new Promise((resolve) =>
    useConfirmStore.getState().open({ kind: 'confirm', options: typeof options === 'string' ? { message: options } : options, resolve })
  );
}

/**
 * window.prompt o'rniga ishlatiladigan matn so'rash oynasi. Bekor qilinsa null qaytadi.
 * @example const reason = await promptDialog({ title: 'Bekor qilish sababi', required: true }); if (reason === null) return;
 */
export function promptDialog(options: PromptOptions | string): Promise<string | null> {
  return new Promise((resolve) =>
    useConfirmStore.getState().open({ kind: 'prompt', options: typeof options === 'string' ? { message: options } : options, resolve })
  );
}

const icons: Record<ConfirmColor, typeof HelpOutlined> = {
  primary: HelpOutlined,
  warning: WarningAmberRounded,
  error: DeleteOutlined
};

const defaultTitles: Record<ConfirmColor, string> = {
  primary: 'Tasdiqlash',
  warning: 'Diqqat',
  error: "O'chirishni tasdiqlang"
};

/** Ilova ildizida bir marta joylashtiriladi */
export function ConfirmDialogHost() {
  const theme = useTheme();
  const { request, close } = useConfirmStore();
  const [value, setValue] = useState('');

  const isPrompt = request?.kind === 'prompt';
  const promptOptions = isPrompt ? (request.options as PromptOptions) : null;

  useEffect(() => {
    setValue(promptOptions?.defaultValue ?? '');
  }, [request]); // eslint-disable-line react-hooks/exhaustive-deps

  const options = request?.options;
  const color = options?.color || 'primary';
  const Icon = isPrompt && color === 'primary' ? EditNoteOutlined : icons[color];
  const main = theme.palette[color].main;
  const canSubmit = !promptOptions?.required || value.trim().length > 0;

  const cancel = () => close(isPrompt ? null : false);
  const submit = () => {
    if (!canSubmit) return;
    close(isPrompt ? value : true);
  };

  return (
    <Dialog open={Boolean(request)} onClose={cancel} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      {options && (
        <>
          <DialogContent sx={{ pt: 3, pb: 1 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                  color: main
                }}
              >
                <Icon />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.75 }}>
                  {options.title || (isPrompt ? "Ma'lumot kiriting" : defaultTitles[color])}
                </Typography>
                {options.message && (
                  <Typography component="div" variant="body1" sx={{ color: 'text.secondary', whiteSpace: 'pre-line' }}>
                    {options.message}
                  </Typography>
                )}
                {promptOptions && (
                  <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    label={promptOptions.label}
                    placeholder={promptOptions.placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    multiline={promptOptions.multiline}
                    minRows={promptOptions.multiline ? 2 : undefined}
                    onKeyDown={(e) => {
                      // Ko'p qatorli maydonda Enter yangi qator, Ctrl+Enter yuboradi
                      if (e.key === 'Enter' && (!promptOptions.multiline || e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        submit();
                      }
                    }}
                    sx={{ mt: 1.5 }}
                  />
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
            <Button onClick={cancel} color="inherit" variant="outlined" sx={{ borderColor: 'divider' }}>
              {options.cancelText || 'Bekor qilish'}
            </Button>
            <Button onClick={submit} color={color} variant="contained" autoFocus={!isPrompt} disabled={!canSubmit} disableElevation>
              {options.confirmText || (color === 'error' && !isPrompt ? "O'chirish" : 'Tasdiqlash')}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
