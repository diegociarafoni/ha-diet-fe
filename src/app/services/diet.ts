import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HaWebsocketService } from './ha-websocket';

export type Profile = { profile_id: number; display_name: string; can_read: boolean; can_write: boolean };
export type Capabilities = { subject_profile_id: number | null; profiles: Profile[] };

@Injectable({ providedIn: 'root' })
export class DietService {
  private capabilities$ = new BehaviorSubject<Capabilities | null>(null);
  private activeProfile$ = new BehaviorSubject<number | null>(null);

  constructor(private ws: HaWebsocketService) {
    // In normal runtime, try to load capabilities after WS connects.
    // In unit tests (Karma) we skip automatic loading — tests should mock
    // HaWebsocketService or call loadCapabilities explicitly to avoid timeouts.
    if (typeof window !== 'undefined') {
      const w = window as any;
      if (w && w.__karma__) {
        console.info('DietService: running under Karma, skipping auto capabilities load');
        return;
      }
    }

    // assicurati che la connessione sia pronta, poi carica capabilities
    (async () => {
      const ok = await this.ws.waitUntilConnected(5000);
      if (ok) {
        this.loadCapabilities();
      } else {
        console.warn('DietService: impossibile ottenere capabilities all\'avvio (WS non connesso)');
      }
    })();
  }

  connect() { this.ws.connect(); }

  /** Observable/valori cached */
  getCapabilitiesCached(): Capabilities | null { return this.capabilities$.value; }
  capabilitiesObservable() { return this.capabilities$.asObservable(); }
  getActiveProfileId(): number | null { return this.activeProfile$.value; }
  activeProfileObservable() { return this.activeProfile$.asObservable(); }

  private async loadCapabilities() {
    try {
      const caps = await this.getCapabilities();
      this.capabilities$.next(caps);
      // imposta default subject_profile_id se presente
      if (caps && caps.subject_profile_id != null) {
        this.setActiveProfile(caps.subject_profile_id);
      }
    } catch (err) {
      console.error('Errore fetching capabilities', err);
    }
  }

  async setActiveProfile(profile_id: number | null) {
    const caps = this.capabilities$.value;
    if (profile_id == null || !caps) {
      this.activeProfile$.next(profile_id);
      return;
    }
    const found = caps.profiles.find((p) => p.profile_id === profile_id && p.can_read);
    if (!found) throw new Error('Profile non trovato o non leggibile');
    this.activeProfile$.next(profile_id);
  }

  getCapabilities() {
    return this.ws.call<{ subject_profile_id: number|null, profiles: Profile[] }>({
      type: 'diet/get_capabilities'
    });
  }

  getDay(owner_profile_id: number, date: string) {
    return this.ws.call({
      type: 'diet/get_day',
      owner_profile_id,
      date
    });
  }

  getWeek(owner_profile_id: number, start_date: string) {
    return this.ws.call({
      type: 'diet/get_week',
      owner_profile_id,
      start_date
    });
  }

  getNextMeals(owner_profile_ids: number[], horizon_hours = 36) {
    return this.ws.call({
      type: 'diet/get_next_meals',
      owner_profile_ids,
      horizon_hours
    });
  }

  async setHunger(owner_profile_id: number, date: string, score: number) {
    return this.callService('set_hunger', { owner_profile_id, date, score });
  }

  async setSnack(owner_profile_id: number, date: string, period: 'am'|'pm', done: boolean) {
    return this.callService('set_snack', { owner_profile_id, date, period, done });
  }

  async setChoice(owner_profile_id: number, date: string, meal_type: string, source: string, title?: string, notes?: string) {
    return this.callService('set_choice', { owner_profile_id, date, meal_type, source, title, notes });
  }

  async applyWeekTemplate(owner_profile_id: number, start_date: string, template_id?: number) {
    return this.callService('apply_week_template', { owner_profile_id, start_date, template_id });
  }

  async swapMeal(owner_profile_id: number, date_from: string, date_to: string, meal_type: string) {
    return this.callService('swap_meal', { owner_profile_id, date_from, date_to, meal_type });
  }

  /** Chiama un servizio HA del dominio diet via WS service_call (più semplice che fare fetch con token). */
  private async callService(service: string, data: any) {
    return this.ws.call({
      type: 'call_service',
      domain: 'diet',
      service,
      service_data: data
    });
  }
}
