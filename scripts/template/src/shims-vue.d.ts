import { SettingStore } from '@/utils';

declare module 'vue' {
  interface ComponentCustomProperties {
    $s: SettingStore;
  }
}
