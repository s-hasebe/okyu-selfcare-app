import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TsuboList from './pages/TsuboList';
import TsuboDetail from './pages/TsuboDetail';
import Calibration from './pages/Calibration';
import ARGuide from './pages/ARGuide';
import Timer from './pages/Timer';
import RecordInput from './pages/RecordInput';
import History from './pages/History';
import SafetyDisclaimer from './components/SafetyDisclaimer';
import { isSafetyAgreed, setSafetyAgreed } from './utils/storage';

export default function App() {
  const [safetyAgreed, setSafetyAgreedState] = useState(isSafetyAgreed);

  const handleAgree = () => {
    setSafetyAgreed();
    setSafetyAgreedState(true);
  };

  return (
    <BrowserRouter>
      {/* 安全同意モーダル（未同意時のみ表示） */}
      {!safetyAgreed && <SafetyDisclaimer onAgree={handleAgree} />}

      <Routes>
        <Route path="/"                      element={<Home />} />
        <Route path="/tsubo"                 element={<TsuboList />} />
        <Route path="/tsubo/:id"             element={<TsuboDetail />} />
        <Route path="/calibration/:tsuboId"  element={<Calibration />} />
        <Route path="/calibration"           element={<Calibration />} />
        <Route path="/ar/:tsuboId"           element={<ARGuide />} />
        <Route path="/timer/:tsuboId"        element={<Timer />} />
        <Route path="/record/:tsuboId"       element={<RecordInput />} />
        <Route path="/history"               element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}
