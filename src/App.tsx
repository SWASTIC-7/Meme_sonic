import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Landing from './Pages/LandingPage/Landing';
import Create from './Pages/CreateToken/CreateToken';
import Buy from './Pages/buytoken/BuyToken';
import CreatorPlatform from './Pages/CreatorPlatform/CreatorPlatform';
import TraderPlatform from './Pages/TraderPlatform/TraderPlatform';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<Create />} />
        <Route path="/buy" element={<Buy />} />
        <Route path="/creatorplatform" element={<CreatorPlatform />} />
        <Route path="/traderplatform" element={<TraderPlatform />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
