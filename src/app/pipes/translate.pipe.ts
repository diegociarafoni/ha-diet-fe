import { Pipe, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslateService } from '../services/translate.service';
import { Subscription } from 'rxjs';

@Pipe({ name: 'translate', standalone: true })
export class TranslatePipe implements OnDestroy {
  private sub: Subscription;
  private lastLang = '';

  constructor(private svc: TranslateService, private cd: ChangeDetectorRef) {
    this.sub = this.svc.currentLang$.subscribe((l) => {
      this.lastLang = l;
      this.cd.markForCheck();
    });
  }

  transform(key: string, params?: Record<string, any>): string {
    return this.svc.instant(key, params);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
