/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CStaffRoll {
    static final int ENDFRAME = 450;
    static final float VIEWPOS_DIST = -2400.0f;
    static final float VIEWPOS_YADD = 2160.0f;
    static final float VIEWAT_YADD = 50.0f;
    static final int FONTSIZE = 20;
    static final int MAXTEXT = 31;
    static final String[] STAFF_TEXT = new String[]{"", "\u3000\u3000\u3000\u3000\u3000\u3059\u3044\u304b\u304c\u98df\u3079\u305f\u3044", "", "", "", "", "\u30b2\u30fc\u30e0\u30c7\u30b6\u30a4\u30f3\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u304f\u308d\u3059\u3051", "", "", "\u30d7\u30ed\u30b0\u30e9\u30e0\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u304f\u308d\u3059\u3051", "", "", "\u30b7\u30ca\u30ea\u30aa\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u304f\u308d\u3059\u3051", "", "", "\u30b0\u30e9\u30d5\u30a3\u30c3\u30af\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u304f\u308d\u3059\u3051", "", "", "", "", "\u30b9\u30da\u30b7\u30e3\u30eb\u30b5\u30f3\u30af\u30b9", "\u3000\u3000\u3000\u3000\u30d7\u30ec\u30a4\u3057\u3066\u304f\u3060\u3055\u3063\u305f\u307f\u306a\u3055\u307e", "", "", "", "", "", "", "", "", "\uff12\uff10\uff10\uff12\uff0d\uff12\uff10\uff10\uff18\u3000\u3000\u3000\u304d\u3083\u3068\u307f\u3085\u3046"};
    private static int m_nCount;
    private static float m_fCamera;
    private static int m_nAddZ;
    private static int m_nMode;

    public static void DrawStaff() {
        int n;
        if ((n = ++m_nCount) > 390) {
            n = 390;
        }
        int n2 = 330 - n * 2;
        int n3 = 0;
        do {
            if (n2 >= -22 && n2 <= 322) {
                CStaffRoll.DrawFont(20, n2, STAFF_TEXT[n3]);
            }
            n2 += 20;
        } while (++n3 < 31);
    }

    public static void SetCamera() {
        if (m_nCount >= 60 && m_nCount < 80) {
            m_fCamera -= 0.05f;
        }
        if (m_nCount >= 140 && m_nCount < 160) {
            m_fCamera -= 0.05f;
        }
        if (m_nCount >= 220 && m_nCount < 240) {
            m_fCamera -= 0.05f;
        }
        if (m_nCount >= 300 && m_nCount < 320) {
            m_fCamera -= 0.05f;
        }
        if (m_fCamera < 0.0f) {
            m_fCamera += (float)Math.PI * 2;
        }
        Vari.m_App.m_Flag.SetCameraVect1(m_fCamera);
        CChrWork cChrWork = Vari.GetChrWork(8);
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.Set(cChrWork.m_vPos);
        d3DXVECTOR3.x += Calc3D.Sin(m_fCamera) * -2400.0f;
        d3DXVECTOR3.y += 2160.0f;
        d3DXVECTOR3.z += Calc3D.Cos(m_fCamera) * -2400.0f;
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        d3DXVECTOR32.Set(cChrWork.m_vPos);
        d3DXVECTOR32.y += 50.0f;
        Vari.m_App.m_Render.ViewTransform(d3DXVECTOR3, d3DXVECTOR32);
    }

    public static void Run(int n) {
        m_nMode = n;
        m_nAddZ = n == 0 ? 0 : 11;
        CStaffRoll.Start();
        if (n == 1) {
            Vari.m_App.m_Play.SetEvtFlag(330);
        }
        do {
            CStaffRoll.MoveChr();
            CStaffRoll.MainFrame();
        } while (m_nCount <= 450);
        CStaffRoll.End();
    }

    public static void DrawFont(int n, int n2, String string) {
        Vari.m_App.SetFontSize(20);
        int n3 = 0;
        while (n3 < string.length()) {
            int n4 = n + n3 * 20;
            String string2 = string.substring(n3, n3 + 1);
            Vari.m_App.SetColor(Color.black);
            Vari.m_App.DrawFont(n4 + 1, n2 + 1, string2);
            Vari.m_App.DrawFont(n4 - 1, n2 - 1, string2);
            Vari.m_App.DrawFont(n4 - 1, n2 + 1, string2);
            Vari.m_App.DrawFont(n4 + 1, n2 - 1, string2);
            Vari.m_App.SetColor(Color.white);
            Vari.m_App.DrawFont(n4, n2, string2);
            ++n3;
        }
    }

    public static void FadeInOut() {
        if (m_nCount <= 10) {
            Vari.m_App.m_Render.SetBright((float)m_nCount / 10.0f);
            return;
        }
        if (m_nCount >= 440) {
            int n = m_nCount - 440;
            Vari.m_App.m_Render.SetBright(1.0f - (float)n / 10.0f);
        }
    }

    static {
        m_fCamera = (float)Math.PI;
    }

    CStaffRoll() {
    }

    public static void End() {
        Vari.m_App.WaitRepaint(1000);
        Vari.m_App.SetColor(Color.black);
        Vari.m_App.FillRect(0, 0, 400, 320);
        Vari.m_App.WaitRepaint(1000);
        Vari.m_SysFlag.ResetFlag(16);
        Vari.m_App.m_Flag.SetCameraVect1((float)Math.PI);
    }

    public static void MoveChr() {
        CChrWork cChrWork;
        int[] nArray = new int[]{0, 1, 2, 8};
        int n = 0;
        do {
            cChrWork = Vari.GetChrWork(nArray[n]);
            cChrWork.m_vPos.x -= 35.0f;
        } while (++n < 4);
        cChrWork = Vari.GetChrWork(8);
        float f = 1000.0f;
        float f2 = 10200.0f;
        if (m_nMode == 1) {
            f2 = 1600.0f;
        }
        if (cChrWork.m_vPos.x < f) {
            int n2 = 0;
            do {
                cChrWork = Vari.GetChrWork(nArray[n2]);
                cChrWork.m_vPos.x += f2;
            } while (++n2 < 4);
        }
    }

    public static void Start() {
        m_nCount = 0;
        m_fCamera = (float)Math.PI;
        Vari.m_SysFlag.SetFlag(16);
        Vari.SetSysFlag(1);
        Vari.m_App.m_Game.XChgArea(83, 54, 5 + m_nAddZ, 3);
        Vari.ResetSysFlag(1);
        CChrWork cChrWork = Vari.GetChrWork(1);
        cChrWork.m_vPos.x = CMapData.GetXPos(55);
        cChrWork.m_vPos.z = CMapData.GetZPos(6 + m_nAddZ);
        cChrWork.SetVect(4.712389f);
        cChrWork = Vari.GetChrWork(2);
        cChrWork.m_vPos.x = CMapData.GetXPos(56);
        cChrWork.m_vPos.z = CMapData.GetZPos(4 + m_nAddZ);
        cChrWork.SetVect(4.712389f);
        cChrWork = Vari.GetChrWork(8);
        cChrWork.m_vPos.x = CMapData.GetXPos(54);
        cChrWork.m_vPos.z = CMapData.GetZPos(5 + m_nAddZ);
    }

    public static void MainFrame() {
        CStaffRoll.FadeInOut();
        Vari.m_App.Motion();
        Vari.m_App.m_Game.MoveEvent();
        CStaffRoll.SetCamera();
        Vari.m_App.DrawDisplay();
        CStaffRoll.DrawStaff();
        Vari.m_App.DoFrame();
        Vari.m_App.WaitRepaint(Vari.m_App.GetWaitFrame());
    }
}

