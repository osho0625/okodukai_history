/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CCompWindow
extends CWindow {
    static final int WIN_WIDTH = 176;
    static final int WIN_LINE = 6;
    static final int WIN_XPOS = 112;
    static final int WIN_YPOS = 48;
    private ARpg m_App;
    private int m_nListNo;

    public void Create(ARpg aRpg, int n) {
        this.m_App = aRpg;
        this.m_nListNo = n;
        this._Create(aRpg, Vari.m_WinColor, 176, this.GetHeight_Text(6), 4);
    }

    public void DrawMessage() {
        String string;
        int n;
        CItemData cItemData = Vari.GetItemData(CCompTable.GetItem(this.m_nListNo));
        this.DrawFont(8, 8, cItemData.m_strName, Def.GetColor(0), 16);
        this.DrawFont(24, this.GetYPos(1), "\u2193\u5fc5\u8981\u306a\u30a2\u30a4\u30c6\u30e0", Def.GetColor(0), 16);
        int n2 = 0;
        while ((n = CCompTable.GetMaterial(this.m_nListNo, n2)) != -1) {
            cItemData = Vari.GetItemData(n);
            string = "\u30fb";
            string = string + cItemData.m_strName;
            string = string + "\u00d7";
            string = string + Calc3D.NumberString(CCompTable.GetMatNum(this.m_nListNo, n2), 1);
            Color color = CCompTable.IsPossession(this.m_nListNo, n2) ? Def.GetColor(0) : Def.GetColor(8);
            this.DrawFont(24, this.GetYPos(n2 + 2), string, color, 16);
            if (++n2 < 3) continue;
        }
        string = Calc3D.NumberString(CCompTable.GetGold(this.m_nListNo), 5);
        string = string + "\uff27";
        this.DrawFont(72, this.GetYPos(5), string, Def.GetColor(0), 16);
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
        this._Open(200, 48 + this.GetHeight_Text(6) / 2, 112, 48);
    }

    CCompWindow() {
    }
}

