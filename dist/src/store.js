import {validateBackup} from './core.js';

export const emptyState = () => ({schemaVersion:1, revision:0, records:{}, sessions:[], activeExam:null, settings:{}});
const conflictMessage = '另一窗口已更新记录，请先导出本窗口备份，再刷新并导入合并';

// Atomic read/write transactions prevent stale tabs from overwriting progress.
export class BrowserDatabase {
  async open() {
    if (this.db) return this.db;
    this.db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('fde-study-online-v1', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('progress');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('请关闭其他学习窗口后重试'));
    });
    this.db.onversionchange = () => { this.db.close(); this.db = null; };
    return this.db;
  }
  async read() {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('progress', 'readonly');
      const request = transaction.objectStore('progress').get('current');
      transaction.oncomplete = () => resolve(request.result || emptyState());
      transaction.onabort = () => reject(transaction.error || new Error('读取学习记录失败'));
    });
  }
  async write(snapshot, revision) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('progress', 'readwrite');
      const records = transaction.objectStore('progress');
      const request = records.get('current');
      let conflict = false;
      request.onsuccess = () => {
        if ((request.result?.revision || 0) !== revision) {
          conflict = true;
          transaction.abort();
          return;
        }
        records.put({...snapshot, revision:revision + 1}, 'current');
      };
      transaction.oncomplete = () => resolve(revision + 1);
      transaction.onabort = () => reject(conflict ? new Error(conflictMessage) : transaction.error || new Error('浏览器保存失败'));
    });
  }
}

export class Store {
  constructor(database = new BrowserDatabase()) {
    this.database=database; this.state=null; this.queue=Promise.resolve();
    this.onStatus=()=>{}; this.failed=false; this.pending=0;
    this.message='进度自动保存在此浏览器';
  }
  status(message, error=false) {
    this.message=message;
    this.onStatus(message, error);
  }
  async load() {
    this.state=validateBackup(await this.database.read());
    this.revision=this.state.revision || 0;
    return this.state;
  }
  save() {
    const snapshot=structuredClone(this.state);
    this.pending++;
    this.status('正在保存…');
    this.queue=this.queue.then(async()=>{
      validateBackup(snapshot);
      this.revision=await this.database.write(snapshot,this.revision);
      this.state.revision=this.revision;
      this.failed=false;
    }).catch(error=>{
      this.failed=true;
      this.status((error.name==='QuotaExceededError'?'浏览器空间不足':error.message)+' · 请导出备份',true);
    }).finally(()=>{
      this.pending--;
      if (!this.pending && !this.failed) this.status('已保存到此浏览器');
    });
    return this.queue;
  }
}
