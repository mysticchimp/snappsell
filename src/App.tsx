import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ImageUploader from './components/ImageUploader';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <ImageUploader />
      </Container>
    </ThemeProvider>
  );
}

export default App;
