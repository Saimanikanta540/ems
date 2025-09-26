
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Search, User, Edit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`bg-cream border-b border-light-gray/30 sticky top-0 z-50 ${isScrolled ? 'shadow-sm' : ''}`}>
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-serif font-bold text-navy mr-1">Story</span>
            <span className="text-2xl font-serif font-bold text-teal">Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              <Link to="/" className="nav-link font-medium">Home</Link>
              <Link to="/posts" className="nav-link font-medium">Articles</Link>
              <Link to="/about" className="nav-link font-medium">About</Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="icon" className="rounded-full text-navy">
                <Search size={18} />
              </Button>
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-navy hidden lg:inline">Hello, {user.name}</span>
                  <Button variant="outline" asChild className="bg-white border-teal text-teal hover:bg-teal/10">
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" onClick={logout} className="text-navy">Logout</Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login" className="flex items-center text-navy">
                      <User size={18} className="mr-2" />
                      Login
                    </Link>
                  </Button>
                  <Button asChild className="bg-teal hover:bg-teal/90 text-white">
                    <Link to="/register">Sign Up</Link>
                  </Button>
                </>
              )}
              <Button variant="outline" asChild className="bg-white border-teal text-teal hover:bg-teal/10">
                <Link to="/write" className="flex items-center">
                  <Edit size={18} className="mr-2" />
                  Write
                </Link>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-navy">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-cream py-4 px-4 border-t border-light-gray/30 animate-fade-in">
          <div className="flex flex-col space-y-3">
            <Link 
              to="/" 
              className="py-2 px-3 rounded-md hover:bg-light-gray/50 transition-colors text-navy"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/posts" 
              className="py-2 px-3 rounded-md hover:bg-light-gray/50 transition-colors text-navy"
              onClick={() => setIsMenuOpen(false)}
            >
              Articles
            </Link>
            <Link 
              to="/about" 
              className="py-2 px-3 rounded-md hover:bg-light-gray/50 transition-colors text-navy"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/write" 
              className="py-2 px-3 rounded-md bg-teal/10 text-teal flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Edit size={18} className="mr-2" />
              Write an Article
            </Link>
            <hr className="border-light-gray/30 my-2" />
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              </Button>
              <Button className="flex-1 bg-teal hover:bg-black/90 text-black" asChild>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
