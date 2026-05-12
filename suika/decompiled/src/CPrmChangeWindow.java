/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CPrmChangeWindow
extends CWindow {
    static final int WIN_WIDTH = 112;
    static final int WIN_HEIGHT = 128;
    static final String[] PRM_TABLE = new String[]{"\u653b\u6483\u529b", "\u7cbe\u795e\u529b", "\u9632\u5fa1\u529b", "\u7d20\u65e9\u3055", "\u5668\u7528\u3055"};
    private ARpg m_App;
    private CEquipList m_List;
    private int m_nXPos;
    private int m_nYPos;
    private CItemData m_NowItem;
    private int m_nNowItem;

    public void Create(ARpg aRpg, CEquipList cEquipList, int n) {
        this.m_App = aRpg;
        this.m_List = cEquipList;
        this.m_nNowItem = n;
        this.m_NowItem = this.m_nNowItem < 0 ? null : Vari.GetItemData(this.m_nNowItem);
        this._Create(aRpg, Vari.m_WinColor, 112, 128, 4);
    }

    public void DrawMessage() {
        String string = new String();
        int n = this.m_List.GetSelectItem();
        CItemData cItemData = null;
        if (n >= 0) {
            cItemData = Vari.GetItemData(n);
        }
        int n2 = 0;
        do {
            Color color;
            string = PRM_TABLE[n2];
            int n3 = this.GetNowItemPrm(cItemData, n2) - this.GetNowItemPrm(this.m_NowItem, n2);
            if (n3 >= 0) {
                color = Def.GetColor(0);
                string = string + "\uff0b";
                string = string + Calc3D.NumberString(n3, 2);
            } else {
                color = Def.GetColor(2);
                string = string + "\uff0d";
                string = string + Calc3D.NumberString(-n3, 2);
            }
            this.DrawFont(8, this.GetYPos(n2), string, color, 16);
        } while (++n2 < 5);
    }

    public void CloseWindow() {
        this._Close();
    }

    CPrmChangeWindow() {
    }

    public void Run() {
        boolean bl = this._Move();
        this._Draw();
        if (bl) {
            this.DrawMessage();
        }
    }

    public int GetNowItemPrm(CItemData cItemData, int n) {
        if (cItemData == null) {
            return 0;
        }
        switch (n) {
            case 0: {
                return cItemData.m_nStr;
            }
            case 1: {
                return cItemData.m_nInt;
            }
            case 2: {
                return cItemData.m_nDef;
            }
            case 3: {
                return cItemData.m_nAgi;
            }
            case 4: {
                return cItemData.m_nDex;
            }
        }
        return 0;
    }

    public void OpenWindow(int n, int n2) {
        this.m_nXPos = n;
        this.m_nYPos = n2;
        this._Open(this.m_nXPos + 56, this.m_nYPos + 64, this.m_nXPos, this.m_nYPos);
    }
}

