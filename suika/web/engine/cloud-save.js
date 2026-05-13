// cloud-save.js — Cloud save sync via Supabase
// Local-first: saves to localStorage immediately, syncs to cloud in background

const SUPABASE_URL = "https://ynecezxnltigplrfzzoh.supabase.co";
const SUPABASE_KEY = "sb_publishable_seKZakec1yB046vlgPDAKQ_zd4CKIg4";

export class CloudSave {
  constructor() {
    this.deviceId = this._getOrCreateDeviceId();
    this.isAdmin = localStorage.getItem('deviceRole') === 'admin';
    this.syncing = false;
    this.lastSyncError = null;
  }

  _getOrCreateDeviceId() {
    let id = localStorage.getItem('suika_device_id');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : 
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
      localStorage.setItem('suika_device_id', id);
    }
    return id;
  }

  async _fetch(path, options = {}) {
    const url = `${SUPABASE_URL}/rest/v1/${path}`;
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=minimal',
      ...options.headers,
    };
    try {
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
      }
      if (options.prefer === 'return=representation' || options.expectJson) {
        return await res.json();
      }
      return null;
    } catch (e) {
      this.lastSyncError = e.message;
      console.warn('CloudSave error:', e.message);
      return null;
    }
  }

  // Upload save data to cloud (background, non-blocking)
  async upload(saveData) {
    if (this.syncing) return;
    this.syncing = true;
    this.lastSyncError = null;

    try {
      const payload = {
        device_id: this.deviceId,
        save_data: saveData,
        updated_at: new Date().toISOString(),
      };

      // Upsert: insert or update based on device_id
      await this._fetch('suika_saves?on_conflict=device_id', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Prefer': 'resolution=merge-duplicates' },
      });
    } finally {
      this.syncing = false;
    }
  }

  // Download save data from cloud (for this device)
  async download() {
    const result = await this._fetch(
      `suika_saves?device_id=eq.${this.deviceId}&select=save_data,updated_at&limit=1`,
      { method: 'GET', expectJson: true }
    );
    if (result && result.length > 0) {
      return result[0].save_data;
    }
    return null;
  }

  // List all saves (admin only)
  async listAll() {
    if (!this.isAdmin) return [];
    const result = await this._fetch(
      'suika_saves?select=device_id,updated_at,save_data&order=updated_at.desc',
      { method: 'GET', expectJson: true }
    );
    return result || [];
  }

  // Load a specific device's save (admin only)
  async loadDevice(deviceId) {
    if (!this.isAdmin) return null;
    const result = await this._fetch(
      `suika_saves?device_id=eq.${deviceId}&select=save_data&limit=1`,
      { method: 'GET', expectJson: true }
    );
    if (result && result.length > 0) {
      return result[0].save_data;
    }
    return null;
  }
}
