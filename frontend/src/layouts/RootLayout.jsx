import React from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

const RootLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
