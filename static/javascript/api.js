class Api {
  constructor(url) {
    this.baseUrl = url || '';
  }

  async response(res) {
    if (res.ok) {
      const data = await res.json();
      return data;
    } else {
      throw Error(data);
    }
  }

  options(method, body, headers) {
    return {
      method,
      headers: {
        'Content-Type': 'application/json',
        // credentials: 'include',
        ...headers,
      },
      body: JSON.stringify(body),
    };
  }

  async get(path) {
    const url = `${this.baseUrl}/${path}`;
    const res = await fetch(url);
    return this.response(res);
  }

  async post(path, body, header = {}) {
    const url = `${this.baseUrl}/${path}`;
    const res = await fetch(url, this.options('POST', body, header));
    return this.response(res);
  }

  async put(path, body, header = {}) {
    const url = `${this.baseUrl}/${path}`;
    const res = await fetch(url, this.options('PUT', body, header));
    return this.response(res);
  }

  async remove(path, header = {}) {
    const url = `${this.baseUrl}/${path}`;
    const options = this.options('DELETE', {}, header);
    const res = await fetch(url, options);
    return res; // this.response(res);
  }
}
