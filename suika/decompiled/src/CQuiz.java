/*
 * Decompiled with CFR 0.152.
 */
class CQuiz {
    static final int MAX_QUIZ = 4;
    static final String[] ITEM_HEADER = new String[]{"\uff21", "\uff22", "\uff23", "\uff24"};
    private CMenuWindow m_Menu = new CMenuWindow();
    private CQuizTimeWindow m_Time = new CQuizTimeWindow();
    private int[] m_anXChg = new int[4];

    public void CreateSelect(int n) {
        int n2 = 0;
        do {
            this.m_anXChg[n2] = n2;
        } while (++n2 < 4);
        int n3 = 0;
        do {
            n2 = Calc3D.Rand(4);
            int n4 = Calc3D.Rand(4);
            int n5 = this.m_anXChg[n2];
            this.m_anXChg[n2] = this.m_anXChg[n4];
            this.m_anXChg[n4] = n5;
        } while (++n3 < 16);
        ARpg aRpg = Vari.m_App;
        this.m_Menu.ClearText();
        int n6 = 0;
        do {
            String string = ITEM_HEADER[n6] + "\uff1a" + CQuizData.GetQuizItem(n, this.m_anXChg[n6]);
            this.m_Menu.SetMenuText(n6, string);
        } while (++n6 < 4);
        this.m_Menu.ResetCursorPos();
        this.m_Menu.OpenWindow(16, 16);
        aRpg.LoopFrame(4);
    }

    public int SelectQuiz(int n, int n2) {
        int n3 = Calc3D.Rand(4);
        int n4 = Calc3D.Rand(2) * 8;
        return n * 16 + n4 + n3 + n2 * 2;
    }

    public void Create() {
        ARpg aRpg = Vari.m_App;
        aRpg.m_Play.ResetEvtFlag(304);
        aRpg.m_Play.ResetEvtFlag(303);
        aRpg.SetStopDisplay();
        this.m_Menu.Create(aRpg, 4);
        this.m_Menu.SetFlag(8);
        aRpg.EntryWindow(this.m_Menu);
        this.m_Time.Create();
        aRpg.EntryWindow(this.m_Time);
        this.m_Time.OpenWindow();
    }

    public void Interval() {
        int n = Calc3D.Rand(6);
        switch (n) {
            case 0: {
                this.DrawMessage("@C\u3082\u306e\u300c\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb@S");
                this.DrawMessage("\u3000\u3000\u3000\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb@S");
                this.DrawMessage("\u3000\u3000\u3000\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb@S");
                this.DrawMessage("\u3000\u3000\u3000\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb@S");
                this.DrawMessage("\u3000\u3000\u3000\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb@S@C");
                this.DrawMessage("\u3046\u306a\u300c\u306a\u3093\u304b\u8a00\u3048\u3088\u3063\uff01");
                this.DrawMessage("\u3000\u3000\u3000\u5408\u3063\u3066\u308b\u306e\u304b\uff1f\u9593\u9055\u3063\u3066\u308b\u306e\u304b\uff1f@S@C");
                this.DrawMessage("\u3082\u306e\u300c\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb@S");
                this.DrawMessage("\u3000\u3000\u3000\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb@S");
                return;
            }
            case 1: {
                this.DrawMessage("@C\u3082\u306e\u300c\u3046\uff5e\u3093\u3001\u3046\uff5e\u3093\u3001\u3046\uff5e\u3093\u3001\u3046\uff5e\u3093\u3001");
                this.DrawMessage("\u3000\u3000\u3000\u3046\uff5e\u3093\u3001\u3046\uff5e\u3093\u3001\u3046\uff5e\u3093\u3001\u3046\uff5e\u3093\u3001");
                this.DrawMessage("\u3000\u3000\u3000\u3046\uff5e\u3093\u3001\u3046\uff5e\u3093\u3001\u3046\uff5e\u3093\u3001\u3046\uff5e\u3093@S");
                return;
            }
            case 2: {
                this.DrawMessage("@C\u3082\u306e\u300c\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1");
                this.DrawMessage("\u3000\u3000\u3000\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1@S@C");
                this.DrawMessage("\u3046\u306a\u300c\u304a\u3044\u304a\u3044\u3001\u5927\u4e08\u592b\u304b\uff1f@S@C");
                this.DrawMessage("@C\u3082\u306e\u300c\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1");
                this.DrawMessage("\u3000\u3000\u3000\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1\u30cf\u30a1@S");
                return;
            }
            case 3: {
                this.DrawMessage("@C\u3082\u306e\u300c\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb@S@C");
                this.DrawMessage("\u304b\u308b\u3073\u300c\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb@S@C");
                this.DrawMessage("\u3046\u306a\u300c\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb@S@C");
                this.DrawMessage("\u3082\u306e\u300c\u3002\u3002\u3002\u3002\u3002\u3002\u3002\u3002\u3002\u3002\u3002\u3002\u3002\u3002\u3002\u3002\u3002\u3002@S@C");
                this.DrawMessage("\u304b\u308b\u3073\u300c\u2234\u2234\u2234\u2234\u2234\u2234\u2234\u2234\u2234\u2234\u2234\u2234\u2234\u2234\u2234\u2234\u2234@S@C");
                this.DrawMessage("\u3046\u306a\u300c\uff3e\u2018\u2019\u201d\u2019\u2032\u309b\u2018\u201d\u2019\u309b\uff3e\uff40\u201d\u2032\u2019\u2018\u00b0@S@C");
                this.DrawMessage("\u3082\u306e\u300c\u309d\u309e\u30fe\u30fd\u309d\u309e\u30fe\u30fd\u309d\u309e\u30fe\u30fd\u309d\u309e\u30fe\u30fd\u309d\u309e@S");
                return;
            }
            case 4: {
                this.DrawMessage("@C\u3082\u306e\u300c\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb@S");
                this.DrawMessage("\u3000\u3000\u3000\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb@S");
                return;
            }
            case 5: {
                this.DrawMessage("@C\u304b\u308b\u3073\u300c\u6b63\u89e3\u3063\uff01@S@C");
                this.DrawMessage("\u3046\u306a\u300c\u304a\u524d\u304c\u8a00\u3046\u306a\u3088\u3002@S@C");
                this.DrawMessage("\u3082\u306e\u300c\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb\u30fb@S");
            }
        }
    }

    CQuiz() {
    }

    public void DrawMessage(String string) {
        CMessWindow cMessWindow = Vari.m_App.m_MessWin;
        String string2 = string + "\u3000";
        cMessWindow.SetMessage(string2);
        cMessWindow.WaitMessage();
    }

    public void Release() {
        ARpg aRpg = Vari.m_App;
        this.m_Time.CloseWindow();
        aRpg.LoopFrame(4);
        aRpg.ReleaseWindow(this.m_Menu);
        aRpg.ReleaseWindow(this.m_Time);
        aRpg.ResetStopDisplay();
    }

    public void Run(int n) {
        int n2;
        int n3;
        this.Create();
        int n4 = 0;
        do {
            n2 = this.SelectQuiz(n4, n);
            this.DrawQuiz(n4, n2);
        } while ((n3 = this.DoSelect(n2)) != -1 && ++n4 < 4);
        this.Release();
    }

    public void DrawQuiz(int n, int n2) {
        String string = "@C\u7b2c";
        string = string + Calc3D.NumberString(n + 1, 1);
        string = string + "\u554f\u3000";
        this.DrawMessage(string);
        this.DrawMessage(CQuizData.GetQuizText(n2, 0));
        this.DrawMessage(CQuizData.GetQuizText(n2, 1));
    }

    public int DoSelect(int n) {
        this.CreateSelect(n);
        this.m_Time.Start();
        do {
            Vari.m_App.MainFrame();
            int n2 = this.m_Menu.GetDicide();
            if (n2 == 9999) continue;
            this.m_Time.End();
            this.Interval();
            if (this.m_anXChg[n2] != 0) {
                this.m_Time.CloseWindow();
                Vari.m_App.m_Play.SetEvtFlag(303);
                return -1;
            }
            this.DrawMessage("\u3000\u3000\u3000\u6b63\u89e3\uff01@S");
            return 0;
        } while (this.m_Time.GetTime() != 0);
        this.m_Menu.CloseWindow();
        this.m_Time.CloseWindow();
        Vari.m_App.m_Play.SetEvtFlag(304);
        return -1;
    }
}

