import type { FollowKind } from "@/lib/sports/types";

export type FanGroup = {
  name: string;
  platform: "whatsapp" | "telegram" | "discord" | "lihkg" | "facebook" | "instagram" | "website";
  url: string;
  description?: string;
  language?: "zh-Hant" | "zh-Hans" | "en" | "mixed";
  audience?: "hk" | "global" | "tw" | "cn" | "sgmy";
};

export type EntityFanGroups = {
  kind: FollowKind;
  sourceId: string;
  groups: FanGroup[];
};

const TEAM_GROUPS: Record<string, FanGroup[]> = {
  "133616": [
    {
      name: "傑志球迷區（香港）",
      platform: "facebook",
      url: "https://www.facebook.com/kitchee1931",
      description: "傑志官方球迷會專頁",
      language: "zh-Hant",
      audience: "hk",
    },
    {
      name: "港超聯香港球迷 Telegram",
      platform: "telegram",
      url: "https://t.me/s/HKPLFans",
      description: "港超球迷資訊台",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "133617": [
    {
      name: "東方球迷會",
      platform: "facebook",
      url: "https://www.facebook.com/EasternSC",
      description: "東方體育會官方專頁",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "133619": [
    {
      name: "理文球迷專頁",
      platform: "facebook",
      url: "https://www.facebook.com/leemanfc",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "133624": [
    {
      name: "冠忠南區",
      platform: "facebook",
      url: "https://www.facebook.com/southerndistrictrsa",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "133628": [
    {
      name: "香港 U23 / 港隊球迷區",
      platform: "facebook",
      url: "https://www.facebook.com/HKFA.Official",
      description: "香港足球總會官方專頁",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "133614": [
    {
      name: "標準流浪",
      platform: "facebook",
      url: "https://www.facebook.com/BCRangersFC",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "133623": [
    {
      name: "大埔足球會",
      platform: "facebook",
      url: "https://www.facebook.com/ntwfc",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134778": [
    {
      name: "利物浦球迷俱樂部（香港）",
      platform: "facebook",
      url: "https://www.facebook.com/LFC.HK.OfficialSupportersClub",
      description: "利物浦香港官方球迷會",
      language: "zh-Hant",
      audience: "hk",
    },
    {
      name: "Liverpool FC Global Fans",
      platform: "telegram",
      url: "https://t.me/LiverpoolFC",
      language: "en",
      audience: "global",
    },
    {
      name: "連登利物浦討論區",
      platform: "lihkg",
      url: "https://lihkg.com/category/27",
      description: "連登體育台 英超板",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134780": [
    {
      name: "曼聯香港球迷會",
      platform: "facebook",
      url: "https://www.facebook.com/HongKongMUSC",
      description: "Manchester United Hong Kong Supporters Club",
      language: "zh-Hant",
      audience: "hk",
    },
    {
      name: "Manchester United 官方 Telegram",
      platform: "telegram",
      url: "https://t.me/manutd",
      language: "en",
      audience: "global",
    },
  ],
  "134781": [
    {
      name: "阿仙奴香港球迷區",
      platform: "facebook",
      url: "https://www.facebook.com/groups/arsenal.hk",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134782": [
    {
      name: "車路士香港球迷會",
      platform: "facebook",
      url: "https://www.facebook.com/groups/chelseahk",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134783": [
    {
      name: "曼城香港球迷會",
      platform: "facebook",
      url: "https://www.facebook.com/MCFCHKS",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134784": [
    {
      name: "熱刺香港球迷區",
      platform: "facebook",
      url: "https://www.facebook.com/groups/THFCHK",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134800": [
    {
      name: "皇馬香港球迷會",
      platform: "facebook",
      url: "https://www.facebook.com/groups/RealMadridHKFans",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134801": [
    {
      name: "巴塞隆拿香港球迷會",
      platform: "facebook",
      url: "https://www.facebook.com/groups/fcb.hk",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134802": [
    {
      name: "馬德里體育會香港球迷",
      platform: "facebook",
      url: "https://www.facebook.com/groups/atleticomadridhk",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134815": [
    {
      name: "拜仁慕尼黑香港球迷會",
      platform: "facebook",
      url: "https://www.facebook.com/groups/FCBayernHK",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134841": [
    {
      name: "多蒙特香港球迷區",
      platform: "facebook",
      url: "https://www.facebook.com/groups/BVBCIHK",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134812": [
    {
      name: "PSG 巴黎聖日耳門球迷討論",
      platform: "facebook",
      url: "https://www.facebook.com/groups/psg.hkfans",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134880": [
    {
      name: "祖雲達斯香港球迷會",
      platform: "facebook",
      url: "https://www.facebook.com/groups/JuventusClubHongKong",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134875": [
    {
      name: "AC 米蘭香港球迷會",
      platform: "facebook",
      url: "https://www.facebook.com/groups/ACMilanHK",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134876": [
    {
      name: "國際米蘭香港球迷會",
      platform: "facebook",
      url: "https://www.facebook.com/groups/InterMilanHK",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134878": [
    {
      name: "拿玻里香港球迷",
      platform: "facebook",
      url: "https://www.facebook.com/groups/sscnapolihk",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134927": [
    {
      name: "些路迪香港球迷會",
      platform: "facebook",
      url: "https://www.facebook.com/groups/CelticFCFansHK",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134926": [
    {
      name: "格拉斯哥流浪香港球迷會",
      platform: "facebook",
      url: "https://www.facebook.com/groups/RangersFC.HK",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "133827": [
    {
      name: "洛杉磯湖人香港球迷會",
      platform: "facebook",
      url: "https://www.facebook.com/groups/lakers.fans.hk",
      description: "NBA 湖人球迷討論區",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "133832": [
    {
      name: "金州勇士香港球迷會",
      platform: "facebook",
      url: "https://www.facebook.com/groups/warriorshkfans",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "133816": [
    {
      name: "芝加哥公牛香港球迷區",
      platform: "facebook",
      url: "https://www.facebook.com/groups/chicagobullshk",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "133837": [
    {
      name: "塞爾特人香港球迷",
      platform: "facebook",
      url: "https://www.facebook.com/groups/bostonceltics.hkfans",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "133848": [
    {
      name: "熱火香港球迷區",
      platform: "facebook",
      url: "https://www.facebook.com/groups/miamiheat.fans.hk",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "133813": [
    {
      name: "籃網香港球迷",
      platform: "facebook",
      url: "https://www.facebook.com/groups/netsfanshongkong",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "134924": [
    {
      name: "F1 香港車迷區",
      platform: "facebook",
      url: "https://www.facebook.com/groups/f1fanshongkong",
      description: "一級方程式香港車迷討論區",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
};

const LEAGUE_GROUPS: Record<string, FanGroup[]> = {
  "4328": [
    {
      name: "英超香港球迷聯盟",
      platform: "facebook",
      url: "https://www.facebook.com/groups/premierleaguehkfans",
      description: "英超聯賽香港綜合球迷討論區",
      language: "zh-Hant",
      audience: "hk",
    },
    {
      name: "連登英超板",
      platform: "lihkg",
      url: "https://lihkg.com/category/27",
      description: "連登體育台 / 英超板",
      language: "zh-Hant",
      audience: "hk",
    },
    {
      name: "Premier League 官方 Telegram",
      platform: "telegram",
      url: "https://t.me/premierleague",
      language: "en",
      audience: "global",
    },
  ],
  "4335": [
    {
      name: "西甲香港球迷區",
      platform: "facebook",
      url: "https://www.facebook.com/groups/laligahk",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "4387": [
    {
      name: "意甲香港球迷綜合區",
      platform: "facebook",
      url: "https://www.facebook.com/groups/seriea.hk",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "4370": [
    {
      name: "德甲香港球迷綜合區",
      platform: "facebook",
      url: "https://www.facebook.com/groups/bundesligahk",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "4465": [
    {
      name: "法甲香港球迷綜合區",
      platform: "facebook",
      url: "https://www.facebook.com/groups/ligue1hk",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "4391": [
    {
      name: "NBA 香港球迷大區",
      platform: "facebook",
      url: "https://www.facebook.com/groups/nba.hkfans",
      language: "zh-Hant",
      audience: "hk",
    },
    {
      name: "連登 NBA 板",
      platform: "lihkg",
      url: "https://lihkg.com/category/29",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "4400": [
    {
      name: "港超聯香港球迷 Telegram 資訊台",
      platform: "telegram",
      url: "https://t.me/s/HKPLFans",
      language: "zh-Hant",
      audience: "hk",
    },
    {
      name: "港超聯球迷大區",
      platform: "facebook",
      url: "https://www.facebook.com/groups/hkplfans",
      description: "香港超級聯賽綜合球迷區",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "4673": [
    {
      name: "F1 香港車迷大區",
      platform: "facebook",
      url: "https://www.facebook.com/groups/f1fanshongkong",
      language: "zh-Hant",
      audience: "hk",
    },
    {
      name: "F1 官方 Telegram",
      platform: "telegram",
      url: "https://t.me/Formula1",
      language: "en",
      audience: "global",
    },
  ],
  "4678": [
    {
      name: "欖球世界盃 / 香港七欖球迷區",
      platform: "facebook",
      url: "https://www.facebook.com/HKRugbyUnion",
      description: "香港欖球總會官方",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "4688": [
    {
      name: "香港網球 / ATP 球迷區",
      platform: "facebook",
      url: "https://www.facebook.com/HongKongTennisAssociation",
      description: "香港網球總會",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "4695": [
    {
      name: "香港電競討論區",
      platform: "facebook",
      url: "https://www.facebook.com/groups/HKesportsFans",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "4677": [
    {
      name: "香港板球討論區",
      platform: "facebook",
      url: "https://www.facebook.com/cricketHongKong",
      description: "Cricket Hong Kong 官方",
      language: "en",
      audience: "hk",
    },
  ],
  "4670": [
    {
      name: "UCI 單車 / 環法香港車迷",
      platform: "facebook",
      url: "https://www.facebook.com/groups/tourdefrancehongkongfans",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "4671": [
    {
      name: "香港高爾夫球迷區",
      platform: "facebook",
      url: "https://www.facebook.com/golfhk",
      description: "Hong Kong Golf Association",
      language: "mixed",
      audience: "hk",
    },
  ],
  "4480": [
    {
      name: "MLB 香港球迷區",
      platform: "facebook",
      url: "https://www.facebook.com/groups/mlb.hkfans",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "4485": [
    {
      name: "NFL 香港球迷區",
      platform: "facebook",
      url: "https://www.facebook.com/groups/nflhongkongfans",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
  "4490": [
    {
      name: "NHL 冰球香港球迷",
      platform: "facebook",
      url: "https://www.facebook.com/groups/nhlhkfans",
      language: "zh-Hant",
      audience: "hk",
    },
  ],
};

export function fanGroupsFor(kind: FollowKind, sourceId: string): FanGroup[] {
  if (kind === "team") return TEAM_GROUPS[sourceId] || [];
  if (kind === "league") return LEAGUE_GROUPS[sourceId] || [];
  return [];
}

export function hasFanGroupsFor(kind: FollowKind, sourceId: string): boolean {
  return fanGroupsFor(kind, sourceId).length > 0;
}

export function platformLabel(platform: FanGroup["platform"]): string {
  switch (platform) {
    case "whatsapp":
      return "WhatsApp";
    case "telegram":
      return "Telegram";
    case "discord":
      return "Discord";
    case "lihkg":
      return "連登 LIHKG";
    case "facebook":
      return "Facebook";
    case "instagram":
      return "Instagram";
    case "website":
      return "官方網站";
    default:
      return platform;
  }
}
