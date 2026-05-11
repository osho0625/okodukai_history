/*
 * Decompiled with CFR 0.152.
 */
class CFunc {
    public static char Byte2Char(byte n, byte n2) {
        int n3;
        int n4 = n;
        if (n4 < 0) {
            n4 = 256 + n4;
        }
        if ((n3 = n2) < 0) {
            n3 = 256 + n3;
        }
        return (char)((n4 << 8) + n3);
    }

    CFunc() {
    }

    public static int Byte2Int(byte by) {
        if (by < 127) {
            return by;
        }
        return by - 256;
    }

    public static int Byte2Int(byte n, byte n2) {
        int n3;
        int n4 = n;
        if (n4 < 0) {
            n4 = 256 + n4;
        }
        if ((n3 = n2) < 0) {
            n3 = 256 + n3;
        }
        return (n4 << 8) + n3;
    }

    public static int Word2Int(int n) {
        if (n < Short.MAX_VALUE) {
            return n;
        }
        return n - 65536;
    }

    public static int Unsigned(byte by) {
        if (by >= 0) {
            return by;
        }
        return 256 + by;
    }

    public static short Byte2Short(byte by) {
        if (by >= 0) {
            return by;
        }
        return (short)(256 + by);
    }
}

