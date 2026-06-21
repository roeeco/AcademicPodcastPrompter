import { TeacherConfig, StudentSelection } from '../types';

export const DEFAULT_TEACHER_CONFIG: TeacherConfig = {
  dynamicsText: `עדות מהשטח | זירת דיווח שטח עיתונאי מלחיץ שבה מדווח מנסה להישאר אובייקטיבי וממלכתי מול מרואיינים קולניים הדוחפים אותו לתפוס צד פעיל.
אולפן אקטואליה | אולפן אקטואליה בשידור חי ("כיסא מפלט") שבו פנליסטים מקצוות שונים מאשימים את מנחה התוכנית הניטרלי בפחדנות או בצביעות.
ישיבת עירייה | אולם דיונים בוועדת תכנון ובנייה שבו יושב ראש הוועדה מנסה להשכין שלום ולהפגין ממלכתיות מול תושבים זועמים הטוענים נגד ניטרליותו.
ארוחה משפחתית | ארוחת שישי משפחתית מתוחה שבה ניסיונו של המשתתף לשמור על שלום בית וניטרליות מתפרש על ידי הסובבים כנקיטת עמדה סמויה.
פרלמנט שכונתי | פרלמנט שכונתי קולני ליד קיוסק שכונתי שבו בעל העסק מנסה להישאר ניטרלי כדי לא לאבד קליינטים ומגלה שהשתיקה שלו עולה לו באהדה ובאהדת הלקוחות.
שיחת עמיתים | דיון סיעור מוחות של קבוצת מחקר שבו חבר הצוות מנסה להישאר ניטרלי, אך עמיתיו מאתגרים אותו בטענה שהוא מתחמק מאחריות מוסרית וערכית.`,
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
  simulationType: undefined,
  genderSelected: undefined,
};
