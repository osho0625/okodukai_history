/*
 * Decompiled with CFR 0.152.
 */
class CDispName
extends CWindow {
    static final int WIN_XPOS = 24;
    static final int WIN_YPOS = 24;
    static final int X_TEXT_NUM = 7;
    static final int Y_TEXT_NUM = 1;
    private ARpg m_App;
    private int m_nXPos;
    private int m_nYPos;
    private int m_nWidth;
    private int m_nHeight;
    private int m_nCursor;
    private String[] m_astrName;
    private int[] m_anName;

    public void Create(ARpg aRpg) {
        this.m_App = aRpg;
        this.m_nWidth = this.GetWidth_Text(7);
        this.m_nHeight = this.GetHeight_Text(1);
        this.m_nXPos = 400 - this.m_nWidth - 24;
        this.m_nYPos = 320 - this.m_nHeight - 24;
        this.m_astrName = new String[4];
        this.m_anName = new int[4];
        int n = 0;
        do {
            this.m_astrName[n] = new String("\u3000");
            this.m_anName[n] = 33;
        } while (++n < 4);
        this.m_nCursor = 0;
        this._Create(aRpg, Vari.m_WinColor, this.m_nWidth, this.m_nHeight, 4);
    }

    public void SetCode(int n, int n2) {
        this.m_anName[n] = n2;
        this.m_astrName[n] = new String(CInputNameWondow.m_strText[n2]);
    }

    public String GetCode(int n) {
        return this.m_astrName[n];
    }

    public void SetCursor(int n) {
        this.m_nCursor = n;
    }

    public void DrawMessage() {
        this.DrawFont(this.GetXPos(0), 8, "\u540d\u524d\uff1a", Def.GetColor(0), 16);
        int n = 0;
        do {
            this.DrawFont(this.GetXPos(3 + n), 8, this.m_astrName[n], Def.GetColor(0), 16);
        } while (++n < 4);
        this.DrawLine(this.GetXPos(3 + this.m_nCursor), 24, this.GetXPos(3 + this.m_nCursor) + 16, 24);
    }

    CDispName() {
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

    public int GetCodeNum(int n) {
        return this.m_anName[n];
    }

    public void OpenWindow() {
        this._Open(this.m_nXPos + this.m_nWidth / 2, this.m_nYPos + this.m_nHeight / 2, this.m_nXPos, this.m_nYPos);
    }
}

