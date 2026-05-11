/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CBattleActItem
extends CBattleActEfc {
    CBattleActItem() {
    }

    public static void Algo_103(CBattleWork cBattleWork, CAction cAction) {
        CItemData cItemData = Vari.GetItemData(cAction.m_nItem);
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActItem.DrawItemName(cItemData);
        Vari.MakeEffect(11, cBattleWork2.m_vPos, 0.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleActCalc.CurePoison(cBattleWork2);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void DrawItemName(CItemData cItemData) {
        if (!Vari.GetSysFlag(2)) {
            CBattleActCalc.m_Btl.m_SkillWin.OpenWindow(cItemData.m_strName);
        }
    }

    public static void Algo_112(CBattleWork cBattleWork, CAction cAction) {
        CItemData cItemData = Vari.GetItemData(cAction.m_nItem);
        CBattleActItem.DrawItemName(cItemData);
        CBattleActCalc.m_Btl.LoopFrame(4);
        float f = 0.0f;
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        if (cAction.m_nObj == 101) {
            d3DXVECTOR3.z = -230.0f;
        } else {
            d3DXVECTOR3.z = 230.0f;
            f = (float)Math.PI;
        }
        int n = 0;
        do {
            Vari.MakeEffect(29, d3DXVECTOR3, 0.0f, 0.0f);
            Vari.MakeEffect(29, d3DXVECTOR3, 0.0f, 0.0f);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 8);
        CBattleActCalc.AllMagicAttack(cBattleWork, cAction.m_nObj, 50, 1200, 2);
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_110(CBattleWork cBattleWork, CAction cAction) {
        CItemData cItemData = Vari.GetItemData(cAction.m_nItem);
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActItem.DrawItemName(cItemData);
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleActEfc.MakeClock(cBattleWork2.m_vPos, true);
        CBattleActCalc.m_Btl.LoopFrame(2);
        CBattleActCalc.Paralysis(cBattleWork, cBattleWork2, 85);
    }

    public static void Algo_106(CBattleWork cBattleWork, CAction cAction) {
        CItemData cItemData = Vari.GetItemData(cAction.m_nItem);
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActItem.DrawItemName(cItemData);
        Vari.MakeEffect(10, cBattleWork2.m_vPos, 0.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(8);
        if (cBattleWork2.IsAlive()) {
            CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
        } else {
            CBattleActCalc.ReviveChr(cBattleWork2);
            int n = cBattleWork2.m_Prm.GetMaxHP();
            n = cBattleWork.m_Prm.m_Abi.GetFlag(104) ? (n /= 2) : (n /= 4);
            cBattleWork2.m_Prm.AddHP(n);
            CBattleActCalc.SetNumberObject(cBattleWork2, n, 0);
        }
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_111(CBattleWork cBattleWork, CAction cAction) {
        CItemData cItemData = Vari.GetItemData(cAction.m_nItem);
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActItem.DrawItemName(cItemData);
        CBattleActCalc.m_Btl.LoopFrame(4);
        Vari.MakeEffect(16, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_App.PlaySeG(12);
        CBattleActCalc.m_Btl.LoopFrame(16);
        CBattleActCalc.Confusion(cBattleWork, cBattleWork2, 15);
    }

    public static void Algo_102(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2;
        CItemData cItemData = Vari.GetItemData(cAction.m_nItem);
        CBattleActItem.DrawItemName(cItemData);
        int n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n;
        while (n3 < n2) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAlive()) {
                Vari.MakeEffect(24, cBattleWork2.m_vPos, 1.0f, cBattleWork2.m_Chr.m_fHitSize);
            }
            ++n3;
        }
        CBattleActCalc.m_App.PlaySeG(10);
        CBattleActCalc.m_Btl.LoopFrame(8);
        n3 = n;
        while (n3 < n2) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAlive()) {
                int n4 = CBattleActItem.CalcItemHeal(cBattleWork, cItemData.m_nEffect);
                cBattleWork2.m_Prm.AddHP(n4);
                CBattleActCalc.SetNumberObject(cBattleWork2, n4, 0);
            }
            ++n3;
        }
        CBattleActCalc.m_Btl.LoopFrame(4);
        Vari.HealFlag(cBattleWork.m_nWorkNo);
    }

    public static boolean UseItem(CBattleWork cBattleWork, CAction cAction) {
        switch (cAction.m_nAlgo) {
            case 2001: {
                CBattleActItem.Algo_101(cBattleWork, cAction);
                return true;
            }
            case 2002: {
                CBattleActItem.Algo_102(cBattleWork, cAction);
                return true;
            }
            case 2003: {
                CBattleActItem.Algo_103(cBattleWork, cAction);
                return true;
            }
            case 2006: {
                CBattleActItem.Algo_106(cBattleWork, cAction);
                return true;
            }
            case 2010: {
                CBattleActItem.Algo_110(cBattleWork, cAction);
                return true;
            }
            case 2011: {
                CBattleActItem.Algo_111(cBattleWork, cAction);
                return true;
            }
            case 2012: {
                CBattleActItem.Algo_112(cBattleWork, cAction);
                return true;
            }
            case 2013: {
                CBattleActItem.Algo_113(cBattleWork, cAction);
                return true;
            }
        }
        return false;
    }

    public static int CalcItemHeal(CBattleWork cBattleWork, int n) {
        int n2 = n;
        if (cBattleWork.m_Prm.m_Abi.GetFlag(104)) {
            n2 *= 2;
        }
        return CBattleActCalc.CalcItemHeal(n2);
    }

    public static void Algo_101(CBattleWork cBattleWork, CAction cAction) {
        CItemData cItemData = Vari.GetItemData(cAction.m_nItem);
        CBattleActItem.DrawItemName(cItemData);
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        Vari.MakeEffect(24, cBattleWork2.m_vPos, 2.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_App.PlaySeG(10);
        CBattleActCalc.m_Btl.LoopFrame(8);
        int n = CBattleActItem.CalcItemHeal(cBattleWork, cItemData.m_nEffect);
        cBattleWork2.m_Prm.AddHP(n);
        CBattleActCalc.SetNumberObject(cBattleWork2, n, 0);
        CBattleActCalc.m_Btl.LoopFrame(4);
        Vari.HealFlag(cBattleWork.m_nWorkNo);
    }

    public static void Algo_113(CBattleWork cBattleWork, CAction cAction) {
        CAbility cAbility;
        CItemData cItemData = Vari.GetItemData(cAction.m_nItem);
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActItem.DrawItemName(cItemData);
        CBattleActCalc.m_Btl.LoopFrame(4);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(cBattleWork2.m_vPos);
        d3DXVECTOR3.y = 225.0f;
        Vari.MakeEffect(67, d3DXVECTOR3, 0.0f, 0.0f);
        int n = 0;
        do {
            Vari.MakeEffect(83, d3DXVECTOR3, 1.0f, 0.0f);
            Vari.MakeEffect(83, d3DXVECTOR3, 1.0f, 0.0f);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 12);
        CBattleActCalc.m_Btl.LoopFrame(4);
        n = cBattleWork2.m_Prm.GetHP() / 2;
        if (n > 9999) {
            n = 9999;
        }
        if ((cAbility = cBattleWork2.m_Prm.m_Abi).GetFlag(133) || cAbility.GetFlag(138)) {
            CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
        } else {
            CBattleActCalc.Damage(cBattleWork2, n, 7);
            CBattleActCalc.m_Btl.CheckDead();
        }
        CBattleActCalc.m_Btl.LoopFrame(8);
    }
}

