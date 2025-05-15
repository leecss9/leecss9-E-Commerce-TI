import Header from './Header';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet /> {/* Aquí se renderizarán las páginas según la ruta */}
      </main>
    </>
  );
};

export default Layout;
