/*
 * Decompiled with CFR 0.152.
 */
class CBoundingBox {
    public D3DXVECTOR3[] m_avVert = new D3DXVECTOR3[8];

    public void Create(D3DXVECTOR3[] d3DXVECTOR3Array) {
        int n = 0;
        do {
            this.m_avVert[n].Set(d3DXVECTOR3Array[n]);
        } while (++n < 8);
    }

    public void Create(D3DXVECTOR3 d3DXVECTOR3, D3DXVECTOR3 d3DXVECTOR32) {
        float f;
        float f2;
        float f3;
        float f4;
        float f5;
        float f6;
        if (d3DXVECTOR3.y < d3DXVECTOR32.y) {
            f6 = d3DXVECTOR3.y;
            f5 = d3DXVECTOR32.y;
        } else {
            f6 = d3DXVECTOR32.y;
            f5 = d3DXVECTOR3.y;
        }
        int n = 0;
        do {
            this.m_avVert[n].y = f5;
            this.m_avVert[n + 4].y = f6;
        } while (++n < 4);
        if (d3DXVECTOR3.x < d3DXVECTOR32.x) {
            f4 = d3DXVECTOR3.x;
            f3 = d3DXVECTOR32.x;
        } else {
            f4 = d3DXVECTOR32.x;
            f3 = d3DXVECTOR3.x;
        }
        if (d3DXVECTOR3.z < d3DXVECTOR32.z) {
            f2 = d3DXVECTOR3.z;
            f = d3DXVECTOR32.z;
        } else {
            f2 = d3DXVECTOR32.z;
            f = d3DXVECTOR3.z;
        }
        this.m_avVert[0].x = this.m_avVert[4].x = f4;
        this.m_avVert[0].z = this.m_avVert[4].z = f;
        this.m_avVert[1].x = this.m_avVert[5].x = f3;
        this.m_avVert[1].z = this.m_avVert[5].z = f;
        this.m_avVert[2].x = this.m_avVert[6].x = f3;
        this.m_avVert[2].z = this.m_avVert[6].z = f2;
        this.m_avVert[3].x = this.m_avVert[7].x = f4;
        this.m_avVert[3].z = this.m_avVert[7].z = f2;
    }

    public void CalcPlane(CRender3D cRender3D, D3DXMATRIX d3DXMATRIX, CCalcBndBox cCalcBndBox) {
        cCalcBndBox.m_fZPos = 0.0f;
        int n = 0;
        do {
            cCalcBndBox.m_avCalc[n] = cRender3D.Get3DPos(d3DXMATRIX, this.m_avVert[n]);
            cCalcBndBox.m_fZPos += cCalcBndBox.m_avCalc[n].z;
        } while (++n < 4);
        cCalcBndBox.m_fZPos *= 0.25f;
    }

    CBoundingBox() {
        int n = 0;
        do {
            this.m_avVert[n] = new D3DXVECTOR3();
        } while (++n < 8);
    }

    public void Calc(CRender3D cRender3D, D3DXMATRIX d3DXMATRIX, CCalcBndBox cCalcBndBox) {
        int n = 0;
        do {
            cCalcBndBox.m_avCalc[n] = cRender3D.Get3DPos(d3DXMATRIX, this.m_avVert[n]);
        } while (++n < 8);
        cCalcBndBox.m_fXPos = (cCalcBndBox.m_avCalc[4].x + cCalcBndBox.m_avCalc[5].x + cCalcBndBox.m_avCalc[6].x + cCalcBndBox.m_avCalc[7].x) * 0.25f;
        cCalcBndBox.m_fXPos -= cRender3D.GetCenterX();
        cCalcBndBox.m_fZPos = (cCalcBndBox.m_avCalc[4].z + cCalcBndBox.m_avCalc[5].z + cCalcBndBox.m_avCalc[6].z + cCalcBndBox.m_avCalc[7].z) * 0.25f;
    }
}

