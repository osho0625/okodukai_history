/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CInputNameWondow
extends CWindow {
    static final int CODE_SPACE = 33;
    static final int WIN_XPOS = 24;
    static final int WIN_YPOS = 24;
    static final int X_TEXT_NUM = 13;
    static final int Y_TEXT_NUM = 9;
    static final String[] m_strText = new String[]{"\u3042", "\u3044", "\u3046", "\u3048", "\u304a", "-", "\u306f", "\u3072", "\u3075", "\u3078", "\u307b", "-", "D", "\u304b", "\u304d", "\u304f", "\u3051", "\u3053", "-", "\u307e", "\u307f", "\u3080", "\u3081", "\u3082", "-", "[\u2190]", "\u3055", "\u3057", "\u3059", "\u305b", "\u305d", "-", "\u3084", "\u3000", "\u3086", "\u3000", "\u3088", "-", "D", "\u305f", "\u3061", "\u3064", "\u3066", "\u3068", "-", "\u3089", "\u308a", "\u308b", "\u308c", "\u308d", "-", "[\u2192]", "\u306a", "\u306b", "\u306c", "\u306d", "\u306e", "-", "\u308f", "\u3000", "\u3092", "\u3000", "\u3093", "-", "U", "\u3041", "\u3043", "\u3045", "\u3047", "\u3049", "-", "\u3063", "\u3083", "\u3085", "\u3087", "-", "-", "D", "\u304c", "\u304e", "\u3050", "\u3052", "\u3054", "-", "\u3071", "\u3074", "\u3077", "\u307a", "\u307d", "-", "[\u524a\u9664]", "\u3056", "\u3058", "\u305a", "\u305c", "\u305e", "-", "\u3070", "\u3073", "\u3076", "\u3079", "\u307c", "-", "D", "\u3060", "\u3062", "\u3065", "\u3067", "\u3069", "-", "\u30fc", "\uff01", "\uff1f", "\uff20", "\uff3f", "-", "[\u6c7a\u5b9a]", "\u897f", "\u74dc", "\u592a", "\u90ce"};
    static final String[] m_strError = new String[]{"\u3046\u306a\u3000\u3000", "\u304b\u308b\u3073\u3000", "\u305f\u3072\u3061\u3000", "\u308d\u3053\u3000\u3000", "\u3082\u3053\u3000\u3000"};
    private ARpg m_App;
    private CDispName m_NameWin;
    private int m_nWidth;
    private int m_nHeight;
    private int m_nCursorX;
    private int m_nCursorY;
    private int m_nNameCursor;
    private boolean m_bDecide;
    private boolean m_bMoveUp;
    private boolean m_bMoveDown;
    private boolean m_bMoveRight;
    private boolean m_bMoveLeft;

    CInputNameWondow() {
    }

    public void Create(ARpg aRpg, CDispName cDispName) {
        this.m_App = aRpg;
        this.m_NameWin = cDispName;
        this.m_nWidth = this.GetWidth_Text(16);
        this.m_nHeight = this.GetHeight_Text(9);
        this.m_bMoveUp = false;
        this.m_bMoveDown = false;
        this.m_bMoveRight = false;
        this.m_bMoveLeft = false;
        this._Create(aRpg, Vari.m_WinColor, this.m_nWidth, this.m_nHeight, 4);
    }

    private void Decide() {
        int n = this.m_nCursorX + this.m_nCursorY * 13;
        switch (n) {
            case 25: {
                if (this.m_nNameCursor <= 0) break;
                this.m_nNameCursor += -1;
                break;
            }
            case 51: {
                if (this.m_nNameCursor >= 3) break;
                ++this.m_nNameCursor;
                break;
            }
            case 90: {
                this.DeleteCode();
                break;
            }
            case 116: {
                this.m_bDecide = true;
                break;
            }
            default: {
                this.DecideCode();
            }
        }
        this.m_NameWin.SetCursor(this.m_nNameCursor);
    }

    private void DecideCode() {
        int n = this.m_nCursorX + this.m_nCursorY * 13;
        String string = m_strText[n];
        if (string.equals("U") || string.equals("D")) {
            return;
        }
        this.m_NameWin.SetCode(this.m_nNameCursor, n);
        if (this.m_nNameCursor < 3) {
            ++this.m_nNameCursor;
        }
        this.m_NameWin.SetCursor(this.m_nNameCursor);
    }

    private void MoveCursor(int n, int n2) {
        while (true) {
            int n3;
            this.m_nCursorX += n;
            this.m_nCursorY += n2;
            if (this.m_nCursorX < 0) {
                this.m_nCursorX += 13;
            }
            if (this.m_nCursorX >= 13) {
                this.m_nCursorX -= 13;
            }
            if (this.m_nCursorY < 0) {
                this.m_nCursorY += 9;
            }
            if (this.m_nCursorY >= 9) {
                this.m_nCursorY -= 9;
            }
            if (m_strText[n3 = this.m_nCursorX + this.m_nCursorY * 13].equals("U")) {
                if (n2 != 0) continue;
                n = 0;
                n2 = -1;
                continue;
            }
            if (m_strText[n3].equals("D")) {
                if (n2 != 0) continue;
                n = 0;
                n2 = 1;
                continue;
            }
            if (!m_strText[n3].equals("-")) break;
        }
    }

    public void DrawMessage() {
        int n = 0;
        do {
            int n2 = 0;
            do {
                Color color;
                boolean bl;
                if (n2 == this.m_nCursorX && n == this.m_nCursorY) {
                    bl = true;
                    color = Def.GetColor(6);
                } else {
                    bl = false;
                    color = Def.GetColor(0);
                }
                int n3 = n2 + n * 13;
                if (m_strText[n3].equals("-") || m_strText[n3].equals("U") || m_strText[n3].equals("D")) continue;
                this.DrawFont(this.GetXPos(n2), this.GetYPos(n), m_strText[n3], color, 16);
                if (!bl) continue;
                int n4 = m_strText[n3].length() * 16;
                this.DrawLine(this.GetXPos(n2), this.GetYPos(n) + 16, this.GetXPos(n2) + n4, this.GetYPos(n) + 16);
            } while (++n2 < 13);
        } while (++n < 9);
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

    public void DeleteCode() {
        String string = this.m_NameWin.GetCode(this.m_nNameCursor);
        if (string.equals("\u3000")) {
            if (this.m_nNameCursor > 0) {
                this.m_nNameCursor += -1;
            }
            this.m_NameWin.SetCode(this.m_nNameCursor, 33);
            return;
        }
        this.m_NameWin.SetCode(this.m_nNameCursor, 33);
    }

    public void OpenWindow() {
        this.m_nNameCursor = 0;
        this.m_NameWin.SetCursor(this.m_nNameCursor);
        this.m_nCursorX = 0;
        this.m_nCursorY = 0;
        this.m_bDecide = false;
        this._Open(24 + this.m_nWidth / 2, 24 + this.m_nHeight / 2, 24, 24);
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
            this.DeleteCode();
            this.m_NameWin.SetCursor(this.m_nNameCursor);
        }
        if (this.m_App.CheckKeyDown(3) > 0) {
            if (!this.m_bMoveLeft) {
                this.m_bMoveLeft = true;
                this.MoveCursor(-1, 0);
            }
        } else {
            this.m_bMoveLeft = false;
        }
        if (this.m_App.CheckKeyDown(1) > 0) {
            if (!this.m_bMoveRight) {
                this.m_bMoveRight = true;
                this.MoveCursor(1, 0);
            }
        } else {
            this.m_bMoveRight = false;
        }
        if (this.m_App.CheckKeyDown(0) > 0) {
            if (!this.m_bMoveUp) {
                this.m_bMoveUp = true;
                this.MoveCursor(0, -1);
            }
        } else {
            this.m_bMoveUp = false;
        }
        if (this.m_App.CheckKeyDown(2) > 0) {
            if (!this.m_bMoveDown) {
                this.m_bMoveDown = true;
                this.MoveCursor(0, 1);
            }
        } else {
            this.m_bMoveDown = false;
        }
        if (this.m_App.m_bMouseMove) {
            if (this.IsMouseIn()) {
                int n;
                int n2;
                int n3 = (this.m_App.m_nMouseX - this.m_nPosX - 8) / 16;
                if (n3 >= 13) {
                    n3 = 12;
                }
                if (!((n2 = (this.m_App.m_nMouseY - this.m_nPosY - 8) / 24) >= 9 || m_strText[n = n3 + n2 * 13].equals("-") || m_strText[n].equals("U") || m_strText[n].equals("D"))) {
                    this.m_nCursorX = n3;
                    this.m_nCursorY = n2;
                }
            }
            this.m_App.m_bMouseMove = false;
        }
    }

    public boolean LoopFrame() {
        do {
            this.m_App.MainFrame();
        } while (!this.m_bDecide);
        String string = new String();
        int n = 0;
        do {
            string = string + this.m_NameWin.GetCode(n);
        } while (++n < 4);
        n = 0;
        while (n < m_strError.length) {
            if (string.equals(m_strError[n])) {
                CSlipWindow cSlipWindow = new CSlipWindow();
                cSlipWindow.Create(this.m_App, "\u305d\u306e\u540d\u524d\u306f\u767b\u9332\u3067\u304d\u307e\u305b\u3093");
                this.m_App.EntryWindow(cSlipWindow);
                cSlipWindow.OpenWindow(200, 160);
                this.m_App.LoopFrame(4);
                this.m_App.WaitKey_Display();
                cSlipWindow.CloseWindow();
                this.m_App.LoopFrame(4);
                this.m_App.ReleaseWindow(cSlipWindow);
                this.m_bDecide = false;
                return false;
            }
            ++n;
        }
        if (string.equals("\u3000\u3000\u3000\u3000")) {
            this.m_NameWin.SetCode(0, 117);
            this.m_NameWin.SetCode(1, 118);
            this.m_NameWin.SetCode(2, 119);
            this.m_NameWin.SetCode(3, 120);
            this.m_App.LoopFrame(6);
        }
        this.m_App.m_Play.m_strPlayerName = this.m_NameWin.GetCode(0) + this.m_NameWin.GetCode(1) + this.m_NameWin.GetCode(2) + this.m_NameWin.GetCode(3);
        this.m_App.m_Play.m_anPlayerName[0] = this.m_NameWin.GetCodeNum(0);
        this.m_App.m_Play.m_anPlayerName[1] = this.m_NameWin.GetCodeNum(1);
        this.m_App.m_Play.m_anPlayerName[2] = this.m_NameWin.GetCodeNum(2);
        this.m_App.m_Play.m_anPlayerName[3] = this.m_NameWin.GetCodeNum(3);
        return true;
    }
}

