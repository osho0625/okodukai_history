/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CStatusWin
extends CWindow {
    static final int TEXT_COLUMNS = 12;
    static final int TEXT_LINES = 10;
    static final int WIN_XPOS = 48;
    static final int WIN_YPOS = 16;
    static final int WIN_WIDTH = 208;
    static final int WIN_HEIGHT = 248;
    private ARpg m_App;
    private int m_nChrNo;

    public void Create(ARpg aRpg, int n) {
        this.m_App = aRpg;
        this.m_nChrNo = n;
    }

    public void DrawMessage() {
        CChrParam cChrParam = Vari.GetChrPrm(this.m_nChrNo);
        Color color = Def.GetColor(0);
        String string = new String();
        this.DrawFont(8, this.GetYPos(0), cChrParam.GetName(), color, 16);
        string = "\uff2c\uff36";
        string = string + Calc3D.NumberString(cChrParam.m_nLV, 2);
        this.DrawFont(136, this.GetYPos(0), string, color, 16);
        string = "\uff28\uff30\u3000";
        string = string + Calc3D.NumberString(cChrParam.m_nHP, 4);
        string = string + "\uff0f";
        string = string + Calc3D.NumberString(cChrParam.GetMaxHP(), 4);
        this.DrawFont(8, this.GetYPos(1), string, color, 16);
        string = "\uff2d\uff30\u3000";
        string = string + Calc3D.NumberString(cChrParam.m_nMP, 4);
        string = string + "\uff0f";
        string = string + Calc3D.NumberString(cChrParam.GetMaxMP(), 4);
        this.DrawFont(8, this.GetYPos(2), string, color, 16);
        string = "\u653b\u6483\u529b\u3000";
        string = string + Calc3D.NumberString(cChrParam.GetStr_Base(), 3);
        string = string + "\uff08";
        string = string + Calc3D.NumberString(cChrParam.GetStr_Base() + cChrParam.GetStr_Item(), 3);
        string = string + "\uff09";
        this.DrawFont(8, this.GetYPos(3), string, color, 16);
        string = "\u7cbe\u795e\u529b\u3000";
        string = string + Calc3D.NumberString(cChrParam.GetInt_Base(), 3);
        string = string + "\uff08";
        string = string + Calc3D.NumberString(cChrParam.GetInt_Base() + cChrParam.GetInt_Item(), 3);
        string = string + "\uff09";
        this.DrawFont(8, this.GetYPos(4), string, color, 16);
        string = "\u9632\u5fa1\u529b\u3000";
        string = string + Calc3D.NumberString(cChrParam.GetDef_Base(), 3);
        string = string + "\uff08";
        string = string + Calc3D.NumberString(cChrParam.GetDef_Base() + cChrParam.GetDef_Item(), 3);
        string = string + "\uff09";
        this.DrawFont(8, this.GetYPos(5), string, color, 16);
        string = "\u7d20\u65e9\u3055\u3000";
        string = string + Calc3D.NumberString(cChrParam.GetAgi_Base(), 3);
        string = string + "\uff08";
        string = string + Calc3D.NumberString(cChrParam.GetAgi_Base() + cChrParam.GetAgi_Item(), 3);
        string = string + "\uff09";
        this.DrawFont(8, this.GetYPos(6), string, color, 16);
        string = "\u5668\u7528\u3055\u3000";
        string = string + Calc3D.NumberString(cChrParam.GetDex_Base(), 3);
        string = string + "\uff08";
        string = string + Calc3D.NumberString(cChrParam.GetDex_Base() + cChrParam.GetDex_Item(), 3);
        string = string + "\uff09";
        this.DrawFont(8, this.GetYPos(7), string, color, 16);
        string = "\uff25\uff38\uff30\u3000\u3000";
        string = string + Calc3D.NumberString(cChrParam.m_nExp, 7);
        this.DrawFont(8, this.GetYPos(8), string, color, 16);
        string = "\u6b21\uff2c\uff36\u3000\u3000";
        string = string + Calc3D.NumberString(CChrParam.CalcNextExp(cChrParam.m_nLV), 7);
        this.DrawFont(8, this.GetYPos(9), string, color, 16);
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

    CStatusWin() {
    }

    public void OpenWindow() {
        int n = 152;
        int n2 = 140;
        this._Create(this.m_App, Vari.m_WinColor, 208, 248, 4);
        this._Open(n, n2, 48, 16);
    }
}

