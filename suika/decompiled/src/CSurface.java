/*
 * Decompiled with CFR 0.152.
 */
class CSurface {
    public int m_nVertNum;
    public int[] m_anVertPtr = new int[4];
    public D3DXVECTOR3 m_vNormal = new D3DXVECTOR3();
    public int m_nMat;
    public int m_nFlag;

    public int GetVertNum() {
        return this.m_nVertNum;
    }

    public D3DXVECTOR3 GetNormal() {
        return this.m_vNormal;
    }

    public int GetVertTable(int n) {
        return this.m_anVertPtr[n];
    }

    CSurface() {
    }
}

