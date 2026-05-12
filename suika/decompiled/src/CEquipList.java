/*
 * Decompiled with CFR 0.152.
 */
class CEquipList
extends CBaseItemList {
    static final int PRM_XPOS = 32;
    static final int PRM_YPOS = 184;
    private int m_nChrNo;
    private int m_nKind;
    private CEquip m_Equip;
    private CPrmChangeWindow m_Prm;

    public void Release1() {
        this.m_Prm.CloseWindow();
    }

    CEquipList() {
        this.SetHelpYPos(8);
    }

    public int GetSelectItem() {
        int n = this.GetSelectNo() + this.m_nPage * this.m_nMaxListNum;
        return this.m_anTable[n];
    }

    public boolean ExecItem(int n) {
        int n2 = n + this.m_nPage * this.m_nMaxListNum;
        int n3 = this.m_anTable[n2];
        CChrParam cChrParam = Vari.GetChrPrm(this.m_nChrNo);
        int n4 = cChrParam.m_anEquip[this.m_nKind];
        if (n4 >= 0) {
            this.m_App.m_Play.AddItem(n4, 1);
        }
        cChrParam.m_anEquip[this.m_nKind] = -1;
        if (n3 != -2) {
            this.DecItem(n);
            cChrParam.m_anEquip[this.m_nKind] = n3;
        }
        cChrParam.SetEquipPrmAll();
        this.m_Equip.MakeList();
        return true;
    }

    public void MakeTable() {
        this.ClearTable();
        this.m_nTableMax = 0;
        this.m_anTable[this.m_nTableMax] = -2;
        this.m_anUse[this.m_nTableMax] = -2;
        ++this.m_nTableMax;
        int n = 0;
        do {
            CItemData cItemData;
            if (this.m_App.m_Play.GetItem(n) <= 0 || !this.IsUse(cItemData = Vari.GetItemData(n))) continue;
            this.m_anTable[this.m_nTableMax] = n;
            this.m_anUse[this.m_nTableMax] = cItemData.m_nAlgo;
            ++this.m_nTableMax;
        } while (++n < 150);
        this.CheckPage();
    }

    public void CreateList(ARpg aRpg, CEquip cEquip, int n, int n2) {
        this.m_Equip = cEquip;
        this.m_nChrNo = n;
        this.m_nKind = n2;
        this._Create(aRpg);
        CChrParam cChrParam = Vari.GetChrPrm(this.m_nChrNo);
        int n3 = cChrParam.m_anEquip[this.m_nKind];
        this.m_Prm = new CPrmChangeWindow();
        this.m_Prm.Create(this.m_App, this, n3);
        this.m_Prm.OpenWindow(32, 184);
        this.m_App.EntryWindow(this.m_Prm);
    }

    public boolean IsUse(CItemData cItemData) {
        int n = cItemData.m_nEquip;
        int n2 = 1 << this.m_nChrNo;
        if ((n & n2) == 0) {
            return false;
        }
        int n3 = cItemData.m_nKind;
        switch (this.m_nKind) {
            case 0: {
                if (n3 != 3 && n3 != 4 && n3 != 5) break;
                return true;
            }
            case 1: {
                if (n3 != 6 && n3 != 7) break;
                return true;
            }
            case 2: {
                if (n3 != 8 && n3 != 9) break;
                return true;
            }
            case 3: 
            case 4: {
                if (n3 != 11 && n3 != 12) break;
                return true;
            }
        }
        return false;
    }

    public void Release2() {
        this.m_App.ReleaseWindow(this.m_Prm);
    }
}

