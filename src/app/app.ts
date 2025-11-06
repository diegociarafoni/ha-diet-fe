import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProfileSelector } from './components/profile-selector/profile-selector';
import { CommonModule } from '@angular/common';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ProfileSelector],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ha-diet-fe');
  constructor(private toast: ToastService) {}
  get toasts$() { return this.toast.toasts$; }
}
