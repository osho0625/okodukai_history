/*
 * Decompiled with CFR 0.152.
 */
class CBSkillWindowLR
extends CMenuWindowLR {
    public void FrameFunc() {
        int n = Vari.m_anArray[this.GetSelectNo()];
        CSkillData cSkillData = Vari.GetSkillData(n);
        Vari.m_Help.SetHelp(Vari.GetHelpData(cSkillData.m_nHelp));
    }

    CBSkillWindowLR() {
    }
}

