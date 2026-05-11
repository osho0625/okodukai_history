/*
 * Decompiled with CFR 0.152.
 */
class CMoneyWindow
extends CWindow {
    static final int WIN_WIDTH = 144;
    static final int WIN_HEIGHT = 32;
    static final int WIN_XPOS = 240;
    static final int WIN_YPOS = 16;
    private ARpg m_App;

    CMoneyWindow() {
        this.m_bSE = false;
    }

    public void Create(ARpg aRpg) {
        this.m_App = aRpg;
        this._Create(aRpg, Vari.m_WinColor, 144, 32, 4);
    }

    public void DrawMessage() {
        String string = Calc3D.NumberString(this.m_App.m_Play.GetGold(), 7);
        string = string + "\uff27";
        this.DrawFont(8, 8, string, Def.GetColor(0), 16);
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

    public void OpenWindow() {
        this._Open(312, 32, 240, 16);
    }
}

