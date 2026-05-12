/*
 * Decompiled with CFR 0.152.
 */
import java.applet.Applet;
import java.applet.AudioClip;
import java.awt.Color;
import java.awt.Event;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics;
import java.awt.Image;
import java.awt.MediaTracker;

class CGameApp
extends Applet {
    public Thread m_Thread;
    public Image m_OffsImage;
    public Graphics m_OffsGraph;
    public Image m_BackImage;
    public Graphics m_BackGraph;
    public CDrawMap m_Render;
    public MediaTracker m_MediaT;
    public boolean[] m_abMediaFlag;
    public int m_nFontSize = -1;
    private long m_lTime;
    public boolean m_bSoundMode;
    public int m_nSoundDraw;
    public int m_nMouseLeft;
    public int m_nMouseRight;
    public int m_nMouseX;
    public int m_nMouseY;
    public boolean m_bMouseMove;
    public boolean m_bKeyUp;
    public boolean m_bKeyRight;
    public boolean m_bKeyDown;
    public boolean m_bKeyLeft;
    public boolean m_bKeySpace;
    public boolean m_bKeyZ;
    public boolean m_bKeyX;
    public int m_nKeyC;
    public boolean m_bKeyA;
    public boolean m_bKeyS;
    public boolean m_bKeyP;
    public boolean m_bKeyG;
    public int m_nKeyM;
    public int[] m_anInputKey = new int[7];
    public boolean m_bLowSpec;
    public boolean m_bSafeMode;
    public boolean[] m_abSeFlag = new boolean[30];
    public AudioClip[] m_aSe = new AudioClip[30];

    public void DrawRect(int n, int n2, int n3, int n4) {
        this.m_OffsGraph.drawRect(n, n2, n3, n4);
    }

    public void stop() {
        if (this.m_Thread != null) {
            this.m_Thread.stop();
            this.m_Thread = null;
        }
    }

    public boolean mouseMove(Event event, int n, int n2) {
        this.m_nMouseX = n;
        this.m_nMouseY = n2;
        this.m_bMouseMove = true;
        return true;
    }

    public void PlaySeG(int n) {
        if (this.m_bSoundMode && !this.m_abSeFlag[n]) {
            this.m_aSe[n].play();
            this.m_abSeFlag[n] = true;
        }
    }

    public void Create(int n, int n2) {
        this.resize(n, n2);
        this.m_OffsImage = this.createImage(n, n2);
        this.m_OffsGraph = this.m_OffsImage.getGraphics();
        this.m_BackImage = this.createImage(n, n2);
        this.m_BackGraph = this.m_BackImage.getGraphics();
        String string = this.getParameter("Mode");
        if (string.compareTo("0") == 0) {
            this.m_bLowSpec = false;
        }
        if (string.compareTo("1") == 0) {
            this.m_bLowSpec = true;
        }
        if ((string = this.getParameter("Safe")).compareTo("0") == 0) {
            this.m_bSafeMode = false;
        }
        if (string.compareTo("1") == 0) {
            this.m_bSafeMode = true;
        }
        this.m_MediaT = new MediaTracker(this);
        if (this.m_MediaT == null) {
            do {
                this.Wait(100);
                this.m_MediaT = new MediaTracker(this);
            } while (this.m_MediaT == null);
        }
        this.m_abMediaFlag = new boolean[32];
        int n3 = 0;
        do {
            this.m_abMediaFlag[n3] = false;
        } while (++n3 < 32);
    }

    public int GetKeybordVect() {
        if (this.m_bKeyUp) {
            if (this.m_bKeyRight) {
                return 8;
            }
            if (this.m_bKeyLeft) {
                return 2;
            }
            return 1;
        }
        if (this.m_bKeyDown) {
            if (this.m_bKeyRight) {
                return 6;
            }
            if (this.m_bKeyLeft) {
                return 4;
            }
            return 5;
        }
        if (this.m_bKeyRight) {
            return 7;
        }
        if (this.m_bKeyLeft) {
            return 3;
        }
        return 0;
    }

    public int CheckKeyDown(int n) {
        if (this.m_anInputKey[n] > 1) {
            return 2;
        }
        if (this.m_anInputKey[n] == 1) {
            this.m_anInputKey[n] = 2;
            return 1;
        }
        return 0;
    }

    public void DrawFontR(int n, int n2, String string, int n3, Color color) {
        this.SetFontSize(n3);
        FontMetrics fontMetrics = this.m_OffsGraph.getFontMetrics();
        this.m_OffsGraph.setColor(color);
        this.m_OffsGraph.drawString(string, n -= fontMetrics.stringWidth(string), n2 + n3);
    }

    public void update(Graphics graphics) {
        this.paint(graphics);
    }

    public void SetColor(Color color) {
        this.m_OffsGraph.setColor(color);
    }

    public void ClearSeFlag() {
        int n = 0;
        do {
            this.m_abSeFlag[n] = false;
        } while (++n < 30);
    }

    public boolean CheckKeyDown_OK2() {
        return this.CheckKeyDown(5) == 1 || this.CheckKeyDown(6) == 1;
    }

    public CGameApp() {
        this.m_lTime = this.GetNowTime();
    }

    public boolean LoadSe(int n) {
        String string = "efc_";
        string = n < 10 ? string + "0" + n : string + n;
        string = string + ".au";
        this.m_aSe[n] = this.getAudioClip(this.getCodeBase(), string);
        return true;
    }

    public boolean CheckInputKey() {
        return this.m_nMouseLeft == 1 || this.m_nMouseRight == 1 || this.m_bKeyZ || this.m_bKeyX || this.m_bKeySpace || this.m_bKeyUp || this.m_bKeyRight || this.m_bKeyLeft || this.m_bKeyDown;
    }

    public boolean CheckKeyDown_Cancel() {
        if (this.CheckKeyDown(4) == 1) {
            return true;
        }
        if (this.m_nMouseRight == 1) {
            this.m_nMouseRight = 2;
            return true;
        }
        return false;
    }

    public void DrawFontC(int n, int n2, String string, int n3, Color color) {
        this.SetFontSize(n3);
        FontMetrics fontMetrics = this.m_OffsGraph.getFontMetrics();
        this.m_OffsGraph.setColor(color);
        this.m_OffsGraph.drawString(string, n -= fontMetrics.stringWidth(string) >> 1, n2 + n3);
    }

    public void DrawFontC(int n, int n2, String string) {
        FontMetrics fontMetrics = this.m_OffsGraph.getFontMetrics();
        this.m_OffsGraph.drawString(string, n -= fontMetrics.stringWidth(string) >> 1, n2 + this.m_nFontSize);
    }

    public boolean keyDown(Event event, int n) {
        switch (event.key) {
            case 56: 
            case 1004: {
                this.m_bKeyUp = true;
                this.m_anInputKey[0] = this.m_anInputKey[0] + 1;
                break;
            }
            case 54: 
            case 1007: {
                this.m_bKeyRight = true;
                this.m_anInputKey[1] = this.m_anInputKey[1] + 1;
                break;
            }
            case 50: 
            case 1005: {
                this.m_bKeyDown = true;
                this.m_anInputKey[2] = this.m_anInputKey[2] + 1;
                break;
            }
            case 52: 
            case 1006: {
                this.m_bKeyLeft = true;
                this.m_anInputKey[3] = this.m_anInputKey[3] + 1;
                break;
            }
            case 90: 
            case 122: {
                this.m_bKeyZ = true;
                this.m_anInputKey[5] = this.m_anInputKey[5] + 1;
                break;
            }
            case 88: 
            case 120: {
                this.m_bKeyX = true;
                this.m_anInputKey[4] = this.m_anInputKey[4] + 1;
                break;
            }
            case 67: 
            case 99: {
                if (this.m_nKeyC == 0) {
                    this.m_nKeyC = 1;
                    break;
                }
                this.m_nKeyC = 2;
                break;
            }
            case 65: 
            case 97: {
                this.m_bKeyA = true;
                break;
            }
            case 83: 
            case 115: {
                this.m_bKeyS = true;
                break;
            }
            case 77: 
            case 109: {
                this.m_nKeyM = this.m_nKeyM == 0 ? 1 : 2;
                if (this.m_nKeyM != 1) break;
                this.m_bSoundMode = !this.m_bSoundMode;
                this.m_nSoundDraw = 20;
                break;
            }
            case 32: {
                this.m_bKeySpace = true;
                this.m_anInputKey[6] = this.m_anInputKey[6] + 1;
            }
        }
        return false;
    }

    public void FillRect(int n, int n2, int n3, int n4) {
        this.m_OffsGraph.fillRect(n, n2, n3, n4);
    }

    public void ClearKey() {
        this.m_nMouseLeft = 0;
        this.m_bKeySpace = false;
        this.m_bKeyZ = false;
        this.m_bKeyX = false;
        this.m_nKeyC = 0;
        this.m_nKeyM = 0;
        this.m_bKeyA = false;
        this.m_bKeyS = false;
        this.m_bKeyUp = false;
        this.m_bKeyRight = false;
        this.m_bKeyLeft = false;
        this.m_bKeyDown = false;
        int n = 0;
        do {
            this.m_anInputKey[n] = 0;
        } while (++n < 7);
    }

    public void WaitDelay(int n) {
        long l = this.GetNowTime() - this.m_lTime;
        int n2 = (int)((long)n - l);
        if (n2 > 0) {
            this.Wait(n2);
        }
        this.m_lTime = this.GetNowTime();
    }

    public boolean mouseExit(Event event, int n, int n2) {
        this.m_nMouseX = -1;
        this.m_nMouseY = -1;
        return true;
    }

    public void paint(Graphics graphics) {
        graphics.drawImage(this.m_OffsImage, 0, 0, this);
    }

    public void Wait(int n) {
        try {
            Thread.sleep(n);
            return;
        }
        catch (InterruptedException interruptedException) {
            this.stop();
            return;
        }
    }

    public void WaitDelay2(int n) {
        long l = this.GetNowTime() - this.m_lTime;
        int n2 = (int)((long)n - l);
        if (n2 < 15) {
            n2 = 15;
        }
        this.Wait(n2);
        this.m_lTime = this.GetNowTime();
    }

    public boolean mouseUp(Event event, int n, int n2) {
        if (event.modifiers == 4) {
            this.m_nMouseRight = 0;
        } else {
            this.m_nMouseLeft = 0;
        }
        return true;
    }

    public void WaitRepaint(int n) {
        if (this.m_nSoundDraw > 0 || Vari.m_bTitle) {
            this.m_nSoundDraw += -1;
            String string = "SOUND ";
            string = this.m_bSoundMode ? string + "ON" : string + "OFF";
            this.DrawFont(300, 302, string, 16, Color.white);
        }
        this.WaitDelay(n - 15);
        this.repaint();
        this.WaitDelay2(15);
    }

    public void DrawFontCF(int n, int n2, String string, int n3, Color color) {
        this.SetFontSize(n3);
        FontMetrics fontMetrics = this.m_OffsGraph.getFontMetrics();
        this.m_OffsGraph.setColor(Color.black);
        this.m_OffsGraph.drawString(string, (n -= fontMetrics.stringWidth(string) >> 1) - 1, n2 + n3 - 1);
        this.m_OffsGraph.drawString(string, n - 1, n2 + n3 + 1);
        this.m_OffsGraph.drawString(string, n + 1, n2 + n3 - 1);
        this.m_OffsGraph.drawString(string, n + 1, n2 + n3 + 1);
        this.m_OffsGraph.setColor(color);
        this.m_OffsGraph.drawString(string, n, n2 + n3);
    }

    public void destroy() {
    }

    public boolean WaitMediaT(int n) {
        try {
            this.m_MediaT.waitForID(n);
        }
        catch (InterruptedException interruptedException) {
            return false;
        }
        return !this.m_MediaT.isErrorAny();
    }

    public long GetNowTime() {
        return System.currentTimeMillis();
    }

    public void StopSe(int n) {
        if (this.m_bSoundMode) {
            this.m_aSe[n].stop();
        }
    }

    public boolean CheckKeyDown_OK() {
        if (this.CheckKeyDown_OK2()) {
            return true;
        }
        if (this.m_nMouseLeft == 1) {
            this.m_nMouseLeft = 2;
            return true;
        }
        return false;
    }

    public void WaitMouseClick() {
        this.m_nMouseLeft = 0;
        while (this.m_nMouseLeft != 1) {
            this.Wait(20);
        }
    }

    public void DrawFontF(int n, int n2, String string, Color color) {
        this.m_OffsGraph.setColor(Color.black);
        this.m_OffsGraph.drawString(string, n - 1, n2 + this.m_nFontSize - 1);
        this.m_OffsGraph.drawString(string, n - 1, n2 + this.m_nFontSize + 1);
        this.m_OffsGraph.drawString(string, n + 1, n2 + this.m_nFontSize - 1);
        this.m_OffsGraph.drawString(string, n + 1, n2 + this.m_nFontSize + 1);
        this.m_OffsGraph.setColor(color);
        this.m_OffsGraph.drawString(string, n, n2 + this.m_nFontSize);
    }

    public void DrawFont(int n, int n2, String string, int n3, Color color) {
        this.SetFontSize(n3);
        this.m_OffsGraph.setColor(color);
        this.m_OffsGraph.drawString(string, n, n2 + n3);
    }

    public void DrawFont(int n, int n2, String string) {
        this.m_OffsGraph.drawString(string, n, n2 + this.m_nFontSize);
    }

    public boolean keyUp(Event event, int n) {
        switch (event.key) {
            case 56: 
            case 1004: {
                this.m_bKeyUp = false;
                this.m_anInputKey[0] = 0;
                break;
            }
            case 54: 
            case 1007: {
                this.m_bKeyRight = false;
                this.m_anInputKey[1] = 0;
                break;
            }
            case 50: 
            case 1005: {
                this.m_bKeyDown = false;
                this.m_anInputKey[2] = 0;
                break;
            }
            case 52: 
            case 1006: {
                this.m_bKeyLeft = false;
                this.m_anInputKey[3] = 0;
                break;
            }
            case 90: 
            case 122: {
                this.m_bKeyZ = false;
                this.m_anInputKey[5] = 0;
                break;
            }
            case 88: 
            case 120: {
                this.m_bKeyX = false;
                this.m_anInputKey[4] = 0;
                break;
            }
            case 67: 
            case 99: {
                this.m_nKeyC = 0;
                break;
            }
            case 65: 
            case 97: {
                this.m_bKeyA = false;
                break;
            }
            case 83: 
            case 115: {
                this.m_bKeyS = false;
                break;
            }
            case 77: 
            case 109: {
                this.m_nKeyM = 0;
                break;
            }
            case 32: {
                this.m_bKeySpace = false;
                this.m_anInputKey[6] = 0;
            }
        }
        return false;
    }

    public void DrawZenSuji(int n, int n2, int n3, int n4, int n5, Color color) {
        boolean bl = false;
        int n6 = 0;
        while (n6 < n2) {
            int n7 = Calc3D.GetKetaSuji(n, n2 - n6);
            if (n7 != 0 || bl || n6 + 1 == n2) {
                this.DrawFont(n3 + n6 * n5, n4, Def.GetZenSujiCode(n7), n5, color);
                bl = true;
            }
            ++n6;
        }
    }

    public void AddMediaT(Image image, int n) {
        if (!this.m_abMediaFlag[n]) {
            this.m_abMediaFlag[n] = true;
            this.m_MediaT.addImage(image, n);
        }
    }

    public boolean mouseDown(Event event, int n, int n2) {
        if (event.modifiers == 4) {
            ++this.m_nMouseRight;
            if (this.m_nMouseRight > 9999) {
                this.m_nMouseRight = 9999;
            }
        } else {
            ++this.m_nMouseLeft;
            if (this.m_nMouseLeft > 9999) {
                this.m_nMouseLeft = 9999;
            }
        }
        return true;
    }

    public void WaitKeyClick() {
        this.ClearKey();
        while (!this.CheckInputKey()) {
            this.Wait(20);
        }
    }

    public void SetFontSize(int n) {
        if (this.m_nFontSize != n) {
            this.m_nFontSize = n;
            this.m_OffsGraph.setFont(new Font("Serif", 1, n));
        }
    }

    public void PlaySe(int n) {
        if (this.m_bSoundMode) {
            this.m_aSe[n].play();
        }
    }

    public boolean mouseDrag(Event event, int n, int n2) {
        this.m_nMouseX = n;
        this.m_nMouseY = n2;
        return true;
    }

    public String GetModelFileName(int n) {
        String string = this.getCodeBase().toString();
        string = string + "data/mdl";
        string = n < 10 ? string + "00" + n + "._k3" : (n < 100 ? string + "0" + n + "._k3" : string + n + "._k3");
        return string;
    }
}

