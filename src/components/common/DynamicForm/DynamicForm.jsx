import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { submitEventRegistration, uploadFormFile } from '../../../services/formService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import './DynamicForm.css';

const DynamicForm = ({ schema, eventId, eventTitle, onSuccess }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({});
    const [files, setFiles] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [webhookUrl, setWebhookUrl] = useState(null);
    const [submitError, setSubmitError] = useState(''); // inline error instead of alert()

    // Validate webhook URL — only allow known public HTTPS webhook endpoints
    const isSafeWebhookUrl = (url) => {
        if (!url || typeof url !== 'string') return false;
        try {
            const parsed = new URL(url);
            // Must be HTTPS
            if (parsed.protocol !== 'https:') return false;
            // Block private/localhost IPs
            const privatePattern = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;
            if (privatePattern.test(parsed.hostname)) return false;
            // Allow known webhook services only
            const allowedHosts = [
                'discord.com', 'discordapp.com',
                'hooks.slack.com',
                'hook.eu1.make.com', 'hook.us1.make.com', 'hook.integromat.com',
                'hooks.zapier.com',
                'n8n.io',
            ];
            return allowedHosts.some(h => parsed.hostname === h || parsed.hostname.endsWith('.' + h));
        } catch {
            return false;
        }
    };

    // Fetch event data to get webhook config
    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const eventDoc = await getDoc(doc(db, 'events', eventId));
                if (eventDoc.exists()) {
                    const eventData = eventDoc.data();
                    const url = eventData.webhookConfig?.url;
                    // Only use URL if it passes safety check
                    if (eventData.webhookConfig?.enabled && isSafeWebhookUrl(url)) {
                        setWebhookUrl(url);
                    } else if (eventData.webhookConfig?.enabled && url) {
                        console.warn('Webhook URL blocked — invalid or unsafe:', url);
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

    // MIME type map — extension → expected MIME
    const MIME_MAP = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.txt': 'text/plain',
        '.zip': 'application/zip',
    };

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
                const expectedMime = MIME_MAP[fileExt];
                if (expectedMime && file.type && file.type !== expectedMime) {
                    return `File content does not match its extension. Please upload a valid ${fileExt} file.`;
                }
            }

            const maxSize = field.validation?.maxFileSize || 5;
            if (file.size > maxSize * 1024 * 1024) {
                return `File size must be less than ${maxSize}MB`;
            }
        }

        // Max length check for text-based fields
        if (field.validation?.maxLength && typeof value === 'string' && value.length > field.validation.maxLength) {
            return `${field.label} must be ${field.validation.maxLength} characters or fewer`;
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
            if (field.type === 'image') return; // display-only, skip
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
        setSubmitError('');

        try {
            // Upload files first
            const responses = {};

            for (const field of schema.fields) {
                if (field.type === 'image') continue; // display-only, not a user response
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

            // Submit form with user ID
            const result = await submitEventRegistration(
                eventId,
                eventTitle,
                responses,
                currentUser?.uid || null,
                webhookUrl
            );

            if (result.success) {
                alert('Registration submitted successfully!');
                setFormData({});
                setFiles({});
                if (onSuccess) onSuccess();
            } else {
                setSubmitError(result.error || 'Failed to submit registration. Please try again.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            setSubmitError('Failed to submit registration. Please try again.');
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
                        maxLength={field.validation?.maxLength || undefined}
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
                        maxLength={field.validation?.maxLength || undefined}
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

            case 'image':
                return (
                    <div className="qr-display-block">
                        {field.imageUrl ? (
                            <img
                                src={field.imageUrl}
                                alt={field.caption || field.label}
                                className="qr-display-img"
                            />
                        ) : (
                            <span className="no-img-msg">
                                <i className="fas fa-image"></i> Image coming soon
                            </span>
                        )}
                        {field.caption && (
                            <p className="qr-display-caption">{field.caption}</p>
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
                        className={`form-field${field.type === 'image' ? ' form-field--image' : ''}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        {field.type === 'image' ? (
                            // Image/QR fields: display-only, no required star or error
                            renderField(field)
                        ) : (
                            <>
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
                            </>
                        )}
                    </motion.div>
                ))}

                {submitError && (
                    <div className="submit-error-banner">
                        <i className="fas fa-exclamation-triangle" />
                        {submitError}
                    </div>
                )}
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
