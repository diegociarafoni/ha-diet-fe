import { Injectable, NgZone } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, firstValueFrom, Subject, Observable } from 'rxjs';

type WsMsg = Record<string, any>;

@Injectable({ providedIn: 'root' })
export class HaWebsocketService {
  private socket?: WebSocket;
  private msgId = 1;
  private pending = new Map<number, (msg: WsMsg) => void>();

  connectionState$ = new BehaviorSubject<'disconnected'|'connecting'|'auth'|'connected'|'error'>('disconnected');
  private incoming$ = new Subject<WsMsg>();
  /** Observable pubblico per messaggi in arrivo non correlati a request/response (eventi, notifiche). */
  get incoming(): Observable<WsMsg> { return this.incoming$.asObservable(); }

  constructor(private zone: NgZone) {
    this.ensureAutoStart();
  }

  // Avvia la connessione automaticamente quando il servizio viene istanziato
  // (utile per eseguire l'autenticazione immediatamente all'avvio dell'app).
  // Usiamo setTimeout per evitare di bloccare il costruttore in contesti particolari.
  private _autoStarted = false;
  private ensureAutoStart() {
    if (this._autoStarted) return;
    this._autoStarted = true;
    // During unit tests (Karma) we don't want the service to attempt real WS
    // connections — tests should provide a mocked HaWebsocketService when needed.
    if (typeof window !== 'undefined') {
      const w = window as any;
      if (w && w.__karma__) {
        // running under Karma test runner: skip auto-start
        console.info('HaWebsocketService: running under Karma, auto-start skipped');
        return;
      }
      setTimeout(() => this.connect(), 0);
    }
  }

  /**
   * Risolve quando lo stato diventa 'connected' oppure rigetta dopo timeout.
   * Utile per aspettare l'autenticazione all'avvio prima di effettuare chiamate.
   */
  async waitUntilConnected(timeoutMs = 5000): Promise<void> {
    if (this.connectionState$.value === 'connected') return;
    return new Promise<void>((resolve, reject) => {
      const to = setTimeout(() => {
        sub.unsubscribe();
        reject(new Error('Timeout waiting for WS connected'));
      }, timeoutMs);
      const sub = this.connectionState$.subscribe((s) => {
        if (s === 'connected') {
          clearTimeout(to);
          sub.unsubscribe();
          resolve();
        }
        if (s === 'error') {
          clearTimeout(to);
          sub.unsubscribe();
          reject(new Error('WebSocket in error state'));
        }
      });
    });
  }

  /** Legge il token di HA dalla stessa origin (frontend HA lo salva in localStorage). */
  private readAccessToken(): string | null {
    try {
      const raw = localStorage.getItem('hassTokens');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.access_token ?? null;
    } catch {
      return null;
    }
  }

  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) return;

    this.connectionState$.next('connecting');
    const url = environment.wsUrl.startsWith('ws') || environment.wsUrl.startsWith('wss')
      ? environment.wsUrl
      : `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}${environment.wsUrl}`;

    const ws = new WebSocket(url);
    this.socket = ws;

    ws.onopen = () => {
      // aspettiamo auth_required
    };

    ws.onmessage = (ev) => {
      this.zone.run(() => {
        const msg: WsMsg = JSON.parse(ev.data);
  if (msg['type'] === 'auth_required') {
          this.connectionState$.next('auth');
          const token = this.readAccessToken();
          if (!token) {
            this.connectionState$.next('error');
            console.error('HA token non trovato; assicurati di aprire l’app dentro Home Assistant o configura il proxy.');
            return;
          }
          ws.send(JSON.stringify({ type: 'auth', access_token: token }));
          return;
        }
  if (msg['type'] === 'auth_ok') {
          this.connectionState$.next('connected');
          return;
        }
  if (msg['type'] === 'auth_invalid') {
          this.connectionState$.next('error');
          console.error('Autenticazione HA fallita:', msg);
          return;
        }

        // gestione response correlata a id
        if (typeof msg['id'] === 'number' && this.pending.has(msg['id'])) {
          const resolve = this.pending.get(msg['id'])!;
          this.pending.delete(msg['id']);
          resolve(msg);
          return;
        }

        // broadcast generico (eventi ecc.)
        this.incoming$.next(msg);
      });
    };

    ws.onclose = () => {
      this.zone.run(() => this.connectionState$.next('disconnected'));
      // retry semplice
      setTimeout(() => this.connect(), 2000);
    };

    ws.onerror = () => {
      this.zone.run(() => this.connectionState$.next('error'));
      ws.close();
    };
  }

  /** Invoca un comando WS di HA (diet/*). Ritorna la `result` o lancia errore. */
  async call<T = any>(payload: WsMsg): Promise<T> {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket non connesso');
    }
    const id = this.msgId++;
    const msg = { id, ...payload };
    const p = new Promise<WsMsg>((resolve) => this.pending.set(id, resolve));
    this.socket.send(JSON.stringify(msg));
    const resp = await p;
    if (resp['success'] === false) {
      throw new Error(resp['error']?.message || 'Errore WS');
    }
    return resp['result'] as T;
  }
}
