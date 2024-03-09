import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { AddClientDialog } from './components/AddClientDialog';
import { CalculateRouteDialog } from './components/CalculateRouteDialog';
import { AddClientResult, getClients } from './services/api/clients';

const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Nome',
    width: 150,
  },
  {
    field: 'email',
    headerName: 'E-mail',
    width: 150,
  },
  {
    field: 'phone',
    headerName: 'Telefone',
    width: 150,
  },
  {
    field: 'coordinates',
    headerName: 'Coordenadas',
    width: 150,
    valueGetter: (params) => {
      const coordinates = params.row.coordinates;
      if (!coordinates) return '';
      return `${coordinates.x}, ${coordinates.y}`;
    },
  },
];


export function App() {
  const { enqueueSnackbar } = useSnackbar();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['clients'],
    queryFn: ({ signal }) => getClients({ signal}),
  });

  useEffect(() => {
    if (!query.error) return;
    enqueueSnackbar(query.error.message, { variant: 'error' });
  }, [query.error]);

  const handleSubmit = (data: AddClientResult) => {
    queryClient.setQueryData(
      ['clients'],
      (oldData: AddClientResult[] | undefined) => {
        if (!oldData) return [data];
        return oldData.concat([data]);
      },
    );
  };

  return (
    <>
      <Box bgcolor={(t) => t.palette.grey[100]} height="100dvh" pt={6}>
        <Container>
          <Box mb={2} display="flex" alignItems="center">
            <Typography variant="h4" mr="auto">
              Clientes
            </Typography>
            <Button variant="outlined" onClick={() => setRouteDialogOpen(true)} sx={{ mr: 2 }}>
              Calcular Rota
            </Button>
            <Button variant="contained" onClick={() => setAddDialogOpen(true)}>
              Adicionar
            </Button>
          </Box>
          <Paper>
            <DataGrid
              columns={columns}
              rows={query.data ?? []}
              autoHeight
              loading={query.isLoading}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true } }}
              disableColumnSelector
            />
          </Paper>
        </Container>
      </Box>

      {addDialogOpen && (
        <AddClientDialog
          onClose={() => setAddDialogOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      {routeDialogOpen && (
        <CalculateRouteDialog
          onClose={() => setRouteDialogOpen(false)}
        />
      )}
    </>
  );
}
