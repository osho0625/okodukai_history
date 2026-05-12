/*
 * Decompiled with CFR 0.152.
 */
class CNpcMove {
    CNpcMove() {
    }

    public static CChrWork MoveChrVect(CChrWork cChrWork, float f, float f2) {
        cChrWork.SetVect(f);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.x = Calc3D.Sin(f) * f2;
        d3DXVECTOR3.z = Calc3D.Cos(f) * f2;
        return Vari.m_App.m_Game.MoveChar(cChrWork, d3DXVECTOR3);
    }

    public static CChrWork MoveChrVect_Npc05(CChrWork cChrWork, float f, float f2) {
        cChrWork.SetVect(f);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.x = Calc3D.Sin(f) * f2;
        d3DXVECTOR3.z = Calc3D.Cos(f) * f2;
        float f3 = d3DXVECTOR3.Magnitude();
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        d3DXVECTOR32.x = cChrWork.m_vPos.x + d3DXVECTOR3.x;
        d3DXVECTOR32.y = cChrWork.m_vPos.y + d3DXVECTOR3.y;
        d3DXVECTOR32.z = cChrWork.m_vPos.z + d3DXVECTOR3.z;
        CBananaCorrect cBananaCorrect = new CBananaCorrect();
        cBananaCorrect.Init(cChrWork, Vari.m_App.m_NowMapData, cChrWork.m_vPos);
        CChrWork cChrWork2 = cBananaCorrect.Move(d3DXVECTOR32, f3);
        return cChrWork2;
    }

    public static void MoveNpc_04(CChrWork cChrWork) {
        cChrWork.LookAt(Vari.m_App.m_Player.m_vPos);
    }

    public static void Npc05_Turn(CChrWork cChrWork) {
        cChrWork.AddVect(1.5707964f);
    }

    public static void MoveNpc_02(CChrWork cChrWork) {
        if (Vari.m_bExecEvent) {
            return;
        }
        if (cChrWork.m_nMode != 0) {
            cChrWork.m_nMode += -1;
            CNpcMove.MoveChrVect(cChrWork, cChrWork.m_fVect, 40.0f);
            return;
        }
        float f = Calc3D.CalcAngleXZ(cChrWork.m_vPos, Vari.m_App.m_Player.m_vPos);
        f = Calc3D.RadLimits45(f);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(cChrWork.m_vPos);
        CNpcMove.MoveChrVect(cChrWork, f, 40.0f);
        if (d3DXVECTOR3.Cmp(cChrWork.m_vPos)) {
            f -= 1.5707964f;
            f = Calc3D.RadLimits(f);
            CNpcMove.MoveChrVect(cChrWork, f, 40.0f);
            if (!d3DXVECTOR3.Cmp(cChrWork.m_vPos)) {
                cChrWork.m_nMode = 3;
                return;
            }
            f += (float)Math.PI;
            f = Calc3D.RadLimits(f);
            CNpcMove.MoveChrVect(cChrWork, f, 40.0f);
            if (!d3DXVECTOR3.Cmp(cChrWork.m_vPos)) {
                cChrWork.m_nMode = 3;
                return;
            }
        }
    }

    public static int CheckAheadHit(CChrWork cChrWork) {
        int n = CMapData.GetXBlock(cChrWork.m_vPos.x);
        int n2 = CMapData.GetXBlock(cChrWork.m_vPos.z);
        int n3 = Calc3D.Rad2Int(cChrWork.m_fVect);
        switch (n3) {
            case 0: {
                ++n2;
                break;
            }
            case 1: {
                ++n;
                break;
            }
            case 2: {
                --n2;
                break;
            }
            case 3: {
                --n;
            }
        }
        if (Vari.m_App.m_NowMapData.IsOut(n, n2)) {
            return 2;
        }
        if (Vari.m_App.m_Game.CheckHitSquare(n, n2, cChrWork, 15.0f)) {
            return 1;
        }
        return 0;
    }

    public static void MoveNpc_01(CChrWork cChrWork) {
        if (Vari.m_bExecEvent) {
            return;
        }
        switch (cChrWork.m_nMode) {
            case 0: {
                int n = Calc3D.Rand(10);
                if (n != 0) break;
                cChrWork.m_nMode = 1;
                return;
            }
            case 1: {
                int n = Calc3D.Rand(20);
                if (n == 1) {
                    cChrWork.m_nMode = 0;
                } else if (n == 1 || n == 2) {
                    cChrWork.AddVect(-0.7853982f);
                } else if (n == 3 || n == 4) {
                    cChrWork.AddVect(0.7853982f);
                }
                D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
                d3DXVECTOR3.x = Calc3D.Sin(cChrWork.GetMoveVect()) * 20.0f;
                d3DXVECTOR3.z = Calc3D.Cos(cChrWork.GetMoveVect()) * 20.0f;
                Vari.m_App.m_Game.MoveChar(cChrWork, d3DXVECTOR3);
                return;
            }
        }
    }

    /*
     * Enabled force condition propagation
     * Lifted jumps to return sites
     */
    public static void MoveNpc_05(CChrWork cChrWork) {
        int n = CMapData.GetXBlock(cChrWork.m_vPos.x);
        int n2 = CMapData.GetXBlock(cChrWork.m_vPos.z);
        if (n == 3 && n2 == 8) {
            Vari.m_App.m_Play.SetEvtFlag(151);
        }
        switch (cChrWork.m_nMode) {
            case 0: {
                if (cChrWork.m_nCount == 0) {
                    if (Vari.m_App.m_Game.CheckHitSquare(n, n2, cChrWork, 5.0f)) return;
                    cChrWork.m_nMode = 1;
                    cChrWork.m_vScale.x = 0.2f;
                    cChrWork.m_vScale.y = 0.2f;
                    cChrWork.m_vScale.z = 0.2f;
                    cChrWork.ResetFlag(512);
                    cChrWork.ResetFlag(32);
                    return;
                }
                cChrWork.m_nCount += -1;
                return;
            }
            case 1: {
                cChrWork.m_vScale.x += 0.2f;
                cChrWork.m_vScale.y += 0.2f;
                cChrWork.m_vScale.z += 0.2f;
                if (!(cChrWork.m_vScale.x >= 1.0f)) return;
                cChrWork.m_nMode = 2;
                return;
            }
            case 2: {
                CChrWork cChrWork2;
                boolean bl = false;
                boolean bl2 = false;
                int n3 = CNpcMove.CheckAheadHit(cChrWork);
                if (n3 == 2) {
                    CNpcMove.Npc05_Sub(cChrWork);
                    return;
                }
                if (n3 == 1) {
                    if (Vari.m_App.m_Game.m_nReturnValue == -1) {
                        bl2 = true;
                    } else {
                        cChrWork2 = Vari.GetChrWork(Vari.m_App.m_Game.m_nReturnValue);
                        if (cChrWork2.m_nEvent == -1) {
                            bl2 = true;
                        }
                    }
                    bl = true;
                }
                if ((cChrWork2 = CNpcMove.MoveChrVect_Npc05(cChrWork, cChrWork.m_fVect, 40.0f)) == Vari.m_App.m_Player) {
                    bl = true;
                }
                cChrWork.m_nCount = bl ? ++cChrWork.m_nCount : 0;
                if (cChrWork.m_nCount >= 20) {
                    cChrWork.m_nMode = 3;
                    return;
                }
                if (!bl2) return;
                float f = CMapData.GetXPos(n);
                float f2 = CMapData.GetZPos(n2);
                int n4 = Calc3D.Rad2Int(cChrWork.m_fVect);
                switch (n4) {
                    case 0: {
                        if (!(cChrWork.m_vPos.z > f2)) return;
                        cChrWork.m_vPos.z = f2;
                        CNpcMove.Npc05_Turn(cChrWork);
                        return;
                    }
                    case 1: {
                        if (!(cChrWork.m_vPos.x > f)) return;
                        cChrWork.m_vPos.x = f;
                        CNpcMove.Npc05_Turn(cChrWork);
                        return;
                    }
                    case 2: {
                        if (!(cChrWork.m_vPos.z < f2)) return;
                        cChrWork.m_vPos.z = f2;
                        CNpcMove.Npc05_Turn(cChrWork);
                        return;
                    }
                    case 3: {
                        if (!(cChrWork.m_vPos.x < f)) return;
                        cChrWork.m_vPos.x = f;
                        CNpcMove.Npc05_Turn(cChrWork);
                        return;
                    }
                    default: {
                        return;
                    }
                }
            }
            case 3: {
                cChrWork.m_vScale.x -= 0.2f;
                cChrWork.m_vScale.y -= 0.2f;
                cChrWork.m_vScale.z -= 0.2f;
                if (!(cChrWork.m_vScale.x <= 0.0f)) return;
                CNpcMove.Npc05_Sub(cChrWork);
                return;
            }
        }
    }

    public static void Npc05_Sub(CChrWork cChrWork) {
        cChrWork.m_nMode = 0;
        cChrWork.m_nCount = 20;
        cChrWork.SetFlag(512);
        cChrWork.SetFlag(32);
        cChrWork.m_vPos.x = CMapData.GetXPos(9);
        cChrWork.m_vPos.z = CMapData.GetZPos(14);
        cChrWork.SetVect((float)Math.PI);
    }

    public static void Move() {
        if (Vari.m_App.IsStopDisplay()) {
            return;
        }
        int n = 8;
        do {
            CChrWork cChrWork;
            if (!(cChrWork = Vari.GetChrWork(n)).GetFlag(1)) continue;
            switch (cChrWork.m_nAlgo) {
                case 1: {
                    CNpcMove.MoveNpc_01(cChrWork);
                    break;
                }
                case 2: {
                    CNpcMove.MoveNpc_02(cChrWork);
                    break;
                }
                case 3: {
                    CNpcMove.MoveNpc_03(cChrWork);
                    break;
                }
                case 4: {
                    CNpcMove.MoveNpc_04(cChrWork);
                    break;
                }
                case 5: {
                    CNpcMove.MoveNpc_05(cChrWork);
                }
            }
        } while (++n < 24);
    }

    public static void MoveNpc_03(CChrWork cChrWork) {
        int n;
        int n2;
        if (cChrWork.m_nMode == 0) {
            return;
        }
        float f = 0.0f;
        float f2 = 0.0f;
        boolean bl = false;
        int n3 = 0;
        int n4 = 0;
        if (cChrWork.m_nMode == 1) {
            n4 = 1;
        }
        if (cChrWork.m_nMode == 2) {
            n3 = 1;
        }
        if (cChrWork.m_nMode == 3) {
            n4 = -1;
        }
        if (cChrWork.m_nMode == 4) {
            n3 = -1;
        }
        if (Vari.m_App.m_Game.CheckHitSquare((n2 = CMapData.GetXBlock(cChrWork.m_vPos.x)) + n3, (n = CMapData.GetZBlock(cChrWork.m_vPos.z)) + n4, cChrWork, 5.0f)) {
            bl = true;
            f = CMapData.GetXPos(n2);
            f2 = CMapData.GetXPos(n);
        }
        float f3 = (float)(cChrWork.m_nMode - 1) * 1.5707964f;
        float f4 = cChrWork.m_vRol.y;
        CNpcMove.MoveChrVect(cChrWork, f3, 40.0f);
        cChrWork.m_vRol.y = f4;
        if (bl) {
            if (cChrWork.m_nMode == 1 && cChrWork.m_vPos.z >= f2 - 20.0f) {
                cChrWork.m_vPos.z = f2;
                cChrWork.m_nMode = 0;
            }
            if (cChrWork.m_nMode == 2 && cChrWork.m_vPos.x >= f - 20.0f) {
                cChrWork.m_vPos.x = f;
                cChrWork.m_nMode = 0;
            }
            if (cChrWork.m_nMode == 3 && cChrWork.m_vPos.z <= f2 + 20.0f) {
                cChrWork.m_vPos.z = f2;
                cChrWork.m_nMode = 0;
            }
            if (cChrWork.m_nMode == 4 && cChrWork.m_vPos.x <= f + 20.0f) {
                cChrWork.m_vPos.x = f;
                cChrWork.m_nMode = 0;
            }
        }
    }
}

