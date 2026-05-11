/*
 * Decompiled with CFR 0.152.
 */
class CSlipWindow
extends CWindow {
    private ARpg m_App;
    private String[] m_astrMess;
    private int m_nXPos;
    private int m_nYPos;
    private int m_nLines;
    private int m_nWidth;
    private int m_nHeight;

    public void Create(ARpg aRpg, String string) {
        this.m_App = aRpg;
        this.m_astrMess = new String[1];
        this.m_astrMess[0] = new String(string);
        this.m_nLines = 1;
        this.m_nWidth = string.length() * 16 + 16;
        this.m_nHeight = this.GetHeight_Text(this.m_nLines);
        this._Create(aRpg, Vari.m_WinColor, this.m_nWidth, this.m_nHeight, 4);
    }

    public void Create(ARpg aRpg, int n, int n2) {
        this.m_App = aRpg;
        this.m_astrMess = new String[n2];
        this.m_nLines = n2;
        this.m_nWidth = this.GetWidth_Text(n);
        this.m_nHeight = this.GetHeight_Text(this.m_nLines);
        this._Create(aRpg, Vari.m_WinColor, this.m_nWidth, this.m_nHeight, 4);
    }

    public void DrawMessage() {
        int n = 0;
        while (n < this.m_nLines) {
            this.DrawFont(8, this.GetYPos(n), this.m_astrMess[n], Def.GetColor(0), 16);
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

    public int GetWidth() {
        return this.m_nWidth;
    }

    public void OpenWindow(int n, int n2) {
        this._Open(n, n2, n - this.m_nWidth / 2, n2 - this.m_nHeight / 2);
    }

    CSlipWindow() {
    }

    public void SetText(int n, String string) {
        this.m_astrMess[n] = new String(string);
    }
}

