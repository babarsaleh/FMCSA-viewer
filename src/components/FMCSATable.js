// src/components/FMCSATable.js
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, Paper, CircularProgress, Box, Typography } from '@mui/material';
import { loadData } from '../utils/loadData';

const columns = [
  'created_dt',
  'data_source_modified_dt',
  'entity_type',
  'operating_status',
  'legal_name',
  'dba_name',
  'physical_address',
  'phone',
  'usdot_number',
  'mc_mx_ff_number',
  'power_units',
  'out_of_service_date'
];

const columnLabels = {
  created_dt: 'Created_DT',
  data_source_modified_dt: 'Modifed_DT',
  entity_type: 'Entity',
  operating_status: 'Operating status',
  legal_name: 'Legal name',
  dba_name: 'DBA name',
  physical_address: 'Physical address',
  phone: 'Phone',
  usdot_number: 'DOT',
  mc_mx_ff_number: 'MC/MX/FF',
  power_units: 'Power units',
  out_of_service_date: 'Out of service date',
};

const FMCSATable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadData();
        console.log("Fetched Data:", data); 
        setData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setFilteredData(
      data.filter(row =>
        columns.some(column =>
          row[column] && row[column].toString().toLowerCase().includes(filterText.toLowerCase())
        )
      )
    );
  }, [filterText, data]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  return (
    <Paper>
      <TextField
        label="Filter"
        variant="outlined"
        fullWidth
        margin="normal"
        onChange={handleFilterChange}
      />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column}>{columnLabels[column]}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Box display="flex" alignItems="center" justifyContent="center" height="100px">
                    <Box display="flex" alignItems="center">
                      <CircularProgress />
                      <Typography
                        variant="h6"
                        color="textSecondary"
                        style={{ marginLeft: 16 }}
                      >
                        Loading Data...
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column}>{row[column] || 'N/A'}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default FMCSATable;
