/*
 * Decompiled with CFR 0.152.
 */
class CModel {
    public int m_nVertNum;
    public D3DXVECTOR3[] m_avVert;
    public int m_nMatNum;
    public MATERIAL[] m_amaMat;
    public int m_nSurfNum;
    public CSurface[] m_asuSurf;
    public CBoundingBox m_cBndBox;
    public float m_fHeight;

    public float GetTopY() {
        return this.m_fHeight;
    }

    public CBoundingBox GetBoundingBox() {
        return this.m_cBndBox;
    }

    public boolean Load(String string) {
        CFileJip cFileJip = new CFileJip();
        if (!cFileJip.Load(string)) {
            return false;
        }
        this.m_nVertNum = cFileJip.ReadInt();
        if (this.m_nVertNum == 0) {
            return false;
        }
        this.m_nSurfNum = cFileJip.ReadWord();
        if (this.m_nSurfNum == 0) {
            return false;
        }
        this.m_nMatNum = cFileJip.ReadWord();
        if (this.m_nMatNum == 0) {
            return false;
        }
        this.m_cBndBox = new CBoundingBox();
        D3DXVECTOR3[] d3DXVECTOR3Array = new D3DXVECTOR3[8];
        int n = 0;
        do {
            d3DXVECTOR3Array[n] = new D3DXVECTOR3();
            d3DXVECTOR3Array[n].x = cFileJip.ReadFloat();
            d3DXVECTOR3Array[n].y = cFileJip.ReadFloat();
            d3DXVECTOR3Array[n].z = cFileJip.ReadFloat();
        } while (++n < 8);
        this.m_cBndBox.Create(d3DXVECTOR3Array);
        this.m_fHeight = cFileJip.ReadFloat();
        this.m_avVert = new D3DXVECTOR3[this.m_nVertNum];
        n = 0;
        while (n < this.m_nVertNum) {
            this.m_avVert[n] = new D3DXVECTOR3();
            this.m_avVert[n].x = cFileJip.ReadFloat();
            this.m_avVert[n].y = cFileJip.ReadFloat();
            this.m_avVert[n].z = cFileJip.ReadFloat();
            ++n;
        }
        this.m_amaMat = new MATERIAL[this.m_nMatNum];
        n = 0;
        while (n < this.m_nMatNum) {
            this.m_amaMat[n] = new MATERIAL();
            this.m_amaMat[n].m_Col.r = cFileJip.ReadInt();
            this.m_amaMat[n].m_Col.g = cFileJip.ReadInt();
            this.m_amaMat[n].m_Col.b = cFileJip.ReadInt();
            this.m_amaMat[n].m_fDif = cFileJip.ReadFloat();
            this.m_amaMat[n].m_fSpc = cFileJip.ReadFloat();
            this.m_amaMat[n].m_nFlag = cFileJip.ReadInt();
            ++n;
        }
        this.m_asuSurf = new CSurface[this.m_nSurfNum];
        n = 0;
        while (n < this.m_nSurfNum) {
            this.m_asuSurf[n] = new CSurface();
            this.m_asuSurf[n].m_nMat = cFileJip.ReadWord();
            this.m_asuSurf[n].m_nVertNum = cFileJip.ReadWord();
            this.m_asuSurf[n].m_anVertPtr[1] = cFileJip.ReadWord();
            this.m_asuSurf[n].m_anVertPtr[0] = cFileJip.ReadWord();
            this.m_asuSurf[n].m_anVertPtr[3] = cFileJip.ReadWord();
            this.m_asuSurf[n].m_anVertPtr[2] = cFileJip.ReadWord();
            this.m_asuSurf[n].m_vNormal.x = cFileJip.ReadFloat();
            this.m_asuSurf[n].m_vNormal.y = cFileJip.ReadFloat();
            this.m_asuSurf[n].m_vNormal.z = cFileJip.ReadFloat();
            ++n;
        }
        return true;
    }

    public MATERIAL GetMaterial(int n) {
        return this.m_amaMat[n];
    }

    public int GetSurfNum() {
        return this.m_nSurfNum;
    }

    public D3DXVECTOR3 GetVertex(int n) {
        return this.m_avVert[n];
    }

    public CSurface GetSurface(int n) {
        return this.m_asuSurf[n];
    }

    CModel() {
    }

    public int GetVertNum() {
        return this.m_nVertNum;
    }
}

