import { TeacherConfig, StudentSelection } from '../types';

export const DEFAULT_TEACHER_CONFIG: TeacherConfig = {
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
  enableTextAnalyzer: true,
};

export const DEFAULT_STUDENT_SELECTION: StudentSelection = {
  stanceText: '',
  counterText: '',
  reflectionText: '',
  dynamicId: undefined,
  customSituation: '',
  participantsCount: undefined,
  durationMinutes: undefined,
  outputLanguage: 'עברית',
  structureType: undefined,
  tone: undefined,
  customDynamicName: '',
  workMode: undefined,
};

