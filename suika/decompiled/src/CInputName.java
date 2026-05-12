/*
 * Decompiled with CFR 0.152.
 */
class CInputName {
    private CInputNameWondow m_Window = new CInputNameWondow();
    private CDispName m_NameWin = new CDispName();
    private ARpg m_App;

    public void Create(ARpg aRpg) {
        this.m_App = aRpg;
        this.m_NameWin.Create(aRpg);
        this.m_Window.Create(aRpg, this.m_NameWin);
    }

    CInputName() {
    }

    public void CloseWindow() {
        this.m_Window.CloseWindow();
        this.m_NameWin.CloseWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(this.m_Window);
        this.m_App.ReleaseWindow(this.m_NameWin);
    }

    public void Run() {
        this.OpenWindow();
        while (!this.m_Window.LoopFrame()) {
        }
        this.CloseWindow();
    }

    public void OpenWindow() {
        this.m_App.EntryWindow(this.m_Window);
        this.m_Window.OpenWindow();
        this.m_App.EntryWindow(this.m_NameWin);
        this.m_NameWin.OpenWindow();
        this.m_App.LoopFrame(4);
    }
}

