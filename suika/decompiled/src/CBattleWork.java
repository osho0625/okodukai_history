/*
 * Decompiled with CFR 0.152.
 */
class CBattleWork {
    public CChrWork m_Chr;
    public CChrParam m_Prm;
    public D3DXVECTOR3 m_vPos = new D3DXVECTOR3();
    public D3DXVECTOR3 m_vStart = new D3DXVECTOR3();
    public D3DXVECTOR3 m_vRol = new D3DXVECTOR3();
    public D3DXVECTOR3 m_vScale = new D3DXVECTOR3(1.0f, 1.0f, 1.0f);
    public int m_nWorkNo;
    public int m_nAT;
    public int m_nCount;
    public int m_nAura;

    public void InitBattle() {
        this.ResetAllBad();
        if (this.m_Chr != null) {
            this.m_Chr.InitBattle();
        }
    }

    public void SetVect(float f) {
        this.m_vRol.y = f;
    }

    public void ResetSuika() {
        if (this.m_Prm != null) {
            this.m_Prm.ResetSuika();
        }
        if (this.m_Chr != null) {
            this.m_Chr.m_nDisp &= 0xFFFFEFFF;
        }
    }

    public void ResetMagic() {
        this.ResetSuika();
        this.ResetAura();
        if (this.m_Prm != null) {
            this.m_Prm.ResetLuck();
            this.m_Prm.ResetShield();
            this.m_Prm.ResetWShield();
            this.m_Prm.ResetAShield();
            this.m_Prm.ResetGolem();
            this.m_Prm.ResetBattlePrm();
        }
    }

    public boolean GetStone() {
        return this.m_Prm.GetFlag(32);
    }

    public void ResetStone() {
        if (this.m_Prm != null) {
            this.m_Prm.ResetFlag(32);
        }
        if (this.m_Chr != null) {
            this.m_Chr.m_nDisp &= 0xFFFFF7FF;
            this.m_Chr.ResetFlag(16);
        }
    }

    public boolean IsMove() {
        if (!this.IsAttack()) {
            return false;
        }
        if (this.m_Prm.GetPara() > 0) {
            return false;
        }
        if (this.GetStone()) {
            return false;
        }
        return !this.GetClose();
    }

    public boolean IsPlayer() {
        return this.m_nWorkNo < 3;
    }

    public float GetHeight() {
        int n = this.m_Chr.GetModel();
        float f = Vari.m_App.m_aModel[n].GetTopY();
        return f * this.m_Chr.m_vScale.y;
    }

    public void SetClose() {
        this.m_Prm.SetFlag(8);
        this.m_Chr.SetFlag(16);
        this.m_Chr.m_nDisp |= 0x100;
    }

    public boolean IsUse() {
        if (this.m_Chr == null) {
            return false;
        }
        return !this.m_Chr.GetFlag(65536);
    }

    public void ResetAllBad() {
        this.ResetConfusion();
        this.ResetPoison();
        this.ResetPara();
        this.ResetClose();
        this.ResetStone();
        if (this.m_Prm != null) {
            this.m_Prm.ResetDefense();
            this.m_Prm.ResetDefense2();
            this.m_Prm.ResetBlind();
        }
        this.ResetMagic();
    }

    public void AddHP(int n) {
        this.m_Prm.AddHP(n);
        if (this.m_Prm.m_Abi.GetFlag(156) && this.m_Prm.m_nHP == 0) {
            this.m_Prm.m_nHP = 1;
        }
    }

    public void ResetPoison() {
        if (this.m_Prm != null) {
            this.m_Prm.ResetPoison();
        }
        if (this.m_Chr != null) {
            this.m_Chr.ResetDisp(16);
        }
    }

    public void SetSuika() {
        if (this.m_Prm != null) {
            this.m_Prm.SetSuika();
        }
        if (this.m_Chr != null) {
            this.m_Chr.m_nDisp |= 0x1000;
        }
    }

    public boolean IsSuika() {
        if (this.m_Prm != null) {
            return this.m_Prm.IsSuika();
        }
        return false;
    }

    public void SetStone() {
        this.m_Prm.SetFlag(32);
        this.m_Chr.m_nDisp |= 0x800;
        this.m_Chr.SetFlag(16);
    }

    public void InitZPos() {
        if (this.m_Prm != null) {
            if (this.IsPlayer()) {
                this.m_vPos.z = -230.0f;
                return;
            }
            if (this.m_Prm.m_Abi.GetFlag(149)) {
                this.m_vPos.z = 0.0f;
                return;
            }
            this.m_vPos.z = 230.0f;
        }
    }

    public void AddVect(float f) {
        this.m_vRol.y += f;
        this.m_vRol.y = Calc3D.RadLimits(this.m_vRol.y);
    }

    public float GetDispVect() {
        return this.m_vRol.y;
    }

    public boolean GetConfusion() {
        return this.m_Prm.GetConf() > 0;
    }

    public void ResetConfusion() {
        if (this.m_Prm != null) {
            this.m_Prm.ResetConf();
        }
        if (this.m_Chr != null) {
            this.m_Chr.ResetDisp(32);
        }
    }

    public int GetCmdAbNum() {
        int n = 0;
        int n2 = 0;
        do {
            if (this.m_Prm.m_anCmdAb[n2] == 0) continue;
            ++n;
        } while (++n2 < 4);
        return n;
    }

    public void ResetPara() {
        if (this.m_Prm != null) {
            this.m_Prm.SetPara(0);
        }
        if (this.m_Chr != null) {
            this.m_Chr.ResetFlag(16);
            this.m_Chr.ResetFlag(2);
            this.m_Chr.ResetFlag(4);
        }
    }

    public boolean CountPara() {
        int n = this.m_Prm.GetPara();
        if (n > 0) {
            this.m_Prm.SetPara(--n);
            if (n == 0) {
                this.m_Chr.ResetFlag(16);
            }
            return false;
        }
        return true;
    }

    public boolean GetPara() {
        return this.m_Prm.GetPara() > 0;
    }

    public int GetAura() {
        return this.m_nAura;
    }

    public void ClearPrm() {
        if (this.m_Prm != null) {
            this.m_Prm.Init();
        }
    }

    public void ResetAura() {
        this.m_nAura = 0;
        if (this.m_Chr != null) {
            this.m_Chr.m_nDisp &= 0xFFFFFBFF;
        }
    }

    CBattleWork() {
    }

    CBattleWork(int n) {
        this.m_nWorkNo = n;
    }

    public boolean IsAttack() {
        if (!this.IsAlive()) {
            return false;
        }
        return !this.m_Prm.m_Abi.GetFlag(149);
    }

    public boolean GetClose() {
        return this.m_Prm.GetFlag(8);
    }

    public void ResetClose() {
        if (this.m_Prm != null) {
            this.m_Prm.ResetFlag(8);
        }
        if (this.m_Chr != null) {
            this.m_Chr.ResetFlag(16);
            this.m_Chr.m_nDisp &= 0xFFFFFEFF;
        }
    }

    public boolean IsDead() {
        if (!this.IsUse()) {
            return false;
        }
        return this.m_Prm.m_nHP == 0;
    }

    public boolean IsWeek(int n) {
        CAbility cAbility = this.m_Prm.m_Abi;
        switch (n) {
            case 1: {
                if (!cAbility.GetFlag(122)) break;
                return true;
            }
            case 5: {
                if (!cAbility.GetFlag(123)) break;
                return true;
            }
            case 2: {
                if (!cAbility.GetFlag(124)) break;
                return true;
            }
            case 6: {
                if (!cAbility.GetFlag(125)) break;
                return true;
            }
            case 3: {
                if (!cAbility.GetFlag(126)) break;
                return true;
            }
        }
        return false;
    }

    public float GetMoveVect() {
        return this.m_vRol.y;
    }

    public int GetAttPer(int n) {
        CAbility cAbility = this.m_Prm.m_Abi;
        int n2 = 100;
        switch (n) {
            case 1: {
                if (cAbility.GetFlag(98)) {
                    n2 = 50;
                }
                if (cAbility.GetFlag(117)) {
                    n2 = 25;
                }
                if (cAbility.GetFlag(122)) {
                    n2 = 205;
                }
                if (!cAbility.GetFlag(127)) break;
                n2 = -100;
                break;
            }
            case 5: {
                if (cAbility.GetFlag(99)) {
                    n2 = 50;
                }
                if (cAbility.GetFlag(118)) {
                    n2 = 25;
                }
                if (cAbility.GetFlag(123)) {
                    n2 = 205;
                }
                if (!cAbility.GetFlag(128)) break;
                n2 = -100;
                break;
            }
            case 2: {
                if (cAbility.GetFlag(100)) {
                    n2 = 50;
                }
                if (cAbility.GetFlag(119)) {
                    n2 = 25;
                }
                if (cAbility.GetFlag(124)) {
                    n2 = 205;
                }
                if (!cAbility.GetFlag(129)) break;
                n2 = -100;
                break;
            }
            case 6: {
                if (cAbility.GetFlag(120)) {
                    n2 = 25;
                }
                if (cAbility.GetFlag(125)) {
                    n2 = 205;
                }
                if (!cAbility.GetFlag(130)) break;
                n2 = -100;
                break;
            }
            case 3: {
                if (cAbility.GetFlag(101)) {
                    n2 = 50;
                }
                if (cAbility.GetFlag(121)) {
                    n2 = 25;
                }
                if (cAbility.GetFlag(126)) {
                    n2 = 195;
                }
                if (!cAbility.GetFlag(131)) break;
                n2 = -100;
                break;
            }
            case 4: {
                if (!cAbility.GetFlag(116)) break;
                n2 = -100;
            }
        }
        if (this.m_Prm.GetDefense()) {
            n2 /= 2;
        }
        if (this.m_Prm.GetDefense2()) {
            n2 /= 4;
        }
        if (n == 1 && this.m_Prm.GetWShield() > 0) {
            CBattleActCalc.MakeWShield(this, 1);
            this.m_Prm.DecWShield();
            n2 /= 2;
        }
        if (n == 2 && this.m_Prm.GetAShield() > 0) {
            CBattleActCalc.MakeAShield(this, 1);
            this.m_Prm.DecAShield();
            n2 /= 2;
        }
        return n2;
    }

    public void Init() {
        this.m_Chr = null;
        this.m_nAT = 0;
        this.m_nCount = 0;
    }

    public int GetAcqAP(int n) {
        int n2;
        if (!this.IsUse()) {
            return 0;
        }
        if (!this.IsAlive()) {
            return 0;
        }
        if (this.m_Prm.m_nGem == -1) {
            return 0;
        }
        CAbility cAbility = this.m_Prm.m_Abi;
        float f = 0.0f;
        f = cAbility.GetFlag(15) ? (float)n * 0.13f : (float)n * 0.1f;
        if (f - (float)(n2 = (int)f) >= 0.5f) {
            ++n2;
        }
        return n2;
    }

    public void SetPara(int n) {
        if (!this.m_Chr.GetFlag(8)) {
            this.m_nAT = 0;
            this.m_Prm.SetPara(n);
            this.m_Chr.SetFlag(16);
        }
    }

    public void SetAura(int n) {
        this.m_nAura = n;
        if (this.m_nAura > 0) {
            this.m_Chr.m_nDisp |= 0x400;
            return;
        }
        this.m_Chr.m_nDisp &= 0xFFFFFBFF;
    }

    public int GetAcqExp(int n) {
        if (!this.IsUse()) {
            return 0;
        }
        if (!this.IsAlive()) {
            return 0;
        }
        CAbility cAbility = this.m_Prm.m_Abi;
        if (cAbility.GetFlag(14)) {
            n = (int)((float)n * 1.3f);
        }
        return n;
    }

    public boolean IsAlive() {
        if (!this.IsUse()) {
            return false;
        }
        return this.m_Prm.m_nHP != 0;
    }
}

