/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CAbilityWin
extends CWindow {
    static final int MAX_DISP = 16;
    static final int TEXT_COLUMNS = 17;
    static final int TEXT_LINES = 9;
    static final int WIN_WIDTH = 288;
    static final int WIN_HEIGHT = 224;
    private ARpg m_App;
    private int m_nChrNo;
    private int m_nPage;
    private int m_nDispX;
    private int m_nDispY;

    public void Create(ARpg aRpg, int n) {
        this.m_App = aRpg;
        this.m_nChrNo = n;
    }

    CAbilityWin() {
    }

    public void DrawMessage() {
        CChrParam cChrParam = Vari.GetChrPrm(this.m_nChrNo);
        CAbility cAbility = cChrParam.m_Abi;
        String string = new String();
        string = "\u30da\u30fc\u30b8";
        string = string + Def.ZENKAKU_SUJI[this.m_nPage + 1];
        this.DrawFont(8, this.GetYPos(0), string, Def.GetColor(0), 16);
        int n = 0;
        do {
            int n2;
            if (!cAbility.GetFlag(n2 = this.m_nPage * 16 + n)) continue;
            int n3 = 8 + (n & 1) * 9 * 16;
            int n4 = this.GetYPos((n >> 1) + 1);
            Color color = cAbility.GetFlagM(n2) ? Def.GetColor(0) : Def.GetColor(5);
            CSkillData cSkillData = Vari.GetSkillData(n2);
            if (cSkillData == null) continue;
            this.DrawFont(n3, n4, cSkillData.m_strName, color, 16);
        } while (++n < 16);
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

    public int GetYPos(int n) {
        return 8 + 24 * n;
    }

    public void OpenWindow(int n, int n2, int n3) {
        this.m_nPage = n;
        this.m_nDispX = n2;
        this.m_nDispY = n3;
        int n4 = this.m_nDispX + 144;
        int n5 = this.m_nDispY + 112;
        this._Create(this.m_App, Vari.m_WinColor, 288, 224, 4);
        this._Open(n4, n5, this.m_nDispX, this.m_nDispY);
    }

    public void SetPage(int n) {
        this.m_nPage = n;
    }
}

