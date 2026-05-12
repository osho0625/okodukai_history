/*
 * Decompiled with CFR 0.152.
 */
class CSkillData {
    public String m_strName;
    public int m_nWorkNo;
    public int m_nObject;
    public int m_nKind;
    public int m_nMP;
    public int m_nHelp;

    CSkillData() {
    }

    public String GetName7() {
        String string = new String(this.m_strName);
        int n = 7 - this.m_strName.length();
        int n2 = 0;
        while (n2 < n) {
            string = string + "\u3000";
            ++n2;
        }
        return string;
    }

    public int GetMP(CChrParam cChrParam) {
        if (cChrParam.m_Abi.GetFlag(107)) {
            return this.m_nMP * 2 / 3;
        }
        return this.m_nMP;
    }
}

