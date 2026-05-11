/*
 * Decompiled with CFR 0.152.
 */
class CNumWindow
extends CWindow {
    static final int WIN_WIDTH = 320;
    static final int WIN_HEIGHT = 32;
    static final int WIN_XPOS = 32;
    static final int WIN_YPOS = 80;
    private ARpg m_App;
    private int m_nXPos;
    private int m_nYPos;
    private String m_szName;
    private int m_nPrice;
    private int m_nNum;
    private int m_nMaxNum;
    private boolean m_bMoveRight;
    private boolean m_bMoveLeft;

    public void Create(ARpg aRpg, String string, int n, int n2) {
        this.m_App = aRpg;
        this.m_nNum = 1;
        this.m_szName = string;
        this.m_nPrice = n;
        this.m_bMoveRight = false;
        this.m_bMoveLeft = false;
        this.SetMax(n2);
        this._Create(aRpg, Vari.m_WinColor, 320, 32, 4);
    }

    public void DrawMessage() {
        this.DrawFont(8, 8, this.m_szName, Def.GetColor(0), 16);
        this.DrawFont(136, 8, "\u00d7", Def.GetColor(0), 16);
        this.DrawFont(152, 8, Calc3D.NumberString(this.m_nNum, 1), Def.GetColor(0), 16);
        int n = this.m_nNum * this.m_nPrice;
        String string = Calc3D.NumberString(n, 7);
        string = string + "\uff27";
        this.DrawFont(184, 8, string, Def.GetColor(0), 16);
    }

    public void CloseWindow() {
        this._Close();
    }

    CNumWindow() {
    }

    public void Run() {
        boolean bl = this._Move();
        this._Draw();
        if (bl) {
            this.DrawMessage();
        }
    }

    public void SetMax(int n) {
        this.m_nMaxNum = n;
        if (this.m_nMaxNum == 1) {
            this.ResetFlag(16);
            this.ResetFlag(32);
            return;
        }
        this.SetFlag(16);
        this.SetFlag(32);
    }

    public void OpenWindow() {
        this._Open(192, 96, 32, 80);
    }

    public int LoopFrame() {
        while (true) {
            this.m_App.MainFrame();
            if (this.IsOK()) {
                return this.m_nNum;
            }
            if (this.IsCancel()) {
                return 0;
            }
            if (this.IsLeft()) {
                if (!this.m_bMoveLeft) {
                    this.m_bMoveLeft = true;
                    this.m_nNum += -1;
                    if (this.m_nNum <= 0) {
                        this.m_nNum = this.m_nMaxNum;
                    }
                }
            } else {
                this.m_bMoveLeft = false;
            }
            if (this.IsRight()) {
                if (this.m_bMoveRight) continue;
                this.m_bMoveRight = true;
                ++this.m_nNum;
                if (this.m_nNum <= this.m_nMaxNum) continue;
                this.m_nNum = 1;
                continue;
            }
            this.m_bMoveRight = false;
        }
    }
}

