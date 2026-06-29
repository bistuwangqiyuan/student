const api = {
  async request(method, url, body, auth = true) {
    const headers = { 'Content-Type': 'application/json; charset=utf-8' };

    if (auth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = 'Bearer ' + token;
      }
    }

    const options = { method, headers };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    const data = await res.json();

    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
        window.location.href = '/index.html';
      }
      throw new Error(data.error || '登录已过期，请重新登录');
    }

    if (!data.success) {
      throw new Error(data.error || '请求失败');
    }

    return data;
  },

  get(url, auth = true) {
    return this.request('GET', url, undefined, auth);
  },

  post(url, body, auth = true) {
    return this.request('POST', url, body, auth);
  },

  put(url, body, auth = true) {
    return this.request('PUT', url, body, auth);
  },

  delete(url, auth = true) {
    return this.request('DELETE', url, undefined, auth);
  },
};
