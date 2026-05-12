/*
 * Decompiled with CFR 0.152.
 */
class CDrawSort {
    static final int MAX_TABLE = 512;
    static final int ID_NONE = -1;
    static final int ID_MAP = 1;
    static final int ID_OBJECT = 2;
    static final int ID_SHADOW = 3;
    static final int ID_EFFECT = 4;
    static final int ID_UPOBJ = 5;
    static final float ADD_MAP = 0.0f;
    static final float ADD_OBJECT = 50.0f;
    static final float ADD_SHADOW = 10000.0f;
    static final float ADD_EFFECT = -10000.0f;
    static final float ADD_UPOBJ = 30.0f;
    private CSortWork[] m_acWork;
    private int m_nPtr;
    private int[] m_anTable = new int[512];

    public void RecObject(int n, int n2, CCalcBndBox cCalcBndBox, CModelTrans cModelTrans, int n3, int n4) {
        if (this.m_nPtr >= 512) {
            return;
        }
        float f = cCalcBndBox.m_fZPos * 10.0f + Calc3D.Abs(cCalcBndBox.m_fXPos) * 2.0f;
        this.m_acWork[this.m_nPtr].m_nID = n;
        this.m_acWork[this.m_nPtr].m_nModelNo = n2;
        this.m_acWork[this.m_nPtr].m_fZPos = f;
        this.m_acWork[this.m_nPtr].m_cTrans.Set(cModelTrans);
        this.m_acWork[this.m_nPtr].m_nFlag = n3;
        this.m_acWork[this.m_nPtr].m_nColor = n4;
        switch (n) {
            case 1: {
                this.m_acWork[this.m_nPtr].m_fZPos += 0.0f;
                break;
            }
            case 2: {
                this.m_acWork[this.m_nPtr].m_fZPos += 50.0f;
                break;
            }
            case 3: {
                this.m_acWork[this.m_nPtr].m_fZPos += 10000.0f;
                break;
            }
            case 4: {
                this.m_acWork[this.m_nPtr].m_fZPos += -10000.0f;
                break;
            }
            case 5: {
                this.m_acWork[this.m_nPtr].m_fZPos += 30.0f;
            }
        }
        if ((n3 & 4) != 0) {
            this.m_acWork[this.m_nPtr].m_fZPos += 10000.0f;
        }
        if ((n3 & 8) != 0) {
            this.m_acWork[this.m_nPtr].m_fZPos -= 10000.0f;
        }
        if ((n3 & 0x80) != 0) {
            this.m_acWork[this.m_nPtr].m_fZPos -= 50000.0f;
        }
        ++this.m_nPtr;
    }

    public CSortWork GetSortObj(int n) {
        return this.m_acWork[this.m_anTable[n]];
    }

    public void Sort() {
        int n = 0;
        while (n < this.m_nPtr - 1) {
            int n2 = n + 1;
            while (n2 < this.m_nPtr) {
                int n3 = this.m_anTable[n];
                int n4 = this.m_anTable[n2];
                if (this.m_acWork[n3].m_fZPos < this.m_acWork[n4].m_fZPos) {
                    this.m_anTable[n] = n4;
                    this.m_anTable[n2] = n3;
                }
                ++n2;
            }
            ++n;
        }
    }

    public void Clear() {
        int n = 0;
        do {
            this.m_acWork[n].m_nID = -1;
            this.m_anTable[n] = n;
        } while (++n < 512);
        this.m_nPtr = 0;
    }

    public int GetRecMax() {
        return this.m_nPtr;
    }

    CDrawSort() {
        this.m_acWork = new CSortWork[512];
        int n = 0;
        do {
            this.m_acWork[n] = new CSortWork();
        } while (++n < 512);
        this.Clear();
    }
}

