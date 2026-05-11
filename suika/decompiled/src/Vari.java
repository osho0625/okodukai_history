/*
 * Decompiled with CFR 0.152.
 */
import java.awt.Color;

class Vari {
    public static CChrManage m_Char;
    public static CBChrManage m_BChr;
    public static CEnemyPartyArray m_EPartyA;
    public static CPrmManage m_Prm;
    public static CEfcManage m_Efc;
    public static CEventManage m_Event;
    public static CParamAll m_PrmAll;
    public static CMenuWindow m_Menu;
    public static CChrSelect m_ChrSel;
    public static Color m_WinColor;
    private static int m_nCameraChr;
    public static ARpg m_App;
    public static int m_nSkyHand;
    public static int[] m_anChrPrmTable;
    public static CFlag m_SysFlag;
    public static int[] m_anPartyTable;
    public static int m_nQuake;
    public static boolean m_bExecEvent;
    public static boolean m_bDebMessOff;
    private static int m_nWorldCount;
    private static int m_nWorldChr;
    public static CAction m_ActOld;
    public static CInitApplet cInit;
    public static int m_nBattleWork1;
    public static CHelpWindow m_Help;
    public static int[] m_anArray;
    public static D3DXVECTOR3 m_vEyeAt;
    public static CCosmo m_Cosmo;
    public static boolean m_bCameraMode;
    public static D3DXVECTOR3 m_vCameraPos;
    public static int m_nBtlName;
    public static boolean m_bDistView;
    public static float m_fFogStart;
    public static float m_fFogEnd;
    public static boolean m_bTitle;
    public static boolean m_bSkillWin;

    public static boolean IsStopWorld() {
        return m_nWorldCount > 0;
    }

    public static boolean IsStopWorld(int n) {
        if (!Vari.m_App.m_Flag.GetFlag(1)) {
            return false;
        }
        if (n >= 9) {
            return false;
        }
        CBattleWork cBattleWork = Vari.GetBChrWork(n);
        if (cBattleWork.m_Prm != null && cBattleWork.m_Prm.m_Abi != null && cBattleWork.m_Prm.m_Abi.GetFlag(180)) {
            return false;
        }
        if (m_nWorldCount > 0) {
            return m_nWorldChr != n;
        }
        return false;
    }

    public static CEfcWork SearchEfcWork() {
        return m_Efc.SearchWork();
    }

    public static void Create() {
        m_Char = new CChrManage();
    }

    public static int GetWorldCount() {
        return m_nWorldCount;
    }

    public static void HealFlag(int n) {
        if (n < 3) {
            Vari.m_App.m_Play.SetEvtFlag(310);
        }
    }

    public static int GetCameraChr() {
        return m_nCameraChr;
    }

    public static void SetWorld(int n) {
        m_nWorldCount = 4;
        m_nWorldChr = n;
    }

    public static CChrParam GetChrPrm(int n) {
        return m_Prm.GetPrm(n);
    }

    public static CBattleWork GetBChrWork(int n) {
        return Vari.m_BChr.m_aBtlWork[n];
    }

    public static CChrParam GetDataPrm(int n) {
        return m_PrmAll.GetPrm(n);
    }

    public static CEfcWork MakeEffect(int n, D3DXVECTOR3 d3DXVECTOR3, float f, float f2) {
        CEfcWork cEfcWork = Vari.SearchEfcWork();
        if (cEfcWork != null) {
            cEfcWork.Init(n, d3DXVECTOR3, f, f2);
        }
        return cEfcWork;
    }

    public static CSkillData GetSkillData(int n) {
        return m_PrmAll.GetSkill(n);
    }

    public static int GetPartyWork(int n) {
        return m_anPartyTable[n];
    }

    public static CPrmUp GetPrmUp(int n) {
        return m_PrmAll.GetPrmUp(n);
    }

    public static void SetSysFlag(int n) {
        m_SysFlag.SetFlag(n);
    }

    public static int GetPartyNum() {
        return Vari.m_App.m_Play.m_nPartyNum;
    }

    static {
        m_BChr = new CBChrManage();
        m_EPartyA = new CEnemyPartyArray();
        m_Prm = new CPrmManage();
        m_Efc = new CEfcManage();
        m_Event = new CEventManage();
        m_PrmAll = new CParamAll();
        m_Menu = new CMenuWindow();
        m_ChrSel = new CChrSelect();
        m_WinColor = new Color(20, 30, 40);
        m_nSkyHand = -1;
        m_anChrPrmTable = new int[]{0, 1, 2, 3};
        m_SysFlag = new CFlag();
        m_anPartyTable = new int[3];
        m_nWorldChr = -1;
        m_ActOld = new CAction();
        cInit = new CInitApplet();
        m_Help = new CHelpWindow();
        m_anArray = new int[64];
        m_vEyeAt = new D3DXVECTOR3();
        m_Cosmo = new CCosmo();
        m_vCameraPos = new D3DXVECTOR3();
        m_nBtlName = -1;
        m_bDistView = true;
    }

    public static String GetSkillHelp(int n) {
        CSkillData cSkillData = Vari.GetSkillData(n);
        if (cSkillData == null) {
            return "\u30a8\u30e9\u30fc\uff01";
        }
        CHelpData cHelpData = Vari.GetHelpData(cSkillData.m_nHelp);
        if (cHelpData == null) {
            return "\u30a8\u30e9\u30fc\uff01";
        }
        return cHelpData.m_strText;
    }

    Vari() {
        m_bSkillWin = false;
    }

    public static boolean CountWorld() {
        return m_nWorldCount > 0 && (m_nWorldCount += -1) == 0;
    }

    public static CChrWork GetChrWork(int n) {
        return m_Char.GetWork(n);
    }

    public static CItemData GetItemData(int n) {
        return m_PrmAll.GetItem(n);
    }

    public static CHelpData GetHelpData(int n) {
        return m_PrmAll.GetHelp(n);
    }

    public static void Init() {
        m_Char.Init();
    }

    public static boolean IsPartyAbility(int n) {
        int n2 = 0;
        while (n2 < Vari.GetPartyNum()) {
            CChrParam cChrParam = Vari.GetChrPrm(n2);
            if (cChrParam.m_Abi.GetFlag(n)) {
                return true;
            }
            ++n2;
        }
        return false;
    }

    public static boolean GetSysFlag(int n) {
        return m_SysFlag.GetFlag(n);
    }

    public static void ResetSysFlag(int n) {
        m_SysFlag.ResetFlag(n);
    }

    public static void SetCameraChr(int n) {
        m_nCameraChr = n;
    }

    public static int GetWorldChr() {
        if (!Vari.IsStopWorld()) {
            return -1;
        }
        return m_nWorldChr;
    }

    public static CEfcWork GetEfcWork(int n) {
        return m_Efc.GetWork(n);
    }

    public static void InitWorld() {
        m_nWorldCount = 0;
        m_nWorldChr = -1;
    }
}

