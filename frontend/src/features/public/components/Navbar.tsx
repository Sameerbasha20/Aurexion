import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown, ArrowUpRight } from "lucide-react";
import { serviceCategories, servicesData } from "../../../data/services";
import { industriesData } from "../../../data/industries";

/* ─── Mega Dropdown: Services ────────────────────────────────────────────── */
const ServicesDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="nav-mega-panel">
    <div className="nav-mega-inner">
      {serviceCategories.map((cat) => {
        const services = servicesData.filter((s) => s.category === cat.name);
        return (
          <div key={cat.id} className="nav-mega-col">
            <Link
              href="/services"
              className="nav-mega-cat"
              onClick={onClose}
            >
              <span className="nav-mega-num">{cat.id}</span>
              <span className="nav-mega-cat-title">{cat.name}</span>
            </Link>
            <ul>
              {services.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="nav-mega-link"
                    onClick={onClose}
                  >
                    <ArrowUpRight size={12} className="nav-mega-arrow" />
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
    <div className="nav-mega-footer">
      <Link href="/services" className="nav-mega-all" onClick={onClose}>
        VIEW ALL 32 SERVICES <ArrowUpRight size={14} />
      </Link>
    </div>
  </div>
);

/* ─── Dropdown: Industries ───────────────────────────────────────────────── */
const IndustriesDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="nav-ind-panel">
    <div className="nav-ind-grid">
      {industriesData.map((ind: any) => (
        <Link
          key={ind.id}
          href={`/industries/${ind.slug}`}
          className="nav-ind-item"
          onClick={onClose}
        >
          <span className="nav-ind-num">{ind.id}</span>
          <span className="nav-ind-name">{ind.name}</span>
        </Link>
      ))}
    </div>
    <div className="nav-mega-footer">
      <Link href="/industries" className="nav-mega-all" onClick={onClose}>
        VIEW ALL INDUSTRIES <ArrowUpRight size={14} />
      </Link>
    </div>
  </div>
);

/* ─── Main Navbar ────────────────────────────────────────────────────────── */
export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"services" | "industries" | null>(null);
  const [location] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (menu: "services" | "industries") => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  const closeAll = () => {
    setActiveDropdown(null);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleHomeClick = (e: React.MouseEvent) => {
    closeAll();
    if (location === "/") {
      e.preventDefault();
      const heroEl = document.getElementById("top");
      if (heroEl) {
        heroEl.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const navLinks = [
    { name: "About", path: "/about" },
    { name: "Case Studies", path: "/case-studies" },
    { name: "Careers", path: "/careers" },
    { name: "Insights", path: "/insights" },
  ];

  return (
    <header className="aurexion-nav" ref={dropdownRef}>
      <div className="aurexion-nav-inner">
        {/* Logo */}
        <Link href="/" className="nav-logo" onClick={handleHomeClick}>
          <img src="/manus-storage/aurexion-mark_e8f9e729.png" alt="Aurexion" className="nav-logo-mark" />
          <span className="nav-logo-text">AUREXION</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-desktop">
          <Link
            href="/"
            className={`nav-link ${location === "/" ? "nav-link-active" : ""}`}
            onClick={handleHomeClick}
          >
            HOME
          </Link>

          {/* Services mega */}
          <div
            className="nav-item-wrap"
            onMouseEnter={() => handleMouseEnter("services")}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href="/services"
              className={`nav-link nav-link-drop ${location.startsWith("/services") || activeDropdown === "services" ? "active" : ""}`}
              onClick={closeAll}
            >
              SERVICES <ChevronDown size={13} className={`nav-chevron ${activeDropdown === "services" ? "open" : ""}`} />
            </Link>
            {activeDropdown === "services" && (
              <div onMouseEnter={() => handleMouseEnter("services")} onMouseLeave={handleMouseLeave}>
                <ServicesDropdown onClose={closeAll} />
              </div>
            )}
          </div>

          {/* Industries dropdown */}
          <div
            className="nav-item-wrap"
            onMouseEnter={() => handleMouseEnter("industries")}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href="/industries"
              className={`nav-link nav-link-drop ${location.startsWith("/industries") || activeDropdown === "industries" ? "active" : ""}`}
              onClick={closeAll}
            >
              INDUSTRIES <ChevronDown size={13} className={`nav-chevron ${activeDropdown === "industries" ? "open" : ""}`} />
            </Link>
            {activeDropdown === "industries" && (
              <div onMouseEnter={() => handleMouseEnter("industries")} onMouseLeave={handleMouseLeave}>
                <IndustriesDropdown onClose={closeAll} />
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={`nav-link ${location === link.path ? "nav-link-active" : ""}`}
              onClick={closeAll}
            >
              {link.name.toUpperCase()}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="nav-ctas">
          <Link href="/login" className="nav-cta-primary" onClick={closeAll}>
            LOGIN
          </Link>
          <Link href="/rfp" className="nav-cta-primary" onClick={closeAll}>
            SUBMIT RFP
          </Link>
          <Link href="/estimator" className="nav-cta-primary" onClick={closeAll}>
            ESTIMATE PROJECT <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="nav-mobile-panel">
          <div className="nav-mobile-section">
            <Link href="/services" className="nav-mobile-heading block" onClick={closeAll}>SERVICES</Link>
            {serviceCategories.map((cat) => (
              <Link
                key={cat.id}
                href="/services"
                className="nav-mobile-link"
                onClick={closeAll}
              >
                <span className="nav-mobile-num">{cat.id}</span>
                {cat.name}
              </Link>
            ))}
          </div>
          <div className="nav-mobile-section">
            <Link href="/industries" className="nav-mobile-heading block" onClick={closeAll}>INDUSTRIES</Link>
            {industriesData.map((ind: any) => (
              <Link
                key={ind.id}
                href={`/industries/${ind.slug}`}
                className="nav-mobile-link"
                onClick={closeAll}
              >
                <span className="nav-mobile-num">{ind.id}</span>
                {ind.name}
              </Link>
            ))}
          </div>
          <div className="nav-mobile-section">
            <Link
              href="/"
              className={`nav-mobile-link font-semibold ${location === "/" ? "text-[#63f5e8]" : ""}`}
              onClick={handleHomeClick}
            >
              HOME
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className="nav-mobile-link"
                onClick={closeAll}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="nav-mobile-ctas">
            <Link href="/login" className="nav-cta-primary w-full text-center" onClick={closeAll} style={{ marginBottom: "0.75rem" }}>
              LOGIN
            </Link>
            <Link href="/rfp" className="nav-cta-primary w-full text-center" onClick={closeAll} style={{ marginBottom: "0.75rem" }}>
              SUBMIT RFP
            </Link>
            <Link href="/estimator" className="nav-cta-primary w-full text-center" onClick={closeAll}>
              ESTIMATE PROJECT <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
