/*
 * Decompiled with CFR 0.152.
 */
class CSkillWindow
extends CWindow {
    static final int MAX_COUNT = 15;
    static final int WIN_WIDTH = 272;
    static final int WIN_HEIGHT = 32;
    static final int WIN_XPOS = 64;
    static final int WIN_YPOS = 16;
    private ARpg m_App;
    private String m_strMess;
    private int m_nTextX;
    private int m_nCount;

    public void Create(ARpg aRpg) {
        this.m_App = aRpg;
        this._Create(aRpg, Vari.m_WinColor, 272, 32, 4);
    }

    public void DrawMessage() {
        this.DrawFont(this.m_nTextX, 8, this.m_strMess, Def.GetColor(0), 16);
    }

    public void CloseWindow() {
        this._Close();
    }

    public void Run() {
        boolean bl = this._Move();
        this._Draw();
        if (bl) {
            this.DrawMessage();
            ++this.m_nCount;
            if (this.m_nCount >= 15) {
                this.CloseWindow();
            }
        }
    }

    public void OpenWindow(String string) {
        this.m_nCount = 0;
        this.m_strMess = new String(string);
        int n = this.m_strMess.length();
        this.m_nTextX = 136 - n * 8;
        this._Open(200, 32, 64, 16);
    }

    CSkillWindow() {
        this.m_bSE = false;
    }
}

