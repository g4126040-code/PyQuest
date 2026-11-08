import { generateTrackContent } from './generators';
export interface Challenge {
  id: string;
  trackId: string;
  stage: number;
  level: number;
  concept: string;
  title: string;
  instruction: string;
  initialCode: string;
  expectedLogic: string;
  targetCode?: string;
  activityType?: "tap_build" | "code_editor";
}

export const TRACKS = [
  { id: 'python', name: 'Python', offset: 0 },
  { id: 'python_practice', name: 'Python Practice', offset: 1500 },
  { id: 'html', name: 'HTML', offset: 100 },
  { id: 'css', name: 'CSS', offset: 200 },
  { id: 'js', name: 'JavaScript', offset: 300 },
  { id: 'sql', name: 'SQL', offset: 400 },
  { id: 'git', name: 'Git & GitHub', offset: 500 },
  { id: 'c', name: 'C', offset: 600 },
  { id: 'cpp', name: 'C++', offset: 700 },
  { id: 'java', name: 'Java', offset: 800 },
  { id: 'dart', name: 'Dart', offset: 900 },
  { id: 'flutter', name: 'Flutter', offset: 1000 },
  { id: 'firebase', name: 'Firebase', offset: 1100 },
  { id: 'rest', name: 'REST APIs', offset: 1200 },
  { id: 'gemini', name: 'Gemini AI', offset: 1300 },
  { id: 'fullstack', name: 'Full Stack AI', offset: 1400 }
];

export const pythonConcepts = [
  "print()",
  "Strings",
  "Numbers",
  "Variables",
  "input()",
  "Simple Math",
  "Comparison Operators",
  "if Statements",
  "Introduction to Loops",
  "Mixed Beginner Challenge",
  "Lists & Arrays",
  "Dictionaries",
  "Functions",
  "Return Statements",
  "Scope",
  "File Handling",
  "Error Handling",
  "Classes Basics",
  "Object Methods",
  "Final Review"
];


export const htmlConcepts = ["Document Structure","Tags","Elements","Attributes","Headings","Paragraphs","Links","Images","Lists","Tables","Forms","Semantic HTML","Audio & Video","Iframes","Meta Tags","Basic Accessibility","CSS Linking","JS Linking","SEO Basics","Final Project"];
export const cssConcepts = ["Selectors","Colors","Fonts","Text Styling","Box Model","Margin","Padding","Borders","Display","Positioning","Flexbox","Grid","Responsive Design","Media Queries","Transitions","Animations","Variables","Z-Index","Shadows","Final Project"];
export const jsConcepts = ["Variables","Data Types","Strings","Numbers","Operators","Conditions","Loops","Functions","Arrays","Objects","DOM Basics","Events","Forms","Local Storage","Async JS","Fetch API","Error Handling","Modules","ES6 Features","Final Project"];
export const sqlConcepts = ["Select","Where","Order By","Insert","Update","Delete","Joins","Group By","Having","Aliases","Functions","Subqueries","Create Table","Alter Table","Drop Table","Indexes","Primary Keys","Foreign Keys","Views","Final Project"];
export const cConcepts = ["Syntax","Variables","Data Types","Operators","Conditions","Loops","Functions","Arrays","Pointers","Strings","Structs","Unions","Memory Allocation","File I/O","Preprocessor","Header Files","Error Handling","Linked Lists","Trees","Final Project"];
export const cppConcepts = ["Syntax","Variables","Data Types","Operators","Conditions","Loops","Functions","Arrays","Pointers","OOP Basics","Classes","Constructors","Inheritance","Polymorphism","Templates","STL Vectors","STL Maps","Exception Handling","File I/O","Final Project"];
export const javaConcepts = ["Syntax","Variables","Data Types","Operators","Conditions","Loops","Methods","Arrays","OOP Basics","Classes","Constructors","Inheritance","Polymorphism","Interfaces","Packages","Exception Handling","Collections","File I/O","Multithreading","Final Project"];
export const dartConcepts = ["Syntax","Variables","Data Types","Operators","Conditions","Loops","Functions","Lists","Maps","OOP Basics","Classes","Constructors","Inheritance","Mixins","Async Programming","Futures","Streams","Null Safety","Exceptions","Final Project"];
export const flutterConcepts = ["Setup","Widgets","Text","Columns","Rows","Containers","Images","Buttons","Stateful Widgets","Navigation","Lists","Forms","Gestures","Animations","Network","JSON","State Management","Themes","Responsive","Final Project"];
export const gitConcepts = ["Git Basics", "Repositories", "git init", "git add", "git commit", "git status", "git log", "Branches", "Merging", "GitHub Repos", "Push", "Pull", "Clone", "Pull Requests", "Collaboration", "Stashing", "Rebasing", "Resolving Conflicts", "Git Workflow", "Final Project"];


export const firebaseConcepts = ["Firebase Basics", "Project Setup", "Authentication", "User Accounts", "Firestore", "Database Operations", "Storage", "Security Rules", "Cloud Functions", "Hosting", "Cloud Sync", "NoSQL Concepts", "Queries", "Indexes", "Realtime DB", "Analytics", "Crashlytics", "Performance", "Extensions", "Final Project"];
export const restConcepts = ["What APIs Are", "HTTP Basics", "Requests", "Responses", "GET", "POST", "PUT", "PATCH", "DELETE", "Headers", "JSON", "Status Codes", "Authentication", "API Integration", "Query Parameters", "Path Parameters", "Pagination", "Rate Limiting", "Webhooks", "Final Project"];
export const geminiConcepts = ["AI Basics", "Generative AI", "Gemini API Concepts", "API Requests", "Prompts", "Structured Responses", "Streaming", "Safety", "Error Handling", "AI Integration", "Context Windows", "System Instructions", "Chat History", "Tokens", "Embeddings", "Function Calling", "Multimodal", "Vision", "Fine-Tuning", "Final Project"];
export const fullstackConcepts = ["Frontend Basics", "Backend Basics", "Database Connection", "Authentication", "API Routes", "AI Integration", "Cloud Services", "Deployment", "Security Basics", "State Management", "Routing", "Middleware", "Data Fetching", "Caching", "Rate Limiting", "Monitoring", "CI/CD", "Testing", "Optimization", "Final Project"];
export const genericConcepts = [
  "Introduction & Setup",
  "Basic Syntax",
  "Variables & Data Types",
  "Operators",
  "Control Flow (If/Else)",
  "Loops & Iteration",
  "Functions & Methods",
  "Arrays & Lists",
  "Objects & Dictionaries",
  "Error Handling",
  "File I/O",
  "Modules & Packages",
  "Object-Oriented Basics",
  "Classes & Instances",
  "Inheritance",
  "Polymorphism",
  "Advanced Functions",
  "Asynchronous Basics",
  "API & Requests",
  "Final Review"
];

const projects: Record<number, { title: string, desc: string, task: string, code: string }> = {
  25: { 
    title: "Boss Challenge 1: Quiz Game", 
    desc: "Build a simple Quiz Game using inputs, variables, and basic math.",
    task: "Write a program that asks for a user's name, then asks a math question (e.g., 'What is 5 + 5?'). If they answer '10', print 'You win!'.",
    code: "name = input('Name: ')\nans = input('5 + 5 = ')\nif ans == '10':\n    print('You win!')"
  },
  50: { 
    title: "Mini Project: Rock Paper Scissors", 
    desc: "Build Rock Paper Scissors using lists, if-statements, and logical operators.",
    task: "Create a basic version of Rock Paper Scissors. Ask the user for their move, and print a hardcoded computer move and the result.",
    code: "move = input('Rock, Paper, or Scissors? ')\nprint('Computer chose Paper')\nif move == 'Scissors':\n    print('You win!')"
  },
  75: { 
    title: "Advanced Project: Simple Banking App", 
    desc: "Create a simple banking console app with functions, dictionaries, and loops.",
    task: "Create a variable `balance = 1000`. Use a while loop to let the user withdraw money until they enter 0. Update and print the balance.",
    code: "balance = 1000\nwhile True:\n    w = int(input('Withdraw (0 to stop): '))\n    if w == 0:\n        break\n    balance -= w\n    print('Balance:', balance)"
  },
  100: { 
    title: "Final Project: Student Database", 
    desc: "Build a Student Database using classes, dictionaries, and everything you've learned! Congratulations!",
    task: "Create a `Student` class with a `name` and `grade`. Create one student and print their name and grade!",
    code: "class Student:\n    def __init__(self, name, grade):\n        self.name = name\n        self.grade = grade\n\ns1 = Student('Alice', 'A')\nprint(s1.name, s1.grade)"
  }
};

function generatePythonTargetCode(level: number): string {
  const vars = ['x', 'y', 'score', 'count', 'total', 'age'];
  const varName = vars[level % vars.length];
  
  // Chapter 1: print()
  if (level <= 5) return `print('Hello ${level}')`;
  // Chapter 2: Strings
  if (level <= 10) return `print('String level ${level}')`;
  // Chapter 3: Numbers
  if (level <= 15) return `print(${level}00)`;
  // Chapter 4: Variables
  if (level <= 20) return `${varName} = ${level}\nprint(${varName})`;
  // Chapter 5: input()
  if (level <= 25) return `ans = input('Ready? ')\nprint(ans)`;
  // Chapter 6: Simple Math
  if (level <= 30) return `${varName} = ${level} + 5\nprint(${varName})`;
  // Chapter 7: Comparison Operators
  if (level <= 35) return `print(${level} > 10)`;
  // Chapter 8: if Statements
  if (level <= 40) return `if ${level} > 10:\n    print('High')`;
  // Chapter 9: Introduction to Loops
  if (level <= 45) return `for i in range(3):\n    print(i)`;
  // Chapter 10: Mixed Beginner Challenge
  if (level <= 50) return `ans = input('Go? ')\nif ans == 'yes':\n    print('Win')`;
  
  if (level <= 55) return `my_list = [1, 2, ${level}]\nprint(my_list[0])`;
  if (level <= 60) return `my_dict = {'level': ${level}}\nprint(my_dict['level'])`;
  if (level <= 70) return `def add(a, b):\n    return a + b\nprint(add(${level}, 5))`;
  if (level <= 80) return `class Level${level}:\n    pass\nobj = Level${level}()`;
  if (level <= 90) return `try:\n    print(10 / 0)\nexcept:\n    print('Error')`;
  return `print('Master of Python ${level}')`;
}


const pythonPractice: Record<number, { title: string, instruction: string, expectedLogic: string }> = {
  21: {
    title: "Practice: Hello World",
    instruction: "Print Hello World on the screen.",
    expectedLogic: "print('Hello World')"
  },
  22: {
    title: "Practice: Variables",
    instruction: "Create a variable called name and store your name in it (as a string). Then print the variable.",
    expectedLogic: "name = 'YourName'\nprint(name)"
  },
  23: {
    title: "Practice: User Input",
    instruction: "Ask the user for their age using the input() function. You do not need to print it.",
    expectedLogic: "age = input('Age: ')"
  },
  24: {
    title: "Practice: Addition",
    instruction: "Add the numbers 15 and 27, and print the result.",
    expectedLogic: "print(15 + 27)"
  },
  25: {
    title: "Practice: Comparisons",
    instruction: "Check if 50 is greater than 20. Print the result of this comparison (it should print True or False).",
    expectedLogic: "print(50 > 20)"
  },
  26: {
    title: "Practice: If Statement",
    instruction: "Create a variable x with the value 10. Write an if statement that checks if x is equal to 10. If it is, print 'Yes'.",
    expectedLogic: "x = 10\nif x == 10:\n    print('Yes')"
  },
  27: {
    title: "Practice: Lists",
    instruction: "Create a list called colors containing 'red', 'green', and 'blue'. Print the list.",
    expectedLogic: "colors = ['red', 'green', 'blue']\nprint(colors)"
  },
  28: {
    title: "Practice: For Loop",
    instruction: "Write a for loop that prints the numbers 0, 1, 2, 3, 4.",
    expectedLogic: "for i in range(5):\n    print(i)"
  },
  29: {
    title: "Practice: Functions",
    instruction: "Define a function called say_hello that prints 'Hello!'. Then call the function.",
    expectedLogic: "def say_hello():\n    print('Hello!')\n\nsay_hello()"
  },
  30: {
    title: "Practice: Final Challenge",
    instruction: "Write a function called add_numbers that takes two parameters (a and b), adds them together, and returns the result.",
    expectedLogic: "def add_numbers(a, b):\n    return a + b"
  }
};

export const conceptMap: Record<string, string[]> = {
  python_practice: ["Practice Part 1", "Practice Part 2"],
  python: pythonConcepts,
  html: htmlConcepts,
  css: cssConcepts,
  js: jsConcepts,
  sql: sqlConcepts,
  git: gitConcepts,
  c: cConcepts,
  cpp: cppConcepts,
  java: javaConcepts,
  dart: dartConcepts,
  flutter: flutterConcepts,
  firebase: firebaseConcepts,
  rest: restConcepts,
  gemini: geminiConcepts,
  fullstack: fullstackConcepts,
};

export const challenges: Challenge[] = [];

TRACKS.forEach((track) => {
  const maxLevels = track.id === 'python' ? 20 : track.id === 'python_practice' ? 10 : 100;
  for (let i = 1; i <= maxLevels; i++) {
    const level = i;
    const chapter = Math.ceil(level / 5);
    const globalLevelId = track.offset + i;
    
    let concept = conceptMap[track.id] ? conceptMap[track.id][chapter - 1] : genericConcepts[chapter - 1];
    if (!concept) concept = `${track.name} Concept`;
    
    let title = `Level ${level}: ${concept}`;
    
    let langMarkdown = track.id === 'html' ? 'html' : track.id === 'css' ? 'css' : track.id === 'js' ? 'javascript' : track.id === 'sql' ? 'sql' : track.id === 'c' || track.id === 'cpp' ? 'cpp' : track.id === 'java' ? 'java' : track.id === 'dart' || track.id === 'flutter' ? 'dart' : 'python';
    
    let instruction = "";
    let expectedLogic = "";
    let targetCode = "";
    let initialCode = "";
    
    if (track.id === 'python') {
      let commentChar = '#';
      let commentEnd = '';
      
      targetCode = generatePythonTargetCode(level);
      expectedLogic = targetCode;
      initialCode = `${commentChar} Type your code here for ${concept}${commentEnd}\n`;
      instruction = `Welcome to Level ${level} of ${track.name}!\n\nIn this level, we are focusing on **${concept}**.\n\n### Explanation\n${concept} is a fundamental part of ${track.name}. By mastering this, you will get one step closer to building your Final Project!\n\n### Example\n\`\`\`${langMarkdown}\n// Example of ${concept}\n\`\`\`\n\n### Task\nWrite a complete and correct implementation using ${concept}. Use the code editor below to complete the task.`;
      
      if (level % 5 === 0 && !projects[level]) {
        title = `Challenge Level: ${concept}`;
        instruction = `Time for a challenge!\n\nApply what you've learned about **${concept}**.\n\n### Task\nWrite a complete program using ${concept}.`;
      }
      
      if (level === 1) {
        title = "Say Hello!";
        instruction = "Welcome to CodeQuest! Let's write your first Python code.\n\n### Explanation\nThe `print()` function tells the computer to show text on the screen.\n\n### Example\n```python\nprint('Hi!')\n```\n\n### Task\nType the exact code shown below to make the computer say 'Hello World!'.\n\n```python\nprint('Hello World!')\n```";
        initialCode = "# Type your code here\n";
        expectedLogic = "The user must exactly type: print('Hello World!')";
        targetCode = "print('Hello World!')";
      } else if (level === 2) {
        title = "Print Numbers";
        instruction = "You can also print numbers!\n\n### Explanation\nYou don't need quotes for numbers.\n\n### Example\n```python\nprint(42)\n```\n\n### Task\nTry printing the number 500.";
        initialCode = "# Type your code here\n";
        expectedLogic = "The user must exactly type: print(500)";
        targetCode = "print(500)";
      } else if (level === 3) {
        title = "Comments";
        instruction = "Comments are notes for humans. Python ignores them.\n\n### Explanation\nThey start with a `#`.\n\n### Example\n```python\n# This is ignored\nprint('Hi')\n```\n\n### Task\nRun the code below to see that the comment doesn't print anything!";
        initialCode = "# This is a comment\nprint('I am learning!')\n";
        expectedLogic = "The user just needs to run the code as provided.";
        targetCode = "# This is a comment\nprint('I am learning!')";
      } else if (level === 4) {
        title = "Multiple Things";
        instruction = "You can print multiple things at once.\n\n### Explanation\nSeparate them with commas.\n\n### Example\n```python\nprint('Age:', 20)\n```\n\n### Task\nTry printing `'Score:'` and `100` together.";
        initialCode = "# Type your code here\n";
        expectedLogic = "The user must type: print('Score:', 100)";
        targetCode = "print('Score:', 100)";
      } else if (level === 5) {
        title = "Challenge Level: Basics";
        instruction = "Time for a challenge! Apply what you've learned.\n\n### Task\nPrint your name, and then print your age on a new line.\n\n### Example\n```python\nprint('Alex')\nprint(25)\n```";
        initialCode = "# Type your code here\n";
        expectedLogic = "The user must use two print statements, one with a string and one with an int.";
        targetCode = "print('Alex')\nprint(25)";
      } else if (level === 6) {
        title = "Store a Value";
        instruction = "Variables store data. Think of them as labeled boxes.\n\n### Explanation\nUse `=` to assign a value to a variable.\n\n### Example\n```python\nage = 20\n```\n\n### Task\nStore the name 'Alice' in a variable called `name`.";
        initialCode = "# Type your code here\n";
        expectedLogic = "The user must exactly type: name = 'Alice'";
        targetCode = "name = 'Alice'";
      } else if (level === 7) {
        title = "Using Variables";
        instruction = "Now, let's use the variable you created!\n\n### Explanation\nJust put the variable name inside `print()`.\n\n### Example\n```python\nage = 20\nprint(age)\n```\n\n### Task\nPrint the `name` variable.\n```python\nname = 'Alice'\nprint(name)\n```";
        initialCode = "name = 'Alice'\n# Print the name variable here\n";
        expectedLogic = "The user must type: print(name)";
        targetCode = "name = 'Alice'\nprint(name)";
      } else if (level === 8) {
        title = "Number Crunching";
        instruction = "Python can do math! Copy the code to add two numbers and store it in a variable called `score`.\n\n### Explanation\nUse `+` for addition, `-` for subtraction, `*` for multiplication, and `/` for division.\n\n### Example\n```python\npoints = 5 * 2\n```\n\n### Task\nCreate a variable `score` that stores the result of `10 + 5`.";
        initialCode = "# Type your code here\n";
        expectedLogic = "The user must exactly type: score = 10 + 5";
        targetCode = "score = 10 + 5";
      } else if (level === 9) {
        title = "Math Results";
        instruction = "Let's see the result of our math! Complete the code to print the `score`.\n\n### Explanation\nYou can print the result of math operations stored in variables.\n\n### Task\nPrint the `score` variable.\n```python\nscore = 10 + 5\nprint(score)\n```";
        initialCode = "score = 10 + 5\n# Print the score here\n";
        expectedLogic = "The user must type: print(score)";
        targetCode = "score = 10 + 5\nprint(score)";
      } else if (level === 10) {
        title = "Challenge Level: Variables";
        instruction = "Time for a challenge!\n\n### Task\n1. Create a variable called `health` and set it to `100`.\n2. Print the `health` variable.";
        initialCode = "# Write your code here\n";
        expectedLogic = "The user must create a health variable and print it.";
        targetCode = "health = 100\nprint(health)";
      } else if (projects[level]) {
        const proj = projects[level];
        title = proj.title;
        instruction = `Congratulations on reaching Level ${level}!\n\n${proj.desc}\n\n### Task\n${proj.task}`;
        initialCode = "# Build your project here\n";
        expectedLogic = `The user must build the project: ${proj.title}`;
        targetCode = proj.code;
      } else if (level > 60) {
        if (level <= 70) {
          const lines = targetCode.split('\n');
          if (lines.length > 1) {
            lines[lines.length - 1] = "# Type the missing line below to complete the code!\n";
            initialCode = lines.join('\n');
          } else {
            initialCode = "# Type your one line of code here:\n";
          }
        } else if (level <= 80) {
          initialCode = "# Write the multiple lines of logic to solve this:\n";
        } else {
          initialCode = "# Full Code Editor Mode\n# You're on your own! Write the complete program.\n";
        }
      }
    } else if (track.id === 'python_practice') {
      concept = "Independent Practice";
      title = pythonPractice[level + 20] ? pythonPractice[level + 20].title : title;
      instruction = pythonPractice[level + 20] 
        ? pythonPractice[level + 20].instruction 
        : `Welcome to Practice Level ${level}!`;
      expectedLogic = pythonPractice[level + 20] 
        ? pythonPractice[level + 20].expectedLogic 
        : `Complete practice task for ${concept}.`;
      initialCode = `# Type your code here\n`;
      targetCode = expectedLogic;
    } else {
      // ALL OTHER LANGUAGES
      const generated = generateTrackContent(track.id, level, concept, track.name);
      title = generated.title;
      instruction = generated.instruction;
      expectedLogic = generated.expectedLogic;
      targetCode = generated.targetCode || "";
      initialCode = generated.initialCode;
      
      if (!targetCode) {
        let commentChar = track.id === 'html' ? '<!--' : (['css', 'sql'].includes(track.id) ? '/*' : '#');
        if (['js', 'c', 'cpp', 'java', 'dart', 'flutter', 'firebase', 'rest', 'gemini', 'fullstack'].includes(track.id)) commentChar = '//';
        let commentEnd = ['html'].includes(track.id) ? ' -->' : (['css', 'sql'].includes(track.id) ? ' */' : '');
        targetCode = `${commentChar} ${concept} implementation${commentEnd}`;
      }
    }

    challenges.push({
      id: `l${globalLevelId}`,
      trackId: track.id,
      stage: chapter,
      level: level,
      concept: concept,
      title: title,
      instruction: instruction,
      initialCode: initialCode,
      expectedLogic: expectedLogic,
      targetCode: targetCode,
      activityType: track.id === 'python_practice' ? 'code_editor' : (level <= 50 ? 'tap_build' : 'code_editor')
    });
  }
});
