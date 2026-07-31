/**
 * Body Map Data - ゾーン定義データ（簡易版）
 * SVG viewBox: 0 0 400 800
 * 人体図は中心 x=200 に配置
 * 顔は楕円形の輪郭を部位ごとに切り分け、体も丸みを持たせた形状
 */

var BODY_MAP_DATA = {
  front: [
    // ===== 顔 =====
    // 顔の輪郭: 楕円形 中心(200, 72) rx=38 ry=48, top=24, bottom=120
    // 左ほっぺ: 顔の左半分、目の下〜口の横 (y: 60-95)
    { id: "front_cheek_left", name: "左ほっぺ", svgPath: "M162,60 L200,60 L200,95 L168,95 Q162,78 162,60 Z", side: "front", group: "顔" },
    // 右ほっぺ: 顔の右半分、目の下〜口の横 (y: 60-95)
    { id: "front_cheek_right", name: "右ほっぺ", svgPath: "M200,60 L238,60 Q238,78 232,95 L200,95 L200,60 Z", side: "front", group: "顔" },
    // くちびるの上: 鼻の下〜唇の上 (y: 95-108)
    { id: "front_upper_lip", name: "くちびるの上", svgPath: "M168,95 L200,95 L232,95 L225,108 L175,108 Z", side: "front", group: "顔" },
    // 顎下: 唇下〜顎先 (y: 108-125)
    { id: "front_chin", name: "顎下", svgPath: "M175,108 L225,108 Q225,120 200,128 Q175,120 175,108 Z", side: "front", group: "顔" },

    // ===== 首 =====
    { id: "front_neck", name: "首", svgPath: "M178,128 Q200,132 222,128 L228,158 Q200,162 172,158 Z", side: "front", group: "首" },

    // ===== 胴体 =====
    // 胸: 肩のラインから丸みを帯びた胴体上部
    { id: "front_chest", name: "胸", svgPath: "M148,162 Q155,158 200,158 Q245,158 252,162 L252,255 Q200,260 148,255 Z", side: "front", group: "胴体" },
    // 左わき: 胸の左外側の凹み
    { id: "front_armpit_left", name: "左わき", svgPath: "M128,168 L148,162 L148,205 L132,205 Q128,185 128,168 Z", side: "front", group: "胴体" },
    // 右わき: 胸の右外側の凹み
    { id: "front_armpit_right", name: "右わき", svgPath: "M252,162 L272,168 Q272,185 268,205 L252,205 L252,162 Z", side: "front", group: "胴体" },
    // 腰: 胴体下部、くびれから骨盤上まで
    { id: "front_waist", name: "腰", svgPath: "M148,255 Q200,260 252,255 L255,345 Q200,350 145,345 Z", side: "front", group: "胴体" },

    // ===== 腕 =====
    // 左腕: 肩から手首まで、やや斜めの自然な形
    { id: "front_arm_left", name: "左腕", svgPath: "M128,168 Q120,170 112,178 L85,320 Q80,335 78,345 L105,348 L132,205 L128,168 Z", side: "front", group: "腕" },
    // 右腕: 肩から手首まで
    { id: "front_arm_right", name: "右腕", svgPath: "M272,168 Q280,170 288,178 L315,320 Q320,335 322,345 L295,348 L268,205 L272,168 Z", side: "front", group: "腕" },

    // ===== 下半身 =====
    // 股間: 骨盤中央
    { id: "front_groin", name: "股間", svgPath: "M170,345 Q200,350 230,345 L225,388 Q200,395 175,388 Z", side: "front", group: "下半身" },
    // 左ふともも: 股から膝上まで
    { id: "front_thigh_left", name: "左ふともも", svgPath: "M145,345 L175,388 Q178,440 175,500 L148,500 Q142,420 145,345 Z", side: "front", group: "下半身" },
    // 右ふともも
    { id: "front_thigh_right", name: "右ふともも", svgPath: "M225,388 L255,345 Q258,420 252,500 L225,500 Q222,440 225,388 Z", side: "front", group: "下半身" },
    // 左ひざ下: 膝から足首まで
    { id: "front_lower_leg_left", name: "左ひざ下", svgPath: "M148,500 L175,500 Q178,580 175,660 L152,660 Q148,580 148,500 Z", side: "front", group: "下半身" },
    // 右ひざ下
    { id: "front_lower_leg_right", name: "右ひざ下", svgPath: "M225,500 L252,500 Q252,580 248,660 L225,660 Q222,580 225,500 Z", side: "front", group: "下半身" }
  ],

  back: [
    // ===== 首(背面) =====
    { id: "back_neck", name: "うなじ", svgPath: "M175,85 Q200,80 225,85 L228,158 Q200,162 172,158 Z", side: "back", group: "首" },

    // ===== 背中 =====
    { id: "back_upper", name: "背中", svgPath: "M145,158 Q200,162 255,158 L258,285 Q200,290 142,285 Z", side: "back", group: "胴体" },
    { id: "back_lower", name: "腰(背面)", svgPath: "M142,285 Q200,290 258,285 L255,355 Q200,360 145,355 Z", side: "back", group: "胴体" },
    { id: "back_buttocks", name: "おしり", svgPath: "M145,355 Q200,360 255,355 Q258,380 250,410 Q200,418 150,410 Q142,380 145,355 Z", side: "back", group: "下半身" },

    // ===== 腕(背面) =====
    { id: "back_arm_left", name: "左腕(背面)", svgPath: "M128,165 Q118,170 110,180 L82,325 Q78,338 76,348 L103,350 L130,200 L128,165 Z", side: "back", group: "腕" },
    { id: "back_arm_right", name: "右腕(背面)", svgPath: "M272,165 Q282,170 290,180 L318,325 Q322,338 324,348 L297,350 L270,200 L272,165 Z", side: "back", group: "腕" },

    // ===== 脚(背面) =====
    { id: "back_thigh_left", name: "左ふともも(背面)", svgPath: "M150,410 Q175,415 198,410 Q198,460 195,530 L150,530 Q148,460 150,410 Z", side: "back", group: "下半身" },
    { id: "back_thigh_right", name: "右ふともも(背面)", svgPath: "M202,410 Q225,415 250,410 Q252,460 250,530 L205,530 Q202,460 202,410 Z", side: "back", group: "下半身" },
    { id: "back_lower_leg_left", name: "左ひざ下(背面)", svgPath: "M150,530 L195,530 Q195,610 190,680 L155,680 Q150,610 150,530 Z", side: "back", group: "下半身" },
    { id: "back_lower_leg_right", name: "右ひざ下(背面)", svgPath: "M205,530 L250,530 Q250,610 245,680 L210,680 Q205,610 205,530 Z", side: "back", group: "下半身" }
  ]
};

/**
 * Body Groups - グループ定義
 */
var BODY_GROUPS = [
  "顔",
  "首",
  "胴体",
  "腕",
  "下半身"
];
