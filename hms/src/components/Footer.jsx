import React from 'react';
import { FaHospital, FaClinicMedical, FaUserMd, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Footer.css';
import logoHms from '../assets/hms2.png'

const Footer = () => {
  const solutions = [
    { name: 'For Hospitals', path: '/solutions/hospitals', icon: <FaHospital /> },
    { name: 'For Clinics', path: '/solutions/clinics', icon: <FaClinicMedical /> },
    { name: 'For Doctors', path: '/solutions/doctors', icon: <FaUserMd /> }
  ];

  const company = [
    { name: 'About Us', path: '/about' },
    // { name: 'Careers', path: '/careers' },
    { name: 'Blog', path: '/blog' },
    { name: 'Press', path: '/press' }
  ];

  const resources = [
    { name: 'Help Center', path: '/help' },
    // { name: 'API Documentation', path: '/api' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' }
  ];

  return (
    <footer className="in-footer">
      <div className="in-container">
        <div className="in-footer-grid">
          <div className="in-footer-col in-footer-about">
            <div className="in-footer-logo">
              {/* <span className="in-logo-icon"><FaHospital /></span> */}
              <img src={logoHms} alt="hms" width={100} className='imgLogoHms'/>
              <span className="in-logo-text"> | <span className="in-logo-highlight">HMS</span></span>
            </div>
            <p className="in-footer-about-text">
              Transforming healthcare administration with cutting-edge technology solutions for hospitals, clinics, and medical professionals.
            </p>
            <div className="in-footer-social">
              <a href="#" aria-label="Facebook"><FaFacebook /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </div>

          <div className="in-footer-col">
            <h3 className="in-footer-title">Solutions</h3>
            <ul className="in-footer-links">
              {solutions.map((item, index) => (
                <li key={index}>
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="in-footer-col">
            <h3 className="in-footer-title">Company</h3>
            <ul className="in-footer-links">
              {company.map((item, index) => (
                <li key={index}>
                  <Link to={item.path}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="in-footer-col">
            <h3 className="in-footer-title">Resources</h3>
            <ul className="in-footer-links">
              {resources.map((item, index) => (
                <li key={index}>
                  <Link to={item.path}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="in-footer-col in-footer-contact">
            <h3 className="in-footer-title">Contact Us</h3>
            <ul className="in-footer-contact-info">
              <li>
                <FaPhoneAlt />
                <a href="tel:+18001234567">+91 94913 01258</a>
              </li>
              <li>
                <FaEnvelope />
                <a href="mailto:info@medicarehms.com">tsarit@tsaritservices.com</a>
              </li>
              <li>
                <FaMapMarkerAlt />
                <p>12-203/745, CHURCH STREET, NAKKABANDA,<br />Punganur, Madanapalle, Chittoor- 517247, <br />Andhra Pradesh </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="in-footer-bottom">
          <p>&copy; {new Date().getFullYear()} MediCare HMS. All rights reserved.</p>
          <div className="in-footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms">Terms of Service</Link>
            <span>•</span>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;