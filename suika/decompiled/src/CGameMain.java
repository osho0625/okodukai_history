/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Graphics;

class CGameMain {
    static final float PLAYER_ROLL = 0.17453292f;
    static final float VIEWPOS_DIST_N = -2000.0f;
    static final float VIEWPOS_YADD_N = 1800.0f;
    static final float VIEWPOS_DIST_F = -2600.0f;
    static final float VIEWPOS_YADD_F = 2340.0f;
    static final float VIEWAT_YADD = 50.0f;
    public ARpg m_App;
    public CGameFlag m_Flag;
    public CChrWork m_Player;
    public CPartyLine m_Party = new CPartyLine();
    public int m_nHitWallX;
    public int m_nHitWallZ;
    private int m_nMoveCount;
    public int m_nEncountPro;
    public int m_nCatsEye;
    public int m_nCompass;
    public int m_nScEvX;
    public int m_nScEvZ;
    public int m_nMovX;
    public int m_nMovZ;
    public int m_nVFlag;
    public int m_nReturnValue;
    static final float ROCK_COR = 45.0f;
    static final float ROCK_MOV = 20.0f;

    public void MoveEvent() {
        new D3DXVECTOR3();
        int n = 0;
        do {
            CChrWork cChrWork;
            if (!(cChrWork = Vari.GetChrWork(n)).GetFlag(1) || cChrWork.m_nEvtAlgo == 0) continue;
            cChrWork.m_vPos.x += Calc3D.Sin(cChrWork.GetMoveVect()) * cChrWork.m_fEvtSpeed;
            cChrWork.m_vPos.z += Calc3D.Cos(cChrWork.GetMoveVect()) * cChrWork.m_fEvtSpeed;
            if (cChrWork.m_nWorkNo == 0) {
                this.MoveParty(true);
            }
            switch (cChrWork.m_nEvtAlgo) {
                case 1: {
                    cChrWork.m_nEvtMove += -1;
                    if (cChrWork.m_nEvtMove != 0) break;
                    cChrWork.m_nEvtAlgo = 0;
                    break;
                }
                case 2: {
                    float f = CMapData.GetXPos(cChrWork.m_nEvtMove);
                    int n2 = Calc3D.Rad2IntBit(cChrWork.GetMoveVect());
                    if ((n2 & 2) != 0) {
                        if (!(cChrWork.m_vPos.x >= f)) break;
                        cChrWork.m_vPos.x = f;
                        cChrWork.m_nEvtAlgo = 0;
                        break;
                    }
                    if (!(cChrWork.m_vPos.x <= f)) break;
                    cChrWork.m_vPos.x = f;
                    cChrWork.m_nEvtAlgo = 0;
                    break;
                }
                case 3: {
                    float f = CMapData.GetXPos(cChrWork.m_nEvtMove);
                    int n2 = Calc3D.Rad2IntBit(cChrWork.GetMoveVect());
                    if ((n2 & 1) != 0) {
                        if (!(cChrWork.m_vPos.z >= f)) break;
                        cChrWork.m_vPos.z = f;
                        cChrWork.m_nEvtAlgo = 0;
                        break;
                    }
                    if (!(cChrWork.m_vPos.z <= f)) break;
                    cChrWork.m_vPos.z = f;
                    cChrWork.m_nEvtAlgo = 0;
                }
            }
        } while (++n < 24);
    }

    public void SetCameraDebug() {
        if (this.m_App.m_bKeyUp) {
            Vari.m_vCameraPos.z -= 200.0f;
        }
        if (this.m_App.m_bKeyRight) {
            Vari.m_vCameraPos.x += 200.0f;
        }
        if (this.m_App.m_bKeyDown) {
            Vari.m_vCameraPos.z += 200.0f;
        }
        if (this.m_App.m_bKeyLeft) {
            Vari.m_vCameraPos.x -= 200.0f;
        }
        float f = this.m_Flag.GetCameraVect();
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.Set(Vari.m_vCameraPos);
        d3DXVECTOR3.x += Calc3D.Sin(f) * -2000.0f * 2.0f;
        d3DXVECTOR3.y += 3600.0f;
        d3DXVECTOR3.z += Calc3D.Cos(f) * -2000.0f * 2.0f;
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        d3DXVECTOR32.Set(Vari.m_vCameraPos);
        d3DXVECTOR32.y += 200.0f;
        this.m_App.m_Render.ViewTransform(d3DXVECTOR3, d3DXVECTOR32);
    }

    public boolean CheckInSquareChr(int n, int n2, CChrWork cChrWork, float f) {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        float[] fArray = new float[]{0.0f, -100.0f + f, 0.0f, 100.0f - f, 100.0f - f, 100.0f - f, 0.0f, -100.0f + f, -100.0f + f};
        float[] fArray2 = new float[]{0.0f, -100.0f + f, -100.0f + f, -100.0f + f, 0.0f, 100.0f - f, 100.0f - f, 100.0f - f, 0.0f};
        int n3 = 0;
        do {
            d3DXVECTOR3.x = CMapData.GetXPos(n) + fArray[n3];
            d3DXVECTOR3.z = CMapData.GetZPos(n2) + fArray2[n3];
            CChrWork cChrWork2 = Vari.m_Char.CheckHit(d3DXVECTOR3, cChrWork);
            if (cChrWork2 == null) continue;
            this.m_nReturnValue = cChrWork2.m_nWorkNo;
            return true;
        } while (++n3 < 9);
        return false;
    }

    public void DrawCompass() {
        if (this.m_nCompass == 0) {
            return;
        }
        this.m_nCompass += -1;
        float f = this.m_Flag.GetCameraVect();
        int[] nArray = new int[3];
        int[] nArray2 = new int[3];
        nArray[0] = (int)(-Calc3D.Sin(f) * 190.0f) + 200;
        nArray2[0] = (int)(Calc3D.Cos(f) * 150.0f) + 160;
        nArray[1] = (int)(-Calc3D.Sin(f - 0.08f) * 180.0f) + 200;
        nArray2[1] = (int)(Calc3D.Cos(f - 0.08f) * 140.0f) + 160;
        nArray[2] = (int)(-Calc3D.Sin(f + 0.08f) * 180.0f) + 200;
        nArray2[2] = (int)(Calc3D.Cos(f + 0.08f) * 140.0f) + 160;
        Graphics graphics = this.m_App.m_OffsGraph;
        graphics.setColor(Def.GetColor(2));
        graphics.fillPolygon(nArray, nArray2, 3);
    }

    public void CameraFrame() {
        float f = this.m_Flag.GetCameraVect();
        if (this.m_Flag.CheckCameraRol()) {
            if (this.m_App.m_bKeyA) {
                this.DispCompass();
                this.m_Flag.SetCameraVectAnm(Calc3D.RadLimits(f - 0.7853982f));
            }
            if (this.m_App.m_bKeyS) {
                this.DispCompass();
                this.m_Flag.SetCameraVectAnm(Calc3D.RadLimits(f + 0.7853982f));
            }
        }
    }

    public boolean MovePlayer() {
        float f = this.m_Flag.GetCameraVect();
        int n = this.m_App.GetKeybordVect();
        float f2 = 0.0f;
        if (this.m_App.m_nMouseLeft == 0) {
            if (n == 0) {
                return false;
            }
            f2 = f + (float)(n - 1) * Calc3D.DEGtoRAD(45.0f);
        } else {
            float f3 = this.GetMouseVector();
            if (Calc3D.NearZero(f3 - -99999.9f)) {
                return false;
            }
            f2 = f + (float)Math.PI + f3;
            n = Calc3D.Rad2Int8(f3);
        }
        f2 = Calc3D.RadLimits(f2);
        this.m_Player.SetVect(f2);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.x = Calc3D.Sin(f2) * 40.0f;
        d3DXVECTOR3.z = Calc3D.Cos(f2) * 40.0f;
        CChrWork cChrWork = this.MoveChar(this.m_Player, d3DXVECTOR3);
        this.MoveParty(true);
        this.PaintGround();
        if (cChrWork != null) {
            if (cChrWork.m_nEvent == -2) {
                this.PushRock2(cChrWork, d3DXVECTOR3);
            } else if (cChrWork.m_nEvent == -1) {
                this.PushRock(cChrWork, d3DXVECTOR3);
            } else if (cChrWork.m_nEvent != 0) {
                Vari.m_Event.Run(cChrWork.m_nEvent, cChrWork.m_nWorkNo);
            }
        }
        if (this.m_nHitWallX != -1) {
            this.GetMovedPos();
            int n2 = this.m_App.m_NowStagePrm.CheckWallEvent(this.m_nMovX, this.m_nMovZ, this.m_nVFlag);
            if (n2 != -1) {
                Vari.m_Event.Run(n2, -1);
            }
            if ((n & 1) == 1) {
                CChrWork cChrWork2 = Vari.GetChrWork(3);
                if (this.m_App.m_Play.m_nAreaNo == 0 && this.m_App.m_Play.GetEvtFlag(135) && this.m_nMovX == CMapData.GetXBlock(cChrWork2.m_vPos.x) && this.m_nMovZ == CMapData.GetZBlock(cChrWork2.m_vPos.z)) {
                    this.m_App.OnShip();
                }
            }
            this.m_App.m_NowStagePrm.CheckTreasure(this.m_App, this.m_nMovX, this.m_nMovZ);
            this.m_App.m_NowStagePrm.CheckDoor(this.m_App, this.m_nMovX, this.m_nMovZ);
        }
        return true;
    }

    public void XChgArea(int n, int n2, int n3, int n4) {
        this.m_Player.m_vPos.x = CMapData.GetXPos(n2);
        this.m_Player.m_vPos.z = CMapData.GetZPos(n3);
        this.m_Player.SetVect(Calc3D.DEGtoRAD(n4 * 90));
        this.XChgArea2(n);
    }

    public int CheckEncount() {
        int n;
        int n2;
        int n3 = CMapData.GetXBlock(this.m_Player.m_vPos.x);
        this.m_nMoveCount = this.m_App.m_NowStagePrm.CheckEnemy(n3, n2 = CMapData.GetZBlock(this.m_Player.m_vPos.z)) ? ++this.m_nMoveCount : 0;
        int n4 = 1;
        if (this.m_nEncountPro > 0) {
            this.m_nEncountPro += -1;
            n4 = 2;
            if (this.m_nEncountPro == 0) {
                this.m_App.Slip("\u5fcd\u3073\u8db3\u306e\u52b9\u679c\u304c\u304d\u308c\u305f");
                this.m_nMoveCount /= 2;
            }
        }
        if ((n = this.m_App.m_NowStagePrm.CheckEncount(this.m_App.m_nMainCount, n3, n2, this.m_nMoveCount / n4)) != -1) {
            this.m_nMoveCount = 0;
            return n;
        }
        return -1;
    }

    public void DoScopeEvent(CScopeEvent cScopeEvent) {
        if (cScopeEvent.m_nKind == 1) {
            this.m_App.m_Fade.FadeOut(8);
            this.XChgArea(cScopeEvent.m_cSqu.m_nAreaNo, cScopeEvent.m_cSqu.m_nXPos, cScopeEvent.m_cSqu.m_nZPos, cScopeEvent.m_cSqu.m_nYRol);
            if (this.m_App.m_Fade.IsFade()) {
                this.m_App.m_Fade.FadeIn(8);
                return;
            }
        } else if (cScopeEvent.m_nKind == 2) {
            int n = CMapData.GetXBlock(this.m_Player.m_vPos.x);
            int n2 = CMapData.GetZBlock(this.m_Player.m_vPos.z);
            if (this.m_nScEvX != n || this.m_nScEvZ != n2) {
                this.m_nScEvX = n;
                this.m_nScEvZ = n2;
                Vari.m_Event.Run(cScopeEvent.m_cSqu.m_nAreaNo, -1);
            }
        }
    }

    public void XChgArea2(int n) {
        this.m_App.SetArea(n);
        this.InitArea();
        this.SetShip();
    }

    public void GetMovedPos() {
        float f = this.m_Player.m_vPos.x;
        float f2 = this.m_Player.m_vPos.z;
        this.m_nVFlag = Calc3D.Rad2IntBit(this.m_Player.GetMoveVect());
        if ((this.m_nVFlag & 1) != 0) {
            f2 += 100.0f;
        }
        if ((this.m_nVFlag & 2) != 0) {
            f += 100.0f;
        }
        if ((this.m_nVFlag & 4) != 0) {
            f2 -= 100.0f;
        }
        if ((this.m_nVFlag & 8) != 0) {
            f -= 100.0f;
        }
        this.m_nMovX = CMapData.GetXBlock(f);
        this.m_nMovZ = CMapData.GetZBlock(f2);
    }

    public boolean Move() {
        boolean bl = !this.m_App.m_bShip ? this.MovePlayer() : this.MoveShip();
        this.CameraFrame();
        if (this.CheckScopeEvent()) {
            bl = false;
        }
        return bl;
    }

    public void DispCompass() {
        this.m_nCompass = 30;
    }

    public boolean MoveShip() {
        float f = this.m_Flag.GetCameraVect();
        int n = this.m_App.GetKeybordVect();
        float f2 = 0.0f;
        if (this.m_App.m_nMouseLeft == 0) {
            if (n == 0) {
                return false;
            }
            f2 = f + (float)(n - 1) * Calc3D.DEGtoRAD(45.0f);
        } else {
            float f3 = this.GetMouseVector();
            if (Calc3D.NearZero(f3 - -99999.9f)) {
                return false;
            }
            f2 = f + (float)Math.PI + f3;
            n = Calc3D.Rad2Int8(f3);
        }
        f2 = Calc3D.RadLimits(f2);
        this.m_Player.SetVect(f2);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.x = Calc3D.Sin(f2) * 40.0f;
        d3DXVECTOR3.z = Calc3D.Cos(f2) * 40.0f;
        this.MoveShip(this.m_Player, d3DXVECTOR3);
        CChrWork cChrWork = Vari.GetChrWork(3);
        cChrWork.m_vPos.Set(this.m_Player.m_vPos);
        cChrWork.m_vRol.y = this.m_Player.m_vRol.y;
        if (this.m_nHitWallX != -1 && (n & 1) == 1) {
            this.GetMovedPos();
            D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
            d3DXVECTOR32.x = CMapData.GetXPos(this.m_nMovX);
            d3DXVECTOR32.z = CMapData.GetZPos(this.m_nMovZ);
            int n2 = this.m_App.m_NowMapData.CheckHit(d3DXVECTOR32);
            if (n2 == 0) {
                this.m_App.OffShip(d3DXVECTOR32);
            }
        }
        return true;
    }

    public CChrWork MoveShip(CChrWork cChrWork, D3DXVECTOR3 d3DXVECTOR3) {
        float f = d3DXVECTOR3.Magnitude();
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        d3DXVECTOR32.x = cChrWork.m_vPos.x + d3DXVECTOR3.x;
        d3DXVECTOR32.y = cChrWork.m_vPos.y + d3DXVECTOR3.y;
        d3DXVECTOR32.z = cChrWork.m_vPos.z + d3DXVECTOR3.z;
        CMoveCorrect cMoveCorrect = new CMoveCorrect();
        cMoveCorrect.Init(cChrWork, this.m_App.m_NowMapData, cChrWork.m_vPos);
        cMoveCorrect.SetShip();
        CChrWork cChrWork2 = cMoveCorrect.Move(d3DXVECTOR32, f);
        this.m_nHitWallX = cMoveCorrect.GetHitWallX();
        this.m_nHitWallZ = cMoveCorrect.GetHitWallZ();
        if (cChrWork.m_vPos.x < 800.0f) {
            cChrWork.m_vPos.x += 13600.0f;
        }
        if (cChrWork.m_vPos.x > 14400.0f) {
            cChrWork.m_vPos.x -= 13600.0f;
        }
        if (cChrWork.m_vPos.z < 1000.0f) {
            cChrWork.m_vPos.z += 12800.0f;
        }
        if (cChrWork.m_vPos.z > 13800.0f) {
            cChrWork.m_vPos.z -= 12800.0f;
        }
        return cChrWork2;
    }

    public void InReset() {
        this.m_nEncountPro = 0;
        this.m_nCatsEye = 0;
    }

    public void PaintGround() {
        int n;
        int n2;
        if ((this.m_App.m_Play.m_nAreaNo == 14 || this.m_App.m_Play.m_nAreaNo == 57) && this.m_App.m_Play.GetItem(127) > 0 && this.m_App.m_NowStagePrm.GetMapGround(n2 = CMapData.GetXBlock(this.m_Player.m_vPos.x), n = CMapData.GetZBlock(this.m_Player.m_vPos.z)) == 3) {
            this.m_App.m_NowStagePrm.SetMapGround(n2, n, 7);
        }
    }

    public void SetShip() {
        CChrWork cChrWork = Vari.GetChrWork(3);
        if (this.m_App.m_Play.m_nAreaNo == 0 && this.m_App.m_Play.GetEvtFlag(135)) {
            CChrPrm.Set(cChrWork, 32);
            cChrWork.m_vPos.x = CMapData.GetXPos(this.m_App.m_Play.m_nShipX);
            cChrWork.m_vPos.y = 0.0f;
            cChrWork.m_vPos.z = CMapData.GetXPos(this.m_App.m_Play.m_nShipZ);
            cChrWork.SetVect((float)this.m_App.m_Play.m_nShipV * 1.5707964f);
            return;
        }
        cChrWork.ResetFlag(1);
    }

    public void SetCamera() {
        if (Vari.m_bCameraMode) {
            this.SetCameraDebug();
            return;
        }
        CChrWork cChrWork = Vari.GetChrWork(Vari.GetCameraChr());
        float f = this.m_Flag.GetCameraVect();
        float f2 = -2000.0f;
        float f3 = 1800.0f;
        if (Vari.m_bDistView) {
            f2 = -2600.0f;
            f3 = 2340.0f;
        }
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.Set(cChrWork.m_vPos);
        d3DXVECTOR3.x += Calc3D.Sin(f) * f2;
        d3DXVECTOR3.y += f3;
        d3DXVECTOR3.z += Calc3D.Cos(f) * f2;
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        d3DXVECTOR32.Set(cChrWork.m_vPos);
        d3DXVECTOR32.y += 50.0f;
        this.m_App.m_Render.ViewTransform(d3DXVECTOR3, d3DXVECTOR32);
        if (this.m_App.m_Render.GetLightType() == 1) {
            cChrWork = Vari.GetChrWork(0);
            d3DXVECTOR3.Set(cChrWork.m_vPos);
            d3DXVECTOR3.x += Calc3D.Sin(cChrWork.GetDispVect()) * 70.0f;
            d3DXVECTOR3.y += 300.0f;
            d3DXVECTOR3.z += Calc3D.Cos(cChrWork.GetDispVect()) * 70.0f;
            this.m_App.m_Render.SetLightPos(d3DXVECTOR3);
        }
    }

    public void MakePartyTable() {
        int n = 0;
        do {
            Vari.m_anPartyTable[n] = -1;
        } while (++n < 3);
        n = 0;
        int n2 = 0;
        do {
            if (!Vari.GetChrWork(n2).GetFlag(1) && n2 != 0) continue;
            Vari.m_anPartyTable[n] = n2;
            ++n;
        } while (++n2 < 3);
    }

    public CChrWork MoveChar(CChrWork cChrWork, D3DXVECTOR3 d3DXVECTOR3) {
        float f = d3DXVECTOR3.Magnitude();
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        d3DXVECTOR32.x = cChrWork.m_vPos.x + d3DXVECTOR3.x;
        d3DXVECTOR32.y = cChrWork.m_vPos.y + d3DXVECTOR3.y;
        d3DXVECTOR32.z = cChrWork.m_vPos.z + d3DXVECTOR3.z;
        CMoveCorrect cMoveCorrect = new CMoveCorrect();
        cMoveCorrect.Init(cChrWork, this.m_App.m_NowMapData, cChrWork.m_vPos);
        CChrWork cChrWork2 = cMoveCorrect.Move(d3DXVECTOR32, f);
        this.m_nHitWallX = cMoveCorrect.GetHitWallX();
        this.m_nHitWallZ = cMoveCorrect.GetHitWallZ();
        return cChrWork2;
    }

    public void InitPrm() {
        Vari.GetChrPrm((int)0).m_Abi.SetFlagM(116);
        Vari.SetCameraChr(0);
        this.InReset();
        this.InitArea();
    }

    public void MoveParty(boolean bl) {
        if (bl) {
            this.m_Party.AddPos(this.m_Player.m_vPos, this.m_Player.m_fVect);
        } else {
            this.m_Party.AddPos2(this.m_Player.m_vPos, this.m_Player.m_fVect);
        }
        int n = 1;
        while (n < Vari.GetPartyNum()) {
            int n2 = Vari.GetPartyWork(n);
            CChrWork cChrWork = Vari.GetChrWork(n2);
            cChrWork.m_vPos.x = this.m_Party.GetXPos(n);
            cChrWork.m_vPos.z = this.m_Party.GetZPos(n);
            cChrWork.SetVect(this.m_Party.GetVect(n));
            ++n;
        }
    }

    public void InitArea() {
        Vari.m_nQuake = 0;
        this.m_nMoveCount = 0;
        this.m_nScEvX = -1;
        this.m_nScEvZ = -1;
        this.GetMovedPos();
    }

    public CChrWork FrontCharHit(CChrWork cChrWork, D3DXVECTOR3 d3DXVECTOR3) {
        float f = d3DXVECTOR3.Magnitude();
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        d3DXVECTOR32.x = cChrWork.m_vPos.x + d3DXVECTOR3.x;
        d3DXVECTOR32.y = cChrWork.m_vPos.y + d3DXVECTOR3.y;
        d3DXVECTOR32.z = cChrWork.m_vPos.z + d3DXVECTOR3.z;
        CMoveCorrect cMoveCorrect = new CMoveCorrect();
        cMoveCorrect.Init(cChrWork, this.m_App.m_NowMapData, cChrWork.m_vPos);
        CChrWork cChrWork2 = cMoveCorrect.Move(d3DXVECTOR32, f);
        this.m_nHitWallX = cMoveCorrect.GetHitWallX();
        this.m_nHitWallZ = cMoveCorrect.GetHitWallZ();
        return cChrWork2;
    }

    public void PushRock(CChrWork cChrWork, D3DXVECTOR3 d3DXVECTOR3) {
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        D3DXVECTOR3 d3DXVECTOR33 = new D3DXVECTOR3(cChrWork.m_vPos);
        d3DXVECTOR32.x = cChrWork.m_vPos.x - this.m_Player.m_vPos.x;
        d3DXVECTOR32.z = cChrWork.m_vPos.z - this.m_Player.m_vPos.z;
        float f = Calc3D.CalcAngleXZ(d3DXVECTOR32);
        if (!(Calc3D.NearZero((f = Calc3D.RadLimits45(f)) - 0.7853982f) || Calc3D.NearZero(f - 2.3561945f) || Calc3D.NearZero(f - 3.926991f) || Calc3D.NearZero(f - 5.4977875f))) {
            d3DXVECTOR32 = Calc3D.Angle2Vect(f);
            d3DXVECTOR3.x *= 0.5f;
            d3DXVECTOR3.z *= 0.5f;
            float f2 = d3DXVECTOR3.Magnitude();
            d3DXVECTOR32.x *= f2;
            d3DXVECTOR32.z *= f2;
            CChrWork cChrWork2 = this.MoveChar(cChrWork, d3DXVECTOR32);
            if (cChrWork2 == null) {
                D3DXVECTOR3 d3DXVECTOR34 = new D3DXVECTOR3(cChrWork.m_vPos);
                D3DXVECTOR3 d3DXVECTOR35 = new D3DXVECTOR3(cChrWork.m_vPos);
                d3DXVECTOR35.Add(d3DXVECTOR32);
                CMoveCorrect cMoveCorrect = new CMoveCorrect();
                cMoveCorrect.Init(cChrWork, this.m_App.m_NowMapData, cChrWork.m_vPos);
                cChrWork2 = cMoveCorrect.Move(d3DXVECTOR35, f2);
                if (cChrWork2 != null) {
                    cChrWork.m_vPos.Set(d3DXVECTOR33);
                } else {
                    cChrWork.m_vPos.Set(d3DXVECTOR34);
                }
            }
            if (this.m_nHitWallX != -1 || cChrWork2 != null) {
                int n;
                int n2 = CMapData.GetXBlock(cChrWork.m_vPos.x);
                int n3 = CMapData.GetZBlock(cChrWork.m_vPos.z);
                float f3 = CMapData.GetXPos(n2);
                float f4 = CMapData.GetZPos(n3);
                float f5 = cChrWork.m_vPos.x - f3;
                float f6 = cChrWork.m_vPos.z - f4;
                int n4 = (int)Calc3D.RADtoDEG(f);
                if (n4 == 0) {
                    n = CMapData.GetZBlock(cChrWork.m_vPos.z + 20.0f);
                    if (this.m_App.m_NowMapData.GetHit(n2, n) != 0) {
                        return;
                    }
                    if (f5 > 0.0f && f5 <= 45.0f) {
                        if ((f5 -= 10.0f) < 0.0f) {
                            f5 = 0.0f;
                        }
                        cChrWork.m_vPos.x = f3 + f5;
                    }
                    if (f5 < 0.0f && f5 >= -45.0f) {
                        f5 += 10.0f;
                        if (f6 > 0.0f) {
                            f5 = 0.0f;
                        }
                        cChrWork.m_vPos.x = f3 + f5;
                    }
                }
                if (n4 == 180) {
                    n = CMapData.GetZBlock(cChrWork.m_vPos.z + 20.0f);
                    if (this.m_App.m_NowMapData.GetHit(n2, n) != 0) {
                        return;
                    }
                    if (f5 > 0.0f && f5 <= 45.0f) {
                        if ((f5 -= 10.0f) < 0.0f) {
                            f5 = 0.0f;
                        }
                        cChrWork.m_vPos.x = f3 + f5;
                    }
                    if (f5 < 0.0f && f5 >= -45.0f) {
                        f5 += 10.0f;
                        if (f6 > 0.0f) {
                            f5 = 0.0f;
                        }
                        cChrWork.m_vPos.x = f3 + f5;
                    }
                }
                if (n4 == 270) {
                    n = CMapData.GetXBlock(cChrWork.m_vPos.x + 20.0f);
                    if (this.m_App.m_NowMapData.GetHit(n, n3) != 0) {
                        return;
                    }
                    if (f6 > 0.0f && f6 <= 45.0f) {
                        if ((f6 -= 10.0f) < 0.0f) {
                            f6 = 0.0f;
                        }
                        cChrWork.m_vPos.z = f4 + f6;
                    }
                    if (f6 < 0.0f && f6 >= -45.0f) {
                        if ((f6 += 10.0f) > 0.0f) {
                            f6 = 0.0f;
                        }
                        cChrWork.m_vPos.z = f4 + f6;
                    }
                }
                if (n4 == 90) {
                    n = CMapData.GetXBlock(cChrWork.m_vPos.x - 20.0f);
                    if (this.m_App.m_NowMapData.GetHit(n, n3) != 0) {
                        return;
                    }
                    if (f6 > 0.0f && f6 <= 45.0f) {
                        if ((f6 -= 10.0f) < 0.0f) {
                            f6 = 0.0f;
                        }
                        cChrWork.m_vPos.z = f4 + f6;
                    }
                    if (f6 < 0.0f && f6 >= -45.0f) {
                        if ((f6 += 10.0f) > 0.0f) {
                            f6 = 0.0f;
                        }
                        cChrWork.m_vPos.z = f4 + f6;
                    }
                }
            }
            this.MoveChar(this.m_Player, d3DXVECTOR3);
        }
    }

    CGameMain() {
    }

    CGameMain(ARpg aRpg) {
        this.m_App = aRpg;
        this.m_Flag = this.m_App.m_Flag;
        this.m_Player = Vari.m_Char.GetWork(0);
    }

    public void InitContinue() {
        CChrWork cChrWork = Vari.GetChrWork(1);
        if (!this.m_App.m_Play.GetEvtFlag(252)) {
            if (this.m_App.m_Play.GetEvtFlag(145)) {
                CChrPrm.Set(cChrWork, 73);
                cChrWork.SetFlag(32);
            } else if (this.m_App.m_Play.GetEvtFlag(131)) {
                CChrPrm.Set(cChrWork, 57);
                cChrWork.SetFlag(32);
            } else if (this.m_App.m_Play.GetEvtFlag(2)) {
                CChrPrm.Set(cChrWork, 29);
                cChrWork.SetFlag(32);
            }
        }
        if (this.m_App.m_Play.GetEvtFlag(255) && !this.m_App.m_Play.GetEvtFlag(259)) {
            cChrWork.SetFlag(16384);
        }
        if (!this.m_App.m_Play.GetEvtFlag(1)) {
            cChrWork.ResetFlag(1);
        }
        this.MakePartyTable();
    }

    public void PushRock2(CChrWork cChrWork, D3DXVECTOR3 d3DXVECTOR3) {
        if (cChrWork.m_nMode != 0) {
            return;
        }
        float f = Calc3D.RadLimits45(Calc3D.CalcAngleXZ(d3DXVECTOR3));
        int n = (int)Calc3D.RADtoDEG(f);
        if (n == 0 || n == 180 ? Calc3D.Abs(this.m_Player.m_vPos.x - cChrWork.m_vPos.x) >= 100.0f : Calc3D.Abs(this.m_Player.m_vPos.z - cChrWork.m_vPos.z) >= 100.0f) {
            return;
        }
        if (n == 180) {
            cChrWork.m_nMode = 1;
        }
        if (n == 270) {
            cChrWork.m_nMode = 2;
        }
        if (n == 0) {
            cChrWork.m_nMode = 3;
        }
        if (n == 90) {
            cChrWork.m_nMode = 4;
        }
    }

    public void InitParty() {
        float f = this.m_Player.m_fVect;
        this.m_Party.InitPos(this.m_Player.m_vPos, f);
        this.MoveParty(true);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.x = Calc3D.Sin(f) * 15.0f;
        d3DXVECTOR3.z = Calc3D.Cos(f) * 15.0f;
        this.MoveChar(this.m_Player, d3DXVECTOR3);
        this.MoveParty(true);
    }

    public boolean CheckScopeEvent() {
        int n = CMapData.GetXBlock(this.m_Player.m_vPos.x);
        int n2 = CMapData.GetZBlock(this.m_Player.m_vPos.z);
        if (this.m_nScEvX != n || this.m_nScEvZ != n2) {
            this.m_nScEvX = -1;
            this.m_nScEvZ = -1;
        }
        this.m_App.m_Play.ResetEvtFlag(311);
        int n3 = this.m_App.m_NowStagePrm.GetMapGround(n, n2);
        if (n3 == 20) {
            this.m_App.m_Play.SetEvtFlag(311);
        }
        CAreaParam cAreaParam = this.m_App.m_NowStagePrm;
        int n4 = 0;
        while (n4 < cAreaParam.m_nScopeNum) {
            CScopeEvent cScopeEvent = cAreaParam.m_acScope[n4];
            if (CAreaParam.CheckIf(cScopeEvent.m_nIf) && cScopeEvent.m_nXPos <= n && cScopeEvent.m_nZPos <= n2 && cScopeEvent.m_nXPos + cScopeEvent.m_nXSize - 1 >= n && cScopeEvent.m_nZPos + cScopeEvent.m_nZSize - 1 >= n2) {
                this.DoScopeEvent(cScopeEvent);
                return true;
            }
            ++n4;
        }
        return false;
    }

    float GetMouseVector() {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(-this.m_App.m_nMouseX + 200, 0.0f, -this.m_App.m_nMouseY + 160);
        if (d3DXVECTOR3.Magnitude() < 20.0f) {
            return -99999.9f;
        }
        return Calc3D.CalcAngleXZ(d3DXVECTOR3);
    }

    public boolean CheckHitSquare(int n, int n2, CChrWork cChrWork, float f) {
        this.m_nReturnValue = -1;
        if (this.m_App.m_NowMapData.IsOut(n, n2)) {
            return true;
        }
        int n3 = this.m_App.m_NowMapData.GetPtr(n, n2);
        if (this.m_App.m_NowMapData.GetHit(n3) > 0) {
            return true;
        }
        return this.CheckInSquareChr(n, n2, cChrWork, f);
    }

    public boolean CheckExecScope(int n) {
        if (n == -1) {
            return true;
        }
        if (n < 10000) {
            return this.m_App.m_Play.GetEvtFlag(n);
        }
        return !this.m_App.m_Play.GetEvtFlag(n - 10000);
    }
}

