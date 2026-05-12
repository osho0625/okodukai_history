/*
 * Decompiled with CFR 0.152.
 */
class D3DLIGHT8 {
    static final int BATTLE_ROTATE = 1;
    public int m_nType;
    public D3DXCOLOR m_cDiffuse = new D3DXCOLOR();
    public D3DXVECTOR3 m_vPosition = new D3DXVECTOR3();
    public D3DXVECTOR3 m_vDirection = new D3DXVECTOR3();
    public float m_fRange;
    public CFlag m_Flag = new CFlag();

    public void Set(D3DLIGHT8 d3DLIGHT8) {
        this.m_nType = d3DLIGHT8.m_nType;
        this.m_cDiffuse.Set(d3DLIGHT8.m_cDiffuse);
        this.m_vPosition.Set(d3DLIGHT8.m_vPosition);
        this.m_vDirection.Set(d3DLIGHT8.m_vDirection);
        this.m_fRange = d3DLIGHT8.m_fRange;
        this.m_Flag.Set(d3DLIGHT8.m_Flag);
    }

    D3DLIGHT8() {
    }
}

