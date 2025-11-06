import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-meal-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meal-card.html',
  styleUrls: ['./meal-card.scss']
})
export class MealCard {
  @Input() meal: any | null = null;
  @Input() canWrite = false;

  @Output() chooseSource = new EventEmitter<{ source: string; alternativeId?: number; title?: string; notes?: string }>();
  @Output() requestSwap = new EventEmitter<void>();
  @Output() requestCopy = new EventEmitter<void>();

  get title() {
    return this.meal?.chosen?.title || this.meal?.proposed?.title || '—';
  }

  get badge() {
    if (!this.meal) return '';
    if (this.meal.chosen?.source === 'free') return 'FREE';
    if (this.meal.chosen?.source === 'skip') return 'SKIPPED';
    if (this.meal.chosen) return 'PLANNED';
    if (this.meal.proposed) return 'ALT';
    return '';
  }

  doChoose(source: string) { this.chooseSource.emit({ source }); }
  doSwap() { this.requestSwap.emit(); }
  doCopy() { this.requestCopy.emit(); }

  // hint for swipe discoverability
  showSwipeHint = false;

  // --- swipe handling (pointer events) ---
  private pointerId: number | null = null;
  private startX = 0;
  private startY = 0;
  isSwiping = false;
  swipeTransform = '';

  onPointerDown(ev: PointerEvent) {
    // only handle primary pointer
    this.pointerId = ev.pointerId;
    this.startX = ev.clientX;
    this.startY = ev.clientY;
    this.isSwiping = false;
    // capture pointer so we continue to receive moves
    try { (ev.target as Element).setPointerCapture(this.pointerId); } catch (e) {}
    // dismiss hint on first interaction
    if (this.showSwipeHint) {
      this.showSwipeHint = false;
      try { localStorage.setItem('ha-diet-swipe-hint-dismissed', '1'); } catch (e) {}
    }
  }

  onPointerMove(ev: PointerEvent) {
    if (this.pointerId !== ev.pointerId) return;
    const dx = ev.clientX - this.startX;
    const dy = ev.clientY - this.startY;
    // start horizontal swipe if horizontal movement dominates
    if (!this.isSwiping) {
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        this.isSwiping = true;
      } else {
        return;
      }
    }
    // only allow left swipe visual
    const clamped = Math.max(Math.min(dx, 40), -120);
    this.swipeTransform = `translateX(${clamped}px)`;
  }

  onPointerUp(ev: PointerEvent) {
    if (this.pointerId !== ev.pointerId) return;
    const dx = ev.clientX - this.startX;
    // threshold for swipe action
    const threshold = 60;
    if (this.isSwiping && dx < -threshold) {
      // trigger swap only if writable
      if (this.canWrite) {
        this.requestSwap.emit();
      }
    }
    this.resetSwipeState();
    try { (ev.target as Element).releasePointerCapture(ev.pointerId); } catch (e) {}
  }

  onPointerCancel(ev: PointerEvent) {
    if (this.pointerId !== ev.pointerId) return;
    this.resetSwipeState();
  }

  private resetSwipeState() {
    this.pointerId = null;
    this.startX = 0;
    this.startY = 0;
    this.isSwiping = false;
    this.swipeTransform = '';
  }

  ngOnInit(): void {
    try {
      const dismissed = localStorage.getItem('ha-diet-swipe-hint-dismissed');
      if (!dismissed) {
        this.showSwipeHint = true;
        setTimeout(() => { this.showSwipeHint = false; try { localStorage.setItem('ha-diet-swipe-hint-dismissed', '1'); } catch (e) {} }, 4000);
      }
    } catch (e) {
      // ignore localStorage errors
    }
  }
}

