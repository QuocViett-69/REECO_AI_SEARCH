import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Shield,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  MoreVertical,
  Mail,
  Phone,
  Building,
  Edit2,
  Trash2,
  X,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { adminUserService } from '../../services/adminUserService';

export function UserManagementView() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, admins: 0, clients: 0, active: 0 });
  const [roleTab, setRoleTab] = useState('ALL'); // ALL, client, admin
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: 'client',
    status: 'active',
  });
  const [formError, setFormError] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const loadData = () => {
    const list = adminUserService.getUsers();
    setUsers(list);
    setStats(adminUserService.getUserStats());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filteredUsers = useMemo(() => {
    return adminUserService.getUsers({
      search: searchQuery,
      role: roleTab,
      status: statusFilter,
    });
  }, [searchQuery, roleTab, statusFilter, users]);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      role: roleTab === 'admin' ? 'admin' : 'client',
      status: 'active',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      company: user.company || '',
      role: user.role || 'client',
      status: user.status || 'active',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (!formData.name.trim() || !formData.email.trim()) {
        setFormError('Vui lòng điền đầy đủ Họ tên và Email.');
        return;
      }

      if (editingUser) {
        adminUserService.updateUser(editingUser.id, formData);
        showNotification(`Đã cập nhật thông tin cho ${formData.name}!`);
      } else {
        adminUserService.createUser(formData);
        showNotification(`Đã tạo tài khoản mới cho ${formData.name}!`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Có lỗi xảy ra khi lưu người dùng.');
    }
  };

  const handleToggleStatus = (user) => {
    const action = user.status === 'active' ? 'khóa' : 'kích hoạt lại';
    if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản "${user.name}"?`)) {
      adminUserService.toggleUserStatus(user.id);
      showNotification(`Đã ${action} tài khoản thành công!`);
      loadData();
    }
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa tài khoản "${user.name}"?`)) {
      adminUserService.deleteUser(user.id);
      showNotification('Đã xóa người dùng khỏi hệ thống.');
      loadData();
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <main className="main-content">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 18px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 8,
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <CheckCircle size={18} color="#10b981" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Quản lý Người Dùng & Quản Trị Viên
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-light)', fontSize: 14 }}>
            Quản lý phân quyền, tài khoản khách hàng và thành viên quản trị hệ thống REECO.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreateModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: 'var(--primary)',
            color: '#1e293b',
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(249, 201, 8, 0.3)',
          }}
        >
          + Thêm tài khoản mới
        </button>
      </div>

      {/* Stats Cards - Minimalist & Harmonious (No Icons) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 24 }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: 10,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'border-color 0.2s',
          }}
        >
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, letterSpacing: '0.01em' }}>
            Tổng người dùng
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: '#0f172a', margin: '8px 0 4px', lineHeight: 1 }}>
            {stats.total}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            Tất cả tài khoản hệ thống
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 10,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'border-color 0.2s',
          }}
        >
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, letterSpacing: '0.01em' }}>
            Quản trị viên
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: '#0f172a', margin: '8px 0 4px', lineHeight: 1 }}>
            {stats.admins}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            Phân quyền quản trị REECO
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 10,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'border-color 0.2s',
          }}
        >
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, letterSpacing: '0.01em' }}>
            Khách hàng
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: '#0f172a', margin: '8px 0 4px', lineHeight: 1 }}>
            {stats.clients}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            Tài khoản khách hàng doanh nghiệp
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 10,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'border-color 0.2s',
          }}
        >
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, letterSpacing: '0.01em' }}>
            Đang hoạt động
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: '#0f172a', margin: '8px 0 4px', lineHeight: 1 }}>
            {stats.active}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            Tài khoản đang khả dụng
          </div>
        </div>
      </div>

      {/* Control Bar: Tabs & Search Filter */}
      <div
        style={{
          background: 'var(--surface)',
          padding: '16px 20px',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid var(--border-color)',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        {/* Role Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-gray)', padding: 4, borderRadius: 8, gap: 4 }}>
          <button
            type="button"
            onClick={() => setRoleTab('ALL')}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: 'none',
              fontSize: 13,
              fontWeight: roleTab === 'ALL' ? 600 : 500,
              cursor: 'pointer',
              background: roleTab === 'ALL' ? '#ffffff' : 'transparent',
              color: roleTab === 'ALL' ? 'var(--text-main)' : 'var(--text-light)',
              boxShadow: roleTab === 'ALL' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Tất cả ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setRoleTab('client')}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: 'none',
              fontSize: 13,
              fontWeight: roleTab === 'client' ? 600 : 500,
              cursor: 'pointer',
              background: roleTab === 'client' ? '#ffffff' : 'transparent',
              color: roleTab === 'client' ? 'var(--text-main)' : 'var(--text-light)',
              boxShadow: roleTab === 'client' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Khách hàng ({stats.clients})
          </button>
          <button
            type="button"
            onClick={() => setRoleTab('admin')}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: 'none',
              fontSize: 13,
              fontWeight: roleTab === 'admin' ? 600 : 500,
              cursor: 'pointer',
              background: roleTab === 'admin' ? '#ffffff' : 'transparent',
              color: roleTab === 'admin' ? 'var(--text-main)' : 'var(--text-light)',
              boxShadow: roleTab === 'admin' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Quản trị viên ({stats.admins})
          </button>
        </div>

        {/* Search & Status Filter */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Tìm theo tên, email, sđt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={15} color="var(--text-light)" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                fontSize: 13,
                background: '#fff',
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="active">Hoạt động (Active)</option>
              <option value="suspended">Đang khóa (Suspended)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container" style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table className="products-table" style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '28%', textAlign: 'left', padding: '14px 16px' }}>Họ Tên / Tài Khoản</th>
              <th style={{ width: '24%', textAlign: 'left', padding: '14px 16px' }}>Email & Điện thoại</th>
              <th style={{ width: '20%', textAlign: 'left', padding: '14px 16px' }}>Đơn vị / Công ty</th>
              <th style={{ width: '12%', textAlign: 'center', padding: '14px 16px' }}>Vai trò</th>
              <th style={{ width: '10%', textAlign: 'center', padding: '14px 16px' }}>Trạng thái</th>
              <th style={{ width: '16%', textAlign: 'right', padding: '14px 16px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--text-light)' }}>
                  Không tìm thấy người dùng nào phù hợp với điều kiện lọc.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isAdmin = u.role === 'admin';
                const isActive = u.status === 'active';
                const initials = (u.name || u.email).substring(0, 2).toUpperCase();

                return (
                  <tr key={u.id}>
                    {/* User Profile */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: isAdmin ? 'var(--primary)' : '#e2e8f0',
                            color: isAdmin ? '#1e293b' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 13,
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 14, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
                            @{u.username} • Ngày tạo: {formatDate(u.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 13, color: 'var(--text-main)', marginBottom: 2 }}>
                        {u.email}
                      </div>
                      {u.phone && (
                        <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
                          {u.phone}
                        </div>
                      )}
                    </td>

                    {/* Company */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 13, color: '#334155', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {u.company || '—'}
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 600,
                          background: isAdmin ? 'rgba(249, 201, 8, 0.18)' : '#f1f5f9',
                          color: isAdmin ? '#854d0e' : '#475569',
                        }}
                      >
                        {isAdmin ? 'Admin' : 'Client'}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          background: isActive ? '#ecfdf5' : '#fee2e2',
                          color: isActive ? '#059669' : '#dc2626',
                        }}
                      >
                        {isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        <button
                          type="button"
                          title="Sửa thông tin"
                          onClick={() => handleOpenEditModal(u)}
                          style={{
                            background: '#f1f5f9',
                            border: 'none',
                            padding: '6px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            color: '#475569',
                          }}
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          title={isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                          onClick={() => handleToggleStatus(u)}
                          style={{
                            background: isActive ? '#fee2e2' : '#ecfdf5',
                            border: 'none',
                            padding: '6px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            color: isActive ? '#dc2626' : '#059669',
                          }}
                        >
                          {isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        </button>

                        <button
                          type="button"
                          title="Xóa tài khoản"
                          onClick={() => handleDeleteUser(u)}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            padding: '6px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            color: '#94a3b8',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal Add / Edit User ──────────────────────────────────────────────── */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              width: 520,
              maxWidth: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#fafafa',
              }}
            >
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--text-main)' }}>
                {editingUser ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: 4,
                  display: 'flex',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} style={{ padding: 20 }}>
              {formError && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: '10px 14px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 6,
                    color: '#991b1b',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 5 }}>
                    Họ và Tên *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ví dụ: Nguyễn Văn A"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 5 }}>
                    Địa chỉ Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={!!editingUser}
                    placeholder="user@example.com"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 14,
                      boxSizing: 'border-box',
                      background: editingUser ? '#f8fafc' : '#ffffff',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 5 }}>
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+84 908..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 5 }}>
                      Vai trò (Role)
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        fontSize: 14,
                        background: '#fff',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="client">Khách hàng (Client)</option>
                      <option value="admin">Quản trị viên (Admin)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 5 }}>
                      Cơ quan / Đơn vị
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Viện Khí Tượng, Công ty ABC..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 5 }}>
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        fontSize: 14,
                        background: '#fff',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="active">Hoạt động</option>
                      <option value="suspended">Khóa</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 18px',
                    borderRadius: 6,
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#1e293b',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <Save size={15} /> Lưu tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
