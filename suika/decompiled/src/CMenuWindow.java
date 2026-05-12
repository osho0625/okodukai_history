/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CMenuWindow
extends CWindow {
    static final int NO_SELECT = 9999;
    static final int FLAG_NO_DECIDE = 1;
    static final int FLAG_NO_SELECT = 2;
    static final int[] COLOR_TABLE = new int[]{0, 6, 8, 9};
    private Color[] m_aColorTable;
    private int m_nMenuNum;
    private String[] m_astrMenu;
    protected int[] m_anFlag;
    protected ARpg m_App;
    private Color m_FontColor;
    protected int m_nTextLength;
    protected int m_nSelect;
    private boolean m_bMoveUp;
    private boolean m_bMoveDown;
    private boolean m_bMoveRight;
    private boolean m_bMoveLeft;
    protected int m_nDecision;
    private int m_nFixHeight = -1;

    public int LoopFrame() {
        this.ResetSelect();
        do {
            this.m_App.MainFrame();
            this.FrameFunc();
        } while (this.m_nDecision == 9999);
        return this.m_nDecision;
    }

    public void FixHeight(int n) {
        this.m_nFixHeight = n;
    }

    public void FrameFunc() {
    }

    public void Create(ARpg aRpg, int n) {
        this.m_App = aRpg;
        this.m_nMenuNum = n;
        this.m_astrMenu = new String[n];
        this.m_anFlag = new int[n];
        this.m_nSelect = 0;
        this.m_nTextLength = 0;
        this.m_bMoveUp = false;
        this.m_bMoveDown = false;
        this.m_bMoveRight = false;
        this.m_bMoveLeft = false;
        this.m_nDecision = 9999;
        this.ClearMenuFlag();
    }

    public void Dicide() {
        this.m_nDecision = this.m_nSelect;
    }

    public boolean CheckError() {
        int n = 0;
        do {
            if (this.m_nSelect < 0) {
                this.m_nSelect = 0;
                return false;
            }
            if (this.m_anFlag[this.m_nSelect] != 2) break;
            this.MoveCursor(-1);
        } while (++n < 32);
        return true;
    }

    public void MoveCursor(int n) {
        block3: {
            int n2 = 0;
            do {
                this.m_nSelect += n;
                if (this.m_nSelect >= this.m_nMenuNum) {
                    this.m_nSelect = 0;
                }
                if (this.m_nSelect < 0) {
                    this.m_nSelect = this.m_nMenuNum - 1;
                }
                if (this.m_anFlag[this.m_nSelect] != 2) break block3;
            } while (++n2 <= this.m_nMenuNum);
            this.m_nSelect = -1;
            return;
        }
    }

    public void ClearText() {
        this.m_nTextLength = 0;
    }

    public void DrawMessage() {
        int n = 8;
        int n2 = 0;
        if (this.GetFlag(2)) {
            n2 = 2;
        }
        int n3 = 0;
        while (n3 < this.m_nMenuNum) {
            if (n3 == this.m_nSelect) {
                this.m_FontColor = this.m_anFlag[n3] == 1 ? Def.GetColor(COLOR_TABLE[3]) : Def.GetColor(COLOR_TABLE[n2 + 1]);
                this.m_App.SetColor(this.m_FontColor);
                this.m_App.m_OffsGraph.drawLine(8 + this.GetXPos(), this.GetYPos() + n + 16, 8 + this.GetXPos() + this.m_nTextLength * 16, this.GetYPos() + n + 16);
            } else {
                this.m_FontColor = this.m_anFlag[n3] == 1 ? Def.GetColor(COLOR_TABLE[2]) : Def.GetColor(COLOR_TABLE[n2]);
                this.m_App.SetColor(this.m_FontColor);
            }
            this.DrawFont(8, n, this.m_astrMenu[n3], this.m_FontColor, 16);
            n += 24;
            ++n3;
        }
    }

    public void ResetSelect() {
        this.m_App.m_bMouseMove = true;
        this.m_nDecision = 9999;
    }

    public void CloseWindow() {
        this._Close();
    }

    public void Run() {
        this.m_nDecision = 9999;
        boolean bl = this._Move();
        this._Draw();
        if (bl) {
            this.Select();
            this.DrawMessage();
        }
    }

    public void SetSelectNo(int n) {
        this.m_nSelect = n;
    }

    public int GetWidth() {
        int n = this.m_nTextLength * 16 + 16;
        return n;
    }

    public void SetMenuFlag(int n, int n2) {
        this.m_anFlag[n] = n2;
    }

    public void OpenWindow(int n, int n2) {
        int n3 = this.m_nMenuNum;
        if (this.m_nFixHeight != -1) {
            n3 = this.m_nFixHeight;
        }
        int n4 = this.GetWidth_Text(this.m_nTextLength);
        int n5 = this.GetHeight_Text(n3);
        int n6 = n + n4 / 2;
        int n7 = n2 + n5 / 2;
        this._Create(this.m_App, Vari.m_WinColor, n4, n5, 4);
        this._Open(n6, n7, n, n2);
    }

    public void Select() {
        if (this.GetFlag(2)) {
            return;
        }
        if (this.GetFlag(4)) {
            return;
        }
        if (this.IsOK() && this.m_anFlag[this.m_nSelect] != 1) {
            this.Dicide();
            if (!this.GetFlag(1)) {
                this._Close();
            }
            return;
        }
        if (this.IsCancel() && !this.GetFlag(8)) {
            this.m_nDecision = -1;
            if (this.m_App.m_nMouseRight == 1) {
                this.m_App.m_nMouseRight = 2;
            }
            this._Close();
            return;
        }
        if (this.IsLeft()) {
            if (!this.m_bMoveLeft) {
                this.m_bMoveLeft = true;
                this.SelectLeft();
            }
        } else {
            this.m_bMoveLeft = false;
        }
        if (this.IsRight()) {
            if (!this.m_bMoveRight) {
                this.m_bMoveRight = true;
                this.SelectRight();
            }
        } else {
            this.m_bMoveRight = false;
        }
        if (this.m_App.CheckKeyDown(0) > 0) {
            if (!this.m_bMoveUp) {
                this.m_bMoveUp = true;
                this.MoveCursor(-1);
            }
        } else {
            this.m_bMoveUp = false;
        }
        if (this.m_App.CheckKeyDown(2) > 0) {
            if (!this.m_bMoveDown) {
                this.m_bMoveDown = true;
                this.MoveCursor(1);
            }
        } else {
            this.m_bMoveDown = false;
        }
        if (this.m_App.m_bMouseMove) {
            int n;
            if (this.IsMouseIn() && (n = (this.m_App.m_nMouseY - this.m_nPosY - 8) / 24) < this.m_nMenuNum && this.m_anFlag[n] != 2) {
                this.m_nSelect = n;
            }
            this.m_App.m_bMouseMove = false;
        }
    }

    public void SelectLeft() {
    }

    public void SelectRight() {
    }

    CMenuWindow() {
    }

    public int GetSelectNo() {
        return this.m_nSelect;
    }

    public void ClearMenuFlag() {
        int n = 0;
        while (n < this.m_nMenuNum) {
            this.m_anFlag[n] = 0;
            ++n;
        }
    }

    public int GetDicide() {
        return this.m_nDecision;
    }

    private void SetFontColor(int n) {
        this.m_FontColor = Def.COLOR_TABLE[n];
    }

    public void ResetCursorPos() {
        this.m_nSelect = 0;
    }

    public void SetMenuText(int n, String string) {
        this.m_astrMenu[n] = new String(string);
        int n2 = this.m_astrMenu[n].length();
        if (n2 > this.m_nTextLength) {
            this.m_nTextLength = n2;
        }
    }
}

