import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DietService } from '../../services/diet';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-common-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './common-view.html',
  styleUrls: ['./common-view.scss'],
})
export class CommonView implements OnInit, OnDestroy {
  profiles: any[] = [];
  selected: number[] = [];
  upcoming: any[] = [];
  private subs = new Subscription();
  private timerId: any = null;

  constructor(private diet: DietService) {}

  ngOnInit(): void {
    const caps = this.diet.getCapabilitiesCached();
    if (caps) {
      this.profiles = caps.profiles.filter((p: any) => p.can_read);
      // default select subject_profile_id if present
      if (caps.subject_profile_id) this.selected = [caps.subject_profile_id];
    }
    this.refresh();
    this.timerId = setInterval(() => this.refresh(), 5 * 60 * 1000);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.timerId) clearInterval(this.timerId);
  }

  async refresh() {
    if (!this.selected || this.selected.length === 0) { this.upcoming = []; return; }
    try {
      this.upcoming = await this.diet.getNextMeals(this.selected, 36);
    } catch (err) { console.error('Errore getNextMeals', err); }
  }

  toggleProfile(id: number, checked: boolean) {
    if (checked) this.selected.push(id); else this.selected = this.selected.filter((x) => x !== id);
    this.refresh();
  }
}
