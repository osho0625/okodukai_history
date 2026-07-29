/**
 * Body Map Data - ゾーン定義データ
 * 各Body_Zoneの定義（id, name, svgPath, side, group）
 * SVG viewBox: 0 0 400 800
 * 人体図は中心 x=200 に配置、幅約300px、高さ約750px
 */

var BODY_MAP_DATA = {
  front: [
    // ===== 頭部 (Head) =====
    { id: "front_head_01", name: "頭頂部左", svgPath: "M175,10 L200,10 L200,30 L175,30 Z", side: "front", group: "頭部" },
    { id: "front_head_02", name: "頭頂部右", svgPath: "M200,10 L225,10 L225,30 L200,30 Z", side: "front", group: "頭部" },
    { id: "front_head_03", name: "前頭部左", svgPath: "M170,30 L200,30 L200,50 L170,50 Z", side: "front", group: "頭部" },
    { id: "front_head_04", name: "前頭部右", svgPath: "M200,30 L230,30 L230,50 L200,50 Z", side: "front", group: "頭部" },
    { id: "front_head_05", name: "側頭部左", svgPath: "M160,40 L170,40 L170,70 L160,70 Z", side: "front", group: "頭部" },
    { id: "front_head_06", name: "側頭部右", svgPath: "M230,40 L240,40 L240,70 L230,70 Z", side: "front", group: "頭部" },

    // ===== 顔 (Face) =====
    { id: "front_face_01", name: "額左", svgPath: "M170,50 L200,50 L200,65 L170,65 Z", side: "front", group: "顔" },
    { id: "front_face_02", name: "額右", svgPath: "M200,50 L230,50 L230,65 L200,65 Z", side: "front", group: "顔" },
    { id: "front_face_03", name: "眉間", svgPath: "M190,65 L210,65 L210,75 L190,75 Z", side: "front", group: "顔" },
    { id: "front_face_04", name: "左こめかみ", svgPath: "M160,65 L175,65 L175,85 L160,85 Z", side: "front", group: "顔" },
    { id: "front_face_05", name: "右こめかみ", svgPath: "M225,65 L240,65 L240,85 L225,85 Z", side: "front", group: "顔" },
    { id: "front_face_06", name: "左頬上", svgPath: "M165,75 L190,75 L190,90 L165,90 Z", side: "front", group: "顔" },
    { id: "front_face_07", name: "右頬上", svgPath: "M210,75 L235,75 L235,90 L210,90 Z", side: "front", group: "顔" },
    { id: "front_face_08", name: "鼻", svgPath: "M190,75 L210,75 L210,95 L190,95 Z", side: "front", group: "顔" },
    { id: "front_face_09", name: "左頬下", svgPath: "M165,90 L190,90 L190,105 L165,105 Z", side: "front", group: "顔" },
    { id: "front_face_10", name: "右頬下", svgPath: "M210,90 L235,90 L235,105 L210,105 Z", side: "front", group: "顔" },
    { id: "front_face_11", name: "口周り", svgPath: "M185,95 L215,95 L215,110 L185,110 Z", side: "front", group: "顔" },
    { id: "front_face_12", name: "顎左", svgPath: "M175,105 L200,105 L200,120 L175,120 Z", side: "front", group: "顔" },
    { id: "front_face_13", name: "顎右", svgPath: "M200,105 L225,105 L225,120 L200,120 Z", side: "front", group: "顔" },
    { id: "front_face_14", name: "左耳前", svgPath: "M155,75 L165,75 L165,100 L155,100 Z", side: "front", group: "顔" },
    { id: "front_face_15", name: "右耳前", svgPath: "M235,75 L245,75 L245,100 L235,100 Z", side: "front", group: "顔" },

    // ===== 首 (Neck) =====
    { id: "front_neck_01", name: "首前面左", svgPath: "M180,120 L200,120 L200,140 L180,140 Z", side: "front", group: "首" },
    { id: "front_neck_02", name: "首前面右", svgPath: "M200,120 L220,120 L220,140 L200,140 Z", side: "front", group: "首" },
    { id: "front_neck_03", name: "首側面左", svgPath: "M165,120 L180,120 L180,140 L165,140 Z", side: "front", group: "首" },
    { id: "front_neck_04", name: "首側面右", svgPath: "M220,120 L235,120 L235,140 L220,140 Z", side: "front", group: "首" },

    // ===== 胸 (Chest) =====
    { id: "front_chest_01", name: "鎖骨左", svgPath: "M145,140 L200,140 L200,155 L145,155 Z", side: "front", group: "胸" },
    { id: "front_chest_02", name: "鎖骨右", svgPath: "M200,140 L255,140 L255,155 L200,155 Z", side: "front", group: "胸" },
    { id: "front_chest_03", name: "胸上部左", svgPath: "M145,155 L200,155 L200,185 L145,185 Z", side: "front", group: "胸" },
    { id: "front_chest_04", name: "胸上部右", svgPath: "M200,155 L255,155 L255,185 L200,185 Z", side: "front", group: "胸" },
    { id: "front_chest_05", name: "胸中央左", svgPath: "M155,185 L200,185 L200,215 L155,215 Z", side: "front", group: "胸" },
    { id: "front_chest_06", name: "胸中央右", svgPath: "M200,185 L245,185 L245,215 L200,215 Z", side: "front", group: "胸" },
    { id: "front_chest_07", name: "胸下部左", svgPath: "M155,215 L200,215 L200,240 L155,240 Z", side: "front", group: "胸" },
    { id: "front_chest_08", name: "胸下部右", svgPath: "M200,215 L245,215 L245,240 L200,240 Z", side: "front", group: "胸" },
    { id: "front_chest_09", name: "脇左", svgPath: "M130,155 L145,155 L145,195 L130,195 Z", side: "front", group: "胸" },
    { id: "front_chest_10", name: "脇右", svgPath: "M255,155 L270,155 L270,195 L255,195 Z", side: "front", group: "胸" },

    // ===== 腹 (Abdomen) =====
    { id: "front_abdomen_01", name: "上腹部左", svgPath: "M160,240 L200,240 L200,270 L160,270 Z", side: "front", group: "腹" },
    { id: "front_abdomen_02", name: "上腹部右", svgPath: "M200,240 L240,240 L240,270 L200,270 Z", side: "front", group: "腹" },
    { id: "front_abdomen_03", name: "中腹部左", svgPath: "M160,270 L200,270 L200,300 L160,300 Z", side: "front", group: "腹" },
    { id: "front_abdomen_04", name: "中腹部右", svgPath: "M200,270 L240,270 L240,300 L200,300 Z", side: "front", group: "腹" },
    { id: "front_abdomen_05", name: "下腹部左", svgPath: "M160,300 L200,300 L200,330 L160,330 Z", side: "front", group: "腹" },
    { id: "front_abdomen_06", name: "下腹部右", svgPath: "M200,300 L240,300 L240,330 L200,330 Z", side: "front", group: "腹" },
    { id: "front_abdomen_07", name: "側腹部左", svgPath: "M140,240 L160,240 L160,310 L140,310 Z", side: "front", group: "腹" },
    { id: "front_abdomen_08", name: "側腹部右", svgPath: "M240,240 L260,240 L260,310 L240,310 Z", side: "front", group: "腹" },
    { id: "front_abdomen_09", name: "鼠径部左", svgPath: "M160,330 L200,330 L200,355 L160,355 Z", side: "front", group: "腹" },
    { id: "front_abdomen_10", name: "鼠径部右", svgPath: "M200,330 L240,330 L240,355 L200,355 Z", side: "front", group: "腹" },

    // ===== 左腕 (Left Arm) =====
    { id: "front_left_arm_01", name: "左肩", svgPath: "M110,140 L145,140 L145,165 L110,165 Z", side: "front", group: "左腕" },
    { id: "front_left_arm_02", name: "左上腕外側上", svgPath: "M100,165 L125,165 L125,200 L100,200 Z", side: "front", group: "左腕" },
    { id: "front_left_arm_03", name: "左上腕内側上", svgPath: "M125,165 L145,165 L145,200 L125,200 Z", side: "front", group: "左腕" },
    { id: "front_left_arm_04", name: "左上腕外側下", svgPath: "M95,200 L120,200 L120,235 L95,235 Z", side: "front", group: "左腕" },
    { id: "front_left_arm_05", name: "左上腕内側下", svgPath: "M120,200 L140,200 L140,235 L120,235 Z", side: "front", group: "左腕" },
    { id: "front_left_arm_06", name: "左肘", svgPath: "M90,235 L130,235 L130,255 L90,255 Z", side: "front", group: "左腕" },
    { id: "front_left_arm_07", name: "左前腕外側上", svgPath: "M85,255 L110,255 L110,290 L85,290 Z", side: "front", group: "左腕" },
    { id: "front_left_arm_08", name: "左前腕内側上", svgPath: "M110,255 L130,255 L130,290 L110,290 Z", side: "front", group: "左腕" },
    { id: "front_left_arm_09", name: "左前腕外側下", svgPath: "M80,290 L105,290 L105,325 L80,325 Z", side: "front", group: "左腕" },
    { id: "front_left_arm_10", name: "左前腕内側下", svgPath: "M105,290 L125,290 L125,325 L105,325 Z", side: "front", group: "左腕" },
    { id: "front_left_arm_11", name: "左手首", svgPath: "M78,325 L118,325 L118,340 L78,340 Z", side: "front", group: "左腕" },

    // ===== 右腕 (Right Arm) =====
    { id: "front_right_arm_01", name: "右肩", svgPath: "M255,140 L290,140 L290,165 L255,165 Z", side: "front", group: "右腕" },
    { id: "front_right_arm_02", name: "右上腕外側上", svgPath: "M275,165 L300,165 L300,200 L275,200 Z", side: "front", group: "右腕" },
    { id: "front_right_arm_03", name: "右上腕内側上", svgPath: "M255,165 L275,165 L275,200 L255,200 Z", side: "front", group: "右腕" },
    { id: "front_right_arm_04", name: "右上腕外側下", svgPath: "M280,200 L305,200 L305,235 L280,235 Z", side: "front", group: "右腕" },
    { id: "front_right_arm_05", name: "右上腕内側下", svgPath: "M260,200 L280,200 L280,235 L260,235 Z", side: "front", group: "右腕" },
    { id: "front_right_arm_06", name: "右肘", svgPath: "M270,235 L310,235 L310,255 L270,255 Z", side: "front", group: "右腕" },
    { id: "front_right_arm_07", name: "右前腕外側上", svgPath: "M290,255 L315,255 L315,290 L290,290 Z", side: "front", group: "右腕" },
    { id: "front_right_arm_08", name: "右前腕内側上", svgPath: "M270,255 L290,255 L290,290 L270,290 Z", side: "front", group: "右腕" },
    { id: "front_right_arm_09", name: "右前腕外側下", svgPath: "M295,290 L320,290 L320,325 L295,325 Z", side: "front", group: "右腕" },
    { id: "front_right_arm_10", name: "右前腕内側下", svgPath: "M275,290 L295,290 L295,325 L275,325 Z", side: "front", group: "右腕" },
    { id: "front_right_arm_11", name: "右手首", svgPath: "M282,325 L322,325 L322,340 L282,340 Z", side: "front", group: "右腕" },

    // ===== 左手 (Left Hand) =====
    { id: "front_left_hand_01", name: "左手甲", svgPath: "M75,340 L100,340 L100,365 L75,365 Z", side: "front", group: "左手" },
    { id: "front_left_hand_02", name: "左手掌", svgPath: "M100,340 L120,340 L120,365 L100,365 Z", side: "front", group: "左手" },
    { id: "front_left_hand_03", name: "左指", svgPath: "M75,365 L120,365 L120,390 L75,390 Z", side: "front", group: "左手" },

    // ===== 右手 (Right Hand) =====
    { id: "front_right_hand_01", name: "右手甲", svgPath: "M300,340 L325,340 L325,365 L300,365 Z", side: "front", group: "右手" },
    { id: "front_right_hand_02", name: "右手掌", svgPath: "M280,340 L300,340 L300,365 L280,365 Z", side: "front", group: "右手" },
    { id: "front_right_hand_03", name: "右指", svgPath: "M280,365 L325,365 L325,390 L280,390 Z", side: "front", group: "右手" },

    // ===== 左脚 (Left Leg) =====
    { id: "front_left_leg_01", name: "左大腿前面上", svgPath: "M155,355 L195,355 L195,390 L155,390 Z", side: "front", group: "左脚" },
    { id: "front_left_leg_02", name: "左大腿前面中", svgPath: "M155,390 L195,390 L195,425 L155,425 Z", side: "front", group: "左脚" },
    { id: "front_left_leg_03", name: "左大腿前面下", svgPath: "M155,425 L195,425 L195,460 L155,460 Z", side: "front", group: "左脚" },
    { id: "front_left_leg_04", name: "左大腿外側上", svgPath: "M140,355 L155,355 L155,405 L140,405 Z", side: "front", group: "左脚" },
    { id: "front_left_leg_05", name: "左大腿外側下", svgPath: "M140,405 L155,405 L155,460 L140,460 Z", side: "front", group: "左脚" },
    { id: "front_left_leg_06", name: "左大腿内側上", svgPath: "M195,355 L210,355 L210,405 L195,405 Z", side: "front", group: "左脚" },
    { id: "front_left_leg_07", name: "左大腿内側下", svgPath: "M195,405 L210,405 L210,460 L195,460 Z", side: "front", group: "左脚" },
    { id: "front_left_leg_08", name: "左膝", svgPath: "M150,460 L200,460 L200,490 L150,490 Z", side: "front", group: "左脚" },
    { id: "front_left_leg_09", name: "左脛上", svgPath: "M152,490 L188,490 L188,530 L152,530 Z", side: "front", group: "左脚" },
    { id: "front_left_leg_10", name: "左脛中", svgPath: "M152,530 L188,530 L188,570 L152,570 Z", side: "front", group: "左脚" },
    { id: "front_left_leg_11", name: "左脛下", svgPath: "M152,570 L188,570 L188,610 L152,610 Z", side: "front", group: "左脚" },
    { id: "front_left_leg_12", name: "左ふくらはぎ外側", svgPath: "M140,490 L152,490 L152,580 L140,580 Z", side: "front", group: "左脚" },
    { id: "front_left_leg_13", name: "左ふくらはぎ内側", svgPath: "M188,490 L200,490 L200,580 L188,580 Z", side: "front", group: "左脚" },
    { id: "front_left_leg_14", name: "左足首", svgPath: "M148,610 L192,610 L192,640 L148,640 Z", side: "front", group: "左脚" },

    // ===== 右脚 (Right Leg) =====
    { id: "front_right_leg_01", name: "右大腿前面上", svgPath: "M205,355 L245,355 L245,390 L205,390 Z", side: "front", group: "右脚" },
    { id: "front_right_leg_02", name: "右大腿前面中", svgPath: "M205,390 L245,390 L245,425 L205,425 Z", side: "front", group: "右脚" },
    { id: "front_right_leg_03", name: "右大腿前面下", svgPath: "M205,425 L245,425 L245,460 L205,460 Z", side: "front", group: "右脚" },
    { id: "front_right_leg_04", name: "右大腿外側上", svgPath: "M245,355 L260,355 L260,405 L245,405 Z", side: "front", group: "右脚" },
    { id: "front_right_leg_05", name: "右大腿外側下", svgPath: "M245,405 L260,405 L260,460 L245,460 Z", side: "front", group: "右脚" },
    { id: "front_right_leg_06", name: "右大腿内側上", svgPath: "M190,355 L205,355 L205,405 L190,405 Z", side: "front", group: "右脚" },
    { id: "front_right_leg_07", name: "右大腿内側下", svgPath: "M190,405 L205,405 L205,460 L190,460 Z", side: "front", group: "右脚" },
    { id: "front_right_leg_08", name: "右膝", svgPath: "M200,460 L250,460 L250,490 L200,490 Z", side: "front", group: "右脚" },
    { id: "front_right_leg_09", name: "右脛上", svgPath: "M212,490 L248,490 L248,530 L212,530 Z", side: "front", group: "右脚" },
    { id: "front_right_leg_10", name: "右脛中", svgPath: "M212,530 L248,530 L248,570 L212,570 Z", side: "front", group: "右脚" },
    { id: "front_right_leg_11", name: "右脛下", svgPath: "M212,570 L248,570 L248,610 L212,610 Z", side: "front", group: "右脚" },
    { id: "front_right_leg_12", name: "右ふくらはぎ外側", svgPath: "M248,490 L260,490 L260,580 L248,580 Z", side: "front", group: "右脚" },
    { id: "front_right_leg_13", name: "右ふくらはぎ内側", svgPath: "M200,490 L212,490 L212,580 L200,580 Z", side: "front", group: "右脚" },
    { id: "front_right_leg_14", name: "右足首", svgPath: "M208,610 L252,610 L252,640 L208,640 Z", side: "front", group: "右脚" },

    // ===== 左足 (Left Foot) =====
    { id: "front_left_foot_01", name: "左足甲外側", svgPath: "M145,640 L165,640 L165,670 L145,670 Z", side: "front", group: "左足" },
    { id: "front_left_foot_02", name: "左足甲内側", svgPath: "M165,640 L190,640 L190,670 L165,670 Z", side: "front", group: "左足" },
    { id: "front_left_foot_03", name: "左つま先", svgPath: "M145,670 L190,670 L190,695 L145,695 Z", side: "front", group: "左足" },

    // ===== 右足 (Right Foot) =====
    { id: "front_right_foot_01", name: "右足甲外側", svgPath: "M235,640 L255,640 L255,670 L235,670 Z", side: "front", group: "右足" },
    { id: "front_right_foot_02", name: "右足甲内側", svgPath: "M210,640 L235,640 L235,670 L210,670 Z", side: "front", group: "右足" },
    { id: "front_right_foot_03", name: "右つま先", svgPath: "M210,670 L255,670 L255,695 L210,695 Z", side: "front", group: "右足" }
  ],

  back: [
    // ===== 頭部 (Back of Head) =====
    { id: "back_head_01", name: "後頭部左上", svgPath: "M175,10 L200,10 L200,30 L175,30 Z", side: "back", group: "頭部" },
    { id: "back_head_02", name: "後頭部右上", svgPath: "M200,10 L225,10 L225,30 L200,30 Z", side: "back", group: "頭部" },
    { id: "back_head_03", name: "後頭部左下", svgPath: "M170,30 L200,30 L200,55 L170,55 Z", side: "back", group: "頭部" },
    { id: "back_head_04", name: "後頭部右下", svgPath: "M200,30 L230,30 L230,55 L200,55 Z", side: "back", group: "頭部" },
    { id: "back_head_05", name: "後頭部側面左", svgPath: "M160,35 L170,35 L170,65 L160,65 Z", side: "back", group: "頭部" },
    { id: "back_head_06", name: "後頭部側面右", svgPath: "M230,35 L240,35 L240,65 L230,65 Z", side: "back", group: "頭部" },
    { id: "back_head_07", name: "後頭部中央上", svgPath: "M180,55 L220,55 L220,70 L180,70 Z", side: "back", group: "頭部" },
    { id: "back_head_08", name: "後頭部中央下", svgPath: "M180,70 L220,70 L220,85 L180,85 Z", side: "back", group: "頭部" },
    { id: "back_head_09", name: "左耳後", svgPath: "M155,55 L170,55 L170,85 L155,85 Z", side: "back", group: "頭部" },
    { id: "back_head_10", name: "右耳後", svgPath: "M230,55 L245,55 L245,85 L230,85 Z", side: "back", group: "頭部" },

    // ===== 首 (Back Neck) =====
    { id: "back_neck_01", name: "うなじ左", svgPath: "M175,85 L200,85 L200,110 L175,110 Z", side: "back", group: "首" },
    { id: "back_neck_02", name: "うなじ右", svgPath: "M200,85 L225,85 L225,110 L200,110 Z", side: "back", group: "首" },
    { id: "back_neck_03", name: "首後面左", svgPath: "M175,110 L200,110 L200,140 L175,140 Z", side: "back", group: "首" },
    { id: "back_neck_04", name: "首後面右", svgPath: "M200,110 L225,110 L225,140 L200,140 Z", side: "back", group: "首" },
    { id: "back_neck_05", name: "首側面左", svgPath: "M160,100 L175,100 L175,140 L160,140 Z", side: "back", group: "首" },
    { id: "back_neck_06", name: "首側面右", svgPath: "M225,100 L240,100 L240,140 L225,140 Z", side: "back", group: "首" },

    // ===== 背中上部 (Upper Back) =====
    { id: "back_upper_01", name: "僧帽筋左", svgPath: "M150,140 L200,140 L200,165 L150,165 Z", side: "back", group: "背中上部" },
    { id: "back_upper_02", name: "僧帽筋右", svgPath: "M200,140 L250,140 L250,165 L200,165 Z", side: "back", group: "背中上部" },
    { id: "back_upper_03", name: "肩甲骨上左", svgPath: "M145,165 L200,165 L200,195 L145,195 Z", side: "back", group: "背中上部" },
    { id: "back_upper_04", name: "肩甲骨上右", svgPath: "M200,165 L255,165 L255,195 L200,195 Z", side: "back", group: "背中上部" },
    { id: "back_upper_05", name: "肩甲骨下左", svgPath: "M145,195 L200,195 L200,225 L145,225 Z", side: "back", group: "背中上部" },
    { id: "back_upper_06", name: "肩甲骨下右", svgPath: "M200,195 L255,195 L255,225 L200,225 Z", side: "back", group: "背中上部" },
    { id: "back_upper_07", name: "背中上部中央", svgPath: "M175,225 L225,225 L225,250 L175,250 Z", side: "back", group: "背中上部" },
    { id: "back_upper_08", name: "背中上部左側", svgPath: "M140,225 L175,225 L175,250 L140,250 Z", side: "back", group: "背中上部" },
    { id: "back_upper_09", name: "背中上部右側", svgPath: "M225,225 L260,225 L260,250 L225,250 Z", side: "back", group: "背中上部" },

    // ===== 背中下部 (Lower Back) =====
    { id: "back_lower_01", name: "腰左上", svgPath: "M155,250 L200,250 L200,280 L155,280 Z", side: "back", group: "背中下部" },
    { id: "back_lower_02", name: "腰右上", svgPath: "M200,250 L245,250 L245,280 L200,280 Z", side: "back", group: "背中下部" },
    { id: "back_lower_03", name: "腰左下", svgPath: "M155,280 L200,280 L200,310 L155,310 Z", side: "back", group: "背中下部" },
    { id: "back_lower_04", name: "腰右下", svgPath: "M200,280 L245,280 L245,310 L200,310 Z", side: "back", group: "背中下部" },
    { id: "back_lower_05", name: "腰側面左", svgPath: "M135,250 L155,250 L155,310 L135,310 Z", side: "back", group: "背中下部" },
    { id: "back_lower_06", name: "腰側面右", svgPath: "M245,250 L265,250 L265,310 L245,310 Z", side: "back", group: "背中下部" },
    { id: "back_lower_07", name: "仙骨部", svgPath: "M175,310 L225,310 L225,340 L175,340 Z", side: "back", group: "背中下部" },

    // ===== 臀部 (Buttocks) =====
    { id: "back_buttock_01", name: "臀部左上", svgPath: "M155,340 L200,340 L200,370 L155,370 Z", side: "back", group: "臀部" },
    { id: "back_buttock_02", name: "臀部右上", svgPath: "M200,340 L245,340 L245,370 L200,370 Z", side: "back", group: "臀部" },
    { id: "back_buttock_03", name: "臀部左下", svgPath: "M155,370 L200,370 L200,400 L155,400 Z", side: "back", group: "臀部" },
    { id: "back_buttock_04", name: "臀部右下", svgPath: "M200,370 L245,370 L245,400 L200,400 Z", side: "back", group: "臀部" },
    { id: "back_buttock_05", name: "臀部外側左", svgPath: "M140,340 L155,340 L155,400 L140,400 Z", side: "back", group: "臀部" },
    { id: "back_buttock_06", name: "臀部外側右", svgPath: "M245,340 L260,340 L260,400 L245,400 Z", side: "back", group: "臀部" },

    // ===== 左腕 (Left Arm - Back) =====
    { id: "back_left_arm_01", name: "左肩後面", svgPath: "M110,140 L145,140 L145,165 L110,165 Z", side: "back", group: "左腕" },
    { id: "back_left_arm_02", name: "左上腕後面上", svgPath: "M100,165 L130,165 L130,200 L100,200 Z", side: "back", group: "左腕" },
    { id: "back_left_arm_03", name: "左上腕後面下", svgPath: "M95,200 L130,200 L130,235 L95,235 Z", side: "back", group: "左腕" },
    { id: "back_left_arm_04", name: "左三頭筋", svgPath: "M130,165 L145,165 L145,235 L130,235 Z", side: "back", group: "左腕" },
    { id: "back_left_arm_05", name: "左肘後面", svgPath: "M90,235 L135,235 L135,255 L90,255 Z", side: "back", group: "左腕" },
    { id: "back_left_arm_06", name: "左前腕後面上", svgPath: "M85,255 L120,255 L120,290 L85,290 Z", side: "back", group: "左腕" },
    { id: "back_left_arm_07", name: "左前腕後面下", svgPath: "M80,290 L115,290 L115,325 L80,325 Z", side: "back", group: "左腕" },
    { id: "back_left_arm_08", name: "左前腕外側", svgPath: "M115,255 L130,255 L125,325 L110,325 Z", side: "back", group: "左腕" },
    { id: "back_left_arm_09", name: "左手首後面", svgPath: "M78,325 L118,325 L118,340 L78,340 Z", side: "back", group: "左腕" },

    // ===== 右腕 (Right Arm - Back) =====
    { id: "back_right_arm_01", name: "右肩後面", svgPath: "M255,140 L290,140 L290,165 L255,165 Z", side: "back", group: "右腕" },
    { id: "back_right_arm_02", name: "右上腕後面上", svgPath: "M270,165 L300,165 L300,200 L270,200 Z", side: "back", group: "右腕" },
    { id: "back_right_arm_03", name: "右上腕後面下", svgPath: "M270,200 L305,200 L305,235 L270,235 Z", side: "back", group: "右腕" },
    { id: "back_right_arm_04", name: "右三頭筋", svgPath: "M255,165 L270,165 L270,235 L255,235 Z", side: "back", group: "右腕" },
    { id: "back_right_arm_05", name: "右肘後面", svgPath: "M265,235 L310,235 L310,255 L265,255 Z", side: "back", group: "右腕" },
    { id: "back_right_arm_06", name: "右前腕後面上", svgPath: "M280,255 L315,255 L315,290 L280,290 Z", side: "back", group: "右腕" },
    { id: "back_right_arm_07", name: "右前腕後面下", svgPath: "M285,290 L320,290 L320,325 L285,325 Z", side: "back", group: "右腕" },
    { id: "back_right_arm_08", name: "右前腕外側", svgPath: "M270,255 L285,255 L290,325 L275,325 Z", side: "back", group: "右腕" },
    { id: "back_right_arm_09", name: "右手首後面", svgPath: "M282,325 L322,325 L322,340 L282,340 Z", side: "back", group: "右腕" },

    // ===== 左手 (Left Hand - Back) =====
    { id: "back_left_hand_01", name: "左手背上", svgPath: "M75,340 L105,340 L105,360 L75,360 Z", side: "back", group: "左手" },
    { id: "back_left_hand_02", name: "左手背下", svgPath: "M75,360 L105,360 L105,380 L75,380 Z", side: "back", group: "左手" },
    { id: "back_left_hand_03", name: "左指背", svgPath: "M75,380 L105,380 L105,400 L75,400 Z", side: "back", group: "左手" },

    // ===== 右手 (Right Hand - Back) =====
    { id: "back_right_hand_01", name: "右手背上", svgPath: "M295,340 L325,340 L325,360 L295,360 Z", side: "back", group: "右手" },
    { id: "back_right_hand_02", name: "右手背下", svgPath: "M295,360 L325,360 L325,380 L295,380 Z", side: "back", group: "右手" },
    { id: "back_right_hand_03", name: "右指背", svgPath: "M295,380 L325,380 L325,400 L295,400 Z", side: "back", group: "右手" },

    // ===== 左脚 (Left Leg - Back) =====
    { id: "back_left_leg_01", name: "左大腿後面上", svgPath: "M155,400 L200,400 L200,435 L155,435 Z", side: "back", group: "左脚" },
    { id: "back_left_leg_02", name: "左大腿後面中", svgPath: "M155,435 L200,435 L200,470 L155,470 Z", side: "back", group: "左脚" },
    { id: "back_left_leg_03", name: "左大腿後面下", svgPath: "M155,470 L200,470 L200,500 L155,500 Z", side: "back", group: "左脚" },
    { id: "back_left_leg_04", name: "左大腿外側上", svgPath: "M140,400 L155,400 L155,450 L140,450 Z", side: "back", group: "左脚" },
    { id: "back_left_leg_05", name: "左大腿外側下", svgPath: "M140,450 L155,450 L155,500 L140,500 Z", side: "back", group: "左脚" },
    { id: "back_left_leg_06", name: "左大腿内側", svgPath: "M200,400 L215,400 L215,500 L200,500 Z", side: "back", group: "左脚" },
    { id: "back_left_leg_07", name: "左膝裏", svgPath: "M150,500 L205,500 L205,525 L150,525 Z", side: "back", group: "左脚" },
    { id: "back_left_leg_08", name: "左ふくらはぎ上", svgPath: "M152,525 L195,525 L195,560 L152,560 Z", side: "back", group: "左脚" },
    { id: "back_left_leg_09", name: "左ふくらはぎ中", svgPath: "M152,560 L195,560 L195,595 L152,595 Z", side: "back", group: "左脚" },
    { id: "back_left_leg_10", name: "左ふくらはぎ下", svgPath: "M152,595 L195,595 L195,625 L152,625 Z", side: "back", group: "左脚" },
    { id: "back_left_leg_11", name: "左ふくらはぎ外側", svgPath: "M140,525 L152,525 L152,610 L140,610 Z", side: "back", group: "左脚" },
    { id: "back_left_leg_12", name: "左ふくらはぎ内側", svgPath: "M195,525 L207,525 L207,610 L195,610 Z", side: "back", group: "左脚" },
    { id: "back_left_leg_13", name: "左アキレス腱", svgPath: "M155,625 L190,625 L190,650 L155,650 Z", side: "back", group: "左脚" },

    // ===== 右脚 (Right Leg - Back) =====
    { id: "back_right_leg_01", name: "右大腿後面上", svgPath: "M200,400 L245,400 L245,435 L200,435 Z", side: "back", group: "右脚" },
    { id: "back_right_leg_02", name: "右大腿後面中", svgPath: "M200,435 L245,435 L245,470 L200,470 Z", side: "back", group: "右脚" },
    { id: "back_right_leg_03", name: "右大腿後面下", svgPath: "M200,470 L245,470 L245,500 L200,500 Z", side: "back", group: "右脚" },
    { id: "back_right_leg_04", name: "右大腿外側上", svgPath: "M245,400 L260,400 L260,450 L245,450 Z", side: "back", group: "右脚" },
    { id: "back_right_leg_05", name: "右大腿外側下", svgPath: "M245,450 L260,450 L260,500 L245,500 Z", side: "back", group: "右脚" },
    { id: "back_right_leg_06", name: "右大腿内側", svgPath: "M185,400 L200,400 L200,500 L185,500 Z", side: "back", group: "右脚" },
    { id: "back_right_leg_07", name: "右膝裏", svgPath: "M195,500 L250,500 L250,525 L195,525 Z", side: "back", group: "右脚" },
    { id: "back_right_leg_08", name: "右ふくらはぎ上", svgPath: "M205,525 L248,525 L248,560 L205,560 Z", side: "back", group: "右脚" },
    { id: "back_right_leg_09", name: "右ふくらはぎ中", svgPath: "M205,560 L248,560 L248,595 L205,595 Z", side: "back", group: "右脚" },
    { id: "back_right_leg_10", name: "右ふくらはぎ下", svgPath: "M205,595 L248,595 L248,625 L205,625 Z", side: "back", group: "右脚" },
    { id: "back_right_leg_11", name: "右ふくらはぎ外側", svgPath: "M248,525 L260,525 L260,610 L248,610 Z", side: "back", group: "右脚" },
    { id: "back_right_leg_12", name: "右ふくらはぎ内側", svgPath: "M193,525 L205,525 L205,610 L193,610 Z", side: "back", group: "右脚" },
    { id: "back_right_leg_13", name: "右アキレス腱", svgPath: "M210,625 L245,625 L245,650 L210,650 Z", side: "back", group: "右脚" },

    // ===== 背中下部 追加ゾーン =====
    { id: "back_lower_08", name: "腰中央左", svgPath: "M165,310 L200,310 L200,340 L165,340 Z", side: "back", group: "背中下部" },
    { id: "back_lower_09", name: "腰中央右", svgPath: "M200,310 L235,310 L235,340 L200,340 Z", side: "back", group: "背中下部" },

    // ===== 左足 (Left Foot - Back) =====
    { id: "back_left_foot_01", name: "左かかと", svgPath: "M150,650 L185,650 L185,675 L150,675 Z", side: "back", group: "左足" },
    { id: "back_left_foot_02", name: "左足裏上", svgPath: "M148,675 L188,675 L188,700 L148,700 Z", side: "back", group: "左足" },
    { id: "back_left_foot_03", name: "左足裏下", svgPath: "M148,700 L188,700 L188,725 L148,725 Z", side: "back", group: "左足" },

    // ===== 右足 (Right Foot - Back) =====
    { id: "back_right_foot_01", name: "右かかと", svgPath: "M215,650 L250,650 L250,675 L215,675 Z", side: "back", group: "右足" },
    { id: "back_right_foot_02", name: "右足裏上", svgPath: "M212,675 L252,675 L252,700 L212,700 Z", side: "back", group: "右足" },
    { id: "back_right_foot_03", name: "右足裏下", svgPath: "M212,700 L252,700 L252,725 L212,725 Z", side: "back", group: "右足" }
  ]
};

/**
 * Body Groups - グループ定義
 * 各ゾーンのgroupフィールドは必ずこの配列内に含まれる
 */
var BODY_GROUPS = [
  "頭部",
  "顔",
  "首",
  "胸",
  "腹",
  "左腕",
  "右腕",
  "左手",
  "右手",
  "左脚",
  "右脚",
  "左足",
  "右足",
  "背中上部",
  "背中下部",
  "臀部"
];
