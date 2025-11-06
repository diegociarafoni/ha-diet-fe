import { Component, EventEmitter, Input, Output } from '@angular/core';
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
}

