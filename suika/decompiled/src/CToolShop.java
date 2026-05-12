/*
 * Decompiled with CFR 0.152.
 */
class CToolShop
extends CBaseShop {
    static final int MENU_XPOS = 296;
    static final int MENU_YPOS = 48;
    static final int LIST_XPOS = 8;
    static final int LIST_YPOS = 8;
    static final int MAX_LIST_NUM = 7;
    static final int ITEMNAME_KETA = 7;
    static final int MONEY_KETA = 6;
    static final int MONEY_KETA_S = 5;
    static final int LIST_WIDTH = 224;
    private int[] m_anList;
    private int m_nListNum;
    private CMenuWindow m_Menu = new CMenuWindow();
    private CMenuWindow m_ListMenu = new CMenuWindow();
    private CMenuWindowLR m_SellList = new CMenuWindowLR();
    private CHelpWindow m_Help = new CHelpWindow();
    private CEquipPrmWin m_PrmW = new CEquipPrmWin();

    public void CreateSellList() {
        int n = this.m_Play.GetAllItemKind();
        int n2 = this.m_SellList.GetSelectNoDisp();
        this.m_SellList.CreateLR(this.m_App, 7, 15);
        this.m_SellList.SetSelectNo(n2);
        this.m_SellList.SetFlag(1);
        int n3 = 0;
        while (n3 < n) {
            int n4 = this.m_Play.GetSortItemNum(n3);
            if (n4 < 0) break;
            CItemData cItemData = Vari.GetItemData(n4);
            String string = new String(cItemData.m_strName);
            int n5 = string.length();
            string = string + "\u00d7";
            string = string + Calc3D.NumberString(this.m_Play.GetItem(n4), 1);
            int n6 = 0;
            while (n6 < 7 - n5) {
                string = string + "\u3000";
                ++n6;
            }
            string = string + "\u3000";
            string = cItemData.IsSell() ? string + Calc3D.NumberString(this.m_Play.GetSellPrice(cItemData.m_nGold), 5) : string + "\u3000\u58f2\u308c\u306a\u3044";
            this.m_SellList.SetMenuTextLR(n3, string);
            ++n3;
        }
        this.m_SellList.MakeList();
    }

    public void SetHelp_Buy() {
        int n = this.m_ListMenu.GetSelectNo();
        CItemData cItemData = Vari.GetItemData(this.m_anList[n]);
        this.m_Help.SetHelp(Vari.GetHelpData(cItemData.m_nHelp));
        this.m_PrmW.SetItem(cItemData);
    }

    public void Create(ARpg aRpg, String string, int[] nArray) {
        this._Create(aRpg, string);
        this.m_anList = new int[nArray.length];
        this.m_nListNum = 0;
        int n = 0;
        while (n < nArray.length) {
            this.m_anList[n] = nArray[n];
            if (this.m_anList[n] != 0) {
                ++this.m_nListNum;
            }
            ++n;
        }
        this.m_Menu.Create(aRpg, 3);
        this.m_Menu.SetFlag(1);
        this.m_Menu.SetMenuText(0, "\u8cb7\u3044\u306b\u304d\u305f");
        this.m_Menu.SetMenuText(1, "\u58f2\u308a\u306b\u304d\u305f");
        this.m_Menu.SetMenuText(2, "\u3084\u3081\u308b");
    }

    public void NoSellItem() {
        this.DrawMessage(this.m_strName + "\u300c\u58f2\u308c\u308b\u3082\u306e\u304c\u306a\u3044\u3088\u3046\u3067\u3059\u3002");
    }

    public void SellMain() {
        int n = this.m_Play.GetAllItemKind();
        if (n == 0) {
            this.NoSellItem();
            return;
        }
        this.CreateSellList();
        this.m_App.EntryWindow(this.m_SellList);
        this.m_SellList.OpenWindow(8, 8);
        this.m_Help.OpenWindow();
        this.m_PrmW.CountOff();
        this.m_PrmW.OpenWindow();
        this.m_App.LoopFrame(4);
        do {
            this.m_App.MainFrame();
            this.SetHelp_Sell();
        } while ((!this.m_SellList.IsOK() || !this.SellSelect()) && !this.m_SellList.IsCancel());
        this.m_Help.CloseWindow();
        this.m_PrmW.CloseWindow();
        this.m_SellList.CloseWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(this.m_SellList);
    }

    public void CreateList() {
        this.m_ListMenu.Create(this.m_App, this.m_nListNum);
        this.m_ListMenu.SetFlag(1);
        int n = 0;
        while (n < this.m_nListNum) {
            CItemData cItemData = Vari.GetItemData(this.m_anList[n]);
            String string = new String(cItemData.m_strName);
            int n2 = string.length();
            int n3 = 0;
            while (n3 < 7 - n2) {
                string = string + "\u3000";
                ++n3;
            }
            string = string + "\u3000";
            string = string + Calc3D.NumberString(cItemData.m_nGold, 6);
            this.m_ListMenu.SetMenuText(n, string);
            ++n;
        }
        this.m_App.EntryWindow(this.m_Menu);
        this.m_App.EntryWindow(this.m_ListMenu);
        this.m_App.OpenMoneyWindow();
        this.m_Help.Create(this.m_App, 188);
        this.m_App.EntryWindow(this.m_Help);
        this.m_PrmW.Create(this.m_App);
        this.m_App.EntryWindow(this.m_PrmW);
    }

    public boolean SellSelect() {
        int n = this.m_SellList.GetSelectNo();
        int n2 = this.m_Play.GetSortItemNum(n);
        CItemData cItemData = Vari.GetItemData(n2);
        if (!cItemData.IsSell()) {
            this.NotSell();
            return false;
        }
        int n3 = this.m_Play.GetSellPrice(cItemData.m_nGold);
        int n4 = this.m_Play.GetItem(n2);
        this.m_SellList.SetFlag(2);
        CNumWindow cNumWindow = new CNumWindow();
        cNumWindow.Create(this.m_App, cItemData.m_strName, n3, n4);
        this.m_App.EntryWindow(cNumWindow);
        cNumWindow.OpenWindow();
        this.m_App.LoopFrame(4);
        int n5 = cNumWindow.LoopFrame();
        this.m_App.ClearKey();
        cNumWindow.CloseWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(cNumWindow);
        this.m_SellList.ResetFlag(2);
        if (n5 == 0) {
            return true;
        }
        String string = new String();
        string = string + this.m_strName + "\u300c";
        string = string + cItemData.m_strName;
        string = string + "\u3092";
        string = string + Calc3D.NumberString(n5, 1);
        string = string + "\u500b\u3067\u3059\u306d\u3002@R\u3000\u3000\u3000\u3000\u305d\u308c\u306a\u3089\u3001";
        string = string + Calc3D.NumberString2(n3 * n5, 7);
        string = string + "\uff27\u3067@R\u3000\u3000\u3000\u3000\u304a\u5f15\u53d6\u308a\u3044\u305f\u3057\u307e\u3059\u304c\uff1f";
        this.DrawMessage(string);
        this.m_SellList.SetFlag(2);
        int n6 = this.YesNo();
        this.m_SellList.ResetFlag(2);
        if (n6 == 1 || n6 == -1) {
            string = this.m_strName + "\u300c\u305d\u3046\u3067\u3059\u304b\u3002@R\u3000\u3000\u3000\u3000\u305d\u308c\u306f\u6b8b\u5ff5\u3067\u3059\u3002";
            this.DrawMessage(string);
            return false;
        }
        string = this.m_strName + "\u300c\u3069\u3046\u3082\u3001\u3042\u308a\u304c\u3068\u3046\u3054\u3056\u3044\u307e\u3059\u3002";
        this.DrawMessage(string);
        this.m_Play.AddItem(n2, -n5);
        this.m_Play.AddGold(n3 * n5);
        int n7 = this.m_Play.GetAllItemKind();
        if (n7 == 0) {
            this.NoSellItem();
            return true;
        }
        this.CreateSellList();
        return false;
    }

    public void DrawMessage(String string) {
        string = string + " ";
        this.m_ListMenu.SetFlag(4);
        this.m_SellList.SetFlag(4);
        this.m_App.m_MessWin.SetMessage(string);
        this.m_App.m_MessWin.WaitMessage();
        this.m_ListMenu.ResetFlag(4);
        this.m_SellList.ResetFlag(4);
    }

    public void Main() {
        int n;
        String string = new String();
        string = string + this.m_strName;
        string = string + "\u300c\u3044\u3089\u3063\u3057\u3083\u3044\u307e\u305b\u3002@R\u3000\u3000\u3000\u3000\u3053\u3053\u306f";
        string = string + this.m_strName;
        string = string + "\u3067\u3059\u3002";
        this._Hello(string);
        this.CreateList();
        this.m_App.SetStopDisplay();
        while ((n = this.BuySell()) != 2) {
            if (n == 0) {
                this.BuyMain();
                continue;
            }
            this.SellMain();
        }
        this.m_App.ResetStopDisplay();
        this.m_App.m_MessWin.CloseWindow();
        this.m_App.CloseMoneyWindow();
        this.m_Menu.CloseWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(this.m_Menu);
        this.m_App.ReleaseWindow(this.m_ListMenu);
        this.m_App.ReleaseWindow(this.m_Help);
        this.m_App.ReleaseWindow(this.m_PrmW);
        this.Release();
    }

    public void BuyMain() {
        this.m_ListMenu.OpenWindow(8, 8);
        this.m_Help.OpenWindow();
        this.m_PrmW.CountOn();
        this.m_PrmW.OpenWindow();
        this.m_App.LoopFrame(4);
        do {
            this.m_App.MainFrame();
            this.SetHelp_Buy();
            if (!this.m_ListMenu.IsOK()) continue;
            this.BuySelect();
        } while (!this.m_ListMenu.IsCancel());
        this.m_Help.CloseWindow();
        this.m_PrmW.CloseWindow();
        this.m_ListMenu.CloseWindow();
        this.m_App.LoopFrame(4);
    }

    public int BuySell() {
        int n = 2;
        this.m_Menu.ResetFlag(2);
        if (this.m_Menu.GetMode() == 0) {
            this.m_Menu.OpenWindow(296, 48);
            this.m_App.LoopFrame(4);
        }
        do {
            this.m_App.MainFrame();
            if (!this.m_Menu.IsOK()) continue;
            n = this.m_Menu.GetSelectNo();
            break;
        } while (!this.m_Menu.IsCancel());
        this.m_Menu.SetFlag(2);
        return n;
    }

    CToolShop() {
    }

    public void SetHelp_Sell() {
        int n = this.m_SellList.GetSelectNo();
        int n2 = this.m_Play.GetSortItemNum(n);
        if (n2 == -1) {
            this.m_Help.SetHelp(Vari.GetHelpData(0));
            this.m_PrmW.SetItem(null);
            return;
        }
        CItemData cItemData = Vari.GetItemData(n2);
        this.m_Help.SetHelp(Vari.GetHelpData(cItemData.m_nHelp));
        this.m_PrmW.SetItem(cItemData);
    }

    public void BuySelect() {
        Object object;
        int n = this.m_ListMenu.GetSelectNo();
        int n2 = this.m_anList[n];
        CItemData cItemData = Vari.GetItemData(n2);
        int n3 = cItemData.m_nGold;
        int n4 = this.m_Play.GetGold() / n3;
        int n5 = 1;
        int n6 = 9 - this.m_Play.GetItem2(n2);
        if (n4 > n6) {
            n4 = n6;
        }
        if (n4 >= 1) {
            this.m_ListMenu.SetFlag(2);
            object = new CNumWindow();
            ((CNumWindow)object).Create(this.m_App, cItemData.m_strName, n3, n4);
            this.m_App.EntryWindow((CWindow)object);
            ((CNumWindow)object).OpenWindow();
            this.m_App.LoopFrame(4);
            n5 = ((CNumWindow)object).LoopFrame();
            ((CNumWindow)object).CloseWindow();
            this.m_App.LoopFrame(4);
            this.m_App.ReleaseWindow((CWindow)object);
            this.m_ListMenu.ResetFlag(2);
        }
        if (n5 == 0) {
            return;
        }
        object = new String();
        if (this.m_Play.GetGold() < cItemData.m_nGold) {
            object = (String)object + this.m_strName;
            object = (String)object + "\u300c\u7533\u3057\u8a33\u3042\u308a\u307e\u305b\u3093\u304c\u3001@R";
            object = (String)object + "\u3000\u3000\u3000\u3000\u304a\u91d1\u304c\u8db3\u308a\u306a\u3044\u3088\u3046\u3067\u3059\u3002";
            this.DrawMessage((String)object);
            return;
        }
        if (this.m_Play.GetItem2(n2) >= 9) {
            object = this.m_strName;
            object = (String)object + "\u300c\u7533\u3057\u8a33\u3042\u308a\u307e\u305b\u3093\u304c\u3001@R";
            object = (String)object + "\u3000\u3000\u3000\u3000\u3053\u308c\u4ee5\u4e0a\u306f\u6301\u3061\u304d\u308c\u306a\u3044\u3088\u3046\u3067\u3059\u3002@S";
            this.DrawMessage((String)object);
            return;
        }
        this.m_Play.AddItem(cItemData.m_nWorkNo, n5);
        this.m_Play.AddGold(-cItemData.m_nGold * n5);
        object = (String)object + this.m_strName + "\u300c";
        object = (String)object + cItemData.m_strName;
        object = (String)object + "\u3067\u3059\u306d\u3002@R\u3000\u3000\u3000\u3000\u3042\u308a\u304c\u3068\u3046\u3054\u3056\u3044\u307e\u3059\u3002@R";
        object = (String)object + "\u3000\u3000\u3000\u3000\u307b\u304b\u306b\u3082\u3001\u306a\u306b\u304b@R\u3000\u3000\u3000\u3000\u304a\u8cb7\u3044\u306b\u306a\u308a\u307e\u3059\u304b\uff1f";
        this.DrawMessage((String)object);
    }

    public void NotSell() {
        String string = new String();
        string = string + this.m_strName + "\u300c";
        string = string + "\u7533\u3057\u8a33\u3042\u308a\u307e\u305b\u3093\u304c\u3001\u305d\u306e@R\u3000\u3000\u3000\u3000\u30a2\u30a4\u30c6\u30e0\u306f\u304a\u5f15\u53d6\u308a\u3067\u304d\u307e\u305b\u3093\u3002";
        this.DrawMessage(string);
    }
}

