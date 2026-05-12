/*
 * Decompiled with CFR 0.152.
 */
class CEventData {
    private byte[] m_abyData;

    CEventData() {
    }

    public boolean Load(int n, CFile cFile) {
        this.m_abyData = new byte[n];
        int n2 = 0;
        while (n2 < n) {
            this.m_abyData[n2] = cFile.ReadByte();
            ++n2;
        }
        return true;
    }

    public byte Get(int n) {
        return this.m_abyData[n];
    }

    public String GetString(int n, int n2) {
        char[] cArray = new char[n2 + 1];
        int n3 = 0;
        while (n3 < n2) {
            cArray[n3] = CFunc.Byte2Char(this.m_abyData[n + n3 * 2 + 0], this.m_abyData[n + n3 * 2 + 1]);
            ++n3;
        }
        cArray[n2] = '\u0000';
        String string = new String(cArray, 0, n2 + 1);
        return string;
    }
}

