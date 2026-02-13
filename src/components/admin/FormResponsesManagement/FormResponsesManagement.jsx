import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import {
    getAllFormResponses,
    getEventFormResponses,
    updateFormResponse,
    deleteFormResponse
} from '../../../services/formService';
import { getAllEvents } from '../../../services/adminService';
import '../EventManagement/EventManagement.css';

const FormResponsesManagement = forwardRef(({ userRole }, ref) => {
    const [responses, setResponses] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterEventId, setFilterEventId] = useState('all');

    useImperativeHandle(ref, () => ({
        refresh: fetchResponses
    }));

    useEffect(() => {
        fetchResponses();
        fetchEvents();
    }, [filterEventId]);

    const fetchResponses = async () => {
        try {
            setLoading(true);
            const result = filterEventId === 'all'
                ? await getAllFormResponses()
                : await getEventFormResponses(filterEventId);

            if (result.success) {
                setResponses(result.data);
            }
        } catch (error) {
            console.error('Error fetching responses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const result = await getAllEvents();
            if (result.success) {
                setEvents(result.data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleView = (response) => {
        setSelectedResponse(response);
        setIsModalOpen(true);
    };

    const handleDelete = async (responseId) => {
        if (!window.confirm('Are you sure you want to delete this response?')) return;

        const result = await deleteFormResponse(responseId);
        if (result.success) {
            alert('Response deleted successfully');
            fetchResponses();
        } else {
            alert('Error deleting response: ' + result.error);
        }
    };

    const handleStatusChange = async (responseId, newStatus) => {
        const result = await updateFormResponse(responseId, { status: newStatus });
        if (result.success) {
            alert('Status updated successfully');
            fetchResponses();
            setIsModalOpen(false);
        } else {
            alert('Error updating status: ' + result.error);
        }
    };

    const exportToCSV = () => {
        if (responses.length === 0) {
            alert('No data to export');
            return;
        }

        // Get all unique field labels
        const fieldLabels = new Set();
        responses.forEach(response => {
            Object.values(response.responses || {}).forEach(field => {
                fieldLabels.add(field.label);
            });
        });

        // Create CSV header
        const headers = ['Submitted At', 'Event', 'Status', ...Array.from(fieldLabels)];
        const csvRows = [headers.join(',')];

        // Create CSV rows
        responses.forEach(response => {
            const row = [
                new Date(response.submittedAt?.seconds * 1000).toLocaleString(),
                response.eventTitle,
                response.status,
                ...Array.from(fieldLabels).map(label => {
                    const field = Object.values(response.responses || {}).find(f => f.label === label);
                    if (!field) return '';
                    if (Array.isArray(field.value)) return `"${field.value.join(', ')}"`;
                    if (field.type === 'file') return field.value; // URL
                    return `"${field.value}"`;
                })
            ];
            csvRows.push(row.join(','));
        });

        // Download CSV
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `form-responses-${filterEventId === 'all' ? 'all' : events.find(e => e.id === filterEventId)?.title || 'event'}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const columns = [
        {
            key: 'submittedAt',
            label: 'Submitted',
            render: (response) => new Date(response.submittedAt?.seconds * 1000).toLocaleString()
        },
        { key: 'eventTitle', label: 'Event' },
        {
            key: 'status',
            label: 'Status',
            render: (response) => (
                <span className={`status-badge status-${response.status}`}>
                    {response.status}
                </span>
            )
        },
        {
            key: 'responseCount',
            label: 'Fields',
            render: (response) => {
                if (!response || !response.responses) return 0;
                return Object.keys(response.responses).length;
            }
        }
    ];

    const actions = [
        {
            label: 'View',
            icon: 'fa-eye',
            onClick: handleView,
            className: 'btn-glass'
        },
        {
            label: 'Delete',
            icon: 'fa-trash',
            onClick: (response) => handleDelete(response.id),
            className: 'btn-danger',
            requireConfirm: true
        }
    ];

    return (
        <div className="event-management">
            <div className="management-header">
                <div className="header-left">
                    <h2>Form Responses</h2>
                    <p>{responses.length} total responses</p>
                </div>
                <div className="header-right">
                    <select
                        value={filterEventId}
                        onChange={(e) => setFilterEventId(e.target.value)}
                        className="event-filter"
                    >
                        <option value="all">All Events</option>
                        {events.map(event => (
                            <option key={event.id} value={event.id}>
                                {event.title}
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn btn-glass interactive"
                        onClick={exportToCSV}
                        disabled={responses.length === 0}
                    >
                        <i className="fas fa-download"></i>
                        Export CSV
                    </button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={responses}
                actions={actions}
                loading={loading}
                emptyMessage="No form responses yet"
            />

            {/* Response Detail Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Response Details">
                {selectedResponse && (
                    <div className="response-detail">
                        <div className="response-header">
                            <div className="response-info">
                                <h3>{selectedResponse.eventTitle}</h3>
                                <p>Submitted: {new Date(selectedResponse.submittedAt?.seconds * 1000).toLocaleString()}</p>
                            </div>
                            <div className="status-selector">
                                <label>Status:</label>
                                <select
                                    value={selectedResponse.status}
                                    onChange={(e) => handleStatusChange(selectedResponse.id, e.target.value)}
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
                                                <i className="fas fa-file"></i>
                                                {field.fileName || 'View File'}
                                            </a>
                                        ) : Array.isArray(field.value) ? (
                                            <ul>
                                                {field.value.map((v, i) => <li key={i}>{v}</li>)}
                                            </ul>
                                        ) : (
                                            <p>{field.value}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn btn-danger interactive"
                                onClick={() => {
                                    handleDelete(selectedResponse.id);
                                    setIsModalOpen(false);
                                }}
                            >
                                <i className="fas fa-trash"></i>
                                Delete Response
                            </button>
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
