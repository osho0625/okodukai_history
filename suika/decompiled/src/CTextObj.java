/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CTextObj {
    static final int MAX_FRAME = 16;
    static final int[] m_anYAdd = new int[]{0, -6, -10, -12, -13, -12, -10, -6, 0, -3, -4, -4, -3, 0, -2, -3};
    public String m_strText;
    public D3DXVECTOR3 m_vPos = new D3DXVECTOR3();
    public int m_nCount;
    public Color m_Color;

    public int GetYAdd() {
        return m_anYAdd[16 - this.m_nCount - 1];
    }

    CTextObj() {
    }

    public boolean Move() {
        if (this.m_nCount != 0) {
            this.m_nCount += -1;
            return true;
        }
        return false;
    }
}

