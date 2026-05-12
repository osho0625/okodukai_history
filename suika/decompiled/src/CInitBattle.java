/*
 * Decompiled with CFR 0.152.
 */
class CInitBattle {
    static final float[][] PLAYER_POS = new float[][]{{0.0f, 0.0f, 0.0f}, {100.0f, -100.0f, 0.0f}, {200.0f, 0.0f, -200.0f}};

    public static void ArrangeEnemy(int n) {
        CEnemyParty cEnemyParty = Vari.m_PrmAll.GetParty(n);
        int n2 = 0;
        while (n2 < cEnemyParty.m_nEnemyNum) {
            CChrWork cChrWork = Vari.m_Char.Search_Enemy();
            CBattleWork cBattleWork = Vari.GetBChrWork(3 + n2);
            cBattleWork.Init();
            cBattleWork.m_Chr = cChrWork;
            int n3 = cEnemyParty.m_anLoadEnemy[n2].m_nKind;
            CChrParam cChrParam = Vari.GetDataPrm(n3);
            CChrParam cChrParam2 = Vari.GetChrPrm(3 + n2);
            cChrParam2.Set(cChrParam);
            cBattleWork.m_Prm = cChrParam2;
            if (n3 == 126) {
                cChrParam2.m_Abi.SetFlagM(116);
            }
            CChrPrm.Set(cChrWork, cChrParam2.m_nPat);
            if (!cBattleWork.m_Prm.m_Abi.GetFlag(149)) {
                cBattleWork.m_vPos.x = cEnemyParty.m_anLoadEnemy[n2].m_fXPos;
                cBattleWork.m_vPos.y = 0.0f;
                cBattleWork.m_vPos.z = 230.0f;
                cBattleWork.SetVect((float)Math.PI);
            } else {
                cBattleWork.m_vPos.x = -400.0f;
                cBattleWork.m_vPos.y = 0.0f;
                cBattleWork.m_vPos.z = 0.0f;
                cBattleWork.SetVect(1.5707964f);
            }
            ++n2;
        }
    }

    public static void Clear() {
        int n = 0;
        do {
            CBattleWork cBattleWork = Vari.GetBChrWork(n);
            cBattleWork.Init();
            cBattleWork.m_Chr = null;
        } while (++n < 9);
    }

    public static void InitPlayer(ARpg aRpg) {
        CInitBattle.Clear();
        Vari.m_Prm.InitBattle();
        int n = Vari.GetPartyNum();
        int n2 = 0;
        while (n2 < n) {
            int n3 = Vari.GetPartyWork(n2);
            CChrWork cChrWork = Vari.GetChrWork(n3);
            CBattleWork cBattleWork = Vari.GetBChrWork(cChrWork.m_nWorkNo);
            cBattleWork.Init();
            cBattleWork.m_Chr = cChrWork;
            cBattleWork.m_Prm = Vari.GetChrPrm(n3);
            cBattleWork.m_vPos.x = PLAYER_POS[n - 1][n2];
            cBattleWork.m_vPos.y = 0.0f;
            cBattleWork.m_vPos.z = -230.0f;
            cBattleWork.SetVect(0.0f);
            ++n2;
        }
    }

    public static void Init(ARpg aRpg, int n) {
        Vari.m_nBtlName = -1;
        aRpg.m_Play.ResetEvtFlag(331);
        Vari.m_SysFlag.ResetFlag(4);
        CInitBattle.InitPlayer(aRpg);
        Vari.GetChrWork(3).ResetFlag(1);
        CInitBattle.ArrangeEnemy(n);
        int n2 = 0;
        do {
            CBattleWork cBattleWork;
            if (!(cBattleWork = Vari.GetBChrWork(n2)).IsAlive()) continue;
            cBattleWork.m_vStart.Set(cBattleWork.m_vPos);
            cBattleWork.InitBattle();
            cBattleWork.m_Chr.SetFlag(1);
        } while (++n2 < 9);
    }

    public static void End(ARpg aRpg) {
        int n = 0;
        while (n < Vari.GetPartyNum()) {
            int n2 = Vari.GetPartyWork(n);
            CBattleWork cBattleWork = Vari.GetBChrWork(n2);
            CChrWork cChrWork = cBattleWork.m_Chr;
            cChrWork.m_vScale.x = 1.0f;
            cChrWork.m_vScale.y = 1.0f;
            cChrWork.m_vScale.z = 1.0f;
            if (cBattleWork.m_Prm.m_nHP == 0) {
                cBattleWork.m_Prm.m_nHP = 1;
            }
            cBattleWork.m_Chr.SetFlag(1);
            ++n;
        }
        aRpg.m_Play.SetPartyDisp();
    }

    CInitBattle() {
    }
}

