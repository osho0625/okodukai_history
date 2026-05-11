/*
 * Decompiled with CFR 0.152.
 */
class CTimeWindow
extends CWindow {
    static final int WIN_WIDTH = 144;
    static final int WIN_HEIGHT = 32;
    static final int WIN_XPOS = 240;
    static final int WIN_YPOS = 272;
    private ARpg m_App;

    public void Create(ARpg aRpg) {
        this.m_App = aRpg;
        this._Create(aRpg, Vari.m_WinColor, 144, 32, 4);
    }

    public void DrawMessage() {
        CPlayTime cPlayTime = this.m_App.m_Play.m_Time;
        cPlayTime.Count();
        String string = new String();
        string = string + Calc3D.NumberString(cPlayTime.GetHour(), 2);
        string = string + "\uff1a";
        string = string + Calc3D.NumberString0(cPlayTime.GetMinute(), 2);
        string = string + "\uff1a";
        string = string + Calc3D.NumberString0(cPlayTime.GetSecond(), 2);
        this.DrawFont(8, 8, string, Def.GetColor(0), 16);
    }

    public void CloseWindow() {
        this._Close();
    }

    CTimeWindow() {
    }

    public void Run() {
        boolean bl = this._Move();
        this._Draw();
        if (bl) {
            this.DrawMessage();
        }
    }

    public void OpenWindow() {
        this._Open(312, 288, 240, 272);
    }
}

