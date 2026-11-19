# 한국항공대학교 학식

한국항공대학교 생활관 주간식단 페이지를 크롤링해 학생식당과 교직원식당의 학식을 보여주는 Cloudflare Pages 사이트입니다.

## 구조

- `public/index.html`, `public/style.css`, `public/script.js`: 화면과 날짜 조회
- `public/data/menu.js`: 로컬 fallback 메뉴
- `src/crawler.js`: `kid.kau.ac.kr` HTML 파싱 (`value2=10` 학생식당, `value2=20` 교직원식당)
- `functions/api/menu.js`: 요청 시 메뉴를 크롤링하는 Pages Function
- `wrangler.toml`: Pages 프로젝트 설정

## 로컬 실행

```bash
npm install
npm run dev
```

## Cloudflare 배포

`npm run dev`로 Pages Function을 포함한 로컬 환경을 실행할 수 있습니다.

실제 배포는 GitHub Actions가 담당합니다. 저장소 Secrets에 `CLOUDFLARE_API_TOKEN`과 `CLOUDFLARE_ACCOUNT_ID`를 등록하고 `main` 브랜치에 push하면 됩니다. Pages Function은 페이지에서 메뉴를 요청할 때마다 공식 페이지를 크롤링합니다.

처음 한 번은 Cloudflare 계정에서 `kau-lunch-menu`라는 Pages 프로젝트를 만들거나 다음 명령을 실행해야 합니다.

```bash
npx wrangler pages project create kau-lunch-menu
```

실제 운영 전 대상 사이트의 이용 조건과 `robots.txt`를 확인하세요.
