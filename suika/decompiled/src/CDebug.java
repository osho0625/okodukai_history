/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CDebug {
    static final float CAMERA_Y_MAX = 1.3962634f;
    private ARpg m_App;
    private CRender3D m_Render;
    private D3DXVECTOR3 m_vOri = new D3DXVECTOR3(0.0f, 0.0f, 0.0f);
    private D3DXVECTOR3 m_vGrX = new D3DXVECTOR3(100.0f, 0.0f, 0.0f);
    private D3DXVECTOR3 m_vGrY = new D3DXVECTOR3(0.0f, 100.0f, 0.0f);
    private D3DXVECTOR3 m_vGrZ = new D3DXVECTOR3(0.0f, 0.0f, 100.0f);
    private float m_fCam;
    private float m_fCameraDist = 1600.0f;
    private float m_fCameraXZ;
    private float m_fCameraY = 0.5235988f;
    public D3DXVECTOR3 m_vCameraPos = new D3DXVECTOR3();
    public D3DXVECTOR3 m_vCameraAt = new D3DXVECTOR3();
    public int m_nDrawGround;
    public float m_fFPS;
    public int m_nFPScount;
    static long m_fFPStime;

    public void DrawFrameRate() {
        ++this.m_nFPScount;
        if (this.m_nFPScount >= 20) {
            this.m_fFPS = 1000.0f / ((float)(System.currentTimeMillis() - m_fFPStime) / 20.0f);
            m_fFPStime = System.currentTimeMillis();
            this.m_nFPScount -= 20;
        }
        this.m_App.DrawFont(32, 32, "FPS " + this.m_fFPS, 16, Color.white);
        this.m_App.DrawFont(32, 300, "Window " + this.m_App.GetWindowNum(), 16, Color.white);
    }

    public void DrawGrid() {
        D3DXVECTOR3 d3DXVECTOR3 = this.m_Render.Get3DPosBW(this.m_vOri);
        D3DXVECTOR3 d3DXVECTOR32 = this.m_Render.Get3DPosBW(this.m_vGrX);
        D3DXVECTOR3 d3DXVECTOR33 = this.m_Render.Get3DPosBW(this.m_vGrY);
        D3DXVECTOR3 d3DXVECTOR34 = this.m_Render.Get3DPosBW(this.m_vGrZ);
        this.m_App.DrawFontC((int)d3DXVECTOR32.x, (int)d3DXVECTOR32.y, "X", 16, Color.blue);
        this.m_Render.DrawLine(d3DXVECTOR3, d3DXVECTOR32);
        this.m_App.DrawFontC((int)d3DXVECTOR33.x, (int)d3DXVECTOR33.y, "Y", 16, Color.red);
        this.m_Render.DrawLine(d3DXVECTOR3, d3DXVECTOR33);
        this.m_App.DrawFontC((int)d3DXVECTOR34.x, (int)d3DXVECTOR34.y, "Z", 16, Color.green);
        this.m_Render.DrawLine(d3DXVECTOR3, d3DXVECTOR34);
    }

    public void DrawNormal(D3DXVECTOR3 d3DXVECTOR3, D3DXVECTOR3 d3DXVECTOR32) {
        D3DXVECTOR3 d3DXVECTOR33 = new D3DXVECTOR3();
        d3DXVECTOR33.x = d3DXVECTOR3.x + d3DXVECTOR32.x * 100.0f;
        d3DXVECTOR33.y = d3DXVECTOR3.y + d3DXVECTOR32.y * 100.0f;
        d3DXVECTOR33.z = d3DXVECTOR3.z + d3DXVECTOR32.z * 100.0f;
        this.m_Render.SetColor(Color.white);
        this.m_Render.DrawLine(d3DXVECTOR3, d3DXVECTOR33);
        this.m_App.DrawFontC((int)d3DXVECTOR33.x, (int)d3DXVECTOR33.y, "N", 16, Color.white);
    }

    CDebug() {
    }

    CDebug(ARpg aRpg, CRender3D cRender3D) {
        this.m_App = aRpg;
        this.m_Render = cRender3D;
        m_fFPStime = System.currentTimeMillis();
    }

    public void DrawInfo() {
        String string = "X: " + CMapData.GetXBlock(this.m_App.m_Player.m_vPos.x);
        this.m_App.DrawFont(20, 20, string, 16, Color.white);
        string = "Z: " + CMapData.GetZBlock(this.m_App.m_Player.m_vPos.z);
        this.m_App.DrawFont(20, 40, string, 16, Color.white);
    }

    public void DebugCameraControl() {
        if (this.m_App.m_bKeyUp) {
            this.m_fCameraY += Calc3D.DEGtoRAD(10.0f);
        }
        if (this.m_App.m_bKeyDown) {
            this.m_fCameraY -= Calc3D.DEGtoRAD(10.0f);
        }
        if (this.m_App.m_bKeyLeft) {
            this.m_fCameraXZ += Calc3D.DEGtoRAD(10.0f);
        }
        if (this.m_App.m_bKeyRight) {
            this.m_fCameraXZ -= Calc3D.DEGtoRAD(10.0f);
        }
        this.m_fCameraXZ = Calc3D.RadLimits(this.m_fCameraXZ);
        if (this.m_fCameraY > 1.3962634f) {
            this.m_fCameraY = 1.3962634f;
        }
        if (this.m_fCameraY < -1.3962634f) {
            this.m_fCameraY = -1.3962634f;
        }
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.y = Calc3D.Sin(this.m_fCameraY) * this.m_fCameraDist;
        float f = Calc3D.Cos(this.m_fCameraY) * this.m_fCameraDist;
        d3DXVECTOR3.x = Calc3D.Sin(this.m_fCameraXZ) * f;
        d3DXVECTOR3.z = Calc3D.Cos(this.m_fCameraXZ) * f;
        this.m_App.m_Render.ViewTransform(d3DXVECTOR3, new D3DXVECTOR3(0.0f, 0.0f, 0.0f));
    }
}

