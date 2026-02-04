import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import {
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    uploadToCloudinary,
    getEventRegistrations,
    exportToCSV
} from '../../../services/adminService';
import './EventManagement.css';

const EventManagement = ({ userRole }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Workshop',
        date: '',
        time: '',
        venue: '',
        registrationFee: 0,
        maxParticipants: 100,
        isRegistrationOpen: true,
        isFeatured: false
    });
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        const result = await getAllEvents();
        if (result.success) {
            setEvents(result.data);
        }
        setLoading(false);
    };

    const handleCreate = () => {
        setEditingEvent(null);
        setFormData({
            title: '',
            description: '',
            category: 'Workshop',
            date: '',
            time: '',
            venue: '',
            registrationFee: 0,
            maxParticipants: 100,
            isRegistrationOpen: true,
            isFeatured: false
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleEdit = (event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title || '',
            description: event.description || '',
            category: event.category || 'Workshop',
            date: event.date || '',
            time: event.time || '',
            venue: event.venue || '',
            registrationFee: event.registrationFee || 0,
            maxParticipants: event.maxParticipants || 100,
            isRegistrationOpen: event.isRegistrationOpen !== undefined ? event.isRegistrationOpen : true,
            isFeatured: event.isFeatured || false
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (event) => {
        if (userRole !== 'admin') {
            alert('Only admins can delete events');
            return;
        }

        if (!confirm(`Are you sure you want to delete "${event.title}"?`)) {
            return;
        }

        const result = await deleteEvent(event.id);
        if (result.success) {
            alert('Event deleted successfully!');
            fetchEvents();
        } else {
            alert('Error deleting event: ' + result.error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        let imageUrl = editingEvent?.imageUrl || '';

        // Upload image if new file selected
        if (imageFile) {
            const uploadResult = await uploadToCloudinary(imageFile);
            if (uploadResult.success) {
                imageUrl = uploadResult.url;
            } else {
                alert('Error uploading image: ' + uploadResult.error);
                setUploading(false);
                return;
            }
        }

        const eventData = {
            ...formData,
            imageUrl,
            registrationFee: Number(formData.registrationFee),
            maxParticipants: Number(formData.maxParticipants)
        };

        let result;
        if (editingEvent) {
            result = await updateEvent(editingEvent.id, eventData);
        } else {
            result = await createEvent(eventData);
        }

        setUploading(false);

        if (result.success) {
            alert(`Event ${editingEvent ? 'updated' : 'created'} successfully!`);
            setIsModalOpen(false);
            fetchEvents();
        } else {
            alert('Error: ' + result.error);
        }
    };

    const handleExportRegistrations = async (event) => {
        const result = await getEventRegistrations(event.id);
        if (result.success && result.data.length > 0) {
            exportToCSV(result.data, `${event.title}_registrations`);
        } else {
            alert('No registrations found for this event');
        }
    };

    const columns = [
        { key: 'title', label: 'Event Title', sortable: true },
        { key: 'category', label: 'Category', sortable: true },
        { key: 'date', label: 'Date', sortable: true },
        { key: 'venue', label: 'Venue', sortable: false },
        {
            key: 'currentRegistrations',
            label: 'Registrations',
            sortable: true,
            render: (value, item) => `${value || 0}/${item.maxParticipants}`
        },
        {
            key: 'isRegistrationOpen',
            label: 'Status',
            sortable: true,
            render: (value) => (
                <span className={`status-badge ${value ? 'open' : 'closed'}`}>
                    {value ? 'Open' : 'Closed'}
                </span>
            )
        },
        {
            key: 'isFeatured',
            label: 'Featured',
            sortable: true,
            render: (value) => value ? <i className="fas fa-star" style={{ color: '#f59e0b' }}></i> : '-'
        }
    ];

    if (loading) {
        return (
            <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading events...</p>
            </div>
        );
    }

    return (
        <div className="event-management">
            <div className="section-header">
                <div>
                    <h1 className="gradient-text">Event Management</h1>
                    <p className="section-subtitle">Manage all events and registrations</p>
                </div>
                <button className="btn btn-primary interactive" onClick={handleCreate}>
                    <i className="fas fa-plus"></i>
                    Create Event
                </button>
            </div>

            <DataTable
                columns={columns}
                data={events}
                onEdit={handleEdit}
                onDelete={userRole === 'admin' ? handleDelete : null}
                actions={userRole === 'admin' ? ['edit', 'delete'] : ['edit']}
            />

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingEvent ? 'Edit Event' : 'Create New Event'}
                size="large"
            >
                <form onSubmit={handleSubmit} className="event-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Event Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="Workshop">Workshop</option>
                                <option value="Competition">Competition</option>
                                <option value="Seminar">Seminar</option>
                                <option value="Webinar">Webinar</option>
                                <option value="Hackathon">Hackathon</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="4"
                            required
                        ></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Date *</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Time *</label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Venue *</label>
                            <input
                                type="text"
                                value={formData.venue}
                                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Registration Fee (₹)</label>
                            <input
                                type="number"
                                value={formData.registrationFee}
                                onChange={(e) => setFormData({ ...formData, registrationFee: e.target.value })}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Max Participants</label>
                            <input
                                type="number"
                                value={formData.maxParticipants}
                                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Event Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                        />
                        {editingEvent?.imageUrl && !imageFile && (
                            <img src={editingEvent.imageUrl} alt="Current" className="current-image" />
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.isRegistrationOpen}
                                    onChange={(e) => setFormData({ ...formData, isRegistrationOpen: e.target.checked })}
                                />
                                <span>Registration Open</span>
                            </label>
                        </div>

                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                />
                                <span>Featured Event</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-glass interactive" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary interactive" disabled={uploading}>
                            {uploading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    {imageFile ? 'Uploading...' : 'Saving...'}
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save"></i>
                                    {editingEvent ? 'Update Event' : 'Create Event'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default EventManagement;
