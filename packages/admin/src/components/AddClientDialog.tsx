import { useId } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AddClientResult, addClient } from '../services/api/clients';

interface AddClientDialogProps {
  onClose: () => void;
  onSubmit: (result: AddClientResult) => void;
}

const phoneMask = '+55 (00) 0 0000-0000';

const schema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome é muito longo'),

  email: z.string()
    .min(1, 'E-mail é obrigatório')
    .max(255, 'E-mail é muito longo')
    .email('E-mail inválido'),

  phone: z.string()
    .min(1, 'Telefone é obrigatório')
    .max(255, 'Telefone é muito longo')
    .regex(/^\+55 \(\d{2}\) \d \d{4}-\d{4}$/, `Telefone deve seguir o formato ${phoneMask}`),

  coordinates: z.object({ x: z.number(), y: z.number() }),
});

interface Schema extends z.infer<typeof schema> {}


export function AddClientDialog({ onClose, onSubmit }: AddClientDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const formId = useId();

  const mutation = useMutation({
    mutationFn: (data: Schema) => addClient(data),
  });

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', coordinates: { x: 0, y: 0 } },
  });

  const handleValid = async (data: Schema) => {
    try {
      const result = await mutation.mutateAsync(data);
      onSubmit(result);
      onClose();
      enqueueSnackbar('Cliente adicionado com sucesso', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Adicionar Cliente</DialogTitle>
      <DialogContent>
        <form id={formId} onSubmit={form.handleSubmit(handleValid)}>
          <TextField
            {...form.register('name')}
            type="text"
            label="Nome"
            margin="dense"
            autoCapitalize="words"
            error={!!form.formState.errors.name}
            helperText={form.formState.errors.name?.message}
            disabled={form.formState.isSubmitting}
            fullWidth
          />
          <TextField
            {...form.register('email')}
            type="email"
            label="E-mail"
            margin="dense"
            error={!!form.formState.errors.email}
            helperText={form.formState.errors.email?.message}
            disabled={form.formState.isSubmitting}
            fullWidth
          />
          <TextField
            {...form.register('phone')}
            type="text"
            label="Telefone"
            margin="dense"
            inputMode="tel"
            error={!!form.formState.errors.phone}
            helperText={form.formState.errors.phone?.message}
            disabled={form.formState.isSubmitting}
            fullWidth
          />
          <TextField
            {...form.register('coordinates.x', { valueAsNumber: true })}
            type="number"
            label="Latitude"
            margin="dense"
            error={!!form.formState.errors.coordinates?.x}
            helperText={form.formState.errors.coordinates?.x?.message}
            disabled={form.formState.isSubmitting}
            fullWidth
          />
          <TextField
            {...form.register('coordinates.y', { valueAsNumber: true })}
            type="number"
            label="Longitude"
            margin="dense"
            error={!!form.formState.errors.coordinates?.y}
            helperText={form.formState.errors.coordinates?.y?.message}
            disabled={form.formState.isSubmitting}
            fullWidth
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={form.formState.isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" form={formId} disabled={form.formState.isSubmitting}>
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
