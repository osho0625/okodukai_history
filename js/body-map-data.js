/**
 * Body Map Data - ゾーン定義データ（簡易版）
 * 大きなゾーンに分割: 頭部(ほっぺ/くちびるの上/顎下/首)、胴体(わき/胸/腰)、腕、股間、ふともも、ひざ下
 * SVG viewBox: 0 0 400 800
 * 人体図は中心 x=200 に配置
 */

var BODY_MAP_DATA = {
  front: [
    // ===== 顔・頭部 =====
    { id: "front_cheek_left", name: "左ほっぺ", svgPath: "M165,65 L195,65 L195,100 L165,100 Z", side: "front", group: "顔" },
    { id: "front_cheek_right", name: "右ほっぺ", svgPath: "M205,65 L235,65 L235,100 L205,100 Z", side: "front", group: "顔" },
    { id: "front_upper_lip", name: "くちびるの上", svgPath: "M180,95 L220,95 L220,110 L180,110 Z", side: "front", group: "顔" },
    { id: "front_chin", name: "顎下", svgPath: "M175,110 L225,110 L225,130 L175,130 Z", side: "front", group: "顔" },

    // ===== 首 =====
    { id: "front_neck", name: "首", svgPath: "M170,130 L230,130 L230,155 L170,155 Z", side: "front", group: "首" },

    // ===== 胴体 =====
    { id: "front_armpit_left", name: "左わき", svgPath: "M130,160 L155,160 L155,200 L130,200 Z", side: "front", group: "胴体" },
    { id: "front_armpit_right", name: "右わき", svgPath: "M245,160 L270,160 L270,200 L245,200 Z", side: "front", group: "胴体" },
    { id: "front_chest", name: "胸", svgPath: "M155,155 L245,155 L245,250 L155,250 Z", side: "front", group: "胴体" },
    { id: "front_waist", name: "腰", svgPath: "M155,250 L245,250 L245,340 L155,340 Z", side: "front", group: "胴体" },

    // ===== 腕 =====
    { id: "front_arm_left", name: "左腕", svgPath: "M80,160 L130,160 L100,340 L70,340 Z", side: "front", group: "腕" },
    { id: "front_arm_right", name: "右腕", svgPath: "M270,160 L320,160 L330,340 L300,340 Z", side: "front", group: "腕" },

    // ===== 下半身 =====
    { id: "front_groin", name: "股間", svgPath: "M170,340 L230,340 L230,380 L170,380 Z", side: "front", group: "下半身" },
    { id: "front_thigh_left", name: "左ふともも", svgPath: "M145,380 L198,380 L198,500 L145,500 Z", side: "front", group: "下半身" },
    { id: "front_thigh_right", name: "右ふともも", svgPath: "M202,380 L255,380 L255,500 L202,500 Z", side: "front", group: "下半身" },
    { id: "front_lower_leg_left", name: "左ひざ下", svgPath: "M148,500 L195,500 L195,660 L148,660 Z", side: "front", group: "下半身" },
    { id: "front_lower_leg_right", name: "右ひざ下", svgPath: "M205,500 L252,500 L252,660 L205,660 Z", side: "front", group: "下半身" }
  ],

  back: [
    // ===== 首(背面) =====
    { id: "back_neck", name: "うなじ", svgPath: "M170,85 L230,85 L230,155 L170,155 Z", side: "back", group: "首" },

    // ===== 背中 =====
    { id: "back_upper", name: "背中", svgPath: "M145,155 L255,155 L255,280 L145,280 Z", side: "back", group: "胴体" },
    { id: "back_lower", name: "腰(背面)", svgPath: "M145,280 L255,280 L255,350 L145,350 Z", side: "back", group: "胴体" },
    { id: "back_buttocks", name: "おしり", svgPath: "M150,350 L250,350 L250,410 L150,410 Z", side: "back", group: "下半身" },

    // ===== 腕(背面) =====
    { id: "back_arm_left", name: "左腕(背面)", svgPath: "M80,155 L145,155 L110,340 L70,340 Z", side: "back", group: "腕" },
    { id: "back_arm_right", name: "右腕(背面)", svgPath: "M255,155 L320,155 L330,340 L290,340 Z", side: "back", group: "腕" },

    // ===== 脚(背面) =====
    { id: "back_thigh_left", name: "左ふともも(背面)", svgPath: "M145,410 L198,410 L198,530 L145,530 Z", side: "back", group: "下半身" },
    { id: "back_thigh_right", name: "右ふともも(背面)", svgPath: "M202,410 L255,410 L255,530 L202,530 Z", side: "back", group: "下半身" },
    { id: "back_lower_leg_left", name: "左ひざ下(背面)", svgPath: "M148,530 L195,530 L195,680 L148,680 Z", side: "back", group: "下半身" },
    { id: "back_lower_leg_right", name: "右ひざ下(背面)", svgPath: "M205,530 L252,530 L252,680 L205,680 Z", side: "back", group: "下半身" }
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
