/*
 * Decompiled with CFR 0.152.
 */
class CInShop
extends CBaseShop {
    private int m_nPrice;

    CInShop() {
    }

    public void Create(ARpg aRpg, int n) {
        this._Create(aRpg, "");
        this.m_nPrice = n;
    }

    public void Hello() {
        String string = new String();
        string = "\u5bbf\u5c4b\u300c\u65c5\u4eba\u306e\u5bbf\u5c4b\u3078\u3001\u3088\u3046\u3053\u305d\u3002@R";
        string = string + "\u3000\u3000\u3000\u4e00\u6669\u3001";
        string = string + Calc3D.NumberString2(this.m_nPrice, 5);
        string = string + "\uff27\u3067\u3059\u304c\u3001@R";
        string = string + "\u3000\u3000\u3000\u304a\u6cca\u308a\u306b\u306a\u308a\u307e\u3059\u304b\uff1f ";
        this.m_App.m_MessWin.OpenWindow(1);
        this.m_App.LoopFrame(4);
        this.m_App.m_MessWin.SetMessage(string);
        this.m_App.m_MessWin.WaitMessage();
    }

    public void Main() {
        this.Hello();
        this.m_App.OpenMoneyWindow();
        int n = this.YesNo();
        if (n == 0) {
            if (this.m_Play.GetGold() >= this.m_nPrice) {
                this.In();
            } else {
                this.m_App.m_MessWin.SetMessage("\u5bbf\u5c4b\u300c\u6b8b\u5ff5\u306a\u304c\u3089\u3001\u304a\u91d1\u304c\u8db3\u308a\u306a\u3044\u3088\u3046\u3067\u3059\u3002@S ");
                this.m_App.m_MessWin.WaitMessage();
            }
        } else {
            this.m_App.m_MessWin.SetMessage("\u5bbf\u5c4b\u300c\u3055\u3088\u3046\u306a\u3089\u3001\u65c5\u306e\u4eba\u3002@R\u3000\u3000\u3000\u307e\u305f\u3001\u304a\u305f\u3061\u3088\u308a\u304f\u3060\u3055\u3044\u3002@S ");
            this.m_App.m_MessWin.WaitMessage();
        }
        this.m_App.m_MessWin.CloseWindow();
        this.m_App.CloseMoneyWindow();
        this.m_App.LoopFrame(4);
        this.Release();
    }

    public void In() {
        this.m_Play.SetGold(this.m_Play.GetGold() - this.m_nPrice);
        this.m_App.m_MessWin.SetMessage("\u5bbf\u5c4b\u300c\u3054\u3086\u3063\u304f\u308a\u304a\u4f11\u307f\u304f\u3060\u3055\u3044\u3002@S ");
        this.m_App.m_MessWin.WaitMessage();
        this.m_App.m_MessWin.CloseWindow();
        this.m_App.CloseMoneyWindow();
        this.m_App.LoopFrame(4);
        this.m_App.m_Fade.WhiteIn(8);
        this.m_App.PlaySeG(22);
        this.m_App.LoopFrame(8);
        this.m_App.m_Play.HealAll();
        this.m_App.m_Game.InReset();
        this.m_App.m_Fade.WhiteOut(8);
        this.m_App.m_MessWin.OpenWindow(1);
        this.m_App.OpenMoneyWindow();
        this.m_App.LoopFrame(4);
        this.m_App.m_MessWin.SetMessage("\u5bbf\u5c4b\u300c\u304a\u306f\u3088\u3046\u3054\u3056\u3044\u307e\u3059\u3002@R\u3000\u3000\u3000\u3067\u306f\u3001\u3044\u3063\u3066\u3089\u3063\u3057\u3083\u3044\u307e\u305b\u3002@S ");
        this.m_App.m_MessWin.WaitMessage();
    }
}

