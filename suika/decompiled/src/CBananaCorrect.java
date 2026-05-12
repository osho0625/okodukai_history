/*
 * Decompiled with CFR 0.152.
 */
class CBananaCorrect
extends CMoveCorrect {
    CBananaCorrect() {
    }

    public boolean HitChrCondition(CChrWork cChrWork, CChrWork cChrWork2) {
        if (cChrWork2.GetFlag(1) && !cChrWork2.GetFlag(32) && cChrWork.m_nWorkNo != cChrWork2.m_nWorkNo) {
            return cChrWork2.m_nAlgo != 5;
        }
        return false;
    }
}

