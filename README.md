# MarketMIND 📈
Flask API + vanilla-JS frontend, served together by one Flask app (NSE/BSE data via yfinance).

## Structure
```
MarketMIND/
├── app.py            ← Flask: API (/api/*) AND serves the frontend
├── requirements.txt
├── Procfile          ← start command for Render / Railway / Heroku
├── render.yaml       ← one-click Render blueprint
├── runtime.txt       ← Python version
├── start.sh / start.bat   ← local run
└── frontend/
    ├── index.html, auth.html
    ├── css/style.css
    └── js/api.js, chart.js, app.js
```

## Run locally
```bash
./start.sh        # macOS/Linux      (Windows: start.bat)
```
Open **http://localhost:5000** (frontend and API are on the same address).

## Deploy (Render – free)
1. Push this folder to a GitHub repo (`app.py` must be at the repo root).
2. render.com → **New → Web Service** → pick the repo.
3. Build: `pip install -r requirements.txt`
   Start: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120`
   (or choose **Blueprint** and Render reads `render.yaml`)
4. Open the URL Render gives you. Done.

Railway / Heroku: they pick up the `Procfile` automatically.

## Notes
- The login page is a front-end demo only (stored in the browser's localStorage); it is not real security.
- Yahoo data can be delayed ~15 min. Free hosts sleep when idle, so the first load may take ~30–50 s.
- Educational use only. Not SEBI-registered. Not investment advice.
