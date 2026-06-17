import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON payload parsing for configuration storage
  app.use(express.json());

  const CONFIG_FILE = path.join(process.cwd(), 'teacher_config.json');

  const DEFAULT_CONFIG = {
    criteria: `1. טענת המצגת במשפט אחד — בהגינות.
2. המתח שבחרנו — אפקט הצינון? חדות הקו? ענווה מול הכרעה?
3. עמדתנו — היכן עמדה, היכן איפוק, ומדוע.
4. הקול שאינו שלנו — הטיעון הנגדי החזק, והמענה אליו.
5. פרק רפלקציה: מה זה אומר לנו כמחנכים — מן העיקרון אל הכיתה.`,
    dynamicsText: `עדות מהשטח | זירת דיווח שטח עיתונאי מלחיץ שבה כתב מנסה להישאר אובייקטיבי מול מעורבים הדוחפים אותו לתפוס צד 
אולפן אקטואליה | אולפן אקטואליה בשידור חי ("כיסא מפלט") שבו פנליסטים מקצוות אידאולוגיים מאשימים את המנחה הניטרלי בפחדנות 
ישיבת עירייה| אולם דיונים פתוח בוועדת עירייה שבו יו"ר הוועדה מנסה להפגין ממלכתיות מול תושבים זועמים הטוענים נגד ניטרליותו 
ארוחה משפחתית | ארוחת שישי משפחתית מתוחה שבה ניסיונו של הסטודנט לשמור על שלום בית וניטרליות מתפרש כנקיטת עמדה סמויה 
פרלמנט שכונתי | פרלמנט שכונתי קולני ליד קיוסק מקומי שבו בעל העסק מנסה להישאר ניטרלי כדי לא להפסיד קליינטים ומגלה שהשתיקה עולה לו ביוקר 
שיחת עמיתים | סיעור מוחות אקדמי ואינטלקטואלי שבו חברי הקבוצה מפרקים, מאתגרים ומעבים את סיכום הטקסט שלהם באמצעות דוגמאות חיות`,
    enableTextAnalyzer: true
  };

  // API Endpoint - GET Configuration
  app.get("/api/teacher-config", (req, res) => {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const fileContent = fs.readFileSync(CONFIG_FILE, 'utf-8');
        res.json({ ...DEFAULT_CONFIG, ...JSON.parse(fileContent) });
      } else {
        res.json(DEFAULT_CONFIG);
      }
    } catch (err) {
      console.error("Error reading configuration on server:", err);
      res.json(DEFAULT_CONFIG);
    }
  });

  // API Endpoint - POST Configuration (Save changes on server)
  app.post("/api/teacher-config", (req, res) => {
    try {
      const updatedConfig = req.body;
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), 'utf-8');
      res.json({ success: true, config: updatedConfig });
    } catch (err) {
      console.error("Error writing configuration on server:", err);
      res.status(500).json({ error: "Failed to persist configuration on disk" });
    }
  });

  // Serve with Vite in development, serve static in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
