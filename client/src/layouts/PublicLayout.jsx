import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const PublicLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-paper dark:bg-dark-950">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
