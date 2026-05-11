/*
 * Decompiled with CFR 0.152.
 */
class CBaseRender {
    static final int D3DLIGHT_NONE = 0;
    static final int D3DLIGHT_POINT = 1;
    static final int D3DLIGHT_DIRECTIONAL = 2;
    static final int D3DFOG_NONE = 0;
    static final int D3DFOG_LINEAR = 1;
    static final int D3DRS_FOGENABLE = 1;
    static final int D3DRS_SPECULARENABLE = 2;
    static final int D3DRS_LIGHTING = 3;
    static final int D3DRS_FOGTABLEMODE = 4;
    static final int D3DRS_FOGSTART = 5;
    static final int D3DRS_FOGEND = 6;
    static final int D3DRS_FOGCOLOR = 7;
    static final int D3DRS_AMBIENT = 8;
    static final int D3DRS_BACKCOLOR = 9;
    static final int D3DRS_LIGHTCOLOR = 10;
    private float m_fBright = 1.0f;
    private float m_fWhite;
    private boolean m_bLightFlag;
    public D3DLIGHT8 m_liLight = new D3DLIGHT8();
    public D3DXVECTOR3 m_vCalcLiDir = new D3DXVECTOR3();
    protected D3DXVECTOR3 m_vCalcLiPos = new D3DXVECTOR3();
    private boolean m_bFogFlag;
    private int m_nFogMode;
    private D3DXCOLOR m_cFogColor = new D3DXCOLOR();
    private float m_fFogStart;
    private float m_fFogEnd;
    private boolean m_bSpecFlag;
    private D3DXCOLOR m_cAmbient = new D3DXCOLOR();
    protected float m_fAmbPowR;
    protected float m_fAmbPowG;
    protected float m_fAmbPowB;
    private D3DXCOLOR m_cBackColor = new D3DXCOLOR();
    protected D3DXVECTOR3 m_vEyeVector = new D3DXVECTOR3();

    CBaseRender() {
    }

    public float GetBright() {
        return this.m_fBright;
    }

    public float GetWhite() {
        return this.m_fWhite;
    }

    public D3DXCOLOR GetRenderStateC(int n) {
        switch (n) {
            case 7: {
                return this.m_cFogColor;
            }
            case 8: {
                return this.m_cAmbient;
            }
            case 9: {
                return this.m_cBackColor;
            }
            case 10: {
                return this.m_liLight.m_cDiffuse;
            }
        }
        return null;
    }

    public float CalcSpcRatio(D3DXVECTOR3 d3DXVECTOR3, D3DXVECTOR3 d3DXVECTOR32) {
        float f = 0.0f;
        f = this.m_vEyeVector.DotProduct(d3DXVECTOR32);
        if ((f = (f - 0.75f) * 2.0f) < 0.0f) {
            f = 0.0f;
        }
        if (f > 1.0f) {
            f = 1.0f;
        }
        return f;
    }

    public float CalcFogRatio(D3DXVECTOR3 d3DXVECTOR3) {
        if (this.m_nFogMode == 1) {
            if (d3DXVECTOR3.z < this.m_fFogStart) {
                return 0.0f;
            }
            if (d3DXVECTOR3.z > this.m_fFogEnd) {
                return 1.0f;
            }
            float f = d3DXVECTOR3.z - this.m_fFogStart;
            float f2 = this.m_fFogEnd - this.m_fFogStart;
            return f / f2;
        }
        return 0.0f;
    }

    public void SetLightPos(D3DXVECTOR3 d3DXVECTOR3) {
        this.m_liLight.m_vPosition.Set(d3DXVECTOR3);
    }

    public int GetLightType() {
        return this.m_liLight.m_nType;
    }

    public int GetRenderStateN(int n) {
        switch (n) {
            case 4: {
                return this.m_nFogMode;
            }
        }
        return 0;
    }

    public void SetLightDir(D3DXVECTOR3 d3DXVECTOR3) {
        this.m_liLight.m_vDirection.Set(d3DXVECTOR3);
        this.m_liLight.m_vDirection.Normalize();
    }

    public void SetLightRange(float f) {
        this.m_liLight.m_fRange = f;
    }

    public void SetLightDiffuse(D3DXCOLOR d3DXCOLOR) {
        this.m_liLight.m_cDiffuse.Set(d3DXCOLOR);
    }

    public float CalcLightRatio(D3DXVECTOR3 d3DXVECTOR3, D3DXVECTOR3 d3DXVECTOR32, int n) {
        if (!this.m_bLightFlag) {
            return 1.0f;
        }
        float f = 1.0f;
        switch (this.m_liLight.m_nType) {
            case 1: {
                D3DXVECTOR3 d3DXVECTOR33 = new D3DXVECTOR3();
                d3DXVECTOR33.x = d3DXVECTOR3.x - this.m_liLight.m_vPosition.x;
                d3DXVECTOR33.y = d3DXVECTOR3.y - this.m_liLight.m_vPosition.y;
                d3DXVECTOR33.z = d3DXVECTOR3.z - this.m_liLight.m_vPosition.z;
                float f2 = d3DXVECTOR33.Magnitude();
                if (f2 >= this.m_liLight.m_fRange) {
                    f = 0.0f;
                    break;
                }
                d3DXVECTOR33.Normalize();
                f = d3DXVECTOR33.DotProduct(d3DXVECTOR32);
                f = (f + 1.0f) * 0.5f;
                float f3 = 1.0f - f2 / this.m_liLight.m_fRange;
                f *= f3;
                break;
            }
            case 2: {
                f = this.m_liLight.m_vDirection.DotProduct(d3DXVECTOR32);
                f = (f + 1.0f) * 0.5f;
            }
        }
        if (f < 0.0f) {
            f = 0.0f;
        }
        if (f > 1.0f) {
            f = 1.0f;
        }
        return f;
    }

    public void SetRenderState(int n, boolean bl) {
        switch (n) {
            case 1: {
                this.m_bFogFlag = bl;
                return;
            }
            case 2: {
                this.m_bSpecFlag = bl;
                return;
            }
            case 3: {
                this.m_bLightFlag = bl;
                return;
            }
        }
    }

    public void SetRenderState(int n, int n2) {
        switch (n) {
            case 4: {
                this.m_nFogMode = n2;
                return;
            }
        }
    }

    public void SetRenderState(int n, float f) {
        switch (n) {
            case 5: {
                this.m_fFogStart = f;
                return;
            }
            case 6: {
                this.m_fFogEnd = f;
                return;
            }
        }
    }

    public void SetRenderState(int n, D3DXCOLOR d3DXCOLOR) {
        switch (n) {
            case 7: {
                this.m_cFogColor.Set(d3DXCOLOR);
                return;
            }
            case 8: {
                this.m_cAmbient.Set(d3DXCOLOR);
                this.m_fAmbPowR = (float)this.m_cAmbient.r / 256.0f;
                this.m_fAmbPowG = (float)this.m_cAmbient.g / 256.0f;
                this.m_fAmbPowB = (float)this.m_cAmbient.b / 256.0f;
                return;
            }
            case 9: {
                this.m_cBackColor.Set(d3DXCOLOR);
                return;
            }
        }
    }

    public void SetLight(D3DLIGHT8 d3DLIGHT8) {
        this.m_liLight.Set(d3DLIGHT8);
        this.m_liLight.m_vDirection.Normalize();
    }

    public D3DLIGHT8 GetLight() {
        return this.m_liLight;
    }

    public void SetBright(float f) {
        this.m_fBright = f;
    }

    public void SetWhite(float f) {
        this.m_fWhite = f;
    }
}

