/*
 * Decompiled with CFR 0.152.
 */
class CAction {
    static final int NONE = 0;
    static final int ATTACK = 1001;
    static final int RUNAWAY = 1002;
    static final int STEAL = 1003;
    static final int SEIZE = 1004;
    static final int ITEM_001 = 2001;
    static final int ITEM_002 = 2002;
    static final int ITEM_003 = 2003;
    static final int ITEM_006 = 2006;
    static final int ITEM_010 = 2010;
    static final int ITEM_011 = 2011;
    static final int ITEM_012 = 2012;
    static final int ITEM_013 = 2013;
    static final int ALL_PLAYER = 97;
    static final int ALL_ENEMY = 98;
    static final int ALL_ALL = 99;
    public int m_nAlgo;
    public int m_nObj;
    public int m_nItem;

    public void Set(CAction cAction) {
        this.m_nAlgo = cAction.m_nAlgo;
        this.m_nObj = cAction.m_nObj;
        this.m_nItem = cAction.m_nItem;
    }

    CAction() {
    }
}

