/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CGameOver {
    static final int FRAME_1 = 32;
    static final int FRAME_2 = 64;
    static final int FRAME_3 = 96;
    static final int FRAME_4 = 128;
    static final int TEXT_YPOS = 128;
    static final int LINE_TOP = 128;
    static final int LINE_BOTTOM = 176;
    static final int LINE_LEFT = 50;
    static final int LINE_RIGHT = 350;

    CGameOver() {
    }

    public static void DrawDisplay(ARpg aRpg, int n) {
        int n2;
        CGameOver.ClearSurface(aRpg);
        int n3 = 0;
        n3 = n < 32 ? n * 255 / 32 : (n < 96 ? 255 : (128 - n) * 255 / 32);
        CGameOver.DrawGameOver(aRpg, n3);
        aRpg.SetColor(Color.white);
        if (n < 32) {
            n2 = 300 * n / 32;
            aRpg.m_OffsGraph.drawLine(50, 128, 50 + n2, 128);
        } else if (n < 96) {
            aRpg.m_OffsGraph.drawLine(50, 128, 350, 128);
        } else {
            n3 = (128 - n) * 255 / 32;
            aRpg.SetColor(new Color(n3, n3, n3));
            aRpg.m_OffsGraph.drawLine(50, 128, 350, 128);
        }
        if (n < 32) {
            n2 = 300 * n / 32;
            aRpg.m_OffsGraph.drawLine(350 - n2, 176, 350, 176);
            return;
        }
        aRpg.m_OffsGraph.drawLine(50, 176, 350, 176);
    }

    public static void DrawGameOver(ARpg aRpg, int n) {
        Color color = new Color(n, n, n);
        aRpg.DrawFontC(200, 128, "\uff27\uff21\uff2d\uff25\u3000\uff2f\uff36\uff25\uff32", 40, color);
    }

    public static void Run(ARpg aRpg) {
        int n = 0;
        do {
            CGameOver.DrawDisplay(aRpg, n);
            aRpg.WaitRepaint(45);
        } while (++n < 128);
    }

    public static void ClearSurface(ARpg aRpg) {
        aRpg.m_OffsGraph.setColor(Color.black);
        aRpg.FillRect(0, 0, 400, 320);
    }
}

