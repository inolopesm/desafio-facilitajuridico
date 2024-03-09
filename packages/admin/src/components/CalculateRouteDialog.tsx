import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useQuery } from '@tanstack/react-query';
import { getClientsRoute } from '../services/api/clients';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';

interface CalculateRouteDialogProps {
  onClose: () => void;
}

export function CalculateRouteDialog({ onClose }: CalculateRouteDialogProps) {
  const { enqueueSnackbar } = useSnackbar();

  const query = useQuery({
    queryKey: ['clients', 'route'],
    queryFn: ({ signal }) => getClientsRoute({ signal }),
  });

  useEffect(() => {
    if (!query.error) return;
    enqueueSnackbar(query.error.message, { variant: 'error' });
  }, [query.error]);

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Calcular Rota</DialogTitle>
      <DialogContent>
        <List>
          {query.data?.map((client, i) => (
            <ListItem key={client.id}>
              <ListItemText primary={`${i + 1}. ${client.name}`} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
