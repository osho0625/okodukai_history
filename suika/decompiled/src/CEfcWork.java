/*
 * Decompiled with CFR 0.152.
 */
class CEfcWork
extends CFlag {
    static final int WORKUSE = 1;
    static final int IMAGE = 2;
    static final int DIVE = 8192;
    static final int SHADOW = 65536;
    static final int EFC_ATTACK = 0;
    static final int EFC_MAGIC = 1;
    static final int EFC_MAGIC_SUB = 2;
    static final int EFC_SPARK = 3;
    static final int EFC_SPARK_SUB = 4;
    static final int EFC_CHARM = 5;
    static final int EFC_DIAGRAM = 6;
    static final int EFC_LUCK = 7;
    static final int EFC_LUCK_SUB = 8;
    static final int EFC_POISON = 9;
    static final int EFC_HEALBALL = 10;
    static final int EFC_CURE = 11;
    static final int EFC_CURE_SUB = 12;
    static final int EFC_YARN = 13;
    static final int EFC_BLOOD = 14;
    static final int EFC_LDROP = 15;
    static final int EFC_PIYO1 = 16;
    static final int EFC_PIYO1_SUB = 17;
    static final int EFC_FBREATH = 20;
    static final int EFC_FBREATH_SUB = 21;
    static final int EFC_SHIELD = 22;
    static final int EFC_SHIELD2 = 23;
    static final int EFC_HEAL = 24;
    static final int EFC_ASSIST = 25;
    static final int EFC_ASSIST_SUB = 26;
    static final int EFC_HOLY = 27;
    static final int EFC_HOLY_ARROW = 28;
    static final int EFC_WIND = 29;
    static final int EFC_FIRE = 30;
    static final int EFC_SMOKE = 31;
    static final int EFC_SMOKE_SUB = 32;
    static final int EFC_CLOCK = 33;
    static final int EFC_WSHIELD = 34;
    static final int EFC_WSHIELD2 = 35;
    static final int EFC_SMOKE2 = 36;
    static final int EFC_STORE = 37;
    static final int EFC_STORE_SUB = 38;
    static final int EFC_WWIND = 39;
    static final int EFC_STONE = 40;
    static final int EFC_BLIND = 41;
    static final int EFC_BLIND_SUB = 42;
    static final int EFC_SWORD = 43;
    static final int EFC_BLIND1 = 44;
    static final int EFC_METEOR = 45;
    static final int EFC_EXPL = 46;
    static final int EFC_ORBIT = 47;
    static final int EFC_SPIRAL = 48;
    static final int EFC_SPIRALWIND = 49;
    static final int EFC_CLAW = 50;
    static final int EFC_CLAW_SUB = 51;
    static final int EFC_SHIELDU = 52;
    static final int EFC_UNA = 53;
    static final int EFC_FLARE_1 = 54;
    static final int EFC_FLARE_2 = 55;
    static final int EFC_FLARE_3 = 56;
    static final int EFC_FLARE_4 = 57;
    static final int EFC_GODDESS = 58;
    static final int EFC_MONKEYSPACE = 59;
    static final int EFC_FIREWOOD = 60;
    static final int EFC_FIREWOOD_SUB = 61;
    static final int EFC_GRAV_1 = 62;
    static final int EFC_GRAV_2 = 63;
    static final int EFC_HEAL_LINE = 64;
    static final int EFC_HEAL_LINE_SUB = 65;
    static final int EFC_MONKEY = 66;
    static final int EFC_GRAV_3 = 67;
    static final int EFC_DEADBONE = 68;
    static final int EFC_DEADBONE_SUB = 69;
    static final int EFC_RIJE = 70;
    static final int EFC_RIJE_SUB = 71;
    static final int EFC_KEY = 72;
    static final int EFC_BATTLECRY = 73;
    static final int EFC_OPENKEY = 74;
    static final int EFC_MP_DIV = 75;
    static final int EFC_MP_DIV_SUB = 76;
    static final int EFC_ISSEN = 77;
    static final int EFC_S_METEOR = 78;
    static final int EFC_S_ORBIT = 79;
    static final int EFC_S_MAGIC = 80;
    static final int EFC_BAHA = 81;
    static final int EFC_BAHA_S = 82;
    static final int EFC_ARTEMA = 83;
    static final int EFC_SBREATH = 84;
    static final int EFC_SBREATH_SUB = 85;
    static final int EFC_LIGHTKEY = 86;
    static final int EFC_TATESEN = 87;
    static final int EFC_ALL_EL = 88;
    static final int EFC_ICE_RING = 89;
    static final int EFC_ICE = 90;
    static final int EFC_SW_WEAR = 91;
    static final int EFC_SO_INVOKE = 92;
    static final int EFC_SONG_0 = 93;
    static final int EFC_SONG_1 = 94;
    static final int EFC_SONG_2 = 95;
    static final int EFC_SONG_3 = 96;
    static final int EFC_ASHIELD = 97;
    static final int EFC_ASHIELD2 = 98;
    static final int EFC_SONG_4 = 99;
    static final int EFC_PIYO3 = 100;
    static final int EFC_THUNDER = 101;
    static final int EFC_KAIOU = 102;
    static final int EFC_SUIKA = 103;
    static final int EFC_COSMO = 104;
    static final int EFC_EYEWATER = 105;
    static final int EFC_FIREWORKS = 106;
    static final int EFC_WAVY = 107;
    static final int EFC_WAVY_SUB = 108;
    static final int EFC_GOLEM = 109;
    static final int EFC_GOLEM_S = 110;
    static final int EFC_GOLEM_H = 111;
    static final int EFC_STORM = 112;
    static final int EFC_SLASH = 113;
    static final int EFC_BADBAD = 114;
    static final int EFC_BADBAD_SUB = 115;
    static final int EFC_GODDESS2 = 116;
    static final int EFC_ESNA = 117;
    static final int EFC_ESNA_SUB = 118;
    static final int EFC_STORM_S = 119;
    static final int EFC_MUGEN = 120;
    static final int EFC_MUGEN_SUB = 121;
    static final int EFC_MUGEN_LINE = 122;
    static final int EFC_SUIKARI = 123;
    static final float[] CURE_SCALE_TABLE_X = new float[]{0.2f, 0.4f, 0.5f, 0.55f, 0.5f, 0.4f, 0.2f, -1.0f};
    static final float[] CURE_SCALE_TABLE_Y = new float[]{0.2f, 0.4f, 0.6f, 0.8f, 1.0f, 1.2f, 1.4f, 1.6f};
    static final float[] YARN_SCALE_TABLE = new float[]{0.1f, 0.5f, 0.9f, 1.2f, 1.4f, 1.55f, 1.65f, 1.7f, 1.65f, 1.55f, 1.4f, 1.2f, 0.9f, 0.5f, -1.0f};
    static final float[] FBREATH_VECT_TABLE = new float[]{0.0f, 20.0f, 35.0f, 45.0f, 50.0f, 50.0f, 45.0f, 35.0f, 20.0f, 0.0f, -20.0f, -35.0f, -45.0f, -50.0f, -50.0f, -45.0f, -35.0f};
    static final float[] HOLY_TABLE = new float[]{800.0f, 750.0f, 700.0f, 650.0f, 600.0f, 550.0f, 500.0f, 450.0f, 400.0f, 360.0f, 330.0f, 310.0f, 295.0f, 285.0f, 280.0f, 280.0f, 280.0f, 280.0f, 280.0f, 280.0f, 280.0f, 280.0f, 260.0f, 230.0f, 200.0f, 180.0f, 150.0f, 120.0f, 90.0f, 60.0f, 30.0f, 0.0f, -50.0f};
    static final float[] HOLY_TABLE2 = new float[]{800.0f, 750.0f, 700.0f, 650.0f, 600.0f, 550.0f, 500.0f, 450.0f, 400.0f, 360.0f, 330.0f, 310.0f, 295.0f, 285.0f, 280.0f, 275.0f, 260.0f, 220.0f, 185.0f, 145.0f, 100.0f, 50.0f, 0.0f, -50.0f};
    static final float[] EXPL_XZ = new float[]{0.4f, 0.6f, 0.8f, 1.0f, 1.2f, 1.4f, 1.6f, 2.0f, 2.4f, 2.8f, 3.3f, 3.8f, 4.4f, 5.0f, 0.0f};
    static final float[] EXPL_Y = new float[]{0.4f, 0.8f, 1.2f, 1.6f, 1.8f, 1.9f, 2.0f, 1.9f, 1.8f, 1.6f, 1.4f, 1.1f, 0.7f, 0.2f, 0.0f};
    static final int[] SONG_COLOR = new int[]{0, 2, 3, 32, 49, 50};
    static final int[] COSMO_COLOR = new int[]{32, 49, 50, 75, 76, 77};
    static final int[] STORM_COLOR = new int[]{0, 2, 3, 32};
    static final int[] ABI_ALL_COLOR = new int[]{0, 2, 3, 122, 123, 124, 125, 126, 127, 128, 129, 130};
    public int m_nAlgo;
    public D3DXVECTOR3 m_vPos = new D3DXVECTOR3();
    public D3DXVECTOR3 m_vRol = new D3DXVECTOR3();
    public D3DXVECTOR3 m_vScale = new D3DXVECTOR3();
    public D3DXVECTOR3 m_vStart = new D3DXVECTOR3();
    public CCalcBndBox m_BndBox = new CCalcBndBox();
    public int m_nCount;
    public int m_nPat;
    public int m_nWorkNo;
    public float m_fVect;
    public float m_fSize;
    public float m_fSpeed;
    public int m_nDisp;
    public int m_nColor;
    public int m_nStop;
    private boolean m_bMoved;

    CEfcWork() {
    }

    CEfcWork(int n) {
        this.m_nWorkNo = n;
    }

    public void MakeMagicSub(D3DXVECTOR3 d3DXVECTOR3, float f) {
        float f2 = f + (float)Calc3D.Rand((int)(f * 0.5f));
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3(this.m_vPos);
        float f3 = Calc3D.DEGtoRAD(Calc3D.Rand(360));
        d3DXVECTOR32.x += Calc3D.Sin(f3) * f2;
        d3DXVECTOR32.z += Calc3D.Cos(f3) * f2;
        Vari.MakeEffect(2, d3DXVECTOR32, f3, f);
    }

    public void MakeSparkSub(int n, D3DXVECTOR3 d3DXVECTOR3, float f) {
        int n2 = 0;
        while (n2 < n) {
            Vari.MakeEffect(4, d3DXVECTOR3, f, 0.0f);
            ++n2;
        }
    }

    public void MakeCureSub(D3DXVECTOR3 d3DXVECTOR3, float f) {
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        float f2 = CEfcWork.AngleRand();
        d3DXVECTOR32.x = Calc3D.Sin(f2) * f;
        d3DXVECTOR32.z = Calc3D.Cos(f2) * f;
        d3DXVECTOR32.Add(d3DXVECTOR3);
        Vari.MakeEffect(12, d3DXVECTOR32, 0.0f, 0.0f);
    }

    public void MakeFBreathSub(int n, D3DXVECTOR3 d3DXVECTOR3, float f, float f2) {
        int n2 = 0;
        while (n2 < n) {
            float f3 = Calc3D.DEGtoRAD(Calc3D.Rand(50) - 25);
            Vari.MakeEffect(21, d3DXVECTOR3, f + f3, f2);
            ++n2;
        }
    }

    public void MakeSmokeSub(int n, D3DXVECTOR3 d3DXVECTOR3, float f) {
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        int n2 = 0;
        while (n2 < n) {
            d3DXVECTOR32.Set(d3DXVECTOR3);
            d3DXVECTOR32.x += (float)Calc3D.Rand((int)f * 3) - f * 1.5f;
            d3DXVECTOR32.z += (float)Calc3D.Rand((int)f * 3) - f * 1.5f;
            Vari.MakeEffect(32, d3DXVECTOR32, 0.0f, 0.0f);
            ++n2;
        }
    }

    public void MakeStoreSub(D3DXVECTOR3 d3DXVECTOR3, float f) {
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        float f2 = CEfcWork.AngleRand();
        d3DXVECTOR32.x = Calc3D.Sin(f2) * f;
        d3DXVECTOR32.z = Calc3D.Cos(f2) * f;
        d3DXVECTOR32.Add(d3DXVECTOR3);
        Vari.MakeEffect(38, d3DXVECTOR32, 0.0f, 0.0f);
    }

    public void MakeFlare3Sub(int n, D3DXVECTOR3 d3DXVECTOR3) {
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        int n2 = 0;
        while (n2 < n) {
            d3DXVECTOR32.Set(d3DXVECTOR3);
            d3DXVECTOR32.x += (float)(Calc3D.Rand(600) - 300);
            d3DXVECTOR32.z += (float)(Calc3D.Rand(200) - 100);
            Vari.MakeEffect(56, d3DXVECTOR32, 0.0f, 0.0f);
            ++n2;
        }
    }

    public static void MakeLightDrop(int n, D3DXVECTOR3 d3DXVECTOR3, float f) {
        int n2 = 0;
        while (n2 < n) {
            Vari.MakeEffect(15, d3DXVECTOR3, 0.0f, f);
            ++n2;
        }
    }

    public void MultScale(float f) {
        this.m_vScale.x *= f;
        this.m_vScale.y *= f;
        this.m_vScale.z *= f;
    }

    public void Run() {
        if (this.m_bMoved) {
            return;
        }
        this.m_bMoved = true;
        block0 : switch (this.m_nAlgo) {
            case 0: {
                ++this.m_nPat;
                if (this.m_nPat < 3) break;
                this.ResetFlag(1);
                return;
            }
            case 1: {
                ++this.m_nCount;
                if (this.m_nCount > 16) {
                    this.ResetFlag(1);
                    return;
                }
                this.MakeMagicSub(this.m_vPos, this.m_fSize);
                this.MakeMagicSub(this.m_vPos, this.m_fSize);
                return;
            }
            case 2: {
                ++this.m_nCount;
                if (this.m_nCount < 8) {
                    this.m_vScale.x *= 1.2f;
                    this.m_vScale.y *= 1.3f;
                    this.m_vScale.z *= 1.2f;
                    return;
                }
                if (this.m_nCount < 16) {
                    this.m_vScale.x *= 0.7f;
                    this.m_vScale.y *= 1.2f;
                    this.m_vScale.z *= 0.7f;
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 3: {
                ++this.m_nCount;
                if (this.m_nCount > 4) {
                    this.ResetFlag(1);
                    return;
                }
                this.MakeSparkSub(8, this.m_vPos, this.m_fVect);
                return;
            }
            case 4: 
            case 21: 
            case 108: 
            case 115: {
                this.m_vPos.x += Calc3D.Sin(this.m_fVect) * this.m_fSpeed;
                this.m_vPos.z += Calc3D.Cos(this.m_fVect) * this.m_fSpeed;
                this.m_vScale.x *= 0.85f;
                this.m_vScale.z *= 0.85f;
                if (!(this.m_vScale.x < 0.2f)) break;
                this.ResetFlag(1);
                return;
            }
            case 5: {
                ++this.m_nCount;
                if (this.m_nCount < 9) {
                    float f = Calc3D.DEGtoRAD((float)this.m_nCount * 10.0f);
                    this.m_vPos.y = 100.0f * Calc3D.Sin(f);
                    this.m_vPos.z = this.m_vStart.z + 250.0f * this.m_fSpeed * Calc3D.Sin(f);
                    this.m_vRol.x = -f;
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 6: {
                this.m_vRol.x += Calc3D.DEGtoRAD(10.0f);
                this.m_vRol.y += Calc3D.DEGtoRAD(10.0f);
                this.m_vPos.y = 50.0f;
                this.m_vScale.x *= 0.8f;
                this.m_vScale.z *= 0.8f;
                if (!(this.m_vScale.x < 0.05f)) break;
                this.ResetFlag(1);
                return;
            }
            case 7: {
                ++this.m_nCount;
                if (this.m_nCount < 16) {
                    this.m_fVect += 0.6f;
                    this.m_vPos.x = this.m_vStart.x + Calc3D.Sin(this.m_fVect) * this.m_fSize * 1.2f;
                    this.m_vPos.y += 15.0f;
                    this.m_vPos.z = this.m_vStart.z + Calc3D.Cos(this.m_fVect) * this.m_fSize * 1.2f;
                    this.MakeLuckSub(6, this.m_vPos);
                    return;
                }
                this.m_vPos.x = this.m_vStart.x;
                this.m_vPos.y += 20.0f;
                this.m_vPos.z = this.m_vStart.z;
                this.MakeLuckSub(12, this.m_vPos);
                this.ResetFlag(1);
                return;
            }
            case 8: {
                ++this.m_nCount;
                if (this.m_nCount < 8) {
                    this.m_vPos.x += Calc3D.Sin(this.m_fVect) * 15.0f;
                    this.m_vPos.y -= this.m_fSpeed;
                    this.m_vPos.z += Calc3D.Cos(this.m_fVect) * 15.0f;
                    this.MultScale(0.85f);
                    this.m_fSpeed += 2.0f;
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 9: {
                ++this.m_nPat;
                if (this.m_nPat < 11) break;
                this.ResetFlag(1);
                return;
            }
            case 10: {
                this.m_vRol.x += Calc3D.DEGtoRAD(15.0f);
                this.m_vRol.y += Calc3D.DEGtoRAD(15.0f);
                this.MultScale(1.4f);
                if (!(this.m_vScale.x >= 8.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 11: {
                ++this.m_nCount;
                if (this.m_nCount < 8) {
                    this.MakeCureSub(this.m_vPos, this.m_fSize);
                    this.MakeCureSub(this.m_vPos, this.m_fSize);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 12: 
            case 26: 
            case 38: {
                ++this.m_nCount;
                this.m_vPos.y += 20.0f;
                this.m_vScale.x = CURE_SCALE_TABLE_X[this.m_nCount];
                this.m_vScale.y = CURE_SCALE_TABLE_Y[this.m_nCount];
                this.m_vScale.z = CURE_SCALE_TABLE_X[this.m_nCount];
                if (!(this.m_vScale.x < 0.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 13: {
                ++this.m_nCount;
                this.m_vRol.y += Calc3D.DEGtoRAD(10.0f);
                this.m_vScale.x = YARN_SCALE_TABLE[this.m_nCount];
                this.m_vScale.y = YARN_SCALE_TABLE[this.m_nCount];
                this.m_vScale.z = YARN_SCALE_TABLE[this.m_nCount];
                if (!(this.m_vScale.x < 0.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 14: {
                D3DXVECTOR3 d3DXVECTOR3 = Vari.GetBChrWork((int)this.m_nCount).m_vPos;
                float f = 0.35f;
                float f2 = this.m_vPos.CalcDistance(d3DXVECTOR3);
                if (f2 < 130.0f) {
                    f = 0.7f;
                } else if (f2 < 260.0f) {
                    f = 0.5f;
                }
                float f3 = Calc3D.CalcAngleXZ(this.m_vPos, d3DXVECTOR3);
                this.m_fVect = Calc3D.TurnAngle(this.m_fVect, f3, f);
                this.m_vPos.x -= Calc3D.Sin(this.m_fVect) * 50.0f;
                this.m_vPos.z -= Calc3D.Cos(this.m_fVect) * 50.0f;
                this.m_vRol.x += Calc3D.DEGtoRAD(10.0f);
                this.m_vRol.y += Calc3D.DEGtoRAD(10.0f);
                if (!(this.m_vPos.CalcDistance(d3DXVECTOR3) <= 60.0f)) break;
                CEfcWork.MakeLightDrop(16, this.m_vPos, 1.0f);
                this.ResetFlag(1);
                return;
            }
            case 15: {
                this.m_vRol.x += Calc3D.DEGtoRAD(10.0f);
                this.m_vRol.y += Calc3D.DEGtoRAD(10.0f);
                this.m_vPos.x -= Calc3D.Sin(this.m_fVect) * this.m_fSpeed * Calc3D.Cos(this.m_fSize);
                this.m_vPos.y += Calc3D.Sin(this.m_fSize) * this.m_fSpeed;
                this.m_vPos.z -= Calc3D.Cos(this.m_fVect) * this.m_fSpeed * Calc3D.Cos(this.m_fSize);
                this.MultScale(0.85f);
                if (!(this.m_vScale.x <= 0.1f)) break;
                this.ResetFlag(1);
                return;
            }
            case 16: {
                ++this.m_nCount;
                if (this.m_nCount < 8) {
                    this.MakePiyo1(2, this.m_vPos);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 17: {
                ++this.m_nCount;
                if (this.m_nCount <= 9) {
                    float f = Calc3D.DEGtoRAD((float)this.m_nCount * 20.0f);
                    this.m_vPos.x += Calc3D.Sin(this.m_fVect) * 18.0f;
                    this.m_vPos.z += Calc3D.Cos(this.m_fVect) * 18.0f;
                    this.m_vPos.y = Calc3D.Sin(f) * 250.0f;
                    return;
                }
                if (this.m_nCount <= 15) {
                    float f = Calc3D.DEGtoRAD((float)(this.m_nCount - 10) * 30.0f);
                    this.m_vPos.x += Calc3D.Sin(this.m_fVect) * 10.0f;
                    this.m_vPos.z += Calc3D.Cos(this.m_fVect) * 10.0f;
                    this.m_vPos.y = Calc3D.Sin(f) * 80.0f;
                    return;
                }
                if (this.m_nCount < 19) {
                    this.MultScale(0.8f);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 20: {
                ++this.m_nCount;
                if (this.m_nCount <= 16) {
                    this.MakeFBreathSub(18, this.m_vPos, this.m_fVect + Calc3D.DEGtoRAD(FBREATH_VECT_TABLE[this.m_nCount]), this.m_fSize);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 22: 
            case 23: {
                ++this.m_nColor;
                if (this.m_nAlgo == 23 && this.m_nColor == 8) {
                    this.m_nColor = 13;
                }
                if (this.m_nColor < 17) break;
                this.ResetFlag(1);
                return;
            }
            case 24: {
                ++this.m_nCount;
                if (this.m_nCount <= 16) {
                    int n = (int)this.m_fVect;
                    float f = Calc3D.DEGtoRAD((float)this.m_nCount * 15.0f);
                    D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(this.m_vPos);
                    d3DXVECTOR3.x += Calc3D.Sin(f) * this.m_fSize;
                    d3DXVECTOR3.y += (float)this.m_nCount * 15.0f;
                    d3DXVECTOR3.z += Calc3D.Cos(f) * this.m_fSize;
                    CEfcWork.MakeLightDrop(n, d3DXVECTOR3, 1.0f);
                    d3DXVECTOR3.Set(this.m_vPos);
                    d3DXVECTOR3.x += Calc3D.Sin(f += (float)Math.PI) * this.m_fSize;
                    d3DXVECTOR3.y += (float)this.m_nCount * 15.0f;
                    d3DXVECTOR3.z += Calc3D.Cos(f) * this.m_fSize;
                    CEfcWork.MakeLightDrop(n, d3DXVECTOR3, 1.0f);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 25: {
                ++this.m_nCount;
                if (this.m_nCount <= 16) {
                    this.MakeAssistSub(4, this.m_vPos);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 27: {
                if (this.m_nStop > 0) {
                    this.m_nStop += -1;
                    return;
                }
                ++this.m_nCount;
                this.m_fSize = this.m_fSpeed > 0.0f ? HOLY_TABLE[this.m_nCount] : HOLY_TABLE2[this.m_nCount];
                if (this.m_fSize < 0.0f) {
                    this.ResetFlag(1);
                    return;
                }
                this.m_fVect += this.m_fSpeed;
                this.m_vPos.x = this.m_vRol.x + Calc3D.Sin(this.m_fVect) * this.m_fSize;
                this.m_vPos.z = this.m_vRol.z + Calc3D.Cos(this.m_fVect) * this.m_fSize;
                return;
            }
            case 28: {
                this.m_vPos.y -= 200.0f;
                if (Calc3D.NearZero(this.m_vPos.y)) {
                    this.MakeSparkSub(6, this.m_vPos, 1.0f);
                }
                if (!(this.m_vPos.y < -1000.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 29: 
            case 39: 
            case 73: {
                this.MultScale(1.4f);
                this.m_vRol.y += 0.2f;
                if (!(this.m_vScale.x >= 7.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 30: {
                ++this.m_nPat;
                if (this.m_nPat <= 15) break;
                this.ResetFlag(1);
                return;
            }
            case 31: {
                ++this.m_nCount;
                if (this.m_nCount <= 16) {
                    this.MakeSmokeSub(3, this.m_vPos, this.m_fSize);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 36: {
                ++this.m_nCount;
                if (this.m_nCount <= 12) {
                    this.MakeSmokeSub(1, this.m_vPos, this.m_fSize);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 32: {
                this.m_vPos.y += 50.0f;
                ++this.m_nPat;
                if (this.m_nPat <= 19) break;
                this.ResetFlag(1);
                return;
            }
            case 33: {
                ++this.m_nCount;
                if (this.m_nCount > 4) {
                    this.MultScale(0.9f);
                    if (this.m_nCount > 14) {
                        this.ResetFlag(1);
                    }
                }
                this.m_fVect += Calc3D.DEGtoRAD(15.0f);
                this.m_vPos.x += Calc3D.Sin(this.m_fVect) * 20.0f;
                this.m_vPos.z += Calc3D.Cos(this.m_fVect) * 20.0f;
                this.m_vRol.y += Calc3D.DEGtoRAD(20.0f);
                return;
            }
            case 34: 
            case 35: {
                ++this.m_nColor;
                if (this.m_nAlgo == 35 && this.m_nColor == 23) {
                    this.m_nColor = 28;
                }
                if (this.m_nColor < 32) break;
                this.ResetFlag(1);
                return;
            }
            case 37: {
                ++this.m_nCount;
                if (this.m_nCount < 8) {
                    this.MakeStoreSub(this.m_vPos, this.m_fSize);
                    this.MakeStoreSub(this.m_vPos, this.m_fSize);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 40: {
                ++this.m_nCount;
                if (this.m_nCount < 20) {
                    this.m_vPos.x += Calc3D.Sin(this.m_vRol.y) * 80.0f;
                    this.m_vPos.z += Calc3D.Cos(this.m_vRol.y) * 80.0f;
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 41: {
                ++this.m_nCount;
                float f = (float)this.m_nCount * 0.5f;
                float f4 = (float)(30 - this.m_nCount) / 30.0f;
                this.m_vPos.x = this.m_vStart.x + Calc3D.Sin(f) * 300.0f * f4;
                this.m_vPos.z = this.m_vStart.z + Calc3D.Cos(f) * 150.0f * f4;
                if (this.m_nCount <= 28) {
                    this.MakeBlindSub(10, this.m_vPos);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 42: {
                this.m_nCount += 4;
                this.m_vPos.x += Calc3D.Sin(this.m_fVect) * this.m_fSpeed;
                this.m_vPos.y -= (float)this.m_nCount;
                this.m_vPos.z += Calc3D.Cos(this.m_fVect) * this.m_fSpeed;
                this.m_vScale.x *= 0.85f;
                this.m_vScale.z *= 0.85f;
                if (!(this.m_vPos.y < 0.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 43: {
                if (!Calc3D.NearZero(this.m_vScale.x - 1.0f)) {
                    this.m_vScale.x += 0.2f;
                    this.m_vScale.y += 0.2f;
                    this.m_vScale.z += 0.2f;
                    return;
                }
                ++this.m_nCount;
                this.m_vPos.x += Calc3D.Sin(this.m_fVect) * 80.0f;
                this.m_vPos.z += Calc3D.Cos(this.m_fVect) * 80.0f;
                if (this.m_nCount == 3) {
                    CBattleWork cBattleWork = Vari.m_App.m_Battle.m_ActBChr;
                    CBattleWork cBattleWork2 = Vari.GetBChrWork((int)this.m_fSize);
                    CBattleActCalc.WeaponAttack(cBattleWork, cBattleWork2, 100, 0, 0, 0, 1);
                    return;
                }
                if (this.m_nCount == 7) {
                    CBattleWork cBattleWork = Vari.m_App.m_Battle.m_ActBChr;
                    CBattleWork cBattleWork3 = Vari.GetBChrWork((int)this.m_fSize);
                    Vari.MakeEffect(33, cBattleWork3.m_vPos, Calc3D.DEGtoRAD(45.0f), 0.0f);
                    Vari.MakeEffect(33, cBattleWork3.m_vPos, Calc3D.DEGtoRAD(135.0f), 0.0f);
                    Vari.MakeEffect(33, cBattleWork3.m_vPos, Calc3D.DEGtoRAD(215.0f), 0.0f);
                    Vari.MakeEffect(33, cBattleWork3.m_vPos, Calc3D.DEGtoRAD(315.0f), 0.0f);
                    CBattleActCalc.Paralysis(cBattleWork, cBattleWork3, 85);
                    return;
                }
                if (this.m_nCount <= 16) break;
                this.ResetFlag(1);
                return;
            }
            case 44: {
                ++this.m_nCount;
                if (this.m_nCount <= 16) {
                    this.MakeBlindSub(10, this.m_vPos);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 45: {
                ++this.m_nCount;
                this.m_vPos.y -= 100.0f;
                this.m_vPos.z += this.m_fVect;
                if (this.m_nCount == 1 || this.m_nCount == 3) {
                    D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(this.m_vPos);
                    d3DXVECTOR3.y -= 100.0f;
                    d3DXVECTOR3.z += this.m_fVect;
                    Vari.MakeEffect(47, d3DXVECTOR3, this.m_fVect, 0.0f);
                    return;
                }
                if (this.m_nCount == 5) {
                    Vari.MakeEffect(46, this.m_vStart, 0.0f, 0.0f);
                    return;
                }
                if (this.m_nCount != 7) break;
                this.ResetFlag(1);
                return;
            }
            case 46: {
                ++this.m_nCount;
                this.m_vRol.y += 0.4f;
                this.m_vScale.x = EXPL_XZ[this.m_nCount];
                this.m_vScale.y = EXPL_Y[this.m_nCount];
                this.m_vScale.z = EXPL_XZ[this.m_nCount];
                if (!Calc3D.NearZero(this.m_vScale.x)) break;
                this.ResetFlag(1);
                return;
            }
            case 47: 
            case 52: 
            case 79: {
                ++this.m_nColor;
                if (this.m_nColor <= 61) break;
                this.ResetFlag(1);
                return;
            }
            case 48: {
                ++this.m_nCount;
                this.m_vRol.z += 0.2f;
                this.m_vPos.x -= Calc3D.Sin(this.m_fVect) * 30.0f;
                this.m_vPos.z -= Calc3D.Cos(this.m_fVect) * 30.0f;
                this.m_vScale.x += 0.3f;
                this.m_vScale.y += 0.3f;
                if (this.m_nCount > 7) {
                    this.m_vScale.z *= 0.8f;
                }
                if (this.m_nCount == 3 || this.m_nCount == 6 || this.m_nCount == 9) {
                    Vari.MakeEffect(49, this.m_vPos, 0.0f, 0.0f);
                    return;
                }
                if (this.m_nCount != 14) break;
                this.ResetFlag(1);
                return;
            }
            case 49: {
                this.MultScale(1.4f);
                this.m_vRol.z += 0.2f;
                if (!(this.m_vScale.x >= 7.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 50: {
                ++this.m_nCount;
                float f = this.m_fVect;
                Vari.MakeEffect(51, this.m_vPos, f += Calc3D.DEGtoRAD(45 - Calc3D.Rand(90)), 0.0f);
                if (this.m_nCount != 14) break;
                this.ResetFlag(1);
                return;
            }
            case 51: {
                ++this.m_nCount;
                this.m_vPos.x += Calc3D.Sin(this.m_fVect) * 80.0f;
                this.m_vPos.z += Calc3D.Cos(this.m_fVect) * 80.0f;
                if (this.m_nCount < 8) {
                    this.MultScale(1.3f);
                }
                this.m_vRol.y += 0.4f;
                if (this.m_nCount < 14) break;
                this.ResetFlag(1);
                return;
            }
            case 53: {
                ++this.m_nCount;
                if (this.m_nCount <= 2) break;
                this.ResetFlag(1);
                return;
            }
            case 54: {
                ++this.m_nCount;
                if (this.m_nCount < 16) {
                    this.MultScale(1.2f);
                } else {
                    this.MultScale(0.7f);
                }
                if (!(this.m_vScale.x <= 0.2f)) break;
                this.ResetFlag(1);
                return;
            }
            case 55: {
                ++this.m_nCount;
                this.m_vRol.y += Calc3D.DEGtoRAD(5.0f);
                if (this.m_nCount < 12) {
                    this.m_vScale.x *= 1.2f;
                    this.m_vScale.z *= 1.2f;
                } else if (this.m_nCount > 32) {
                    this.m_vScale.x *= 0.8f;
                    this.m_vScale.z *= 0.8f;
                }
                this.MakeFlare3Sub(4, this.m_vPos);
                if (this.m_nCount <= 44) break;
                this.ResetFlag(1);
                return;
            }
            case 56: {
                ++this.m_nCount;
                this.m_vPos.y += 20.0f;
                this.m_vScale.x = CURE_SCALE_TABLE_X[this.m_nCount] * 0.1f;
                this.m_vScale.y = CURE_SCALE_TABLE_Y[this.m_nCount] * 0.5f;
                this.m_vScale.z = CURE_SCALE_TABLE_X[this.m_nCount] * 0.5f;
                if (!(this.m_vScale.x < 0.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 57: {
                ++this.m_nCount;
                this.MultScale(1.4f);
                if (!(this.m_vScale.x >= 10.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 58: 
            case 82: {
                this.m_vPos.x += Calc3D.Sin(this.m_fVect) * 100.0f;
                this.m_vPos.y -= 25.0f;
                this.m_vPos.z += Calc3D.Cos(this.m_fVect) * 100.0f;
                if (!(this.m_vPos.y < 0.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 116: {
                this.m_vPos.x += Calc3D.Sin(this.m_fVect) * 100.0f;
                this.m_vPos.y -= 10.0f;
                this.m_vPos.z += Calc3D.Cos(this.m_fVect) * 100.0f;
                if (!(this.m_vPos.y < 0.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 59: {
                this.m_vScale.x *= 0.8f;
                this.m_vScale.z *= 0.8f;
                if (this.m_vScale.x < 1.5f) {
                    CEfcWork.MakeLightDrop(3, this.m_vPos, 2.0f);
                }
                if (!(this.m_vScale.x < 0.1f)) break;
                this.ResetFlag(1);
                return;
            }
            case 60: {
                int n = 0;
                do {
                    Vari.MakeEffect(61, this.m_vPos, 0.0f, 0.0f);
                } while (++n < 5);
                return;
            }
            case 61: {
                this.m_vPos.x += Calc3D.Sin(this.m_fVect) * this.m_fSpeed;
                this.m_vPos.y += 10.0f;
                this.m_vPos.z += Calc3D.Cos(this.m_fVect) * this.m_fSpeed;
                this.m_fSpeed *= 0.9f;
                this.MultScale(0.86f);
                if (!(this.m_vScale.x <= 0.2f)) break;
                this.ResetFlag(1);
                return;
            }
            case 62: {
                this.MultScale(this.m_fSpeed);
                this.m_fSpeed *= 0.97f;
                if (!(this.m_vScale.x <= 0.1f)) break;
                this.ResetFlag(1);
                return;
            }
            case 63: {
                this.MultScale(0.7f);
                if (!(this.m_vScale.x <= 0.1f)) break;
                this.ResetFlag(1);
                return;
            }
            case 64: {
                ++this.m_nCount;
                if (this.m_nCount > 20) {
                    this.ResetFlag(1);
                }
                int n = 0;
                do {
                    D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(this.m_vPos);
                    d3DXVECTOR3.x += (float)Calc3D.Rand((int)this.m_fSize) - this.m_fSize * 0.5f;
                    d3DXVECTOR3.z += (float)Calc3D.Rand((int)this.m_fSize) - this.m_fSize * 0.5f;
                    Vari.MakeEffect(65, d3DXVECTOR3, 0.0f, 0.0f);
                } while (++n < 4);
                return;
            }
            case 65: {
                ++this.m_nCount;
                this.m_vPos.y += 20.0f;
                this.m_vScale.x = CURE_SCALE_TABLE_X[this.m_nCount] * 0.4f;
                this.m_vScale.y = CURE_SCALE_TABLE_Y[this.m_nCount] * 1.0f;
                if (!(this.m_vScale.x < 0.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 66: {
                this.m_vPos.z -= 100.0f;
                if (!(this.m_vPos.z < -800.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 67: {
                this.MultScale(this.m_fSpeed);
                this.m_fSpeed *= 0.96f;
                if (!(this.m_vScale.x <= 0.1f)) break;
                this.ResetFlag(1);
                return;
            }
            case 68: {
                ++this.m_nCount;
                if (this.m_nCount < 20) {
                    if ((this.m_nCount & 1) != 0) break;
                    Vari.MakeEffect(69, this.m_vPos, CEfcWork.AngleRand(), this.m_fSize);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 69: {
                if (this.m_nCount == 0) {
                    this.m_vPos.y -= 60.0f;
                    if (!(this.m_vPos.y < this.m_fSize)) break;
                    this.m_vPos.y = this.m_fSize;
                    this.m_nCount = 1;
                    this.m_fSpeed = 28.0f;
                    return;
                }
                if (this.m_nCount == 1) {
                    this.m_fSpeed -= 4.0f;
                    if (this.m_fSpeed < -60.0f) {
                        this.m_fSpeed = -60.0f;
                    }
                    this.m_vPos.x += Calc3D.Sin(this.m_vRol.y) * 12.0f;
                    this.m_vPos.z += Calc3D.Cos(this.m_vRol.y) * 12.0f;
                    this.m_vPos.y += this.m_fSpeed;
                    if (!(this.m_vPos.y < 0.0f)) break;
                    this.m_vPos.y = 0.0f;
                    this.m_nCount = 2;
                    return;
                }
                this.MultScale(0.8f);
                if (!(this.m_vScale.x < 0.2f)) break;
                this.ResetFlag(1);
                return;
            }
            case 70: {
                ++this.m_nCount;
                if (this.m_nCount < 20) {
                    this.m_fVect += 0.2f;
                    this.m_vPos.x = this.m_vStart.x - Calc3D.Sin(this.m_fVect) * this.m_fSize * 1.4f;
                    this.m_vPos.y += 15.0f;
                    this.m_vPos.z = this.m_vStart.z - Calc3D.Cos(this.m_fVect) * this.m_fSize * 1.4f;
                    this.MakeRijeSub(this.m_vPos);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 71: 
            case 76: {
                this.m_vPos.x += Calc3D.Sin(this.m_fVect) * this.m_fSpeed;
                this.m_vPos.z += Calc3D.Cos(this.m_fVect) * this.m_fSpeed;
                this.m_vScale.x *= 0.85f;
                this.m_vScale.z *= 0.85f;
                if (!(this.m_vScale.x < 0.2f)) break;
                this.ResetFlag(1);
                return;
            }
            case 72: {
                ++this.m_nCount;
                if (this.m_nCount < 5) {
                    this.m_vScale.x += 0.2f;
                    this.m_vScale.y += 0.2f;
                    this.m_vScale.z += 0.2f;
                    return;
                }
                if (this.m_nCount < 9) {
                    this.m_vPos.z += this.m_fSpeed;
                    return;
                }
                if (this.m_nCount < 16) {
                    this.m_vRol.z -= 0.2f;
                    return;
                }
                if (this.m_nCount == 16 || this.m_nCount == 18) {
                    Vari.m_App.m_Render.SetWhite(0.5f);
                    return;
                }
                if (this.m_nCount == 17) {
                    Vari.m_App.m_Render.SetWhite(1.0f);
                    this.m_nPat = -1;
                    return;
                }
                if (this.m_nCount != 19) break;
                Vari.m_App.m_Render.SetWhite(0.0f);
                this.ResetFlag(1);
                return;
            }
            case 74: {
                ++this.m_nCount;
                if (this.m_nCount < 5) {
                    this.m_vScale.x += 0.1f;
                    this.m_vScale.y += 0.1f;
                    this.m_vScale.z += 0.1f;
                } else if (this.m_nCount < 15) {
                    this.m_vPos.y -= 10.0f;
                } else if (this.m_nCount < 20) {
                    this.m_vPos.y -= 10.0f;
                    this.m_vScale.x -= 0.1f;
                    this.m_vScale.y -= 0.1f;
                    this.m_vScale.z -= 0.1f;
                } else {
                    this.ResetFlag(1);
                }
                this.m_vRol.y += 0.15f;
                CEfcWork.MakeLightDrop(1, this.m_vPos, 1.0f);
                return;
            }
            case 75: {
                D3DXVECTOR3 d3DXVECTOR3 = Vari.GetBChrWork((int)this.m_nCount).m_vPos;
                float f = 0.35f;
                if (this.m_vPos.CalcDistance(d3DXVECTOR3) < 300.0f) {
                    f = 0.7f;
                }
                Vari.MakeEffect(76, this.m_vPos, CEfcWork.AngleRand(), 0.0f);
                float f5 = Calc3D.CalcAngleXZ(this.m_vPos, d3DXVECTOR3);
                this.m_fVect = Calc3D.TurnAngle(this.m_fVect, f5, f);
                float f6 = this.m_vPos.CalcDistance(d3DXVECTOR3);
                float f7 = f6 / 10.0f + 30.0f;
                if (f7 > 100.0f) {
                    f7 = 100.0f;
                }
                this.m_vPos.x -= Calc3D.Sin(this.m_fVect) * f7;
                this.m_vPos.z -= Calc3D.Cos(this.m_fVect) * f7;
                f6 = this.m_vPos.CalcDistance(d3DXVECTOR3);
                if (!(f6 <= 60.0f)) break;
                int n = 0;
                do {
                    Vari.MakeEffect(76, d3DXVECTOR3, CEfcWork.AngleRand(), 0.0f);
                } while (++n < 4);
                this.ResetFlag(1);
                return;
            }
            case 77: {
                ++this.m_nCount;
                if (this.m_nCount < 8) {
                    this.m_vPos.x += this.m_fSpeed;
                    if (this.m_nCount == 2 || this.m_nCount == 6) {
                        Vari.m_App.m_Render.SetWhite(0.25f);
                        return;
                    }
                    if (this.m_nCount == 3 || this.m_nCount == 5) {
                        Vari.m_App.m_Render.SetWhite(0.5f);
                        return;
                    }
                    if (this.m_nCount == 4) {
                        Vari.m_App.m_Render.SetWhite(0.75f);
                        return;
                    }
                    Vari.m_App.m_Render.SetWhite(0.0f);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 78: {
                ++this.m_nCount;
                this.m_vPos.y -= 100.0f;
                this.m_vPos.z += this.m_fVect;
                if (this.m_nCount == 1 || this.m_nCount == 3 || this.m_nCount == 5) {
                    D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(this.m_vPos);
                    Vari.MakeEffect(79, d3DXVECTOR3, this.m_fVect, 0.0f);
                }
                if (this.m_nCount > 5) {
                    this.MakeSparkSub(10, this.m_vStart, 0.0f);
                }
                if (this.m_nCount != 7) break;
                this.ResetFlag(1);
                return;
            }
            case 80: {
                ++this.m_nCount;
                this.m_vPos.x -= Calc3D.Sin(this.m_fVect) * 25.0f;
                this.m_vPos.z -= Calc3D.Cos(this.m_fVect) * 25.0f;
                this.m_fVect += 0.2f;
                if (this.m_nCount <= 16) break;
                this.ResetFlag(1);
                return;
            }
            case 81: {
                ++this.m_nCount;
                this.SummonAnim();
                if (this.m_nCount <= 78) break;
                this.ResetFlag(1);
                return;
            }
            case 83: {
                this.m_vPos.x += Calc3D.Sin(this.m_vRol.y) * 100.0f;
                this.m_vPos.z += Calc3D.Cos(this.m_vRol.y) * 100.0f;
                this.m_vScale.x -= 0.1f;
                this.m_vScale.z -= 0.1f;
                if (!(this.m_vScale.x <= 0.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 84: {
                ++this.m_nCount;
                if (this.m_nCount <= 16) {
                    this.MakeSBreathSub(4, this.m_vPos, this.m_fVect + Calc3D.DEGtoRAD(FBREATH_VECT_TABLE[this.m_nCount]));
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 85: {
                this.m_vPos.x += Calc3D.Sin(this.m_fVect) * this.m_fSpeed;
                this.m_vPos.z += Calc3D.Cos(this.m_fVect) * this.m_fSpeed;
                this.m_vRol.y += 0.05f;
                this.m_vScale.x *= 0.85f;
                this.m_vScale.z *= 0.85f;
                if (!(this.m_vScale.x < 0.1f)) break;
                this.ResetFlag(1);
                return;
            }
            case 86: {
                ++this.m_nCount;
                this.m_vRol.y += 0.15f;
                if (this.m_nCount < 10) {
                    this.m_vScale.x += 0.1f;
                    this.m_vScale.y += 0.1f;
                    this.m_vScale.z += 0.1f;
                } else if (this.m_nCount < 20) {
                    this.m_vPos.y -= 10.0f;
                } else if (this.m_nCount > 1000) {
                    this.m_vScale.x -= 0.1f;
                    this.m_vScale.y -= 0.1f;
                    this.m_vScale.z -= 0.1f;
                    if (this.m_vScale.x <= 0.1f) {
                        this.ResetFlag(1);
                    }
                }
                CEfcWork.MakeLightDrop(1, this.m_vPos, 1.0f);
                return;
            }
            case 87: {
                this.m_vPos.y -= 200.0f;
                if (!(this.m_vPos.y < -1000.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 88: {
                ++this.m_nCount;
                this.m_vRol.x += this.m_vStart.x;
                this.m_vRol.y += this.m_vStart.z;
                this.m_vPos.z -= this.m_fSpeed;
                if (this.m_nCount < 10) {
                    this.MultScale(1.2f);
                    return;
                }
                if (this.m_nCount <= 30) break;
                this.MultScale(0.8f);
                if (!(this.m_vScale.x < 0.2f)) break;
                this.ResetFlag(1);
                return;
            }
            case 89: {
                this.m_vRol.y -= 0.75f;
                this.m_vPos.y += 25.0f;
                this.m_vScale.x *= 0.9f;
                this.m_vScale.y *= 1.1f;
                this.m_vScale.z *= 0.9f;
                if (!(this.m_vScale.x < 0.15f)) break;
                this.ResetFlag(1);
                return;
            }
            case 90: 
            case 123: {
                ++this.m_nCount;
                if (this.m_nCount < 8) {
                    this.m_vPos.y += 50.0f;
                    return;
                }
                if (this.m_nCount < 12) {
                    D3DXVECTOR3 d3DXVECTOR3 = new D3DXVECTOR3(this.m_vPos);
                    d3DXVECTOR3.y = 150.0f;
                    this.MakeSparkSub(4, d3DXVECTOR3, 1.0f);
                    return;
                }
                if (this.m_nCount < 20) {
                    this.m_vPos.y -= 50.0f;
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 91: {
                this.m_vRol.y += 0.2f;
                ++this.m_nCount;
                if (this.m_nCount <= 6) break;
                this.m_vScale.x *= 0.9f;
                this.m_vScale.y *= 1.2f;
                this.m_vScale.z *= 0.9f;
                if (!(this.m_vScale.x < 0.2f)) break;
                this.ResetFlag(1);
                return;
            }
            case 92: {
                this.m_vPos.x -= Calc3D.Sin(this.m_fVect) * 25.0f;
                this.m_vPos.z -= Calc3D.Cos(this.m_fVect) * 25.0f;
                this.m_vRol.y += 0.5f;
                this.m_fVect += 0.2f;
                this.MultScale(0.9f);
                if (!(this.m_vScale.x < 0.15f)) break;
                this.ResetFlag(1);
                return;
            }
            case 93: 
            case 99: {
                this.m_vPos.y += 30.0f;
                this.m_vRol.y += 0.5f;
                this.MultScale(0.85f);
                if (!(this.m_vScale.x < 0.15f)) break;
                this.ResetFlag(1);
                return;
            }
            case 94: {
                this.m_vPos.x -= Calc3D.Sin(this.m_fVect) * this.m_fSize;
                this.m_vPos.z -= Calc3D.Cos(this.m_fVect) * this.m_fSize;
                this.MultScale(0.9f);
                if (!(this.m_vScale.x < 0.1f)) break;
                this.ResetFlag(1);
                return;
            }
            case 95: {
                this.m_vRol.y += 0.5f;
                this.m_fVect += 0.2f;
                ++this.m_nCount;
                if (this.m_nCount < 8) {
                    this.m_fSize += (float)(9 - this.m_nCount) * 3.5f;
                } else if (this.m_nCount >= 16) {
                    this.MultScale(0.85f);
                    if (this.m_vScale.x < 0.15f) {
                        this.ResetFlag(1);
                    }
                }
                this.m_vPos.x = this.m_vStart.x + Calc3D.Sin(this.m_fVect) * this.m_fSize;
                this.m_vPos.z = this.m_vStart.z + Calc3D.Cos(this.m_fVect) * this.m_fSize;
                return;
            }
            case 96: {
                this.m_vPos.x += Calc3D.Sin(this.m_fVect) * 50.0f;
                this.m_vPos.z += Calc3D.Cos(this.m_fVect) * 50.0f;
                this.m_vScale.x *= 0.9f;
                this.m_vScale.y *= 0.9f;
                this.m_vScale.z *= 0.9f;
                if (!(this.m_vScale.x < 0.1f)) break;
                this.ResetFlag(1);
                return;
            }
            case 97: 
            case 98: {
                ++this.m_nColor;
                if (this.m_nAlgo == 98 && this.m_nColor == 110) {
                    this.m_nColor = 114;
                }
                if (this.m_nColor <= 116) break;
                this.ResetFlag(1);
                return;
            }
            case 100: {
                ++this.m_nCount;
                if (this.m_nCount <= 4) {
                    this.m_vScale.x += 0.2f;
                    this.m_vScale.y += 0.2f;
                    this.m_vScale.z += 0.2f;
                }
                if (this.m_nCount <= 13) {
                    float f = Calc3D.DEGtoRAD((float)(this.m_nCount - 4) * 20.0f);
                    this.m_vPos.x += Calc3D.Sin(this.m_fVect) * 18.0f;
                    this.m_vPos.z += Calc3D.Cos(this.m_fVect) * 18.0f;
                    this.m_vPos.y = Calc3D.Sin(f) * 50.0f;
                    return;
                }
                if (this.m_nCount <= 19) {
                    float f = Calc3D.DEGtoRAD((float)(this.m_nCount - 14) * 30.0f);
                    this.m_vPos.x += Calc3D.Sin(this.m_fVect) * 10.0f;
                    this.m_vPos.z += Calc3D.Cos(this.m_fVect) * 10.0f;
                    this.m_vPos.y = Calc3D.Sin(f) * 30.0f;
                    return;
                }
                if (this.m_nCount < 23) {
                    this.MultScale(0.8f);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 101: {
                this.m_nCount += -1;
                if (this.m_nCount <= 0) {
                    this.ResetFlag(1);
                    return;
                }
                this.m_nPat = 117 + Calc3D.Rand(4);
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vPos.x = this.m_vStart.x + (float)Calc3D.Rand(50) - 25.0f;
                this.m_vPos.z = this.m_vStart.z + (float)Calc3D.Rand(50) - 25.0f;
                return;
            }
            case 102: {
                ++this.m_nColor;
                if (this.m_nColor > 37) {
                    this.m_nColor = 33;
                }
                this.m_vRol.y += 0.1f;
                ++this.m_nCount;
                this.m_vScale.y *= 0.8f;
                if (this.m_nCount <= 10) break;
                this.ResetFlag(1);
                return;
            }
            case 103: {
                ++this.m_nCount;
                this.SummonAnim();
                if (this.m_nCount <= 78) break;
                this.ResetFlag(1);
                return;
            }
            case 104: {
                ++this.m_nCount;
                this.MultScale(1.4f);
                if (!(this.m_vScale.x >= 10.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 105: {
                this.m_vPos.x += Calc3D.Sin(this.m_vRol.y) * 40.0f;
                this.m_vPos.z += Calc3D.Cos(this.m_vRol.y) * 40.0f;
                this.m_vScale.x -= 0.1f;
                this.m_vScale.z -= 0.1f;
                if (!(this.m_vScale.x <= 0.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 106: {
                float f = Calc3D.Sin(this.m_vRol.x);
                float f8 = 1.0f - Calc3D.Abs(f);
                this.m_vPos.x += Calc3D.Sin(this.m_vRol.y) * this.m_fSpeed * f8;
                this.m_vPos.z += Calc3D.Cos(this.m_vRol.y) * this.m_fSpeed * f8;
                this.m_vPos.y += f * this.m_fSpeed;
                this.m_fSpeed *= 0.9f;
                this.m_vScale.x *= 0.9f;
                this.m_vScale.z *= 0.9f;
                if (!(this.m_vScale.x <= 0.1f)) break;
                this.ResetFlag(1);
                return;
            }
            case 107: {
                ++this.m_nCount;
                if (this.m_nCount > 8) {
                    this.ResetFlag(1);
                    return;
                }
                this.MakeWavySub(12, this.m_vPos, this.m_fVect);
                return;
            }
            case 109: {
                ++this.m_nCount;
                if (this.m_vPos.y < 0.0f) {
                    this.m_vPos.y += 15.0f;
                    Vari.m_nBattleWork1 += 15;
                }
                this.SummonAnim();
                if (this.m_nCount <= 58) break;
                this.ResetFlag(1);
                return;
            }
            case 110: {
                switch (this.m_nCount) {
                    case 0: {
                        this.m_vPos.y -= 80.0f;
                        if (!((float)Vari.m_nBattleWork1 > this.m_vPos.y)) break block0;
                        this.m_nCount = 1;
                        return;
                    }
                    case 9999: {
                        this.m_vPos.y -= 10.0f;
                        if (!(this.m_vPos.y < -200.0f)) break block0;
                        this.ResetFlag(1);
                        return;
                    }
                }
                this.m_fSize = (6.0f - (float)this.m_nCount) * 5.0f;
                if (this.m_fSize < -80.0f) {
                    this.m_fSize = -80.0f;
                }
                this.m_vPos.x += Calc3D.Sin(this.m_fVect) * 20.0f;
                this.m_vPos.y += this.m_fSize;
                this.m_vPos.z += Calc3D.Cos(this.m_fVect) * 20.0f;
                ++this.m_nCount;
                if (!(this.m_vPos.y < 0.0f)) break;
                this.m_vPos.y = 0.0f;
                this.m_nCount = 9999;
                return;
            }
            case 111: {
                if (this.m_nCount == 0) {
                    this.m_vPos.y += 40.0f;
                    if (!(this.m_vPos.y >= 0.0f)) break;
                    this.m_nCount = 1;
                    return;
                }
                this.m_vPos.y -= 40.0f;
                if (!(this.m_vPos.y <= -240.0f)) break;
                this.ResetFlag(1);
                return;
            }
            case 112: 
            case 119: {
                ++this.m_nCount;
                int n = 12;
                int n2 = 20;
                if (this.m_nAlgo == 119) {
                    n = 6;
                    n2 = 10;
                }
                if (this.m_nCount < n) {
                    this.m_vScale.x += this.m_fSpeed;
                    this.m_vScale.y += this.m_fSpeed;
                    this.m_vScale.z += this.m_fSpeed;
                } else if (this.m_nCount >= n2) {
                    this.m_vScale.x -= this.m_fSpeed;
                    this.m_vScale.y -= this.m_fSpeed;
                    this.m_vScale.z -= this.m_fSpeed;
                    if (this.m_vScale.x <= 0.0f) {
                        this.ResetFlag(1);
                    }
                }
                this.m_fVect += 0.3f;
                this.m_vRol.y += 0.3f;
                this.m_vPos.x = this.m_vStart.x + Calc3D.Sin(this.m_fVect) * this.m_fSize * 1.4f;
                this.m_vPos.z = this.m_vStart.z + Calc3D.Cos(this.m_fVect) * this.m_fSize;
                return;
            }
            case 113: {
                ++this.m_nCount;
                if (this.m_nCount < 15) {
                    this.m_vPos.x -= Calc3D.Sin(this.m_fVect) * 65.0f;
                    this.m_vPos.z -= Calc3D.Cos(this.m_fVect) * 65.0f;
                    this.m_vRol.y += 0.8f;
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 114: {
                ++this.m_nCount;
                if (this.m_nCount <= 16) {
                    this.MakePBreathSub(4, this.m_vPos, this.m_fVect + Calc3D.DEGtoRAD(FBREATH_VECT_TABLE[this.m_nCount]));
                    return;
                }
                if (this.m_nCount <= 32) {
                    this.MakeSBreathSub(4, this.m_vPos, this.m_fVect + Calc3D.DEGtoRAD(FBREATH_VECT_TABLE[this.m_nCount - 16]));
                    return;
                }
                if (this.m_nCount <= 48) {
                    this.MakeFBreathSub(18, this.m_vPos, this.m_fVect + Calc3D.DEGtoRAD(FBREATH_VECT_TABLE[this.m_nCount - 32]), 1.0f);
                    return;
                }
                if (this.m_nCount <= 64) {
                    this.MakeFBreathSub(18, this.m_vPos, this.m_fVect + Calc3D.DEGtoRAD(FBREATH_VECT_TABLE[this.m_nCount - 48]), 2.0f);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 117: {
                ++this.m_nCount;
                if (this.m_nCount <= 28) {
                    this.MakeEsnaSub(this.m_vPos, this.m_fVect, this.m_fSize);
                    this.m_fVect += Calc3D.DEGtoRAD(30.0f);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 118: {
                this.m_vScale.x *= 0.8f;
                this.m_vScale.y *= 0.8f;
                this.m_vScale.z *= 0.8f;
                this.m_vPos.y += this.m_fSpeed;
                this.m_fSpeed *= 0.8f;
                if (!(this.m_vScale.x < 0.1f)) break;
                this.ResetFlag(1);
                return;
            }
            case 120: {
                ++this.m_nCount;
                if (this.m_nCount <= 28) {
                    this.MakeMugenSub(this.m_vPos, this.m_fVect, this.m_fSize);
                    this.m_fVect += Calc3D.DEGtoRAD(30.0f);
                    return;
                }
                this.ResetFlag(1);
                return;
            }
            case 121: {
                this.m_vScale.x *= 0.8f;
                this.m_vScale.y *= 0.8f;
                this.m_vScale.z *= 0.8f;
                this.m_vPos.y += this.m_fSpeed;
                this.m_fSpeed *= 0.9f;
                if (!(this.m_vScale.x < 0.1f)) break;
                this.ResetFlag(1);
                return;
            }
            case 122: {
                this.m_vScale.x *= 0.8f;
                this.m_vScale.y *= 1.2f;
                this.m_vScale.z *= 0.8f;
                this.m_vPos.y += 28.0f;
                if (!(this.m_vScale.x < 0.1f)) break;
                this.ResetFlag(1);
                return;
            }
        }
    }

    public void MakeWavySub(int n, D3DXVECTOR3 d3DXVECTOR3, float f) {
        int n2 = 0;
        while (n2 < n) {
            Vari.MakeEffect(108, d3DXVECTOR3, f, 0.0f);
            ++n2;
        }
    }

    public void MakeLuckSub(int n, D3DXVECTOR3 d3DXVECTOR3) {
        int n2 = 0;
        while (n2 < n) {
            Vari.MakeEffect(8, d3DXVECTOR3, 0.0f, 0.0f);
            ++n2;
        }
    }

    public void MakeSBreathSub(int n, D3DXVECTOR3 d3DXVECTOR3, float f) {
        int n2 = 0;
        while (n2 < n) {
            float f2 = Calc3D.DEGtoRAD(Calc3D.Rand(50) - 25);
            Vari.MakeEffect(85, d3DXVECTOR3, f + f2, 0.0f);
            ++n2;
        }
    }

    public void MakePBreathSub(int n, D3DXVECTOR3 d3DXVECTOR3, float f) {
        int n2 = 0;
        while (n2 < n) {
            float f2 = Calc3D.DEGtoRAD(Calc3D.Rand(50) - 25);
            Vari.MakeEffect(115, d3DXVECTOR3, f + f2, 0.0f);
            ++n2;
        }
    }

    public void MakeAssistSub(int n, D3DXVECTOR3 d3DXVECTOR3) {
        D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
        int n2 = 0;
        while (n2 < n) {
            d3DXVECTOR32.Set(d3DXVECTOR3);
            d3DXVECTOR32.x += (float)(Calc3D.Rand(600) - 300);
            d3DXVECTOR32.z += (float)(Calc3D.Rand(200) - 100);
            Vari.MakeEffect(26, d3DXVECTOR32, 0.0f, 0.0f);
            ++n2;
        }
    }

    public void MakeBlindSub(int n, D3DXVECTOR3 d3DXVECTOR3) {
        int n2 = 0;
        while (n2 < n) {
            float f = Calc3D.DEGtoRAD(Calc3D.Rand(360));
            Vari.MakeEffect(42, d3DXVECTOR3, f, 0.0f);
            ++n2;
        }
    }

    public int GetSongColor(int n) {
        return SONG_COLOR[n];
    }

    public void MakePiyo1(int n, D3DXVECTOR3 d3DXVECTOR3) {
        int n2 = 0;
        while (n2 < n) {
            Vari.MakeEffect(17, d3DXVECTOR3, 0.0f, 0.0f);
            ++n2;
        }
    }

    public void Init(int n, D3DXVECTOR3 d3DXVECTOR3, float f, float f2) {
        this.m_bMoved = false;
        int[] nArray = new int[]{0, 2, 3};
        this.m_nAlgo = n;
        this.m_nCount = 0;
        this.m_fVect = f;
        this.m_fSize = f2;
        this.m_nDisp = 0;
        this.m_nColor = 0;
        this.m_nStop = 0;
        this.ClearFlag();
        this.SetFlag(1);
        this.m_vPos.Set(d3DXVECTOR3);
        this.m_vRol.z = 0.0f;
        this.m_vRol.y = 0.0f;
        this.m_vRol.x = 0.0f;
        this.m_vScale.z = 1.0f;
        this.m_vScale.y = 1.0f;
        this.m_vScale.x = 1.0f;
        switch (n) {
            case 0: {
                this.SetFlag(2);
                this.m_vPos.y += 100.0f;
                this.m_nPat = -1;
                break;
            }
            case 1: {
                this.m_nPat = -1;
                break;
            }
            case 2: {
                this.m_nPat = 21;
                this.m_nDisp = 2;
                this.m_vRol.y = this.m_fVect;
                this.m_vScale.z = 0.2f;
                this.m_vScale.y = 0.2f;
                this.m_vScale.x = 0.2f;
                break;
            }
            case 3: {
                this.m_nPat = -1;
                break;
            }
            case 4: {
                this.m_nPat = 22;
                this.m_nDisp = 2;
                this.m_fVect = CEfcWork.AngleRand();
                this.m_fSpeed = Calc3D.Rand(15) + 15;
                this.m_nColor = Calc3D.NearZero(f) ? nArray[Calc3D.Rand(3)] : 32;
                this.m_vRol.x = CEfcWork.AngleRand();
                this.m_vRol.y = CEfcWork.AngleRand();
                break;
            }
            case 5: {
                this.m_nPat = 23;
                this.m_vRol.y = Calc3D.RadLimits(f + (float)Math.PI);
                this.m_fSpeed = Calc3D.Cos(this.m_vRol.y);
                this.m_vPos.z -= this.m_fSpeed * (f2 + 250.0f);
                break;
            }
            case 6: {
                this.m_nPat = 24;
                this.m_nDisp = 10;
                this.m_vScale.x = 8.0f;
                this.m_vScale.z = 8.0f;
                break;
            }
            case 7: {
                this.m_nPat = -1;
                this.m_fVect = CEfcWork.AngleRand();
                break;
            }
            case 8: {
                this.m_nPat = 25;
                this.m_nDisp = 2;
                this.m_fVect = CEfcWork.AngleRand();
                this.m_fSpeed = 4.0f;
                this.m_nColor = nArray[Calc3D.Rand(3)];
                this.m_vRol.x = CEfcWork.AngleRand();
                this.m_vRol.y = CEfcWork.AngleRand();
                break;
            }
            case 9: {
                this.SetFlag(2);
                this.m_nPat = 2;
                this.m_vPos.y += 50.0f;
                break;
            }
            case 10: {
                this.m_nPat = 26;
                this.m_nDisp = 10;
                this.m_vPos.y += 50.0f;
                this.m_vScale.x = 0.2f;
                this.m_vScale.y = 0.2f;
                this.m_vScale.z = 0.2f;
                break;
            }
            case 11: {
                this.m_nPat = -1;
                break;
            }
            case 12: 
            case 26: 
            case 38: {
                this.m_nPat = 27;
                this.m_nDisp = 2;
                if (n == 26) {
                    this.m_nColor = 18;
                }
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vScale.x = 0.1f;
                this.m_vScale.y = 0.1f;
                this.m_vScale.z = 0.1f;
                break;
            }
            case 13: {
                this.m_nPat = 28;
                this.m_nDisp = 6;
                this.m_vScale.x = 0.1f;
                this.m_vScale.y = 0.1f;
                this.m_vScale.z = 0.1f;
                break;
            }
            case 14: {
                this.m_nPat = 29;
                this.m_nDisp = 2;
                this.m_nCount = (int)this.m_fSize;
                this.m_vPos.y += 50.0f;
                break;
            }
            case 15: {
                this.m_nPat = 30;
                this.m_nDisp = 2;
                this.m_fVect = CEfcWork.AngleRand();
                this.m_fSize = Calc3D.DEGtoRAD((float)Calc3D.Rand(180) - 90.0f);
                this.m_fSpeed = (float)(Calc3D.Rand(11) + 4) * f2;
                this.m_vPos.x -= Calc3D.Sin(this.m_fVect) * this.m_fSpeed * Calc3D.Cos(this.m_fSize);
                this.m_vPos.y += Calc3D.Sin(this.m_fSize) * this.m_fSpeed;
                this.m_vPos.z -= Calc3D.Cos(this.m_fVect) * this.m_fSpeed * Calc3D.Cos(this.m_fSize);
                break;
            }
            case 16: {
                this.m_nPat = -1;
                break;
            }
            case 17: {
                this.m_nPat = 31;
                this.m_vRol.y = this.m_fVect = CEfcWork.AngleRand();
                break;
            }
            case 20: 
            case 84: 
            case 114: {
                this.m_nPat = -1;
                if (Calc3D.NearZero(f - 101.0f)) {
                    this.m_vPos.z = 70.0f;
                    this.m_fVect = (float)Math.PI;
                } else {
                    this.m_vPos.z = -70.0f;
                    this.m_fVect = 0.0f;
                }
                this.m_vPos.x = 0.0f;
                this.m_vPos.y = 100.0f;
                break;
            }
            case 21: {
                this.m_nPat = 22;
                this.m_nDisp = 2;
                this.m_fSpeed = Calc3D.Rand(15) + 30;
                if (Calc3D.NearZero(this.m_fSize)) {
                    this.m_nColor = nArray[Calc3D.Rand(3)];
                } else if (Calc3D.NearZero(this.m_fSize - 1.0f)) {
                    int[] nArray2 = new int[]{75, 76, 77};
                    this.m_nColor = nArray2[Calc3D.Rand(3)];
                } else {
                    this.m_nColor = Calc3D.Rand(2) + 49;
                }
                this.m_vRol.x = CEfcWork.AngleRand();
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vScale.x = 2.0f;
                this.m_vScale.y = 2.0f;
                this.m_vScale.z = 2.0f;
                break;
            }
            case 115: {
                this.m_fSpeed = Calc3D.Rand(15) + 30;
                this.m_nPat = 31;
                this.m_vRol.y = this.m_fVect;
                break;
            }
            case 22: 
            case 23: {
                this.m_nPat = 32;
                this.m_nDisp = 2;
                this.m_nColor = 4;
                this.m_vPos.y = 60.0f;
                this.m_vRol.y = Calc3D.NearZero(f) ? 0.0f : (float)Math.PI;
                this.m_vPos.x += Calc3D.Sin(this.m_vRol.y) * this.m_fSize;
                this.m_vPos.z += Calc3D.Cos(this.m_vRol.y) * this.m_fSize;
                break;
            }
            case 24: {
                this.m_nPat = -1;
                break;
            }
            case 25: {
                this.m_nPat = -1;
                break;
            }
            case 27: {
                this.SetFlag(2);
                this.m_nPat = 20;
                this.m_fSpeed = 0.25f;
                if (!Calc3D.NearZero(this.m_fSize)) {
                    this.m_nPat = 21;
                    this.m_fSpeed = -0.25f;
                    this.m_nStop = (int)this.m_fSize;
                }
                this.m_fSize = HOLY_TABLE[this.m_nCount];
                this.m_vRol.Set(this.m_vPos);
                this.m_vPos.x = this.m_vRol.x + Calc3D.Sin(this.m_fVect) * this.m_fSize;
                this.m_vPos.z = this.m_vRol.z + Calc3D.Cos(this.m_fVect) * this.m_fSize;
                break;
            }
            case 28: {
                this.m_nPat = 33;
                this.m_nDisp = 2;
                this.m_vPos.y = 1000.0f;
                this.m_vPos.x += (float)(Calc3D.Rand(100) - 50);
                this.m_vPos.z += (float)(Calc3D.Rand(100) - 50);
                this.m_vRol.y = CEfcWork.AngleRand();
                break;
            }
            case 29: {
                this.m_nPat = 34;
                this.m_nDisp = 2;
                this.m_vPos.x += (float)(Calc3D.Rand(200) - 100);
                this.m_vPos.z += (float)(Calc3D.Rand(100) - 50);
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vScale.x = 0.1f;
                this.m_vScale.y = 0.1f;
                this.m_vScale.z = 0.1f;
                break;
            }
            case 30: {
                this.SetFlag(2);
                this.m_vPos.y += 50.0f;
                this.m_nPat = 10;
                break;
            }
            case 31: 
            case 36: {
                this.m_nPat = -1;
                break;
            }
            case 32: {
                this.SetFlag(2);
                this.m_nPat = 16;
                break;
            }
            case 33: {
                this.m_nPat = 44;
                this.m_nDisp = 2;
                this.m_vPos.y = 50.0f;
                this.m_fVect = f;
                this.m_vRol.y = f;
                this.m_vPos.x += Calc3D.Sin(f) * this.m_fSize * 0.5f;
                this.m_vPos.z += Calc3D.Cos(f) * this.m_fSize * 0.5f;
                break;
            }
            case 34: 
            case 35: {
                this.m_nPat = 45;
                this.m_nDisp = 2;
                this.m_nColor = 19;
                this.m_vRol.y = Calc3D.NearZero(f) ? 0.0f : (float)Math.PI;
                this.m_vPos.x += Calc3D.Sin(this.m_vRol.y) * this.m_fSize;
                this.m_vPos.z += Calc3D.Cos(this.m_vRol.y) * this.m_fSize;
                break;
            }
            case 37: {
                this.m_nPat = -1;
                break;
            }
            case 39: {
                this.m_nPat = 34;
                this.m_nColor = 47;
                this.m_nDisp = 2;
                this.m_vPos.x += (float)(Calc3D.Rand(200) - 100);
                this.m_vPos.z += (float)(Calc3D.Rand(100) - 50);
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vScale.x = 0.1f;
                this.m_vScale.y = 0.1f;
                this.m_vScale.z = 0.1f;
                break;
            }
            case 40: {
                this.m_nPat = 58;
                this.m_vPos.x = Calc3D.Rand(100) < 50 ? (this.m_vPos.x -= (float)Calc3D.Rand(100) + 450.0f) : (this.m_vPos.x += (float)Calc3D.Rand(100) + 450.0f);
                D3DXVECTOR3 d3DXVECTOR32 = new D3DXVECTOR3();
                d3DXVECTOR32.x = (float)Calc3D.Rand(600) - 300.0f;
                d3DXVECTOR32.z = this.m_vPos.z >= 1.0f ? -230.0f : 230.0f;
                this.m_vRol.y = Calc3D.CalcAngleXZ(this.m_vPos, d3DXVECTOR32) + (float)Math.PI;
                break;
            }
            case 41: {
                this.m_nPat = -1;
                if (Calc3D.NearZero(f - 101.0f)) {
                    this.m_vPos.z = -230.0f;
                    this.m_fVect = (float)Math.PI;
                } else {
                    this.m_vPos.z = 230.0f;
                    this.m_fVect = 0.0f;
                }
                this.m_vPos.x = 0.0f;
                this.m_vPos.y = 300.0f;
                this.m_vStart.Set(this.m_vPos);
                return;
            }
            case 42: {
                this.m_nPat = 22;
                this.m_nDisp = 2;
                this.m_fSpeed = Calc3D.Rand(10) + 10;
                this.m_nColor = Calc3D.Rand(2) + 49;
                this.m_vRol.x = CEfcWork.AngleRand();
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vScale.x = 2.0f;
                this.m_vScale.y = 2.0f;
                this.m_vScale.z = 2.0f;
                break;
            }
            case 43: {
                this.m_nPat = 54;
                this.m_vRol.x = Calc3D.DEGtoRAD(30.0f);
                this.m_vRol.y = f;
                this.m_vScale.x = 0.2f;
                this.m_vScale.y = 0.2f;
                this.m_vScale.z = 0.2f;
                break;
            }
            case 44: {
                this.m_nPat = -1;
                this.m_vPos.y = 300.0f;
                break;
            }
            case 45: {
                this.m_nPat = 47;
                this.m_vStart.Set(this.m_vPos);
                this.m_vPos.y = 600.0f;
                if (this.m_vPos.z < 0.0f) {
                    this.m_vPos.z += 600.0f;
                    this.m_fVect = -100.0f;
                    return;
                }
                this.m_vPos.z -= 600.0f;
                this.m_fVect = 100.0f;
                return;
            }
            case 46: {
                this.m_nPat = 49;
                this.m_vScale.x = 0.4f;
                this.m_vScale.y = 0.4f;
                this.m_vScale.z = 0.4f;
                break;
            }
            case 47: {
                this.m_nPat = 32;
                this.m_nDisp = 2;
                this.m_nColor = 54;
                this.m_vRol.y = this.m_fVect < 0.0f ? (float)Math.PI : 0.0f;
                this.m_vRol.x = Calc3D.DEGtoRAD(45.0f);
                this.m_vScale.x = 2.0f;
                this.m_vScale.y = 2.0f;
                this.m_vScale.z = 2.0f;
                break;
            }
            case 48: {
                this.m_nPat = 65;
                this.m_vRol.y = this.m_fVect;
                this.m_vPos.x += Calc3D.Sin(this.m_fVect) * 300.0f;
                this.m_vPos.z += Calc3D.Cos(this.m_fVect) * 300.0f;
                this.m_vScale.x = 0.4f;
                this.m_vScale.y = 0.4f;
                this.m_vScale.z = 0.8f;
                break;
            }
            case 49: {
                this.m_nPat = 34;
                this.m_nDisp = 2;
                this.m_vRol.x = 1.5707964f;
                this.m_vRol.y = this.m_fVect;
                this.m_vPos.x += (float)(Calc3D.Rand(100) - 50);
                this.m_vPos.y += (float)(Calc3D.Rand(100) - 50);
                this.m_vRol.z = CEfcWork.AngleRand();
                this.m_vScale.x = 0.1f;
                this.m_vScale.y = 0.1f;
                this.m_vScale.z = 0.1f;
                break;
            }
            case 50: {
                this.m_nPat = -1;
                break;
            }
            case 51: {
                this.m_nPat = 34;
                this.m_nDisp = 2;
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vScale.x = 0.4f;
                this.m_vScale.y = 0.4f;
                this.m_vScale.z = 0.4f;
                break;
            }
            case 52: {
                this.m_nPat = 32;
                this.m_nDisp = 2;
                this.m_nColor = 54;
                this.m_vPos.y = 60.0f;
                this.m_vRol.y = Calc3D.NearZero(f) ? 0.0f : (float)Math.PI;
                this.m_vPos.x += Calc3D.Sin(this.m_vRol.y) * (this.m_fSize + 100.0f);
                this.m_vPos.z += Calc3D.Cos(this.m_vRol.y) * (this.m_fSize + 100.0f);
                break;
            }
            case 53: {
                this.m_nPat = 42;
                this.m_vPos.y = 0.0f;
                this.m_vRol.y = Calc3D.NearZero(f) ? 0.0f : (float)Math.PI;
                this.m_vPos.x += Calc3D.Sin(this.m_vRol.y) * (this.m_fSize + 65.0f);
                this.m_vPos.z += Calc3D.Cos(this.m_vRol.y) * (this.m_fSize + 65.0f);
                break;
            }
            case 54: {
                this.m_nPat = 69;
                this.m_nDisp = 130;
                this.m_vScale.x = 0.2f;
                this.m_vScale.y = 0.2f;
                this.m_vScale.z = 0.2f;
                break;
            }
            case 55: {
                this.m_nPat = 24;
                this.m_nColor = 66;
                this.m_nDisp = 6;
                this.m_vScale.x = 0.2f;
                this.m_vScale.z = 0.2f;
                break;
            }
            case 56: {
                this.m_nPat = 27;
                this.m_nColor = 18;
                this.m_nDisp = 2;
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vScale.x = 0.010000001f;
                this.m_vScale.y = 0.05f;
                this.m_vScale.z = 0.05f;
                break;
            }
            case 57: {
                this.m_nPat = 70;
                this.m_nDisp = 10;
                this.m_vScale.x = 0.2f;
                this.m_vScale.y = 0.2f;
                this.m_vScale.z = 0.2f;
                break;
            }
            case 58: 
            case 116: {
                this.m_nPat = 73;
                this.m_nDisp = 2;
                this.m_vRol.x = Calc3D.DEGtoRAD(30.0f);
                this.m_vRol.y = this.m_fVect;
                break;
            }
            case 59: {
                this.m_nPat = 70;
                this.m_nColor = 66;
                this.m_vScale.x = 5.0f;
                this.m_vScale.z = 5.0f;
                break;
            }
            case 60: {
                this.m_nPat = -1;
                break;
            }
            case 61: {
                this.m_nPat = 22;
                this.m_nDisp = 2;
                this.m_fSpeed = (float)(Calc3D.Rand(50) + 50) * 0.1f;
                this.m_nColor = nArray[Calc3D.Rand(3)];
                this.m_vRol.x = CEfcWork.AngleRand();
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_fVect = CEfcWork.AngleRand();
                this.m_vPos.x += Calc3D.Sin(this.m_fVect) * this.m_fSpeed * 2.0f;
                this.m_vPos.z += Calc3D.Cos(this.m_fVect) * this.m_fSpeed * 2.0f;
                this.m_vScale.x = 1.5f;
                this.m_vScale.y = 1.5f;
                this.m_vScale.z = 1.5f;
                break;
            }
            case 62: {
                this.m_nPat = 69;
                this.m_nColor = 66;
                this.m_nDisp = 130;
                this.m_vScale.x = 0.2f;
                this.m_vScale.y = 0.2f;
                this.m_vScale.z = 0.2f;
                this.m_fSpeed = 1.45f;
                break;
            }
            case 63: {
                this.m_nPat = 70;
                this.m_nColor = Calc3D.NearZero(f2) ? 68 : (Calc3D.NearZero(f2 - 1.0f) ? 85 : 77);
                this.m_nDisp = 10;
                this.m_vScale.x = 5.0f;
                this.m_vScale.y = 5.0f;
                this.m_vScale.z = 5.0f;
                this.m_vRol.x = f;
                break;
            }
            case 64: {
                this.m_nPat = -1;
                break;
            }
            case 65: {
                this.m_nPat = 27;
                this.m_nColor = 69;
                this.m_nDisp = 2;
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vScale.x = 0.040000003f;
                this.m_vScale.y = 0.1f;
                break;
            }
            case 66: {
                this.m_nPat = 79;
                this.m_vRol.y = (float)Math.PI;
                break;
            }
            case 67: {
                this.m_nPat = 69;
                this.m_nColor = 66;
                this.m_nDisp = 130;
                this.m_vScale.x = 0.15f;
                this.m_vScale.y = 0.15f;
                this.m_vScale.z = 0.15f;
                this.m_fSpeed = 1.4f;
                break;
            }
            case 68: {
                this.m_nPat = -1;
                this.m_vPos.y = 800.0f;
                break;
            }
            case 69: {
                this.m_nPat = 83;
                this.m_vRol.y = this.m_fVect;
                break;
            }
            case 70: {
                this.m_nPat = 30;
                this.m_nColor = 78;
                this.m_nDisp = 2;
                this.m_vStart.Set(this.m_vPos);
                this.m_vPos.x = this.m_vStart.x - Calc3D.Sin(this.m_fVect) * this.m_fSize * 1.4f;
                this.m_vPos.z = this.m_vStart.z - Calc3D.Cos(this.m_fVect) * this.m_fSize * 1.4f;
                return;
            }
            case 71: {
                this.m_nPat = 22;
                this.m_nDisp = 2;
                this.m_fSpeed = Calc3D.Rand(5) + 2;
                this.m_nColor = 80;
                this.m_vRol.x = CEfcWork.AngleRand();
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vScale.x = 2.0f;
                this.m_vScale.y = 2.0f;
                this.m_vScale.z = 2.0f;
                break;
            }
            case 72: {
                this.m_nPat = 90;
                int n2 = (int)f;
                if (Vari.GetBChrWork(n2).IsPlayer()) {
                    this.m_vPos.z += f2 * 1.2f + 120.0f;
                    this.m_fSpeed = -20.0f;
                    this.m_fVect = (float)Math.PI;
                } else {
                    this.m_vPos.z -= f2 * 1.2f + 120.0f;
                    this.m_fSpeed = 20.0f;
                    this.m_fVect = 0.0f;
                }
                this.m_vRol.y = this.m_fVect;
                this.m_vPos.y = 100.0f;
                this.m_vScale.x = 0.2f;
                this.m_vScale.y = 0.2f;
                this.m_vScale.z = 0.2f;
                break;
            }
            case 73: {
                this.m_nPat = 34;
                this.m_nColor = 81;
                this.m_nDisp = 2;
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vScale.x = 0.1f;
                this.m_vScale.y = 0.02f;
                this.m_vScale.z = 0.1f;
                break;
            }
            case 74: {
                this.m_nPat = 90;
                this.m_vRol.x = 1.5707964f;
                this.m_vPos.y = 400.0f;
                this.m_vScale.x = 0.2f;
                this.m_vScale.y = 0.2f;
                this.m_vScale.z = 0.2f;
                break;
            }
            case 75: {
                this.m_nPat = 30;
                this.m_nColor = 84 + Calc3D.Rand(2);
                this.m_nDisp = 2;
                this.m_nCount = (int)this.m_fSize;
                this.m_vPos.y += 50.0f;
                break;
            }
            case 76: {
                this.m_nPat = 22;
                this.m_nDisp = 2;
                this.m_fSpeed = Calc3D.Rand(5) + 2;
                this.m_nColor = 86 + Calc3D.Rand(2);
                this.m_vRol.x = CEfcWork.AngleRand();
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vScale.x = 1.0f;
                this.m_vScale.y = 1.0f;
                this.m_vScale.z = 1.0f;
                break;
            }
            case 77: {
                this.m_nPat = 94;
                this.m_nDisp = 2;
                if (Calc3D.NearZero(f - 101.0f)) {
                    this.m_vPos.x = 600.0f;
                    this.m_vPos.z = -230.0f;
                    this.m_fSpeed = -250.0f;
                    if (Calc3D.NearZero(f2)) break;
                    this.m_vPos.x = -600.0f;
                    this.m_fSpeed = 250.0f;
                    break;
                }
                this.m_vPos.x = -600.0f;
                this.m_vPos.z = 230.0f;
                this.m_fSpeed = 250.0f;
                if (Calc3D.NearZero(f2)) break;
                this.m_vPos.x = 600.0f;
                this.m_fSpeed = -250.0f;
                break;
            }
            case 78: {
                this.m_nPat = Calc3D.NearZero(f2) ? 48 : 140;
                this.m_vStart.Set(this.m_vPos);
                this.m_vPos.y = 600.0f;
                if (this.m_vPos.z < 0.0f) {
                    this.m_vPos.z += 600.0f;
                    this.m_fVect = -100.0f;
                    return;
                }
                this.m_vPos.z -= 600.0f;
                this.m_fVect = 100.0f;
                return;
            }
            case 79: {
                this.m_nPat = 32;
                this.m_nDisp = 2;
                this.m_nColor = 54;
                this.m_vRol.y = this.m_fVect < 0.0f ? (float)Math.PI : 0.0f;
                this.m_vRol.x = Calc3D.DEGtoRAD(45.0f);
                this.m_vScale.x = 0.7f;
                this.m_vScale.y = 0.7f;
                this.m_vScale.z = 0.7f;
                break;
            }
            case 80: {
                this.m_nPat = 48;
                this.m_vScale.x = 1.3f;
                this.m_vScale.y = 1.3f;
                this.m_vScale.z = 1.3f;
                break;
            }
            case 81: {
                this.m_nPat = 104;
                this.m_nDisp |= 0x10000;
                this.m_fSize = 100.0f;
                this.m_vRol.y = this.m_fVect;
                this.m_fSpeed = this.m_fVect;
                break;
            }
            case 82: {
                this.m_nPat = 48;
                this.m_vRol.x = Calc3D.DEGtoRAD(30.0f);
                this.m_vRol.y = this.m_fVect;
                break;
            }
            case 83: {
                this.m_nPat = 73;
                this.m_nColor = Calc3D.NearZero(this.m_fVect) ? 2 : (Calc3D.NearZero(this.m_fVect - 1.0f) ? 84 : 32);
                this.m_nDisp = 2;
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vPos.x -= Calc3D.Sin(this.m_vRol.y) * 1000.0f;
                this.m_vPos.z -= Calc3D.Cos(this.m_vRol.y) * 1000.0f;
                break;
            }
            case 85: {
                this.m_nPat = 44;
                this.m_nDisp = 2;
                this.m_fSpeed = Calc3D.Rand(15) + 30;
                this.m_vRol.y = CEfcWork.AngleRand();
                break;
            }
            case 86: {
                this.m_nPat = 90;
                this.m_vRol.x = 1.5707964f;
                this.m_vPos.y = 300.0f;
                this.m_vScale.x = 0.2f;
                this.m_vScale.y = 0.2f;
                this.m_vScale.z = 0.2f;
                break;
            }
            case 87: {
                this.m_nPat = 94;
                this.m_nDisp = 2;
                this.m_vPos.y = 600.0f;
                this.m_vRol.y = 1.5707964f;
                this.m_vRol.z = 4.712389f;
                break;
            }
            case 88: {
                this.m_nPat = 22;
                this.m_nDisp = 2;
                this.m_fSpeed = Calc3D.Rand(30) + 40;
                this.m_nColor = ABI_ALL_COLOR[(int)this.m_fSize * 3 + Calc3D.Rand(3)];
                this.m_vRol.x = CEfcWork.AngleRand();
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vStart.x = (float)(Calc3D.Rand(50) - 25) / 100.0f;
                this.m_vStart.z = (float)(Calc3D.Rand(50) - 25) / 100.0f;
                this.m_vScale.x = 0.5f;
                this.m_vScale.y = 0.5f;
                this.m_vScale.z = 0.5f;
                break;
            }
            case 89: {
                this.m_vPos.y = -200.0f;
                this.m_nDisp |= 0x200;
                this.m_nPat = 112;
                this.m_vScale.y = 0.5f;
                if (Calc3D.NearZero(this.m_fVect)) {
                    this.m_vScale.x = 2.2f;
                    this.m_vScale.z = 2.2f;
                } else {
                    this.m_vScale.x = 3.0f;
                    this.m_vScale.z = 3.0f;
                }
                this.m_vRol.y = CEfcWork.AngleRand();
                break;
            }
            case 90: {
                this.m_nPat = 111;
                this.m_vPos.y = -350.0f;
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_nDisp |= 0x208;
                break;
            }
            case 91: {
                this.m_nPat = 54;
                this.m_vRol.y = f;
                this.m_vPos.x -= Calc3D.Sin(f) * 200.0f;
                this.m_vPos.z -= Calc3D.Cos(f) * 200.0f;
                break;
            }
            case 92: {
                this.m_nPat = 114;
                this.m_nColor = this.GetSongColor((int)this.m_fSize);
                break;
            }
            case 93: 
            case 99: {
                this.m_nPat = 113 + Calc3D.Rand(3);
                this.m_nColor = n == 93 ? this.GetSongColor(2) : this.GetSongColor(5);
                this.m_vRol.y = CEfcWork.AngleRand();
                break;
            }
            case 94: {
                this.m_nPat = 113 + Calc3D.Rand(3);
                this.m_nDisp = 2;
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_fVect = CEfcWork.AngleRand();
                this.m_fSize = (float)Calc3D.Rand(40) + 20.0f;
                break;
            }
            case 95: {
                this.m_nPat = 113 + Calc3D.Rand(3);
                this.m_nColor = this.GetSongColor(3);
                this.m_vRol.y = CEfcWork.AngleRand();
                break;
            }
            case 96: {
                this.m_nPat = 113 + Calc3D.Rand(3);
                this.m_nColor = this.GetSongColor(1);
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vPos.y += 100.0f;
                if (Vari.GetBChrWork((int)f).IsPlayer()) {
                    this.m_vPos.z += 100.0f;
                    this.m_fVect = Calc3D.DEGtoRAD(Calc3D.Rand(120)) + (float)Math.PI - Calc3D.DEGtoRAD(60.0f);
                    break;
                }
                this.m_vPos.z -= 100.0f;
                this.m_fVect = Calc3D.DEGtoRAD(Calc3D.Rand(120)) - Calc3D.DEGtoRAD(60.0f);
                break;
            }
            case 97: 
            case 98: {
                this.m_nPat = 116;
                this.m_nDisp = 2;
                this.m_nColor = 107;
                this.m_vRol.y = Calc3D.NearZero(f) ? 0.0f : (float)Math.PI;
                this.m_vPos.x += Calc3D.Sin(this.m_vRol.y) * this.m_fSize;
                this.m_vPos.z += Calc3D.Cos(this.m_vRol.y) * this.m_fSize;
                break;
            }
            case 100: {
                this.m_nPat = 31;
                this.m_vRol.y = this.m_fVect = CEfcWork.AngleRand();
                this.m_vScale.x = 0.2f;
                this.m_vScale.y = 0.2f;
                this.m_vScale.z = 0.2f;
                break;
            }
            case 101: {
                this.m_nDisp = 10;
                this.m_nPat = 117 + Calc3D.Rand(4);
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_nCount = (int)f;
                break;
            }
            case 102: {
                this.m_nPat = 49;
                this.m_nDisp = 4;
                this.m_nColor = 33;
                this.m_vScale.x = f2;
                this.m_vScale.y = f2 * 2.0f;
                this.m_vScale.z = f2;
                break;
            }
            case 103: {
                this.m_nPat = 97;
                this.m_nDisp |= 0x10000;
                this.m_fSize = 45.0f;
                this.m_vRol.y = this.m_fVect;
                this.m_fSpeed = this.m_fVect;
                break;
            }
            case 104: {
                this.m_nPat = 70;
                this.m_nColor = COSMO_COLOR[Calc3D.Rand(6)];
                this.m_nDisp = 10;
                this.m_vRol.x = CEfcWork.AngleRand();
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vScale.x = 0.2f;
                this.m_vScale.y = 0.2f;
                this.m_vScale.z = 0.2f;
                break;
            }
            case 105: {
                this.m_nPat = 73;
                this.m_vScale.x = 0.5f;
                this.m_vScale.y = 0.5f;
                this.m_vScale.z = 0.5f;
                this.m_nDisp = 2;
                this.m_vRol.y = CEfcWork.AngleRand();
                break;
            }
            case 106: {
                this.m_nPat = 22;
                this.m_nDisp = 2;
                this.m_fSpeed = 40.0f;
                this.m_nColor = nArray[Calc3D.Rand(3)];
                this.m_vRol.x = CEfcWork.AngleRand();
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vScale.x = 2.0f;
                this.m_vScale.y = 2.0f;
                this.m_vScale.z = 2.0f;
                break;
            }
            case 107: {
                this.m_nPat = -1;
                break;
            }
            case 108: {
                this.m_nPat = 22;
                this.m_nDisp = 2;
                this.m_fVect = f + Calc3D.DEGtoRAD(Calc3D.Rand(90) - 45);
                this.m_fSpeed = Calc3D.Rand(30) + 30;
                this.m_nColor = 32;
                this.m_vRol.x = CEfcWork.AngleRand();
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vScale.x = 2.0f;
                this.m_vScale.y = 2.0f;
                this.m_vScale.z = 2.0f;
                break;
            }
            case 109: {
                this.m_nPat = 125;
                this.m_vPos.y = -300.0f;
                this.m_nDisp |= 0x10200;
                this.m_fSize = 100.0f;
                this.m_vRol.y = this.m_fVect;
                this.m_fSpeed = this.m_fVect;
                Vari.m_nBattleWork1 = -40;
                break;
            }
            case 110: {
                this.m_nPat = 48;
                this.m_nDisp |= 0x200;
                this.m_vRol.y = this.m_fVect = CEfcWork.AngleRand();
                this.m_vPos.y = 400.0f;
                this.m_vScale.x = 2.0f;
                this.m_vScale.y = 2.0f;
                this.m_vScale.z = 2.0f;
                this.m_fSize = Calc3D.Rand(50);
                this.m_vPos.x += Calc3D.Sin(this.m_fVect) * this.m_fSize;
                this.m_vPos.z += Calc3D.Cos(this.m_fVect) * this.m_fSize;
                break;
            }
            case 111: {
                this.m_nPat = 126;
                this.m_vPos.y = -240.0f;
                this.m_nDisp |= 0x200;
                if (Calc3D.NearZero(f)) {
                    this.m_vRol.y = 0.0f;
                } else {
                    this.m_nDisp |= 8;
                    this.m_vRol.y = (float)Math.PI;
                }
                this.m_vPos.x += Calc3D.Sin(this.m_vRol.y) * this.m_fSize;
                this.m_vPos.z += Calc3D.Cos(this.m_vRol.y) * this.m_fSize;
                break;
            }
            case 112: 
            case 119: {
                this.m_nPat = 136;
                this.m_nColor = STORM_COLOR[Calc3D.Rand(4)];
                this.m_vPos.y += f;
                this.m_nDisp = 2;
                this.m_fVect = CEfcWork.AngleRand();
                this.m_vRol.y = CEfcWork.AngleRand();
                this.m_vScale.x = 0.2f;
                this.m_vScale.y = 0.2f;
                this.m_vScale.z = 0.2f;
                this.m_vStart.Set(this.m_vPos);
                if (n == 119) {
                    this.m_fSize = Calc3D.Rand(25) + 25;
                    this.m_fSpeed = 0.12f;
                    this.m_vPos.x = this.m_vStart.x + Calc3D.Sin(this.m_fVect) * this.m_fSize;
                } else {
                    this.m_fSize = Calc3D.Rand(50) + 50;
                    this.m_fSpeed = 0.25f;
                    this.m_vPos.x = this.m_vStart.x + Calc3D.Sin(this.m_fVect) * this.m_fSize * 1.4f;
                }
                this.m_vPos.z = this.m_vStart.z + Calc3D.Cos(this.m_fVect) * this.m_fSize;
                return;
            }
            case 113: {
                this.m_nPat = 136;
                this.m_vRol.y = CEfcWork.AngleRand();
                break;
            }
            case 117: {
                this.m_nPat = -1;
                this.m_fVect = CEfcWork.AngleRand();
                this.m_fSize = f2;
                break;
            }
            case 118: {
                this.m_nPat = 30;
                this.m_nDisp = 2;
                this.m_fSpeed = 48.0f;
                this.m_vPos.x -= Calc3D.Sin(this.m_fVect) * f2;
                this.m_vPos.y += 0.0f;
                this.m_vPos.z -= Calc3D.Cos(this.m_fVect) * f2;
                break;
            }
            case 120: {
                this.m_nPat = -1;
                this.m_fVect = CEfcWork.AngleRand();
                this.m_fSize = f2;
                break;
            }
            case 121: {
                this.m_nPat = 48;
                this.m_nDisp = 2;
                this.m_fSpeed = 48.0f;
                this.m_vPos.x -= Calc3D.Sin(this.m_fVect) * f2;
                this.m_vPos.y += 0.0f;
                this.m_vPos.z -= Calc3D.Cos(this.m_fVect) * f2;
                break;
            }
            case 122: {
                this.m_nPat = 73;
                this.m_nColor = 49;
                this.m_nDisp = 2;
                this.m_vScale.x = 1.0f;
                this.m_vScale.y = 0.2f;
                this.m_vScale.z = 1.0f;
                this.m_vPos.x -= Calc3D.Sin(this.m_fVect) * f2;
                this.m_vPos.y += 0.0f;
                this.m_vPos.z -= Calc3D.Cos(this.m_fVect) * f2;
                this.m_vRol.x = 1.5707964f;
                break;
            }
            case 123: {
                this.m_nPat = 145;
                this.m_nColor = 0;
                this.m_nDisp = 522;
                this.m_vPos.y = -350.0f;
                this.m_vRol.y = CEfcWork.AngleRand();
            }
        }
        this.m_vStart.Set(this.m_vPos);
    }

    public void ResetMoved() {
        this.m_bMoved = false;
    }

    public static float AngleRand() {
        return Calc3D.DEGtoRAD(Calc3D.Rand(360));
    }

    public void SummonAnim() {
        switch (this.m_nCount & 7) {
            case 0: 
            case 4: {
                this.m_vRol.y = this.m_fSpeed + 0.0f;
                return;
            }
            case 1: 
            case 3: {
                this.m_vRol.y = this.m_fSpeed + 0.025f;
                return;
            }
            case 2: {
                this.m_vRol.y = this.m_fSpeed + 0.05f;
                return;
            }
            case 5: 
            case 7: {
                this.m_vRol.y = this.m_fSpeed - 0.025f;
                return;
            }
            case 6: {
                this.m_vRol.y = this.m_fSpeed - 0.05f;
                return;
            }
        }
    }

    public void MakeRijeSub(D3DXVECTOR3 d3DXVECTOR3) {
        int n = 0;
        do {
            Vari.MakeEffect(71, d3DXVECTOR3, CEfcWork.AngleRand(), 0.0f);
        } while (++n < 4);
    }

    public void MakeEsnaSub(D3DXVECTOR3 d3DXVECTOR3, float f, float f2) {
        Vari.MakeEffect(118, d3DXVECTOR3, f, f2);
    }

    public void MakeMugenSub(D3DXVECTOR3 d3DXVECTOR3, float f, float f2) {
        Vari.MakeEffect(121, d3DXVECTOR3, f, f2);
        Vari.MakeEffect(121, d3DXVECTOR3, f + (float)Math.PI, f2);
        Vari.MakeEffect(122, d3DXVECTOR3, CEfcWork.AngleRand(), f2);
    }
}

