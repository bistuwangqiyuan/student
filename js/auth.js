const Auth = {
  save(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
      username: data.username,
      role: data.role,
    }));
  },

  getUser() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
  },

  requireRole(role) {
    const user = this.getUser();
    if (!user || user.role !== role) {
      window.location.href = '/index.html';
      return false;
    }
    return true;
  },
};
