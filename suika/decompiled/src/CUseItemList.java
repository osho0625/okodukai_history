/*
 * Decompiled with CFR 0.152.
 */
class CUseItemList
extends CBaseItemList {
    public boolean Algo_002(int n) {
        boolean bl = false;
        CChrSelectHP cChrSelectHP = new CChrSelectHP();
        cChrSelectHP.Create(this.m_App, 1);
        cChrSelectHP.SetFlag(1);
        this.m_App.EntryWindow(cChrSelectHP);
        cChrSelectHP.OpenWindow();
        this.m_App.LoopFrame(4);
        int n2 = cChrSelectHP.LoopFrame();
        if (Vari.IsPartyAbility(104)) {
            n *= 2;
        }
        if (n2 != -1) {
            this.m_App.PlaySe(10);
            this.m_App.LoopFrame(2);
            int n3 = 0;
            while (n3 < Vari.GetPartyNum()) {
                CChrParam cChrParam = Vari.GetChrPrm(Vari.GetPartyWork(n3));
                cChrParam.AddHP(CBattleActCalc.CalcItemHeal(n));
                ++n3;
            }
            this.m_App.LoopFrame(8);
            bl = true;
            Vari.HealFlag(0);
        }
        cChrSelectHP.CloseWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(cChrSelectHP);
        return bl;
    }

    public void Algo_000(int n) {
        this.m_App.Slip("\u4f55\u3082\u8d77\u3053\u3089\u306a\u304b\u3063\u305f");
    }

    public boolean ExecItem(int n) {
        CUseDrop cUseDrop = new CUseDrop();
        cUseDrop.Create(this.m_App, 80, n * 24 + 24);
        int n2 = cUseDrop.Run();
        if (n2 == 0) {
            this.UseItem(n);
            if (Vari.m_nSkyHand != -1) {
                return true;
            }
        } else if (n2 == 1) {
            this.DropItem(n);
        }
        return this.m_App.m_Play.GetAllItemKind() == 0;
    }

    public boolean Algo_001(int n) {
        boolean bl = false;
        CChrSelectHP cChrSelectHP = new CChrSelectHP();
        cChrSelectHP.Create(this.m_App, 0);
        cChrSelectHP.SetFlag(1);
        this.m_App.EntryWindow(cChrSelectHP);
        cChrSelectHP.OpenWindow();
        this.m_App.LoopFrame(4);
        int n2 = cChrSelectHP.LoopFrame();
        if (Vari.IsPartyAbility(104)) {
            n *= 2;
        }
        if (n2 != -1) {
            this.m_App.PlaySe(10);
            int n3 = Vari.GetPartyWork(n2);
            this.m_App.LoopFrame(2);
            CChrParam cChrParam = Vari.GetChrPrm(n3);
            cChrParam.AddHP(CBattleActCalc.CalcItemHeal(n));
            this.m_App.LoopFrame(8);
            bl = true;
            Vari.HealFlag(0);
        }
        cChrSelectHP.CloseWindow();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(cChrSelectHP);
        return bl;
    }

    public void CreateList(ARpg aRpg) {
        Vari.m_nSkyHand = -1;
        this._Create(aRpg);
    }

    public boolean Algo_005(int n) {
        if (this.m_App.m_Play.GetEvtFlag(308)) {
            this.m_App.Slip("\u3053\u3053\u3067\u306f\u4f7f\u3048\u306a\u3044");
            return false;
        }
        CSkyHand cSkyHand = new CSkyHand();
        Vari.m_nSkyHand = cSkyHand.Run();
        return Vari.m_nSkyHand != -1;
    }

    public boolean IsUse(CItemData cItemData) {
        return true;
    }

    public boolean Algo_007(int n) {
        CWorldMap cWorldMap = new CWorldMap();
        cWorldMap.Create(this.m_App);
        this.m_App.EntryWindow(cWorldMap);
        this.m_App.LoopFrame(4);
        this.m_App.WaitKey_Display();
        this.m_App.ClearKey();
        this.m_App.ReleaseWindow(cWorldMap);
        return false;
    }

    CUseItemList() {
        this.SetHelpYPos(228);
    }

    public void UseItem(int n) {
        int n2 = n + this.m_nPage * this.m_nMaxListNum;
        int n3 = this.m_anTable[n2];
        int n4 = this.m_anUse[n2];
        CItemData cItemData = Vari.GetItemData(n3);
        switch (n4) {
            case 1: {
                if (!this.Algo_001(cItemData.m_nEffect)) break;
                this.DecItem(n);
                return;
            }
            case 2: {
                if (!this.Algo_002(cItemData.m_nEffect)) break;
                this.DecItem(n);
                return;
            }
            case 4: {
                if (!this.Algo_004(cItemData.m_nEffect)) break;
                this.DecItem(n);
                return;
            }
            case 5: {
                if (!this.Algo_005(cItemData.m_nEffect)) break;
                this.DecItem(n);
                return;
            }
            case 7: {
                this.Algo_007(cItemData.m_nEffect);
                return;
            }
            default: {
                this.Algo_000(cItemData.m_nEffect);
                return;
            }
        }
    }

    public void DropItem(int n) {
        int n2 = n + this.m_nPage * this.m_nMaxListNum;
        int n3 = this.m_anTable[n2];
        CItemData cItemData = Vari.GetItemData(n3);
        if (cItemData.m_nGold == 0) {
            this.m_App.Slip("\u3053\u308c\u306f\u6368\u3066\u3089\u308c\u307e\u305b\u3093");
            return;
        }
        CSysYesNo cSysYesNo = new CSysYesNo();
        int n4 = cSysYesNo.Run(this.m_App, "\u3000\u3000\u672c\u5f53\u306b\u6368\u3066\u307e\u3059\u304b\uff1f\u3000\u3000");
        if (n4 == 0) {
            this.DecItem(n);
        }
    }

    public boolean Algo_004(int n) {
        CAreaParam cAreaParam = this.m_App.GetAreaParam();
        if (cAreaParam.m_nLightMode == 0) {
            this.m_App.Slip("\u3053\u3053\u3067\u306f\u52b9\u679c\u304c\u306a\u3044");
            return false;
        }
        this.m_App.m_Game.m_nCatsEye = 500;
        this.m_App.ResetStopDisplay();
        this.m_App.MainFrame();
        this.m_App.SetStopDisplay();
        this.m_App.Slip("\u5468\u308a\u304c\u660e\u308b\u304f\u306a\u3063\u305f");
        return true;
    }
}

