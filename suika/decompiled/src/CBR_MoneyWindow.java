/*
 * Decompiled with CFR 0.152.
 */
class CBR_MoneyWindow
extends CWindow {
    static final int WIN_WIDTH = 336;
    static final int WIN_HEIGHT = 96;
    static final int WIN_XPOS = 32;
    static final int WIN_YPOS = 8;
    private ARpg m_App;
    private CBattleInfo m_Info;

    public void Create(ARpg aRpg, CBattleInfo cBattleInfo) {
        this.m_App = aRpg;
        this.m_Info = cBattleInfo;
        this._Create(aRpg, Vari.m_WinColor, 336, 96, 4);
    }

    public void DrawMessage() {
        this.DrawFont(8, 8, "\u7372\u5f97\u91d1\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u7372\u5f97\u30a2\u30a4\u30c6\u30e0", Def.GetColor(0), 16);
        String string = new String();
        string = Calc3D.NumberString(this.m_Info.m_nGold, 5);
        string = string + "\uff27";
        this.DrawFont(24, 24, string, Def.GetColor(0), 16);
        int n = 0;
        while (n < this.m_Info.m_nItemPtr) {
            CItemData cItemData = Vari.GetItemData(this.m_Info.m_anItem[n]);
            this.DrawFont(200, 24 + n * 16, cItemData.m_strName, Def.GetColor(0), 16);
            ++n;
        }
    }

    public void CloseWindow() {
        this._Close();
    }

    public void Run() {
        boolean bl = this._Move();
        this._Draw();
        if (bl) {
            this.DrawMessage();
        }
    }

    CBR_MoneyWindow() {
        this.m_bSE = false;
    }

    public void OpenWindow() {
        this._Open(200, 56, 32, 8);
    }
}

