// ============================================================
// SEJUKPRO - Supabase Configuration & Auth Client
// Shared config for website & admin dashboard
// ============================================================

const SUPABASE_URL = 'https://nyjoemwbnnbnztluvpkx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55am9lbXdibm5ibnp0bHV2cGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MjgwNjAsImV4cCI6MjEwNzIwNDA2MH0.m6unbNb87gfdhgdMhbksci3f6aZKJAAvTUJMYBTSaFo';
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
const SUPABASE_AUTH_URL = `${SUPABASE_URL}/auth/v1`;

const SESSION_STORAGE_KEY = 'sejukpro_admin_session';

// ============================================================
// Supabase Client Helper
// ============================================================

const supabase = {
  // Get active JWT token or fallback to anon key
  getAuthToken() {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return SUPABASE_ANON_KEY;
      const session = JSON.parse(raw);
      if (session && session.access_token) {
        // Cek jika expired (dengan margin 60 detik)
        if (session.expires_at && Date.now() / 1000 > session.expires_at - 60) {
          console.warn('[Supabase Auth] Sesi telah kadaluarsa');
        }
        return session.access_token;
      }
    } catch (e) {
      console.error('[Supabase Auth] Gagal membaca session token:', e);
    }
    return SUPABASE_ANON_KEY;
  },

  // Headers helper with dynamic Bearer token
  getHeaders(custom = {}) {
    const token = this.getAuthToken();
    return {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...custom
    };
  },

  // Handle unauthorized response
  handleUnauthorized() {
    this.auth.signOut(false);
    window.dispatchEvent(new CustomEvent('supabase:unauthorized'));
  },

  // ============================================================
  // AUTHENTICATION MODULE
  // ============================================================
  auth: {
    // Ambil session yang tersimpan
    getSession() {
      try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        // Validasi struktur session
        if (session && session.access_token && session.user) {
          return session;
        }
        return null;
      } catch (err) {
        return null;
      }
    },

    // Simpan session
    setSession(sessionData) {
      try {
        if (!sessionData) {
          localStorage.removeItem(SESSION_STORAGE_KEY);
          return;
        }
        // Simpan perkiraan expire time jika tidak ada
        if (!sessionData.expires_at && sessionData.expires_in) {
          sessionData.expires_at = Math.floor(Date.now() / 1000) + sessionData.expires_in;
        }
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
        window.dispatchEvent(new CustomEvent('supabase:auth-change', { detail: { session: sessionData } }));
      } catch (err) {
        console.error('[Supabase Auth] Error menyimpan session:', err);
      }
    },

    // Login dengan Email & Password via Supabase Auth REST API
    async signInWithPassword({ email, password }) {
      try {
        const res = await fetch(`${SUPABASE_AUTH_URL}/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: email.trim(), password })
        });

        const data = await res.json();

        if (!res.ok) {
          let errorMsg = data.error_description || data.msg || data.message || 'Login gagal';
          if (res.status === 400 && errorMsg.toLowerCase().includes('invalid login credentials')) {
            errorMsg = 'Email atau password salah. Silakan periksa kembali.';
          } else if (errorMsg.toLowerCase().includes('email not confirmed')) {
            errorMsg = 'Email belum dikonfirmasi di Supabase. Periksa inbox Anda atau matikan Confirm Email di Supabase Dashboard.';
          }
          throw new Error(errorMsg);
        }

        // Sukses: simpan session
        const session = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at || (Math.floor(Date.now() / 1000) + (data.expires_in || 3600)),
          user: data.user
        };

        this.setSession(session);
        return { data: { session, user: data.user }, error: null };
      } catch (err) {
        console.error('[Supabase Auth] signIn error:', err);
        return { data: null, error: err };
      }
    },

    // Registrasi Admin Baru (jika fitur pendaftaran diaktifkan)
    async signUp({ email, password, metadata = {} }) {
      try {
        const res = await fetch(`${SUPABASE_AUTH_URL}/signup`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
            data: { role: 'admin', ...metadata }
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error_description || data.msg || data.message || 'Pendaftaran admin gagal');
        }

        // Jika langsung dapat session
        if (data.access_token) {
          const session = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: data.expires_at,
            user: data.user
          };
          this.setSession(session);
        }

        return { data, error: null };
      } catch (err) {
        console.error('[Supabase Auth] signUp error:', err);
        return { data: null, error: err };
      }
    },

    // Logout
    async signOut(notifyServer = true) {
      try {
        const session = this.getSession();
        if (session && session.access_token && notifyServer && !session.is_demo) {
          await fetch(`${SUPABASE_AUTH_URL}/logout`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session.access_token}`
            }
          }).catch(() => {});
        }
      } catch (e) {
        // silent fail
      } finally {
        this.setSession(null);
        window.dispatchEvent(new CustomEvent('supabase:auth-change', { detail: { session: null } }));
      }
    },

    // Verifikasi token user ke Supabase Auth
    async getUser() {
      const session = this.getSession();
      if (!session || !session.access_token) return null;
      if (session.is_demo) return session.user;

      try {
        const res = await fetch(`${SUPABASE_AUTH_URL}/user`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!res.ok) {
          if (res.status === 401) {
            this.setSession(null);
            return null;
          }
          // Kembalikan user lokal jika jaringan offline sesaat
          return session.user;
        }

        const user = await res.json();
        // Update data user di session
        session.user = user;
        this.setSession(session);
        return user;
      } catch (err) {
        // Fallback ke cache user jika offline
        return session.user || null;
      }
    },

    // Mode Demo / Fallback Login (berguna jika admin belum setup auth di Supabase)
    signInDemo(email = 'admin@sejukpro.com') {
      const demoSession = {
        access_token: 'demo-admin-token-' + Date.now(),
        refresh_token: 'demo-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + (3600 * 24),
        is_demo: true,
        user: {
          id: 'demo-admin-id',
          email: email,
          user_metadata: { name: 'Admin Demo (Offline)', role: 'super_admin' },
          role: 'authenticated'
        }
      };
      this.setSession(demoSession);
      return { data: { session: demoSession, user: demoSession.user }, error: null };
    }
  },

  // ============================================================
  // REST API DATA METHODS (Menggunakan Auth Header yang Benar)
  // ============================================================

  // GET - Fetch data from table
  async select(table, query = '') {
    try {
      const url = `${SUPABASE_REST_URL}/${table}?${query}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (res.status === 401) {
        this.handleUnauthorized();
        throw new Error('Sesi berakhir atau Anda belum login (401 Unauthorized)');
      }
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Supabase SELECT error (${res.status}): ${errText}`);
      }
      return await res.json();
    } catch (err) {
      console.error(`[Supabase] select ${table}:`, err);
      throw err;
    }
  },

  // POST - Insert data
  async insert(table, data) {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/${table}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      if (res.status === 401) {
        this.handleUnauthorized();
        throw new Error('Sesi berakhir atau Anda belum login (401 Unauthorized)');
      }
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Supabase INSERT error (${res.status}): ${errText}`);
      }
      return await res.json();
    } catch (err) {
      console.error(`[Supabase] insert ${table}:`, err);
      throw err;
    }
  },

  // PATCH - Update data
  async update(table, matchQuery, data) {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/${table}?${matchQuery}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      if (res.status === 401) {
        this.handleUnauthorized();
        throw new Error('Sesi berakhir atau Anda belum login (401 Unauthorized)');
      }
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Supabase UPDATE error (${res.status}): ${errText}`);
      }
      return await res.json();
    } catch (err) {
      console.error(`[Supabase] update ${table}:`, err);
      throw err;
    }
  },

  // DELETE - Delete data
  async delete(table, matchQuery) {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/${table}?${matchQuery}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (res.status === 401) {
        this.handleUnauthorized();
        throw new Error('Sesi berakhir atau Anda belum login (401 Unauthorized)');
      }
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Supabase DELETE error (${res.status}): ${errText}`);
      }
      return true;
    } catch (err) {
      console.error(`[Supabase] delete ${table}:`, err);
      throw err;
    }
  }
};

// Pastikan global object tersedia
window.supabase = supabase;
window.SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY
};
