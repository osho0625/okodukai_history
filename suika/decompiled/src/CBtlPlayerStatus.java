/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CBtlPlayerStatus {
    static final int DRAW_XPOS = 136;
    static final int DRAW_LENGTH = 240;
    private ARpg m_App;
    private CBattleWork m_BChr;
    private int m_nYPos;
    private Color m_Col;

    CBtlPlayerStatus() {
    }

    public void Create(ARpg aRpg, CBattleWork cBattleWork, int n) {
        this.m_App = aRpg;
        this.m_BChr = cBattleWork;
        this.m_nYPos = 320 - 18 * (3 - n) - 2;
    }

    public void Run() {
        if (this.m_BChr == null) {
            return;
        }
        this.DecideColor();
        this.DrawBack();
        String string = this.m_BChr.m_Prm.GetName();
        int n = string.length();
        int n2 = 0;
        while (n2 < n) {
            String string2 = string.substring(n2, n2 + 1);
            this.DrawFont(n2, string2);
            ++n2;
        }
        boolean bl = false;
        this.DrawFont(5, "\uff28");
        n2 = Calc3D.GetKetaSuji(this.m_BChr.m_Prm.m_nHP, 4);
        if (n2 != 0) {
            this.DrawFont(6, Def.GetZenSujiCode(n2));
            bl = true;
        }
        if ((n2 = Calc3D.GetKetaSuji(this.m_BChr.m_Prm.m_nHP, 3)) != 0 || bl) {
            this.DrawFont(7, Def.GetZenSujiCode(n2));
            bl = true;
        }
        if ((n2 = Calc3D.GetKetaSuji(this.m_BChr.m_Prm.m_nHP, 2)) != 0 || bl) {
            this.DrawFont(8, Def.GetZenSujiCode(n2));
        }
        n2 = Calc3D.GetKetaSuji(this.m_BChr.m_Prm.m_nHP, 1);
        this.DrawFont(9, Def.GetZenSujiCode(n2));
        this.DrawFont(10, "\uff0f");
        bl = false;
        this.DrawFont(11, "\uff2d");
        n2 = Calc3D.GetKetaSuji(this.m_BChr.m_Prm.m_nMP, 3);
        if (n2 != 0) {
            this.DrawFont(12, Def.GetZenSujiCode(n2));
            bl = true;
        }
        if ((n2 = Calc3D.GetKetaSuji(this.m_BChr.m_Prm.m_nMP, 2)) != 0 || bl) {
            this.DrawFont(13, Def.GetZenSujiCode(n2));
        }
        n2 = Calc3D.GetKetaSuji(this.m_BChr.m_Prm.m_nMP, 1);
        this.DrawFont(14, Def.GetZenSujiCode(n2));
    }

    public void DrawFont(int n, String string) {
        int n2 = 136 + n * 16 + 8;
        this.m_App.DrawFontC(n2 - 1, this.m_nYPos, string, 16, Color.black);
        this.m_App.DrawFontC(n2 + 1, this.m_nYPos, string, 16, Color.black);
        this.m_App.DrawFontC(n2, this.m_nYPos - 1, string, 16, Color.black);
        this.m_App.DrawFontC(n2, this.m_nYPos + 1, string, 16, Color.black);
        this.m_App.DrawFontC(n2, this.m_nYPos, string, 16, this.m_Col);
    }

    public void Release() {
        this.m_BChr = null;
    }

    public void DecideColor() {
        if (this.m_BChr.m_Prm.m_nHP == 0) {
            this.m_Col = new Color(64, 64, 64);
            return;
        }
        if (this.m_BChr.m_Prm.m_nHP < this.m_BChr.m_Prm.GetMaxHP() / 4) {
            this.m_Col = new Color(255, 64, 64);
            return;
        }
        this.m_Col = new Color(240, 240, 240);
    }

    public void DrawBack() {
        int n = 0;
        do {
            this.m_App.SetColor(new Color(n * 12, n * 24, n * 48));
            this.m_App.m_OffsGraph.drawLine(136, this.m_nYPos + 16 - n, 376, this.m_nYPos + 16 - n);
        } while (++n < 6);
    }
}

