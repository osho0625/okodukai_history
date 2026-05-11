/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CBattleActCalc {
    static final int CALC_NORMAL = 0;
    static final int CALC_NODEF = 1;
    static final int CALC_HIT = 2;
    public static CBattleMain m_Btl;
    public static ARpg m_App;
    public static D3DXVECTOR3 m_vStart;

    public static boolean CheckShield(CBattleWork cBattleWork) {
        if (cBattleWork.m_Prm.GetShield() > 0) {
            return true;
        }
        return cBattleWork.m_Prm.m_Abi.GetFlag(108);
    }

    public static void MakeShield(CBattleWork cBattleWork, int n) {
        int n2 = 22;
        if (n == 1) {
            n2 = 23;
        }
        float f = 0.0f;
        if (!cBattleWork.IsPlayer()) {
            f = 1.0f;
        }
        Vari.MakeEffect(n2, cBattleWork.m_vPos, f, cBattleWork.m_Chr.m_fHitSize);
    }

    public static void SetShield(CBattleWork cBattleWork, CBattleWork cBattleWork2) {
        int n = cBattleWork.m_Prm.GetInt();
        int n2 = Calc3D.Rand(n / 2) / 5;
        cBattleWork2.m_Prm.SetShield(n2 += n / 4);
    }

    public static int WeaponAttack(CBattleWork cBattleWork, CBattleWork cBattleWork2, int n, int n2, int n3, int n4, int n5) {
        if (n4 == 0 && !CBattleActCalc.IsSuccess(cBattleWork, cBattleWork2)) {
            m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
            return 0;
        }
        int n6 = CBattleActCalc.CalcWeaponDamage(cBattleWork, cBattleWork2, n, n2, n4);
        n6 = n6 * cBattleWork2.GetAttPer(n3) / 100;
        if (n3 == 0) {
            int n7 = cBattleWork2.m_Prm.GetGolem();
            if (n7 > 0 || cBattleWork2.m_Prm.m_Abi.GetFlag(192)) {
                n6 = 0;
                CBattleActCalc.MakeGolem(cBattleWork2);
                cBattleWork2.m_Prm.SetGolem(n7 - 1);
            } else if (CBattleActCalc.CheckShield(cBattleWork2)) {
                CBattleActCalc.MakeShield(cBattleWork2, 1);
                n6 /= 2;
            }
        }
        if (cBattleWork.GetAura() > 0) {
            n6 = (int)((float)n6 * 1.95f);
        }
        if (n5 == 1) {
            Vari.MakeEffect(0, cBattleWork2.m_vPos, 0.0f, 0.0f);
            m_App.PlaySeG(5);
        }
        CBattleActCalc.Damage(cBattleWork2, n6, n3);
        return n6;
    }

    public static void InstantDead(CBattleWork cBattleWork, CBattleWork cBattleWork2, int n) {
        CAbility cAbility = cBattleWork2.m_Prm.m_Abi;
        if (!cAbility.GetFlag(94) && !cAbility.GetFlag(133) && CBattleActCalc.IsSuccessSkill(cBattleWork, cBattleWork2, n)) {
            CBattleActCalc.Damage(cBattleWork2, 9999, 7);
            return;
        }
        m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
    }

    public static void MakeGolem(CBattleWork cBattleWork) {
        float f = 0.0f;
        if (!cBattleWork.IsPlayer()) {
            f = 1.0f;
        }
        Vari.MakeEffect(111, cBattleWork.m_vPos, f, cBattleWork.m_Chr.m_fHitSize);
    }

    CBattleActCalc() {
    }

    public static void ReviveChr(CBattleWork cBattleWork) {
        float[] fArray = new float[]{0.05f, 0.1f, 0.15f, 0.2f, 0.25f, 0.3f, 0.4f, 0.55f, 0.7f, 0.85f, 1.0f};
        float[] fArray2 = new float[]{7.5f, 6.4f, 5.4f, 4.5f, 3.7f, 3.0f, 2.4f, 1.9f, 1.5f, 1.2f, 1.0f};
        float f = CChrPrm.GetScale(cBattleWork.m_Prm.m_nPat);
        cBattleWork.m_Chr.ResetFlag(8);
        cBattleWork.m_Chr.SetFlag(1);
        cBattleWork.InitZPos();
        int n = 0;
        do {
            cBattleWork.m_Chr.m_vScale.x = fArray[n] * f;
            cBattleWork.m_Chr.m_vScale.y = fArray2[n] * f;
            cBattleWork.m_Chr.m_vScale.z = fArray[n] * f;
            m_Btl.LoopFrame(1);
            if (n != 7) continue;
            CEfcWork.MakeLightDrop(32, cBattleWork.m_vPos, 2.0f);
        } while (++n <= 10);
    }

    public static boolean IsSuccessSkill(CBattleWork cBattleWork, CBattleWork cBattleWork2, int n) {
        int n2;
        int n3 = cBattleWork.m_Prm.GetDex();
        int n4 = cBattleWork2.m_Prm.GetDex();
        int n5 = n3 + Calc3D.Rand(n3 * n) / 10;
        return n5 >= (n2 = n4 + Calc3D.Rand(n4));
    }

    public static void Confusion(CBattleWork cBattleWork, CBattleWork cBattleWork2, int n) {
        CAbility cAbility = cBattleWork2.m_Prm.m_Abi;
        if (!cAbility.GetFlag(93) && !cAbility.GetFlag(133) && CBattleActCalc.IsSuccessSkill(cBattleWork, cBattleWork2, n)) {
            m_App.RecTextObj("\u6df7\u4e71", cBattleWork2.m_vPos, Color.white);
            cBattleWork2.m_Prm.SetConf(2 + Calc3D.Rand(7));
            cBattleWork2.m_Chr.m_nDisp |= 0x20;
            return;
        }
        m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
    }

    public static int GetGroupAgi(int n) {
        int n2 = CBattleActCalc.GetGroupStart(n);
        int n3 = CBattleActCalc.GetGroupEnd(n);
        int n4 = 0;
        int n5 = n2;
        while (n5 < n3) {
            CBattleWork cBattleWork = Vari.GetBChrWork(n5);
            if (cBattleWork.IsAttack()) {
                n4 += cBattleWork.m_Prm.GetAgi();
            }
            ++n5;
        }
        return n4;
    }

    public static void AllDamage(int n, int n2, int n3) {
        int n4 = CBattleActCalc.GetGroupStart(n);
        int n5 = CBattleActCalc.GetGroupEnd(n);
        int n6 = n4;
        while (n6 < n5) {
            CBattleWork cBattleWork = Vari.GetBChrWork(n6);
            if (cBattleWork.IsAttack()) {
                int n7 = n2 * cBattleWork.GetAttPer(n3) / 100;
                CBattleActCalc.Damage(cBattleWork, n7, n3);
            }
            ++n6;
        }
    }

    public static void Steal(CBattleWork cBattleWork, CBattleWork cBattleWork2, int n) {
        Vari.MakeEffect(31, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), cBattleWork2.m_Chr.m_fHitSize);
        m_Btl.LoopFrame(4);
        int n2 = CBattleActCalc.IsSuccessSteal(cBattleWork, cBattleWork2, n);
        if (n2 == 0) {
            m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
            m_Btl.LoopFrame(4);
            return;
        }
        int n3 = 0;
        if (n2 == 1) {
            n3 = cBattleWork2.m_Prm.m_nItem1;
            if (n3 != 0) {
                CBattleActCalc.m_App.m_Play.AddItem(n3, 1);
                cBattleWork2.m_Prm.m_nItem1 = 0;
                cBattleWork2.m_Prm.m_nItem2 = 0;
            }
        } else {
            n3 = cBattleWork2.m_Prm.m_nItem2;
            if (n3 != 0) {
                CBattleActCalc.m_App.m_Play.AddItem(n3, 1);
                cBattleWork2.m_Prm.m_nItem1 = 0;
                cBattleWork2.m_Prm.m_nItem2 = 0;
            }
        }
        if (n3 != 0) {
            CItemData cItemData = Vari.GetItemData(n3);
            String string = new String();
            string = "\u300c";
            string = string + cItemData.m_strName;
            string = string + "\u300d\u3092\u76d7\u3093\u3060\uff01";
            CBattleActCalc.m_Btl.m_SkillWin.OpenWindow(string);
        } else {
            m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
        }
        m_Btl.LoopFrame(4);
    }

    public static int SelectGroup1(int n) {
        int n2;
        CBattleWork cBattleWork;
        int n3 = CBattleActCalc.GetGroupStart(n);
        int n4 = CBattleActCalc.GetGroupEnd(n);
        if (CBattleActCalc.CountAliveGroup(n) == 0) {
            return -1;
        }
        while (!(cBattleWork = Vari.GetBChrWork(n2 = Calc3D.Rand(n4 - n3) + n3)).IsAttack()) {
        }
        return n2;
    }

    public static int GetMyGroupStart(CBattleWork cBattleWork) {
        if (cBattleWork.m_nWorkNo < 3) {
            return 0;
        }
        return 3;
    }

    public static int GetGroupDex(int n) {
        int n2 = CBattleActCalc.GetGroupStart(n);
        int n3 = CBattleActCalc.GetGroupEnd(n);
        int n4 = 0;
        int n5 = n2;
        while (n5 < n3) {
            CBattleWork cBattleWork = Vari.GetBChrWork(n5);
            if (cBattleWork.IsAttack()) {
                n4 += cBattleWork.m_Prm.GetDex();
            }
            ++n5;
        }
        return n4;
    }

    public static void Paralysis(CBattleWork cBattleWork, CBattleWork cBattleWork2, int n) {
        CAbility cAbility = cBattleWork2.m_Prm.m_Abi;
        if (!cAbility.GetFlag(91) && !cAbility.GetFlag(133) && CBattleActCalc.IsSuccessSkill(cBattleWork, cBattleWork2, n)) {
            m_App.RecTextObj("\u505c\u6b62", cBattleWork2.m_vPos, Color.white);
            cBattleWork2.SetPara(2 + Calc3D.Rand(4));
            return;
        }
        m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
    }

    public static int CalcWeaponDamage(CBattleWork cBattleWork, CBattleWork cBattleWork2, int n, int n2, int n3) {
        int n4;
        int n5 = cBattleWork.m_Prm.GetStr();
        int n6 = cBattleWork2.m_Prm.GetDef();
        int n7 = n5 * (n5 / 2) + n5 * 3;
        int n8 = n6 / 2 * (n6 / 3) + n6;
        int n9 = Calc3D.Rand(75) + 225;
        n7 = n7 * n / 100;
        n7 += n2;
        if (cBattleWork2.m_Prm.m_Abi.GetFlag(138)) {
            n8 += 20000;
        }
        if (n3 == 1) {
            n8 = 0;
            n9 = Calc3D.Rand(20) + 280 + 50;
        }
        if ((n4 = (n7 - n8) * n9 / 1000) <= 0) {
            int n10 = cBattleWork.m_Prm.GetDex() * 2 - cBattleWork2.m_Prm.GetDex();
            n4 = n10 <= 0 ? 0 : (Calc3D.Rand(n10 * n10) >= Calc3D.Rand(-n4 / 5) ? 1 : 0);
        }
        n4 = CBattleActCalc.MonkeyCalc(cBattleWork, cBattleWork2, n4);
        return n4;
    }

    public static void MagicAttack(CBattleWork cBattleWork, CBattleWork cBattleWork2, int n, int n2, int n3) {
        int n4 = cBattleWork.m_Prm.GetInt();
        int n5 = cBattleWork2.m_Prm.GetInt();
        int n6 = n4 * (n4 / 2) + n4 * 2;
        int n7 = n5 * (n5 / 3) + n5 * 4;
        n6 *= n;
        int n8 = ((n6 += n2 * 100) * 2 - (n7 *= 100)) * (Calc3D.Rand(50) + 150) / 100000;
        if (n8 < 0) {
            n8 = 0;
        }
        n8 = n8 * cBattleWork2.GetAttPer(n3) / 100;
        if (cBattleWork2.m_Prm.m_Abi.GetFlag(138)) {
            n8 = 0;
        }
        n8 = CBattleActCalc.MonkeyCalc(cBattleWork, cBattleWork2, n8);
        CBattleActCalc.Damage(cBattleWork2, n8, n3);
    }

    public static void AllWeaponAttack(CBattleWork cBattleWork, int n, int n2, int n3, int n4, int n5) {
        int n6 = CBattleActCalc.GetGroupStart(n);
        int n7 = CBattleActCalc.GetGroupEnd(n);
        int n8 = n6;
        while (n8 < n7) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n8);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, n2, n3, n4, n5, 0);
            }
            ++n8;
        }
    }

    public static int IsSuccessSteal(CBattleWork cBattleWork, CBattleWork cBattleWork2, int n) {
        int n2 = cBattleWork.m_Prm.GetDex() * n;
        int n3 = cBattleWork2.m_Prm.GetDex() * 100;
        int n4 = n2 + Calc3D.Rand(n2);
        CAbility cAbility = cBattleWork.m_Prm.m_Abi;
        if (cAbility.GetFlag(105)) {
            n4 += n4 >> 1;
        }
        int n5 = n3 * 3 + Calc3D.Rand(n3) * 2;
        if (cAbility.GetFlag(102)) {
            n5 -= n5 >> 2;
        }
        if (n4 > n5) {
            return 2;
        }
        n5 = (int)((float)n3 * 1.5f) + Calc3D.Rand(n3) * 2;
        if (n4 > n5) {
            return 1;
        }
        return 0;
    }

    public static void CurePoison(CBattleWork cBattleWork) {
        if (cBattleWork.m_Prm.GetPoison()) {
            cBattleWork.ResetPoison();
            return;
        }
        m_App.RecTextObj("\u30df\u30b9", cBattleWork.m_vPos, Color.white);
    }

    public static void MakeAShield(CBattleWork cBattleWork, int n) {
        int n2 = 97;
        if (n == 1) {
            n2 = 98;
        }
        float f = 0.0f;
        if (!cBattleWork.IsPlayer()) {
            f = 1.0f;
        }
        Vari.MakeEffect(n2, cBattleWork.m_vPos, f, cBattleWork.m_Chr.m_fHitSize);
    }

    public static void Poison(CBattleWork cBattleWork, CBattleWork cBattleWork2) {
        CAbility cAbility = cBattleWork2.m_Prm.m_Abi;
        if (!cAbility.GetFlag(92) && !cAbility.GetFlag(133) && CBattleActCalc.IsSuccessSkill(cBattleWork, cBattleWork2, 20)) {
            m_App.RecTextObj("\u6bd2", cBattleWork2.m_vPos, Color.white);
            cBattleWork2.m_Prm.SetPoison();
            cBattleWork2.m_Chr.m_nDisp |= 0x10;
            return;
        }
        m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
    }

    public static void SetNumberObject(CBattleWork cBattleWork, int n, int n2) {
        Color color;
        String string;
        if (n > 0 || n2 == 2) {
            string = Calc3D.NumberString2(n, 4);
            color = Color.green;
        } else {
            string = Calc3D.NumberString2(-n, 4);
            color = Color.white;
        }
        if (n2 == 1) {
            string = "\u2605" + string;
        } else if (n2 == 3) {
            string = "\uff2d" + string;
        }
        m_App.RecTextObj(string, cBattleWork.m_vPos, color);
    }

    public static void MagicHeal(CBattleWork cBattleWork, CBattleWork cBattleWork2, int n) {
        cBattleWork.m_Prm.GetInt();
        int n2 = CSkillCalc.Calc_IntHeal(cBattleWork.m_Prm, n);
        n2 = n2 * n / 100;
        if (n2 > 9999) {
            n2 = 9999;
        }
        cBattleWork2.AddHP(n2);
        CBattleActCalc.SetNumberObject(cBattleWork2, n2, 0);
    }

    public static void Stone(CBattleWork cBattleWork, CBattleWork cBattleWork2, int n) {
        CAbility cAbility = cBattleWork2.m_Prm.m_Abi;
        if (!cAbility.GetFlag(133) && !cBattleWork2.IsSuika() && CBattleActCalc.IsSuccessSkill(cBattleWork, cBattleWork2, n)) {
            m_App.RecTextObj("\u77f3\u5316", cBattleWork2.m_vPos, Color.white);
            cBattleWork2.SetStone();
            return;
        }
        m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
    }

    public static void MakeWShield(CBattleWork cBattleWork, int n) {
        int n2 = 34;
        if (n == 1) {
            n2 = 35;
        }
        float f = 0.0f;
        if (!cBattleWork.IsPlayer()) {
            f = 1.0f;
        }
        Vari.MakeEffect(n2, cBattleWork.m_vPos, f, cBattleWork.m_Chr.m_fHitSize);
    }

    public static void Damage(CBattleWork cBattleWork, int n, int n2) {
        if (n > 9999) {
            n = 9999;
        }
        cBattleWork.AddHP(-n);
        m_Btl.CheckDead();
        int n3 = 0;
        if (cBattleWork.IsWeek(n2)) {
            n3 = 1;
        }
        CBattleActCalc.SetNumberObject(cBattleWork, -n, n3);
    }

    public static int GetMyGroupEnd(CBattleWork cBattleWork) {
        if (cBattleWork.m_nWorkNo < 3) {
            return 3;
        }
        return 9;
    }

    static {
        m_vStart = new D3DXVECTOR3();
    }

    public static void PoisonAttack(CBattleWork cBattleWork) {
        int n = cBattleWork.m_Prm.GetMaxHP();
        int n2 = n * (Calc3D.Rand(50) + 50) / 1200;
        cBattleWork.AddHP(-n2);
        m_Btl.CheckDead();
        CBattleActCalc.SetNumberObject(cBattleWork, -n2, 0);
    }

    public static void AllMagicAttack(CBattleWork cBattleWork, int n, int n2, int n3, int n4) {
        int n5 = CBattleActCalc.GetGroupStart(n);
        int n6 = CBattleActCalc.GetGroupEnd(n);
        int n7 = n5;
        while (n7 < n6) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n7);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.MagicAttack(cBattleWork, cBattleWork2, n2, n3, n4);
            }
            ++n7;
        }
    }

    public static int CountAliveGroup(int n) {
        int n2 = CBattleActCalc.GetGroupStart(n);
        int n3 = CBattleActCalc.GetGroupEnd(n);
        int n4 = 0;
        int n5 = n2;
        while (n5 < n3) {
            CBattleWork cBattleWork = Vari.GetBChrWork(n5);
            if (cBattleWork.IsAttack()) {
                ++n4;
            }
            ++n5;
        }
        return n4;
    }

    public static void Blind(CBattleWork cBattleWork, CBattleWork cBattleWork2) {
        CAbility cAbility = cBattleWork2.m_Prm.m_Abi;
        if (!cAbility.GetFlag(133) && CBattleActCalc.IsSuccessSkill(cBattleWork, cBattleWork2, 20)) {
            cBattleWork2.m_Prm.SetBlind(3 + Calc3D.Rand(5));
            return;
        }
        m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
    }

    public static int GetGroupEnd(int n) {
        if (n == 101) {
            return 3;
        }
        return 9;
    }

    public static int CalcItemHeal(int n) {
        int n2 = Calc3D.Rand(50) + 75;
        return n * n2 / 100;
    }

    public static int MonkeyCalc(CBattleWork cBattleWork, CBattleWork cBattleWork2, int n) {
        if (cBattleWork2.m_Prm.m_Abi.GetFlag(161)) {
            if (!cBattleWork.m_Prm.m_Abi.GetFlag(162)) {
                return 0;
            }
            return (int)((float)n * 1.5f);
        }
        return n;
    }

    public static boolean IsSuccess(CBattleWork cBattleWork, CBattleWork cBattleWork2) {
        int n;
        int n2 = cBattleWork.m_Prm.GetDex();
        int n3 = cBattleWork2.m_Prm.GetDex();
        int n4 = n2 + Calc3D.Rand(n2 * 2);
        return n4 >= (n = n3 / 2 + Calc3D.Rand(n3));
    }

    public static int GetGroupStart(int n) {
        if (n == 101) {
            return 0;
        }
        return 3;
    }
}

