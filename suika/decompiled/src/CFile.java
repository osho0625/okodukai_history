/*
 * Decompiled with CFR 0.152.
 */
import java.io.BufferedInputStream;
import java.io.DataInputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

class CFile {
    private URL m_cURL;
    private DataInputStream m_cStream;
    private String m_strPath;

    public char ReadChar() {
        if (this.m_cStream == null) {
            return '\u0000';
        }
        char c = '\u0000';
        try {
            c = this.m_cStream.readChar();
        }
        catch (IOException iOException) {
            c = '\u0000';
        }
        return c;
    }

    public int ReadInt() {
        if (this.m_cStream == null) {
            return 0;
        }
        int n = 0;
        try {
            n = this.m_cStream.readInt();
        }
        catch (IOException iOException) {
            n = 0;
        }
        return n;
    }

    public short ReadWord() {
        if (this.m_cStream == null) {
            return 0;
        }
        short s = 0;
        try {
            s = this.m_cStream.readShort();
        }
        catch (IOException iOException) {
            s = 0;
        }
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
        if (this.m_cStream == null) {
            return 0;
        }
        byte by = 0;
        try {
            by = this.m_cStream.readByte();
        }
        catch (IOException iOException) {
            by = 0;
        }
        return by;
    }

    public float ReadFloat() {
        if (this.m_cStream == null) {
            return 0.0f;
        }
        float f = 0.0f;
        try {
            f = this.m_cStream.readFloat();
        }
        catch (IOException iOException) {
            f = 0.0f;
        }
        return f;
    }

    CFile() {
    }

    public void Close() {
        if (this.m_cStream == null) {
            return;
        }
        try {
            this.m_cStream.close();
        }
        catch (IOException iOException) {
            return;
        }
        this.m_cStream = null;
    }

    public boolean Open() {
        return true;
    }

    public boolean Open(String string) {
        this.m_strPath = new String(string);
        try {
            this.m_cURL = new URL(string);
        }
        catch (MalformedURLException malformedURLException) {
            return false;
        }
        try {
            this.m_cStream = new DataInputStream(new BufferedInputStream(this.m_cURL.openStream()));
        }
        catch (IOException iOException) {
            return false;
        }
        return true;
    }

    public boolean Read(byte[] byArray) {
        if (this.m_cStream == null) {
            return false;
        }
        try {
            this.m_cStream.readFully(byArray);
        }
        catch (IOException iOException) {
            return false;
        }
        return true;
    }
}

