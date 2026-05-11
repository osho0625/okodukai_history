/*
 * Decompiled with CFR 0.152.
 */
class CBaseHelp
extends CMenuWindowLR {
    protected int m_nListNum;
    protected CSlipWindow m_Help = new CSlipWindow();

    public void CloseAllWindow() {
        this.CloseWindow();
        this.m_Help.CloseWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(this);
        this.m_App.ReleaseWindow(this.m_Help);
    }

    public void OpenAllWindow() {
        this.m_App.EntryWindow(this);
        this.OpenWindow(48, 24);
        this.m_App.EntryWindow(this.m_Help);
        this.m_Help.SetText(0, "");
        this.m_Help.SetText(1, "");
        this.m_Help.OpenWindow(200, 240);
        this.m_App.LoopFrame(4);
    }

    public int GetListNum() {
        return this.m_nListNum;
    }

    CBaseHelp() {
    }

    public void Init() {
        this.m_Help.Create(Vari.m_App, 16, 2);
    }
}

