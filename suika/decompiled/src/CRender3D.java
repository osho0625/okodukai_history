/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;
import java.awt.Graphics;

class CRender3D
extends CBaseRender {
    static final int MAX_CALCBUFFER = 2048;
    static final int MAX_MODEL_SURFACE = 1024;
    static final int D3DTS_VIEW = 0;
    static final int D3DTS_VIEW_N = 1;
    static final int D3DTS_PROJECTION = 2;
    static final int D3DTS_WORLD = 3;
    static final int D3DTS_WORLD_N = 4;
    static final int D3DTS_MAX_TRANS = 5;
    private ARpg m_App;
    private Graphics m_Grp;
    private int m_nWidth;
    private int m_nHeight;
    private float m_fCenterX;
    private float m_fCenterY;
    private float m_fAdjustY;
    private D3DVIEWPORT8 m_cViewport;
    private float m_fMultX;
    private float m_fMultY;
    private D3DXMATRIX[] m_amMatTrans;
    private D3DXMATRIX m_mWVP = new D3DXMATRIX();
    private D3DXMATRIX m_mWVPNormal;
    private D3DXMATRIX m_mWorldBase = new D3DXMATRIX();
    private D3DXVECTOR3[] m_avCalcBuffer;
    private CSurfaceDraw[] m_acSurfDraw;
    private int[] m_anSortPoly;
    private float[] m_afSortPoly;
    static final float[] afPoiColTable = new float[]{0.0f, 0.1f, 0.2f, 0.3f, 0.4f, 0.3f, 0.2f, 0.1f};

    public void ViewTransform(D3DXVECTOR3 d3DXVECTOR3, D3DXVECTOR3 d3DXVECTOR32) {
        Vari.m_vEyeAt.Set(d3DXVECTOR32);
        D3DXVECTOR3 d3DXVECTOR33 = new D3DXVECTOR3(0.0f, 1.0f, 0.0f);
        D3DXMATRIX d3DXMATRIX = new D3DXMATRIX();
        d3DXMATRIX.View(d3DXVECTOR3, d3DXVECTOR32, d3DXVECTOR33);
        this.SetTransform(0, d3DXMATRIX);
        d3DXMATRIX.Identity();
        d3DXMATRIX.View(d3DXVECTOR32, d3DXVECTOR3, d3DXVECTOR33);
        this.SetTransform(1, d3DXMATRIX);
        this.m_vEyeVector.x = d3DXVECTOR32.x - d3DXVECTOR3.x;
        this.m_vEyeVector.y = d3DXVECTOR32.y - d3DXVECTOR3.y;
        this.m_vEyeVector.z = d3DXVECTOR32.z - d3DXVECTOR3.z;
        this.m_vEyeVector.Normalize();
    }

    public D3DXVECTOR3 CalcSurfaceCenterL(CModel cModel, CSurface cSurface, D3DXMATRIX d3DXMATRIX, int n) {
        int n2 = cSurface.GetVertNum();
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        int n3 = 0;
        while (n3 < n2) {
            d3DXVECTOR3.Add(cModel.GetVertex(cSurface.GetVertTable(n3)));
            ++n3;
        }
        d3DXVECTOR3.x /= (float)n2;
        d3DXVECTOR3.y /= (float)n2;
        d3DXVECTOR3.z /= (float)n2;
        if ((n & 1) != 0) {
            d3DXVECTOR3.x = -d3DXVECTOR3.x;
        }
        d3DXVECTOR3 = d3DXMATRIX.Transform(d3DXVECTOR3);
        return d3DXVECTOR3;
    }

    public void Create(ARpg aRpg, Graphics graphics) {
        this.m_App = aRpg;
        this.m_Grp = graphics;
    }

    public void GetColorGreen(D3DXCOLOR d3DXCOLOR) {
        float f = afPoiColTable[this.m_App.m_nBMainCount & 7];
        d3DXCOLOR.r = (int)((float)d3DXCOLOR.r * (-0.6f + f * 2.0f) + f * 10.0f + 0.0f);
        d3DXCOLOR.g = (int)((float)d3DXCOLOR.g * (1.3f - f * 2.0f) - f * 20.0f + 80.0f);
        d3DXCOLOR.b = (int)((float)d3DXCOLOR.r * (-0.6f + f * 2.0f) + f * 10.0f + 0.0f);
        d3DXCOLOR.Limits();
    }

    public void DrawLine(D3DXVECTOR3 d3DXVECTOR3, D3DXVECTOR3 d3DXVECTOR32) {
        this.m_Grp.drawLine((int)d3DXVECTOR3.x, (int)d3DXVECTOR3.y, (int)d3DXVECTOR32.x, (int)d3DXVECTOR32.y);
    }

    public int GetColorCode(int n, int n2) {
        if (n2 == 0) {
            return n;
        }
        int n3 = 0;
        while (true) {
            int n4 = CChrPrm.m_anColorXchg[n2 - 1][n3];
            ++n3;
            if (n4 == -1) {
                return n;
            }
            if (n4 == n) {
                return CChrPrm.m_anColorXchg[n2 - 1][n3];
            }
            ++n3;
        }
    }

    public D3DXMATRIX GetTransform(int n) {
        return this.m_amMatTrans[n];
    }

    public void Draw3DLine(D3DXVECTOR3 d3DXVECTOR3, D3DXVECTOR3 d3DXVECTOR32) {
        D3DXVECTOR3 d3DXVECTOR33 = this.Get3DPosBW(d3DXVECTOR3);
        D3DXVECTOR3 d3DXVECTOR34 = this.Get3DPosBW(d3DXVECTOR32);
        this.m_Grp.drawLine((int)d3DXVECTOR33.x, (int)d3DXVECTOR33.y, (int)d3DXVECTOR34.x, (int)d3DXVECTOR34.y);
    }

    public float GetCenterX() {
        return this.m_fCenterX;
    }

    public void SetColor(Color color) {
        this.m_Grp.setColor(color);
    }

    public void SetColor(D3DXCOLOR d3DXCOLOR) {
        this.m_Grp.setColor(new Color(d3DXCOLOR.r, d3DXCOLOR.g, d3DXCOLOR.b));
    }

    public D3DXMATRIX GetWVPMatrix() {
        return this.m_mWVP;
    }

    public void SetAdjustY(float f) {
        this.m_fAdjustY = f;
    }

    public void Clear() {
        this.SetColorBright(this.GetRenderStateC(9));
        this.m_Grp.fillRect(0, 0, this.m_nWidth, this.m_nHeight);
    }

    public void ProjTransform(float f, float f2) {
        D3DXMATRIX d3DXMATRIX = new D3DXMATRIX();
        d3DXMATRIX.Projection(f, f2, 0.5235988f, (float)this.m_nHeight / (float)this.m_nWidth);
        this.SetTransform(2, d3DXMATRIX);
    }

    public void SetColorBright(D3DXCOLOR d3DXCOLOR) {
        float f = this.GetWhite();
        if (Calc3D.NearZero(f)) {
            float f2 = this.GetBright();
            this.m_Grp.setColor(new Color((int)((float)d3DXCOLOR.r * f2), (int)((float)d3DXCOLOR.g * f2), (int)((float)d3DXCOLOR.b * f2)));
            return;
        }
        int n = d3DXCOLOR.r + (int)((float)(255 - d3DXCOLOR.r) * f);
        int n2 = d3DXCOLOR.g + (int)((float)(255 - d3DXCOLOR.g) * f);
        int n3 = d3DXCOLOR.b + (int)((float)(255 - d3DXCOLOR.b) * f);
        this.m_Grp.setColor(new Color(n, n2, n3));
    }

    public void DrawPolygon(CSurfaceDraw cSurfaceDraw) {
        this.SetColorBright(cSurfaceDraw.m_Col);
        if (cSurfaceDraw.GetVertNum() == 3) {
            int[] nArray = new int[]{(int)this.m_avCalcBuffer[cSurfaceDraw.GetVertTable((int)0)].x, (int)this.m_avCalcBuffer[cSurfaceDraw.GetVertTable((int)1)].x, (int)this.m_avCalcBuffer[cSurfaceDraw.GetVertTable((int)2)].x};
            int[] nArray2 = new int[]{(int)this.m_avCalcBuffer[cSurfaceDraw.GetVertTable((int)0)].y, (int)this.m_avCalcBuffer[cSurfaceDraw.GetVertTable((int)1)].y, (int)this.m_avCalcBuffer[cSurfaceDraw.GetVertTable((int)2)].y};
            this.m_Grp.fillPolygon(nArray, nArray2, 3);
            return;
        }
        int[] nArray = new int[]{(int)this.m_avCalcBuffer[cSurfaceDraw.GetVertTable((int)0)].x, (int)this.m_avCalcBuffer[cSurfaceDraw.GetVertTable((int)1)].x, (int)this.m_avCalcBuffer[cSurfaceDraw.GetVertTable((int)2)].x, (int)this.m_avCalcBuffer[cSurfaceDraw.GetVertTable((int)3)].x};
        int[] nArray3 = new int[]{(int)this.m_avCalcBuffer[cSurfaceDraw.GetVertTable((int)0)].y, (int)this.m_avCalcBuffer[cSurfaceDraw.GetVertTable((int)1)].y, (int)this.m_avCalcBuffer[cSurfaceDraw.GetVertTable((int)2)].y, (int)this.m_avCalcBuffer[cSurfaceDraw.GetVertTable((int)3)].y};
        this.m_Grp.fillPolygon(nArray, nArray3, 4);
    }

    public void GetColorStone(D3DXCOLOR d3DXCOLOR) {
        int n;
        d3DXCOLOR.r = n = (d3DXCOLOR.r + d3DXCOLOR.g + d3DXCOLOR.b) / 3;
        d3DXCOLOR.g = n;
        d3DXCOLOR.b = n;
        d3DXCOLOR.Limits();
    }

    public D3DXVECTOR3 CalcSurfaceCenterS(CSurface cSurface) {
        int n = cSurface.GetVertNum();
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        int n2 = 0;
        while (n2 < n) {
            d3DXVECTOR3.Add(this.m_avCalcBuffer[cSurface.GetVertTable(n2)]);
            ++n2;
        }
        d3DXVECTOR3.x /= (float)n;
        d3DXVECTOR3.y /= (float)n;
        d3DXVECTOR3.z /= (float)n;
        return d3DXVECTOR3;
    }

    public D3DXVECTOR3 Get3DPos(D3DXMATRIX d3DXMATRIX, D3DXVECTOR3 d3DXVECTOR3) {
        D3DXVECTOR3 d3DXVECTOR32 = d3DXMATRIX.Transform(d3DXVECTOR3);
        d3DXVECTOR32.x = -d3DXVECTOR32.x;
        float f = d3DXVECTOR32.z * 1.0E-6f;
        if (f >= 0.0f) {
            if (f < 1.0E-6f) {
                f = 1.0E-6f;
            }
        } else if (f > -1.0E-6f) {
            f = -1.0E-6f;
        }
        d3DXVECTOR32.x = d3DXVECTOR32.x / f * this.m_fMultX;
        d3DXVECTOR32.y = -d3DXVECTOR32.y / f * this.m_fMultY;
        d3DXVECTOR32.x += this.m_fCenterX;
        d3DXVECTOR32.y += this.m_fCenterY + this.m_fAdjustY;
        return d3DXVECTOR32;
    }

    public void SetViewport(D3DVIEWPORT8 d3DVIEWPORT8) {
        this.m_cViewport.Set(d3DVIEWPORT8);
        this.m_nWidth = this.m_cViewport.Width;
        this.m_nHeight = this.m_cViewport.Height;
        this.m_fCenterX = this.m_nWidth / 2;
        this.m_fCenterY = this.m_nHeight / 2;
        this.m_fAdjustY = 0.0f;
        this.m_fMultX = (float)this.m_nWidth * 1.0E-6f;
        this.m_fMultY = (float)this.m_nHeight * 1.0E-6f;
    }

    public D3DXMATRIX GetNormalWVP() {
        return this.m_mWVPNormal;
    }

    public D3DXVECTOR3 CalcNormal(D3DXVECTOR3 d3DXVECTOR3, D3DXVECTOR3 d3DXVECTOR32, D3DXVECTOR3 d3DXVECTOR33) {
        D3DXVECTOR3 d3DXVECTOR34 = new D3DXVECTOR3();
        D3DXVECTOR3 d3DXVECTOR35 = new D3DXVECTOR3();
        d3DXVECTOR34.x = d3DXVECTOR3.x - d3DXVECTOR32.x;
        d3DXVECTOR34.y = d3DXVECTOR3.y - d3DXVECTOR32.y;
        d3DXVECTOR34.z = d3DXVECTOR3.z - d3DXVECTOR32.z;
        d3DXVECTOR35.x = d3DXVECTOR3.x - d3DXVECTOR33.x;
        d3DXVECTOR35.y = d3DXVECTOR3.y - d3DXVECTOR33.y;
        d3DXVECTOR35.z = d3DXVECTOR3.z - d3DXVECTOR33.z;
        D3DXVECTOR3 d3DXVECTOR36 = new D3DXVECTOR3();
        d3DXVECTOR36.CrossProduct(d3DXVECTOR34, d3DXVECTOR35);
        d3DXVECTOR36.Normalize();
        return d3DXVECTOR36;
    }

    public D3DXCOLOR PolygonColor(MATERIAL mATERIAL, D3DXVECTOR3 d3DXVECTOR3, D3DXVECTOR3 d3DXVECTOR32, D3DXVECTOR3 d3DXVECTOR33, int n) {
        D3DXCOLOR d3DXCOLOR = new D3DXCOLOR();
        D3DXCOLOR d3DXCOLOR2 = this.GetRenderStateC(10);
        this.GetRenderStateC(8);
        float f = this.CalcLightRatio(d3DXVECTOR3, d3DXVECTOR33, n);
        float f2 = (float)d3DXCOLOR2.r / 255.0f;
        float f3 = (float)d3DXCOLOR2.g / 255.0f;
        float f4 = (float)d3DXCOLOR2.b / 255.0f;
        float f5 = f * f2 + this.m_fAmbPowR;
        float f6 = f * f3 + this.m_fAmbPowG;
        float f7 = f * f4 + this.m_fAmbPowB;
        d3DXCOLOR.r = (int)((float)mATERIAL.m_Col.r * f5);
        d3DXCOLOR.g = (int)((float)mATERIAL.m_Col.g * f6);
        d3DXCOLOR.b = (int)((float)mATERIAL.m_Col.b * f7);
        if (!Calc3D.NearZero(mATERIAL.m_fSpc)) {
            float f8 = this.CalcSpcRatio(d3DXVECTOR3, d3DXVECTOR33);
            int n2 = (int)(mATERIAL.m_fSpc * f8 * 256.0f);
            d3DXCOLOR.r += n2;
            d3DXCOLOR.g += n2;
            d3DXCOLOR.b += n2;
        }
        if (this.GetRenderStateN(4) != 0) {
            D3DXCOLOR d3DXCOLOR3 = this.GetRenderStateC(7);
            float f9 = this.CalcFogRatio(d3DXVECTOR32);
            float f10 = 1.0f - f9;
            d3DXCOLOR.r = (int)((float)d3DXCOLOR.r * f10 + (float)d3DXCOLOR3.r * f9);
            d3DXCOLOR.g = (int)((float)d3DXCOLOR.g * f10 + (float)d3DXCOLOR3.g * f9);
            d3DXCOLOR.b = (int)((float)d3DXCOLOR.b * f10 + (float)d3DXCOLOR3.b * f9);
        }
        d3DXCOLOR.Limits();
        return d3DXCOLOR;
    }

    public D3DXMATRIX MakeWVPMatrix() {
        this.m_mWVP.Identity();
        this.m_mWVP.Mult(this.GetTransform(3));
        this.m_mWVP.Mult(this.GetTransform(0));
        this.m_mWVP.Mult(this.GetTransform(2));
        return this.m_mWVP;
    }

    public void SetTransform(int n, D3DXMATRIX d3DXMATRIX) {
        this.m_amMatTrans[n].Set(d3DXMATRIX);
        if (n == 0 || n == 2) {
            this.m_mWorldBase.Identity();
            this.m_mWorldBase.Mult(this.GetTransform(0));
            this.m_mWorldBase.Mult(this.GetTransform(2));
        }
    }

    public void GetColorPoison(D3DXCOLOR d3DXCOLOR) {
        float f = afPoiColTable[this.m_App.m_nBMainCount & 7];
        d3DXCOLOR.r = (int)((float)d3DXCOLOR.r * (0.8f + f));
        d3DXCOLOR.g = (int)((float)d3DXCOLOR.g * 0.7f);
        d3DXCOLOR.r = (int)((float)d3DXCOLOR.b * (1.4f - f));
        d3DXCOLOR.Limits();
    }

    public void GetColorYellow(D3DXCOLOR d3DXCOLOR) {
        float f = afPoiColTable[this.m_App.m_nBMainCount & 7];
        d3DXCOLOR.r = (int)((float)d3DXCOLOR.r * (1.2f + f) + f * 25.0f + 100.0f);
        d3DXCOLOR.g = (int)((float)d3DXCOLOR.g * (1.6f - f) - f * 25.0f + 150.0f);
        d3DXCOLOR.b = (int)((float)d3DXCOLOR.b * 0.5f);
        d3DXCOLOR.Limits();
    }

    CRender3D() {
        this.m_mWVPNormal = new D3DXMATRIX();
        this.m_amMatTrans = new D3DXMATRIX[5];
        int n = 0;
        do {
            this.m_amMatTrans[n] = new D3DXMATRIX();
        } while (++n < 5);
        this.m_avCalcBuffer = new D3DXVECTOR3[2048];
        n = 0;
        do {
            this.m_avCalcBuffer[n] = new D3DXVECTOR3();
        } while (++n < 2048);
        this.m_acSurfDraw = new CSurfaceDraw[1024];
        n = 0;
        do {
            this.m_acSurfDraw[n] = new CSurfaceDraw();
        } while (++n < 1024);
        this.m_anSortPoly = new int[1024];
        this.m_afSortPoly = new float[1024];
        this.m_cViewport = new D3DVIEWPORT8();
    }

    public void DrawShadow(D3DXVECTOR3 d3DXVECTOR3, float f, float f2) {
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3(d3DXVECTOR3.x, 0.0f, d3DXVECTOR3.z);
        this.SetColorBright(new D3DXCOLOR(32, 32, 32));
        D3DXVECTOR3 d3DXVECTOR33 = new D3DXVECTOR3();
        d3DXVECTOR33.x = d3DXVECTOR32.x + Calc3D.Sin(f2 + 1.5707964f) * f;
        d3DXVECTOR33.y = d3DXVECTOR32.y;
        d3DXVECTOR33.z = d3DXVECTOR32.z + Calc3D.Cos(f2 + 1.5707964f) * f;
        d3DXVECTOR33 = this.Get3DPosBW(d3DXVECTOR33);
        int n = (int)d3DXVECTOR33.x;
        d3DXVECTOR33.x = d3DXVECTOR32.x + Calc3D.Sin(f2 + 4.712389f) * f;
        d3DXVECTOR33.y = d3DXVECTOR32.y;
        d3DXVECTOR33.z = d3DXVECTOR32.z + Calc3D.Cos(f2 + 4.712389f) * f;
        d3DXVECTOR33 = this.Get3DPosBW(d3DXVECTOR33);
        int n2 = (int)d3DXVECTOR33.x - n;
        d3DXVECTOR33.x = d3DXVECTOR32.x + Calc3D.Sin(f2) * f;
        d3DXVECTOR33.y = d3DXVECTOR32.y;
        d3DXVECTOR33.z = d3DXVECTOR32.z + Calc3D.Cos(f2) * f;
        d3DXVECTOR33 = this.Get3DPosBW(d3DXVECTOR33);
        int n3 = (int)d3DXVECTOR33.y;
        d3DXVECTOR33.x = d3DXVECTOR32.x + Calc3D.Sin(f2 + (float)Math.PI) * f;
        d3DXVECTOR33.y = d3DXVECTOR32.y;
        d3DXVECTOR33.z = d3DXVECTOR32.z + Calc3D.Cos(f2 + (float)Math.PI) * f;
        d3DXVECTOR33 = this.Get3DPosBW(d3DXVECTOR33);
        int n4 = (int)d3DXVECTOR33.y - n3;
        this.m_Grp.fillOval(n, n3, n2, n4);
    }

    public ARpg GetApplet() {
        return this.m_App;
    }

    public void Present() {
    }

    public void CalcModel(CModel cModel, CCalcBndBox cCalcBndBox, D3DXVECTOR3 d3DXVECTOR3, D3DXVECTOR3 d3DXVECTOR32, D3DXVECTOR3 d3DXVECTOR33, int n) {
        D3DXMATRIX d3DXMATRIX = new D3DXMATRIX();
        D3DXMATRIX d3DXMATRIX2 = new D3DXMATRIX();
        D3DXMATRIX d3DXMATRIX3 = new D3DXMATRIX();
        D3DXMATRIX d3DXMATRIX4 = new D3DXMATRIX();
        D3DXMATRIX d3DXMATRIX5 = new D3DXMATRIX();
        d3DXMATRIX2.Transrate(d3DXVECTOR3.x, d3DXVECTOR3.y, d3DXVECTOR3.z);
        if (!Calc3D.NearZero(d3DXVECTOR32.x)) {
            d3DXMATRIX3.RotateX(d3DXVECTOR32.x);
        }
        d3DXMATRIX4.RotateY(d3DXVECTOR32.y);
        if (!Calc3D.NearZero(d3DXVECTOR32.z)) {
            d3DXMATRIX5.RotateZ(d3DXVECTOR32.z);
        }
        d3DXMATRIX.Scale(d3DXVECTOR33.x, d3DXVECTOR33.y, d3DXVECTOR33.z);
        if (!Calc3D.NearZero(d3DXVECTOR32.x)) {
            d3DXMATRIX.Mult(d3DXMATRIX3);
        }
        if (!Calc3D.NearZero(d3DXVECTOR32.z)) {
            d3DXMATRIX.Mult(d3DXMATRIX5);
        }
        d3DXMATRIX.Mult(d3DXMATRIX4);
        d3DXMATRIX.Mult(d3DXMATRIX2);
        this.SetTransform(3, d3DXMATRIX);
        this.MakeWVPMatrix();
        this.MakeNormalWVP();
        if (n == 0) {
            cModel.GetBoundingBox().Calc(this, this.m_mWVP, cCalcBndBox);
            return;
        }
        if (n == 1) {
            cModel.GetBoundingBox().CalcPlane(this, this.m_mWVP, cCalcBndBox);
        }
    }

    public D3DXVECTOR3 Get3DPosBW(D3DXVECTOR3 d3DXVECTOR3) {
        return this.Get3DPos(this.m_mWorldBase, d3DXVECTOR3);
    }

    public void DrawModel(CModel cModel, CModelTrans cModelTrans, int n, int n2) {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        int n3 = 0;
        while (n3 < cModel.GetVertNum()) {
            d3DXVECTOR3.Set(cModel.GetVertex(n3));
            if ((n & 1) != 0) {
                d3DXVECTOR3.x = -d3DXVECTOR3.x;
            }
            d3DXVECTOR3 = this.Get3DPos(cModelTrans.m_mWVP, d3DXVECTOR3);
            this.m_avCalcBuffer[n3].Set(d3DXVECTOR3);
            ++n3;
        }
        D3DXMATRIX d3DXMATRIX = new D3DXMATRIX();
        this.m_mWVPNormal.Identity();
        d3DXMATRIX.Mult3(cModelTrans.m_mWorld);
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        int n4 = 0;
        int n5 = 0;
        while (n5 < cModel.GetSurfNum()) {
            block27: {
                D3DXVECTOR3 d3DXVECTOR33;
                MATERIAL mATERIAL;
                int n6;
                CSurface cSurface;
                block29: {
                    block28: {
                        cSurface = cModel.GetSurface(n5);
                        n6 = cSurface.GetVertNum();
                        int n7 = this.GetColorCode(cSurface.m_nMat, n2);
                        if (n7 == -1) break block27;
                        mATERIAL = cModel.GetMaterial(n7);
                        d3DXVECTOR33 = this.CalcNormal(this.m_avCalcBuffer[cSurface.GetVertTable(0)], this.m_avCalcBuffer[cSurface.GetVertTable(1)], this.m_avCalcBuffer[cSurface.GetVertTable(2)]);
                        if ((n & 1) != 0) {
                            d3DXVECTOR33.x = -d3DXVECTOR33.x;
                            d3DXVECTOR33.y = -d3DXVECTOR33.y;
                            d3DXVECTOR33.z = -d3DXVECTOR33.z;
                        }
                        if (!(d3DXVECTOR33.z < -0.1f)) break block28;
                        if ((mATERIAL.m_nFlag & 0x10) == 0) break block27;
                        d3DXVECTOR33.x = -d3DXVECTOR33.x;
                        d3DXVECTOR33.y = -d3DXVECTOR33.y;
                        d3DXVECTOR33.z = -d3DXVECTOR33.z;
                    }
                    if ((n & 0x200) == 0) break block29;
                    int n8 = 0;
                    int n9 = 0;
                    while (n9 < cSurface.m_nVertNum) {
                        d3DXVECTOR3.Set(cModel.GetVertex(cSurface.m_anVertPtr[n9]));
                        if (d3DXVECTOR3.y + cModelTrans.m_mWorld.GetTransrateY() >= 0.0f) {
                            ++n8;
                        }
                        ++n9;
                    }
                    if (n8 == 0) break block27;
                }
                D3DXVECTOR3 d3DXVECTOR34 = this.CalcSurfaceCenterL(cModel, cSurface, cModelTrans.m_mWorld, n);
                D3DXVECTOR3 d3DXVECTOR35 = this.CalcSurfaceCenterS(cSurface);
                d3DXVECTOR32.Set(cSurface.GetNormal());
                if ((n & 1) != 0) {
                    d3DXVECTOR32.x = -d3DXVECTOR32.x;
                }
                d3DXVECTOR32 = d3DXMATRIX.Transform(d3DXVECTOR32);
                this.m_acSurfDraw[n4].m_vNormal.Set(d3DXVECTOR33);
                this.m_acSurfDraw[n4].m_nVertNum = n6;
                this.m_acSurfDraw[n4].m_anVertPtr[0] = cSurface.GetVertTable(0);
                this.m_acSurfDraw[n4].m_anVertPtr[1] = cSurface.GetVertTable(1);
                this.m_acSurfDraw[n4].m_anVertPtr[2] = cSurface.GetVertTable(2);
                this.m_acSurfDraw[n4].m_anVertPtr[3] = cSurface.GetVertTable(3);
                D3DXCOLOR d3DXCOLOR = new D3DXCOLOR();
                if ((n & 2) != 0) {
                    d3DXCOLOR.Set(mATERIAL.m_Col);
                } else {
                    d3DXCOLOR = this.PolygonColor(mATERIAL, d3DXVECTOR34, d3DXVECTOR35, d3DXVECTOR32, n);
                }
                if ((n & 0x10) != 0) {
                    this.GetColorPoison(d3DXCOLOR);
                } else if ((n & 0x800) != 0) {
                    this.GetColorStone(d3DXCOLOR);
                } else if ((n & 0x40) != 0) {
                    this.GetColorYellow(d3DXCOLOR);
                } else if ((n & 0x1000) != 0) {
                    this.GetColorGreen(d3DXCOLOR);
                }
                this.m_acSurfDraw[n4].m_Col = d3DXCOLOR;
                this.m_anSortPoly[n4] = n4;
                this.m_afSortPoly[n4] = d3DXVECTOR35.z;
                if ((mATERIAL.m_nFlag & 1) != 0) {
                    int n10 = n4;
                    this.m_afSortPoly[n10] = this.m_afSortPoly[n10] - 100.0f;
                }
                if ((mATERIAL.m_nFlag & 2) != 0) {
                    int n11 = n4;
                    this.m_afSortPoly[n11] = this.m_afSortPoly[n11] - 1000.0f;
                }
                if ((mATERIAL.m_nFlag & 4) != 0) {
                    int n12 = n4;
                    this.m_afSortPoly[n12] = this.m_afSortPoly[n12] + 100.0f;
                }
                if ((mATERIAL.m_nFlag & 8) != 0) {
                    int n13 = n4;
                    this.m_afSortPoly[n13] = this.m_afSortPoly[n13] + 1000.0f;
                }
                ++n4;
            }
            ++n5;
        }
        int n14 = 0;
        while (n14 < n4 - 1) {
            int n15 = n14 + 1;
            while (n15 < n4) {
                if (this.m_afSortPoly[n14] < this.m_afSortPoly[n15]) {
                    n5 = this.m_anSortPoly[n14];
                    this.m_anSortPoly[n14] = this.m_anSortPoly[n15];
                    this.m_anSortPoly[n15] = n5;
                    float f = this.m_afSortPoly[n14];
                    this.m_afSortPoly[n14] = this.m_afSortPoly[n15];
                    this.m_afSortPoly[n15] = f;
                }
                ++n15;
            }
            ++n14;
        }
        n14 = 0;
        while (n14 < n4) {
            this.DrawPolygon(this.m_acSurfDraw[this.m_anSortPoly[n14]]);
            ++n14;
        }
    }

    public D3DXMATRIX MakeNormalWVP() {
        this.m_mWVPNormal.Identity();
        this.m_mWVPNormal.Mult3(this.GetTransform(0));
        return this.m_mWVPNormal;
    }
}

