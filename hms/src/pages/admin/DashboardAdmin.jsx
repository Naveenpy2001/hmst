import React, { useState, useEffect } from 'react';
import { 
  FiHome, FiInbox, FiUsers, FiSettings, FiLogOut, 
  FiUserPlus, FiMessageSquare, FiChevronDown, FiMenu, FiDollarSign,
  FiCreditCard, FiCalendar, FiRefreshCw
} from 'react-icons/fi';
import './DashboardA.css';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom'


const DashboardAdmin = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [status, setStatus] = useState('open');
  const [isLoading, setIsLoading] = useState(false);
  const [newTicketCount, setNewTicketCount] = useState(0);
  const [newUserCount, setNewUserCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Doctor Payment States
  const [doctorStats, setDoctorStats] = useState([]);
  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth() + 1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);

  const navigate = useNavigate()

  // API Calls
  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/admin/tickets/');

      
      setTickets(response.data);
      // Count new tickets (status = open)
      setNewTicketCount(response.data.filter(t => t.status === 'open').length);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/doctor-stats/');
      console.log('admin :', response.data);
      
      setUsers(response.data);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      setNewUserCount(response.data.filter(u => new Date(u.createdAt) > weekAgo).length);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };



 const handlePaymentUpdate = async () => {
 

  try {
    await api.patch(`/api/admin/monthly-payments/${selectedPayment.doctor_id}/`, {
      amount_paid: parseFloat(paymentAmount)
    });
    fetchMonthlyPayments();
    setShowPaymentModal(false);
    setPaymentAmount('');
  } catch (err) {
    console.error('Error updating payment:', err);
  }
};



  const toggleDoctorStatus = async (doctorId, currentStatus) => {
    try {
      await api.patch(`/api/admin/doctors/${doctorId}/status/`, {
        is_active: !currentStatus
      });
      fetchDoctorStats();
      console.log('success.!');
      
    } catch (err) {
      console.error('Error toggling doctor status:', err);
    }
  };
 
  const fetchDashboardData = async () => {
    await Promise.all([
      fetchTickets(), 
      fetchUsers(),
      fetchDoctorStats(),
      fetchMonthlyPayments()
    ]);
  };

  const updateTicket = async (ticketId, updates) => {
    try {
      await api.patch(`/api/admin/tickets/${ticketId}/`, updates);
      fetchTickets();
      return true;
    } catch (err) {
      console.error('Error updating ticket:', err);
      return false;
    }
  };


  const resetMonthlyCounts = async () => {
    try {
      setResetStatus('loading');
      const response = await api.post('/api/admin/reset-monthly-counts/');
      setResetStatus(response.data);
      fetchDoctorStats();
      fetchMonthlyPayments();
    } catch (err) {
      setResetStatus(err.response?.data || { error: 'Reset failed' });
    }
  };

  const handleLogout = () => {
    navigate('/login');
    localStorage.removeItem('access_token');
  };




    // Add these with your other API calls
    const fetchDoctorStats = async () => {
    try {
      const response = await api.get('/api/admin/doctor-stats/');
      setDoctorStats(response.data);
    } catch (err) {
      console.error('Error fetching doctor stats:', err);
    }
  };
  
    const fetchMonthlyPayments = async () => {
      try {
        const response = await api.get('/api/admin/monthly-payments/');
        console.log('res2 : ',response.data);
        
        setMonthlyPayments(response.data);
      } catch (err) {
        console.error('Error fetching monthly payments:', err);
      }
    };
  
 

    

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeMenu === 'tickets') fetchTickets();
    if (activeMenu === 'users') fetchUsers();
    if (activeMenu === 'doctor-payments') {
      fetchDoctorStats();
      fetchMonthlyPayments();
    }
  }, [activeMenu]);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!adminReply.trim()) return;
    
    const success = await updateTicket(selectedTicket.id, {
      admin_response: adminReply,
      status
    });
    
    if (success) {
      setAdminReply('');
      // Update local state immediately
      const updatedTicket = {
        ...selectedTicket,
        adminResponse: adminReply,
        status
      };
      setSelectedTicket(updatedTicket);
      setTickets(tickets.map(t => 
        t.id === selectedTicket.id ? updatedTicket : t
      ));
    }
  };

  // Render Functions
  const renderDashboard = () => (
    <div className="db-content">
      <h2 className="db-title">Admin Dashboard</h2>
      <div className="db-stats">
        <div className="db-stat-card">
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>
        <div className="db-stat-card">
          <h3>Total Tickets</h3>
          <p>{tickets.length}</p>
        </div>
        <div className="db-stat-card">
          <h3>Open Tickets</h3>
          <p>{newTicketCount}</p>
        </div>
        <div className="db-stat-card">
          <h3>New Users (7d)</h3>
          <p>{newUserCount}</p>
        </div>
      </div>

      <div className="db-recent-section">
        <h3>Recent Tickets</h3>
        {tickets.slice(0, 5).map(ticket => (
          <div key={ticket.id} className="db-recent-item">
            <span className={`db-status-dot ${ticket.status}`}></span>
            <span className="db-recent-title">#{ticket.id} - {ticket.title}</span>
            <span className="db-recent-user">{ticket.user}</span>
            <span className="db-recent-date">
              {new Date(ticket.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>

      <div className="db-recent-section">
        <h3>Recent Users</h3>
        {users.slice(0, 5).map((user, index) => (
          <div key={user.id || index} className="db-recent-item">
            <span className="db-recent-title">{user.username}</span>
            <span className="db-recent-user">{user.doctor_email}</span>
            <span className="db-recent-date">
              Joined {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTickets = () => (
    <div className="db-content">
      <h2 className="db-title">Ticket Management</h2>
      
      {isLoading ? (
        <div className="db-loading">Loading tickets...</div>
      ) : (
        <div className="db-ticket-container">
          <div className="db-ticket-list">
            {tickets.map(ticket => (
              <div 
                key={ticket.id} 
                className={`db-ticket-item ${selectedTicket?.id === ticket.id ? 'active' : ''}`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="db-ticket-header">
                  <span className="db-ticket-id">#{ticket.id}</span>
                  <span className={`db-ticket-priority ${ticket.priority}`}>
                    {ticket.priority}
                  </span>
                </div>
                <h4 className="db-ticket-title">{ticket.title}</h4>
                <p className="db-ticket-desc">{ticket.description.substring(0, 60)}...</p>
                <div className="db-ticket-footer">
                  <span className="db-ticket-user">{ticket.created_by_username}</span>
                  <span className={`db-ticket-status ${ticket.status}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="db-ticket-detail">
            {selectedTicket ? (
              <>
                <div className="db-ticket-detail-header">
                  <h3>#{selectedTicket.id} - {selectedTicket.title}</h3>
                  <span className={`db-status-badge ${selectedTicket.status}`}>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="db-ticket-user-info">
                  <h4>Submitted by:</h4>
                  <p>{selectedTicket.created_by_username} - {selectedTicket.created_by_email}</p>
                  <p className="db-ticket-date">
                    {new Date(selectedTicket.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="db-ticket-description">
                  <h4>Description:</h4>
                  <p>{selectedTicket.description}</p>
                </div>

                {selectedTicket.adminResponse && (
                  <div className="db-admin-response">
                    <h4>Your Response:</h4>
                    <p>{selectedTicket.adminResponse}</p>
                  </div>
                )}

                <form onSubmit={handleSubmitReply} className="db-reply-form">
                  <div className="db-form-group">
                    <label>Status</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="db-form-select"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className="db-form-group">
                    <label>Your Response</label>
                    <textarea
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      placeholder="Type your response here..."
                      className="db-form-textarea"
                      rows="5"
                    />
                  </div>

                  <button type="submit" className="db-submit-button">
                    Submit Response
                  </button>
                </form>
              </>
            ) : (
              <div className="db-no-ticket">
                <p>Select a ticket to view details and respond</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="db-content">
      <h2 className="db-title">User Management</h2>
      
      {/* <div className="db-user-actions">
        <button className="db-add-user-button">
          <FiUserPlus /> Add New User
        </button>
      </div> */}

      {isLoading ? (
        <div className="db-loading">Loading users...</div>
      ) : (
        <div className="db-user-table">
          <div className="db-table-header">
            <div className="db-table-col">Name</div>
            <div className="db-table-col">Email</div>
            <div className="db-table-col">Joined</div>
            <div className="db-table-col">Patients</div>
            <div className="db-table-col">Amount</div>
          </div>
          
          {users.map(user => (
            <div key={user.id} className="db-table-row">
              <div className="db-table-col">
               {user.username}
              </div>
              <div className="db-table-col">{user.doctor_email}</div>
              <div className="db-table-col">
                {new Date(user.created_at).toLocaleDateString()}
              </div>
              <div className="db-table-col">
                <span className='db-user-status'>
                  {user.total_patients}
                </span>
              </div>
              <div className="db-table-col">₹<b>{user.total_amount_due}</b> /-</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

   const renderDoctorPayments = () => (
    <div className="db-content">
      <h2 className="db-title">Doctor Payment Management</h2>
      
      <div className="db-payment-controls">
        <div className="db-form-group">
          <label>Year</label>
          <select 
            value={activeYear}
            onChange={(e) => setActiveYear(parseInt(e.target.value))}
            className="db-form-select"
          >
            {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div className="db-form-group">
          <label>Month</label>
          <select 
            value={activeMonth}
            onChange={(e) => setActiveMonth(parseInt(e.target.value))}
            className="db-form-select"
          >
            {Array.from({length: 12}, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>
                {new Date(2000, month - 1, 1).toLocaleString('default', {month: 'long'})}
              </option>
            ))}
          </select>
        </div>

        <button 
          className="db-action-button"
          onClick={resetMonthlyCounts}
          disabled={resetStatus === 'loading'}
        >
          <FiRefreshCw /> Reset Monthly Counts
        </button>
      </div>

      {resetStatus && (
        <div className={`db-alert ${resetStatus.error ? 'error' : 'success'}`}>
          {resetStatus.error || 'Monthly counts reset successfully'}
        </div>
      )}

      <div className="db-stats-grid">
        <div className="db-stat-card">
          <h3>Total Doctors</h3>
          <p>{doctorStats.length}</p>
        </div>
        <div className="db-stat-card">
          <h3>Active Doctors</h3>
          <p>{doctorStats.filter(d => d.is_active).length}</p>
        </div>
        <div className="db-stat-card">
          <h3>Total Patients</h3>
          <p>{doctorStats.reduce((sum, doc) => sum + doc.total_patients, 0)}</p>
        </div>
        <div className="db-stat-card">
          <h3>Total Revenue</h3>
          <p>₹{doctorStats.reduce((sum, doc) => sum + (doc.total_patients * 20), 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="db-section">
        <h3>Doctor Statistics</h3>
        <div className="db-table-container">
          <div className="db-table-header">
            <div className="db-table-col">Doctor</div>
            <div className="db-table-col">Patients</div>
            <div className="db-table-col">Amount Due</div>
            <div className="db-table-col">Status</div>
            <div className="db-table-col">Actions</div>
          </div>
          
          {doctorStats.map(doctor => (
            <div key={doctor.doctor_id} className="db-table-row">
              <div className="db-table-col">
                <strong>{doctor.username}</strong>
                <small>{doctor.doctor_email}</small>
              </div>
              <div className="db-table-col">{doctor.total_patients}</div>
              <div className="db-table-col">
                ₹{(doctor.total_patients * 20).toFixed(2)}
              </div>
              <div className="db-table-col">
                <span className={`db-status-badge ${doctor.is_active ? 'active' : 'inactive'}`}>
                  {doctor.is_active ? 'Active' : 'Inactive'} 
                </span>
              </div>
              <div className="db-table-col actions">
                <button 
                  className="db-action-button"
                  onClick={() => toggleDoctorStatus(doctor.doctor_id, doctor.is_active)}
                >
                  {doctor.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  className="db-action-button primary"
                  onClick={() => {
                    setSelectedPayment({
                      id: doctor.payment_id, 
                      doctor_id: doctor.doctor_id,
                      doctor_email: doctor.doctor_email,
                      month: activeMonth,
                      year: activeYear,
                      patients_registered: doctor.total_patients,
                      amount_due: doctor.total_patients * 20,
                      amount_paid: 0
                    });
                    setShowPaymentModal(true);
                  }}
                >
                  ₹ Pay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="db-section">
        <h3>Monthly Payment History</h3>
        <div className="db-table-container">
          <div className="db-table-header">
            <div className="db-table-col">Doctor</div>
            <div className="db-table-col">Period</div>
            <div className="db-table-col">Patients</div>
            <div className="db-table-col">Amount Due</div>
            <div className="db-table-col">Amount Paid</div>
            <div className="db-table-col">Status</div>
          </div>
          
          {monthlyPayments
            .filter(p => p.year === activeYear && p.month === activeMonth)
            .map(payment => (
              <div key={`${payment.doctor_email}-${payment.month}-${payment.year}`} 
                  className="db-table-row">
                <div className="db-table-col">{payment.doctor_email}</div>
                <div className="db-table-col">
                  {new Date(payment.year, payment.month - 1, 1)
                    .toLocaleString('default', {month: 'short', year: 'numeric'})}
                </div>
                <div className="db-table-col">{payment.total_patients}</div>
                <div className="db-table-col">
                  ₹{payment.amount_due || 0}
                </div>
                <div className="db-table-col">
                  ₹{payment.amount_paid}
                </div>
                <div className="db-table-col">
                  <span className={`db-status-badge ${payment.paid ? 'paid' : 'pending'}`}>
                    {payment.paid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="db-modal-overlay">
          <div className="db-modal">
            <h3>
              <FiCreditCard /> Record Payment
            </h3>
            
            <div className="db-modal-content">
              <div className="db-form-group">
                <label>Doctor</label>
                <p>{selectedPayment.doctor_email}</p>
              </div>
              
              <div className="db-form-group">
                <label>Period</label>
                <p>
                  {new Date(selectedPayment.year, selectedPayment.month - 1, 1)
                    .toLocaleString('default', {month: 'long', year: 'numeric'})}
                </p>
              </div>
              
              <div className="db-form-group">
                <label>Patients Registered</label>
                <p>{selectedPayment.patients_registered}</p>
              </div>
              
              <div className="db-form-group">
                <label>Total Amount Due</label>
                <p>₹{selectedPayment.amount_due.toFixed(2)}</p>
              </div>
              
              <div className="db-form-group">
                <label>Amount Paid (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount paid"
                  className="db-form-input"
                  min="0"
                  max={selectedPayment.amount_due}
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="db-modal-actions">
              <button 
                className="db-button secondary"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
              <button 
                className="db-button primary"
                onClick={handlePaymentUpdate}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );


  const renderSettings = () => (
    <div className="db-content">
      <h2 className="db-title">Settings</h2>
      <div className="db-settings-form">
        <div className="db-form-group">
          <label>System Name</label>
          <input type="text" className="db-form-input" defaultValue="Admin Panel" />
        </div>
        <div className="db-form-group">
          <label>Email Notifications</label>
          <div className="db-checkbox-group">
            <label>
              <input type="checkbox" defaultChecked /> New Tickets
            </label>
            <label>
              <input type="checkbox" defaultChecked /> New Users
            </label>
          </div>
        </div>
        <div className="db-form-group">
          <label>Theme</label>
          <select className="db-form-select">
            <option>Light</option>
            <option>Dark</option>
            <option>System</option>
          </select>
        </div>
        <button className="db-submit-button">Save Settings</button>
      </div>
    </div>
  );

  return (
    <div className="db-container">
      {/* Mobile Menu Button */}
      <button 
        className="db-mobile-menu-button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <FiMenu />
      </button>

      {/* Sidebar */}
      <div className={`db-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="db-logo">Admin Panel</div>
        <nav className="db-nav">
          <ul>
            <li>
              <button 
                className={`db-nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
                onClick={() => {
                  setActiveMenu('dashboard');
                  setMobileMenuOpen(false);
                }}
              >
                <FiHome className="db-nav-icon" />
                Dashboard
                {newTicketCount > 0 && activeMenu !== 'dashboard' && (
                  <span className="db-badge">{newTicketCount}</span>
                )}
              </button>
            </li>
            <li>
              <button 
                className={`db-nav-item ${activeMenu === 'tickets' ? 'active' : ''}`}
                onClick={() => {
                  setActiveMenu('tickets');
                  setActiveSubMenu(null);
                  setMobileMenuOpen(false);
                }}
              >
                <FiInbox className="db-nav-icon" />
                Tickets
                {newTicketCount > 0 && activeMenu !== 'tickets' && (
                  <span className="db-badge">{newTicketCount}</span>
                )}
              </button>
            </li>
            <li className={`db-nav-parent ${activeMenu === 'users' ? 'open' : ''}`}>
              <button 
                className={`db-nav-item ${activeMenu === 'users' ? 'active' : ''}`}
                onClick={() => {
                  setActiveMenu('users');
                  setActiveSubMenu(activeSubMenu === 'users' ? null : 'users');
                  setMobileMenuOpen(false);
                }}
              >
                <FiUsers className="db-nav-icon" />
                Users
                {newUserCount > 0 && activeMenu !== 'users' && (
                  <span className="db-badge">{newUserCount}</span>
                )}
                {/* <FiChevronDown className={`db-nav-arrow ${activeSubMenu === 'users' ? 'rotated' : ''}`} /> */}
              </button>
            </li>

            <li>
              <button 
                className={`db-nav-item ${activeMenu === 'doctor-payments' ? 'active' : ''}`}
                onClick={() => {
                  setActiveMenu('doctor-payments');
                  setActiveSubMenu(null);
                  setMobileMenuOpen(false);
                }}
              >
                <FiUsers className="db-nav-icon" />
                Doctor Payments
              </button>
            </li>
            <li>
              <button 
                className="db-nav-item"
                onClick={handleLogout}
              >
                <FiLogOut className="db-nav-icon" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="db-main">
        {activeMenu === 'dashboard' && renderDashboard()}
        {activeMenu === 'tickets' && renderTickets()}
        {activeMenu === 'users' && renderUsers()}
        {activeMenu === 'doctor-payments' && renderDoctorPayments()}
        {activeMenu === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default DashboardAdmin;