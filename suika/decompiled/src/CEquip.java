/*
 * Decompiled with CFR 0.152.
 */
class CEquip {
    static final int MAX_EQUIP = 5;
    static final int WIN_XPOS = 48;
    static final int WIN_YPOS = 40;
    static final int ITEM_XPOS = 200;
    static final int ITEM_YPOS = 56;
    private ARpg m_App;
    private int m_nChrNo;
    private CEquipMenu m_List = new CEquipMenu();
    private CEquipList m_Item = new CEquipList();

    public void Create(ARpg aRpg, int n) {
        this.m_App = aRpg;
        this.m_nChrNo = n;
        this.m_List.SetFlag(1);
        this.m_List.Create(this.m_App, 6);
        this.m_Item.SetHelpWindowCtrl(true);
        this.MakeList();
        this.m_List.SetSelectNo(1);
    }

    CEquip() {
    }

    private void CloseWindow() {
        this.m_List.CloseWindow();
        Vari.m_Help.CloseWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(this.m_List);
        this.m_App.ReleaseWindow(Vari.m_Help);
    }

    public void MakeList() {
        CItemData cItemData;
        CChrParam cChrParam = Vari.GetChrPrm(this.m_nChrNo);
        String string = new String();
        this.m_List.SetChrNo(this.m_nChrNo);
        this.m_List.SetMenuFlag(0, 2);
        this.m_List.SetMenuText(0, cChrParam.GetName());
        string = "\u6b66\u5668\uff1a";
        if (cChrParam.m_anEquip[0] == -1) {
            string = string + "\u306a\u3057\u3000\u3000\u3000\u3000\u3000";
        } else {
            cItemData = Vari.GetItemData(cChrParam.m_anEquip[0]);
            string = string + cItemData.GetName7();
        }
        this.m_List.SetMenuText(1, string);
        string = "\u9632\u5177\uff1a";
        if (cChrParam.m_anEquip[1] == -1) {
            string = string + "\u306a\u3057\u3000\u3000\u3000\u3000\u3000";
        } else {
            cItemData = Vari.GetItemData(cChrParam.m_anEquip[1]);
            string = string + cItemData.GetName7();
        }
        this.m_List.SetMenuText(2, string);
        string = this.m_nChrNo != 2 ? "\u76fe\u3000\uff1a" : "\u624b\u888b\uff1a";
        if (cChrParam.m_anEquip[2] == -1) {
            string = string + "\u306a\u3057\u3000\u3000\u3000\u3000\u3000";
        } else {
            cItemData = Vari.GetItemData(cChrParam.m_anEquip[2]);
            string = string + cItemData.GetName7();
        }
        this.m_List.SetMenuText(3, string);
        string = "\u88c5\u98fe\uff1a";
        if (cChrParam.m_anEquip[3] == -1) {
            string = string + "\u306a\u3057\u3000\u3000\u3000\u3000\u3000";
        } else {
            cItemData = Vari.GetItemData(cChrParam.m_anEquip[3]);
            string = string + cItemData.GetName7();
        }
        this.m_List.SetMenuText(4, string);
        string = "\u88c5\u98fe\uff1a";
        if (cChrParam.m_anEquip[4] == -1) {
            string = string + "\u306a\u3057\u3000\u3000\u3000\u3000\u3000";
        } else {
            cItemData = Vari.GetItemData(cChrParam.m_anEquip[4]);
            string = string + cItemData.GetName7();
        }
        this.m_List.SetMenuText(5, string);
    }

    public void Run() {
        int n;
        this.OpenWindow();
        while ((n = this.m_List.LoopFrame()) != -1) {
            this.m_List.SetFlag(2);
            this.m_Item.CreateList(this.m_App, this, this.m_nChrNo, n - 1);
            this.m_Item.Run(200, 56);
            this.m_List.ResetFlag(2);
        }
        this.CloseWindow();
    }

    private void OpenWindow() {
        this.MakeList();
        Vari.m_Help.Create(this.m_App, 8);
        this.m_App.EntryWindow(this.m_List);
        this.m_App.EntryWindow(Vari.m_Help);
        this.m_List.OpenWindow(48, 40);
        Vari.m_Help.OpenWindow();
    }
}

