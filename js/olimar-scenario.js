// オリマーの冒険 - シナリオデータ
// olimar.html本体のメインscript内で定義された SCENARIO オブジェクトに全ノードを追加する
Object.assign(SCENARIO, {
  intro1: {
    scene: 'crash',
    text: [
      '<ruby>激<rt>はげ</rt></ruby>しい<ruby>衝撃<rt>しょうげき</rt></ruby>。<ruby>金属<rt>きんぞく</rt></ruby>がひしゃげる<ruby>音<rt>おと</rt></ruby>。',
      '<ruby>気<rt>き</rt></ruby>がつくと、<ruby>見知<rt>みし</rt></ruby>らぬ<ruby>惑星<rt>わくせい</rt></ruby>の<ruby>地表<rt>ちひょう</rt></ruby>に<ruby>投<rt>な</rt></ruby>げ<ruby>出<rt>だ</rt></ruby>されていた。',
      '<ruby>宇宙船<rt>うちゅうせん</rt></ruby>は<ruby>大破<rt>たいは</rt></ruby>し、エンジンから<ruby>黒煙<rt>こくえん</rt></ruby>が<ruby>上<rt>あ</rt></ruby>がっている。<ruby>空<rt>そら</rt></ruby>は<ruby>薄紫色<rt>うすむらさきいろ</rt></ruby>。<ruby>見<rt>み</rt></ruby>たことのない<ruby>植物<rt>しょくぶつ</rt></ruby>が<ruby>辺<rt>あた</rt></ruby>りを<ruby>覆<rt>おお</rt></ruby>っている。',
    ],
    choices: [{ text: '<ruby>周囲<rt>しゅうい</rt></ruby>を<ruby>見渡<rt>みわた</rt></ruby>す', next: 'crash_site' }],
    onEnter() { unlockAchievement('first_step'); }
  },
  crash_site: {
    scene: 'crash',
    text: [
      '【<ruby>不時着地点<rt>ふじちゃくちてん</rt></ruby>】',
      '<ruby>壊<rt>こわ</rt></ruby>れたロケットの<ruby>残骸<rt>ざんがい</rt></ruby>から<ruby>炎<rt>ほのお</rt></ruby>が<ruby>上<rt>あ</rt></ruby>がっている。<ruby>近<rt>ちか</rt></ruby>づくと<ruby>熱<rt>ねつ</rt></ruby>い。',
      '<ruby>東<rt>ひがし</rt></ruby>に<ruby>森<rt>もり</rt></ruby>への<ruby>小道<rt>こみち</rt></ruby>、<ruby>西<rt>にし</rt></ruby>に<ruby>大<rt>おお</rt></ruby>きな<ruby>岩<rt>いわ</rt></ruby>、<ruby>北<rt>きた</rt></ruby>に<ruby>暗<rt>くら</rt></ruby>い<ruby>洞窟<rt>どうくつ</rt></ruby>の<ruby>入口<rt>いりぐち</rt></ruby>が<ruby>見<rt>み</rt></ruby>える。',
    ],
    choices() {
      const c = [
        { text: '▶ <ruby>東<rt>ひがし</rt></ruby>の<ruby>森<rt>もり</rt></ruby>へ', next: 'forest_path' },
        { text: '🪨 <ruby>大<rt>おお</rt></ruby>きな<ruby>岩<rt>いわ</rt></ruby>を<ruby>調<rt>しら</rt></ruby>べる', next: 'big_rock' },
        { text: '🚀 ロケットを<ruby>調<rt>しら</rt></ruby>べる', next: 'check_rocket' },
        { text: '🕳️ <ruby>洞窟<rt>どうくつ</rt></ruby>に<ruby>入<rt>はい</rt></ruby>る', next: 'cave_entrance' },
      ];
      if (G.flags.needParts && !G.flags.gotCommModule && isUsingPikmin('赤ピクミン')) {
        c.push({ text: '📡 <ruby>通信<rt>つうしん</rt></ruby>モジュールを<ruby>回収<rt>かいしゅう</rt></ruby>する', next: 'get_comm_module' });
      }
      return c;
    }
  },
  check_rocket: {
    scene: 'crash',
    text() {
      if (G.flags.gotExploreKit) return ['ロケットの<ruby>残骸<rt>ざんがい</rt></ruby>。もう<ruby>火<rt>ひ</rt></ruby>は<ruby>消<rt>き</rt></ruby>えている。めぼしいものは<ruby>残<rt>のこ</rt></ruby>っていない。'];
      if (G.flags.gotFiresuit) return [
        '<ruby>耐火服<rt>たいかふく</rt></ruby>を<ruby>着<rt>き</rt></ruby>ているおかげで、<ruby>炎<rt>ほのお</rt></ruby>の<ruby>中<rt>なか</rt></ruby>に<ruby>手<rt>て</rt></ruby>を<ruby>伸<rt>の</rt></ruby>ばせる。',
        'コックピットの<ruby>奥<rt>おく</rt></ruby>に、<ruby>燃<rt>も</rt></ruby>え<ruby>残<rt>のこ</rt></ruby>った<ruby>探検<rt>たんけん</rt></ruby>キットが<ruby>見<rt>み</rt></ruby>える。',
      ];
      if (G.flags.gotKit) return [
        'ロケットの<ruby>残骸<rt>ざんがい</rt></ruby>。エンジン<ruby>付近<rt>ふきん</rt></ruby>から<ruby>激<rt>はげ</rt></ruby>しく<ruby>炎<rt>ほのお</rt></ruby>が<ruby>上<rt>あ</rt></ruby>がっている。',
        '<ruby>近<rt>ちか</rt></ruby>づくと<ruby>熱<rt>ねつ</rt></ruby>で<ruby>肌<rt>はだ</rt></ruby>が<ruby>焼<rt>や</rt></ruby>けそうだ。<ruby>火<rt>ひ</rt></ruby>に<ruby>強<rt>つよ</rt></ruby>い<ruby>何<rt>なに</rt></ruby>かがあれば…。',
      ];
      return [
        'コックピットの<ruby>計器類<rt>けいきるい</rt></ruby>はまだ<ruby>動<rt>うご</rt></ruby>いている。<ruby>大気<rt>たいき</rt></ruby>は<ruby>呼吸<rt>こきゅう</rt></ruby>できる。',
        'しかしエンジン<ruby>付近<rt>ふきん</rt></ruby>から<ruby>激<rt>はげ</rt></ruby>しく<ruby>炎<rt>ほのお</rt></ruby>が<ruby>上<rt>あ</rt></ruby>がっている。<ruby>奥<rt>おく</rt></ruby>には<ruby>入<rt>はい</rt></ruby>れない。',
        '<ruby>手前<rt>てまえ</rt></ruby>の<ruby>座席<rt>ざせき</rt></ruby>の<ruby>下<rt>した</rt></ruby>に<ruby>応急<rt>おうきゅう</rt></ruby>キットが<ruby>転<rt>ころ</rt></ruby>がっている。',
      ];
    },
    choices() {
      if (G.flags.gotExploreKit) return [{ text: '← <ruby>戻<rt>もど</rt></ruby>る', next: 'crash_site' }];
      if (G.flags.gotFiresuit) return [
        { text: '🔥 <ruby>探検<rt>たんけん</rt></ruby>キットを<ruby>取<rt>と</rt></ruby>り<ruby>出<rt>だ</rt></ruby>す', next: 'get_explore_kit' },
        { text: '← <ruby>戻<rt>もど</rt></ruby>る', next: 'crash_site' },
      ];
      if (G.flags.gotKit && isUsingPikmin('赤ピクミン')) return [
        { text: '🌿 <ruby>赤<rt>あか</rt></ruby>ピクミンを<ruby>炎<rt>ほのお</rt></ruby>の<ruby>中<rt>なか</rt></ruby>に<ruby>送<rt>おく</rt></ruby>る', next: 'send_pikmin_fire' },
        { text: '← <ruby>戻<rt>もど</rt></ruby>る', next: 'crash_site' },
      ];
      return [{ text: '← <ruby>戻<rt>もど</rt></ruby>る', next: 'crash_site' }];
    },
    onEnter() {
      if (!G.flags.gotKit) {
        G.items.push({ name: '応急キット', icon: '🩹', desc: 'HP20回復' });
        G.flags.gotKit = true;
        addText('system', '🩹 <ruby>応急<rt>おうきゅう</rt></ruby>キットを<ruby>発見<rt>はっけん</rt></ruby>した。');
      }
    }
  },
  send_pikmin_fire: {
    scene: 'crash',
    text: [
      '<ruby>赤<rt>あか</rt></ruby>ピクミンが<ruby>炎<rt>ほのお</rt></ruby>の<ruby>中<rt>なか</rt></ruby>に<ruby>飛<rt>と</rt></ruby>び<ruby>込<rt>こ</rt></ruby>んでいく。<ruby>火<rt>ひ</rt></ruby>に<ruby>強<rt>つよ</rt></ruby>いようで、<ruby>平気<rt>へいき</rt></ruby>な<ruby>顔<rt>かお</rt></ruby>をしている。',
      'しばらくすると、<ruby>何<rt>なに</rt></ruby>かを<ruby>抱<rt>かか</rt></ruby>えて<ruby>戻<rt>もど</rt></ruby>ってきた。',
      '<ruby>銀色<rt>ぎんいろ</rt></ruby>の<ruby>耐火服<rt>たいかふく</rt></ruby>。これを<ruby>着<rt>き</rt></ruby>れば<ruby>炎<rt>ほのお</rt></ruby>の<ruby>中<rt>なか</rt></ruby>にも<ruby>入<rt>はい</rt></ruby>れそうだ。',
    ],
    choices: [{ text: '← <ruby>戻<rt>もど</rt></ruby>る', next: 'crash_site' }],
    onEnter() {
      if (!G.flags.gotFiresuit) {
        G.items.push({ name: '耐火服', icon: '🥈', desc: '炎の中でも行動できる', key: true });
        G.flags.gotFiresuit = true;
        addText('system', '🥈 <ruby>耐火服<rt>たいかふく</rt></ruby>を<ruby>手<rt>て</rt></ruby>に<ruby>入<rt>い</rt></ruby>れた。');
      }
    }
  },
  get_explore_kit: {
    scene: 'crash',
    text: [
      '<ruby>耐火服<rt>たいかふく</rt></ruby>を<ruby>着<rt>き</rt></ruby>て<ruby>炎<rt>ほのお</rt></ruby>の<ruby>中<rt>なか</rt></ruby>に<ruby>手<rt>て</rt></ruby>を<ruby>伸<rt>の</rt></ruby>ばす。<ruby>熱<rt>あつ</rt></ruby>いが、<ruby>耐<rt>た</rt></ruby>えられる。',
      '<ruby>燃<rt>も</rt></ruby>え<ruby>残<rt>のこ</rt></ruby>った<ruby>金属<rt>きんぞく</rt></ruby>ケースの<ruby>中<rt>なか</rt></ruby>に、<ruby>探検<rt>たんけん</rt></ruby>キットが<ruby>入<rt>はい</rt></ruby>っていた。',
      '<ruby>中<rt>なか</rt></ruby>には<ruby>小<rt>ちい</rt></ruby>さな<ruby>端末<rt>たんまつ</rt></ruby>が<ruby>入<rt>はい</rt></ruby>っている。<ruby>画面<rt>がめん</rt></ruby>に<ruby>地図<rt>ちず</rt></ruby>のようなものが<ruby>映<rt>うつ</rt></ruby>し<ruby>出<rt>だ</rt></ruby>された。',
      'マッピング<ruby>機能<rt>きのう</rt></ruby>つきの<ruby>探索<rt>たんさく</rt></ruby><ruby>端末<rt>たんまつ</rt></ruby>。<ruby>訪<rt>おとず</rt></ruby>れた<ruby>場所<rt>ばしょ</rt></ruby>を<ruby>記録<rt>きろく</rt></ruby>してくれるようだ。',
    ],
    choices: [{ text: '← <ruby>戻<rt>もど</rt></ruby>る', next: 'crash_site' }],
    onEnter() {
      if (!G.flags.gotExploreKit) {
        G.items.push({ name: '探検キット', icon: '📡', desc: 'マッピング端末。訪れた場所を記録する', key: true });
        G.flags.gotExploreKit = true;
        addText('system', '📡 <ruby>探検<rt>たんけん</rt></ruby>キットを<ruby>手<rt>て</rt></ruby>に<ruby>入<rt>い</rt></ruby>れた。マップが<ruby>使<rt>つか</rt></ruby>えるようになった。');
        updateMapBtn();
      }
    }
  },
  big_rock: {
    scene: 'rock',
    text() {
      if (G.flags.gotStone) return ['<ruby>大<rt>おお</rt></ruby>きな<ruby>岩<rt>いわ</rt></ruby>。<ruby>表面<rt>ひょうめん</rt></ruby>の<ruby>模様<rt>もよう</rt></ruby>をもう<ruby>一度<rt>いちど</rt></ruby><ruby>眺<rt>なが</rt></ruby>める。<ruby>裏側<rt>うらがわ</rt></ruby>には<ruby>何<rt>なに</rt></ruby>も<ruby>残<rt>のこ</rt></ruby>っていない。'];
      return [
        '<ruby>人<rt>ひと</rt></ruby>の<ruby>背丈<rt>せたけ</rt></ruby>ほどの<ruby>岩<rt>いわ</rt></ruby>。<ruby>表面<rt>ひょうめん</rt></ruby>に<ruby>不思議<rt>ふしぎ</rt></ruby>な<ruby>模様<rt>もよう</rt></ruby>が<ruby>刻<rt>きざ</rt></ruby>まれている。',
        '<ruby>裏側<rt>うらがわ</rt></ruby>に<ruby>回<rt>まわ</rt></ruby>ると、<ruby>地面<rt>じめん</rt></ruby>に<ruby>何<rt>なに</rt></ruby>か<ruby>光<rt>ひか</rt></ruby>るものが<ruby>落<rt>お</rt></ruby>ちている。',
      ];
    },
    choices: [{ text: '← <ruby>戻<rt>もど</rt></ruby>る', next: 'crash_site' }],
    onEnter() { if (!G.flags.gotStone) { G.items.push({ name: '光る石', icon: '💎', desc: '不思議な輝きを放つ石', key: true }); G.flags.gotStone = true; unlockAchievement('got_stone'); addText('system', '💎 <ruby>光<rt>ひか</rt></ruby>る<ruby>石<rt>いし</rt></ruby>を<ruby>手<rt>て</rt></ruby>に<ruby>入<rt>い</rt></ruby>れた。'); } }
  },
  forest_path: {
    scene: 'forest',
    text() {
      if (G.flags.pikminJoined) return [
        '【<ruby>森<rt>もり</rt></ruby>の<ruby>小道<rt>こみち</rt></ruby>】',
        '<ruby>穏<rt>おだ</rt></ruby>やかな<ruby>森<rt>もり</rt></ruby>。ピクミンが<ruby>後<rt>うし</rt></ruby>ろを<ruby>付<rt>つ</rt></ruby>いてくる。',
      ];
      return [
        '【<ruby>森<rt>もり</rt></ruby>の<ruby>小道<rt>こみち</rt></ruby>】',
        '<ruby>木々<rt>きぎ</rt></ruby>の<ruby>間<rt>あいだ</rt></ruby>を<ruby>縫<rt>ぬ</rt></ruby>うように<ruby>小道<rt>こみち</rt></ruby>が<ruby>続<rt>つづ</rt></ruby>いている。<ruby>葉<rt>は</rt></ruby>が<ruby>七色<rt>なないろ</rt></ruby>に<ruby>光<rt>ひか</rt></ruby>り、<ruby>甘<rt>あま</rt></ruby>い<ruby>香<rt>かお</rt></ruby>りが<ruby>漂<rt>ただよ</rt></ruby>う。',
        '<ruby>道<rt>みち</rt></ruby>の<ruby>先<rt>さき</rt></ruby>に<ruby>池<rt>いけ</rt></ruby>が<ruby>見<rt>み</rt></ruby>える。<ruby>南<rt>みなみ</rt></ruby>には<ruby>崖<rt>がけ</rt></ruby>があり、<ruby>下<rt>した</rt></ruby>に<ruby>何<rt>なに</rt></ruby>か<ruby>見<rt>み</rt></ruby>える。',
      ];
    },
    choices() {
      const c = [
        { text: '💧 <ruby>池<rt>いけ</rt></ruby>に<ruby>近<rt>ちか</rt></ruby>づく', next: 'pond' },
        { text: '◀ <ruby>不時着地点<rt>ふじちゃくちてん</rt></ruby>に<ruby>戻<rt>もど</rt></ruby>る', next: 'crash_site' },
      ];
      if (G.flags.pikminJoined) c.splice(1, 0, { text: '🌊 <ruby>森<rt>もり</rt></ruby>の<ruby>奥<rt>おく</rt></ruby>へ<ruby>進<rt>すす</rt></ruby>む', next: 'river_entrance' });
      if (!G.flags.pikminJoined) c.splice(1, 0, { text: '🧗 <ruby>崖<rt>がけ</rt></ruby>の<ruby>下<rt>した</rt></ruby>を<ruby>覗<rt>のぞ</rt></ruby>く', next: 'cliff_top' });
      return c;
    },
    onEnter() { if (!G.flags.seenSprout) { G.flags.seenSprout = true; unlockAchievement('found_pikmin'); } }
  },
  pond: {
    scene: 'pond',
    text() {
      if (G.flags.pondUsed) return ['<ruby>透<rt>す</rt></ruby>き<ruby>通<rt>とお</rt></ruby>った<ruby>水<rt>みず</rt></ruby>の<ruby>池<rt>いけ</rt></ruby>。<ruby>静<rt>しず</rt></ruby>かに<ruby>光<rt>ひかり</rt></ruby>が<ruby>揺<rt>ゆ</rt></ruby>れている。もう<ruby>一度<rt>いちど</rt></ruby><ruby>手<rt>て</rt></ruby>を<ruby>浸<rt>ひた</rt></ruby>してみるが、さっきのような<ruby>効果<rt>こうか</rt></ruby>は<ruby>感<rt>かん</rt></ruby>じられない。'];
      return [
        '<ruby>透<rt>す</rt></ruby>き<ruby>通<rt>とお</rt></ruby>った<ruby>水<rt>みず</rt></ruby>の<ruby>池<rt>いけ</rt></ruby>。<ruby>底<rt>そこ</rt></ruby>に<ruby>小<rt>ちい</rt></ruby>さな<ruby>光<rt>ひかり</rt></ruby>が<ruby>揺<rt>ゆ</rt></ruby>れている。',
        '<ruby>水面<rt>みなも</rt></ruby>に<ruby>手<rt>て</rt></ruby>を<ruby>浸<rt>ひた</rt></ruby>すと、<ruby>不思議<rt>ふしぎ</rt></ruby>と<ruby>体<rt>からだ</rt></ruby>の<ruby>疲<rt>つか</rt></ruby>れが<ruby>和<rt>やわ</rt></ruby>らいでいく。',
      ];
    },
    choices: [{ text: '← <ruby>戻<rt>もど</rt></ruby>る', next: 'forest_path' }],
    onEnter() { if (!G.flags.pondUsed) { G.player.hp = Math.min(G.player.maxHp, G.player.hp + 15); G.player.stamina = Math.min(G.player.maxStamina, G.player.stamina + 10); G.flags.pondUsed = true; unlockAchievement('healed'); addText('system', '❤️ HP+15 ⚡ スタミナ+10 <ruby>回復<rt>かいふく</rt></ruby>した。'); } }
  },
  cave_entrance: {
    scene: 'cave',
    text: [
      '【<ruby>洞窟<rt>どうくつ</rt></ruby>の<ruby>入口<rt>いりぐち</rt></ruby>】',
      '<ruby>暗闇<rt>くらやみ</rt></ruby>が<ruby>口<rt>くち</rt></ruby>を<ruby>開<rt>あ</rt></ruby>けている。',
    ],
    choices: [
      { text: '🕳️ <ruby>奥<rt>おく</rt></ruby>に<ruby>進<rt>すす</rt></ruby>む', next: 'cave_inside' },
      { text: '← <ruby>戻<rt>もど</rt></ruby>る', next: 'crash_site' },
    ]
  },
  cave_inside: {
    scene: 'cave',
    text() {
      if (G.flags.gotRope) return ['<ruby>洞窟<rt>どうくつ</rt></ruby>の<ruby>奥<rt>おく</rt></ruby>。もう<ruby>何<rt>なに</rt></ruby>も<ruby>残<rt>のこ</rt></ruby>っていない。'];
      if (!isHolding('光る石')) return [
        '<ruby>中<rt>なか</rt></ruby>は<ruby>真<rt>ま</rt></ruby>っ<ruby>暗<rt>くら</rt></ruby>で<ruby>何<rt>なに</rt></ruby>も<ruby>見<rt>み</rt></ruby>えない。<ruby>手探<rt>てさぐ</rt></ruby>りで<ruby>進<rt>すす</rt></ruby>むのは<ruby>危険<rt>きけん</rt></ruby>だ。',
        '<ruby>何<rt>なに</rt></ruby>か<ruby>辺<rt>あた</rt></ruby>りを<ruby>照<rt>て</rt></ruby>らせるものを<ruby>手<rt>て</rt></ruby>に<ruby>持<rt>も</rt></ruby>っていれば…。',
      ];
      return [
        '<ruby>光<rt>ひか</rt></ruby>る<ruby>石<rt>いし</rt></ruby>を<ruby>掲<rt>かか</rt></ruby>げると、<ruby>洞窟<rt>どうくつ</rt></ruby>の<ruby>壁<rt>かべ</rt></ruby>が<ruby>青白<rt>あおじろ</rt></ruby>く<ruby>浮<rt>う</rt></ruby>かび<ruby>上<rt>あ</rt></ruby>がった。',
        '<ruby>奥<rt>おく</rt></ruby>の<ruby>壁<rt>かべ</rt></ruby>に<ruby>丈夫<rt>じょうぶ</rt></ruby>そうなロープが<ruby>引<rt>ひ</rt></ruby>っかかっている。',
      ];
    },
    choices: [{ text: '← <ruby>戻<rt>もど</rt></ruby>る', next: 'cave_entrance' }],
    onEnter() { if (isHolding('光る石') && !G.flags.gotRope) { G.items.push({ name: 'ロープ', icon: '🪢', desc: '丈夫な植物のツル', key: true }); G.flags.gotRope = true; addText('system', '🪢 ロープを<ruby>手<rt>て</rt></ruby>に<ruby>入<rt>い</rt></ruby>れた。'); } }
  },
  cliff_top: {
    scene: 'forest',
    text: [
      '<ruby>崖<rt>がけ</rt></ruby>の<ruby>縁<rt>ふち</rt></ruby>。<ruby>下<rt>した</rt></ruby>は3メートルほど。<ruby>地面<rt>じめん</rt></ruby>から<ruby>小<rt>ちい</rt></ruby>さな<ruby>芽<rt>め</rt></ruby>のようなものが<ruby>見<rt>み</rt></ruby>える。',
    ],
    choices: [
      { text: '🧗 <ruby>降<rt>お</rt></ruby>りる', next: 'cliff_descend' },
      { text: '← <ruby>戻<rt>もど</rt></ruby>る', next: 'forest_path' },
    ]
  },
  cliff_descend: {
    scene: 'forest',
    text() {
      if (!isHolding('ロープ')) return [
        '<ruby>素手<rt>すで</rt></ruby>で<ruby>降<rt>お</rt></ruby>りようとするが、<ruby>足場<rt>あしば</rt></ruby>が<ruby>崩<rt>くず</rt></ruby>れて<ruby>滑<rt>すべ</rt></ruby>り<ruby>落<rt>お</rt></ruby>ちそうになる。',
        '<ruby>何<rt>なに</rt></ruby>かロープのようなものを<ruby>手<rt>て</rt></ruby>に<ruby>持<rt>も</rt></ruby>っていれば<ruby>安全<rt>あんぜん</rt></ruby>に<ruby>降<rt>お</rt></ruby>りられそうだ…。',
      ];
      return [
        'ロープを<ruby>木<rt>き</rt></ruby>に<ruby>結<rt>むす</rt></ruby>び、<ruby>崖<rt>がけ</rt></ruby>を<ruby>降<rt>お</rt></ruby>りた。',
      ];
    },
    choices() {
      if (isHolding('ロープ')) return [{ text: '▶ <ruby>先<rt>さき</rt></ruby>へ', next: 'cliff_bottom' }];
      return [{ text: '← <ruby>戻<rt>もど</rt></ruby>る', next: 'cliff_top' }];
    }
  },
  cliff_bottom: {
    scene: 'sprout',
    text() {
      if (G.flags.enemyDefeated) return [
        '<ruby>崖<rt>がけ</rt></ruby>の<ruby>下<rt>した</rt></ruby>。<ruby>敵<rt>てき</rt></ruby>はもういない。<ruby>芽<rt>め</rt></ruby>が<ruby>静<rt>しず</rt></ruby>かに<ruby>揺<rt>ゆ</rt></ruby>れている。',
      ];
      return [
        'ロープを<ruby>木<rt>き</rt></ruby>に<ruby>結<rt>むす</rt></ruby>び、<ruby>崖<rt>がけ</rt></ruby>を<ruby>降<rt>お</rt></ruby>りた。',
        '<ruby>目<rt>め</rt></ruby>の<ruby>前<rt>まえ</rt></ruby>に<ruby>小<rt>ちい</rt></ruby>さな<ruby>芽<rt>め</rt></ruby>が<ruby>生<rt>は</rt></ruby>えている。しかし――',
        '<ruby>芽<rt>め</rt></ruby>の<ruby>手前<rt>てまえ</rt></ruby>に、<ruby>大<rt>おお</rt></ruby>きな<ruby>赤<rt>あか</rt></ruby>い<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>が<ruby>眠<rt>ねむ</rt></ruby>っている。<ruby>丸<rt>まる</rt></ruby>い<ruby>体<rt>からだ</rt></ruby>に<ruby>巨大<rt>きょだい</rt></ruby>な<ruby>口<rt>くち</rt></ruby>。',
        '<ruby>近<rt>ちか</rt></ruby>づくのは<ruby>危険<rt>きけん</rt></ruby>そうだ。<ruby>何<rt>なに</rt></ruby>か<ruby>投<rt>な</rt></ruby>げて<ruby>気<rt>き</rt></ruby>を<ruby>引<rt>ひ</rt></ruby>ければ…。',
      ];
    },
    choices() {
      if (G.flags.enemyDefeated || G.flags.pikminJoined) return [{ text: '🌱 <ruby>芽<rt>め</rt></ruby>に<ruby>近<rt>ちか</rt></ruby>づく', next: 'sprout_found' }];
      const c = [
        { text: '🌱 <ruby>芽<rt>め</rt></ruby>に<ruby>近<rt>ちか</rt></ruby>づく', next: 'approach_enemy' },
        { text: '← <ruby>崖<rt>がけ</rt></ruby>を<ruby>登<rt>のぼ</rt></ruby>って<ruby>戻<rt>もど</rt></ruby>る', next: 'forest_path' },
      ];
      if (G.flags.pikminJoined) c.splice(1, 0, { text: '🌿 ピクミンを<ruby>向<rt>む</rt></ruby>かわせる', next: 'defeat_enemy' });
      return c;
    }
  },
  approach_enemy: {
    scene: 'sprout',
    text() {
      if (isHolding('光る石')) return [
        '<ruby>光<rt>ひか</rt></ruby>る<ruby>石<rt>いし</rt></ruby>を<ruby>遠<rt>とお</rt></ruby>くに<ruby>投<rt>な</rt></ruby>げた。<ruby>石<rt>いし</rt></ruby>が<ruby>地面<rt>じめん</rt></ruby>に<ruby>当<rt>あ</rt></ruby>たり、<ruby>光<rt>ひかり</rt></ruby>を<ruby>放<rt>はな</rt></ruby>つ。',
        '<ruby>赤<rt>あか</rt></ruby>い<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>が<ruby>目<rt>め</rt></ruby>を<ruby>覚<rt>さ</rt></ruby>まし、<ruby>光<rt>ひかり</rt></ruby>を<ruby>追<rt>お</rt></ruby>いかけて<ruby>走<rt>はし</rt></ruby>り<ruby>去<rt>さ</rt></ruby>った。',
        '<ruby>芽<rt>め</rt></ruby>への<ruby>道<rt>みち</rt></ruby>が<ruby>開<rt>ひら</rt></ruby>けた。',
      ];
      return [
        'そっと<ruby>近<rt>ちか</rt></ruby>づいた<ruby>瞬間<rt>しゅんかん</rt></ruby>、<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>が<ruby>目<rt>め</rt></ruby>を<ruby>覚<rt>さ</rt></ruby>ました。',
        '<ruby>巨大<rt>きょだい</rt></ruby>な<ruby>口<rt>くち</rt></ruby>が<ruby>開<rt>ひら</rt></ruby>き、<ruby>突進<rt>とっしん</rt></ruby>してくる――！',
        '<ruby>一人<rt>ひとり</rt></ruby>では<ruby>太刀打<rt>たちう</rt></ruby>ちできない。<ruby>意識<rt>いしき</rt></ruby>が<ruby>遠<rt>とお</rt></ruby>のいていく…。',
      ];
    },
    choices() {
      if (G.flags.enemyDefeated) return [{ text: '🌱 <ruby>芽<rt>め</rt></ruby>に<ruby>近<rt>ちか</rt></ruby>づく', next: 'sprout_found' }];
      return [
        { text: '💪 <ruby>這<rt>は</rt></ruby>い<ruby>上<rt>あ</rt></ruby>がる', next: 'revive' },
        { text: '😞 <ruby>諦<rt>あきら</rt></ruby>める…', next: 'give_up_confirm' },
      ];
    },
    onEnter() {
      if (isHolding('光る石')) {
        G.flags.enemyDefeated = true;
        removeItem('光る石');
        addText('system', '💎 <ruby>光<rt>ひか</rt></ruby>る<ruby>石<rt>いし</rt></ruby>を<ruby>失<rt>うしな</rt></ruby>った。');
      } else {
        handleDefeat('forest_path');
      }
    }
  },
  revive: {
    scene: 'crash',
    text() {
      const lost = G.flags.lostItemNames;
      const lines = [
        '…<ruby>気<rt>き</rt></ruby>がつくと、<ruby>不時着地点<rt>ふじちゃくちてん</rt></ruby>で<ruby>倒<rt>たお</rt></ruby>れていた。',
        'どうやら<ruby>気<rt>き</rt></ruby>を<ruby>失<rt>うしな</rt></ruby>っていたようだ。<ruby>体<rt>からだ</rt></ruby>のあちこちが<ruby>痛<rt>いた</rt></ruby>む。',
      ];
      if (lost) lines.push('<ruby>持<rt>も</rt></ruby>っていたものがいくつか<ruby>無<rt>な</rt></ruby>くなっている<ruby>気<rt>き</rt></ruby>がする。（' + lost + '）');
      else lines.push('<ruby>持<rt>も</rt></ruby>ち<ruby>物<rt>もの</rt></ruby>は<ruby>無事<rt>ぶじ</rt></ruby>のようだ。');
      return lines;
    },
    choices: [{ text: '…<ruby>立<rt>た</rt></ruby>ち<ruby>上<rt>あ</rt></ruby>がる', next: 'crash_site' }],
  },
  give_up_confirm: {
    scene: 'cave',
    text: ['<ruby>本当<rt>ほんとう</rt></ruby>に<ruby>諦<rt>あきら</rt></ruby>めますか？'],
    choices: [
      { text: 'はい（タイトルに<ruby>戻<rt>もど</rt></ruby>る）', next: '_title' },
      { text: 'いいえ（<ruby>這<rt>は</rt></ruby>い<ruby>上<rt>あ</rt></ruby>がる）', next: 'revive' },
    ]
  },
  sprout_found: {
    scene: 'sprout',
    text: [
      '<ruby>地面<rt>じめん</rt></ruby>から<ruby>小<rt>ちい</rt></ruby>さな<ruby>芽<rt>め</rt></ruby>が<ruby>生<rt>は</rt></ruby>えている。よく<ruby>見<rt>み</rt></ruby>ると、<ruby>葉<rt>は</rt></ruby>の<ruby>先<rt>さき</rt></ruby>に<ruby>丸<rt>まる</rt></ruby>い<ruby>何<rt>なに</rt></ruby>かがついている。',
      '<ruby>根元<rt>ねもと</rt></ruby>を<ruby>掴<rt>つか</rt></ruby>めば<ruby>引<rt>ひ</rt></ruby>き<ruby>抜<rt>ぬ</rt></ruby>けそうだ。',
    ],
    choices: [
      { text: '🌱 <ruby>引<rt>ひ</rt></ruby>っこ<ruby>抜<rt>ぬ</rt></ruby>く', next: 'pull_pikmin' },
      { text: 'そのままにする', next: 'forest_path' },
    ]
  },
  pull_pikmin: {
    scene: 'sprout',
    text: [
      '<ruby>根元<rt>ねもと</rt></ruby>を<ruby>掴<rt>つか</rt></ruby>み、<ruby>力<rt>ちから</rt></ruby>を<ruby>込<rt>こ</rt></ruby>めて<ruby>引<rt>ひ</rt></ruby>き<ruby>抜<rt>ぬ</rt></ruby>いた。',
      '――ズボッ。',
      '<ruby>地面<rt>じめん</rt></ruby>から<ruby>小<rt>ちい</rt></ruby>さな<ruby>赤<rt>あか</rt></ruby>い<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>が<ruby>飛<rt>と</rt></ruby>び<ruby>出<rt>だ</rt></ruby>した。<ruby>丸<rt>まる</rt></ruby>い<ruby>体<rt>からだ</rt></ruby>に<ruby>短<rt>みじか</rt></ruby>い<ruby>手足<rt>てあし</rt></ruby>。<ruby>頭<rt>あたま</rt></ruby>には<ruby>一枚<rt>いちまい</rt></ruby>の<ruby>葉<rt>は</rt></ruby>。',
      'こちらを<ruby>見上<rt>みあ</rt></ruby>げている。<ruby>怯<rt>おび</rt></ruby>える<ruby>様子<rt>ようす</rt></ruby>はない。むしろ、ついてきたそうにしている。',
    ],
    choices: [{ text: '<ruby>続<rt>つづ</rt></ruby>き', next: 'after_pikmin' }],
    onEnter() {
      if (!G.flags.pikminJoined) {
        G.party.push({ name: '赤ピクミン', img: PUYO_IMGS[1], hp: 20, maxHp: 20, atk: 5, def: 2, desc: '火に強い' });
        G.flags.pikminJoined = true;
        unlockAchievement('pull_pikmin');
        addText('system', '🌿 <ruby>赤<rt>あか</rt></ruby>ピクミンが<ruby>仲間<rt>なかま</rt></ruby>になった。');
      }
    }
  },
  after_pikmin: {
    scene: 'forest',
    text: [
      '<ruby>赤<rt>あか</rt></ruby>い<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>――ピクミンは、<ruby>後<rt>うし</rt></ruby>ろをちょこちょこと<ruby>付<rt>つ</rt></ruby>いてくる。',
      'この<ruby>惑星<rt>わくせい</rt></ruby>には、まだ<ruby>何<rt>なに</rt></ruby>かがありそうだ。',
    ],
    choices: [{ text: '▶ <ruby>探索<rt>たんさく</rt></ruby>を<ruby>続<rt>つづ</rt></ruby>ける', next: 'forest_path' }],
    onEnter() { unlockAchievement('chapter1'); addText('chapter', '― <ruby>第<rt>だい</rt></ruby>1<ruby>章<rt>しょう</rt></ruby>「<ruby>不時着<rt>ふじちゃく</rt></ruby>」 <ruby>完<rt>かん</rt></ruby> ―'); }
  },

  // ===== 第2章：水辺の谷 =====
  river_entrance: {
    scene: 'river',
    text: [
      '【<ruby>水辺<rt>みずべ</rt></ruby>の<ruby>谷<rt>たに</rt></ruby>】',
      '<ruby>森<rt>もり</rt></ruby>の<ruby>奥<rt>おく</rt></ruby>へ<ruby>進<rt>すす</rt></ruby>むと、<ruby>空気<rt>くうき</rt></ruby>が<ruby>湿<rt>しめ</rt></ruby>り<ruby>気<rt>け</rt></ruby>を<ruby>帯<rt>お</rt></ruby>びてきた。',
      '<ruby>目<rt>め</rt></ruby>の<ruby>前<rt>まえ</rt></ruby>に<ruby>幅広<rt>はばひろ</rt></ruby>い<ruby>川<rt>かわ</rt></ruby>が<ruby>流<rt>なが</rt></ruby>れている。<ruby>水<rt>みず</rt></ruby>は<ruby>透<rt>す</rt></ruby>き<ruby>通<rt>とお</rt></ruby>って<ruby>青<rt>あお</rt></ruby>い。',
      '<ruby>川岸<rt>かわぎし</rt></ruby>に<ruby>沿<rt>そ</rt></ruby>って<ruby>道<rt>みち</rt></ruby>が<ruby>続<rt>つづ</rt></ruby>いている。<ruby>上流<rt>じょうりゅう</rt></ruby>には<ruby>滝<rt>たき</rt></ruby>の<ruby>音<rt>おと</rt></ruby>が<ruby>聞<rt>き</rt></ruby>こえる。',
    ],
    choices() {
      const c = [
        { text: '🏞️ <ruby>川岸<rt>かわぎし</rt></ruby>を<ruby>歩<rt>ある</rt></ruby>く', next: 'riverbank' },
        { text: '🌊 <ruby>上流<rt>じょうりゅう</rt></ruby>へ<ruby>向<rt>む</rt></ruby>かう', next: 'waterfall_approach' },
        { text: '◀ <ruby>森<rt>もり</rt></ruby>に<ruby>戻<rt>もど</rt></ruby>る', next: 'forest_path' },
      ];
      if (G.flags.bluePikminJoined) c.splice(2, 0, { text: '⚡ <ruby>上流<rt>じょうりゅう</rt></ruby>の<ruby>崖<rt>がけ</rt></ruby>を<ruby>登<rt>のぼ</rt></ruby>る', next: 'hill_entrance' });
      if (G.flags.needParts && !G.flags.gotPropulsionCoil && isUsingPikmin('青ピクミン')) {
        c.push({ text: '🔧 <ruby>水底<rt>みなそこ</rt></ruby>のパーツを<ruby>回収<rt>かいしゅう</rt></ruby>する', next: 'get_propulsion_coil' });
      }
      return c;
    }
  },
  riverbank: {
    scene: 'river',
    text() {
      if (G.flags.bluePikminJoined) return [
        '【<ruby>川岸<rt>かわぎし</rt></ruby>】',
        '<ruby>穏<rt>おだ</rt></ruby>やかな<ruby>川<rt>かわ</rt></ruby>の<ruby>流<rt>なが</rt></ruby>れ。<ruby>青<rt>あお</rt></ruby>ピクミンが<ruby>水面<rt>みなも</rt></ruby>を<ruby>楽<rt>たの</rt></ruby>しそうに<ruby>眺<rt>なが</rt></ruby>めている。',
      ];
      return [
        '【<ruby>川岸<rt>かわぎし</rt></ruby>】',
        '<ruby>川<rt>かわ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>ほどに、<ruby>浅瀬<rt>あさせ</rt></ruby>がある。<ruby>水底<rt>みなそこ</rt></ruby>に<ruby>青<rt>あお</rt></ruby>い<ruby>芽<rt>め</rt></ruby>のようなものが<ruby>揺<rt>ゆ</rt></ruby>れている。',
        'しかし<ruby>水<rt>みず</rt></ruby>の<ruby>流<rt>なが</rt></ruby>れが<ruby>速<rt>はや</rt></ruby>く、<ruby>足<rt>あし</rt></ruby>を<ruby>踏<rt>ふ</rt></ruby>み<ruby>入<rt>い</rt></ruby>れると<ruby>流<rt>なが</rt></ruby>されそうだ。',
        '<ruby>対岸<rt>たいがん</rt></ruby>に<ruby>渡<rt>わた</rt></ruby>れる<ruby>場所<rt>ばしょ</rt></ruby>を<ruby>探<rt>さが</rt></ruby>す<ruby>必要<rt>ひつよう</rt></ruby>がある。<ruby>上流<rt>じょうりゅう</rt></ruby>に<ruby>浅<rt>あさ</rt></ruby>い<ruby>場所<rt>ばしょ</rt></ruby>があるかもしれない…。',
      ];
    },
    choices: [
      { text: '🌊 <ruby>上流<rt>じょうりゅう</rt></ruby>へ', next: 'waterfall_approach' },
      { text: '◀ <ruby>谷<rt>たに</rt></ruby>の<ruby>入口<rt>いりぐち</rt></ruby>に<ruby>戻<rt>もど</rt></ruby>る', next: 'river_entrance' },
    ]
  },
  waterfall_approach: {
    scene: 'river',
    text: [
      '【<ruby>滝<rt>たき</rt></ruby>の<ruby>手前<rt>てまえ</rt></ruby>】',
      '<ruby>轟音<rt>ごうおん</rt></ruby>とともに<ruby>水<rt>みず</rt></ruby>が<ruby>落<rt>お</rt></ruby>ちている。<ruby>滝<rt>たき</rt></ruby>の<ruby>裏<rt>うら</rt></ruby>に<ruby>空間<rt>くうかん</rt></ruby>があるように<ruby>見<rt>み</rt></ruby>える。',
      '<ruby>滝<rt>たき</rt></ruby>の<ruby>手前<rt>てまえ</rt></ruby>に<ruby>浅瀬<rt>あさせ</rt></ruby>があり、ここなら<ruby>水<rt>みず</rt></ruby>に<ruby>入<rt>はい</rt></ruby>れそうだ。',
    ],
    choices() {
      const c = [
        { text: '💧 <ruby>浅瀬<rt>あさせ</rt></ruby>に<ruby>入<rt>はい</rt></ruby>る', next: 'shallow_water' },
        { text: '◀ <ruby>戻<rt>もど</rt></ruby>る', next: 'river_entrance' },
      ];
      if (G.flags.bluePikminJoined) c.splice(1, 0, { text: '🌊 <ruby>滝<rt>たき</rt></ruby>の<ruby>裏<rt>うら</rt></ruby>へ', next: 'waterfall_behind' });
      return c;
    }
  },
  shallow_water: {
    scene: 'river',
    text() {
      if (G.flags.bluePikminJoined) return [
        '<ruby>浅瀬<rt>あさせ</rt></ruby>。<ruby>青<rt>あお</rt></ruby>い<ruby>芽<rt>め</rt></ruby>があった<ruby>場所<rt>ばしょ</rt></ruby>には、<ruby>引<rt>ひ</rt></ruby>き<ruby>抜<rt>ぬ</rt></ruby>かれた<ruby>跡<rt>あと</rt></ruby>だけが<ruby>残<rt>のこ</rt></ruby>っている。',
      ];
      return [
        '<ruby>膝<rt>ひざ</rt></ruby>まで<ruby>水<rt>みず</rt></ruby>に<ruby>浸<rt>つ</rt></ruby>かりながら<ruby>進<rt>すす</rt></ruby>む。<ruby>水底<rt>みなそこ</rt></ruby>に<ruby>青<rt>あお</rt></ruby>い<ruby>芽<rt>め</rt></ruby>が<ruby>揺<rt>ゆ</rt></ruby>れている。',
        '<ruby>水中<rt>すいちゅう</rt></ruby>に<ruby>根<rt>ね</rt></ruby>を<ruby>張<rt>は</rt></ruby>っているようだ。<ruby>引<rt>ひ</rt></ruby>き<ruby>抜<rt>ぬ</rt></ruby>けそうだが、<ruby>水<rt>みず</rt></ruby>の<ruby>中<rt>なか</rt></ruby>なので<ruby>力<rt>ちから</rt></ruby>が<ruby>入<rt>はい</rt></ruby>りにくい。',
      ];
    },
    choices() {
      if (G.flags.bluePikminJoined) return [{ text: '◀ <ruby>戻<rt>もど</rt></ruby>る', next: 'waterfall_approach' }];
      return [
        { text: '🌱 <ruby>引<rt>ひ</rt></ruby>っこ<ruby>抜<rt>ぬ</rt></ruby>く', next: 'pull_blue_pikmin' },
        { text: '◀ <ruby>戻<rt>もど</rt></ruby>る', next: 'waterfall_approach' },
      ];
    }
  },
  pull_blue_pikmin: {
    scene: 'river',
    text: [
      '<ruby>水中<rt>すいちゅう</rt></ruby>に<ruby>手<rt>て</rt></ruby>を<ruby>突<rt>つ</rt></ruby>っ<ruby>込<rt>こ</rt></ruby>み、<ruby>根元<rt>ねもと</rt></ruby>を<ruby>掴<rt>つか</rt></ruby>んで<ruby>引<rt>ひ</rt></ruby>き<ruby>抜<rt>ぬ</rt></ruby>いた。',
      '――ズボッ。<ruby>水<rt>みず</rt></ruby>しぶきが<ruby>上<rt>あ</rt></ruby>がる。',
      '<ruby>青<rt>あお</rt></ruby>い<ruby>体<rt>からだ</rt></ruby>の<ruby>小<rt>ちい</rt></ruby>さな<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>が<ruby>現<rt>あらわ</rt></ruby>れた。<ruby>口<rt>くち</rt></ruby>のあたりにエラのようなものがある。',
      '<ruby>水<rt>みず</rt></ruby>の<ruby>中<rt>なか</rt></ruby>でも<ruby>平気<rt>へいき</rt></ruby>そうだ。<ruby>嬉<rt>うれ</rt></ruby>しそうに<ruby>水面<rt>みなも</rt></ruby>を<ruby>跳<rt>は</rt></ruby>ねている。',
    ],
    choices: [{ text: '<ruby>続<rt>つづ</rt></ruby>き', next: 'after_blue_pikmin' }],
    onEnter() {
      if (!G.flags.bluePikminJoined) {
        G.party.push({ name: '青ピクミン', img: PUYO_IMGS[2], hp: 20, maxHp: 20, atk: 4, def: 3, desc: '水中で活動できる' });
        G.flags.bluePikminJoined = true;
        addText('system', '🌿 <ruby>青<rt>あお</rt></ruby>ピクミンが<ruby>仲間<rt>なかま</rt></ruby>になった。');
      }
    }
  },
  after_blue_pikmin: {
    scene: 'river',
    text: [
      '<ruby>青<rt>あお</rt></ruby>ピクミンは<ruby>水<rt>みず</rt></ruby>の<ruby>中<rt>なか</rt></ruby>を<ruby>自由<rt>じゆう</rt></ruby>に<ruby>泳<rt>およ</rt></ruby>ぎ<ruby>回<rt>まわ</rt></ruby>っている。',
      'この<ruby>仲間<rt>なかま</rt></ruby>がいれば、<ruby>水中<rt>すいちゅう</rt></ruby>の<ruby>探索<rt>たんさく</rt></ruby>ができそうだ。',
      '<ruby>滝<rt>たき</rt></ruby>の<ruby>裏<rt>うら</rt></ruby>にも<ruby>行<rt>い</rt></ruby>けるかもしれない。',
    ],
    choices: [{ text: '▶ <ruby>探索<rt>たんさく</rt></ruby>を<ruby>続<rt>つづ</rt></ruby>ける', next: 'waterfall_approach' }],
    onEnter() { addText('chapter', '― <ruby>第<rt>だい</rt></ruby>2<ruby>章<rt>しょう</rt></ruby>「<ruby>水辺<rt>みずべ</rt></ruby>の<ruby>谷<rt>たに</rt></ruby>」 <ruby>開始<rt>かいし</rt></ruby> ―'); }
  },
  waterfall_behind: {
    scene: 'cave',
    text() {
      if (G.flags.gotWaterfallItem) return [
        '<ruby>滝<rt>たき</rt></ruby>の<ruby>裏<rt>うら</rt></ruby>の<ruby>空洞<rt>くうどう</rt></ruby>。<ruby>水<rt>みず</rt></ruby>しぶきが<ruby>霧<rt>きり</rt></ruby>のように<ruby>舞<rt>ま</rt></ruby>っている。もう<ruby>何<rt>なに</rt></ruby>もない。',
      ];
      return [
        '<ruby>青<rt>あお</rt></ruby>ピクミンに<ruby>導<rt>みちび</rt></ruby>かれ、<ruby>滝<rt>たき</rt></ruby>の<ruby>水流<rt>すいりゅう</rt></ruby>をくぐり<ruby>抜<rt>ぬ</rt></ruby>けた。',
        '<ruby>裏<rt>うら</rt></ruby>には<ruby>小<rt>ちい</rt></ruby>さな<ruby>空洞<rt>くうどう</rt></ruby>がある。<ruby>壁<rt>かべ</rt></ruby>に<ruby>光<rt>ひか</rt></ruby>る<ruby>苔<rt>こけ</rt></ruby>が<ruby>生<rt>は</rt></ruby>えていて、ほんのり<ruby>明<rt>あか</rt></ruby>るい。',
        '<ruby>奥<rt>おく</rt></ruby>に<ruby>古<rt>ふる</rt></ruby>びた<ruby>箱<rt>はこ</rt></ruby>が<ruby>置<rt>お</rt></ruby>かれている。',
      ];
    },
    choices: [{ text: '◀ <ruby>戻<rt>もど</rt></ruby>る', next: 'waterfall_approach' }],
    onEnter() {
      if (!G.flags.gotWaterfallItem) {
        G.items.push({ name: '防水マント', icon: '🧥', desc: '水流に流されにくくなる', key: true });
        G.flags.gotWaterfallItem = true;
        addText('system', '🧥 <ruby>防水<rt>ぼうすい</rt></ruby>マントを<ruby>手<rt>て</rt></ruby>に<ruby>入<rt>い</rt></ruby>れた。');
      }
    }
  },

  // ===== 第3章：雷鳴の丘（黄ピクミン入手） =====
  hill_entrance: {
    scene: 'hill',
    text: [
      '【<ruby>雷鳴<rt>らいめい</rt></ruby>の<ruby>丘<rt>おか</rt></ruby>】',
      '<ruby>水辺<rt>みずべ</rt></ruby>の<ruby>谷<rt>たに</rt></ruby>の<ruby>上流<rt>じょうりゅう</rt></ruby>から<ruby>崖<rt>がけ</rt></ruby>を<ruby>登<rt>のぼ</rt></ruby>った<ruby>先<rt>さき</rt></ruby>。<ruby>高台<rt>たかだい</rt></ruby>に<ruby>出<rt>で</rt></ruby>た。',
      '<ruby>空気<rt>くうき</rt></ruby>が<ruby>乾<rt>かわ</rt></ruby>いていて、<ruby>静電気<rt>せいでんき</rt></ruby>がパチパチと<ruby>肌<rt>はだ</rt></ruby>を<ruby>刺<rt>さ</rt></ruby>す。',
      '<ruby>道<rt>みち</rt></ruby>の<ruby>先<rt>さき</rt></ruby>に<ruby>電気柵<rt>でんきさく</rt></ruby>が<ruby>張<rt>は</rt></ruby>り<ruby>巡<rt>めぐ</rt></ruby>らされている。バチバチと<ruby>火花<rt>ひばな</rt></ruby>が<ruby>散<rt>ち</rt></ruby>っている。',
    ],
    choices: [
      { text: '🌳 <ruby>雷<rt>かみなり</rt></ruby>の<ruby>木<rt>き</rt></ruby>を<ruby>調<rt>しら</rt></ruby>べる', next: 'thunder_tree' },
      { text: '◀ <ruby>谷<rt>たに</rt></ruby>に<ruby>戻<rt>もど</rt></ruby>る', next: 'river_entrance' },
    ]
  },
  thunder_tree: {
    scene: 'hill',
    text() {
      if (G.flags.yellowPikminJoined) return [
        '【<ruby>雷<rt>かみなり</rt></ruby>の<ruby>木<rt>き</rt></ruby>】',
        '<ruby>大<rt>おお</rt></ruby>きな<ruby>木<rt>き</rt></ruby>。<ruby>幹<rt>みき</rt></ruby>に<ruby>雷<rt>かみなり</rt></ruby>が<ruby>落<rt>お</rt></ruby>ちた<ruby>跡<rt>あと</rt></ruby>がある。<ruby>黄<rt>き</rt></ruby>ピクミンが<ruby>嬉<rt>うれ</rt></ruby>しそうに<ruby>木<rt>き</rt></ruby>の<ruby>周<rt>まわ</rt></ruby>りを<ruby>歩<rt>ある</rt></ruby>いている。',
      ];
      return [
        '【<ruby>雷<rt>かみなり</rt></ruby>の<ruby>木<rt>き</rt></ruby>】',
        '<ruby>丘<rt>おか</rt></ruby>の<ruby>中央<rt>ちゅうおう</rt></ruby>に<ruby>巨大<rt>きょだい</rt></ruby>な<ruby>木<rt>き</rt></ruby>が<ruby>立<rt>た</rt></ruby>っている。<ruby>幹<rt>みき</rt></ruby>には<ruby>雷<rt>かみなり</rt></ruby>が<ruby>落<rt>お</rt></ruby>ちた<ruby>焦<rt>こ</rt></ruby>げ<ruby>跡<rt>あと</rt></ruby>がある。',
        '<ruby>根元<rt>ねもと</rt></ruby>に<ruby>黄色<rt>きいろ</rt></ruby>い<ruby>芽<rt>め</rt></ruby>が<ruby>生<rt>は</rt></ruby>えている。<ruby>芽<rt>め</rt></ruby>の<ruby>先端<rt>せんたん</rt></ruby>から<ruby>小<rt>ちい</rt></ruby>さな<ruby>電気<rt>でんき</rt></ruby>が<ruby>走<rt>はし</rt></ruby>っている。',
      ];
    },
    choices() {
      if (G.flags.yellowPikminJoined) return [
        { text: '⚡ <ruby>電気柵<rt>でんきさく</rt></ruby>へ', next: 'electric_fence' },
        { text: '◀ <ruby>丘<rt>おか</rt></ruby>の<ruby>入口<rt>いりぐち</rt></ruby>へ', next: 'hill_entrance' },
      ];
      return [
        { text: '🌱 <ruby>黄色<rt>きいろ</rt></ruby>い<ruby>芽<rt>め</rt></ruby>を<ruby>引<rt>ひ</rt></ruby>っこ<ruby>抜<rt>ぬ</rt></ruby>く', next: 'pull_yellow_pikmin' },
        { text: '◀ <ruby>丘<rt>おか</rt></ruby>の<ruby>入口<rt>いりぐち</rt></ruby>へ', next: 'hill_entrance' },
      ];
    }
  },
  pull_yellow_pikmin: {
    scene: 'hill',
    text: [
      '<ruby>根元<rt>ねもと</rt></ruby>を<ruby>掴<rt>つか</rt></ruby>み、<ruby>力<rt>ちから</rt></ruby>を<ruby>込<rt>こ</rt></ruby>めて<ruby>引<rt>ひ</rt></ruby>き<ruby>抜<rt>ぬ</rt></ruby>いた。',
      '――バチッ！',
      '<ruby>地面<rt>じめん</rt></ruby>から<ruby>黄色<rt>きいろ</rt></ruby>い<ruby>小<rt>ちい</rt></ruby>さな<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>が<ruby>飛<rt>と</rt></ruby>び<ruby>出<rt>だ</rt></ruby>した。<ruby>耳<rt>みみ</rt></ruby>のような<ruby>大<rt>おお</rt></ruby>きな<ruby>突起<rt>とっき</rt></ruby>がある。',
      '<ruby>体<rt>からだ</rt></ruby>の<ruby>周<rt>まわ</rt></ruby>りに<ruby>小<rt>ちい</rt></ruby>さな<ruby>電気<rt>でんき</rt></ruby>が<ruby>走<rt>はし</rt></ruby>っている。<ruby>電気<rt>でんき</rt></ruby>に<ruby>強<rt>つよ</rt></ruby>いようだ。',
    ],
    choices: [{ text: '<ruby>続<rt>つづ</rt></ruby>き', next: 'electric_fence' }],
    onEnter() {
      if (!G.flags.yellowPikminJoined) {
        G.party.push({ name: '黄ピクミン', img: PUYO_IMGS[3], hp: 20, maxHp: 20, atk: 4, def: 2, desc: '電気に強い' });
        G.flags.yellowPikminJoined = true;
        addText('system', '🌿 <ruby>黄<rt>き</rt></ruby>ピクミンが<ruby>仲間<rt>なかま</rt></ruby>になった。');
        addText('chapter', '― <ruby>第<rt>だい</rt></ruby>3<ruby>章<rt>しょう</rt></ruby>「<ruby>雷鳴<rt>らいめい</rt></ruby>の<ruby>丘<rt>おか</rt></ruby>」 <ruby>開始<rt>かいし</rt></ruby> ―');
      }
    }
  },
  electric_fence: {
    scene: 'hill',
    text() {
      if (G.flags.fenceCleared) return [
        '<ruby>電気柵<rt>でんきさく</rt></ruby>は<ruby>解除<rt>かいじょ</rt></ruby>されている。<ruby>丘<rt>おか</rt></ruby>の<ruby>頂上<rt>ちょうじょう</rt></ruby>への<ruby>道<rt>みち</rt></ruby>が<ruby>開<rt>ひら</rt></ruby>けている。',
      ];
      if (isUsingPikmin('黄ピクミン')) return [
        '<ruby>電気柵<rt>でんきさく</rt></ruby>がバチバチと<ruby>火花<rt>ひばな</rt></ruby>を<ruby>散<rt>ち</rt></ruby>らしている。',
        '<ruby>黄<rt>き</rt></ruby>ピクミンが<ruby>電気柵<rt>でんきさく</rt></ruby>に<ruby>近<rt>ちか</rt></ruby>づいていく。<ruby>電気<rt>でんき</rt></ruby>を<ruby>吸収<rt>きゅうしゅう</rt></ruby>しているようだ。',
      ];
      return [
        '<ruby>電気柵<rt>でんきさく</rt></ruby>がバチバチと<ruby>火花<rt>ひばな</rt></ruby>を<ruby>散<rt>ち</rt></ruby>らしている。<ruby>触<rt>さわ</rt></ruby>れば<ruby>感電<rt>かんでん</rt></ruby>する。',
        '<ruby>電気<rt>でんき</rt></ruby>に<ruby>強<rt>つよ</rt></ruby>い<ruby>仲間<rt>なかま</rt></ruby>がいれば<ruby>解除<rt>かいじょ</rt></ruby>できるかもしれない。',
      ];
    },
    choices() {
      if (G.flags.fenceCleared) return [
        { text: '⛰️ <ruby>丘<rt>おか</rt></ruby>の<ruby>頂上<rt>ちょうじょう</rt></ruby>へ', next: 'hill_top' },
        { text: '◀ <ruby>雷<rt>かみなり</rt></ruby>の<ruby>木<rt>き</rt></ruby>へ', next: 'thunder_tree' },
      ];
      if (isUsingPikmin('黄ピクミン')) return [
        { text: '⚡ <ruby>黄<rt>き</rt></ruby>ピクミンで<ruby>電気<rt>でんき</rt></ruby>を<ruby>吸収<rt>きゅうしゅう</rt></ruby>する', next: 'hill_top' },
        { text: '◀ <ruby>雷<rt>かみなり</rt></ruby>の<ruby>木<rt>き</rt></ruby>へ', next: 'thunder_tree' },
      ];
      return [
        { text: '◀ <ruby>雷<rt>かみなり</rt></ruby>の<ruby>木<rt>き</rt></ruby>へ', next: 'thunder_tree' },
      ];
    },
    onEnter() {
      if (isUsingPikmin('黄ピクミン') && !G.flags.fenceCleared) {
        G.flags.fenceCleared = true;
        addText('system', '⚡ <ruby>黄<rt>き</rt></ruby>ピクミンが<ruby>電気<rt>でんき</rt></ruby>を<ruby>吸収<rt>きゅうしゅう</rt></ruby>し、<ruby>電気柵<rt>でんきさく</rt></ruby>が<ruby>解除<rt>かいじょ</rt></ruby>された。');
      }
    }
  },
  hill_top: {
    scene: 'hill',
    text() {
      if (G.flags.gotInsulationGlove) return [
        '【<ruby>丘<rt>おか</rt></ruby>の<ruby>頂上<rt>ちょうじょう</rt></ruby>】',
        '<ruby>見晴<rt>みは</rt></ruby>らしの<ruby>良<rt>よ</rt></ruby>い<ruby>高台<rt>たかだい</rt></ruby>。<ruby>遠<rt>とお</rt></ruby>くに<ruby>紫色<rt>むらさきいろ</rt></ruby>の<ruby>霧<rt>きり</rt></ruby>が<ruby>漂<rt>ただよ</rt></ruby>う<ruby>沼地<rt>ぬまち</rt></ruby>が<ruby>見<rt>み</rt></ruby>える。',
      ];
      return [
        '【<ruby>丘<rt>おか</rt></ruby>の<ruby>頂上<rt>ちょうじょう</rt></ruby>】',
        '<ruby>電気柵<rt>でんきさく</rt></ruby>を<ruby>越<rt>こ</rt></ruby>えた<ruby>先<rt>さき</rt></ruby>。<ruby>見晴<rt>みは</rt></ruby>らしの<ruby>良<rt>よ</rt></ruby>い<ruby>高台<rt>たかだい</rt></ruby>。',
        '<ruby>遠<rt>とお</rt></ruby>くに<ruby>紫色<rt>むらさきいろ</rt></ruby>の<ruby>霧<rt>きり</rt></ruby>が<ruby>漂<rt>ただよ</rt></ruby>う<ruby>沼地<rt>ぬまち</rt></ruby>が<ruby>見<rt>み</rt></ruby>える。',
        '<ruby>足元<rt>あしもと</rt></ruby>に<ruby>黄色<rt>きいろ</rt></ruby>い<ruby>手袋<rt>てぶくろ</rt></ruby>が<ruby>落<rt>お</rt></ruby>ちている。<ruby>絶縁<rt>ぜつえん</rt></ruby><ruby>素材<rt>そざい</rt></ruby>でできているようだ。',
      ];
    },
    choices() {
      const c = [
        { text: '🌫️ <ruby>丘<rt>おか</rt></ruby>を<ruby>下<rt>くだ</rt></ruby>って<ruby>沼地<rt>ぬまち</rt></ruby>へ', next: 'swamp_entrance' },
        { text: '◀ <ruby>電気柵<rt>でんきさく</rt></ruby>へ<ruby>戻<rt>もど</rt></ruby>る', next: 'electric_fence' },
      ];
      if (G.flags.needParts && !G.flags.gotEnergyCell && isUsingPikmin('黄ピクミン')) {
        c.push({ text: '🔧 <ruby>高台<rt>たかだい</rt></ruby>のパーツを<ruby>回収<rt>かいしゅう</rt></ruby>する', next: 'get_energy_cell' });
      }
      return c;
    },
    onEnter() {
      if (!G.flags.gotInsulationGlove) {
        G.items.push({ name: '絶縁グローブ', icon: '🧤', desc: '電気を通さない手袋', key: true });
        G.flags.gotInsulationGlove = true;
        addText('system', '🧤 <ruby>絶縁<rt>ぜつえん</rt></ruby>グローブを<ruby>手<rt>て</rt></ruby>に<ruby>入<rt>い</rt></ruby>れた。');
      }
    }
  },

  // ===== 第4章：毒の沼地（白ピクミン入手） =====
  swamp_entrance: {
    scene: 'swamp',
    text: [
      '【<ruby>毒<rt>どく</rt></ruby>の<ruby>沼地<rt>ぬまち</rt></ruby>】',
      '<ruby>丘<rt>おか</rt></ruby>を<ruby>下<rt>くだ</rt></ruby>った<ruby>先<rt>さき</rt></ruby>。<ruby>紫色<rt>むらさきいろ</rt></ruby>の<ruby>霧<rt>きり</rt></ruby>が<ruby>低<rt>ひく</rt></ruby>く<ruby>漂<rt>ただよ</rt></ruby>っている。',
      '<ruby>空気<rt>くうき</rt></ruby>が<ruby>重<rt>おも</rt></ruby>く、<ruby>甘<rt>あま</rt></ruby>ったるい<ruby>匂<rt>にお</rt></ruby>いがする。<ruby>毒<rt>どく</rt></ruby>の<ruby>霧<rt>きり</rt></ruby>のようだ。',
      '<ruby>奥<rt>おく</rt></ruby>に<ruby>白<rt>しろ</rt></ruby>い<ruby>花<rt>はな</rt></ruby>が<ruby>咲<rt>さ</rt></ruby>いているのが<ruby>見<rt>み</rt></ruby>える。',
    ],
    choices: [
      { text: '☠️ <ruby>毒霧<rt>どくぎり</rt></ruby>エリアへ<ruby>進<rt>すす</rt></ruby>む', next: 'poison_fog' },
      { text: '◀ <ruby>丘<rt>おか</rt></ruby>の<ruby>頂上<rt>ちょうじょう</rt></ruby>へ<ruby>戻<rt>もど</rt></ruby>る', next: 'hill_top' },
    ]
  },
  poison_fog: {
    scene: 'swamp',
    text() {
      if (G.flags.whitePikminJoined) return [
        '【<ruby>毒霧<rt>どくぎり</rt></ruby>エリア】',
        '<ruby>白<rt>しろ</rt></ruby>ピクミンが<ruby>毒<rt>どく</rt></ruby>の<ruby>霧<rt>きり</rt></ruby>の<ruby>中<rt>なか</rt></ruby>を<ruby>平気<rt>へいき</rt></ruby>で<ruby>歩<rt>ある</rt></ruby>いている。<ruby>白<rt>しろ</rt></ruby>い<ruby>花<rt>はな</rt></ruby>が<ruby>咲<rt>さ</rt></ruby>き<ruby>乱<rt>みだ</rt></ruby>れている。',
      ];
      return [
        '【<ruby>毒霧<rt>どくぎり</rt></ruby>エリア】',
        '<ruby>紫色<rt>むらさきいろ</rt></ruby>の<ruby>霧<rt>きり</rt></ruby>が<ruby>濃<rt>こ</rt></ruby>くなってきた。<ruby>長<rt>なが</rt></ruby>く<ruby>留<rt>とど</rt></ruby>まると<ruby>危険<rt>きけん</rt></ruby>だ。',
        '<ruby>白<rt>しろ</rt></ruby>い<ruby>花<rt>はな</rt></ruby>の<ruby>根元<rt>ねもと</rt></ruby>に、<ruby>白<rt>しろ</rt></ruby>い<ruby>芽<rt>め</rt></ruby>が<ruby>生<rt>は</rt></ruby>えている。<ruby>毒<rt>どく</rt></ruby>の<ruby>中<rt>なか</rt></ruby>でも<ruby>元気<rt>げんき</rt></ruby>そうだ。',
      ];
    },
    choices() {
      if (G.flags.whitePikminJoined) return [
        { text: '🏛️ <ruby>沈<rt>しず</rt></ruby>んだ<ruby>遺跡<rt>いせき</rt></ruby>へ', next: 'sunken_ruins' },
        { text: '◀ <ruby>沼地<rt>ぬまち</rt></ruby>の<ruby>入口<rt>いりぐち</rt></ruby>へ', next: 'swamp_entrance' },
      ];
      return [
        { text: '🌱 <ruby>白<rt>しろ</rt></ruby>い<ruby>芽<rt>め</rt></ruby>を<ruby>引<rt>ひ</rt></ruby>っこ<ruby>抜<rt>ぬ</rt></ruby>く', next: 'pull_white_pikmin' },
        { text: '◀ <ruby>沼地<rt>ぬまち</rt></ruby>の<ruby>入口<rt>いりぐち</rt></ruby>へ', next: 'swamp_entrance' },
      ];
    }
  },
  pull_white_pikmin: {
    scene: 'swamp',
    text: [
      '<ruby>毒<rt>どく</rt></ruby>の<ruby>霧<rt>きり</rt></ruby>の<ruby>中<rt>なか</rt></ruby>、<ruby>息<rt>いき</rt></ruby>を<ruby>止<rt>と</rt></ruby>めて<ruby>白<rt>しろ</rt></ruby>い<ruby>芽<rt>め</rt></ruby>に<ruby>手<rt>て</rt></ruby>を<ruby>伸<rt>の</rt></ruby>ばす。',
      '――ズボッ。',
      '<ruby>小<rt>ちい</rt></ruby>さな<ruby>白<rt>しろ</rt></ruby>い<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>が<ruby>現<rt>あらわ</rt></ruby>れた。<ruby>赤<rt>あか</rt></ruby>い<ruby>目<rt>め</rt></ruby>をしている。<ruby>体<rt>からだ</rt></ruby>が<ruby>他<rt>ほか</rt></ruby>のピクミンより<ruby>小<rt>ちい</rt></ruby>さい。',
      '<ruby>毒<rt>どく</rt></ruby>の<ruby>霧<rt>きり</rt></ruby>の<ruby>中<rt>なか</rt></ruby>でも<ruby>平気<rt>へいき</rt></ruby>な<ruby>顔<rt>かお</rt></ruby>をしている。<ruby>毒<rt>どく</rt></ruby>に<ruby>強<rt>つよ</rt></ruby>いようだ。',
    ],
    choices: [{ text: '<ruby>続<rt>つづ</rt></ruby>き', next: 'poison_fog' }],
    onEnter() {
      if (!G.flags.whitePikminJoined) {
        G.party.push({ name: '白ピクミン', img: PUYO_IMGS[4], hp: 15, maxHp: 15, atk: 3, def: 2, desc: '毒に強い。小さい穴に入れる' });
        G.flags.whitePikminJoined = true;
        addText('system', '🌿 <ruby>白<rt>しろ</rt></ruby>ピクミンが<ruby>仲間<rt>なかま</rt></ruby>になった。');
        addText('chapter', '― <ruby>第<rt>だい</rt></ruby>4<ruby>章<rt>しょう</rt></ruby>「<ruby>毒<rt>どく</rt></ruby>の<ruby>沼地<rt>ぬまち</rt></ruby>」 <ruby>開始<rt>かいし</rt></ruby> ―');
      }
    }
  },
  sunken_ruins: {
    scene: 'swamp',
    text() {
      if (G.flags.enteredRuins) return [
        '【<ruby>沈<rt>しず</rt></ruby>んだ<ruby>遺跡<rt>いせき</rt></ruby>】',
        '<ruby>沼<rt>ぬま</rt></ruby>に<ruby>半分<rt>はんぶん</rt></ruby><ruby>沈<rt>しず</rt></ruby>んだ<ruby>石造<rt>せきぞう</rt></ruby>りの<ruby>建物<rt>たてもの</rt></ruby>。<ruby>白<rt>しろ</rt></ruby>ピクミンが<ruby>入<rt>はい</rt></ruby>った<ruby>穴<rt>あな</rt></ruby>が<ruby>見<rt>み</rt></ruby>える。',
      ];
      if (isUsingPikmin('白ピクミン')) return [
        '【<ruby>沈<rt>しず</rt></ruby>んだ<ruby>遺跡<rt>いせき</rt></ruby>】',
        '<ruby>沼<rt>ぬま</rt></ruby>に<ruby>半分<rt>はんぶん</rt></ruby><ruby>沈<rt>しず</rt></ruby>んだ<ruby>石造<rt>せきぞう</rt></ruby>りの<ruby>建物<rt>たてもの</rt></ruby>。<ruby>入口<rt>いりぐち</rt></ruby>は<ruby>崩<rt>くず</rt></ruby>れている。',
        '<ruby>壁<rt>かべ</rt></ruby>に<ruby>小<rt>ちい</rt></ruby>さな<ruby>穴<rt>あな</rt></ruby>がある。<ruby>白<rt>しろ</rt></ruby>ピクミンなら<ruby>入<rt>はい</rt></ruby>れそうだ。',
      ];
      return [
        '【<ruby>沈<rt>しず</rt></ruby>んだ<ruby>遺跡<rt>いせき</rt></ruby>】',
        '<ruby>沼<rt>ぬま</rt></ruby>に<ruby>半分<rt>はんぶん</rt></ruby><ruby>沈<rt>しず</rt></ruby>んだ<ruby>石造<rt>せきぞう</rt></ruby>りの<ruby>建物<rt>たてもの</rt></ruby>。<ruby>入口<rt>いりぐち</rt></ruby>は<ruby>崩<rt>くず</rt></ruby>れている。',
        '<ruby>壁<rt>かべ</rt></ruby>に<ruby>小<rt>ちい</rt></ruby>さな<ruby>穴<rt>あな</rt></ruby>がある。<ruby>小<rt>ちい</rt></ruby>さい<ruby>仲間<rt>なかま</rt></ruby>なら<ruby>入<rt>はい</rt></ruby>れるかもしれない。',
      ];
    },
    choices() {
      if (G.flags.enteredRuins) return [
        { text: '🗝️ <ruby>遺跡<rt>いせき</rt></ruby>の<ruby>中<rt>なか</rt></ruby>へ', next: 'ruins_inside' },
        { text: '◀ <ruby>毒霧<rt>どくぎり</rt></ruby>エリアへ', next: 'poison_fog' },
      ];
      if (isUsingPikmin('白ピクミン')) return [
        { text: '🌿 <ruby>白<rt>しろ</rt></ruby>ピクミンを<ruby>穴<rt>あな</rt></ruby>に<ruby>送<rt>おく</rt></ruby>る', next: 'ruins_inside' },
        { text: '◀ <ruby>毒霧<rt>どくぎり</rt></ruby>エリアへ', next: 'poison_fog' },
      ];
      return [
        { text: '◀ <ruby>毒霧<rt>どくぎり</rt></ruby>エリアへ', next: 'poison_fog' },
      ];
    },
    onEnter() {
      if (isUsingPikmin('白ピクミン') && !G.flags.enteredRuins) {
        G.flags.enteredRuins = true;
        addText('system', '🌿 <ruby>白<rt>しろ</rt></ruby>ピクミンが<ruby>穴<rt>あな</rt></ruby>に<ruby>入<rt>はい</rt></ruby>り、<ruby>中<rt>なか</rt></ruby>から<ruby>鍵<rt>かぎ</rt></ruby>を<ruby>開<rt>あ</rt></ruby>けてくれた。');
      }
    }
  },
  ruins_inside: {
    scene: 'cave',
    text() {
      if (G.flags.gotAncientKey) return [
        '【<ruby>遺跡<rt>いせき</rt></ruby><ruby>内部<rt>ないぶ</rt></ruby>】',
        '<ruby>古代<rt>こだい</rt></ruby>の<ruby>壁画<rt>へきが</rt></ruby>が<ruby>描<rt>えが</rt></ruby>かれた<ruby>部屋<rt>へや</rt></ruby>。<ruby>奥<rt>おく</rt></ruby>に<ruby>冷<rt>つめ</rt></ruby>たい<ruby>風<rt>かぜ</rt></ruby>が<ruby>吹<rt>ふ</rt></ruby>き<ruby>込<rt>こ</rt></ruby>む<ruby>通路<rt>つうろ</rt></ruby>がある。',
      ];
      return [
        '【<ruby>遺跡<rt>いせき</rt></ruby><ruby>内部<rt>ないぶ</rt></ruby>】',
        '<ruby>白<rt>しろ</rt></ruby>ピクミンが<ruby>開<rt>あ</rt></ruby>けてくれた<ruby>扉<rt>とびら</rt></ruby>の<ruby>先<rt>さき</rt></ruby>。<ruby>古代<rt>こだい</rt></ruby>の<ruby>壁画<rt>へきが</rt></ruby>が<ruby>描<rt>えが</rt></ruby>かれている。',
        '<ruby>台座<rt>だいざ</rt></ruby>の<ruby>上<rt>うえ</rt></ruby>に<ruby>古<rt>ふる</rt></ruby>びた<ruby>鍵<rt>かぎ</rt></ruby>が<ruby>置<rt>お</rt></ruby>かれている。<ruby>不思議<rt>ふしぎ</rt></ruby>な<ruby>模様<rt>もよう</rt></ruby>が<ruby>刻<rt>きざ</rt></ruby>まれている。',
        '<ruby>奥<rt>おく</rt></ruby>の<ruby>通路<rt>つうろ</rt></ruby>から<ruby>冷<rt>つめ</rt></ruby>たい<ruby>風<rt>かぜ</rt></ruby>が<ruby>吹<rt>ふ</rt></ruby>いてくる。',
      ];
    },
    choices: [
      { text: '❄️ <ruby>奥<rt>おく</rt></ruby>の<ruby>洞窟<rt>どうくつ</rt></ruby>へ', next: 'ice_cave_entrance' },
      { text: '◀ <ruby>沈<rt>しず</rt></ruby>んだ<ruby>遺跡<rt>いせき</rt></ruby>へ', next: 'sunken_ruins' },
    ],
    onEnter() {
      if (!G.flags.gotAncientKey) {
        G.items.push({ name: '古代の鍵', icon: '🗝️', desc: '不思議な模様が刻まれた古い鍵', key: true });
        G.flags.gotAncientKey = true;
        addText('system', '🗝️ <ruby>古代<rt>こだい</rt></ruby>の<ruby>鍵<rt>かぎ</rt></ruby>を<ruby>手<rt>て</rt></ruby>に<ruby>入<rt>い</rt></ruby>れた。');
      }
    }
  },

  // ===== 第5章：凍てつく洞窟（紫ピクミン＋氷ピクミン入手＋仲間救出） =====
  ice_cave_entrance: {
    scene: 'ice',
    text: [
      '【<ruby>凍<rt>い</rt></ruby>てつく<ruby>洞窟<rt>どうくつ</rt></ruby>】',
      '<ruby>沼地<rt>ぬまち</rt></ruby>の<ruby>奥<rt>おく</rt></ruby>、<ruby>遺跡<rt>いせき</rt></ruby>の<ruby>通路<rt>つうろ</rt></ruby>を<ruby>抜<rt>ぬ</rt></ruby>けた<ruby>先<rt>さき</rt></ruby>。<ruby>冷気<rt>れいき</rt></ruby>が<ruby>漂<rt>ただよ</rt></ruby>う<ruby>洞窟<rt>どうくつ</rt></ruby>の<ruby>入口<rt>いりぐち</rt></ruby>。',
      '<ruby>壁<rt>かべ</rt></ruby>や<ruby>天井<rt>てんじょう</rt></ruby>に<ruby>氷<rt>こおり</rt></ruby>の<ruby>結晶<rt>けっしょう</rt></ruby>がびっしりと<ruby>張<rt>は</rt></ruby>り<ruby>付<rt>つ</rt></ruby>いている。',
      '<ruby>吐<rt>は</rt></ruby>く<ruby>息<rt>いき</rt></ruby>が<ruby>白<rt>しろ</rt></ruby>い。<ruby>奥<rt>おく</rt></ruby>に<ruby>進<rt>すす</rt></ruby>めそうだ。',
    ],
    choices() {
      const c = [
        { text: '🧊 <ruby>氷<rt>こおり</rt></ruby>の<ruby>通路<rt>つうろ</rt></ruby>へ', next: 'ice_corridor' },
        { text: '◀ <ruby>遺跡<rt>いせき</rt></ruby><ruby>内部<rt>ないぶ</rt></ruby>へ<ruby>戻<rt>もど</rt></ruby>る', next: 'ruins_inside' },
      ];
      if (G.flags.needParts && !G.flags.gotHeatShield && isUsingPikmin('岩ピクミン')) {
        c.push({ text: '🔧 <ruby>結晶<rt>けっしょう</rt></ruby>のパーツを<ruby>回収<rt>かいしゅう</rt></ruby>する', next: 'get_heat_shield' });
      }
      return c;
    },
    onEnter() { addText('chapter', '― <ruby>第<rt>だい</rt></ruby>5<ruby>章<rt>しょう</rt></ruby>「<ruby>凍<rt>い</rt></ruby>てつく<ruby>洞窟<rt>どうくつ</rt></ruby>」 <ruby>開始<rt>かいし</rt></ruby> ―'); }
  },
  ice_corridor: {
    scene: 'ice',
    text() {
      if (G.flags.purplePikminJoined) return [
        '【<ruby>氷<rt>こおり</rt></ruby>の<ruby>通路<rt>つうろ</rt></ruby>】',
        '<ruby>紫<rt>むらさき</rt></ruby>ピクミンが<ruby>力強<rt>ちからづよ</rt></ruby>く<ruby>歩<rt>ある</rt></ruby>いている。<ruby>重<rt>おも</rt></ruby>い<ruby>氷塊<rt>ひょうかい</rt></ruby>は<ruby>押<rt>お</rt></ruby>しのけられている。',
      ];
      return [
        '【<ruby>氷<rt>こおり</rt></ruby>の<ruby>通路<rt>つうろ</rt></ruby>】',
        '<ruby>通路<rt>つうろ</rt></ruby>を<ruby>進<rt>すす</rt></ruby>むと、<ruby>巨大<rt>きょだい</rt></ruby>な<ruby>氷塊<rt>ひょうかい</rt></ruby>が<ruby>道<rt>みち</rt></ruby>を<ruby>塞<rt>ふさ</rt></ruby>いでいる。<ruby>人<rt>ひと</rt></ruby>の<ruby>力<rt>ちから</rt></ruby>では<ruby>動<rt>うご</rt></ruby>かせない。',
        '<ruby>氷<rt>こおり</rt></ruby>の<ruby>壁<rt>かべ</rt></ruby>の<ruby>手前<rt>てまえ</rt></ruby>に、<ruby>紫色<rt>むらさきいろ</rt></ruby>の<ruby>芽<rt>め</rt></ruby>が<ruby>生<rt>は</rt></ruby>えている。<ruby>寒<rt>さむ</rt></ruby>さの<ruby>中<rt>なか</rt></ruby>でも<ruby>元気<rt>げんき</rt></ruby>そうだ。',
      ];
    },
    choices() {
      if (G.flags.purplePikminJoined) return [
        { text: '🧊 <ruby>氷<rt>こおり</rt></ruby>の<ruby>壁<rt>かべ</rt></ruby>へ', next: 'ice_wall' },
        { text: '◀ <ruby>洞窟<rt>どうくつ</rt></ruby><ruby>入口<rt>いりぐち</rt></ruby>へ', next: 'ice_cave_entrance' },
      ];
      return [
        { text: '🌱 <ruby>紫<rt>むらさき</rt></ruby>の<ruby>芽<rt>め</rt></ruby>を<ruby>引<rt>ひ</rt></ruby>っこ<ruby>抜<rt>ぬ</rt></ruby>く', next: 'pull_purple_pikmin' },
        { text: '◀ <ruby>洞窟<rt>どうくつ</rt></ruby><ruby>入口<rt>いりぐち</rt></ruby>へ', next: 'ice_cave_entrance' },
      ];
    }
  },
  pull_purple_pikmin: {
    scene: 'ice',
    text: [
      '<ruby>紫色<rt>むらさきいろ</rt></ruby>の<ruby>芽<rt>め</rt></ruby>を<ruby>掴<rt>つか</rt></ruby>み、<ruby>力<rt>ちから</rt></ruby>を<ruby>込<rt>こ</rt></ruby>めて<ruby>引<rt>ひ</rt></ruby>き<ruby>抜<rt>ぬ</rt></ruby>いた。',
      '――ズズズッ！',
      '<ruby>地面<rt>じめん</rt></ruby>が<ruby>揺<rt>ゆ</rt></ruby>れるほどの<ruby>重量感<rt>じゅうりょうかん</rt></ruby>。<ruby>大<rt>おお</rt></ruby>きくて<ruby>丸<rt>まる</rt></ruby>い<ruby>紫色<rt>むらさきいろ</rt></ruby>の<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>が<ruby>現<rt>あらわ</rt></ruby>れた。',
      '<ruby>他<rt>ほか</rt></ruby>のピクミンの<ruby>何倍<rt>なんばい</rt></ruby>もの<ruby>体格<rt>たいかく</rt></ruby>。<ruby>力<rt>ちから</rt></ruby>が<ruby>強<rt>つよ</rt></ruby>そうだ。',
    ],
    choices: [{ text: '<ruby>続<rt>つづ</rt></ruby>き', next: 'ice_wall' }],
    onEnter() {
      if (!G.flags.purplePikminJoined) {
        G.party.push({ name: '紫ピクミン', img: PUYO_IMGS[0], hp: 30, maxHp: 30, atk: 8, def: 5, desc: '力が強い。重いものを動かせる' });
        G.flags.purplePikminJoined = true;
        addText('system', '🌿 <ruby>紫<rt>むらさき</rt></ruby>ピクミンが<ruby>仲間<rt>なかま</rt></ruby>になった。');
      }
    }
  },
  ice_wall: {
    scene: 'ice',
    text() {
      if (G.flags.iceWallCleared) return [
        '<ruby>氷塊<rt>ひょうかい</rt></ruby>は<ruby>押<rt>お</rt></ruby>しのけられている。<ruby>奥<rt>おく</rt></ruby>への<ruby>道<rt>みち</rt></ruby>が<ruby>開<rt>ひら</rt></ruby>けている。',
      ];
      if (isUsingPikmin('紫ピクミン')) return [
        '<ruby>巨大<rt>きょだい</rt></ruby>な<ruby>氷塊<rt>ひょうかい</rt></ruby>が<ruby>道<rt>みち</rt></ruby>を<ruby>塞<rt>ふさ</rt></ruby>いでいる。',
        '<ruby>紫<rt>むらさき</rt></ruby>ピクミンが<ruby>氷塊<rt>ひょうかい</rt></ruby>に<ruby>体当<rt>たいあ</rt></ruby>たりする<ruby>構<rt>かま</rt></ruby>えを<ruby>見<rt>み</rt></ruby>せている。',
      ];
      return [
        '<ruby>巨大<rt>きょだい</rt></ruby>な<ruby>氷塊<rt>ひょうかい</rt></ruby>が<ruby>道<rt>みち</rt></ruby>を<ruby>塞<rt>ふさ</rt></ruby>いでいる。<ruby>人<rt>ひと</rt></ruby>の<ruby>力<rt>ちから</rt></ruby>では<ruby>動<rt>うご</rt></ruby>かせない。',
        '<ruby>力<rt>ちから</rt></ruby>の<ruby>強<rt>つよ</rt></ruby>い<ruby>仲間<rt>なかま</rt></ruby>がいれば<ruby>押<rt>お</rt></ruby>しのけられるかもしれない。',
      ];
    },
    choices() {
      if (G.flags.iceWallCleared) return [
        { text: '💠 <ruby>凍<rt>こお</rt></ruby>った<ruby>湖<rt>みずうみ</rt></ruby>へ', next: 'frozen_lake' },
        { text: '◀ <ruby>氷<rt>こおり</rt></ruby>の<ruby>通路<rt>つうろ</rt></ruby>へ', next: 'ice_corridor' },
      ];
      if (isUsingPikmin('紫ピクミン')) return [
        { text: '💪 <ruby>紫<rt>むらさき</rt></ruby>ピクミンで<ruby>氷塊<rt>ひょうかい</rt></ruby>を<ruby>押<rt>お</rt></ruby>す', next: 'frozen_lake' },
        { text: '◀ <ruby>氷<rt>こおり</rt></ruby>の<ruby>通路<rt>つうろ</rt></ruby>へ', next: 'ice_corridor' },
      ];
      return [
        { text: '◀ <ruby>氷<rt>こおり</rt></ruby>の<ruby>通路<rt>つうろ</rt></ruby>へ', next: 'ice_corridor' },
      ];
    },
    onEnter() {
      if (isUsingPikmin('紫ピクミン') && !G.flags.iceWallCleared) {
        G.flags.iceWallCleared = true;
        addText('system', '💪 <ruby>紫<rt>むらさき</rt></ruby>ピクミンが<ruby>氷塊<rt>ひょうかい</rt></ruby>を<ruby>押<rt>お</rt></ruby>しのけた！<ruby>道<rt>みち</rt></ruby>が<ruby>開<rt>ひら</rt></ruby>けた。');
      }
    }
  },
  frozen_lake: {
    scene: 'ice',
    text() {
      if (G.flags.icePikminJoined) return [
        '【<ruby>凍<rt>こお</rt></ruby>った<ruby>湖<rt>みずうみ</rt></ruby>】',
        '<ruby>氷<rt>こおり</rt></ruby>の<ruby>湖<rt>みずうみ</rt></ruby>。<ruby>氷<rt>こおり</rt></ruby>ピクミンが<ruby>氷上<rt>ひょうじょう</rt></ruby>を<ruby>滑<rt>すべ</rt></ruby>って<ruby>遊<rt>あそ</rt></ruby>んでいる。<ruby>奥<rt>おく</rt></ruby>に<ruby>結晶<rt>けっしょう</rt></ruby>の<ruby>間<rt>ま</rt></ruby>がある。',
      ];
      return [
        '【<ruby>凍<rt>こお</rt></ruby>った<ruby>湖<rt>みずうみ</rt></ruby>】',
        '<ruby>氷塊<rt>ひょうかい</rt></ruby>の<ruby>向<rt>む</rt></ruby>こうに<ruby>広<rt>ひろ</rt></ruby>がる<ruby>凍<rt>こお</rt></ruby>った<ruby>湖<rt>みずうみ</rt></ruby>。<ruby>氷<rt>こおり</rt></ruby>は<ruby>透<rt>す</rt></ruby>き<ruby>通<rt>とお</rt></ruby>って<ruby>美<rt>うつく</rt></ruby>しい。',
        '<ruby>氷<rt>こおり</rt></ruby>の<ruby>中<rt>なか</rt></ruby>に<ruby>青白<rt>あおじろ</rt></ruby>い<ruby>芽<rt>め</rt></ruby>が<ruby>閉<rt>と</rt></ruby>じ<ruby>込<rt>こ</rt></ruby>められている。<ruby>氷<rt>こおり</rt></ruby>を<ruby>溶<rt>と</rt></ruby>かさないと<ruby>取<rt>と</rt></ruby>り<ruby>出<rt>だ</rt></ruby>せない。',
        '<ruby>火<rt>ひ</rt></ruby>に<ruby>強<rt>つよ</rt></ruby>い<ruby>仲間<rt>なかま</rt></ruby>がいれば<ruby>氷<rt>こおり</rt></ruby>を<ruby>溶<rt>と</rt></ruby>かせるかもしれない。',
      ];
    },
    choices() {
      if (G.flags.icePikminJoined) return [
        { text: '👤 <ruby>結晶<rt>けっしょう</rt></ruby>の<ruby>間<rt>ま</rt></ruby>へ', next: 'crystal_room' },
        { text: '◀ <ruby>氷<rt>こおり</rt></ruby>の<ruby>壁<rt>かべ</rt></ruby>へ', next: 'ice_wall' },
      ];
      if (isUsingPikmin('赤ピクミン')) return [
        { text: '🔥 <ruby>赤<rt>あか</rt></ruby>ピクミンで<ruby>氷<rt>こおり</rt></ruby>を<ruby>溶<rt>と</rt></ruby>かす', next: 'pull_ice_pikmin' },
        { text: '◀ <ruby>氷<rt>こおり</rt></ruby>の<ruby>壁<rt>かべ</rt></ruby>へ', next: 'ice_wall' },
      ];
      return [
        { text: '◀ <ruby>氷<rt>こおり</rt></ruby>の<ruby>壁<rt>かべ</rt></ruby>へ', next: 'ice_wall' },
      ];
    }
  },
  pull_ice_pikmin: {
    scene: 'ice',
    text: [
      '<ruby>赤<rt>あか</rt></ruby>ピクミンが<ruby>氷<rt>こおり</rt></ruby>に<ruby>近<rt>ちか</rt></ruby>づき、<ruby>体<rt>からだ</rt></ruby>の<ruby>熱<rt>ねつ</rt></ruby>で<ruby>氷<rt>こおり</rt></ruby>を<ruby>溶<rt>と</rt></ruby>かしていく。',
      'じわじわと<ruby>氷<rt>こおり</rt></ruby>が<ruby>溶<rt>と</rt></ruby>け、<ruby>中<rt>なか</rt></ruby>から<ruby>芽<rt>め</rt></ruby>が<ruby>現<rt>あらわ</rt></ruby>れた。<ruby>引<rt>ひ</rt></ruby>き<ruby>抜<rt>ぬ</rt></ruby>く。',
      '――ズボッ。',
      '<ruby>透<rt>す</rt></ruby>き<ruby>通<rt>とお</rt></ruby>った<ruby>水色<rt>みずいろ</rt></ruby>の<ruby>小<rt>ちい</rt></ruby>さな<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>が<ruby>現<rt>あらわ</rt></ruby>れた。<ruby>体<rt>からだ</rt></ruby>の<ruby>周<rt>まわ</rt></ruby>りに<ruby>冷気<rt>れいき</rt></ruby>を<ruby>纏<rt>まと</rt></ruby>っている。',
      '<ruby>触<rt>ふ</rt></ruby>れたものを<ruby>凍<rt>こお</rt></ruby>らせる<ruby>力<rt>ちから</rt></ruby>があるようだ。',
    ],
    choices: [{ text: '<ruby>続<rt>つづ</rt></ruby>き', next: 'frozen_lake' }],
    onEnter() {
      if (!G.flags.icePikminJoined) {
        G.party.push({ name: '氷ピクミン', img: PUYO_IMGS[5], hp: 18, maxHp: 18, atk: 4, def: 4, desc: '触れたものを凍らせる' });
        G.flags.icePikminJoined = true;
        addText('system', '🌿 <ruby>氷<rt>こおり</rt></ruby>ピクミンが<ruby>仲間<rt>なかま</rt></ruby>になった。');
      }
    }
  },
  crystal_room: {
    scene: 'ice',
    text() {
      if (G.flags.engineerRescued) return [
        '【<ruby>結晶<rt>けっしょう</rt></ruby>の<ruby>間<rt>ま</rt></ruby>】',
        '<ruby>氷<rt>こおり</rt></ruby>の<ruby>結晶<rt>けっしょう</rt></ruby>が<ruby>輝<rt>かがや</rt></ruby>く<ruby>美<rt>うつく</rt></ruby>しい<ruby>部屋<rt>へや</rt></ruby>。エンジニアがいた<ruby>場所<rt>ばしょ</rt></ruby>には<ruby>溶<rt>と</rt></ruby>けた<ruby>水<rt>みず</rt></ruby>が<ruby>残<rt>のこ</rt></ruby>っている。',
      ];
      return [
        '【<ruby>結晶<rt>けっしょう</rt></ruby>の<ruby>間<rt>ま</rt></ruby>】',
        '<ruby>凍<rt>こお</rt></ruby>った<ruby>湖<rt>みずうみ</rt></ruby>の<ruby>奥<rt>おく</rt></ruby>。<ruby>氷<rt>こおり</rt></ruby>の<ruby>結晶<rt>けっしょう</rt></ruby>が<ruby>壁<rt>かべ</rt></ruby>を<ruby>覆<rt>おお</rt></ruby>い、<ruby>光<rt>ひかり</rt></ruby>を<ruby>反射<rt>はんしゃ</rt></ruby>して<ruby>輝<rt>かがや</rt></ruby>いている。',
        '<ruby>部屋<rt>へや</rt></ruby>の<ruby>中央<rt>ちゅうおう</rt></ruby>に、<ruby>人<rt>ひと</rt></ruby>が<ruby>氷漬<rt>こおりづ</rt></ruby>けになっている。<ruby>宇宙服<rt>うちゅうふく</rt></ruby>を<ruby>着<rt>き</rt></ruby>ている。<ruby>仲間<rt>なかま</rt></ruby>のようだ。',
        '<ruby>氷<rt>こおり</rt></ruby>を<ruby>溶<rt>と</rt></ruby>かせば<ruby>助<rt>たす</rt></ruby>けられるかもしれない。',
      ];
    },
    choices() {
      const c = [];
      if (G.flags.engineerRescued) {
        c.push({ text: '🪨 <ruby>岩山<rt>いわやま</rt></ruby>の<ruby>砦<rt>とりで</rt></ruby>へ', next: 'rock_fortress_entrance', condition: () => G.flags.engineerRescued });
        c.push({ text: '◀ <ruby>凍<rt>こお</rt></ruby>った<ruby>湖<rt>みずうみ</rt></ruby>へ', next: 'frozen_lake' });
        return c;
      }
      if (isUsingPikmin('氷ピクミン')) return [
        { text: '❄️ <ruby>氷<rt>こおり</rt></ruby>ピクミンで<ruby>解凍<rt>かいとう</rt></ruby>する', next: 'rescue_engineer' },
        { text: '◀ <ruby>凍<rt>こお</rt></ruby>った<ruby>湖<rt>みずうみ</rt></ruby>へ', next: 'frozen_lake' },
      ];
      return [
        { text: '◀ <ruby>凍<rt>こお</rt></ruby>った<ruby>湖<rt>みずうみ</rt></ruby>へ', next: 'frozen_lake' },
      ];
    }
  },
  rescue_engineer: {
    scene: 'ice',
    text: [
      '<ruby>氷<rt>こおり</rt></ruby>ピクミンが<ruby>氷漬<rt>こおりづ</rt></ruby>けの<ruby>人物<rt>じんぶつ</rt></ruby>に<ruby>触<rt>ふ</rt></ruby>れる。<ruby>不思議<rt>ふしぎ</rt></ruby>なことに、<ruby>氷<rt>こおり</rt></ruby>が<ruby>制御<rt>せいぎょ</rt></ruby>されたように<ruby>溶<rt>と</rt></ruby>けていく。',
      '<ruby>中<rt>なか</rt></ruby>から<ruby>宇宙服<rt>うちゅうふく</rt></ruby>の<ruby>人物<rt>じんぶつ</rt></ruby>が<ruby>崩<rt>くず</rt></ruby>れ<ruby>落<rt>お</rt></ruby>ちた。<ruby>息<rt>いき</rt></ruby>はある。<ruby>意識<rt>いしき</rt></ruby>が<ruby>戻<rt>もど</rt></ruby>ってきたようだ。',
      '「…ここは…？ <ruby>助<rt>たす</rt></ruby>けてくれたのか。<ruby>俺<rt>おれ</rt></ruby>はエンジニアだ。<ruby>同<rt>おな</rt></ruby>じ<ruby>船<rt>ふね</rt></ruby>に<ruby>乗<rt>の</rt></ruby>っていた。」',
      '「<ruby>俺<rt>おれ</rt></ruby>のロケットは<ruby>岩山<rt>いわやま</rt></ruby>の<ruby>向<rt>む</rt></ruby>こうに<ruby>落<rt>お</rt></ruby>ちたはず。<ruby>修理<rt>しゅうり</rt></ruby>できれば、この<ruby>惑星<rt>わくせい</rt></ruby>から<ruby>脱出<rt>だっしゅつ</rt></ruby>できるかもしれない。」',
    ],
    choices: [{ text: '▶ <ruby>探索<rt>たんさく</rt></ruby>を<ruby>続<rt>つづ</rt></ruby>ける', next: 'crystal_room' }],
    onEnter() {
      if (!G.flags.engineerRescued) {
        G.flags.engineerRescued = true;
        addText('system', '👤 エンジニアを<ruby>救出<rt>きゅうしゅつ</rt></ruby>した！');
        addText('chapter', '― <ruby>第<rt>だい</rt></ruby>5<ruby>章<rt>しょう</rt></ruby>「<ruby>凍<rt>い</rt></ruby>てつく<ruby>洞窟<rt>どうくつ</rt></ruby>」 <ruby>完<rt>かん</rt></ruby> ―');
      }
    }
  },
  // ===== 第6章: 岩山の砦（岩ピクミン入手＋パイロット救出） =====
  rock_fortress_entrance: {
    scene: 'rock',
    text: [
      '【<ruby>岩山<rt>いわやま</rt></ruby>の<ruby>砦<rt>とりで</rt></ruby>】',
      '<ruby>凍<rt>い</rt></ruby>てつく<ruby>洞窟<rt>どうくつ</rt></ruby>を<ruby>抜<rt>ぬ</rt></ruby>けた<ruby>先<rt>さき</rt></ruby>。<ruby>巨大<rt>きょだい</rt></ruby>な<ruby>岩山<rt>いわやま</rt></ruby>がそびえ<ruby>立<rt>た</rt></ruby>っている。',
      '<ruby>崩<rt>くず</rt></ruby>れた<ruby>壁<rt>かべ</rt></ruby>が<ruby>道<rt>みち</rt></ruby>を<ruby>塞<rt>ふさ</rt></ruby>いでいる。<ruby>普通<rt>ふつう</rt></ruby>の<ruby>力<rt>ちから</rt></ruby>では<ruby>壊<rt>こわ</rt></ruby>せそうにない。',
      '<ruby>壁<rt>かべ</rt></ruby>の<ruby>手前<rt>てまえ</rt></ruby>に<ruby>灰色<rt>はいいろ</rt></ruby>の<ruby>芽<rt>め</rt></ruby>が<ruby>生<rt>は</rt></ruby>えている。',
    ],
    choices() {
      if (G.flags.rockPikminJoined) return [
        { text: '🪨 <ruby>崩<rt>くず</rt></ruby>れた<ruby>壁<rt>かべ</rt></ruby>へ', next: 'rock_wall' },
        { text: '◀ <ruby>結晶<rt>けっしょう</rt></ruby>の<ruby>間<rt>ま</rt></ruby>へ<ruby>戻<rt>もど</rt></ruby>る', next: 'crystal_room' },
      ];
      return [
        { text: '🌱 <ruby>灰色<rt>はいいろ</rt></ruby>の<ruby>芽<rt>め</rt></ruby>を<ruby>引<rt>ひ</rt></ruby>っこ<ruby>抜<rt>ぬ</rt></ruby>く', next: 'pull_rock_pikmin' },
        { text: '◀ <ruby>結晶<rt>けっしょう</rt></ruby>の<ruby>間<rt>ま</rt></ruby>へ<ruby>戻<rt>もど</rt></ruby>る', next: 'crystal_room' },
      ];
    },
    onEnter() { addText('chapter', '― <ruby>第<rt>だい</rt></ruby>6<ruby>章<rt>しょう</rt></ruby>「<ruby>岩山<rt>いわやま</rt></ruby>の<ruby>砦<rt>とりで</rt></ruby>」 <ruby>開始<rt>かいし</rt></ruby> ―'); }
  },
  pull_rock_pikmin: {
    scene: 'rock',
    text: [
      '<ruby>灰色<rt>はいいろ</rt></ruby>の<ruby>芽<rt>め</rt></ruby>を<ruby>掴<rt>つか</rt></ruby>み、<ruby>力<rt>ちから</rt></ruby>を<ruby>込<rt>こ</rt></ruby>めて<ruby>引<rt>ひ</rt></ruby>き<ruby>抜<rt>ぬ</rt></ruby>いた。',
      '――ゴッ！',
      '<ruby>地面<rt>じめん</rt></ruby>から<ruby>岩<rt>いわ</rt></ruby>のように<ruby>硬<rt>かた</rt></ruby>い<ruby>灰色<rt>はいいろ</rt></ruby>の<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>が<ruby>現<rt>あらわ</rt></ruby>れた。<ruby>体<rt>からだ</rt></ruby>が<ruby>石<rt>いし</rt></ruby>のように<ruby>硬<rt>かた</rt></ruby>い。',
      '<ruby>壁<rt>かべ</rt></ruby>やガラスを<ruby>破壊<rt>はかい</rt></ruby>できそうだ。<ruby>頭<rt>あたま</rt></ruby>を<ruby>振<rt>ふ</rt></ruby>って<ruby>突進<rt>とっしん</rt></ruby>の<ruby>構<rt>かま</rt></ruby>えを<ruby>見<rt>み</rt></ruby>せている。',
    ],
    choices: [{ text: '<ruby>続<rt>つづ</rt></ruby>き', next: 'rock_wall' }],
    onEnter() {
      if (!G.flags.rockPikminJoined) {
        G.party.push({ name: '岩ピクミン', img: PUYO_IMGS[6], hp: 25, maxHp: 25, atk: 7, def: 6, desc: '硬い。壁やガラスを破壊できる' });
        G.flags.rockPikminJoined = true;
        addText('system', '🌿 <ruby>岩<rt>いわ</rt></ruby>ピクミンが<ruby>仲間<rt>なかま</rt></ruby>になった。');
      }
    }
  },
  rock_wall: {
    scene: 'rock',
    text() {
      if (G.flags.rockWallCleared) return [
        '<ruby>崩<rt>くず</rt></ruby>れた<ruby>壁<rt>かべ</rt></ruby>は<ruby>粉々<rt>こなごな</rt></ruby>に<ruby>砕<rt>くだ</rt></ruby>かれている。<ruby>砦<rt>とりで</rt></ruby>の<ruby>内部<rt>ないぶ</rt></ruby>への<ruby>道<rt>みち</rt></ruby>が<ruby>開<rt>ひら</rt></ruby>けている。',
      ];
      if (isUsingPikmin('岩ピクミン')) return [
        '<ruby>崩<rt>くず</rt></ruby>れた<ruby>壁<rt>かべ</rt></ruby>が<ruby>道<rt>みち</rt></ruby>を<ruby>塞<rt>ふさ</rt></ruby>いでいる。',
        '<ruby>岩<rt>いわ</rt></ruby>ピクミンが<ruby>壁<rt>かべ</rt></ruby>に<ruby>向<rt>む</rt></ruby>かって<ruby>突進<rt>とっしん</rt></ruby>の<ruby>構<rt>かま</rt></ruby>えを<ruby>見<rt>み</rt></ruby>せている。',
      ];
      return [
        '<ruby>崩<rt>くず</rt></ruby>れた<ruby>壁<rt>かべ</rt></ruby>が<ruby>道<rt>みち</rt></ruby>を<ruby>塞<rt>ふさ</rt></ruby>いでいる。<ruby>硬<rt>かた</rt></ruby>い<ruby>仲間<rt>なかま</rt></ruby>がいれば<ruby>壊<rt>こわ</rt></ruby>せるかもしれない。',
      ];
    },
    choices() {
      if (G.flags.rockWallCleared) return [
        { text: '⚔️ <ruby>砦<rt>とりで</rt></ruby>の<ruby>内部<rt>ないぶ</rt></ruby>へ', next: 'fortress_inside' },
        { text: '◀ <ruby>砦<rt>とりで</rt></ruby><ruby>入口<rt>いりぐち</rt></ruby>へ', next: 'rock_fortress_entrance' },
      ];
      if (isUsingPikmin('岩ピクミン')) return [
        { text: '🪨 <ruby>岩<rt>いわ</rt></ruby>ピクミンで<ruby>壁<rt>かべ</rt></ruby>を<ruby>破壊<rt>はかい</rt></ruby>する', next: 'fortress_inside' },
        { text: '◀ <ruby>砦<rt>とりで</rt></ruby><ruby>入口<rt>いりぐち</rt></ruby>へ', next: 'rock_fortress_entrance' },
      ];
      return [
        { text: '◀ <ruby>砦<rt>とりで</rt></ruby><ruby>入口<rt>いりぐち</rt></ruby>へ', next: 'rock_fortress_entrance' },
      ];
    },
    onEnter() {
      if (isUsingPikmin('岩ピクミン') && !G.flags.rockWallCleared) {
        G.flags.rockWallCleared = true;
        addText('system', '🪨 <ruby>岩<rt>いわ</rt></ruby>ピクミンが<ruby>壁<rt>かべ</rt></ruby>を<ruby>粉砕<rt>ふんさい</rt></ruby>した！<ruby>道<rt>みち</rt></ruby>が<ruby>開<rt>ひら</rt></ruby>けた。');
      }
    }
  },
  fortress_inside: {
    scene: 'rock',
    text() {
      if (G.flags.pilotRescued) return [
        '【<ruby>砦<rt>とりで</rt></ruby><ruby>内部<rt>ないぶ</rt></ruby>】',
        '<ruby>敵<rt>てき</rt></ruby>の<ruby>巣<rt>す</rt></ruby>だった<ruby>場所<rt>ばしょ</rt></ruby>。パイロットを<ruby>救出<rt>きゅうしゅつ</rt></ruby>した<ruby>跡<rt>あと</rt></ruby>が<ruby>残<rt>のこ</rt></ruby>っている。',
      ];
      return [
        '【<ruby>砦<rt>とりで</rt></ruby><ruby>内部<rt>ないぶ</rt></ruby>】',
        '<ruby>壁<rt>かべ</rt></ruby>を<ruby>壊<rt>こわ</rt></ruby>して<ruby>中<rt>なか</rt></ruby>に<ruby>入<rt>はい</rt></ruby>った。<ruby>敵<rt>てき</rt></ruby>の<ruby>巣<rt>す</rt></ruby>のようだ。',
        '<ruby>大<rt>おお</rt></ruby>きな<ruby>敵<rt>てき</rt></ruby>が<ruby>奥<rt>おく</rt></ruby>で<ruby>仲間<rt>なかま</rt></ruby>を<ruby>囲<rt>かこ</rt></ruby>んでいる。<ruby>正面<rt>しょうめん</rt></ruby>から<ruby>突破<rt>とっぱ</rt></ruby>するのは<ruby>危険<rt>きけん</rt></ruby>だ。',
        '<ruby>横<rt>よこ</rt></ruby>の<ruby>壁<rt>かべ</rt></ruby>に<ruby>薄<rt>うす</rt></ruby>い<ruby>部分<rt>ぶぶん</rt></ruby>がある。<ruby>硬<rt>かた</rt></ruby>い<ruby>仲間<rt>なかま</rt></ruby>なら<ruby>別<rt>べつ</rt></ruby>ルートを<ruby>作<rt>つく</rt></ruby>れるかもしれない。',
      ];
    },
    choices() {
      if (G.flags.pilotRescued) {
        const c = [{ text: '◀ <ruby>砦<rt>とりで</rt></ruby><ruby>入口<rt>いりぐち</rt></ruby>へ', next: 'rock_fortress_entrance' }];
        if (G.flags.pilotRescued) c.unshift({ text: '☁️ <ruby>天空<rt>てんくう</rt></ruby>の<ruby>庭<rt>にわ</rt></ruby>へ', next: 'sky_garden_entrance' });
        return c;
      }
      if (isUsingPikmin('岩ピクミン')) return [
        { text: '🪨 <ruby>岩<rt>いわ</rt></ruby>ピクミンで<ruby>別<rt>べつ</rt></ruby>ルートを<ruby>開<rt>ひら</rt></ruby>く', next: 'rescue_pilot' },
        { text: '◀ <ruby>砦<rt>とりで</rt></ruby><ruby>入口<rt>いりぐち</rt></ruby>へ', next: 'rock_fortress_entrance' },
      ];
      return [
        { text: '◀ <ruby>砦<rt>とりで</rt></ruby><ruby>入口<rt>いりぐち</rt></ruby>へ', next: 'rock_fortress_entrance' },
      ];
    }
  },
  rescue_pilot: {
    scene: 'rock',
    text: [
      '<ruby>岩<rt>いわ</rt></ruby>ピクミンが<ruby>横<rt>よこ</rt></ruby>の<ruby>壁<rt>かべ</rt></ruby>を<ruby>突<rt>つ</rt></ruby>き<ruby>破<rt>やぶ</rt></ruby>り、<ruby>別<rt>べつ</rt></ruby>ルートが<ruby>開<rt>ひら</rt></ruby>けた。',
      '<ruby>敵<rt>てき</rt></ruby>に<ruby>気<rt>き</rt></ruby>づかれずに<ruby>回<rt>まわ</rt></ruby>り<ruby>込<rt>こ</rt></ruby>み、<ruby>囲<rt>かこ</rt></ruby>まれていた<ruby>仲間<rt>なかま</rt></ruby>を<ruby>救出<rt>きゅうしゅつ</rt></ruby>した。',
      '「<ruby>助<rt>たす</rt></ruby>かった…！ <ruby>俺<rt>おれ</rt></ruby>はパイロットだ。<ruby>同<rt>おな</rt></ruby>じ<ruby>船<rt>ふね</rt></ruby>の<ruby>乗組員<rt>のりくみいん</rt></ruby>だ。」',
      '「<ruby>俺<rt>おれ</rt></ruby>のロケットは<ruby>天空<rt>てんくう</rt></ruby>の<ruby>庭<rt>にわ</rt></ruby>の<ruby>先<rt>さき</rt></ruby>に<ruby>落<rt>お</rt></ruby>ちた。<ruby>操縦<rt>そうじゅう</rt></ruby>は<ruby>任<rt>まか</rt></ruby>せろ。」',
    ],
    choices: [{ text: '▶ <ruby>探索<rt>たんさく</rt></ruby>を<ruby>続<rt>つづ</rt></ruby>ける', next: 'fortress_inside' }],
    onEnter() {
      if (!G.flags.pilotRescued) {
        G.flags.pilotRescued = true;
        addText('system', '👤 パイロットを<ruby>救出<rt>きゅうしゅつ</rt></ruby>した！');
        addText('chapter', '― <ruby>第<rt>だい</rt></ruby>6<ruby>章<rt>しょう</rt></ruby>「<ruby>岩山<rt>いわやま</rt></ruby>の<ruby>砦<rt>とりで</rt></ruby>」 <ruby>完<rt>かん</rt></ruby> ―');
      }
    }
  },
  // ===== 第7章: 天空の庭（羽ピクミン＋光ピクミン入手） =====
  sky_garden_entrance: {
    scene: 'sky',
    text: [
      '【<ruby>天空<rt>てんくう</rt></ruby>の<ruby>庭<rt>にわ</rt></ruby>】',
      '<ruby>岩山<rt>いわやま</rt></ruby>の<ruby>頂上<rt>ちょうじょう</rt></ruby>。<ruby>眼下<rt>がんか</rt></ruby>に<ruby>雲<rt>くも</rt></ruby>が<ruby>広<rt>ひろ</rt></ruby>がっている。',
      '<ruby>遠<rt>とお</rt></ruby>くに<ruby>浮島<rt>うきしま</rt></ruby>が<ruby>見<rt>み</rt></ruby>える。<ruby>飛<rt>と</rt></ruby>べる<ruby>仲間<rt>なかま</rt></ruby>がいないと<ruby>渡<rt>わた</rt></ruby>れない。',
      '<ruby>近<rt>ちか</rt></ruby>くにピンク<ruby>色<rt>いろ</rt></ruby>の<ruby>芽<rt>め</rt></ruby>が<ruby>風<rt>かぜ</rt></ruby>に<ruby>揺<rt>ゆ</rt></ruby>れている。',
    ],
    choices() {
      if (G.flags.wingPikminJoined) return [
        { text: '🏝️ <ruby>浮島<rt>うきしま</rt></ruby>へ<ruby>渡<rt>わた</rt></ruby>る', next: 'floating_island' },
        { text: '◀ <ruby>砦<rt>とりで</rt></ruby><ruby>内部<rt>ないぶ</rt></ruby>へ<ruby>戻<rt>もど</rt></ruby>る', next: 'fortress_inside' },
      ];
      return [
        { text: '🌱 ピンク<ruby>色<rt>いろ</rt></ruby>の<ruby>芽<rt>め</rt></ruby>を<ruby>引<rt>ひ</rt></ruby>っこ<ruby>抜<rt>ぬ</rt></ruby>く', next: 'pull_wing_pikmin' },
        { text: '◀ <ruby>砦<rt>とりで</rt></ruby><ruby>内部<rt>ないぶ</rt></ruby>へ<ruby>戻<rt>もど</rt></ruby>る', next: 'fortress_inside' },
      ];
    },
    onEnter() { addText('chapter', '― <ruby>第<rt>だい</rt></ruby>7<ruby>章<rt>しょう</rt></ruby>「<ruby>天空<rt>てんくう</rt></ruby>の<ruby>庭<rt>にわ</rt></ruby>」 <ruby>開始<rt>かいし</rt></ruby> ―'); }
  },
  pull_wing_pikmin: {
    scene: 'sky',
    text: [
      'ピンク<ruby>色<rt>いろ</rt></ruby>の<ruby>芽<rt>め</rt></ruby>を<ruby>掴<rt>つか</rt></ruby>み、<ruby>力<rt>ちから</rt></ruby>を<ruby>込<rt>こ</rt></ruby>めて<ruby>引<rt>ひ</rt></ruby>き<ruby>抜<rt>ぬ</rt></ruby>いた。',
      '――フワッ！',
      '<ruby>小<rt>ちい</rt></ruby>さなピンク<ruby>色<rt>いろ</rt></ruby>の<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>が<ruby>宙<rt>ちゅう</rt></ruby>に<ruby>浮<rt>う</rt></ruby>かんだ。<ruby>背中<rt>せなか</rt></ruby>に<ruby>透明<rt>とうめい</rt></ruby>な<ruby>羽<rt>はね</rt></ruby>がある。',
      '<ruby>空<rt>そら</rt></ruby>を<ruby>飛<rt>と</rt></ruby>べるようだ。<ruby>崖<rt>がけ</rt></ruby>を<ruby>飛<rt>と</rt></ruby>び<ruby>越<rt>こ</rt></ruby>えることができる。',
    ],
    choices: [{ text: '<ruby>続<rt>つづ</rt></ruby>き', next: 'sky_garden_entrance' }],
    onEnter() {
      if (!G.flags.wingPikminJoined) {
        G.party.push({ name: '羽ピクミン', img: PUYO_IMGS[7], hp: 15, maxHp: 15, atk: 3, def: 2, desc: '飛べる。崖を飛び越える' });
        G.flags.wingPikminJoined = true;
        addText('system', '🌿 <ruby>羽<rt>はね</rt></ruby>ピクミンが<ruby>仲間<rt>なかま</rt></ruby>になった。');
      }
    }
  },
  floating_island: {
    scene: 'sky',
    text() {
      if (!isUsingPikmin('羽ピクミン')) return [
        '【<ruby>浮島<rt>うきしま</rt></ruby>】',
        '<ruby>浮島<rt>うきしま</rt></ruby>が<ruby>見<rt>み</rt></ruby>えるが、<ruby>飛<rt>と</rt></ruby>べる<ruby>仲間<rt>なかま</rt></ruby>を<ruby>選<rt>えら</rt></ruby>んでいないと<ruby>渡<rt>わた</rt></ruby>れない。',
      ];
      return [
        '【<ruby>浮島<rt>うきしま</rt></ruby>】',
        '<ruby>羽<rt>はね</rt></ruby>ピクミンに<ruby>支<rt>ささ</rt></ruby>えられ、<ruby>浮島<rt>うきしま</rt></ruby>に<ruby>渡<rt>わた</rt></ruby>った。',
        '<ruby>緑<rt>みどり</rt></ruby>の<ruby>草<rt>くさ</rt></ruby>が<ruby>生<rt>は</rt></ruby>い<ruby>茂<rt>しげ</rt></ruby>る<ruby>小<rt>ちい</rt></ruby>さな<ruby>島<rt>しま</rt></ruby>。<ruby>奥<rt>おく</rt></ruby>に<ruby>暗<rt>くら</rt></ruby>い<ruby>通路<rt>つうろ</rt></ruby>が<ruby>口<rt>くち</rt></ruby>を<ruby>開<rt>あ</rt></ruby>けている。',
      ];
    },
    choices() {
      if (!isUsingPikmin('羽ピクミン')) return [
        { text: '◀ <ruby>天空<rt>てんくう</rt></ruby>の<ruby>庭<rt>にわ</rt></ruby>へ<ruby>戻<rt>もど</rt></ruby>る', next: 'sky_garden_entrance' },
      ];
      return [
        { text: '🌑 <ruby>暗<rt>くら</rt></ruby>い<ruby>通路<rt>つうろ</rt></ruby>へ', next: 'dark_passage' },
        { text: '◀ <ruby>天空<rt>てんくう</rt></ruby>の<ruby>庭<rt>にわ</rt></ruby>へ<ruby>戻<rt>もど</rt></ruby>る', next: 'sky_garden_entrance' },
      ];
    }
  },
  dark_passage: {
    scene: 'cave',
    text() {
      if (G.flags.lightPikminJoined) return [
        '【<ruby>暗<rt>くら</rt></ruby>い<ruby>通路<rt>つうろ</rt></ruby>】',
        '<ruby>光<rt>ひかり</rt></ruby>ピクミンが<ruby>辺<rt>あた</rt></ruby>りを<ruby>照<rt>て</rt></ruby>らしている。<ruby>奥<rt>おく</rt></ruby>に<ruby>古代<rt>こだい</rt></ruby>の<ruby>祠<rt>ほこら</rt></ruby>が<ruby>見<rt>み</rt></ruby>える。',
      ];
      return [
        '【<ruby>暗<rt>くら</rt></ruby>い<ruby>通路<rt>つうろ</rt></ruby>】',
        '<ruby>浮島<rt>うきしま</rt></ruby>の<ruby>奥<rt>おく</rt></ruby>。<ruby>真<rt>ま</rt></ruby>っ<ruby>暗<rt>くら</rt></ruby>な<ruby>通路<rt>つうろ</rt></ruby>が<ruby>続<rt>つづ</rt></ruby>いている。',
        '<ruby>光<rt>ひか</rt></ruby>る<ruby>仲間<rt>なかま</rt></ruby>がいないと<ruby>進<rt>すす</rt></ruby>めない。',
        '<ruby>暗闇<rt>くらやみ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>に<ruby>金色<rt>きんいろ</rt></ruby>の<ruby>芽<rt>め</rt></ruby>が<ruby>微<rt>かす</rt></ruby>かに<ruby>光<rt>ひか</rt></ruby>っている。',
      ];
    },
    choices() {
      if (G.flags.lightPikminJoined) return [
        { text: '🏛️ <ruby>古代<rt>こだい</rt></ruby>の<ruby>祠<rt>ほこら</rt></ruby>へ', next: 'ancient_shrine' },
        { text: '◀ <ruby>浮島<rt>うきしま</rt></ruby>へ<ruby>戻<rt>もど</rt></ruby>る', next: 'floating_island' },
      ];
      return [
        { text: '🌱 <ruby>金色<rt>きんいろ</rt></ruby>の<ruby>芽<rt>め</rt></ruby>を<ruby>引<rt>ひ</rt></ruby>っこ<ruby>抜<rt>ぬ</rt></ruby>く', next: 'pull_light_pikmin' },
        { text: '◀ <ruby>浮島<rt>うきしま</rt></ruby>へ<ruby>戻<rt>もど</rt></ruby>る', next: 'floating_island' },
      ];
    }
  },
  pull_light_pikmin: {
    scene: 'cave',
    text: [
      '<ruby>暗闇<rt>くらやみ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>、<ruby>微<rt>かす</rt></ruby>かに<ruby>光<rt>ひか</rt></ruby>る<ruby>芽<rt>め</rt></ruby>を<ruby>手探<rt>てさぐ</rt></ruby>りで<ruby>掴<rt>つか</rt></ruby>み、<ruby>引<rt>ひ</rt></ruby>き<ruby>抜<rt>ぬ</rt></ruby>いた。',
      '――パァッ！',
      '<ruby>眩<rt>まぶ</rt></ruby>しい<ruby>光<rt>ひかり</rt></ruby>が<ruby>溢<rt>あふ</rt></ruby>れた。<ruby>金色<rt>きんいろ</rt></ruby>に<ruby>輝<rt>かがや</rt></ruby>く<ruby>小<rt>ちい</rt></ruby>さな<ruby>生<rt>い</rt></ruby>き<ruby>物<rt>もの</rt></ruby>が<ruby>現<rt>あらわ</rt></ruby>れた。',
      '<ruby>体<rt>からだ</rt></ruby>から<ruby>光<rt>ひかり</rt></ruby>を<ruby>放<rt>はな</rt></ruby>ち、<ruby>闇<rt>やみ</rt></ruby>を<ruby>照<rt>て</rt></ruby>らす<ruby>力<rt>ちから</rt></ruby>がある。<ruby>通路<rt>つうろ</rt></ruby>の<ruby>奥<rt>おく</rt></ruby>が<ruby>見<rt>み</rt></ruby>えるようになった。',
    ],
    choices: [{ text: '<ruby>続<rt>つづ</rt></ruby>き', next: 'dark_passage' }],
    onEnter() {
      if (!G.flags.lightPikminJoined) {
        G.party.push({ name: '光ピクミン', img: PUYO_IMGS[8], hp: 18, maxHp: 18, atk: 5, def: 3, desc: '闇を照らす' });
        G.flags.lightPikminJoined = true;
        addText('system', '🌿 <ruby>光<rt>ひかり</rt></ruby>ピクミンが<ruby>仲間<rt>なかま</rt></ruby>になった。');
      }
    }
  },
  ancient_shrine: {
    scene: 'sky',
    text() {
      if (!isUsingPikmin('光ピクミン')) return [
        '【<ruby>古代<rt>こだい</rt></ruby>の<ruby>祠<rt>ほこら</rt></ruby>】',
        '<ruby>暗<rt>くら</rt></ruby>くて<ruby>先<rt>さき</rt></ruby>が<ruby>見<rt>み</rt></ruby>えない。<ruby>光<rt>ひか</rt></ruby>る<ruby>仲間<rt>なかま</rt></ruby>を<ruby>選<rt>えら</rt></ruby>ぶ<ruby>必要<rt>ひつよう</rt></ruby>がある。',
      ];
      return [
        '【<ruby>古代<rt>こだい</rt></ruby>の<ruby>祠<rt>ほこら</rt></ruby>】',
        '<ruby>光<rt>ひかり</rt></ruby>ピクミンが<ruby>辺<rt>あた</rt></ruby>りを<ruby>照<rt>て</rt></ruby>らすと、<ruby>古代<rt>こだい</rt></ruby>の<ruby>壁画<rt>へきが</rt></ruby>が<ruby>浮<rt>う</rt></ruby>かび<ruby>上<rt>あ</rt></ruby>がった。',
        '<ruby>壁画<rt>へきが</rt></ruby>には<ruby>空<rt>そら</rt></ruby>を<ruby>飛<rt>と</rt></ruby>ぶ<ruby>乗<rt>の</rt></ruby>り<ruby>物<rt>もの</rt></ruby>が<ruby>描<rt>えが</rt></ruby>かれている。',
        '<ruby>祠<rt>ほこら</rt></ruby>の<ruby>奥<rt>おく</rt></ruby>に<ruby>道<rt>みち</rt></ruby>が<ruby>続<rt>つづ</rt></ruby>いている。ロケットの<ruby>墜落<rt>ついらく</rt></ruby><ruby>地点<rt>ちてん</rt></ruby>への<ruby>道<rt>みち</rt></ruby>のようだ。',
      ];
    },
    choices() {
      if (!isUsingPikmin('光ピクミン')) return [
        { text: '◀ <ruby>暗<rt>くら</rt></ruby>い<ruby>通路<rt>つうろ</rt></ruby>へ<ruby>戻<rt>もど</rt></ruby>る', next: 'dark_passage' },
      ];
      return [
        { text: '🛸 <ruby>奥<rt>おく</rt></ruby>へ<ruby>進<rt>すす</rt></ruby>む', next: 'rocket_crash_site' },
        { text: '◀ <ruby>暗<rt>くら</rt></ruby>い<ruby>通路<rt>つうろ</rt></ruby>へ<ruby>戻<rt>もど</rt></ruby>る', next: 'dark_passage' },
      ];
    },
    onEnter() {
      if (isUsingPikmin('光ピクミン')) {
        addText('chapter', '― <ruby>第<rt>だい</rt></ruby>7<ruby>章<rt>しょう</rt></ruby>「<ruby>天空<rt>てんくう</rt></ruby>の<ruby>庭<rt>にわ</rt></ruby>」 <ruby>完<rt>かん</rt></ruby> ―');
      }
    }
  },
  // ===== 脱出パート =====
  rocket_crash_site: {
    scene: 'sky',
    text: [
      '【ロケット<ruby>墜落<rt>ついらく</rt></ruby><ruby>地点<rt>ちてん</rt></ruby>】',
      '<ruby>祠<rt>ほこら</rt></ruby>の<ruby>奥<rt>おく</rt></ruby>を<ruby>抜<rt>ぬ</rt></ruby>けた<ruby>先<rt>さき</rt></ruby>。<ruby>仲間<rt>なかま</rt></ruby>のロケットが<ruby>墜落<rt>ついらく</rt></ruby>している。',
      '<ruby>機体<rt>きたい</rt></ruby>は<ruby>損傷<rt>そんしょう</rt></ruby>しているが、<ruby>原型<rt>げんけい</rt></ruby>は<ruby>保<rt>たも</rt></ruby>っている。',
      'エンジニア「4つのパーツが<ruby>必要<rt>ひつよう</rt></ruby>だ。お<ruby>前<rt>まえ</rt></ruby>のロケットの<ruby>通信<rt>つうしん</rt></ruby>モジュールも<ruby>使<rt>つか</rt></ruby>える。」',
    ],
    choices: [
      { text: '🔧 <ruby>修理<rt>しゅうり</rt></ruby><ruby>状況<rt>じょうきょう</rt></ruby>を<ruby>確認<rt>かくにん</rt></ruby>する', next: 'repair_rocket' },
      { text: '◀ <ruby>古代<rt>こだい</rt></ruby>の<ruby>祠<rt>ほこら</rt></ruby>へ<ruby>戻<rt>もど</rt></ruby>る', next: 'ancient_shrine' },
    ],
    onEnter() {
      if (!G.flags.foundRocket) {
        G.flags.foundRocket = true;
        G.flags.needParts = true;
        addText('system', '🛸 <ruby>仲間<rt>なかま</rt></ruby>のロケットを<ruby>発見<rt>はっけん</rt></ruby>した！<ruby>修理<rt>しゅうり</rt></ruby>パーツを<ruby>集<rt>あつ</rt></ruby>めよう。');
        addText('chapter', '― <ruby>脱出<rt>だっしゅつ</rt></ruby>パート <ruby>開始<rt>かいし</rt></ruby> ―');
      }
    }
  },
  repair_rocket: {
    scene: 'sky',
    text() {
      const parts = [G.flags.gotCommModule, G.flags.gotPropulsionCoil, G.flags.gotHeatShield, G.flags.gotEnergyCell];
      const count = parts.filter(Boolean).length;
      if (count === 4) return [
        '【ロケット<ruby>修理<rt>しゅうり</rt></ruby>】',
        'エンジニア「<ruby>全<rt>すべ</rt></ruby>てのパーツが<ruby>揃<rt>そろ</rt></ruby>った！<ruby>修理<rt>しゅうり</rt></ruby>を<ruby>始<rt>はじ</rt></ruby>めるぞ。」',
      ];
      const lines = [
        '【ロケット<ruby>修理<rt>しゅうり</rt></ruby>】',
        'エンジニア「まだ<ruby>足<rt>た</rt></ruby>りない。<ruby>集<rt>あつ</rt></ruby>めてきてくれ。」',
        '',
        '📡 <ruby>通信<rt>つうしん</rt></ruby>モジュール: ' + (G.flags.gotCommModule ? '✅' : '❌ <ruby>不時着地点<rt>ふじちゃくちてん</rt></ruby>（<ruby>赤<rt>あか</rt></ruby>ピクミン）'),
        '🔧 <ruby>推進<rt>すいしん</rt></ruby>コイル: ' + (G.flags.gotPropulsionCoil ? '✅' : '❌ <ruby>水辺<rt>みずべ</rt></ruby>の<ruby>谷<rt>たに</rt></ruby>（<ruby>青<rt>あお</rt></ruby>ピクミン）'),
        '🛡️ <ruby>耐熱<rt>たいねつ</rt></ruby>シールド: ' + (G.flags.gotHeatShield ? '✅' : '❌ <ruby>凍<rt>い</rt></ruby>てつく<ruby>洞窟<rt>どうくつ</rt></ruby>（<ruby>岩<rt>いわ</rt></ruby>ピクミン）'),
        '⚡ エネルギーセル: ' + (G.flags.gotEnergyCell ? '✅' : '❌ <ruby>雷鳴<rt>らいめい</rt></ruby>の<ruby>丘<rt>おか</rt></ruby>（<ruby>黄<rt>き</rt></ruby>ピクミン）'),
      ];
      return lines;
    },
    choices() {
      const parts = [G.flags.gotCommModule, G.flags.gotPropulsionCoil, G.flags.gotHeatShield, G.flags.gotEnergyCell];
      const count = parts.filter(Boolean).length;
      if (count === 4) return [
        { text: '🚀 <ruby>修理<rt>しゅうり</rt></ruby><ruby>開始<rt>かいし</rt></ruby>！', next: 'ending' },
      ];
      return [
        { text: '◀ <ruby>墜落<rt>ついらく</rt></ruby><ruby>地点<rt>ちてん</rt></ruby>へ<ruby>戻<rt>もど</rt></ruby>る', next: 'rocket_crash_site' },
      ];
    }
  },
  get_comm_module: {
    scene: 'crash',
    text: [
      '<ruby>赤<rt>あか</rt></ruby>ピクミンが<ruby>炎<rt>ほのお</rt></ruby>の<ruby>中<rt>なか</rt></ruby>に<ruby>飛<rt>と</rt></ruby>び<ruby>込<rt>こ</rt></ruby>み、ロケットの<ruby>残骸<rt>ざんがい</rt></ruby>から<ruby>通信<rt>つうしん</rt></ruby>モジュールを<ruby>引<rt>ひ</rt></ruby>き<ruby>出<rt>だ</rt></ruby>した。',
      '<ruby>焦<rt>こ</rt></ruby>げているが、<ruby>中<rt>なか</rt></ruby>の<ruby>回路<rt>かいろ</rt></ruby>は<ruby>無事<rt>ぶじ</rt></ruby>のようだ。',
    ],
    choices: [{ text: '◀ <ruby>戻<rt>もど</rt></ruby>る', next: 'crash_site' }],
    onEnter() {
      if (!G.flags.gotCommModule) {
        G.flags.gotCommModule = true;
        addText('system', '📡 <ruby>通信<rt>つうしん</rt></ruby>モジュールを<ruby>回収<rt>かいしゅう</rt></ruby>した！（1/4）');
      }
    }
  },
  get_propulsion_coil: {
    scene: 'river',
    text: [
      '<ruby>青<rt>あお</rt></ruby>ピクミンが<ruby>水底<rt>みなそこ</rt></ruby>に<ruby>潜<rt>もぐ</rt></ruby>り、<ruby>沈<rt>しず</rt></ruby>んでいた<ruby>推進<rt>すいしん</rt></ruby>コイルを<ruby>引<rt>ひ</rt></ruby>き<ruby>上<rt>あ</rt></ruby>げた。',
      '<ruby>水<rt>みず</rt></ruby>に<ruby>浸<rt>つ</rt></ruby>かっていたが、<ruby>密閉<rt>みっぺい</rt></ruby>されていて<ruby>中身<rt>なかみ</rt></ruby>は<ruby>無事<rt>ぶじ</rt></ruby>だ。',
    ],
    choices: [{ text: '◀ <ruby>戻<rt>もど</rt></ruby>る', next: 'river_entrance' }],
    onEnter() {
      if (!G.flags.gotPropulsionCoil) {
        G.flags.gotPropulsionCoil = true;
        addText('system', '🔧 <ruby>推進<rt>すいしん</rt></ruby>コイルを<ruby>回収<rt>かいしゅう</rt></ruby>した！（2/4）');
      }
    }
  },
  get_heat_shield: {
    scene: 'ice',
    text: [
      '<ruby>岩<rt>いわ</rt></ruby>ピクミンが<ruby>氷<rt>こおり</rt></ruby>の<ruby>結晶<rt>けっしょう</rt></ruby>に<ruby>体当<rt>たいあ</rt></ruby>たりし、<ruby>中<rt>なか</rt></ruby>に<ruby>閉<rt>と</rt></ruby>じ<ruby>込<rt>こ</rt></ruby>められていた<ruby>耐熱<rt>たいねつ</rt></ruby>シールドを<ruby>取<rt>と</rt></ruby>り<ruby>出<rt>だ</rt></ruby>した。',
      '<ruby>結晶<rt>けっしょう</rt></ruby>に<ruby>守<rt>まも</rt></ruby>られていたおかげで、<ruby>完璧<rt>かんぺき</rt></ruby>な<ruby>状態<rt>じょうたい</rt></ruby>だ。',
    ],
    choices: [{ text: '◀ <ruby>戻<rt>もど</rt></ruby>る', next: 'ice_cave_entrance' }],
    onEnter() {
      if (!G.flags.gotHeatShield) {
        G.flags.gotHeatShield = true;
        addText('system', '🛡️ <ruby>耐熱<rt>たいねつ</rt></ruby>シールドを<ruby>回収<rt>かいしゅう</rt></ruby>した！（3/4）');
      }
    }
  },
  get_energy_cell: {
    scene: 'hill',
    text: [
      '<ruby>黄<rt>き</rt></ruby>ピクミンを<ruby>高台<rt>たかだい</rt></ruby>に<ruby>投<rt>な</rt></ruby>げ<ruby>上<rt>あ</rt></ruby>げた。<ruby>黄<rt>き</rt></ruby>ピクミンが<ruby>上<rt>うえ</rt></ruby>からエネルギーセルを<ruby>落<rt>お</rt></ruby>としてくれた。',
      '<ruby>電気<rt>でんき</rt></ruby>を<ruby>帯<rt>お</rt></ruby>びたセルが<ruby>光<rt>ひか</rt></ruby>っている。<ruby>充電<rt>じゅうでん</rt></ruby><ruby>状態<rt>じょうたい</rt></ruby>は<ruby>良好<rt>りょうこう</rt></ruby>だ。',
    ],
    choices: [{ text: '◀ <ruby>戻<rt>もど</rt></ruby>る', next: 'hill_top' }],
    onEnter() {
      if (!G.flags.gotEnergyCell) {
        G.flags.gotEnergyCell = true;
        addText('system', '⚡ エネルギーセルを<ruby>回収<rt>かいしゅう</rt></ruby>した！（4/4）');
      }
    }
  },
  ending: {
    scene: 'sky',
    text: [
      '<ruby>修理<rt>しゅうり</rt></ruby>が<ruby>完了<rt>かんりょう</rt></ruby>した。エンジニアが<ruby>最後<rt>さいご</rt></ruby>のボルトを<ruby>締<rt>し</rt></ruby>める。',
      '「よし、これで<ruby>飛<rt>と</rt></ruby>べるはずだ。」',
      'パイロットがコックピットに<ruby>乗<rt>の</rt></ruby>り<ruby>込<rt>こ</rt></ruby>む。',
      '「<ruby>操縦<rt>そうじゅう</rt></ruby>は<ruby>任<rt>まか</rt></ruby>せろ。<ruby>全員<rt>ぜんいん</rt></ruby><ruby>乗<rt>の</rt></ruby>れ。」',
      'ピクミンたちが<ruby>次々<rt>つぎつぎ</rt></ruby>とロケットに<ruby>乗<rt>の</rt></ruby>り<ruby>込<rt>こ</rt></ruby>んでいく。',
      'エンジンが<ruby>唸<rt>うな</rt></ruby>りを<ruby>上<rt>あ</rt></ruby>げる。<ruby>地面<rt>じめん</rt></ruby>が<ruby>揺<rt>ゆ</rt></ruby>れる。',
      'ロケットが<ruby>浮<rt>う</rt></ruby>き<ruby>上<rt>あ</rt></ruby>がり、<ruby>紫色<rt>むらさきいろ</rt></ruby>の<ruby>空<rt>そら</rt></ruby>を<ruby>突<rt>つ</rt></ruby>き<ruby>抜<rt>ぬ</rt></ruby>けていく。',
      '<ruby>眼下<rt>がんか</rt></ruby>に<ruby>惑星<rt>わくせい</rt></ruby>が<ruby>小<rt>ちい</rt></ruby>さくなっていく。',
      '――<ruby>冒険<rt>ぼうけん</rt></ruby>は<ruby>終<rt>お</rt></ruby>わった。',
    ],
    choices: [{ text: '🏠 タイトルに<ruby>戻<rt>もど</rt></ruby>る', next: '_title' }],
    onEnter() {
      unlockAchievement('game_clear');
      addText('chapter', '― <ruby>完<rt>かん</rt></ruby> ―');
    }
  },
});
