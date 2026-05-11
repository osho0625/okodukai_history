/*
 * Decompiled with CFR 0.152.
 */
class CEnemyDis {
    public int m_nKind;
    public int m_nIf;
    public int m_nXPos;
    public int m_nZPos;
    public int m_nXSize;
    public int m_nZSize;
    public int m_nRnd1;
    public int m_nRnd2;

    public void Set(CEnemyDis cEnemyDis) {
        this.m_nKind = cEnemyDis.m_nKind;
        this.m_nIf = cEnemyDis.m_nIf;
        this.m_nXPos = cEnemyDis.m_nXPos;
        this.m_nZPos = cEnemyDis.m_nZPos;
        this.m_nXSize = cEnemyDis.m_nXSize;
        this.m_nZSize = cEnemyDis.m_nZSize;
        this.m_nRnd1 = cEnemyDis.m_nRnd1;
        this.m_nRnd2 = cEnemyDis.m_nRnd2;
    }

    CEnemyDis() {
    }
}

