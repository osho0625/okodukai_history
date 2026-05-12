/*
 * Decompiled with CFR 0.152.
 */
class D3DXCOLOR {
    public int r;
    public int g;
    public int b;

    public void Set(int n, int n2, int n3) {
        this.r = n;
        this.g = n2;
        this.b = n3;
    }

    public void Set(D3DXCOLOR d3DXCOLOR) {
        this.r = d3DXCOLOR.r;
        this.g = d3DXCOLOR.g;
        this.b = d3DXCOLOR.b;
    }

    D3DXCOLOR() {
    }

    D3DXCOLOR(int n, int n2, int n3) {
        this.Set(n, n2, n3);
    }

    public void Add(D3DXCOLOR d3DXCOLOR) {
        this.r += d3DXCOLOR.r;
        this.g += d3DXCOLOR.g;
        this.b += d3DXCOLOR.b;
        if (this.r > 255) {
            this.r = 255;
        }
        if (this.g > 255) {
            this.g = 255;
        }
        if (this.b > 255) {
            this.b = 255;
        }
    }

    public void Limits() {
        if (this.r < 0) {
            this.r = 0;
        }
        if (this.g < 0) {
            this.g = 0;
        }
        if (this.b < 0) {
            this.b = 0;
        }
        if (this.r > 255) {
            this.r = 255;
        }
        if (this.g > 255) {
            this.g = 255;
        }
        if (this.b > 255) {
            this.b = 255;
        }
    }

    public void Mul(D3DXCOLOR d3DXCOLOR) {
        this.r = this.r * d3DXCOLOR.r / 255;
        this.g = this.g * d3DXCOLOR.g / 255;
        this.b = this.b * d3DXCOLOR.b / 255;
    }
}

