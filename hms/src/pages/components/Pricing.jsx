import React from "react";
import { FaCheck, FaHospital, FaUserMd, FaFileInvoice, FaUserInjured, FaCalendarAlt, FaEnvelope, FaClinicMedical, FaRegStar, FaCrown } from "react-icons/fa";
import { IoMdPricetag } from "react-icons/io";
import { Link } from "react-router-dom";
import './Pricing.css';

const Pricing = () => {
  return (
    <section className="in-pricing" id="pricing">
      <div className="in-container">
        <h2 className="in-pricing-heading">Our Pricing Plans</h2>
        <p className="in-section-subtitle">
          Flexible options for hospitals of all sizes. No hidden fees.
        </p>
        
        <div className="in-pricing-container">
          {/* Primary Hospital Plan */}
          <div className="in-pricing-plan in-popular-plan">
            <div className="in-plan-badge">
              <FaRegStar className="in-badge-icon" />
              <span>Most Popular</span>
            </div>
            <div className="in-plan-details">
              <div className="in-flexCenterImg">
                <div className="in-plan-icon">
                  <FaHospital />
                </div>
                <h1 className="in-plan-title">Primary Hospital</h1>
                <p className="in-plan-description">Perfect for small clinics and primary care centers</p>
              </div>
              <div className="in-price-container">
                <p className="in-price-strike">
                  <strike>₹35</strike>
                  <span className="in-save"> Save 30%</span>
                </p>
                <h2 className="in-price">₹20.00<small>/patient</small></h2>
                <p className="in-charge-det">We will charge per patient visit</p>
              </div>
            </div>
            <div className="in-features-col">
              <h1 className="in-features-title">Key Features</h1>
              <div className="in-features-list">
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  Single Dashboard
                </span>
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  Doctor Management
                </span>
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  Accounts Management
                </span>
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  Patient Registration
                </span>
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  Patient Tracking
                </span>
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  Basic Reporting
                </span>
                <div className="in-bottom-btn">
                  <Link to='/register'>
                  <button className="in-btn in-btn-primary in-demo-btn">
                    Get Started Now
                  </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Hospital Plan */}
          <div className="in-pricing-plan">
            <div className="in-plan-details">
              <div className="in-flexCenterImg">
                <div className="in-plan-icon">
                  <FaClinicMedical />
                </div>
                <h1 className="in-plan-title">Multi-Hospital</h1>
                <p className="in-plan-description">Ideal for medium-sized hospitals with multiple departments</p>
              </div>
              <div className="in-price-container">
                <p className="in-price-strike">
                  <strike>₹150</strike>
                  <span className="in-save"> Save 20%</span>
                </p>
                <h2 className="in-price">₹120.00<small>/patient</small></h2>
                <p className="in-charge-det">We will charge per patient visit</p>
              </div>
            </div>
            <div className="in-features-col">
              <h1 className="in-features-title">Everything in Primary, plus:</h1>
              <div className="in-features-list">
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  Up to 10 Doctor Logins
                </span>
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  Doctors Dashboard
                </span>
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  Staff Dashboard
                </span>
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  Master Dashboard
                </span>
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  Advanced Reporting
                </span>
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  Inventory Management
                </span>
                <div className="in-bottom-btn">
                  <button className="in-btn in-btn-outline in-demo-btn">
                    Request Demo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Corporate Hospital Plan */}
          <div className="in-pricing-plan in-premium-plan">
            <div className="in-plan-badge">
              <FaCrown className="in-badge-icon" />
              <span>Enterprise</span>
            </div>
            <div className="in-plan-details">
              <div className="in-flexCenterImg">
                <div className="in-plan-icon">
                  <FaHospital />
                </div>
                <h1 className="in-plan-title">Corporate Hospital</h1>
                <p className="in-plan-description">Complete solution for large hospital chains</p>
              </div>
              <div className="in-price-container">
                <p className="in-price-custom">Custom Pricing</p>
                <p className="in-charge-det">Tailored to your organization's needs</p>
              </div>
            </div>
            <div className="in-features-col">
              <h1 className="in-features-title">Everything in Multi, plus:</h1>
              <div className="in-features-list">
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  Unlimited Dashboards
                </span>
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  Unlimited Branches
                </span>
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  Dedicated Account Manager
                </span>
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  Priority 24/7 Support
                </span>
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  Custom Integrations
                </span>
                <span className="in-feature">
                  <FaCheck className="in-feature-check" />
                  API Access
                </span>
                <div className="in-bottom-btn">
                  <button className="in-btn in-contact-btn">
                    Contact Sales
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;