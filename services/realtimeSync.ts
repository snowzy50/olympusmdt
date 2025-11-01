/**
 * Service de synchronisation temps réel pour OlympusMDT
 * Gère le cache en mémoire + localStorage avec pub/sub pattern
 * Synchronisation multi-tab via storage events
 *
 * Créé par Snowzy - 2025
 */

type DataType = 'cases' | 'complaints' | 'summons' | 'equipment' | 'warrants' | 'agents' | 'citizens';

interface Subscription {
  callback: (payload: { type: DataType; data: any[] }) => void;
}

interface CacheData {
  [key: string]: any[];
}

class RealtimeSyncService {
  private static instance: RealtimeSyncService;
  private cache: CacheData = {};
  private subscriptions: Map<DataType, Set<Subscription>> = new Map();
  private debounceTimers: Map<DataType, NodeJS.Timeout> = new Map();
  private readonly DEBOUNCE_DELAY = 100;
  private isInitialized = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeFromLocalStorage();
      this.setupStorageListener();
    }
  }

  public static getInstance(): RealtimeSyncService {
    if (!RealtimeSyncService.instance) {
      RealtimeSyncService.instance = new RealtimeSyncService();
    }
    return RealtimeSyncService.instance;
  }

  private initializeFromLocalStorage(): void {
    const types: DataType[] = ['cases', 'complaints', 'summons', 'equipment', 'warrants', 'agents', 'citizens'];

    types.forEach(type => {
      try {
        const stored = localStorage.getItem(`mdt_${type}`);
        if (stored) {
          this.cache[type] = JSON.parse(stored);
        } else {
          this.cache[type] = [];
        }
      } catch (error) {
        console.error(`Error loading ${type} from localStorage:`, error);
        this.cache[type] = [];
      }
    });

    this.isInitialized = true;
  }

  private setupStorageListener(): void {
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('mdt_')) {
        const type = e.key.replace('mdt_', '') as DataType;

        try {
          const newData = e.newValue ? JSON.parse(e.newValue) : [];
          this.cache[type] = newData;
          this.notifySubscribers(type);
        } catch (error) {
          console.error(`Error syncing ${type} from storage event:`, error);
        }
      }
    });
  }

  private saveToLocalStorage(type: DataType): void {
    const timer = this.debounceTimers.get(type);
    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(() => {
      try {
        localStorage.setItem(`mdt_${type}`, JSON.stringify(this.cache[type] || []));
      } catch (error) {
        console.error(`Error saving ${type} to localStorage:`, error);
      }
    }, this.DEBOUNCE_DELAY);

    this.debounceTimers.set(type, newTimer);
  }

  private notifySubscribers(type: DataType): void {
    const subs = this.subscriptions.get(type);
    if (subs) {
      const data = this.cache[type] || [];
      subs.forEach(sub => {
        try {
          sub.callback({ type, data });
        } catch (error) {
          console.error(`Error in subscription callback for ${type}:`, error);
        }
      });
    }
  }

  public getData(type: DataType): any[] {
    return this.cache[type] || [];
  }

  public addItem(type: DataType, item: any): void {
    if (!this.cache[type]) {
      this.cache[type] = [];
    }

    const newItem = {
      ...item,
      id: item.id || this.generateId(type),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.cache[type] = [newItem, ...this.cache[type]];
    this.saveToLocalStorage(type);
    this.notifySubscribers(type);
  }

  public updateItem(type: DataType, id: string | number, updates: Partial<any>): void {
    if (!this.cache[type]) {
      return;
    }

    const index = this.cache[type].findIndex(item => item.id === id);
    if (index !== -1) {
      this.cache[type][index] = {
        ...this.cache[type][index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      this.saveToLocalStorage(type);
      this.notifySubscribers(type);
    }
  }

  public deleteItem(type: DataType, id: string | number): void {
    if (!this.cache[type]) {
      return;
    }

    this.cache[type] = this.cache[type].filter(item => item.id !== id);
    this.saveToLocalStorage(type);
    this.notifySubscribers(type);
  }

  public subscribe(type: DataType, callback: (payload: { type: DataType; data: any[] }) => void): () => void {
    if (!this.subscriptions.has(type)) {
      this.subscriptions.set(type, new Set());
    }

    const subscription: Subscription = { callback };
    this.subscriptions.get(type)!.add(subscription);

    // Appel initial avec les données actuelles
    callback({ type, data: this.cache[type] || [] });

    // Retourne la fonction de désabonnement
    return () => {
      const subs = this.subscriptions.get(type);
      if (subs) {
        subs.delete(subscription);
      }
    };
  }

  private generateId(type: DataType): string {
    const prefix = type.toUpperCase().substring(0, 3);
    const year = new Date().getFullYear();
    const existing = this.cache[type] || [];
    const maxId = existing.reduce((max, item) => {
      if (item.id && typeof item.id === 'string') {
        const match = item.id.match(/-(\d+)$/);
        if (match) {
          const num = parseInt(match[1]);
          return Math.max(max, num);
        }
      }
      return max;
    }, 0);

    const nextId = maxId + 1;
    return `${prefix}-${year}-${String(nextId).padStart(3, '0')}`;
  }

  public clearAll(): void {
    const types: DataType[] = ['cases', 'complaints', 'summons', 'equipment', 'warrants', 'agents', 'citizens'];

    types.forEach(type => {
      this.cache[type] = [];
      try {
        localStorage.removeItem(`mdt_${type}`);
      } catch (error) {
        console.error(`Error clearing ${type}:`, error);
      }
      this.notifySubscribers(type);
    });
  }

  public invalidate(type: DataType): void {
    this.cache[type] = [];
    try {
      localStorage.removeItem(`mdt_${type}`);
    } catch (error) {
      console.error(`Error invalidating ${type}:`, error);
    }
    this.notifySubscribers(type);
  }

  public stats(type: DataType): { total: number; recent: number } {
    const data = this.cache[type] || [];
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const recent = data.filter(item => {
      if (item.updatedAt) {
        return new Date(item.updatedAt) > fiveMinutesAgo;
      }
      return false;
    }).length;

    return {
      total: data.length,
      recent,
    };
  }

  public debug(): void {
    console.log('=== RealtimeSync Debug Info ===');
    console.log('Cache:', this.cache);
    console.log('Subscriptions:', this.subscriptions);
    console.log('Initialized:', this.isInitialized);

    Object.keys(this.cache).forEach(type => {
      const stats = this.stats(type as DataType);
      console.log(`${type}:`, stats);
    });
  }
}

// Export singleton instance
const realtimeSync = RealtimeSyncService.getInstance();

// Exposer dans window pour debug
if (typeof window !== 'undefined') {
  (window as any).mdtSync = realtimeSync;
}

export default realtimeSync;
