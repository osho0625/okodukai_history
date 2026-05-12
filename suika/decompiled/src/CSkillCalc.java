/*
 * Decompiled with CFR 0.152.
 */
class CSkillCalc {
    static final int BASE_STRHEAL = 100;

    public static int Calc_StrHeal(CChrParam cChrParam) {
        int n = cChrParam.GetStr() + 100;
        int n2 = n / 5 * (n / 6) + n;
        n2 = n2 * (Calc3D.Rand(40) + 60) / 100;
        return n2;
    }

    public static int Calc_IntHeal(CChrParam cChrParam, int n) {
        int n2 = cChrParam.GetInt();
        int n3 = (n2 + 2) * (n2 + 1);
        n3 = n3 * (Calc3D.Rand(30) + 70) / 100;
        n3 = n3 * n / 100;
        return n3;
    }

    CSkillCalc() {
    }
}

