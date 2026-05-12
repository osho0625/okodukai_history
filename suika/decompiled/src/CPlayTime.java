/*
 * Decompiled with CFR 0.152.
 */
class CPlayTime {
    static final int MAX_TIME = 99;
    static final int MAX_COUNT = 359999;
    private long m_lStartTime;
    private int m_nNowTime;
    private int m_nBaseTime;
    private int m_nNowH;
    private int m_nNowM;
    private int m_nNowS;

    public int GetMinute() {
        return this.m_nNowM;
    }

    public int GetSecond() {
        return this.m_nNowS;
    }

    public int GetMinuteBase() {
        return this.m_nBaseTime / 60 % 60;
    }

    public void Reset() {
        this.m_nNowS = 0;
        this.m_nNowM = 0;
        this.m_nNowH = 0;
        this.m_nBaseTime = 0;
    }

    public void Count() {
        this.m_nNowTime = (int)((Vari.m_App.GetNowTime() - this.m_lStartTime) / 1000L);
        int n = this.m_nNowTime + this.m_nBaseTime;
        if (n > 359999) {
            n = 359999;
        }
        this.m_nNowS = n % 60;
        this.m_nNowM = n / 60 % 60;
        this.m_nNowH = n / 3600;
        this.AdjustNow();
    }

    public int GetHour() {
        return this.m_nNowH;
    }

    public void AddBase(int n, int n2, int n3) {
        this.m_nBaseTime = n * 3600 + n2 * 60 + n3;
        this.AdjustBase();
    }

    public void AdjustBase() {
        if (this.m_nBaseTime > 359999) {
            this.m_nBaseTime = 359999;
        }
    }

    public int GetHourBase() {
        return this.m_nBaseTime / 3600 % 100;
    }

    public void AdjustNow() {
        if (this.m_nNowS >= 60) {
            ++this.m_nNowM;
            this.m_nNowS -= 60;
        }
        if (this.m_nNowM >= 60) {
            ++this.m_nNowH;
            this.m_nNowM -= 60;
        }
        if (this.m_nNowH > 99) {
            this.m_nNowH = 99;
            this.m_nNowM = 59;
            this.m_nNowS = 59;
        }
    }

    public int GetSecondBase() {
        return this.m_nBaseTime % 60;
    }

    public void Push() {
        this.Count();
        this.m_nBaseTime = this.m_nNowH * 3600 + this.m_nNowM * 60 + this.m_nNowS;
        this.AdjustBase();
        this.Start();
    }

    public void Start() {
        this.m_lStartTime = Vari.m_App.GetNowTime();
        this.m_nNowS = 0;
        this.m_nNowM = 0;
        this.m_nNowH = 0;
    }

    CPlayTime() {
        this.Reset();
    }
}

