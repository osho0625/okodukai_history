/*
 * Decompiled with CFR 0.152.
 */
class CStageManage {
    private int m_nStageMax;
    private CAreaParam[] m_acStagePrm;

    public boolean Load(String string) {
        CFileJip cFileJip = new CFileJip();
        if (!cFileJip.Load(string)) {
            System.out.println(string + "/\u30aa\u30fc\u30d7\u30f3\u5931\u6557");
            return false;
        }
        Vari.m_App.UpdateLoadCount();
        this.m_nStageMax = cFileJip.ReadInt();
        this.m_acStagePrm = new CAreaParam[this.m_nStageMax];
        int n = 0;
        while (n < this.m_nStageMax) {
            this.m_acStagePrm[n] = new CAreaParam();
            if (!this.m_acStagePrm[n].Load(cFileJip)) {
                System.out.println(string + "/\u8aad\u307f\u8fbc\u307f\u5931\u6557");
                return false;
            }
            ++n;
        }
        Vari.m_App.UpdateLoadCount();
        return true;
    }

    CStageManage() {
    }

    public CAreaParam GetStage(int n) {
        return this.m_acStagePrm[n];
    }
}

