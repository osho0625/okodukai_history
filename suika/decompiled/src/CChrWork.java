/*
 * Decompiled with CFR 0.152.
 */
class CChrWork
extends CFlag {
    static final int WORKUSE = 1;
    static final int BATTLE_CUR1 = 2;
    static final int BATTLE_CUR2 = 4;
    static final int DEAD = 8;
    static final int NOANIM = 16;
    static final int NOATARI = 32;
    static final int NOSHADOW = 64;
    static final int C_YELLOW = 128;
    static final int SITAKASANE = 256;
    static final int NODISP = 512;
    static final int REVERSE = 1024;
    static final int LONGDEAD = 2048;
    static final int UEKASANE = 4096;
    static final int DIVE = 8192;
    static final int TENMETSU = 16384;
    static final int SHORTDEAD = 32768;
    static final int RUNAWAY = 65536;
    static final int C_GREEN = 131072;
    public int m_nWorkNo;
    public int m_nColor;
    public D3DXVECTOR3 m_vPos = new D3DXVECTOR3();
    public D3DXVECTOR3 m_vRol = new D3DXVECTOR3();
    public float m_fVect;
    public D3DXVECTOR3 m_vScale = new D3DXVECTOR3(1.0f, 1.0f, 1.0f);
    public int m_nChrH;
    public int m_nChrL;
    public float m_fYAdd;
    public float m_fRAdd;
    public int m_nAlgo;
    public int m_nMode;
    public int m_nScore;
    public int m_nCount;
    public int m_nWork1;
    public int m_nWork2;
    public int m_nWork3;
    public float m_fHitSize;
    public CCalcBndBox m_BndBox = new CCalcBndBox();
    public int m_nDisp;
    public int m_nAnim;
    public int m_nEvent;
    public float m_fEvtSpeed;
    public int m_nEvtMove;
    public int m_nEvtAlgo;

    public void InitBattle() {
        this.ResetDisp(32);
    }

    public void SetVect(float f) {
        this.m_vRol.y = f;
        this.m_fVect = f;
    }

    public boolean IsDisp() {
        if (!this.GetFlag(1)) {
            return false;
        }
        if (this.GetFlag(512)) {
            return false;
        }
        return !this.GetFlag(16384) || (Vari.m_App.m_nMainCount & 1) != 0;
    }

    public void SetDisp(int n) {
        this.m_nDisp |= n;
    }

    public void AddVect(float f) {
        this.m_fVect += f;
        this.m_vRol.y = this.m_fVect = Calc3D.RadLimits(this.m_fVect);
    }

    public float GetDispVect() {
        return this.m_vRol.y;
    }

    public void Anim_05(int n) {
        switch (n & 7) {
            case 0: 
            case 4: {
                this.m_fYAdd = 0.0f;
                return;
            }
            case 1: 
            case 3: {
                this.m_fYAdd = -5.0f;
                return;
            }
            case 2: {
                this.m_fYAdd = -7.0f;
                return;
            }
            case 5: 
            case 7: {
                this.m_fYAdd = 5.0f;
                return;
            }
            case 6: {
                this.m_fYAdd = 7.0f;
                return;
            }
        }
    }

    public void LookAt(D3DXVECTOR3 d3DXVECTOR3) {
        this.SetVect(Calc3D.CalcAngleXZ(this.m_vPos, d3DXVECTOR3) + (float)Math.PI);
    }

    public void InitPrm() {
        this.ClearFlag();
        this.m_nColor = 0;
        this.m_vRol.z = 0.0f;
        this.m_vRol.y = 0.0f;
        this.m_vRol.x = 0.0f;
        this.m_fVect = 0.0f;
    }

    public boolean GetDisp(int n) {
        return (this.m_nDisp & n) != 0;
    }

    public void ResetDisp(int n) {
        this.m_nDisp &= ~n;
    }

    public int GetModel() {
        return this.m_nChrH + this.m_nChrL + 55;
    }

    public float GetMoveVect() {
        return this.m_fVect;
    }

    public void Anim(int n) {
        if (this.GetFlag(8)) {
            this.m_vScale.x *= 0.8f;
            this.m_vScale.y *= 1.2f;
            this.m_vScale.z *= 0.8f;
            if (this.GetFlag(2048)) {
                this.m_vScale.y *= 1.2f;
            } else if (this.GetFlag(32768)) {
                this.m_vScale.y *= 0.9f;
            }
            if (this.m_vScale.x <= 0.05f) {
                this.m_vScale.x = 1.0f;
                this.m_vScale.y = 1.0f;
                this.m_vScale.z = 1.0f;
                this.ResetFlag(1);
                this.ResetFlag(8);
            }
            return;
        }
        if (this.GetFlag(1024)) {
            this.SetDisp(1);
        }
        switch (this.m_nAnim) {
            case 1: {
                switch (n >> 1 & 3) {
                    case 0: 
                    case 2: {
                        this.m_nChrL = 0;
                        this.ResetDisp(1);
                        return;
                    }
                    case 1: {
                        this.m_nChrL = 1;
                        this.ResetDisp(1);
                        return;
                    }
                    case 3: {
                        this.m_nChrL = 1;
                        this.SetDisp(1);
                        return;
                    }
                    default: {
                        return;
                    }
                }
            }
            case 2: {
                switch (n >> 1 & 3) {
                    case 0: 
                    case 2: {
                        this.m_nChrL = 0;
                        return;
                    }
                    case 1: {
                        this.m_nChrL = 1;
                        return;
                    }
                    case 3: {
                        this.m_nChrL = 2;
                        return;
                    }
                    default: {
                        return;
                    }
                }
            }
            case 3: {
                switch (n & 3) {
                    case 0: 
                    case 2: {
                        this.m_vScale.y = 1.0f;
                        return;
                    }
                    case 1: {
                        this.m_vScale.y = 0.9f;
                        return;
                    }
                    case 3: {
                        this.m_vScale.y = 1.1f;
                        return;
                    }
                    default: {
                        return;
                    }
                }
            }
            case 4: {
                switch (n & 3) {
                    case 0: 
                    case 2: {
                        this.m_fRAdd = 0.0f;
                        return;
                    }
                    case 1: {
                        this.m_fRAdd = 0.1f;
                        return;
                    }
                    case 3: {
                        this.m_fRAdd = -0.1f;
                        return;
                    }
                    default: {
                        return;
                    }
                }
            }
            case 5: {
                this.Anim_05(n);
                return;
            }
            case 6: {
                ++this.m_nColor;
                if (this.m_nColor > 37) {
                    this.m_nColor = 33;
                }
                this.m_fRAdd += 0.1f;
                return;
            }
            case 7: {
                switch (n & 7) {
                    case 0: 
                    case 6: 
                    case 7: {
                        this.m_fYAdd = 0.0f;
                        return;
                    }
                    case 1: 
                    case 5: {
                        this.m_fYAdd = 5.0f;
                        return;
                    }
                    case 2: 
                    case 4: {
                        this.m_fYAdd = 7.0f;
                        return;
                    }
                    case 3: {
                        this.m_fYAdd = 8.0f;
                        return;
                    }
                    default: {
                        return;
                    }
                }
            }
            case 8: {
                switch (n & 7) {
                    case 0: 
                    case 4: {
                        this.m_fRAdd = 0.0f;
                        return;
                    }
                    case 1: 
                    case 3: {
                        this.m_fRAdd = 0.025f;
                        return;
                    }
                    case 2: {
                        this.m_fRAdd = 0.05f;
                        return;
                    }
                    case 5: 
                    case 7: {
                        this.m_fRAdd = -0.025f;
                        return;
                    }
                    case 6: {
                        this.m_fRAdd = -0.05f;
                        return;
                    }
                    default: {
                        return;
                    }
                }
            }
            case 9: {
                switch (n & 7) {
                    case 0: {
                        this.m_vScale.x = 0.8f;
                        this.m_vScale.y = 0.8f;
                        this.m_vScale.z = 0.8f;
                        return;
                    }
                    case 1: {
                        this.m_vScale.y = 1.0f;
                        return;
                    }
                    case 2: {
                        this.m_vScale.y = 1.2f;
                        return;
                    }
                    case 3: {
                        this.m_vScale.x = 1.0f;
                        this.m_vScale.y = 1.0f;
                        return;
                    }
                    case 4: {
                        this.m_vScale.x = 1.2f;
                        this.m_vScale.y = 0.8f;
                        return;
                    }
                    case 5: {
                        this.m_vScale.x = 1.0f;
                        this.m_vScale.y = 0.6f;
                        this.m_vScale.z = 1.0f;
                        return;
                    }
                    case 6: {
                        this.m_vScale.x = 0.8f;
                        this.m_vScale.y = 0.4f;
                        this.m_vScale.z = 1.2f;
                        return;
                    }
                    case 7: {
                        this.m_vScale.y = 0.6f;
                        this.m_vScale.z = 1.0f;
                        return;
                    }
                    default: {
                        return;
                    }
                }
            }
            case 10: {
                this.m_fRAdd += 0.1f;
                if (this.m_fRAdd >= (float)Math.PI * 2) {
                    this.m_fRAdd -= (float)Math.PI * 2;
                    return;
                }
                break;
            }
            case 11: {
                this.m_fRAdd += 0.3f;
                if (this.m_fRAdd >= (float)Math.PI * 2) {
                    this.m_fRAdd -= (float)Math.PI * 2;
                    return;
                }
                break;
            }
            case 12: {
                switch (n & 3) {
                    case 0: 
                    case 2: {
                        this.m_vScale.y = 1.5f;
                        return;
                    }
                    case 1: {
                        this.m_vScale.y = 1.3499999f;
                        return;
                    }
                    case 3: {
                        this.m_vScale.y = 1.6500001f;
                        return;
                    }
                    default: {
                        return;
                    }
                }
            }
            case 13: {
                this.m_fRAdd += 0.15f;
                if (this.m_fRAdd >= (float)Math.PI * 2) {
                    this.m_fRAdd -= (float)Math.PI * 2;
                }
                this.Anim_05(n);
                return;
            }
            case 14: {
                this.m_fRAdd -= 0.1f;
                if (this.m_fRAdd < (float)Math.PI * 2) {
                    this.m_fRAdd += (float)Math.PI * 2;
                    return;
                }
                break;
            }
            case 15: {
                this.m_vPos.y -= 40.0f;
                return;
            }
            default: {
                return;
            }
        }
    }

    CChrWork() {
        this.InitPrm();
    }

    CChrWork(int n) {
        this.m_nWorkNo = n;
        this.InitPrm();
    }
}

