# Player image fetch report

Transfermarkt profile pages were verified manually (club: Hapoel Beer Sheva, matching nationality). Automatic portrait download was not used:

- Wikipedia returned a multi-player match photo for Eliel Peretz, so it was discarded.
- Direct Transfermarkt CDN URLs without the site's hashed filename did not return usable portraits.
- No CAPTCHA/Cloudflare bypass was attempted.

All eight players currently use local SVG placeholders in `public/players/`. Replace them with official portraits when available, then update `src/data/playerImages.ts`.
