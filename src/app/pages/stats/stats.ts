import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DietService } from '../../services/diet';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.html',
  styleUrls: ['./stats.scss'],
})
export class Stats implements OnInit {
  hungerAvg: number | null = null;
  snacksToday = 0;
  freeUsed = 0;

  constructor(private diet: DietService) {}

  ngOnInit(): void {
    const pid = this.diet.getActiveProfileId();
    if (pid) this.loadStats(pid);
  }

  private async loadStats(pid: number) {
    try {
      const monday = this.getMondayISO(new Date());
      const week = await this.diet.getWeek(pid, monday);
      const hungerVals = week.days.map((d: any) => d.hunger).filter((h: any) => typeof h === 'number');
      this.hungerAvg = hungerVals.length ? (hungerVals.reduce((a: number,b:number)=>a+b,0)/hungerVals.length) : null;
      // snacks today
      const todayIso = new Date().toISOString().slice(0,10);
      const today = week.days.find((d: any) => d.date === todayIso);
      this.snacksToday = (today?.snacks?.am?.done ? 1 : 0) + (today?.snacks?.pm?.done ? 1 : 0);
      // free used in week
      let free = 0;
      for (const d of week.days) {
        for (const m of d.meals) {
          if (m.chosen?.source === 'free') free++;
        }
      }
      this.freeUsed = free;
    } catch (err) { console.error('Errore stats', err); }
  }

  private getMondayISO(d: Date) {
    const day = d.getDay();
    const diff = (day + 6) % 7;
    const monday = new Date(d);
    monday.setDate(d.getDate() - diff);
    monday.setHours(0,0,0,0);
    return monday.toISOString().slice(0,10);
  }
}
