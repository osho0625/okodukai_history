/*
 * Decompiled with CFR 0.152.
 */
class CBattleMain {
    static final float CAMERA_1FRAME = 0.08726647f;
    static final float LIGHT_YPOS = 300.0f;
    static final float LIGHT_RANGE = 900.0f;
    static final int BF_NO_RUNAWAY = 1;
    static final int BF_PUYO_1 = 2;
    static final int BF_TAHITI = 4;
    static final int BF_PUYO_2 = 8;
    private ARpg m_App;
    private CBattleInfo m_Info;
    private int m_nBattleFlag;
    private CBtlPlayerStatus[] m_aBtlPlayerStatus;
    private CBattlePlayer m_PlayAct;
    private float m_fPushCameraVect;
    private float m_fCameraVect;
    private float m_fWontVect;
    private boolean m_bRunaway;
    public CSkillWindow m_SkillWin;
    public boolean m_bResetAT;
    public CBattleWork m_ActBChr;
    public D3DLIGHT8 m_liStart = new D3DLIGHT8();
    public int[] m_anPushHP = new int[9];
    static final int SLIME_FRAME = 8;
    private int[] m_anEvSl_Chr = new int[]{4, 6, 7, 3};
    private float[] m_afEvSl_X = new float[]{75.0f, -60.0f, -50.0f, 50.0f};
    private float[] m_afEvSl_Y = new float[]{85.0f, 60.0f, 155.0f, 213.0f};

    public void BattleFrame() {
    }

    public void SetCameraVect1(float f) {
        this.m_fCameraVect = f;
        this.m_fWontVect = f;
    }

    public void Create(int n) {
        this.m_Info = new CBattleInfo();
        this.m_PlayAct = new CBattlePlayer(this.m_App, this);
        this.m_aBtlPlayerStatus = new CBtlPlayerStatus[3];
        int n2 = 0;
        do {
            this.m_aBtlPlayerStatus[n2] = new CBtlPlayerStatus();
        } while (++n2 < 3);
        this.m_SkillWin = new CSkillWindow();
        this.m_SkillWin.Create(this.m_App);
        this.m_App.EntryWindow(this.m_SkillWin);
        CEnemyParty cEnemyParty = Vari.m_PrmAll.GetParty(n);
        this.m_nBattleFlag = cEnemyParty.m_nFlag;
    }

    public void DeleteChr(CBattleWork cBattleWork) {
        cBattleWork.m_Prm.m_nHP = 0;
        cBattleWork.m_Chr.ResetFlag(1);
        cBattleWork.m_Chr.SetFlag(8);
        cBattleWork.ResetAllBad();
    }

    public int Main(int n, int n2, boolean bl) {
        int n3;
        this.Create(n);
        this.m_Info.Init();
        this.m_Info.m_nGround = n2;
        if (n2 == 13) {
            this.m_Info.m_nGround = 1;
        }
        this.BattleIn(n);
        this.FirstEvent();
        while (true) {
            this.m_ActBChr = this.CheckNextTurn();
            this.AttackMain(this.m_ActBChr);
            n3 = this.CheckDead();
            if (n3 != 0) break;
            this.BattleFrame();
        }
        this.BattleEnd(n3, bl);
        return n3;
    }

    public void CheckCountHeal() {
        int n = 0;
        do {
            CBattleWork cBattleWork;
            if (!(cBattleWork = Vari.GetBChrWork(n)).IsUse()) continue;
            this.m_anPushHP[n] = cBattleWork.m_Prm.GetHP();
        } while (++n < 9);
    }

    public CBattleInfo GetBattleInfo() {
        return this.m_Info;
    }

    public void SetCameraVect2(float f) {
        this.m_fWontVect = f;
    }

    public void DeadChr(CBattleWork cBattleWork) {
        if (!cBattleWork.m_Chr.GetFlag(8) && cBattleWork.m_Chr.GetFlag(1)) {
            if (Vari.GetWorldChr() == cBattleWork.m_nWorkNo) {
                Vari.InitWorld();
                this.EndWorld();
            }
            cBattleWork.m_Chr.SetFlag(8);
            cBattleWork.ResetAllBad();
            this.m_App.PlaySeG(7);
            if (!cBattleWork.IsPlayer()) {
                this.m_Info.m_nGold += cBattleWork.m_Prm.m_nGold;
                this.m_Info.m_nExp += cBattleWork.m_Prm.m_nExp;
                this.m_Info.m_nAP += cBattleWork.m_Prm.m_nAP;
                cBattleWork.m_Prm.m_nGold = 0;
                cBattleWork.m_Prm.m_nExp = 0;
                cBattleWork.m_Prm.m_nAP = 0;
                int n = cBattleWork.m_Prm.m_nItem2;
                if (n != 0) {
                    int n2 = 2;
                    if (CBattleFunc.IsPartyAbility(102)) {
                        n2 = 4;
                    }
                    if (this.IsGetItem(n2)) {
                        this.GetItem(n);
                        cBattleWork.m_Prm.m_nItem2 = 0;
                        return;
                    }
                }
                if ((n = cBattleWork.m_Prm.m_nItem1) != 0 && this.IsGetItem(8)) {
                    this.GetItem(n);
                    cBattleWork.m_Prm.m_nItem1 = 0;
                    return;
                }
            }
        }
    }

    public void EndWorld() {
        this.m_App.PlaySeG(13);
        this.m_App.m_Render.SetWhite(1.0f);
        this.LoopFrame(1);
        this.m_App.m_Render.SetWhite(0.0f);
    }

    public void CheckCountHeal2(CBattleWork cBattleWork) {
        int n = 0;
        do {
            CBattleWork cBattleWork2;
            if (!(cBattleWork2 = Vari.GetBChrWork(n)).IsAlive() || cBattleWork2.m_nWorkNo == cBattleWork.m_nWorkNo || !cBattleWork2.m_Prm.m_Abi.GetFlag(184) || !cBattleWork2.IsMove() || Vari.IsStopWorld(cBattleWork2.m_nWorkNo) || this.m_anPushHP[n] <= cBattleWork2.m_Prm.GetHP()) continue;
            CAction cAction = new CAction();
            cAction.m_nObj = cBattleWork2.m_nWorkNo;
            CBattleAction.Algo_008(cBattleWork2, cAction);
        } while (++n < 9);
    }

    public void DrawDisplay() {
        int n = 0;
        do {
            this.m_aBtlPlayerStatus[n].Run();
        } while (++n < 3);
    }

    public boolean IsGetItem(int n) {
        int n2;
        int n3 = 100;
        int n4 = CBattleFunc.GetDexAverage(0);
        if (n4 > (n2 = CBattleFunc.GetDexAverage(1))) {
            n3 += 25;
        }
        if (Calc3D.Rand(n4) > Calc3D.Rand(n2)) {
            n3 += 25;
        }
        return Calc3D.Rand(10000) <= n * n3;
    }

    CBattleMain(ARpg aRpg) {
        this.m_App = aRpg;
    }

    public void SetCamera() {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        this.m_fCameraVect = !Vari.m_SysFlag.GetFlag(32) ? Calc3D.TurnAngleSoft(this.m_fCameraVect, this.m_fWontVect, CAMERA_1FRAME) : Calc3D.TurnAngleSoftPlus(this.m_fCameraVect, this.m_fWontVect, CAMERA_1FRAME);
        float f = this.m_fCameraVect;
        d3DXVECTOR3.x = Calc3D.Sin(f) * 2100.0f;
        d3DXVECTOR3.y = 1600.0f;
        d3DXVECTOR3.z = Calc3D.Cos(f) * 2100.0f;
        this.m_App.m_Flag.SetCameraVect1(f + (float)Math.PI);
        this.m_App.m_Render.ViewTransform(d3DXVECTOR3, Def.POS_CENTER);
        if (Vari.m_SysFlag.GetFlag(32) && Calc3D.CalcAngleVect(this.m_fCameraVect, this.m_fWontVect) <= 0.3f) {
            Vari.m_SysFlag.ResetFlag(32);
        }
    }

    public void AttackMain(CBattleWork cBattleWork) {
        int n;
        int n2;
        int n3;
        CAbility cAbility = cBattleWork.m_Prm.m_Abi;
        this.m_bResetAT = true;
        if (!Vari.IsStopWorld()) {
            this.CheckCountHeal();
        }
        if (Vari.IsStopWorld(cBattleWork.m_nWorkNo)) {
            cBattleWork.m_nAT = 0;
            return;
        }
        if (!cBattleWork.CountPara() || cBattleWork.GetClose() || cBattleWork.GetStone()) {
            cBattleWork.m_nAT = 0;
            return;
        }
        this.SetChrCamera(cBattleWork);
        cBattleWork.m_Chr.SetFlag(2);
        if (cBattleWork.m_Prm.GetDefense()) {
            CBattleActEfc.Back_Defense(cBattleWork);
            cBattleWork.m_Prm.ResetDefense();
        }
        if (cBattleWork.m_Prm.GetDefense2()) {
            CBattleActEfc.Back_Defense(cBattleWork);
            cBattleWork.m_Prm.ResetDefense2();
        }
        if ((n3 = cBattleWork.m_Prm.GetShield()) > 0) {
            cBattleWork.m_Prm.SetShield(n3 - 1);
        }
        if ((n2 = cBattleWork.m_Prm.GetConf()) > 0) {
            cBattleWork.m_Prm.SetConf(--n2);
            if (n2 == 0) {
                cBattleWork.m_Chr.ResetDisp(32);
            }
        }
        if ((n = cBattleWork.m_Prm.GetBlind()) > 0) {
            cBattleWork.m_Prm.SetBlind(--n);
        }
        boolean bl = false;
        if (cBattleWork.m_Prm.GetPoison()) {
            bl = true;
            CBattleActCalc.PoisonAttack(cBattleWork);
            if (cBattleWork.m_Prm.m_nHP == 0) {
                this.LoopFrame(12);
                return;
            }
        }
        this.LoopFrame(8);
        if (cAbility.GetFlag(96) || cBattleWork.m_Prm.GetRije() > 0) {
            if (bl) {
                this.LoopFrame(8);
            }
            bl = true;
            int n4 = cBattleWork.m_Prm.GetMaxHP() / 15;
            if (n4 > 2000) {
                n4 = 2000;
            }
            n4 = n4 * (Calc3D.Rand(50) + 50) / 100;
            cBattleWork.m_Prm.AddHP(n4);
            CBattleActCalc.SetNumberObject(cBattleWork, n4, 0);
            cBattleWork.m_Prm.DecRije();
            this.LoopFrame(4);
        }
        if (cAbility.GetFlag(97) && cBattleWork.m_Prm.GetMP() < cBattleWork.m_Prm.GetMaxMP()) {
            cBattleWork.m_Prm.AddMP(Calc3D.Rand(4) + 1);
        }
        if (cBattleWork.IsPlayer()) {
            this.AttackPlayer(cBattleWork);
        } else {
            this.AttackEnemy(cBattleWork);
        }
        cBattleWork.m_Chr.ResetFlag(2);
        this.LoopFrame(4);
        if (this.m_bResetAT) {
            cBattleWork.m_nAT = 0;
        }
        if ((n3 = cBattleWork.GetAura()) > 0) {
            cBattleWork.SetAura(n3 - 1);
        }
        if (Vari.CountWorld()) {
            this.EndWorld();
        }
        this.CheckCountHeal2(cBattleWork);
    }

    public ARpg GetApp() {
        return this.m_App;
    }

    public CBattleWork CheckNextTurn() {
        CBattleWork cBattleWork;
        int n = 0;
        do {
            if (!(cBattleWork = Vari.GetBChrWork(n)).IsAlive()) continue;
            int n2 = cBattleWork.m_Prm.GetAgi();
            cBattleWork.m_nAT += n2 + Calc3D.Rand(n2);
        } while (++n < 9);
        CBattleWork cBattleWork2 = null;
        int n3 = 0;
        int n4 = 0;
        do {
            if (!(cBattleWork = Vari.GetBChrWork(n4)).IsAlive() || n3 >= cBattleWork.m_nAT) continue;
            cBattleWork2 = cBattleWork;
            n3 = cBattleWork.m_nAT;
        } while (++n4 < 9);
        return cBattleWork2;
    }

    public void DoFrame() {
        this.m_App.Motion();
        this.m_App.DrawDisplay();
        this.m_App.WaitRepaint(this.m_App.GetWaitFrame());
        this.m_App.DoFrame();
        ++this.m_Info.m_nCount;
    }

    public void EvtSlime(int n) {
        CBattleWork cBattleWork = Vari.GetBChrWork(this.m_anEvSl_Chr[n]);
        float f = cBattleWork.m_vPos.y;
        float f2 = (this.m_afEvSl_X[n] - cBattleWork.m_vPos.x) / 8.0f;
        float f3 = (this.m_afEvSl_Y[n] - cBattleWork.m_vPos.y) / 8.0f;
        int n2 = 0;
        do {
            float f4 = Calc3D.Sin(Calc3D.DEGtoRAD(180.0f * (float)n2 / 8.0f)) * 50.0f;
            cBattleWork.m_vPos.x += f2;
            cBattleWork.m_vPos.y = f + f3 * (float)n2 + f4;
            this.LoopFrame(1);
        } while (++n2 < 8);
    }

    public void Release() {
        this.m_App.ClearTextObj();
        this.m_App.ReleaseWindow(this.m_SkillWin);
        this.m_App.m_Render.SetLight(this.m_liStart);
        this.m_App.m_Flag.SetCameraVect1(this.m_fPushCameraVect);
        int n = 0;
        do {
            CChrWork cChrWork = Vari.GetChrWork(n);
            cChrWork.ResetFlag(8);
            cChrWork.ResetDisp(16);
            cChrWork.ResetDisp(2048);
        } while (++n < 8);
        int n2 = 0;
        do {
            CBattleWork cBattleWork = Vari.GetBChrWork(n2);
            cBattleWork.ResetAllBad();
        } while (++n2 < 9);
        n2 = 3;
        do {
            Vari.GetChrWork(n2).ResetFlag(1);
        } while (++n2 < 8);
        n2 = 0;
        do {
            this.m_aBtlPlayerStatus[n2].Release();
        } while (++n2 < 3);
        this.m_App.m_Game.SetShip();
        Vari.m_Prm.InitBattle();
    }

    public void SetChrCamera(CBattleWork cBattleWork) {
        if (cBattleWork.m_Prm.m_Abi.GetFlag(149)) {
            return;
        }
        float f = 0.0f;
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(cBattleWork.m_vPos);
        d3DXVECTOR3.x *= 0.25f;
        if (cBattleWork.IsPlayer()) {
            f = Calc3D.CalcAngleXZ(d3DXVECTOR3, Def.POS_CENTER);
            f -= 0.7853982f;
        } else {
            f = Calc3D.CalcAngleXZ(d3DXVECTOR3, Def.POS_CENTER);
            f += 2.3561945f;
        }
        this.SetCameraVect2(f);
    }

    public void BattleEnd(int n, boolean bl) {
        if (Vari.IsStopWorld()) {
            Vari.InitWorld();
            this.EndWorld();
            this.LoopFrame(8);
        }
        if (n == 1) {
            this.m_App.PlaySeG(24);
        }
        CBattleFunc.FadeOut(8);
        this.m_App.m_Flag.ResetFlag(1);
        this.m_App.m_Play.ResetEvtFlag(331);
        Vari.m_SysFlag.ResetFlag(4);
        this.m_App.m_Play.ResetEvtFlag(303);
        this.Release();
        this.m_App.m_Game.SetCamera();
        if (n == 1) {
            CBattleResult cBattleResult = new CBattleResult();
            cBattleResult.Run(this.m_App, this.m_Info);
            CInitBattle.End(this.m_App);
            if (bl) {
                this.m_App.m_Fade.FadeIn(8);
                return;
            }
        } else if (n == 2) {
            this.m_App.m_Play.SetEvtFlag(303);
            if (!this.m_App.m_Play.GetEvtFlag(309)) {
                CGameOver.Run(this.m_App);
                return;
            }
            CInitBattle.End(this.m_App);
            if (bl) {
                this.m_App.m_Fade.FadeIn(8);
                return;
            }
        } else {
            CInitBattle.End(this.m_App);
            if (bl) {
                this.m_App.m_Fade.FadeIn(8);
            }
        }
    }

    public int CheckDead() {
        CBattleWork cBattleWork;
        if (this.m_bRunaway) {
            return 3;
        }
        boolean bl = false;
        int n = 0;
        do {
            if (!(cBattleWork = Vari.GetBChrWork(n)).IsUse() || !cBattleWork.m_Prm.m_Abi.GetFlag(149)) continue;
            bl = true;
        } while (++n < 9);
        n = 0;
        int n2 = 0;
        int n3 = 0;
        do {
            if (!(cBattleWork = Vari.GetBChrWork(n3)).IsUse() || cBattleWork.m_Prm.m_Abi.GetFlag(149)) continue;
            if (cBattleWork.m_Prm.m_nHP == 0) {
                this.DeadChr(cBattleWork);
                continue;
            }
            if (n3 < 3) {
                if (!bl && (cBattleWork.GetClose() || cBattleWork.GetStone())) continue;
                ++n;
                continue;
            }
            ++n2;
        } while (++n3 < 9);
        if (n == 0) {
            return 2;
        }
        if (n2 == 0) {
            return 1;
        }
        return 0;
    }

    public void GetItem(int n) {
        if (this.m_Info.m_nItemPtr >= 4) {
            return;
        }
        this.m_Info.m_anItem[this.m_Info.m_nItemPtr] = n;
        ++this.m_Info.m_nItemPtr;
    }

    public void BattleIn(int n) {
        this.m_App.PlaySeG(23);
        this.m_App.m_Fade.WhiteIn(8);
        this.m_App.m_Flag.SetFlag(1);
        this.m_fPushCameraVect = this.m_App.m_Flag.GetCameraVect();
        this.m_bRunaway = false;
        this.SetCameraVect1(1.8849558f);
        this.SetCamera();
        this.m_Info.Init();
        Vari.m_ActOld.m_nAlgo = 1001;
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.y = 300.0f;
        this.m_App.m_Render.SetLightPos(d3DXVECTOR3);
        this.m_App.m_Render.SetLightRange(900.0f);
        this.m_liStart.Set(this.m_App.m_Render.GetLight());
        int n2 = Vari.GetPartyNum();
        int n3 = 0;
        while (n3 < n2) {
            this.m_aBtlPlayerStatus[n3].Create(this.m_App, Vari.GetBChrWork(Vari.GetPartyWork(n3)), n3 - n2 + 3);
            ++n3;
        }
        CInitBattle.Init(this.m_App, n);
        CBattleFunc.WhiteOut(8);
    }

    public void AttackPlayer(CBattleWork cBattleWork) {
        CAction cAction = this.m_PlayAct.Decide(cBattleWork);
        CBattleAction.Action(cBattleWork, cAction);
        Vari.m_ActOld.Set(cAction);
    }

    public boolean CanRunaway() {
        return (this.m_nBattleFlag & 1) == 0;
    }

    public void SetRunaway() {
        this.m_bRunaway = true;
    }

    public void FirstEvent() {
        if ((this.m_nBattleFlag & 2) == 0 && (this.m_nBattleFlag & 8) == 0) {
            return;
        }
        CBattleWork cBattleWork = Vari.GetBChrWork(5);
        this.SetChrCamera(cBattleWork);
        this.LoopFrame(8);
        int n = 0;
        do {
            this.EvtSlime(n);
        } while (++n < 4);
        Vari.MakeEffect(31, cBattleWork.m_vPos, cBattleWork.GetDispVect(), cBattleWork.m_Chr.m_fHitSize);
        Vari.MakeEffect(31, cBattleWork.m_vPos, cBattleWork.GetDispVect(), cBattleWork.m_Chr.m_fHitSize);
        this.LoopFrame(8);
        if ((this.m_nBattleFlag & 2) != 0) {
            CChrPrm.Set(cBattleWork.m_Chr, 22);
        } else {
            CChrPrm.Set(cBattleWork.m_Chr, 203);
        }
        this.DeleteChr(Vari.GetBChrWork(3));
        this.DeleteChr(Vari.GetBChrWork(4));
        this.DeleteChr(Vari.GetBChrWork(6));
        this.DeleteChr(Vari.GetBChrWork(7));
    }

    public void AttackEnemy(CBattleWork cBattleWork) {
        CAction cAction = CBattleEnemy.Decide(cBattleWork);
        CBattleAction.Action(cBattleWork, cAction);
        if (cAction != null) {
            Vari.m_ActOld.Set(cAction);
        }
    }

    public void LoopFrame(int n) {
        int n2 = 0;
        while (n2 < n) {
            this.DoFrame();
            ++n2;
        }
    }
}

