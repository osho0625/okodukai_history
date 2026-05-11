/*
 * Decompiled with CFR 0.152.
 */
class CChrParam
extends CFlag {
    static final int MAX_EXP = 9999999;
    static final int MAX_AP = 999;
    static final int MAX_EQUIP = 5;
    static final int MAX_GEM_FLAG = 17;
    static final int ST_LUCK = 1;
    static final int ST_POISON = 2;
    static final int ST_DEFENSE = 4;
    static final int ST_CLOSE = 8;
    static final int ST_DEFENSE2 = 16;
    static final int ST_STONE = 32;
    public String m_strName = new String();
    public int m_nLV;
    public int m_nPat;
    public int m_nAlgo;
    public int m_nAdd;
    public int m_nHP;
    public int m_nMaxHP;
    public int m_nMP;
    public int m_nMaxMP;
    private int m_nStr;
    private int m_nInt;
    private int m_nDef;
    private int m_nAgi;
    private int m_nDex;
    private int m_nStrI;
    private int m_nIntI;
    private int m_nDefI;
    private int m_nAgiI;
    private int m_nDexI;
    private int m_nConf;
    private int m_nShiB;
    private int m_nStrB;
    private int m_nDefB;
    private int m_nAgiB;
    private int m_nPara;
    private int m_nShiW;
    private int m_nShiA;
    private int m_nGolem;
    private int m_nBlind;
    private int m_nRije;
    private boolean m_bSuika;
    public int[] m_anEquip = new int[5];
    public int m_nExp;
    public int m_nGold;
    public int m_nAP;
    public int m_nGem;
    public CFlag2 m_GemFlag = new CFlag2();
    public int m_nItem1;
    public int m_nItem2;
    public CAbility m_Abi = new CAbility();
    public int m_nAbi1;
    public int m_nAbi2;
    public int[] m_anCmdAb = new int[4];
    public boolean m_bPlayer;
    public float m_fHP;
    public float m_fMP;
    public float m_fStr;
    public float m_fInt;
    public float m_fDef;
    public float m_fAgi;
    public float m_fDex;

    public void InitBattle() {
        this.m_nConf = 0;
        this.m_nPara = 0;
        this.m_nBlind = 0;
        this.m_bSuika = false;
        this.ResetWShield();
        this.ResetAShield();
        this.ResetGolem();
        this.ResetPoison();
        this.ResetFlag(1);
        this.ResetDefense();
        this.ResetDefense2();
        this.ResetBattlePrm();
    }

    public void ResetBattlePrm() {
        this.m_nRije = 0;
        this.m_nShiB = 0;
        this.m_nStrB = 0;
        this.m_nDefB = 0;
        this.m_nAgiB = 0;
    }

    public void SetEquipPrm(int n) {
        if (n == -1) {
            return;
        }
        CItemData cItemData = Vari.GetItemData(n);
        this.m_nStrI += cItemData.m_nStr;
        this.m_nIntI += cItemData.m_nInt;
        this.m_nDefI += cItemData.m_nDef;
        this.m_nAgiI += cItemData.m_nAgi;
        this.m_nDexI += cItemData.m_nDex;
        if (cItemData.m_nAbi != 255) {
            this.m_Abi.SetFlagI(cItemData.m_nAbi);
        }
    }

    public void ResetSuika() {
        this.m_bSuika = false;
    }

    public void Set(CChrParam cChrParam) {
        this.SetName(cChrParam.m_strName);
        this.m_nLV = cChrParam.m_nLV;
        this.m_nPat = cChrParam.m_nPat;
        this.m_nAdd = cChrParam.m_nAdd;
        this.m_nHP = cChrParam.m_nHP;
        this.m_nMaxHP = cChrParam.m_nMaxHP;
        this.m_nMP = cChrParam.m_nMP;
        this.m_nMaxMP = cChrParam.m_nMaxMP;
        this.m_nStr = cChrParam.m_nStr;
        this.m_nInt = cChrParam.m_nInt;
        this.m_nDef = cChrParam.m_nDef;
        this.m_nAgi = cChrParam.m_nAgi;
        this.m_nDex = cChrParam.m_nDex;
        this.m_nAlgo = cChrParam.m_nAlgo;
        this.m_fHP = this.m_nMaxHP;
        this.m_fMP = this.m_nMaxMP;
        this.m_fStr = this.m_nStr;
        this.m_fInt = this.m_nInt;
        this.m_fDef = this.m_nDef;
        this.m_fAgi = this.m_nAgi;
        this.m_fDex = this.m_nDex;
        this.m_nAbi1 = cChrParam.m_nAbi1;
        this.m_nAbi2 = cChrParam.m_nAbi2;
        this.m_Abi.Set(cChrParam.m_Abi);
        int n = 0;
        do {
            this.m_anEquip[n] = cChrParam.m_anEquip[n];
        } while (++n < 5);
        this.m_nExp = cChrParam.m_nExp;
        this.m_nGold = cChrParam.m_nGold;
        this.m_nAP = cChrParam.m_nAP;
        this.m_nGem = cChrParam.m_nGem;
        this.m_nItem1 = cChrParam.m_nItem1;
        this.m_nItem2 = cChrParam.m_nItem2;
        this.m_GemFlag.Set(cChrParam.m_GemFlag);
        n = 0;
        do {
            this.m_anCmdAb[n] = cChrParam.m_anCmdAb[n];
        } while (++n < 4);
        this.SetEquipPrmAll();
        this.ClearFlag();
    }

    public void DecRije() {
        if (this.m_nRije > 0) {
            this.m_nRije += -1;
        }
    }

    public void SetGolem(int n) {
        this.m_nGolem = n;
    }

    public String GetName() {
        return this.m_strName;
    }

    public int GetBlind() {
        return this.m_nBlind;
    }

    public int GetDef() {
        int n = this.GetDef_Base() + this.GetDef_Item() + this.GetDef_Btl();
        if (this.IsSuika()) {
            n += 100;
        }
        return n;
    }

    public void ResetBlind() {
        this.m_nBlind = 0;
    }

    public int GetDex() {
        int n = this.GetDex_Base() + this.GetDex_Item();
        if (this.GetFlag(1)) {
            n = n * 120 / 100;
        }
        if (this.GetBlind() > 0 || this.GetPara() > 0) {
            n = n * 30 / 100;
        }
        if (this.IsSuika()) {
            n += 100;
        }
        return n;
    }

    public int GetWShield() {
        return this.m_nShiW;
    }

    public void ResetWShield() {
        this.m_nShiW = 0;
    }

    public int AddHP(int n) {
        int n2 = this.GetMaxHP();
        this.m_nHP += n;
        if (this.m_nHP < 0) {
            this.m_nHP = 0;
        }
        if (this.m_nHP > n2) {
            this.m_nHP = n2;
        }
        return this.m_nHP;
    }

    public int GetHP() {
        return this.m_nHP;
    }

    public int GetStr_Base() {
        if (this.m_Abi.GetFlag(5)) {
            return (int)((float)this.m_nStr * 1.3f);
        }
        if (this.m_Abi.GetFlag(4)) {
            return (int)((float)this.m_nStr * 1.15f);
        }
        return this.m_nStr;
    }

    public void SetInt_Base(int n) {
        this.m_nInt = n;
    }

    public void SetAgi_Base(int n) {
        this.m_nAgi = n;
    }

    public int GetMaxMP() {
        int n = this.m_nMaxMP;
        if (this.m_Abi.GetFlag(3)) {
            n = (int)((float)n * 1.3f);
        } else if (this.m_Abi.GetFlag(2)) {
            n = (int)((float)n * 1.15f);
        }
        if (this.m_bPlayer && n > 999) {
            n = 999;
        }
        return n;
    }

    public int GetInt_Item() {
        return this.m_nIntI;
    }

    public int GetAgi_Item() {
        return this.m_nAgiI;
    }

    public void DecWShield() {
        if (this.m_nShiW > 0) {
            this.m_nShiW += -1;
        }
    }

    public void SetAShield(int n) {
        this.m_nShiA = n;
    }

    public void SetDefense2() {
        this.SetFlag(16);
    }

    public int GetDef_Item() {
        return this.m_nDefI;
    }

    public void SetStr_Btl(int n) {
        this.m_nStrB = n;
    }

    public void SetPoison() {
        this.SetFlag(2);
    }

    public void SetConf(int n) {
        this.m_nConf = n;
    }

    public int GetGolem() {
        return this.m_nGolem;
    }

    public void ResetGolem() {
        this.m_nGolem = 0;
    }

    public void AddExp(int n) {
        this.m_nExp += n;
        if (this.m_nExp >= 9999999) {
            this.m_nExp = 9999999;
        }
    }

    public static int CalcNextExp(int n) {
        if (n == 99) {
            return 99999999;
        }
        return n * n * (n + 1) * 10;
    }

    public void SetRije(int n) {
        this.m_nRije = n;
    }

    public void SetEquipPrmAll() {
        this.m_nStrI = 0;
        this.m_nIntI = 0;
        this.m_nDefI = 0;
        this.m_nAgiI = 0;
        this.m_nDexI = 0;
        this.m_Abi.ClearFlagI();
        if (this.m_nAbi1 != 255 && this.m_nAbi1 != -1) {
            this.m_Abi.SetFlagM(this.m_nAbi1);
        }
        if (this.m_nAbi2 != 255 && this.m_nAbi2 != -1) {
            this.m_Abi.SetFlagM(this.m_nAbi2);
        }
        int n = 0;
        do {
            this.SetEquipPrm(this.m_anEquip[n]);
        } while (++n < 5);
        this.AddHP(0);
        this.AddMP(0);
    }

    public int AddMP(int n) {
        int n2 = this.GetMaxMP();
        this.m_nMP += n;
        if (this.m_nMP < 0) {
            this.m_nMP = 0;
        }
        if (this.m_nMP > n2) {
            this.m_nMP = n2;
        }
        return this.m_nMP;
    }

    public int GetMP() {
        return this.m_nMP;
    }

    public void AddAP(int n) {
        this.m_nAP += n;
        if (this.m_nAP >= 999) {
            this.m_nAP = 999;
        }
    }

    public void Init() {
        this.m_nLV = 1;
        this.m_nHP = 0;
        this.m_nMaxHP = 0;
        this.m_nMP = 0;
        this.m_nMaxMP = 0;
        this.m_nStr = 0;
        this.m_nInt = 0;
        this.m_nDef = 0;
        this.m_nAgi = 0;
        this.m_nDex = 0;
        int n = 0;
        do {
            this.m_anEquip[n] = -1;
        } while (++n < 5);
        this.m_nGem = -1;
        this.m_nAbi1 = -1;
        this.m_nAbi2 = -1;
        this.m_nExp = 0;
        this.m_nAP = 0;
        this.InitBattle();
        this.SetEquipPrmAll();
    }

    public void SetPara(int n) {
        this.m_nPara = n;
    }

    public void AllLevelUp() {
        while (this.m_nExp >= CChrParam.CalcNextExp(this.m_nLV)) {
            if (this.m_nAdd == 0) continue;
            this.LevelUp(Vari.GetPrmUp(this.m_nAdd - 1));
        }
    }

    public void SetShield(int n) {
        this.m_nShiB = n;
    }

    public int GetAShield() {
        return this.m_nShiA;
    }

    public void ResetAShield() {
        this.m_nShiA = 0;
    }

    public int GetInt_Base() {
        if (this.m_Abi.GetFlag(7)) {
            return (int)((float)this.m_nInt * 1.3f);
        }
        if (this.m_Abi.GetFlag(6)) {
            return (int)((float)this.m_nInt * 1.15f);
        }
        return this.m_nInt;
    }

    public int GetAgi_Base() {
        if (this.m_Abi.GetFlag(11)) {
            return (int)((float)this.m_nAgi * 1.3f);
        }
        if (this.m_Abi.GetFlag(10)) {
            return (int)((float)this.m_nAgi * 1.15f);
        }
        return this.m_nAgi;
    }

    public int GetAgi() {
        int n = this.GetAgi_Base() + this.GetAgi_Item() + this.GetAgi_Btl();
        if (n < 3) {
            n = 3;
        }
        if (this.IsSuika()) {
            n += 100;
        }
        return n;
    }

    public void SetDef_Base(int n) {
        this.m_nDef = n;
    }

    public void SetLuck() {
        this.SetFlag(1);
    }

    public void SetDefense() {
        this.SetFlag(4);
    }

    public int GetDex_Item() {
        return this.m_nDexI;
    }

    public int GetDef_Base() {
        if (this.m_Abi.GetFlag(9)) {
            return (int)((float)this.m_nDef * 1.3f);
        }
        if (this.m_Abi.GetFlag(8)) {
            return (int)((float)this.m_nDef * 1.15f);
        }
        return this.m_nDef;
    }

    public void SetDex_Base(int n) {
        this.m_nDex = n;
    }

    public boolean GetDefense() {
        return this.GetFlag(4);
    }

    public void ResetDefense() {
        this.ResetFlag(4);
    }

    public boolean GetDefense2() {
        return this.GetFlag(16);
    }

    public int GetStr_Btl() {
        return this.m_nStrB;
    }

    CChrParam(int n) {
        this.m_GemFlag.Create(17);
        this.Init();
    }

    public void SetAgi_Btl(int n) {
        this.m_nAgiB = n;
    }

    public void ResetDefense2() {
        this.ResetFlag(16);
    }

    public int GetConf() {
        return this.m_nConf;
    }

    public void ResetConf() {
        this.m_nConf = 0;
    }

    public boolean GetPoison() {
        return this.GetFlag(2);
    }

    public void ResetPoison() {
        this.ResetFlag(2);
    }

    public void SetSuika() {
        this.m_bSuika = true;
    }

    public boolean IsSuika() {
        return this.m_bSuika;
    }

    public void SetDef_Btl(int n) {
        this.m_nDefB = n;
    }

    public int GetAgi_Btl() {
        return this.m_nAgiB;
    }

    public void DecGolem() {
        if (this.m_nGolem > 0) {
            this.m_nGolem += -1;
        }
    }

    public int GetRije() {
        return this.m_nRije;
    }

    public static int CalcLV(int n) {
        int n2 = 1;
        while (n >= CChrParam.CalcNextExp(n2)) {
            ++n2;
        }
        return n2;
    }

    public int GetPara() {
        return this.m_nPara;
    }

    public void SetBlind(int n) {
        this.m_nBlind = n;
    }

    public void LevelUp(CPrmUp cPrmUp) {
        float f;
        float f2;
        if (this.m_fHP < 9999.0f && (f2 = (float)cPrmUp.m_nHP - (f = (float)((this.m_nLV - 1) * cPrmUp.m_nHPs) / 100.0f)) > 100.0f) {
            this.m_fHP *= f2 / 100.0f;
        }
        this.m_fMP = this.m_fMP * (float)cPrmUp.m_nMP / 100.0f;
        this.m_fStr += (float)cPrmUp.m_nStr / 10.0f;
        this.m_fInt += (float)cPrmUp.m_nInt / 10.0f;
        this.m_fDef += (float)cPrmUp.m_nDef / 10.0f;
        this.m_fAgi += (float)cPrmUp.m_nAgi / 10.0f;
        this.m_fDex += (float)cPrmUp.m_nDex / 10.0f;
        this.m_nMaxHP = (int)this.m_fHP;
        this.m_nMaxMP = (int)this.m_fMP;
        this.m_nStr = (int)this.m_fStr;
        this.m_nInt = (int)this.m_fInt;
        this.m_nDef = (int)this.m_fDef;
        this.m_nAgi = (int)this.m_fAgi;
        this.m_nDex = (int)this.m_fDex;
        ++this.m_nLV;
        this.SetEquipPrmAll();
    }

    public int GetShield() {
        return this.m_nShiB;
    }

    public void ResetShield() {
        this.m_nShiB = 0;
    }

    public void SetWShield(int n) {
        this.m_nShiW = n;
    }

    public void DecAShield() {
        if (this.m_nShiA > 0) {
            this.m_nShiA += -1;
        }
    }

    public void ResetLuck() {
        this.ResetFlag(1);
    }

    public int GetDex_Base() {
        if (this.m_Abi.GetFlag(13)) {
            return (int)((float)this.m_nDex * 1.3f);
        }
        if (this.m_Abi.GetFlag(12)) {
            return (int)((float)this.m_nDex * 1.15f);
        }
        return this.m_nDex;
    }

    public void SetStr_Base(int n) {
        this.m_nStr = n;
    }

    public int GetStr_Item() {
        return this.m_nStrI;
    }

    public int GetStr() {
        int n = this.GetStr_Base() + this.GetStr_Item() + this.GetStr_Btl();
        if (n < 1) {
            n = 1;
        }
        if (this.IsSuika()) {
            n += 100;
        }
        return n;
    }

    public int GetMaxHP() {
        int n = this.m_nMaxHP;
        if (this.m_Abi.GetFlag(1)) {
            n = (int)((float)n * 1.3f);
        } else if (this.m_Abi.GetFlag(0)) {
            n = (int)((float)n * 1.15f);
        }
        if (this.m_bPlayer && n > 9999) {
            n = 9999;
        }
        return n;
    }

    public int GetInt() {
        int n = this.GetInt_Base() + this.GetInt_Item();
        if (this.IsSuika()) {
            n += 100;
        }
        return n;
    }

    public int GetDef_Btl() {
        return this.m_nDefB;
    }

    public void SetName(String string) {
        this.m_strName = string;
    }
}

