import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Budget } from '../models/budget.model';
import { Category } from '../models/category.model';
import { AppSettings } from '../models/settings.model';
import { Transaction } from '../models/transaction.model';
import { SERENO_DB_NAME, SERENO_DB_VERSION, SERENO_STORES } from './database.schema';

@Injectable({ providedIn: 'root' })
export class SerenoDatabase {
  private readonly platformId = inject(PLATFORM_ID);
  private database: IDBDatabase | null = null;

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  async open(): Promise<void> {
    if (!this.isBrowser || this.database) {
      return;
    }

    this.database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(SERENO_DB_NAME, SERENO_DB_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(SERENO_STORES.categories)) {
          database.createObjectStore(SERENO_STORES.categories, { keyPath: 'id' });
        }

        if (!database.objectStoreNames.contains(SERENO_STORES.transactions)) {
          const store = database.createObjectStore(SERENO_STORES.transactions, { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('categoryId', 'categoryId', { unique: false });
        }

        if (!database.objectStoreNames.contains(SERENO_STORES.budgets)) {
          const store = database.createObjectStore(SERENO_STORES.budgets, { keyPath: 'id' });
          store.createIndex('month', 'month', { unique: false });
        }

        if (!database.objectStoreNames.contains(SERENO_STORES.settings)) {
          database.createObjectStore(SERENO_STORES.settings, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
    });
  }

  async getAllCategories(): Promise<Category[]> {
    return this.readAll<Category>(SERENO_STORES.categories);
  }

  async putCategory(category: Category): Promise<void> {
    await this.put(SERENO_STORES.categories, category);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return this.readAll<Transaction>(SERENO_STORES.transactions);
  }

  async putTransaction(transaction: Transaction): Promise<void> {
    await this.put(SERENO_STORES.transactions, transaction);
  }

  async getAllBudgets(): Promise<Budget[]> {
    return this.readAll<Budget>(SERENO_STORES.budgets);
  }

  async putBudget(budget: Budget): Promise<void> {
    await this.put(SERENO_STORES.budgets, budget);
  }

  async getSettings(): Promise<AppSettings | null> {
    return this.readByKey<AppSettings>(SERENO_STORES.settings, 'app');
  }

  async putSettings(settings: AppSettings): Promise<void> {
    await this.put(SERENO_STORES.settings, settings);
  }

  async clearAll(): Promise<void> {
    await Promise.all([
      this.clearStore(SERENO_STORES.categories),
      this.clearStore(SERENO_STORES.transactions),
      this.clearStore(SERENO_STORES.budgets),
      this.clearStore(SERENO_STORES.settings),
    ]);
  }

  private async readAll<T>(storeName: string): Promise<T[]> {
    const database = await this.getDatabase();

    return new Promise<T[]>((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve((request.result as T[]) ?? []);
      request.onerror = () => reject(request.error ?? new Error(`Read failed for ${storeName}`));
    });
  }

  private async readByKey<T>(storeName: string, key: string): Promise<T | null> {
    const database = await this.getDatabase();

    return new Promise<T | null>((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
      request.onerror = () => reject(request.error ?? new Error(`Read failed for ${storeName}`));
    });
  }

  private async put(storeName: string, value: unknown): Promise<void> {
    const database = await this.getDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error(`Write failed for ${storeName}`));
    });
  }

  private async clearStore(storeName: string): Promise<void> {
    const database = await this.getDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error(`Clear failed for ${storeName}`));
    });
  }

  private async getDatabase(): Promise<IDBDatabase> {
    if (!this.isBrowser) {
      throw new Error('IndexedDB is only available in the browser');
    }

    if (!this.database) {
      await this.open();
    }

    if (!this.database) {
      throw new Error('IndexedDB is not initialized');
    }

    return this.database;
  }
}
