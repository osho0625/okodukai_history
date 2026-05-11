/*
 * Decompiled with CFR 0.152.
 */
class CDrawMap
extends CRender3D {
    private CGroundArea m_GArea = new CGroundArea();

    public void DrawGround(CAreaParam cAreaParam) {
        this.m_GArea.Clear();
        ARpg aRpg = this.GetApplet();
        int n = cAreaParam.GetMapXNum();
        int n2 = cAreaParam.GetMapZNum();
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(0.0f, 0.0f, 0.0f);
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3(1.0f, 1.0f, 1.0f);
        CCalcBndBox cCalcBndBox = new CCalcBndBox();
        CModelTrans cModelTrans = new CModelTrans();
        cModelTrans.m_mWVP = this.GetWVPMatrix();
        D3DXVECTOR3 d3DXVECTOR33 = new D3DXVECTOR3();
        int n3 = 0;
        do {
            int n4 = 0;
            int n5 = 0;
            while (n5 < n2) {
                int n6 = 0;
                while (n6 < n) {
                    int n7 = cAreaParam.GetGroundNum(n4);
                    if (n7 != 0 && n3 == this.IsFirstGround(n7)) {
                        int n8 = CMapData.GetGroundModel(n7);
                        if (n8 == 9) {
                            n8 = (aRpg.m_nMainCount >> 1 & 3) + 9;
                        }
                        if (n8 < 0 || n8 >= 204) {
                            // empty if block
                        }
                        d3DXVECTOR33.x = CMapData.GetXPos(n6);
                        d3DXVECTOR33.z = CMapData.GetZPos(n5);
                        this.CalcModel(aRpg.m_aModel[n8], cCalcBndBox, d3DXVECTOR33, d3DXVECTOR3, d3DXVECTOR32, 1);
                        if (cCalcBndBox.CheckDisplayInPlane()) {
                            cModelTrans.m_mWorld = this.GetTransform(3);
                            this.DrawModel(aRpg.m_aModel[n8], cModelTrans, 0, 0);
                            this.m_GArea.Add(n6, n5);
                        }
                    }
                    ++n4;
                    ++n6;
                }
                ++n5;
            }
        } while (++n3 < 2);
        this.m_GArea.Magnification(2);
    }

    CDrawMap() {
    }

    public void DrawMap(CAreaParam cAreaParam) {
        ARpg aRpg = this.GetApplet();
        int n = cAreaParam.GetMapXNum();
        int n2 = cAreaParam.GetMapZNum();
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(0.0f, 0.0f, 0.0f);
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3(1.0f, 1.0f, 1.0f);
        this.GetWVPMatrix();
        CModelTrans cModelTrans = new CModelTrans();
        D3DXVECTOR3 d3DXVECTOR33 = new D3DXVECTOR3();
        int n3 = 0;
        int n4 = 0;
        while (n4 < n2) {
            int n5 = 0;
            while (n5 < n) {
                int n6 = aRpg.m_NowMapData.GetMapTable(n3);
                CCalcBndBox cCalcBndBox = aRpg.m_NowMapData.GetBndBox(n3);
                if (n6 != 0 && this.m_GArea.CheckDisplayIn(n5, n4)) {
                    int n7 = n6 >> 2;
                    int n8 = CMapData.GetMapModel(n7);
                    d3DXVECTOR3.y = (float)(n6 & 3) * 1.5707964f;
                    d3DXVECTOR33.x = CMapData.GetXPos(n5);
                    d3DXVECTOR33.z = CMapData.GetZPos(n4);
                    this.CalcModel(aRpg.m_aModel[n8], cCalcBndBox, d3DXVECTOR33, d3DXVECTOR3, d3DXVECTOR32, 0);
                    if (cCalcBndBox.CheckDisplayIn()) {
                        cModelTrans.m_mWorld = this.GetTransform(3);
                        cModelTrans.m_mWVP = this.GetWVPMatrix();
                        aRpg.m_Sort.RecObject(1, n8, cCalcBndBox, cModelTrans, 0, 0);
                    }
                }
                ++n3;
                ++n5;
            }
            ++n4;
        }
    }

    public int IsFirstGround(int n) {
        if (n == 9) {
            return 0;
        }
        return 1;
    }

    public void DrawGround_Battle(CBattleInfo cBattleInfo) {
        if (cBattleInfo.m_nGround == -1) {
            return;
        }
        ARpg aRpg = this.GetApplet();
        int n = cBattleInfo.m_nGround;
        if (n == 9) {
            n = (aRpg.m_nBMainCount >> 1 & 3) + 9;
        }
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(0.0f, 0.0f, 0.0f);
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3(1.0f, 1.0f, 1.0f);
        CCalcBndBox cCalcBndBox = new CCalcBndBox();
        CModelTrans cModelTrans = new CModelTrans();
        cModelTrans.m_mWVP = this.GetWVPMatrix();
        D3DXVECTOR3 d3DXVECTOR33 = new D3DXVECTOR3();
        int n2 = 0;
        do {
            int n3 = 0;
            do {
                d3DXVECTOR33.x = 200.0f * (float)n3 - 800.0f;
                d3DXVECTOR33.z = 200.0f * (float)n2 - 800.0f;
                this.CalcModel(aRpg.m_aModel[n], cCalcBndBox, d3DXVECTOR33, d3DXVECTOR3, d3DXVECTOR32, 1);
                if (!cCalcBndBox.CheckDisplayInPlane()) continue;
                cModelTrans.m_mWorld = this.GetTransform(3);
                this.DrawModel(aRpg.m_aModel[n], cModelTrans, 0, 0);
            } while (++n3 < 9);
        } while (++n2 < 9);
    }
}

