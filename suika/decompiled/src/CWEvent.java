/*
 * Decompiled with CFR 0.152.
 */
class CWEvent {
    public int m_nXPos;
    public int m_nZPos;
    public int m_nVect;
    public int m_nIf;
    public int m_nEvent;

    public void Set(CWEvent cWEvent) {
        this.m_nXPos = cWEvent.m_nXPos;
        this.m_nZPos = cWEvent.m_nZPos;
        this.m_nVect = cWEvent.m_nVect;
        this.m_nIf = cWEvent.m_nIf;
        this.m_nEvent = cWEvent.m_nEvent;
    }

    CWEvent() {
    }
}

