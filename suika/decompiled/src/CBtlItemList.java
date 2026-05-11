/*
 * Decompiled with CFR 0.152.
 */
class CBtlItemList
extends CBaseItemList {
    public CBattlePlayer m_BtlP;
    public CBattleWork m_BChr;
    public CAction m_Act;

    public boolean Algo_006(int n) {
        this.m_Act = null;
        CBattleWork cBattleWork = this.m_BtlP.ChrSelect1(this.m_BChr, 0, true);
        if (cBattleWork == null) {
            return false;
        }
        this.m_Act = new CAction();
        this.m_Act.m_nAlgo = 2006;
        this.m_Act.m_nObj = cBattleWork.m_nWorkNo;
        this.m_Act.m_nItem = n;
        return true;
    }

    public boolean Algo_002(int n) {
        this.m_Act = null;
        int n2 = this.m_BtlP.ChrSelectAll(this.m_BChr, 101, true);
        if (n2 == -1) {
            return false;
        }
        this.m_Act = new CAction();
        this.m_Act.m_nAlgo = 2002;
        this.m_Act.m_nObj = n2;
        this.m_Act.m_nItem = n;
        return true;
    }

    public boolean ExecItem(int n) {
        int n2 = n + this.m_nPage * this.m_nMaxListNum;
        int n3 = this.m_anTable[n2];
        int n4 = this.m_anUse[n2];
        CItemData cItemData = Vari.GetItemData(n3);
        boolean bl = false;
        switch (n4) {
            case 1: {
                bl = this.Algo_001(n3);
                break;
            }
            case 2: {
                bl = this.Algo_002(n3);
                break;
            }
            case 3: {
                bl = this.Algo_003(n3);
                break;
            }
            case 6: {
                bl = this.Algo_006(n3);
                break;
            }
            case 10: {
                bl = this.Algo_010(n3);
                break;
            }
            case 11: {
                bl = this.Algo_011(n3);
                break;
            }
            case 12: {
                bl = this.Algo_012(n3);
                break;
            }
            case 13: {
                bl = this.Algo_013(n3);
                break;
            }
            case 14: {
                bl = this.Algo_001(n3);
                break;
            }
            case 15: {
                bl = this.Algo_002(n3);
            }
        }
        if (bl) {
            if (cItemData.m_nKind == 1) {
                this.DecItem(n);
            }
            return true;
        }
        return false;
    }

    public boolean Algo_013(int n) {
        this.m_Act = null;
        CBattleWork cBattleWork = this.m_BtlP.ChrSelect1(this.m_BChr, 1, false);
        if (cBattleWork == null) {
            return false;
        }
        this.m_Act = new CAction();
        this.m_Act.m_nAlgo = 2013;
        this.m_Act.m_nObj = cBattleWork.m_nWorkNo;
        this.m_Act.m_nItem = n;
        return true;
    }

    public boolean Algo_001(int n) {
        this.m_Act = null;
        CBattleWork cBattleWork = this.m_BtlP.ChrSelect1(this.m_BChr, 0, false);
        if (cBattleWork == null) {
            return false;
        }
        this.m_Act = new CAction();
        this.m_Act.m_nAlgo = 2001;
        this.m_Act.m_nObj = cBattleWork.m_nWorkNo;
        this.m_Act.m_nItem = n;
        return true;
    }

    CBtlItemList() {
        this.SetHelpYPos(8);
    }

    public CAction GetAction() {
        return this.m_Act;
    }

    public void CreateList(ARpg aRpg, CBattlePlayer cBattlePlayer, CBattleWork cBattleWork) {
        this.m_BtlP = cBattlePlayer;
        this.m_BChr = cBattleWork;
        this._Create(aRpg);
    }

    public boolean IsUse(CItemData cItemData) {
        int n = cItemData.m_nAlgo;
        if (n == 1 || n == 2 || n == 3 || n == 6) {
            return true;
        }
        return n >= 10 && n <= 15;
    }

    public boolean Algo_003(int n) {
        this.m_Act = null;
        CBattleWork cBattleWork = this.m_BtlP.ChrSelect1(this.m_BChr, 0, false);
        if (cBattleWork == null) {
            return false;
        }
        this.m_Act = new CAction();
        this.m_Act.m_nAlgo = 2003;
        this.m_Act.m_nObj = cBattleWork.m_nWorkNo;
        this.m_Act.m_nItem = n;
        return true;
    }

    public boolean Algo_012(int n) {
        this.m_Act = null;
        int n2 = this.m_BtlP.ChrSelectAll(this.m_BChr, 102, true);
        if (n2 == -1) {
            return false;
        }
        this.m_Act = new CAction();
        this.m_Act.m_nAlgo = 2012;
        this.m_Act.m_nObj = n2;
        this.m_Act.m_nItem = n;
        return true;
    }

    public boolean Algo_010(int n) {
        this.m_Act = null;
        CBattleWork cBattleWork = this.m_BtlP.ChrSelect1(this.m_BChr, 1, false);
        if (cBattleWork == null) {
            return false;
        }
        this.m_Act = new CAction();
        this.m_Act.m_nAlgo = 2010;
        this.m_Act.m_nObj = cBattleWork.m_nWorkNo;
        this.m_Act.m_nItem = n;
        return true;
    }

    public boolean Algo_011(int n) {
        this.m_Act = null;
        CBattleWork cBattleWork = this.m_BtlP.ChrSelect1(this.m_BChr, 1, false);
        if (cBattleWork == null) {
            return false;
        }
        this.m_Act = new CAction();
        this.m_Act.m_nAlgo = 2011;
        this.m_Act.m_nObj = cBattleWork.m_nWorkNo;
        this.m_Act.m_nItem = n;
        return true;
    }
}

