/*
 * Decompiled with CFR 0.152.
 */
class CPartyLine {
    static final int MAX_TABLE = 12;
    private float[] m_afXPos = new float[12];
    private float[] m_afZPos = new float[12];
    private float[] m_afVect = new float[12];

    public float GetVect(int n) {
        if (n == 1) {
            return this.m_afVect[5];
        }
        return this.m_afVect[11];
    }

    public void AddPos2(D3DXVECTOR3 d3DXVECTOR3, float f) {
        int n = 10;
        do {
            this.m_afXPos[n + 1] = this.m_afXPos[n];
            this.m_afZPos[n + 1] = this.m_afZPos[n];
            this.m_afVect[n + 1] = this.m_afVect[n];
        } while (--n >= 0);
        this.m_afXPos[0] = d3DXVECTOR3.x;
        this.m_afZPos[0] = d3DXVECTOR3.z;
        this.m_afVect[0] = f;
    }

    public void AddPos(D3DXVECTOR3 d3DXVECTOR3, float f) {
        if (Calc3D.Abs(d3DXVECTOR3.x - this.m_afXPos[0]) < 10.0f && Calc3D.Abs(d3DXVECTOR3.z - this.m_afZPos[0]) < 10.0f) {
            return;
        }
        this.AddPos2(d3DXVECTOR3, f);
    }

    public float GetXPos(int n) {
        if (n == 1) {
            return this.m_afXPos[5];
        }
        return this.m_afXPos[11];
    }

    public void InitPos(D3DXVECTOR3 d3DXVECTOR3, float f) {
        int n = 0;
        do {
            this.m_afXPos[n] = d3DXVECTOR3.x;
            this.m_afZPos[n] = d3DXVECTOR3.z;
            this.m_afVect[n] = f;
        } while (++n < 12);
    }

    public float GetZPos(int n) {
        if (n == 1) {
            return this.m_afZPos[5];
        }
        return this.m_afZPos[11];
    }

    CPartyLine() {
    }
}

