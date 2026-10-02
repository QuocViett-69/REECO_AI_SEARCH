// ─── Admin User Management Service ───────────────────────────────────────────
// Manages both Client customers and Admin accounts
// Supports role management, suspension, and order history linkage

const USERS_STORAGE_KEY = 'reeco_admin_users_store';

class AdminUserService {
  constructor() {
    this.initDefaultUsersIfEmpty();
  }

  getStoredUsers() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveStoredUsers(users) {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {}
  }

  initDefaultUsersIfEmpty() {
    try {
      if (typeof localStorage === 'undefined') return;
      const existing = this.getStoredUsers();
      if (existing.length === 0) {
        const defaultUsers = [
          {
            id: 'usr_admin_1',
            username: 'admin',
            email: 'admin@reeco.vn',
            name: 'REECO Administrator',
            phone: '+84 28 3823 4567',
            company: 'REECO Science & Technology',
            role: 'admin',
            status: 'active',
            avatar: null,
            created_at: '2026-08-01T08:00:00Z',
            last_login: new Date().toISOString(),
          },
          {
            id: 'usr_admin_2',
            username: 'quocviet',
            email: 'quocviet@reeco.vn',
            name: 'Quoc Viet',
            phone: '+84 909 111 222',
            company: 'REECO Engineering',
            role: 'admin',
            status: 'active',
            avatar: null,
            created_at: '2026-08-15T09:30:00Z',
            last_login: new Date().toISOString(),
          },
          {
            id: 'usr_admin_3',
            username: 'lequyen',
            email: 'lequyen@reeco.vn',
            name: 'Lê Quyên',
            phone: '+84 918 333 444',
            company: 'REECO Systems',
            role: 'admin',
            status: 'active',
            avatar: null,
            created_at: '2026-08-20T10:15:00Z',
            last_login: new Date().toISOString(),
          },
          {
            id: 'usr_client_1',
            username: 'haitran',
            email: 'haitran@example.com',
            name: 'Hai Tran',
            phone: '+84 908 123 456',
            company: 'Vietnam Meteorological Station',
            role: 'client',
            status: 'active',
            avatar: null,
            created_at: '2026-09-01T14:20:00Z',
            last_login: new Date().toISOString(),
          },
          {
            id: 'usr_client_2',
            username: 'minhanh',
            email: 'minhanh@example.com',
            name: 'Minh Anh',
            phone: '+84 912 345 678',
            company: 'Water Resource Institute',
            role: 'client',
            status: 'active',
            avatar: null,
            created_at: '2026-09-05T11:45:00Z',
            last_login: new Date().toISOString(),
          },
          {
            id: 'usr_client_3',
            username: 'ducnguyen',
            email: 'ducnguyen@example.com',
            name: 'Duc Nguyen',
            phone: '+84 987 654 321',
            company: 'AgriTech Vietnam JSC',
            role: 'client',
            status: 'active',
            avatar: null,
            created_at: '2026-09-12T16:10:00Z',
            last_login: new Date().toISOString(),
          },
          {
            id: 'usr_client_4',
            username: 'thanhlong',
            email: 'thanhlong@example.com',
            name: 'Thanh Long',
            phone: '+84 933 888 999',
            company: 'High-Tech Agricultural Zone',
            role: 'client',
            status: 'suspended',
            avatar: null,
            created_at: '2026-09-18T09:00:00Z',
            last_login: '2026-09-20T14:30:00Z',
          },
        ];

        this.saveStoredUsers(defaultUsers);
      }
    } catch {}
  }

  getUsers({ search = '', role = 'ALL', status = 'ALL' } = {}) {
    const all = this.getStoredUsers();
    const query = search.trim().toLowerCase();

    return all.filter((user) => {
      if (role !== 'ALL' && user.role !== role) return false;
      if (status !== 'ALL' && user.status !== status) return false;
      if (!query) return true;

      const nameMatch = (user.name || '').toLowerCase().includes(query);
      const emailMatch = (user.email || '').toLowerCase().includes(query);
      const phoneMatch = (user.phone || '').includes(query);
      const companyMatch = (user.company || '').toLowerCase().includes(query);

      return nameMatch || emailMatch || phoneMatch || companyMatch;
    });
  }

  getUserById(id) {
    const all = this.getStoredUsers();
    return all.find((u) => u.id === id || u.username === id || u.email === id) || null;
  }

  createUser(userData) {
    const all = this.getStoredUsers();
    // Validate uniqueness
    if (all.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error(`Email "${userData.email}" đã tồn tại trong hệ thống.`);
    }

    const newUser = {
      id: `usr_${userData.role}_${Date.now()}`,
      username: userData.username || userData.email.split('@')[0],
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      phone: userData.phone || '',
      company: userData.company || 'Doanh nghiệp cá nhân',
      role: userData.role || 'client',
      status: userData.status || 'active',
      avatar: null,
      created_at: new Date().toISOString(),
      last_login: null,
    };

    all.unshift(newUser);
    this.saveStoredUsers(all);
    return newUser;
  }

  updateUser(id, updates) {
    const all = this.getStoredUsers();
    const index = all.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error('User was not found.');
    }

    all[index] = {
      ...all[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.saveStoredUsers(all);
    return all[index];
  }

  toggleUserStatus(id) {
    const all = this.getStoredUsers();
    const index = all.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error('User was not found.');
    }

    const currentStatus = all[index].status;
    all[index].status = currentStatus === 'active' ? 'suspended' : 'active';
    all[index].updated_at = new Date().toISOString();

    this.saveStoredUsers(all);
    return all[index];
  }

  deleteUser(id) {
    const all = this.getStoredUsers();
    const filtered = all.filter((u) => u.id !== id);
    if (filtered.length === all.length) {
      throw new Error('User was not found.');
    }
    this.saveStoredUsers(filtered);
    return true;
  }

  getUserStats() {
    const all = this.getStoredUsers();
    return {
      total: all.length,
      admins: all.filter((u) => u.role === 'admin').length,
      clients: all.filter((u) => u.role === 'client').length,
      active: all.filter((u) => u.status === 'active').length,
      suspended: all.filter((u) => u.status === 'suspended').length,
    };
  }
}

export const adminUserService = new AdminUserService();
