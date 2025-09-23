import { Get, Paths } from '@/type';
import { get, isEqual, merge, set } from 'lodash-es';

interface Setting {
  vsc: {
    configPath: string;
    executorPath: string;
    stars: string[];
  };
}

const DEFAULT_SETTING: Setting = {
  vsc: {
    configPath: '',
    executorPath: '',
    stars: [],
  },
};

type SettingsPath = Paths<Setting>;
type SettingCallback<T extends SettingsPath, V = void> = (
  newValue: Get<Setting, T>,
  oldValue: Get<Setting, T>,
) => V;
type Listeners = {
  [K in SettingsPath]?: Set<SettingCallback<K>>;
};

const SETTINGS_DOC_KEY = 'vsc:setting';

class SettingStore {
  private settings: Setting;
  private listeners: Listeners = {};
  // private instanceListeners: WeakMap<object, Set<() => void>> = new WeakMap();
  private pendingListeners: Map<SettingsPath, Set<SettingCallback<any>>> = new Map();
  private isNotifying = false;

  constructor() {
    this.loadSettings();
  }

  loadSettings() {
    const item = rubick.dbStorage.getItem(SETTINGS_DOC_KEY);
    this.settings = merge(DEFAULT_SETTING, item, {});
  }

  saveSettings() {
    rubick.dbStorage.setItem(SETTINGS_DOC_KEY, this.settings);
  }

  get<T extends SettingsPath>(path: T): Get<Setting, T> {
    return get(this.settings, path) as Get<Setting, T>;
  }

  set<T extends SettingsPath>(path: T, newValue: Get<Setting, T>) {
    const oldValue = get(this.settings, path);
    if (isEqual(oldValue, newValue)) {
      return;
    }
    set(this.settings, path, newValue);
    console.log('Setting changed:', path, get(this.settings, path));
    this.notify(path, newValue, oldValue);
    this.saveSettings();
  }

  private notify<T extends SettingsPath>(
    path: T,
    newValue: Get<Setting, T>,
    oldValue: Get<Setting, T>,
  ) {
    try {
      this.isNotifying = true;
      for (const listenerPath in this.listeners) {
        if (!path.startsWith(listenerPath)) continue;
        const callbacks = this.listeners[listenerPath as SettingsPath] as Listeners[T];
        if (!callbacks) continue;
        const callbacksSnapshot = new Set(callbacks);
        callbacksSnapshot.forEach((callback) => {
          try {
            callback(newValue, oldValue);
          } catch (error) {
            console.error(`Error in setting listener for path "${listenerPath}":`, error);
          }
        });
      }
    } finally {
      this.isNotifying = false;
      this.pendingListeners.forEach((newCallbacks, path) => {
        this.listeners[path] ??= new Set<SettingCallback<any>>();
        newCallbacks.forEach((callback) => {
          this.listeners[path]!.add(callback);
        });
      });
      this.pendingListeners.clear();
    }
  }

  on<T extends SettingsPath>(path: T, callback: SettingCallback<T>) {
    if (this.isNotifying) {
      if (!this.pendingListeners.has(path)) {
        this.pendingListeners.set(path, new Set());
      }
      this.pendingListeners.get(path)!.add(callback);
    } else {
      this.listeners[path] ??= new Set<SettingCallback<any>>();
      this.listeners[path]!.add(callback);
    }

    const unsubscribe = () => this.off(path, callback);
    return unsubscribe;
  }

  off<T extends SettingsPath>(path: T, callback: SettingCallback<T>): void {
    this.listeners[path]?.delete(callback);
    this.pendingListeners.get(path)?.delete(callback);
  }
}

export default new SettingStore();
export type { Setting, SettingsPath, SettingCallback, SettingStore };
