/*
 * Decompiled with CFR 0.152.
 */
class CAreaParam {
    public int m_nEventNo;
    public D3DXCOLOR m_cBackColor = new D3DXCOLOR();
    public D3DXCOLOR m_cAmbient = new D3DXCOLOR();
    public D3DXCOLOR m_cFogColor = new D3DXCOLOR();
    public float m_fFogStart;
    public float m_fFogEnd;
    public int m_nLightMode;
    public float m_fLightRange;
    public D3DXVECTOR3 m_vLightPos = new D3DXVECTOR3();
    public D3DXCOLOR m_cLightColor = new D3DXCOLOR();
    public int m_nMapXNum;
    public int m_nMapZNum;
    public int m_nEnemyNum;
    public CEnemyDis[] m_acEnemy;
    public int m_nScopeNum;
    public CScopeEvent[] m_acScope;
    public int m_nNpcNum;
    public CNpc[] m_acNpc;
    public int m_nWEventNum;
    public CWEvent[] m_acWEvent;
    public int m_nTreasureNum;
    public CTreasure[] m_acTreasure;
    public CMapData m_Map;
    public int m_nWorldMapX;
    public int m_nWorldMapZ;

    public int CheckWallEvent(int n, int n2, int n3) {
        int n4 = 0;
        while (n4 < this.m_nWEventNum) {
            if (this.m_acWEvent[n4].m_nXPos == n && this.m_acWEvent[n4].m_nZPos == n2 && this.CheckWallVect(n3, this.m_acWEvent[n4]) && CAreaParam.CheckIf(this.m_acWEvent[n4].m_nIf)) {
                return this.m_acWEvent[n4].m_nEvent;
            }
            ++n4;
        }
        return -1;
    }

    public void SetMapHit(int n, int n2, int n3) {
        int n4 = this.m_Map.GetPtr(n, n2);
        this.m_Map.SetHit(n4, (byte)n3);
    }

    public int GetGroundNum(int n) {
        return this.m_Map.GetGround(n);
    }

    public void Set(CAreaParam cAreaParam) {
        this.m_nLightMode = cAreaParam.m_nLightMode;
        this.m_fFogStart = cAreaParam.m_fFogStart;
        this.m_fFogEnd = cAreaParam.m_fFogEnd;
        this.m_fLightRange = cAreaParam.m_fLightRange;
        this.m_vLightPos.Set(cAreaParam.m_vLightPos);
        this.m_cBackColor.Set(cAreaParam.m_cBackColor);
        this.m_cAmbient.Set(cAreaParam.m_cAmbient);
        this.m_cFogColor.Set(cAreaParam.m_cFogColor);
        this.m_cLightColor.Set(cAreaParam.m_cLightColor);
        this.m_nEventNo = cAreaParam.m_nEventNo;
        this.m_nMapXNum = cAreaParam.m_nMapXNum;
        this.m_nMapZNum = cAreaParam.m_nMapZNum;
        this.m_nWorldMapX = cAreaParam.m_nWorldMapX;
        this.m_nWorldMapZ = cAreaParam.m_nWorldMapZ;
        this.m_nEnemyNum = cAreaParam.m_nEnemyNum;
        this.m_acEnemy = new CEnemyDis[this.m_nEnemyNum];
        int n = 0;
        while (n < this.m_nEnemyNum) {
            this.m_acEnemy[n] = new CEnemyDis();
            this.m_acEnemy[n].Set(cAreaParam.m_acEnemy[n]);
            ++n;
        }
        this.m_nScopeNum = cAreaParam.m_nScopeNum;
        this.m_acScope = new CScopeEvent[this.m_nScopeNum];
        n = 0;
        while (n < this.m_nScopeNum) {
            this.m_acScope[n] = new CScopeEvent();
            this.m_acScope[n].Set(cAreaParam.m_acScope[n]);
            ++n;
        }
        this.m_nNpcNum = cAreaParam.m_nNpcNum;
        this.m_acNpc = new CNpc[this.m_nNpcNum];
        n = 0;
        while (n < this.m_nNpcNum) {
            this.m_acNpc[n] = new CNpc();
            this.m_acNpc[n].Set(cAreaParam.m_acNpc[n]);
            ++n;
        }
        this.m_nWEventNum = cAreaParam.m_nWEventNum;
        this.m_acWEvent = new CWEvent[this.m_nWEventNum];
        n = 0;
        while (n < this.m_nWEventNum) {
            this.m_acWEvent[n] = new CWEvent();
            this.m_acWEvent[n].Set(cAreaParam.m_acWEvent[n]);
            ++n;
        }
        this.m_nTreasureNum = cAreaParam.m_nTreasureNum;
        this.m_acTreasure = new CTreasure[this.m_nTreasureNum];
        n = 0;
        while (n < this.m_nTreasureNum) {
            this.m_acTreasure[n] = new CTreasure();
            this.m_acTreasure[n].Set(cAreaParam.m_acTreasure[n]);
            ++n;
        }
        this.m_Map = new CMapData();
        this.m_Map.Set(cAreaParam.m_Map);
    }

    public boolean Load(CFileJip cFileJip) {
        this.m_cBackColor.r = cFileJip.ReadInt();
        this.m_cBackColor.g = cFileJip.ReadInt();
        this.m_cBackColor.b = cFileJip.ReadInt();
        this.m_cAmbient.r = cFileJip.ReadInt();
        this.m_cAmbient.g = cFileJip.ReadInt();
        this.m_cAmbient.b = cFileJip.ReadInt();
        this.m_cFogColor.r = cFileJip.ReadInt();
        this.m_cFogColor.g = cFileJip.ReadInt();
        this.m_cFogColor.b = cFileJip.ReadInt();
        this.m_fFogStart = cFileJip.ReadFloat();
        this.m_fFogEnd = cFileJip.ReadFloat();
        this.m_nLightMode = cFileJip.ReadInt();
        this.m_fLightRange = cFileJip.ReadFloat();
        this.m_vLightPos.x = cFileJip.ReadFloat();
        this.m_vLightPos.y = cFileJip.ReadFloat();
        this.m_vLightPos.z = cFileJip.ReadFloat();
        this.m_cLightColor.r = cFileJip.ReadInt();
        this.m_cLightColor.g = cFileJip.ReadInt();
        this.m_cLightColor.b = cFileJip.ReadInt();
        this.m_nMapZNum = cFileJip.ReadWord();
        this.m_nMapXNum = cFileJip.ReadWord();
        this.m_Map = new CMapData();
        this.m_Map.Create(this.m_nMapXNum, this.m_nMapZNum);
        this.m_nScopeNum = cFileJip.ReadWord();
        this.m_acScope = new CScopeEvent[this.m_nScopeNum];
        this.m_nEnemyNum = cFileJip.ReadWord();
        this.m_acEnemy = new CEnemyDis[this.m_nEnemyNum];
        this.m_nWEventNum = cFileJip.ReadWord();
        this.m_acWEvent = new CWEvent[this.m_nWEventNum];
        this.m_nNpcNum = cFileJip.ReadWord();
        this.m_acNpc = new CNpc[this.m_nNpcNum];
        this.m_nEventNo = cFileJip.ReadWord();
        this.m_nTreasureNum = cFileJip.ReadWord();
        this.m_acTreasure = new CTreasure[this.m_nTreasureNum];
        this.m_nWorldMapZ = cFileJip.ReadWord();
        this.m_nWorldMapX = cFileJip.ReadWord();
        this.m_Map.LoadGround(cFileJip);
        this.m_Map.LoadMap(cFileJip);
        int n = 0;
        while (n < this.m_nEnemyNum) {
            this.m_acEnemy[n] = new CEnemyDis();
            this.m_acEnemy[n].m_nKind = cFileJip.ReadWord();
            this.m_acEnemy[n].m_nIf = cFileJip.ReadWord();
            this.m_acEnemy[n].m_nXPos = cFileJip.ReadByte();
            this.m_acEnemy[n].m_nZPos = cFileJip.ReadByte();
            this.m_acEnemy[n].m_nXSize = cFileJip.ReadByte();
            this.m_acEnemy[n].m_nZSize = cFileJip.ReadByte();
            this.m_acEnemy[n].m_nRnd1 = cFileJip.ReadWord();
            this.m_acEnemy[n].m_nRnd2 = cFileJip.ReadWord();
            ++n;
        }
        n = 0;
        while (n < this.m_nScopeNum) {
            this.m_acScope[n] = new CScopeEvent();
            this.m_acScope[n].m_nKind = cFileJip.ReadWord();
            this.m_acScope[n].m_nIf = cFileJip.ReadWord();
            this.m_acScope[n].m_nXPos = cFileJip.ReadWord();
            this.m_acScope[n].m_nZPos = cFileJip.ReadWord();
            this.m_acScope[n].m_nXSize = cFileJip.ReadWord();
            this.m_acScope[n].m_nZSize = cFileJip.ReadWord();
            this.m_acScope[n].m_cSqu.m_nAreaNo = cFileJip.ReadWord();
            this.m_acScope[n].m_cSqu.m_nXPos = cFileJip.ReadWord();
            this.m_acScope[n].m_cSqu.m_nZPos = cFileJip.ReadWord();
            this.m_acScope[n].m_cSqu.m_nYRol = cFileJip.ReadWord();
            ++n;
        }
        n = 0;
        while (n < this.m_nNpcNum) {
            this.m_acNpc[n] = new CNpc();
            this.m_acNpc[n].m_nKind = CFunc.Unsigned(cFileJip.ReadByte());
            this.m_acNpc[n].m_nXPos = cFileJip.ReadByte();
            this.m_acNpc[n].m_nZPos = cFileJip.ReadByte();
            this.m_acNpc[n].m_nVect = cFileJip.ReadByte();
            this.m_acNpc[n].m_nIf = cFileJip.ReadWord();
            this.m_acNpc[n].m_nEvent = cFileJip.ReadWord();
            this.m_acNpc[n].m_nMode = cFileJip.ReadByte();
            cFileJip.ReadByte();
            cFileJip.ReadByte();
            cFileJip.ReadByte();
            ++n;
        }
        n = 0;
        while (n < this.m_nWEventNum) {
            this.m_acWEvent[n] = new CWEvent();
            this.m_acWEvent[n].m_nXPos = cFileJip.ReadByte();
            this.m_acWEvent[n].m_nZPos = cFileJip.ReadByte();
            this.m_acWEvent[n].m_nVect = cFileJip.ReadByte();
            cFileJip.ReadByte();
            this.m_acWEvent[n].m_nIf = cFileJip.ReadWord();
            this.m_acWEvent[n].m_nEvent = cFileJip.ReadWord();
            ++n;
        }
        n = 0;
        while (n < this.m_nTreasureNum) {
            this.m_acTreasure[n] = new CTreasure();
            this.m_acTreasure[n].m_nXPos = cFileJip.ReadByte();
            this.m_acTreasure[n].m_nZPos = cFileJip.ReadByte();
            this.m_acTreasure[n].m_nVect = cFileJip.ReadByte();
            cFileJip.ReadByte();
            this.m_acTreasure[n].m_nItem = cFileJip.ReadWord();
            this.m_acTreasure[n].m_nFlag = cFileJip.ReadWord();
            ++n;
        }
        return true;
    }

    public void CheckTreasure(ARpg aRpg, int n, int n2) {
        int n3 = 0;
        while (n3 < this.m_nTreasureNum) {
            CTreasure cTreasure = this.m_acTreasure[n3];
            if (cTreasure.m_nXPos == n && cTreasure.m_nZPos == n2 && !aRpg.m_Play.GetEvtFlag(cTreasure.m_nFlag)) {
                aRpg.m_Play.SetEvtFlag(cTreasure.m_nFlag);
                if (cTreasure.m_nVect != -1) {
                    int n4 = this.m_Map.GetPtr(cTreasure.m_nXPos, cTreasure.m_nZPos);
                    this.m_Map.SetMapTable(n4, 36 + cTreasure.m_nVect);
                    aRpg.LoopFrame(4);
                }
                if (cTreasure.m_nItem >= 1000 && cTreasure.m_nItem < 10000) {
                    Vari.m_Event.Run(cTreasure.m_nItem - 1000, -1);
                } else {
                    aRpg.GetItemMess(cTreasure.m_nItem);
                }
            }
            ++n3;
        }
    }

    public void SetTreasure(ARpg aRpg) {
        int n = 0;
        while (n < this.m_nTreasureNum) {
            CTreasure cTreasure = this.m_acTreasure[n];
            if (cTreasure.m_nVect != -1) {
                int n2 = this.m_Map.GetPtr(cTreasure.m_nXPos, cTreasure.m_nZPos);
                if (aRpg.m_Play.GetEvtFlag(cTreasure.m_nFlag)) {
                    this.m_Map.SetMapTable(n2, 36 + cTreasure.m_nVect);
                } else {
                    this.m_Map.SetMapTable(n2, 32 + cTreasure.m_nVect);
                }
                this.m_Map.SetHit(n2, (byte)3);
            }
            ++n;
        }
    }

    public void SetMapGround(int n, int n2, int n3) {
        int n4 = this.m_Map.GetPtr(n, n2);
        this.m_Map.SetGround(n4, (byte)n3);
    }

    public int CheckEncount(int n, int n2, int n3, int n4) {
        int n5 = 0;
        while (n5 < this.m_nEnemyNum) {
            int n6;
            CEnemyDis cEnemyDis = this.m_acEnemy[(n5 + n) % this.m_nEnemyNum];
            if (n2 >= cEnemyDis.m_nXPos && n3 >= cEnemyDis.m_nZPos && n2 <= cEnemyDis.m_nXPos + cEnemyDis.m_nXSize && n3 <= cEnemyDis.m_nZPos + cEnemyDis.m_nZSize && CAreaParam.CheckIf(cEnemyDis.m_nIf) && n4 - cEnemyDis.m_nRnd1 > Calc3D.Rand(n6 = cEnemyDis.m_nRnd2 - cEnemyDis.m_nRnd1) && n4 - cEnemyDis.m_nRnd1 > Calc3D.Rand(n6) && n4 - cEnemyDis.m_nRnd1 > Calc3D.Rand(n6)) {
                return cEnemyDis.m_nKind;
            }
            ++n5;
        }
        return -1;
    }

    public int GetMapGround(int n, int n2) {
        int n3 = this.m_Map.GetPtr(n, n2);
        return this.m_Map.GetGround(n3);
    }

    public int GetMapXNum() {
        return this.m_nMapXNum;
    }

    public int GetMapZNum() {
        return this.m_nMapZNum;
    }

    public void CheckDoor(ARpg aRpg, int n, int n2) {
        int n3 = this.m_Map.GetPtr(n, n2);
        int n4 = this.m_Map.GetMapTable(n3) & 0xFC;
        if (n4 == 64 && aRpg.m_Play.GetItem(147) > 0 || n4 == 80 && aRpg.m_Play.GetItem(148) > 0) {
            aRpg.MainFrame();
            aRpg.PlaySeG(8);
            this.m_Map.SetMapTable(n3, 0);
            this.m_Map.SetHit(n3, (byte)0);
            aRpg.MainFrame();
        }
    }

    public boolean CheckEnemy(int n, int n2) {
        int n3 = 0;
        while (n3 < this.m_nEnemyNum) {
            CEnemyDis cEnemyDis = this.m_acEnemy[n3];
            if (n >= cEnemyDis.m_nXPos && n2 >= cEnemyDis.m_nZPos && n <= cEnemyDis.m_nXPos + cEnemyDis.m_nXSize && n2 <= cEnemyDis.m_nZPos + cEnemyDis.m_nZSize && CAreaParam.CheckIf(cEnemyDis.m_nIf)) {
                return true;
            }
            ++n3;
        }
        return false;
    }

    public static boolean CheckIf(int n) {
        if (n == -1) {
            return true;
        }
        if (n < 10000) {
            return Vari.m_App.m_Play.GetEvtFlag(n);
        }
        return !Vari.m_App.m_Play.GetEvtFlag(n - 10000);
    }

    CAreaParam() {
    }

    public void SetMapModel(int n, int n2, int n3) {
        int n4 = this.m_Map.GetPtr(n, n2);
        this.m_Map.SetMapTable(n4, n3);
    }

    public boolean CheckWallVect(int n, CWEvent cWEvent) {
        int n2 = CMapData.GetXBlock(Vari.m_App.m_Player.m_vPos.x);
        int n3 = CMapData.GetZBlock(Vari.m_App.m_Player.m_vPos.z);
        if (cWEvent.m_nVect == 15 && (cWEvent.m_nXPos == n2 || cWEvent.m_nZPos == n3)) {
            return true;
        }
        if ((n & cWEvent.m_nVect) == 0) {
            return false;
        }
        if ((cWEvent.m_nVect & 1) != 0 && cWEvent.m_nXPos == n2 && cWEvent.m_nZPos == n3 + 1) {
            return true;
        }
        if ((cWEvent.m_nVect & 2) != 0 && cWEvent.m_nXPos == n2 + 1 && cWEvent.m_nZPos == n3) {
            return true;
        }
        if ((cWEvent.m_nVect & 4) != 0 && cWEvent.m_nXPos == n2 && cWEvent.m_nZPos == n3 - 1) {
            return true;
        }
        return (cWEvent.m_nVect & 8) != 0 && cWEvent.m_nXPos == n2 - 1 && cWEvent.m_nZPos == n3;
    }
}

