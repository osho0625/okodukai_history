/*
 * Decompiled with CFR 0.152.
 */
class CEventManage {
    static final int E_END = 0;
    static final int E_SETEF = 1;
    static final int E_RESETEF = 2;
    static final int E_SETCF = 3;
    static final int E_RESETCF = 4;
    static final int E_VECT = 5;
    static final int E_VECT2 = 6;
    static final int E_LOOK = 7;
    static final int E_OPENW = 8;
    static final int E_CLOSEW = 9;
    static final int E_MESS = 10;
    static final int E_MOVE = 11;
    static final int E_POS = 12;
    static final int E_SE = 13;
    static final int E_JUMP = 14;
    static final int E_IF = 15;
    static final int E_IFN = 16;
    static final int E_YESNO = 17;
    static final int E_TSHOP = 18;
    static final int E_WSHOP = 19;
    static final int E_GSHOP = 20;
    static final int E_IN = 21;
    static final int E_FRAME = 22;
    static final int E_FADEIN = 23;
    static final int E_FADEOUT = 24;
    static final int E_WHITEIN = 25;
    static final int E_WHITEOUT = 26;
    static final int E_HEAL = 27;
    static final int E_ADDGOLD = 28;
    static final int E_SUBGOLD = 29;
    static final int E_MAPM = 30;
    static final int E_MAPH = 31;
    static final int E_CHRALGO = 32;
    static final int E_PASSW = 33;
    static final int E_CMPI = 34;
    static final int E_PARTY = 35;
    static final int E_BATTLE = 36;
    static final int E_INRESET = 37;
    static final int E_COIN = 38;
    static final int E_PARTYM = 39;
    static final int E_PAT = 40;
    static final int E_CMPP = 41;
    static final int E_CAMINIT = 42;
    static final int E_SCALE = 43;
    static final int E_CAMCHR = 44;
    static final int E_ITEM = 45;
    static final int E_RESETFL = 46;
    static final int E_EFFECT = 47;
    static final int E_DISPGOLD = 48;
    static final int E_CMPH = 49;
    static final int E_MAPG = 50;
    static final int E_SSHOP = 51;
    static final int E_QUIZ = 52;
    static final int E_BATTLE2 = 53;
    static final int E_CHRMODE = 54;
    static final int E_EXCL = 55;
    static final int E_AREA = 56;
    static final int E_CALL = 57;
    static final int E_RETURN = 58;
    static final int E_POSADD = 59;
    static final int E_IFCALL = 60;
    static final int E_IFNCALL = 61;
    static final int E_POSCOPY = 62;
    static final int E_POSY = 63;
    static final int E_QUAKE = 64;
    static final int E_CHRPRM = 65;
    static final int E_ADDITEM = 66;
    static final int E_IFRET = 67;
    static final int E_IFNRET = 68;
    static final int E_CHRMENU = 69;
    static final int E_GETABI = 70;
    static final int E_SETABI = 71;
    static final int E_CSHOP = 72;
    static final int E_AMBIENT = 73;
    static final int E_LIGHT = 74;
    static final int E_NUMBER = 75;
    static final byte _PLAYER = 0;
    static final byte _PARTY = 98;
    static final byte _EVENTCHR = 99;
    static final int MAX_STACK = 64;
    private int m_nMaxEventNum;
    private byte m_byEventChr;
    private CEventData[] m_acEvtData;
    private int m_nEventNo;
    private int m_nPtr;
    private CEventData m_cExeEvt;
    private ARpg m_App;
    private String m_strMess;
    private CChrParam m_PushPrm = new CChrParam(0);
    private int[] m_anStack = new int[64];
    private int m_nStackPtr;
    private int m_nPushEventNo;
    private int m_nPushPtr;
    private int m_nPushStackPtr;
    private CEventData m_cPushExeEvt;

    private void EvtCmd_AddGold() {
        int n = this.GetOperandWord();
        this.m_App.m_Play.AddGold(n);
    }

    private void EvtCmd_Frame() {
        int n = this.GetOperandWord();
        if (n == Short.MAX_VALUE) {
            while (Vari.m_Char.IsMoveEvent()) {
                this.m_App.LoopFrame(1);
            }
            return;
        }
        this.m_App.LoopFrame(n);
    }

    CEventManage() {
    }

    private void EvtCmd_MapHit() {
        byte by = this.GetOperand();
        byte by2 = this.GetOperand();
        byte by3 = this.GetOperand();
        this.m_App.m_NowStagePrm.SetMapHit(by, by2, by3);
    }

    private void EvtCmd_Shop(String string) {
        int[] nArray = new int[12];
        int n = 0;
        do {
            nArray[n] = CFunc.Unsigned(this.GetOperand2());
        } while (++n < 12);
        CToolShop cToolShop = new CToolShop();
        cToolShop.Create(this.m_App, string, nArray);
        cToolShop.Main();
    }

    private void EvtCmd_CShop() {
        CComposition cComposition = new CComposition();
        cComposition.Create(this.m_App);
        cComposition.Main();
    }

    private void EvtCmd_DispGold() {
        byte by = this.GetOperand();
        if (by == 1) {
            this.m_App.OpenMoneyWindow();
            return;
        }
        this.m_App.CloseMoneyWindow();
    }

    private void EvtCmd_Call() {
        int n = this.GetOperandWord();
        this.PushStack(this.m_nEventNo);
        this.PushStack(this.m_nPtr);
        this.m_nEventNo = n;
        this.m_cExeEvt = this.m_acEvtData[this.m_nEventNo];
        this.m_nPtr = 0;
    }

    private void EvtCmd_CmpP() {
        byte by = this.GetOperand();
        CChrWork cChrWork = Vari.GetChrWork(by);
        byte by2 = this.GetOperand();
        int n = by2 == 0 ? CMapData.GetXBlock(cChrWork.m_vPos.x) : CMapData.GetZBlock(cChrWork.m_vPos.z);
        byte by3 = this.GetOperand();
        this.SetCompareI(n - by3);
    }

    private void EvtCmd_Area() {
        byte by = this.GetOperand2();
        byte by2 = this.GetOperand();
        byte by3 = this.GetOperand();
        byte by4 = this.GetOperand();
        Vari.SetSysFlag(1);
        Vari.m_App.m_Game.XChgArea(by, by2, by3, by4);
        Vari.ResetSysFlag(1);
    }

    public void Run(int n, int n2) {
        Vari.m_bExecEvent = true;
        Vari.m_Char.InitEvent();
        this.m_nEventNo = n;
        this.m_nPtr = 0;
        this.m_nStackPtr = 0;
        this.m_cExeEvt = this.m_acEvtData[this.m_nEventNo];
        this.m_byEventChr = (byte)n2;
        do {
            byte by = this.m_cExeEvt.Get(this.m_nPtr);
            ++this.m_nPtr;
            switch (by) {
                case 0: {
                    Vari.m_Char.InitEvent();
                    Vari.m_bExecEvent = false;
                    return;
                }
                case 1: {
                    this.m_App.m_Play.SetEvtFlag(this.GetOperandWord());
                    break;
                }
                case 2: {
                    this.m_App.m_Play.ResetEvtFlag(this.GetOperandWord());
                    break;
                }
                case 3: {
                    this.EvtCmd_SetCF();
                    break;
                }
                case 4: {
                    this.EvtCmd_ResetCF();
                    break;
                }
                case 5: {
                    byte by2 = this.GetOperand();
                    byte by3 = this.GetOperand();
                    if (by2 != 98) {
                        Vari.GetChrWork(by2).SetVect((float)by3 * 1.5707964f);
                        break;
                    }
                    Vari.GetChrWork(0).SetVect((float)by3 * 1.5707964f);
                    Vari.GetChrWork(1).SetVect((float)by3 * 1.5707964f);
                    Vari.GetChrWork(2).SetVect((float)by3 * 1.5707964f);
                    break;
                }
                case 6: {
                    byte by2 = this.GetOperand();
                    byte by3 = this.GetOperand();
                    Vari.GetChrWork((int)by2).m_fVect = (float)by3 * 1.5707964f;
                    break;
                }
                case 7: {
                    byte by2 = this.GetOperand();
                    byte by3 = this.GetOperand();
                    Vari.GetChrWork(by2).LookAt(Vari.GetChrWork((int)by3).m_vPos);
                    break;
                }
                case 8: {
                    byte by2 = this.GetOperand();
                    if (Vari.m_bDebMessOff) break;
                    this.m_App.m_MessWin.OpenWindow(by2);
                    this.m_App.LoopFrame(4);
                    break;
                }
                case 9: {
                    if (Vari.m_bDebMessOff) break;
                    this.m_App.m_MessWin.CloseWindow();
                    this.m_App.LoopFrame(4);
                    break;
                }
                case 10: {
                    byte by2 = this.GetOperand();
                    this.m_strMess = this.m_cExeEvt.GetString(this.m_nPtr, by2);
                    this.m_nPtr += by2 * 2;
                    this.m_App.m_MessWin.SetMessage(this.m_strMess);
                    this.m_App.m_MessWin.WaitMessage();
                    break;
                }
                case 11: {
                    this.EvtCmd_Move();
                    break;
                }
                case 13: {
                    this.EvtCmd_SE();
                    break;
                }
                case 12: {
                    this.EvtCmd_Pos();
                    break;
                }
                case 14: {
                    this.EvtCmd_Jump();
                    break;
                }
                case 15: {
                    this.EvtCmd_If();
                    break;
                }
                case 16: {
                    this.EvtCmd_Ifn();
                    break;
                }
                case 17: {
                    this.EvtCmd_YesNo();
                    break;
                }
                case 18: {
                    this.EvtCmd_Shop("\u9053\u5177\u5c4b");
                    break;
                }
                case 19: {
                    this.EvtCmd_Shop("\u6b66\u5668\u5c4b");
                    break;
                }
                case 20: {
                    this.EvtCmd_Shop("\u52fe\u7389\u5c4b");
                    break;
                }
                case 21: {
                    this.EvtCmd_InShop();
                    break;
                }
                case 22: {
                    this.EvtCmd_Frame();
                    break;
                }
                case 23: {
                    byte by4 = this.GetOperand();
                    this.m_App.m_Fade.FadeIn(by4);
                    break;
                }
                case 24: {
                    byte by4 = this.GetOperand();
                    this.m_App.m_Fade.FadeOut(by4);
                    break;
                }
                case 25: {
                    byte by4 = this.GetOperand();
                    this.m_App.m_Fade.WhiteIn(by4);
                    break;
                }
                case 26: {
                    byte by4 = this.GetOperand();
                    this.m_App.m_Fade.WhiteOut(by4);
                    break;
                }
                case 27: {
                    this.EvtCmd_Heal();
                    break;
                }
                case 28: {
                    this.EvtCmd_AddGold();
                    break;
                }
                case 29: {
                    this.EvtCmd_SubGold();
                    break;
                }
                case 30: {
                    this.EvtCmd_MapModel();
                    break;
                }
                case 31: {
                    this.EvtCmd_MapHit();
                    break;
                }
                case 32: {
                    this.EvtCmd_ChrAlgo();
                    break;
                }
                case 33: {
                    this.EvtCmd_PassW();
                    break;
                }
                case 34: {
                    this.EvtCmd_CmpI();
                    break;
                }
                case 35: {
                    this.EvtCmd_Party();
                    break;
                }
                case 36: {
                    this.EvtCmd_Battle();
                    break;
                }
                case 37: {
                    this.m_App.m_Game.InReset();
                    break;
                }
                case 38: {
                    CCoinKing.Run();
                    break;
                }
                case 39: {
                    this.EvtCmd_PartyM();
                    break;
                }
                case 40: {
                    this.EvtCmd_Pat();
                    break;
                }
                case 41: {
                    this.EvtCmd_CmpP();
                    break;
                }
                case 42: {
                    this.EvtCmd_CamInit();
                    break;
                }
                case 43: {
                    this.EvtCmd_Scale();
                    break;
                }
                case 44: {
                    this.EvtCmd_CamChr();
                    break;
                }
                case 45: {
                    this.EvtCmd_Item();
                    break;
                }
                case 46: {
                    this.m_App.m_Game.m_nScEvX = -1;
                    this.m_App.m_Game.m_nScEvZ = -1;
                    break;
                }
                case 47: {
                    this.EvtCmd_Effect();
                    break;
                }
                case 48: {
                    this.EvtCmd_DispGold();
                    break;
                }
                case 49: {
                    this.EvtCmd_CmpH();
                    break;
                }
                case 50: {
                    this.EvtCmd_MapGround();
                    break;
                }
                case 51: {
                    this.EvtCmd_Shop("\u571f\u7523\u5c4b");
                    break;
                }
                case 52: {
                    this.EvtCmd_Quiz();
                    break;
                }
                case 53: {
                    this.EvtCmd_Battle2();
                    break;
                }
                case 54: {
                    this.EvtCmd_ChrMode();
                    break;
                }
                case 55: {
                    this.EvtCmd_Excl();
                    break;
                }
                case 56: {
                    this.EvtCmd_Area();
                    break;
                }
                case 57: {
                    this.EvtCmd_Call();
                    break;
                }
                case 58: {
                    this.EvtCmd_Return();
                    break;
                }
                case 59: {
                    this.EvtCmd_PosAdd();
                    break;
                }
                case 60: {
                    this.EvtCmd_IfCall();
                    break;
                }
                case 61: {
                    this.EvtCmd_IfnCall();
                    break;
                }
                case 62: {
                    this.EvtCmd_PosCopy();
                    break;
                }
                case 63: {
                    this.EvtCmd_PosY();
                    break;
                }
                case 64: {
                    this.EvtCmd_Quake();
                    break;
                }
                case 65: {
                    this.EvtCmd_ChrPrm();
                    break;
                }
                case 66: {
                    this.EvtCmd_AddItem();
                    break;
                }
                case 67: {
                    this.EvtCmd_IfRet();
                    break;
                }
                case 68: {
                    this.EvtCmd_IfnRet();
                    break;
                }
                case 69: {
                    this.EvtCmd_ChrMenu();
                    break;
                }
                case 70: {
                    this.EvtCmd_GetAbi();
                    break;
                }
                case 71: {
                    this.EvtCmd_SetAbi();
                    break;
                }
                case 72: {
                    this.EvtCmd_CShop();
                    break;
                }
                case 73: {
                    this.EvtCmd_Ambient();
                    break;
                }
                case 74: {
                    this.EvtCmd_Light();
                    break;
                }
                case 75: {
                    this.EvtCmd_Number();
                }
            }
        } while (!this.m_App.m_bGameOver);
        Vari.m_bExecEvent = false;
    }

    private void EvtCmd_MapGround() {
        byte by = this.GetOperand();
        byte by2 = this.GetOperand();
        byte by3 = this.GetOperand();
        this.m_App.m_NowStagePrm.SetMapGround(by, by2, by3);
    }

    private void EvtCmd_GetAbi() {
        byte by = this.GetOperand();
        int n = CFunc.Unsigned(this.GetOperand2());
        if (Vari.GetChrPrm((int)by).m_Abi.GetFlagM(n)) {
            this.m_App.m_Play.SetEvtFlag(300);
            return;
        }
        this.m_App.m_Play.ResetEvtFlag(300);
    }

    private void EvtCmd_IfnCall() {
        int n = this.GetOperandWord();
        int n2 = this.GetOperandWord();
        if (!this.m_App.m_Play.GetEvtFlag(n)) {
            this.PushStack(this.m_nEventNo);
            this.PushStack(this.m_nPtr);
            this.m_nEventNo = n2;
            this.m_cExeEvt = this.m_acEvtData[this.m_nEventNo];
            this.m_nPtr = 0;
        }
    }

    private void EvtCmd_Number() {
        int n = CFunc.Unsigned(this.GetOperand2());
        int n2 = CFunc.Unsigned(this.GetOperand2());
        int n3 = n2 - n + 1;
        int n4 = 0;
        do {
            this.m_App.m_Play.ResetEvtFlag(320 + n4);
        } while (++n4 < 10);
        CMenuWindow cMenuWindow = new CMenuWindow();
        cMenuWindow.Create(this.m_App, n3);
        cMenuWindow.SetFlag(8);
        int n5 = 0;
        while (n5 < n3) {
            cMenuWindow.SetMenuText(n5, Def.GetZenSujiCode(n5 + n));
            ++n5;
        }
        this.m_App.EntryWindow(cMenuWindow);
        cMenuWindow.OpenWindow(16, 16);
        this.m_App.LoopFrame(4);
        n5 = cMenuWindow.LoopFrame();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(cMenuWindow);
        this.m_App.m_Play.SetEvtFlag(320 + n5);
    }

    private void EvtCmd_Battle2() {
        int n = this.GetOperandWord();
        int n2 = this.m_App.m_Battle.Main(n, this.m_App.m_NowMapData.GetGround(this.m_App.m_Player.m_vPos) - 1, false);
        if (n2 == 2 && !this.m_App.m_Play.GetEvtFlag(309)) {
            this.m_App.m_bGameOver = true;
        }
        this.m_App.m_Play.ResetEvtFlag(309);
    }

    private void EvtCmd_PassW() {
        CSysYesNo cSysYesNo;
        int n;
        int n2 = this.GetOperandWord();
        int n3 = this.GetOperandWord();
        byte by = this.GetOperand();
        String string = this.m_App.m_Play.CreatePassWord(n2, n3, by);
        this.m_App.CreateOutputPass(string);
        boolean bl = this.m_App.WaitBtn_Display();
        this.m_App.ReleasePanel();
        if (!bl && (n = (cSysYesNo = new CSysYesNo()).Run(this.m_App, "\u3000\u3000\u30b2\u30fc\u30e0\u3092\u7d42\u4e86\u3057\u307e\u3059\u304b\uff1f\u3000\u3000")) == 0) {
            this.m_App.m_bGameOver = true;
        }
    }

    private void EvtCmd_Pat() {
        int n = CFunc.Unsigned(this.GetOperand());
        int n2 = CFunc.Unsigned(this.GetOperand());
        CChrWork cChrWork = Vari.GetChrWork(n);
        CChrPrm.Set(cChrWork, n2);
        if (n <= 2) {
            cChrWork.SetFlag(32);
        }
    }

    private void EvtCmd_IfnRet() {
        int n = this.GetOperandWord();
        if (!this.m_App.m_Play.GetEvtFlag(n)) {
            this.m_nPtr = this.PopStack();
            this.m_nEventNo = this.PopStack();
            this.m_cExeEvt = this.m_acEvtData[this.m_nEventNo];
        }
    }

    public void PushPrm() {
        this.m_nPushEventNo = this.m_nEventNo;
        this.m_nPushPtr = this.m_nPtr;
        this.m_nPushStackPtr = this.m_nStackPtr;
        this.m_cPushExeEvt = this.m_cExeEvt;
    }

    public void PopPrm() {
        this.m_nEventNo = this.m_nPushEventNo;
        this.m_nPtr = this.m_nPushPtr;
        this.m_nStackPtr = this.m_nPushStackPtr;
        this.m_cExeEvt = this.m_cPushExeEvt;
    }

    private void EvtCmd_Ifn() {
        int n = this.GetOperandWord();
        int n2 = this.GetOperandWord();
        if (!this.m_App.m_Play.GetEvtFlag(n)) {
            this.m_nEventNo = n2;
            this.m_cExeEvt = this.m_acEvtData[n2];
            this.m_nPtr = 0;
        }
    }

    private void EvtCmd_Return() {
        this.m_nPtr = this.PopStack();
        this.m_nEventNo = this.PopStack();
        this.m_cExeEvt = this.m_acEvtData[this.m_nEventNo];
    }

    private void EvtCmd_ChrAlgo() {
        CChrWork cChrWork = Vari.GetChrWork(this.GetOperand());
        cChrWork.m_nAlgo = this.GetOperand();
    }

    private void EvtCmd_ChrPrm() {
        byte by = this.GetOperand();
        byte by2 = this.GetOperand();
        int n = this.GetOperandWord();
        CChrWork cChrWork = Vari.GetChrWork(by);
        switch (by2) {
            case 0: {
                cChrWork.m_nMode = n;
                return;
            }
            case 1: {
                cChrWork.m_nCount = n;
                return;
            }
            case 2: {
                cChrWork.m_nAnim = n;
                return;
            }
        }
    }

    private void EvtCmd_SetCF() {
        byte by = this.GetOperand();
        int n = this.GetOperandWord();
        CChrWork cChrWork = Vari.GetChrWork(by);
        cChrWork.SetFlag(n);
    }

    private void EvtCmd_CmpI() {
        int n = this.GetOperandWord();
        byte by = this.GetOperand();
        this.SetCompareI(this.m_App.m_Play.GetItem(n) - by);
    }

    private void EvtCmd_SubGold() {
        this.m_App.m_Play.ResetEvtFlag(303);
        int n = this.GetOperandWord() * 10;
        if (n > this.m_App.m_Play.GetGold()) {
            this.m_App.m_Play.SetEvtFlag(303);
            return;
        }
        this.m_App.m_Play.AddGold(-n);
    }

    private void EvtCmd_InShop() {
        int n = this.GetOperandWord();
        CInShop cInShop = new CInShop();
        cInShop.Create(this.m_App, n);
        cInShop.Main();
    }

    private void EvtCmd_IfCall() {
        int n = this.GetOperandWord();
        int n2 = this.GetOperandWord();
        if (this.m_App.m_Play.GetEvtFlag(n)) {
            this.PushStack(this.m_nEventNo);
            this.PushStack(this.m_nPtr);
            this.m_nEventNo = n2;
            this.m_cExeEvt = this.m_acEvtData[this.m_nEventNo];
            this.m_nPtr = 0;
        }
    }

    private void EvtCmd_Effect() {
        byte by = this.GetOperand();
        byte by2 = this.GetOperand();
        int n = this.GetOperand();
        int n2 = this.GetOperandWord();
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.x = CMapData.GetXPos(by2);
        d3DXVECTOR3.z = CMapData.GetXPos(n);
        switch (by) {
            case 31: {
                Vari.MakeEffect(31, d3DXVECTOR3, 0.0f, 60.0f);
                return;
            }
            case 36: {
                Vari.MakeEffect(36, d3DXVECTOR3, 0.0f, 60.0f);
                return;
            }
            case 48: {
                Vari.MakeEffect(48, d3DXVECTOR3, Calc3D.DEGtoRAD(n2), 60.0f);
                return;
            }
            case 59: {
                d3DXVECTOR3.Set(Vari.GetChrWork((int)n2).m_vPos);
                d3DXVECTOR3.y = 100.0f;
                Vari.MakeEffect(59, d3DXVECTOR3, 0.0f, 0.0f);
                return;
            }
            case 60: {
                d3DXVECTOR3.Set(Vari.GetChrWork((int)n2).m_vPos);
                Vari.MakeEffect(60, d3DXVECTOR3, 0.0f, 0.0f);
                return;
            }
            case 106: {
                d3DXVECTOR3.Set(Vari.GetChrWork((int)by2).m_vPos);
                int n3 = 0;
                while (n3 < n) {
                    Vari.MakeEffect(106, d3DXVECTOR3, 0.0f, 0.0f);
                    ++n3;
                }
                return;
            }
        }
    }

    private void EvtCmd_Light() {
        int n = CFunc.Unsigned(this.GetOperand2());
        int n2 = CFunc.Unsigned(this.GetOperand2());
        int n3 = CFunc.Unsigned(this.GetOperand2());
        D3DXCOLOR d3DXCOLOR = new D3DXCOLOR(n, n2, n3);
        this.m_App.m_Render.SetLightDiffuse(d3DXCOLOR);
    }

    private void EvtCmd_CamInit() {
        this.m_App.m_Game.m_Flag.SetCameraVectAnm2((float)Math.PI);
    }

    private byte GetOperand2() {
        byte by = this.m_cExeEvt.Get(this.m_nPtr);
        ++this.m_nPtr;
        return by;
    }

    private void EvtCmd_PosAdd() {
        byte by = this.GetOperand();
        int n = CFunc.Word2Int(this.GetOperandWord());
        int n2 = CFunc.Word2Int(this.GetOperandWord());
        CChrWork cChrWork = Vari.GetChrWork(by);
        cChrWork.m_vPos.x += (float)n;
        cChrWork.m_vPos.z += (float)n2;
    }

    private void EvtCmd_Excl() {
        byte by = this.GetOperand();
        switch (by) {
            case 0: {
                this.m_App.m_Fade.FadeOut(10);
                CTitle.TextSc_00();
                this.m_App.m_Fade.FadeIn(10);
                return;
            }
            case 1: {
                Vari.SetSysFlag(1);
                CSkyHand.Exec(0);
                Vari.ResetSysFlag(1);
                return;
            }
            case 2: {
                this.m_App.m_Fade.FadeOut(10);
                CTitle.TextSc_01();
                this.m_App.m_Fade.FadeIn(10);
                return;
            }
            case 3: 
            case 6: {
                int n = 0;
                if (by == 6) {
                    n = 1;
                }
                CStaffRoll.Run(n);
                return;
            }
            case 4: {
                this.m_App.m_Fade.FadeOut(10);
                CTitle.TextSc_02();
                this.m_App.m_Fade.FadeIn(10);
                return;
            }
            case 5: {
                this.m_App.m_Fade.FadeOut(10);
                CTitle.TextSc_03();
                return;
            }
            case 7: {
                this.m_App.m_bGameOver = true;
                return;
            }
            case 8: {
                this.m_App.m_Fade.WhiteToBlack(20);
                return;
            }
        }
    }

    private void PushStack(int n) {
        this.m_anStack[this.m_nStackPtr] = n;
        ++this.m_nStackPtr;
        this.m_nStackPtr %= 64;
    }

    private int PopStack() {
        this.m_nStackPtr += -1;
        if (this.m_nStackPtr < 0) {
            this.m_nStackPtr += 64;
        }
        return this.m_anStack[this.m_nStackPtr];
    }

    private void EvtCmd_Ambient() {
        int n = CFunc.Unsigned(this.GetOperand2());
        int n2 = CFunc.Unsigned(this.GetOperand2());
        int n3 = CFunc.Unsigned(this.GetOperand2());
        D3DXCOLOR d3DXCOLOR = new D3DXCOLOR(n, n2, n3);
        this.m_App.m_Render.SetRenderState(8, d3DXCOLOR);
    }

    private void EvtCmd_YesNo() {
        CMenuWindow cMenuWindow = new CMenuWindow();
        cMenuWindow.Create(this.m_App, 2);
        cMenuWindow.SetFlag(8);
        cMenuWindow.SetMenuText(0, "\u306f\u3044");
        cMenuWindow.SetMenuText(1, "\u3044\u3044\u3048");
        this.m_App.EntryWindow(cMenuWindow);
        cMenuWindow.OpenWindow(16, 16);
        this.m_App.LoopFrame(4);
        int n = cMenuWindow.LoopFrame();
        this.m_App.LoopFrame(4);
        this.m_App.ReleaseWindow(cMenuWindow);
        if (n == 0) {
            this.m_App.m_Play.SetEvtFlag(300);
            return;
        }
        this.m_App.m_Play.ResetEvtFlag(300);
    }

    private void EvtCmd_CmpH() {
        byte by = this.GetOperand();
        byte by2 = this.GetOperand();
        this.m_App.m_Play.ResetEvtFlag(307);
        if (this.m_App.m_Game.CheckHitSquare(by, by2, null, 5.0f)) {
            this.m_App.m_Play.SetEvtFlag(307);
            return;
        }
    }

    private void EvtCmd_ChrMode() {
        byte by = this.GetOperand();
        byte by2 = this.GetOperand();
        CChrWork cChrWork = Vari.GetChrWork(by);
        if (by == 1 && by2 != 0 && this.m_App.m_Play.GetEvtFlag(2) && !this.m_App.m_Play.GetEvtFlag(252)) {
            return;
        }
        switch (by2) {
            case 0: {
                cChrWork.m_vRol.x = 0.0f;
                cChrWork.m_vPos.y = 0.0f;
                return;
            }
            case 1: {
                cChrWork.m_vRol.x = 1.5707964f;
                cChrWork.m_vPos.y = 50.0f;
                return;
            }
            case 2: {
                cChrWork.m_vRol.x = -1.5707964f;
                cChrWork.m_vPos.y = 50.0f;
                return;
            }
        }
    }

    public boolean Load(String string) {
        CFile cFile = new CFile();
        if (!cFile.Open(string)) {
            return false;
        }
        this.m_nMaxEventNum = cFile.ReadInt();
        int[] nArray = new int[this.m_nMaxEventNum + 1];
        int n = 0;
        while (n < this.m_nMaxEventNum + 1) {
            nArray[n] = cFile.ReadInt();
            ++n;
        }
        this.m_acEvtData = new CEventData[this.m_nMaxEventNum];
        int n2 = 0;
        while (n2 < this.m_nMaxEventNum) {
            this.m_acEvtData[n2] = new CEventData();
            n = nArray[n2 + 1] - nArray[n2];
            this.m_acEvtData[n2].Load(n, cFile);
            if ((n2 + 1) % 200 == 0) {
                Vari.m_App.UpdateLoadCount();
            }
            ++n2;
        }
        cFile.Close();
        return true;
    }

    private void EvtCmd_IfRet() {
        int n = this.GetOperandWord();
        if (this.m_App.m_Play.GetEvtFlag(n)) {
            this.m_nPtr = this.PopStack();
            this.m_nEventNo = this.PopStack();
            this.m_cExeEvt = this.m_acEvtData[this.m_nEventNo];
        }
    }

    private void EvtCmd_CamChr() {
        Vari.SetCameraChr(this.GetOperand());
    }

    private void EvtCmd_AddItem() {
        int n = this.GetOperandWord();
        int n2 = this.GetOperandSigned();
        this.m_App.m_Play.AddItem(n, n2);
    }

    public void SetApplet(ARpg aRpg) {
        this.m_App = aRpg;
    }

    private void EvtCmd_Party() {
        byte by = this.GetOperand();
        byte by2 = this.GetOperand();
        ++this.m_App.m_Play.m_nPartyNum;
        CChrWork cChrWork = Vari.GetChrWork(by);
        cChrWork.SetFlag(1);
        cChrWork.SetFlag(32);
        if (by2 == 0) {
            this.m_App.m_Game.MakePartyTable();
            this.m_App.m_Game.MoveParty(true);
        }
        this.m_App.m_Game.MakePartyTable();
    }

    private void EvtCmd_ResetCF() {
        byte by = this.GetOperand();
        int n = this.GetOperandWord();
        CChrWork cChrWork = Vari.GetChrWork(by);
        cChrWork.ResetFlag(n);
    }

    private void EvtCmd_Battle() {
        int n = this.GetOperandWord();
        int n2 = this.m_App.m_Battle.Main(n, this.m_App.m_NowMapData.GetGround(this.m_App.m_Player.m_vPos) - 1, true);
        this.m_App.m_Play.ResetEvtFlag(303);
        if (n2 == 2) {
            if (!this.m_App.m_Play.GetEvtFlag(309)) {
                this.m_App.m_bGameOver = true;
            } else {
                this.m_App.m_Play.SetEvtFlag(303);
            }
        }
        this.m_App.m_Play.ResetEvtFlag(309);
    }

    private void EvtCmd_Scale() {
        byte by = this.GetOperand();
        CChrWork cChrWork = Vari.GetChrWork(by);
        byte by2 = this.GetOperand();
        float f = (float)this.GetOperandWord() / 100.0f;
        switch (by2) {
            case 0: {
                cChrWork.m_vScale.x = f;
                cChrWork.m_vScale.y = f;
                cChrWork.m_vScale.z = f;
                return;
            }
            case 1: {
                cChrWork.m_vScale.x = f;
                return;
            }
            case 2: {
                cChrWork.m_vScale.y = f;
                return;
            }
            case 3: {
                cChrWork.m_vScale.z = f;
                return;
            }
        }
    }

    private void EvtCmd_If() {
        int n = this.GetOperandWord();
        int n2 = this.GetOperandWord();
        if (this.m_App.m_Play.GetEvtFlag(n)) {
            this.m_nEventNo = n2;
            this.m_cExeEvt = this.m_acEvtData[n2];
            this.m_nPtr = 0;
        }
    }

    private void SetCompareI(int n) {
        this.m_App.m_Play.ResetEvtFlag(304);
        this.m_App.m_Play.ResetEvtFlag(305);
        this.m_App.m_Play.ResetEvtFlag(306);
        if (n == 0) {
            this.m_App.m_Play.SetEvtFlag(304);
        }
        if (n < 0) {
            this.m_App.m_Play.SetEvtFlag(305);
        }
        if (n >= 0) {
            this.m_App.m_Play.SetEvtFlag(306);
        }
    }

    private void EvtCmd_Quake() {
        Vari.m_nQuake = this.GetOperand();
    }

    private void EvtCmd_Quiz() {
        byte by = this.GetOperand();
        CQuiz cQuiz = new CQuiz();
        cQuiz.Run(by);
    }

    private void EvtCmd_MapModel() {
        byte by = this.GetOperand();
        byte by2 = this.GetOperand();
        int n = CFunc.Unsigned(this.GetOperand());
        this.m_App.m_NowStagePrm.SetMapModel(by, by2, n);
    }

    private byte GetOperand() {
        byte by = this.m_cExeEvt.Get(this.m_nPtr);
        ++this.m_nPtr;
        if (by == 99) {
            by = this.m_byEventChr;
        }
        return by;
    }

    private int GetOperandSigned() {
        byte by = this.m_cExeEvt.Get(this.m_nPtr);
        ++this.m_nPtr;
        return CFunc.Byte2Int(by);
    }

    private int GetOperandShort() {
        byte by = this.m_cExeEvt.Get(this.m_nPtr);
        ++this.m_nPtr;
        byte by2 = this.m_cExeEvt.Get(this.m_nPtr);
        ++this.m_nPtr;
        short s = (short)CFunc.Byte2Int(by, by2);
        return s;
    }

    private void EvtCmd_PosY() {
        byte by = this.GetOperand();
        int n = this.GetOperandShort();
        Vari.GetChrWork((int)by).m_vPos.y = n;
    }

    private void EvtCmd_ChrMenu() {
        this.m_App.m_Play.ResetEvtFlag(303);
        this.m_App.m_Play.ResetEvtFlag(312);
        this.m_App.m_Play.ResetEvtFlag(313);
        this.m_App.m_Play.ResetEvtFlag(314);
        CChrSelect cChrSelect = new CChrSelect();
        cChrSelect.Create(this.m_App, 16, 16);
        int n = cChrSelect.Run();
        switch (n) {
            case 0: {
                this.m_App.m_Play.SetEvtFlag(312);
                break;
            }
            case 1: {
                this.m_App.m_Play.SetEvtFlag(313);
                break;
            }
            case 2: {
                this.m_App.m_Play.SetEvtFlag(314);
                break;
            }
            default: {
                this.m_App.m_Play.SetEvtFlag(303);
            }
        }
        cChrSelect.Close();
    }

    private void EvtCmd_SetAbi() {
        byte by = this.GetOperand();
        int n = CFunc.Unsigned(this.GetOperand2());
        Vari.GetChrPrm((int)by).m_Abi.SetFlagM(n);
    }

    private void EvtCmd_Item() {
        int n = this.GetOperandWord();
        this.m_App.GetItemMess(n);
    }

    private void EvtCmd_Pos() {
        byte by = this.GetOperand();
        byte by2 = this.GetOperand();
        byte by3 = this.GetOperand();
        CChrWork cChrWork = Vari.GetChrWork(by);
        if (by2 != -1) {
            cChrWork.m_vPos.x = CMapData.GetXPos(by2);
        }
        if (by3 != -1) {
            cChrWork.m_vPos.z = CMapData.GetZPos(by3);
        }
        cChrWork.m_vPos.y = 0.0f;
        if (by == 0) {
            this.m_App.m_Game.InitParty();
        }
        if (cChrWork.m_nEvent == -2) {
            cChrWork.m_nMode = 0;
        }
    }

    private void EvtCmd_Jump() {
        this.m_nEventNo = this.GetOperandWord();
        this.m_cExeEvt = this.m_acEvtData[this.m_nEventNo];
        this.m_nPtr = 0;
    }

    private void EvtCmd_Move() {
        CChrWork cChrWork = Vari.GetChrWork(this.GetOperand());
        cChrWork.m_fEvtSpeed = this.GetOperand();
        cChrWork.m_nEvtAlgo = this.GetOperand();
        cChrWork.m_nEvtMove = this.GetOperand();
    }

    private int GetOperandWord() {
        byte by = this.m_cExeEvt.Get(this.m_nPtr);
        ++this.m_nPtr;
        byte by2 = this.m_cExeEvt.Get(this.m_nPtr);
        ++this.m_nPtr;
        return CFunc.Byte2Int(by, by2);
    }

    private void EvtCmd_SE() {
        byte by = this.GetOperand();
        this.m_App.PlaySeG(by);
    }

    private void EvtCmd_Heal() {
        byte by = this.GetOperand();
        if (by == -1) {
            this.m_App.m_Play.HealAll();
            return;
        }
        CChrParam cChrParam = Vari.GetChrPrm(by);
        cChrParam.AddHP(9999);
        cChrParam.AddMP(9999);
    }

    private void EvtCmd_PartyM() {
        byte by = this.GetOperand();
        if (by == 1) {
            this.m_App.m_Play.m_nPartyNum = 1;
        } else if (by == 2) {
            this.m_App.m_Play.m_nPartyNum = 1;
        }
        this.m_App.m_Game.MakePartyTable();
    }

    private void EvtCmd_PosCopy() {
        byte by = this.GetOperand();
        byte by2 = this.GetOperand();
        CChrWork cChrWork = Vari.GetChrWork(by);
        CChrWork cChrWork2 = Vari.GetChrWork(by2);
        cChrWork2.m_vPos.Set(cChrWork.m_vPos);
    }
}

