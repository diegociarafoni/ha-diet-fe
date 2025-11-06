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
  constructor(private toast: ToastService, private translate: TranslateService) {
    // load initial language pack only in the browser (avoid SSR fetch)
    if (typeof window !== 'undefined') {
      this.translate.use(this.translate.current).catch(() => {});
    }
  }
  setLang(lang: string) { this.translate.use(lang); }
  get toasts$() { return this.toast.toasts$; }
}
