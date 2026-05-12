/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CTitle {
    static final int[] anColor = new int[]{0, 0, 16, 32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 240, 255, 255, 240, 224, 208, 192, 176, 160, 144, 128, 112, 96, 80, 64, 48, 32, 16, 0, 0};

    public static void DrawDisplay(ARpg aRpg) {
        CTitle.ClearSurface(aRpg);
        aRpg.DrawFontC(200, 64, "\u3059\u3044\u304b\u304c\u98df\u3079\u305f\u3044", 32, Color.white);
        aRpg.DrawFontC(200, 190, "\u30de\u30a6\u30b9\u306e\u30dc\u30bf\u30f3\u3092\u62bc\u3057\u3066\u306d", 16, Color.white);
        aRpg.DrawFontC(200, 270, "2002-2008\u3000\u88fd\u4f5c\u30fb\u8457\u4f5c\u3000\u304f\u308d\u3059\u3051", 16, Color.white);
        aRpg.GetDisplay();
    }

    public static void Opening(ARpg aRpg) {
        aRpg.m_OffsGraph.setColor(Color.black);
        aRpg.FillRect(0, 0, 400, 320);
        aRpg.WaitRepaint(200);
        int n = 0;
        do {
            int n2 = (n + 1) * 16;
            int n3 = 0;
            do {
                aRpg.WaitRepaint(30);
                Color color = new Color(anColor[n3], anColor[n3], anColor[n3]);
                aRpg.DrawFontC(200, (320 - n2) / 2, "\u3059\u3044\u304b\u304c\u98df\u3079\u305f\u3044", n2, color);
                aRpg.WaitRepaint(30);
            } while (++n3 < 36);
        } while (++n < 4);
    }

    public static void OnText(String string, int n, int n2, int n3, int n4) {
        int n5 = 0;
        while (n5 < n4) {
            int n6 = 255 * (n5 + 1) / n4;
            Vari.m_App.WaitRepaint(30);
            Color color = new Color(n6, n6, n6);
            Vari.m_App.DrawFontC(n, n2, string, n3, color);
            Vari.m_App.WaitRepaint(30);
            ++n5;
        }
    }

    CTitle() {
    }

    public static void TextSc_02() {
        Vari.m_App.m_OffsGraph.setColor(Color.black);
        Vari.m_App.FillRect(0, 0, 400, 320);
        Vari.m_App.WaitRepaint(200);
        CTitle.OnText("\u3059\u3044\u304b\u304c\u98df\u3079\u305f\u3044", 200, 100, 32, 8);
        Vari.m_App.WaitRepaint(200);
        CTitle.OnText("\u7b2c\uff12\u90e8\u5b8c", 300, 250, 32, 8);
        Vari.m_App.WaitRepaint(3000);
        CTitle.OffText("\u3059\u3044\u304b\u304c\u98df\u3079\u305f\u3044", 200, 100, 32, 8);
        Vari.m_App.WaitRepaint(200);
        CTitle.OffText("\u7b2c\uff12\u90e8\u5b8c", 300, 250, 32, 8);
        Vari.m_App.WaitRepaint(200);
    }

    public static void Run(ARpg aRpg) {
        boolean bl = false;
        CTitle.DrawDisplay(aRpg);
        Vari.m_bTitle = true;
        while (true) {
            CInitGame.InitGame(aRpg);
            aRpg.WaitRepaint(90);
            aRpg.WaitKey_Display();
            int n = 0;
            n = CTitle.DoMenu(aRpg);
            if (n == 0) {
                CInputName cInputName = new CInputName();
                cInputName.Create(aRpg);
                cInputName.Run();
                bl = false;
                Vari.m_bTitle = false;
                CTitle.Opening(aRpg);
                break;
            }
            if (n != 1) continue;
            aRpg.CreateInputPass();
            boolean bl2 = aRpg.WaitBtn_Display();
            if (bl2) {
                String string = aRpg.GetInputPass();
                aRpg.ReleasePanel();
                int n2 = aRpg.m_Play.LoadPassWord(string, true);
                if (n2 == 0) {
                    bl = true;
                    Vari.m_bTitle = false;
                    break;
                }
                aRpg.Slip("\u5fa9\u6d3b\u306e\u546a\u6587\u304c\u9055\u3044\u307e\u3059");
                continue;
            }
            aRpg.ReleasePanel();
        }
        aRpg.ResetStopDisplay();
        if (bl) {
            aRpg.m_Game.InitContinue();
            aRpg.m_Game.XChgArea2(aRpg.m_Play.m_nAreaNo);
            aRpg.m_Game.InitParty();
            return;
        }
        CInitGame.InitGame(aRpg);
    }

    public static void TextSc_00() {
        Vari.m_App.m_OffsGraph.setColor(Color.black);
        Vari.m_App.FillRect(0, 0, 400, 320);
        Vari.m_App.WaitRepaint(200);
        CTitle.OnText("\u3059\u3044\u304b\u304c\u98df\u3079\u305f\u3044", 200, 100, 32, 8);
        Vari.m_App.WaitRepaint(200);
        CTitle.OnText("\u7b2c\uff11\u90e8\u5b8c", 300, 250, 32, 8);
        Vari.m_App.WaitRepaint(3000);
        CTitle.OffText("\u3059\u3044\u304b\u304c\u98df\u3079\u305f\u3044", 200, 100, 32, 8);
        Vari.m_App.WaitRepaint(200);
        CTitle.OffText("\u7b2c\uff11\u90e8\u5b8c", 300, 250, 32, 8);
        Vari.m_App.WaitRepaint(200);
    }

    public static void TextSc_01() {
        Vari.m_App.m_OffsGraph.setColor(Color.black);
        Vari.m_App.FillRect(0, 0, 400, 320);
        Vari.m_App.WaitRepaint(200);
        CTitle.OnText("\u7b2c\uff12\u90e8", 200, 80, 32, 8);
        Vari.m_App.WaitRepaint(200);
        CTitle.OnText("\u3084\u3063\u3071\u308a\u3059\u3044\u304b\u304c\u98df\u3079\u305f\u3044", 200, 120, 32, 8);
        Vari.m_App.WaitRepaint(200);
        CTitle.OnText("\uff0d\u305d\u306e\u8a87\u308a\u9ad8\u304d\u8840\u7d71\uff0d", 240, 250, 20, 8);
        Vari.m_App.WaitRepaint(3000);
        CTitle.OffText("\u7b2c\uff12\u90e8", 200, 80, 32, 8);
        Vari.m_App.WaitRepaint(200);
        CTitle.OffText("\u3084\u3063\u3071\u308a\u3059\u3044\u304b\u304c\u98df\u3079\u305f\u3044", 200, 120, 32, 8);
        Vari.m_App.WaitRepaint(200);
        CTitle.OffText("\uff0d\u305d\u306e\u8a87\u308a\u9ad8\u304d\u8840\u7d71\uff0d", 240, 250, 20, 8);
        Vari.m_App.WaitRepaint(200);
    }

    public static int DoMenu(ARpg aRpg) {
        CMenuWindow cMenuWindow = new CMenuWindow();
        cMenuWindow.Create(aRpg, 2);
        cMenuWindow.SetMenuText(0, "\u521d\u3081\u304b\u3089");
        cMenuWindow.SetMenuText(1, "\u7d9a\u304d\u304b\u3089");
        cMenuWindow.SetSelectNo(1);
        aRpg.EntryWindow(cMenuWindow);
        cMenuWindow.OpenWindow(16, 16);
        aRpg.LoopFrame(4);
        int n = cMenuWindow.LoopFrame();
        aRpg.LoopFrame(4);
        aRpg.ReleaseWindow(cMenuWindow);
        return n;
    }

    public static void ClearSurface(ARpg aRpg) {
        int n = 0;
        do {
            Color color = new Color(n * 2 + 40, n * 2 + 40, 255);
            aRpg.m_OffsGraph.setColor(color);
            aRpg.FillRect(0, n << 2, 400, 4);
        } while (++n < 80);
    }

    public static void TextSc_03() {
        Vari.m_App.m_OffsGraph.setColor(Color.black);
        Vari.m_App.FillRect(0, 0, 400, 320);
        Vari.m_App.WaitRepaint(200);
        CTitle.OnText("\u7b2c\uff13\u90e8", 200, 80, 32, 8);
        Vari.m_App.WaitRepaint(200);
        CTitle.OnText("\u30e1\u30ed\u30f3\u304c\u98df\u3079\u305f\u3044", 200, 120, 32, 8);
        Vari.m_App.WaitRepaint(200);
        CTitle.OnText("\uff0d\u9ec4\u91d1\u306a\u308b\u907a\u7523\uff0d", 240, 250, 20, 8);
        Vari.m_App.WaitRepaint(3000);
        CTitle.OffText("\u7b2c\uff13\u90e8", 200, 80, 32, 8);
        Vari.m_App.WaitRepaint(200);
        CTitle.OffText("\u30e1\u30ed\u30f3\u304c\u98df\u3079\u305f\u3044", 200, 120, 32, 8);
        Vari.m_App.WaitRepaint(200);
        CTitle.OffText("\uff0d\u9ec4\u91d1\u306a\u308b\u907a\u7523\uff0d", 240, 250, 20, 8);
        Vari.m_App.WaitRepaint(200);
    }

    public static void OffText(String string, int n, int n2, int n3, int n4) {
        int n5 = 0;
        while (n5 < n4) {
            int n6 = 255 * (n4 - n5 - 1) / n4;
            Vari.m_App.WaitRepaint(30);
            Color color = new Color(n6, n6, n6);
            Vari.m_App.DrawFontC(n, n2, string, n3, color);
            Vari.m_App.WaitRepaint(30);
            ++n5;
        }
    }
}

