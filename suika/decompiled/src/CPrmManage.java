/*
 * Decompiled with CFR 0.152.
 */
class CPrmManage {
    public CChrParam[] m_aChrPrm = new CChrParam[9];

    CPrmManage() {
        int n = 0;
        do {
            this.m_aChrPrm[n] = new CChrParam(n);
        } while (++n < 9);
    }

    public CChrParam GetPrm(int n) {
        return this.m_aChrPrm[n];
    }

    public void InitBattle() {
        int n = 0;
        do {
            this.m_aChrPrm[n].InitBattle();
        } while (++n < 9);
    }
}

