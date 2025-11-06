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
