/*
 * Decompiled with CFR 0.152.
 */
class CTreasure {
    public int m_nXPos;
    public int m_nZPos;
    public int m_nVect;
    public int m_nItem;
    public int m_nFlag;

    public void Set(CTreasure cTreasure) {
        this.m_nXPos = cTreasure.m_nXPos;
        this.m_nZPos = cTreasure.m_nZPos;
        this.m_nVect = cTreasure.m_nVect;
        this.m_nItem = cTreasure.m_nItem;
        this.m_nFlag = cTreasure.m_nFlag;
    }

    CTreasure() {
    }
}

