# האדומים בנבחרות | Hapoel Be'er Sheva National Team Match Center

עמוד Match Center בעברית (RTL) לשחקני הפועל באר שבע שזומנו לנבחרות בעונת 2026/27.

A static React frontend for GitHub Pages. Match data is separated from the UI so it can be updated without touching components.

## מה בפנים / What's included

- לוח משחקים, סינון, Spotlight, כרטיסי שחקנים וסטטוס LIVE אמיתי בלבד
- שכבת `MatchDataProvider` עם `ManualDataProvider`
- נתוני משחקים מתוזמנים ממקורות רשמיים, בלי תוצאות או דקות מומצאות בפרודקשן
- נתוני פיתוח (כולל LIVE לדוגמה) רק ב־`npm run dev`

## התקנה

```bash
npm install
```

## הרצה מקומית

```bash
npm run dev
```

האפליקציה רצה עם `base` של GitHub Pages, בדרך כלל:

`http://localhost:5173/hbs-national-team-match-center/`

בפיתוח מופעל `VITE_USE_DEMO_DATA=true` מתוך `.env.development`, ולכן יופיע משחק LIVE לדוגמה עם באנר ברור.

## Build

```bash
npm run lint
npm test
npm run build
npm run preview
```

בילד לפרודקשן לא כולל נתונים מומצאים.

## עדכון שחקנים

עריכה במקור האמת:

- `src/data/players.ts`
- `src/data/playerImages.ts`
- `src/data/teams.ts`

## עדכון משחקים

ערכו את `src/data/matches.json`.

אין צורך לגעת בקומפוננטות. שמרו תאריכים ב־ISO/UTC. הממשק מציג שעון ישראל.

סטטוסים נתמכים: `scheduled`, `live`, `halftime`, `finished`, `postponed`, `cancelled`.

שדות כמו דקות, שערים ובישולים מוצגים רק אם הם קיימים ב־JSON.

## משיכת תמונות שחקנים

```bash
npm run fetch-player-images
```

הסקריפט מושך דיוקנאות רשמיים מאתר המועדון `https://hbsfc.co.il/team-squad/`.
תמונת אדריאן אוגריסה נלקחת מהקובץ המקומי בתיקיית `Pictures`.

## תוצאות לייב

המקור הפעיל הוא **FotMob**, דרך אותו JSON ציבורי שהפרויקט הפתוח [Ryzellx/football-live-api](https://github.com/Ryzellx/football-live-api) עוטף. ה-demo המאוחסן שלהם (`football-live-api.vercel.app`) מחזיר כרגע 402, לכן הקריאה היא ישירות ל-FotMob.

כל התקשורת עוברת ב־`src/services/football/` — כתובת ה-API מוגדרת רק ב־`src/services/football/config.ts`.

בפיתוח יש proxy של Vite (`/football-api`). בזמן משחק הדף מתעדכן כל 30 שניות בלי רענון. `npm run refresh-data` מעדכן את `matches.json` מ-FotMob.

## GitHub Pages

1. צרו repo בשם `hbs-national-team-match-center`
2. Settings → Pages → Source: GitHub Actions
3. כל push ל־`main` מריץ `.github/workflows/deploy.yml`

`VITE_BASE=/hbs-national-team-match-center/`

האתר אמור לעבוד בנתיב `/hbs-national-team-match-center/`.

## מבנה נתונים

- `Player`: `id`, `nameHe`, `nameEn`, `team`, `nationalTeam`, `image`, `transfermarktUrl`
- `Match`: `competition`, `homeTeam`, `awayTeam`, `kickoff`, `status`, scores, `players`, `lastUpdated`
- `PlayerAppearance`: `squadStatus`, minutes/goals/cards רק כשהם מאומתים

## מקור המשחקים כרגע

ידני. הלוח מבוסס על משחקים מתוזמנים שפורסמו ב־UEFA, Concacaf ו־U.S. Soccer. אין תוצאות עד לעדכון מאומת.
