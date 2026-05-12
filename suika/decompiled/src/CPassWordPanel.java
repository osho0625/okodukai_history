/*
 * Decompiled with CFR 0.152.
 */
import java.awt.BorderLayout;
import java.awt.Button;
import java.awt.Event;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Label;
import java.awt.Panel;
import java.awt.TextArea;

class CPassWordPanel
extends CWinEntry {
    public Panel m_Panel = new Panel();
    public Label m_Label = new Label();
    public TextArea m_TextArea = new TextArea("", 6, 53);
    public Button m_OK = new Button("\u3000");
    public Button m_Cancel = new Button("\u3000");
    private boolean m_bDispPanel;
    public boolean m_bBtnOK;
    public boolean m_bBtnCancel;

    public void CreateOutputPass(String string) {
        this.m_TextArea.setEditable(true);
        this.m_TextArea.setText(string);
        this.m_TextArea.selectAll();
        this.m_TextArea.requestFocus();
        this.m_Label.setText("\u30b3\u30d4\u30da\u3057\u3066\u4fdd\u5b58\u3057\u3066\u306d(CTRL+C)");
        this.m_OK.setLabel("\u30b2\u30fc\u30e0\u3092\u7d9a\u3051\u308b");
        this.m_Cancel.setLabel("\u7d42\u4e86\u3059\u308b");
        this.m_Panel.show();
        this.m_bDispPanel = true;
    }

    public String GetInputPass() {
        return this.m_TextArea.getText();
    }

    CPassWordPanel() {
    }

    public boolean action(Event event, Object object) {
        if (event.target instanceof Button) {
            Button button = (Button)event.target;
            if (this.m_OK.equals(button)) {
                this.m_bBtnOK = true;
            } else if (this.m_Cancel.equals(button)) {
                this.m_bBtnCancel = true;
            }
            return true;
        }
        return false;
    }

    public void CreatePassPanel() {
        GridBagLayout gridBagLayout = new GridBagLayout();
        this.m_Panel.setLayout(gridBagLayout);
        GridBagConstraints gridBagConstraints = new GridBagConstraints();
        gridBagConstraints.fill = 1;
        gridBagConstraints.gridwidth = 0;
        gridBagLayout.setConstraints(this.m_Label, gridBagConstraints);
        this.m_Panel.add(this.m_Label);
        gridBagConstraints.gridwidth = 0;
        gridBagLayout.setConstraints(this.m_TextArea, gridBagConstraints);
        this.m_Panel.add(this.m_TextArea);
        gridBagConstraints.weightx = 0.5;
        gridBagConstraints.gridwidth = -1;
        gridBagLayout.setConstraints(this.m_OK, gridBagConstraints);
        this.m_Panel.add(this.m_OK);
        gridBagConstraints.weightx = 0.5;
        gridBagConstraints.gridwidth = 0;
        gridBagLayout.setConstraints(this.m_Cancel, gridBagConstraints);
        this.m_Panel.add(this.m_Cancel);
        this.setLayout(new BorderLayout());
        this.add("South", this.m_Panel);
        this.m_TextArea.setFont(new Font("Courier", 1, 12));
    }

    public void ReleasePanel() {
        this.m_Panel.hide();
        this.m_TextArea.setEditable(false);
        this.m_bDispPanel = false;
        this.enable();
        this.requestFocus();
    }

    public void CreateInputPass() {
        this.m_TextArea.setEditable(true);
        this.m_Label.setText("\u30d1\u30b9\u30ef\u30fc\u30c9\u3092\u5165\u308c\u3066\u306d(CTRL+V)");
        this.m_OK.setLabel("\u6c7a\u5b9a");
        this.m_Cancel.setLabel("\u30bf\u30a4\u30c8\u30eb\u306b\u623b\u308b");
        this.m_Panel.show();
        this.m_Panel.enable();
        this.m_Panel.requestFocus();
        this.m_TextArea.requestFocus();
        this.m_bDispPanel = true;
    }
}

