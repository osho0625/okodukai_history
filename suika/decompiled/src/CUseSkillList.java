/*
 * Decompiled with CFR 0.152.
 */
class CUseSkillList
extends CMenuWindow {
    private ARpg m_App;
    private int m_nXPos;
    private int m_nYPos;
    private int[] m_anTable = new int[112];
    private int m_nTableMax;
    private int m_nChrNo;
    private CChrSelectHP m_ChrSel = new CChrSelectHP();

    public void FrameFunc() {
        int n = this.m_anTable[this.GetSelectNo()];
        CSkillData cSkillData = Vari.GetSkillData(n);
        Vari.m_Help.SetHelp(Vari.GetHelpData(cSkillData.m_nHelp));
    }

    public boolean _Create(ARpg aRpg, int n) {
        this.m_App = aRpg;
        this.m_nChrNo = n;
        Vari.m_nSkyHand = -1;
        this.MakeTable(n);
        if (this.m_nTableMax == 0) {
            return false;
        }
        this.SetFlag(1);
        this.Create(this.m_App, this.m_nTableMax);
        return true;
    }

    public boolean Algo_017() {
        int n = this.OpenChrSel(0);
        if (n != -1) {
            this.m_App.PlaySe(10);
            this.m_App.LoopFrame(2);
            CChrParam cChrParam = Vari.GetChrPrm(this.m_nChrNo);
            CChrParam cChrParam2 = Vari.GetChrPrm(Vari.GetPartyWork(n));
            cChrParam2.AddHP(CSkillCalc.Calc_StrHeal(cChrParam));
            CSkillData cSkillData = Vari.GetSkillData(17);
            cChrParam.AddMP(-cSkillData.GetMP(cChrParam));
            this.m_App.LoopFrame(8);
            this.MakeList();
            Vari.HealFlag(0);
        }
        this.CloseChrSel();
        return false;
    }

    public boolean Algo_030() {
        int n = this.OpenChrSel(1);
        if (n != -1) {
            this.m_App.PlaySe(10);
            this.m_App.LoopFrame(2);
            CChrParam cChrParam = Vari.GetChrPrm(this.m_nChrNo);
            int n2 = 0;
            while (n2 < Vari.GetPartyNum()) {
                CChrParam cChrParam2 = Vari.GetChrPrm(Vari.GetPartyWork(n2));
                cChrParam2.AddHP(CSkillCalc.Calc_IntHeal(cChrParam, 50) * 50 / 100);
                ++n2;
            }
            CSkillData cSkillData = Vari.GetSkillData(54);
            cChrParam.AddMP(-cSkillData.GetMP(cChrParam));
            this.m_App.LoopFrame(8);
            this.MakeList();
            Vari.HealFlag(0);
        }
        this.CloseChrSel();
        return false;
    }

    public int OpenChrSel(int n) {
        this.m_ChrSel.Create(this.m_App, n);
        this.m_ChrSel.SetFlag(1);
        this.m_App.EntryWindow(this.m_ChrSel);
        this.m_ChrSel.OpenWindow();
        this.m_App.LoopFrame(4);
        return this.m_ChrSel.LoopFrame();
    }

    public void MakeTable(int n) {
        this.m_nTableMax = 0;
        CChrParam cChrParam = Vari.GetChrPrm(n);
        CAbility cAbility = cChrParam.m_Abi;
        int n2 = 0;
        do {
            if (!cAbility.GetFlag(n2)) continue;
            CSkillData cSkillData = Vari.GetSkillData(n2);
            if ((cSkillData.m_nKind & 1) == 0) continue;
            this.m_anTable[this.m_nTableMax] = n2;
            ++this.m_nTableMax;
        } while (++n2 < 112);
    }

    public boolean Algo_045() {
        if (this.m_App.m_Play.GetEvtFlag(315)) {
            this.m_App.Slip("\u3053\u3053\u3067\u306f\u4f7f\u3048\u306a\u3044");
            return false;
        }
        this.m_App.Slip("\u5468\u308a\u304b\u3089\u9b54\u7269\u306e\u6c17\u914d\u304c\u306a\u304f\u306a\u3063\u305f");
        this.m_App.m_Game.m_nEncountPro = 150;
        return true;
    }

    CUseSkillList() {
    }

    public void MakeList() {
        this.ClearMenuFlag();
        String string = new String();
        CChrParam cChrParam = Vari.GetChrPrm(this.m_nChrNo);
        int n = 0;
        while (n < this.m_nTableMax) {
            int n2 = this.m_anTable[n];
            CSkillData cSkillData = Vari.GetSkillData(n2);
            int n3 = cSkillData.GetMP(cChrParam);
            string = cSkillData.GetName7();
            string = string + "\u3000";
            string = string + Calc3D.NumberString(n3, 2);
            this.SetMenuText(n, string);
            if (cChrParam.GetMP() < n3) {
                this.SetMenuFlag(n, 1);
            }
            ++n;
        }
    }

    public void Run(int n, int n2) {
        int n3;
        this.m_nXPos = n;
        this.m_nYPos = n2;
        this.ResetFlag(2);
        this.Open();
        while ((n3 = this.LoopFrame()) != -1) {
            this.SetFlag(2);
            if (this.ExecSkill(n3)) break;
            this.ResetFlag(2);
            if (Vari.m_nSkyHand == -1) continue;
        }
        this.Close();
    }

    public boolean ExecSkill(int n) {
        boolean bl = false;
        int n2 = this.m_anTable[n];
        switch (n2) {
            case 17: {
                bl = this.Algo_017();
                break;
            }
            case 50: {
                bl = this.Algo_026();
                break;
            }
            case 57: {
                bl = this.Algo_030();
                break;
            }
            case 88: {
                bl = this.Algo_044();
                break;
            }
            case 89: {
                bl = this.Algo_045();
                break;
            }
            case 90: {
                bl = this.Algo_046();
            }
        }
        if (bl) {
            CChrParam cChrParam = Vari.GetChrPrm(this.m_nChrNo);
            CSkillData cSkillData = Vari.GetSkillData(n2);
            cChrParam.AddMP(-cSkillData.GetMP(cChrParam));
            if (Vari.m_nSkyHand == -1) {
                this.m_App.LoopFrame(8);
                this.MakeList();
            }
        }
        return false;
    }

    private void Close() {
        this.CloseWindow();
        Vari.m_Help.CloseWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(this);
        this.m_App.ReleaseWindow(Vari.m_Help);
    }

    public boolean Algo_044() {
        CAreaParam cAreaParam = this.m_App.GetAreaParam();
        if (cAreaParam.m_nLightMode == 0) {
            this.m_App.Slip("\u3053\u3053\u3067\u306f\u52b9\u679c\u304c\u306a\u3044");
            return false;
        }
        this.m_App.m_Game.m_nCatsEye = 500;
        this.m_App.ResetStopDisplay();
        this.m_App.MainFrame();
        this.m_App.SetStopDisplay();
        this.m_App.Slip("\u5468\u308a\u304c\u660e\u308b\u304f\u306a\u3063\u305f");
        return true;
    }

    public boolean Algo_026() {
        int n = this.OpenChrSel(0);
        if (n != -1) {
            this.m_App.PlaySe(10);
            this.m_App.LoopFrame(2);
            CChrParam cChrParam = Vari.GetChrPrm(this.m_nChrNo);
            CChrParam cChrParam2 = Vari.GetChrPrm(Vari.GetPartyWork(n));
            cChrParam2.AddHP(CSkillCalc.Calc_IntHeal(cChrParam, 85) * 85 / 100);
            CSkillData cSkillData = Vari.GetSkillData(50);
            cChrParam.AddMP(-cSkillData.GetMP(cChrParam));
            this.m_App.LoopFrame(8);
            this.MakeList();
            Vari.HealFlag(0);
        }
        this.CloseChrSel();
        return false;
    }

    private void Open() {
        this.MakeList();
        Vari.m_Help.Create(this.m_App, 228);
        this.m_App.EntryWindow(this);
        this.m_App.EntryWindow(Vari.m_Help);
        this.OpenWindow(this.m_nXPos, this.m_nYPos);
        Vari.m_Help.OpenWindow();
    }

    public boolean Algo_046() {
        if (this.m_App.m_Play.GetEvtFlag(308)) {
            this.m_App.Slip("\u3053\u3053\u3067\u306f\u4f7f\u3048\u306a\u3044");
            return false;
        }
        CSkyHand cSkyHand = new CSkyHand();
        Vari.m_nSkyHand = cSkyHand.Run();
        return Vari.m_nSkyHand != -1;
    }

    public void CloseChrSel() {
        this.m_ChrSel.CloseWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(this.m_ChrSel);
    }
}

