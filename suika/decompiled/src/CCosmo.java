/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Graphics;

class CCosmo {
    static final int MAX_STAR = 128;
    private CStar[] m_aStar;

    public void Draw(CRender3D cRender3D, Graphics graphics) {
        D3DXCOLOR d3DXCOLOR = new D3DXCOLOR();
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        int n = 0;
        do {
            if (!Vari.IsStopWorld()) {
                this.m_aStar[n].Move();
            }
            if (n == 0) {
                d3DXCOLOR.b = 255;
                d3DXCOLOR.g = 255;
                d3DXCOLOR.r = 255;
                cRender3D.SetColorBright(d3DXCOLOR);
            } else if (n == 56) {
                d3DXCOLOR.b = 128;
                d3DXCOLOR.g = 128;
                cRender3D.SetColorBright(d3DXCOLOR);
            } else if (n == 80) {
                d3DXCOLOR.r = 128;
                d3DXCOLOR.b = 255;
                cRender3D.SetColorBright(d3DXCOLOR);
            } else if (n == 104) {
                d3DXCOLOR.r = 255;
                d3DXCOLOR.g = 255;
                d3DXCOLOR.b = 128;
                cRender3D.SetColorBright(d3DXCOLOR);
            }
            d3DXVECTOR3.Set(this.m_aStar[n].m_vPos);
            d3DXVECTOR3.Add(Vari.m_vEyeAt);
            d3DXVECTOR3 = cRender3D.Get3DPosBW(d3DXVECTOR3);
            graphics.fillRect((int)d3DXVECTOR3.x, (int)d3DXVECTOR3.y, 1, 1);
        } while (++n < 128);
    }

    CCosmo() {
    }

    public void Init() {
        this.m_aStar = new CStar[128];
        int n = 0;
        do {
            this.m_aStar[n] = new CStar();
            this.m_aStar[n].Init();
        } while (++n < 128);
    }
}

