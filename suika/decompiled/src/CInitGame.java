/*
 * Decompiled with CFR 0.152.
 */
class CInitGame {
    public static void InitGame(ARpg aRpg) {
        Vari.m_Efc.ClearAllWork();
        Vari.m_Char.Init();
        Vari.m_BChr.ClearPrm();
        aRpg.m_Play.Init();
        aRpg.m_bGameOver = false;
        aRpg.m_Play.m_nPartyNum = 1;
        aRpg.m_Play.m_nGold = 1000;
        CChrPrm.Set(aRpg.m_Player, 0);
        aRpg.SetChrPrm(0, 0);
        CChrParam cChrParam = Vari.GetChrPrm(0);
        CAbility cAbility = cChrParam.m_Abi;
        cChrParam.SetName(aRpg.m_Play.m_strPlayerName);
        cChrParam.m_bPlayer = true;
        cAbility.SetFlagC(1);
        cAbility.SetFlagC(10);
        cChrParam.m_anCmdAb[0] = 1;
        cChrParam.m_anCmdAb[1] = 10;
        CChrWork cChrWork = Vari.GetChrWork(1);
        CChrPrm.Set(cChrWork, 21);
        cChrWork.ResetFlag(1);
        aRpg.SetChrPrm(1, 1);
        cChrParam = Vari.GetChrPrm(1);
        cChrParam.m_bPlayer = true;
        cAbility = cChrParam.m_Abi;
        cAbility.SetFlagM(68);
        cAbility.SetFlagM(69);
        cAbility.SetFlagC(1);
        cAbility.SetFlagC(10);
        cChrParam.m_anCmdAb[0] = 1;
        cChrParam.m_anCmdAb[1] = 9;
        cChrParam.m_anCmdAb[2] = 10;
        cChrParam.m_anEquip[0] = 20;
        cChrParam.m_anEquip[1] = 51;
        cChrParam.m_anEquip[2] = 70;
        cChrParam.m_nGem = 116;
        cChrParam.AllLevelUp();
        cChrParam.SetEquipPrmAll();
        cChrWork = Vari.GetChrWork(2);
        CChrPrm.Set(cChrWork, 28);
        cChrWork.ResetFlag(1);
        aRpg.SetChrPrm(2, 2);
        cChrParam = Vari.GetChrPrm(2);
        cChrParam.m_bPlayer = true;
        cAbility = cChrParam.m_Abi;
        cAbility.SetFlagM(50);
        cAbility.SetFlagM(51);
        cAbility.SetFlagM(6);
        cAbility.SetFlagM(52);
        cAbility.SetFlagC(1);
        cAbility.SetFlagC(10);
        cChrParam.m_anCmdAb[0] = 1;
        cChrParam.m_anCmdAb[1] = 6;
        cChrParam.m_anCmdAb[2] = 10;
        cChrParam.m_anEquip[0] = 40;
        cChrParam.m_anEquip[1] = 51;
        cChrParam.m_anEquip[2] = 80;
        cChrParam.m_nGem = 117;
        cChrParam.AllLevelUp();
        cChrParam.SetEquipPrmAll();
        aRpg.m_Play.HealAll();
        aRpg.m_Player.m_vPos.x = CMapData.GetXPos(16);
        aRpg.m_Player.m_vPos.z = CMapData.GetXPos(35);
        aRpg.m_Player.SetVect(0.0f);
        aRpg.SetArea(0);
        cChrWork = Vari.GetChrWork(1);
        cChrWork.SetFlag(32);
        cChrWork = Vari.GetChrWork(2);
        cChrWork.SetFlag(32);
        aRpg.m_Play.HealAll();
        aRpg.m_Play.m_anItem[1] = 3;
    }

    CInitGame() {
    }

    public static void StartUpMessage(CInitApplet cInitApplet) {
        cInitApplet.DrawText("\u3059\u3044\u304b\u304c\u98df\u3079\u305f\u3044");
        cInitApplet.DrawText("2002-2008\u3000\u304f\u308d\u3059\u3051");
        cInitApplet.DrawText("\u8aad\u307f\u8fbc\u307f\u4e2d\u3067\u3059\u3002");
        cInitApplet.DrawText("\u3057\u3070\u3089\u304f\u304a\u5f85\u3061\u304f\u3060\u3055\u3044\u3002");
    }

    public static void InitObject(ARpg aRpg) {
        aRpg.m_Sort = new CDrawSort();
        aRpg.m_Flag = new CGameFlag();
        aRpg.m_Play = new CPlayData();
        aRpg.m_Enemy = new CEnemy(aRpg);
        aRpg.m_Game = new CGameMain(aRpg);
        aRpg.m_Battle = new CBattleMain(aRpg);
        aRpg.m_Stage = new CStageManage();
        aRpg.m_SysMenu = new CSysMenu();
        aRpg.m_SysMenu.Create(aRpg);
        aRpg.m_MessWin = new CMessWindow();
        aRpg.m_MessWin.Create(aRpg);
        aRpg.m_Fade = new CFadeIn(aRpg);
        CBattleAction.Init(aRpg.m_Battle);
    }

    public static void UseClass() {
        Calc3D.Sin(0.0f);
        new CBattleAction();
        new CBattleEnemy();
        new CCalcBndBox();
        new CBoundingBox();
        new CMoveCorrect();
        new CBattleMain(null);
        new CBtlPlayerStatus();
        new Def();
        new CInShop();
        new CToolShop();
    }

    public static void InitViewPort(CRender3D cRender3D) {
        D3DVIEWPORT8 d3DVIEWPORT8 = new D3DVIEWPORT8();
        d3DVIEWPORT8.X = 0;
        d3DVIEWPORT8.Y = 0;
        d3DVIEWPORT8.Width = 400;
        d3DVIEWPORT8.Height = 320;
        cRender3D.SetViewport(d3DVIEWPORT8);
    }
}

