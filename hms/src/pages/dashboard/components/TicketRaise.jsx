import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlusCircle, FiPaperclip, FiX, FiInbox, FiList } from 'react-icons/fi';
import './TicketRaise.css';
import api from '../../../services/api';

const TicketRaise = () => {
  const [formData, setFormData] = useState({
    title: '',
    priority: 'medium',
    description: '',
    attachment: null
  });
  const [tickets, setTickets] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'view'
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  useEffect(() => {
    if (activeTab === 'view') {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchTickets = async () => {
    try {
      setIsLoadingTickets(true);
      const response = await api.get('/api/tickets/');
      // console.log("tickets data :",response.data);
      
      setTickets(response.data || 0);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, attachment: e.target.files[0] }));
  };

  const removeAttachment = () => {
    setFormData(prev => ({ ...prev, attachment: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('description', formData.description);
      if (formData.attachment) {
        formDataToSend.append('attachment', formData.attachment);
      }

      await api.post('/api/tickets/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Ticket created successfully! Our team will get back to you soon.');
      setFormData({
        title: '',
        priority: 'medium',
        description: '',
        attachment: null
      });
      setActiveTab('view'); // Switch to view tab after successful submission
      fetchTickets();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'open':
        return 'tk-status-open';
      case 'in_progress':
        return 'tk-status-in-progress';
      case 'resolved':
        return 'tk-status-resolved';
      case 'closed':
        return 'tk-status-closed';
      default:
        return 'tk-status-default';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'low':
        return 'tk-priority-low';
      case 'medium':
        return 'tk-priority-medium';
      case 'high':
        return 'tk-priority-high';
      case 'critical':
        return 'tk-priority-critical';
      default:
        return 'tk-priority-default';
    }
  };

  return (
    <div className="tk-container">
      <div className="tk-card">
        <div className="tk-tabs">
          <button
            className={`tk-tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <FiPlusCircle className="tk-tab-icon" />
            Create Ticket
          </button>
          <button
            className={`tk-tab ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            <FiInbox className="tk-tab-icon" />
            My Tickets ({tickets.length})
          </button>
        </div>

        {(error || success) && (
          <div className={`tk-alert ${error ? 'error' : 'success'}`}>
            {error || success}
            <button 
              onClick={() => error ? setError('') : setSuccess('')} 
              className="tk-alert-close"
            >
              <FiX />
            </button>
          </div>
        )}

        {activeTab === 'create' ? (
          <form className="tk-form" onSubmit={handleSubmit}>
            <div className="tk-form-group">
              <label className="tk-label">Title*</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="tk-input"
                placeholder="Briefly describe your issue"
                required
              />
            </div>

            <div className="tk-form-group">
              <label className="tk-label">Priority*</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="tk-select"
                required
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="tk-form-group">
              <label className="tk-label">Description*</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="tk-textarea"
                placeholder="Please provide detailed information about your issue"
                rows="5"
                required
              />
            </div>

            <div className="tk-form-group">
              <label className="tk-label">Attachment</label>
              <div className="tk-file-upload">
                {formData.attachment ? (
                  <div className="tk-attachment">
                    <span className="tk-attachment-name">{formData.attachment.name}</span>
                    <button
                      type="button"
                      className="tk-attachment-remove"
                      onClick={removeAttachment}
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <label className="tk-file-label">
                    <FiPaperclip className="tk-file-icon" />
                    <span>Add file</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="tk-file-input"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                  </label>
                )}
                <span className="tk-file-hint">Supports: JPG, PNG, PDF, DOC (Max 5MB)</span>
              </div>
            </div>

            <div className="tk-form-actions">
              <button
                type="submit"
                className="tk-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        ) : (
          <div className="tk-ticket-list">
            <div className="tk-list-header">
              <h2>My Tickets</h2>
              <button 
                className="tk-refresh-button"
                onClick={fetchTickets}
                disabled={isLoadingTickets}
              >
                {isLoadingTickets ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {isLoadingTickets ? (
              <div className="tk-loading">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="tk-empty-state">
                <FiInbox className="tk-empty-icon" />
                <p>No tickets submitted yet</p>
                <button 
                  className="tk-create-button"
                  onClick={() => setActiveTab('create')}
                >
                  Create your first ticket
                </button>
              </div>
            ) : (
              <div className="tk-tickets-container">
                <div className="tk-tickets-grid">
                  <div className="tk-grid-header">ID</div>
                  <div className="tk-grid-header">Title</div>
                  <div className="tk-grid-header">Priority</div>
                  <div className="tk-grid-header">Status</div>
                  <div className="tk-grid-header">Created</div>
                  <div className="tk-grid-header">Response</div>

                  {Array.isArray(tickets) && tickets.map(ticket => (
                    <React.Fragment key={ticket.id}>
                      <div className="tk-grid-item">#{ticket.id}</div>
                      <div className="tk-grid-item">{ticket.title}</div>
                      <div className="tk-grid-item">
                        <span className={`tk-priority-badge ${getPriorityBadgeClass(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <div className="tk-grid-item">
                        <span className={`tk-status-badge ${getStatusBadgeClass(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="tk-grid-item">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                      <div className="tk-grid-item">
                        {ticket.admin_response ? (
                          <button 
                            className="tk-view-response"
                            onClick={() => {
                              // You could implement a modal or expandable section here
                              alert(`Admin Response:\n\n${ticket.admin_response}`);
                            }}
                          >
                            View Response
                          </button>
                        ) : (
                          <span className="tk-no-response">Pending</span>
                        )}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketRaise;