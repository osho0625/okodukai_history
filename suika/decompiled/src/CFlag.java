/*
 * Decompiled with CFR 0.152.
 */
class CFlag {
    public int m_nFlag;

    CFlag() {
        this.ClearFlag();
    }

    public void Set(CFlag cFlag) {
        this.m_nFlag = cFlag.m_nFlag;
    }

    public void SetValue(int n) {
        this.m_nFlag = n;
    }

    public int GetValue() {
        return this.m_nFlag;
    }

    public void SetFlag(int n) {
        this.m_nFlag |= n;
    }

    public void ClearFlag() {
        this.m_nFlag = 0;
    }

    public boolean GetFlag(int n) {
        return (this.m_nFlag & n) != 0;
    }

    public void ResetFlag(int n) {
        this.m_nFlag &= ~n;
    }
}

