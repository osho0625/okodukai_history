/*
 * Decompiled with CFR 0.152.
 */
class CGroundArea {
    private int m_nTop;
    private int m_nBottom;
    private int m_nRight;
    private int m_nLeft;
    private int m_nAlpha = 2;

    CGroundArea() {
    }

    public void Add(int n, int n2) {
        if (this.m_nLeft > n) {
            this.m_nLeft = n;
        }
        if (this.m_nRight < n) {
            this.m_nRight = n;
        }
        if (this.m_nBottom > n2) {
            this.m_nBottom = n2;
        }
        if (this.m_nTop < n2) {
            this.m_nTop = n2;
        }
    }

    public boolean CheckDisplayIn(int n, int n2) {
        return n >= this.m_nLeft && n <= this.m_nRight && n2 >= this.m_nBottom && n2 <= this.m_nTop;
    }

    public void Clear() {
        this.m_nLeft = 9999;
        this.m_nRight = -9999;
        this.m_nTop = -9999;
        this.m_nBottom = 9999;
    }

    public void Magnification(int n) {
        this.m_nLeft -= n;
        this.m_nRight += n;
        this.m_nBottom -= n;
        this.m_nTop += n;
    }
}

