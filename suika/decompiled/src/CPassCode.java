/*
 * Decompiled with CFR 0.152.
 */
class CPassCode {
    static final String[] m_astrPassCode = new String[]{"K", "s", "G", "T", "f", "-", "n", "v", "C", "O", "p", "B", "8", "D", "x", "F", "2", "H", "I", "J", "0", "L", "k", "N", "9", "P", "Q", "R", "S", "3", "b", "V", "W", "z", "Y", "Z", "a", "U", "c", "d", "e", "4", "g", "h", "i", "j", "M", "l", "m", "6", "o", "A", "q", "r", "1", "t", "u", "7", "w", "E", "y", "X", "5", "+"};

    public static String GetCode(int n, int n2, int n3) {
        return m_astrPassCode[n + n2 + n3 * 27 & 0x3F];
    }

    public static int GetNum(String string, int n, int n2) {
        if (string.equals("\r") || string.equals("\n")) {
            return 99;
        }
        int n3 = 0;
        while (n3 < m_astrPassCode.length) {
            if (string.equals(m_astrPassCode[n3])) {
                return n3 - n - n2 * 27 & 0x3F;
            }
            ++n3;
        }
        return -1;
    }

    CPassCode() {
    }
}

