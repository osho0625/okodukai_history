/*
 * Decompiled with CFR 0.152.
 */
class CHelpStatus
extends CBaseHelp {
    static final int MAX_LIST = 9;
    static final String[] LIST_ARRAY = new String[]{"\uff28\uff30", "\uff2d\uff30", "\u653b\u6483\u529b", "\u7cbe\u795e\u529b", "\u9632\u5fa1\u529b", "\u7d20\u65e9\u3055", "\u5668\u7528\u3055", "\uff25\uff38", "\uff21\uff30"};

    CHelpStatus() {
        this.m_nListNum = 9;
        this.Init();
    }

    public void FrameFunc() {
        int n = this.GetSelectNo();
        CHelpData cHelpData = Vari.GetHelpData(n * 2 + 170);
        if (cHelpData != null) {
            this.m_Help.SetText(0, cHelpData.m_strText);
        } else {
            this.m_Help.SetText(0, "\u30a8\u30e9\u30fc\uff01");
        }
        cHelpData = Vari.GetHelpData(n * 2 + 171);
        if (cHelpData != null) {
            this.m_Help.SetText(1, cHelpData.m_strText);
            return;
        }
        this.m_Help.SetText(1, "\u30a8\u30e9\u30fc\uff01");
    }

    public void CreateText() {
        int n = 0;
        do {
            this.SetMenuTextLR(n, LIST_ARRAY[n]);
        } while (++n < 9);
        this.MakeList();
    }
}

