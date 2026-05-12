/*
 * Decompiled with CFR 0.152.
 */
class CAbility {
    static final int MAX_ABILITY = 200;
    static final int MAX_ABILITY_S = 112;
    static final int AB_HP15 = 0;
    static final int AB_HP30 = 1;
    static final int AB_MP15 = 2;
    static final int AB_MP30 = 3;
    static final int AB_STR15 = 4;
    static final int AB_STR30 = 5;
    static final int AB_INT15 = 6;
    static final int AB_INT30 = 7;
    static final int AB_DEF15 = 8;
    static final int AB_DEF30 = 9;
    static final int AB_AGI15 = 10;
    static final int AB_AGI30 = 11;
    static final int AB_DEX15 = 12;
    static final int AB_DEX30 = 13;
    static final int AB_EXP30 = 14;
    static final int AB_AP30 = 15;
    static final int AB_BS00 = 16;
    static final int AB_BS01 = 17;
    static final int AB_BS02 = 18;
    static final int AB_BS03 = 19;
    static final int AB_BS04 = 20;
    static final int AB_BS05 = 21;
    static final int AB_BS06 = 22;
    static final int AB_BS07 = 23;
    static final int AB_BS08 = 24;
    static final int AB_BS09 = 25;
    static final int AB_BS_END = 25;
    static final int AB_SW00 = 26;
    static final int AB_SW01 = 27;
    static final int AB_SW02 = 28;
    static final int AB_SW03 = 29;
    static final int AB_SW04 = 30;
    static final int AB_SW05 = 31;
    static final int AB_SW06 = 32;
    static final int AB_SW07 = 33;
    static final int AB_SW08 = 34;
    static final int AB_SW09 = 35;
    static final int AB_SW10 = 36;
    static final int AB_SW_END = 36;
    static final int AB_SW11 = 37;
    static final int AB_SW12 = 38;
    static final int AB_SB_END = 38;
    static final int AB_ON00 = 39;
    static final int AB_ON01 = 40;
    static final int AB_ON02 = 41;
    static final int AB_ON03 = 42;
    static final int AB_ON04 = 43;
    static final int AB_ON05 = 44;
    static final int AB_ON06 = 45;
    static final int AB_ON07 = 46;
    static final int AB_ON08 = 47;
    static final int AB_ON09 = 48;
    static final int AB_ON10 = 49;
    static final int AB_ON_END = 49;
    static final int AB_PR00 = 50;
    static final int AB_PR01 = 51;
    static final int AB_PR02 = 52;
    static final int AB_PR03 = 53;
    static final int AB_PR04 = 54;
    static final int AB_PR05 = 55;
    static final int AB_PR06 = 56;
    static final int AB_PR07 = 57;
    static final int AB_PR08 = 58;
    static final int AB_PR09 = 59;
    static final int AB_PR10 = 60;
    static final int AB_PR11 = 61;
    static final int AB_PR12 = 62;
    static final int AB_PR13 = 63;
    static final int AB_PR14 = 64;
    static final int AB_PR15 = 65;
    static final int AB_PR16 = 66;
    static final int AB_PR17 = 67;
    static final int AB_PR_END = 67;
    static final int AB_EN00 = 68;
    static final int AB_EN01 = 69;
    static final int AB_EN02 = 70;
    static final int AB_EN03 = 71;
    static final int AB_EN04 = 72;
    static final int AB_EN05 = 73;
    static final int AB_EN06 = 74;
    static final int AB_EN07 = 75;
    static final int AB_EN08 = 76;
    static final int AB_EN09 = 77;
    static final int AB_EN10 = 78;
    static final int AB_EN11 = 79;
    static final int AB_EN12 = 80;
    static final int AB_EN13 = 81;
    static final int AB_EN_END = 81;
    static final int AB_SO00 = 82;
    static final int AB_SO01 = 83;
    static final int AB_SO02 = 84;
    static final int AB_SO03 = 85;
    static final int AB_SO04 = 86;
    static final int AB_SO05 = 87;
    static final int AB_SO_END = 87;
    static final int AB_TH00 = 88;
    static final int AB_TH01 = 89;
    static final int AB_TH02 = 90;
    static final int AB_STOP = 91;
    static final int AB_POISON = 92;
    static final int AB_CONF = 93;
    static final int AB_DEAD = 94;
    static final int AB_CLOSE = 95;
    static final int AB_HEALHP = 96;
    static final int AB_HEALMP = 97;
    static final int AB_FIH = 98;
    static final int AB_ICH = 99;
    static final int AB_AIH = 100;
    static final int AB_HOH = 101;
    static final int AB_RARE = 102;
    static final int AB_GOLD = 103;
    static final int AB_DRUG = 104;
    static final int AB_STEAL = 105;
    static final int AB_SUIKA = 106;
    static final int AB_MPHALF = 107;
    static final int AB_SHIELD = 108;
    static final int AB_COUNT = 109;
    static final int AB_SWUP = 110;
    static final int AB_COMBO = 111;
    static final int AB_P_FIR = 112;
    static final int AB_P_PAR = 113;
    static final int AB_P_CON = 114;
    static final int AB_P_PAI = 115;
    static final int AB_A_S = 116;
    static final int AB_FIS = 117;
    static final int AB_ICS = 118;
    static final int AB_AIS = 119;
    static final int AB_THS = 120;
    static final int AB_HOS = 121;
    static final int AB_FIW = 122;
    static final int AB_ICW = 123;
    static final int AB_AIW = 124;
    static final int AB_THW = 125;
    static final int AB_HOW = 126;
    static final int AB_FIA = 127;
    static final int AB_ICA = 128;
    static final int AB_AIA = 129;
    static final int AB_THA = 130;
    static final int AB_HOA = 131;
    static final int AB_NOMAG = 132;
    static final int AB_BOSS = 133;
    static final int AB_SP00 = 134;
    static final int AB_SP01 = 135;
    static final int AB_SP02 = 136;
    static final int AB_SP03 = 137;
    static final int AB_METAL = 138;
    static final int AB_SP05 = 139;
    static final int AB_UNA_S = 140;
    static final int AB_SP07 = 141;
    static final int AB_SP08 = 142;
    static final int AB_SP09 = 143;
    static final int AB_FF00 = 144;
    static final int AB_FF01 = 145;
    static final int AB_SP10 = 146;
    static final int AB_PAIN = 147;
    static final int AB_SP11 = 148;
    static final int AB_HELPER = 149;
    static final int AB_SP12 = 150;
    static final int AB_SP13 = 151;
    static final int AB_SP15 = 152;
    static final int AB_FF03 = 153;
    static final int AB_SP16 = 154;
    static final int AB_SP17 = 155;
    static final int AB_MUTEKI = 156;
    static final int AB_SP18 = 157;
    static final int AB_SP19 = 158;
    static final int AB_SP20 = 159;
    static final int AB_SP21 = 160;
    static final int AB_MONKEY = 161;
    static final int AB_M_ATK = 162;
    static final int AB_MANE = 163;
    static final int AB_SP22 = 164;
    static final int AB_HER_FS = 165;
    static final int AB_HER_IS = 166;
    static final int AB_HER_AS = 167;
    static final int AB_HER_TS = 168;
    static final int AB_HER_FE = 169;
    static final int AB_HER_IE = 170;
    static final int AB_HER_AE = 171;
    static final int AB_HER_TE = 172;
    static final int AB_STEP = 173;
    static final int AB_SW_WE = 174;
    static final int AB_SP23 = 175;
    static final int AB_SP24 = 176;
    static final int AB_SP25 = 177;
    static final int AB_SP26 = 178;
    static final int AB_SP27 = 179;
    static final int AB_WORLD = 180;
    static final int AB_SP28 = 181;
    static final int AB_STONE = 182;
    static final int AB_COUNT2 = 183;
    static final int AB_COUNT3 = 184;
    static final int AB_LARROW = 185;
    static final int AB_SP29 = 186;
    static final int AB_SC00 = 187;
    static final int AB_SC01 = 188;
    static final int AB_SC02 = 189;
    static final int AB_SC03 = 190;
    static final int AB_SP30 = 191;
    static final int AB_GOLEM = 192;
    static final int AB_SP31 = 193;
    static final int AB_SC04 = 194;
    static final int AB_SP32 = 195;
    static final int AB_SP33 = 196;
    static final int AB_SP34 = 197;
    static final int AB_SP35 = 198;
    static final int AB_SP36 = 199;
    static final int AB_SP37 = 200;
    static final int AB_SP38 = 201;
    static final int AB_SP39 = 202;
    static final int AB_SP40 = 203;
    static final int AB_SP41 = 204;
    static final int AB_SP42 = 205;
    static final int AB_SP43 = 206;
    static final int AB_SP44 = 207;
    static final int AB_SP45 = 208;
    static final int AB_SP46 = 209;
    private CFlag2 m_FlagM = new CFlag2();
    private CFlag2 m_FlagI = new CFlag2();
    private CFlag2 m_CmdAb = new CFlag2();

    public int GetValueI(int n) {
        return this.m_FlagI.GetValue(n);
    }

    public void SetFlagC(int n) {
        this.m_CmdAb.SetFlag(n);
    }

    public void SetFlagM(int n) {
        this.m_FlagM.SetFlag(n);
    }

    public void Set(CAbility cAbility) {
        this.m_FlagM.Set(cAbility.m_FlagM);
        this.m_FlagI.Set(cAbility.m_FlagI);
        this.m_CmdAb.Set(cAbility.m_CmdAb);
    }

    public void CheckCmdAb() {
        if (this.ScopeNum(16, 25) > 0) {
            this.m_CmdAb.SetFlag(5);
        } else {
            this.m_CmdAb.ResetFlag(5);
        }
        if (this.ScopeNum(50, 67) > 0) {
            this.m_CmdAb.SetFlag(6);
        } else {
            this.m_CmdAb.ResetFlag(6);
        }
        if (this.ScopeNum(39, 49) > 0) {
            this.m_CmdAb.SetFlag(7);
        } else {
            this.m_CmdAb.ResetFlag(7);
        }
        if (this.ScopeNum(68, 81) > 0) {
            this.m_CmdAb.SetFlag(9);
        } else {
            this.m_CmdAb.ResetFlag(9);
        }
        if (this.ScopeNum(82, 87) > 0) {
            this.m_CmdAb.SetFlag(11);
            return;
        }
        this.m_CmdAb.ResetFlag(11);
    }

    public void SetFlagI(int n) {
        this.m_FlagI.SetFlag(n);
    }

    CAbility() {
        this.m_FlagM.Create(200);
        this.m_FlagI.Create(200);
        this.m_CmdAb.Create(12);
    }

    public void ClearFlagC() {
        this.m_CmdAb.ClearFlag();
    }

    public boolean GetFlagC(int n) {
        return this.m_CmdAb.GetFlag(n);
    }

    public void ClearFlagM() {
        this.m_FlagM.ClearFlag();
    }

    public boolean GetFlagM(int n) {
        return this.m_FlagM.GetFlag(n);
    }

    public void ResetFlagM(int n) {
        this.m_FlagM.ResetFlag(n);
    }

    public void ResetFlagC(int n) {
        this.m_CmdAb.ResetFlag(n);
    }

    public int ScopeNum(int n, int n2) {
        int n3 = 0;
        int n4 = n;
        while (n4 <= n2) {
            if (this.GetFlag(n4)) {
                ++n3;
            }
            ++n4;
        }
        return n3;
    }

    public void ClearFlagI() {
        this.m_FlagI.ClearFlag();
    }

    public boolean GetFlagI(int n) {
        return this.m_FlagI.GetFlag(n);
    }

    public void ResetFlagI(int n) {
        this.m_FlagI.ResetFlag(n);
    }

    public void SetValueC(int n, int n2) {
        this.m_CmdAb.SetValue(n, n2);
    }

    public boolean GetFlag(int n) {
        if (this.m_FlagM.GetFlag(n)) {
            return true;
        }
        return this.m_FlagI.GetFlag(n);
    }

    public void SetValueM(int n, int n2) {
        this.m_FlagM.SetValue(n, n2);
    }

    public int GetValueC(int n) {
        return this.m_CmdAb.GetValue(n);
    }

    public int GetValueM(int n) {
        return this.m_FlagM.GetValue(n);
    }
}

