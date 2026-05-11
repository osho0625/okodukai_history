/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CMessWindow
extends CWindow {
    static final int WIN_SPACE = 8;
    static final int WIN_WIDTH = 384;
    static final int WIN_HEIGHT = 84;
    private ARpg m_App;
    private CMessManage m_Mess;
    private boolean m_bMessage = true;

    public void Create(ARpg aRpg) {
        this.m_App = aRpg;
        this._Create(aRpg, Vari.m_WinColor, 384, 84, 4);
        this.m_Mess = new CMessManage();
        this.m_Mess.Create(aRpg, 4, 380, 80, Vari.m_WinColor);
    }

    public void DrawMessage() {
        this.m_bMessage = this.m_Mess.Run();
        if (!this.m_bMessage) {
            this.m_bMessage = this.m_Mess.Run();
        }
        this.m_App.m_OffsGraph.drawImage(this.m_Mess.GetImage(), this.GetXPos() + 2, this.GetYPos() + 2, Color.black, this.m_App);
    }

    CMessWindow() {
    }

    public void CloseWindow() {
        this._Close();
    }

    public void Run() {
        boolean bl = this._Move();
        this._Draw();
        if (bl) {
            this.DrawMessage();
        }
    }

    public void SetMessage(String string) {
        this.m_Mess.SetMessage(string);
    }

    public boolean IsFinished() {
        return this.m_bMessage;
    }

    public void WaitMessage() {
        do {
            this.m_App.LoopFrame(1);
        } while (!this.IsFinished());
    }

    public void OpenWindow(int n) {
        int n2;
        int n3;
        int n4 = 200;
        int n5 = 8;
        if (n == 0) {
            n3 = 50;
            n2 = 8;
        } else {
            n3 = 270;
            n2 = 228;
        }
        this._Open(n4, n3, n5, n2);
        this.m_Mess.ClearMessage();
    }
}

