/*
 * Decompiled with CFR 0.152.
 */
class CBattlePlayer {
    static final int MAX_MENU_SKILL = 4;
    static final int MAX_LIST_SKILL = 20;
    private ARpg m_App;
    private CBattleMain m_Btl;
    private CMenuWindow m_CmdMenu = new CMenuWindow();
    private int[][] m_anChrTable = new int[][]{{0, 0, 0, 0, 0, 0}, {0, 0, 0, 0, 0, 0}};
    private int[] m_anTableMax = new int[]{0, 0};
    private int[] m_anSkillList = new int[20];

    public void MakeSkillMenu(CBattleWork cBattleWork, CAbility cAbility, CMenuWindowLR cMenuWindowLR, int n, int n2) {
        String string;
        int n3;
        CSkillData cSkillData;
        int n4 = cBattleWork.m_Prm.GetMP();
        cMenuWindowLR.CreateLR(this.m_App, 4, 5);
        int n5 = 0;
        int n6 = n;
        while (n6 <= n2) {
            if (cAbility.GetFlag(n6)) {
                Vari.m_anArray[n5] = n6;
                cSkillData = Vari.GetSkillData(n6);
                n3 = cSkillData.GetMP(cBattleWork.m_Prm);
                string = new String(cSkillData.m_strName);
                string = Calc3D.AddStringSpace(string, 6);
                string = string + Calc3D.NumberString(n3, 3);
                cMenuWindowLR.SetMenuTextLR(n5, string);
                if (n4 < n3) {
                    cMenuWindowLR.SetMenuFlagLR(n5, 1);
                }
                this.m_anSkillList[n5] = n6;
                ++n5;
            }
            ++n6;
        }
        if (this.m_App.m_bLowSpec) {
            int[] nArray = new int[]{181, 178, 200};
            int n7 = 0;
            do {
                cSkillData = Vari.GetSkillData(nArray[n7]);
                n3 = cSkillData.GetMP(cBattleWork.m_Prm);
                string = new String(cSkillData.m_strName);
                string = Calc3D.AddStringSpace(string, 6);
                string = string + Calc3D.NumberString(n3, 3);
                cMenuWindowLR.SetMenuTextLR(n5, string);
                if (n4 < n3) {
                    cMenuWindowLR.SetMenuFlagLR(n5, 1);
                }
                this.m_anSkillList[n5] = nArray[n7];
                ++n5;
            } while (++n7 < 3);
        }
        cMenuWindowLR.MakeList();
        cMenuWindowLR.SetFlag(1);
        this.m_App.EntryWindow(cMenuWindowLR);
        cMenuWindowLR.OpenWindow(24, 216);
    }

    public int DecideObject(CBattleWork cBattleWork, int n) {
        switch (n) {
            case 1: {
                CBattleWork cBattleWork2 = this.ChrSelect1(cBattleWork, 0, false);
                if (cBattleWork2 == null) {
                    return -1;
                }
                return cBattleWork2.m_nWorkNo;
            }
            case 2: {
                CBattleWork cBattleWork3 = this.ChrSelect1(cBattleWork, 1, false);
                if (cBattleWork3 == null) {
                    return -1;
                }
                return cBattleWork3.m_nWorkNo;
            }
            case 3: {
                return this.ChrSelectAll(cBattleWork, 101, true);
            }
            case 4: {
                return this.ChrSelectAll(cBattleWork, 102, true);
            }
            case 5: {
                return this.ChrSelectMy(cBattleWork);
            }
            case 6: {
                CBattleWork cBattleWork4 = this.ChrSelect1(cBattleWork, 0, true);
                if (cBattleWork4 == null) {
                    return -1;
                }
                return cBattleWork4.m_nWorkNo;
            }
            case 7: {
                return this.ChrSelectAll(cBattleWork, 101, false);
            }
            case 8: {
                return this.ChrSelectAll(cBattleWork, 102, false);
            }
        }
        return -1;
    }

    public CBattleWork ChrSelect1(CBattleWork cBattleWork, int n, boolean bl) {
        this.MakeChrTable(bl);
        this.m_App.m_bMouseMove = true;
        int n2 = n;
        int n3 = 0;
        CBattleWork cBattleWork2 = this.GetWork(n2, n3);
        CChrWork cChrWork = cBattleWork2.m_Chr;
        cChrWork.SetFlag(4);
        while (true) {
            int n4;
            cChrWork.ResetFlag(4);
            if (this.m_App.CheckKeyDown(3) == 1 && --n3 < 0) {
                n3 = this.m_anTableMax[n2] - 1;
            }
            if (this.m_App.CheckKeyDown(1) == 1 && this.m_anChrTable[n2][++n3] == -1) {
                n3 = 0;
            }
            if (this.m_App.CheckKeyDown(0) == 1 || this.m_App.CheckKeyDown(2) == 1) {
                n2 = 1 - n2;
                while (this.m_anChrTable[n2][n3] == -1 && --n3 != 0) {
                }
            }
            if ((n4 = this.SelectMouseChr(bl)) != -1) {
                int n5 = 0;
                block2: do {
                    int n6 = 0;
                    do {
                        if (this.m_anChrTable[n6][n5] != n4) continue;
                        n2 = n6;
                        n3 = n5;
                        continue block2;
                    } while (++n6 < 2);
                } while (++n5 < 6);
            }
            if (this.m_App.CheckKeyDown_OK()) break;
            if (this.m_App.CheckKeyDown_Cancel()) {
                cBattleWork2 = null;
                break;
            }
            cBattleWork2 = this.GetWork(n2, n3);
            cChrWork = cBattleWork2.m_Chr;
            cChrWork.SetFlag(4);
            if (cBattleWork2 != null) {
                Vari.m_nBtlName = cBattleWork2.m_nWorkNo;
            }
            this.m_Btl.DoFrame();
            Vari.m_nBtlName = -1;
        }
        cChrWork.ResetFlag(4);
        return cBattleWork2;
    }

    public void SelectGroup(int n) {
        int n2 = 0;
        int n3 = 3;
        if (n == 102) {
            n2 = 3;
            n3 = 9;
        }
        int n4 = n2;
        while (n4 < n3) {
            CBattleWork cBattleWork = Vari.GetBChrWork(n4);
            if (cBattleWork.IsAlive() && !cBattleWork.m_Prm.m_Abi.GetFlag(149)) {
                CChrWork cChrWork = cBattleWork.m_Chr;
                cChrWork.SetFlag(4);
            }
            ++n4;
        }
    }

    public CAction Decide(CBattleWork cBattleWork) {
        int n;
        CAction cAction;
        Vari.m_bSkillWin = false;
        if (cBattleWork.m_Prm.GetConf() > 0) {
            return this.Confusion(cBattleWork);
        }
        this.Start();
        this.MakeMenu(cBattleWork);
        do {
            this.m_CmdMenu.ResetFlag(2);
            n = this.m_CmdMenu.LoopFrame();
            this.m_CmdMenu.SetFlag(2);
        } while ((cAction = this.DoCommand(cBattleWork, cBattleWork.m_Prm.m_anCmdAb[n])) == null);
        this.m_CmdMenu.CloseWindow();
        this.m_App.LoopFrame(4);
        this.End();
        return cAction;
    }

    public CAction ItemMain(CBattleWork cBattleWork) {
        CBtlItemList cBtlItemList = new CBtlItemList();
        cBtlItemList.SetListMax(4);
        cBtlItemList.CreateList(this.m_App, this, cBattleWork);
        cBtlItemList.Run(24, 216);
        return cBtlItemList.GetAction();
    }

    public int SelectMouseChr(boolean bl) {
        if (!this.m_App.m_bMouseMove) {
            return -1;
        }
        this.m_App.m_bMouseMove = false;
        if (Vari.m_bSkillWin && this.m_App.m_nMouseX >= 24 && this.m_App.m_nMouseY >= 216 && this.m_App.m_nMouseX < 185 && this.m_App.m_nMouseY < 320) {
            return -1;
        }
        new D3DXVECTOR3();
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        int n = -1;
        int n2 = 999999;
        int n3 = 0;
        do {
            CBattleWork cBattleWork;
            if (!(cBattleWork = Vari.GetBChrWork(n3)).IsAlive() && (!bl || !cBattleWork.IsDead())) continue;
            int n4 = (int)cBattleWork.m_Chr.m_fHitSize;
            d3DXVECTOR3 = this.m_App.m_Render.Get3DPosBW(cBattleWork.m_vPos);
            int n5 = (int)d3DXVECTOR3.x;
            int n6 = (int)d3DXVECTOR3.y - (n4 >> 1);
            int n7 = (this.m_App.m_nMouseX - n5) * (this.m_App.m_nMouseX - n5) + (this.m_App.m_nMouseY - n6) * (this.m_App.m_nMouseY - n6);
            if (n7 >= n4 * n4 || n7 >= n2) continue;
            n2 = n7;
            n = n3;
        } while (++n3 < 9);
        return n;
    }

    public int ChrSelectAll(CBattleWork cBattleWork, int n, boolean bl) {
        int n2 = n;
        this.m_App.m_bMouseMove = true;
        this.SelectGroup(n2);
        while (true) {
            int n3;
            if (bl && (this.m_App.CheckKeyDown(0) == 1 || this.m_App.CheckKeyDown(2) == 1)) {
                this.ResetGroup(n2);
                n2 = n2 == 101 ? 102 : 101;
                this.SelectGroup(n2);
            }
            if (bl && (n3 = this.SelectMouseChr(false)) != -1) {
                this.ResetGroup(n2);
                n2 = n3 < 3 ? 101 : 102;
                this.SelectGroup(n2);
            }
            if (this.m_App.CheckKeyDown_OK()) break;
            if (this.m_App.CheckKeyDown_Cancel()) {
                this.ResetGroup(n2);
                return -1;
            }
            Vari.m_nBtlName = CBattlePlayer.GetGroupName(n2);
            this.m_Btl.DoFrame();
            Vari.m_nBtlName = -1;
        }
        this.ResetGroup(n2);
        return n2;
    }

    public CBattleWork GetWork(int n, int n2) {
        return Vari.GetBChrWork(this.m_anChrTable[n][n2]);
    }

    public static int GetGroupName(int n) {
        int n2 = CBattleActCalc.GetGroupStart(n);
        int n3 = CBattleActCalc.GetGroupEnd(n);
        int n4 = 0;
        int n5 = -1;
        String string = "none";
        int n6 = n2;
        while (n6 < n3) {
            CBattleWork cBattleWork = Vari.GetBChrWork(n6);
            if (cBattleWork.IsAttack()) {
                if (n4 == 0) {
                    n5 = n6;
                    string = cBattleWork.m_Prm.GetName();
                } else if (!string.equals(cBattleWork.m_Prm.GetName())) {
                    if (n == 101) {
                        return 65534;
                    }
                    return 65535;
                }
                ++n4;
            }
            ++n6;
        }
        return n5;
    }

    public CAction Confusion(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        cAction.m_nAlgo = 1001;
        cAction.m_nObj = CBattleEnemy.SelectAll1();
        return cAction;
    }

    public void ResetGroup(int n) {
        int n2 = 0;
        int n3 = 3;
        if (n == 102) {
            n2 = 3;
            n3 = 9;
        }
        int n4 = n2;
        while (n4 < n3) {
            CBattleWork cBattleWork = Vari.GetBChrWork(n4);
            if (cBattleWork.IsAlive()) {
                CChrWork cChrWork = cBattleWork.m_Chr;
                cChrWork.ResetFlag(4);
            }
            ++n4;
        }
    }

    public CAction DoCommand(CBattleWork cBattleWork, int n) {
        CAction cAction = new CAction();
        switch (n) {
            case 1: {
                CBattleWork cBattleWork2 = this.ChrSelect1(cBattleWork, 1, false);
                if (cBattleWork2 == null) {
                    return null;
                }
                cAction.m_nAlgo = 1001;
                cAction.m_nObj = cBattleWork2.m_nWorkNo;
                break;
            }
            case 2: {
                cAction = this.ItemMain(cBattleWork);
                break;
            }
            case 3: {
                CBattleWork cBattleWork3 = this.ChrSelect1(cBattleWork, 1, false);
                if (cBattleWork3 == null) {
                    return null;
                }
                cAction.m_nAlgo = 1003;
                cAction.m_nObj = cBattleWork3.m_nWorkNo;
                break;
            }
            case 4: {
                CBattleWork cBattleWork4 = this.ChrSelect1(cBattleWork, 1, false);
                if (cBattleWork4 == null) {
                    return null;
                }
                cAction.m_nAlgo = 1004;
                cAction.m_nObj = cBattleWork4.m_nWorkNo;
                break;
            }
            case 10: {
                cAction.m_nAlgo = 1002;
                cAction.m_nObj = 0;
                break;
            }
            case 5: {
                cAction = this.SKillMain(cBattleWork, 16, 25);
                break;
            }
            case 7: {
                cAction = this.SKillMain(cBattleWork, 39, 49);
                break;
            }
            case 6: {
                cAction = this.SKillMain(cBattleWork, 50, 67);
                break;
            }
            case 9: {
                cAction = this.SKillMain(cBattleWork, 68, 81);
                break;
            }
            case 11: {
                cAction = this.SKillMain(cBattleWork, 82, 87);
            }
        }
        return cAction;
    }

    public void MakeChrTable(boolean bl) {
        CBattleWork cBattleWork;
        int n = 0;
        do {
            this.m_anChrTable[0][n] = -1;
            this.m_anChrTable[1][n] = -1;
        } while (++n < 6);
        n = 0;
        int n2 = 0;
        do {
            boolean bl2 = false;
            cBattleWork = Vari.GetBChrWork(n2);
            if (cBattleWork.IsAlive()) {
                bl2 = true;
            } else if (bl && cBattleWork.IsDead()) {
                bl2 = true;
            }
            if (!bl2) continue;
            this.m_anChrTable[0][n] = n2;
            ++n;
        } while (++n2 < 3);
        this.m_anTableMax[0] = n;
        n = 0;
        n2 = 3;
        do {
            if (!(cBattleWork = Vari.GetBChrWork(n2)).IsAlive() || cBattleWork.m_Prm.m_Abi.GetFlag(149)) continue;
            this.m_anChrTable[1][n] = n2;
            ++n;
        } while (++n2 < 9);
        this.m_anTableMax[1] = n;
    }

    public int ChrSelectMy(CBattleWork cBattleWork) {
        int n = cBattleWork.m_nWorkNo;
        CChrWork cChrWork = cBattleWork.m_Chr;
        cChrWork.SetFlag(4);
        while (!this.m_App.CheckKeyDown_OK()) {
            if (this.m_App.CheckKeyDown_Cancel()) {
                n = -1;
                break;
            }
            this.m_Btl.DoFrame();
        }
        cChrWork.ResetFlag(4);
        return n;
    }

    CBattlePlayer() {
    }

    CBattlePlayer(ARpg aRpg, CBattleMain cBattleMain) {
        this.m_App = aRpg;
        this.m_Btl = cBattleMain;
    }

    public CAction SKillMain(CBattleWork cBattleWork, int n, int n2) {
        int n3;
        int n4;
        CAbility cAbility = cBattleWork.m_Prm.m_Abi;
        Vari.m_Help.Create(this.m_App, 16);
        this.m_App.EntryWindow(Vari.m_Help);
        Vari.m_Help.OpenWindow();
        CBSkillWindowLR cBSkillWindowLR = new CBSkillWindowLR();
        this.MakeSkillMenu(cBattleWork, cAbility, cBSkillWindowLR, n, n2);
        Vari.m_bSkillWin = true;
        CSkillData cSkillData = null;
        do {
            cBSkillWindowLR.ResetFlag(2);
            int n5 = cBSkillWindowLR.LoopFrame();
            if (n5 == -1) {
                Vari.m_Help.CloseWindow();
                cBSkillWindowLR.CloseWindow();
                this.m_App.LoopFrame(4);
                this.m_App.ReleaseWindow(Vari.m_Help);
                this.m_App.ReleaseWindow(cBSkillWindowLR);
                return null;
            }
            n3 = this.m_anSkillList[n5];
            cSkillData = Vari.GetSkillData(n3);
            cBSkillWindowLR.SetFlag(2);
        } while ((n4 = this.DecideObject(cBattleWork, cSkillData.m_nObject)) == -1);
        Vari.m_Help.CloseWindow();
        cBSkillWindowLR.CloseWindow();
        Vari.m_bSkillWin = false;
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(Vari.m_Help);
        this.m_App.ReleaseWindow(cBSkillWindowLR);
        CAction cAction = new CAction();
        cAction.m_nAlgo = n3;
        cAction.m_nObj = n4;
        return cAction;
    }

    public void End() {
        this.m_App.ReleaseWindow(this.m_CmdMenu);
    }

    public void Start() {
        this.m_App.EntryWindow(this.m_CmdMenu);
    }

    public void MakeMenu(CBattleWork cBattleWork) {
        int n = cBattleWork.GetCmdAbNum();
        this.m_CmdMenu.Create(this.m_App, n);
        int n2 = 0;
        int n3 = 0;
        do {
            int n4;
            if ((n4 = cBattleWork.m_Prm.m_anCmdAb[n3]) == 0) continue;
            this.m_CmdMenu.SetMenuText(n2, Def.GetBattleCommand(cBattleWork.m_nWorkNo, n4));
            ++n2;
        } while (++n3 < 4);
        this.m_CmdMenu.SetFlag(1);
        this.m_CmdMenu.SetFlag(8);
        this.m_CmdMenu.OpenWindow(16, 200);
    }
}

