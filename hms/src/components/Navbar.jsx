import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaTimes,
  FaHospital,
  FaUserMd,
  FaPhoneAlt,
  FaClinicMedical,
} from "react-icons/fa";
import { HiOutlineChevronDown } from "react-icons/hi";
import { Link } from "react-router-dom";
import "./Navbar.css";
import hmsLogo from '../assets/hms2.png'


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      document.body.style.overflow = "auto";
    } else {
      document.body.style.overflow = "hidden";
    }
  };

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    {
      name: "Solutions",
      submenu: [
        {
          name: "For Hospitals",
          path: "/solutions/hospitals",
          icon: <FaHospital />,
        },
        {
          name: "For Clinics",
          path: "/solutions/clinics",
          icon: <FaClinicMedical />,
        },
        { name: "For Doctors", path: "/solutions/doctors", icon: <FaUserMd /> },
      ],
    },
    { name: "Features", path: "/features" },
    { name: "Pricing", path: "/pricing" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className={`in-navbar ${isScrolled ? "in-scrolled" : ""}`}>
      <div className="nav-container">
        <div className="in-navbar-logo">
          <Link to="/">
            {/* <span className="in-logo-icon">
              <FaHospital />
            </span> */}
            <img src={hmsLogo} alt="hms" width={100} className="imgLogoHms"/>
            <span className="in-logo-text">
               | <span className="in-logo-highlight">H</span><span className="highlite">ospital</span><span className="in-logo-highlight">M</span><span className="highlite">anagement</span>
               <span className="in-logo-highlight">S</span><span className="highlite">oftware</span>
            </span>
          </Link>
        </div>

        <div className={`in-nav-links ${isOpen ? "in-active" : ""}`}>
          <ul>
            {navLinks.map((link, index) => (
              <li key={index}>
                {link.submenu ? (
                  <div
                    className="in-nav-item in-has-dropdown"
                    onClick={() => toggleDropdown(index)}
                  >
                    <span>{link.name}</span>
                    <HiOutlineChevronDown
                      className={`in-dropdown-icon ${
                        openDropdown === index ? "in-rotate" : ""
                      }`}
                    />
                    <div
                      className={`in-dropdown-menu ${
                        openDropdown === index ? "in-show" : ""
                      }`}
                    >
                      {link.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className="in-dropdown-item"
                        >
                          {subItem.icon}
                          <span>{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    to={link.path}
                    className="in-nav-item"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                )}
              </li>
            ))}
            <div className="auth-buttons">
              <Link to="/login" className="btn-nav btn-filled">
                Login
              </Link>
              <Link to="/register" className="btn-nav btn-outline">
                Register
              </Link>
            </div>
          </ul>

          {/* <div className="in-nav-cta">
            <a href="tel:+18001234567" className="in-phone-link">
              <FaPhoneAlt className="in-phone-icon" />
              <span>+1 (800) 123-4567</span>
            </a>
            <Link to="/demo" className="in-btn in-btn-primary">
              Request Demo
            </Link>
          </div> */}
        </div>

        <div className="in-mobile-toggle" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
