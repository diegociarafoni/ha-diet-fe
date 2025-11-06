import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProfileSelector } from './components/profile-selector/profile-selector';
import { CommonModule } from '@angular/common';
import { ToastService } from './services/toast.service';
import { TranslatePipe } from './pipes/translate.pipe';
import { TranslateService } from './services/translate.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ProfileSelector, TranslatePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ha-diet-fe');
  // whether the app appears to be running inside Home Assistant (approx)
  inHomeAssistant = false;

  constructor(private toast: ToastService, private translate: TranslateService) {
    // load initial language pack only in the browser (avoid SSR fetch)
    if (typeof window !== 'undefined') {
      try {
        const hasTokens = !!localStorage.getItem('hassTokens');
        this.inHomeAssistant = hasTokens;
        if (hasTokens) {
          // try to fetch HA language and use it; fallback to current if it fails
          this.translate.useHomeAssistantLanguageIfAvailable()
            .catch(() => {})
            .finally(() => {
              // ensure we at least have a language loaded
              if (!this.translate.current) this.translate.use(this.translate.current).catch(() => {});
            });
        } else {
          this.translate.use(this.translate.current).catch(() => {});
        }
      } catch (e) {
        this.translate.use(this.translate.current).catch(() => {});
      }
    }
  }
  setLang(lang: string) { this.translate.use(lang); }
  get toasts$() { return this.toast.toasts$; }
}
