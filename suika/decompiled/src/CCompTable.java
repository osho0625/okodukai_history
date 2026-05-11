/*
 * Decompiled with CFR 0.152.
 */
class CCompTable {
    static final int MAX_ITEM = 14;
    static final int[][] m_anTable = new int[][]{{8, 100, 145, 2, -1, -1, -1, -1}, {27, 6000, 141, 1, 140, 9, 20, 1}, {36, 4000, 33, 1, 34, 1, 35, 1}, {39, 20000, 38, 3, 146, 9, -1, -1}, {79, 20000, 74, 1, 144, 4, 146, 7}, {42, 400, 40, 3, -1, -1, -1, -1}, {44, 800, 42, 4, -1, -1, -1, -1}, {45, 1600, 44, 5, -1, -1, -1, -1}, {15, 2000, 102, 1, 144, 2, 146, 1}, {88, 15000, 86, 1, 143, 3, 144, 3}, {108, 12000, 144, 3, 145, 3, 146, 3}, {145, 1000, 6, 7, -1, -1, -1, -1}, {146, 10000, 145, 9, -1, -1, -1, -1}, {118, 5000, 142, 5, 114, 1, 115, 1}};

    public static int GetGold(int n) {
        return m_anTable[n][1];
    }

    public static boolean IsPossession(int n, int n2) {
        int n3 = CCompTable.GetMaterial(n, n2);
        int n4 = CCompTable.GetMatNum(n, n2);
        if (n3 == -1) {
            return true;
        }
        return Vari.m_App.m_Play.m_anItem[n3] >= n4;
    }

    public static boolean IsPossession(int n) {
        int n2 = 0;
        do {
            if (CCompTable.IsPossession(n, n2)) continue;
            return false;
        } while (++n2 < 3);
        return true;
    }

    public static int GetMaterial(int n, int n2) {
        return m_anTable[n][2 + n2 * 2];
    }

    public static int GetItem(int n) {
        return m_anTable[n][0];
    }

    public static int GetMatNum(int n, int n2) {
        return m_anTable[n][3 + n2 * 2];
    }

    public static void UseItem(int n) {
        int n2 = 0;
        do {
            int n3 = CCompTable.GetMaterial(n, n2);
            int n4 = CCompTable.GetMatNum(n, n2);
            if (n3 == -1) break;
            Vari.m_App.m_Play.AddItem(n3, -n4);
        } while (++n2 < 3);
        n2 = CCompTable.GetItem(n);
        Vari.m_App.m_Play.AddItem(n2, 1);
    }

    CCompTable() {
    }
}

