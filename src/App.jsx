import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { BrowsePage } from './pages/BrowsePage';
import { CoursePage } from './pages/CoursePage';
import { HomePage } from './pages/HomePage';
import { UploadPage } from './pages/UploadPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/browse' element={<BrowsePage />} />
        <Route path='/course/:courseCode' element={<CoursePage />} />
        <Route path='/upload' element={<UploadPage />} />
      </Routes>
    </BrowserRouter>
  );
}
