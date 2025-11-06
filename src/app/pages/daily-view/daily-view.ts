import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DietService } from '../../services/diet';
import { ToastService } from '../../services/toast.service';
import { MealCard } from '../../components/shared/meal-card/meal-card';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-daily-view',
  standalone: true,
  imports: [CommonModule, MealCard],
  templateUrl: './daily-view.html',
  styleUrls: ['./daily-view.scss'],
})
export class DailyView implements OnInit, OnDestroy {
  date = new Date().toISOString().slice(0,10);
  dayData: any = null;
  loading = false;
  private subs = new Subscription();

  constructor(public diet: DietService, private toast: ToastService) {}

  canWriteProfile(): boolean {
    const caps = this.diet.getCapabilitiesCached();
    const pid = this.diet.getActiveProfileId();
    if (!caps || pid == null) return false;
    const p = caps.profiles.find((x) => x.profile_id === pid);
    return !!p?.can_write;
  }

  ngOnInit(): void {
    this.subs.add(
      this.diet.activeProfileObservable().subscribe((profileId) => {
        if (!profileId) { this.dayData = null; return; }
        this.loadDay(profileId, this.date);
      })
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  async loadDay(profileId: number, date: string) {
    this.loading = true;
    try {
      this.dayData = await this.diet.getDay(profileId, date);
    } catch (err) {
      console.error('Errore getDay', err);
      this.dayData = null;
    } finally { this.loading = false; }
  }

  async onDateChange(ev: any) {
    this.date = ev.target.value;
    const pid = this.diet.getActiveProfileId();
    if (pid) await this.loadDay(pid, this.date);
  }

  async setHunger(score: number) {
    const pid = this.diet.getActiveProfileId();
    if (!pid) return;
    try {
      await this.diet.setHunger(pid, this.date, score);
      await this.loadDay(pid, this.date);
  } catch (err) { console.error(err); this.toast.show('Errore setHunger'); }
  }

  async toggleSnack(period: 'am'|'pm', done: boolean) {
    const pid = this.diet.getActiveProfileId();
    if (!pid) return;
    try {
      await this.diet.setSnack(pid, this.date, period, done);
      await this.loadDay(pid, this.date);
  } catch (err) { console.error(err); this.toast.show('Errore setSnack'); }
  }

  async onChoose(meal: any, payload: any) {
    const pid = this.diet.getActiveProfileId();
    if (!pid) return;
    try {
      if (payload.source === 'free') {
        const title = prompt('Titolo pasto free:');
        const notes = prompt('Note (opzionale):');
        await this.diet.setChoice(pid, this.date, meal.meal_type, 'free', title || undefined, notes || undefined);
      } else if (payload.source === 'alternative') {
        const altId = prompt('ID alternativa (se nota):');
        await this.diet.setChoice(pid, this.date, meal.meal_type, 'alternative', undefined, undefined);
      } else {
        await this.diet.setChoice(pid, this.date, meal.meal_type, payload.source);
      }
      await this.loadDay(pid, this.date);
  } catch (err) { console.error(err); this.toast.show('Errore setChoice'); }
  }
}
