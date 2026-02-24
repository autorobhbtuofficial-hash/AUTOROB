import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import Modal from '../common/Modal';
import {
    getEventFormResponses,
    updateFormResponse,
    deleteFormResponse
} from '../../../services/formService';
import { getAllEvents } from '../../../services/adminService';
import '../EventManagement/EventManagement.css';
import './FormResponsesManagement.css';

const FormResponsesManagement = forwardRef(({ userRole }, ref) => {
    // Navigation state: 'events' | 'responses' | 'detail'
    const [view, setView] = useState('events');

    // Data
    const [events, setEvents] = useState([]);
    const [responses, setResponses] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedResponse, setSelectedResponse] = useState(null);

    // UI
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingResponses, setLoadingResponses] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useImperativeHandle(ref, () => ({
        refresh: () => {
            setView('events');
            fetchEvents();
        }
    }));

    useEffect(() => {
        fetchEvents();
    }, []);

    // ── Data fetching ──────────────────────────────────────────────

    const fetchEvents = async () => {
        try {
            setLoadingEvents(true);
            const result = await getAllEvents();
            if (result.success) {
                // Only show events that have forms enabled (saved as registrationFormSchema.enabled by FormBuilder)
                const formEvents = result.data.filter(
                    e => e.registrationFormSchema?.enabled === true
                );
                setEvents(formEvents);
            }
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoadingEvents(false);
        }
    };

    const fetchResponses = async (event) => {
        try {
            setLoadingResponses(true);
            const result = await getEventFormResponses(event.id, event.title);
            if (result.success) {
                setResponses(result.data);
            }
        } catch (err) {
            console.error('Error fetching responses:', err);
        } finally {
            setLoadingResponses(false);
        }
    };

    // ── Navigation ─────────────────────────────────────────────────

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setSearchQuery('');
        fetchResponses(event);
        setView('responses');
    };

    const handleSelectResponse = (response) => {
        setSelectedResponse(response);
        setIsModalOpen(true);
    };

    const handleBackToEvents = () => {
        setView('events');
        setSelectedEvent(null);
        setResponses([]);
        setSearchQuery('');
    };

    // ── Actions ────────────────────────────────────────────────────

    const handleDelete = async (response) => {
        if (!window.confirm('Are you sure you want to delete this response?')) return;
        const result = await deleteFormResponse(response.eventId, response.id);
        if (result.success) {
            setResponses(prev => prev.filter(r => r.id !== response.id));
            if (isModalOpen) setIsModalOpen(false);
        } else {
            alert('Error deleting response: ' + result.error);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!selectedResponse) return;
        const result = await updateFormResponse(selectedResponse.eventId, selectedResponse.id, { status: newStatus });
        if (result.success) {
            // Update in responses list too
            setResponses(prev =>
                prev.map(r => r.id === selectedResponse.id ? { ...r, status: newStatus } : r)
            );
            setSelectedResponse(prev => ({ ...prev, status: newStatus }));
        } else {
            alert('Error updating status: ' + result.error);
        }
    };

    const exportToCSV = () => {
        if (responses.length === 0) { alert('No data to export'); return; }

        const fieldLabels = new Set();
        responses.forEach(r => Object.values(r.responses || {}).forEach(f => fieldLabels.add(f.label)));

        const headers = ['Submitted At', 'Status', ...Array.from(fieldLabels)];
        const csvRows = [headers.join(',')];

        responses.forEach(r => {
            const row = [
                `"${formatDate(r.submittedAt).replace(/"/g, '""')}"`,
                `"${(r.status || '').replace(/"/g, '""')}"`,
                ...Array.from(fieldLabels).map(label => {
                    const field = Object.values(r.responses || {}).find(f => f.label === label);
                    if (!field) return '';
                    if (Array.isArray(field.value)) return `"${field.value.join(', ')}"`;
                    if (field.type === 'file') return field.value;
                    return `"${String(field.value || '').replace(/"/g, '""')}"`;
                })
            ];
            csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `responses-${selectedEvent?.title || 'event'}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // ── Helpers ────────────────────────────────────────────────────

    const getDisplayName = (response) => {
        const fields = Object.values(response.responses || {});
        const emailField = fields.find(f =>
            f.label?.toLowerCase().includes('email') || f.type === 'email'
        );
        const nameField = fields.find(f =>
            f.label?.toLowerCase().includes('name') && !f.label?.toLowerCase().includes('email')
        );
        const email = emailField?.value || '';
        const name = nameField?.value || '';
        return { name, email };
    };

    const formatDate = (submittedAt) => {
        if (!submittedAt) return 'Pending...';

        let date;
        if (typeof submittedAt.toDate === 'function') {
            date = submittedAt.toDate();
        } else if (submittedAt.seconds) {
            date = new Date(submittedAt.seconds * 1000);
        } else if (submittedAt instanceof Date) {
            date = submittedAt;
        } else {
            date = new Date(submittedAt);
        }

        if (isNaN(date.getTime())) return 'Unknown Date';

        return date.toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const filteredResponses = responses.filter(r => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const { name, email } = getDisplayName(r);
        return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
    });

    // ── Render ─────────────────────────────────────────────────────

    return (
        <div className="frm-container">

            {/* ── Breadcrumb ── */}
            <div className="frm-breadcrumb">
                <button className={`frm-crumb ${view === 'events' ? 'active' : ''}`} onClick={handleBackToEvents}>
                    <i className="fas fa-clipboard-list" /> Form Responses
                </button>
                {selectedEvent && (
                    <>
                        <i className="fas fa-chevron-right frm-crumb-sep" />
                        <span className="frm-crumb active">{selectedEvent.title}</span>
                    </>
                )}
            </div>

            {/* ══ LEVEL 1 : Event Cards ══ */}
            {view === 'events' && (
                <div className="frm-level">
                    <div className="frm-level-header">
                        <div>
                            <h2>Form Responses</h2>
                            <p className="frm-subtitle">
                                {loadingEvents ? 'Loading…' : `${events.length} event${events.length !== 1 ? 's' : ''} with forms enabled`}
                            </p>
                        </div>
                    </div>

                    {loadingEvents ? (
                        <div className="frm-loading">
                            <i className="fas fa-spinner fa-spin" />
                            <span>Loading events…</span>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="frm-empty">
                            <i className="fas fa-clipboard" />
                            <h3>No events with forms</h3>
                            <p>Enable forms on events in the Event Management section.</p>
                        </div>
                    ) : (
                        <div className="frm-event-grid">
                            {events.map(event => (
                                <button
                                    key={event.id}
                                    className="frm-event-card interactive"
                                    onClick={() => handleSelectEvent(event)}
                                >
                                    <div className="frm-event-card-icon">
                                        <i className="fas fa-calendar-alt" />
                                    </div>
                                    <div className="frm-event-card-body">
                                        <h3>{event.title}</h3>
                                        <p className="frm-event-meta">
                                            {event.date || 'Date TBD'}
                                            {event.venue ? ` · ${event.venue}` : ''}
                                        </p>
                                        <span className="frm-event-form-badge">
                                            <i className="fas fa-wpforms" /> Form Active
                                        </span>
                                    </div>
                                    <div className="frm-event-card-arrow">
                                        <i className="fas fa-chevron-right" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ══ LEVEL 2 : Responses List ══ */}
            {view === 'responses' && (
                <div className="frm-level">
                    <div className="frm-level-header">
                        <div>
                            <h2>{selectedEvent?.title}</h2>
                            <p className="frm-subtitle">
                                {loadingResponses ? 'Loading…' : `${responses.length} submission${responses.length !== 1 ? 's' : ''}`}
                            </p>
                        </div>
                        <div className="frm-level-actions">
                            <div className="frm-search-wrap">
                                <i className="fas fa-search" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email…"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="frm-search"
                                />
                            </div>
                            <button
                                className="btn btn-glass interactive"
                                onClick={exportToCSV}
                                disabled={responses.length === 0}
                            >
                                <i className="fas fa-download" /> Export CSV
                            </button>
                        </div>
                    </div>

                    {loadingResponses ? (
                        <div className="frm-loading">
                            <i className="fas fa-spinner fa-spin" />
                            <span>Loading responses…</span>
                        </div>
                    ) : filteredResponses.length === 0 ? (
                        <div className="frm-empty">
                            <i className="fas fa-inbox" />
                            <h3>{responses.length === 0 ? 'No responses yet' : 'No results'}</h3>
                            <p>{responses.length === 0 ? 'No one has submitted this form yet.' : 'Try a different search.'}</p>
                        </div>
                    ) : (
                        <div className="frm-response-list">
                            {filteredResponses.map((resp, idx) => {
                                const { name, email } = getDisplayName(resp);
                                return (
                                    <button
                                        key={resp.id}
                                        className="frm-response-row interactive"
                                        onClick={() => handleSelectResponse(resp)}
                                    >
                                        <div className="frm-resp-avatar">
                                            {(name || email || '?')[0].toUpperCase()}
                                        </div>
                                        <div className="frm-resp-info">
                                            <span className="frm-resp-name">{name || email || `Response #${idx + 1}`}</span>
                                            {name && email && <span className="frm-resp-email">{email}</span>}
                                            <span className="frm-resp-date">{formatDate(resp.submittedAt)}</span>
                                        </div>
                                        <div className="frm-resp-right">
                                            <span className={`status-badge status-${resp.status}`}>{resp.status || 'pending'}</span>
                                            <i className="fas fa-chevron-right frm-resp-arrow" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ══ LEVEL 3 : Full Detail Modal ══ */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Form Response Detail">
                {selectedResponse && (
                    <div className="response-detail">
                        <div className="response-header">
                            <div className="response-info">
                                <h3>{selectedEvent?.title}</h3>
                                <p>Submitted: {formatDate(selectedResponse.submittedAt)}</p>
                            </div>
                            <div className="status-selector">
                                <label>Status:</label>
                                <select
                                    value={selectedResponse.status || 'pending'}
                                    onChange={e => handleStatusChange(e.target.value)}
                                    className="status-select"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>

                        <div className="response-fields">
                            {Object.entries(selectedResponse.responses || {}).map(([fieldId, field]) => (
                                <div key={fieldId} className="response-field">
                                    <label>{field.label}</label>
                                    <div className="field-value">
                                        {field.type === 'file' ? (
                                            <a href={field.value} target="_blank" rel="noopener noreferrer" className="file-link">
                                                <i className="fas fa-file" /> {field.fileName || 'View File'}
                                            </a>
                                        ) : Array.isArray(field.value) ? (
                                            <ul>{field.value.map((v, i) => <li key={i}>{v}</li>)}</ul>
                                        ) : (
                                            <p>{field.value}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="modal-actions">
                            {userRole === 'admin' && (
                                <button
                                    className="btn btn-danger interactive"
                                    onClick={() => handleDelete(selectedResponse)}
                                >
                                    <i className="fas fa-trash" /> Delete Response
                                </button>
                            )}
                            <button className="btn btn-glass interactive" onClick={() => setIsModalOpen(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
});

export default FormResponsesManagement;
