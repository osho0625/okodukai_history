/*
 * Decompiled with CFR 0.152.
 */
class CEquipMenu
extends CMenuWindow {
    private int m_nChrNo;

    public void FrameFunc() {
        CChrParam cChrParam = Vari.GetChrPrm(this.m_nChrNo);
        int n = cChrParam.m_anEquip[this.GetSelectNo() - 1];
        if (n < 0) {
            Vari.m_Help.SetHelp(Vari.GetHelpData(0));
            return;
        }
        CItemData cItemData = Vari.GetItemData(n);
        Vari.m_Help.SetHelp(Vari.GetHelpData(cItemData.m_nHelp));
    }

    CEquipMenu() {
    }

    public void SetChrNo(int n) {
        this.m_nChrNo = n;
    }
}

