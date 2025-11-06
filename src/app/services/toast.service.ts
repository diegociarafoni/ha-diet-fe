import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Toast = { id: number; message: string };

@Injectable({ providedIn: 'root' })
export class ToastService {
  private list = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.list.asObservable();
  private id = 1;

  show(message: string, ms = 4000) {
    const t = { id: this.id++, message };
    const cur = this.list.value;
    this.list.next([...cur, t]);
    setTimeout(() => this.remove(t.id), ms);
  }

  remove(id: number) {
    const cur = this.list.value.filter((t) => t.id !== id);
    this.list.next(cur);
  }
}
