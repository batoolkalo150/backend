# GASTROLUXE — Restaurant Management System

تم استكمال الـ Backend وربطه بقاعدة MongoDB مع الإبقاء على واجهة React الحالية وتوصيلها بتسجيل الدخول وعمليات المطاعم والوجبات.

## المتطلبات
- Node.js 18 أو أحدث
- MongoDB محلي أو MongoDB Atlas
- VS Code

## تشغيل المشروع

### 1) إعداد قاعدة البيانات والـ Backend
افتح Terminal داخل مجلد `backend`:

```bash
npm install
```

انسخ `.env.example` إلى ملف جديد اسمه `.env` ثم عدّل القيم:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/gastroluxe
JWT_SECRET=put_a_random_secret_with_at_least_32_characters_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173,http://127.0.0.1:5173
```

يمكن استخدام رابط MongoDB Atlas بدلاً من الرابط المحلي. يجب أن تكون خدمة MongoDB تعمل قبل تشغيل السيرفر. **لا يوجد وضع ذاكرة تجريبي**؛ إذا لم تتصل قاعدة البيانات يتوقف السيرفر برسالة واضحة بدلاً من حفظ بيانات مؤقتة تختفي.

شغّل الـ Backend:

```bash
npm run dev
```

تأكد من ظهور `MongoDB connected` و `GASTROLUXE API running on port 5000`.

### 2) إنشاء حساب Admin
التسجيل من الواجهة يسمح بإنشاء Owner أو Client فقط. لإنشاء Admin بأمان، أضف مؤقتاً هذه المتغيرات إلى `backend/.env`:

```env
ADMIN_NAME=System Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Choose_A_Strong_Password
```

ثم نفّذ مرة واحدة من مجلد `backend`:

```bash
npm run create-admin
```

بعد ظهور `Admin created` احذف متغيرات `ADMIN_NAME` و`ADMIN_EMAIL` و`ADMIN_PASSWORD` من `.env`. لا تشارك ملف `.env` مع أحد.

### 3) تشغيل الواجهة
افتح Terminal ثانية داخل مجلد `frontend`:

```bash
npm install
npm run dev
```

افتح `http://localhost:5173`.

## الأدوار والصلاحيات
- **Admin:** إدارة جميع المطاعم والوجبات.
- **Restaurant Owner:** إدارة المطاعم التابعة له ووجباتها فقط.
- **Client:** عرض المطاعم والوجبات واستخدام واجهات العميل للبحث والتصفية، دون صلاحيات تعديل.

## واجهات API
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Restaurants: `GET /`, `GET /:id`, `GET /:id/meals`, `POST /`, `PUT /:id`, `DELETE /:id`, `GET /owner/my-restaurants`
- Meals: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`
- Client: `GET /api/client/meals`, `GET /api/client/restaurants`, `GET /api/client/restaurants/:id`, `GET /api/client/categories`

عمليات الإنشاء والتعديل والحذف تتطلب `Authorization: Bearer <token>`. التحقق من المدخلات باستخدام Joi، كلمات المرور باستخدام bcryptjs، والمصادقة باستخدام JWT. يوجد تحديد للمعدل 100 طلب لكل 15 دقيقة.

## ملاحظات
- أول تشغيل يتطلب MongoDB URI صالحاً ومفتاح JWT سرياً بطول 32 محرفاً على الأقل.
- لا تضع أسرار قاعدة البيانات أو JWT في ملفات الواجهة الأمامية.
- لم أضمّن ملف `.env` الأصلي من الأرشيف لأنه قد يحتوي بيانات اعتماد خاصة؛ أنشئ ملفك محلياً من `.env.example`.
