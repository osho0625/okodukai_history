/*
 * Decompiled with CFR 0.152.
 */
class BtlCmdWin
extends CWindow {
    static final int TEXT_WIDTH = 9;
    static final int TEXT_HEIGHT = 6;
    static final int WIN_XPOS = 128;
    static final int WIN_YPOS = 16;
    static final int NO_SELECT = 9999;
    private ARpg m_App;
    private int m_nChrNo;
    private CChrParam m_Prm;
    private int m_nSelect;
    private int m_nDecision;
    private int m_nMax;
    private int[] m_anTable;
    private boolean m_bMoveUp;
    private boolean m_bMoveDown;
    private boolean m_bMoveRight;
    private boolean m_bMoveLeft;

    public boolean IsSelect(int n) {
        int n2 = 0;
        do {
            if (this.m_Prm.m_anCmdAb[n2] != n) continue;
            return true;
        } while (++n2 < 4);
        return false;
    }

    public void Create(ARpg aRpg, int n) {
        this.m_App = aRpg;
        this.m_nChrNo = n;
        this.m_Prm = Vari.GetChrPrm(Vari.GetPartyWork(n));
        this.m_bMoveUp = false;
        this.m_bMoveDown = false;
        this.m_bMoveRight = false;
        this.m_bMoveLeft = false;
        this.m_Prm.m_Abi.CheckCmdAb();
        this.m_anTable = new int[12];
        this.m_nMax = 0;
        int n2 = 0;
        do {
            if (!this.IsHave(n2)) continue;
            this.m_anTable[this.m_nMax] = n2;
            ++this.m_nMax;
        } while (++n2 < 12);
        this._Create(aRpg, Vari.m_WinColor, this.GetWidth_Text(9), this.GetHeight_Text(6), 4);
    }

    public void Decide() {
        if (this.m_nSelect == 0) {
            return;
        }
        int n = 0;
        do {
            if (this.m_Prm.m_anCmdAb[n] != this.m_anTable[this.m_nSelect]) continue;
            this.m_Prm.m_anCmdAb[n] = 0;
            return;
        } while (++n < 4);
        n = 0;
        do {
            if (this.m_Prm.m_anCmdAb[n] != 0) continue;
            this.m_Prm.m_anCmdAb[n] = this.m_anTable[this.m_nSelect];
            return;
        } while (++n < 4);
    }

    public void MoveCursor(int n) {
        this.m_nSelect += n * 2;
        if (this.m_nSelect < 0) {
            this.m_nSelect += this.m_nMax;
        }
        if (this.m_nSelect > this.m_nMax - 1) {
            this.m_nSelect -= this.m_nMax;
        }
    }

    public void DrawMessage() {
        int n = 0;
        int n2 = 0;
        do {
            if (!this.IsHave(n2)) continue;
            int n3 = this.IsSelect(n2) ? 6 : 0;
            int n4 = 8 + (n & 1) * 80;
            int n5 = this.GetYPos(n / 2);
            this.DrawFont(n4, n5, Def.GetBattleCommand(this.m_nChrNo, n2), Def.GetColor(n3), 16);
            if (n == this.m_nSelect) {
                this.m_App.m_OffsGraph.drawLine(n4 + this.GetXPos(), n5 + this.GetYPos() + 16, n4 + this.GetXPos() + 64, n5 + this.GetYPos() + 16);
            }
            ++n;
        } while (++n2 < 12);
    }

    public void SortList() {
        int n = 0;
        do {
            int n2 = n;
            while (n2 < 4) {
                int n3;
                int n4 = this.m_Prm.m_anCmdAb[n];
                if (n4 == 0) {
                    n4 = 65535;
                }
                if ((n3 = this.m_Prm.m_anCmdAb[n2]) == 0) {
                    n3 = 65535;
                }
                if (n4 > n3) {
                    int n5 = this.m_Prm.m_anCmdAb[n];
                    this.m_Prm.m_anCmdAb[n] = this.m_Prm.m_anCmdAb[n2];
                    this.m_Prm.m_anCmdAb[n2] = n5;
                }
                ++n2;
            }
        } while (++n < 3);
    }

    public void CloseWindow() {
        this.SortList();
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

    BtlCmdWin() {
    }

    public void OpenWindow() {
        this.m_nSelect = 0;
        this.m_nDecision = 9999;
        this._Open(128 + this.GetWidth_Text(9) / 2, 16 + this.GetHeight_Text(6) / 2, 128, 16);
    }

    public void Select() {
        if (this.GetFlag(2)) {
            return;
        }
        if (this.GetFlag(4)) {
            return;
        }
        if (this.m_App.CheckKeyDown_OK()) {
            this.Decide();
        }
        if (this.m_App.CheckKeyDown_Cancel()) {
            this.m_nDecision = -1;
            this.CloseWindow();
            return;
        }
        if (this.m_App.CheckKeyDown(3) > 0) {
            if (!this.m_bMoveLeft) {
                this.m_bMoveLeft = true;
                this.MoveLeftRight();
            }
        } else {
            this.m_bMoveLeft = false;
        }
        if (this.m_App.CheckKeyDown(1) > 0) {
            if (!this.m_bMoveRight) {
                this.m_bMoveRight = true;
                this.MoveLeftRight();
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
            if (this.IsMouseIn()) {
                int n;
                int n2 = -1;
                int n3 = (this.m_App.m_nMouseX - this.m_nPosX - 8) / 16;
                if (n3 >= 0 && n3 <= 3) {
                    n2 = 0;
                }
                if (n3 >= 4 && n3 <= 7) {
                    n2 = 1;
                }
                int n4 = (this.m_App.m_nMouseY - this.m_nPosY - 8) / 24;
                if (n2 != -1 && (n = n2 + n4 * 2) < this.m_nMax) {
                    this.m_nSelect = n;
                }
            }
            this.m_App.m_bMouseMove = false;
        }
    }

    public void MoveLeftRight() {
        this.m_nSelect = (this.m_nSelect & 1) == 0 ? ++this.m_nSelect : (this.m_nSelect += -1);
        if (this.m_nSelect > this.m_nMax - 1) {
            this.m_nSelect = this.m_nMax - 1;
        }
    }

    public boolean IsHave(int n) {
        CAbility cAbility = this.m_Prm.m_Abi;
        return cAbility.GetFlagC(n);
    }

    public int LoopFrame() {
        do {
            this.m_App.MainFrame();
        } while (this.m_nDecision == 9999);
        return this.m_nDecision;
    }
}

