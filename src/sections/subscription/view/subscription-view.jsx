import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Scrollbar from 'src/components/scrollbar';
import { fetchSubscriptions } from 'src/api/subscription';

const headLabel = [
  { id: 'id', label: 'ID' },
  { id: 'email', label: 'Email' },
  { id: 'firstName', label: 'First Name' },
  { id: 'lastName', label: 'Last Name' },
  { id: 'createdAt', label: 'Created At' },
  { id: 'updatedAt', label: 'Updated At' },
];

function exportToCSV(subscriptions) {
  const csvRows = [
    headLabel.map(h => h.label).join(','),
    ...subscriptions.map(sub =>
      [sub.id, sub.email, sub.firstName, sub.lastName, sub.createdAt, sub.updatedAt].join(',')
    ),
  ];
  const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'subscriptions.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function SubscriptionView() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchSubscriptions().then(data => setSubscriptions(data));
  }, []);

  const filteredSubscriptions = filter
    ? subscriptions.filter(sub =>
        sub.email.toLowerCase().includes(filter.toLowerCase()) ||
        sub.firstName.toLowerCase().includes(filter.toLowerCase()) ||
        sub.lastName.toLowerCase().includes(filter.toLowerCase())
      )
    : subscriptions;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Subscriptions</Typography>
        <Button variant="contained" color="primary" onClick={() => exportToCSV(filteredSubscriptions)}>
          Export CSV
        </Button>
      </Stack>
      <Card>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" p={2}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by name or email"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            sx={{ width: 300 }}
          />
        </Stack>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <TableHead>
                <TableRow>
                  {headLabel.map(col => (
                    <TableCell key={col.id}>{col.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headLabel.length} align="center">
                      No subscriptions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(sub => (
                      <TableRow key={sub.id} hover>
                        <TableCell>{sub.id}</TableCell>
                        <TableCell>{sub.email}</TableCell>
                        <TableCell>{sub.firstName}</TableCell>
                        <TableCell>{sub.lastName}</TableCell>
                        <TableCell>{sub.createdAt}</TableCell>
                        <TableCell>{sub.updatedAt}</TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        <TablePagination
          page={page}
          component="div"
          count={filteredSubscriptions.length}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={e => {
            setPage(0);
            setRowsPerPage(parseInt(e.target.value, 10));
          }}
        />
      </Card>
    </Container>
  );
}