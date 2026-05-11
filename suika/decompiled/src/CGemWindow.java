/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class CGemWindow
extends CWindow {
    private ARpg m_App;
    private int m_nWidth;
    private int m_nHeight;
    private int m_nXPos;
    private int m_nYPos;
    private int m_nItemNo;
    private int m_nMode;
    private CChrParam m_Prm;
    private int m_nChrNo;

    public void SetPrm(int n, CChrParam cChrParam) {
        this.m_nChrNo = n;
        this.m_Prm = cChrParam;
    }

    private String GetAbility(int n) {
        String string;
        if (this.m_nItemNo == -1) {
            return "\uff0d\uff0d\uff0d\u3000\uff0d\uff0d\uff0d\uff0d\uff0d\uff0d\uff0d\uff0d\uff0d";
        }
        int n2 = this.m_nItemNo - 110;
        int n3 = CGemData.GetAP(n2, n);
        int n4 = CGemData.GetAbi(n2, n);
        if (this.IsLearned(n4)) {
            string = "\u7fd2\u5f97\u6e08\u3000";
        } else {
            string = Calc3D.NumberString(n3, 3);
            string = string + "\u3000";
        }
        string = n4 >= 1000 ? string + CGemData.CMD_NAME[n4 - 1000] : string + this.GetSkillName(n4);
        return string;
    }

    CGemWindow() {
    }

    public void Create(ARpg aRpg, int n, int n2, int n3) {
        this.m_App = aRpg;
        this.m_nXPos = n;
        this.m_nYPos = n2;
        this.m_nMode = n3;
        this.m_Prm = null;
        this.m_nItemNo = -1;
        int n4 = 10;
        if (this.m_nMode == 1) {
            n4 = 8;
        }
        this.m_nWidth = this.GetWidth_Text(13);
        this.m_nHeight = this.GetHeight_Text(n4);
        this._Create(aRpg, Vari.m_WinColor, this.m_nWidth, this.m_nHeight, 4);
    }

    public boolean IsLearned(int n) {
        return n < 1000 ? this.m_Prm.m_Abi.GetFlagM(n) : this.m_Prm.m_Abi.GetFlagC(CGemData.CMD_TABLE[n - 1000]);
    }

    public void SetItem(int n) {
        this.m_nItemNo = n;
    }

    public void DrawMessage() {
        String string = new String();
        int n = 0;
        if (this.m_nMode == 0) {
            string = "\u88c5\u5099\uff1a";
        }
        string = string + this.GetItemName();
        this.DrawFont(8, this.GetYPos(n), string, Def.GetColor(0), 16);
        ++n;
        if (this.m_nMode == 0) {
            string = "\uff21\uff30\uff1a";
            string = string + Calc3D.NumberString(this.m_Prm.m_nAP, 3);
            this.DrawFont(8, this.GetYPos(n), string, Def.GetColor(0), 16);
            n += 2;
        }
        int n2 = 0;
        do {
            Color color = Def.GetColor(0);
            if (this.m_nMode == 0 && CGemData.IsLearn(this.m_Prm, n2)) {
                color = Def.GetColor(8);
            }
            this.DrawFont(8, this.GetYPos(n), this.GetAbility(n2), color, 16);
            ++n;
        } while (++n2 < 7);
    }

    public String GetSkillName(int n) {
        String string = new String();
        if (n >= 16 && n <= 25) {
            string = "\u7279\u6280\uff0f";
        }
        if (n >= 26 && n <= 36) {
            string = "\u5263\u6280\uff0f";
        }
        if (n >= 50 && n <= 67) {
            string = this.m_nChrNo == 0 ? "\u897f\u74dc\u9b54\u6cd5\uff0f" : "\u795e\u5b98\u9b54\u6cd5\uff0f";
        }
        if (n >= 39 && n <= 49) {
            string = "\u9670\u967d\u8853\uff0f";
        }
        if (n >= 68 && n <= 81) {
            string = "\u6575\u306e\u6280\uff0f";
        }
        if (n >= 82 && n <= 87) {
            string = "\u5504\uff0f";
        }
        CSkillData cSkillData = Vari.GetSkillData(n);
        string = string + cSkillData.m_strName;
        return string;
    }

    public void CloseWindow() {
        this._Close();
    }

    public void Run() {
        boolean bl = this._Move();
        this._Draw();
        if (bl) {
            this.DrawMessage();
        }
    }

    public void OpenWindow() {
        this._Open(this.m_nXPos + this.m_nWidth / 2, this.m_nYPos + this.m_nHeight / 2, this.m_nXPos, this.m_nYPos);
    }

    private int GetAP(int n) {
        if (this.m_nItemNo == -1) {
            return 0;
        }
        return CGemData.GetAP(this.m_nItemNo - 110, n);
    }

    private String GetItemName() {
        if (this.m_nItemNo == -1) {
            return "\uff0d\uff0d\uff0d\uff0d\uff0d\uff0d";
        }
        CItemData cItemData = Vari.GetItemData(this.m_nItemNo);
        return cItemData.m_strName;
    }
}

