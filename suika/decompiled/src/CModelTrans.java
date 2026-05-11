/*
 * Decompiled with CFR 0.152.
 */
class CModelTrans {
    public D3DXMATRIX m_mWorld = new D3DXMATRIX();
    public D3DXMATRIX m_mWVP = new D3DXMATRIX();

    CModelTrans() {
    }

    public void Set(CModelTrans cModelTrans) {
        this.m_mWorld.Set(cModelTrans.m_mWorld);
        this.m_mWVP.Set(cModelTrans.m_mWVP);
    }
}

