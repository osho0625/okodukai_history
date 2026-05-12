/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;
import java.awt.Image;

public class ARpg
extends CPassWordPanel
implements Runnable {
    public CModel[] m_aModel;
    public Image[] m_aImage;
    public CDrawSort m_Sort;
    public CChrWork m_Player;
    public CGameMain m_Game;
    public CBattleMain m_Battle;
    public CGameFlag m_Flag;
    public CPlayData m_Play;
    public CEnemy m_Enemy;
    public CStageManage m_Stage;
    public CSysMenu m_SysMenu;
    public CMessWindow m_MessWin;
    private CMoneyWindow m_MoneyWindow = new CMoneyWindow();
    public CDebug m_Debug;
    public CAreaParam m_NowStagePrm;
    public CMapData m_NowMapData;
    public CFadeIn m_Fade;
    public int m_nMainCount;
    public int m_nBMainCount;
    public boolean m_bGameOver;
    public boolean m_bShip;
    public int m_nLoadCount;
    public int m_nDispLoad;
    public boolean m_bErrorLoad;
    static int m_nWaitFlag;
    private static final float[] m_afQuakeTable;

    public void DrawChara_Battle() {
        CModelTrans cModelTrans = new CModelTrans();
        float f = this.m_Flag.GetCameraVect();
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        D3DXVECTOR3 d3DXVECTOR33 = new D3DXVECTOR3();
        int n = 0;
        do {
            CBattleWork cBattleWork = Vari.GetBChrWork(n);
            if (cBattleWork.m_Chr == null) continue;
            CChrWork cChrWork = cBattleWork.m_Chr;
            d3DXVECTOR3.Set(cBattleWork.m_vPos);
            d3DXVECTOR3.y += cChrWork.m_fYAdd;
            d3DXVECTOR32.Set(cBattleWork.m_vRol);
            d3DXVECTOR32.y += cChrWork.m_fRAdd;
            if (cChrWork.IsDisp()) {
                int n2 = 2;
                int n3 = cChrWork.GetModel();
                d3DXVECTOR33.Set(cChrWork.m_vScale);
                if ((cChrWork.m_nDisp & 0x100) != 0) {
                    n2 = 5;
                    d3DXVECTOR33.z = 0.35f;
                    d3DXVECTOR32.x = 0.05f;
                    d3DXVECTOR32.y = Calc3D.DEGtoRAD(this.m_nBMainCount % 36 * 10);
                }
                this.m_Render.CalcModel(this.m_aModel[n3], cChrWork.m_BndBox, d3DXVECTOR3, d3DXVECTOR32, d3DXVECTOR33, 0);
                if (cChrWork.m_BndBox.CheckDisplayIn()) {
                    cModelTrans.m_mWVP.Set(this.m_Render.GetWVPMatrix());
                    cModelTrans.m_mWorld.Set(this.m_Render.GetTransform(3));
                    this.m_Sort.RecObject(n2, n3, cChrWork.m_BndBox, cModelTrans, cChrWork.m_nDisp, cChrWork.m_nColor);
                }
                this.m_Render.DrawShadow(d3DXVECTOR3, cChrWork.m_fHitSize, f);
                if (cChrWork.GetDisp(32)) {
                    this.Draw_Confision(cBattleWork, n3);
                }
                if (cChrWork.GetDisp(256)) {
                    this.Draw_Close(cBattleWork);
                }
                if (cChrWork.GetDisp(1024)) {
                    this.Draw_Aura(cBattleWork, n3);
                }
                if (cChrWork.GetDisp(4096)) {
                    this.Draw_SuikaAura(cBattleWork, n3);
                }
            }
            if (cChrWork.GetFlag(512)) continue;
            if (cChrWork.GetFlag(4)) {
                this.DrawCharCursor(1, d3DXVECTOR3, cChrWork.m_fHitSize / 50.0f);
                continue;
            }
            if (!cChrWork.GetFlag(2)) continue;
            this.DrawCharCursor(0, d3DXVECTOR3, cChrWork.m_fHitSize / 50.0f);
        } while (++n < 8);
    }

    public void MainFrame() {
        this.Motion();
        this.m_Game.MoveEvent();
        this.DrawDisplay();
        this.DoFrame();
        this.WaitRepaint(this.GetWaitFrame());
        Calc3D.Rand(1);
    }

    public void SetStagePrm(int n) {
        CAreaParam cAreaParam = this.m_Stage.GetStage(n);
        this.m_Render.SetRenderState(9, cAreaParam.m_cBackColor);
        this.m_Render.SetRenderState(8, cAreaParam.m_cAmbient);
        Vari.m_fFogStart = cAreaParam.m_fFogStart;
        Vari.m_fFogEnd = cAreaParam.m_fFogEnd;
        if (Calc3D.NearZero(cAreaParam.m_fFogStart) && Calc3D.NearZero(cAreaParam.m_fFogEnd)) {
            this.m_Render.SetRenderState(4, 0);
        } else {
            this.m_Render.SetRenderState(4, 1);
            this.m_Render.SetRenderState(7, cAreaParam.m_cFogColor);
        }
        this.SetFogDistance();
        this.m_Render.SetRenderState(3, true);
        D3DLIGHT8 d3DLIGHT8 = new D3DLIGHT8();
        d3DLIGHT8.m_nType = cAreaParam.m_nLightMode == 0 ? 2 : 1;
        d3DLIGHT8.m_cDiffuse.Set(cAreaParam.m_cLightColor);
        d3DLIGHT8.m_vPosition.Set(cAreaParam.m_vLightPos);
        d3DLIGHT8.m_vDirection.Set(cAreaParam.m_vLightPos);
        d3DLIGHT8.m_vDirection.Set(new D3DXVECTOR3(0.0f, -0.7f, -0.7f));
        d3DLIGHT8.m_fRange = cAreaParam.m_fLightRange;
        this.m_Render.SetLight(d3DLIGHT8);
        Vari.m_Char.ClearNpcWork();
        int n2 = 0;
        while (n2 < cAreaParam.m_nNpcNum) {
            CChrWork cChrWork = Vari.m_Char.GetWork(8 + n2);
            CNpc cNpc = cAreaParam.m_acNpc[n2];
            CChrPrm.Set(cChrWork, cNpc.m_nKind);
            cChrWork.m_vPos.x = CMapData.GetXPos(cNpc.m_nXPos);
            cChrWork.m_vPos.y = 0.0f;
            cChrWork.m_vPos.z = CMapData.GetZPos(cNpc.m_nZPos);
            cChrWork.SetVect((float)cNpc.m_nVect * 1.5707964f);
            cChrWork.m_nAlgo = cNpc.m_nMode;
            cChrWork.m_nEvent = cNpc.m_nEvent;
            if (!CAreaParam.CheckIf(cNpc.m_nIf)) {
                cChrWork.ResetFlag(1);
            }
            ++n2;
        }
    }

    public void DrawEffect2D() {
        int n = 0;
        do {
            CEfcWork cEfcWork;
            if (!(cEfcWork = Vari.GetEfcWork(n)).GetFlag(1) || !cEfcWork.GetFlag(2)) continue;
            D3DXVECTOR3 d3DXVECTOR3 = this.m_Render.Get3DPosBW(cEfcWork.m_vPos);
            this.DrawImage(cEfcWork.m_nPat, (int)d3DXVECTOR3.x - 32, (int)d3DXVECTOR3.y - 32);
        } while (++n < 256);
    }

    public void Draw_Blind() {
        int n = this.m_nBMainCount % 6 + 22;
        int n2 = 0;
        do {
            CChrWork cChrWork;
            CBattleWork cBattleWork = Vari.GetBChrWork(n2);
            if (cBattleWork.m_Chr == null || !(cChrWork = cBattleWork.m_Chr).GetFlag(1) || cChrWork.GetFlag(512) || cBattleWork.m_Prm.GetBlind() <= 0) continue;
            D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
            d3DXVECTOR3.Set(cBattleWork.m_vPos);
            d3DXVECTOR3.x += Calc3D.Sin(cBattleWork.m_vRol.y) * 40.0f;
            d3DXVECTOR3.y += this.m_aModel[cChrWork.GetModel()].GetTopY() * cBattleWork.m_vScale.y * 0.8f;
            d3DXVECTOR3.z += Calc3D.Cos(cBattleWork.m_vRol.y) * 40.0f;
            D3DXVECTOR3 d3DXVECTOR32 = this.m_Render.Get3DPosBW(d3DXVECTOR3);
            this.DrawImage(n, (int)d3DXVECTOR32.x - 32, (int)d3DXVECTOR32.y - 32);
        } while (++n2 < 8);
    }

    public void MainGame() {
        new D3DXVECTOR3();
        new D3DXVECTOR3(100.0f, 100.0f, 100.0f);
        this.m_Render.ProjTransform(10.0f, 5000.0f);
        boolean bl = false;
        this.m_bGameOver = false;
        int n;
        int n2;
        while (!bl || this.m_bShip || (n2 = this.m_Game.CheckEncount()) == -1 || (n = this.m_Battle.Main(n2, this.m_NowMapData.GetGround(this.m_Player.m_vPos) - 1, true)) != 2) {
            bl = this.m_Game.Move();
            if (this.m_bGameOver) {
                return;
            }
            CNpcMove.Move();
            this.MainFrame();
            if (this.m_Game.m_nCatsEye > 0 && (this.m_nMainCount & 3) == 0) {
                this.m_Game.m_nCatsEye += -1;
            }
            if (this.m_bKeyZ || this.m_nMouseRight == 1) {
                if (this.m_nMouseRight == 1) {
                    this.m_nMouseRight = 2;
                }
                this.m_SysMenu.Run();
            }
            if (this.m_nKeyC != 1) continue;
            this.m_nKeyC = 2;
            Vari.m_bDistView = !Vari.m_bDistView;
            this.SetFogDistance();
        }
        return;
    }

    public void Motion() {
        int n = 0;
        do {
            CChrWork cChrWork;
            if (!(cChrWork = Vari.GetChrWork(n)).GetFlag(1) || cChrWork.GetFlag(16) || Vari.IsStopWorld(cChrWork.m_nWorkNo)) continue;
            cChrWork.Anim(this.m_nMainCount);
        } while (++n < 24);
    }

    public void Draw_Confision(CBattleWork cBattleWork, int n) {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        CCalcBndBox cCalcBndBox = new CCalcBndBox();
        CModelTrans cModelTrans = new CModelTrans();
        int n2 = 86;
        float f = cBattleWork.m_Chr.m_fHitSize;
        int n3 = 0;
        do {
            float f2 = Calc3D.DEGtoRAD(n3 * 180 + this.m_nMainCount % 36 * 10);
            d3DXVECTOR3.Set(cBattleWork.m_vPos);
            d3DXVECTOR3.x += Calc3D.Sin(f2) * f;
            d3DXVECTOR3.y += this.m_aModel[n].GetTopY() * cBattleWork.m_vScale.y * 0.9f;
            d3DXVECTOR3.z += Calc3D.Cos(f2) * f;
            d3DXVECTOR32.y = f2 + 1.5707964f;
            this.m_Render.CalcModel(this.m_aModel[n2], cCalcBndBox, d3DXVECTOR3, d3DXVECTOR32, Def.DEF_SCALE, 0);
            cModelTrans.m_mWVP.Set(this.m_Render.GetWVPMatrix());
            cModelTrans.m_mWorld.Set(this.m_Render.GetTransform(3));
            this.m_Sort.RecObject(2, n2, cCalcBndBox, cModelTrans, 0, 0);
        } while (++n3 < 2);
    }

    public void MoveEffect() {
        this.ResetEffectMoved();
        int n = 0;
        do {
            int n2 = 0;
            do {
                CEfcWork cEfcWork;
                if (!(cEfcWork = Vari.GetEfcWork(n2)).GetFlag(1)) continue;
                cEfcWork.Run();
            } while (++n2 < 256);
        } while (++n < 2);
    }

    public void OnShip() {
        this.m_bShip = true;
        CChrWork cChrWork = Vari.GetChrWork(0);
        CChrWork cChrWork2 = Vari.GetChrWork(3);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(cChrWork2.m_vPos);
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3(cChrWork.m_vPos);
        cChrWork.LookAt(d3DXVECTOR3);
        cChrWork2.SetFlag(256);
        int n = 0;
        do {
            if (n < 5) {
                float f = (float)n / 5.0f;
                cChrWork.m_vPos.x = d3DXVECTOR3.x * f + d3DXVECTOR32.x * (1.0f - f);
                cChrWork.m_vPos.z = d3DXVECTOR3.z * f + d3DXVECTOR32.z * (1.0f - f);
            } else {
                cChrWork.m_vPos.Set(d3DXVECTOR3);
            }
            this.m_Game.MoveParty(false);
            this.MainFrame();
            if (n % 5 != 4) continue;
            CChrWork cChrWork3 = Vari.GetChrWork(n / 5);
            cChrWork3.ResetFlag(1);
            cChrWork.m_vPos.Set(Vari.GetChrWork((int)3).m_vPos);
        } while (++n < 15);
        cChrWork2.ResetFlag(256);
    }

    public void SetLightRange() {
        CAreaParam cAreaParam = this.GetAreaParam();
        float f = cAreaParam.m_fLightRange;
        if (cAreaParam.m_nLightMode == 1 && !this.m_Flag.GetFlag(1)) {
            if (this.m_Game.m_nCatsEye > 0) {
                f += (float)this.m_Game.m_nCatsEye;
            }
            this.m_Render.SetLightRange(f);
        }
        D3DLIGHT8 d3DLIGHT8 = this.m_Render.GetLight();
        if (d3DLIGHT8.m_Flag.GetFlag(1)) {
            float f2 = Calc3D.DEGtoRAD((float)this.m_nMainCount * 10.0f);
            D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
            d3DXVECTOR3.x = Calc3D.Sin(f2) * 300.0f;
            d3DXVECTOR3.y = 300.0f;
            d3DXVECTOR3.z = Calc3D.Cos(f2) * 300.0f;
            this.m_Render.SetLightPos(d3DXVECTOR3);
        }
    }

    public void ErrorLoadData() {
        if (!this.m_bErrorLoad) {
            this.m_Render.SetColor(Color.white);
            Vari.cInit.DrawText("\u8aad\u307f\u8fbc\u307f\u30a8\u30e9\u30fc\u3067\u3059");
            Vari.cInit.DrawText("\u30a4\u30f3\u30bf\u30fc\u30cd\u30c3\u30c8\u306b\u63a5\u7d9a\u3057\u3066\u304f\u3060\u3055\u3044");
            this.repaint();
        }
        this.m_bErrorLoad = true;
    }

    public void UpdateLoadCount() {
        ++this.m_nLoadCount;
        Vari.cInit.DrawRestPercent(this.m_nLoadCount);
        this.repaint();
    }

    public void ResetEffectMoved() {
        int n = 0;
        do {
            CEfcWork cEfcWork;
            if (!(cEfcWork = Vari.GetEfcWork(n)).GetFlag(1)) continue;
            cEfcWork.ResetMoved();
        } while (++n < 256);
    }

    public CAreaParam GetAreaParam() {
        return this.m_Stage.GetStage(this.m_Play.m_nAreaNo);
    }

    public void DrawChara() {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3(0.0f, 0.0f, 0.0f);
        CModelTrans cModelTrans = new CModelTrans();
        float f = this.m_Flag.GetCameraVect();
        int n = 0;
        do {
            CChrWork cChrWork;
            if (!(cChrWork = Vari.GetChrWork(n)).IsDisp()) continue;
            int n2 = cChrWork.m_nChrH + cChrWork.m_nChrL + 55;
            d3DXVECTOR3.Set(cChrWork.m_vPos);
            d3DXVECTOR3.y += cChrWork.m_fYAdd;
            d3DXVECTOR32.Set(cChrWork.m_vRol);
            d3DXVECTOR32.y += cChrWork.m_fRAdd;
            this.m_Render.CalcModel(this.m_aModel[n2], cChrWork.m_BndBox, d3DXVECTOR3, d3DXVECTOR32, cChrWork.m_vScale, 0);
            if (!cChrWork.m_BndBox.CheckDisplayIn()) continue;
            cModelTrans.m_mWVP.Set(this.m_Render.GetWVPMatrix());
            cModelTrans.m_mWorld.Set(this.m_Render.GetTransform(3));
            int n3 = cChrWork.m_nDisp;
            if (cChrWork.GetFlag(256)) {
                n3 |= 4;
            }
            if (cChrWork.GetFlag(4096)) {
                n3 |= 8;
            }
            if (cChrWork.GetFlag(128)) {
                n3 |= 0x40;
            }
            if (cChrWork.GetFlag(131072)) {
                n3 |= 0x1000;
            }
            if (cChrWork.GetFlag(8192)) {
                n3 |= 0x200;
            }
            this.m_Sort.RecObject(2, n2, cChrWork.m_BndBox, cModelTrans, n3, cChrWork.m_nColor);
            if (cChrWork.GetFlag(64)) continue;
            this.m_Render.DrawShadow(cChrWork.m_vPos, cChrWork.m_fHitSize, f);
        } while (++n < 24);
    }

    public void Draw_Aura(CBattleWork cBattleWork, int n) {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        CCalcBndBox cCalcBndBox = new CCalcBndBox();
        CModelTrans cModelTrans = new CModelTrans();
        int n2 = 104;
        float f = cBattleWork.m_Chr.m_fHitSize * 0.02f;
        float f2 = Calc3D.DEGtoRAD(this.m_nBMainCount % 36 * 10);
        d3DXVECTOR3.Set(cBattleWork.m_vPos);
        d3DXVECTOR32.y = f2;
        int n3 = 33 + (this.m_nBMainCount & 3);
        D3DXVECTOR3 d3DXVECTOR33 = new D3DXVECTOR3();
        d3DXVECTOR33.x = f;
        d3DXVECTOR33.y = 0.2f * f;
        d3DXVECTOR33.z = f;
        this.m_Render.CalcModel(this.m_aModel[n2], cCalcBndBox, d3DXVECTOR3, d3DXVECTOR32, d3DXVECTOR33, 0);
        cModelTrans.m_mWVP.Set(this.m_Render.GetWVPMatrix());
        cModelTrans.m_mWorld.Set(this.m_Render.GetTransform(3));
        this.m_Sort.RecObject(2, n2, cCalcBndBox, cModelTrans, 4, n3);
    }

    public void Draw_SuikaAura(CBattleWork cBattleWork, int n) {
        if ((this.m_nBMainCount & 0xF) == 0) {
            Vari.MakeEffect(122, cBattleWork.m_vPos, CEfcWork.AngleRand(), cBattleWork.m_Chr.m_fHitSize);
        }
    }

    public void start() {
        if (this.m_Thread == null) {
            this.m_Thread = new Thread(this);
            this.m_Thread.start();
        }
    }

    public void DrawDisplay_Field() {
        if (this.m_Play.GetEvtFlag(330)) {
            Vari.m_Cosmo.Draw(this.m_Render, this.m_OffsGraph);
        }
        this.m_Render.DrawGround(this.m_NowStagePrm);
        this.DrawChara();
        this.m_Render.DrawMap(this.m_NowStagePrm);
        this.DrawEffect();
        this.m_Sort.Sort();
        this.DrawAll();
        if (!this.m_Fade.IsFade()) {
            this.m_Game.DrawCompass();
        }
    }

    public String getAppletInfo() {
        return "\u3059\u3044\u304b\u304c\u98df\u3079\u305f\u3044\r\n" + "\u304d\u3083\u3068\u307f\u3085\u3046( http://www.din.or.jp/~null/ )";
    }

    public void DrawImage(int n, int n2, int n3) {
        this.m_OffsGraph.drawImage(this.m_aImage[n], n2, n3, this);
    }

    public void DrawCharCursor(int n, D3DXVECTOR3 d3DXVECTOR3, float f) {
        float f2 = Calc3D.DEGtoRAD((float)this.m_nMainCount * 10.0f);
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3(d3DXVECTOR3.x, 0.0f, d3DXVECTOR3.z);
        D3DXVECTOR3 d3DXVECTOR33 = new D3DXVECTOR3(0.0f, f2, 0.0f);
        D3DXVECTOR3 d3DXVECTOR34 = new D3DXVECTOR3(f, 1.0f, f);
        int n2 = 74;
        if (n == 1) {
            n2 = 75;
        }
        this.DrawModel(n2, d3DXVECTOR32, d3DXVECTOR33, d3DXVECTOR34, 2, 0);
    }

    public void DrawSort(CSortWork cSortWork) {
        this.m_Render.DrawModel(this.m_aModel[cSortWork.m_nModelNo], cSortWork.m_cTrans, cSortWork.m_nFlag, cSortWork.m_nColor);
    }

    public void Draw_Close(CBattleWork cBattleWork) {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        CModelTrans cModelTrans = new CModelTrans();
        int n = 146;
        CCalcBndBox cCalcBndBox = new CCalcBndBox();
        d3DXVECTOR32.y = Calc3D.DEGtoRAD(this.m_nBMainCount % 36 * 10);
        d3DXVECTOR3.Set(cBattleWork.m_vPos);
        this.m_Render.CalcModel(this.m_aModel[n], cCalcBndBox, d3DXVECTOR3, d3DXVECTOR32, Def.DEF_SCALE, 0);
        cModelTrans.m_mWVP.Set(this.m_Render.GetWVPMatrix());
        cModelTrans.m_mWorld.Set(this.m_Render.GetTransform(3));
        this.m_Sort.RecObject(2, n, cCalcBndBox, cModelTrans, 0, 0);
    }

    public void DrawDisplay() {
        if (!this.m_Flag.GetFlag(1) && !Vari.m_SysFlag.GetFlag(16)) {
            this.m_Game.SetCamera();
        }
        if (this.m_nStopDisplay < 2) {
            this.SetLightRange();
            this.m_Fade.Frame();
            this.EarthQuake();
            this.MoveEffect();
            this.m_Render.Clear();
        }
        if (this.m_nStopDisplay >= 2) {
            this.m_OffsGraph.drawImage(this.m_BackImage, 0, 0, this);
        } else {
            this.m_Sort.Clear();
            if (!this.m_Flag.GetFlag(1)) {
                this.DrawDisplay_Field();
            } else {
                this.DrawDisplay_Battle();
            }
        }
        if (this.m_nStopDisplay == 1) {
            this.GetDisplay();
        }
        this.Draw_Blind();
        this.DrawEffect2D();
        this.DrawTextObject();
        if (this.m_Flag.GetFlag(1)) {
            this.m_Battle.DrawDisplay();
        }
        this.RunWindow();
    }

    public void DrawEffect() {
        new D3DXVECTOR3(0.0f, 0.0f, 0.0f);
        CModelTrans cModelTrans = new CModelTrans();
        float f = this.m_Flag.GetCameraVect();
        int n = 0;
        do {
            CEfcWork cEfcWork;
            if (!(cEfcWork = Vari.GetEfcWork(n)).GetFlag(1) || cEfcWork.GetFlag(2) || cEfcWork.m_nPat == -1) continue;
            int n2 = cEfcWork.m_nPat + 55;
            this.m_Render.CalcModel(this.m_aModel[n2], cEfcWork.m_BndBox, cEfcWork.m_vPos, cEfcWork.m_vRol, cEfcWork.m_vScale, 0);
            if (cEfcWork.m_BndBox.CheckDisplayIn()) {
                cModelTrans.m_mWVP.Set(this.m_Render.GetWVPMatrix());
                cModelTrans.m_mWorld.Set(this.m_Render.GetTransform(3));
                this.m_Sort.RecObject(2, n2, cEfcWork.m_BndBox, cModelTrans, cEfcWork.m_nDisp, cEfcWork.m_nColor);
            }
            if ((cEfcWork.m_nDisp & 0x10000) == 0) continue;
            this.m_Render.DrawShadow(cEfcWork.m_vPos, cEfcWork.m_fSize, f);
        } while (++n < 256);
    }

    public boolean LoadGrpData(int n) {
        String string = "image";
        int n2 = n;
        string = n2 < 10 ? string + "0" + n2 + ".gif" : string + n2 + ".gif";
        this.m_aImage[n] = this.getImage(this.getCodeBase(), string);
        this.AddMediaT(this.m_aImage[n], n);
        return this.WaitMediaT(n);
    }

    public void SetArea(int n) {
        this.m_Play.m_nAreaNo = n;
        this.m_Play.ResetEvtFlag(308);
        this.m_Play.ResetEvtFlag(315);
        this.m_Play.ResetEvtFlag(330);
        this.m_Game.DispCompass();
        Vari.SetCameraChr(0);
        Vari.m_Efc.ClearAllWork();
        this.SetStagePrm(n);
        this.m_NowStagePrm = new CAreaParam();
        this.m_NowStagePrm.Set(this.m_Stage.GetStage(n));
        this.m_NowMapData = this.m_NowStagePrm.m_Map;
        Vari.m_Cosmo.Init();
        this.m_Play.ClearLocalEcvtFlag();
        this.m_NowStagePrm.SetTreasure(this);
        this.m_Game.InitParty();
        this.m_Game.SetCamera();
        if (!Vari.GetSysFlag(1)) {
            Vari.m_Event.Run(this.m_NowStagePrm.m_nEventNo, -1);
        }
    }

    public boolean InitApplet() {
        this.m_nLoadCount = 0;
        this.m_nDispLoad = 0;
        this.m_bErrorLoad = false;
        Vari.Create();
        CInitApplet cInitApplet = Vari.cInit;
        Vari.cInit.Init(this.m_OffsGraph, 400, 320, 280);
        cInitApplet.CreateDisplay();
        CInitGame.StartUpMessage(cInitApplet);
        this.repaint();
        new CFile();
        new Calc3D();
        this.UpdateLoadCount();
        this.m_Render = new CDrawMap();
        this.m_Render.Create(this, this.m_OffsGraph);
        CInitGame.InitViewPort(this.m_Render);
        this.m_Player = Vari.GetChrWork(0);
        CInitGame.UseClass();
        CInitGame.InitObject(this);
        Vari.Init();
        Vari.m_Event.SetApplet(this);
        this.UpdateLoadCount();
        this.DispLoadInfo("\u521d\u671f\u5316\u7d42\u4e86");
        this.m_aImage = new Image[32];
        int n = 0;
        do {
            this.DispLoadInfo(new String("Image(" + n + ")"));
            while (!this.LoadGrpData(n)) {
                this.ErrorLoadData();
            }
            this.UpdateLoadCount();
        } while (++n < 32);
        n = 0;
        do {
            this.DispLoadInfo(new String("Model(" + n + ")"));
            while (!this.m_aModel[n].Load(this.GetModelFileName(n))) {
                this.ErrorLoadData();
            }
            this.UpdateLoadCount();
        } while (++n < 204);
        n = 0;
        do {
            this.DispLoadInfo(new String("Se(" + n + ")"));
            while (!this.LoadSe(n)) {
                this.ErrorLoadData();
            }
            this.UpdateLoadCount();
        } while (++n < 30);
        this.ClearSeFlag();
        this.DispLoadInfo("Stage");
        this.m_Stage.Load(this.getCodeBase().toString() + "data/stage._su");
        this.DispLoadInfo("Event");
        Vari.m_Event.Load(this.getCodeBase().toString() + "data/event.sui");
        this.DispLoadInfo("Param");
        Vari.m_PrmAll.Load(this.getCodeBase().toString() + "data/param._da");
        this.UpdateLoadCount();
        this.EntryWindow(this.m_MessWin);
        this.EntryWindow(Vari.m_Menu);
        this.DispLoadInfo("\u5b8c\u4e86");
        this.m_nLoadCount = 280;
        cInitApplet.DrawRestPercent(this.m_nLoadCount);
        this.m_Render.SetColor(Color.white);
        cInitApplet.DrawText("\u8aad\u307f\u8fbc\u307f\u304c\u7d42\u4e86\u3057\u307e\u3057\u305f\u3002");
        this.repaint();
        this.Wait(100);
        return true;
    }

    public void SetFogDistance() {
        if (!Vari.m_bDistView) {
            this.m_Render.SetRenderState(5, Vari.m_fFogStart);
            this.m_Render.SetRenderState(6, Vari.m_fFogEnd);
            return;
        }
        this.m_Render.SetRenderState(5, Vari.m_fFogStart * 1.3f);
        this.m_Render.SetRenderState(6, Vari.m_fFogEnd * 1.3f);
    }

    public void OffShip(D3DXVECTOR3 d3DXVECTOR3) {
        this.m_bShip = false;
        CChrWork cChrWork = Vari.GetChrWork(0);
        CChrWork cChrWork2 = Vari.GetChrWork(3);
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3(cChrWork2.m_vPos);
        D3DXVECTOR3 d3DXVECTOR33 = new D3DXVECTOR3(d3DXVECTOR3);
        d3DXVECTOR33.Sub(d3DXVECTOR32);
        d3DXVECTOR33.Normalize();
        D3DXVECTOR3 d3DXVECTOR34 = new D3DXVECTOR3(d3DXVECTOR3);
        d3DXVECTOR34.x += d3DXVECTOR33.x * 15.0f;
        d3DXVECTOR34.z += d3DXVECTOR33.z * 15.0f;
        cChrWork.LookAt(d3DXVECTOR3);
        cChrWork2.SetFlag(256);
        int n = 0;
        do {
            if (n < 5) {
                float f = (float)n / 5.0f;
                cChrWork.m_vPos.x = d3DXVECTOR34.x * f + d3DXVECTOR32.x * (1.0f - f);
                cChrWork.m_vPos.z = d3DXVECTOR34.z * f + d3DXVECTOR32.z * (1.0f - f);
            } else {
                cChrWork.m_vPos.Set(d3DXVECTOR34);
            }
            this.m_Game.MoveParty(false);
            this.MainFrame();
            if (n % 5 != 0) continue;
            CChrWork cChrWork3 = Vari.GetChrWork(n / 5);
            cChrWork3.SetFlag(1);
        } while (++n < 15);
        cChrWork2.ResetFlag(256);
        this.SaveShipPos();
    }

    public void InitSystem() {
        this.m_Flag.SetCameraVect1((float)Math.PI);
        this.m_Fade.Init();
        Vari.InitWorld();
    }

    public void OpenMoneyWindow() {
        this.m_MoneyWindow.OpenWindow();
    }

    public void DrawDisplay_Battle() {
        if (this.m_Play.GetEvtFlag(330) || this.m_Play.GetEvtFlag(331)) {
            Vari.m_Cosmo.Draw(this.m_Render, this.m_OffsGraph);
        }
        if (!Vari.m_SysFlag.GetFlag(4)) {
            this.m_Render.DrawGround_Battle(this.m_Battle.GetBattleInfo());
        }
        this.DrawChara_Battle();
        this.DrawEffect();
        this.m_Sort.Sort();
        this.DrawAll();
        if (Vari.m_nBtlName != -1) {
            String string;
            if (Vari.m_nBtlName == 65534) {
                string = "\u3059\u3044\u304b\u7d44";
            } else if (Vari.m_nBtlName == 65535) {
                string = "\u9b54\u7269\u305f\u3061";
            } else {
                CChrParam cChrParam = Vari.GetChrPrm(Vari.m_nBtlName);
                string = cChrParam.GetName();
            }
            this.DrawFontF(8, 8, string, Color.white);
        }
    }

    public void InitProc() {
        this.m_aModel = new CModel[204];
        int n = 0;
        do {
            this.m_aModel[n] = new CModel();
        } while (++n < 204);
    }

    public int GetWaitFrame() {
        if (this.m_nStopDisplay == 0 || this.IsOpenCloseWindow() || !this.m_MessWin.IsFinished()) {
            m_nWaitFlag = 2;
            return 90;
        }
        if (m_nWaitFlag != 0) {
            m_nWaitFlag += -1;
            return 90;
        }
        return 45;
    }

    public void DoFrame() {
        ++this.m_nMainCount;
        if (!Vari.IsStopWorld()) {
            ++this.m_nBMainCount;
        }
        if (this.m_Flag.GetFlag(1)) {
            this.m_Battle.SetCamera();
        }
        this.ClearSeFlag();
        this.m_Flag.Move();
    }

    public void OffShip2() {
        this.m_bShip = false;
        Vari.GetChrWork(0).SetFlag(1);
        Vari.GetChrWork(1).SetFlag(1);
        Vari.GetChrWork(2).SetFlag(1);
    }

    public void EarthQuake() {
        if (Vari.m_nQuake == 0) {
            this.m_Render.SetAdjustY(0.0f);
            return;
        }
        int n = Vari.m_nQuake += -1;
        if (n >= 2) {
            n = 2 + (n & 1);
        }
        if (!this.m_Flag.GetFlag(1)) {
            this.m_Render.SetAdjustY(m_afQuakeTable[n]);
            return;
        }
        this.m_Render.SetAdjustY(m_afQuakeTable[n] * 0.5f - 5.0f);
    }

    public void Slip(String string) {
        CSlipWindow cSlipWindow = new CSlipWindow();
        cSlipWindow.Create(this, string);
        this.EntryWindow(cSlipWindow);
        cSlipWindow.OpenWindow(200, 160);
        this.LoopFrame(8);
        this.WaitKey_Display();
        cSlipWindow.CloseWindow();
        this.LoopFrame(4);
        this.ReleaseWindow(cSlipWindow);
    }

    public void SaveShipPos() {
        CChrWork cChrWork = Vari.GetChrWork(3);
        this.m_Play.m_nShipX = CMapData.GetXBlock(cChrWork.m_vPos.x);
        this.m_Play.m_nShipZ = CMapData.GetZBlock(cChrWork.m_vPos.z);
        this.m_Play.m_nShipV = (int)(cChrWork.m_vRol.y / 1.5707964f);
    }

    static {
        m_afQuakeTable = new float[]{10.0f, -10.0f, 20.0f, -20.0f};
    }

    public void DrawAll() {
        int n = this.m_Sort.GetRecMax();
        int n2 = 0;
        while (n2 < n) {
            CSortWork cSortWork = this.m_Sort.GetSortObj(n2);
            this.DrawSort(cSortWork);
            ++n2;
        }
    }

    public void GetDisplay() {
        this.m_BackGraph.drawImage(this.m_OffsImage, 0, 0, this);
        this.m_nStopDisplay = 2;
    }

    public boolean WaitBtn_Display() {
        this.m_bBtnOK = false;
        this.m_bBtnCancel = false;
        while (!this.m_bBtnOK) {
            if (this.m_bBtnCancel) {
                return false;
            }
            this.MainFrame();
        }
        return true;
    }

    public void CloseMoneyWindow() {
        this.m_MoneyWindow.CloseWindow();
    }

    public void run() {
        this.ReleasePanel();
        this.InitProc();
        this.InitApplet();
        while (true) {
            this.InitSystem();
            CTitle.Run(this);
            this.m_Play.m_Time.Start();
            this.m_Game.InitPrm();
            this.MainGame();
        }
    }

    public void init() {
        System.out.println("\u3059\u3044\u304b\u304c\u98df\u3079\u305f\u3044");
        System.out.println("\uff12\uff10\uff10\uff12\uff0d\uff12\uff10\uff10\uff18\u3000\u304d\u3083\u3068\u307f\u3085\u3046");
        System.out.println("http://www.din.or.jp/~null/");
        Vari.m_App = this;
        this.Create(400, 320);
        this.CreatePassPanel();
        this.CreateInputPass();
        this.m_MoneyWindow.Create(this);
        this.EntryWindow(this.m_MoneyWindow);
    }

    public boolean IsStopDisplay() {
        return this.m_nStopDisplay > 0;
    }

    public void WaitKey_Display() {
        this.ClearKey();
        while (!this.CheckInputKey()) {
            this.MainFrame();
        }
    }

    public void DrawModel(int n, D3DXVECTOR3 d3DXVECTOR3, D3DXVECTOR3 d3DXVECTOR32, D3DXVECTOR3 d3DXVECTOR33, int n2, int n3) {
        CCalcBndBox cCalcBndBox = new CCalcBndBox();
        CModelTrans cModelTrans = new CModelTrans();
        this.m_Render.CalcModel(this.m_aModel[n], cCalcBndBox, d3DXVECTOR3, d3DXVECTOR32, d3DXVECTOR33, 0);
        if (cCalcBndBox.CheckDisplayIn()) {
            cModelTrans.m_mWVP.Set(this.m_Render.GetWVPMatrix());
            cModelTrans.m_mWorld.Set(this.m_Render.GetTransform(3));
            this.m_Render.DrawModel(this.m_aModel[n], cModelTrans, n2, n3);
        }
    }

    public void DispLoadInfo(String string) {
        if (!this.m_bSafeMode) {
            return;
        }
        String string2 = "";
        string2 = string2 + this.m_nDispLoad;
        string2 = string2 + " - ";
        string2 = string2 + string;
        System.out.println(string2);
        ++this.m_nDispLoad;
    }

    public void GetItemMess(int n) {
        CFlag cFlag;
        String string = new String();
        if (n < 10000) {
            cFlag = Vari.GetItemData(n);
            this.m_Play.AddItem(n, 1);
            string = string + ((CItemData)cFlag).m_strName;
            string = string + "\u3092\u624b\u306b\u5165\u308c\u305f\uff01";
        } else {
            int n2 = n - 10000;
            this.m_Play.AddGold(n2);
            string = string + Calc3D.NumberString2(n2, 5);
            string = string + "\uff27\u3092\u624b\u306b\u5165\u308c\u305f\uff01";
        }
        cFlag = new CSlipWindow();
        ((CSlipWindow)cFlag).Create(this, string);
        this.EntryWindow((CWindow)cFlag);
        ((CSlipWindow)cFlag).OpenWindow(200, 160);
        this.LoopFrame(4);
        this.PlaySe(3);
        this.LoopFrame(8);
        this.WaitKey_Display();
        ((CSlipWindow)cFlag).CloseWindow();
        this.LoopFrame(4);
        this.ReleaseWindow((CWindow)cFlag);
    }

    public void LoopFrame(int n) {
        int n2 = 0;
        while (n2 < n) {
            CNpcMove.Move();
            this.MainFrame();
            ++n2;
        }
    }
}

