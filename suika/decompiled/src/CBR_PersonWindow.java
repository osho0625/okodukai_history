/*
 * Decompiled with CFR 0.152.
 */
class CBR_PersonWindow
extends CWindow {
    static final int WIN_WIDTH = 336;
    static final int WIN_HEIGHT = 48;
    static final int WIN_XPOS = 32;
    private ARpg m_App;
    private CBattleWork m_BChr;
    private int m_nYPos;
    private int m_nExp;
    private int m_nAP;

    public void Create(ARpg aRpg, CBattleWork cBattleWork, int n, int n2, int n3) {
        this.m_App = aRpg;
        this.m_BChr = cBattleWork;
        this.m_nYPos = n;
        this.m_nExp = n2;
        this.m_nAP = n3;
        this._Create(aRpg, Vari.m_WinColor, 336, 48, 4);
    }

    public void DrawMessage() {
        this.DrawFont(24, 8, this.m_BChr.m_Prm.GetName(), Def.GetColor(0), 16);
        String string = new String();
        string = "\uff25\uff38\uff30\u3000";
        string = string + Calc3D.NumberString(this.m_nExp, 5);
        this.DrawFont(168, 8, string, Def.GetColor(0), 16);
        string = "\uff21\uff30\u3000\u3000";
        string = string + Calc3D.NumberString(this.m_nAP, 5);
        this.DrawFont(168, 24, string, Def.GetColor(0), 16);
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
        this._Open(200, this.m_nYPos + 24, 32, this.m_nYPos);
    }

    CBR_PersonWindow() {
        this.m_bSE = false;
    }
}

