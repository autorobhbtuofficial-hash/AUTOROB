import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { submitEventRegistration, uploadFormFile } from '../../../services/formService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import './DynamicForm.css';

const DynamicForm = ({ schema, eventId, eventTitle, onSuccess }) => {
    const [formData, setFormData] = useState({});
    const [files, setFiles] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [webhookUrl, setWebhookUrl] = useState(null);

    // Fetch event data to get webhook config
    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const eventDoc = await getDoc(doc(db, 'events', eventId));
                if (eventDoc.exists()) {
                    const eventData = eventDoc.data();
                    if (eventData.webhookConfig?.enabled && eventData.webhookConfig?.url) {
                        setWebhookUrl(eventData.webhookConfig.url);
                    }
                }
            } catch (error) {
                console.error('Error fetching event data:', error);
            }
        };
        fetchEventData();
    }, [eventId]);

    if (!schema || !schema.enabled || !schema.fields || schema.fields.length === 0) {
        return null;
    }

    const validateField = (field, value) => {
        if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
            return `${field.label} is required`;
        }

        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return 'Please enter a valid email address';
            }
        }

        if (field.type === 'phone' && value) {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(value.replace(/\D/g, ''))) {
                return 'Please enter a valid 10-digit phone number';
            }
        }

        if (field.type === 'file' && files[field.id]) {
            const file = files[field.id];
            const allowedTypes = field.validation?.fileTypes || [];

            if (allowedTypes.length > 0) {
                const fileExt = '.' + file.name.split('.').pop().toLowerCase();
                if (!allowedTypes.includes(fileExt)) {
                    return `Only ${allowedTypes.join(', ')} files are allowed`;
                }
            }

            const maxSize = field.validation?.maxFileSize || 5; // Default 5MB
            if (file.size > maxSize * 1024 * 1024) {
                return `File size must be less than ${maxSize}MB`;
            }
        }

        return null;
    };

    const handleInputChange = (fieldId, value) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
        // Clear error when user starts typing
        if (errors[fieldId]) {
            setErrors(prev => ({ ...prev, [fieldId]: null }));
        }
    };

    const handleFileChange = (fieldId, file) => {
        setFiles(prev => ({ ...prev, [fieldId]: file }));
        setFormData(prev => ({ ...prev, [fieldId]: file?.name || '' }));
        if (errors[fieldId]) {
            setErrors(prev => ({ ...prev, [fieldId]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        const newErrors = {};
        schema.fields.forEach(field => {
            const error = validateField(field, formData[field.id]);
            if (error) {
                newErrors[field.id] = error;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitting(true);

        try {
            // Upload files first
            const responses = {};

            for (const field of schema.fields) {
                if (field.type === 'file' && files[field.id]) {
                    const uploadResult = await uploadFormFile(files[field.id], eventId, field.id);
                    if (uploadResult.success) {
                        responses[field.id] = {
                            label: field.label,
                            value: uploadResult.url,
                            type: field.type,
                            fileName: files[field.id].name
                        };
                    } else {
                        throw new Error(`Failed to upload ${field.label}: ${uploadResult.error}`);
                    }
                } else {
                    responses[field.id] = {
                        label: field.label,
                        value: formData[field.id] || '',
                        type: field.type
                    };
                }
            }

            // Submit form
            const result = await submitEventRegistration(eventId, eventTitle, responses, null, webhookUrl);

            if (result.success) {
                alert('Registration submitted successfully!');
                setFormData({});
                setFiles({});
                if (onSuccess) onSuccess();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('Error submitting registration: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const renderField = (field) => {
        const error = errors[field.id];
        const value = formData[field.id] || '';

        switch (field.type) {
            case 'text':
            case 'email':
            case 'phone':
                return (
                    <input
                        type={field.type}
                        value={value}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className={error ? 'error' : ''}
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows="4"
                        required={field.required}
                        className={error ? 'error' : ''}
                    />
                );

            case 'dropdown':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                        className={error ? 'error' : ''}
                    >
                        <option value="">{field.placeholder || 'Select an option'}</option>
                        {field.options.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                );

            case 'radio':
                return (
                    <div className="radio-group">
                        {field.options.map((option, index) => (
                            <label key={index} className="radio-label">
                                <input
                                    type="radio"
                                    name={field.id}
                                    value={option}
                                    checked={value === option}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    required={field.required}
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'checkbox':
                return (
                    <div className="checkbox-group">
                        {field.options.map((option, index) => {
                            const checkedValues = Array.isArray(value) ? value : [];
                            return (
                                <label key={index} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        value={option}
                                        checked={checkedValues.includes(option)}
                                        onChange={(e) => {
                                            const newValues = e.target.checked
                                                ? [...checkedValues, option]
                                                : checkedValues.filter(v => v !== option);
                                            handleInputChange(field.id, newValues);
                                        }}
                                    />
                                    <span>{option}</span>
                                </label>
                            );
                        })}
                    </div>
                );

            case 'file':
                return (
                    <div className="file-input-wrapper">
                        <input
                            type="file"
                            onChange={(e) => handleFileChange(field.id, e.target.files[0])}
                            accept={field.validation?.fileTypes?.join(',')}
                            required={field.required}
                            className={error ? 'error' : ''}
                        />
                        {files[field.id] && (
                            <div className="file-info">
                                <i className="fas fa-file"></i>
                                <span>{files[field.id].name}</span>
                                <span className="file-size">
                                    ({(files[field.id].size / 1024).toFixed(1)} KB)
                                </span>
                            </div>
                        )}
                        {field.validation?.fileTypes && (
                            <small className="field-hint">
                                Allowed: {field.validation.fileTypes.join(', ')}
                            </small>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <motion.div
            className="dynamic-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h3>Registration Form</h3>
            <form onSubmit={handleSubmit}>
                {schema.fields.map((field, index) => (
                    <motion.div
                        key={field.id}
                        className="form-field"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <label>
                            {field.label}
                            {field.required && <span className="required">*</span>}
                        </label>
                        {renderField(field)}
                        {errors[field.id] && (
                            <span className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors[field.id]}
                            </span>
                        )}
                    </motion.div>
                ))}

                <button
                    type="submit"
                    className="btn btn-primary interactive btn-block"
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Submitting...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-paper-plane"></i>
                            Submit Registration
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
};

export default DynamicForm;
