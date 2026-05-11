/*
 * Decompiled with CFR 0.152.
 */
class CEfcManage {
    public CEfcWork[] m_aEfcWork = new CEfcWork[256];

    public void ClearAllWork() {
        int n = 0;
        do {
            this.m_aEfcWork[n].ResetFlag(1);
        } while (++n < 256);
    }

    public CEfcWork GetWork(int n) {
        return this.m_aEfcWork[n];
    }

    public CEfcWork SearchWork() {
        int n = 0;
        do {
            if (this.m_aEfcWork[n].GetFlag(1)) continue;
            return this.m_aEfcWork[n];
        } while (++n < 256);
        return null;
    }

    CEfcManage() {
        int n = 0;
        do {
            this.m_aEfcWork[n] = new CEfcWork(n);
        } while (++n < 256);
    }
}

