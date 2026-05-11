/*
 * Decompiled with CFR 0.152.
 */
class CChrManage {
    public CChrWork[] m_aChrWork = new CChrWork[24];

    public CChrWork CheckHit(D3DXVECTOR3 d3DXVECTOR3, CChrWork cChrWork) {
        int n = 0;
        do {
            float f;
            CChrWork cChrWork2;
            if (!(cChrWork2 = Vari.GetChrWork(n)).GetFlag(1) || cChrWork2.GetFlag(32) || !(cChrWork2.m_fHitSize > (f = d3DXVECTOR3.CalcDistanceXZ(cChrWork2.m_vPos))) || cChrWork2 == cChrWork) continue;
            return cChrWork2;
        } while (++n < 24);
        return null;
    }

    public CChrWork GetWork(int n) {
        return this.m_aChrWork[n];
    }

    public void ClearNpcWork() {
        int n = 8;
        do {
            this.m_aChrWork[n].ResetFlag(1);
        } while (++n < 24);
    }

    CChrManage() {
        int n = 0;
        do {
            this.m_aChrWork[n] = new CChrWork(n);
        } while (++n < 24);
    }

    public void InitEvent() {
        int n = 0;
        do {
            CChrWork cChrWork = this.GetWork(n);
            cChrWork.m_fEvtSpeed = 0.0f;
            cChrWork.m_nEvtMove = 0;
            cChrWork.m_nEvtAlgo = 0;
        } while (++n < 24);
    }

    public boolean IsMoveEvent() {
        int n = 0;
        do {
            CChrWork cChrWork;
            if (!(cChrWork = this.GetWork(n)).GetFlag(1) || cChrWork.m_nEvtAlgo == 0) continue;
            return true;
        } while (++n < 24);
        return false;
    }

    public CChrWork Search_Npc() {
        return this.SearchWork(8, 24);
    }

    public CChrWork SearchWork(int n, int n2) {
        int n3 = n;
        while (n3 < n2) {
            if (!this.m_aChrWork[n3].GetFlag(1)) {
                return this.m_aChrWork[n3];
            }
            ++n3;
        }
        return null;
    }

    public void Init() {
        int n = 0;
        do {
            this.m_aChrWork[n].InitPrm();
        } while (++n < 24);
        this.InitEvent();
    }

    public CChrWork Search_Enemy() {
        return this.SearchWork(3, 8);
    }
}

