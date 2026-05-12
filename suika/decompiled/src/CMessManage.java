/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Image;

class CMessManage {
    static final char[] CTRL_CODE = new char[]{'C', 'R', 'E', 'S', 'N', 'w', 'k', 'r', 'g', 'b', 'y', 'c', 'p'};
    private ARpg m_App;
    private String m_strMess;
    private boolean m_bStop;
    private int m_nWidth;
    private int m_nHeight;
    private int m_nMaxColumn;
    private Color m_BackColor;
    private Image m_MessImage;
    private Graphics m_MessGraph;
    private int m_nCurXPos;
    private int m_nCurYPos;
    private int m_nTextLine;
    private int m_nTextMax;
    private Color m_FontColor;
    private int m_nStopX;
    private int m_nStopY;
    private boolean m_bMessStop;
    private boolean m_bDispFont;

    public void ClearMessageStop() {
        this.SetColor(this.m_BackColor);
        this.m_MessGraph.fillRect(this.m_nStopX - 1, this.m_nStopY - 3, 18, 22);
    }

    public boolean CheckScroll() {
        if (this.m_nCurYPos < 3) {
            return false;
        }
        this.ClearMessageStop();
        this.m_bStop = true;
        int n = 4;
        int n2 = 0;
        while (n2 < n) {
            this.SetColor(this.m_BackColor);
            this.m_MessGraph.fillRect(0, 0, this.m_nWidth, 8);
            this.m_MessGraph.copyArea(0, 6, this.m_nWidth, this.m_nHeight - 6, 0, -6);
            this.m_App.MainFrame();
            ++n2;
        }
        this.m_nCurYPos += -1;
        this.m_bStop = false;
        return true;
    }

    CMessManage() {
    }

    public void Create(ARpg aRpg, int n, int n2, int n3, Color color) {
        this.m_App = aRpg;
        this.m_nMaxColumn = n;
        this.m_nWidth = n2;
        this.m_nHeight = n3;
        this.m_BackColor = new Color(color.getRed(), color.getGreen(), color.getBlue());
        this.m_bDispFont = false;
        this.m_MessImage = aRpg.createImage(n2, n3);
        this.m_MessGraph = this.m_MessImage.getGraphics();
        this.m_MessGraph.setFont(new Font("Serif", 1, 16));
        this.ClearWindow();
        this.m_nStopX = n2 - 16 - 8;
        this.m_nStopY = n3 - 16 - 8;
    }

    public void MessageStop() {
        int[] nArray = new int[]{-2, 0, 1, 2, 1, 0};
        int n = 0;
        this.m_bMessStop = true;
        while (true) {
            this.ClearMessageStop();
            this.DrawFont(this.m_nStopX, this.m_nStopY + nArray[n % 6], "\u25bc");
            CNpcMove.Move();
            this.m_App.MainFrame();
            if (this.m_App.CheckInputKey()) break;
            ++n;
        }
        this.m_bMessStop = false;
        this.ClearMessageStop();
    }

    public Image GetImage() {
        return this.m_MessImage;
    }

    public int GetHeight() {
        return this.m_nHeight;
    }

    private void ClearWindow() {
        this.SetColor(this.m_BackColor);
        this.m_MessGraph.fillRect(0, 0, this.m_nWidth, this.m_nHeight);
    }

    public void SetMessage(String string) {
        this.m_strMess = string;
        this.m_nTextLine = 0;
    }

    public boolean Run() {
        if (this.m_strMess == null) {
            return true;
        }
        if (this.m_bStop) {
            return false;
        }
        if (this.m_bMessStop) {
            return false;
        }
        if (this.m_nTextLine == 0) {
            this.m_nTextMax = this.m_strMess.length();
        }
        if (this.m_nTextLine + 1 >= this.m_nTextMax) {
            return true;
        }
        String string = this.m_strMess.substring(this.m_nTextLine, this.m_nTextLine + 1);
        ++this.m_nTextLine;
        if (string.equals("@")) {
            char c = this.m_strMess.charAt(this.m_nTextLine);
            ++this.m_nTextLine;
            if (this.ControlCode(c)) {
                return true;
            }
        } else {
            this.CheckScroll();
            this.Output(string);
        }
        if (this.m_nTextLine >= this.m_nTextMax - 1) {
            this.m_strMess = null;
            this.m_nTextLine = 0;
            if (this.m_bDispFont) {
                this.NextLine();
            }
            return true;
        }
        return false;
    }

    private void NextLine() {
        this.m_nCurXPos = 0;
        ++this.m_nCurYPos;
    }

    public void SetColor(Color color) {
        this.m_MessGraph.setColor(color);
    }

    private void DrawFont(int n, int n2, String string) {
        this.SetColor(this.m_FontColor);
        this.m_MessGraph.drawString(string, n, n2 + 16);
    }

    public int GetWidth() {
        return this.m_nWidth;
    }

    public int GetTextXPos() {
        return this.m_nCurXPos * 16 + 8;
    }

    public void DrawName() {
        char c = this.m_strMess.charAt(this.m_nTextLine);
        c = (char)(c - 48);
        ++this.m_nTextLine;
        CChrParam cChrParam = Vari.GetChrPrm(c);
        String string = cChrParam.m_strName;
        String string2 = "\u3000";
        int n = string.length();
        int n2 = 0;
        while (n2 < n) {
            String string3 = string.substring(n2, n2 + 1);
            if (string3.compareTo(string2) == 0) break;
            this.Output(string3);
            ++n2;
        }
    }

    public void ClearMessage() {
        this.ClearWindow();
        this.ResetCursorPos();
        this.SetFontColor(0);
    }

    private void Output(String string) {
        this.m_bDispFont = true;
        this.DrawFont(this.GetTextXPos(), this.GetTextYPos(), string);
        ++this.m_nCurXPos;
    }

    private boolean ControlCodeSub(int n) {
        switch (n) {
            case 0: {
                this.ClearWindow();
                this.ResetCursorPos();
                break;
            }
            case 1: {
                this.NextLine();
                break;
            }
            case 2: {
                return true;
            }
            case 3: {
                this.MessageStop();
                break;
            }
            case 4: {
                this.DrawName();
                break;
            }
            case 5: {
                this.SetFontColor(0);
                break;
            }
            case 6: {
                this.SetFontColor(1);
                break;
            }
            case 7: {
                this.SetFontColor(2);
                break;
            }
            case 8: {
                this.SetFontColor(3);
                break;
            }
            case 9: {
                this.SetFontColor(4);
                break;
            }
            case 10: {
                this.SetFontColor(5);
                break;
            }
            case 11: {
                this.SetFontColor(6);
                break;
            }
            case 12: {
                this.SetFontColor(7);
            }
        }
        return false;
    }

    private boolean ControlCode(char c) {
        int n = 0;
        while (n < CTRL_CODE.length) {
            if (c == CTRL_CODE[n]) {
                return this.ControlCodeSub(n);
            }
            ++n;
        }
        return true;
    }

    private void SetFontColor(int n) {
        this.m_FontColor = Def.COLOR_TABLE[n];
    }

    private void ResetCursorPos() {
        this.m_bDispFont = false;
        this.m_nCurXPos = 0;
        this.m_nCurYPos = 0;
    }

    public int GetTextYPos() {
        return this.m_nCurYPos * 24 + 8;
    }
}

