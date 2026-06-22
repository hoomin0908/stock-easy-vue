# stock-easy-vue (프론트엔드)

## 실행 방법

```bash
npm install
npm run dev
```

`http://localhost:5173` 에서 확인. `vite.config.js`에 `/api` 요청을 `http://127.0.0.1:8000`(Django)로 프록시하도록 이미 설정해둠.

## 폴더 구조

```
src/
├── components/
│   ├── layout/      TopNav, Sidebar, RightPanel (전체 레이아웃)
│   └── news/        NewsCard (뉴스 피드 카드 1개)
├── views/           탭(라우트)별 화면 - NewsFeed / Watchlist / Glossary / Saved
├── router/          탭 라우팅
├── services/api.js  백엔드 API 호출 함수 (지금은 자리만 잡아둔 상태)
└── store/           selectedNews - 카드 클릭 시 우측 패널에 보여줄 기사 공유
```

## API 연동 시 할 일 (팀원 API 완성되면)

1. `src/services/api.js` 의 `TODO` 주석 함수들 안에 실제 axios 호출 채우기
2. 각 View(`NewsFeedView.vue` 등)의 `onMounted` 안 주석 해제
3. 응답 데이터 형태가 아래와 다르면 View 쪽에서 한 번 변환해서 넣기 (컴포넌트는 안 건드려도 되게 설계함)

### NewsCard가 기대하는 news 객체 형태

```js
{
  id: 1,
  title: "...",
  description: "...",
  publisher: "한국경제",
  timeAgo: "23분 전",
  url: "https://...",
  analysis: {
    sentiment: "POSITIVE", // POSITIVE | NEGATIVE | NEUTRAL
    rewrittenContent: "...",
  },
  stockImpacts: [
    {
      stockCode: "005930",
      stockName: "삼성전자",
      sentiment: "POSITIVE",
      strength: "STRONG", // WEAK | MODERATE | STRONG | VERY_STRONG
      confidenceScore: 82, // 0~100
    },
  ],
}
```

이 형태는 `analyses` 앱의 `NewsAnalysis` + `StockImpact` 모델 필드를 그대로 따라간 거라서, 백엔드 serializer도 이 모양으로 맞추면 프론트 수정 없이 바로 연결될 거예요.
