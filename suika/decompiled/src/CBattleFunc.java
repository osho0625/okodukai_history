/*
 * Decompiled with CFR 0.152.
 */
class CBattleFunc {
    public static void WhiteOut(int n) {
        int n2 = 0;
        while (n2 < n) {
            Vari.m_App.m_Render.SetWhite(1.0f - 1.0f * (float)n2 / (float)n);
            Vari.m_App.m_Battle.LoopFrame(1);
            ++n2;
        }
        Vari.m_App.m_Render.SetWhite(0.0f);
    }

    public static void WhiteIn(int n) {
        int n2 = 0;
        while (n2 < n) {
            Vari.m_App.m_Render.SetWhite(1.0f * (float)n2 / (float)n);
            Vari.m_App.m_Battle.LoopFrame(1);
            ++n2;
        }
        Vari.m_App.m_Render.SetWhite(1.0f);
    }

    public static int GetDexAverage(int n) {
        int n2 = 0;
        int n3 = 3;
        if (n == 1) {
            n2 = 3;
            n3 = 9;
        }
        int n4 = 0;
        int n5 = 0;
        int n6 = n2;
        while (n6 < n3) {
            CBattleWork cBattleWork = Vari.GetBChrWork(n6);
            if (cBattleWork.IsUse()) {
                n4 += cBattleWork.m_Prm.GetDex();
                ++n5;
            }
            ++n6;
        }
        if (n5 == 0) {
            return 0;
        }
        return n4 / n5;
    }

    public static boolean CanEventChr(CBattleWork cBattleWork) {
        if (cBattleWork.m_Prm.GetHP() == 0) {
            return false;
        }
        if (cBattleWork.m_Prm.GetPara() != 0) {
            return false;
        }
        return cBattleWork.m_Prm.GetConf() == 0;
    }

    CBattleFunc() {
    }

    public static boolean IsPartyAbility(int n) {
        int n2 = 0;
        do {
            CAbility cAbility;
            CBattleWork cBattleWork;
            if (!(cBattleWork = Vari.GetBChrWork(n2)).IsUse() || !(cAbility = cBattleWork.m_Prm.m_Abi).GetFlag(n)) continue;
            return true;
        } while (++n2 < 3);
        return false;
    }

    public static void FadeOut(int n) {
        int n2 = 0;
        while (n2 < n) {
            Vari.m_App.m_Render.SetBright(1.0f - 1.0f * (float)n2 / (float)n);
            Vari.m_App.m_Battle.LoopFrame(1);
            ++n2;
        }
        Vari.m_App.m_Render.SetBright(0.0f);
    }

    public static void FadeIn(int n) {
        int n2 = 0;
        while (n2 < n) {
            Vari.m_App.m_Render.SetBright(1.0f * (float)n2 / (float)n);
            Vari.m_App.m_Battle.LoopFrame(1);
            ++n2;
        }
        Vari.m_App.m_Render.SetBright(1.0f);
    }
}

