import React from 'react';
import FMCSATable from './components/FMCSATable';
import { Container, Typography } from '@mui/material';

function App() {
  return (
    <Container 
    sx={{ 
        maxWidth: '1660px !important', // Set the maximum width to 1660px
        width: '100%',      // Make the container fluid
        paddingLeft: '16px',
        paddingRight: '16px'
      }}
      >
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        FMCSA Viewer
      </Typography>
      <FMCSATable />
    </Container>
  );
}

export default App;
