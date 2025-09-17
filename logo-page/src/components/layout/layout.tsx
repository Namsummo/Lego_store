"use client";

import React, { useState, useEffect } from "react";
import Header from "./(components)/(pages)/Header";
import Footer from "./(components)/(pages)/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Nếu scroll xuống dưới và vượt quá 100px thì ẩn header
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } 
      // Nếu scroll lên trên thì hiện header
      else if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div 
        className={`fixed top-0 left-0 right-0 z-[2000] transition-transform duration-300 ease-in-out ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <Header />
      </div>
      <main className="pt-24">{children}</main>
      <Footer />
    </div>
  );
}
