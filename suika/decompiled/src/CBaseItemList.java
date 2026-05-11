/*
 * Decompiled with CFR 0.152.
 */
class CBaseItemList
extends CMenuWindow {
    static final int UNDRESS = -2;
    protected ARpg m_App;
    protected int m_nXPos;
    protected int m_nYPos;
    protected int m_nPage;
    protected int m_nMaxPage;
    protected int[] m_anTable = new int[150];
    protected int[] m_anUse = new int[150];
    protected int m_nTableMax;
    protected int m_nMaxListNum = 8;
    private int m_nHelpYPos;
    private boolean m_bHelpCtrl;

    public void Release1() {
    }

    public void FrameFunc() {
        int n = this.GetSelectNo();
        int n2 = n + this.m_nPage * this.m_nMaxListNum;
        if (this.m_anTable[n2] < 0) {
            Vari.m_Help.SetHelp(Vari.GetHelpData(0));
            return;
        }
        CItemData cItemData = Vari.GetItemData(this.m_anTable[n2]);
        Vari.m_Help.SetHelp(Vari.GetHelpData(cItemData.m_nHelp));
    }

    public void _Create(ARpg aRpg) {
        this.m_App = aRpg;
        this.MakeTable();
        this.SetFlag(1);
        this.Create(this.m_App, this.m_nMaxListNum);
        if (!this.m_bHelpCtrl) {
            Vari.m_Help.Create(this.m_App, this.m_nHelpYPos);
            this.m_App.EntryWindow(Vari.m_Help);
        }
    }

    public boolean ExecItem(int n) {
        return false;
    }

    public void SetHelpYPos(int n) {
        this.m_nHelpYPos = n;
    }

    public void MakeTable() {
        this.ClearTable();
        this.m_nTableMax = 0;
        int n = 0;
        do {
            if (this.m_App.m_Play.GetItem(n) <= 0) continue;
            this.m_anTable[this.m_nTableMax] = n;
            CItemData cItemData = Vari.GetItemData(n);
            this.m_anUse[this.m_nTableMax] = cItemData.m_nAlgo;
            ++this.m_nTableMax;
        } while (++n < 150);
        this.CheckPage();
    }

    public void SetHelpWindowCtrl(boolean bl) {
        this.m_bHelpCtrl = bl;
    }

    public void MakeList() {
        this.ClearMenuFlag();
        int n = this.m_nPage * this.m_nMaxListNum;
        String string = new String();
        int n2 = 0;
        while (n2 < this.m_nMaxListNum) {
            int n3 = this.m_anTable[n];
            if (n3 == -2) {
                string = "\u88c5\u5099\u3092\u5916\u3059";
            } else if (n3 != -1) {
                CItemData cItemData = Vari.GetItemData(n3);
                string = cItemData.GetName7();
                string = string + "\u3000\u00d7";
                string = string + Def.GetZenSujiCode(this.m_App.m_Play.GetItem(n3));
                if (!this.IsUse(cItemData)) {
                    this.SetMenuFlag(n2, 1);
                }
            } else {
                string = "\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000";
                this.SetMenuFlag(n2, 2);
            }
            this.SetMenuText(n2, string);
            ++n;
            ++n2;
        }
        this.CheckError();
    }

    public void Run(int n, int n2) {
        int n3;
        this.m_nXPos = n;
        this.m_nYPos = n2;
        this.ResetFlag(2);
        this.Open();
        while ((n3 = this.LoopFrame()) != -1) {
            this.SetFlag(2);
            if (this.ExecItem(n3)) break;
            this.ResetFlag(2);
        }
        this.Close();
    }

    public boolean IsUse(CItemData cItemData) {
        return true;
    }

    public void ClearTable() {
        int n = 0;
        do {
            this.m_anTable[n] = -1;
            this.m_anUse[n] = 0;
        } while (++n < 150);
    }

    public void SetListMax(int n) {
        this.m_nMaxListNum = n;
    }

    public void SelectLeft() {
        if (this.GetFlag(16)) {
            this.m_nPage += -1;
            if (this.m_nPage < 0) {
                this.m_nPage = this.m_nMaxPage - 1;
            }
            this.MakeList();
        }
    }

    CBaseItemList() {
    }

    public void CheckPage() {
        this.m_nMaxPage = (this.m_nTableMax + this.m_nMaxListNum - 1) / this.m_nMaxListNum;
        if (this.m_nTableMax >= this.m_nMaxListNum + 1) {
            this.SetFlag(16);
            this.SetFlag(32);
            return;
        }
        this.ResetFlag(16);
        this.ResetFlag(32);
    }

    public void SelectRight() {
        if (this.GetFlag(32)) {
            ++this.m_nPage;
            if (this.m_nPage >= this.m_nMaxPage) {
                this.m_nPage = 0;
            }
            this.MakeList();
        }
    }

    private void Close() {
        this.Release1();
        this.CloseWindow();
        if (!this.m_bHelpCtrl) {
            Vari.m_Help.CloseWindow();
        }
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(this);
        if (!this.m_bHelpCtrl) {
            this.m_App.ReleaseWindow(Vari.m_Help);
        }
        this.Release2();
    }

    private void Open() {
        this.m_nPage = 0;
        this.MakeList();
        this.m_App.EntryWindow(this);
        this.OpenWindow(this.m_nXPos, this.m_nYPos);
        if (!this.m_bHelpCtrl) {
            Vari.m_Help.OpenWindow();
        }
    }

    public void Release2() {
    }

    public void DecItem(int n) {
        int n2 = n + this.m_nPage * this.m_nMaxListNum;
        int n3 = this.m_anTable[n2];
        this.m_App.m_Play.AddItem(n3, -1);
        this.MakeTable();
        this.MakeList();
    }
}

