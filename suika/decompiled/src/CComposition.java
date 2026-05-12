/*
 * Decompiled with CFR 0.152.
 */
class CComposition
extends CBaseShop {
    static final int MAX_LIST = 7;
    static final int ITEMNAME_KETA = 7;
    static final int MONEY_KETA = 6;
    static final int LIST_XPOS = 8;
    static final int LIST_YPOS = 8;
    private int m_nListNum;
    private CMenuWindowLR m_ListMenu = new CMenuWindowLR();
    private CHelpWindow m_Help = new CHelpWindow();
    private CEquipPrmWin m_PrmW = new CEquipPrmWin();
    private CCompWindow m_CompW = new CCompWindow();

    public void SetHelp_Buy() {
        int n = this.m_ListMenu.GetSelectNo();
        CItemData cItemData = Vari.GetItemData(CCompTable.GetItem(n));
        this.m_Help.SetHelp(Vari.GetHelpData(cItemData.m_nHelp));
        this.m_PrmW.SetItem(cItemData);
    }

    public void Create(ARpg aRpg) {
        this.m_App = aRpg;
        this.m_nListNum = 14;
        this._Create(aRpg, "\u5408\u6210\u5c4b");
    }

    public void CreateList() {
        this.m_ListMenu.CreateLR(this.m_App, 7, 7);
        this.m_ListMenu.SetFlag(1);
        int n = 0;
        while (n < this.m_nListNum) {
            CItemData cItemData = Vari.GetItemData(CCompTable.GetItem(n));
            String string = new String(cItemData.m_strName);
            int n2 = string.length();
            int n3 = 0;
            while (n3 < 7 - n2) {
                string = string + "\u3000";
                ++n3;
            }
            string = string + "\u3000";
            string = string + Calc3D.NumberString(CCompTable.GetGold(n), 6);
            this.m_ListMenu.SetMenuTextLR(n, string);
            ++n;
        }
        this.m_ListMenu.MakeList();
        this.m_App.EntryWindow(this.m_ListMenu);
        this.m_App.OpenMoneyWindow();
        this.m_Help.Create(this.m_App, 188);
        this.m_App.EntryWindow(this.m_Help);
        this.m_PrmW.Create(this.m_App);
        this.m_App.EntryWindow(this.m_PrmW);
    }

    public void DrawMessage(String string) {
        this.m_ListMenu.SetFlag(4);
        this.DrawMessage2(string);
        this.m_ListMenu.ResetFlag(4);
    }

    public void Release() {
    }

    public void Main() {
        String string = new String();
        string = string + this.m_strName;
        string = string + "\u300c\u3044\u3089\u3063\u3057\u3083\u3044\u307e\u305b\u3002@R\u3000\u3000\u3000\u3000\u3053\u3053\u306f";
        string = string + this.m_strName;
        string = string + "\u3067\u3059\u3002";
        this._Hello(string);
        this.CreateList();
        this.m_App.SetStopDisplay();
        this.BuyMain();
        this.m_App.ResetStopDisplay();
        this.m_App.m_MessWin.CloseWindow();
        this.m_App.CloseMoneyWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(this.m_ListMenu);
        this.m_App.ReleaseWindow(this.m_Help);
        this.m_App.ReleaseWindow(this.m_PrmW);
        this.Release();
    }

    public void BuyMain() {
        this.m_ListMenu.OpenWindow(8, 8);
        this.m_Help.OpenWindow();
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

    public void DrawMessage2(String string) {
        string = string + " ";
        this.m_App.m_MessWin.SetMessage(string);
        this.m_App.m_MessWin.WaitMessage();
    }

    CComposition() {
    }

    public void BuySelect() {
        String string = new String();
        int n = this.m_ListMenu.GetSelectNo();
        int n2 = CCompTable.GetItem(n);
        CItemData cItemData = Vari.GetItemData(n2);
        int n3 = CCompTable.GetGold(n);
        this.m_ListMenu.SetFlag(4);
        this.m_CompW.Create(this.m_App, n);
        this.m_App.EntryWindow(this.m_CompW);
        this.m_CompW.OpenWindow();
        this.m_App.LoopFrame(4);
        if (this.m_Play.GetGold() < n3) {
            string = this.m_strName;
            string = string + "\u300c\u7533\u3057\u8a33\u3042\u308a\u307e\u305b\u3093\u304c\u3001@R";
            string = string + "\u3000\u3000\u3000\u3000\u304a\u91d1\u304c\u8db3\u308a\u306a\u3044\u3088\u3046\u3067\u3059\u3002@S";
            this.DrawMessage2(string);
        } else if (this.m_App.m_Play.GetItem2(n2) >= 9) {
            string = this.m_strName;
            string = string + "\u300c\u7533\u3057\u8a33\u3042\u308a\u307e\u305b\u3093\u304c\u3001@R";
            string = string + "\u3000\u3000\u3000\u3000\u3053\u308c\u4ee5\u4e0a\u306f\u6301\u3061\u304d\u308c\u306a\u3044\u3088\u3046\u3067\u3059\u3002@S";
            this.DrawMessage2(string);
        } else if (CCompTable.IsPossession(n)) {
            string = this.m_strName;
            string = string + "\u300c\u5408\u6210\u306b\u306f";
            string = string + Calc3D.NumberString2(n3, 5);
            string = string + "\uff27\u5fc5\u8981\u3067\u3059\u3002@R";
            string = string + "\u3000\u3000\u3000\u3000\u5408\u6210\u3057\u307e\u3059\u304b\uff1f";
            this.DrawMessage2(string);
            if (this.YesNo() == 0) {
                this.m_Play.AddGold(-n3);
                string = "\u3000\u3000\u3000\u3000\u305d\u308c\u3067\u306f\u3001\u5408\u6210\u3092\u59cb\u3081\u307e\u3059\u3002@R";
                string = string + "\u3000\u3000\u3000\u3000\u3050\u306b\u3050\u306b\u3050\u306b\u3050\u306b\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb@S";
                this.DrawMessage2(string);
                CCompTable.UseItem(n);
                string = "\u3000\u3000\u3000\u3000\u3069\u3046\u305e\u3001\u300c@y";
                string = string + cItemData.m_strName;
                string = string + "@w\u300d\u3067\u3059\u3002";
                this.DrawMessage2(string);
            } else {
                string = "\u3000\u3000\u3000\u3000\u305d\u3046\u3067\u3059\u304b\u3001\u6b8b\u5ff5\u3067\u3059\u3002 ";
                this.DrawMessage2(string);
            }
        } else {
            string = this.m_strName;
            string = string + "\u300c\u7533\u3057\u8a33\u3042\u308a\u307e\u305b\u3093\u304c\u3001@R";
            string = string + "\u3000\u3000\u3000\u3000\u5408\u6210\u306b\u5fc5\u8981\u306a\u30a2\u30a4\u30c6\u30e0\u304c\u8db3\u308a\u307e\u305b\u3093\u3002@S ";
            this.DrawMessage2(string);
        }
        this.m_CompW.CloseWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(this.m_CompW);
        this.m_ListMenu.ResetFlag(4);
    }
}

