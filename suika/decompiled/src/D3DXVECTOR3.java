/*
 * Decompiled with CFR 0.152.
 */
class D3DXVECTOR3 {
    public float x;
    public float y;
    public float z;

    void Set(D3DXVECTOR3 d3DXVECTOR3) {
        this.x = d3DXVECTOR3.x;
        this.y = d3DXVECTOR3.y;
        this.z = d3DXVECTOR3.z;
    }

    void Add(D3DXVECTOR3 d3DXVECTOR3) {
        this.x += d3DXVECTOR3.x;
        this.y += d3DXVECTOR3.y;
        this.z += d3DXVECTOR3.z;
    }

    public float CalcDistanceXZ(D3DXVECTOR3 d3DXVECTOR3) {
        return (float)Math.sqrt((this.x - d3DXVECTOR3.x) * (this.x - d3DXVECTOR3.x) + (this.z - d3DXVECTOR3.z) * (this.z - d3DXVECTOR3.z));
    }

    D3DXVECTOR3() {
        this.x = 0.0f;
        this.y = 0.0f;
        this.z = 0.0f;
    }

    D3DXVECTOR3(float f, float f2, float f3) {
        this.x = f;
        this.y = f2;
        this.z = f3;
    }

    D3DXVECTOR3(D3DXVECTOR3 d3DXVECTOR3) {
        this.x = d3DXVECTOR3.x;
        this.y = d3DXVECTOR3.y;
        this.z = d3DXVECTOR3.z;
    }

    void Sub(D3DXVECTOR3 d3DXVECTOR3) {
        this.x -= d3DXVECTOR3.x;
        this.y -= d3DXVECTOR3.y;
        this.z -= d3DXVECTOR3.z;
    }

    public float Magnitude() {
        return (float)Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    public boolean Cmp(D3DXVECTOR3 d3DXVECTOR3) {
        return Calc3D.NearZero(this.x - d3DXVECTOR3.x) && Calc3D.NearZero(this.y - d3DXVECTOR3.y) && Calc3D.NearZero(this.z - d3DXVECTOR3.z);
    }

    public void Normalize() {
        float f = this.Magnitude();
        this.x /= f;
        this.y /= f;
        this.z /= f;
    }

    public float DotProduct(D3DXVECTOR3 d3DXVECTOR3) {
        return this.x * d3DXVECTOR3.x + this.y * d3DXVECTOR3.y + this.z * d3DXVECTOR3.z;
    }

    public void CrossProduct(D3DXVECTOR3 d3DXVECTOR3, D3DXVECTOR3 d3DXVECTOR32) {
        this.x = d3DXVECTOR3.y * d3DXVECTOR32.z - d3DXVECTOR3.z * d3DXVECTOR32.y;
        this.y = d3DXVECTOR3.z * d3DXVECTOR32.x - d3DXVECTOR3.x * d3DXVECTOR32.z;
        this.z = d3DXVECTOR3.x * d3DXVECTOR32.y - d3DXVECTOR3.y * d3DXVECTOR32.x;
    }

    public float CalcDistance(D3DXVECTOR3 d3DXVECTOR3) {
        return (float)Math.sqrt((this.x - d3DXVECTOR3.x) * (this.x - d3DXVECTOR3.x) + (this.y - d3DXVECTOR3.y) * (this.y - d3DXVECTOR3.y) + (this.z - d3DXVECTOR3.z) * (this.z - d3DXVECTOR3.z));
    }
}

