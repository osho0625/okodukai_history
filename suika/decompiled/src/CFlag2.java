/*
 * Decompiled with CFR 0.152.
 */
class CFlag2 {
    static final int USE_BIT = 6;
    public int m_nArray;
    public int[] m_anFlag;

    public void Create(int n) {
        this.m_nArray = (n + 5) / 6;
        this.m_anFlag = new int[this.m_nArray];
        this.ClearFlag();
    }

    public void Set(CFlag2 cFlag2) {
        this.m_nArray = cFlag2.m_nArray;
        int n = cFlag2.m_anFlag.length;
        this.m_anFlag = new int[n];
        int n2 = 0;
        while (n2 < n) {
            this.m_anFlag[n2] = cFlag2.GetValue(n2);
            ++n2;
        }
    }

    public void SetValue(int n, int n2) {
        this.m_anFlag[n] = n2;
    }

    public int GetValue(int n) {
        return this.m_anFlag[n];
    }

    public void SetFlag(int n) {
        int n2 = 1 << n % 6;
        int n3 = n / 6;
        this.m_anFlag[n3] = this.m_anFlag[n3] | n2;
    }

    CFlag2() {
    }

    public void ClearFlag() {
        int n = 0;
        while (n < this.m_nArray) {
            this.m_anFlag[n] = 0;
            ++n;
        }
    }

    public boolean GetFlag(int n) {
        int n2 = 1 << n % 6;
        return (this.m_anFlag[n / 6] & n2) != 0;
    }

    public void ResetFlag(int n) {
        int n2 = 1 << n % 6;
        int n3 = n / 6;
        this.m_anFlag[n3] = this.m_anFlag[n3] & ~n2;
    }
}

