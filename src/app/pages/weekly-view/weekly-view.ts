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
  // ordered meal types for rows and labels
  mealTypes = ['breakfast', 'lunch', 'snack_am', 'snack_pm', 'dinner'];

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

  mealLabel(type: string) {
    const map: Record<string,string> = {
      breakfast: 'Colazione',
      lunch: 'Pranzo',
      snack_am: 'Spuntino AM',
      snack_pm: 'Spuntino PM',
      dinner: 'Cena'
    };
    return map[type] ?? type;
  }

  onCellKeydown(ev: KeyboardEvent, row: number, col: number) {
    // arrow navigation between cells: left/right/up/down
    const key = ev.key;
    let targetRow = row;
    let targetCol = col;
    const rows = this.mealTypes.length;
    const cols = this.week?.days?.length ?? 0;
    if (key === 'ArrowLeft') targetCol = Math.max(0, col - 1);
    else if (key === 'ArrowRight') targetCol = Math.min(cols - 1, col + 1);
    else if (key === 'ArrowUp') targetRow = Math.max(0, row - 1);
    else if (key === 'ArrowDown') targetRow = Math.min(rows - 1, row + 1);
    else return;
    ev.preventDefault();
    const id = `cell-${targetRow}-${targetCol}`;
    const el = document.getElementById(id) as HTMLElement | null;
    if (el) el.focus();
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
    // guard: only allow starting swap when profile can write
    if (!this.canWrite) { this.toast.show('Permessi insufficienti per effettuare scambi'); return; }

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
    // focus the newly created select so keyboard users can act immediately
    setTimeout(() => {
      try {
        const id = `swap-select-${meal.date}-${meal.meal_type}`;
        const el = document.getElementById(id) as HTMLElement | null;
        el?.focus();
      } catch (e) { /* ignore */ }
    }, 0);
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
