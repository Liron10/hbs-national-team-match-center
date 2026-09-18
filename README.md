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

הסקריפט:

1. נכנס לעמוד Transfermarkt המאומת של כל שחקן
2. קורא את דיוקן ה־`og:image` רק אם כתובת התמונה כוללת את מזהה השחקן
3. שומר עותק מקומי ב־`public/players/`
4. לא עוקף CAPTCHA / Cloudflare; אם העמוד חסום נשאר placeholder

אין hotlink קבוע ל־Transfermarkt.

## חיבור API בעתיד

1. ממשו Provider לפי `src/types` (`MatchDataProvider`)
2. הרץ נרמול ב־`scripts/refresh-data.ts` ל־`matches.json`
3. אל תשימו API KEY ב־Frontend
4. השתמשו ב־`.env.example` ובסוד של GitHub Actions

`FootballDataProvider` מוכן כשלד. GitHub Pages הוא סטטי, לכן המפתח חייב להישאר בצד refresh בלבד.

```bash
npm run refresh-data
```

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
