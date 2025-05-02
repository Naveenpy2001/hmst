import { useState, useEffect } from 'react';
import { FaArrowRight, FaArrowLeft, FaHospital, FaUserMd, FaNotesMedical, FaCalendarAlt, FaClinicMedical, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { FiCheckCircle } from 'react-icons/fi';
import './Main.css';
import Footer from '../components/Footer';
import Pricing from './components/Pricing';
import Navbar from '../components/Navbar';
import hmsLogo from '../assets/hms.png'

const HomePage = () => {
  // Image slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState('');
  
  // Slides data
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Advanced Healthcare Solutions',
      description: 'Comprehensive hospital management for modern healthcare providers'
    },
    {
      image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Patient-Centered Care',
      description: 'Streamlined workflows for better patient experiences'
    },
    {
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Integrated Management System',
      description: 'All your hospital operations in one platform'
    }
  ];

  // Auto slide change
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Manual slide navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Services data
  const services = [
    {
      icon: <FaHospital />,
      title: 'Patient Management',
      description: 'Comprehensive patient records and history management'
    },
    {
      icon: <FaUserMd />,
      title: 'Doctor Scheduling',
      description: 'Efficient doctor appointment and time management'
    },
    {
      icon: <FaNotesMedical />,
      title: 'Electronic Health Records',
      description: 'Secure digital records accessible anytime, anywhere'
    },
    {
      icon: <FaCalendarAlt />,
      title: 'Appointment System',
      description: 'Automated scheduling with reminders for patients'
    },
    {
      icon: <FaClinicMedical />,
      title: 'Clinic Management',
      description: 'Complete outpatient department management'
    },
    {
      icon: <FaHospital />,
      title: 'Billing & Invoicing',
      description: 'Automated billing with multiple payment options'
    }
  ];

  // Features data
  const features = [
    "Cloud-based solution accessible from anywhere",
    "HIPAA compliant data security",
    "Real-time analytics and reporting",
    "Mobile app for doctors and patients",
    "Inventory and pharmacy management",
    "Multi-branch hospital support",
    "Customizable workflows",
    "24/7 technical support"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribed with email:', email);
    setEmail('');
    alert('Thank you for subscribing to our newsletter!');
  };

  return (
    <>
    <Navbar />
      <div className="in-home-page">
        {/* Hero Slider Section */}
        <section className="in-hero-slider">
          <div className="in-slider-container">
            {slides.map((slide, index) => (
              <div 
                key={index}
                className={`in-slide ${index === currentSlide ? 'in-active' : ''}`}
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="in-overlay"></div>
                <div className="in-slide-content">
                  <h1>{slide.title}</h1>
                  <p>{slide.description}</p>
                  <div className="in-hero-buttons">
                    <button className="in-btn in-btn-primary">Get Started</button>
                    <button className="in-btn in-btn-outline">Learn More</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="in-slider-nav in-prev" onClick={prevSlide}>
            <FaArrowLeft />
          </button>
          <button className="in-slider-nav in-next" onClick={nextSlide}>
            <FaArrowRight />
          </button>
          <div className="in-slider-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`in-dot ${index === currentSlide ? 'in-active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </section>

        {/* About HMS Section */}
        <section className="in-about-section">
          <div className="in-container">
            <div className="in-about-content">
              <div className="in-about-text">
                <h2>About Our Hospital Management System</h2>
                <p className="in-subtitle">
                  Transforming healthcare administration with cutting-edge technology
                </p>
                <p>
                  Our Hospital Management System (HMS) is a comprehensive software solution designed to 
                  streamline healthcare operations, improve patient care, and enhance administrative efficiency.
                  With over a decade of experience in healthcare technology, we've developed a robust platform
                  that integrates all aspects of hospital management into one seamless system.
                </p>
                <div className="in-features-list">
                  {features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="in-feature-item">
                      <FiCheckCircle className="in-feature-icon" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="in-about-image">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Doctors using HMS" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="in-stats-section">
          <div className="in-container">
            <div className="in-stats-grid">
              <div className="in-stat-item">
                <h3>100+</h3>
                <p>Hospitals Trust Us</p>
              </div>
              <div className="in-stat-item">
                <h3>24/7</h3>
                <p>Support Available</p>
              </div>
              <div className="in-stat-item">
                <h3>99.9%</h3>
                <p>Uptime Guarantee</p>
              </div>
              <div className="in-stat-item">
                <h3>50K+</h3>
                <p>Patients Daily</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="in-services-section">
          <div className="in-container">
            <div className="in-section-header">
              <h2>Our Comprehensive Services</h2>
              <p className="in-section-subtitle">
                Designed to meet all your hospital management needs with cutting-edge technology
              </p>
            </div>
            <div className="in-services-grid">
              {services.map((service, index) => (
                <div key={index} className="in-service-card">
                  <div className="in-service-icon">{service.icon}</div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <a href="#" className="in-learn-more">Learn more →</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <Pricing />

        {/* Testimonials Section */}
        <section className="in-testimonials-section">
          <div className="in-container">
            <div className="in-section-header">
              <h2>What Our Clients Say</h2>
              <p className="in-section-subtitle">
                Trusted by healthcare providers across the country
              </p>
            </div>
            <div className="in-testimonials-grid">
              <div className="in-testimonial-card">
                <div className="in-testimonial-content">
                  <p>"The HMS transformed our hospital operations. Patient wait times reduced by 40% and administrative errors dropped significantly."</p>
                </div>
                <div className="in-testimonial-author">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Dr. John Smith" />
                  <div>
                    <h4>Dr. John Smith</h4>
                    <p>Medical Director, City General Hospital</p>
                  </div>
                </div>
              </div>
              <div className="in-testimonial-card">
                <div className="in-testimonial-content">
                  <p>"Implementation was seamless and the support team was excellent. Our staff adapted quickly to the new system."</p>
                </div>
                <div className="in-testimonial-author">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Sarah Johnson" />
                  <div>
                    <h4>Sarah Johnson</h4>
                    <p>Hospital Administrator, Riverside Clinic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}


        {/* Contact Section */}
        <section className="in-contact-section">
          <div className="in-container">
            <div className="in-section-header">
              <h2>Contact Us</h2>
              <p className="in-section-subtitle">
                Get in touch with our team for more information
              </p>
            </div>
            <div className="in-contact-content">
              <div className="in-contact-info">
                <div className="in-contact-item">
                  <FaPhone className="in-contact-icon" />
                  <div>
                    <h3>Phone</h3>
                    <p>+91 94913 01258</p>
                  </div>
                </div>
                <div className="in-contact-item">
                  <FaEnvelope className="in-contact-icon" />
                  <div>
                    <h3>Email</h3>
                    <p>tsarit@tsaritservices.com</p>
                  </div>
                </div>
                <div className="in-contact-item">
                  <FaMapMarkerAlt className="in-contact-icon" />
                  <div>
                    <h3>Address</h3>
                    <p>12-203/745, CHURCH STREET, NAKKABANDA,<br />Punganur, Madanapalle, Chittoor- 517247, <br />Andhra Pradesh </p>
                  </div>
                </div>
              </div>
              <form className="in-contact-form">
                <div className="in-form-group">
                  <input type="text" placeholder="Your Name" required />
                  <input type="email" placeholder="Your Email" required />
                </div>
                <input type="text" placeholder="Subject" required />
                <textarea placeholder="Your Message" rows="5" required></textarea>
                <button type="submit" className="in-btn in-btn-primary">Send Message</button>
              </form>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="in-cta-section">
          <div className="in-container">
            <h2>Ready to Transform Your Hospital Management?</h2>
            <p>
              Join hundreds of healthcare providers who trust our system to streamline their operations
              and deliver better patient care.
            </p>
            <div className="in-cta-buttons">
              <button className="in-btn in-btn-primary">Request Demo</button>
              <button className="in-btn in-btn-outline">Contact Sales</button>
            </div>
          </div>
        </section>
      </div>
      <section className="in-newsletter-section">
          <div className="in-container">
            <div className="in-newsletter-content">
              <div className="in-newsletter-text">
                <h2>Stay Updated</h2>
                <p>Subscribe to our newsletter for the latest updates and healthcare technology insights.</p>
              </div>
              <form onSubmit={handleSubmit} className="in-newsletter-form">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <button type="submit" className="in-btn btn-outline" style={{color:'#fff'}}>Subscribe</button>
              </form>
            </div>
          </div>
        </section>
      <Footer />
    </>
  );
};

export default HomePage;