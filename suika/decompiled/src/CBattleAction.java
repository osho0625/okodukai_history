/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CBattleAction
extends CBattleActItem {
    public static void Algo_038(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        CBattleActEfc.EfcHoly(cBattleWork, cAction);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_063(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        int n = 102;
        int n2 = 101;
        if (cBattleWork2.IsPlayer()) {
            n = 101;
            n2 = 102;
        }
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(2);
        Vari.MakeEffect(77, cBattleWork.m_vPos, n, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(2);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
        CBattleActEfc.MakeAirEffect(cBattleWork2);
        CBattleActCalc.m_Btl.LoopFrame(2);
        CBattleActCalc.AllWeaponAttack(cBattleWork, n, 60, 0, 2, 0);
        CAction cAction2 = new CAction();
        cAction2.m_nObj = n2;
        CBattleActEfc.WindHeal(cBattleWork, cAction2, 140);
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(2);
        CBattleActEfc.MoveBack(cBattleWork);
    }

    public static void Algo_113(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        CBattleActCalc.m_App.PlaySeG(10);
        Vari.MakeEffect(117, cBattleWork2.m_vPos, 0.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(8);
        if (cBattleWork2.m_Prm.GetPoison()) {
            cBattleWork2.ResetPoison();
        }
        if (cBattleWork2.m_Prm.GetConf() > 0) {
            cBattleWork2.ResetConfusion();
        }
        cBattleWork2.ResetStone();
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_160(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.m_App.PlaySeG(16);
        Vari.MakeEffect(87, cBattleWork2.m_vPos, 0.0f, 0.0f);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 140, 0, 0, 1, 0);
        CBattleActCalc.m_App.m_Render.SetWhite(0.5f);
        CBattleActCalc.m_Btl.LoopFrame(1);
        CBattleActCalc.m_App.m_Render.SetWhite(1.0f);
        CBattleActCalc.m_Btl.LoopFrame(1);
        CBattleActCalc.m_App.m_Render.SetWhite(0.5f);
        CBattleActCalc.m_Btl.LoopFrame(1);
        CBattleActCalc.m_App.m_Render.SetWhite(0.0f);
        CBattleActCalc.m_Btl.LoopFrame(5);
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_998(CBattleWork cBattleWork, CAction cAction) {
        CSkillData cSkillData = Vari.GetSkillData(173);
        CBattleActCalc.m_Btl.m_SkillWin.OpenWindow(cSkillData.m_strName);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActEfc.MoveBackHop(cBattleWork);
    }

    public static void Algo_077(CBattleWork cBattleWork, CAction cAction) {
        CBattleActCalc.m_Btl.LoopFrame(6);
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        int n = 0;
        do {
            Vari.MakeEffect(48, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), 0.0f);
            CBattleActCalc.m_Btl.LoopFrame(4);
        } while (++n < 3);
        CBattleActCalc.m_Btl.LoopFrame(8);
        n = 9999 * cBattleWork2.GetAttPer(2) / 100;
        CBattleActCalc.Damage(cBattleWork2, n, 2);
        CBattleActCalc.m_Btl.LoopFrame(4);
    }

    public static void Algo_002(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2;
        int n;
        int n2 = CBattleActCalc.GetGroupStart(101);
        int n3 = CBattleActCalc.GetGroupEnd(101);
        int n4 = 0;
        do {
            n = n2;
            while (n < n3) {
                cBattleWork2 = Vari.GetBChrWork(n);
                if (cBattleWork2.IsAttack()) {
                    cBattleWork2.AddVect(Calc3D.DEGtoRAD(30.0f));
                }
                ++n;
            }
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n4 < 6);
        CBattleActCalc.m_Btl.LoopFrame(8);
        n4 = CBattleActCalc.GetGroupDex(101) + CBattleActCalc.GetGroupAgi(101);
        n = CBattleActCalc.GetGroupDex(102) + CBattleActCalc.GetGroupAgi(102);
        int n5 = n4 + Calc3D.Rand(n4 * 2);
        int n6 = n + Calc3D.Rand(n * 2);
        if (CBattleActCalc.m_Btl.CanRunaway() && n5 >= n6) {
            int n7 = 0;
            do {
                int n8 = n2;
                while (n8 < n3) {
                    cBattleWork2 = Vari.GetBChrWork(n8);
                    if (cBattleWork2.IsAttack()) {
                        cBattleWork2.m_vPos.z -= 35.0f;
                    }
                    ++n8;
                }
                CBattleActCalc.m_Btl.LoopFrame(1);
            } while (++n7 < 20);
            CBattleActCalc.m_Btl.SetRunaway();
            return;
        }
        int n9 = 0;
        do {
            int n10 = n2;
            while (n10 < n3) {
                cBattleWork2 = Vari.GetBChrWork(n10);
                if (cBattleWork2.IsAttack()) {
                    cBattleWork2.AddVect(Calc3D.DEGtoRAD(30.0f));
                }
                ++n10;
            }
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n9 < 6);
    }

    public static void Algo_030(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        Vari.MakeEffect(24, cBattleWork2.m_vPos, 2.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_App.PlaySeG(10);
        CBattleActCalc.m_Btl.LoopFrame(12);
        CBattleActCalc.MagicHeal(cBattleWork, cBattleWork2, 85);
        CBattleActCalc.m_Btl.LoopFrame(8);
        Vari.HealFlag(cBattleWork.m_nWorkNo);
    }

    public static void Algo_051(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.Vampire(cBattleWork, cBattleWork2);
        CBattleActCalc.m_Btl.LoopFrame(8);
        Vari.HealFlag(cBattleWork.m_nWorkNo);
    }

    public static void Algo_412(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MakeUltiEffect(2);
        CBattleActCalc.AllDamage(cAction.m_nObj, 9999, 2);
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleActEfc.ResetAbLightColor();
    }

    public static void Algo_023(CBattleWork cBattleWork, CAction cAction) {
        D3DXVECTOR3 d3DXVECTOR3 = CBattleActEfc.GetOnmyoCenter(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        Vari.MakeEffect(5, d3DXVECTOR3, CBattleActEfc.GetOnmyoVect(cAction.m_nObj), 100.0f);
        CBattleActCalc.m_Btl.LoopFrame(5);
        CBattleActCalc.m_App.PlaySeG(4);
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

    public static void Algo_108(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
        CBattleAction.Algo_059(cBattleWork, cAction);
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_092(CBattleWork cBattleWork, CAction cAction) {
        Vari.MakeEffect(1, cBattleWork.m_vPos, 0.0f, cBattleWork.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(16);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(250.0f, 0.0f, 130.0f);
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3(-250.0f, 0.0f, 130.0f);
        CEfcWork cEfcWork = Vari.MakeEffect(86, d3DXVECTOR3, 0.0f, 0.0f);
        CEfcWork cEfcWork2 = Vari.MakeEffect(86, d3DXVECTOR32, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(16);
        CAction cAction2 = new CAction();
        Vari.MakeEffect(1, d3DXVECTOR3, 0.0f, 50.0f);
        CBattleActCalc.m_Btl.LoopFrame(12);
        cAction2.m_nObj = CBattleActCalc.SelectGroup1(cAction.m_nObj);
        CBattleActEfc.EfcHoly(cBattleWork, cAction2);
        Vari.MakeEffect(1, d3DXVECTOR32, 0.0f, 50.0f);
        CBattleActCalc.m_Btl.LoopFrame(12);
        cAction2.m_nObj = CBattleActCalc.SelectGroup1(cAction.m_nObj);
        CBattleActEfc.EfcHoly(cBattleWork, cAction2);
        cEfcWork.m_nCount = 1000;
        cEfcWork2.m_nCount = 1000;
        CBattleActCalc.m_Btl.LoopFrame(5);
    }

    public static void Algo_037(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2;
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        int n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n;
        while (n3 < n2) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                Vari.MakeEffect(24, cBattleWork2.m_vPos, 1.0f, cBattleWork2.m_Chr.m_fHitSize);
            }
            ++n3;
        }
        CBattleActCalc.m_App.PlaySeG(10);
        CBattleActCalc.m_Btl.LoopFrame(8);
        n3 = n;
        while (n3 < n2) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.MagicHeal(cBattleWork, cBattleWork2, 50);
            }
            ++n3;
        }
        CBattleActCalc.m_Btl.LoopFrame(4);
        Vari.HealFlag(cBattleWork.m_nWorkNo);
    }

    public static void Algo_016(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.RandAttack(cBattleWork, cAction, 2, 4);
    }

    public static void Algo_120(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2;
        int n;
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.y = 250.0f;
        d3DXVECTOR3.z = cAction.m_nObj == 101 ? -120.0f : 120.0f;
        CBattleActCalc.m_App.PlaySeG(17);
        Vari.MakeEffect(63, d3DXVECTOR3, 0.2f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(4);
        Vari.MakeEffect(63, d3DXVECTOR3, -0.4f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(6);
        Vari.MakeEffect(62, d3DXVECTOR3, cAction.m_nObj, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(8);
        int n2 = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n3 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n4 = 0;
        do {
            n = n2;
            while (n < n3) {
                cBattleWork2 = Vari.GetBChrWork(n);
                if (cBattleWork2.IsAttack()) {
                    cBattleWork2.m_Chr.m_vScale.y -= 0.1f;
                }
                ++n;
            }
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n4 < 8);
        n4 = 0;
        do {
            n = n2;
            while (n < n3) {
                cBattleWork2 = Vari.GetBChrWork(n);
                if (cBattleWork2.IsAttack()) {
                    cBattleWork2.m_Chr.m_vScale.y += 0.1f;
                }
                ++n;
            }
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n4 < 8);
        n = n2;
        while (n < n3) {
            cBattleWork2 = Vari.GetBChrWork(n);
            if (cBattleWork2.IsAttack()) {
                n4 = cBattleWork2.m_Prm.GetHP() / 2;
                CBattleActCalc.Damage(cBattleWork2, n4, 7);
            }
            ++n;
        }
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_003(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActCalc.Steal(cBattleWork, cBattleWork2, 100);
        CBattleActEfc.MoveBack(cBattleWork);
    }

    public static void Algo_205_02(CBattleWork cBattleWork, CAction cAction) {
        int n = 102;
        if (!cBattleWork.IsPlayer()) {
            n = 101;
        }
        int n2 = CBattleActCalc.GetGroupStart(n);
        int n3 = CBattleActCalc.GetGroupEnd(n);
        CAction cAction2 = new CAction();
        int n4 = n2;
        while (n4 < n3) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n4);
            if (cBattleWork2.IsAttack()) {
                cAction2.m_nObj = n4;
                CBattleAction.Algo_062(cBattleWork, cAction2);
            }
            ++n4;
        }
    }

    public static void Algo_100(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(cBattleWork2.m_vPos);
        d3DXVECTOR3.y = 100.0f;
        float f = (float)Math.PI;
        if (cBattleWork2.IsPlayer()) {
            d3DXVECTOR3.z += 200.0f;
        } else {
            d3DXVECTOR3.z -= 200.0f;
            f = 0.0f;
        }
        CBattleActCalc.m_App.PlaySeG(28);
        Vari.MakeEffect(107, d3DXVECTOR3, f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(8);
        cBattleWork2.ResetMagic();
        CBattleActCalc.m_App.RecTextObj("\u9b54\u6cd5\u52b9\u679c\u89e3\u9664", cBattleWork2.m_vPos, Color.white);
    }

    public static void Algo_071(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        Vari.MakeEffect(37, cBattleWork2.m_vPos, 0.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_019(CBattleWork cBattleWork, CAction cAction) {
        Vari.MakeEffect(102, cBattleWork.m_vPos, 0.0f, cBattleWork.m_Chr.m_fHitSize * 0.02f);
        CBattleActCalc.m_Btl.LoopFrame(10);
        cBattleWork.SetAura(4);
    }

    public static void Algo_034(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        CBattleActEfc.AllWShield(cBattleWork, cAction);
        CBattleActCalc.m_Btl.LoopFrame(6);
    }

    public static void Algo_413(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MakeUltiEffect(3);
        CBattleActCalc.AllDamage(cAction.m_nObj, 9999, 6);
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleActEfc.ResetAbLightColor();
    }

    public static void Algo_040(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        Vari.MakeEffect(74, cBattleWork2.m_vPos, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(20);
        CBattleActCalc.m_App.m_Render.SetWhite(0.5f);
        CBattleActCalc.m_Btl.LoopFrame(1);
        CBattleActCalc.m_App.m_Render.SetWhite(1.0f);
        CBattleActCalc.m_Btl.LoopFrame(1);
        if (cBattleWork2.GetClose()) {
            cBattleWork2.ResetClose();
        } else {
            CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
        }
        CBattleActCalc.m_App.m_Render.SetWhite(0.5f);
        CBattleActCalc.m_Btl.LoopFrame(1);
        CBattleActCalc.m_App.m_Render.SetWhite(0.0f);
        CBattleActCalc.m_Btl.LoopFrame(1);
    }

    public static void Algo_093(CBattleWork cBattleWork, CAction cAction) {
        CAction cAction2 = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 333) {
            cAction2.m_nObj = cBattleWork.m_nWorkNo;
            CBattleAction.Algo_030(cBattleWork, cAction2);
        } else if (n < 666) {
            cAction2.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            CBattleAction.Algo_057(cBattleWork, cAction2);
        } else {
            cAction2.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            CBattleAction.Algo_052(cBattleWork, cAction2);
        }
        CBattleActCalc.m_Btl.CheckDead();
        n = Calc3D.Rand(1000);
        if (n < 333) {
            cAction2.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            CBattleAction.Algo_070(cBattleWork, cAction2);
        } else if (n < 666) {
            cAction2.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            CBattleAction.Algo_013(cBattleWork, cAction2);
        } else {
            cAction2.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            CBattleAction.Algo_001(cBattleWork, cAction2);
        }
        CBattleActCalc.m_Btl.CheckDead();
        n = Calc3D.Rand(1000);
        if (n < 333) {
            cAction2.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            CBattleAction.Algo_053(cBattleWork, cAction2);
        } else if (n < 666) {
            cAction2.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            CBattleAction.Algo_020(cBattleWork, cAction2);
        } else {
            cAction2.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            CBattleAction.Algo_060(cBattleWork, cAction2);
        }
        CBattleActCalc.m_Btl.CheckDead();
    }

    public static void Algo_052(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 50, 0, 0, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(4);
        Vari.MakeEffect(9, cBattleWork2.m_vPos, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(6);
        CBattleActCalc.Poison(cBattleWork, cBattleWork2);
        CBattleActEfc.MoveBack(cBattleWork);
    }

    public static void Algo_107(CBattleWork cBattleWork, CAction cAction) {
        int n;
        CBattleActCalc.m_Btl.SetCameraVect2(9999.9f);
        CBattleFunc.FadeOut(8);
        Vari.m_SysFlag.SetFlag(4);
        CBattleActCalc.m_App.m_Play.SetEvtFlag(331);
        CBattleFunc.FadeIn(8);
        CBattleActCalc.m_Btl.LoopFrame(8);
        int n2 = 0;
        while ((n = CBattleActCalc.SelectGroup1(cAction.m_nObj)) != -1) {
            CBattleActEfc.MakeMeteor(cBattleWork, n, 100, 3700);
            CBattleActCalc.m_Btl.LoopFrame(2);
            if (++n2 < 4) continue;
        }
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleFunc.FadeOut(8);
        CBattleActCalc.m_Btl.SetChrCamera(cBattleWork);
        Vari.m_SysFlag.SetFlag(32);
        CBattleActCalc.m_App.m_Render.SetBright(0.0f);
        Vari.m_SysFlag.ResetFlag(4);
        CBattleActCalc.m_App.m_Play.ResetEvtFlag(331);
        CBattleFunc.FadeIn(8);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_161(CBattleWork cBattleWork, CAction cAction) {
        int n;
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        if (!cBattleWork2.IsAttack() && (n = CBattleActCalc.SelectGroup1(cAction.m_nObj)) != -1) {
            cBattleWork2 = Vari.GetBChrWork(n);
        }
        if (!cBattleWork2.IsAttack()) {
            CBattleActEfc.MoveBack(cBattleWork);
            return;
        }
        float f = Calc3D.CalcAngleXZ(cBattleWork.m_vPos, cBattleWork2.m_vPos);
        Vari.MakeEffect(113, cBattleWork.m_vPos, f, 0.0f);
        CBattleActEfc.MoveBackRol(cBattleWork);
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(4);
    }

    public static void Algo_205_03(CBattleWork cBattleWork, CAction cAction) {
        int n = Calc3D.Rand(4) + 1;
        CAction cAction2 = new CAction();
        int n2 = 0;
        while (n2 < n) {
            if (CBattleActCalc.m_Btl.CheckDead() != 0) break;
            int n3 = CBattleEnemy.SelectAll1();
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                cAction2.m_nObj = n3;
                CBattleAction.Algo_061(cBattleWork, cAction2);
            }
            ++n2;
        }
    }

    public static void Algo_031(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        Vari.MakeEffect(11, cBattleWork2.m_vPos, 0.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleActCalc.CurePoison(cBattleWork2);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_047(CBattleWork cBattleWork, CAction cAction) {
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleActCalc.m_App.PlaySeG(26);
        Vari.MakeEffect(80, cBattleWork.m_vPos, 1.5707964f, 0.0f);
        Vari.MakeEffect(80, cBattleWork.m_vPos, (float)Math.PI, 0.0f);
        Vari.MakeEffect(80, cBattleWork.m_vPos, 4.712389f, 0.0f);
        Vari.MakeEffect(80, cBattleWork.m_vPos, (float)Math.PI * 2, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleFunc.WhiteIn(8);
        CBattleActEfc.SummonOn(cBattleWork);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(cBattleWork.m_vPos);
        d3DXVECTOR3.x = 0.0f;
        Vari.MakeEffect(81, d3DXVECTOR3, cBattleWork.m_vRol.y, 0.0f);
        CBattleFunc.WhiteOut(8);
        CBattleActCalc.m_Btl.SetCameraVect2(0.47123894f);
        CBattleActCalc.m_Btl.LoopFrame(16);
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3(d3DXVECTOR3);
        d3DXVECTOR32.y = 150.0f;
        d3DXVECTOR32.z += Calc3D.Cos(cBattleWork.m_vRol.y) * 250.0f;
        CBattleActCalc.m_App.PlaySeG(1);
        int n = 0;
        do {
            int n2 = 0;
            do {
                float f = cBattleWork.m_vRol.y + Calc3D.DEGtoRAD(Calc3D.Rand(180) - 90);
                Vari.MakeEffect(58, d3DXVECTOR32, f, 0.0f);
                f = cBattleWork.m_vRol.y + Calc3D.DEGtoRAD(Calc3D.Rand(180) - 90);
                Vari.MakeEffect(82, d3DXVECTOR32, f, 0.0f);
            } while (++n2 < 2);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 32);
        CBattleActCalc.m_Btl.LoopFrame(6);
        CBattleActCalc.AllWeaponAttack(cBattleWork, cAction.m_nObj, 120, 22000, 4, 2);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleFunc.WhiteIn(8);
        CBattleActEfc.SummonOff(cBattleWork);
        CBattleFunc.WhiteOut(8);
    }

    public static void Algo_085(CBattleWork cBattleWork, CAction cAction) {
        CBattleActCalc.m_Btl.LoopFrame(6);
        CBattleActCalc.m_App.PlaySeG(16);
        Vari.MakeEffect(77, cBattleWork.m_vPos, cAction.m_nObj, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleActCalc.AllWeaponAttack(cBattleWork, cAction.m_nObj, 110, 0, 0, 0);
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_104(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2;
        CBattleActCalc.m_App.PlaySeG(19);
        Vari.MakeEffect(114, cBattleWork.m_vPos, cAction.m_nObj, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(16);
        int n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        CBattleActCalc.m_App.PlaySeG(19);
        int n3 = n;
        while (n3 < n2) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.Confusion(cBattleWork, cBattleWork2, 5);
            }
            ++n3;
        }
        CBattleActCalc.m_Btl.LoopFrame(16);
        CBattleActCalc.m_App.PlaySeG(19);
        n3 = n;
        while (n3 < n2) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.Paralysis(cBattleWork, cBattleWork2, 60);
            }
            ++n3;
        }
        CBattleActCalc.m_Btl.LoopFrame(16);
        CBattleActCalc.m_App.PlaySeG(19);
        n3 = n;
        while (n3 < n2) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.Poison(cBattleWork, cBattleWork2);
            }
            ++n3;
        }
        CBattleActCalc.m_Btl.LoopFrame(16);
        n3 = n;
        while (n3 < n2) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.Blind(cBattleWork, cBattleWork2);
            }
            ++n3;
        }
    }

    public static void Algo_158(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        int n = CBattleActCalc.WeaponAttack(cBattleWork, Vari.GetBChrWork(cAction.m_nObj), 100, 0, 0, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(4);
        if (cBattleWork.m_nWorkNo == cBattleWork2.m_nWorkNo) {
            CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
        } else {
            float f = Calc3D.CalcAngleXZ(cBattleWork2.m_vPos, cBattleWork.m_vPos);
            Vari.MakeEffect(14, cBattleWork2.m_vPos, Calc3D.RadLimits(f), cBattleWork.m_nWorkNo);
            CBattleActCalc.m_Btl.LoopFrame(18);
            if (n < 0) {
                n = 0;
            }
            cBattleWork.AddHP(n);
            CBattleActCalc.SetNumberObject(cBattleWork, n, 2);
        }
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_072(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2;
        int n = CBattleActCalc.GetGroupStart(0);
        int n2 = CBattleActCalc.GetGroupEnd(0);
        int n3 = n;
        while (n3 < n2) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActEfc.MoveFront(cBattleWork2);
                CBattleActCalc.WeaponAttack(cBattleWork2, Vari.GetBChrWork(CBattleEnemy.SelectPlayer1(cBattleWork2)), 100, 0, 0, 0, 1);
            }
            ++n3;
        }
        n3 = n2 - 1;
        while (n3 >= n) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActEfc.MoveFront(cBattleWork2);
                CBattleActCalc.WeaponAttack(cBattleWork2, Vari.GetBChrWork(CBattleEnemy.SelectPlayer1(cBattleWork2)), 100, 0, 0, 0, 1);
            }
            --n3;
        }
        n3 = n;
        while (n3 < n2) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActEfc.MoveBack2(cBattleWork2);
                cBattleWork2.m_nCount = 0;
                cBattleWork2.m_nAT = -25;
            }
            ++n3;
        }
        CBattleActCalc.m_Btl.m_bResetAT = false;
    }

    public static void Algo_053(CBattleWork cBattleWork, CAction cAction) {
        CBattleActCalc.m_App.PlaySeG(12);
        D3DXVECTOR3 d3DXVECTOR3 = CBattleActEfc.GetOnmyoCenter(cAction.m_nObj);
        int n = 0;
        do {
            CBattleActEfc.MakePiyo(d3DXVECTOR3, 600.0f, 300.0f, 4);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 7);
        CBattleActCalc.m_Btl.LoopFrame(4);
        n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n;
        while (n3 < n2) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.Confusion(cBattleWork, cBattleWork2, 5);
            }
            ++n3;
        }
        CBattleActCalc.m_Btl.LoopFrame(6);
    }

    public static void Algo_205(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.InvokeSong(cBattleWork, 0);
        int n = Calc3D.Rand(800);
        if (n < 100) {
            CBattleAction.Algo_205_00(cBattleWork, cAction);
            return;
        }
        if (n < 200) {
            CBattleAction.Algo_205_01(cBattleWork, cAction);
            return;
        }
        if (n < 300) {
            CBattleAction.Algo_205_02(cBattleWork, cAction);
            return;
        }
        if (n < 400) {
            CBattleAction.Algo_205_03(cBattleWork, cAction);
            return;
        }
        if (n < 500) {
            CBattleAction.Algo_205_04(cBattleWork, cAction);
            return;
        }
        if (n < 600) {
            CBattleAction.Algo_205_05(cBattleWork, cAction);
            return;
        }
        if (n < 700) {
            CBattleAction.Algo_205_06(cBattleWork, cAction);
            return;
        }
        CBattleAction.Algo_205_07(cBattleWork, cAction);
    }

    public static void Algo_115(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.m_App.PlaySeG(0);
        Vari.MakeEffect(30, cBattleWork2.m_vPos, 0.0f, 0.0f);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 1, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleActEfc.MakeSmallStorm(cBattleWork2.m_vPos);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 2, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 5, 0, 1);
        CBattleActEfc.MakeIce(cBattleWork2);
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleActEfc.MakeThunder(cBattleWork2.m_vPos);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 6, 0, 1);
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_044(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        CBattleActCalc.m_App.PlaySeG(10);
        Vari.MakeEffect(70, cBattleWork2.m_vPos, 0.0f, cBattleWork2.m_Chr.m_fHitSize);
        Vari.MakeEffect(70, cBattleWork2.m_vPos, 1.5707964f, cBattleWork2.m_Chr.m_fHitSize);
        Vari.MakeEffect(70, cBattleWork2.m_vPos, (float)Math.PI, cBattleWork2.m_Chr.m_fHitSize);
        Vari.MakeEffect(70, cBattleWork2.m_vPos, 4.712389f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(8);
        cBattleWork2.m_Prm.SetRije(10 + Calc3D.Rand(5));
        CBattleActCalc.m_App.RecTextObj("\u308a\u3058\u3047\u30fc\u306d", cBattleWork2.m_vPos, Color.green);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_121(CBattleWork cBattleWork, CAction cAction) {
        int n;
        new D3DXVECTOR3();
        int n2 = 0;
        while ((n = CBattleActCalc.SelectGroup1(cAction.m_nObj)) != -1) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n);
            CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
            CBattleActCalc.m_App.m_Render.SetWhite(0.5f);
            CBattleActCalc.m_Btl.LoopFrame(1);
            CBattleActCalc.m_App.m_Render.SetWhite(0.0f);
            CBattleActCalc.m_Btl.LoopFrame(2);
            if (++n2 < 8) continue;
        }
    }

    public static void Algo_400(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.SetAbLightColor(224, 64, 64);
    }

    public static void Init(CBattleMain cBattleMain) {
        CBattleActCalc.m_Btl = cBattleMain;
        CBattleActCalc.m_App = CBattleActCalc.m_Btl.GetApp();
    }

    public static void Algo_150(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, Vari.GetBChrWork(cAction.m_nObj), 100, 0, 0, 1, 1);
        CBattleActEfc.CriticalFlash();
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_101(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.RandAttack(cBattleWork, cAction, 14, 4);
    }

    public static void Algo_162(CBattleWork cBattleWork, CAction cAction) {
        CBattleActCalc.m_App.PlaySeG(16);
        Vari.MakeEffect(77, cBattleWork.m_vPos, cAction.m_nObj, 0.0f);
        CBattleActEfc.MoveBackRol(cBattleWork);
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleActCalc.AllWeaponAttack(cBattleWork, cAction.m_nObj, 100, 0, 0, 0);
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(4);
    }

    public static void Algo_032(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        CBattleActCalc.m_App.PlaySeG(14);
        CBattleActCalc.MakeShield(cBattleWork2, 0);
        CBattleActCalc.SetShield(cBattleWork, cBattleWork2);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_041(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        CBattleActCalc.m_App.PlaySeG(13);
        CBattleActCalc.m_App.m_Render.SetWhite(1.0f);
        CBattleActCalc.m_Btl.LoopFrame(1);
        if (cBattleWork.m_nWorkNo == Vari.GetWorldChr()) {
            CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
        } else {
            Vari.SetWorld(cBattleWork.m_nWorkNo);
        }
        CBattleActCalc.m_App.m_Render.SetWhite(0.0f);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_073(CBattleWork cBattleWork, CAction cAction) {
        int n;
        CBattleActCalc.m_Btl.LoopFrame(6);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        int n2 = 0;
        while ((n = CBattleActCalc.SelectGroup1(cAction.m_nObj)) != -1) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n);
            float f = (float)Math.PI + Calc3D.DEGtoRAD(Calc3D.Rand(90) - 45);
            d3DXVECTOR3.Set(cBattleWork2.m_vPos);
            d3DXVECTOR3.x -= Calc3D.Sin(f) * 400.0f;
            d3DXVECTOR3.z -= Calc3D.Cos(f) * 400.0f;
            Vari.MakeEffect(43, d3DXVECTOR3, f, n);
            CBattleActCalc.m_Btl.LoopFrame(4);
            if (++n2 < 6) continue;
        }
        CBattleActCalc.m_Btl.LoopFrame(4);
    }

    public static void Algo_025(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        Vari.MakeEffect(5, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(3);
        CBattleActCalc.m_Btl.LoopFrame(4);
        Vari.MakeEffect(89, cBattleWork2.m_vPos, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(4);
        Vari.MakeEffect(89, cBattleWork2.m_vPos, 1.0f, 0.0f);
        CBattleActCalc.m_App.PlaySeG(13);
        Vari.MakeEffect(90, cBattleWork2.m_vPos, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleActCalc.MagicAttack(cBattleWork, cBattleWork2, 50, 3700, 5);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_157(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
        float f = cBattleWork2.GetHeight();
        if (!cBattleWork2.IsAlive()) {
            f = 0.0f;
        }
        Vari.MakeEffect(68, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), f);
        CBattleActCalc.m_Btl.LoopFrame(18);
        if (cBattleWork2.IsAlive()) {
            CBattleActCalc.InstantDead(cBattleWork, cBattleWork2, 5);
        }
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_170(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 1, 1);
        CBattleActEfc.CriticalFlash();
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 1, 1);
        CBattleActEfc.CriticalFlash();
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_005(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        if (!cBattleWork2.IsAttack()) {
            int n = CBattleActCalc.SelectGroup1(cAction.m_nObj);
            if (n == -1) {
                return;
            }
            cBattleWork2 = Vari.GetBChrWork(n);
        }
        Vari.MakeEffect(78, cBattleWork2.m_vPos, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(6);
        CBattleActCalc.m_App.PlaySeG(11);
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 65, 0, 4, 0, 0);
        CBattleActCalc.m_Btl.LoopFrame(4);
    }

    public static void Algo_500(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        Vari.MakeEffect(30, cBattleWork2.m_vPos, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(3);
        Vari.MakeEffect(3, cBattleWork2.m_vPos, 0.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 1, 0, 0);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_018(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.Move_Defense(cBattleWork);
        cBattleWork.m_Prm.SetDefense2();
    }

    public static void Algo_154(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MoveFrontSp(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, Vari.GetBChrWork(cAction.m_nObj), 100, 0, 0, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleAction.MoveBackSword(cBattleWork, cAction);
        CBattleActCalc.m_Btl.m_bResetAT = false;
        cBattleWork.m_nAT = cBattleWork.m_nAT * 3 / 4;
    }

    public static void Algo_033(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        CBattleActEfc.MakeClock(cBattleWork2.m_vPos, true);
        CBattleActCalc.m_Btl.LoopFrame(2);
        CBattleActCalc.Paralysis(cBattleWork, cBattleWork2, 85);
    }

    public static void Algo_102(CBattleWork cBattleWork, CAction cAction) {
        CBattleActCalc.m_Btl.LoopFrame(6);
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActCalc.m_App.PlaySeG(13);
        CBattleActCalc.m_App.m_Render.SetWhite(1.0f);
        CBattleActCalc.m_Btl.LoopFrame(1);
        CBattleActCalc.Stone(cBattleWork, cBattleWork2, 85);
        CBattleActCalc.m_App.m_Render.SetWhite(0.0f);
        CBattleActCalc.m_Btl.LoopFrame(4);
    }

    public static void Algo_010(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.Move_Defense(cBattleWork);
        cBattleWork.m_Prm.SetDefense();
    }

    public static void Algo_095(CBattleWork cBattleWork, CAction cAction) {
        CBattleActCalc.m_Btl.LoopFrame(6);
        Vari.MakeEffect(91, cBattleWork.m_vPos, 0.0f, 0.0f);
        Vari.MakeEffect(91, cBattleWork.m_vPos, 1.5707964f, 0.0f);
        Vari.MakeEffect(91, cBattleWork.m_vPos, (float)Math.PI, 0.0f);
        Vari.MakeEffect(91, cBattleWork.m_vPos, 4.712389f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(6);
        Vari.MakeEffect(91, cBattleWork.m_vPos, Calc3D.DEGtoRAD(45.0f), 0.0f);
        Vari.MakeEffect(91, cBattleWork.m_vPos, Calc3D.DEGtoRAD(135.0f), 0.0f);
        Vari.MakeEffect(91, cBattleWork.m_vPos, Calc3D.DEGtoRAD(225.0f), 0.0f);
        Vari.MakeEffect(91, cBattleWork.m_vPos, Calc3D.DEGtoRAD(315.0f), 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(6);
    }

    public static void Algo_401(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.SetAbLightColor(64, 64, 224);
    }

    public static void Algo_042(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 190, 0, 5, 0, 1);
        CBattleActEfc.MakeIce(cBattleWork2);
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_151(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(3);
        CBattleActEfc.MakeClock(cBattleWork2.m_vPos, true);
        CBattleActCalc.m_App.PlaySeG(13);
        CBattleActCalc.m_Btl.LoopFrame(2);
        if (cBattleWork2.IsAlive()) {
            CBattleActCalc.Paralysis(cBattleWork, cBattleWork2, 75);
        }
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_205_05(CBattleWork cBattleWork, CAction cAction) {
        int n = 0;
        int n2 = 9;
        int n3 = n;
        while (n3 < n2) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAlive()) {
                CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
            }
            ++n3;
        }
    }

    public static void Algo_174(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleAction.Algo_160(cBattleWork, cAction);
        float f = cBattleWork2.GetHeight();
        if (!cBattleWork2.IsAlive()) {
            f = 0.0f;
        }
        Vari.MakeEffect(68, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), f);
        CBattleActCalc.m_Btl.LoopFrame(18);
        if (cBattleWork2.IsAlive()) {
            CBattleActCalc.InstantDead(cBattleWork, cBattleWork2, 5);
        }
        CBattleActCalc.m_Btl.LoopFrame(4);
    }

    public static void Algo_017(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        int n = 0;
        do {
            CEfcWork cEfcWork;
            if ((cEfcWork = Vari.MakeEffect(104, cBattleWork2.m_vPos, 0.0f, 0.0f)) != null) {
                cEfcWork.m_nColor = 2;
            }
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 4);
        CBattleActCalc.m_Btl.LoopFrame(4);
        if (cBattleWork2.m_Prm.GetPoison()) {
            cBattleWork2.ResetPoison();
        }
        if (cBattleWork2.m_Prm.GetBlind() > 0) {
            cBattleWork2.m_Prm.ResetBlind();
        }
    }

    public static void Algo_116(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        CBattleActCalc.m_App.PlaySeG(14);
        Vari.MakeEffect(120, cBattleWork2.m_vPos, 0.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(8);
        cBattleWork2.SetSuika();
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_103(CBattleWork cBattleWork, CAction cAction) {
        D3DXVECTOR3 d3DXVECTOR3 = CBattleActEfc.GetOnmyoCenter(cAction.m_nObj);
        CBattleActCalc.m_App.PlaySeG(18);
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        int n = 0;
        do {
            int n2 = 0;
            do {
                d3DXVECTOR32.x = d3DXVECTOR3.x + (float)Calc3D.Rand(600) - 300.0f;
                d3DXVECTOR32.z = d3DXVECTOR3.z + (float)Calc3D.Rand(300) - 150.0f;
                Vari.MakeEffect(28, d3DXVECTOR32, 0.0f, 0.0f);
            } while (++n2 < 8);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 10);
        CBattleActCalc.m_Btl.LoopFrame(2);
        CBattleActCalc.AllWeaponAttack(cBattleWork, cAction.m_nObj, 150, 0, 3, 0);
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_089(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(2);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(cBattleWork2.m_vPos);
        d3DXVECTOR3.y = cBattleWork2.GetHeight() + 100.0f;
        Vari.MakeEffect(44, d3DXVECTOR3, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleActCalc.Blind(cBattleWork, cBattleWork2);
        CBattleActCalc.m_Btl.LoopFrame(2);
        CBattleActEfc.MoveBack(cBattleWork);
    }

    public static void Algo_055(CBattleWork cBattleWork, CAction cAction) {
        Vari.MakeEffect(20, cBattleWork.m_vPos, cAction.m_nObj, 0.0f);
        CBattleActCalc.m_App.PlaySeG(1);
        CBattleActCalc.m_Btl.LoopFrame(22);
        CBattleActCalc.AllWeaponAttack(cBattleWork, cAction.m_nObj, 90, 0, 1, 0);
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_014(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.BodyFront(cBattleWork);
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        int n = CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 150, 0, 0, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(2);
        CBattleActCalc.Damage(cBattleWork, n / 4, 0);
        CBattleActCalc.m_Btl.LoopFrame(6);
        CBattleActEfc.BodyBack(cBattleWork);
    }

    public static void Algo_171(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
        CBattleActCalc.m_App.PlaySeG(12);
        Vari.MakeEffect(16, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(3);
        CBattleActEfc.MakeClock(cBattleWork2.m_vPos, true);
        CBattleActCalc.m_Btl.LoopFrame(2);
        if (cBattleWork2.IsAlive()) {
            CBattleActCalc.Paralysis(cBattleWork, cBattleWork2, 75);
        }
        CBattleActCalc.m_Btl.LoopFrame(10);
        if (cBattleWork2.IsAlive()) {
            CBattleActCalc.Confusion(cBattleWork, cBattleWork2, 15);
        }
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_043(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActEfc.MakeThunder(cBattleWork2.m_vPos);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 270, 0, 6, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_119(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        cBattleWork2.m_Chr.ResetFlag(8);
        cBattleWork2.m_Chr.SetFlag(1);
        cBattleWork2.InitZPos();
        cBattleWork2.m_Prm.m_nHP = cBattleWork2.m_Prm.m_nMaxHP;
        float f = -10.0f;
        cBattleWork2.m_vPos.y = 1000.0f;
        CBattleActCalc.m_App.PlaySeG(7);
        int n = 0;
        while (true) {
            CBattleActCalc.m_Btl.LoopFrame(1);
            cBattleWork2.m_vPos.y += f;
            f -= 10.0f;
            if (!(cBattleWork2.m_vPos.y <= 0.0f)) continue;
            f = -f * 0.3f;
            cBattleWork2.m_vPos.y = 0.0f;
            if (++n >= 4) break;
        }
        cBattleWork2.m_vPos.y = 0.0f;
    }

    public static void Algo_501(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActEfc.MakeClock(cBattleWork2.m_vPos, true);
        CBattleActCalc.m_Btl.LoopFrame(3);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 0);
        CBattleActCalc.m_Btl.LoopFrame(8);
        if (cBattleWork2.IsAlive()) {
            CBattleActCalc.Paralysis(cBattleWork, cBattleWork2, 60);
        }
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_402(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.SetAbLightColor(64, 224, 64);
    }

    public static void Algo_026(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        Vari.MakeEffect(5, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(7);
        CBattleActCalc.m_App.PlaySeG(12);
        Vari.MakeEffect(16, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(16);
        CBattleActCalc.Confusion(cBattleWork, cBattleWork2, 15);
    }

    public static void Algo_152(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(5);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(5);
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_011(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        Vari.MakeEffect(24, cBattleWork2.m_vPos, 2.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(12);
        int n = CSkillCalc.Calc_StrHeal(cBattleWork.m_Prm);
        cBattleWork2.AddHP(n);
        CBattleActCalc.SetNumberObject(cBattleWork2, n, 0);
        CBattleActCalc.m_Btl.LoopFrame(8);
        Vari.HealFlag(cBattleWork.m_nWorkNo);
    }

    public static void Algo_131(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        Vari.MakeEffect(1, cBattleWork.m_vPos, 0.0f, cBattleWork.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(12);
        CBattleActEfc.MakeKeruga(cBattleWork2);
        cBattleWork2.AddHP(9999);
        CBattleActCalc.SetNumberObject(cBattleWork2, 9999, 0);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_075(CBattleWork cBattleWork, CAction cAction) {
        int n = 0;
        do {
            cBattleWork.AddVect(Calc3D.DEGtoRAD(30.0f));
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 6);
        n = 0;
        do {
            cBattleWork.m_vPos.z += 35.0f;
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 20);
        cBattleWork.m_Chr.ResetFlag(1);
        cBattleWork.m_Chr.SetFlag(65536);
        cBattleWork.m_Prm.m_nHP = 0;
        CBattleActCalc.m_Btl.CheckDead();
    }

    public static void Algo_006(CBattleWork cBattleWork, CAction cAction) {
        CSkillData cSkillData = Vari.GetSkillData(109);
        CBattleActCalc.m_Btl.m_SkillWin.OpenWindow(cSkillData.m_strName);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, Vari.GetBChrWork(cAction.m_nObj), 100, 0, 0, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleActEfc.MoveBack(cBattleWork);
    }

    public static void Algo_029(CBattleWork cBattleWork, CAction cAction) {
        D3DXVECTOR3 d3DXVECTOR3 = CBattleActEfc.GetOnmyoCenter(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        Vari.MakeEffect(5, d3DXVECTOR3, CBattleActEfc.GetOnmyoVect(cAction.m_nObj), 100.0f);
        CBattleActCalc.m_Btl.LoopFrame(5);
        CBattleActEfc.MakeStorm(d3DXVECTOR3);
        CBattleActCalc.AllMagicAttack(cBattleWork, cAction.m_nObj, 50, 7400, 2);
    }

    public static void Algo_403(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.SetAbLightColor(200, 200, 64);
    }

    public static void Algo_029A(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        Vari.MakeEffect(5, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(7);
        Vari.MakeEffect(6, cBattleWork2.m_vPos, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(9);
        Vari.MakeEffect(3, cBattleWork2.m_vPos, 0.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleActCalc.MagicAttack(cBattleWork, cBattleWork2, 50, 10000, 7);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_172(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFrontSp(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
        CBattleActEfc.MakeAirEffect(cBattleWork2);
        int n = 101;
        if (!cBattleWork2.IsPlayer()) {
            n = 102;
        }
        CBattleActCalc.AllWeaponAttack(cBattleWork, n, 60, 0, 2, 0);
        CBattleAction.MoveBackSword(cBattleWork, cAction);
        CBattleActCalc.m_Btl.m_bResetAT = false;
        cBattleWork.m_nAT = cBattleWork.m_nAT * 3 / 4;
    }

    public static void Algo_153(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, Vari.GetBChrWork(cAction.m_nObj), 100, 0, 0, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleAction.MoveBackSword(cBattleWork, cAction);
        CAction cAction2 = new CAction();
        cAction2.m_nObj = cBattleWork.IsPlayer() ? 101 : 102;
        CBattleAction.Algo_012(cBattleWork, cAction2);
    }

    CBattleAction() {
    }

    public static boolean ConfAction(CBattleWork cBattleWork, CAction cAction) {
        int n = Calc3D.Rand(1000);
        if (n < 333) {
            CBattleAction.Algo_998(cBattleWork, cAction);
            return true;
        }
        return false;
    }

    public static void Algo_502(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 0);
        Vari.MakeEffect(16, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(8);
        if (cBattleWork2.IsAlive()) {
            CBattleActCalc.Confusion(cBattleWork, cBattleWork2, 15);
        }
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_096(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MakeAllIce(cAction);
        CBattleActCalc.AllWeaponAttack(cBattleWork, cAction.m_nObj, 130, 0, 5, 0);
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_035(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        CBattleActCalc.m_App.PlaySeG(10);
        Vari.MakeEffect(10, cBattleWork2.m_vPos, 2.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(8);
        if (cBattleWork2.IsAlive()) {
            CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
        } else {
            CBattleActCalc.ReviveChr(cBattleWork2);
            CBattleActCalc.MagicHeal(cBattleWork, cBattleWork2, 30);
        }
        CBattleActCalc.m_Btl.LoopFrame(8);
        Vari.HealFlag(cBattleWork.m_nWorkNo);
    }

    public static void Algo_205_06(CBattleWork cBattleWork, CAction cAction) {
        CAbility cAbility = cBattleWork.m_Prm.m_Abi;
        if (!cAbility.GetFlag(94) && !cAbility.GetFlag(133)) {
            CBattleActCalc.Damage(cBattleWork, 9999, 7);
            return;
        }
        CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork.m_vPos, Color.white);
    }

    public static void Algo_099(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MakeCosmoTrip();
        CBattleActCalc.AllWeaponAttack(cBattleWork, cAction.m_nObj, 380, 0, 7, 2);
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_012(CBattleWork cBattleWork, CAction cAction) {
        CBattleActCalc.m_App.PlaySeG(14);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.z = cAction.m_nObj == 101 ? -230.0f : 230.0f;
        Vari.MakeEffect(25, d3DXVECTOR3, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(12);
        int n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n;
        while (n3 < n2) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                int n4 = cBattleWork.m_Prm.m_nLV / 8 + 1;
                int n5 = n4 * 5;
                int n6 = cBattleWork2.m_Prm.GetStr_Btl();
                if (n6 < n5) {
                    if ((n6 += n4) > n5) {
                        n6 = n5;
                    }
                    cBattleWork2.m_Prm.SetStr_Btl(n6);
                    CBattleActCalc.m_App.RecTextObj("\u653b\u6483\u529b\u2191", cBattleWork2.m_vPos, Color.green);
                } else {
                    CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
                }
            }
            ++n3;
        }
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_173(CBattleWork cBattleWork, CAction cAction) {
        CBattleAction.Algo_158(cBattleWork, cAction);
        CAction cAction2 = new CAction();
        cAction2.m_nObj = cBattleWork.IsPlayer() ? 101 : 102;
        CBattleAction.Algo_012(cBattleWork, cAction2);
    }

    public static void Algo_088(CBattleWork cBattleWork, CAction cAction) {
        int n;
        new D3DXVECTOR3();
        int n2 = 0;
        while ((n = CBattleActCalc.SelectGroup1(cAction.m_nObj)) != -1) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n);
            Vari.MakeEffect(30, cBattleWork2.m_vPos, 0.0f, 0.0f);
            CBattleActCalc.m_Btl.LoopFrame(3);
            Vari.MakeEffect(3, cBattleWork2.m_vPos, 0.0f, cBattleWork2.m_Chr.m_fHitSize);
            CBattleActCalc.m_Btl.LoopFrame(4);
            CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 120, 0, 1, 0, 0);
            CBattleActCalc.m_Btl.LoopFrame(4);
            if (++n2 < 3) continue;
        }
    }

    public static void Algo_056(CBattleWork cBattleWork, CAction cAction) {
        Vari.MakeEffect(20, cBattleWork.m_vPos, cAction.m_nObj, 1.0f);
        CBattleActCalc.m_App.PlaySeG(1);
        CBattleActCalc.m_Btl.LoopFrame(22);
        int n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n;
        while (n3 < n2) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.Poison(cBattleWork, cBattleWork2);
            }
            ++n3;
        }
    }

    public static void Algo_105(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MakeMekaLaser(cBattleWork);
        int n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n;
        while (n3 < n2) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.MagicAttack(cBattleWork, cBattleWork2, 50, 7000, 3);
            }
            ++n3;
        }
    }

    public static void Algo_080(CBattleWork cBattleWork, CAction cAction) {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.z = 800.0f;
        int n = 0;
        do {
            d3DXVECTOR3.x = Calc3D.Rand(800) - 400;
            d3DXVECTOR3.y = Calc3D.Rand(200);
            Vari.MakeEffect(66, d3DXVECTOR3, 0.0f, 0.0f);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 16);
        CBattleActCalc.m_Btl.LoopFrame(4);
        int n2 = 0;
        while ((n = CBattleActCalc.SelectGroup1(cAction.m_nObj)) != -1) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n);
            CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
            CBattleActCalc.m_Btl.LoopFrame(4);
            if (++n2 < 10) continue;
        }
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_118(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.RandAttack(cBattleWork, cAction, 9, 1);
    }

    public static void Algo_013(CBattleWork cBattleWork, CAction cAction) {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.z = cAction.m_nObj == 101 ? 230.0f : -230.0f;
        int n = 0;
        do {
            Vari.MakeEffect(40, d3DXVECTOR3, 0.0f, 0.0f);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 24);
        CBattleActCalc.m_Btl.LoopFrame(8);
        n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n;
        while (n3 < n2) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 55, 0, 0, 0, 0);
            }
            ++n3;
        }
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_045(CBattleWork cBattleWork, CAction cAction) {
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleActCalc.m_App.PlaySeG(26);
        Vari.MakeEffect(80, cBattleWork.m_vPos, 1.5707964f, 0.0f);
        Vari.MakeEffect(80, cBattleWork.m_vPos, (float)Math.PI, 0.0f);
        Vari.MakeEffect(80, cBattleWork.m_vPos, 4.712389f, 0.0f);
        Vari.MakeEffect(80, cBattleWork.m_vPos, (float)Math.PI * 2, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleFunc.WhiteIn(8);
        CBattleActEfc.SummonOn(cBattleWork);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(cBattleWork.m_vPos);
        d3DXVECTOR3.x = 0.0f;
        Vari.MakeEffect(103, d3DXVECTOR3, cBattleWork.m_vRol.y, 0.0f);
        CBattleFunc.WhiteOut(8);
        CBattleActCalc.m_Btl.SetCameraVect2(0.47123894f);
        CBattleActCalc.m_Btl.LoopFrame(16);
        CBattleActEfc.MakeSMeteor(cAction, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(6);
        CBattleActCalc.AllWeaponAttack(cBattleWork, cAction.m_nObj, 120, 6500, 4, 2);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleFunc.WhiteIn(8);
        CBattleActEfc.SummonOff(cBattleWork);
        CBattleFunc.WhiteOut(8);
    }

    public static void Algo_059(CBattleWork cBattleWork, CAction cAction) {
        CBattleActCalc.m_Btl.LoopFrame(6);
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActCalc.m_App.PlaySeG(19);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(cBattleWork2.m_vPos);
        d3DXVECTOR3.y = cBattleWork2.GetHeight() + 100.0f;
        Vari.MakeEffect(44, d3DXVECTOR3, 0.0f, 0.0f);
        CBattleActEfc.MakeClock(cBattleWork2.m_vPos, false);
        Vari.MakeEffect(9, cBattleWork2.m_vPos, 0.0f, 0.0f);
        Vari.MakeEffect(16, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(16);
        CBattleActCalc.Confusion(cBattleWork, cBattleWork2, 15);
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleActCalc.Paralysis(cBattleWork, cBattleWork2, 85);
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleActCalc.Poison(cBattleWork, cBattleWork2);
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleActCalc.Blind(cBattleWork, cBattleWork2);
    }

    public static void Algo_133(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        Vari.MakeEffect(1, cBattleWork.m_vPos, 0.0f, cBattleWork.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(12);
        Vari.MakeEffect(10, cBattleWork2.m_vPos, 2.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(8);
        if (cBattleWork2.IsAlive()) {
            CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
        } else {
            CBattleActCalc.ReviveChr(cBattleWork2);
            int n = cBattleWork2.m_Prm.GetMaxHP();
            if (n > 9999) {
                n = 9999;
            }
            cBattleWork2.AddHP(n);
            CBattleActCalc.SetNumberObject(cBattleWork2, n, 0);
        }
        CBattleActCalc.m_Btl.LoopFrame(8);
        Vari.HealFlag(cBattleWork.m_nWorkNo);
    }

    public static void Algo_060(CBattleWork cBattleWork, CAction cAction) {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.z = cAction.m_nObj == 101 ? -230.0f : 230.0f;
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        d3DXVECTOR32.y = 250.0f;
        d3DXVECTOR32.z = cAction.m_nObj == 101 ? -120.0f : 120.0f;
        D3DLIGHT8 d3DLIGHT8 = new D3DLIGHT8();
        d3DLIGHT8.m_nType = 1;
        d3DLIGHT8.m_vPosition.Set(d3DXVECTOR32);
        d3DLIGHT8.m_vDirection.Set(d3DXVECTOR32);
        d3DLIGHT8.m_fRange = 0.0f;
        D3DLIGHT8 d3DLIGHT82 = new D3DLIGHT8();
        d3DLIGHT82.Set(d3DLIGHT8);
        d3DLIGHT82.m_cDiffuse.r = 255;
        d3DLIGHT82.m_cDiffuse.g = 32;
        d3DLIGHT82.m_cDiffuse.b = 32;
        d3DLIGHT82.m_fRange = 2000.0f;
        CBattleActCalc.m_App.m_Fade.PushLight();
        CBattleFunc.FadeOut(8);
        CBattleActCalc.m_App.m_Fade.FogOff();
        CBattleActCalc.m_App.m_Fade.AmbientOff();
        CBattleActCalc.m_App.m_Render.SetBright(1.0f);
        CBattleActCalc.m_App.m_Render.SetLight(d3DLIGHT8);
        Vari.MakeEffect(55, d3DXVECTOR3, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(12);
        CBattleActCalc.m_App.PlaySeG(1);
        CBattleActCalc.m_App.m_Fade.XChgColor(d3DLIGHT8, d3DLIGHT82, 16);
        Vari.MakeEffect(54, d3DXVECTOR32, 0.0f, 0.0f);
        Vari.MakeEffect(57, d3DXVECTOR32, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(16);
        CBattleActCalc.m_App.m_Fade.XChgColor(d3DLIGHT82, d3DLIGHT8, 16);
        CBattleActCalc.m_Btl.LoopFrame(16);
        CBattleActCalc.m_App.m_Render.SetBright(0.0f);
        CBattleActCalc.m_App.m_Fade.FogOn();
        CBattleActCalc.m_App.m_Fade.AmbientOn();
        CBattleActCalc.m_App.m_Fade.PopLight();
        CBattleFunc.FadeIn(8);
        CBattleActCalc.AllWeaponAttack(cBattleWork, cAction.m_nObj, 200, 0, 1, 0);
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_200(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.InvokeSong(cBattleWork, 2);
        int n = 0;
        do {
            int n2 = 0;
            do {
                D3DXVECTOR3 d3DXVECTOR3 = CBattleActEfc.GetPartySongPos(cAction);
                Vari.MakeEffect(93, d3DXVECTOR3, 0.0f, 0.0f);
            } while (++n2 < 5);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 9);
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleActEfc.AddDefense(cBattleWork, cAction, 1);
        CBattleActCalc.m_Btl.LoopFrame(4);
    }

    public static void Algo_110(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2;
        D3DXVECTOR3 d3DXVECTOR3 = CBattleActEfc.GetOnmyoCenter(cAction.m_nObj);
        Vari.MakeEffect(1, cBattleWork.m_vPos, 0.0f, cBattleWork.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(12);
        Vari.MakeEffect(5, d3DXVECTOR3, CBattleActEfc.GetOnmyoVect(cAction.m_nObj), 100.0f);
        CBattleActCalc.m_Btl.LoopFrame(3);
        int n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n;
        while (n3 < n2) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                float f = cBattleWork2.GetHeight() * 0.9f;
                Vari.MakeEffect(68, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), f);
            }
            ++n3;
        }
        CBattleActCalc.m_Btl.LoopFrame(18);
        n3 = n;
        while (n3 < n2) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.InstantDead(cBattleWork, cBattleWork2, 4);
            }
            ++n3;
        }
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_087(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.RandAttack(cBattleWork, cAction, 8, 4);
    }

    public static void Action(CBattleWork cBattleWork, CAction cAction) {
        CSkillData cSkillData;
        int n;
        int n2;
        if (cAction == null) {
            return;
        }
        if (cBattleWork.m_Prm.GetConf() > 0 && CBattleAction.ConfAction(cBattleWork, cAction)) {
            return;
        }
        if (cAction.m_nAlgo == 1001) {
            n2 = CBattleActEfc.CheckAttackAdd(cBattleWork);
            if (n2 != -1) {
                cAction.m_nAlgo = n2;
            } else {
                int n3 = CBattleActEfc.CheckSwordCombo(cBattleWork, cAction);
                if (n3 == -1) {
                    n3 = CBattleActEfc.CheckSwordSkill(cBattleWork, cAction);
                }
                if (n3 == -1) {
                    CBattleAction.Algo_001(cBattleWork, cAction);
                    return;
                }
                cAction.m_nAlgo = n3;
            }
        }
        if (cAction.m_nAlgo == 1002) {
            CBattleAction.Algo_002(cBattleWork, cAction);
            return;
        }
        if (cAction.m_nAlgo == 1003) {
            CBattleAction.Algo_003(cBattleWork, cAction);
            return;
        }
        if (cAction.m_nAlgo == 1004) {
            CBattleAction.Algo_004(cBattleWork, cAction);
            return;
        }
        if (CBattleActItem.UseItem(cBattleWork, cAction)) {
            return;
        }
        n2 = cBattleWork.m_Prm.GetMP();
        if (n2 < (n = (cSkillData = Vari.GetSkillData(cAction.m_nAlgo)).GetMP(cBattleWork.m_Prm))) {
            CBattleActCalc.m_Btl.m_SkillWin.OpenWindow("\uff2d\uff30\u304c\u8db3\u308a\u306a\u3044");
            CBattleActCalc.m_Btl.LoopFrame(8);
            return;
        }
        cBattleWork.m_Prm.AddMP(-n);
        if (!Vari.GetSysFlag(2)) {
            CBattleActCalc.m_Btl.m_SkillWin.OpenWindow(cSkillData.m_strName);
        }
        switch (cAction.m_nAlgo) {
            case 16: {
                CBattleAction.Algo_010(cBattleWork, cAction);
                return;
            }
            case 17: {
                CBattleAction.Algo_011(cBattleWork, cAction);
                return;
            }
            case 18: {
                CBattleAction.Algo_012(cBattleWork, cAction);
                return;
            }
            case 19: {
                CBattleAction.Algo_013(cBattleWork, cAction);
                return;
            }
            case 20: {
                CBattleAction.Algo_014(cBattleWork, cAction);
                return;
            }
            case 21: {
                CBattleAction.Algo_015(cBattleWork, cAction);
                return;
            }
            case 22: {
                CBattleAction.Algo_016(cBattleWork, cAction);
                return;
            }
            case 23: {
                CBattleAction.Algo_017(cBattleWork, cAction);
                return;
            }
            case 24: {
                CBattleAction.Algo_018(cBattleWork, cAction);
                return;
            }
            case 25: {
                CBattleAction.Algo_019(cBattleWork, cAction);
                return;
            }
            case 39: {
                CBattleAction.Algo_020(cBattleWork, cAction);
                return;
            }
            case 40: {
                CBattleAction.Algo_021(cBattleWork, cAction);
                return;
            }
            case 41: {
                CBattleAction.Algo_022(cBattleWork, cAction);
                return;
            }
            case 42: {
                CBattleAction.Algo_023(cBattleWork, cAction);
                return;
            }
            case 43: {
                CBattleAction.Algo_024(cBattleWork, cAction);
                return;
            }
            case 44: {
                CBattleAction.Algo_025(cBattleWork, cAction);
                return;
            }
            case 45: {
                CBattleAction.Algo_026(cBattleWork, cAction);
                return;
            }
            case 46: {
                CBattleAction.Algo_027(cBattleWork, cAction);
                return;
            }
            case 47: {
                CBattleAction.Algo_028(cBattleWork, cAction);
                return;
            }
            case 48: {
                CBattleAction.Algo_029(cBattleWork, cAction);
                return;
            }
            case 49: {
                CBattleAction.Algo_029A(cBattleWork, cAction);
                return;
            }
            case 50: {
                CBattleAction.Algo_030(cBattleWork, cAction);
                return;
            }
            case 51: {
                CBattleAction.Algo_031(cBattleWork, cAction);
                return;
            }
            case 52: {
                CBattleAction.Algo_032(cBattleWork, cAction);
                return;
            }
            case 53: {
                CBattleAction.Algo_033(cBattleWork, cAction);
                return;
            }
            case 54: {
                CBattleAction.Algo_034(cBattleWork, cAction);
                return;
            }
            case 55: {
                CBattleAction.Algo_035(cBattleWork, cAction);
                return;
            }
            case 56: {
                CBattleAction.Algo_036(cBattleWork, cAction);
                return;
            }
            case 57: {
                CBattleAction.Algo_037(cBattleWork, cAction);
                return;
            }
            case 58: {
                CBattleAction.Algo_038(cBattleWork, cAction);
                return;
            }
            case 59: {
                CBattleAction.Algo_039(cBattleWork, cAction);
                return;
            }
            case 60: {
                CBattleAction.Algo_040(cBattleWork, cAction);
                return;
            }
            case 61: {
                CBattleAction.Algo_041(cBattleWork, cAction);
                return;
            }
            case 62: {
                CBattleAction.Algo_042(cBattleWork, cAction);
                return;
            }
            case 63: {
                CBattleAction.Algo_043(cBattleWork, cAction);
                return;
            }
            case 64: {
                CBattleAction.Algo_044(cBattleWork, cAction);
                return;
            }
            case 65: {
                CBattleAction.Algo_045(cBattleWork, cAction);
                return;
            }
            case 66: {
                CBattleAction.Algo_046(cBattleWork, cAction);
                return;
            }
            case 67: {
                CBattleAction.Algo_047(cBattleWork, cAction);
                return;
            }
            case 82: {
                CBattleAction.Algo_200(cBattleWork, cAction);
                return;
            }
            case 83: {
                CBattleAction.Algo_201(cBattleWork, cAction);
                return;
            }
            case 84: {
                CBattleAction.Algo_202(cBattleWork, cAction);
                return;
            }
            case 85: {
                CBattleAction.Algo_203(cBattleWork, cAction);
                return;
            }
            case 86: {
                CBattleAction.Algo_204(cBattleWork, cAction);
                return;
            }
            case 87: {
                CBattleAction.Algo_205(cBattleWork, cAction);
                return;
            }
            case 68: {
                CBattleAction.Algo_050(cBattleWork, cAction);
                return;
            }
            case 69: {
                CBattleAction.Algo_051(cBattleWork, cAction);
                return;
            }
            case 70: {
                CBattleAction.Algo_052(cBattleWork, cAction);
                return;
            }
            case 71: {
                CBattleAction.Algo_053(cBattleWork, cAction);
                return;
            }
            case 72: {
                CBattleAction.Algo_054(cBattleWork, cAction);
                return;
            }
            case 73: {
                CBattleAction.Algo_055(cBattleWork, cAction);
                return;
            }
            case 74: {
                CBattleAction.Algo_056(cBattleWork, cAction);
                return;
            }
            case 75: {
                CBattleAction.Algo_057(cBattleWork, cAction);
                return;
            }
            case 76: {
                CBattleAction.Algo_058(cBattleWork, cAction);
                return;
            }
            case 77: {
                CBattleAction.Algo_059(cBattleWork, cAction);
                return;
            }
            case 78: {
                CBattleAction.Algo_060(cBattleWork, cAction);
                return;
            }
            case 79: {
                CBattleAction.Algo_061(cBattleWork, cAction);
                return;
            }
            case 80: {
                CBattleAction.Algo_062(cBattleWork, cAction);
                return;
            }
            case 81: {
                CBattleAction.Algo_063(cBattleWork, cAction);
                return;
            }
            case 134: {
                CBattleAction.Algo_070(cBattleWork, cAction);
                return;
            }
            case 135: {
                CBattleAction.Algo_071(cBattleWork, cAction);
                return;
            }
            case 136: {
                CBattleAction.Algo_072(cBattleWork, cAction);
                return;
            }
            case 137: {
                CBattleAction.Algo_073(cBattleWork, cAction);
                return;
            }
            case 139: {
                CBattleAction.Algo_075(cBattleWork, cAction);
                return;
            }
            case 141: {
                CBattleAction.Algo_077(cBattleWork, cAction);
                return;
            }
            case 142: {
                CBattleAction.Algo_078(cBattleWork, cAction);
                return;
            }
            case 143: {
                CBattleAction.Algo_079(cBattleWork, cAction);
                return;
            }
            case 146: {
                CBattleAction.Algo_080(cBattleWork, cAction);
                return;
            }
            case 115: 
            case 147: {
                CBattleAction.Algo_081(cBattleWork, cAction);
                return;
            }
            case 148: {
                CBattleAction.Algo_083(cBattleWork, cAction);
                return;
            }
            case 150: {
                CBattleAction.Algo_084(cBattleWork, cAction);
                return;
            }
            case 151: {
                CBattleAction.Algo_085(cBattleWork, cAction);
                return;
            }
            case 152: {
                CBattleAction.Algo_087(cBattleWork, cAction);
                return;
            }
            case 154: {
                CBattleAction.Algo_088(cBattleWork, cAction);
                return;
            }
            case 155: {
                CBattleAction.Algo_089(cBattleWork, cAction);
                return;
            }
            case 157: {
                CBattleAction.Algo_090(cBattleWork, cAction);
                return;
            }
            case 158: {
                CBattleAction.Algo_091(cBattleWork, cAction);
                return;
            }
            case 159: {
                CBattleAction.Algo_092(cBattleWork, cAction);
                return;
            }
            case 160: {
                CBattleAction.Algo_093(cBattleWork, cAction);
                return;
            }
            case 164: {
                CBattleAction.Algo_094(cBattleWork, cAction);
                return;
            }
            case 174: {
                CBattleAction.Algo_095(cBattleWork, cAction);
                return;
            }
            case 175: {
                CBattleAction.Algo_096(cBattleWork, cAction);
                return;
            }
            case 176: {
                CBattleAction.Algo_097(cBattleWork, cAction);
                return;
            }
            case 177: {
                CBattleAction.Algo_098(cBattleWork, cAction);
                return;
            }
            case 178: {
                CBattleAction.Algo_099(cBattleWork, cAction);
                return;
            }
            case 179: {
                CBattleAction.Algo_100(cBattleWork, cAction);
                return;
            }
            case 181: {
                CBattleAction.Algo_101(cBattleWork, cAction);
                return;
            }
            case 182: {
                CBattleAction.Algo_102(cBattleWork, cAction);
                return;
            }
            case 185: {
                CBattleAction.Algo_103(cBattleWork, cAction);
                return;
            }
            case 186: {
                CBattleAction.Algo_104(cBattleWork, cAction);
                return;
            }
            case 191: {
                CBattleAction.Algo_105(cBattleWork, cAction);
                return;
            }
            case 193: {
                CBattleAction.Algo_106(cBattleWork, cAction);
                return;
            }
            case 195: {
                CBattleAction.Algo_107(cBattleWork, cAction);
                return;
            }
            case 196: {
                CBattleAction.Algo_108(cBattleWork, cAction);
                return;
            }
            case 197: {
                CBattleAction.Algo_109(cBattleWork, cAction);
                return;
            }
            case 198: {
                CBattleAction.Algo_110(cBattleWork, cAction);
                return;
            }
            case 199: {
                CBattleAction.Algo_111(cBattleWork, cAction);
                return;
            }
            case 200: {
                CBattleAction.Algo_112(cBattleWork, cAction);
                return;
            }
            case 201: {
                CBattleAction.Algo_113(cBattleWork, cAction);
                return;
            }
            case 202: {
                CBattleAction.Algo_114(cBattleWork, cAction);
                return;
            }
            case 203: {
                CBattleAction.Algo_115(cBattleWork, cAction);
                return;
            }
            case 204: {
                CBattleAction.Algo_116(cBattleWork, cAction);
                return;
            }
            case 205: {
                CBattleAction.Algo_117(cBattleWork, cAction);
                return;
            }
            case 206: {
                CBattleAction.Algo_118(cBattleWork, cAction);
                return;
            }
            case 207: {
                CBattleAction.Algo_119(cBattleWork, cAction);
                return;
            }
            case 208: {
                CBattleAction.Algo_058(cBattleWork, cAction);
                CBattleAction.Algo_058(cBattleWork, cAction);
                return;
            }
            case 209: {
                CBattleAction.Algo_121(cBattleWork, cAction);
                return;
            }
            case 144: {
                CBattleAction.Algo_120(cBattleWork, cAction);
                return;
            }
            case 145: {
                CBattleAction.Algo_131(cBattleWork, cAction);
                return;
            }
            case 153: {
                CBattleAction.Algo_133(cBattleWork, cAction);
                return;
            }
            case 26: {
                CBattleAction.Algo_150(cBattleWork, cAction);
                return;
            }
            case 27: {
                CBattleAction.Algo_151(cBattleWork, cAction);
                return;
            }
            case 28: {
                CBattleAction.Algo_152(cBattleWork, cAction);
                return;
            }
            case 29: {
                CBattleAction.Algo_153(cBattleWork, cAction);
                return;
            }
            case 30: {
                CBattleAction.Algo_154(cBattleWork, cAction);
                return;
            }
            case 31: {
                CBattleAction.Algo_155(cBattleWork, cAction);
                return;
            }
            case 32: {
                CBattleAction.Algo_156(cBattleWork, cAction);
                return;
            }
            case 33: {
                CBattleAction.Algo_157(cBattleWork, cAction);
                return;
            }
            case 34: {
                CBattleAction.Algo_158(cBattleWork, cAction);
                return;
            }
            case 35: {
                CBattleAction.Algo_159(cBattleWork, cAction);
                return;
            }
            case 36: {
                CBattleAction.Algo_160(cBattleWork, cAction);
                return;
            }
            case 187: {
                CBattleAction.Algo_170(cBattleWork, cAction);
                return;
            }
            case 188: {
                CBattleAction.Algo_171(cBattleWork, cAction);
                return;
            }
            case 189: {
                CBattleAction.Algo_172(cBattleWork, cAction);
                return;
            }
            case 190: {
                CBattleAction.Algo_173(cBattleWork, cAction);
                return;
            }
            case 194: {
                CBattleAction.Algo_174(cBattleWork, cAction);
                return;
            }
            case 165: {
                CBattleAction.Algo_400(cBattleWork, cAction);
                return;
            }
            case 166: {
                CBattleAction.Algo_401(cBattleWork, cAction);
                return;
            }
            case 167: {
                CBattleAction.Algo_402(cBattleWork, cAction);
                return;
            }
            case 168: {
                CBattleAction.Algo_403(cBattleWork, cAction);
                return;
            }
            case 169: {
                CBattleAction.Algo_410(cBattleWork, cAction);
                return;
            }
            case 170: {
                CBattleAction.Algo_411(cBattleWork, cAction);
                return;
            }
            case 171: {
                CBattleAction.Algo_412(cBattleWork, cAction);
                return;
            }
            case 172: {
                CBattleAction.Algo_413(cBattleWork, cAction);
                return;
            }
            case 112: {
                CBattleAction.Algo_500(cBattleWork, cAction);
                return;
            }
            case 113: {
                CBattleAction.Algo_501(cBattleWork, cAction);
                return;
            }
            case 114: {
                CBattleAction.Algo_502(cBattleWork, cAction);
                return;
            }
            case 163: {
                CBattleAction.Algo_999(cBattleWork, cAction);
                return;
            }
        }
    }

    public static void Algo_028(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        Vari.MakeEffect(5, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(3);
        float f = cBattleWork2.GetHeight() * 0.9f;
        Vari.MakeEffect(68, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), f);
        CBattleActCalc.m_Btl.LoopFrame(18);
        CBattleActCalc.InstantDead(cBattleWork, cBattleWork2, 5);
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_079(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MakeGodLaser(cBattleWork);
        int n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n;
        while (n3 < n2) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.MagicAttack(cBattleWork, cBattleWork2, 50, 1000, 3);
            }
            ++n3;
        }
    }

    public static void Algo_117(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MakeSuikari(cAction);
        CBattleActCalc.AllWeaponAttack(cBattleWork, cAction.m_nObj, 100, 0, 4, 0);
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_084(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActCalc.m_Btl.LoopFrame(4);
        if (cBattleWork.m_nWorkNo == cBattleWork2.m_nWorkNo) {
            CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork.m_vPos, Color.white);
            CBattleActCalc.m_Btl.LoopFrame(16);
            return;
        }
        int n = 0;
        do {
            Vari.MakeEffect(75, cBattleWork.m_vPos, CEfcWork.AngleRand(), cBattleWork2.m_nWorkNo);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 16);
        CBattleActCalc.m_Btl.LoopFrame(16);
        n = cBattleWork2.m_Prm.GetMaxMP() - cBattleWork2.m_Prm.GetMP();
        int n2 = cBattleWork.m_Prm.GetMP();
        if (n > n2) {
            n = n2;
        }
        if (n > 100) {
            n = 100;
        }
        if (n < 0) {
            n = 0;
        }
        cBattleWork.m_Prm.AddMP(-n);
        String string = Calc3D.NumberString2(n, 3);
        CBattleActCalc.m_App.RecTextObj("\uff2d" + string, cBattleWork.m_vPos, Color.white);
        cBattleWork2.m_Prm.AddMP(n);
        string = Calc3D.NumberString2(n, 3);
        CBattleActCalc.m_App.RecTextObj("\uff2d" + string, cBattleWork2.m_vPos, Color.green);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_008(CBattleWork cBattleWork, CAction cAction) {
        CSkillData cSkillData = Vari.GetSkillData(184);
        CBattleActCalc.m_Btl.m_SkillWin.OpenWindow(cSkillData.m_strName);
        CBattleAction.Algo_131(cBattleWork, cAction);
    }

    public static void Algo_020(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        Vari.MakeEffect(5, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(7);
        CBattleActCalc.m_App.PlaySeG(0);
        Vari.MakeEffect(30, cBattleWork2.m_vPos, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(3);
        Vari.MakeEffect(3, cBattleWork2.m_vPos, 0.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleActCalc.MagicAttack(cBattleWork, cBattleWork2, 50, 800, 1);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_036(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        CBattleActEfc.MakeEyeWater(cBattleWork2);
        if (cBattleWork2.m_Prm.GetBlind() > 0) {
            cBattleWork2.m_Prm.ResetBlind();
        } else {
            CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
        }
        CBattleActCalc.m_App.m_Render.SetBright(0.0f);
        CBattleActCalc.m_App.m_Fade.FogOn();
        CBattleActCalc.m_App.m_Fade.AmbientOn();
        CBattleActCalc.m_App.m_Fade.PopLight();
        CBattleFunc.FadeIn(8);
    }

    public static void Algo_155(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
        CBattleActEfc.MakeAirEffect(cBattleWork2);
        int n = 101;
        if (!cBattleWork2.IsPlayer()) {
            n = 102;
        }
        CBattleActCalc.AllWeaponAttack(cBattleWork, n, 60, 0, 2, 0);
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_114(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MakeSMeteor(cAction, 1.0f);
        CBattleActCalc.m_Btl.LoopFrame(6);
        CBattleActCalc.AllWeaponAttack(cBattleWork, cAction.m_nObj, 90, 5000, 7, 2);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_204(CBattleWork cBattleWork, CAction cAction) {
        int n;
        CBattleActEfc.InvokeSong(cBattleWork, 5);
        int n2 = 0;
        do {
            n = 0;
            do {
                D3DXVECTOR3 d3DXVECTOR3 = CBattleActEfc.GetPartySongPos(cAction);
                Vari.MakeEffect(99, d3DXVECTOR3, 0.0f, 0.0f);
            } while (++n < 5);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n2 < 9);
        CBattleActCalc.m_Btl.LoopFrame(4);
        n2 = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        n = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n2;
        while (n3 < n) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                int n4 = Calc3D.Rand(cBattleWork.m_Prm.m_nLV) + cBattleWork.m_Prm.m_nLV;
                cBattleWork2.m_Prm.AddMP(n4);
                CBattleActCalc.SetNumberObject(cBattleWork2, n4, 3);
            }
            ++n3;
        }
        CBattleActCalc.m_Btl.LoopFrame(4);
    }

    public static void Algo_039(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        CBattleActCalc.m_App.PlaySeG(10);
        Vari.MakeEffect(10, cBattleWork2.m_vPos, 2.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(8);
        if (cBattleWork2.IsAlive()) {
            CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
        } else {
            Vari.MakeEffect(64, cBattleWork2.m_vPos, 2.0f, cBattleWork2.m_Chr.m_fHitSize * 2.0f);
            CBattleActCalc.ReviveChr(cBattleWork2);
            CBattleActCalc.MagicHeal(cBattleWork, cBattleWork2, 70);
        }
        CBattleActCalc.m_Btl.LoopFrame(8);
        Vari.HealFlag(cBattleWork.m_nWorkNo);
    }

    public static void Algo_027(CBattleWork cBattleWork, CAction cAction) {
        D3DXVECTOR3 d3DXVECTOR3 = CBattleActEfc.GetOnmyoCenter(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        Vari.MakeEffect(5, d3DXVECTOR3, CBattleActEfc.GetOnmyoVect(cAction.m_nObj), 100.0f);
        CBattleActCalc.m_Btl.LoopFrame(5);
        CBattleActEfc.MakeAllThunder(cAction);
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        int n = 0;
        do {
            int n2 = 0;
            do {
                d3DXVECTOR32.x = d3DXVECTOR3.x + (float)Calc3D.Rand(600) - 300.0f;
                d3DXVECTOR32.z = d3DXVECTOR3.z + (float)Calc3D.Rand(300) - 150.0f;
                Vari.MakeEffect(101, d3DXVECTOR32, 2.0f, 0.0f);
            } while (++n2 < 4);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 10);
        CBattleActCalc.AllMagicAttack(cBattleWork, cAction.m_nObj, 50, 4400, 6);
    }

    public static void Algo_081(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakePain(cBattleWork2);
        CBattleActCalc.MagicAttack(cBattleWork, cBattleWork2, 50, 1500, 3);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_098(CBattleWork cBattleWork, CAction cAction) {
        CBattleFunc.FadeOut(8);
        Vari.m_SysFlag.SetFlag(4);
        CBattleActCalc.m_App.m_Play.SetEvtFlag(331);
        CBattleFunc.FadeIn(8);
    }

    public static void Algo_999(CBattleWork cBattleWork, CAction cAction) {
        CAction cAction2 = new CAction();
        cAction2.Set(Vari.m_ActOld);
        if (Vari.m_ActOld.m_nAlgo == 163) {
            cAction2.m_nAlgo = 1001;
        }
        block0 : switch (cAction2.m_nAlgo) {
            case 1001: {
                cAction2.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 2001: {
                cAction2.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
                break;
            }
            case 2002: {
                cAction2.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
                break;
            }
            case 2006: {
                cAction2.m_nObj = CBattleEnemy.SelectDeadEnemy1(cBattleWork);
                if (cAction2.m_nObj != -1) break;
                cAction2.m_nObj = cBattleWork.m_nWorkNo;
                break;
            }
            case 2010: 
            case 2011: 
            case 2013: {
                cAction2.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 2012: {
                cAction2.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            default: {
                CSkillData cSkillData = Vari.GetSkillData(cAction2.m_nAlgo);
                switch (cSkillData.m_nObject) {
                    case 1: {
                        cAction2.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
                        break block0;
                    }
                    case 2: {
                        cAction2.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                        break block0;
                    }
                    case 3: 
                    case 7: {
                        cAction2.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
                        break block0;
                    }
                    case 4: 
                    case 8: {
                        cAction2.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                        break block0;
                    }
                    case 5: {
                        cAction2.m_nObj = cBattleWork.m_nWorkNo;
                        break block0;
                    }
                    case 6: {
                        cAction2.m_nObj = CBattleEnemy.SelectDeadEnemy1(cBattleWork);
                        if (cAction2.m_nObj != -1) break block0;
                        cAction2.m_nObj = cBattleWork.m_nWorkNo;
                    }
                }
            }
        }
        Vari.SetSysFlag(2);
        CBattleAction.Action(cBattleWork, cAction2);
        Vari.ResetSysFlag(2);
    }

    public static void Algo_410(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MakeUltiEffect(0);
        CBattleActCalc.AllDamage(cAction.m_nObj, 9999, 1);
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleActEfc.ResetAbLightColor();
    }

    public static void Algo_007(CBattleWork cBattleWork, CAction cAction) {
        CSkillData cSkillData = Vari.GetSkillData(183);
        CBattleActCalc.m_Btl.m_SkillWin.OpenWindow(cSkillData.m_strName);
        CBattleAction.Algo_059(cBattleWork, cAction);
    }

    public static void Algo_061(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MakeMeteor(cBattleWork, cAction.m_nObj, 200, 7000);
        CBattleActCalc.m_Btl.LoopFrame(4);
    }

    public static void Algo_201(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2;
        int n;
        CBattleActEfc.InvokeSong(cBattleWork, 0);
        int n2 = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n3 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n4 = 0;
        do {
            n = n2;
            while (n < n3) {
                cBattleWork2 = Vari.GetBChrWork(n);
                if (cBattleWork2.IsAttack()) {
                    Vari.MakeEffect(94, cBattleWork2.m_vPos, 0.0f, 0.0f);
                }
                ++n;
            }
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n4 < 10);
        CBattleActCalc.m_Btl.LoopFrame(4);
        n4 = n2;
        while (n4 < n3) {
            cBattleWork2 = Vari.GetBChrWork(n4);
            if (cBattleWork2.IsAttack()) {
                n = Calc3D.Rand(cBattleWork.m_Prm.m_nLV) + cBattleWork.m_Prm.m_nLV;
                if (cBattleWork2.m_Prm.m_nMP < n) {
                    n = cBattleWork2.m_Prm.m_nMP;
                }
                cBattleWork2.m_Prm.AddMP(-n);
                CBattleActCalc.SetNumberObject(cBattleWork2, -n, 3);
            }
            ++n4;
        }
    }

    public static void Algo_090(CBattleWork cBattleWork, CAction cAction) {
        Vari.MakeEffect(84, cBattleWork.m_vPos, cAction.m_nObj, 1.0f);
        CBattleActCalc.m_App.PlaySeG(1);
        CBattleActCalc.m_Btl.LoopFrame(22);
        int n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n;
        while (n3 < n2) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.Paralysis(cBattleWork, cBattleWork2, 60);
            }
            ++n3;
        }
    }

    public static void Algo_106(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MakeSMeteor(cAction, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(6);
        CBattleActCalc.AllWeaponAttack(cBattleWork, cAction.m_nObj, 120, 6500, 4, 2);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_111(CBattleWork cBattleWork, CAction cAction) {
        int n;
        CAction cAction2 = new CAction();
        int n2 = 0;
        while ((n = CBattleActCalc.SelectGroup1(cAction.m_nObj)) != -1) {
            cAction2.m_nObj = n;
            CBattleAction.Algo_062(cBattleWork, cAction2);
            if (++n2 < 5) continue;
        }
    }

    public static void Algo_024(CBattleWork cBattleWork, CAction cAction) {
        D3DXVECTOR3 d3DXVECTOR3 = CBattleActEfc.GetOnmyoCenter(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        Vari.MakeEffect(5, d3DXVECTOR3, CBattleActEfc.GetOnmyoVect(cAction.m_nObj), 100.0f);
        CBattleActCalc.m_Btl.LoopFrame(5);
        Vari.MakeEffect(41, cBattleWork.m_vPos, cAction.m_nObj, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(20);
        int n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n;
        while (n3 < n2) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.Blind(cBattleWork, cBattleWork2);
            }
            ++n3;
        }
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_205_00(CBattleWork cBattleWork, CAction cAction) {
        int n = 101;
        if (!cBattleWork.IsPlayer()) {
            n = 102;
        }
        CBattleActCalc.m_App.PlaySeG(14);
        int n2 = CBattleActCalc.GetGroupStart(n);
        int n3 = CBattleActCalc.GetGroupEnd(n);
        int n4 = n2;
        while (n4 < n3) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n4);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.MakeShield(cBattleWork2, 0);
                CBattleActCalc.SetShield(cBattleWork, cBattleWork2);
            }
            ++n4;
        }
        CBattleActCalc.m_Btl.LoopFrame(10);
        CAction cAction2 = new CAction();
        cAction2.m_nObj = n;
        CBattleActEfc.AllWShield(cBattleWork, cAction2);
        CBattleActCalc.m_Btl.LoopFrame(10);
        CBattleActEfc.AllAShield(cBattleWork, cAction2);
        CBattleActCalc.m_Btl.LoopFrame(10);
    }

    public static void Algo_046(CBattleWork cBattleWork, CAction cAction) {
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleActCalc.m_App.PlaySeG(26);
        Vari.MakeEffect(80, cBattleWork.m_vPos, 1.5707964f, 0.0f);
        Vari.MakeEffect(80, cBattleWork.m_vPos, (float)Math.PI, 0.0f);
        Vari.MakeEffect(80, cBattleWork.m_vPos, 4.712389f, 0.0f);
        Vari.MakeEffect(80, cBattleWork.m_vPos, (float)Math.PI * 2, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleFunc.WhiteIn(8);
        CBattleActEfc.SummonOn(cBattleWork);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(cBattleWork.m_vPos);
        d3DXVECTOR3.x = 0.0f;
        Vari.MakeEffect(109, d3DXVECTOR3, cBattleWork.m_vRol.y, 0.0f);
        Vari.m_nQuake = 20;
        CBattleFunc.WhiteOut(8);
        CBattleActCalc.m_Btl.SetCameraVect2(0.47123894f);
        int n = 0;
        do {
            Vari.MakeEffect(110, d3DXVECTOR3, 0.0f, 0.0f);
            CBattleActCalc.m_Btl.LoopFrame(2);
        } while (++n < 12);
        CBattleActCalc.m_Btl.LoopFrame(6);
        CBattleActCalc.m_App.PlaySeG(4);
        Vari.m_nQuake = 16;
        n = 0;
        do {
            Vari.MakeEffect(73, d3DXVECTOR3, 0.0f, 0.0f);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 8);
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleFunc.WhiteIn(8);
        CBattleActEfc.SummonOff(cBattleWork);
        CBattleFunc.WhiteOut(8);
        CBattleActEfc.AllGolem(cBattleWork, cAction);
    }

    public static void Algo_109(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeNight(cBattleWork2);
        int n = 999;
        if (cBattleWork2.m_Prm.m_nMP < n) {
            n = cBattleWork2.m_Prm.m_nMP;
        }
        cBattleWork2.m_Prm.AddMP(-n);
        CBattleActCalc.SetNumberObject(cBattleWork2, -n, 3);
    }

    public static void Algo_004(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 75, 0, 0, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(4);
        CBattleActCalc.Steal(cBattleWork, cBattleWork2, 80);
        CBattleActEfc.MoveBack(cBattleWork);
    }

    public static void Algo_058(CBattleWork cBattleWork, CAction cAction) {
        int n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n;
        while (n3 < n2) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActEfc.Vampire(cBattleWork, cBattleWork2);
            }
            ++n3;
        }
        CBattleActCalc.m_Btl.LoopFrame(8);
        Vari.HealFlag(cBattleWork.m_nWorkNo);
    }

    public static void Algo_097(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MakeAllThunder(cAction);
        CBattleActCalc.AllWeaponAttack(cBattleWork, cAction.m_nObj, 130, 0, 6, 0);
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_015(CBattleWork cBattleWork, CAction cAction) {
        CBattleActCalc.m_Btl.LoopFrame(4);
        Vari.m_nQuake = 16;
        CBattleActCalc.m_App.PlaySeG(15);
        int n = 0;
        do {
            Vari.MakeEffect(73, cBattleWork.m_vPos, 0.0f, 0.0f);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 8);
        CBattleActEfc.AddDefense(cBattleWork, cAction, -1);
        CBattleActCalc.m_Btl.LoopFrame(4);
    }

    public static void Algo_021(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        Vari.MakeEffect(5, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(7);
        Vari.MakeEffect(7, cBattleWork2.m_vPos, 0.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(12);
        CBattleActCalc.m_App.RecTextObj("\u904b\u2191", cBattleWork2.m_vPos, Color.green);
        cBattleWork2.m_Prm.SetLuck();
        CBattleActCalc.m_Btl.LoopFrame(12);
    }

    public static void Algo_205_07(CBattleWork cBattleWork, CAction cAction) {
        CAction cAction2 = new CAction();
        cAction2.m_nObj = 102;
        if (!cBattleWork.IsPlayer()) {
            cAction2.m_nObj = 101;
        }
        CBattleAction.Algo_047(cBattleWork, cAction2);
    }

    public static void Algo_050(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        Vari.MakeEffect(13, cBattleWork2.m_vPos, 0.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_App.PlaySeG(21);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CChrParam cChrParam = cBattleWork2.m_Prm;
        int n = -((cChrParam.GetAgi_Base() + cChrParam.GetAgi_Item()) * 20 / 100);
        if (n < cChrParam.GetAgi_Btl()) {
            cChrParam.SetAgi_Btl(n);
            CBattleActCalc.m_App.RecTextObj("\u7d20\u65e9\u3055\u2193", cBattleWork2.m_vPos, Color.white);
        } else {
            CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
        }
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_094(CBattleWork cBattleWork, CAction cAction) {
        CBattleActCalc.m_Btl.LoopFrame(6);
        int n = 0;
        do {
            CBattleActCalc.m_App.PlaySeG(16);
            Vari.MakeEffect(77, cBattleWork.m_vPos, cAction.m_nObj, (float)(n & true));
            CBattleActCalc.m_Btl.LoopFrame(6);
            CBattleActCalc.AllWeaponAttack(cBattleWork, cAction.m_nObj, 95, 0, 0, 0);
            CBattleActCalc.m_Btl.CheckDead();
        } while (++n < 4);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_001(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, Vari.GetBChrWork(cAction.m_nObj), 100, 0, 0, 0, 1);
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_062(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(cBattleWork2.m_vPos);
        d3DXVECTOR3.y = 150.0f;
        D3DLIGHT8 d3DLIGHT8 = new D3DLIGHT8();
        d3DLIGHT8.m_nType = 1;
        d3DLIGHT8.m_vPosition.Set(d3DXVECTOR3);
        d3DLIGHT8.m_vDirection.Set(d3DXVECTOR3);
        d3DLIGHT8.m_fRange = 0.0f;
        D3DLIGHT8 d3DLIGHT82 = new D3DLIGHT8();
        d3DLIGHT82.Set(d3DLIGHT8);
        d3DLIGHT82.m_cDiffuse.r = 32;
        d3DLIGHT82.m_cDiffuse.g = 32;
        d3DLIGHT82.m_cDiffuse.b = 255;
        d3DLIGHT82.m_fRange = 2000.0f;
        CBattleActCalc.m_App.m_Fade.PushLight();
        CBattleFunc.FadeOut(8);
        CBattleActCalc.m_App.m_Fade.FogOff();
        CBattleActCalc.m_App.m_Fade.AmbientOff();
        CBattleActCalc.m_App.m_Render.SetBright(1.0f);
        CBattleActCalc.m_App.m_Render.SetLight(d3DLIGHT8);
        CBattleActCalc.m_App.PlaySeG(17);
        CBattleActCalc.m_App.m_Fade.XChgColor(d3DLIGHT8, d3DLIGHT82, 16);
        int n = 0;
        do {
            if (n == 0) {
                Vari.MakeEffect(63, d3DXVECTOR3, 0.2f, 1.0f);
            }
            if (n == 4) {
                Vari.MakeEffect(63, d3DXVECTOR3, -0.2f, 1.0f);
            }
            Vari.MakeEffect(83, d3DXVECTOR3, 0.0f, 0.0f);
            Vari.MakeEffect(83, d3DXVECTOR3, 0.0f, 0.0f);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 16);
        CBattleActCalc.m_App.m_Fade.XChgColor(d3DLIGHT82, d3DLIGHT8, 16);
        CBattleActCalc.m_Btl.LoopFrame(16);
        CBattleActCalc.m_App.m_Render.SetBright(0.0f);
        CBattleActCalc.m_App.m_Fade.FogOn();
        CBattleActCalc.m_App.m_Fade.AmbientOn();
        CBattleActCalc.m_App.m_Fade.PopLight();
        CBattleFunc.FadeIn(8);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 200, 12000, 7, 2, 0);
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_202(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2;
        CBattleActEfc.InvokeSong(cBattleWork, 3);
        int n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n;
        while (n3 < n2) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                float f = 0.0f;
                int n4 = 0;
                do {
                    Vari.MakeEffect(95, cBattleWork2.m_vPos, f, 0.0f);
                    f += Calc3D.DEGtoRAD(60.0f);
                } while (++n4 < 6);
            }
            ++n3;
        }
        CBattleActCalc.m_Btl.LoopFrame(8);
        n3 = n;
        while (n3 < n2) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                if (cBattleWork2.m_Prm.GetConf() > 0) {
                    cBattleWork2.ResetConfusion();
                } else {
                    CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
                }
            }
            ++n3;
        }
    }

    public static void Algo_112(CBattleWork cBattleWork, CAction cAction) {
        int n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n;
        while (n3 < n2) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (!cBattleWork2.IsAlive()) {
                CBattleActCalc.ReviveChr(cBattleWork2);
            }
            CBattleActCalc.MagicHeal(cBattleWork, cBattleWork2, 1000);
            CBattleActCalc.MakeShield(cBattleWork2, 0);
            CBattleActCalc.SetShield(cBattleWork, cBattleWork2);
            ++n3;
        }
        n3 = 0;
        do {
            CBattleAction.Algo_012(cBattleWork, cAction);
            CBattleAction.Algo_200(cBattleWork, cAction);
        } while (++n3 < 3);
        CBattleAction.Algo_046(cBattleWork, cAction);
    }

    public static void Algo_078(CBattleWork cBattleWork, CAction cAction) {
        CBattleActCalc.m_Btl.LoopFrame(6);
        CBattleActCalc.m_App.PlaySeG(4);
        Vari.MakeEffect(50, cBattleWork.m_vPos, cBattleWork.GetDispVect(), 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(16);
        CBattleActCalc.AllWeaponAttack(cBattleWork, cAction.m_nObj, 150, 0, 2, 0);
    }

    public static void Algo_205_04(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2;
        int n = 0;
        int n2 = 9;
        CBattleActCalc.m_App.PlaySeG(10);
        int n3 = n;
        while (n3 < n2) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsUse()) {
                if (cBattleWork2.IsAlive()) {
                    Vari.MakeEffect(24, cBattleWork2.m_vPos, 2.0f, cBattleWork2.m_Chr.m_fHitSize);
                } else {
                    Vari.MakeEffect(10, cBattleWork2.m_vPos, 2.0f, cBattleWork2.m_Chr.m_fHitSize);
                }
            }
            ++n3;
        }
        n3 = n;
        while (n3 < n2) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsUse() && cBattleWork2.IsAlive()) {
                CBattleActCalc.MagicHeal(cBattleWork, cBattleWork2, 1000);
            }
            ++n3;
        }
        n3 = n;
        while (n3 < n2) {
            cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsUse() && !cBattleWork2.IsAlive()) {
                CBattleActCalc.ReviveChr(cBattleWork2);
                CBattleActCalc.MagicHeal(cBattleWork, cBattleWork2, 1000);
            }
            ++n3;
        }
        CBattleActCalc.m_Btl.LoopFrame(6);
    }

    public static void Algo_057(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.RandAttack(cBattleWork, cAction, 4, 4);
    }

    public static void Algo_411(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.MakeUltiEffect(1);
        CBattleActCalc.AllDamage(cAction.m_nObj, 9999, 5);
        CBattleActCalc.m_Btl.CheckDead();
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleActEfc.ResetAbLightColor();
    }

    public static void MoveBackSword(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        int n = CBattleActEfc.CheckBackSwordSkill(cBattleWork, cAction);
        if (n == 37) {
            CBattleAction.Algo_161(cBattleWork, cAction);
        } else if (n == 38) {
            CBattleAction.Algo_162(cBattleWork, cAction);
        } else {
            CBattleActEfc.MoveBack(cBattleWork);
        }
        if (cBattleWork.m_Prm.m_Abi.GetFlag(106) && cBattleWork.IsMove()) {
            CBattleAction.Algo_005(cBattleWork, cAction);
        }
        if (cBattleWork.IsSuika() && cBattleWork.IsMove()) {
            CBattleAction.Algo_117(cBattleWork, cAction);
        }
        if (cBattleWork2.IsMove() && cBattleWork.IsPlayer() != cBattleWork2.IsPlayer() && cBattleWork.m_nWorkNo != cBattleWork2.m_nWorkNo && !cBattleWork2.m_Prm.GetDefense() && !cBattleWork2.m_Prm.GetDefense2() && !Vari.IsStopWorld(cBattleWork2.m_nWorkNo)) {
            if (cBattleWork2.m_Prm.m_Abi.GetFlag(109)) {
                CAction cAction2 = new CAction();
                cAction2.m_nObj = cBattleWork.m_nWorkNo;
                CBattleAction.Algo_006(cBattleWork2, cAction2);
                return;
            }
            if (cBattleWork2.m_Prm.m_Abi.GetFlag(183)) {
                CAction cAction3 = new CAction();
                cAction3.m_nObj = cBattleWork.m_nWorkNo;
                CBattleAction.Algo_007(cBattleWork2, cAction3);
            }
        }
    }

    public static void Algo_156(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
        CBattleActCalc.m_App.PlaySeG(12);
        Vari.MakeEffect(16, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(16);
        if (cBattleWork2.IsAlive()) {
            CBattleActCalc.Confusion(cBattleWork, cBattleWork2, 15);
        }
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }

    public static void Algo_083(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        Vari.MakeEffect(72, cBattleWork2.m_vPos, cAction.m_nObj, cBattleWork.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(18);
        CAbility cAbility = cBattleWork2.m_Prm.m_Abi;
        if (!cAbility.GetFlag(95) && !cAbility.GetFlag(133)) {
            CBattleActCalc.m_App.PlaySeG(13);
            cBattleWork2.SetClose();
        } else {
            CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
        }
        CBattleActCalc.m_Btl.LoopFrame(4);
    }

    public static void Algo_070(CBattleWork cBattleWork, CAction cAction) {
        CBattleActCalc.m_Btl.LoopFrame(6);
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeClock(cBattleWork2.m_vPos, true);
        CBattleActCalc.m_Btl.LoopFrame(2);
        CBattleActCalc.Paralysis(cBattleWork, cBattleWork2, 85);
    }

    public static void Algo_091(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        if (cBattleWork.m_nWorkNo == cBattleWork2.m_nWorkNo) {
            CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
            return;
        }
        float f = Calc3D.CalcAngleXZ(cBattleWork2.m_vPos, cBattleWork.m_vPos);
        int n = 0;
        do {
            int n2 = Calc3D.Rand(360) - 180;
            Vari.MakeEffect(14, cBattleWork2.m_vPos, Calc3D.RadLimits(f + Calc3D.DEGtoRAD(n2)), cBattleWork.m_nWorkNo);
            CBattleActCalc.m_Btl.LoopFrame(2);
        } while (++n < 8);
        CBattleActCalc.m_Btl.LoopFrame(14);
        n = CBattleActCalc.CalcWeaponDamage(cBattleWork, cBattleWork2, 250, 0, 0);
        n = n * cBattleWork2.GetAttPer(0) / 100;
        if (n > cBattleWork2.m_Prm.m_nHP) {
            n = cBattleWork2.m_Prm.m_nHP;
        }
        if (n < 0) {
            n = 0;
        }
        cBattleWork.AddHP(n);
        CBattleActCalc.SetNumberObject(cBattleWork, n, 2);
        cBattleWork2.AddHP(-n);
        CBattleActCalc.SetNumberObject(cBattleWork2, -n, 0);
        CBattleActCalc.m_Btl.CheckDead();
    }

    public static void Algo_022(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MakeMagicEffect(cBattleWork);
        Vari.MakeEffect(5, cBattleWork2.m_vPos, cBattleWork2.GetDispVect(), cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(7);
        Vari.MakeEffect(9, cBattleWork2.m_vPos, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(6);
        CBattleActCalc.Poison(cBattleWork, cBattleWork2);
        CBattleActCalc.m_Btl.LoopFrame(15);
    }

    public static void Algo_054(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.WindHeal(cBattleWork, cAction, 70);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void Algo_205_01(CBattleWork cBattleWork, CAction cAction) {
        CBattleActCalc.m_App.PlaySeG(12);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        int n = 0;
        do {
            CBattleActEfc.MakePiyo(d3DXVECTOR3, 600.0f, 500.0f, 4);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 7);
        CBattleActCalc.m_Btl.LoopFrame(4);
        n = 0;
        int n2 = 9;
        int n3 = n;
        while (n3 < n2) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAlive()) {
                CBattleActCalc.Confusion(cBattleWork, cBattleWork2, 50);
            }
            ++n3;
        }
        CBattleActCalc.m_Btl.LoopFrame(6);
    }

    public static void Algo_203(CBattleWork cBattleWork, CAction cAction) {
        CBattleActEfc.InvokeSong(cBattleWork, 1);
        int n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = 0;
        do {
            int n4 = n;
            while (n4 < n2) {
                CBattleWork cBattleWork2 = Vari.GetBChrWork(n4);
                if (cBattleWork2.IsAttack()) {
                    Vari.MakeEffect(96, cBattleWork2.m_vPos, n4, 0.0f);
                }
                ++n4;
            }
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n3 < 10);
        CBattleActEfc.AllAShield(cBattleWork, cAction);
        CBattleActCalc.m_Btl.LoopFrame(6);
    }

    public static void Algo_159(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        CBattleActEfc.MoveFront(cBattleWork);
        CBattleActCalc.WeaponAttack(cBattleWork, Vari.GetBChrWork(cAction.m_nObj), 100, 0, 0, 0, 1);
        int n = 0;
        do {
            Vari.MakeEffect(28, cBattleWork2.m_vPos, 0.0f, 0.0f);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 12);
        if (cBattleWork2.IsAlive()) {
            CBattleActCalc.MagicAttack(cBattleWork, cBattleWork2, 50, 3500, 3);
        }
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleAction.MoveBackSword(cBattleWork, cAction);
    }
}

