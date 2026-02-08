import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import {
    getAllTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    uploadToCloudinary
} from '../../../services/adminService';
import '../EventManagement/EventManagement.css';

const TeamManagement = forwardRef(({ userRole }, ref) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        year: '',
        department: '',
        bio: '',
        socialLinks: { linkedin: '', email: '', instagram: '' },
        isActive: true,
        isFeatured: false,
        order: 1
    });
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, []);

    // Expose triggerCreate method to parent via ref
    useImperativeHandle(ref, () => ({
        triggerCreate: handleCreate
    }));

    const fetchMembers = async () => {
        setLoading(true);
        const result = await getAllTeamMembers();
        if (result.success) {
            setMembers(result.data);
        }
        setLoading(false);
    };

    const handleCreate = () => {
        setEditingMember(null);
        setFormData({
            name: '',
            role: '',
            year: '',
            department: '',
            bio: '',
            socialLinks: { linkedin: '', email: '', instagram: '' },
            isActive: true,
            isFeatured: false,
            order: members.length + 1
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleEdit = (member) => {
        setEditingMember(member);
        setFormData({
            name: member.name || '',
            role: member.role || '',
            year: member.year || '',
            department: member.department || '',
            bio: member.bio || '',
            socialLinks: member.socialLinks || { linkedin: '', email: '', instagram: '' },
            isActive: member.isActive !== undefined ? member.isActive : true,
            isFeatured: member.isFeatured || false,
            order: member.order || 1
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (member) => {
        if (userRole !== 'admin') {
            alert('Only admins can delete team members');
            return;
        }

        if (!confirm(`Are you sure you want to remove ${member.name}?`)) {
            return;
        }

        const result = await deleteTeamMember(member.id);
        if (result.success) {
            alert('Team member removed successfully!');
            fetchMembers();
        } else {
            alert('Error: ' + result.error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate that photo is uploaded for new members
        if (!editingMember && !imageFile) {
            alert('Please upload a profile photo');
            return;
        }

        setUploading(true);

        let photoUrl = editingMember?.photoUrl || null;

        if (imageFile) {
            const uploadResult = await uploadToCloudinary(imageFile);
            if (uploadResult.success) {
                photoUrl = uploadResult.url;
            } else {
                alert('Error uploading image: ' + uploadResult.error);
                setUploading(false);
                return;
            }
        }

        // Remove undefined values from memberData
        const memberData = {
            name: formData.name,
            role: formData.role,
            year: formData.year,
            department: formData.department,
            bio: formData.bio || '',
            socialLinks: {
                linkedin: formData.socialLinks.linkedin || '',
                email: formData.socialLinks.email || '',
                instagram: formData.socialLinks.instagram || ''
            },
            isActive: formData.isActive,
            isFeatured: formData.isFeatured,
            order: Number(formData.order)
        };

        // Only add photoUrl if it exists
        if (photoUrl) {
            memberData.photoUrl = photoUrl;
        }

        let result;
        if (editingMember) {
            result = await updateTeamMember(editingMember.id, memberData);
        } else {
            result = await createTeamMember(memberData);
        }

        setUploading(false);

        if (result.success) {
            alert(`Team member ${editingMember ? 'updated' : 'added'} successfully!`);
            setIsModalOpen(false);
            fetchMembers();
        } else {
            alert('Error: ' + result.error);
        }
    };

    const columns = [
        {
            key: 'photoUrl',
            label: 'Photo',
            render: (value) => (
                <img src={value || 'https://via.placeholder.com/50'} alt="Member" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
            )
        },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'role', label: 'Role', sortable: true },
        { key: 'year', label: 'Year', sortable: true },
        { key: 'department', label: 'Department', sortable: true },
        {
            key: 'isActive',
            label: 'Status',
            sortable: true,
            render: (value) => (
                <span className={`status-badge ${value ? 'open' : 'closed'}`}>
                    {value ? 'Active' : 'Alumni'}
                </span>
            )
        }
    ];

    if (loading) {
        return (
            <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading team members...</p>
            </div>
        );
    }

    return (
        <div className="event-management">
            <div className="section-header">
                <div>
                    <h1 className="gradient-text">Team Management</h1>
                    <p className="section-subtitle">Manage team members and their details</p>
                </div>
                <button className="btn btn-primary interactive" onClick={handleCreate}>
                    <i className="fas fa-plus"></i>
                    Add Member
                </button>
            </div>

            <DataTable
                columns={columns}
                data={members}
                onEdit={handleEdit}
                onDelete={userRole === 'admin' ? handleDelete : null}
                actions={userRole === 'admin' ? ['edit', 'delete'] : ['edit']}
            />

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingMember ? 'Edit Team Member' : 'Add Team Member'}
                size="large"
            >
                <form onSubmit={handleSubmit} className="event-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Role/Position *</label>
                            <input
                                type="text"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                list="role-suggestions"
                                placeholder="Enter role or select from suggestions"
                                required
                            />
                            <datalist id="role-suggestions">
                                <option value="President" />
                                <option value="Vice President" />
                                <option value="General Secretary" />
                                <option value="Technical Head" />
                                <option value="Creative Head" />
                                <option value="Event Head" />
                                <option value="PR Head" />
                                <option value="Treasurer" />
                                <option value="Member" />
                            </datalist>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Year *</label>
                            <select
                                value={['Final Year', '3rd Year', '2nd Year', '1st Year'].includes(formData.year) ? formData.year : 'Others'}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData({
                                        ...formData,
                                        year: val === 'Others' ? '' : val
                                    });
                                }}
                                required
                            >
                                <option value="">Select Year</option>
                                <option value="Final Year">Final Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="Others">Others</option>
                            </select>

                            {/* Show text input if custom year or 'Others' is active */}
                            {!['Final Year', '3rd Year', '2nd Year', '1st Year', ''].includes(formData.year) || (formData.year === '' && formData.year !== undefined) ? (
                                <input
                                    type="text"
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    placeholder="Specify Year / Group (e.g., Alumni)"
                                    style={{ marginTop: '0.5rem' }}
                                />
                            ) : null}
                        </div>

                        <div className="form-group">
                            <label>Department *</label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                placeholder="e.g., CSE, ECE, ME"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Display Order</label>
                            <input
                                type="number"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                min="1" // Start from 1
                                placeholder="Order within year group"
                            />
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                Lower numbers appear first
                            </small>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            rows="3"
                            placeholder="Short bio about the member"
                        ></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>LinkedIn URL</label>
                            <input
                                type="url"
                                value={formData.socialLinks.linkedin}
                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
                                placeholder="https://linkedin.com/in/username"
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={formData.socialLinks.email}
                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, email: e.target.value } })}
                                placeholder="member@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>Instagram URL</label>
                            <input
                                type="url"
                                value={formData.socialLinks.instagram}
                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                                placeholder="https://instagram.com/username"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Profile Photo *</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            required={!editingMember}
                        />
                        {editingMember?.photoUrl && !imageFile && (
                            <img src={editingMember.photoUrl} alt="Current" className="current-image" />
                        )}
                    </div>

                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            <span>Active Member</span>
                        </label>
                    </div>

                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.isFeatured}
                                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                            />
                            <span>Featured Member (Show on Home Page)</span>
                        </label>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-glass interactive" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary interactive" disabled={uploading}>
                            {uploading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save"></i>
                                    {editingMember ? 'Update Member' : 'Add Member'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
});

export default TeamManagement;
