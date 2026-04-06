import { BrowserRouter, Routes, Route } from 'react-router';
import { Navbar } from './components/Navbar/NavBar';
import { UploadBox } from './components/UploadBox/UploadBox';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Navbar />
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<h1>Bienvenido al Panel de Control</h1>} />
            <Route path="/upload" element={<UploadBox />} />
          </Routes>
        </main>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;