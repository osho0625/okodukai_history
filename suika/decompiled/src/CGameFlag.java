/*
 * Decompiled with CFR 0.152.
 */
class CGameFlag
extends CFlag {
    private int m_nStageNo;
    private float m_fCameraVect;
    private float m_fCameraTurn;

    public float GetCameraVect() {
        return this.m_fCameraVect;
    }

    public boolean CheckCameraRol() {
        return this.m_fCameraVect == this.m_fCameraTurn;
    }

    public void SetCameraVect1(float f) {
        this.m_fCameraVect = f;
        this.m_fCameraTurn = f;
    }

    public void SetStageNo(int n) {
        this.m_nStageNo = n;
    }

    CGameFlag() {
    }

    public void SetCameraVectAnm2(float f) {
        this.m_fCameraTurn = f;
    }

    public int GetStageNo() {
        return this.m_nStageNo;
    }

    public boolean SetCameraVectAnm(float f) {
        if (this.CheckCameraRol()) {
            this.m_fCameraTurn = f;
            return true;
        }
        return false;
    }

    public void Move() {
        if (this.m_fCameraVect != this.m_fCameraTurn) {
            this.m_fCameraVect = Calc3D.TurnAngle(this.m_fCameraVect, this.m_fCameraTurn, 0.08726646f);
        }
    }
}

