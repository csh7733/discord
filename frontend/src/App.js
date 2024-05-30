import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Test from './components/Test';

// 인증된 사용자만 접근 가능한 라우트 컴포넌트
const PrivateRoute = ({ authenticated, element }) => {
  return authenticated ? element : <Navigate to="/login" />;
};

function App() {
  const isAuthenticated = localStorage.getItem('token') ? true : false;

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/test" element={<Test />} />
    </Routes>
  );
}

export default App;

