# Lumen OS → Quant Bot V1 (PAPER ONLY)

A paper-trading crypto scanner. It watches 15 Binance USDT pairs, looks for short-term moves that differ from BTC,
simulates trades with realistic fees and slippage, and measures what actually happens.
It cannot place real orders: no API keys, no signed requests, and the REST client only allows two public endpoints.

## 1. Run it

```bash
cd lumen-quant-bot

# Create an isolated Python environment so packages do not pollute your system
python3 -m venv .venv                 # makes a folder .venv with its own Python
source .venv/bin/activate             # switches this terminal to use that Python (Windows: .venv\Scripts\activate)

pip install -r requirements.txt       # installs the libraries listed in requirements.txt

python -m pytest -q                   # runs the unit tests (no internet needed, Binance is mocked)

python -m quant_bot.main --config config.yaml
#  ^ -m runs a module by name; --config tells the bot which settings file to load
```

Open **http://127.0.0.1:8080**. For an iPad on the same Wi-Fi: `--host 0.0.0.0`, then open `http://<laptop-ip>:8080`.

Safety check: `LIVE=true python -m quant_bot.main` exits immediately with "REFUSING TO START".

## 1b. The "Live Flow" tab (animated, real-time)

Open the dashboard and you land on **Live Flow**. Everything that moves is driven by real data, nothing is simulated:

| You see | It means |
|---|---|
| Wire from Binance to Bot, dots flowing | The feed is connected. Dots speed up with the measured updates/second. Dashed amber = connecting or reconnecting. Amber dots = REST fallback only. |
| 15 market tiles, price flashing green/red | A new quote arrived for that pair. Dashed shimmering tile = still connecting. Faded = stale data. Red "feed error" = that one symbol is failing (others keep running). |
| Tile ring pulse + "signal detected" | The strategy fired for that pair. |
| A dot travelling Feed → Features → Signal → Gates → Risk → Broker → Ledger | The path that signal took. It stops and flashes **red** at the stage that rejected it (with the reason on the tile), or reaches the Ledger in **green** when a paper trade is opened. |
| Green tile + countdown ring + live P&L | A paper position is open; the ring is the time left before the exit rule closes it. |
| Dot going Broker → Ledger, "exit +$0.01" | A paper exit. Green = profit after fees, red = loss. |
| Right side "Live activity" | A plain-English sentence for every event. |

Because signals are rare with the honest defaults (see section 4), the screen will often be quiet: prices flashing, no trades.
The line "Closest to a signal" shows how far the best candidate is from the trigger, so you can see *why* it is quiet.

To watch the whole pipeline animate, use the demo settings (real market data, deliberately over-sensitive):

```bash
python -m quant_bot.main --config config.demo.yaml
```
The dashboard shows a "Demo sensitivity" badge, because P&L from that file is meaningless (it assumes an unrealistic capture ratio).

Browser-side check (optional, needs Node.js): `cd frontend_tests && npm install && npm test`. It loads the real page in jsdom,
feeds it real states from the Python engine and checks tiles, packets, narration and exits. It cannot judge how the animation *looks*.

## 2. Architecture

```
Binance WebSocket (bookTicker)  ──┐
Binance REST (fallback refresh) ──┴→ SnapshotStore → FeatureEngine → Strategy → Gates → Risk → PaperBroker → Ledger
                                                                                                        ↓
                                                                     Dashboard (FastAPI + WebSocket) ← EventLog (JSONL)
```

| Module | Job |
|---|---|
| `config.py` | All settings + the `LIVE=true` refusal |
| `data/` | Snapshot model, Binance normalizers, WebSocket/REST feed, reconnect with backoff |
| `features/` | Rolling 5s/30s moves, BTC-relative move, z-score |
| `signals/` | Strategy (`btc_relative.py`) and trade gates (`filters.py`) |
| `risk/` | Kill switch, daily loss stop, reject pause, position and signal limits |
| `paper_broker/` | Simulated fills, positions, P&L |
| `ledger/` | Every fill, CSV export, `logs/fills.jsonl` |
| `logging/` | Structured JSONL events in `logs/events-YYYY-MM-DD.jsonl` |
| `dashboard/` | The Lumen OS page (Live Scanner, Opportunities, Paper Trading, Positions, P&L, Risk) |
| `engine.py` | Wires the flow above, one tick at a time |

Adding a second strategy = a new file in `signals/` that returns a `Signal`. The broker and risk code do not change.

## 3. Decisions the spec left open (all configurable, all flagged)

1. **Trade direction.** The spec did not say whether a coin that outran BTC should be bought (`follow`) or a coin that lagged BTC (`fade`). Default is `follow`, matching your examples. Spot is long-only, so the other side is skipped and counted. Run both and compare the ledger.
2. **Expected edge.** `edge = capture_ratio × |relative move| − costs`. `capture_ratio = 0.5` is an **assumption**, not a measurement. Calibrate it from paper results.
3. **Exits.** Not in the spec. Positions close after `max_hold_seconds` (30) or at `stop_loss_bps` (30).
4. **Kill switch ON** blocks *everything*, including exits (literal reading of "NO PAPER TRADES"). The daily loss stop blocks new entries only.
5. **Signals/hour** counts signals approved for paper trading, not every detected candidate.
6. **State is in memory.** Every start begins at exactly $100. Fills and events persist in `logs/`.

## 4. Expect very few signals with the defaults

Round-trip fees alone are 20 bps. With `min_edge_bps_after_fee: 25` and `capture_ratio: 0.5`, a coin must move roughly 90+ bps
more than BTC in 5 seconds. On majors that is rare. **That is a real finding about fee drag, not a bug.**
To test the pipeline, temporarily lower `min_edge_bps_after_fee` (for example to 5), but do not treat those results as evidence of an edge.

## 5. How to learn from this (and improve it)

1. **Read in data-flow order:** `data/models.py` → `features/features.py` → `signals/btc_relative.py` → `risk/risk.py` → `paper_broker/broker.py` → `engine.py`. Read each test file next to its module; tests show the intended behaviour.
2. **Change one number at a time** in `config.yaml`, run 1–2 hours, and compare `logs/fills.jsonl`. Keep notes: what you changed, what you expected, what happened.
3. **Judge by evidence:** you need hundreds of closed trades before a win rate or average P&L means anything. Look at average P&L per trade *after* costs, and how it changes with `direction`, `zscore_min` and `capture_ratio`.
4. **Next steps, in order of value:** (a) log every candidate's price 30s later, even rejected ones, to measure the real capture ratio without trading; (b) a per-symbol P&L breakdown; (c) only then a second strategy.
5. **Known limits of the simulation:** fills happen at the best quote with a linear slippage model, so real queue position, partial fills and latency are not modelled. Paper results are usually better than reality.
