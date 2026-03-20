import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Media from './pages/Media';
import PastorWorks from './pages/PastorWorks';
import Groups from './pages/Groups';
import Offering from './pages/Offering';
import OfferingResult from './pages/OfferingResult';
import Contact from './pages/Contact';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/media" element={<Media />} />
          <Route path="/pastor-works" element={<PastorWorks />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/offering" element={<Offering />} />
          <Route path="/offering/result" element={<OfferingResult />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
