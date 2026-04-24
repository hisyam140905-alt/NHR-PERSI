import { Link, useLocation, useNavigate, useOutlet } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useData } from "../context/DataContext";
import { Toaster } from "./ui/sonner";

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();
  const { isAdmin, adminLogout, currentHospital, hospitalLogout } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Berita", to: "/news" },
    { label: "Rankings", to: "/rankings" },
    { label: "Events", to: "/events" },
    { label: "Metodologi", to: "/methodology" },
  ];

  const isLoggedIn = isAdmin || currentHospital;
  const userName = isAdmin
    ? "Admin PERSI"
    : currentHospital?.hospitalName || "";

  const handleLogout = () => {
    if (isAdmin) adminLogout();
    if (currentHospital) hospitalLogout();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-[700] text-[#1E3A8A] leading-tight">
                  NHR PERSI
                </div>
                <div className="text-[10px] text-gray-500 leading-tight">
                  National Hospital Ranking
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-2 relative">
              {navLinks.map((link) => {
                const active = isActive(link.to) && (link.to === "/" ? location.pathname === "/" : true);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-4 py-2 rounded-lg text-sm font-[500] transition-colors z-10 ${
                      active ? "text-[#1E3A8A]" : "text-gray-600 hover:text-[#1E3A8A]"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="active-nav-pill"
                        className="absolute inset-0 bg-blue-50/80 rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Link
                to="/hospital-login"
                className="hidden lg:inline-flex text-sm font-[600] px-5 py-2.5 bg-[#0D9488] text-white rounded-lg hover:bg-[#0b7f75] transition-colors"
              >
                Portal Rumah Sakit
              </Link>

              {/* User Menu */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-[#1E3A8A] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-[500] text-gray-700 hidden md:inline max-w-[120px] truncate">
                      {userName}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-50 py-2">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-[600] text-gray-900 truncate">
                            {userName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {isAdmin ? "Administrator" : "Rumah Sakit"}
                          </p>
                        </div>
                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Settings className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        )}
                        {isAdmin && (
                          <Link
                            to="/siap-persi/admin/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Shield className="w-4 h-4" />
                            NHR PERSI Review
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/admin/login"
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <User className="w-4 h-4 text-gray-500" />
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="lg:hidden overflow-hidden"
              >
                <div className="pt-4 pb-2 border-t border-gray-100 mt-3">
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-2.5 rounded-lg text-sm font-[500] ${
                          isActive(link.to)
                            ? "text-[#1E3A8A] bg-blue-50"
                            : "text-gray-600 hover:bg-gray-50 bg-transparent transition-colors"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <Link
                      to="/hospital-login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2.5 rounded-lg text-sm font-[600] text-[#0D9488]"
                    >
                      Portal Rumah Sakit
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.main
          // We use pathname as key so framer-motion triggers on route change
          key={location.pathname}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex-grow flex flex-col"
        >
          {outlet}
        </motion.main>
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-0">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#1E3A8A] rounded flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-[700] text-white">NHR PERSI</span>
              </div>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                Perhimpunan Rumah Sakit Seluruh Indonesia. Platform penilaian
                kualitas rumah sakit berbasis data untuk Indonesia yang lebih
                sehat.
              </p>
            </div>
            <div>
              <h4 className="font-[600] text-sm mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/news"
                    className="hover:text-white transition-colors"
                  >
                    Berita
                  </Link>
                </li>
                <li>
                  <Link
                    to="/rankings"
                    className="hover:text-white transition-colors"
                  >
                    Rankings
                  </Link>
                </li>
                <li>
                  <Link
                    to="/events"
                    className="hover:text-white transition-colors"
                  >
                    Events
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-[600] text-sm mb-4">Assessment</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link
                    to="/methodology"
                    className="hover:text-white transition-colors"
                  >
                    Metodologi
                  </Link>
                </li>
                <li>
                  <Link
                    to="/hospital-login"
                    className="hover:text-white transition-colors"
                  >
                    Portal Rumah Sakit
                  </Link>
                </li>
                <li>
                  <Link
                    to="/siap-persi/overview"
                    className="hover:text-white transition-colors"
                  >
                    NHR PERSI Overview
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-[600] text-sm mb-4">Kontak</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a
                    href="mailto:persi@persi.or.id"
                    className="hover:text-white transition-colors"
                  >
                    persi@persi.or.id
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    +62 21 8611 262
                  </a>
                </li>
                <li className="text-gray-500 leading-relaxed">
                  Jl. Boulevard Artha Gading, Kelapa Gading, Jakarta Utara
                  14240
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} PERSI - Perhimpunan Rumah Sakit
            Seluruh Indonesia. All rights reserved.
          </div>
        </div>
      </footer>

      {/* NEW: Global Toaster */}
      <Toaster position="top-right" richColors theme="light" />
    </div>
  );
}
 