/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CWorldMap
extends CWindow {
    static final int WIN_WIDTH = 312;
    static final int WIN_HEIGHT = 292;
    static final int FRAME_WIDTH = 16;
    static final int FRAME_HEIGHT = 16;
    static final int XPOS = 44;
    static final int YPOS = 14;
    private ARpg m_App;
    private int[] m_anPointColor = new int[]{255, 0, 0, 255, 255, 255, 0, 0, 0, 255, 255, 0};

    public void Create(ARpg aRpg) {
        this.m_App = aRpg;
    }

    public void Draw() {
        Color color;
        int n;
        this.m_App.DrawImage(31, 44, 14);
        int n2 = -1;
        int n3 = -1;
        int n4 = -1;
        int n5 = -1;
        if (this.m_App.m_Play.m_nAreaNo == 0) {
            n2 = CMapData.GetXBlock(this.m_App.m_Player.m_vPos.x) - 3;
            n3 = CMapData.GetZBlock(this.m_App.m_Player.m_vPos.z) - 4;
        } else if (this.m_App.m_NowStagePrm.m_nWorldMapX != -1) {
            n2 = this.m_App.m_NowStagePrm.m_nWorldMapX - 3;
            n3 = this.m_App.m_NowStagePrm.m_nWorldMapZ - 4;
        }
        if (!this.m_App.m_bShip) {
            n4 = this.m_App.m_Play.m_nShipX - 3;
            n5 = this.m_App.m_Play.m_nShipZ - 4;
        }
        if (n2 != -1) {
            n = ((this.m_App.m_nMainCount & 4) >> 2) * 3;
            color = new Color(this.m_anPointColor[n + 0], this.m_anPointColor[n + 1], this.m_anPointColor[n + 2]);
            this.m_App.m_OffsGraph.setColor(color);
            this.m_App.m_OffsGraph.fillRect(60 + n2 * 4, 30 + n3 * 4, 4, 4);
        }
        if (n4 != -1) {
            n = ((this.m_App.m_nMainCount & 4) >> 2) * 3;
            color = new Color(this.m_anPointColor[n + 6], this.m_anPointColor[n + 7], this.m_anPointColor[n + 8]);
            this.m_App.m_OffsGraph.setColor(color);
            this.m_App.m_OffsGraph.fillRect(60 + n4 * 4, 30 + n5 * 4, 4, 4);
        }
    }

    public void Run() {
        this.Draw();
    }

    CWorldMap() {
    }
}

