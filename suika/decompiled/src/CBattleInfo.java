/*
 * Decompiled with CFR 0.152.
 */
class CBattleInfo {
    public int m_nCount;
    public int m_nGround;
    public int m_nExp;
    public int m_nGold;
    public int m_nAP;
    public int[] m_anItem = new int[4];
    public int m_nItemPtr;

    public void Init() {
        this.m_nExp = 0;
        this.m_nGold = 0;
        this.m_nAP = 0;
        this.m_nItemPtr = 0;
        int n = 0;
        do {
            this.m_anItem[n] = 0;
        } while (++n < 4);
    }

    CBattleInfo() {
    }
}

