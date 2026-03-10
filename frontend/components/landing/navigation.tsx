"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Planner", href: "/planner" },
  { name: "Dashboard", href: "/dashboard" },
];

export function Navigation() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Home page: always glassy dark navbar
  // Other pages: transparent at top, solid on scroll
  const getNavbarClasses = () => {
    if (isHomePage) {
      return `fixed top-4 left-1/2 -translate-x-1/2 z-50 w-auto rounded-2xl transition-all duration-500 ${isScrolled
        ? "bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/30"
        : "bg-black/25 backdrop-blur-xl border border-white/[0.08] shadow-xl shadow-black/15"
        }`;
    }
    return `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || isMobileMenuOpen
      ? "bg-background/95 backdrop-blur-xl border-b border-border/50"
      : "bg-transparent"
      }`;
  };

  return (
    <header className={getNavbarClasses()}>
      <nav className={isHomePage ? "px-20" : "max-w-7xl mx-auto px-6 lg:px-8"}>
        <div className={`flex items-center h-16 ${isHomePage ? 'justify-between gap-20' : 'justify-between'}`}>
          {/* Logo */}
          <a href="/" className="flex items-center group">
            <span className="text-2xl font-bold tracking-tight text-white">
              BuildWise
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${isActive
                    ? "text-white bg-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                    }`}
                >
                  {link.name}
                  {isActive && isHomePage && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-400 rounded-full" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Desktop CTA - only on non-home pages */}
          {!isHomePage && (
            <div className="hidden md:flex items-center">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => (window.location.href = "/planner")}
              >
                Start Planning
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? "max-h-[500px] pb-4" : "max-h-0"
            }`}
        >
          <div className="flex flex-col gap-1 pt-2 border-t border-white/[0.06]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                    ? "text-white bg-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                    }`}
                >
                  {link.name}
                </a>
              );
            })}
            <div className="pt-3 mt-1 border-t border-white/[0.06]">
              <Button
                className={`w-full ${isHomePage
                  ? "bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                onClick={() => (window.location.href = "/planner")}
              >
                Start Planning
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
