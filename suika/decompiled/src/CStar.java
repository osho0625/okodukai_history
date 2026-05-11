/*
 * Decompiled with CFR 0.152.
 */
class CStar {
    static final float MAX_POSITION = 700.0f;
    public D3DXVECTOR3 m_vPos = new D3DXVECTOR3();
    public float m_fSize;
    public int m_nColor;
    public float m_fSpeed;

    CStar() {
    }

    public void Init() {
        int n = 1400;
        this.m_vPos.x = (float)Calc3D.Rand(n) - 700.0f;
        this.m_vPos.z = (float)Calc3D.Rand(n) - 700.0f - 150.0f;
        this.m_fSpeed = (float)Calc3D.Rand(5) * 5.0f;
    }

    public void Move() {
        this.m_vPos.x -= this.m_fSpeed;
        this.m_vPos.z += this.m_fSpeed * 0.75f;
        if (this.m_vPos.x < -700.0f) {
            this.m_vPos.x += 1400.0f;
        }
        if (this.m_vPos.z > 700.0f) {
            this.m_vPos.z -= 1550.0f;
        }
    }
}

