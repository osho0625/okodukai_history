/*
 * Decompiled with CFR 0.152.
 */
class CMapData
extends CFlag {
    static final float MAPPARTS_XSIZE = 200.0f;
    static final float MAPPARTS_ZSIZE = 200.0f;
    static final float MAPPARTS_XHALF = 100.0f;
    static final float MAPPARTS_ZHALF = 100.0f;
    static final int FLAG_LOOP = 1;
    static final float[] afXTable = new float[]{Calc3D.Sin(0.0f), Calc3D.Sin(0.7853982f), Calc3D.Sin(1.5707964f), Calc3D.Sin(2.3561945f), Calc3D.Sin((float)Math.PI), Calc3D.Sin(3.926991f), Calc3D.Sin(4.712389f), Calc3D.Sin(5.4977875f)};
    static final float[] afZTable = new float[]{Calc3D.Cos(0.0f), Calc3D.Cos(0.7853982f), Calc3D.Cos(1.5707964f), Calc3D.Cos(2.3561945f), Calc3D.Cos((float)Math.PI), Calc3D.Cos(3.926991f), Calc3D.Cos(4.712389f), Calc3D.Cos(5.4977875f)};
    private int m_nXNum;
    private int m_nZNum;
    private byte[] m_abyGround;
    private int[] m_anMapModel;
    private CCalcBndBox[] m_aBndBox;
    private byte[] m_abyHit;

    CMapData() {
    }

    public int CheckHitShip(D3DXVECTOR3 d3DXVECTOR3, float f) {
        int n = 0;
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3(d3DXVECTOR3);
        int n2 = 0;
        while (n2 < afXTable.length) {
            d3DXVECTOR32.x = d3DXVECTOR3.x + afXTable[n2] * f;
            d3DXVECTOR32.z = d3DXVECTOR3.z + afZTable[n2] * f;
            int n3 = this.CheckHit(d3DXVECTOR32);
            if (n3 == 0) {
                n3 = 3;
            }
            if (n < n3) {
                n = n3;
            }
            ++n2;
        }
        return n;
    }

    public void Create(int n, int n2) {
        int n3 = n * n2;
        this.m_nXNum = n;
        this.m_nZNum = n2;
        this.m_abyGround = new byte[n3];
        this.m_abyHit = new byte[n3];
        this.m_anMapModel = new int[n3];
        this.m_aBndBox = new CCalcBndBox[n3];
    }

    public boolean IsOut(int n, int n2) {
        return n < 0 || n2 < 0 || n >= this.m_nXNum || n2 >= this.m_nZNum;
    }

    public static int GetMapModel(int n) {
        return n + 20 - 1;
    }

    public void Set(CMapData cMapData) {
        this.m_nXNum = cMapData.m_nXNum;
        this.m_nZNum = cMapData.m_nZNum;
        this.m_abyGround = new byte[cMapData.m_abyGround.length];
        int n = 0;
        while (n < cMapData.m_abyGround.length) {
            this.m_abyGround[n] = cMapData.m_abyGround[n];
            ++n;
        }
        this.m_abyHit = new byte[cMapData.m_abyHit.length];
        n = 0;
        while (n < cMapData.m_abyHit.length) {
            this.m_abyHit[n] = cMapData.m_abyHit[n];
            ++n;
        }
        this.m_anMapModel = new int[cMapData.m_anMapModel.length];
        this.m_aBndBox = new CCalcBndBox[cMapData.m_anMapModel.length];
        n = 0;
        while (n < cMapData.m_anMapModel.length) {
            this.m_anMapModel[n] = cMapData.m_anMapModel[n];
            this.m_aBndBox[n] = new CCalcBndBox();
            this.m_aBndBox[n].Set(cMapData.m_aBndBox[n]);
            ++n;
        }
    }

    public void SetHit(int n, byte by) {
        this.m_abyHit[n] = by;
    }

    public int CheckHit(D3DXVECTOR3 d3DXVECTOR3) {
        int n = CMapData.GetXBlock(d3DXVECTOR3.x);
        int n2 = CMapData.GetZBlock(d3DXVECTOR3.z);
        if (this.GetFlag(1)) {
            if (n < 0) {
                n += this.m_nXNum;
            }
            if (n >= this.m_nXNum) {
                n -= this.m_nXNum;
            }
            if (n2 < 0) {
                n2 += this.m_nZNum;
            }
            if (n2 >= this.m_nZNum) {
                n2 -= this.m_nZNum;
            }
        } else if (n < 0 || n >= this.m_nXNum || n2 < 0 || n2 >= this.m_nZNum) {
            return 3;
        }
        return this.GetHit(n + n2 * this.m_nXNum);
    }

    public int CheckHit(D3DXVECTOR3 d3DXVECTOR3, float f) {
        int n = 0;
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3(d3DXVECTOR3);
        int n2 = 0;
        while (n2 < afXTable.length) {
            d3DXVECTOR32.x = d3DXVECTOR3.x + afXTable[n2] * f;
            d3DXVECTOR32.z = d3DXVECTOR3.z + afZTable[n2] * f;
            int n3 = this.CheckHit(d3DXVECTOR32);
            if (n < n3) {
                n = n3;
            }
            ++n2;
        }
        return n;
    }

    public int GetMapTable(int n) {
        return this.m_anMapModel[n];
    }

    public byte GetHit(int n) {
        return this.m_abyHit[n];
    }

    public void SetGround(int n, byte by) {
        this.m_abyGround[n] = by;
    }

    public byte GetHit(int n, int n2) {
        return this.GetHit(n + n2 * this.m_nXNum);
    }

    public CCalcBndBox GetBndBox(int n) {
        return this.m_aBndBox[n];
    }

    public static float GetXPos(int n) {
        return (float)n * 200.0f + 100.0f;
    }

    public static float GetZPos(int n) {
        return (float)n * 200.0f + 100.0f;
    }

    public int GetPtr(int n, int n2) {
        return n + n2 * this.m_nXNum;
    }

    public static int GetXBlock(float f) {
        return (int)(f / 200.0f);
    }

    public void LoadMap(CFileJip cFileJip) {
        int n = 0;
        while (n < this.m_nXNum * this.m_nZNum) {
            this.m_anMapModel[n] = CFunc.Unsigned(cFileJip.ReadByte());
            this.m_aBndBox[n] = new CCalcBndBox();
            ++n;
        }
    }

    public static int GetZBlock(float f) {
        return (int)(f / 200.0f);
    }

    public void LoadGround(CFileJip cFileJip) {
        int n = 0;
        while (n < this.m_nXNum * this.m_nZNum) {
            byte by = cFileJip.ReadByte();
            this.m_abyGround[n] = (byte)(by % 30);
            this.m_abyHit[n] = (byte)(by / 30);
            ++n;
        }
    }

    public byte GetGround(int n) {
        return this.m_abyGround[n];
    }

    public int GetGround(D3DXVECTOR3 d3DXVECTOR3) {
        int n = CMapData.GetXBlock(d3DXVECTOR3.x);
        int n2 = CMapData.GetZBlock(d3DXVECTOR3.z);
        if (this.GetFlag(1)) {
            if (n < 0) {
                n += this.m_nXNum;
            }
            if (n >= this.m_nXNum) {
                n -= this.m_nXNum;
            }
            if (n2 < 0) {
                n2 += this.m_nZNum;
            }
            if (n2 >= this.m_nZNum) {
                n2 -= this.m_nZNum;
            }
        }
        return this.GetGround(n + n2 * this.m_nXNum);
    }

    public static int GetGroundModel(int n) {
        return n + 0 - 1;
    }

    public void SetMapTable(int n, int n2) {
        this.m_anMapModel[n] = n2;
    }
}

