import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FormBuilder.css';

const FIELD_TYPES = [
    { value: 'text', label: 'Text Input', icon: 'fa-font' },
    { value: 'email', label: 'Email', icon: 'fa-envelope' },
    { value: 'phone', label: 'Phone', icon: 'fa-phone' },
    { value: 'textarea', label: 'Text Area', icon: 'fa-align-left' },
    { value: 'dropdown', label: 'Dropdown', icon: 'fa-caret-square-down' },
    { value: 'radio', label: 'Radio Buttons', icon: 'fa-dot-circle' },
    { value: 'checkbox', label: 'Checkboxes', icon: 'fa-check-square' },
    { value: 'file', label: 'File Upload', icon: 'fa-file-upload' }
];

const FormBuilder = ({ schema, onChange }) => {
    const [fields, setFields] = useState(schema?.fields || []);
    const [enabled, setEnabled] = useState(schema?.enabled || false);
    const [editingField, setEditingField] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const generateFieldId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const addField = (type) => {
        const newField = {
            id: generateFieldId(),
            type,
            label: `${FIELD_TYPES.find(f => f.value === type)?.label || 'Field'}`,
            placeholder: '',
            required: false,
            options: type === 'dropdown' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2'] : [],
            validation: {}
        };
        const updatedFields = [...fields, newField];
        setFields(updatedFields);
        updateSchema(enabled, updatedFields);
        setEditingField(newField.id);
    };

    const updateField = (fieldId, updates) => {
        const updatedFields = fields.map(f => f.id === fieldId ? { ...f, ...updates } : f);
        setFields(updatedFields);
        updateSchema(enabled, updatedFields);
    };

    const deleteField = (fieldId) => {
        const updatedFields = fields.filter(f => f.id !== fieldId);
        setFields(updatedFields);
        updateSchema(enabled, updatedFields);
        if (editingField === fieldId) setEditingField(null);
    };

    const moveField = (fieldId, direction) => {
        const index = fields.findIndex(f => f.id === fieldId);
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === fields.length - 1)) return;

        const newFields = [...fields];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
        setFields(newFields);
        updateSchema(enabled, newFields);
    };

    const updateSchema = (isEnabled, currentFields) => {
        onChange({
            enabled: isEnabled,
            fields: currentFields
        });
    };

    const toggleEnabled = (value) => {
        setEnabled(value);
        updateSchema(value, fields);
    };

    return (
        <div className="form-builder">
            <div className="form-builder-header">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => toggleEnabled(e.target.checked)}
                    />
                    <span>Enable Custom Registration Form</span>
                </label>
                {enabled && fields.length > 0 && (
                    <button
                        type="button"
                        className="btn btn-sm btn-glass interactive"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        <i className={`fas fa-${showPreview ? 'edit' : 'eye'}`}></i>
                        {showPreview ? 'Edit' : 'Preview'}
                    </button>
                )}
            </div>

            {enabled && (
                <div className="form-builder-content">
                    {!showPreview ? (
                        <>
                            {/* Field Type Selector */}
                            <div className="field-type-selector">
                                <h4>Add Field</h4>
                                <div className="field-type-grid">
                                    {FIELD_TYPES.map(type => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            className="field-type-btn interactive"
                                            onClick={() => addField(type.value)}
                                        >
                                            <i className={`fas ${type.icon}`}></i>
                                            <span>{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Fields List */}
                            {fields.length > 0 && (
                                <div className="fields-list">
                                    <h4>Form Fields ({fields.length})</h4>
                                    <AnimatePresence>
                                        {fields.map((field, index) => (
                                            <motion.div
                                                key={field.id}
                                                className={`field-item ${editingField === field.id ? 'editing' : ''}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                            >
                                                <div className="field-item-header" onClick={() => setEditingField(editingField === field.id ? null : field.id)}>
                                                    <div className="field-info">
                                                        <i className={`fas ${FIELD_TYPES.find(t => t.value === field.type)?.icon}`}></i>
                                                        <span className="field-label">{field.label}</span>
                                                        {field.required && <span className="required-badge">Required</span>}
                                                    </div>
                                                    <div className="field-actions">
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); moveField(field.id, 'up'); }} disabled={index === 0}>
                                                            <i className="fas fa-chevron-up"></i>
                                                        </button>
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); moveField(field.id, 'down'); }} disabled={index === fields.length - 1}>
                                                            <i className="fas fa-chevron-down"></i>
                                                        </button>
                                                        <button type="button" className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}>
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                {editingField === field.id && (
                                                    <div className="field-editor">
                                                        <div className="form-group">
                                                            <label>Field Label *</label>
                                                            <input
                                                                type="text"
                                                                value={field.label}
                                                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                                placeholder="Enter field label"
                                                            />
                                                        </div>

                                                        <div className="form-group">
                                                            <label>Placeholder</label>
                                                            <input
                                                                type="text"
                                                                value={field.placeholder}
                                                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                                                placeholder="Enter placeholder text"
                                                            />
                                                        </div>

                                                        {(field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox') && (
                                                            <div className="form-group">
                                                                <label>Options (one per line)</label>
                                                                <textarea
                                                                    value={field.options.join('\n')}
                                                                    onChange={(e) => updateField(field.id, { options: e.target.value.split('\n').filter(o => o.trim()) })}
                                                                    rows="4"
                                                                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                                                                />
                                                            </div>
                                                        )}

                                                        {field.type === 'file' && (
                                                            <div className="form-group">
                                                                <label>Allowed File Types (comma-separated)</label>
                                                                <input
                                                                    type="text"
                                                                    value={field.validation?.fileTypes?.join(', ') || ''}
                                                                    onChange={(e) => updateField(field.id, {
                                                                        validation: {
                                                                            ...field.validation,
                                                                            fileTypes: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                                                                        }
                                                                    })}
                                                                    placeholder="e.g., .pdf, .jpg, .png"
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="form-group checkbox-group">
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={field.required}
                                                                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                                />
                                                                <span>Required Field</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}

                            {fields.length === 0 && (
                                <div className="no-fields">
                                    <i className="fas fa-inbox"></i>
                                    <p>No fields added yet. Click on a field type above to get started.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="form-preview">
                            <h4>Form Preview</h4>
                            <div className="preview-form">
                                {fields.map(field => (
                                    <div key={field.id} className="preview-field">
                                        <label>
                                            {field.label}
                                            {field.required && <span className="required">*</span>}
                                        </label>
                                        {field.type === 'text' || field.type === 'email' || field.type === 'phone' ? (
                                            <input type={field.type} placeholder={field.placeholder} disabled />
                                        ) : field.type === 'textarea' ? (
                                            <textarea placeholder={field.placeholder} rows="3" disabled></textarea>
                                        ) : field.type === 'dropdown' ? (
                                            <select disabled>
                                                <option>{field.placeholder || 'Select an option'}</option>
                                                {field.options.map((opt, i) => <option key={i}>{opt}</option>)}
                                            </select>
                                        ) : field.type === 'radio' ? (
                                            <div className="radio-group">
                                                {field.options.map((opt, i) => (
                                                    <label key={i}>
                                                        <input type="radio" name={field.id} disabled />
                                                        <span>{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : field.type === 'checkbox' ? (
                                            <div className="checkbox-group">
                                                {field.options.map((opt, i) => (
                                                    <label key={i}>
                                                        <input type="checkbox" disabled />
                                                        <span>{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : field.type === 'file' ? (
                                            <input type="file" disabled />
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FormBuilder;
