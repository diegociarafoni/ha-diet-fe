import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DietService } from '../../services/diet';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-config-week',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './config-week.html',
  styleUrls: ['./config-week.scss'],
})
export class ConfigWeek implements OnInit {
  preview: any = null;
  constructor(private diet: DietService, private toast: ToastService) {}

  get canWrite(): boolean {
    const caps = this.diet.getCapabilitiesCached();
    const pid = this.diet.getActiveProfileId();
    if (!caps || pid == null) return false;
    const p = caps.profiles.find((x: any) => x.profile_id === pid);
    return !!p?.can_write;
  }

  ngOnInit(): void {
    const pid = this.diet.getActiveProfileId();
    if (pid) this.loadPreview(pid);
  }

  private async loadPreview(pid: number) {
    const monday = this.getMondayISO(new Date());
    try {
      this.preview = await this.diet.getWeek(pid, monday);
    } catch (err) { console.error('Errore loading week preview', err); }
  }

  private getMondayISO(d: Date) {
    const day = d.getDay();
    const diff = (day + 6) % 7;
    const monday = new Date(d);
    monday.setDate(d.getDate() - diff);
    monday.setHours(0,0,0,0);
    return monday.toISOString().slice(0,10);
  }

  async applyTemplate() {
    if (!this.canWrite) { this.toast.show('Permessi insufficienti per applicare template'); return; }
    const pid = this.diet.getActiveProfileId();
    if (!pid) { this.toast.show('Nessun profilo attivo'); return; }
    const monday = this.getMondayISO(new Date());
    try {
      await this.diet.applyWeekTemplate(pid, monday);
      this.toast.show('Template applicato');
    } catch (err) { console.error(err); this.toast.show('Errore applyWeekTemplate'); }
  }
}
