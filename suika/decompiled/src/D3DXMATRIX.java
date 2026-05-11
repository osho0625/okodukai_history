/*
 * Decompiled with CFR 0.152.
 */
class D3DXMATRIX {
    public float _11;
    public float _12;
    public float _13;
    public float _14;
    public float _21;
    public float _22;
    public float _23;
    public float _24;
    public float _31;
    public float _32;
    public float _33;
    public float _34;
    public float _41;
    public float _42;
    public float _43;
    public float _44;

    public float GetTransrateY() {
        return this._42;
    }

    void Mult3(D3DXMATRIX d3DXMATRIX) {
        float f = this._11 * d3DXMATRIX._11 + this._12 * d3DXMATRIX._21 + this._13 * d3DXMATRIX._31;
        float f2 = this._11 * d3DXMATRIX._12 + this._12 * d3DXMATRIX._22 + this._13 * d3DXMATRIX._32;
        float f3 = this._11 * d3DXMATRIX._13 + this._12 * d3DXMATRIX._23 + this._13 * d3DXMATRIX._33;
        float f4 = this._21 * d3DXMATRIX._11 + this._22 * d3DXMATRIX._21 + this._23 * d3DXMATRIX._31;
        float f5 = this._21 * d3DXMATRIX._12 + this._22 * d3DXMATRIX._22 + this._23 * d3DXMATRIX._32;
        float f6 = this._21 * d3DXMATRIX._13 + this._22 * d3DXMATRIX._23 + this._23 * d3DXMATRIX._33;
        float f7 = this._31 * d3DXMATRIX._11 + this._32 * d3DXMATRIX._21 + this._33 * d3DXMATRIX._31;
        float f8 = this._31 * d3DXMATRIX._12 + this._32 * d3DXMATRIX._22 + this._33 * d3DXMATRIX._32;
        float f9 = this._31 * d3DXMATRIX._13 + this._32 * d3DXMATRIX._23 + this._33 * d3DXMATRIX._33;
        this._11 = f;
        this._12 = f2;
        this._13 = f3;
        this._21 = f4;
        this._22 = f5;
        this._23 = f6;
        this._31 = f7;
        this._32 = f8;
        this._33 = f9;
    }

    void View(D3DXVECTOR3 d3DXVECTOR3, D3DXVECTOR3 d3DXVECTOR32, D3DXVECTOR3 d3DXVECTOR33) {
        D3DXVECTOR3 d3DXVECTOR34 = new D3DXVECTOR3();
        d3DXVECTOR34.x = d3DXVECTOR32.x - d3DXVECTOR3.x;
        d3DXVECTOR34.y = d3DXVECTOR32.y - d3DXVECTOR3.y;
        d3DXVECTOR34.z = d3DXVECTOR32.z - d3DXVECTOR3.z;
        d3DXVECTOR34.Normalize();
        float f = d3DXVECTOR33.DotProduct(d3DXVECTOR34);
        D3DXVECTOR3 d3DXVECTOR35 = new D3DXVECTOR3();
        d3DXVECTOR35.x = d3DXVECTOR33.x - f * d3DXVECTOR34.x;
        d3DXVECTOR35.y = d3DXVECTOR33.y - f * d3DXVECTOR34.y;
        d3DXVECTOR35.z = d3DXVECTOR33.z - f * d3DXVECTOR34.z;
        d3DXVECTOR35.Normalize();
        D3DXVECTOR3 d3DXVECTOR36 = new D3DXVECTOR3();
        d3DXVECTOR36.CrossProduct(d3DXVECTOR35, d3DXVECTOR34);
        this._11 = d3DXVECTOR36.x;
        this._12 = d3DXVECTOR35.x;
        this._13 = d3DXVECTOR34.x;
        this._14 = 0.0f;
        this._21 = d3DXVECTOR36.y;
        this._22 = d3DXVECTOR35.y;
        this._23 = d3DXVECTOR34.y;
        this._24 = 0.0f;
        this._31 = d3DXVECTOR36.z;
        this._32 = d3DXVECTOR35.z;
        this._33 = d3DXVECTOR34.z;
        this._34 = 0.0f;
        this._41 = -d3DXVECTOR3.DotProduct(d3DXVECTOR36);
        this._42 = -d3DXVECTOR3.DotProduct(d3DXVECTOR35);
        this._43 = -d3DXVECTOR3.DotProduct(d3DXVECTOR34);
        this._44 = 1.0f;
    }

    void Set(D3DXMATRIX d3DXMATRIX) {
        this._11 = d3DXMATRIX._11;
        this._21 = d3DXMATRIX._21;
        this._31 = d3DXMATRIX._31;
        this._41 = d3DXMATRIX._41;
        this._12 = d3DXMATRIX._12;
        this._22 = d3DXMATRIX._22;
        this._32 = d3DXMATRIX._32;
        this._42 = d3DXMATRIX._42;
        this._13 = d3DXMATRIX._13;
        this._23 = d3DXMATRIX._23;
        this._33 = d3DXMATRIX._33;
        this._43 = d3DXMATRIX._43;
        this._14 = d3DXMATRIX._14;
        this._24 = d3DXMATRIX._24;
        this._34 = d3DXMATRIX._34;
        this._44 = d3DXMATRIX._44;
    }

    D3DXMATRIX() {
        this.Identity();
    }

    public void RotateY(float f) {
        this.Identity();
        this._11 = (float)Math.cos(f);
        this._13 = -((float)Math.sin(f));
        this._31 = (float)Math.sin(f);
        this._33 = (float)Math.cos(f);
    }

    public void Transrate(float f, float f2, float f3) {
        this.Identity();
        this._41 = f;
        this._42 = f2;
        this._43 = f3;
    }

    void Mult(D3DXMATRIX d3DXMATRIX) {
        float f = this._11 * d3DXMATRIX._11 + this._12 * d3DXMATRIX._21 + this._13 * d3DXMATRIX._31 + this._14 * d3DXMATRIX._41;
        float f2 = this._11 * d3DXMATRIX._12 + this._12 * d3DXMATRIX._22 + this._13 * d3DXMATRIX._32 + this._14 * d3DXMATRIX._42;
        float f3 = this._11 * d3DXMATRIX._13 + this._12 * d3DXMATRIX._23 + this._13 * d3DXMATRIX._33 + this._14 * d3DXMATRIX._43;
        float f4 = this._11 * d3DXMATRIX._14 + this._12 * d3DXMATRIX._24 + this._13 * d3DXMATRIX._34 + this._14 * d3DXMATRIX._44;
        float f5 = this._21 * d3DXMATRIX._11 + this._22 * d3DXMATRIX._21 + this._23 * d3DXMATRIX._31 + this._24 * d3DXMATRIX._41;
        float f6 = this._21 * d3DXMATRIX._12 + this._22 * d3DXMATRIX._22 + this._23 * d3DXMATRIX._32 + this._24 * d3DXMATRIX._42;
        float f7 = this._21 * d3DXMATRIX._13 + this._22 * d3DXMATRIX._23 + this._23 * d3DXMATRIX._33 + this._24 * d3DXMATRIX._43;
        float f8 = this._21 * d3DXMATRIX._14 + this._22 * d3DXMATRIX._24 + this._23 * d3DXMATRIX._34 + this._24 * d3DXMATRIX._44;
        float f9 = this._31 * d3DXMATRIX._11 + this._32 * d3DXMATRIX._21 + this._33 * d3DXMATRIX._31 + this._34 * d3DXMATRIX._41;
        float f10 = this._31 * d3DXMATRIX._12 + this._32 * d3DXMATRIX._22 + this._33 * d3DXMATRIX._32 + this._34 * d3DXMATRIX._42;
        float f11 = this._31 * d3DXMATRIX._13 + this._32 * d3DXMATRIX._23 + this._33 * d3DXMATRIX._33 + this._34 * d3DXMATRIX._43;
        float f12 = this._31 * d3DXMATRIX._14 + this._32 * d3DXMATRIX._24 + this._33 * d3DXMATRIX._34 + this._34 * d3DXMATRIX._44;
        float f13 = this._41 * d3DXMATRIX._11 + this._42 * d3DXMATRIX._21 + this._43 * d3DXMATRIX._31 + this._44 * d3DXMATRIX._41;
        float f14 = this._41 * d3DXMATRIX._12 + this._42 * d3DXMATRIX._22 + this._43 * d3DXMATRIX._32 + this._44 * d3DXMATRIX._42;
        float f15 = this._41 * d3DXMATRIX._13 + this._42 * d3DXMATRIX._23 + this._43 * d3DXMATRIX._33 + this._44 * d3DXMATRIX._43;
        float f16 = this._41 * d3DXMATRIX._14 + this._42 * d3DXMATRIX._24 + this._43 * d3DXMATRIX._34 + this._44 * d3DXMATRIX._44;
        this._11 = f;
        this._12 = f2;
        this._13 = f3;
        this._14 = f4;
        this._21 = f5;
        this._22 = f6;
        this._23 = f7;
        this._24 = f8;
        this._31 = f9;
        this._32 = f10;
        this._33 = f11;
        this._34 = f12;
        this._41 = f13;
        this._42 = f14;
        this._43 = f15;
        this._44 = f16;
    }

    D3DXVECTOR3 Transform(D3DXVECTOR3 d3DXVECTOR3) {
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        d3DXVECTOR32.x = this._11 * d3DXVECTOR3.x + this._21 * d3DXVECTOR3.y + this._31 * d3DXVECTOR3.z + this._41;
        d3DXVECTOR32.y = this._12 * d3DXVECTOR3.x + this._22 * d3DXVECTOR3.y + this._32 * d3DXVECTOR3.z + this._42;
        d3DXVECTOR32.z = this._13 * d3DXVECTOR3.x + this._23 * d3DXVECTOR3.y + this._33 * d3DXVECTOR3.z + this._43;
        return d3DXVECTOR32;
    }

    public void RotateZ(float f) {
        this.Identity();
        this._11 = (float)Math.cos(f);
        this._12 = (float)Math.sin(f);
        this._21 = -((float)Math.sin(f));
        this._22 = (float)Math.cos(f);
    }

    void Projection(float f, float f2, float f3, float f4) {
        float f5 = (float)(Math.cos(f3 * 0.5f) / Math.sin(f3 * 0.5f));
        float f6 = f4 * f5;
        float f7 = 1.0f * f5;
        float f8 = f2 / (f2 - f);
        this.Identity();
        this._11 = f6;
        this._22 = f7;
        this._33 = f8;
        this._34 = 1.0f;
        this._43 = -f8 * f;
    }

    public void Identity() {
        this._24 = 0.0f;
        this._23 = 0.0f;
        this._21 = 0.0f;
        this._14 = 0.0f;
        this._13 = 0.0f;
        this._12 = 0.0f;
        this._43 = 0.0f;
        this._42 = 0.0f;
        this._41 = 0.0f;
        this._34 = 0.0f;
        this._32 = 0.0f;
        this._31 = 0.0f;
        this._44 = 1.0f;
        this._33 = 1.0f;
        this._22 = 1.0f;
        this._11 = 1.0f;
    }

    public void RotateX(float f) {
        this.Identity();
        this._22 = (float)Math.cos(f);
        this._23 = (float)Math.sin(f);
        this._32 = -((float)Math.sin(f));
        this._33 = (float)Math.cos(f);
    }

    public void Scale(float f, float f2, float f3) {
        this.Identity();
        this._11 = f;
        this._22 = f2;
        this._33 = f3;
    }
}

