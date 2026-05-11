/*
 * Decompiled with CFR 0.152.
 */
class CEnemy
extends CBaseEnemy {
    CEnemy(ARpg aRpg) {
        this.m_App = aRpg;
    }

    public void Mons_00(CChrWork cChrWork) {
    }

    public void Mons_01(CChrWork cChrWork) {
    }

    public void Move(CChrWork cChrWork) {
        switch (cChrWork.m_nAlgo) {
            case 0: {
                this.Mons_00(cChrWork);
                return;
            }
            case 1: {
                this.Mons_01(cChrWork);
                return;
            }
        }
    }

    CEnemy() {
    }
}

