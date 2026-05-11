/*
 * Decompiled with CFR 0.152.
 */
class CMoveCorrect {
    static final int MAX_CHECK = 6;
    private CChrWork m_Char;
    private CMapData m_Map;
    private boolean m_bMoveCheck;
    private int m_nCorrectCount;
    private float m_fDecision;
    private float m_fLastMax;
    private float m_fLastMin;
    private float m_fBaseAngle;
    private float m_fResultAngle;
    private float m_fCheckDist;
    private float m_fAmount;
    private D3DXVECTOR3 m_vStart = new D3DXVECTOR3();
    private D3DXVECTOR3 m_vEnd = new D3DXVECTOR3();
    private float m_fMaxAngle = Calc3D.DEGtoRAD(75.0f);
    private int m_nHitWallX;
    private int m_nHitWallZ;
    private boolean m_bShip;

    CMoveCorrect() {
    }

    public void CheckCorrect(float f) {
        this.m_nCorrectCount += -1;
        if (this.m_nCorrectCount <= 0) {
            return;
        }
        if (!this.MoveVector(this.m_fBaseAngle + f, this.m_fCheckDist)) {
            this.m_fLastMin = f;
            this.CheckCorrect((f + this.m_fLastMax) / 2.0f);
            return;
        }
        this.m_fDecision = f;
        this.m_fLastMax = f;
        this.CheckCorrect((f + this.m_fLastMin) / 2.0f);
    }

    public float GetCheckDistance() {
        return this.m_fCheckDist;
    }

    public void SetShip() {
        this.m_bShip = true;
    }

    public int GetHitWallZ() {
        return this.m_nHitWallZ;
    }

    public int CheckHit(D3DXVECTOR3 d3DXVECTOR3) {
        if (!this.m_bShip) {
            return this.m_Map.CheckHit(d3DXVECTOR3, this.m_Char.m_fHitSize);
        }
        return this.m_Map.CheckHitShip(d3DXVECTOR3, this.m_Char.m_fHitSize);
    }

    public int GetHitWallX() {
        return this.m_nHitWallX;
    }

    public boolean IsMove(int n) {
        if (this.m_bShip) {
            return n == 2;
        }
        return (this.m_Char.m_nWorkNo != 0 || n < 2) && (this.m_Char.m_nWorkNo == 0 || n < 1);
    }

    public float GetEndAngle() {
        return this.m_fResultAngle;
    }

    public D3DXVECTOR3 GetEndPosition() {
        return this.m_vEnd;
    }

    public boolean MoveVector(float f, float f2) {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.x = this.m_vStart.x - Calc3D.Sin(f) * f2;
        d3DXVECTOR3.y = this.m_vStart.y;
        d3DXVECTOR3.z = this.m_vStart.z - Calc3D.Cos(f) * f2;
        int n = this.CheckHit(d3DXVECTOR3);
        if (!this.IsMove(n)) {
            this.m_nHitWallX = CMapData.GetXBlock(d3DXVECTOR3.x);
            this.m_nHitWallZ = CMapData.GetXBlock(d3DXVECTOR3.z);
            return false;
        }
        if (!this.m_bMoveCheck) {
            this.m_vEnd.Set(d3DXVECTOR3);
        }
        return true;
    }

    public boolean HitChrCondition(CChrWork cChrWork, CChrWork cChrWork2) {
        return cChrWork2.GetFlag(1) && !cChrWork2.GetFlag(32) && cChrWork.m_nWorkNo != cChrWork2.m_nWorkNo;
    }

    public void Init(CChrWork cChrWork, CMapData cMapData, D3DXVECTOR3 d3DXVECTOR3) {
        this.m_Char = cChrWork;
        this.m_Map = cMapData;
        this.m_vStart.Set(d3DXVECTOR3);
        this.m_vEnd.Set(d3DXVECTOR3);
    }

    public void Exit() {
        this.m_Char.m_vPos.Set(this.m_vEnd);
    }

    public CChrWork CheckHitChr(CChrWork cChrWork) {
        int n = 0;
        do {
            float f;
            CChrWork cChrWork2;
            if (!this.HitChrCondition(cChrWork, cChrWork2 = Vari.GetChrWork(n)) || !(cChrWork.m_fHitSize + cChrWork2.m_fHitSize > (f = this.m_vEnd.CalcDistanceXZ(cChrWork2.m_vPos)))) continue;
            return cChrWork2;
        } while (++n < 24);
        return null;
    }

    public CChrWork Move(D3DXVECTOR3 d3DXVECTOR3, float f) {
        this.m_nHitWallX = -1;
        this.m_nHitWallZ = -1;
        if (Calc3D.NearZero(d3DXVECTOR3.x - this.m_vStart.x) && Calc3D.NearZero(d3DXVECTOR3.z - this.m_vStart.z)) {
            this.m_vEnd.Set(d3DXVECTOR3);
            this.Exit();
        }
        this.m_fBaseAngle = Calc3D.CalcAngleXZ(this.m_vStart, d3DXVECTOR3);
        this.m_fAmount = Calc3D.Sqrt((this.m_vStart.x - d3DXVECTOR3.x) * (this.m_vStart.x - d3DXVECTOR3.x) + (this.m_vStart.z - d3DXVECTOR3.z) * (this.m_vStart.z - d3DXVECTOR3.z));
        this.m_bMoveCheck = true;
        this.m_fCheckDist = f;
        this.m_nCorrectCount = 6;
        this.m_fLastMax = this.m_fDecision = -this.m_fMaxAngle;
        this.m_fLastMin = 0.0f;
        this.CheckCorrect(-this.m_fMaxAngle);
        float f2 = this.m_fDecision;
        this.m_nCorrectCount = 6;
        this.m_fLastMax = this.m_fDecision = this.m_fMaxAngle;
        this.m_fLastMin = 0.0f;
        this.CheckCorrect(this.m_fMaxAngle);
        float f3 = this.m_fDecision;
        this.m_bMoveCheck = false;
        boolean bl = false;
        if (Calc3D.NearZero(f2 + f3)) {
            bl = true;
            this.MoveVector(this.m_fBaseAngle, this.m_fAmount);
        } else if (-f2 < f3) {
            if (-f2 <= this.m_fMaxAngle) {
                bl = true;
                this.MoveVector(this.m_fBaseAngle + f2, this.m_fAmount);
            }
        } else if (f3 <= this.m_fMaxAngle) {
            bl = true;
            this.MoveVector(this.m_fBaseAngle + f3, this.m_fAmount);
        }
        CChrWork cChrWork = null;
        if (!this.m_bShip) {
            cChrWork = this.CheckHitChr(this.m_Char);
        }
        if (cChrWork == null) {
            this.Exit();
        }
        return cChrWork;
    }
}

