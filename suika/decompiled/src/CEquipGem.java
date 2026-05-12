/*
 * Decompiled with CFR 0.152.
 */
class CEquipGem {
    private ARpg m_App;
    private int m_nChrNo;
    private CGemWindow m_Window = new CGemWindow();
    private int m_nSelect;
    private int[] m_anTable = new int[17];
    private int m_nGemNum;
    private boolean m_bMoveRight;
    private boolean m_bMoveLeft;
    private CChrParam m_Prm;
    private CSlipWindow m_Help = new CSlipWindow();

    public void Create(ARpg aRpg, int n) {
        this.m_App = aRpg;
        this.m_nChrNo = n;
        this.m_Prm = Vari.GetChrPrm(this.m_nChrNo);
        this.m_Help.Create(this.m_App, 20, 2);
        if (this.m_Prm.m_nGem == -1) {
            this.SetHelp(0);
        } else {
            this.SetHelp(1);
        }
        this.m_Window.Create(this.m_App, 32, 8, 0);
        this.m_Window.SetItem(this.m_Prm.m_nGem);
        this.m_Window.SetPrm(this.m_nChrNo, this.m_Prm);
        this.m_App.EntryWindow(this.m_Window);
        this.m_App.EntryWindow(this.m_Help);
        this.m_Window.OpenWindow();
        this.m_Help.OpenWindow(200, 288);
        this.m_App.LoopFrame(4);
    }

    public int GetGemNum() {
        this.m_nGemNum = 0;
        int n = 0;
        do {
            if (this.m_App.m_Play.GetItem(n + 110) <= 0) continue;
            this.m_anTable[this.m_nGemNum] = n + 110;
            ++this.m_nGemNum;
        } while (++n < 17);
        return this.m_nGemNum;
    }

    public boolean Decide() {
        if (!this.CheckEquip()) {
            return false;
        }
        CChrParam cChrParam = Vari.GetChrPrm(this.m_nChrNo);
        cChrParam.m_nGem = this.m_anTable[this.m_nSelect];
        this.m_Window.SetItem(cChrParam.m_nGem);
        this.m_App.m_Play.AddItem(this.m_anTable[this.m_nSelect], -1);
        return true;
    }

    public void SetHelp(int n) {
        switch (n) {
            case 0: {
                this.m_Help.SetText(0, "\u73fe\u5728\u52fe\u7389\u3092\u88c5\u5099\u3057\u3066\u3044\u307e\u305b\u3093\u3002");
                this.m_Help.SetText(1, "\uff3a\u30ad\u30fc\u3067\u73fe\u5728\u6301\u3063\u3066\u3044\u308b\u52fe\u7389\u3092\u8868\u793a\u3057\u307e\u3059\u3002");
                return;
            }
            case 1: {
                this.m_Help.SetText(0, "\u73fe\u5728\u52fe\u7389\u3092\u88c5\u5099\u3057\u3066\u3044\u307e\u3059\u3002");
                this.m_Help.SetText(1, "\u7fd2\u5f97\u3057\u7d42\u308f\u308b\u307e\u3067\u3001\u88c5\u5099\u5909\u66f4\u306f\u51fa\u6765\u307e\u305b\u3093");
                return;
            }
            case 2: {
                this.m_Help.SetText(0, "\u2190\u2192\u30ad\u30fc\u3067\u52fe\u7389\u306e\u9078\u629e\u3002");
                this.m_Help.SetText(1, "\uff3a\u30ad\u30fc\u3067\u9078\u629e\u3057\u3066\u3044\u308b\u52fe\u7389\u3092\u88c5\u5099\u3057\u307e\u3059\u3002");
                return;
            }
        }
    }

    public void DoRight(CGemWindow cGemWindow) {
        ++this.m_nSelect;
        this.m_nSelect %= this.m_nGemNum;
        cGemWindow.SetItem(this.m_anTable[this.m_nSelect]);
    }

    public void Release() {
        this.m_Window.CloseWindow();
        this.m_Help.CloseWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(this.m_Window);
        this.m_App.ReleaseWindow(this.m_Help);
    }

    public void Run(ARpg aRpg, int n) {
        this.Create(aRpg, n);
        while (true) {
            if (this.m_App.CheckKeyDown_OK()) {
                this.Select();
            }
            if (this.m_App.CheckKeyDown_Cancel()) {
                this.Release();
                return;
            }
            this.m_App.MainFrame();
        }
    }

    CEquipGem() {
    }

    public void DoLeft(CGemWindow cGemWindow) {
        this.m_nSelect += -1;
        if (this.m_nSelect < 0) {
            this.m_nSelect = this.m_nGemNum - 1;
        }
        cGemWindow.SetItem(this.m_anTable[this.m_nSelect]);
    }

    public void Select() {
        if (this.m_Prm.m_nGem != -1) {
            this.m_App.Slip("\u88c5\u5099\u306e\u5909\u66f4\u306f\u3067\u304d\u307e\u305b\u3093");
            return;
        }
        int n = this.GetGemNum();
        if (n == 0) {
            this.m_App.Slip("\u52fe\u7389\u3092\u6301\u3063\u3066\u3044\u307e\u305b\u3093");
            return;
        }
        this.SetHelp(2);
        CGemWindow cGemWindow = new CGemWindow();
        cGemWindow.Create(this.m_App, 128, 48, 1);
        cGemWindow.SetPrm(this.m_nChrNo, this.m_Prm);
        if (n > 1) {
            cGemWindow.SetFlag(16);
            cGemWindow.SetFlag(32);
        }
        this.m_nSelect = 0;
        cGemWindow.SetItem(this.m_anTable[this.m_nSelect]);
        this.m_App.EntryWindow(cGemWindow);
        cGemWindow.OpenWindow();
        this.m_App.LoopFrame(4);
        while (!this.m_App.CheckKeyDown_OK2() || !this.Decide()) {
            if (this.m_App.m_nMouseLeft == 1) {
                this.m_App.m_nMouseLeft = 2;
                if (cGemWindow.GetFlag(64)) {
                    this.DoLeft(cGemWindow);
                } else if (cGemWindow.GetFlag(128)) {
                    this.DoRight(cGemWindow);
                } else if (this.Decide()) break;
            }
            if (this.m_App.CheckKeyDown_Cancel()) break;
            if (this.m_App.CheckKeyDown(3) > 0) {
                if (!this.m_bMoveLeft) {
                    this.m_bMoveLeft = true;
                    this.DoLeft(cGemWindow);
                }
            } else {
                this.m_bMoveLeft = false;
            }
            if (this.m_App.CheckKeyDown(1) > 0) {
                if (!this.m_bMoveRight) {
                    this.m_bMoveRight = true;
                    this.DoRight(cGemWindow);
                }
            } else {
                this.m_bMoveRight = false;
            }
            this.m_App.MainFrame();
        }
        cGemWindow.CloseWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(cGemWindow);
        if (this.m_Prm.m_nGem == -1) {
            this.SetHelp(0);
            return;
        }
        this.SetHelp(1);
    }

    public boolean CheckEquip() {
        int n = CGemData.IsEquip(this.m_nChrNo, this.m_anTable[this.m_nSelect]);
        if (n == 0) {
            return true;
        }
        if (n == 1) {
            this.m_App.Slip("\u3059\u3067\u306b\u7fd2\u5f97\u3057\u3066\u3044\u307e\u3059");
            return false;
        }
        this.m_App.Slip("\u3053\u306e\u52fe\u7389\u306f\u88c5\u5099\u3067\u304d\u307e\u305b\u3093");
        return false;
    }
}

