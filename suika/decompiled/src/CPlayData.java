/*
 * Decompiled with CFR 0.152.
 */
class CPlayData {
    static final int PASS_HEADER = 29;
    static final int PASS_CHAR = 45;
    static final int PASS_ITEM = 100;
    static final int PASS_FLAG = 50;
    static final int PASS_SUM = 4;
    static final int PASS_LENGTH = 318;
    public int m_nGold;
    public int[] m_anItem = new int[150];
    public CPlayTime m_Time;
    public CFlag2 m_EvtFlag;
    public int m_nPartyNum = 1;
    public String m_strPlayerName;
    public int[] m_anPlayerName = new int[4];
    public int m_nAreaNo;
    public int m_nShipX;
    public int m_nShipZ;
    public int m_nShipV;
    public int[] m_anPassTable = new int[318];
    public int m_nPassRand = -1;

    public void SetGold(int n) {
        this.m_nGold = n;
        if (this.m_nGold > 9999999) {
            this.m_nGold = 9999999;
        }
    }

    public int ReadWord(int n) {
        return (this.m_anPassTable[n] << 6) + this.m_anPassTable[n + 1];
    }

    public void SetItem(int n, int n2) {
        if (n < 0 || n >= 150) {
            return;
        }
        this.m_anItem[n] = n2;
        if (this.m_anItem[n] > 9) {
            this.m_anItem[n] = 9;
        }
        if (this.m_anItem[n] < 0) {
            this.m_anItem[n] = 0;
        }
    }

    public int GetGold() {
        return this.m_nGold;
    }

    public void AddGold(int n) {
        this.m_nGold += n;
        if (this.m_nGold > 9999999) {
            this.m_nGold = 9999999;
        }
    }

    public String RemoveReturn(String string) {
        String string2 = new String();
        int n = string.length();
        int n2 = 0;
        while (n2 < n) {
            String string3 = string.substring(n2, n2 + 1);
            if (!(string3.equals("\r") || string3.equals("\n") || string3.equals("\u0000") || string3.equals(" "))) {
                string2 = string2 + string3;
            }
            ++n2;
        }
        return string2;
    }

    public void HealAll() {
        int n = 0;
        do {
            CChrParam cChrParam = Vari.GetChrPrm(n);
            cChrParam.AddHP(9999);
            cChrParam.AddMP(9999);
        } while (++n < 3);
    }

    public void MakePass_Char(int n, int n2) {
        CChrParam cChrParam = Vari.GetChrPrm(n);
        this.m_anPassTable[n2] = cChrParam.m_nExp / 262144 & 0x3F;
        this.m_anPassTable[n2 + 1] = cChrParam.m_nExp / 4096 & 0x3F;
        this.m_anPassTable[n2 + 2] = cChrParam.m_nExp / 64 & 0x3F;
        this.m_anPassTable[n2 + 3] = cChrParam.m_nExp & 0x3F;
        this.m_anPassTable[n2 + 4] = cChrParam.m_nAP / 64 & 0x3F;
        this.m_anPassTable[n2 + 5] = cChrParam.m_nAP & 0x3F;
        this.m_anPassTable[n2 + 6] = this.Equip2Pass(cChrParam.m_nGem, 110);
        this.m_anPassTable[n2 + 7] = cChrParam.m_GemFlag.GetValue(0);
        this.m_anPassTable[n2 + 8] = cChrParam.m_GemFlag.GetValue(1);
        this.m_anPassTable[n2 + 9] = cChrParam.m_GemFlag.GetValue(2);
        this.m_anPassTable[n2 + 10] = this.Equip2Pass(cChrParam.m_anEquip[0], 20);
        this.m_anPassTable[n2 + 11] = this.Equip2Pass(cChrParam.m_anEquip[1], 50);
        this.m_anPassTable[n2 + 12] = this.Equip2Pass(cChrParam.m_anEquip[2], 70);
        this.m_anPassTable[n2 + 13] = this.Equip2Pass(cChrParam.m_anEquip[3], 89);
        this.m_anPassTable[n2 + 14] = this.Equip2Pass(cChrParam.m_anEquip[4], 89);
        CAbility cAbility = cChrParam.m_Abi;
        this.m_anPassTable[n2 + 15] = cAbility.GetValueM(0);
        this.m_anPassTable[n2 + 16] = cAbility.GetValueM(1);
        this.m_anPassTable[n2 + 17] = cAbility.GetValueM(2);
        this.m_anPassTable[n2 + 18] = cAbility.GetValueM(3);
        this.m_anPassTable[n2 + 19] = cAbility.GetValueM(4);
        this.m_anPassTable[n2 + 20] = cAbility.GetValueM(5);
        this.m_anPassTable[n2 + 21] = cAbility.GetValueM(6);
        this.m_anPassTable[n2 + 22] = cAbility.GetValueM(7);
        this.m_anPassTable[n2 + 23] = cAbility.GetValueM(8);
        this.m_anPassTable[n2 + 24] = cAbility.GetValueM(9);
        this.m_anPassTable[n2 + 25] = cAbility.GetValueM(10);
        this.m_anPassTable[n2 + 26] = cAbility.GetValueM(11);
        this.m_anPassTable[n2 + 27] = cAbility.GetValueM(12);
        this.m_anPassTable[n2 + 28] = cAbility.GetValueM(13);
        this.m_anPassTable[n2 + 29] = cAbility.GetValueM(14);
        this.m_anPassTable[n2 + 30] = cAbility.GetValueM(15);
        this.m_anPassTable[n2 + 31] = cAbility.GetValueM(16);
        this.m_anPassTable[n2 + 32] = cAbility.GetValueM(17);
        this.m_anPassTable[n2 + 33] = cAbility.GetValueM(18);
        this.m_anPassTable[n2 + 34] = cAbility.GetValueC(0);
        this.m_anPassTable[n2 + 35] = cAbility.GetValueC(1);
        this.m_anPassTable[n2 + 36] = cChrParam.m_anCmdAb[0];
        this.m_anPassTable[n2 + 37] = cChrParam.m_anCmdAb[1];
        this.m_anPassTable[n2 + 38] = cChrParam.m_anCmdAb[2];
        this.m_anPassTable[n2 + 39] = cChrParam.m_anCmdAb[3];
        this.m_anPassTable[n2 + 40] = cChrParam.GetHP() / 4096 & 0x3F;
        this.m_anPassTable[n2 + 41] = cChrParam.GetHP() / 64 & 0x3F;
        this.m_anPassTable[n2 + 42] = cChrParam.GetHP() & 0x3F;
        this.m_anPassTable[n2 + 43] = cChrParam.GetMP() / 64 & 0x3F;
        this.m_anPassTable[n2 + 44] = cChrParam.GetMP() & 0x3F;
    }

    public boolean LoadPass_Char(int n, int n2) {
        CChrParam cChrParam = Vari.GetChrPrm(n);
        ARpg aRpg = Vari.m_App;
        aRpg.SetChrPrm(n, n);
        cChrParam.m_nExp = this.m_anPassTable[n2 + 0] * 262144 + this.m_anPassTable[n2 + 1] * 4096 + this.m_anPassTable[n2 + 2] * 64 + this.m_anPassTable[n2 + 3];
        cChrParam.m_nAP = this.m_anPassTable[n2 + 4] * 64 + this.m_anPassTable[n2 + 5];
        cChrParam.m_nGem = this.Pass2Equip(this.m_anPassTable[n2 + 6], 110);
        cChrParam.m_GemFlag.SetValue(0, this.m_anPassTable[n2 + 7]);
        cChrParam.m_GemFlag.SetValue(1, this.m_anPassTable[n2 + 8]);
        cChrParam.m_GemFlag.SetValue(2, this.m_anPassTable[n2 + 9]);
        cChrParam.m_anEquip[0] = this.Pass2Equip(this.m_anPassTable[n2 + 10], 20);
        cChrParam.m_anEquip[1] = this.Pass2Equip(this.m_anPassTable[n2 + 11], 50);
        cChrParam.m_anEquip[2] = this.Pass2Equip(this.m_anPassTable[n2 + 12], 70);
        cChrParam.m_anEquip[3] = this.Pass2Equip(this.m_anPassTable[n2 + 13], 89);
        cChrParam.m_anEquip[4] = this.Pass2Equip(this.m_anPassTable[n2 + 14], 89);
        CAbility cAbility = cChrParam.m_Abi;
        cAbility.SetValueM(0, this.m_anPassTable[n2 + 15]);
        cAbility.SetValueM(1, this.m_anPassTable[n2 + 16]);
        cAbility.SetValueM(2, this.m_anPassTable[n2 + 17]);
        cAbility.SetValueM(3, this.m_anPassTable[n2 + 18]);
        cAbility.SetValueM(4, this.m_anPassTable[n2 + 19]);
        cAbility.SetValueM(5, this.m_anPassTable[n2 + 20]);
        cAbility.SetValueM(6, this.m_anPassTable[n2 + 21]);
        cAbility.SetValueM(7, this.m_anPassTable[n2 + 22]);
        cAbility.SetValueM(8, this.m_anPassTable[n2 + 23]);
        cAbility.SetValueM(9, this.m_anPassTable[n2 + 24]);
        cAbility.SetValueM(10, this.m_anPassTable[n2 + 25]);
        cAbility.SetValueM(11, this.m_anPassTable[n2 + 26]);
        cAbility.SetValueM(12, this.m_anPassTable[n2 + 27]);
        cAbility.SetValueM(13, this.m_anPassTable[n2 + 28]);
        cAbility.SetValueM(14, this.m_anPassTable[n2 + 29]);
        cAbility.SetValueM(15, this.m_anPassTable[n2 + 30]);
        cAbility.SetValueM(16, this.m_anPassTable[n2 + 31]);
        cAbility.SetValueM(17, this.m_anPassTable[n2 + 32]);
        cAbility.SetValueM(18, this.m_anPassTable[n2 + 33]);
        cAbility.SetValueC(0, this.m_anPassTable[n2 + 34]);
        cAbility.SetValueC(1, this.m_anPassTable[n2 + 35]);
        cChrParam.m_anCmdAb[0] = this.m_anPassTable[n2 + 36];
        cChrParam.m_anCmdAb[1] = this.m_anPassTable[n2 + 37];
        cChrParam.m_anCmdAb[2] = this.m_anPassTable[n2 + 38];
        cChrParam.m_anCmdAb[3] = this.m_anPassTable[n2 + 39];
        cChrParam.AllLevelUp();
        cChrParam.SetEquipPrmAll();
        cChrParam.m_nHP = this.m_anPassTable[n2 + 40] * 4096 + this.m_anPassTable[n2 + 41] * 64 + this.m_anPassTable[n2 + 42];
        cChrParam.m_nMP = this.m_anPassTable[n2 + 43] * 64 + this.m_anPassTable[n2 + 44];
        return true;
    }

    public void LoadPass_Item(int n) {
        int n2 = 0;
        do {
            int n3 = this.m_anPassTable[n + 0] & 0xF;
            int n4 = (this.m_anPassTable[n + 0] >> 4) + (this.m_anPassTable[n + 1] >> 4) * 4;
            int n5 = this.m_anPassTable[n + 1] & 0xF;
            this.SetItem(n2 + 0, n3);
            this.SetItem(n2 + 1, n4);
            this.SetItem(n2 + 2, n5);
            n += 2;
        } while ((n2 += 3) < 150);
    }

    public int LoadPassWord(String string, boolean bl) {
        String string2 = this.RemoveReturn(string);
        int n = this.GetNum(string2, 0, 0);
        if (n < 0) {
            return 3;
        }
        this.m_nPassRand = n;
        int n2 = 0;
        int n3 = string2.length();
        int n4 = 0;
        while (n4 < n3) {
            int n5 = this.GetNum(string2, n, n4);
            if (n5 < 0) {
                this.GetNum(string2, n, n4);
                return 3;
            }
            if (n2 >= 318) {
                return 3;
            }
            this.m_anPassTable[n2] = n5;
            ++n2;
            ++n4;
        }
        if (n2 != 318) {
            return 3;
        }
        if (!this.LoadPass_SetSum()) {
            return 3;
        }
        if (!bl) {
            return 0;
        }
        n2 = 0;
        this.LoadPass_Header(n2);
        this.LoadPass_Char(0, n2 += 29);
        this.LoadPass_Char(1, n2 += 45);
        this.LoadPass_Char(2, n2 += 45);
        this.LoadPass_Item(n2 += 45);
        this.LoadPass_Flag(n2 += 100);
        CChrParam cChrParam = Vari.GetChrPrm(0);
        cChrParam.SetName(this.m_strPlayerName);
        this.SetPartyDisp();
        return 0;
    }

    public void SetPartyDisp() {
        CChrWork cChrWork;
        this.m_nPartyNum = 1;
        if (this.GetEvtFlag(1)) {
            ++this.m_nPartyNum;
            cChrWork = Vari.GetChrWork(1);
            cChrWork.SetFlag(1);
        }
        if (this.GetEvtFlag(2)) {
            ++this.m_nPartyNum;
            cChrWork = Vari.GetChrWork(2);
            cChrWork.SetFlag(1);
        }
    }

    public int GetItem2(int n) {
        if (n < 0 || n >= 150) {
            return 0;
        }
        int n2 = this.GetItem(n);
        int n3 = 0;
        while (n3 < this.m_nPartyNum) {
            CChrParam cChrParam = Vari.GetChrPrm(n3);
            int n4 = 0;
            do {
                if (cChrParam.m_anEquip[n4] != n) continue;
                ++n2;
            } while (++n4 < 5);
            ++n3;
        }
        return n2;
    }

    public boolean LoadPass_SetSum() {
        int n;
        int n2 = n = 314;
        int n3 = 0;
        int n4 = 0;
        int n5 = 0;
        while (n5 < n2) {
            n3 += this.m_anPassTable[n5];
            n4 = (n5 & 1) == 0 ? (n4 += this.m_anPassTable[n5]) : (n4 -= this.m_anPassTable[n5]);
            ++n5;
        }
        return this.m_anPassTable[n + 0] == (n3 / 64 & 0x3F) && this.m_anPassTable[n + 1] == (n3 & 0x3F) && this.m_anPassTable[n + 2] == (n4 / 64 & 0x3F) && this.m_anPassTable[n + 3] == (n4 & 0x3F);
    }

    public boolean GetEvtFlag(int n) {
        return this.m_EvtFlag.GetFlag(n);
    }

    public void ResetEvtFlag(int n) {
        this.m_EvtFlag.ResetFlag(n);
    }

    public void LoadPass_Flag(int n) {
        int n2 = 0;
        do {
            this.m_EvtFlag.SetValue(n2, this.m_anPassTable[n]);
            ++n;
        } while (++n2 < 50);
    }

    public void ClearLocalEcvtFlag() {
        int n = 400;
        do {
            this.ResetEvtFlag(n);
        } while (++n < 499);
    }

    public String CreatePassWord(int n, int n2, int n3) {
        int n4;
        while ((n4 = Calc3D.Rand(64)) == this.m_nPassRand) {
        }
        this.m_nPassRand = n4;
        int n5 = 0;
        this.MakePass_Header(n5, n, n2, n3);
        this.MakePass_Char(0, n5 += 29);
        this.MakePass_Char(1, n5 += 45);
        this.MakePass_Char(2, n5 += 45);
        this.MakePass_Item(n5 += 45);
        this.MakePass_Flag(n5 += 100);
        this.MakePass_SetSum(n5 += 50);
        String string = new String();
        CPassCode cPassCode = new CPassCode();
        int n6 = 0;
        do {
            string = string + CPassCode.GetCode(this.m_anPassTable[n6], n4, n6);
            if (n6 % 53 != 52) continue;
            string = string + "\n";
        } while (++n6 < 318);
        return string;
    }

    CPlayData() {
        this.m_Time = new CPlayTime();
        this.m_EvtFlag = new CFlag2();
        this.m_EvtFlag.Create(1000);
        this.Init();
    }

    public int Pass2Equip(int n, int n2) {
        if (n == 63) {
            return -1;
        }
        return n + n2;
    }

    public void AddItem(int n, int n2) {
        if (n < 0 || n >= 150) {
            return;
        }
        int n3 = n;
        this.m_anItem[n3] = this.m_anItem[n3] + n2;
        if (this.m_anItem[n] > 9) {
            this.m_anItem[n] = 9;
        }
        if (this.m_anItem[n] < 0) {
            this.m_anItem[n] = 0;
        }
    }

    public int GetItem(int n) {
        if (n < 0 || n >= 150) {
            return 0;
        }
        return this.m_anItem[n];
    }

    public int GetSortItemNum(int n) {
        int n2 = -1;
        int n3 = 0;
        do {
            if (this.m_anItem[n3] <= 0 || ++n2 != n) continue;
            return n3;
        } while (++n3 < 150);
        return -1;
    }

    public void MakePass_Item(int n) {
        int n2 = 0;
        do {
            int n3 = this.GetItem(n2 + 0);
            int n4 = this.GetItem(n2 + 1);
            int n5 = this.GetItem(n2 + 2);
            this.m_anPassTable[n + 0] = n3 + ((n4 & 3) << 4);
            this.m_anPassTable[n + 1] = n5 + (n4 >> 2 << 4);
            n += 2;
        } while ((n2 += 3) < 150);
    }

    public int GetNum(String string, int n, int n2) {
        if (n2 >= string.length()) {
            return -1;
        }
        return CPassCode.GetNum(string.substring(n2, n2 + 1), n, n2);
    }

    public int Equip2Pass(int n, int n2) {
        if (n == -1) {
            return 63;
        }
        return n - n2 & 0x3F;
    }

    public void WriteWord(int n, int n2) {
        this.m_anPassTable[n] = n2 / 64 & 0x3F;
        this.m_anPassTable[n + 1] = n2 % 64;
    }

    public void MakePass_Header(int n, int n2, int n3, int n4) {
        this.m_anPassTable[n] = 0;
        this.m_anPassTable[n + 1] = 2;
        this.m_anPassTable[n + 2] = this.m_anPlayerName[0] / 64;
        this.m_anPassTable[n + 3] = this.m_anPlayerName[0] % 64;
        this.m_anPassTable[n + 4] = this.m_anPlayerName[1] / 64;
        this.m_anPassTable[n + 5] = this.m_anPlayerName[1] % 64;
        this.m_anPassTable[n + 6] = this.m_anPlayerName[2] / 64;
        this.m_anPassTable[n + 7] = this.m_anPlayerName[2] % 64;
        this.m_anPassTable[n + 8] = this.m_anPlayerName[3] / 64;
        this.m_anPassTable[n + 9] = this.m_anPlayerName[3] % 64;
        this.WriteWord(n + 10, this.m_nAreaNo);
        this.WriteWord(n + 12, n2);
        this.WriteWord(n + 14, n3);
        this.m_anPassTable[n + 16] = n4;
        this.m_anPassTable[n + 17] = this.m_nGold / 262144 & 0x3F;
        this.m_anPassTable[n + 18] = this.m_nGold / 4096 & 0x3F;
        this.m_anPassTable[n + 19] = this.m_nGold / 64 & 0x3F;
        this.m_anPassTable[n + 20] = this.m_nGold & 0x3F;
        this.m_Time.Push();
        this.m_anPassTable[n + 21] = this.m_Time.GetHourBase() & 0x3F;
        this.m_anPassTable[n + 22] = this.m_Time.GetMinuteBase();
        this.m_anPassTable[n + 23] = this.m_Time.GetSecondBase();
        this.WriteWord(n + 24, this.m_nShipX);
        this.m_anPassTable[n + 26] = this.m_Time.GetHourBase() / 64 & 0x3F;
        this.m_anPassTable[n + 27] = this.m_nShipZ & 0x3F;
        this.m_anPassTable[n + 28] = this.m_nShipV & 0x3F;
    }

    public int GetSellPrice(int n) {
        return n / 2;
    }

    public boolean LoadPass_Header(int n) {
        CChrWork cChrWork = Vari.GetChrWork(0);
        Vari.GetChrPrm(0);
        if (this.m_anPassTable[n + 1] != 2) {
            return false;
        }
        this.m_anPlayerName[0] = (this.m_anPassTable[n + 2] << 6) + this.m_anPassTable[n + 3];
        this.m_anPlayerName[1] = (this.m_anPassTable[n + 4] << 6) + this.m_anPassTable[n + 5];
        this.m_anPlayerName[2] = (this.m_anPassTable[n + 6] << 6) + this.m_anPassTable[n + 7];
        this.m_anPlayerName[3] = (this.m_anPassTable[n + 8] << 6) + this.m_anPassTable[n + 9];
        this.m_strPlayerName = CInputNameWondow.m_strText[this.m_anPlayerName[0]] + CInputNameWondow.m_strText[this.m_anPlayerName[1]] + CInputNameWondow.m_strText[this.m_anPlayerName[2]] + CInputNameWondow.m_strText[this.m_anPlayerName[3]];
        this.m_nAreaNo = this.ReadWord(n + 10);
        cChrWork.m_vPos.x = CMapData.GetXPos(this.ReadWord(n + 12));
        cChrWork.m_vPos.z = CMapData.GetZPos(this.ReadWord(n + 14));
        cChrWork.SetVect((float)this.m_anPassTable[n + 16] * 1.5707964f);
        this.m_nGold = this.m_anPassTable[n + 17] * 262144 + this.m_anPassTable[n + 18] * 4096 + this.m_anPassTable[n + 19] * 64 + this.m_anPassTable[n + 20];
        this.m_Time.Reset();
        this.m_Time.AddBase(this.m_anPassTable[n + 26] * 64 + this.m_anPassTable[n + 21], this.m_anPassTable[n + 22], this.m_anPassTable[n + 23]);
        this.m_nShipX = this.ReadWord(n + 24);
        this.m_nShipZ = this.m_anPassTable[n + 27];
        this.m_nShipV = this.m_anPassTable[n + 28];
        this.m_Time.Start();
        return true;
    }

    public void Init() {
        this.m_nPartyNum = 1;
        this.m_nGold = 0;
        this.m_Time.Reset();
        this.m_nShipX = 17;
        this.m_nShipZ = 36;
        this.m_nShipV = 1;
        int n = 0;
        do {
            this.m_anItem[n] = 0;
        } while (++n < 150);
        this.m_EvtFlag.ClearFlag();
        this.m_EvtFlag.SetFlag(301);
    }

    public int GetAllItemKind() {
        int n = 0;
        int n2 = 0;
        do {
            if (this.m_anItem[n2] <= 0) continue;
            ++n;
        } while (++n2 < 150);
        return n;
    }

    public void MakePass_SetSum(int n) {
        int n2 = 314;
        int n3 = 0;
        int n4 = 0;
        int n5 = 0;
        while (n5 < n2) {
            n3 += this.m_anPassTable[n5];
            n4 = (n5 & 1) == 0 ? (n4 += this.m_anPassTable[n5]) : (n4 -= this.m_anPassTable[n5]);
            ++n5;
        }
        this.m_anPassTable[n + 0] = n3 / 64 & 0x3F;
        this.m_anPassTable[n + 1] = n3 & 0x3F;
        this.m_anPassTable[n + 2] = n4 / 64 & 0x3F;
        this.m_anPassTable[n + 3] = n4 & 0x3F;
    }

    public void SetEvtFlag(int n) {
        this.m_EvtFlag.SetFlag(n);
    }

    public void MakePass_Flag(int n) {
        int n2 = 0;
        do {
            this.m_anPassTable[n] = this.m_EvtFlag.GetValue(n2);
            ++n;
        } while (++n2 < 50);
    }
}

