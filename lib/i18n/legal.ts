import type { Locale } from "@/lib/i18n/dictionaries";

export type LegalSection = { heading: string; body: string[] };

export type LegalCopy = {
  updated: string;
  privacyTitle: string;
  privacyIntro: string;
  privacy: LegalSection[];
  termsTitle: string;
  termsIntro: string;
  terms: LegalSection[];
};

export const legal: Record<Locale, LegalCopy> = {
  "zh-Hant": {
    updated: "最後更新：2026年9月2日",
    privacyTitle: "私隱政策",
    privacyIntro:
      "Sporttime 係免費排程工具：把你揀嘅官方賽程寫入你自己訂閱嘅日曆。我哋唔賣個人資料，亦唔提供即時比分。",
    privacy: [
      {
        heading: "我哋收集咩",
        body: [
          "瀏覽器會存一條工作階段 cookie，用來記住你追蹤緊邊啲聯賽／球會／運動員，以及你嘅語言同時區。",
          "如果你用 Google 登入，我哋會保存你嘅電郵同顯示名稱，方便換機還原追蹤清單。",
          "日曆訂閱網址係一條私密還原碼。任何拿到呢條網址嘅人都可以讀你嘅賽程訂閱。",
        ],
      },
      {
        heading: "賽程資料從邊嚟",
        body: [
          "官方比賽主要來自 TheSportsDB。F1 分站練習、排位同正賽時段來自 OpenF1。有賣飛嘅場外活動（如果你喺設定打開）來自 Ticketmaster。",
          "呢啲來源可能改期、缺場或時間未定。Sporttime 用嚟排生活，唔保證賽果或出場名單。",
        ],
      },
      {
        heading: "我哋唔做嘅事",
        body: [
          "唔寫入你原有嘅 Google 日曆內容（除非你另外連接並授權，而家預設係你訂閱一條獨立 ICS 網址）。",
          "唔做廣告追蹤、唔賣名單、唔把你嘅追蹤清單公開。",
          "伺服器日誌可能短暫保留技術錯誤，方便修理服務。",
        ],
      },
      {
        heading: "你點控制",
        body: [
          "設定頁可以重設日曆網址，舊網址會即刻失效。",
          "可以一鍵取消全部追蹤，訂閱就會變空。",
          "清除瀏覽器 cookie 會變成新訪客；用 Google 登入或貼上舊網址可以還原。",
        ],
      },
      {
        heading: "聯絡",
        body: ["如需查詢或刪除帳戶資料，請經網站附送呢個工具嘅公司網頁聯絡。"],
      },
    ],
    termsTitle: "使用條款",
    termsIntro: "用 Sporttime 即表示你明白呢個工具係免費排程輔助，唔係即時比分、博彩或官方賽事服務。",
    terms: [
      {
        heading: "服務內容",
        body: [
          "你追蹤聯賽、球會或運動員之後，未來開波時間會出現喺時間表，並可訂閱到 Google 或 Apple 日曆。",
          "團體項目追蹤運動員時，通常跟住佢而家球會／車隊賽程，而唔係逐場個人出場表。",
          "F1 可顯示分站練習、排位、衝刺同正賽時段。場外有賣飛活動只有喺你打開開關、而且服務有設定票務來源時先會出現。",
        ],
      },
      {
        heading: "準確度",
        body: [
          "賽程、地點同開波時間以第三方來源為準，可能改期或取消。日曆 App 刷新訂閱通常要幾小時。",
          "請以主辦單位或聯盟公布為最終依據。",
        ],
      },
      {
        heading: "可接受使用",
        body: [
          "唔好公開張貼你嘅日曆網址。唔好用自動化大量請求壓垮免費賽程來源。",
          "我哋可以因濫用、配額或來源條款而限制或中斷服務。",
        ],
      },
      {
        heading: "責任",
        body: [
          "呢個工具按「現況」免費提供。因改期、時區、訂閱延遲或來源缺漏而錯過比賽，我哋唔承擔損失。",
          "商標同隊名屬於各權利人，僅作識別賽事用途。",
        ],
      },
    ],
  },
  "zh-Hans": {
    updated: "最后更新：2026年9月2日",
    privacyTitle: "隐私政策",
    privacyIntro:
      "Sporttime 是免费排程工具：把你选择的官方赛程写入你自己订阅的日历。我们不出售个人资料，也不提供即时比分。",
    privacy: [
      {
        heading: "我们收集什么",
        body: [
          "浏览器会保存一条会话 cookie，用来记住你正在追踪的联赛／球会／运动员，以及语言和时区。",
          "如果你用 Google 登录，我们会保存你的邮箱和显示名称，方便换机还原追踪清单。",
          "日历订阅网址是一条私密还原码。任何拿到这条网址的人都可以读取你的赛程订阅。",
        ],
      },
      {
        heading: "赛程资料来自哪里",
        body: [
          "官方比赛主要来自 TheSportsDB。F1 分站练习、排位和正赛时段来自 OpenF1。有售票的场外活动（如果你在设置中打开）来自 Ticketmaster。",
          "这些来源可能改期、缺场或时间未定。Sporttime 用来安排生活，不保证赛果或出场名单。",
        ],
      },
      {
        heading: "我们不做的事",
        body: [
          "不写入你原有的 Google 日历内容（除非你另外连接并授权；现在默认是你订阅一条独立 ICS 网址）。",
          "不做广告追踪、不卖名单、不把你的追踪清单公开。",
          "服务器日志可能短暂保留技术错误，方便修理服务。",
        ],
      },
      {
        heading: "你如何控制",
        body: [
          "设置页可以重设日历网址，旧网址会立即失效。",
          "可以一键取消全部追踪，订阅就会变空。",
          "清除浏览器 cookie 会变成新访客；用 Google 登录或粘贴旧网址可以还原。",
        ],
      },
      {
        heading: "联络",
        body: ["如需查询或删除账户资料，请通过网站附送此工具的公司网页联络。"],
      },
    ],
    termsTitle: "使用条款",
    termsIntro: "使用 Sporttime 即表示你明白这个工具是免费排程辅助，不是即时比分、博彩或官方赛事服务。",
    terms: [
      {
        heading: "服务内容",
        body: [
          "你追踪联赛、球会或运动员之后，未来开赛时间会出现在时间表，并可订阅到 Google 或 Apple 日历。",
          "团体项目追踪运动员时，通常跟随其现在球会／车队赛程，而不是逐场个人出场表。",
          "F1 可显示分站练习、排位、冲刺和正赛时段。场外有售票活动只有在你打开开关、而且服务已配置票务来源时才会出现。",
        ],
      },
      {
        heading: "准确度",
        body: [
          "赛程、地点和开赛时间以第三方来源为准，可能改期或取消。日历 App 刷新订阅通常需要几小时。",
          "请以主办单位或联盟公布为最终依据。",
        ],
      },
      {
        heading: "可接受使用",
        body: [
          "不要公开张贴你的日历网址。不要用自动化大量请求压垮免费赛程来源。",
          "我们可以因滥用、配额或来源条款而限制或中断服务。",
        ],
      },
      {
        heading: "责任",
        body: [
          "这个工具按「现状」免费提供。因改期、时区、订阅延迟或来源缺漏而错过比赛，我们不承担损失。",
          "商标和队名属于各权利人，仅作识别赛事用途。",
        ],
      },
    ],
  },
  en: {
    updated: "Last updated: 2 September 2026",
    privacyTitle: "Privacy policy",
    privacyIntro:
      "Sporttime is a free planning tool: official fixtures you follow are published on a calendar feed you subscribe to. We do not sell personal data and we do not provide live scores.",
    privacy: [
      {
        heading: "What we store",
        body: [
          "A session cookie remembers the leagues, clubs, and athletes you follow, plus your language and timezone.",
          "If you sign in with Google, we store your email and display name so the same follows come back on a new device.",
          "Your calendar URL is a private restore key. Anyone with that URL can read your fixture subscription.",
        ],
      },
      {
        heading: "Where fixtures come from",
        body: [
          "Official matches come mainly from TheSportsDB. F1 practice, qualifying, and race sessions come from OpenF1. Ticketed appearances (if you turn them on in Settings) come from Ticketmaster.",
          "Sources can postpone, omit, or leave kickoff TBA. Sporttime is for planning your week, not results or line-ups.",
        ],
      },
      {
        heading: "What we do not do",
        body: [
          "We do not write into your existing Google calendars unless you separately connect and authorise that. The default product is an independent ICS subscription.",
          "We do not run ad tracking, sell lists, or publish your follows.",
          "Server logs may briefly keep technical errors so the service can be repaired.",
        ],
      },
      {
        heading: "Your controls",
        body: [
          "Settings can reset the calendar URL; the old URL stops working immediately.",
          "Unfollow everything and the subscription goes empty.",
          "Clearing cookies starts a new guest. Google sign-in or pasting the old URL restores follows.",
        ],
      },
      {
        heading: "Contact",
        body: ["To ask about or delete account data, contact the company that offers this complimentary tool."],
      },
    ],
    termsTitle: "Terms of use",
    termsIntro:
      "By using Sporttime you accept that it is a free planning aid — not a live-score, betting, or official competition service.",
    terms: [
      {
        heading: "The service",
        body: [
          "After you follow leagues, clubs, or athletes, upcoming kickoffs appear on the schedule and can be subscribed in Google or Apple Calendar.",
          "Following an athlete in a team sport usually follows their current club or constructor, not a personal appearance sheet.",
          "F1 can include practice, qualifying, sprint, and race sessions. Ticketed off-field appearances appear only if you enable them and the instance has a ticketing source configured.",
        ],
      },
      {
        heading: "Accuracy",
        body: [
          "Dates, venues, and kickoffs follow third-party sources and may change or be cancelled. Calendar apps often refresh subscriptions only every few hours.",
          "Treat the organiser or league as the source of truth.",
        ],
      },
      {
        heading: "Acceptable use",
        body: [
          "Do not post your calendar URL publicly. Do not automate heavy request volume against free fixture sources.",
          "We may limit or interrupt the service for abuse, quota, or upstream terms.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "The tool is provided free, as is. We are not liable if you miss a match because of postponements, timezones, subscription delay, or missing source data.",
          "Names and marks belong to their owners and are used only to identify fixtures.",
        ],
      },
    ],
  },
};
