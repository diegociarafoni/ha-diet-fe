import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Dict = Record<string, string>;

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private lang$ = new BehaviorSubject<string>('it');
  private cache: Record<string, Dict> = {};

  currentLang$ = this.lang$.asObservable();

  constructor() {
    // prefer navigator language when available
    try {
      const nav = (navigator && (navigator.language || (navigator as any).userLanguage)) || 'it';
      const code = nav.slice(0,2);
      if (code === 'en') this.lang$.next('en');
    } catch (e) {}
  }

  /**
   * Try to detect language from Home Assistant when running inside HA.
   * Reads the HA token from localStorage (hassTokens) and calls /api/config
   * to obtain the configured language. If successful, loads that language.
   * Returns true when a HA language was detected and loaded, false otherwise.
   */
  async useHomeAssistantLanguageIfAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem('hassTokens');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      const token = parsed?.access_token || parsed?.token;
      if (!token) return false;

      const res = await fetch('/api/config', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return false;
      const cfg = await res.json();
      // Home Assistant typically uses language like 'en' or 'it' or locales like 'en-US'
      const langRaw = cfg?.language || cfg?.default_locale || cfg?.locale || '';
      if (!langRaw) return false;
      const lang = String(langRaw).slice(0,2);
      // load the language pack (falls back inside use() if missing)
      await this.use(lang);
      return true;
    } catch (e) {
      console.warn('TranslateService: failed to detect HA language', e);
      return false;
    }
  }

  get current() { return this.lang$.value; }

  async use(lang: string) {
    if (this.cache[lang]) {
      this.lang$.next(lang);
      return;
    }
    try {
      const res = await fetch(`/assets/i18n/${lang}.json`);
      const json = await res.json();
      this.cache[lang] = json;
      this.lang$.next(lang);
    } catch (e) {
      console.warn('TranslateService: failed to load', lang, e);
    }
  }

  instant(key: string, params?: Record<string, any>): string {
    const dict = this.cache[this.current] || {};
    let found = dict[key] ?? key;
    if (params) {
      Object.keys(params).forEach(k => {
        found = found.split(`{${k}}`).join(String(params[k]));
      });
    }
    return found;
  }
}
