/*
 * Decompiled with CFR 0.152.
 */
class CNpc {
    public int m_nKind;
    public int m_nXPos;
    public int m_nZPos;
    public int m_nVect;
    public int m_nIf;
    public int m_nMode;
    public int m_nEvent;

    public void Set(CNpc cNpc) {
        this.m_nKind = cNpc.m_nKind;
        this.m_nXPos = cNpc.m_nXPos;
        this.m_nZPos = cNpc.m_nZPos;
        this.m_nVect = cNpc.m_nVect;
        this.m_nIf = cNpc.m_nIf;
        this.m_nMode = cNpc.m_nMode;
        this.m_nEvent = cNpc.m_nEvent;
    }

    CNpc() {
    }
}

