/*
 * Decompiled with CFR 0.152.
 */
class CFileJip {
    private int m_nPackSize;
    private byte m_byPack;
    private int m_nPtr;
    private byte[] m_abyBuffer;

    public char ReadChar() {
        char c = (char)(CFunc.Byte2Short(this.m_abyBuffer[this.m_nPtr + 0]) * 256 + CFunc.Byte2Short(this.m_abyBuffer[this.m_nPtr + 1]));
        this.m_nPtr += 2;
        return c;
    }

    public int ReadInt() {
        int n = (CFunc.Unsigned(this.m_abyBuffer[this.m_nPtr + 0]) << 24) + (CFunc.Unsigned(this.m_abyBuffer[this.m_nPtr + 1]) << 16) + (CFunc.Unsigned(this.m_abyBuffer[this.m_nPtr + 2]) << 8) + CFunc.Unsigned(this.m_abyBuffer[this.m_nPtr + 3]);
        this.m_nPtr += 4;
        return n;
    }

    public boolean Load(String string) {
        this.m_nPtr = 0;
        CFile cFile = new CFile();
        if (!cFile.Open(string)) {
            return false;
        }
        int n = cFile.ReadInt() - 9;
        this.m_nPackSize = cFile.ReadInt();
        this.m_byPack = cFile.ReadByte();
        byte[] byArray = new byte[n];
        if (!cFile.Read(byArray)) {
            cFile.Close();
            return false;
        }
        cFile.Close();
        this.m_abyBuffer = new byte[this.m_nPackSize];
        int n2 = 0;
        int n3 = 0;
        while (n3 < n) {
            byte by = byArray[n3];
            if (by != this.m_byPack) {
                this.m_abyBuffer[n2] = by;
                ++n2;
            } else {
                by = byArray[n3 + 1];
                int n4 = CFunc.Unsigned(byArray[n3 + 2]);
                int n5 = 0;
                while (n5 < n4) {
                    this.m_abyBuffer[n2] = by;
                    ++n2;
                    ++n5;
                }
                n3 += 2;
            }
            ++n3;
        }
        return true;
    }

    public short ReadWord() {
        short s = (short)(CFunc.Byte2Short(this.m_abyBuffer[this.m_nPtr + 0]) * 256 + CFunc.Byte2Short(this.m_abyBuffer[this.m_nPtr + 1]));
        this.m_nPtr += 2;
        return s;
    }

    public String ReadString(int n) {
        char[] cArray = new char[(n /= 2) + 1];
        int n2 = 0;
        int n3 = 0;
        while (n3 < n) {
            cArray[n3] = this.ReadChar();
            if (cArray[n3] != '\u0000') {
                ++n2;
            }
            ++n3;
        }
        cArray[n] = '\u0000';
        String string = new String(cArray, 0, n2);
        return string;
    }

    public byte ReadByte() {
        byte by = this.m_abyBuffer[this.m_nPtr + 0];
        ++this.m_nPtr;
        return by;
    }

    public float ReadFloat() {
        int n = (CFunc.Unsigned(this.m_abyBuffer[this.m_nPtr + 0]) << 24) + (CFunc.Unsigned(this.m_abyBuffer[this.m_nPtr + 1]) << 16) + (CFunc.Unsigned(this.m_abyBuffer[this.m_nPtr + 2]) << 8) + CFunc.Unsigned(this.m_abyBuffer[this.m_nPtr + 3]);
        this.m_nPtr += 4;
        return Float.intBitsToFloat(n);
    }

    CFileJip() {
    }
}

