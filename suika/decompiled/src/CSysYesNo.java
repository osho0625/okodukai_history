/*
 * Decompiled with CFR 0.152.
 */
class CSysYesNo {
    CSysYesNo() {
    }

    public int Run(ARpg aRpg, String string) {
        CSlipWindow cSlipWindow = new CSlipWindow();
        cSlipWindow.Create(aRpg, string);
        aRpg.EntryWindow(cSlipWindow);
        cSlipWindow.OpenWindow(200, 80);
        CMenuWindow cMenuWindow = new CMenuWindow();
        cMenuWindow.Create(aRpg, 2);
        cMenuWindow.SetMenuText(0, "\u306f\u3044");
        cMenuWindow.SetMenuText(1, "\u3044\u3044\u3048");
        aRpg.EntryWindow(cMenuWindow);
        cMenuWindow.OpenWindow(400 - cMenuWindow.GetWidth() >> 1, 128);
        aRpg.LoopFrame(4);
        int n = cMenuWindow.LoopFrame();
        cSlipWindow.CloseWindow();
        aRpg.LoopFrame(4);
        aRpg.ReleaseWindow(cSlipWindow);
        aRpg.ReleaseWindow(cMenuWindow);
        return n;
    }
}

