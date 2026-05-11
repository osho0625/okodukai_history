/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CBattleActEfc
extends CBattleActCalc {
    static final int[] m_anSCSword1 = new int[]{26, 27, 30, 29, 33};
    static final int[] m_anSCSword2 = new int[]{28, 32, 31, 34, 36};
    static final int[] m_anSCCombo = new int[]{187, 188, 189, 190, 194};

    public static void AllAShield(CBattleWork cBattleWork, CAction cAction) {
        int n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n;
        while (n3 < n2) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.MakeAShield(cBattleWork2, 0);
                int n4 = cBattleWork.m_Prm.GetInt();
                int n5 = Calc3D.Rand(n4 / 2) / 6;
                cBattleWork2.m_Prm.SetAShield(n5 += n4 / 5);
            }
            ++n3;
        }
    }

    public static void MakeStorm(D3DXVECTOR3 d3DXVECTOR3) {
        CBattleActCalc.m_App.PlaySeG(4);
        int n = 0;
        do {
            int n2 = 0;
            do {
                Vari.MakeEffect(112, d3DXVECTOR3, (float)n2 * 30.0f, 0.0f);
            } while (++n2 < 8);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 8);
        CBattleActCalc.m_Btl.LoopFrame(16);
    }

    public static void Move_Defense(CBattleWork cBattleWork) {
        float f = 12.0f;
        if (!cBattleWork.IsPlayer()) {
            f = -12.0f;
        }
        int n = 0;
        do {
            cBattleWork.m_vPos.z -= f;
            CBattleActCalc.m_Btl.DoFrame();
        } while (++n < 4);
    }

    public static void RandAttack(CBattleWork cBattleWork, CAction cAction, int n, int n2) {
        new D3DXVECTOR3();
        CBattleActEfc.MoveFront(cBattleWork);
        int n3 = 0;
        while (n3 < n) {
            int n4 = CBattleActCalc.SelectGroup1(cAction.m_nObj);
            if (n4 == -1) break;
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n4);
            CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
            CBattleActCalc.m_Btl.LoopFrame(n2);
            ++n3;
        }
        CBattleActEfc.MoveBack(cBattleWork);
    }

    public static void MoveFront(CBattleWork cBattleWork) {
        float[] fArray = new float[]{20.0f, 10.0f, -10.0f, -20.0f};
        int n = 0;
        do {
            cBattleWork.m_vPos.x += Calc3D.Sin(cBattleWork.m_vRol.y) * 15.0f;
            cBattleWork.m_vPos.y += fArray[n];
            cBattleWork.m_vPos.z += Calc3D.Cos(cBattleWork.m_vRol.y) * 15.0f;
            CBattleActCalc.m_Btl.DoFrame();
        } while (++n < 4);
    }

    public static void MoveBack2(CBattleWork cBattleWork) {
        float f = 15.0f;
        if (!cBattleWork.IsPlayer()) {
            f = -15.0f;
        }
        int n = 0;
        do {
            cBattleWork.m_vPos.z -= f;
            CBattleActCalc.m_Btl.DoFrame();
        } while (++n < 8);
        cBattleWork.m_vPos.Set(cBattleWork.m_vStart);
    }

    public static D3DXVECTOR3 GetPartySongPos(CAction cAction) {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.z = cAction.m_nObj == 101 ? -230.0f : 230.0f;
        d3DXVECTOR3.x += (float)(Calc3D.Rand(600) - 300);
        d3DXVECTOR3.z += (float)(Calc3D.Rand(200) - 100);
        return d3DXVECTOR3;
    }

    public static int CheckSwordSkill(CBattleWork cBattleWork, CAction cAction) {
        int n;
        int n2;
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        int n3 = cBattleWork.m_Prm.GetDex();
        int n4 = cBattleWork2.m_Prm.GetDex();
        CAbility cAbility = cBattleWork.m_Prm.m_Abi;
        int n5 = 11;
        int[] nArray = new int[n5];
        int n6 = 0;
        while (n6 < n5) {
            nArray[n6] = n6 + 26;
            ++n6;
        }
        n6 = 0;
        do {
            n2 = Calc3D.Rand(n5);
            n = Calc3D.Rand(n5);
            int n7 = nArray[n2];
            nArray[n2] = nArray[n];
            nArray[n] = n7;
        } while (++n6 < 32);
        int n8 = 100;
        if (cAbility.GetFlag(110)) {
            n8 = 140;
        }
        n6 = 0;
        while (n6 < n5) {
            int n9 = nArray[n6];
            if (cAbility.GetFlag(n9) && (n2 = (Calc3D.Rand(n3 * 2) + n3) * n8) > (n = (Calc3D.Rand(n4 * 2) + n4) * 200)) {
                return n9;
            }
            ++n6;
        }
        return -1;
    }

    public static void MakeIce(CBattleWork cBattleWork) {
        Vari.MakeEffect(89, cBattleWork.m_vPos, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(4);
        Vari.MakeEffect(89, cBattleWork.m_vPos, 1.0f, 0.0f);
        CBattleActCalc.m_App.PlaySeG(13);
        Vari.MakeEffect(90, cBattleWork.m_vPos, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(4);
    }

    public static void MakeMagicEffect(CBattleWork cBattleWork) {
        CBattleActCalc.m_App.PlaySeG(27);
        Vari.MakeEffect(1, cBattleWork.m_vPos, 0.0f, cBattleWork.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(12);
    }

    public static void MoveBackRol(CBattleWork cBattleWork) {
        float f = cBattleWork.m_vRol.y;
        int n = 0;
        do {
            cBattleWork.m_vRol.y += 1.5707964f;
            cBattleWork.m_vPos.x -= Calc3D.Sin(f) * 15.0f;
            cBattleWork.m_vPos.z -= Calc3D.Cos(f) * 15.0f;
            CBattleActCalc.m_Btl.DoFrame();
        } while (++n < 4);
        cBattleWork.m_vRol.y = f;
        cBattleWork.m_vPos.Set(cBattleWork.m_vStart);
    }

    public static void AddDefense(CBattleWork cBattleWork, CAction cAction, int n) {
        int n2 = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n3 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n4 = CBattleActEfc.GetDefenseUp(cBattleWork) * n;
        int n5 = n4 * 3;
        int n6 = n2;
        while (n6 < n3) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n6);
            if (cBattleWork2.IsAttack()) {
                int n7 = cBattleWork2.m_Prm.GetDef_Btl();
                if (n < 0) {
                    if (n7 > n5) {
                        if ((n7 += n4) < n5) {
                            n7 = n5;
                        }
                        cBattleWork2.m_Prm.SetDef_Btl(n7);
                        CBattleActCalc.m_App.RecTextObj("\u9632\u5fa1\u529b\u2193", cBattleWork2.m_vPos, Color.white);
                    } else {
                        CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
                    }
                } else if (n7 < n5) {
                    if ((n7 += n4) > n5) {
                        n7 = n5;
                    }
                    cBattleWork2.m_Prm.SetDef_Btl(n7);
                    CBattleActCalc.m_App.RecTextObj("\u9632\u5fa1\u529b\u2191", cBattleWork2.m_vPos, Color.green);
                } else {
                    CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
                }
            }
            ++n6;
        }
        CBattleActCalc.m_Btl.LoopFrame(4);
    }

    public static void MakeUltiEffect(int n) {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.y = 100.0f;
        int n2 = 0;
        do {
            int n3 = 0;
            do {
                d3DXVECTOR3.x = Calc3D.Rand(800) - 400;
                d3DXVECTOR3.z = Calc3D.Rand(500) - 100;
                Vari.MakeEffect(88, d3DXVECTOR3, 0.0f, n);
            } while (++n3 < 2);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n2 < 32);
    }

    public static void MakePain(CBattleWork cBattleWork) {
        CBattleActCalc.m_Btl.LoopFrame(8);
        CBattleActCalc.m_App.PlaySeG(20);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(cBattleWork.m_vPos);
        Vari.MakeEffect(3, d3DXVECTOR3, 1.0f, cBattleWork.m_Chr.m_fHitSize);
        d3DXVECTOR3.y += 50.0f;
        Vari.MakeEffect(3, d3DXVECTOR3, 1.0f, cBattleWork.m_Chr.m_fHitSize);
        d3DXVECTOR3.y += 50.0f;
        Vari.MakeEffect(3, d3DXVECTOR3, 1.0f, cBattleWork.m_Chr.m_fHitSize);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void SetAbLightColor(int n, int n2, int n3) {
        D3DLIGHT8 d3DLIGHT8 = new D3DLIGHT8();
        d3DLIGHT8.m_nType = 1;
        d3DLIGHT8.m_fRange = 0.0f;
        d3DLIGHT8.m_Flag.SetFlag(1);
        D3DLIGHT8 d3DLIGHT82 = new D3DLIGHT8();
        d3DLIGHT82.m_nType = 1;
        d3DLIGHT82.m_cDiffuse.r = n;
        d3DLIGHT82.m_cDiffuse.g = n2;
        d3DLIGHT82.m_cDiffuse.b = n3;
        d3DLIGHT82.m_fRange = 1500.0f;
        d3DLIGHT82.m_Flag.SetFlag(1);
        CBattleActCalc.m_App.m_Fade.PushLight();
        CBattleFunc.FadeOut(8);
        CBattleActCalc.m_App.m_Fade.FogOff();
        CBattleActCalc.m_App.m_Fade.AmbientOff();
        CBattleActCalc.m_App.m_Render.SetBright(1.0f);
        CBattleActCalc.m_App.m_Render.SetLight(d3DLIGHT8);
        CBattleActCalc.m_App.m_Fade.XChgColor(d3DLIGHT8, d3DLIGHT82, 16);
    }

    public static void InvokeSong(CBattleWork cBattleWork, int n) {
        CBattleActCalc.m_App.PlaySeG(9);
        float f = 0.0f;
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(cBattleWork.m_vPos);
        d3DXVECTOR3.y = 100.0f;
        int n2 = n;
        int n3 = 0;
        do {
            if (n == 6) {
                n2 = n3;
            }
            Vari.MakeEffect(92, d3DXVECTOR3, f, n2);
            f += Calc3D.DEGtoRAD(60.0f);
        } while (++n3 < 6);
        CBattleActCalc.m_Btl.LoopFrame(8);
    }

    public static void ResetAbLightColor() {
        CBattleFunc.FadeOut(8);
        CBattleActCalc.m_App.m_Fade.FogOn();
        CBattleActCalc.m_App.m_Fade.AmbientOn();
        CBattleActCalc.m_App.m_Render.SetLight(CBattleActCalc.m_Btl.m_liStart);
        CBattleFunc.FadeIn(8);
    }

    public static void AllWShield(CBattleWork cBattleWork, CAction cAction) {
        CBattleActCalc.m_App.PlaySeG(14);
        int n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n;
        while (n3 < n2) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.MakeWShield(cBattleWork2, 0);
                int n4 = cBattleWork.m_Prm.GetInt();
                int n5 = Calc3D.Rand(n4 / 2) / 6;
                cBattleWork2.m_Prm.SetWShield(n5 += n4 / 5);
            }
            ++n3;
        }
    }

    public static int CheckBackSwordSkill(CBattleWork cBattleWork, CAction cAction) {
        int n;
        int n2;
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        int n3 = cBattleWork.m_Prm.GetDex();
        int n4 = cBattleWork2.m_Prm.GetDex();
        CAbility cAbility = cBattleWork.m_Prm.m_Abi;
        int n5 = 2;
        if (!cBattleWork.IsMove()) {
            return -1;
        }
        if (cBattleWork.m_nWorkNo == cBattleWork2.m_nWorkNo) {
            return -1;
        }
        int[] nArray = new int[n5];
        int n6 = 0;
        while (n6 < n5) {
            nArray[n6] = n6 + 37;
            ++n6;
        }
        n6 = 0;
        do {
            n2 = Calc3D.Rand(n5);
            n = Calc3D.Rand(n5);
            int n7 = nArray[n2];
            nArray[n2] = nArray[n];
            nArray[n] = n7;
        } while (++n6 < 32);
        int n8 = 100;
        if (cAbility.GetFlag(110)) {
            n8 = 140;
        }
        n6 = 0;
        while (n6 < n5) {
            int n9 = nArray[n6];
            if (cAbility.GetFlag(n9) && (n2 = (Calc3D.Rand(n3 * 2) + n3) * n8) > (n = (Calc3D.Rand(n4 * 2) + n4) * 200)) {
                return n9;
            }
            ++n6;
        }
        return -1;
    }

    CBattleActEfc() {
    }

    public static void MakeKeruga(CBattleWork cBattleWork) {
        Vari.MakeEffect(64, cBattleWork.m_vPos, 2.0f, cBattleWork.m_Chr.m_fHitSize * 2.0f);
        CBattleActCalc.m_Btl.LoopFrame(8);
        Vari.MakeEffect(24, cBattleWork.m_vPos, 2.0f, cBattleWork.m_Chr.m_fHitSize);
        CBattleActCalc.m_App.PlaySeG(10);
        CBattleActCalc.m_Btl.LoopFrame(12);
    }

    public static void Back_Defense(CBattleWork cBattleWork) {
        float f = -12.0f;
        if (!cBattleWork.IsPlayer()) {
            f = 12.0f;
        }
        int n = 0;
        do {
            cBattleWork.m_vPos.z -= f;
            CBattleActCalc.m_Btl.DoFrame();
        } while (++n < 4);
        cBattleWork.m_vPos.Set(cBattleWork.m_vStart);
    }

    public static void MakeCosmoTrip() {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(0.0f, 500.0f, 500.0f);
        D3DLIGHT8 d3DLIGHT8 = new D3DLIGHT8();
        d3DLIGHT8.m_nType = 1;
        d3DLIGHT8.m_vPosition.Set(d3DXVECTOR3);
        d3DLIGHT8.m_vDirection.Set(d3DXVECTOR3);
        d3DLIGHT8.m_fRange = 0.0f;
        D3DLIGHT8 d3DLIGHT82 = new D3DLIGHT8();
        d3DLIGHT82.Set(d3DLIGHT8);
        d3DLIGHT82.m_cDiffuse.r = 128;
        d3DLIGHT82.m_cDiffuse.g = 255;
        d3DLIGHT82.m_cDiffuse.b = 255;
        d3DLIGHT82.m_fRange = 2000.0f;
        CBattleActCalc.m_App.m_Fade.PushLight();
        CBattleFunc.FadeOut(8);
        CBattleActCalc.m_App.m_Fade.FogOff();
        CBattleActCalc.m_App.m_Fade.AmbientOff();
        CBattleActCalc.m_App.m_Render.SetBright(1.0f);
        CBattleActCalc.m_App.m_Render.SetLight(d3DLIGHT8);
        CBattleActCalc.m_App.m_Fade.XChgColor(d3DLIGHT8, d3DLIGHT82, 16);
        int n = 0;
        do {
            d3DXVECTOR3.y -= 30.0f;
            d3DXVECTOR3.z -= 30.0f;
            d3DLIGHT82.m_vPosition.Set(d3DXVECTOR3);
            d3DLIGHT82.m_vDirection.Set(d3DXVECTOR3);
            CBattleActCalc.m_App.m_Render.SetLight(d3DLIGHT82);
            if (!(n & true)) {
                Vari.MakeEffect(104, d3DXVECTOR3, 0.0f, 0.0f);
            }
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 30);
        CBattleActCalc.m_App.m_Fade.XChgColor(d3DLIGHT82, d3DLIGHT8, 16);
        CBattleActCalc.m_Btl.LoopFrame(16);
        CBattleActCalc.m_App.m_Render.SetBright(0.0f);
        CBattleActCalc.m_App.m_Fade.FogOn();
        CBattleActCalc.m_App.m_Fade.AmbientOn();
        CBattleActCalc.m_App.m_Fade.PopLight();
        Vari.m_SysFlag.ResetFlag(4);
        CBattleActCalc.m_App.m_Play.ResetEvtFlag(331);
        CBattleFunc.FadeIn(8);
    }

    public static void MoveBack(CBattleWork cBattleWork) {
        int n = 0;
        do {
            cBattleWork.m_vPos.x -= Calc3D.Sin(cBattleWork.m_vRol.y) * 15.0f;
            cBattleWork.m_vPos.z -= Calc3D.Cos(cBattleWork.m_vRol.y) * 15.0f;
            CBattleActCalc.m_Btl.DoFrame();
        } while (++n < 4);
        cBattleWork.m_vPos.Set(cBattleWork.m_vStart);
    }

    public static void BodyFront(CBattleWork cBattleWork) {
        float[] fArray = new float[]{10.0f, 5.0f, 0.0f, 0.0f, -5.0f, -10.0f};
        float f = 25.0f;
        if (!cBattleWork.IsPlayer()) {
            f = -25.0f;
        }
        int n = 0;
        do {
            cBattleWork.m_vPos.y += fArray[n];
            cBattleWork.m_vPos.z += f;
            CBattleActCalc.m_Btl.DoFrame();
        } while (++n < 6);
    }

    public static void MakePiyo(D3DXVECTOR3 d3DXVECTOR3, float f, float f2, int n) {
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        int n2 = 0;
        while (n2 < n) {
            d3DXVECTOR32.Set(d3DXVECTOR3);
            d3DXVECTOR32.x += (float)Calc3D.Rand((int)f) - f * 0.5f;
            d3DXVECTOR32.z += (float)Calc3D.Rand((int)f2) - f2 * 0.5f;
            Vari.MakeEffect(100, d3DXVECTOR32, 0.0f, 0.0f);
            ++n2;
        }
    }

    public static void CriticalFlash() {
        CBattleActCalc.m_App.PlaySeG(16);
        CBattleActCalc.m_App.m_Render.SetWhite(0.5f);
        CBattleActCalc.m_Btl.LoopFrame(1);
        CBattleActCalc.m_App.m_Render.SetWhite(1.0f);
        CBattleActCalc.m_Btl.LoopFrame(1);
        CBattleActCalc.m_App.m_Render.SetWhite(0.5f);
        CBattleActCalc.m_Btl.LoopFrame(1);
        CBattleActCalc.m_App.m_Render.SetWhite(0.0f);
        CBattleActCalc.m_Btl.LoopFrame(5);
    }

    public static void MakeGodLaser(CBattleWork cBattleWork) {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(cBattleWork.m_vPos);
        d3DXVECTOR3.y = 350.0f;
        d3DXVECTOR3.x += 90.0f;
        CBattleActCalc.m_App.PlaySeG(18);
        int n = 0;
        do {
            int n2 = 0;
            do {
                float f = cBattleWork.m_vRol.y + Calc3D.DEGtoRAD(Calc3D.Rand(180) - 90);
                Vari.MakeEffect(58, d3DXVECTOR3, f, 0.0f);
            } while (++n2 < 2);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 32);
        CBattleActCalc.m_Btl.LoopFrame(6);
    }

    public static void MakeMekaLaser(CBattleWork cBattleWork) {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(cBattleWork.m_vPos);
        d3DXVECTOR3.y = 90.0f;
        CBattleActCalc.m_App.PlaySeG(18);
        int n = 0;
        do {
            float f = cBattleWork.m_vRol.y + Calc3D.DEGtoRAD(Calc3D.Rand(180) - 90);
            d3DXVECTOR3.x += 20.0f;
            Vari.MakeEffect(116, d3DXVECTOR3, f, 0.0f);
            d3DXVECTOR3.x -= 40.0f;
            Vari.MakeEffect(116, d3DXVECTOR3, f, 0.0f);
            d3DXVECTOR3.x += 20.0f;
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 32);
        CBattleActCalc.m_Btl.LoopFrame(6);
    }

    public static void MakeAllIce(CAction cAction) {
        float f = 0.0f;
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        if (cAction.m_nObj == 101) {
            d3DXVECTOR3.z = -230.0f;
        } else {
            d3DXVECTOR3.z = 230.0f;
            f = (float)Math.PI;
        }
        CBattleActCalc.m_App.PlaySeG(13);
        Vari.MakeEffect(90, d3DXVECTOR3, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(2);
        float f2 = 0.0f;
        int n = 0;
        do {
            CBattleActCalc.m_App.PlaySeG(13);
            d3DXVECTOR3.x += (f2 += 140.0f);
            Vari.MakeEffect(90, d3DXVECTOR3, 0.0f, 0.0f);
            d3DXVECTOR3.x -= (f2 += 140.0f);
            Vari.MakeEffect(90, d3DXVECTOR3, 0.0f, 0.0f);
            CBattleActCalc.m_Btl.LoopFrame(2);
        } while (++n < 4);
    }

    public static void MakeAirEffect(CBattleWork cBattleWork) {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.z = cBattleWork.IsPlayer() ? -230.0f : 230.0f;
        CBattleActCalc.m_App.PlaySeG(4);
        int n = 0;
        do {
            Vari.MakeEffect(29, d3DXVECTOR3, 0.0f, 0.0f);
            Vari.MakeEffect(29, d3DXVECTOR3, 0.0f, 0.0f);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 8);
    }

    public static void SummonOff(CBattleWork cBattleWork) {
        int n = CBattleActCalc.GetMyGroupStart(cBattleWork);
        while (n < CBattleActCalc.GetMyGroupEnd(cBattleWork)) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n);
            if (cBattleWork2.m_Chr != null) {
                cBattleWork2.m_Chr.ResetFlag(512);
            }
            ++n;
        }
    }

    public static void MakeNight(CBattleWork cBattleWork) {
        float f = 1.0f;
        if (cBattleWork.IsPlayer()) {
            f = -1.0f;
        }
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(cBattleWork.m_vPos);
        d3DXVECTOR3.y = 50.0f;
        d3DXVECTOR3.z -= f * 100.0f;
        D3DLIGHT8 d3DLIGHT8 = new D3DLIGHT8();
        d3DLIGHT8.m_nType = 1;
        d3DLIGHT8.m_vPosition.Set(d3DXVECTOR3);
        d3DLIGHT8.m_vDirection.Set(d3DXVECTOR3);
        d3DLIGHT8.m_fRange = 0.0f;
        D3DLIGHT8 d3DLIGHT82 = new D3DLIGHT8();
        d3DLIGHT82.Set(d3DLIGHT8);
        d3DLIGHT82.m_cDiffuse.r = 200;
        d3DLIGHT82.m_cDiffuse.g = 32;
        d3DLIGHT82.m_cDiffuse.b = 255;
        d3DLIGHT82.m_fRange = 2000.0f;
        CBattleActCalc.m_App.m_Fade.PushLight();
        CBattleFunc.FadeOut(8);
        CBattleActCalc.m_App.m_Fade.FogOff();
        CBattleActCalc.m_App.m_Fade.AmbientOff();
        CBattleActCalc.m_App.m_Render.SetBright(1.0f);
        CBattleActCalc.m_App.m_Render.SetLight(d3DLIGHT8);
        CBattleActCalc.m_App.m_Fade.XChgColor(d3DLIGHT8, d3DLIGHT82, 16);
        CBattleActCalc.m_App.PlaySeG(17);
        int n = 0;
        do {
            d3DXVECTOR3.z += f * 10.0f;
            d3DLIGHT8.m_vPosition.Set(d3DXVECTOR3);
            CBattleActCalc.m_App.m_Render.SetLight(d3DLIGHT8);
            if ((n & 3) == 0) {
                Vari.MakeEffect(63, d3DXVECTOR3, Calc3D.AngleRand(), 2.0f);
            }
            Vari.MakeEffect(83, d3DXVECTOR3, 2.0f, 0.0f);
            Vari.MakeEffect(83, d3DXVECTOR3, 2.0f, 0.0f);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 32);
        CBattleActCalc.m_App.m_Fade.XChgColor(d3DLIGHT82, d3DLIGHT8, 16);
        CBattleActCalc.m_Btl.LoopFrame(16);
        CBattleActCalc.m_App.m_Render.SetBright(0.0f);
        CBattleActCalc.m_App.m_Fade.FogOn();
        CBattleActCalc.m_App.m_Fade.AmbientOn();
        CBattleActCalc.m_App.m_Fade.PopLight();
        CBattleFunc.FadeIn(8);
    }

    public static int CheckAttackAdd(CBattleWork cBattleWork) {
        CAbility cAbility = cBattleWork.m_Prm.m_Abi;
        int[] nArray = new int[]{112, 113, 114, 115};
        int[] nArray2 = new int[]{100, 40, 40, 100};
        int n = 0;
        do {
            if (!cAbility.GetFlag(nArray[n]) || Calc3D.Rand(100) >= nArray2[n]) continue;
            return nArray[n];
        } while (++n < 4);
        return -1;
    }

    public static int GetDefenseUp(CBattleWork cBattleWork) {
        int n = cBattleWork.m_Prm.m_nLV / 2 + 1;
        if (n > 16) {
            n = 16;
        }
        return n;
    }

    public static int CheckSwordCombo(CBattleWork cBattleWork, CAction cAction) {
        int n;
        int n2;
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        int n3 = cBattleWork.m_Prm.GetDex();
        int n4 = cBattleWork2.m_Prm.GetDex();
        CAbility cAbility = cBattleWork.m_Prm.m_Abi;
        if (!cAbility.GetFlag(111)) {
            return -1;
        }
        int[] nArray = new int[5];
        int n5 = 0;
        do {
            nArray[n5] = n5;
        } while (++n5 < 5);
        n5 = 0;
        do {
            n2 = Calc3D.Rand(5);
            n = Calc3D.Rand(5);
            int n6 = nArray[n2];
            nArray[n2] = nArray[n];
            nArray[n] = n6;
        } while (++n5 < 16);
        n5 = 0;
        do {
            int n7;
            if (!cAbility.GetFlag(m_anSCSword1[n7 = nArray[n5]]) || !cAbility.GetFlag(m_anSCSword2[n7]) || (n2 = (Calc3D.Rand(n3 * 2) + n3) * 80) <= (n = (Calc3D.Rand(n4 * 2) + n4) * 200)) continue;
            return m_anSCCombo[n7];
        } while (++n5 < 5);
        return -1;
    }

    public static void MakeSmallStorm(D3DXVECTOR3 d3DXVECTOR3) {
        CBattleActCalc.m_App.PlaySeG(4);
        int n = 0;
        do {
            int n2 = 0;
            do {
                Vari.MakeEffect(119, d3DXVECTOR3, (float)n2 * 40.0f, 0.0f);
            } while (++n2 < 6);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 4);
        CBattleActCalc.m_Btl.LoopFrame(4);
    }

    public static void Vampire(CBattleWork cBattleWork, CBattleWork cBattleWork2) {
        if (cBattleWork.m_nWorkNo == cBattleWork2.m_nWorkNo) {
            CBattleActCalc.m_App.RecTextObj("\u30df\u30b9", cBattleWork2.m_vPos, Color.white);
            return;
        }
        float f = Calc3D.CalcAngleXZ(cBattleWork2.m_vPos, cBattleWork.m_vPos);
        Vari.MakeEffect(14, cBattleWork2.m_vPos, Calc3D.RadLimits(f + Calc3D.DEGtoRAD(120.0f)), cBattleWork.m_nWorkNo);
        Vari.MakeEffect(14, cBattleWork2.m_vPos, Calc3D.RadLimits(f - Calc3D.DEGtoRAD(120.0f)), cBattleWork.m_nWorkNo);
        CBattleActCalc.m_App.PlaySeG(5);
        CBattleActCalc.m_Btl.LoopFrame(18);
        int n = CBattleActCalc.CalcWeaponDamage(cBattleWork, cBattleWork2, 65, 0, 0);
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

    public static void MoveFrontSp(CBattleWork cBattleWork) {
        float[] fArray = new float[]{20.0f, -20.0f};
        float f = 30.0f;
        if (!cBattleWork.IsPlayer()) {
            f = -30.0f;
        }
        int n = 0;
        do {
            cBattleWork.m_vPos.y += fArray[n];
            cBattleWork.m_vPos.z += f;
            CBattleActCalc.m_Btl.DoFrame();
        } while (++n < 2);
    }

    public static void AllGolem(CBattleWork cBattleWork, CAction cAction) {
        int n = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n2 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n3 = n;
        while (n3 < n2) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsAttack()) {
                CBattleActCalc.MakeGolem(cBattleWork2);
                cBattleWork2.m_Prm.SetGolem(3);
            }
            ++n3;
        }
    }

    public static void MakeAllThunder(CAction cAction) {
        D3DXVECTOR3 d3DXVECTOR3 = CBattleActEfc.GetOnmyoCenter(cAction.m_nObj);
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        CBattleActCalc.m_App.PlaySeG(6);
        int n = 0;
        do {
            int n2 = 0;
            do {
                d3DXVECTOR32.x = d3DXVECTOR3.x + (float)Calc3D.Rand(600) - 300.0f;
                d3DXVECTOR32.z = d3DXVECTOR3.z + (float)Calc3D.Rand(300) - 150.0f;
                Vari.MakeEffect(101, d3DXVECTOR32, 2.0f, 0.0f);
            } while (++n2 < 6);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 10);
        CBattleActCalc.m_Btl.LoopFrame(2);
    }

    public static void MoveBackHop(CBattleWork cBattleWork) {
        int n = 0;
        do {
            cBattleWork.m_vPos.x -= Calc3D.Sin(cBattleWork.m_vRol.y) * 15.0f;
            cBattleWork.m_vPos.z -= Calc3D.Cos(cBattleWork.m_vRol.y) * 15.0f;
            CBattleActCalc.m_Btl.DoFrame();
        } while (++n < 8);
        cBattleWork.m_vPos.Set(cBattleWork.m_vStart);
    }

    public static void MakeEyeWater(CBattleWork cBattleWork) {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(cBattleWork.m_vPos);
        d3DXVECTOR3.y = cBattleWork.GetHeight();
        d3DXVECTOR3.z = cBattleWork.IsPlayer() ? (d3DXVECTOR3.z += cBattleWork.m_Chr.m_fHitSize) : (d3DXVECTOR3.z -= cBattleWork.m_Chr.m_fHitSize);
        D3DLIGHT8 d3DLIGHT8 = new D3DLIGHT8();
        d3DLIGHT8.m_nType = 1;
        d3DLIGHT8.m_vPosition.Set(d3DXVECTOR3);
        d3DLIGHT8.m_vDirection.Set(d3DXVECTOR3);
        d3DLIGHT8.m_fRange = 0.0f;
        D3DLIGHT8 d3DLIGHT82 = new D3DLIGHT8();
        d3DLIGHT82.Set(d3DLIGHT8);
        d3DLIGHT82.m_cDiffuse.r = 255;
        d3DLIGHT82.m_cDiffuse.g = 255;
        d3DLIGHT82.m_cDiffuse.b = 255;
        d3DLIGHT82.m_fRange = 1000.0f;
        CBattleActCalc.m_App.m_Fade.PushLight();
        CBattleFunc.FadeOut(8);
        CBattleActCalc.m_App.m_Fade.FogOff();
        CBattleActCalc.m_App.m_Fade.AmbientOff();
        CBattleActCalc.m_App.m_Render.SetBright(1.0f);
        CBattleActCalc.m_App.m_Render.SetLight(d3DLIGHT8);
        CBattleActCalc.m_App.m_Fade.XChgColor(d3DLIGHT8, d3DLIGHT82, 16);
        int n = 0;
        do {
            int n2 = 0;
            do {
                Vari.MakeEffect(105, d3DXVECTOR3, 0.0f, 0.0f);
            } while (++n2 < 5);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 16);
        CBattleActCalc.m_App.m_Fade.XChgColor(d3DLIGHT82, d3DLIGHT8, 16);
        CBattleActCalc.m_Btl.LoopFrame(16);
    }

    public static void BodyBack(CBattleWork cBattleWork) {
        float f = 12.5f;
        if (!cBattleWork.IsPlayer()) {
            f = -12.5f;
        }
        int n = 0;
        do {
            cBattleWork.m_vPos.z -= f;
            CBattleActCalc.m_Btl.DoFrame();
        } while (++n < 12);
        cBattleWork.m_vPos.Set(cBattleWork.m_vStart);
    }

    public static void MakeClock(D3DXVECTOR3 d3DXVECTOR3, boolean bl) {
        if (bl) {
            CBattleActCalc.m_App.PlaySeG(13);
        }
        Vari.MakeEffect(33, d3DXVECTOR3, Calc3D.DEGtoRAD(45.0f), 0.0f);
        Vari.MakeEffect(33, d3DXVECTOR3, Calc3D.DEGtoRAD(135.0f), 0.0f);
        Vari.MakeEffect(33, d3DXVECTOR3, Calc3D.DEGtoRAD(215.0f), 0.0f);
        Vari.MakeEffect(33, d3DXVECTOR3, Calc3D.DEGtoRAD(315.0f), 0.0f);
    }

    public static void MakeThunder(D3DXVECTOR3 d3DXVECTOR3) {
        int n = 0;
        do {
            Vari.MakeEffect(101, d3DXVECTOR3, n + 6, 0.0f);
        } while (++n < 5);
    }

    public static void SummonOn(CBattleWork cBattleWork) {
        int n = CBattleActCalc.GetMyGroupStart(cBattleWork);
        while (n < CBattleActCalc.GetMyGroupEnd(cBattleWork)) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n);
            if (cBattleWork2.m_Chr != null) {
                cBattleWork2.m_Chr.SetFlag(512);
            }
            ++n;
        }
    }

    public static D3DXVECTOR3 GetOnmyoCenter(int n) {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.z = n == 101 ? -180.0f : 180.0f;
        return d3DXVECTOR3;
    }

    public static void EfcHoly(CBattleWork cBattleWork, CAction cAction) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(cAction.m_nObj);
        int n = 0;
        do {
            int n2 = 0;
            do {
                Vari.MakeEffect(27, cBattleWork2.m_vPos, 1.5707964f * (float)n2, n);
            } while (++n2 < 4);
            CBattleActCalc.m_Btl.LoopFrame(10);
        } while (++n < 2);
        CBattleActCalc.m_Btl.LoopFrame(6);
        CBattleActCalc.m_App.PlaySeG(18);
        n = 0;
        do {
            Vari.MakeEffect(28, cBattleWork2.m_vPos, 0.0f, 0.0f);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n < 12);
        Vari.MakeEffect(3, cBattleWork2.m_vPos, 0.0f, cBattleWork2.m_Chr.m_fHitSize);
        CBattleActCalc.MagicAttack(cBattleWork, cBattleWork2, 50, 13000, 3);
    }

    public static void MakeSMeteor(CAction cAction, float f) {
        float f2 = 230.0f;
        if (cAction.m_nObj == 101) {
            f2 = -230.0f;
        }
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        int n = 0;
        do {
            CBattleActCalc.m_App.PlaySeG(29);
            d3DXVECTOR3.x = (float)Calc3D.Rand(800) - 400.0f;
            d3DXVECTOR3.z = (float)Calc3D.Rand(400) - 200.0f + f2;
            Vari.MakeEffect(78, d3DXVECTOR3, 0.0f, f);
            CBattleActCalc.m_Btl.LoopFrame(2);
        } while (++n < 16);
    }

    public static void WindHeal(CBattleWork cBattleWork, CAction cAction, int n) {
        float f = 0.0f;
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        if (cAction.m_nObj == 101) {
            d3DXVECTOR3.z = -230.0f;
        } else {
            d3DXVECTOR3.z = 230.0f;
            f = (float)Math.PI;
        }
        CBattleActCalc.m_App.PlaySeG(4);
        int n2 = 0;
        do {
            Vari.MakeEffect(39, d3DXVECTOR3, 0.0f, 0.0f);
            Vari.MakeEffect(39, d3DXVECTOR3, 0.0f, 0.0f);
            CBattleActCalc.m_Btl.LoopFrame(1);
        } while (++n2 < 8);
        n2 = CBattleActCalc.GetGroupStart(cAction.m_nObj);
        int n3 = CBattleActCalc.GetGroupEnd(cAction.m_nObj);
        int n4 = n2;
        while (n4 < n3) {
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n4);
            if (cBattleWork2.IsAttack()) {
                int n5 = CSkillCalc.Calc_StrHeal(cBattleWork.m_Prm) * n / 100;
                cBattleWork2.AddHP(n5);
                CBattleActCalc.SetNumberObject(cBattleWork2, n5, 0);
            }
            ++n4;
        }
        Vari.HealFlag(cBattleWork.m_nWorkNo);
    }

    public static void MakeMeteor(CBattleWork cBattleWork, int n, int n2, int n3) {
        CBattleWork cBattleWork2 = Vari.GetBChrWork(n);
        Vari.MakeEffect(45, cBattleWork2.m_vPos, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(5);
        CBattleActCalc.m_App.PlaySeG(2);
        CBattleActCalc.m_Btl.LoopFrame(10);
        CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, n2, n3, 7, 2, 0);
    }

    public static void MakeSuikari(CAction cAction) {
        float f = 0.0f;
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        if (cAction.m_nObj == 101) {
            d3DXVECTOR3.z = -230.0f;
        } else {
            d3DXVECTOR3.z = 230.0f;
            f = (float)Math.PI;
        }
        CBattleActCalc.m_App.PlaySeG(13);
        Vari.MakeEffect(123, d3DXVECTOR3, 0.0f, 0.0f);
        CBattleActCalc.m_Btl.LoopFrame(2);
        float f2 = 0.0f;
        int n = 0;
        do {
            d3DXVECTOR3.x += (f2 += 140.0f);
            Vari.MakeEffect(123, d3DXVECTOR3, 0.0f, 0.0f);
            d3DXVECTOR3.x -= (f2 += 140.0f);
            Vari.MakeEffect(123, d3DXVECTOR3, 0.0f, 0.0f);
            CBattleActCalc.m_Btl.LoopFrame(2);
        } while (++n < 4);
        CBattleActCalc.m_Btl.LoopFrame(2);
    }

    public static float GetOnmyoVect(int n) {
        float f = 0.0f;
        if (n != 101) {
            f = (float)Math.PI;
        }
        return f;
    }
}

