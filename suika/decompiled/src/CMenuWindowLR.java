/*
 * Decompiled with CFR 0.152.
 */
class CMenuWindowLR
extends CMenuWindow {
    static final int MAX_ITEM = 256;
    private int m_nListNum;
    private int m_nLength;
    private int m_nMaxNum;
    private int m_nPage;
    private int m_nMaxPage;
    private String[] m_astrText;
    private int[] m_anFlagLR;

    public void MakeListSub() {
        this.ClearMenuFlag();
        int n = this.m_nPage * this.m_nListNum;
        int n2 = (this.m_nPage + 1) * this.m_nListNum - 1;
        int n3 = 0;
        if (n2 > this.m_nMaxNum) {
            n2 = this.m_nMaxNum;
        }
        int n4 = n;
        while (n4 <= n2) {
            this.SetMenuText(n3, this.m_astrText[n4]);
            this.SetMenuFlag(n3, this.m_anFlagLR[n4]);
            ++n3;
            ++n4;
        }
        while (n3 < this.m_nListNum) {
            this.SetMenuText(n3, "\u3000");
            this.SetMenuFlag(n3, 2);
            ++n3;
        }
    }

    public void Dicide() {
        this.m_nDecision = this.m_nSelect + this.m_nPage * this.m_nListNum;
    }

    public boolean CheckError() {
        boolean bl = false;
        int n = 0;
        do {
            if (this.m_nSelect < 0) {
                if (this.m_nPage > 0) {
                    this.m_nPage += -1;
                    bl = true;
                }
                this.m_nSelect = 0;
                return bl;
            }
            if (this.m_nMaxNum >= this.m_nSelect + this.m_nPage * this.m_nListNum && this.m_anFlagLR[this.m_nSelect] != 2) break;
            this.MoveCursor(-1);
        } while (++n < 32);
        return false;
    }

    public int GetSelectNoDisp() {
        return this.m_nSelect;
    }

    public void MakeList() {
        this.MakeListSub();
        this.CheckPage();
        if (this.CheckError()) {
            this.MakeListSub();
            this.CheckPage();
        }
    }

    public void SetMenuTextLR(int n, String string) {
        this.m_astrText[n] = new String(string);
        if (n > this.m_nMaxNum) {
            this.m_nMaxNum = n;
        }
        if (n / this.m_nListNum == this.m_nPage) {
            this.SetMenuText(n % this.m_nListNum, string);
        }
    }

    public void SetMenuFlagLR(int n, int n2) {
        this.m_anFlagLR[n] = n2;
        if (n / this.m_nListNum == this.m_nPage) {
            this.SetMenuFlag(n % this.m_nListNum, n2);
        }
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

    public void CheckPage() {
        this.m_nMaxPage = this.m_nMaxNum / this.m_nListNum + 1;
        if (this.m_nMaxPage > 1) {
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

    public int GetSelectNo() {
        return this.m_nSelect + this.m_nPage * this.m_nListNum;
    }

    public void CreateLR(ARpg aRpg, int n, int n2) {
        this.m_nListNum = n;
        this.m_nMaxNum = 0;
        this.m_astrText = new String[256];
        this.m_anFlagLR = new int[256];
        this.Create(aRpg, this.m_nListNum);
        this.m_nTextLength = n2;
        this.FixHeight(this.m_nListNum);
    }

    CMenuWindowLR() {
    }
}

