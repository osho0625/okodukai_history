/*
 * Decompiled with CFR 0.152.
 */
class CBChrManage {
    public CBattleWork[] m_aBtlWork = new CBattleWork[9];

    public void ClearPrm() {
        int n = 0;
        do {
            this.m_aBtlWork[n].ClearPrm();
        } while (++n < 9);
    }

    CBChrManage() {
        int n = 0;
        do {
            this.m_aBtlWork[n] = new CBattleWork(n);
        } while (++n < 9);
    }
}

