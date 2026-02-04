import React, { useState, useEffect } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import { getAllUsers, updateUserRole, banUser, exportToCSV } from '../../../services/adminService';
import '../EventManagement/EventManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const result = await getAllUsers();
        if (result.success) {
            setUsers(result.data);
        }
        setLoading(false);
    };

    const handleRoleChange = async (userId, newRole) => {
        const result = await updateUserRole(userId, newRole);
        if (result.success) {
            alert('User role updated successfully!');
            fetchUsers();
        } else {
            alert('Error updating role: ' + result.error);
        }
    };

    const handleBanToggle = async (user) => {
        const result = await banUser(user.id, !user.isBanned);
        if (result.success) {
            alert(`User ${user.isBanned ? 'unbanned' : 'banned'} successfully!`);
            fetchUsers();
        } else {
            alert('Error: ' + result.error);
        }
    };

    const handleExport = () => {
        if (users.length > 0) {
            exportToCSV(users, 'users_list');
        }
    };

    const columns = [
        { key: 'displayName', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        {
            key: 'role',
            label: 'Role',
            sortable: true,
            render: (value, user) => (
                <select
                    value={value || 'user'}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="role-select"
                >
                    <option value="user">User</option>
                    <option value="subadmin">SubAdmin</option>
                    <option value="admin">Admin</option>
                </select>
            )
        },
        {
            key: 'createdAt',
            label: 'Joined',
            sortable: true,
            render: (value) => value ? new Date(value.seconds * 1000).toLocaleDateString() : 'N/A'
        },
        {
            key: 'isBanned',
            label: 'Status',
            sortable: true,
            render: (value) => (
                <span className={`status-badge ${value ? 'closed' : 'open'}`}>
                    {value ? 'Banned' : 'Active'}
                </span>
            )
        }
    ];

    if (loading) {
        return (
            <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className="event-management">
            <div className="section-header">
                <div>
                    <h1 className="gradient-text">User Management</h1>
                    <p className="section-subtitle">Manage user roles and permissions</p>
                </div>
                <button className="btn btn-primary interactive" onClick={handleExport}>
                    <i className="fas fa-download"></i>
                    Export Users
                </button>
            </div>

            <DataTable
                columns={columns}
                data={users}
                onView={(user) => {
                    setSelectedUser(user);
                    setIsModalOpen(true);
                }}
                actions={['view']}
            />

            {/* User Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="User Details"
                size="medium"
            >
                {selectedUser && (
                    <div className="user-details">
                        <div className="detail-row">
                            <strong>Name:</strong>
                            <span>{selectedUser.displayName || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                            <strong>Email:</strong>
                            <span>{selectedUser.email}</span>
                        </div>
                        <div className="detail-row">
                            <strong>Role:</strong>
                            <span>{selectedUser.role || 'user'}</span>
                        </div>
                        <div className="detail-row">
                            <strong>Status:</strong>
                            <span>{selectedUser.isBanned ? 'Banned' : 'Active'}</span>
                        </div>
                        <div className="form-actions">
                            <button
                                className={`btn ${selectedUser.isBanned ? 'btn-primary' : 'btn-glass'} interactive`}
                                onClick={() => {
                                    handleBanToggle(selectedUser);
                                    setIsModalOpen(false);
                                }}
                            >
                                {selectedUser.isBanned ? 'Unban User' : 'Ban User'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserManagement;
