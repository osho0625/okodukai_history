/*
 * Decompiled with CFR 0.152.
 */
class CHelpAbility
extends CBaseHelp {
    static final int MAX_LIST = 112;
    private int[] m_anList = new int[112];

    CHelpAbility() {
        this.Init();
    }

    public void FrameFunc() {
        int n = this.m_anList[this.GetSelectNo()];
        this.SetHelp(n);
    }

    public void SetHelp(int n) {
        String string;
        CSkillData cSkillData = Vari.GetSkillData(n);
        this.m_Help.SetText(0, Vari.GetSkillHelp(n));
        if (cSkillData == null) {
            this.m_Help.SetText(1, "");
            return;
        }
        int n2 = this.GetSkillKind(n);
        if (n2 == 1) {
            string = "\u30d5\u30a3\u30fc\u30eb\u30c9\u3000\u3000\u3000\u3000\u3000\u3000\u3000\uff2d";
            string = string + Calc3D.NumberString(cSkillData.m_nMP, 3);
        } else if (n2 == 2) {
            string = "\u6226\u95d8\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\uff2d";
            string = string + Calc3D.NumberString(cSkillData.m_nMP, 3);
        } else if (n2 == 3) {
            string = "\u30d5\u30a3\u30fc\u30eb\u30c9\uff0f\u6226\u95d8\u3000\u3000\u3000\u3000\uff2d";
            string = string + Calc3D.NumberString(cSkillData.m_nMP, 3);
        } else {
            string = n2 == 4 ? "\u5263\u6280\uff08\u305f\u305f\u304b\u3046\u3067\u767a\u52d5\uff09" : "\u30aa\u30fc\u30c8\u30a2\u30d3\u30ea\u30c6\u30a3";
        }
        this.m_Help.SetText(1, string);
    }

    public void CreateList() {
        this.m_nListNum = 0;
        int n = 0;
        do {
            if (!Vari.IsPartyAbility(n)) continue;
            this.m_anList[this.m_nListNum] = n;
            ++this.m_nListNum;
        } while (++n < 112);
    }

    public int GetSkillKind(int n) {
        if (n == 88 || n == 89 || n == 90) {
            return 1;
        }
        if (n == 17 || n == 50 || n == 57) {
            return 3;
        }
        if (n >= 16 && n <= 25 || n >= 39 && n <= 49 || n >= 50 && n <= 67 || n >= 68 && n <= 81 || n >= 82 && n <= 87) {
            return 2;
        }
        if (n >= 26 && n <= 38) {
            return 4;
        }
        return 0;
    }

    public void CreateText() {
        int n = 0;
        while (n < this.m_nListNum) {
            CSkillData cSkillData = Vari.GetSkillData(this.m_anList[n]);
            this.SetMenuTextLR(n, cSkillData.m_strName);
            ++n;
        }
        this.MakeList();
    }
}

