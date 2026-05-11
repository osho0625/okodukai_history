/*
 * Decompiled with CFR 0.152.
 */
class CCoinKing {
    static final int COIN_NO1 = 138;
    static final int COIN_NO2 = 139;
    static final int MAX_ITEM = 6;
    static final int COIN_INT = 3;
    static final int NUM_FLAG = 95;
    static final int[] ITEM_TABLE = new int[]{54, 119, 46, 92, 18, 109};
    private static int m_nOldCoin;

    private static void Message(String string) {
        ARpg aRpg = Vari.m_App;
        aRpg.m_MessWin.SetMessage(string);
        aRpg.m_MessWin.WaitMessage();
    }

    private static int GetNextCoin() {
        return (CCoinKing.GetDeliverCoin() + 3) / 3 * 3;
    }

    private static void SetCoin(int n) {
        ARpg aRpg = Vari.m_App;
        aRpg.m_Play.ResetEvtFlag(95);
        aRpg.m_Play.ResetEvtFlag(96);
        aRpg.m_Play.ResetEvtFlag(97);
        aRpg.m_Play.ResetEvtFlag(98);
        aRpg.m_Play.ResetEvtFlag(99);
        if ((n & 1) != 0) {
            aRpg.m_Play.SetEvtFlag(95);
        }
        if ((n & 2) != 0) {
            aRpg.m_Play.SetEvtFlag(96);
        }
        if ((n & 4) != 0) {
            aRpg.m_Play.SetEvtFlag(97);
        }
        if ((n & 8) != 0) {
            aRpg.m_Play.SetEvtFlag(98);
        }
        if ((n & 0x10) != 0) {
            aRpg.m_Play.SetEvtFlag(99);
        }
    }

    private static int GetHaveCoin() {
        ARpg aRpg = Vari.m_App;
        return aRpg.m_Play.GetItem(138) + aRpg.m_Play.GetItem(139);
    }

    CCoinKing() {
    }

    public static void Run() {
        CItemData cItemData;
        int n;
        int n2;
        ARpg aRpg = Vari.m_App;
        boolean bl = false;
        m_nOldCoin = CCoinKing.GetDeliverCoin();
        aRpg.m_MessWin.OpenWindow(1);
        aRpg.LoopFrame(4);
        String string = "\u738b\u69d8\u300c\u3088\u304f\u305e\u6765\u305f\uff01@R";
        string = string + "\u3000\u3000\u3000\u30ef\u30b7\u306f\u3001\u4e16\u754c\u4e2d\u306b\u3061\u3089\u3070\u308b\u3068\u3044\u3046@R";
        string = string + "\u3000\u3000\u3000\u3061\u3044\u3055\u306a\u30b3\u30a4\u30f3\u3092\u96c6\u3081\u3066\u304a\u308b\u3002@S";
        CCoinKing.Message(string);
        int n3 = CCoinKing.GetHaveCoin();
        if (n3 > 0) {
            bl = true;
            string = "\u3000\u3000\u3000\u307b\u307b\u3046\u3001\u3088\u3057\u3088\u3057\u3002@R";
            string = string + "\u3000\u3000\u3000\u30b3\u30a4\u30f3\u3092\u3001\u6301\u3063\u3066\u304d\u305f\u3088\u3046\u3058\u3083\u306a\u3002@R";
            string = string + "\u3000\u3000\u3000\u3067\u306f\u3001\u30ef\u30b7\u304c\u9810\u304b\u308d\u3046\u3002@S";
            CCoinKing.Message(string);
            n2 = CCoinKing.GetDeliverCoin();
            CCoinKing.SetCoin(n2 += n3);
            aRpg.m_Play.SetItem(138, 0);
            aRpg.m_Play.SetItem(139, 0);
            string = "\u3000\u3000\u3000\u3053\u308c\u3067\u3001\u305d\u306a\u305f\u304c\u6301\u3063\u3066\u304d\u305f@R";
            string = string + "\u3000\u3000\u3000\u5c0f\u3055\u306a\u30b3\u30a4\u30f3\u306f\u3001\u5168\u90e8\u3067";
            string = string + Calc3D.NumberString2(n2, 2);
            string = string + "\u679a\u306b@R";
            string = string + "\u3000\u3000\u3000\u306a\u3063\u305f\u305e\u3002@S";
            CCoinKing.Message(string);
            n = -1;
            while ((n = CCoinKing.GetItem()) >= 0) {
                bl = false;
                cItemData = Vari.GetItemData(ITEM_TABLE[n]);
                string = "\u3000\u3000\u3000\u3088\u3057\uff01\u3000\u305d\u308c\u3067\u306f\u3001\u30b3\u30a4\u30f3\u3092@R";
                string = string + "\u3000\u3000\u3000";
                string = string + Calc3D.NumberString2((n + 1) * 3, 2);
                string = string + "\u679a\u96c6\u3081\u305f\u8912\u7f8e\u3068\u3057\u3066@R";
                string = string + "\u3000\u3000\u3000@y";
                string = string + cItemData.m_strName;
                string = string + "@w\u3092\u6388\u3051\u3088\u3046\uff01@S";
                CCoinKing.Message(string);
                aRpg.m_Play.AddItem(ITEM_TABLE[n], 1);
            }
        }
        if ((n2 = CCoinKing.GetDeliverCoin()) >= 18) {
            string = "\u3000\u3000\u3000\u4e16\u754c\u4e2d\u306e\u30b3\u30a4\u30f3\u304c\u63c3\u3063\u3066\u3001@R";
            string = string + "\u3000\u3000\u3000\u30ef\u30b7\u306f\u5927\u6e80\u8db3\u3058\u3083\u3002@S";
            CCoinKing.Message(string);
        } else {
            n = CCoinKing.GetNextCoin();
            if (!bl) {
                string = "\u3000\u3000\u3000\u3055\u3066\u3001\u73fe\u5728\u305d\u306a\u305f\u304b\u3089\u306f@R";
                string = string + "\u3000\u3000\u3000";
                string = string + Calc3D.NumberString2(n2, 2);
                string = string + "\u679a\u306e\u30b3\u30a4\u30f3\u3092\u9810\u304b\u3063\u3066\u304a\u308b\u3002@S";
                CCoinKing.Message(string);
            }
            string = "\u3000\u3000\u3000\u3053\u308c\u304c";
            string = string + Calc3D.NumberString2(n, 2);
            string = string + "\u679a\u306b\u306a\u3063\u305f\u3068\u304d\u306b@R";
            string = string + "\u3000\u3000\u3000@y";
            cItemData = Vari.GetItemData(ITEM_TABLE[n / 3 - 1]);
            string = string + cItemData.m_strName;
            string = string + "@w\u3092\u6388\u3051\u3088\u3046\u3002@R";
            string = string + "\u3000\u3000\u3000\u3057\u3063\u304b\u308a\u96c6\u3081\u3066\u304f\u308b\u304c\u3088\u3044\uff01@S";
            CCoinKing.Message(string);
        }
        aRpg.m_MessWin.CloseWindow();
        aRpg.LoopFrame(4);
    }

    private static int GetItem() {
        int n = m_nOldCoin / 3;
        int n2 = CCoinKing.GetDeliverCoin() / 3;
        if (n >= 6) {
            return -2;
        }
        if (n != n2) {
            m_nOldCoin = (m_nOldCoin + 3) / 3 * 3;
            return m_nOldCoin / 3 - 1;
        }
        return -1;
    }

    private static int GetDeliverCoin() {
        ARpg aRpg = Vari.m_App;
        int n = 0;
        int n2 = 0;
        do {
            if (!aRpg.m_Play.GetEvtFlag(95 + n2)) continue;
            n += 1 << n2;
        } while (++n2 < 5);
        return n;
    }
}

