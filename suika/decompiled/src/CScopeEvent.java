/*
 * Decompiled with CFR 0.152.
 */
class CScopeEvent {
    public int m_nKind;
    public int m_nIf;
    public int m_nXPos;
    public int m_nZPos;
    public int m_nXSize;
    public int m_nZSize;
    public CSquare m_cSqu = new CSquare();

    public void Set(CScopeEvent cScopeEvent) {
        this.m_nKind = cScopeEvent.m_nKind;
        this.m_nIf = cScopeEvent.m_nIf;
        this.m_nXPos = cScopeEvent.m_nXPos;
        this.m_nZPos = cScopeEvent.m_nZPos;
        this.m_nXSize = cScopeEvent.m_nXSize;
        this.m_nZSize = cScopeEvent.m_nZSize;
        this.m_cSqu.Set(cScopeEvent.m_cSqu);
    }

    CScopeEvent() {
    }
}

