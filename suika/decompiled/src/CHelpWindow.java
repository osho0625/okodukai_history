/*
 * Decompiled with CFR 0.152.
 */
class CHelpWindow
extends CWindow {
    static final int WIN_WIDTH = 272;
    static final int WIN_HEIGHT = 32;
    static final int WIN_XPOS = 120;
    private ARpg m_App;
    private int m_nYPos;
    private CHelpData m_Help;

    public void Create(ARpg aRpg, int n) {
        this.m_App = aRpg;
        this.m_nYPos = n;
        this._Create(aRpg, Vari.m_WinColor, 272, 32, 4);
    }

    public void SetHelp(CHelpData cHelpData) {
        this.m_Help = cHelpData;
    }

    public void DrawMessage() {
        if (this.m_Help != null) {
            this.DrawFont(8, 8, this.m_Help.m_strText, Def.GetColor(0), 16);
        }
    }

    CHelpWindow() {
        this.m_bSE = false;
    }

    public void CloseWindow() {
        this._Close();
        this.m_Help = null;
    }

    public void Run() {
        boolean bl = this._Move();
        this._Draw();
        if (bl) {
            this.DrawMessage();
        }
    }

    public void OpenWindow() {
        this._Open(256, this.m_nYPos + 16, 120, this.m_nYPos);
    }
}

