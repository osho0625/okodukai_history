/*
 * Decompiled with CFR 0.152.
 */
class CBattleEnemy {
    public static CAction Algo_075(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        ++cBattleWork.m_nCount;
        switch (cBattleWork.m_nCount) {
            case 1: 
            case 5: {
                cAction.m_nAlgo = 33;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 3: {
                cAction.m_nAlgo = 80;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 6: {
                int n2 = CBattleEnemy.SelectDeadEnemy1(cBattleWork);
                if (n2 != -1) {
                    cAction.m_nAlgo = 59;
                    cAction.m_nObj = n2;
                } else {
                    cAction.m_nAlgo = 80;
                    cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                }
                cBattleWork.m_nCount = 0;
                break;
            }
            default: {
                if (n < 250) {
                    cAction.m_nAlgo = 71;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                if (n < 500) {
                    cAction.m_nAlgo = 74;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 77;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            }
        }
        return cAction;
    }

    public static CAction Algo_006(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(100);
        if (n < 40) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 71;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static CAction Algo_029(CBattleWork cBattleWork) {
        ++cBattleWork.m_nCount;
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        switch (cBattleWork.m_nCount) {
            case 1: {
                cAction.m_nAlgo = 144;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 2: 
            case 3: {
                cAction.m_nAlgo = 79;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 4: {
                cAction.m_nAlgo = 145;
                cAction.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
                break;
            }
            case 5: 
            case 6: {
                if (n < 333) {
                    cAction.m_nAlgo = 68;
                    cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                    break;
                }
                if (n < 666) {
                    cAction.m_nAlgo = 74;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 77;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 7: {
                cAction.m_nAlgo = 146;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                cBattleWork.m_nCount = 0;
            }
        }
        return cAction;
    }

    public static CAction Algo_077(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 350) {
            cAction.m_nAlgo = 176;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 600) {
            cAction.m_nAlgo = 77;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            return CBattleEnemy.Algo_001(cBattleWork);
        }
        return cAction;
    }

    public static int SelectHPEnemy1(CBattleWork cBattleWork) {
        if (cBattleWork.m_Prm.GetConf() > 0) {
            return CBattleEnemy.SelectAll1();
        }
        int n = cBattleWork.m_nWorkNo;
        int n2 = 200;
        int n3 = 3;
        do {
            int n4;
            CBattleWork cBattleWork2;
            if (!(cBattleWork2 = Vari.GetBChrWork(n3)).IsAlive() || n2 <= (n4 = cBattleWork2.m_Prm.GetHP() * 100 / cBattleWork2.m_Prm.GetMaxHP())) continue;
            n = n3;
            n2 = n4;
        } while (++n3 < 9);
        return n;
    }

    public static int SelectMPEnemy1(CBattleWork cBattleWork) {
        if (cBattleWork.m_Prm.GetConf() > 0) {
            if (Calc3D.Rand(100) >= 50) {
                return CBattleEnemy.SelectAll1();
            }
            return -1;
        }
        int n = -1;
        int n2 = 50;
        int n3 = 3;
        do {
            int n4;
            CBattleWork cBattleWork2;
            if (!(cBattleWork2 = Vari.GetBChrWork(n3)).IsAlive() || cBattleWork.m_nWorkNo == cBattleWork2.m_nWorkNo || n2 <= (n4 = cBattleWork2.m_Prm.GetMP() * 100 / cBattleWork2.m_Prm.GetMaxMP())) continue;
            n = n3;
            n2 = n4;
        } while (++n3 < 9);
        return n;
    }

    public static CAction Algo_002(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(100);
        if (n < 33) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 68;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static int SelectDeadEnemy1(CBattleWork cBattleWork) {
        if (cBattleWork.m_Prm.GetConf() > 0) {
            if (Calc3D.Rand(100) > 35) {
                return -1;
            }
            return CBattleEnemy.SelectAll1();
        }
        int n = 6;
        int[] nArray = new int[n];
        int n2 = 0;
        while (n2 < n) {
            nArray[n2] = 3 + n2;
            ++n2;
        }
        int n3 = 0;
        do {
            n2 = Calc3D.Rand(n);
            int n4 = Calc3D.Rand(n);
            int n5 = nArray[n2];
            nArray[n2] = nArray[n4];
            nArray[n4] = n5;
        } while (++n3 < 64);
        int n6 = 0;
        while (n6 < n) {
            n3 = nArray[n6];
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n3);
            if (cBattleWork2.IsDead()) {
                return n3;
            }
            ++n6;
        }
        return -1;
    }

    public static CAction Algo_030(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = CBattleEnemy.SelectDeadEnemy1(cBattleWork);
        if (n == -1) {
            cAction.m_nAlgo = 147;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            cAction.m_nAlgo = 55;
            cAction.m_nObj = n;
        }
        return cAction;
    }

    public static CAction Decide(CBattleWork cBattleWork) {
        switch (cBattleWork.m_Prm.m_nAlgo) {
            case 1: {
                return CBattleEnemy.Algo_001(cBattleWork);
            }
            case 2: {
                return CBattleEnemy.Algo_002(cBattleWork);
            }
            case 3: {
                return CBattleEnemy.Algo_003(cBattleWork);
            }
            case 4: {
                return CBattleEnemy.Algo_004(cBattleWork);
            }
            case 5: {
                return CBattleEnemy.Algo_005(cBattleWork);
            }
            case 6: {
                return CBattleEnemy.Algo_006(cBattleWork);
            }
            case 7: {
                return CBattleEnemy.Algo_007(cBattleWork);
            }
            case 8: {
                return CBattleEnemy.Algo_008(cBattleWork);
            }
            case 9: {
                return CBattleEnemy.Algo_009(cBattleWork);
            }
            case 10: {
                return CBattleEnemy.Algo_010(cBattleWork);
            }
            case 11: {
                return CBattleEnemy.Algo_011(cBattleWork);
            }
            case 12: {
                return CBattleEnemy.Algo_012(cBattleWork);
            }
            case 13: {
                return CBattleEnemy.Algo_013(cBattleWork);
            }
            case 14: {
                return CBattleEnemy.Algo_014(cBattleWork);
            }
            case 15: {
                return CBattleEnemy.Algo_015(cBattleWork);
            }
            case 16: {
                return CBattleEnemy.Algo_016(cBattleWork);
            }
            case 17: {
                return CBattleEnemy.Algo_017(cBattleWork);
            }
            case 18: {
                return CBattleEnemy.Algo_018(cBattleWork);
            }
            case 19: {
                return CBattleEnemy.Algo_019(cBattleWork);
            }
            case 20: {
                return CBattleEnemy.Algo_020(cBattleWork);
            }
            case 21: {
                return CBattleEnemy.Algo_021(cBattleWork);
            }
            case 22: {
                return CBattleEnemy.Algo_022(cBattleWork);
            }
            case 23: {
                return CBattleEnemy.Algo_023(cBattleWork);
            }
            case 24: {
                return CBattleEnemy.Algo_024(cBattleWork);
            }
            case 25: {
                return CBattleEnemy.Algo_025(cBattleWork);
            }
            case 26: {
                return CBattleEnemy.Algo_026(cBattleWork);
            }
            case 27: {
                return CBattleEnemy.Algo_027(cBattleWork);
            }
            case 28: {
                return CBattleEnemy.Algo_028(cBattleWork);
            }
            case 29: {
                return CBattleEnemy.Algo_029(cBattleWork);
            }
            case 30: {
                return CBattleEnemy.Algo_030(cBattleWork);
            }
            case 31: {
                return CBattleEnemy.Algo_031(cBattleWork);
            }
            case 32: {
                return CBattleEnemy.Algo_032(cBattleWork);
            }
            case 33: {
                return CBattleEnemy.Algo_033(cBattleWork);
            }
            case 34: {
                return CBattleEnemy.Algo_034(cBattleWork);
            }
            case 35: {
                return CBattleEnemy.Algo_035(cBattleWork);
            }
            case 36: {
                return CBattleEnemy.Algo_036(cBattleWork);
            }
            case 37: {
                return CBattleEnemy.Algo_037(cBattleWork);
            }
            case 38: {
                return CBattleEnemy.Algo_038(cBattleWork);
            }
            case 39: {
                return CBattleEnemy.Algo_039(cBattleWork);
            }
            case 40: {
                return CBattleEnemy.Algo_040(cBattleWork);
            }
            case 41: {
                return CBattleEnemy.Algo_041(cBattleWork);
            }
            case 42: {
                return CBattleEnemy.Algo_042(cBattleWork);
            }
            case 43: {
                return CBattleEnemy.Algo_043(cBattleWork);
            }
            case 44: {
                return CBattleEnemy.Algo_044(cBattleWork);
            }
            case 45: {
                return CBattleEnemy.Algo_045(cBattleWork);
            }
            case 46: {
                return CBattleEnemy.Algo_046(cBattleWork);
            }
            case 47: {
                return CBattleEnemy.Algo_047(cBattleWork);
            }
            case 48: {
                return CBattleEnemy.Algo_048(cBattleWork);
            }
            case 49: {
                return CBattleEnemy.Algo_049(cBattleWork);
            }
            case 50: {
                return CBattleEnemy.Algo_050(cBattleWork);
            }
            case 51: {
                return CBattleEnemy.Algo_051(cBattleWork);
            }
            case 52: {
                return CBattleEnemy.Algo_052(cBattleWork);
            }
            case 53: {
                return CBattleEnemy.Algo_053(cBattleWork);
            }
            case 54: {
                return CBattleEnemy.Algo_054(cBattleWork);
            }
            case 55: {
                return CBattleEnemy.Algo_055(cBattleWork);
            }
            case 56: {
                return CBattleEnemy.Algo_056(cBattleWork);
            }
            case 57: {
                return CBattleEnemy.Algo_057(cBattleWork);
            }
            case 58: {
                return CBattleEnemy.Algo_058(cBattleWork);
            }
            case 59: {
                return CBattleEnemy.Algo_059(cBattleWork);
            }
            case 60: {
                return CBattleEnemy.Algo_060(cBattleWork);
            }
            case 61: {
                return CBattleEnemy.Algo_061(cBattleWork);
            }
            case 62: {
                return CBattleEnemy.Algo_062(cBattleWork);
            }
            case 63: {
                return CBattleEnemy.Algo_063(cBattleWork);
            }
            case 64: {
                return CBattleEnemy.Algo_064(cBattleWork);
            }
            case 65: {
                return CBattleEnemy.Algo_065(cBattleWork);
            }
            case 66: {
                return CBattleEnemy.Algo_066(cBattleWork);
            }
            case 67: {
                return CBattleEnemy.Algo_067(cBattleWork);
            }
            case 68: {
                return CBattleEnemy.Algo_068(cBattleWork);
            }
            case 69: {
                return CBattleEnemy.Algo_069(cBattleWork);
            }
            case 70: {
                return CBattleEnemy.Algo_070(cBattleWork);
            }
            case 71: {
                return CBattleEnemy.Algo_071(cBattleWork);
            }
            case 72: {
                return CBattleEnemy.Algo_072(cBattleWork);
            }
            case 73: {
                return CBattleEnemy.Algo_073(cBattleWork);
            }
            case 74: {
                return CBattleEnemy.Algo_074(cBattleWork);
            }
            case 75: {
                return CBattleEnemy.Algo_075(cBattleWork);
            }
            case 76: {
                return CBattleEnemy.Algo_076(cBattleWork);
            }
            case 77: {
                return CBattleEnemy.Algo_077(cBattleWork);
            }
            case 78: {
                return CBattleEnemy.Algo_078(cBattleWork);
            }
            case 79: {
                return CBattleEnemy.Algo_079(cBattleWork);
            }
            case 80: {
                return CBattleEnemy.Algo_080(cBattleWork);
            }
            case 81: {
                return CBattleEnemy.Algo_081(cBattleWork);
            }
            case 82: {
                return CBattleEnemy.Algo_082(cBattleWork);
            }
            case 83: {
                return CBattleEnemy.Algo_083(cBattleWork);
            }
            case 84: {
                return CBattleEnemy.Algo_084(cBattleWork);
            }
            case 85: {
                return CBattleEnemy.Algo_085(cBattleWork);
            }
            case 86: {
                return CBattleEnemy.Algo_086(cBattleWork);
            }
            case 87: {
                return CBattleEnemy.Algo_087(cBattleWork);
            }
            case 88: {
                return CBattleEnemy.Algo_088(cBattleWork);
            }
            case 89: {
                return CBattleEnemy.Algo_089(cBattleWork);
            }
            case 90: {
                return CBattleEnemy.Algo_090(cBattleWork);
            }
            case 91: {
                return CBattleEnemy.Algo_091(cBattleWork);
            }
            case 92: {
                return CBattleEnemy.Algo_092(cBattleWork);
            }
            case 93: {
                return CBattleEnemy.Algo_093(cBattleWork);
            }
            case 94: {
                return CBattleEnemy.Algo_094(cBattleWork);
            }
            case 95: {
                return CBattleEnemy.Algo_095(cBattleWork);
            }
            case 96: {
                return CBattleEnemy.Algo_096(cBattleWork);
            }
            case 97: {
                return CBattleEnemy.Algo_097(cBattleWork);
            }
            case 98: {
                return CBattleEnemy.Algo_098(cBattleWork);
            }
            case 99: {
                return CBattleEnemy.Algo_099(cBattleWork);
            }
            case 100: {
                return CBattleEnemy.Algo_100(cBattleWork);
            }
            case 101: {
                return CBattleEnemy.Algo_101(cBattleWork);
            }
            case 102: {
                return CBattleEnemy.Algo_102(cBattleWork);
            }
            case 103: {
                return CBattleEnemy.Algo_103(cBattleWork);
            }
            case 104: {
                return CBattleEnemy.Algo_104(cBattleWork);
            }
            case 105: {
                return CBattleEnemy.Algo_105(cBattleWork);
            }
            case 106: {
                return CBattleEnemy.Algo_106(cBattleWork);
            }
            case 107: {
                return CBattleEnemy.Algo_107(cBattleWork);
            }
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static boolean Algo12_CheckAllStore() {
        int n = CBattleActCalc.GetGroupStart(3);
        int n2 = CBattleActCalc.GetGroupEnd(3);
        int n3 = n;
        while (n3 < n2) {
            CBattleWork cBattleWork = Vari.GetBChrWork(n3);
            if (cBattleWork.IsAlive() && cBattleWork.m_nCount < 3) {
                return false;
            }
            ++n3;
        }
        return true;
    }

    public static int SelectAll1() {
        return CBattleEnemy.SelectChr(0, 9);
    }

    public static CAction Algo_009(CBattleWork cBattleWork) {
        ++cBattleWork.m_nCount;
        CAction cAction = new CAction();
        switch (cBattleWork.m_nCount) {
            case 1: {
                cAction.m_nAlgo = 134;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 2: 
            case 4: {
                return CBattleEnemy.Algo_001(cBattleWork);
            }
            case 3: {
                cAction.m_nAlgo = 70;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 5: {
                cAction.m_nAlgo = 76;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 6: {
                cBattleWork.m_nCount = 0;
                return CBattleEnemy.Algo_001(cBattleWork);
            }
        }
        return cAction;
    }

    public static CAction Algo_051(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 500) {
            cAction.m_nAlgo = 57;
            cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 58;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_074(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 250) {
            cAction.m_nAlgo = 44;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 500) {
            cAction.m_nAlgo = 43;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 750) {
            cAction.m_nAlgo = 47;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            return CBattleEnemy.Algo_001(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_096(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 250) {
            cAction.m_nAlgo = 194;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 500) {
            cAction.m_nAlgo = 188;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 750) {
            cAction.m_nAlgo = 189;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            cAction.m_nAlgo = 190;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_023(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 250) {
            cAction.m_nAlgo = 50;
            cAction.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
        } else if (n < 500) {
            cAction.m_nAlgo = 39;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 750) {
            cAction.m_nAlgo = 45;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            return CBattleEnemy.Algo_001(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_035(CBattleWork cBattleWork) {
        ++cBattleWork.m_nCount;
        CAction cAction = new CAction();
        switch (cBattleWork.m_nCount) {
            case 1: {
                cAction.m_nAlgo = 64;
                cAction.m_nObj = cBattleWork.m_nWorkNo;
                break;
            }
            case 2: {
                if (Calc3D.Rand(1000) < 500) {
                    cAction.m_nAlgo = 76;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 142;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 3: 
            case 4: {
                cAction.m_nAlgo = 148;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 5: {
                if (Calc3D.Rand(1000) < 500) {
                    cAction.m_nAlgo = 74;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 134;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 6: {
                if (Calc3D.Rand(1000) < 500) {
                    cAction.m_nAlgo = 21;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                } else {
                    cAction.m_nAlgo = 75;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                }
                cBattleWork.m_nCount = 1;
            }
        }
        return cAction;
    }

    public static CAction Algo_092(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        ++cBattleWork.m_nCount;
        switch (cBattleWork.m_nCount) {
            case 4: {
                cAction.m_nAlgo = 177;
                break;
            }
            case 5: {
                cAction.m_nAlgo = 61;
                cAction.m_nObj = cBattleWork.m_nWorkNo;
                break;
            }
            case 6: {
                cAction.m_nAlgo = 144;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 7: {
                cAction.m_nAlgo = 79;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 8: {
                cAction.m_nAlgo = 178;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 9: {
                cAction.m_nAlgo = 50;
                cAction.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
                cBattleWork.m_nCount = 0;
                break;
            }
            default: {
                if (n < 250) {
                    cAction.m_nAlgo = 146;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                if (n < 500) {
                    cAction.m_nAlgo = 176;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                if (n < 750) {
                    cAction.m_nAlgo = 179;
                    cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 79;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            }
        }
        return cAction;
    }

    public static CAction Algo_037(CBattleWork cBattleWork) {
        int n;
        int n2 = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if ((n2 & 3) != 0 && (n = CBattleEnemy.SelectMPEnemy1(cBattleWork)) != -1) {
            cAction.m_nAlgo = 150;
            cAction.m_nObj = n;
            return cAction;
        }
        if (n2 < 333) {
            cAction.m_nAlgo = 47;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            return cAction;
        }
        if (n2 < 666) {
            cAction.m_nAlgo = 71;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static CAction Algo_016(CBattleWork cBattleWork) {
        ++cBattleWork.m_nCount;
        CAction cAction = new CAction();
        if (cBattleWork.m_nWorkNo == 3) {
            if (cBattleWork.m_nCount == 1) {
                cAction.m_nAlgo = 75;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            } else {
                cAction.m_nAlgo = 39;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            }
        } else if (cBattleWork.m_nCount == 1) {
            cAction.m_nAlgo = 39;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            cAction.m_nAlgo = 75;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        }
        if (cBattleWork.m_nCount == 3) {
            cAction.m_nAlgo = 69;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            cBattleWork.m_nCount = 0;
        }
        return cAction;
    }

    public static CAction Algo_003(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(100);
        if (n < 45) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 69;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static boolean Algo62_Mimi(CBattleWork cBattleWork) {
        int n = Vari.m_ActOld.m_nAlgo;
        if (n == 1001 || n == 1002 || n == 1003 || n == 2003 || n == 1004 || n == 16 || n == 51 || n == 56 || n == 163 || n == 61) {
            return false;
        }
        if ((n == 2006 || n == 55 || n == 59) && CBattleEnemy.SelectDeadEnemy1(cBattleWork) == -1) {
            return false;
        }
        if (n == 2001 || n == 2002 || n == 17 || n == 50 || n == 57 || n == 72) {
            int n2 = CBattleEnemy.SelectHPEnemy1(cBattleWork);
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n2);
            if (cBattleWork2.m_Prm.GetHP() * 100 / cBattleWork2.m_Prm.GetMaxHP() > 95) {
                return false;
            }
        }
        return true;
    }

    public static CAction Algo_099(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        ++cBattleWork.m_nCount;
        switch (cBattleWork.m_nCount) {
            case 3: {
                cBattleWork.m_nCount = 0;
                cAction.m_nAlgo = 197;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            default: {
                if (n < 333) {
                    cAction.m_nAlgo = 151;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                if (n < 666) {
                    cAction.m_nAlgo = 71;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 158;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            }
        }
        return cAction;
    }

    public static CAction Algo_012(CBattleWork cBattleWork) {
        ++cBattleWork.m_nCount;
        CAction cAction = new CAction();
        switch (cBattleWork.m_nCount) {
            case 1: 
            case 2: {
                if (cBattleWork.m_nWorkNo == 3) {
                    cAction.m_nAlgo = 39;
                    cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                    break;
                }
                if (cBattleWork.m_nWorkNo == 4) {
                    cAction.m_nAlgo = 72;
                    cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
                    break;
                }
                if (cBattleWork.m_nWorkNo == 5) {
                    cAction.m_nAlgo = 70;
                    cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                    break;
                }
                if (cBattleWork.m_nWorkNo == 6) {
                    cAction.m_nAlgo = 50;
                    cAction.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
                    break;
                }
                if (cBattleWork.m_nWorkNo != 7) break;
                cAction.m_nAlgo = 73;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 3: {
                cAction.m_nAlgo = 135;
                cAction.m_nObj = cBattleWork.m_nWorkNo;
                break;
            }
            default: {
                if (CBattleEnemy.Algo12_CheckAllStore()) {
                    cAction.m_nAlgo = 136;
                    cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 135;
                cAction.m_nObj = cBattleWork.m_nWorkNo;
            }
        }
        return cAction;
    }

    public static CAction Algo_048(CBattleWork cBattleWork) {
        CBattleWork cBattleWork2;
        ++cBattleWork.m_nCount;
        cBattleWork.m_nCount &= 7;
        CAction cAction = new CAction();
        if (cBattleWork.m_Prm.GetHP() <= 85000 && !Vari.m_App.m_Play.GetEvtFlag(401) && CBattleFunc.CanEventChr(cBattleWork2 = Vari.GetBChrWork(1))) {
            cBattleWork.m_Chr.ResetFlag(2);
            Vari.m_Event.PushPrm();
            Vari.m_Event.Run(1308, -1);
            Vari.m_Event.PopPrm();
            cBattleWork2.m_Prm.m_Abi.SetFlagM(81);
            CAction cAction2 = new CAction();
            cAction2.m_nAlgo = 81;
            cAction2.m_nObj = 3;
            CSkillData cSkillData = Vari.GetSkillData(cAction2.m_nAlgo);
            Vari.m_App.m_Battle.m_SkillWin.OpenWindow(cSkillData.m_strName);
            CBattleAction.Algo_063(cBattleWork2, cAction2);
            return null;
        }
        if (cBattleWork.m_Prm.GetHP() <= 70000 && !Vari.m_App.m_Play.GetEvtFlag(402) && CBattleFunc.CanEventChr(cBattleWork2 = Vari.GetBChrWork(2))) {
            cBattleWork.m_Chr.ResetFlag(2);
            Vari.m_Event.PushPrm();
            Vari.m_Event.Run(1307, -1);
            Vari.m_Event.PopPrm();
            cBattleWork2.m_Prm.m_Abi.SetFlagM(61);
            CAction cAction3 = new CAction();
            cAction3.m_nAlgo = 61;
            cAction3.m_nObj = 2;
            CSkillData cSkillData = Vari.GetSkillData(cAction3.m_nAlgo);
            Vari.m_App.m_Battle.m_SkillWin.OpenWindow(cSkillData.m_strName);
            CBattleAction.Algo_041(cBattleWork2, cAction3);
            return null;
        }
        if (cBattleWork.m_Prm.GetHP() <= 55000 && !Vari.m_App.m_Play.GetEvtFlag(400) && CBattleFunc.CanEventChr(cBattleWork2 = Vari.GetBChrWork(0))) {
            Vari.m_App.m_Render.SetWhite(1.0f);
            Vari.m_App.m_Battle.LoopFrame(1);
            Vari.m_App.m_Render.SetWhite(0.0f);
            Vari.m_App.m_Battle.LoopFrame(10);
            Vari.m_App.m_Render.SetWhite(1.0f);
            Vari.m_App.m_Battle.LoopFrame(1);
            cBattleWork.m_Chr.m_nChrH = 105;
            Vari.m_App.m_Render.SetWhite(0.0f);
            Vari.m_App.m_Battle.LoopFrame(10);
            cBattleWork.m_Chr.ResetFlag(2);
            Vari.m_Event.PushPrm();
            Vari.m_Event.Run(1309, -1);
            Vari.m_Event.PopPrm();
            cBattleWork2.m_Prm.m_Abi.SetFlagM(67);
            CAction cAction4 = new CAction();
            cAction4.m_nAlgo = 67;
            cAction4.m_nObj = 102;
            CSkillData cSkillData = Vari.GetSkillData(cAction4.m_nAlgo);
            Vari.m_App.m_Battle.m_SkillWin.OpenWindow(cSkillData.m_strName);
            CBattleAction.Algo_047(cBattleWork2, cAction4);
            cBattleWork.m_Prm.m_Abi.ResetFlagM(156);
            cBattleWork.m_Prm.SetAgi_Btl(15);
            cBattleWork.m_nCount = 0;
            return null;
        }
        if (Vari.m_App.m_Play.GetEvtFlag(400)) {
            switch (cBattleWork.m_nCount) {
                case 1: {
                    cAction.m_nAlgo = 64;
                    cAction.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
                    break;
                }
                case 2: 
                case 6: {
                    cAction.m_nAlgo = 152;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                case 5: {
                    cAction.m_nAlgo = 145;
                    cAction.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
                    break;
                }
                default: {
                    cAction.m_nAlgo = 80;
                    cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                }
            }
            return cAction;
        }
        if (cBattleWork.m_nCount == 5) {
            cAction.m_nAlgo = 145;
            cAction.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
            return cAction;
        }
        if (cBattleWork.m_nCount == 2) {
            cAction.m_nAlgo = 74;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            return cAction;
        }
        int n = Calc3D.Rand(1000);
        if (n < 333) {
            cAction.m_nAlgo = 78;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 79;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            cAction.m_nAlgo = 152;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_100(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        ++cBattleWork.m_nCount;
        if (cBattleWork.GetAura() > 0) {
            if (n < 333) {
                cAction.m_nAlgo = 185;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            } else if (n < 666) {
                cAction.m_nAlgo = 152;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            } else {
                cAction.m_nAlgo = 36;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            }
            return cAction;
        }
        if (cBattleWork.m_nCount >= Calc3D.Rand(4) + 4 || cBattleWork.m_nCount >= 3 && CBattleEnemy.SelectStatusEnemy1(cBattleWork, 5) != -1) {
            cAction.m_nAlgo = 25;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            cBattleWork.m_nCount = -2;
            return cAction;
        }
        if ((n & 1) == 0 && CBattleEnemy.SelectHPEnemyCount(cBattleWork, 40) > 0) {
            cAction.m_nAlgo = 50;
            cAction.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
            return cAction;
        }
        if (n < 333) {
            cAction.m_nAlgo = 36;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 185;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 148;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_071(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 333) {
            cAction.m_nAlgo = 155;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 72;
            cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 31;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_019(CBattleWork cBattleWork) {
        ++cBattleWork.m_nCount;
        CAction cAction = new CAction();
        switch (cBattleWork.m_nCount) {
            case 1: {
                cAction.m_nAlgo = 52;
                cAction.m_nObj = CBattleEnemy.SelectEnemy1(cBattleWork);
                break;
            }
            case 2: 
            case 7: {
                cAction.m_nAlgo = 77;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 3: 
            case 8: {
                cAction.m_nAlgo = 42;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            default: {
                cAction.m_nAlgo = 39;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                if (cBattleWork.m_nCount != 9) break;
                cBattleWork.m_nCount = 0;
                break;
            }
            case 4: {
                cAction.m_nAlgo = 50;
                cAction.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
            }
        }
        return cAction;
    }

    public static CAction Algo_034(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 333) {
            cAction.m_nAlgo = 34;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            return cAction;
        }
        if (n < 666) {
            cAction.m_nAlgo = 27;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static int SelectChr(int n, int n2) {
        int n3 = n2 - n;
        int[] nArray = new int[n3];
        int n4 = 0;
        while (n4 < n3) {
            nArray[n4] = n + n4;
            ++n4;
        }
        int n5 = 0;
        while (n5 < n3) {
            n4 = Calc3D.Rand(n3);
            int n6 = Calc3D.Rand(n3);
            int n7 = nArray[n4];
            nArray[n4] = nArray[n6];
            nArray[n6] = n7;
            ++n5;
        }
        n5 = Calc3D.Rand(n3);
        int n8 = 0;
        while (n8 < n3) {
            CBattleWork cBattleWork = Vari.GetBChrWork(nArray[n5]);
            if (cBattleWork.IsAlive() && !cBattleWork.m_Prm.m_Abi.GetFlag(149)) {
                return nArray[n5];
            }
            ++n5;
            n5 %= n3;
            ++n8;
        }
        return 0;
    }

    public static CAction Algo_088(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        ++cBattleWork.m_nCount;
        switch (cBattleWork.m_nCount) {
            case 1: {
                if (n < 500) {
                    cAction.m_nAlgo = 87;
                    cAction.m_nObj = cBattleWork.m_nWorkNo;
                    break;
                }
                cAction.m_nAlgo = 186;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 2: 
            case 5: {
                cAction.m_nAlgo = 144;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 3: {
                cAction.m_nAlgo = 80;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 4: {
                if (n < 500) {
                    cAction.m_nAlgo = 83;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 186;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 6: {
                int n2 = CBattleEnemy.SelectDeadEnemy1(cBattleWork);
                if (n2 != -1) {
                    cAction.m_nAlgo = 59;
                    cAction.m_nObj = n2;
                } else {
                    cAction.m_nAlgo = 66;
                    cAction.m_nObj = cBattleWork.m_nWorkNo;
                }
                cBattleWork.m_nCount = 0;
            }
        }
        return cAction;
    }

    public static CAction Algo_056(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 333) {
            cAction.m_nAlgo = 79;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 144;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 77;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_040(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 550) {
            cAction.m_nAlgo = 34;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 700) {
            cAction.m_nAlgo = 27;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 850) {
            cAction.m_nAlgo = 151;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 26;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_105(CBattleWork cBattleWork) {
        int n;
        CAction cAction = new CAction();
        int n2 = Calc3D.Rand(1000);
        ++cBattleWork.m_nCount;
        if ((cBattleWork.m_nCount == 1 || n2 < 250) && (n = CBattleEnemy.Algo36_SearchPlayer(5)) != -1) {
            cAction.m_nAlgo = 204;
            cAction.m_nObj = n;
            return cAction;
        }
        if ((n2 & 3) != 2 && (n = CBattleEnemy.Algo36_SearchPlayer(2)) != -1) {
            cAction.m_nAlgo = 59;
            cAction.m_nObj = n;
            return cAction;
        }
        if ((n2 & 3) != 1 && (n = CBattleEnemy.Algo36_SearchPlayer(4)) != -1) {
            cAction.m_nAlgo = 201;
            cAction.m_nObj = n;
            return cAction;
        }
        if ((n2 & 1) != 0) {
            n = CBattleEnemy.Algo36_SearchPlayer(3);
            if (n != -1) {
                cAction.m_nAlgo = 50;
                cAction.m_nObj = n;
                return cAction;
            }
            n = CBattleEnemy.Algo36_SearchPlayer(5);
            if (n != -1) {
                cAction.m_nAlgo = 204;
                cAction.m_nObj = n;
                return cAction;
            }
        }
        n2 = Calc3D.Rand(1000);
        if (!Vari.m_App.m_Play.GetEvtFlag(401)) {
            if (n2 < 333) {
                cAction.m_nAlgo = 205;
                cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
            } else if (n2 < 666) {
                cAction.m_nAlgo = 79;
                cAction.m_nObj = CBattleEnemy.SelectEnemy1(cBattleWork);
            } else {
                cAction.m_nAlgo = 21;
                cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
            }
        } else {
            if ((n2 & 1) == 0 && (n = CBattleEnemy.Algo36_SearchPlayer(5)) != -1) {
                cAction.m_nAlgo = 204;
                cAction.m_nObj = n;
                return cAction;
            }
            if (n2 < 500) {
                cAction.m_nAlgo = 18;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            } else {
                cAction.m_nAlgo = 82;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            }
        }
        return cAction;
    }

    public static CAction Algo_093(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        int n2 = CBattleEnemy.SelectDeadEnemy1(cBattleWork);
        if (n2 != -1) {
            cAction.m_nAlgo = 59;
            cAction.m_nObj = n2;
        } else if (n < 500) {
            cAction.m_nAlgo = 175;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 62;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_052(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 500) {
            cAction.m_nAlgo = 154;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 78;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_107(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        ++cBattleWork.m_nCount;
        switch (cBattleWork.m_nCount) {
            case 1: 
            case 4: {
                if (n < 500) {
                    cAction.m_nAlgo = 209;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 202;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 2: {
                cAction.m_nAlgo = 208;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 3: {
                cAction.m_nAlgo = 179;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            default: {
                int n2 = CBattleEnemy.SelectDeadEnemy1(cBattleWork);
                if (n2 != -1) {
                    cAction.m_nAlgo = 207;
                    cAction.m_nObj = n2;
                } else {
                    cAction.m_nAlgo = 179;
                    cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                }
                cBattleWork.m_nCount = 0;
            }
        }
        return cAction;
    }

    public static CAction Algo_068(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = CBattleEnemy.Algo36_SearchPlayer(2);
        if (n != -1) {
            cAction.m_nAlgo = 55;
            cAction.m_nObj = n;
            return cAction;
        }
        n = CBattleEnemy.Algo36_SearchPlayer(3);
        if (n != -1) {
            cAction.m_nAlgo = 50;
            cAction.m_nObj = n;
            return cAction;
        }
        cAction.m_nAlgo = 39;
        cAction.m_nObj = CBattleEnemy.SelectEnemy1(cBattleWork);
        return cAction;
    }

    public static CAction Algo_080(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        ++cBattleWork.m_nCount;
        if (Vari.IsStopWorld()) {
            cBattleWork.m_nCount = 8;
        }
        switch (cBattleWork.m_nCount) {
            case 5: {
                cAction.m_nAlgo = 61;
                cAction.m_nObj = cBattleWork.m_nWorkNo;
                break;
            }
            case 10: {
                cAction.m_nAlgo = 21;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                cBattleWork.m_nCount = Calc3D.Rand(3);
                break;
            }
            default: {
                if (n < 250) {
                    cAction.m_nAlgo = 79;
                    cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                    break;
                }
                if (n < 500) {
                    cAction.m_nAlgo = 158;
                    cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                    break;
                }
                if (n < 750) {
                    cAction.m_nAlgo = 181;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 77;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            }
        }
        return cAction;
    }

    public static CAction Algo_013(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 333) {
            cAction.m_nAlgo = 39;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 43;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            return CBattleEnemy.Algo_001(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_045(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 333) {
            cAction.m_nAlgo = 30;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 155;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            return CBattleEnemy.Algo_001(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_059(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 333) {
            cAction.m_nAlgo = 151;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 144;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 26;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo26_Revive(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        if (Vari.m_App.m_Play.GetEvtFlag(153)) {
            int n = CBattleEnemy.SelectDeadEnemy1(cBattleWork);
            if (n != -1) {
                cAction.m_nAlgo = 55;
                cAction.m_nObj = n;
                return cAction;
            }
            if (Calc3D.Rand(1000) < 333) {
                int n2 = CBattleEnemy.SelectHPEnemy1(cBattleWork);
                if (Vari.GetBChrWork((int)n2).m_Prm.GetHP() < 1000) {
                    cAction.m_nAlgo = 72;
                    cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
                    return cAction;
                }
            }
        }
        return null;
    }

    public static CAction Algo_031(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        if (n < 500) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 29;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static CAction Algo_047(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        if (n < 500) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 142;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static CAction Algo_060(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 333) {
            cAction.m_nAlgo = 28;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 30;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            cAction.m_nAlgo = 72;
            cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_085(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 140) {
            cAction.m_nAlgo = 74;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 280) {
            cAction.m_nAlgo = 157;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 420) {
            cAction.m_nAlgo = 80;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 560) {
            cAction.m_nAlgo = 77;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 700) {
            cAction.m_nAlgo = 179;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            cAction.m_nAlgo = 144;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_104(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        ++cBattleWork.m_nCount;
        switch (cBattleWork.m_nCount) {
            case 1: 
            case 4: {
                if (n < 500) {
                    cAction.m_nAlgo = 182;
                    cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 206;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 2: 
            case 3: {
                if (n < 500) {
                    cAction.m_nAlgo = 203;
                    cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 190;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 5: {
                cAction.m_nAlgo = 57;
                cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
                cBattleWork.m_nCount = 0;
            }
        }
        return cAction;
    }

    public static CAction Algo_076(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 500) {
            cAction.m_nAlgo = 47;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 750) {
            cAction.m_nAlgo = 45;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            cAction.m_nAlgo = 43;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        }
        return cAction;
    }

    public static int SelectPlayer1(CBattleWork cBattleWork) {
        if (cBattleWork.m_Prm.GetConf() > 0) {
            return CBattleEnemy.SelectAll1();
        }
        return CBattleEnemy.SelectChr(0, 3);
    }

    public static CAction Algo_087(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 300) {
            cAction.m_nAlgo = 58;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 750) {
            cAction.m_nAlgo = 185;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 50;
            cAction.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_072(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        ++cBattleWork.m_nCount;
        switch (cBattleWork.m_nCount) {
            case 3: 
            case 4: {
                cAction.m_nAlgo = 134;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 6: {
                cAction.m_nAlgo = 175;
                cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
                cBattleWork.m_nCount = 0;
                break;
            }
            default: {
                if (n < 650) {
                    cAction.m_nAlgo = 175;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 62;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            }
        }
        return cAction;
    }

    public static int Algo36_SearchPlayer(int n) {
        int n2 = 0;
        int n3 = 3;
        int n4 = n3 - n2;
        int[] nArray = new int[n4];
        int n5 = 0;
        while (n5 < n4) {
            nArray[n5] = n2 + n5;
            ++n5;
        }
        int n6 = 0;
        while (n6 < n4) {
            n5 = Calc3D.Rand(n4);
            int n7 = Calc3D.Rand(n4);
            int n8 = nArray[n5];
            nArray[n5] = nArray[n7];
            nArray[n7] = n8;
            ++n6;
        }
        n6 = Calc3D.Rand(n4);
        int n9 = 0;
        while (n9 < n4) {
            CBattleWork cBattleWork = Vari.GetBChrWork(nArray[n6]);
            if (cBattleWork.IsAlive()) {
                if (n == 0 && cBattleWork.GetClose()) {
                    return nArray[n6];
                }
                if (n == 1 && cBattleWork.m_Prm.GetPoison()) {
                    return nArray[n6];
                }
                if (n == 3 && cBattleWork.m_Prm.GetHP() * 3 <= cBattleWork.m_Prm.GetMaxHP() * 2) {
                    return nArray[n6];
                }
                if (n == 4 && (cBattleWork.GetConfusion() || cBattleWork.GetPara() || cBattleWork.GetStone())) {
                    return nArray[n6];
                }
                if (n == 5 && !cBattleWork.IsSuika() && !cBattleWork.GetStone()) {
                    return nArray[n6];
                }
            }
            if (n == 2 && cBattleWork.IsUse() && !cBattleWork.IsAlive()) {
                return nArray[n6];
            }
            ++n6;
            n6 %= n4;
            ++n9;
        }
        return -1;
    }

    public static int SelectEnemyAll(CBattleWork cBattleWork) {
        if (cBattleWork.m_Prm.GetConf() > 0) {
            int n = Calc3D.Rand(100);
            if (n < 50) {
                return 101;
            }
            return 102;
        }
        return 102;
    }

    public static CAction Algo_028(CBattleWork cBattleWork) {
        ++cBattleWork.m_nCount;
        cBattleWork.m_nCount &= 7;
        int n = Calc3D.Rand(1000);
        CAction cAction = CBattleEnemy.Algo26_Revive(cBattleWork);
        if (cAction != null) {
            return cAction;
        }
        cAction = new CAction();
        if (cBattleWork.m_nCount == 1) {
            cAction.m_nAlgo = 52;
            cAction.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
        } else if (cBattleWork.m_nCount == 5) {
            cAction.m_nAlgo = 71;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 400) {
            cAction.m_nAlgo = 39;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 700) {
            cAction.m_nAlgo = 78;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 73;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_053(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 250) {
            cAction.m_nAlgo = 34;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 500) {
            cAction.m_nAlgo = 27;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 750) {
            cAction.m_nAlgo = 31;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            cAction.m_nAlgo = 34;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_065(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        ++cBattleWork.m_nCount;
        switch (cBattleWork.m_nCount) {
            case 2: {
                cAction.m_nAlgo = 165;
                cAction.m_nObj = cBattleWork.m_nWorkNo;
                break;
            }
            case 3: {
                cAction.m_nAlgo = 169;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 5: {
                cAction.m_nAlgo = 166;
                cAction.m_nObj = cBattleWork.m_nWorkNo;
                break;
            }
            case 6: {
                cAction.m_nAlgo = 170;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 8: {
                cAction.m_nAlgo = 167;
                cAction.m_nObj = cBattleWork.m_nWorkNo;
                break;
            }
            case 9: {
                cAction.m_nAlgo = 171;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 11: {
                cAction.m_nAlgo = 168;
                cAction.m_nObj = cBattleWork.m_nWorkNo;
                break;
            }
            case 12: {
                cAction.m_nAlgo = 172;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                cBattleWork.m_nCount = 0;
                break;
            }
            default: {
                int n = Calc3D.Rand(1000);
                if (n < 250) {
                    cAction.m_nAlgo = 78;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                if (n < 500) {
                    cAction.m_nAlgo = 175;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                if (n < 750) {
                    cAction.m_nAlgo = 142;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 176;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            }
        }
        return cAction;
    }

    public static CAction Algo_044(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 333) {
            cAction.m_nAlgo = 154;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 73;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            return CBattleEnemy.Algo_001(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_079(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        ++cBattleWork.m_nCount;
        if (cBattleWork.m_nCount % 3 == 0) {
            cAction.m_nAlgo = 57;
            cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
        } else if (n < 250) {
            cAction.m_nAlgo = 78;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 500) {
            cAction.m_nAlgo = 175;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 750) {
            cAction.m_nAlgo = 142;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 176;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_067(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 333) {
            cAction.m_nAlgo = 19;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 16;
            cAction.m_nObj = cBattleWork.m_nWorkNo;
        } else {
            return CBattleEnemy.Algo_001(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_084(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 250) {
            cAction.m_nAlgo = 19;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 500) {
            cAction.m_nAlgo = 71;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 750) {
            cAction.m_nAlgo = 83;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 21;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_008(CBattleWork cBattleWork) {
        ++cBattleWork.m_nCount;
        cBattleWork.m_nCount &= 3;
        CAction cAction = new CAction();
        switch (cBattleWork.m_nCount) {
            case 1: {
                cAction.m_nAlgo = 52;
                cAction.m_nObj = CBattleEnemy.SelectEnemy1(cBattleWork, 3);
                break;
            }
            case 2: {
                cAction.m_nAlgo = 50;
                cAction.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
                break;
            }
            case 3: {
                return CBattleEnemy.Algo_001(cBattleWork);
            }
            case 0: {
                cAction.m_nAlgo = 18;
                cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
            }
        }
        return cAction;
    }

    public static CAction Algo_020(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        if (n < 500) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 79;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static CAction Algo_101(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 250) {
            cAction.m_nAlgo = 43;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 500) {
            cAction.m_nAlgo = 48;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 750) {
            cAction.m_nAlgo = 198;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 74;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_036(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 500) {
            int n2 = CBattleEnemy.Algo36_SearchPlayer(0);
            if (n2 != -1) {
                cAction.m_nAlgo = 60;
                cAction.m_nObj = n2;
                return cAction;
            }
            n2 = CBattleEnemy.Algo36_SearchPlayer(1);
            if (n2 != -1) {
                cAction.m_nAlgo = 51;
                cAction.m_nObj = n2;
            } else {
                cAction.m_nAlgo = 1001;
                cAction.m_nObj = CBattleEnemy.SelectEnemy1(cBattleWork);
            }
        } else {
            cAction.m_nAlgo = 1001;
            cAction.m_nObj = CBattleEnemy.SelectEnemy1(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_032(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        if (n < 333) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 144;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static CAction Algo_064(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        cAction.m_nAlgo = 175;
        cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        return cAction;
    }

    public static CAction Algo_041(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        int n2 = CBattleEnemy.SelectDeadEnemy1(cBattleWork);
        if (n2 != -1) {
            cAction.m_nAlgo = 153;
            cAction.m_nObj = n2;
            return cAction;
        }
        if (n < 333) {
            cAction.m_nAlgo = 142;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 71;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            return CBattleEnemy.Algo_001(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_073(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 333) {
            cAction.m_nAlgo = 175;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 82;
            cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 83;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_025(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 350) {
            cAction.m_nAlgo = 143;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 600) {
            cAction.m_nAlgo = 77;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            return CBattleEnemy.Algo_001(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_039(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 333) {
            cAction.m_nAlgo = 75;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 39;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            cAction.m_nAlgo = 151;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_027(CBattleWork cBattleWork) {
        ++cBattleWork.m_nCount;
        cBattleWork.m_nCount &= 7;
        int n = Calc3D.Rand(1000);
        CAction cAction = CBattleEnemy.Algo26_Revive(cBattleWork);
        if (cAction != null) {
            return cAction;
        }
        cAction = new CAction();
        if (cBattleWork.m_nCount == 7) {
            cAction.m_nAlgo = 50;
            cAction.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
        } else if (n < 400) {
            cAction.m_nAlgo = 75;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 700) {
            cAction.m_nAlgo = 70;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            return CBattleEnemy.Algo_001(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_081(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        cAction.m_nAlgo = 80;
        cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        return cAction;
    }

    public static CAction Algo_098(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 333) {
            cAction.m_nAlgo = 144;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 63;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            cAction.m_nAlgo = 196;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }

    public static int CheckDecMP(int n) {
        int n2 = 0;
        int n3 = 3;
        do {
            CBattleWork cBattleWork;
            if (!(cBattleWork = Vari.GetBChrWork(n3)).IsAlive() || cBattleWork.m_Prm.GetMP() > n) continue;
            ++n2;
        } while (++n3 < 9);
        return n2;
    }

    public static int SelectEnemy1(CBattleWork cBattleWork) {
        if (cBattleWork.m_Prm.GetConf() > 0) {
            return CBattleEnemy.SelectAll1();
        }
        return CBattleEnemy.SelectChr(3, 9);
    }

    public static CAction Algo_005(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        if (n < 450) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 70;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static int SelectEnemy1(CBattleWork cBattleWork, int n) {
        if (cBattleWork.m_Prm.GetConf() > 0) {
            return CBattleEnemy.SelectAll1();
        }
        CBattleWork cBattleWork2 = Vari.GetBChrWork(n);
        if (cBattleWork2.IsAlive()) {
            return n;
        }
        return CBattleEnemy.SelectChr(3, 9);
    }

    public static int SelectStatusEnemy1(CBattleWork cBattleWork, int n) {
        if (cBattleWork.m_Prm.GetConf() > 0) {
            if (Calc3D.Rand(100) > 35) {
                return -1;
            }
            return CBattleEnemy.SelectAll1();
        }
        int n2 = 6;
        int[] nArray = new int[n2];
        int n3 = 0;
        while (n3 < n2) {
            nArray[n3] = 3 + n3;
            ++n3;
        }
        int n4 = 0;
        do {
            n3 = Calc3D.Rand(n2);
            int n5 = Calc3D.Rand(n2);
            int n6 = nArray[n3];
            nArray[n3] = nArray[n5];
            nArray[n5] = n6;
        } while (++n4 < 64);
        int n7 = 0;
        while (n7 < n2) {
            n4 = nArray[n7];
            CBattleWork cBattleWork2 = Vari.GetBChrWork(n4);
            if (cBattleWork2.IsAlive()) {
                switch (n) {
                    case 0: {
                        if (CBattleActCalc.CheckShield(cBattleWork2)) break;
                        return n4;
                    }
                    case 1: {
                        if (cBattleWork2.m_Prm.GetRije() != 0) break;
                        return n4;
                    }
                    case 2: {
                        if (cBattleWork2.m_Prm.GetDef_Btl() >= CBattleActEfc.GetDefenseUp(cBattleWork) * 3) break;
                        return n4;
                    }
                    case 3: {
                        if (cBattleWork2.m_Prm.GetStr_Btl() >= 20) break;
                        return n4;
                    }
                    case 4: {
                        if (!cBattleWork2.m_Prm.GetFlag(1)) {
                            return n4;
                        }
                    }
                    case 5: {
                        if (cBattleWork2.GetAura() <= 0) break;
                        return n4;
                    }
                }
            }
            ++n7;
        }
        return -1;
    }

    public static CAction Algo_018(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 333) {
            cAction.m_nAlgo = 39;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 139;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            return CBattleEnemy.Algo_001(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_007(CBattleWork cBattleWork) {
        ++cBattleWork.m_nCount;
        cBattleWork.m_nCount &= 3;
        if (cBattleWork.m_nCount == 3) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 19;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static CAction Algo_061(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        if (n < 500) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 80;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static CAction Algo_090(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        ++cBattleWork.m_nCount;
        switch (cBattleWork.m_nCount) {
            case 1: {
                if (n < 500) {
                    cAction.m_nAlgo = 80;
                    cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 176;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 2: {
                cAction.m_nAlgo = 186;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 3: {
                if (n < 500) {
                    cAction.m_nAlgo = 151;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 152;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 4: {
                cAction.m_nAlgo = 76;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 5: {
                cAction.m_nAlgo = 148;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 6: {
                if (n < 500) {
                    cAction.m_nAlgo = 83;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                } else {
                    cAction.m_nAlgo = 176;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                }
                cBattleWork.m_nCount = 0;
            }
        }
        return cAction;
    }

    public static CAction Algo_106(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 250) {
            cAction.m_nAlgo = 83;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 500) {
            cAction.m_nAlgo = 203;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 750) {
            cAction.m_nAlgo = 71;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 77;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_024(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        cAction.m_nAlgo = 26;
        cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        return cAction;
    }

    public static CAction Algo_033(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 333) {
            cAction.m_nAlgo = 71;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            return cAction;
        }
        if (n < 666) {
            cAction.m_nAlgo = 74;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static CAction Algo_102(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        ++cBattleWork.m_nCount;
        cBattleWork.m_nCount %= 7;
        if (cBattleWork.m_nCount == 1) {
            cAction.m_nAlgo = 64;
            cAction.m_nObj = cBattleWork.m_nWorkNo;
        } else if (n < 400) {
            cAction.m_nAlgo = 199;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 600) {
            cAction.m_nAlgo = 158;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 800) {
            cAction.m_nAlgo = 186;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 24;
            cAction.m_nObj = cBattleWork.m_nWorkNo;
        }
        return cAction;
    }

    public static CAction Algo_010(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        if (n < 250) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 27;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static CAction Algo_046(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        int n2 = CBattleEnemy.SelectDeadEnemy1(cBattleWork);
        if (n2 != -1) {
            cAction.m_nAlgo = 153;
            cAction.m_nObj = n2;
            return cAction;
        }
        if (n < 333) {
            cAction.m_nAlgo = 78;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 154;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            return CBattleEnemy.Algo_001(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_095(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        ++cBattleWork.m_nCount;
        switch (cBattleWork.m_nCount) {
            case 3: {
                cAction.m_nAlgo = 177;
                break;
            }
            case 4: {
                cAction.m_nAlgo = 178;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                cBattleWork.m_nCount = 0;
                break;
            }
            default: {
                if (n < 333) {
                    cAction.m_nAlgo = 193;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                if (n < 666) {
                    cAction.m_nAlgo = 134;
                    cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                    break;
                }
                return CBattleEnemy.Algo_001(cBattleWork);
            }
        }
        return cAction;
    }

    public static CAction Algo_004(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(100);
        if (n < 33) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 39;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            return cAction;
        }
        if (n < 66) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 45;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static CAction Algo_058(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        cAction.m_nAlgo = 160;
        cAction.m_nObj = 0;
        return cAction;
    }

    public static CAction Algo_042(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 333) {
            cAction.m_nAlgo = 22;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 75;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            return CBattleEnemy.Algo_001(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_086(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 450) {
            cAction.m_nAlgo = 36;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 800) {
            cAction.m_nAlgo = 185;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 50;
            cAction.m_nObj = cBattleWork.m_nWorkNo;
        }
        return cAction;
    }

    public static CAction Algo_097(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 250 && cBattleWork.m_Prm.m_nMP < 170) {
            cAction.m_nAlgo = 86;
            cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
        } else if (n < 500 && Vari.m_ActOld.m_nAlgo != 195) {
            cAction.m_nAlgo = 195;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            if (n < 850) {
                return CBattleEnemy.Algo_001(cBattleWork);
            }
            cAction.m_nAlgo = 71;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        }
        return cAction;
    }

    public static int SelectPlayerAll(CBattleWork cBattleWork) {
        if (cBattleWork.m_Prm.GetConf() > 0) {
            int n = Calc3D.Rand(100);
            if (n < 50) {
                return 101;
            }
            return 102;
        }
        return 101;
    }

    public static CAction Algo_015(CBattleWork cBattleWork) {
        ++cBattleWork.m_nCount;
        CAction cAction = new CAction();
        switch (cBattleWork.m_nCount) {
            case 1: 
            case 4: {
                cAction.m_nAlgo = 39;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 2: {
                cAction.m_nAlgo = 42;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 3: {
                cAction.m_nAlgo = 57;
                cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
                break;
            }
            case 5: {
                cAction.m_nAlgo = 174;
                cAction.m_nObj = cBattleWork.m_nWorkNo;
                break;
            }
            case 6: {
                cAction.m_nAlgo = 137;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 7: {
                cAction.m_nAlgo = 41;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                cBattleWork.m_nCount = 0;
            }
        }
        return cAction;
    }

    public static CAction Algo_021(CBattleWork cBattleWork) {
        ++cBattleWork.m_nCount;
        cBattleWork.m_nCount &= 3;
        int n = Calc3D.Rand(1000);
        if (cBattleWork.m_nCount == 1 || n < 300) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 141;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            return cAction;
        }
        if (cBattleWork.m_nCount == 3 || n < 600) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 142;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static CAction Algo_049(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 250) {
            cAction.m_nAlgo = 73;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            return cAction;
        }
        if (n < 500) {
            cAction.m_nAlgo = 74;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            return cAction;
        }
        if (n < 750) {
            cAction.m_nAlgo = 157;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static CAction Algo_082(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 333) {
            cAction.m_nAlgo = 182;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 22;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 142;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_017(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        if (n < 450) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 72;
            cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static CAction Algo_050(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 500) {
            int n2 = CBattleEnemy.Algo36_SearchPlayer(0);
            if (n2 != -1) {
                cAction.m_nAlgo = 60;
                cAction.m_nObj = n2;
                return cAction;
            }
            n2 = CBattleEnemy.Algo36_SearchPlayer(1);
            if (n2 != -1) {
                cAction.m_nAlgo = 51;
                cAction.m_nObj = n2;
            } else {
                cAction.m_nAlgo = 1001;
                cAction.m_nObj = CBattleEnemy.SelectEnemy1(cBattleWork);
            }
        } else if (n < 750) {
            cAction.m_nAlgo = 151;
            cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 22;
            cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
        }
        return cAction;
    }

    public static int SelectHPEnemyCount(CBattleWork cBattleWork, int n) {
        if (cBattleWork.m_Prm.GetConf() > 0) {
            return CBattleEnemy.SelectAll1();
        }
        int n2 = 0;
        int n3 = 3;
        do {
            CBattleWork cBattleWork2;
            if (!(cBattleWork2 = Vari.GetBChrWork(n3)).IsAlive() || cBattleWork2.m_Prm.GetHP() * 100 / cBattleWork2.m_Prm.GetMaxHP() >= n) continue;
            ++n2;
        } while (++n3 < 9);
        return n2;
    }

    public static CAction Algo_066(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n >= 500) {
            return CBattleEnemy.Algo_001(cBattleWork);
        }
        cAction.m_nAlgo = 155;
        cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        return cAction;
    }

    public static CAction Algo_103(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        Calc3D.Rand(1000);
        ++cBattleWork.m_nCount;
        if (Vari.m_App.m_Play.GetEvtFlag(299) && cBattleWork.m_Prm.GetHP() <= 200000 && !Vari.m_App.m_Play.GetEvtFlag(401)) {
            Vari.m_App.m_Render.SetWhite(1.0f);
            Vari.m_App.m_Battle.LoopFrame(1);
            Vari.m_App.m_Render.SetWhite(0.0f);
            Vari.m_App.m_Battle.LoopFrame(10);
            int n = 0;
            do {
                Vari.m_App.m_Render.SetWhite(1.0f);
                Vari.m_App.m_Battle.LoopFrame(1);
                Vari.m_App.m_Render.SetWhite(0.0f);
                Vari.m_App.m_Battle.LoopFrame(1);
            } while (++n < 4);
            Vari.m_App.m_Render.SetWhite(1.0f);
            cBattleWork.m_Chr.m_nChrH = 146;
            n = 10;
            do {
                Vari.m_App.m_Render.SetWhite((float)n * 0.1f);
                Vari.m_App.m_Battle.LoopFrame(1);
            } while (--n >= 0);
            Vari.m_App.m_Battle.LoopFrame(10);
            cBattleWork.m_Chr.ResetFlag(2);
            cBattleWork.m_Prm.m_Abi.ResetFlagM(156);
            cBattleWork.m_Prm.AddHP(100000);
            cBattleWork.m_Prm.SetStr_Btl(70);
            cBattleWork.m_Prm.SetDef_Btl(180);
            cBattleWork.m_Prm.SetAgi_Btl(200);
            Vari.m_App.m_Play.SetEvtFlag(401);
            cBattleWork.m_Prm.m_nAlgo = 107;
            cBattleWork.m_nCount = 0;
            cBattleWork.m_Prm.m_Abi.SetFlagM(184);
            return null;
        }
        switch (cBattleWork.m_nCount) {
            case 1: {
                cAction.m_nAlgo = 182;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 2: 
            case 5: {
                cAction.m_nAlgo = 202;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 3: {
                cAction.m_nAlgo = 144;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 4: {
                cAction.m_nAlgo = 179;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            default: {
                int n = CBattleEnemy.SelectDeadEnemy1(cBattleWork);
                if (n != -1) {
                    cAction.m_nAlgo = 207;
                    cAction.m_nObj = n;
                } else {
                    cAction.m_nAlgo = 57;
                    cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
                }
                cBattleWork.m_nCount = 0;
            }
        }
        return cAction;
    }

    public static CAction Algo_089(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 333) {
            cAction.m_nAlgo = 83;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 158;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            cAction.m_nAlgo = 57;
            cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_094(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        if (Vari.GetWorldChr() != cBattleWork.m_nWorkNo) {
            cAction.m_nAlgo = 61;
            cAction.m_nObj = cBattleWork.m_nWorkNo;
            return cAction;
        }
        if (Vari.GetWorldCount() == 1) {
            cAction.m_nAlgo = 191;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            return cAction;
        }
        int n = CBattleEnemy.SelectDeadEnemy1(cBattleWork);
        if (n != -1) {
            cAction.m_nAlgo = 59;
            cAction.m_nObj = n;
            return cAction;
        }
        if (CBattleEnemy.CheckDecMP(170) > 0) {
            cAction.m_nAlgo = 86;
            cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
            return cAction;
        }
        n = CBattleEnemy.SelectHPEnemyCount(cBattleWork, 25);
        if (n == 1) {
            cAction.m_nAlgo = 50;
            cAction.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
            return cAction;
        }
        if (n > 1) {
            cAction.m_nAlgo = 57;
            cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
            return cAction;
        }
        n = CBattleEnemy.SelectStatusEnemy1(cBattleWork, 0);
        if (n != -1) {
            cAction.m_nAlgo = 52;
            cAction.m_nObj = n;
            return cAction;
        }
        n = CBattleEnemy.SelectStatusEnemy1(cBattleWork, 1);
        if (n != -1) {
            cAction.m_nAlgo = 64;
            cAction.m_nObj = n;
            return cAction;
        }
        n = CBattleEnemy.SelectStatusEnemy1(cBattleWork, 2);
        if (n != -1) {
            cAction.m_nAlgo = 82;
            cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
            return cAction;
        }
        n = CBattleEnemy.SelectStatusEnemy1(cBattleWork, 4);
        if (n != -1) {
            cAction.m_nAlgo = 40;
            cAction.m_nObj = n;
            return cAction;
        }
        n = CBattleEnemy.SelectStatusEnemy1(cBattleWork, 3);
        if (n != -1) {
            cAction.m_nAlgo = 18;
            cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
            return cAction;
        }
        int n2 = Calc3D.Rand(1000);
        if (n2 < 100) {
            cAction.m_nAlgo = 43;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n2 < 400) {
            cAction.m_nAlgo = 21;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        }
        n = CBattleEnemy.SelectHPEnemyCount(cBattleWork, 75);
        if (n == 1) {
            cAction.m_nAlgo = 50;
            cAction.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
            return cAction;
        }
        if (n > 1) {
            cAction.m_nAlgo = 57;
            cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
            return cAction;
        }
        if (n2 < 700) {
            cAction.m_nAlgo = 48;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 58;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_001(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        cAction.m_nAlgo = 1001;
        cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        return cAction;
    }

    public static CAction Algo_062(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        if (!CBattleEnemy.Algo62_Mimi(cBattleWork)) {
            return CBattleEnemy.Algo_001(cBattleWork);
        }
        cAction.m_nAlgo = 163;
        return cAction;
    }

    public static CAction Algo_078(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        ++cBattleWork.m_nCount;
        switch (cBattleWork.m_nCount) {
            case 3: {
                cAction.m_nAlgo = 177;
                break;
            }
            case 4: {
                cAction.m_nAlgo = 178;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 6: {
                cAction.m_nAlgo = 50;
                cAction.m_nObj = cBattleWork.m_nWorkNo;
                cBattleWork.m_nCount = 0;
                break;
            }
            default: {
                if (n < 400) {
                    cAction.m_nAlgo = 151;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                if (n < 800) {
                    cAction.m_nAlgo = 36;
                    cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 179;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            }
        }
        return cAction;
    }

    public static CAction Algo_055(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = CBattleEnemy.SelectDeadEnemy1(cBattleWork);
        if (n != -1) {
            cAction.m_nAlgo = 153;
            cAction.m_nObj = n;
            return cAction;
        }
        ++cBattleWork.m_nCount;
        switch (cBattleWork.m_nCount) {
            case 1: {
                cAction.m_nAlgo = 43;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 2: 
            case 5: {
                cAction.m_nAlgo = 45;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 3: 
            case 6: {
                cAction.m_nAlgo = 57;
                cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
                break;
            }
            case 4: {
                cAction.m_nAlgo = 41;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 7: {
                cAction.m_nAlgo = 53;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                cBattleWork.m_nCount = 0;
            }
        }
        return cAction;
    }

    public static CAction Algo_014(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        if (n < 500) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 19;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static CAction Algo_043(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 250) {
            cAction.m_nAlgo = 152;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 500) {
            cAction.m_nAlgo = 76;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 750) {
            cAction.m_nAlgo = 74;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 70;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_069(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 250) {
            return CBattleEnemy.Algo_001(cBattleWork);
        }
        if (n < 500) {
            cAction.m_nAlgo = 83;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 750) {
            cAction.m_nAlgo = 85;
            cAction.m_nObj = CBattleEnemy.SelectEnemyAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 139;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_057(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        ++cBattleWork.m_nCount;
        switch (cBattleWork.m_nCount) {
            case 2: 
            case 3: {
                cAction.m_nAlgo = 148;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 5: {
                cAction.m_nAlgo = 158;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                cBattleWork.m_nCount = 0;
                break;
            }
            default: {
                if (n < 500) {
                    cAction.m_nAlgo = 152;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 159;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            }
        }
        return cAction;
    }

    public static CAction Algo_083(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 333) {
            cAction.m_nAlgo = 73;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 666) {
            cAction.m_nAlgo = 77;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            cAction.m_nAlgo = 33;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_070(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        ++cBattleWork.m_nCount;
        switch (cBattleWork.m_nCount) {
            case 2: {
                cAction.m_nAlgo = 21;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 4: {
                cAction.m_nAlgo = 25;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 8: {
                cAction.m_nAlgo = 17;
                cAction.m_nObj = CBattleEnemy.SelectHPEnemy1(cBattleWork);
                cBattleWork.m_nCount = 0;
                break;
            }
            default: {
                if (n < 333) {
                    cAction.m_nAlgo = 22;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                    break;
                }
                if (n < 666) {
                    cAction.m_nAlgo = 20;
                    cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                    break;
                }
                return CBattleEnemy.Algo_001(cBattleWork);
            }
        }
        return cAction;
    }

    public static CAction Algo_026(CBattleWork cBattleWork) {
        ++cBattleWork.m_nCount;
        cBattleWork.m_nCount &= 7;
        CAction cAction = CBattleEnemy.Algo26_Revive(cBattleWork);
        if (cAction != null) {
            return cAction;
        }
        cAction = new CAction();
        if (cBattleWork.m_nCount == 1) {
            cAction.m_nAlgo = 134;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            int n = Calc3D.Rand(1000);
            if (n < 500) {
                cAction.m_nAlgo = 19;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            } else {
                return CBattleEnemy.Algo_001(cBattleWork);
            }
        }
        return cAction;
    }

    public static CAction Algo_091(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = Calc3D.Rand(1000);
        if (n < 200) {
            cAction.m_nAlgo = 43;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 450) {
            cAction.m_nAlgo = 48;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 700) {
            cAction.m_nAlgo = 47;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            cAction.m_nAlgo = 49;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }

    CBattleEnemy() {
    }

    public static CAction Algo_022(CBattleWork cBattleWork) {
        ++cBattleWork.m_nCount;
        CAction cAction = new CAction();
        switch (cBattleWork.m_nCount) {
            case 1: {
                cAction.m_nAlgo = 75;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 2: {
                if (Calc3D.Rand(1000) < 500) {
                    cAction.m_nAlgo = 27;
                    cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                    break;
                }
                cAction.m_nAlgo = 31;
                cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
                break;
            }
            case 3: {
                cAction.m_nAlgo = 78;
                cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                break;
            }
            case 4: {
                if (Calc3D.Rand(1000) < 500) {
                    cAction.m_nAlgo = 71;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                } else {
                    cAction.m_nAlgo = 76;
                    cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
                }
                cBattleWork.m_nCount = 0;
            }
        }
        return cAction;
    }

    public static CAction Algo_054(CBattleWork cBattleWork) {
        CAction cAction = new CAction();
        int n = CBattleEnemy.SelectDeadEnemy1(cBattleWork);
        if (n != -1) {
            cAction.m_nAlgo = 153;
            cAction.m_nObj = n;
            return cAction;
        }
        int n2 = Calc3D.Rand(1000);
        if (n2 < 333) {
            cAction.m_nAlgo = 49;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n2 < 666) {
            cAction.m_nAlgo = 46;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else {
            cAction.m_nAlgo = 47;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }

    public static CAction Algo_038(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        int n2 = CBattleEnemy.SelectDeadEnemy1(cBattleWork);
        if (n2 != -1) {
            cAction.m_nAlgo = 55;
            cAction.m_nObj = n2;
            return cAction;
        }
        if (n < 333) {
            cAction.m_nAlgo = 147;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            return cAction;
        }
        if (n < 666) {
            cAction.m_nAlgo = 53;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static CAction Algo_011(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        if (n < 750) {
            CAction cAction = new CAction();
            cAction.m_nAlgo = 73;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
            return cAction;
        }
        return CBattleEnemy.Algo_001(cBattleWork);
    }

    public static CAction Algo_063(CBattleWork cBattleWork) {
        int n = Calc3D.Rand(1000);
        CAction cAction = new CAction();
        if (n < 200) {
            cAction.m_nAlgo = 137;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 400) {
            cAction.m_nAlgo = 164;
            cAction.m_nObj = CBattleEnemy.SelectPlayerAll(cBattleWork);
        } else if (n < 600) {
            cAction.m_nAlgo = 36;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else if (n < 800) {
            cAction.m_nAlgo = 34;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        } else {
            cAction.m_nAlgo = 33;
            cAction.m_nObj = CBattleEnemy.SelectPlayer1(cBattleWork);
        }
        return cAction;
    }
}

