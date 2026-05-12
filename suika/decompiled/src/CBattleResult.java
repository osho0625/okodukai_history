/*
 * Decompiled with CFR 0.152.
 */
class CBattleResult {
    private ARpg m_App;
    private CBattleInfo m_Info;
    private CBR_MoneyWindow m_MoneyWindow = new CBR_MoneyWindow();
    private CBR_PersonWindow[] m_aPerWindow = new CBR_PersonWindow[3];
    private int[] m_anExp = new int[3];
    private int[] m_anAP = new int[3];

    public void Run(ARpg aRpg, CBattleInfo cBattleInfo) {
        this.m_App = aRpg;
        this.m_Info = cBattleInfo;
        this.Init();
        this.Get();
        int n = 0;
        while (n < Vari.GetPartyNum()) {
            this.GetPerson(n);
            ++n;
        }
        this.m_App.WaitKey_Display();
        this.Release();
    }

    public void Get() {
        this.m_App.m_Play.AddGold(this.m_Info.m_nGold);
        int n = 0;
        while (n < this.m_Info.m_nItemPtr) {
            this.m_App.m_Play.AddItem(this.m_Info.m_anItem[n], 1);
            ++n;
        }
    }

    public void Release() {
        this.m_MoneyWindow.CloseWindow();
        int n = 0;
        while (n < Vari.GetPartyNum()) {
            this.m_aPerWindow[n].CloseWindow();
            ++n;
        }
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(this.m_MoneyWindow);
        n = 0;
        while (n < Vari.GetPartyNum()) {
            this.m_App.ReleaseWindow(this.m_aPerWindow[n]);
            ++n;
        }
    }

    public void GetPerson(int n) {
        Object object;
        int n2 = Vari.GetPartyWork(n);
        CBattleWork cBattleWork = Vari.GetBChrWork(n2);
        CChrParam cChrParam = cBattleWork.m_Prm;
        if (cChrParam.m_nAdd == 0) {
            return;
        }
        cChrParam.AddExp(this.m_anExp[n]);
        while (cChrParam.m_nLV < 99 && cChrParam.m_nExp >= CChrParam.CalcNextExp(cChrParam.m_nLV)) {
            this.m_App.PlaySe(3);
            this.DrawSlip(n, "\u30ec\u30d9\u30eb\u30a2\u30c3\u30d7\uff01\uff01");
            if (cChrParam.m_nAdd == 0) continue;
            cChrParam.LevelUp(Vari.GetPrmUp(cChrParam.m_nAdd - 1));
        }
        if (cChrParam.m_nGem == -1) {
            return;
        }
        int n3 = cChrParam.m_nAP;
        cChrParam.AddAP(this.m_anAP[n]);
        int n4 = cChrParam.m_nGem - 110;
        int n5 = 0;
        while (n5 < 7) {
            if (CGemData.GetAP(n4, n5) > n3) break;
            ++n5;
        }
        while (n5 < 7) {
            if (CGemData.GetAP(n4, n5) > cChrParam.m_nAP) break;
            if (CGemData.IsLearn(cChrParam, n5)) {
                this.m_App.PlaySe(3);
                object = "\u300c";
                object = (String)object + CGemData.Learn(cChrParam, n5);
                object = (String)object + "\u300d\u7fd2\u5f97";
                this.DrawSlip(n, (String)object);
            }
            ++n5;
        }
        if (n5 >= 7) {
            object = Vari.GetItemData(cChrParam.m_nGem);
            String string = new String(((CItemData)object).m_strName);
            string = string + "\u306f\u58ca\u308c\u3066\u3057\u307e\u3063\u305f";
            this.DrawSlip(n, string);
            cChrParam.m_nGem = -1;
            cChrParam.m_nAP = 0;
            cChrParam.m_GemFlag.SetFlag(((CItemData)object).m_nWorkNo - 110);
        }
    }

    public void DrawSlip(int n, String string) {
        CSlipWindow cSlipWindow = new CSlipWindow();
        this.m_App.EntryWindow(cSlipWindow);
        cSlipWindow.Create(this.m_App, string);
        cSlipWindow.OpenWindow(200, 136 + 56 * n);
        this.m_App.LoopFrame(4);
        this.m_App.WaitKey_Display();
        cSlipWindow.CloseWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(cSlipWindow);
    }

    public void Init() {
        if (CBattleFunc.IsPartyAbility(103)) {
            this.m_Info.m_nGold = this.m_Info.m_nGold * (100 + Calc3D.Rand(50)) / 100;
        }
        this.m_MoneyWindow.Create(this.m_App, this.m_Info);
        this.m_App.EntryWindow(this.m_MoneyWindow);
        int n = 0;
        while (n < Vari.GetPartyNum()) {
            int n2 = Vari.GetPartyWork(n);
            CBattleWork cBattleWork = Vari.GetBChrWork(n2);
            this.m_anExp[n] = cBattleWork.GetAcqExp(this.m_Info.m_nExp);
            this.m_anAP[n] = cBattleWork.GetAcqAP(this.m_Info.m_nAP);
            this.m_aPerWindow[n].Create(this.m_App, Vari.GetBChrWork(n2), 112 + 56 * n, this.m_anExp[n], this.m_anAP[n]);
            this.m_aPerWindow[n].OpenWindow();
            this.m_App.EntryWindow(this.m_aPerWindow[n]);
            ++n;
        }
        this.m_MoneyWindow.OpenWindow();
        this.m_App.LoopFrame(4);
    }

    CBattleResult() {
        int n = 0;
        do {
            this.m_aPerWindow[n] = new CBR_PersonWindow();
            this.m_anExp[n] = 0;
            this.m_anAP[n] = 0;
        } while (++n < 3);
    }
}

