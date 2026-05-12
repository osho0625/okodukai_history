/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CFadeIn {
    public ARpg m_App;
    public D3DLIGHT8 m_liPush = new D3DLIGHT8();
    private D3DLIGHT8 m_liStart = new D3DLIGHT8();
    private D3DLIGHT8 m_liEnd = new D3DLIGHT8();
    private D3DLIGHT8 m_liXChg = new D3DLIGHT8();
    private int m_nXChgCount = -1;
    private int m_nXChgMax;
    private int m_nFogMode;
    private D3DXCOLOR m_cAmbient = new D3DXCOLOR();

    CFadeIn(ARpg aRpg) {
        this.m_App = aRpg;
    }

    public void FadeIn(int n) {
        int n2 = 0;
        while (n2 < n) {
            this.m_App.m_Render.SetBright(1.0f * (float)n2 / (float)n);
            this.DrawDisplay();
            ++n2;
        }
        this.m_App.m_Render.SetBright(1.0f);
    }

    public void FogOff() {
        this.m_nFogMode = this.m_App.m_Render.GetRenderStateN(4);
        this.m_App.m_Render.SetRenderState(4, 0);
    }

    public void DrawDisplay() {
        this.m_App.DrawDisplay();
        this.m_App.DoFrame();
        this.m_App.WaitRepaint(this.m_App.GetWaitFrame());
    }

    public void WhiteOut(int n) {
        int n2 = 0;
        while (n2 < n) {
            this.m_App.m_Render.SetWhite(1.0f - 1.0f * (float)n2 / (float)n);
            this.DrawDisplay();
            ++n2;
        }
        this.m_App.m_Render.SetWhite(0.0f);
    }

    public boolean IsFade() {
        return !Calc3D.NearZero(this.m_App.m_Render.GetBright() - 1.0f) || !Calc3D.NearZero(this.m_App.m_Render.GetWhite());
    }

    public void WhiteIn(int n) {
        int n2 = 0;
        while (n2 < n) {
            this.m_App.m_Render.SetWhite(1.0f * (float)n2 / (float)n);
            this.DrawDisplay();
            ++n2;
        }
        this.m_App.m_Render.SetWhite(1.0f);
    }

    public void Frame() {
        if (this.m_nXChgCount == -1) {
            return;
        }
        float f = (float)(this.m_nXChgCount + 1) / (float)this.m_nXChgMax;
        float f2 = 1.0f - f;
        this.m_liXChg.m_cDiffuse.r = (int)((float)this.m_liStart.m_cDiffuse.r * f2 + (float)this.m_liEnd.m_cDiffuse.r * f);
        this.m_liXChg.m_cDiffuse.g = (int)((float)this.m_liStart.m_cDiffuse.g * f2 + (float)this.m_liEnd.m_cDiffuse.g * f);
        this.m_liXChg.m_cDiffuse.b = (int)((float)this.m_liStart.m_cDiffuse.b * f2 + (float)this.m_liEnd.m_cDiffuse.b * f);
        this.m_liXChg.m_vPosition.x = this.m_liStart.m_vPosition.x * f2 + this.m_liEnd.m_vPosition.x * f;
        this.m_liXChg.m_vPosition.y = this.m_liStart.m_vPosition.y * f2 + this.m_liEnd.m_vPosition.y * f;
        this.m_liXChg.m_vPosition.z = this.m_liStart.m_vPosition.z * f2 + this.m_liEnd.m_vPosition.z * f;
        this.m_liXChg.m_vDirection.x = this.m_liStart.m_vDirection.x * f2 + this.m_liEnd.m_vDirection.x * f;
        this.m_liXChg.m_vDirection.y = this.m_liStart.m_vDirection.y * f2 + this.m_liEnd.m_vDirection.y * f;
        this.m_liXChg.m_vDirection.z = this.m_liStart.m_vDirection.z * f2 + this.m_liEnd.m_vDirection.z * f;
        this.m_liXChg.m_fRange = this.m_liStart.m_fRange * f2 + this.m_liEnd.m_fRange * f;
        this.m_liXChg.m_Flag.Set(this.m_liEnd.m_Flag);
        this.m_App.m_Render.SetLight(this.m_liXChg);
        ++this.m_nXChgCount;
        if (this.m_nXChgCount >= this.m_nXChgMax) {
            this.m_nXChgCount = -1;
        }
    }

    public void AmbientOn() {
        this.m_App.m_Render.SetRenderState(8, this.m_cAmbient);
    }

    public void XChgColor(D3DLIGHT8 d3DLIGHT8, D3DLIGHT8 d3DLIGHT82, int n) {
        this.m_liStart.Set(d3DLIGHT8);
        this.m_liEnd.Set(d3DLIGHT82);
        this.m_liXChg.m_nType = this.m_liEnd.m_nType;
        this.m_nXChgCount = 0;
        this.m_nXChgMax = n;
    }

    public void AmbientOff() {
        this.m_cAmbient.Set(this.m_App.m_Render.GetRenderStateC(8));
        D3DXCOLOR d3DXCOLOR = new D3DXCOLOR(0, 0, 0);
        this.m_App.m_Render.SetRenderState(8, d3DXCOLOR);
    }

    public void FogOn() {
        this.m_App.m_Render.SetRenderState(4, this.m_nFogMode);
    }

    public void PushLight() {
        D3DLIGHT8 d3DLIGHT8 = this.m_App.m_Render.GetLight();
        this.m_liPush.Set(d3DLIGHT8);
    }

    public void PopLight() {
        this.m_App.m_Render.SetLight(this.m_liPush);
    }

    public void WhiteToBlack(int n) {
        int n2 = 0;
        while (n2 < n) {
            int n3 = 255 * (n - n2 - 1) / n;
            this.m_App.SetColor(new Color(n3, n3, n3));
            this.m_App.FillRect(0, 0, 400, 320);
            this.m_App.DoFrame();
            this.m_App.WaitRepaint(this.m_App.GetWaitFrame());
            ++n2;
        }
        this.m_App.m_Render.SetWhite(0.0f);
        this.m_App.m_Render.SetBright(0.0f);
    }

    public void Init() {
        this.m_App.m_Render.SetBright(1.0f);
        this.m_App.m_Render.SetWhite(0.0f);
    }

    public void FadeOut(int n) {
        int n2 = 0;
        while (n2 < n) {
            this.m_App.m_Render.SetBright(1.0f - 1.0f * (float)n2 / (float)n);
            this.DrawDisplay();
            ++n2;
        }
        this.m_App.m_Render.SetBright(0.0f);
    }

    CFadeIn() {
        this.m_nXChgCount = -1;
    }
}

