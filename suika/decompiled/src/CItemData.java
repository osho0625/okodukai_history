/*
 * Decompiled with CFR 0.152.
 */
class CItemData
extends CFlag {
    static final int NO_BUY = 1;
    public int m_nWorkNo;
    public String m_strName;
    public int m_nKind;
    public int m_nAlgo;
    public int m_nEffect;
    public int m_nEquip;
    public int m_nStr;
    public int m_nInt;
    public int m_nDef;
    public int m_nAgi;
    public int m_nDex;
    public int m_nAbi;
    public int m_nHelp;
    public int m_nGold;

    public boolean IsSell() {
        return this.m_nGold != 0;
    }

    CItemData() {
    }

    public String GetItem() {
        return this.m_strName;
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
}

