/*
 * Decompiled with CFR 0.152.
 */
class CParamAll {
    private int m_nPrmNum;
    private int m_nPrmUpNum;
    private int m_nPartyNum;
    private int m_nItemNum;
    private int m_nSkillNum;
    private int m_nHelpNum;
    private CChrParam[] m_aPrm;
    private CPrmUp[] m_aPrmUp;
    private CEnemyParty[] m_aParty;
    private CItemData[] m_aItem;
    private CSkillData[] m_aSkill;
    private CHelpData[] m_aHelp;

    public boolean Load(String string) {
        CFileJip cFileJip = new CFileJip();
        if (!cFileJip.Load(string)) {
            return false;
        }
        this.m_nPrmNum = cFileJip.ReadWord();
        this.m_nPrmUpNum = cFileJip.ReadWord();
        this.m_nPartyNum = cFileJip.ReadWord();
        this.m_nItemNum = cFileJip.ReadWord();
        this.m_nSkillNum = cFileJip.ReadWord();
        this.m_nHelpNum = cFileJip.ReadWord();
        if (!this.LoadPrm(cFileJip)) {
            return false;
        }
        if (!this.LoadPrmUp(cFileJip)) {
            return false;
        }
        if (!this.LoadParty(cFileJip)) {
            return false;
        }
        if (!this.LoadItem(cFileJip)) {
            return false;
        }
        if (!this.LoadSkill(cFileJip)) {
            return false;
        }
        return this.LoadHelp(cFileJip);
    }

    private boolean LoadPrm(CFileJip cFileJip) {
        this.m_aPrm = new CChrParam[this.m_nPrmNum];
        int n = 0;
        while (n < this.m_nPrmNum) {
            this.m_aPrm[n] = new CChrParam(n);
            this.m_aPrm[n].SetName(cFileJip.ReadString(14));
            this.m_aPrm[n].m_nLV = cFileJip.ReadByte();
            this.m_aPrm[n].m_nPat = CFunc.Unsigned(cFileJip.ReadByte());
            this.m_aPrm[n].m_nAdd = cFileJip.ReadByte();
            this.m_aPrm[n].m_nItem1 = CFunc.Unsigned(cFileJip.ReadByte());
            this.m_aPrm[n].m_nItem2 = CFunc.Unsigned(cFileJip.ReadByte());
            this.m_aPrm[n].m_nAlgo = CFunc.Unsigned(cFileJip.ReadByte());
            this.m_aPrm[n].m_nMaxHP = this.m_aPrm[n].m_nHP = cFileJip.ReadInt();
            this.m_aPrm[n].m_nMaxMP = this.m_aPrm[n].m_nMP = (int)cFileJip.ReadWord();
            this.m_aPrm[n].SetStr_Base(cFileJip.ReadWord());
            this.m_aPrm[n].SetInt_Base(cFileJip.ReadWord());
            this.m_aPrm[n].SetDef_Base(cFileJip.ReadWord());
            this.m_aPrm[n].SetAgi_Base(cFileJip.ReadWord());
            this.m_aPrm[n].SetDex_Base(cFileJip.ReadWord());
            this.m_aPrm[n].m_nExp = cFileJip.ReadWord();
            this.m_aPrm[n].m_nGold = cFileJip.ReadWord();
            this.m_aPrm[n].m_nAP = cFileJip.ReadWord();
            this.m_aPrm[n].m_nAbi1 = CFunc.Unsigned(cFileJip.ReadByte());
            this.m_aPrm[n].m_nAbi2 = CFunc.Unsigned(cFileJip.ReadByte());
            ++n;
        }
        return true;
    }

    private boolean LoadHelp(CFileJip cFileJip) {
        this.m_aHelp = new CHelpData[this.m_nHelpNum];
        int n = 0;
        while (n < this.m_nHelpNum) {
            this.m_aHelp[n] = new CHelpData();
            this.m_aHelp[n].m_strText = cFileJip.ReadString(32);
            ++n;
        }
        return true;
    }

    public CChrParam GetPrm(int n) {
        return this.m_aPrm[n];
    }

    public CHelpData GetHelp(int n) {
        if (n < 0) {
            return null;
        }
        if (n >= this.m_nHelpNum) {
            return null;
        }
        return this.m_aHelp[n];
    }

    private boolean LoadPrmUp(CFileJip cFileJip) {
        this.m_aPrmUp = new CPrmUp[this.m_nPrmUpNum];
        int n = 0;
        while (n < this.m_nPrmUpNum) {
            this.m_aPrmUp[n] = new CPrmUp();
            this.m_aPrmUp[n].m_nHP = cFileJip.ReadWord();
            this.m_aPrmUp[n].m_nMP = cFileJip.ReadWord();
            this.m_aPrmUp[n].m_nHPs = cFileJip.ReadWord();
            this.m_aPrmUp[n].m_nStr = cFileJip.ReadWord();
            this.m_aPrmUp[n].m_nInt = cFileJip.ReadWord();
            this.m_aPrmUp[n].m_nDef = cFileJip.ReadWord();
            this.m_aPrmUp[n].m_nAgi = cFileJip.ReadWord();
            this.m_aPrmUp[n].m_nDex = cFileJip.ReadWord();
            ++n;
        }
        return true;
    }

    private boolean LoadItem(CFileJip cFileJip) {
        this.m_aItem = new CItemData[this.m_nItemNum];
        int n = 0;
        while (n < this.m_nItemNum) {
            this.m_aItem[n] = new CItemData();
            this.m_aItem[n].m_strName = cFileJip.ReadString(14);
            this.m_aItem[n].m_nWorkNo = CFunc.Unsigned(cFileJip.ReadByte());
            this.m_aItem[n].m_nKind = CFunc.Unsigned(cFileJip.ReadByte());
            this.m_aItem[n].m_nEquip = CFunc.Unsigned(cFileJip.ReadByte());
            this.m_aItem[n].m_nAlgo = CFunc.Unsigned(cFileJip.ReadByte());
            this.m_aItem[n].m_nStr = cFileJip.ReadByte();
            this.m_aItem[n].m_nInt = cFileJip.ReadByte();
            this.m_aItem[n].m_nDef = cFileJip.ReadByte();
            this.m_aItem[n].m_nAgi = cFileJip.ReadByte();
            this.m_aItem[n].m_nDex = cFileJip.ReadByte();
            this.m_aItem[n].m_nAbi = CFunc.Unsigned(cFileJip.ReadByte());
            this.m_aItem[n].m_nHelp = cFileJip.ReadWord();
            this.m_aItem[n].m_nEffect = cFileJip.ReadWord();
            this.m_aItem[n].m_nGold = cFileJip.ReadInt();
            ++n;
        }
        return true;
    }

    public CPrmUp GetPrmUp(int n) {
        return this.m_aPrmUp[n];
    }

    public CItemData GetItem(int n) {
        return this.m_aItem[n];
    }

    CParamAll() {
    }

    private boolean LoadSkill(CFileJip cFileJip) {
        this.m_aSkill = new CSkillData[this.m_nSkillNum];
        int n = 0;
        while (n < this.m_nSkillNum) {
            this.m_aSkill[n] = new CSkillData();
            this.m_aSkill[n].m_strName = cFileJip.ReadString(16);
            this.m_aSkill[n].m_nWorkNo = cFileJip.ReadByte();
            this.m_aSkill[n].m_nObject = cFileJip.ReadByte();
            this.m_aSkill[n].m_nKind = cFileJip.ReadWord();
            this.m_aSkill[n].m_nMP = cFileJip.ReadWord();
            this.m_aSkill[n].m_nHelp = cFileJip.ReadWord();
            ++n;
        }
        return true;
    }

    public CSkillData GetSkill(int n) {
        if (n < 0) {
            return null;
        }
        if (n >= this.m_nSkillNum) {
            return null;
        }
        return this.m_aSkill[n];
    }

    private boolean LoadParty(CFileJip cFileJip) {
        this.m_aParty = new CEnemyParty[this.m_nPartyNum];
        int n = 0;
        while (n < this.m_nPartyNum) {
            this.m_aParty[n] = new CEnemyParty();
            byte by = cFileJip.ReadByte();
            this.m_aParty[n].m_nFlag = cFileJip.ReadByte();
            this.m_aParty[n].m_nEnemyNum = by;
            this.m_aParty[n].m_anLoadEnemy = new CLoadBattleEnemy[6];
            int n2 = 0;
            do {
                this.m_aParty[n].m_anLoadEnemy[n2] = new CLoadBattleEnemy();
                this.m_aParty[n].m_anLoadEnemy[n2].m_nKind = CFunc.Unsigned(cFileJip.ReadByte());
            } while (++n2 < 6);
            n2 = 0;
            do {
                this.m_aParty[n].m_anLoadEnemy[n2].m_fXPos = cFileJip.ReadWord();
            } while (++n2 < 6);
            ++n;
        }
        return true;
    }

    public CEnemyParty GetParty(int n) {
        return this.m_aParty[n];
    }
}

