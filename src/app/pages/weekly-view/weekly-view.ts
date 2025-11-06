import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DietService } from '../../services/diet';
import { ToastService } from '../../services/toast.service';
import { Subscription, switchMap, of } from 'rxjs';
import { MealCard } from '../../components/shared/meal-card/meal-card';

@Component({
  selector: 'app-weekly-view',
  standalone: true,
  imports: [CommonModule, MealCard],
  templateUrl: './weekly-view.html',
  styleUrls: ['./weekly-view.scss'],
})
export class WeeklyView implements OnInit, OnDestroy {
  week: any = null;
  loading = false;
  private subs = new Subscription();
  currentMondayISO = this.getMondayISO(new Date());
  // swap state: holds the meal currently being swapped and candidate target dates
  swapState: { meal?: any; candidates?: string[] } = {};

  constructor(private diet: DietService, private toast: ToastService) {}

  ngOnInit(): void {
    // ricarica la settimana quando cambia il profilo attivo
    this.subs.add(
      this.diet.activeProfileObservable()
        .pipe(
          switchMap((profileId) => {
            if (!profileId) return of(null as any);
            this.loading = true;
            return this.diet.getWeek(profileId, this.currentMondayISO) as any;
          })
        )
        .subscribe({
          next: (w) => { this.week = w; this.loading = false; },
          error: (err) => { console.error('Errore fetching week', err); this.loading = false; }
        })
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  private getMondayISO(d: Date) {
    const day = d.getDay();
    const diff = (day + 6) % 7; // number of days since Monday
    const monday = new Date(d);
    monday.setDate(d.getDate() - diff);
    monday.setHours(0,0,0,0);
    return monday.toISOString().slice(0,10);
  }

  get canWrite(): boolean {
    const caps = this.diet.getCapabilitiesCached();
    const pid = this.diet.getActiveProfileId();
    if (!caps || pid == null) return false;
    const p = caps.profiles.find((x) => x.profile_id === pid);
    return !!p?.can_write;
  }

  async onSwap(meal: any) {
    const pid = this.diet.getActiveProfileId();
  if (!pid) { this.toast.show('Nessun profilo attivo'); return; }
    const dateFrom = meal.date;
    const dateTo = prompt('Inserisci data di destinazione (YYYY-MM-DD) — deve essere successiva nella stessa settimana');
    if (!dateTo) return;
    try {
      const dFrom = new Date(dateFrom);
      const dTo = new Date(dateTo);
  if (dTo <= dFrom) { this.toast.show('La data di destinazione deve essere successiva'); return; }
      // semplice check: same week start
      const weekStart = this.getMondayISO(new Date());
  const monday = new Date(weekStart);
      const end = new Date(monday);
      end.setDate(monday.getDate() + 6);
  if (dTo < monday || dTo > end) { this.toast.show('La data di destinazione deve essere nella stessa settimana'); return; }
      await this.diet.swapMeal(pid, dateFrom, dateTo, meal.meal_type);
      // refresh
      const mondayIso = this.getMondayISO(new Date());
      this.week = await this.diet.getWeek(pid, mondayIso);
  this.toast.show('Scambio effettuato');
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Errore nello scambio');
    }
  }

  startSwap(meal: any) {
    // compute candidate dates: days after meal.date in the same week (Monday..Sunday)
    const weekStart = new Date(this.currentMondayISO);
    const candidates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const iso = d.toISOString().slice(0,10);
      if (iso > meal.date) candidates.push(iso);
    }
    this.swapState = { meal, candidates };
  }

  async confirmSwap(targetDate: string) {
    if (!this.swapState.meal) return;
    const meal = this.swapState.meal;
    const pid = this.diet.getActiveProfileId();
    if (!pid) { this.toast.show('Nessun profilo attivo'); this.swapState = {}; return; }
    try {
      await this.diet.swapMeal(pid, meal.date, targetDate, meal.meal_type);
      this.toast.show('Scambio effettuato');
      this.swapState = {};
      this.week = await this.diet.getWeek(pid, this.currentMondayISO);
    } catch (err: any) {
      console.error(err);
      this.toast.show(err?.message || 'Errore nello scambio');
    }
  }

  cancelSwap() { this.swapState = {}; }

  async prevWeek() {
    const d = new Date(this.currentMondayISO);
    d.setDate(d.getDate() - 7);
    this.currentMondayISO = this.getMondayISO(d);
    const pid = this.diet.getActiveProfileId();
    if (pid) this.week = await this.diet.getWeek(pid, this.currentMondayISO);
  }

  async nextWeek() {
    const d = new Date(this.currentMondayISO);
    d.setDate(d.getDate() + 7);
    this.currentMondayISO = this.getMondayISO(d);
    const pid = this.diet.getActiveProfileId();
    if (pid) this.week = await this.diet.getWeek(pid, this.currentMondayISO);
  }
}
