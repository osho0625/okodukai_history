/*
 * Decompiled with CFR 0.152.
 */
class CGemData {
    static final int MAX_LEARN = 7;
    static final int CMD_START = 1000;
    static final int CMD_ITEM = 1000;
    static final int CMD_STEAL = 1001;
    static final int CMD_SEIZE = 1002;
    static final String[] CMD_NAME = new String[]{"\u6226\u95d8\u30a2\u30a4\u30c6\u30e0", "\u76d7\u3080", "\u3076\u3093\u53d6\u308b"};
    static final int[] CMD_TABLE = new int[]{2, 3, 4};
    static final int[] GEM_DATA = new int[]{25, 16, 55, 0, 90, 26, 130, 17, 175, 18, 225, 19, 300, 15, 25, 26, 55, 27, 90, 4, 130, 28, 175, 29, 225, 37, 300, 110, 25, 0, 55, 17, 90, 4, 130, 20, 175, 8, 225, 21, 300, 22, 25, 10, 55, 1001, 90, 88, 130, 27, 175, 12, 225, 89, 300, 105, 25, 39, 55, 40, 90, 41, 130, 6, 175, 42, 225, 43, 300, 44, 25, 1000, 55, 12, 90, 104, 130, 2, 175, 103, 225, 6, 300, 102, 30, 68, 65, 69, 105, 70, 150, 71, 200, 72, 255, 73, 330, 74, 35, 50, 75, 51, 120, 6, 170, 52, 225, 53, 285, 54, 380, 55, 40, 82, 95, 83, 135, 84, 190, 3, 250, 85, 315, 86, 400, 87, 50, 30, 95, 11, 155, 90, 220, 1002, 290, 31, 370, 13, 500, 33, 50, 50, 95, 90, 155, 51, 220, 62, 290, 1, 370, 52, 500, 65, 60, 45, 130, 46, 210, 3, 300, 47, 400, 48, 520, 7, 670, 49, 70, 23, 150, 1, 240, 5, 340, 24, 550, 9, 670, 109, 800, 25, 70, 31, 150, 32, 240, 5, 340, 38, 550, 34, 670, 36, 800, 111, 80, 56, 170, 97, 270, 93, 380, 57, 600, 7, 730, 58, 870, 59, 80, 75, 170, 76, 270, 91, 380, 77, 600, 78, 730, 11, 870, 79, 80, 55, 170, 94, 270, 63, 380, 5, 600, 35, 730, 106, 870, 66};

    public static boolean IsLearn(CChrParam cChrParam, int n) {
        int n2 = cChrParam.m_nGem;
        if (n2 == -1) {
            return false;
        }
        int n3 = CGemData.GetAbi(n2 -= 110, n);
        return !(n3 < 1000 ? cChrParam.m_Abi.GetFlagM(n3) : cChrParam.m_Abi.GetFlagC(CMD_TABLE[n3 - 1000]));
    }

    public static String Learn(CChrParam cChrParam, int n) {
        int n2 = cChrParam.m_nGem;
        if (n2 == -1) {
            return null;
        }
        int n3 = CGemData.GetAbi(n2 -= 110, n);
        if (n3 < 1000) {
            cChrParam.m_Abi.SetFlagM(n3);
            CSkillData cSkillData = Vari.GetSkillData(n3);
            return cSkillData.m_strName;
        }
        cChrParam.m_Abi.SetFlagC(CMD_TABLE[n3 - 1000]);
        return CMD_NAME[n3 - 1000];
    }

    CGemData() {
    }

    public static int GetAP(int n, int n2) {
        return GEM_DATA[n * 7 * 2 + n2 * 2 + 0];
    }

    public static int IsEquip(int n, int n2) {
        CChrParam cChrParam = Vari.GetChrPrm(n);
        int n3 = n2 - 110;
        if (cChrParam.m_GemFlag.GetFlag(n3)) {
            return 1;
        }
        if (cChrParam.m_nGem == n2) {
            return 1;
        }
        if (n2 == 119 && !cChrParam.m_GemFlag.GetFlag(3)) {
            return 2;
        }
        if (n2 == 120 && n != 0) {
            return 2;
        }
        if (n2 == 121 && !cChrParam.m_GemFlag.GetFlag(4)) {
            return 2;
        }
        if (n2 == 122 && !cChrParam.m_GemFlag.GetFlag(2)) {
            return 2;
        }
        if (n2 == 123 && !cChrParam.m_GemFlag.GetFlag(1)) {
            return 2;
        }
        if (n2 == 124 && n != 2) {
            return 2;
        }
        if (n2 == 125 && n != 1) {
            return 2;
        }
        if (n2 == 126 && !cChrParam.m_GemFlag.GetFlag(10)) {
            return 2;
        }
        return 0;
    }

    public static int GetAbi(int n, int n2) {
        return GEM_DATA[n * 7 * 2 + n2 * 2 + 1];
    }
}

