/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CWindow
extends CFlag {
    static final int MODE_NONE = 0;
    static final int MODE_OPEN = 1;
    static final int MODE_MESS = 2;
    static final int MODE_CLOSE = 3;
    static final int F_NO_DICIDE = 1;
    static final int F_NO_USE = 2;
    static final int F_NO_KEY = 4;
    static final int F_NO_CANCEL = 8;
    static final int F_LEFT = 16;
    static final int F_RIGHT = 32;
    static final int F_LEFTSEL = 64;
    static final int F_RIGHTSEL = 128;
    static final Color ARROWCOL_NORMAL = new Color(220, 220, 240);
    static final Color ARROWCOL_SELECT = new Color(0, 230, 230);
    static final int ARROW_SIZE = 32;
    private CWinEntry m_GameApp;
    private Color m_BackColor;
    private int m_nWinWidth;
    private int m_nWinHeight;
    private int m_nMoveCount;
    protected boolean m_bSE = true;
    protected int m_nPosX;
    protected int m_nPosY;
    protected int m_nWidth;
    protected int m_nHeight;
    private int m_nSrcX;
    private int m_nSrcY;
    private int m_nDstX;
    private int m_nDstY;
    private int m_nMode;
    private int m_nCount;
    private boolean m_bRelease;

    public int GetHeight_Text(int n) {
        return 16 + 16 * n + 8 * (n - 1);
    }

    public void _Create(CWinEntry cWinEntry, Color color, int n, int n2, int n3) {
        this.m_GameApp = cWinEntry;
        this.m_BackColor = new Color(color.getRed(), color.getGreen(), color.getBlue());
        this.m_nMode = 0;
        this.m_nWinWidth = n;
        this.m_nWinHeight = n2;
        this.m_nMoveCount = n3;
        this.m_bRelease = false;
    }

    public void DrawLine(int n, int n2, int n3, int n4) {
        this.m_GameApp.m_OffsGraph.drawLine(n + this.GetXPos(), n2 + this.GetYPos(), n3 + this.GetXPos(), n4 + this.GetYPos());
    }

    public boolean IsCancel() {
        if (this.m_GameApp.CheckKeyDown(4) > 0 || this.m_GameApp.m_nMouseRight == 1) {
            if (this.m_GameApp.m_nMouseRight == 1) {
                this.m_GameApp.m_nMouseRight = 2;
            }
            return true;
        }
        return false;
    }

    protected void _Draw() {
        Color color;
        int n;
        int n2;
        int n3;
        if (this.m_nMode == 0) {
            return;
        }
        if (!this.GetFlag(2)) {
            this.m_GameApp.SetColor(new Color(220, 220, 240));
        } else {
            this.m_GameApp.SetColor(new Color(110, 110, 120));
        }
        this.m_GameApp.DrawRect(this.m_nPosX, this.m_nPosY, this.m_nWidth, this.m_nHeight - 1);
        if (!this.GetFlag(2)) {
            this.m_GameApp.SetColor(new Color(176, 176, 192));
        } else {
            this.m_GameApp.SetColor(new Color(88, 88, 96));
        }
        this.m_GameApp.DrawRect(this.m_nPosX + 1, this.m_nPosY + 1, this.m_nWidth - 2, this.m_nHeight - 3);
        this.m_GameApp.SetColor(this.m_BackColor);
        this.m_GameApp.FillRect(this.m_nPosX + 2, this.m_nPosY + 2, this.m_nWidth - 3, this.m_nHeight - 4);
        if (this.GetFlag(16)) {
            n3 = this.m_nPosX;
            n2 = this.m_nPosY + (this.m_nHeight - 32 >> 1);
            n = 16;
            color = ARROWCOL_NORMAL;
            if (this.m_GameApp.m_nMouseX >= n3 - n && this.m_GameApp.m_nMouseX < n3 + 32 - n && this.m_GameApp.m_nMouseY >= n2 && this.m_GameApp.m_nMouseY < n2 + 32) {
                this.SetFlag(64);
                color = ARROWCOL_SELECT;
            } else {
                this.ResetFlag(64);
            }
            this.m_GameApp.DrawFontC(n3 - 1, n2, "\u226a", 32, Color.black);
            this.m_GameApp.DrawFontC(n3, n2, "\u226a", 32, color);
        }
        if (this.GetFlag(32)) {
            n3 = this.m_nPosX + this.m_nWidth;
            n2 = this.m_nPosY + (this.m_nHeight - 32 >> 1);
            n = 16;
            color = ARROWCOL_NORMAL;
            if (this.m_GameApp.m_nMouseX >= n3 - n && this.m_GameApp.m_nMouseX < n3 + 32 - n && this.m_GameApp.m_nMouseY >= n2 && this.m_GameApp.m_nMouseY < n2 + 32) {
                this.SetFlag(128);
                color = ARROWCOL_SELECT;
            } else {
                this.ResetFlag(128);
            }
            this.m_GameApp.DrawFontC(n3 + 1, n2, "\u226b", 32, Color.black);
            this.m_GameApp.DrawFontC(n3, n2, "\u226b", 32, color);
        }
    }

    public void CloseRelease() {
        this.m_bRelease = true;
    }

    public void Run() {
    }

    public void DrawFont(int n, int n2, String string, Color color, int n3) {
        this.m_GameApp.SetColor(color);
        this.m_GameApp.SetFontSize(n3);
        int n4 = 0;
        while (n4 < string.length()) {
            this.m_GameApp.DrawFontC(n + this.GetXPos() + n4 * n3 + n3 / 2, n2 + this.GetYPos(), string.substring(n4, n4 + 1));
            ++n4;
        }
    }

    public int GetWidth() {
        return this.m_nWinWidth;
    }

    public int GetXPos() {
        return this.m_nPosX;
    }

    public int GetXPos(int n) {
        return 8 + 16 * n;
    }

    public int GetYPos() {
        return this.m_nPosY;
    }

    public int GetYPos(int n) {
        return 8 + 24 * n;
    }

    public boolean IsMouseIn() {
        return this.m_GameApp.m_nMouseX >= this.m_nPosX + 8 && this.m_GameApp.m_nMouseX < this.m_nPosX + this.m_nWidth + 8 && this.m_GameApp.m_nMouseY >= this.m_nPosY + 8 && this.m_GameApp.m_nMouseY < this.m_nPosY + this.m_nHeight + 8;
    }

    CWindow() {
    }

    public boolean IsLeft() {
        if (this.m_GameApp.CheckKeyDown(3) > 0 || this.GetFlag(64) && this.m_GameApp.m_nMouseLeft == 1) {
            if (this.m_GameApp.m_nMouseLeft == 1) {
                this.m_GameApp.m_nMouseLeft = 2;
            }
            return true;
        }
        return false;
    }

    public void _Close() {
        this.m_nMode = 3;
        this.m_nCount = this.m_nMoveCount;
    }

    public boolean IsOK() {
        if (this.m_GameApp.CheckKeyDown(5) == 1 || this.m_GameApp.CheckKeyDown(6) == 1) {
            return true;
        }
        if (this.m_GameApp.m_nMouseLeft == 1 && !this.GetFlag(64) && !this.GetFlag(128)) {
            this.m_GameApp.m_nMouseLeft = 2;
            return true;
        }
        return false;
    }

    public boolean IsRight() {
        if (this.m_GameApp.CheckKeyDown(1) > 0 || this.GetFlag(128) && this.m_GameApp.m_nMouseLeft == 1) {
            if (this.m_GameApp.m_nMouseLeft == 1) {
                this.m_GameApp.m_nMouseLeft = 2;
            }
            return true;
        }
        return false;
    }

    public void _Open(int n, int n2, int n3, int n4) {
        this.m_nSrcX = n;
        this.m_nSrcY = n2;
        this.m_nDstX = n3;
        this.m_nDstY = n4;
        this.m_nMode = 1;
        this.m_nPosX = this.m_nSrcX;
        this.m_nPosY = this.m_nSrcY;
        this.m_nWidth = 0;
        this.m_nHeight = 0;
        this.m_nCount = 0;
        if (this.m_bSE) {
            this.m_GameApp.PlaySeG(25);
        }
    }

    public int GetMode() {
        return this.m_nMode;
    }

    public boolean _Move() {
        switch (this.m_nMode) {
            case 1: {
                ++this.m_nCount;
                if (this.m_nCount >= this.m_nMoveCount) {
                    this.m_nMode = 2;
                    this.m_nPosX = this.m_nDstX;
                    this.m_nPosY = this.m_nDstY;
                    this.m_nWidth = this.m_nWinWidth;
                    this.m_nHeight = this.m_nWinHeight;
                    break;
                }
                this.m_nPosX = this.m_nSrcX + (this.m_nDstX - this.m_nSrcX) * this.m_nCount / this.m_nMoveCount;
                this.m_nPosY = this.m_nSrcY + (this.m_nDstY - this.m_nSrcY) * this.m_nCount / this.m_nMoveCount;
                this.m_nWidth = this.m_nWinWidth * this.m_nCount / this.m_nMoveCount;
                this.m_nHeight = this.m_nWinHeight * this.m_nCount / this.m_nMoveCount;
                this.m_GameApp.m_bMouseMove = true;
                break;
            }
            case 2: {
                return true;
            }
            case 3: {
                this.m_nCount += -1;
                if (this.m_nCount <= 0) {
                    this.m_nMode = 0;
                    if (!this.m_bRelease) break;
                    this.m_bRelease = false;
                    this.m_GameApp.ReleaseWindow(this);
                    break;
                }
                this.m_nPosX = this.m_nSrcX + (this.m_nDstX - this.m_nSrcX) * this.m_nCount / this.m_nMoveCount;
                this.m_nPosY = this.m_nSrcY + (this.m_nDstY - this.m_nSrcY) * this.m_nCount / this.m_nMoveCount;
                this.m_nWidth = this.m_nWinWidth * this.m_nCount / this.m_nMoveCount;
                this.m_nHeight = this.m_nWinHeight * this.m_nCount / this.m_nMoveCount;
            }
        }
        return false;
    }

    public int GetWidth_Text(int n) {
        return 16 + 16 * n;
    }
}

