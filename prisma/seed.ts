import "dotenv/config";
import { PrismaClient, Role, TestType } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      role: Role.ADMIN,
    },
  });

  // Create student user
  const student = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      name: "Student User",
      role: Role.STUDENT,
    },
  });

  // Create a sample lesson
  const lesson = await prisma.lesson.upsert({
    where: { id: "sample-lesson-1" },
    update: {},
    create: {
      id: "sample-lesson-1",
      title: "Introduction to Web Development",
      description:
        "Learn the fundamentals of web development including HTML, CSS, and JavaScript.",
      createdById: admin.id,
    },
  });

  // Create initial test (Step 1)
  await prisma.test.upsert({
    where: { lessonId_type: { lessonId: lesson.id, type: TestType.INITIAL } },
    update: {},
    create: {
      lessonId: lesson.id,
      type: TestType.INITIAL,
      questions: [
        {
          question: "What does HTML stand for?",
          options: [
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Hyper Transfer Markup Language",
            "Home Tool Markup Language",
          ],
          correctAnswer: 0,
        },
        {
          question: "Which tag is used for the largest heading in HTML?",
          options: ["<heading>", "<h6>", "<h1>", "<head>"],
          correctAnswer: 2,
        },
        {
          question: "What does CSS stand for?",
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

  // Create lectures (Step 2)
  const lectures = [
    {
      title: "HTML Basics",
      description:
        "Learn about HTML tags, elements, and document structure.",
      order: 1,
    },
    {
      title: "CSS Fundamentals",
      description:
        "Understanding selectors, properties, and the box model.",
      order: 2,
    },
    {
      title: "JavaScript Introduction",
      description:
        "Variables, functions, and basic DOM manipulation.",
      order: 3,
    },
  ];

  for (const lecture of lectures) {
    await prisma.lecture.upsert({
      where: {
        id: `lecture-${lesson.id}-${lecture.order}`,
      },
      update: {},
      create: {
        id: `lecture-${lesson.id}-${lecture.order}`,
        lessonId: lesson.id,
        ...lecture,
      },
    });
  }

  // Create situational Q&A (Step 3)
  await prisma.situationalQA.upsert({
    where: { id: `qa-${lesson.id}-1` },
    update: {},
    create: {
      id: `qa-${lesson.id}-1`,
      lessonId: lesson.id,
      question:
        "A client asks you to build a responsive landing page. What is your first step?",
      answers: [
        {
          text: "Start writing CSS immediately",
          conclusion:
            "Starting with CSS without structure leads to disorganized code. Consider planning the HTML structure first.",
        },
        {
          text: "Plan the HTML structure and semantic layout",
          conclusion:
            "Correct! Planning the semantic HTML structure first ensures a solid foundation for styling and accessibility.",
        },
        {
          text: "Choose a JavaScript framework",
          conclusion:
            "A simple landing page may not need a framework. Start with the basics and add complexity only when needed.",
        },
      ],
      order: 1,
    },
  });

  // Create final test (Step 4)
  await prisma.test.upsert({
    where: { lessonId_type: { lessonId: lesson.id, type: TestType.FINAL } },
    update: {},
    create: {
      lessonId: lesson.id,
      type: TestType.FINAL,
      questions: [
        {
          question: "Which HTML element is used to link an external CSS file?",
          options: ["<style>", "<css>", "<link>", "<script>"],
          correctAnswer: 2,
        },
        {
          question: "What is the correct CSS syntax for making all <p> elements bold?",
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
            "Which JavaScript method is used to select an HTML element by its ID?",
          options: [
            "document.getElement(id)",
            "document.querySelector(id)",
            "document.getElementById(id)",
            "document.findElement(id)",
          ],
          correctAnswer: 2,
        },
        {
          question: "What does the 'C' in CSS stand for?",
          options: ["Computer", "Cascading", "Creative", "Coded"],
          correctAnswer: 1,
        },
      ],
    },
  });

  // Create sample progress for the student
  await prisma.studentProgress.upsert({
    where: {
      userId_lessonId: { userId: student.id, lessonId: lesson.id },
    },
    update: {},
    create: {
      userId: student.id,
      lessonId: lesson.id,
      currentStep: 1,
    },
  });

  console.log("Seed data created successfully:");
  console.log(`  - Admin: ${admin.email}`);
  console.log(`  - Student: ${student.email}`);
  console.log(`  - Lesson: ${lesson.title}`);
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
