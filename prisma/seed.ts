import "dotenv/config";
import { PrismaClient, Role, TestType } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data (in correct order for foreign keys)
  await prisma.situationalQAResult.deleteMany();
  await prisma.testResult.deleteMany();
  await prisma.studentProgress.deleteMany();
  await prisma.situationalQA.deleteMany();
  await prisma.lecture.deleteMany();
  await prisma.test.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleared existing data.");

  // --- Users ---
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin Foydalanuvchi",
      role: Role.ADMIN,
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "student@example.com",
      name: "Talaba Foydalanuvchi",
      role: Role.STUDENT,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: "student2@example.com",
      name: "Ikkinchi Talaba",
      role: Role.STUDENT,
    },
  });

  console.log("Users created.");

  // ===========================
  // LESSON 1: Web Development
  // ===========================
  const lesson1 = await prisma.lesson.create({
    data: {
      title: "Web Dasturlash Asoslari",
      description:
        "HTML, CSS va JavaScript asoslarini o'rganing. Zamonaviy web saytlar yaratish uchun kerakli bilimlar.",
      createdById: admin.id,
    },
  });

  // Initial Test (3 questions)
  await prisma.test.create({
    data: {
      lessonId: lesson1.id,
      type: TestType.INITIAL,
      questions: [
        {
          question: "HTML nimaning qisqartmasi?",
          options: [
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Hyper Transfer Markup Language",
            "Home Tool Markup Language",
          ],
          correctAnswer: 0,
        },
        {
          question: "HTMLda eng katta sarlavha uchun qaysi teg ishlatiladi?",
          options: ["<heading>", "<h6>", "<h1>", "<head>"],
          correctAnswer: 2,
        },
        {
          question: "CSS nimaning qisqartmasi?",
          options: [
            "Computer Style Sheets",
            "Cascading Style Sheets",
            "Creative Style System",
            "Colorful Style Sheets",
          ],
          correctAnswer: 1,
        },
      ],
    },
  });

  // Lectures (3 lectures with rich HTML)
  await prisma.lecture.createMany({
    data: [
      {
        lessonId: lesson1.id,
        title: "HTML Asoslari",
        description: `<h2>HTML nima?</h2>
<p>HTML (HyperText Markup Language) — bu veb-sahifalar yaratish uchun ishlatiladigan standart belgilash tili. HTML veb-sahifaning tuzilishini belgilaydi.</p>
<h3>Asosiy teglar</h3>
<ul>
<li><strong>&lt;html&gt;</strong> — Hujjatning ildiz elementi</li>
<li><strong>&lt;head&gt;</strong> — Meta ma'lumotlar</li>
<li><strong>&lt;body&gt;</strong> — Sahifaning asosiy tarkibi</li>
<li><strong>&lt;h1&gt; - &lt;h6&gt;</strong> — Sarlavhalar</li>
<li><strong>&lt;p&gt;</strong> — Paragraf</li>
</ul>
<h3>Misol</h3>
<pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;Mening sahifam&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Salom Dunyo!&lt;/h1&gt;
    &lt;p&gt;Bu mening birinchi veb sahifam.&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>
<blockquote>HTML o'rganish veb dasturlashning birinchi qadamidir.</blockquote>`,
        videoUrl: "https://www.youtube.com/watch?v=UB1O30fR-EE",
        order: 1,
      },
      {
        lessonId: lesson1.id,
        title: "CSS Asoslari",
        description: `<h2>CSS nima?</h2>
<p>CSS (Cascading Style Sheets) — bu HTML elementlariga stil berish uchun ishlatiladigan til. CSS yordamida ranglar, shriftlar, joylashuv va animatsiyalarni boshqarish mumkin.</p>
<h3>CSS Selektorlar</h3>
<ul>
<li><strong>Element selektori:</strong> <code>p { color: red; }</code></li>
<li><strong>Class selektori:</strong> <code>.card { padding: 16px; }</code></li>
<li><strong>ID selektori:</strong> <code>#header { background: blue; }</code></li>
</ul>
<h3>Box Model</h3>
<p>Har bir HTML element to'rtburchak quti hisoblanadi. Box model quyidagilardan iborat:</p>
<ol>
<li><strong>Content</strong> — tarkib maydoni</li>
<li><strong>Padding</strong> — ichki bo'shliq</li>
<li><strong>Border</strong> — chegara</li>
<li><strong>Margin</strong> — tashqi bo'shliq</li>
</ol>`,
        videoUrl: "https://www.youtube.com/watch?v=1PnVor36_40",
        order: 2,
      },
      {
        lessonId: lesson1.id,
        title: "JavaScript Kirish",
        description: `<h2>JavaScript nima?</h2>
<p>JavaScript — bu veb-sahifalarni interaktiv qilish uchun ishlatiladigan dasturlash tili. Hozirgi kunda JavaScript frontend va backend dasturlashda keng qo'llaniladi.</p>
<h3>O'zgaruvchilar</h3>
<pre><code>let ism = "Ali";
const yosh = 25;
var manzil = "Toshkent";</code></pre>
<h3>Funksiyalar</h3>
<pre><code>function salomlash(ism) {
  return "Salom, " + ism + "!";
}

console.log(salomlash("Ali")); // "Salom, Ali!"</code></pre>
<h3>DOM bilan ishlash</h3>
<pre><code>document.getElementById("sarlavha").textContent = "Yangi matn";
document.querySelector(".tugma").addEventListener("click", () => {
  alert("Tugma bosildi!");
});</code></pre>`,
        videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
        order: 3,
      },
    ],
  });

  // Situational Q&A (2 questions)
  await prisma.situationalQA.createMany({
    data: [
      {
        lessonId: lesson1.id,
        question:
          "Mijoz sizdan responsive landing sahifa yaratishni so'radi. Birinchi qadamingiz nima bo'ladi?",
        answers: [
          {
            text: "Darhol CSS yozishni boshlash",
            conclusion:
              "CSSni tuzilmasiz boshlash tartibsiz kodga olib keladi. Avval HTML tuzilishini rejalashtirish muhim.",
            score: 2,
          },
          {
            text: "HTML tuzilishini va semantik joylashuvni rejalashtirish",
            conclusion:
              "To'g'ri! Semantik HTML tuzilishini avval rejalashtirish stilizatsiya va qulaylik uchun mustahkam asos yaratadi.",
            score: 5,
          },
          {
            text: "JavaScript framework tanlash",
            conclusion:
              "Oddiy landing sahifa uchun framework kerak bo'lmasligi mumkin. Asoslardan boshlang va murakkablikni kerak bo'lganda qo'shing.",
            score: 1,
          },
        ],
        order: 1,
      },
      {
        lessonId: lesson1.id,
        question:
          "Production serverda sayt sekin yuklanmoqda. Foydalanuvchilar shikoyat qilmoqda. Nima qilasiz?",
        answers: [
          {
            text: "Serverga ko'proq RAM qo'shish",
            conclusion:
              "Server resurslarini ko'paytirish vaqtinchalik yechim. Avval muammoning asl sababini aniqlash kerak — rasmlar, CSS, JavaScript fayllari katta bo'lishi mumkin.",
            score: 2,
          },
          {
            text: "Chrome DevTools Network tabini ochib, qaysi resurslar sekin yuklanayotganini tekshirish",
            conclusion:
              "Ajoyib yondashuv! Network tab orqali qaysi fayllar katta ekanini, qaysi so'rovlar sekin javob berayotganini aniqlash mumkin. Bu optimizatsiya uchun to'g'ri yo'l.",
            score: 5,
          },
          {
            text: "Butun saytni qayta yozish",
            conclusion:
              "Saytni qayta yozish ko'p vaqt talab qiladi. Avval mavjud muammolarni aniqlash va maqsadli optimizatsiyalar qilish samaraliroq.",
            score: 0,
          },
          {
            text: "CDN ulash",
            conclusion:
              "CDN yaxshi yechim bo'lishi mumkin, lekin avval muammoning sababini bilish kerak. CDN faqat statik fayllar uchun yordam beradi.",
            score: 3,
          },
        ],
        order: 2,
      },
    ],
  });

  // Final Test (4 questions)
  await prisma.test.create({
    data: {
      lessonId: lesson1.id,
      type: TestType.FINAL,
      questions: [
        {
          question:
            "Tashqi CSS faylini ulash uchun qaysi HTML element ishlatiladi?",
          options: ["<style>", "<css>", "<link>", "<script>"],
          correctAnswer: 2,
        },
        {
          question:
            "Barcha <p> elementlarini qalin qilish uchun to'g'ri CSS sintaksisi qaysi?",
          options: [
            "p { font-weight: bold; }",
            "p { text-style: bold; }",
            "<p style='bold'>",
            "p.bold { weight: bold; }",
          ],
          correctAnswer: 0,
        },
        {
          question:
            "ID bo'yicha HTML elementini tanlash uchun qaysi JavaScript metodi ishlatiladi?",
          options: [
            "document.getElement(id)",
            "document.querySelector(id)",
            "document.getElementById(id)",
            "document.findElement(id)",
          ],
          correctAnswer: 2,
        },
        {
          question: "Responsive dizayn uchun qaysi CSS xususiyati ishlatiladi?",
          options: [
            "@media queries",
            "@responsive",
            "@screen",
            "@device",
          ],
          correctAnswer: 0,
        },
      ],
    },
  });

  console.log("Lesson 1 created: Web Dasturlash Asoslari");

  // ===========================
  // LESSON 2: React Asoslari
  // ===========================
  const lesson2 = await prisma.lesson.create({
    data: {
      title: "React Dasturlash Asoslari",
      description:
        "React kutubxonasi bilan zamonaviy foydalanuvchi interfeyslarini yaratishni o'rganing. Komponentlar, state va props.",
      createdById: admin.id,
    },
  });

  await prisma.test.create({
    data: {
      lessonId: lesson2.id,
      type: TestType.INITIAL,
      questions: [
        {
          question: "React nima?",
          options: [
            "Backend framework",
            "UI kutubxonasi",
            "Ma'lumotlar bazasi",
            "Operatsion tizim",
          ],
          correctAnswer: 1,
        },
        {
          question: "JSX nima?",
          options: [
            "JavaScript Extension",
            "JSON XML Syntax",
            "JavaScript XML — JavaScript ichida HTML yozish sintaksisi",
            "Java Server Extension",
          ],
          correctAnswer: 2,
        },
        {
          question: "React komponentda state boshqarish uchun nima ishlatiladi?",
          options: [
            "this.state = {}",
            "useState() hook",
            "var state = {}",
            "document.state",
          ],
          correctAnswer: 1,
        },
      ],
    },
  });

  await prisma.lecture.createMany({
    data: [
      {
        lessonId: lesson2.id,
        title: "React nima va nima uchun kerak?",
        description: `<h2>React haqida</h2>
<p>React — bu Facebook tomonidan yaratilgan <strong>JavaScript kutubxonasi</strong> bo'lib, foydalanuvchi interfeyslarini yaratish uchun ishlatiladi.</p>
<h3>React afzalliklari</h3>
<ul>
<li>Komponentlarga asoslangan arxitektura</li>
<li>Virtual DOM orqali yuqori samaradorlik</li>
<li>Katta hamjamiyat va ekotizim</li>
<li>React Native orqali mobil ilovalar</li>
</ul>`,
        videoUrl: "https://www.youtube.com/watch?v=Tn6-PIqc4UM",
        order: 1,
      },
      {
        lessonId: lesson2.id,
        title: "Komponentlar va Props",
        description: `<h2>React Komponentlar</h2>
<p>Komponentlar — React ilovaning qurilish bloklari. Har bir komponent o'z UI qismini qaytaradi.</p>
<h3>Funksional Komponent</h3>
<pre><code>function Salom({ ism }) {
  return &lt;h1&gt;Salom, {ism}!&lt;/h1&gt;;
}

// Ishlatish
&lt;Salom ism="Ali" /&gt;</code></pre>
<h3>Props</h3>
<p>Props (properties) — bu ota komponentdan bola komponentga ma'lumot uzatish usuli. Props faqat o'qish uchun mo'ljallangan.</p>`,
        order: 2,
      },
      {
        lessonId: lesson2.id,
        title: "State va Hooks",
        description: `<h2>useState Hook</h2>
<p><code>useState</code> — bu funksional komponentlarda state boshqarish imkonini beruvchi hook.</p>
<pre><code>import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    &lt;div&gt;
      &lt;p&gt;Siz {count} marta bosdingiz&lt;/p&gt;
      &lt;button onClick={() =&gt; setCount(count + 1)}&gt;
        Bosing
      &lt;/button&gt;
    &lt;/div&gt;
  );
}</code></pre>
<h3>useEffect Hook</h3>
<p><code>useEffect</code> — komponent renderdan keyin side effect bajarish uchun ishlatiladi (API chaqirish, timer, va h.k.).</p>`,
        order: 3,
      },
    ],
  });

  await prisma.situationalQA.createMany({
    data: [
      {
        lessonId: lesson2.id,
        question:
          "Loyihangizda bir xil UI elementlar (tugmalar, kartalar) takrorlanmoqda. Kodni qanday yaxshilaysiz?",
        answers: [
          {
            text: "Har birini alohida yozib ketaveraman",
            conclusion:
              "Kodni takrorlash xatoliklarga olib keladi va qo'llab-quvvatlashni qiyinlashtiradi. DRY (Don't Repeat Yourself) printsipiga amal qiling.",
            score: 1,
          },
          {
            text: "Qayta ishlatiluvchi (reusable) komponentlar yarataman",
            conclusion:
              "Ajoyib! Qayta ishlatiluvchi komponentlar yaratish React-ning asosiy kuchli tomonlaridan biri. Props orqali komponentni moslashuvchan qilish mumkin.",
            score: 5,
          },
          {
            text: "CSS class bilan yechaman",
            conclusion:
              "CSS classlar stilizatsiya uchun yordam beradi, lekin mantiq va tuzilishni qayta ishlatish uchun komponentlar kerak.",
            score: 2,
          },
        ],
        order: 1,
      },
      {
        lessonId: lesson2.id,
        question:
          "Forma ma'lumotlarini boshqarish kerak: foydalanuvchi ismi, emaili va paroli. Qanday yondashasiz?",
        answers: [
          {
            text: "Har bir input uchun alohida useState ishlataman",
            conclusion:
              "Bu ishlaydi, lekin ko'p maydonli formalarda boshqarish qiyinlashadi. Ko'p maydonlar uchun bitta state ob'ekt yoki form library ishlatish yaxshiroq.",
            score: 3,
          },
          {
            text: "Bitta state ob'ektida barcha maydonlarni saqlayman",
            conclusion:
              "Yaxshi yondashuv! Bitta ob'ektda saqlab, spread operatori bilan yangilash forma boshqarishni soddalashtiradi.",
            score: 4,
          },
          {
            text: "React Hook Form kutubxonasini ishlataman",
            conclusion:
              "Professional yechim! React Hook Form validation, xatoliklar boshqarishi va samaradorlikni ta'minlaydi. Katta loyihalarda tavsiya etiladi.",
            score: 5,
          },
        ],
        order: 2,
      },
    ],
  });

  await prisma.test.create({
    data: {
      lessonId: lesson2.id,
      type: TestType.FINAL,
      questions: [
        {
          question: "React komponentda props qanday uzatiladi?",
          options: [
            "Funksiya argumenti sifatida",
            "Global o'zgaruvchi orqali",
            "CSS orqali",
            "URL parametrlari orqali",
          ],
          correctAnswer: 0,
        },
        {
          question: "useState hook nima qaytaradi?",
          options: [
            "Faqat qiymat",
            "Faqat funksiya",
            "Qiymat va uni yangilovchi funksiya massivi",
            "Ob'ekt",
          ],
          correctAnswer: 2,
        },
        {
          question: "useEffect hook qachon ishlaydi?",
          options: [
            "Faqat birinchi renderda",
            "Har bir renderdan keyin (dependency ga qarab)",
            "Faqat tugma bosilganda",
            "Faqat komponent o'chirilganda",
          ],
          correctAnswer: 1,
        },
        {
          question: "React-da ro'yxatni renderda qilganda nima kerak?",
          options: [
            "Har bir element uchun unique key prop",
            "forEach() metodi",
            "for loop",
            "Hech narsa — avtomatik ishlaydi",
          ],
          correctAnswer: 0,
        },
      ],
    },
  });

  console.log("Lesson 2 created: React Dasturlash Asoslari");

  // ===========================
  // LESSON 3: Database (incomplete — no situational QA, to test filtering)
  // ===========================
  const lesson3 = await prisma.lesson.create({
    data: {
      title: "Ma'lumotlar Bazasi Asoslari (Tugallanmagan)",
      description:
        "SQL va NoSQL ma'lumotlar bazalari haqida asosiy tushunchalar. Bu dars hali to'liq emas.",
      createdById: admin.id,
    },
  });

  await prisma.test.create({
    data: {
      lessonId: lesson3.id,
      type: TestType.INITIAL,
      questions: [
        {
          question: "SQL nimaning qisqartmasi?",
          options: [
            "Structured Query Language",
            "Simple Question Language",
            "System Query Logic",
            "Standard Quick Language",
          ],
          correctAnswer: 0,
        },
      ],
    },
  });

  console.log("Lesson 3 created: incomplete lesson (for testing)");

  // ===========================
  // Student Progress for Lesson 1
  // Student has NOT started any lesson yet (clean slate for testing)
  // ===========================
  // No progress records — student will start fresh

  console.log("");
  console.log("=== Seed Complete ===");
  console.log(`Admin:     ${admin.email} (${admin.name})`);
  console.log(`Student 1: ${student.email} (${student.name})`);
  console.log(`Student 2: ${student2.email} (${student2.name})`);
  console.log(`Lesson 1:  ${lesson1.title} — COMPLETE (all 4 parts)`);
  console.log(`Lesson 2:  ${lesson2.title} — COMPLETE (all 4 parts)`);
  console.log(`Lesson 3:  ${lesson3.title} — INCOMPLETE (missing parts, won't show to students)`);
  console.log("");
  console.log("Students can now test the full flow on Lessons 1 and 2.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
