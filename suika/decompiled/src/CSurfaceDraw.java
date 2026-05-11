/*
 * Decompiled with CFR 0.152.
 */
class CSurfaceDraw {
    public int m_nVertNum;
    public int[] m_anVertPtr = new int[4];
    public D3DXVECTOR3 m_vNormal = new D3DXVECTOR3();
    public D3DXCOLOR m_Col = new D3DXCOLOR();

    public int GetVertNum() {
        return this.m_nVertNum;
    }

    CSurfaceDraw() {
    }

    public int GetVertTable(int n) {
        return this.m_anVertPtr[n];
    }
}

