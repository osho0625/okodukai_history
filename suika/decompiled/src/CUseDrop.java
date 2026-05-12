/*
 * Decompiled with CFR 0.152.
 */
class CUseDrop {
    private ARpg m_App;
    private int m_nXPos;
    private int m_nYPos;
    private CMenuWindow m_Menu;

    public void Create(ARpg aRpg, int n, int n2) {
        this.m_App = aRpg;
        this.m_nXPos = n;
        this.m_nYPos = n2;
        this.m_Menu = new CMenuWindow();
        this.m_Menu.Create(this.m_App, 2);
        this.m_Menu.SetMenuText(0, "\u4f7f\u3046");
        this.m_Menu.SetMenuText(1, "\u6368\u3066\u308b");
    }

    public int Run() {
        this.m_App.EntryWindow(this.m_Menu);
        this.m_Menu.OpenWindow(this.m_nXPos, this.m_nYPos);
        this.m_App.LoopFrame(4);
        int n = this.m_Menu.LoopFrame();
        this.m_Menu.CloseWindow();
        this.m_Menu.CloseRelease();
        return n;
    }

    CUseDrop() {
    }
}

