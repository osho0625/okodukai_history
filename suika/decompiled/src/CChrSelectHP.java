/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CChrSelectHP
extends CWindow {
    static final int NO_SELECT = 9999;
    static final int WIN_WIDTH = 208;
    static final int HEIGHT1 = 56;
    private ARpg m_App;
    private int m_nXPos;
    private int m_nYPos;
    private int m_nChrMax;
    private int m_nSelect;
    private int m_nDecision;
    private boolean m_bMoveUp;
    private boolean m_bMoveDown;
    private int m_nObject;

    public void Create(ARpg aRpg, int n) {
        this.m_App = aRpg;
        this.m_nObject = n;
        this.m_nSelect = 0;
        this.m_nChrMax = Vari.GetPartyNum();
        this.ResetSelect();
        this.SetFlag(1);
    }

    public void DrawMessage() {
        int n = 8;
        String string = new String();
        int n2 = 0;
        while (n2 < this.m_nChrMax) {
            Color color = this.m_nObject == 1 || n2 == this.m_nSelect ? Def.GetColor(6) : Def.GetColor(0);
            CChrParam cChrParam = Vari.GetChrPrm(Vari.GetPartyWork(n2));
            this.DrawFont(8, n, cChrParam.GetName(), color, 16);
            if (this.m_nObject == 1 || n2 == this.m_nSelect) {
                int n3 = 8 + this.GetXPos();
                int n4 = this.GetYPos() + n + 16;
                this.m_App.m_OffsGraph.drawLine(n3, n4, n3 + 64, n4);
            }
            string = "\uff28\uff30\u3000";
            string = string + Calc3D.NumberString(cChrParam.m_nHP, 4);
            string = string + "\uff0f";
            string = string + Calc3D.NumberString(cChrParam.GetMaxHP(), 4);
            this.DrawFont(8, n += 16, string, color, 16);
            string = "\uff2d\uff30\u3000";
            string = string + Calc3D.NumberString(cChrParam.m_nMP, 4);
            string = string + "\uff0f";
            string = string + Calc3D.NumberString(cChrParam.GetMaxMP(), 4);
            this.DrawFont(8, n += 16, string, color, 16);
            n += 24;
            ++n2;
        }
    }

    public void ResetSelect() {
        this.m_nDecision = 9999;
    }

    public void CloseWindow() {
        this._Close();
    }

    public void Run() {
        boolean bl = this._Move();
        this._Draw();
        if (bl) {
            this.Select();
            this.DrawMessage();
        }
    }

    public void OpenWindow() {
        int n = this.m_nChrMax * 56 + 16;
        this.m_nXPos = 96;
        this.m_nYPos = 320 - n >> 1;
        int n2 = this.m_nXPos + 104;
        int n3 = this.m_nYPos + n / 2;
        this._Create(this.m_App, Vari.m_WinColor, 208, n, 4);
        this._Open(n2, n3, this.m_nXPos, this.m_nYPos);
    }

    public void Select() {
        if (this.GetFlag(2)) {
            return;
        }
        if (this.GetFlag(4)) {
            return;
        }
        if (this.m_App.CheckKeyDown_OK()) {
            this.m_nDecision = this.m_nSelect;
            if (!this.GetFlag(1)) {
                this._Close();
            }
            return;
        }
        if (this.m_App.CheckKeyDown_Cancel() && !this.GetFlag(8)) {
            this.m_nDecision = -1;
            this._Close();
            return;
        }
        if (this.m_App.CheckKeyDown(0) > 0) {
            if (!this.m_bMoveUp) {
                this.m_bMoveUp = true;
                this.m_nSelect += -1;
                if (this.m_nSelect < 0) {
                    this.m_nSelect = this.m_nChrMax - 1;
                }
            }
        } else {
            this.m_bMoveUp = false;
        }
        if (this.m_App.CheckKeyDown(2) > 0) {
            if (!this.m_bMoveDown) {
                this.m_bMoveDown = true;
                ++this.m_nSelect;
                if (this.m_nSelect >= this.m_nChrMax) {
                    this.m_nSelect = 0;
                }
            }
        } else {
            this.m_bMoveDown = false;
        }
        if (this.m_App.m_bMouseMove) {
            int n;
            if (this.IsMouseIn() && (n = (this.m_App.m_nMouseY - this.m_nPosY - 8) / 56) < this.m_nChrMax) {
                this.m_nSelect = n;
            }
            this.m_App.m_bMouseMove = false;
        }
    }

    CChrSelectHP() {
    }

    public int LoopFrame() {
        this.ResetSelect();
        do {
            this.m_App.MainFrame();
        } while (this.m_nDecision == 9999);
        return this.m_nDecision;
    }
}

