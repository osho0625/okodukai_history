/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;

class CInitApplet {
    private Graphics m_Grp;
    private int m_nWidth;
    private int m_nHeight;
    private int m_nBarX;
    private int m_nBarY;
    private int m_nBarW;
    private int m_nBarH;
    private int m_nMaxDataSize;
    private int m_nLoadTotal;
    private int m_nTextYPos = 32;

    public void CreateDisplay() {
        this.ClearSurface();
        this.m_Grp.setColor(Color.white);
        this.m_Grp.setFont(new Font("Serif", 1, 16));
        this.m_Grp.drawRect(this.m_nBarX - 1, this.m_nBarY - 1, this.m_nBarW + 1, this.m_nBarH + 2);
    }

    CInitApplet() {
    }

    public void DrawRestPercent(int n) {
        int n2 = n * this.m_nBarW / this.m_nMaxDataSize;
        int n3 = this.m_nLoadTotal;
        while (n3 < n2) {
            int n4 = n3 * 255 / this.m_nBarW;
            Color color = new Color(255 - n4, 0, n4);
            this.m_Grp.setColor(color);
            this.m_Grp.drawLine(this.m_nBarX + n3, this.m_nBarY, this.m_nBarX + n3, this.m_nBarY + this.m_nBarH);
            ++n3;
        }
        this.m_nLoadTotal = n2;
    }

    public void ClearSurface() {
        int n = 0;
        while (n < this.m_nHeight >> 2) {
            int n2 = 0;
            while (n2 < this.m_nWidth >> 2) {
                Color color = new Color((int)((double)n2 * 1.5), (int)((double)n * 1.5), 130 - (n2 + n >> 1));
                this.m_Grp.setColor(color);
                this.m_Grp.fillRect(n2 << 2, n << 2, 4, 4);
                ++n2;
            }
            ++n;
        }
    }

    public void Init(Graphics graphics, int n, int n2, int n3) {
        this.m_Grp = graphics;
        this.m_nWidth = n;
        this.m_nHeight = n2;
        this.m_nMaxDataSize = n3;
        this.m_nLoadTotal = 0;
        this.m_nTextYPos = 32;
        this.m_nBarW = (int)((double)n * 0.8);
        this.m_nBarH = 8;
        this.m_nBarX = n - this.m_nBarW >> 1;
        this.m_nBarY = n2 - 24;
    }

    public void DrawText(String string) {
        this.m_Grp.drawString(string, 16, this.m_nTextYPos);
        this.m_nTextYPos += 16;
    }
}

