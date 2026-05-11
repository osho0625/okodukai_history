/*
 * Decompiled with CFR 0.152.
 */
class CBaseShop {
    protected ARpg m_App;
    protected CPlayData m_Play;
    protected String m_strName;

    public void _Create(ARpg aRpg, String string) {
        this.m_App = aRpg;
        this.m_Play = this.m_App.m_Play;
        this.m_strName = new String(string);
    }

    public void Wait() {
        this.m_App.WaitRepaint(this.m_App.GetWaitFrame());
    }

    public void _Hello(String string) {
        this.m_App.m_MessWin.OpenWindow(1);
        this.m_App.LoopFrame(4);
        this.m_App.m_MessWin.SetMessage(string);
        this.m_App.m_MessWin.WaitMessage();
    }

    CBaseShop() {
    }

    public int YesNo() {
        CMenuWindow cMenuWindow = new CMenuWindow();
        cMenuWindow.Create(this.m_App, 2);
        cMenuWindow.SetMenuText(0, "\u306f\u3044");
        cMenuWindow.SetMenuText(1, "\u3044\u3044\u3048");
        this.m_App.EntryWindow(cMenuWindow);
        cMenuWindow.OpenWindow(16, 16);
        this.m_App.LoopFrame(4);
        int n = cMenuWindow.LoopFrame();
        this.m_App.ReleaseWindow(cMenuWindow);
        return n;
    }

    public void Release() {
    }
}

