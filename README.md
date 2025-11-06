# HA Diet — Frontend

Questa è la frontend application Angular per l'integrazione custom `diet` in Home Assistant (HA).
Il progetto è pensato per essere montato come pannello all'interno di HA (localStorage.hassTokens -> token di sessione) e per essere eseguito in sviluppo con un proxy verso l'API di HA (es. `/api`).

## Panoramica

Funzionalità principali:

- Visualizzazione settimanale/giornaliera dei pasti per profili multipli.
- Operazioni di scrittura (scegliere un pasto, segnare `free`, `skip`, copiare o scambiare) tramite chiamate al WebSocket di Home Assistant (`call_service` con domain `diet`).
- Gestione permessi: profili possono essere `read`-only o `read/write`; l'interfaccia disabilita le azioni dove non permesse.
- UX ottimizzata per dispositivi touch (scroll orizzontale, swipe-to-swap su card, tap target grandi).
- Servizi principali implementati: `HaWebsocketService` (gestisce la connessione WS ad HA), `DietService` (wrappa le API `diet/get_capabilities`, `diet/get_day`, `diet/get_week`, `diet/get_next_meals` e le chiamate `call_service`).

## Struttura del progetto

- `src/app/services/ha-websocket.ts` — gestione connessione WebSocket con autenticazione HA.
- `src/app/services/diet.ts` — wrapper tipizzato per API read/write dell'integrazione diet.
- `src/app/components` — componenti riutilizzabili (es. `MealCard`, `ProfileSelector`).
- `src/app/pages` — pagine: `weekly-view`, `daily-view`, `common-view`, `config-week`, `stats`.
- `src/app/components/shared/meal-card` — card che mostra il pasto; ora supporta juga gesture swipe-to-swap.

## Requisiti

- Node.js >= 18
- npm 8+ (o pnpm/yarn se preferisci, ma qui gli script sono npm)
- Angular CLI (optional per comandi locali): `npm install -g @angular/cli`
- Home Assistant (per integrazione runtime)

## Installazione (sviluppo)

Apri una shell PowerShell nella cartella del progetto e installa le dipendenze:

```powershell
cd C:\Users\diego\Desktop\ha-diet\ha-diet-fe
npm install
```

Avvia in modalità sviluppo (il progetto è predisposto a dev proxy /api se necessario):

```powershell
npm run start
# oppure, se preferisci usare angualr cli direttamente
# ng serve --open
```

Nota: lo script `start` è quello definito nel `package.json` del progetto. In questa repo è presente anche un task preconfigurato per VS Code.

## Build (produzione)

Per creare la build destinata a Home Assistant:

```powershell
npm run build
```

L'output sarà in `dist/ha-diet-fe`.

### Come distribuire in Home Assistant

Due approcci comuni:

1. Copia statica nei file di Home Assistant

- Copia la cartella risultante `dist/ha-diet-fe` in `config/www/ha-diet` (ad es. `\\config\\www\\ha-diet`).
- Aggiungi un pannello custom in `configuration.yaml` (o usa `panel_custom` in UI) puntando al percorso `/local/ha-diet/index.html`.

Esempio `configuration.yaml` (snippet):

```yaml
panel_custom:
	- name: ha-diet
		url_path: ha-diet
		sidebar_title: Diet
		sidebar_icon: mdi-food-apple
		js_url: /local/ha-diet/index.html
```

2. Usare `panel_iframe` o servire da una directory statica

- In alternativa puoi configurare un `panel_iframe` che punti al server di sviluppo (solo per testing su rete locale) o servire i file statici dal tuo server preferito.

### Note su autenticazione e WebSocket

- In runtime dentro Home Assistant l'app legge i token di sessione da `localStorage.hassTokens` e si autentica al WS di HA.
- In sviluppo è previsto che la Dev instance di HA sia raggiungibile tramite proxy per `/api` e che la connessione WebSocket sia disponibile (di solito `ws://<ha-host>/api/websocket`).
- Se la connessione WS fallisce, i servizi si mettono in stato di errore visibile in debug.

## Test

- Unit tests (Karma/Jasmine):

```powershell
npm run test
# oppure per CI (single-run headless):
npm run test:ci
```

Nota: alcuni test mockano la connessione WebSocket per evitare timeout su ambienti CI.

## Uso rapido

- Apri il pannello `Diet` in Home Assistant (dopo averlo aggiunto come pannello custom). Verrà caricata la settimana corrente.
- Seleziona profilo (in alto) — i profili senza `can_read` sono disabilitati.
- Tocca una `MealCard` per vedere opzioni; oppure usa lo swipe orizzontale a sinistra sulla card per attivare lo swap (su dispositivi touch).
- L'azione `Scambia` apre un selettore inline con le date candidate per lo swap avanti nella settimana.

## Troubleshooting rapido

- Build fallisce: assicurati di avere Node.js e le versioni giuste, poi `npm ci` per una installazione pulita.
- Connessione WS: se l'app non si connette, verifica che HA sia raggiungibile e che il browser abbia token in `localStorage.hassTokens` (quando eseguita dentro HA deve essere presente).
- Permessi: se vedi pulsanti disabilitati, significa che il profilo selezionato non ha `can_write`.

## Contribuire

Se vuoi contribuire, apri una PR sul repository. Linee guida:

- Mantieni le modifiche ben isolate per area (service, componenti, styling).
- Aggiorna o aggiungi test quando modifichi la logica.
- Se aggiungi nuove dipendenze motiva la scelta nel PR description.

## Licenza

Nel repository non è inclusa una licenza; aggiungi `LICENSE` se intendi rilasciare con termini specifici.

---

Se vuoi, posso:

- aggiungere una sezione con snippet completi per la configurazione `panel_custom` in YAML (diversi esempi),
- creare un pacchetto ZIP pronto da copiare in `config/www`,
- o aprire un branch con una pagina `docs/` più estesa con screenshot e video dimostrativi.

Dimmi cosa preferisci e lo aggiungo al README.
