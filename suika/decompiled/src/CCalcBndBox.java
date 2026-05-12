/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CCalcBndBox {
    public D3DXVECTOR3[] m_avCalc = new D3DXVECTOR3[8];
    public float m_fXPos;
    public float m_fZPos;

    public boolean CheckDisplayInPlane() {
        return this.CheckDisplayIn(4);
    }

    public void Draw(CRender3D cRender3D) {
        int[][] nArrayArray = new int[][]{{0, 1}, {1, 2}, {2, 3}, {3, 0}, {0, 4}, {1, 5}, {2, 6}, {3, 7}, {4, 5}, {5, 6}, {6, 7}, {7, 4}};
        cRender3D.SetColor(Color.white);
        int n = 0;
        do {
            cRender3D.DrawLine(this.m_avCalc[nArrayArray[n][0]], this.m_avCalc[nArrayArray[n][1]]);
        } while (++n < 12);
    }

    public void Set(CCalcBndBox cCalcBndBox) {
        this.m_fXPos = cCalcBndBox.m_fXPos;
        this.m_fZPos = cCalcBndBox.m_fZPos;
        int n = 0;
        do {
            this.m_avCalc[n].Set(cCalcBndBox.m_avCalc[n]);
        } while (++n < 8);
    }

    public boolean CheckDisplayIn() {
        return this.CheckDisplayIn(8);
    }

    private boolean CheckDisplayIn(int n) {
        int n2 = 0;
        while (n2 < n) {
            if (this.m_avCalc[n2].z > 400.0f) break;
            ++n2;
        }
        if (n2 == n) {
            return false;
        }
        int n3 = 0;
        int n4 = 0;
        n2 = 0;
        while (n2 < n) {
            if (this.m_avCalc[n2].x < 0.0f) {
                --n3;
            }
            if (this.m_avCalc[n2].x >= 400.0f) {
                ++n3;
            }
            if (this.m_avCalc[n2].y < -50.0f) {
                --n4;
            }
            if (this.m_avCalc[n2].y >= 370.0f) {
                ++n4;
            }
            if (this.m_avCalc[n2].x > 5000.0f) {
                return false;
            }
            if (this.m_avCalc[n2].x < -5000.0f) {
                return false;
            }
            if (this.m_avCalc[n2].y > 5000.0f) {
                return false;
            }
            if (this.m_avCalc[n2].y < -5000.0f) {
                return false;
            }
            ++n2;
        }
        return n3 != n && n3 != -n && n4 != n && n4 != -n;
    }

    CCalcBndBox() {
        int n = 0;
        do {
            this.m_avCalc[n] = new D3DXVECTOR3();
        } while (++n < 8);
    }
}

