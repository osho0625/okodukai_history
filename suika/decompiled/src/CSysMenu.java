/*
 * Decompiled with CFR 0.152.
 */
class CSysMenu {
    static final int MAX_ABI_PAGE = 7;
    static final int WIN_XPOS = 16;
    static final int WIN_YPOS = 16;
    static final int CHR_XPOS = 32;
    static final int CHR_YPOS = 32;
    static final int SLIP_XPOS = 96;
    static final int SLIP_YPOS = 288;
    private ARpg m_App;
    private CMenuWindow m_Menu;
    private CTimeWindow m_TimeWindow = new CTimeWindow();

    public void Create(ARpg aRpg) {
        this.m_App = aRpg;
        this.m_Menu = new CMenuWindow();
        this.m_Menu.Create(aRpg, 8);
        this.m_Menu.SetFlag(1);
        this.m_Menu.SetMenuText(0, "\u30a2\u30a4\u30c6\u30e0");
        this.m_Menu.SetMenuText(1, "\u7279\u6280");
        this.m_Menu.SetMenuText(2, "\u30b9\u30c6\u30fc\u30bf\u30b9");
        this.m_Menu.SetMenuText(3, "\u88c5\u5099");
        this.m_Menu.SetMenuText(4, "\u6226\u95d8\u30b3\u30de\u30f3\u30c9");
        this.m_Menu.SetMenuText(5, "\u52fe\u7389");
        this.m_Menu.SetMenuText(6, "\u30d8\u30eb\u30d7");
        this.m_Menu.SetMenuText(7, "\u30bf\u30a4\u30c8\u30eb\u3078");
        this.m_TimeWindow.Create(aRpg);
    }

    private void DoItem() {
        if (this.m_App.m_Play.GetAllItemKind() == 0) {
            this.m_App.Slip("\u30a2\u30a4\u30c6\u30e0\u3092\u6301\u3063\u3066\u3044\u307e\u305b\u3093");
            return;
        }
        CUseItemList cUseItemList = new CUseItemList();
        cUseItemList.CreateList(this.m_App);
        cUseItemList.Run(48, 16);
    }

    private void DoBattleCommand() {
        do {
            int n;
            if ((n = Vari.m_ChrSel.Run()) == -1) {
                return;
            }
            BtlCmdWin btlCmdWin = new BtlCmdWin();
            btlCmdWin.Create(this.m_App, n);
            this.m_App.EntryWindow(btlCmdWin);
            btlCmdWin.OpenWindow();
            CSlipWindow cSlipWindow = new CSlipWindow();
            cSlipWindow.Create(this.m_App, 14, 4);
            cSlipWindow.SetText(0, "\u6226\u95d8\u3067\u4f7f\u7528\u3059\u308b\u30b3\u30de\u30f3\u30c9\u3092\uff14\u3064");
            cSlipWindow.SetText(1, "\u307e\u3067\u9078\u629e\u3067\u304d\u307e\u3059\u3002");
            cSlipWindow.SetText(2, "\uff3a\u30ad\u30fc\u3067\u9078\u629e\u30fb\u9078\u629e\u89e3\u9664\u3002");
            cSlipWindow.SetText(3, "\u300c\u305f\u305f\u304b\u3046\u300d\u306f\u89e3\u9664\u3067\u304d\u307e\u305b\u3093");
            this.m_App.EntryWindow(cSlipWindow);
            cSlipWindow.OpenWindow(200, 224);
            this.m_App.LoopFrame(4);
            btlCmdWin.LoopFrame();
            cSlipWindow.CloseWindow();
            this.m_App.LoopFrame(4);
            this.m_App.ReleaseWindow(btlCmdWin);
            this.m_App.ReleaseWindow(cSlipWindow);
        } while (this.m_App.m_Play.m_nPartyNum != 1);
    }

    private void DoAbilityHelp() {
        CHelpAbility cHelpAbility = new CHelpAbility();
        cHelpAbility.CreateList();
        int n = cHelpAbility.GetListNum();
        if (n == 0) {
            this.m_App.Slip("\u7fd2\u5f97\u3057\u3066\u3044\u308b\u30a2\u30d3\u30ea\u30c6\u30a3\u304c\u3042\u308a\u307e\u305b\u3093");
            return;
        }
        int n2 = 7;
        if (n2 > n) {
            n2 = n;
        }
        cHelpAbility.CreateLR(this.m_App, n2, 8);
        cHelpAbility.SetFlag(1);
        cHelpAbility.CreateText();
        cHelpAbility.OpenAllWindow();
        while (cHelpAbility.LoopFrame() != -1) {
        }
        cHelpAbility.CloseAllWindow();
    }

    CSysMenu() {
    }

    private void DoUseSkill() {
        do {
            int n;
            if ((n = Vari.m_ChrSel.Run()) == -1) {
                return;
            }
            CUseSkillList cUseSkillList = new CUseSkillList();
            if (!cUseSkillList._Create(this.m_App, Vari.GetPartyWork(n))) {
                this.m_App.Slip("\u4f7f\u7528\u3067\u304d\u308b\u7279\u6280\u304c\u3042\u308a\u307e\u305b\u3093");
            } else {
                cUseSkillList.Run(32, 16);
            }
            if (Vari.m_nSkyHand == -1) continue;
            Vari.m_ChrSel.Close();
            return;
        } while (this.m_App.m_Play.m_nPartyNum != 1);
    }

    private void CloseWindow() {
        this.m_Menu.CloseWindow();
        this.m_App.CloseMoneyWindow();
        this.m_TimeWindow.CloseWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(this.m_Menu);
        this.m_App.ReleaseWindow(this.m_TimeWindow);
    }

    public void Run() {
        this.OpenWindow();
        this.m_App.SetStopDisplay();
        this.Main();
        this.m_App.ResetStopDisplay();
        this.CloseWindow();
        if (Vari.m_nSkyHand != -1) {
            CSkyHand.Exec(Vari.m_nSkyHand);
            Vari.m_nSkyHand = -1;
        }
    }

    private void Main() {
        int n;
        while ((n = this.m_Menu.LoopFrame()) != -1) {
            this.m_Menu.SetFlag(2);
            switch (n) {
                case 0: {
                    this.DoItem();
                    break;
                }
                case 1: {
                    this.DoUseSkill();
                    break;
                }
                case 2: {
                    this.DoStatus();
                    break;
                }
                case 3: {
                    this.DoEquip();
                    break;
                }
                case 4: {
                    this.DoBattleCommand();
                    break;
                }
                case 5: {
                    this.DoGem();
                    break;
                }
                case 6: {
                    this.DoHelp();
                    break;
                }
                case 7: {
                    this.DoTitle();
                }
            }
            this.m_Menu.ResetFlag(2);
            if (Vari.m_nSkyHand != -1) break;
            if (!this.m_App.m_bGameOver) continue;
            return;
        }
    }

    private void DoEquip() {
        do {
            int n;
            if ((n = Vari.m_ChrSel.Run()) == -1) {
                return;
            }
            CEquip cEquip = new CEquip();
            cEquip.Create(this.m_App, Vari.GetPartyWork(n));
            cEquip.Run();
        } while (this.m_App.m_Play.m_nPartyNum != 1);
    }

    private void DoTitle() {
        CSysYesNo cSysYesNo = new CSysYesNo();
        int n = cSysYesNo.Run(this.m_App, "\u3000\u3000\u30bf\u30a4\u30c8\u30eb\u306b\u623b\u308a\u307e\u3059\u304b\uff1f\u3000\u3000");
        if (n == 0) {
            this.m_App.m_bGameOver = true;
        }
    }

    private void OpenWindow() {
        this.m_App.EntryWindow(this.m_Menu);
        this.m_Menu.OpenWindow(16, 16);
        this.m_App.OpenMoneyWindow();
        this.m_App.EntryWindow(this.m_TimeWindow);
        this.m_TimeWindow.OpenWindow();
        this.m_App.LoopFrame(4);
        Vari.m_ChrSel.Create(this.m_App, 32, 32);
    }

    private void DoStatus() {
        do {
            int n;
            if ((n = Vari.m_ChrSel.Run()) == -1) {
                return;
            }
            int n2 = Vari.GetPartyWork(n);
            CStatusWin cStatusWin = new CStatusWin();
            cStatusWin.Create(this.m_App, n2);
            cStatusWin.OpenWindow();
            this.m_App.EntryWindow(cStatusWin);
            CSlipWindow cSlipWindow = new CSlipWindow();
            cSlipWindow.Create(this.m_App, "\uff3a\uff1a\u30a2\u30d3\u30ea\u30c6\u30a3\u8868\u793a");
            cSlipWindow.OpenWindow(96, 288);
            this.m_App.EntryWindow(cSlipWindow);
            this.m_App.LoopFrame(4);
            do {
                this.m_App.MainFrame();
                if (!this.m_App.m_bKeyZ && this.m_App.m_nMouseLeft != 1) continue;
                this.m_App.m_nMouseLeft = 2;
                cSlipWindow.SetText(0, "\uff3a\uff1a\u6b21\u306e\u30da\u30fc\u30b8");
                this.DoAbility(n2, 0);
                break;
            } while (!this.m_App.m_bKeyX && this.m_App.m_nMouseRight != 1);
            cStatusWin.CloseWindow();
            cSlipWindow.CloseWindow();
            this.m_App.LoopFrame(4);
            this.m_App.ReleaseWindow(cStatusWin);
            this.m_App.ReleaseWindow(cSlipWindow);
        } while (this.m_App.m_Play.m_nPartyNum != 1);
    }

    private void DoAbility(int n, int n2) {
        CAbilityWin cAbilityWin = new CAbilityWin();
        cAbilityWin.Create(this.m_App, n);
        cAbilityWin.OpenWindow(n2, 64, 32);
        this.m_App.EntryWindow(cAbilityWin);
        this.m_App.LoopFrame(4);
        do {
            this.m_App.MainFrame();
            if (this.m_App.CheckKeyDown(5) != 1 && this.m_App.m_nMouseLeft != 1) continue;
            this.m_App.m_nMouseLeft = 2;
            if (n2 >= 6) break;
            cAbilityWin.SetPage(++n2);
        } while (!this.m_App.m_bKeyX && this.m_App.m_nMouseRight != 1);
        cAbilityWin.CloseWindow();
        this.m_App.LoopFrame(2);
        this.m_App.ReleaseWindow(cAbilityWin);
    }

    private void DoGem() {
        do {
            int n;
            if ((n = Vari.m_ChrSel.Run()) == -1) {
                return;
            }
            CEquipGem cEquipGem = new CEquipGem();
            cEquipGem.Run(this.m_App, Vari.GetPartyWork(n));
        } while (this.m_App.m_Play.m_nPartyNum != 1);
    }

    private void DoHelp() {
        int n;
        CMenuWindow cMenuWindow = new CMenuWindow();
        cMenuWindow.Create(this.m_App, 2);
        cMenuWindow.SetFlag(1);
        cMenuWindow.SetMenuText(0, "\u30b9\u30c6\u30fc\u30bf\u30b9");
        cMenuWindow.SetMenuText(1, "\u30a2\u30d3\u30ea\u30c6\u30a3");
        this.m_App.EntryWindow(cMenuWindow);
        cMenuWindow.OpenWindow(32, 32);
        this.m_App.LoopFrame(4);
        while ((n = cMenuWindow.LoopFrame()) != -1) {
            cMenuWindow.SetFlag(4);
            if (n == 0) {
                this.DoStatusHelp();
            } else if (n == 1) {
                this.DoAbilityHelp();
            }
            cMenuWindow.ResetFlag(4);
        }
        cMenuWindow.CloseWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(cMenuWindow);
    }

    private void DoStatusHelp() {
        CHelpStatus cHelpStatus = new CHelpStatus();
        cHelpStatus.CreateLR(this.m_App, 7, 8);
        cHelpStatus.SetFlag(1);
        cHelpStatus.CreateText();
        cHelpStatus.OpenAllWindow();
        while (cHelpStatus.LoopFrame() != -1) {
        }
        cHelpStatus.CloseAllWindow();
    }
}

