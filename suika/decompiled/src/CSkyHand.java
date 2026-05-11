/*
 * Decompiled with CFR 0.152.
 */
class CSkyHand {
    static final int WIN_XPOS = 16;
    static final int WIN_YPOS = 16;
    static final int MAX_TABLE = 16;
    static final int MAX_DISP = 8;
    static final String[] NAME_TABLE = new String[]{"\u30aa\u30fc\u30dc\u30f3\u306e\u753a\u3000\u3000", "\u30c7\u30e1\u30eb\u306e\u6751", "\u30dd\u30ef\u30f3\u306e\u753a", "\u30af\u30ec\u30e2\u30f3\u57ce", "\u30ce\u30ea\u30a8\u30c3\u30c8\u306e\u6751", "\u30b3\u30a4\u30f3\u738b\u306e\u57ce", "\u30de\u30eb\u30e1\u30be\u30f3\u306e\u753a", "\u30ad\u30eb\u30d5\u30a7\u30dc\u30f3\u306e\u753a", "\u30ed\u30a4\u30ba\u306e\u6751", "\u9670\u967d\u5e2b\u306e\u5c71\u9802", "\u8b0e\u306e\u795e\u6bbf", "\u3055\u308b\u306e\u60d1\u661f", "\u30df\u30b3\u30ec\u306e\u6751", "\u5192\u967a\u8005\u306e\u8ff7\u5bae", "\u30b7\u30ed\u30bf\u30a8\u306e\u753a", "\u3046\u3057\u9b54\u738b\u306e\u57ce"};
    static final int[] FLAG_TABLE = new int[]{301, 301, 3, 4, 5, 243, 6, 7, 268, 269, 8, 138, 157, 170, 201, 185};
    static final int[] MOVE_AREA = new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 22, 0, 0, 0, 0, 0};
    static final int[] MOVE_XPOS = new int[]{16, 17, 20, 28, 29, 33, 52, 35, 27, 12, 5, 13, 60, 55, 55, 37};
    static final int[] MOVE_ZPOS = new int[]{34, 23, 15, 13, 22, 26, 11, 11, 45, 14, 21, 56, 28, 36, 59, 38};
    static final int[] SHIP_XPOS = new int[]{17, 15, 19, 28, 29, 34, 54, 35, 27, 27, 8, 15, 58, 55, 66, 37};
    static final int[] SHIP_ZPOS = new int[]{36, 21, 13, 10, 24, 27, 10, 9, 46, 54, 11, 56, 28, 37, 47, 39};
    private CMenuWindowLR m_Menu;
    private int[] m_anTable = new int[16];
    private int m_nListNum;

    private void Create() {
        this.m_Menu = new CMenuWindowLR();
        this.m_nListNum = 0;
        CPlayData cPlayData = Vari.m_App.m_Play;
        int n = 0;
        do {
            if (!cPlayData.GetEvtFlag(FLAG_TABLE[n])) continue;
            this.m_anTable[this.m_nListNum] = n;
            ++this.m_nListNum;
        } while (++n < 16);
        this.m_Menu.CreateLR(Vari.m_App, 8, 8);
        n = 0;
        while (n < this.m_nListNum) {
            this.m_Menu.SetMenuTextLR(n, NAME_TABLE[this.m_anTable[n]]);
            ++n;
        }
        this.m_Menu.MakeList();
    }

    CSkyHand() {
    }

    private void CloseWindow() {
        this.m_Menu.CloseWindow();
        Vari.m_App.LoopFrame(4);
        Vari.m_App.ReleaseWindow(this.m_Menu);
    }

    public int Run() {
        this.Create();
        this.OpenWindow();
        int n = this.m_Menu.LoopFrame();
        if (n == -1) {
            this.CloseWindow();
            return -1;
        }
        this.CloseWindow();
        return this.m_anTable[n];
    }

    private void OpenWindow() {
        Vari.m_App.EntryWindow(this.m_Menu);
        this.m_Menu.OpenWindow(16, 16);
        Vari.m_App.LoopFrame(4);
    }

    public static void Exec(int n) {
        Vari.m_App.m_Fade.WhiteIn(8);
        if (Vari.m_App.m_bShip) {
            Vari.m_App.OffShip2();
        }
        Vari.m_App.m_Game.XChgArea(MOVE_AREA[n], MOVE_XPOS[n], MOVE_ZPOS[n], 0);
        CChrWork cChrWork = Vari.GetChrWork(3);
        cChrWork.m_vPos.x = CMapData.GetXPos(SHIP_XPOS[n]);
        cChrWork.m_vPos.z = CMapData.GetZPos(SHIP_ZPOS[n]);
        Vari.m_App.SaveShipPos();
        Vari.m_App.m_Fade.WhiteOut(8);
    }
}

