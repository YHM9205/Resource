# Auto-Code Project Guide

هذا الملف يشرح مشروع Auto-Code بطريقة بسيطة وقريبة من أسلوب درس الـ auth الذي أرسلته.

## 1. فكرة البرنامج

Auto-Code هو تطبيق Express يساعد المستخدم على:

- إنشاء حساب وتسجيل الدخول.
- حفظ سياراته داخل Garage.
- فحص رموز أعطال السيارات مثل `P0119` و `P0920`.
- مشاهدة معلومات القطع وطريقة الفحص أو الاستبدال.
- تعديل بيانات الحساب.
- مشاهدة لوحة Agent لمراقبة حالة التطبيق.

التقنيات المستخدمة:

- Node.js لتشغيل JavaScript على السيرفر.
- Express لبناء السيرفر والـ routes.
- EJS لعرض صفحات HTML.
- MongoDB لحفظ المستخدمين والسيارات.
- Mongoose للتعامل مع MongoDB.
- bcryptjs لتشفير كلمات المرور.
- express-session لحفظ جلسة المستخدم.
- connect-mongo لحفظ الجلسات في MongoDB عند استخدام production.
- express-rate-limit لتقليل محاولات تسجيل الدخول المتكررة.

## 2. تشغيل المشروع

افتح Terminal داخل مجلد `Resource` ثم نفذ:

```bash
npm install
npm test
npm start
```

الموقع يفتح على:

```text
http://localhost:3000
```

## 3. إعداد البيئة

ملف `.env` يحتوي الإعدادات الخاصة بالجهاز وقاعدة البيانات. لا ترفع هذا الملف إلى GitHub ولا ترسل كلمة المرور داخله إلى أي شخص.

القيم المطلوبة عادة:

```env
PORT=3000
MONGO_URI=your-mongodb-connection-string
SESSION_SECRET=your-long-random-session-secret
NODE_ENV=development
```

إذا كان MongoDB Atlas لا يتصل، تأكد من:

1. اسم المتغير هو `MONGO_URI`.
2. عنوان Atlas صحيح.
3. عنوان IP الحالي مسموح في Network Access.
4. اسم المستخدم وكلمة المرور صحيحان.
5. كلمة المرور URL encoded إذا تحتوي رموزًا خاصة.

## 4. شكل الفولدرات

```text
Auto-Code/
├── server.js                 نقطة تشغيل البرنامج
├── config/db.js              الاتصال بقاعدة البيانات
├── controllers/              منطق كل جزء من التطبيق
├── models/                   شكل البيانات داخل MongoDB
├── routes/                   عناوين الصفحات والطلبات
├── middleware/               وظائف تعمل بين الطلب والـ controller
├── views/                    صفحات EJS
├── public/css/               تنسيقات الصفحات
├── public/images/            صور السيارات
├── scripts/                  أوامر الفحص وإنشاء المستخدم
└── data/db/                  مكان بيانات محلية إن احتجناها لاحقًا
```

## 5. طريقة مرور الطلب

كل طلب يمشي بهذا التسلسل:

```text
المستخدم
  ↓
route
  ↓
middleware
  ↓
controller
  ↓
model / database
  ↓
EJS view أو redirect أو JSON
```

مثال تسجيل الدخول:

```text
POST /auth/sign-in
  ↓
authRoutes.js
  ↓
authLimiter
  ↓
signIn في authController.js
  ↓
User.findOne
  ↓
bcrypt.compare
  ↓
req.session.user
  ↓
redirect إلى الصفحة المطلوبة
```

## 6. server.js

`server.js` هو ملف البداية.

مسؤولياته:

1. قراءة `.env` بواسطة `dotenv`.
2. إنشاء تطبيق Express.
3. تشغيل EJS كـ view engine.
4. تشغيل static files من `public`.
5. قراءة بيانات forms بواسطة `express.urlencoded`.
6. تشغيل sessions.
7. استخدام `pass-user-to-view` حتى يصبح المستخدم متاحًا داخل كل View.
8. تسجيل كل مجموعة routes.
9. إظهار صفحة 404 إذا العنوان غير موجود.
10. إظهار رسالة عامة عند حدوث خطأ في السيرفر.
11. تشغيل السيرفر ومحاولة الاتصال بقاعدة البيانات.

السيرفر يبدأ الاستماع أولًا، ثم يحاول الاتصال بـ MongoDB. لهذا الموقع يفتح حتى إذا كانت قاعدة البيانات متوقفة، لكن العمليات التي تحتاج حفظ بيانات لن تعمل حتى يرجع الاتصال.

## 7. Middleware

### pass-user-to-view.js

```js
const passUserToView = (req, res, next) => {
    res.locals.user = req.session.user;
    next();
};
```

هذه الفانكشن تحفظ المستخدم داخل `res.locals`، لذلك تقدر صفحات EJS تعرف هل المستخدم داخل أم لا.

مثال داخل EJS:

```ejs
<% if (user) { %>
    <a href="/settings">Settings</a>
<% } else { %>
    <a href="/auth/sign-in">Sign in</a>
<% } %>
```

### requireUser داخل authController.js

هذه الفانكشن تحمي الصفحات الخاصة:

```js
function requireUser(req, res, next) {
    if (!req.session.user) {
        const destination = encodeURIComponent(req.originalUrl);
        return res.redirect(`/auth/sign-up?next=${destination}`);
    }
    return next();
}
```

الخوارزمية:

1. افحص `req.session.user`.
2. إذا موجود، اسمح للطلب أن يكمل باستخدام `next()`.
3. إذا غير موجود، أرسل المستخدم إلى التسجيل.
4. خزّن الرابط المطلوب داخل `next` حتى يرجع له بعد التسجيل.

## 8. Auth routes

الملف: `routes/authRoutes.js`

العناوين الأساسية:

| Method | URL | الوظيفة |
|---|---|---|
| GET | `/auth/sign-up` | عرض صفحة التسجيل |
| POST | `/auth/sign-up` | إنشاء مستخدم |
| GET | `/auth/sign-in` | عرض صفحة الدخول |
| POST | `/auth/sign-in` | التحقق من المستخدم |
| GET | `/auth/sign-out` | إنهاء الجلسة |
| GET | `/settings` | عرض إعدادات الحساب |
| POST | `/settings` | تحديث البريد أو كلمة المرور |

الـ route وظيفته فقط يربط العنوان بالفانكشن:

```js
router.post('/auth/sign-in', authLimiter, signIn);
```

المعالجة الحقيقية موجودة في `authController.js`.

## 9. authController.js

### showSignUp

تعرض صفحة إنشاء الحساب وترسل لها الرسائل والرابط التالي.

### showSignIn

تعرض صفحة تسجيل الدخول وتجهز `message` و`error` و`next`.

### register

خوارزمية التسجيل:

1. اقرأ `username` و`email` و`password` من `req.body`.
2. نظف النصوص بواسطة `trim`.
3. حول البريد إلى lowercase.
4. افحص طول username وكلمة المرور وصحة البريد.
5. ابحث عن مستخدم بنفس username أو email.
6. إذا كان موجودًا، اعرض رسالة خطأ.
7. استخدم `bcrypt.hash(password, 12)`.
8. أنشئ مستخدمًا جديدًا بالـ hash فقط.
9. أنشئ session جديدة.
10. خزّن داخل session بيانات آمنة فقط.
11. أرسل المستخدم إلى الصفحة المطلوبة.

كلمة المرور الأصلية لا تُحفظ في قاعدة البيانات ولا داخل session.

### signIn

خوارزمية تسجيل الدخول:

1. اقرأ username وpassword.
2. ابحث عن المستخدم بالـ username.
3. إذا لم يوجد المستخدم، أظهر رسالة عامة.
4. استخدم `bcrypt.compare` لمقارنة كلمة المرور بالـ hash.
5. إذا كانت المقارنة فاشلة، أظهر نفس الرسالة العامة.
6. إذا نجحت، أنشئ session جديدة.
7. خزّن `id` و`username` و`email` فقط.
8. أرسل المستخدم إلى الصفحة المطلوبة.

استخدام رسالة عامة يمنع معرفة هل اسم المستخدم موجود أم لا.

### signOut

1. يدمر session الحالية.
2. يرجع المستخدم إلى الصفحة الرئيسية.

### updateSettings

1. يقرأ البريد الجديد وكلمة المرور الجديدة.
2. يتحقق من البيانات.
3. يبحث عن المستخدم الحالي من session.
4. يتأكد أن البريد غير مستخدم من حساب آخر.
5. يشفر كلمة المرور الجديدة إذا تم إدخالها.
6. يحفظ التعديل.
7. يحدث البريد داخل session.

## 10. User model

الملف: `models/User.js`

يحدد شكل المستخدم:

- `username`: مطلوب وفريد.
- `email`: مطلوب وفريد ويتحول إلى lowercase.
- `password`: يحتوي hash وليس كلمة المرور الأصلية.
- `role`: يحدد نوع المستخدم.
- `timestamps`: يضيف `createdAt` و`updatedAt`.

قاعدة مهمة:

```text
User model = شكل البيانات وقواعدها
Auth controller = العمليات التي تستخدم البيانات
Auth routes = عناوين الطلبات
```

## 11. Car controller

الملف: `controllers/carController.js`

الوظائف:

- `showGarage`: يعرض سيارات المستخدم.
- `createCar`: ينشئ سيارة جديدة.
- `showEditCar`: يعرض سيارة للتعديل.
- `updateCar`: يحدث بيانات السيارة.
- `deleteCar`: يحذف السيارة.

الخوارزمية المهمة في السيارات:

1. أخذ المستخدم من session.
2. إيجاد Owner الخاص به أو إنشاؤه.
3. استخدام `owner` في كل query.
4. عدم السماح للمستخدم بالوصول إلى سيارة ليست له.
5. فحص VIN وyear وmake وmodel قبل الحفظ.

بهذه الطريقة بيانات كل مستخدم تبقى مرتبطة بمالكه.

## 12. Diagnostic controller

الملف: `controllers/diagnosticController.js`

يحتوي مجموعة رموز معروفة داخل `diagnosticResults`.

`normalizeCode` تقوم بـ:

1. تحويل القيمة إلى String.
2. إزالة الفراغات من البداية والنهاية.
3. تحويل الرمز إلى uppercase.

مثال:

```text
p0119  →  P0119
```

`getDiagnosticPage`:

1. يقرأ code من query.
2. يقرأ نوع السيارة والموديل.
3. يبحث عن النتيجة داخل البيانات.
4. يرسل النتيجة والأنواع والموديلات إلى `system.ejs`.

`checkDiagnostic`:

1. يقرأ البيانات من form.
2. ينظف code.
3. يبني query جديدًا.
4. يعمل redirect إلى `/system`.

## 13. صفحات EJS

كل صفحة تعرض HTML وتستقبل بيانات من controller.

أهم الصفحات:

- `home.ejs`: الصفحة الرئيسية.
- `auth/sign-in.ejs`: تسجيل الدخول.
- `auth/sign-up.ejs`: إنشاء الحساب.
- `auth/settings.ejs`: إعدادات الحساب.
- `garage.ejs`: سيارات المستخدم.
- `system.ejs`: فحص الأعطال.
- `parts.ejs`: القطع والصيانة.
- `agent.ejs`: لوحة حالة التطبيق.
- `partials/navbar.ejs`: شريط التنقل المشترك.

نستخدم `<%= value %>` لعرض النص بأمان، ولا نستخدم `<%- value %>` إلا للـ partial أو HTML نثق به.

## 14. CSS والتصميم

التصميم مقسوم حسب الصفحة:

- `home.css`: الصفحة الرئيسية.
- `auth.css`: التسجيل والدخول والإعدادات.
- `garage.css`: الجراج.
- `system.css`: التشخيص.
- `agent.css`: لوحة Agent.

الأسلوب بسيط:

- ألوان هادئة.
- خط `DM Sans` للنصوص.
- خط `Space Grotesk` للعناوين.
- cards صغيرة وواضحة.
- responsive design للموبايل.
- لا يوجد framework معقد.

## 15. الأمان الموجود

- كلمات المرور تشفر باستخدام bcrypt.
- كلمة المرور لا تدخل إلى session.
- session cookie تستخدم `httpOnly` و`sameSite`.
- rate limit لمحاولات التسجيل والدخول.
- منع Express من إظهار `x-powered-by`.
- منع open redirect عبر `safeNext`.
- التحقق من VIN وMongoDB ObjectId.
- التحقق من ملكية السيارة قبل التعديل أو الحذف.
- `.env` مستثنى من Git.
- `npm audit` يجب أن يعطي `0 vulnerabilities`.

## 16. الفحص والاختبار

الأمر:

```bash
npm test
```

يشغل:

```bash
npm run check
```

والـ check يفحص syntax لكل ملفات JavaScript داخل:

- `config`
- `controllers`
- `models`
- `routes`
- `server.js`

إن ظهر:

```text
Checked 21 JavaScript files successfully.
```

فهذا يعني أن ملفات JavaScript قابلة للقراءة من Node.js، لكنه لا يغني عن تجربة الصفحات وقاعدة البيانات يدويًا.

## 17. إنشاء مستخدم من Terminal

لا تضع كلمة المرور داخل source code. استخدم متغيرات مؤقتة:

```bash
ADMIN_USERNAME=your-name ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=your-password npm run create-user
```

في Windows PowerShell:

```powershell
$env:ADMIN_USERNAME="your-name"
$env:ADMIN_EMAIL="you@example.com"
$env:ADMIN_PASSWORD="your-password"
npm run create-user
```

الأمر ينشئ المستخدم إذا لم يكن موجودًا، أو يحدث بياناته إذا كان موجودًا.

## 18. تسلسل العمل المقترح

عند إضافة feature جديدة اتبع هذا الترتيب:

1. أنشئ أو عدل Model إذا احتجت بيانات جديدة.
2. أنشئ functions داخل Controller.
3. أضف route واضحًا.
4. أضف View داخل `views`.
5. أضف CSS الخاص بالصفحة.
6. اربط الصفحة من navbar.
7. شغل `npm test`.
8. جرب المسار من المتصفح.
9. تأكد من حالات الخطأ قبل اعتبار feature مكتملة.

مثال إضافة صفحة جديدة:

```text
models/NewModel.js
controllers/newController.js
routes/newRoutes.js
views/new-page.ejs
public/css/new-page.css
```

## 19. ملاحظات مهمة

- شغل الأوامر من داخل `Auto-Code` وليس من مجلد `projects`.
- إذا شغلت `node server.js` من `projects` سيظهر خطأ أن `server.js` غير موجود.
- إذا ظهر خطأ MongoDB، افحص `.env` وAtlas Network Access.
- لا تشارك `.env` أو كلمة مرور MongoDB.
- لا تخزن password داخل session أو داخل HTML.
- أي feature جديدة يجب أن تتبع نفس تسلسل routes ثم controller ثم model/view.
