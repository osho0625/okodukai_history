/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CWinEntry
extends CGameApp {
    static final int MAX_WINDOW = 10;
    static final int MAX_TEXTOBJ = 16;
    private CWindow[] m_aWindow;
    private CTextObj[] m_aTextObj;
    private int m_nTextPtr;
    public int m_nStopDisplay;

    public void DrawTextObject() {
        int n = 0;
        do {
            int n2;
            CTextObj cTextObj;
            if (!(cTextObj = this.m_aTextObj[n2 = (this.m_nTextPtr + 1 + n) % 16]).Move()) continue;
            D3DXVECTOR3 d3DXVECTOR3 = this.m_Render.Get3DPosBW(cTextObj.m_vPos);
            this.DrawFontCF((int)d3DXVECTOR3.x, (int)d3DXVECTOR3.y + cTextObj.GetYAdd(), cTextObj.m_strText, 16, cTextObj.m_Color);
        } while (++n < 16);
    }

    public void ResetStopDisplay() {
        this.m_nStopDisplay = 0;
    }

    public void EntryWindow(CWindow cWindow) {
        int n = 0;
        do {
            if (this.m_aWindow[n] != null) continue;
            this.m_aWindow[n] = cWindow;
            return;
        } while (++n < 10);
    }

    public void ReleaseWindow(CWindow cWindow) {
        int n = 0;
        do {
            if (this.m_aWindow[n] != cWindow) continue;
            this.m_aWindow[n] = null;
            return;
        } while (++n < 10);
    }

    public void RunWindow() {
        int n = 0;
        do {
            if (this.m_aWindow[n] == null) continue;
            this.m_aWindow[n].Run();
        } while (++n < 10);
    }

    public void SetChrPrm(int n, int n2) {
        CChrParam cChrParam = Vari.GetChrPrm(n);
        CChrParam cChrParam2 = Vari.GetDataPrm(n2);
        cChrParam.Set(cChrParam2);
    }

    public void ClearTextObj() {
        this.m_nTextPtr = 0;
        int n = 0;
        do {
            this.m_aTextObj[n].m_nCount = 0;
        } while (++n < 16);
    }

    public void RecTextObj(String string, D3DXVECTOR3 d3DXVECTOR3, Color color) {
        CTextObj cTextObj = this.m_aTextObj[this.m_nTextPtr];
        ++this.m_nTextPtr;
        this.m_nTextPtr %= 16;
        cTextObj.m_strText = new String(string);
        cTextObj.m_vPos.Set(d3DXVECTOR3);
        cTextObj.m_Color = new Color(color.getRed(), color.getGreen(), color.getBlue());
        cTextObj.m_nCount = 16;
    }

    public boolean IsOpenCloseWindow() {
        int n = 0;
        do {
            int n2;
            if (this.m_aWindow[n] == null || (n2 = this.m_aWindow[n].GetMode()) != 1 && n2 != 3) continue;
            return true;
        } while (++n < 10);
        return false;
    }

    public void SetStopDisplay() {
        this.m_nStopDisplay = 1;
    }

    CWinEntry() {
        this.InitWinEntry();
    }

    public void InitWinEntry() {
        this.m_aWindow = new CWindow[10];
        int n = 0;
        do {
            this.m_aWindow[n] = null;
        } while (++n < 10);
        this.m_aTextObj = new CTextObj[16];
        n = 0;
        do {
            this.m_aTextObj[n] = new CTextObj();
        } while (++n < 16);
        this.ClearTextObj();
    }

    public int GetWindowNum() {
        int n = 0;
        int n2 = 0;
        do {
            if (this.m_aWindow[n2] == null) continue;
            ++n;
        } while (++n2 < 10);
        return n;
    }

    public boolean IsStopDisplay() {
        return this.m_nStopDisplay == 1;
    }
}

