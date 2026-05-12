/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CEquipPrmWin
extends CWindow {
    static final int WIN_HEIGHT = 32;
    static final int WIN_YPOS = 152;
    static final int PRM_NONE = 0;
    static final int PRM_NOEQUIP = 1;
    static final int PRM_EQUIP = 2;
    static final int PRM_DOWN = 3;
    static final int PRM_UP = 4;
    static final int PRM_EQUAL = 5;
    static final String[] DISP_PARAM = new String[]{"\u3000", "\u00d7", "\u25cb", "\u2193", "\u2191", "\uff1d"};
    private ARpg m_App;
    private int m_nWidth;
    private int m_nXPos;
    private CItemData m_Item;
    private boolean m_bCount;

    public void CountOff() {
        this.m_bCount = false;
        this.SetWindowSize();
    }

    public int CheckPrm(int n) {
        if (this.m_Item == null) {
            return 0;
        }
        int n2 = this.m_Item.m_nKind;
        if (n2 == 1 || n2 == 2 || n2 == 14) {
            return 0;
        }
        if (n2 == 13) {
            if (CGemData.IsEquip(n, this.m_Item.m_nWorkNo) == 0) {
                return 2;
            }
            return 1;
        }
        int n3 = this.m_Item.m_nEquip;
        int n4 = 1 << n;
        if ((n3 & n4) == 0) {
            return 1;
        }
        if (n2 == 11 || n2 == 12) {
            return 2;
        }
        CChrParam cChrParam = Vari.GetChrPrm(n);
        if (n2 == 3 || n2 == 4 || n2 == 5) {
            n3 = cChrParam.m_anEquip[0];
            if (n3 == -1) {
                return 4;
            }
            CItemData cItemData = Vari.GetItemData(n3);
            int n5 = this.m_Item.m_nStr - cItemData.m_nStr;
            if (n5 > 0) {
                return 4;
            }
            if (n5 < 0) {
                return 3;
            }
            return 5;
        }
        if (n2 == 6 || n2 == 7) {
            n3 = cChrParam.m_anEquip[1];
            if (n3 == -1) {
                return 4;
            }
            CItemData cItemData = Vari.GetItemData(n3);
            int n6 = this.m_Item.m_nDef - cItemData.m_nDef;
            if (n6 > 0) {
                return 4;
            }
            if (n6 < 0) {
                return 3;
            }
            return 5;
        }
        if (n2 == 8 || n2 == 9) {
            n3 = cChrParam.m_anEquip[2];
            if (n3 == -1) {
                return 4;
            }
            CItemData cItemData = Vari.GetItemData(n3);
            int n7 = this.m_Item.m_nDef - cItemData.m_nDef;
            if (n7 > 0) {
                return 4;
            }
            if (n7 < 0) {
                return 3;
            }
            return 5;
        }
        return 0;
    }

    public void Create(ARpg aRpg) {
        this.m_App = aRpg;
        this.m_bCount = true;
        this.SetWindowSize();
    }

    CEquipPrmWin() {
    }

    public void SetItem(CItemData cItemData) {
        this.m_Item = cItemData;
    }

    public void SetWindowSize() {
        int n = Vari.GetPartyNum();
        this.m_nWidth = n * 32 + (n - 1) * 8 + 16;
        if (this.m_bCount) {
            this.m_nWidth += 16;
        }
        this.m_nXPos = 400 - this.m_nWidth - 8;
        this._Create(this.m_App, Vari.m_WinColor, this.m_nWidth, 32, 4);
    }

    public void DrawMessage() {
        int n = 0;
        if (this.m_bCount) {
            n = 16;
            if (this.m_Item != null) {
                this.DrawFont(8, 8, Def.GetZenSujiCode(this.m_App.m_Play.GetItem2(this.m_Item.m_nWorkNo)), Color.white, 16);
            }
        }
        int n2 = 0;
        while (n2 < Vari.GetPartyNum()) {
            int n3 = Vari.GetPartyWork(n2);
            int n4 = n2 * 40 + 8 + n;
            this.m_App.DrawImage(28 + n3, n4 + this.m_nXPos, 160);
            this.DrawFont(n4 + 16, 8, DISP_PARAM[this.CheckPrm(n3)], Color.white, 16);
            ++n2;
        }
    }

    public void CloseWindow() {
        this._Close();
        this.m_Item = null;
    }

    public void Run() {
        boolean bl = this._Move();
        this._Draw();
        if (bl) {
            this.DrawMessage();
        }
    }

    public void OpenWindow() {
        this._Open(this.m_nXPos + this.m_nWidth / 2, 168, this.m_nXPos, 152);
    }

    public void CountOn() {
        this.m_bCount = true;
        this.SetWindowSize();
    }
}

