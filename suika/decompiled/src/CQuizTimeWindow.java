/*
 * Decompiled with CFR 0.152.
 */
class CQuizTimeWindow
extends CWindow {
    static final int WIN_WIDTH = 48;
    static final int WIN_HEIGHT = 32;
    static final int WIN_XPOS = 400 - WIN_WIDTH - 16;
    static final int WIN_YPOS = 16;
    private ARpg m_App;
    private boolean m_bDisp;
    private long m_lStartTime;

    public void Create() {
        this.m_App = Vari.m_App;
        this._Create(this.m_App, Vari.m_WinColor, WIN_WIDTH, WIN_HEIGHT, 4);
    }

    public void DrawMessage() {
        if (this.m_bDisp) {
            int n = this.GetTime();
            String string = Calc3D.NumberString(n, 2);
            this.DrawFont(8, 8, string, Def.GetColor(0), 16);
        }
    }

    public void CloseWindow() {
        this._Close();
    }

    CQuizTimeWindow() {
    }

    public void Run() {
        boolean bl = this._Move();
        this._Draw();
        if (bl) {
            this.DrawMessage();
        }
    }

    public void OpenWindow() {
        this._Open(WIN_XPOS + WIN_WIDTH / 2, 16 + WIN_HEIGHT / 2, WIN_XPOS, 16);
    }

    public int GetTime() {
        long l = (Vari.m_App.GetNowTime() - this.m_lStartTime) / 1000L;
        int n = (int)(10L - l);
        if (n < 0) {
            n = 0;
        }
        return n;
    }

    public void End() {
        this.m_bDisp = false;
        this.m_lStartTime = Vari.m_App.GetNowTime();
    }

    public void Start() {
        this.m_bDisp = true;
        this.m_lStartTime = Vari.m_App.GetNowTime();
    }
}

