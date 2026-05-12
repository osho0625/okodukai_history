/*
 * Decompiled with CFR 0.152.
 */
import java.util.Random;

class Calc3D {
    static final float PI_05 = 1.5707964f;
    static final float PI = (float)Math.PI;
    static final float PI_15 = 4.712389f;
    static final float PI_20 = (float)Math.PI * 2;
    static final float NEAR_ZERO = 1.0E-6f;
    public static Random m_Rnd = new Random(2L);

    public static float RadLimits(float f) {
        if (f >= (float)Math.PI * 2) {
            f -= (float)Math.PI * 2;
        }
        if (f < 0.0f) {
            f += (float)Math.PI * 2;
        }
        return f;
    }

    public static D3DXVECTOR3 Angle2Vect(float f) {
        D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3();
        d3DXVECTOR3.x = -Calc3D.Sin(f);
        d3DXVECTOR3.z = -Calc3D.Cos(f);
        return d3DXVECTOR3;
    }

    public static float RADtoDEG(float f) {
        return f / (float)Math.PI * 180.0f;
    }

    public static float Atan2(float f, float f2) {
        return (float)Math.atan2(f, f2);
    }

    public static String NumberString(int n, int n2) {
        boolean bl = false;
        String string = new String();
        int n3 = 0;
        while (n3 < n2) {
            int n4 = Calc3D.GetKetaSuji(n, n2 - n3);
            if (n4 > 0 || bl || n3 == n2 - 1) {
                string = string + Def.ZENKAKU_SUJI[n4];
                bl = true;
            } else {
                string = string + "\u3000";
            }
            ++n3;
        }
        return string;
    }

    public static float Sin(float f) {
        return (float)Math.sin(f);
    }

    public static int Rad2Int(float f) {
        if ((f = Calc3D.RadLimits(f)) >= 0.0f && f <= 0.9424779f) {
            return 0;
        }
        if (f >= 0.62831855f && f <= 2.5132742f) {
            return 1;
        }
        if (f >= 2.1991148f && f <= 4.08407f) {
            return 2;
        }
        if (f >= 3.7699115f && f <= 5.6548667f) {
            return 3;
        }
        if (f >= 5.340708f) {
            return 0;
        }
        return 0;
    }

    public static int GetKetaSuji(int n, int n2) {
        int n3 = 1;
        while (n2 > 0) {
            n3 *= 10;
            --n2;
        }
        n %= n3;
        return (n - n % (n3 /= 10)) / n3;
    }

    Calc3D() {
    }

    public static boolean NearZero(float f) {
        return f > -1.0E-6f && f < 1.0E-6f;
    }

    public static float CalcAngleVect(float f, float f2) {
        float f3;
        float f4 = Calc3D.RadLimits(Calc3D.Abs((f = Calc3D.RadLimits(f)) - (f2 = Calc3D.RadLimits(f2))));
        if (f4 < (f3 = Calc3D.RadLimits(Calc3D.Abs((float)Math.PI * 2 - f4)))) {
            return f4;
        }
        return f3;
    }

    public static String AddStringSpace(String string, int n) {
        int n2 = n - string.length();
        int n3 = 0;
        while (n3 < n2) {
            string = string + "\u3000";
            ++n3;
        }
        return string;
    }

    public static float CalcAngleXZ(D3DXVECTOR3 d3DXVECTOR3, D3DXVECTOR3 d3DXVECTOR32) {
        float f = d3DXVECTOR3.x - d3DXVECTOR32.x;
        float f2 = d3DXVECTOR3.z - d3DXVECTOR32.z;
        if (Calc3D.NearZero(f) && Calc3D.NearZero(f2)) {
            return 0.0f;
        }
        return Calc3D.Atan2(f, f2);
    }

    public static float CalcAngleXZ(D3DXVECTOR3 d3DXVECTOR3) {
        float f = -d3DXVECTOR3.x;
        float f2 = -d3DXVECTOR3.z;
        if (Calc3D.NearZero(f) && Calc3D.NearZero(f2)) {
            return 0.0f;
        }
        return Calc3D.Atan2(f, f2);
    }

    public static int Rad2IntBit(float f) {
        int n = 0;
        if ((f = Calc3D.RadLimits(f)) >= 0.0f && f <= 0.9424779f) {
            n |= 1;
        }
        if (f >= 0.62831855f && f <= 2.5132742f) {
            n |= 2;
        }
        if (f >= 2.1991148f && f <= 4.08407f) {
            n |= 4;
        }
        if (f >= 3.7699115f && f <= 5.6548667f) {
            n |= 8;
        }
        if (f >= 5.340708f) {
            n |= 1;
        }
        return n;
    }

    public static float Cos(float f) {
        return (float)Math.cos(f);
    }

    public static float Sqrt(float f) {
        return (float)Math.sqrt(f);
    }

    public static int Rad2Int8(float f) {
        int n = Calc3D.Rad2IntBit(f);
        if ((n & 4) != 0) {
            if ((n & 8) != 0) {
                return 8;
            }
            if ((n & 2) != 0) {
                return 2;
            }
            return 1;
        }
        if ((n & 1) != 0) {
            if ((n & 8) != 0) {
                return 6;
            }
            if ((n & 2) != 0) {
                return 4;
            }
            return 5;
        }
        if ((n & 8) != 0) {
            return 7;
        }
        if ((n & 2) != 0) {
            return 3;
        }
        return 0;
    }

    public static float TurnAngleSoftPlus(float f, float f2, float f3) {
        float f4 = f2 - f;
        if (f4 > (float)Math.PI) {
            f4 -= (float)Math.PI * 2;
        } else if (f4 < (float)(-Math.PI)) {
            f4 += (float)Math.PI * 2;
        }
        if (Calc3D.Abs(f4) < f3 * 4.0f) {
            f3 = Calc3D.Abs(f4) * 0.3f;
        }
        if ((f4 = f + f3) > (float)Math.PI) {
            f4 -= (float)Math.PI * 2;
        }
        return f4;
    }

    public static float TurnAngleSoft(float f, float f2, float f3) {
        float f4 = f2 - f;
        if (f4 > (float)Math.PI) {
            f4 -= (float)Math.PI * 2;
        } else if (f4 < (float)(-Math.PI)) {
            f4 += (float)Math.PI * 2;
        }
        if (Calc3D.Abs(f4) < f3 * 4.0f) {
            f3 = Calc3D.Abs(f4) * 0.3f;
        }
        if (f4 < 0.0f) {
            f4 = f - f3;
            if (f4 < (float)(-Math.PI)) {
                f4 += (float)Math.PI * 2;
            }
        } else {
            f4 = f + f3;
            if (f4 > (float)Math.PI) {
                f4 -= (float)Math.PI * 2;
            }
        }
        return f4;
    }

    public static String NumberString2(int n, int n2) {
        boolean bl = false;
        String string = new String();
        int n3 = 0;
        while (n3 < n2) {
            int n4 = Calc3D.GetKetaSuji(n, n2 - n3);
            if (n4 > 0 || bl || n3 == n2 - 1) {
                string = string + Def.ZENKAKU_SUJI[n4];
                bl = true;
            }
            ++n3;
        }
        return string;
    }

    public static float Abs(float f) {
        if (f >= 0.0f) {
            return f;
        }
        return -f;
    }

    public static String NumberString0(int n, int n2) {
        String string = new String();
        int n3 = 0;
        while (n3 < n2) {
            int n4 = Calc3D.GetKetaSuji(n, n2 - n3);
            string = string + Def.ZENKAKU_SUJI[n4];
            ++n3;
        }
        return string;
    }

    public static int Rand(int n) {
        if (n == 0) {
            return 0;
        }
        int n2 = m_Rnd.nextInt();
        if (n2 < 0) {
            n2 = -n2;
        }
        return n2 % n;
    }

    public static float AngleRand() {
        return Calc3D.DEGtoRAD(Calc3D.Rand(360));
    }

    public static float DEGtoRAD(float f) {
        return f * (float)Math.PI / 180.0f;
    }

    public static float RadLimits45(float f) {
        if ((double)(f = Calc3D.RadLimits(f)) >= (double)0.3926991f && f <= 1.1780972f) {
            return 0.7853982f;
        }
        if ((double)f >= 1.178097277879715 && f <= 1.9634955f) {
            return 1.5707964f;
        }
        if ((double)f >= 1.9634954631328583 && f <= 2.7488937f) {
            return 2.3561945f;
        }
        if ((double)f >= 2.7488936483860016 && f <= 3.5342917f) {
            return (float)Math.PI;
        }
        if ((double)f >= 3.534291833639145 && f <= 4.31969f) {
            return 3.926991f;
        }
        if ((double)f >= 4.319690018892288 && f <= 5.105088f) {
            return 4.712389f;
        }
        if ((double)f >= 5.1050882041454315 && f <= 5.8904862f) {
            return 5.4977875f;
        }
        return 0.0f;
    }

    public static float TurnAngle(float f, float f2, float f3) {
        float f4 = f2 - f;
        if (f4 > (float)Math.PI) {
            f4 -= (float)Math.PI * 2;
        } else if (f4 < (float)(-Math.PI)) {
            f4 += (float)Math.PI * 2;
        }
        if (Calc3D.Abs(f4) < f3) {
            return f2;
        }
        if (f4 < 0.0f) {
            f4 = f - f3;
            if (f4 < (float)(-Math.PI)) {
                f4 += (float)Math.PI * 2;
            }
        } else {
            f4 = f + f3;
            if (f4 > (float)Math.PI) {
                f4 -= (float)Math.PI * 2;
            }
        }
        return f4;
    }
}

