import React from 'react';
import Sidebar from './Sidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
