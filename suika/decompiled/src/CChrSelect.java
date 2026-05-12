/*
 * Decompiled with CFR 0.152.
 */
class CChrSelect {
    private ARpg m_App;
    private CMenuWindow m_Menu;
    private int m_nXPos;
    private int m_nYPos;
    private int m_nChrMax;

    public void Create(ARpg aRpg, int n, int n2) {
        this.m_App = aRpg;
        this.m_nChrMax = Vari.GetPartyNum();
        this.m_nXPos = n;
        this.m_nYPos = n2;
        this.m_Menu = new CMenuWindow();
        this.m_Menu.Create(this.m_App, this.m_nChrMax);
        this.m_Menu.SetFlag(1);
        int n3 = 0;
        while (n3 < this.m_nChrMax) {
            CChrParam cChrParam = Vari.GetChrPrm(Vari.GetPartyWork(n3));
            this.m_Menu.SetMenuText(n3, cChrParam.GetName());
            ++n3;
        }
    }

    public int Run() {
        if (this.m_nChrMax == 1) {
            return 0;
        }
        if (this.m_Menu.GetMode() == 0) {
            this.m_App.EntryWindow(this.m_Menu);
            this.m_Menu.OpenWindow(this.m_nXPos, this.m_nYPos);
            this.m_App.LoopFrame(4);
        } else {
            this.m_Menu.ResetFlag(2);
        }
        int n = this.m_Menu.LoopFrame();
        if (n == -1) {
            this.Close();
            return -1;
        }
        this.m_Menu.SetFlag(2);
        return n;
    }

    public void Close() {
        this.m_Menu.CloseWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(this.m_Menu);
    }

    CChrSelect() {
    }
}

