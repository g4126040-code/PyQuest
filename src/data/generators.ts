
export function getFoundationTargetCode(trackId: string, level: number): string {
  const snippets: Record<string, string[]> = {
  "html": [
    "<h1>Hello World</h1>",
    "<p>Welcome to Level {level}</p>",
    "<div class=\"container\">\n  <p>Content {level}</p>\n</div>",
    "<a href=\"#\">\n  Link {level}\n</a>",
    "<ul>\n  <li>Item 1</li>\n  <li>Item {level}</li>\n</ul>",
    "<img src=\"img.png\" alt=\"Image {level}\" />",
    "<button class=\"btn\">\n  Click {level}\n</button>",
    "<form>\n  <input type=\"text\" />\n</form>",
    "<table>\n  <tr>\n    <td>Data {level}</td>\n  </tr>\n</table>",
    "<header>\n  <h1>Site {level}</h1>\n</header>"
  ],
  "css": [
    "color: blue;",
    "background: red;\nmargin: {level}px;",
    "padding: 10px;\nborder: 1px solid black;",
    "display: flex;\njustify-content: center;",
    "font-size: {level}px;\nfont-weight: bold;",
    "display: grid;\ngrid-template-columns: 1fr 1fr;",
    "position: absolute;\ntop: {level}px;",
    "border-radius: {level}px;\nbox-shadow: 0 4px #000;",
    "transition: all 0.3s ease;",
    "@media (max-width: 600px) {\n  display: none;\n}"
  ],
  "js": [
    "console.log('Hello');",
    "let x = {level};\nconsole.log(x);",
    "const name = 'User';\nconsole.log(name);",
    "function add(a, b) {\n  return a + b;\n}",
    "if (x > {level}) {\n  console.log('Yes');\n}",
    "for (let i = 0; i < {level}; i++) {\n  console.log(i);\n}",
    "const arr = [1, 2, {level}];\nconsole.log(arr[0]);",
    "const obj = { id: {level} };\nconsole.log(obj.id);",
    "document.getElementById('btn').click();",
    "setTimeout(() => {\n  console.log('Done {level}');\n}, 1000);"
  ],
  "sql": [
    "SELECT * FROM users;",
    "SELECT name FROM users\nWHERE id = {level};",
    "INSERT INTO users (name)\nVALUES ('User {level}');",
    "UPDATE users\nSET status = 'active'\nWHERE id = {level};",
    "DELETE FROM users\nWHERE id = {level};",
    "SELECT COUNT(*)\nFROM users;",
    "SELECT *\nFROM users\nORDER BY age DESC;",
    "SELECT *\nFROM users\nLIMIT {level};",
    "SELECT users.name, orders.id\nFROM users\nJOIN orders;",
    "SELECT role, COUNT(*)\nFROM users\nGROUP BY role;"
  ],
  "git": [
    "git init",
    "git add .\ngit status",
    "git commit -m \"Level {level}\"",
    "git log --oneline",
    "git branch feature-{level}",
    "git checkout main",
    "git merge feature-{level}",
    "git remote add origin url",
    "git push origin main",
    "git pull origin main"
  ],
  "c": [
    "int x = {level};",
    "printf(\"Hello %d\", {level});",
    "int a = 5;\nint b = {level};",
    "if (x > {level}) {\n  return 1;\n}",
    "for (int i = 0; i < {level}; i++) {\n  x++;\n}",
    "while (x < {level}) {\n  x++;\n}",
    "int arr[{level}];",
    "int* ptr = &x;",
    "char str[] = \"Level {level}\";",
    "return 0;"
  ],
  "cpp": [
    "int x = {level};",
    "cout << \"Hello \" << {level};",
    "string name = \"User\";",
    "if (x > {level}) {\n  return 1;\n}",
    "for (int i = 0; i < {level}; i++) {\n  x++;\n}",
    "while (x < {level}) {\n  x++;\n}",
    "vector<int> arr;",
    "class User {\n  public:\n    int id = {level};\n};",
    "User u;\ncout << u.id;",
    "return 0;"
  ],
  "java": [
    "int x = {level};",
    "System.out.println(\"Hello \" + {level});",
    "String name = \"User\";",
    "if (x > {level}) {\n  return true;\n}",
    "for (int i = 0; i < {level}; i++) {\n  x++;\n}",
    "while (x < {level}) {\n  x++;\n}",
    "int[] arr = new int[{level}];",
    "class User {\n  public int id = {level};\n}",
    "User u = new User();",
    "return 0;"
  ],
  "dart": [
    "int x = {level};",
    "print('Hello ${level}');",
    "String name = 'User';",
    "if (x > {level}) {\n  return true;\n}",
    "for (int i = 0; i < {level}; i++) {\n  x++;\n}",
    "List<int> arr = [1, 2, {level}];",
    "Map<String, int> m = {'id': {level}};",
    "class User {\n  int id = {level};\n}",
    "var u = User();",
    "await Future.delayed(Duration(seconds: 1));"
  ],
  "flutter": [
    "Text('Level {level}')",
    "Center(\n  child: Text('Hi'),\n)",
    "Container(\n  color: Colors.blue,\n)",
    "Column(\n  children: [Text('1')],\n)",
    "Row(\n  children: [Text('{level}')],\n)",
    "Padding(\n  padding: EdgeInsets.all(8.0),\n)",
    "ElevatedButton(\n  onPressed: () {},\n)",
    "Scaffold(\n  appBar: AppBar(),\n)",
    "ListView(\n  children: [Text('{level}')],\n)",
    "Image.network('url_{level}')"
  ],
  "firebase": [
    "const app = initializeApp(config);",
    "const db = getFirestore(app);",
    "const auth = getAuth(app);",
    "signInWithEmailAndPassword(auth, email, pass);",
    "const docRef = doc(db, 'users', 'id');",
    "const docSnap = await getDoc(docRef);",
    "await setDoc(docRef, { level: {level} });",
    "await addDoc(collection(db, 'users'), {});",
    "const q = query(collection(db, 'users'));",
    "const querySnapshot = await getDocs(q);"
  ],
  "rest": [
    "fetch('https://api.example.com');",
    "const response = await fetch(url);",
    "const data = await response.json();",
    "fetch(url, {\n  method: 'POST'\n});",
    "fetch(url, {\n  headers: { 'Content-Type': 'application/json' }\n});",
    "fetch(url, {\n  body: JSON.stringify({ level: {level} })\n});",
    "if (response.ok) {\n  console.log('Success');\n}",
    "if (response.status === 404) {\n  console.log('Error');\n}",
    "try {\n  await fetch(url);\n} catch (e) {}",
    "console.log('API call complete');"
  ],
  "gemini": [
    "const ai = new GoogleGenAI({});",
    "const model = ai.getGenerativeModel({ model: 'gemini-3.1-pro' });",
    "const result = await model.generateContent('Hi');",
    "console.log(result.response.text());",
    "const chat = model.startChat();",
    "const result = await chat.sendMessage('Level {level}');",
    "const model = ai.getGenerativeModel({ systemInstruction: 'You are helpful' });",
    "const result = await model.generateContent(prompt);",
    "for await (const chunk of result.stream) {\n  console.log(chunk.text());\n}",
    "console.log('Gemini generation complete');"
  ],
  "fullstack": [
    "const app = express();",
    "app.use(express.json());",
    "app.get('/api/users', (req, res) => {});",
    "app.post('/api/users', (req, res) => {});",
    "res.json({ level: {level} });",
    "res.status(200).send('OK');",
    "mongoose.connect(process.env.MONGO_URI);",
    "const User = mongoose.model('User', schema);",
    "const user = new User({ level: {level} });",
    "await user.save();"
  ]
};
  const trackSnippets = snippets[trackId];
  if (!trackSnippets) return "";
  const chapter = Math.min(10, Math.ceil(level / 5));
  const snippet = trackSnippets[chapter - 1];
  return snippet.replace(/\{level\}/g, level.toString());
}

export const languageProjects = {
  "html": {
      "25": {
          "title": "Boss Challenge 1: Blog Post",
          "desc": "Structure a basic blog post with headings, paragraphs, and lists."
      },
      "50": {
          "title": "Mini Project: Recipe Page",
          "desc": "Build a full recipe page including images, lists, and tables."
      },
      "75": {
          "title": "Advanced Project: Newsletter Form",
          "desc": "Create a semantic newsletter signup form with accessibility features."
      },
      "100": {
          "title": "Final Project: Personal Website",
          "desc": "Build a complete beginner-friendly personal website with multiple sections."
      }
  },
  "css": {
      "25": {
          "title": "Boss Challenge 1: Styled Card",
          "desc": "Style a beautiful profile card using the box model, colors, and typography."
      },
      "50": {
          "title": "Mini Project: Product Grid",
          "desc": "Create a responsive product grid layout using CSS Flexbox."
      },
      "75": {
          "title": "Advanced Project: Animated Navbar",
          "desc": "Build a responsive navigation bar with hover transitions and animations."
      },
      "100": {
          "title": "Final Project: Responsive Website",
          "desc": "Style a complete responsive website using Grid, Flexbox, and Media Queries."
      }
  },
  "js": {
      "25": {
          "title": "Boss Challenge 1: Number Guesser",
          "desc": "Build a basic number guessing game using conditionals and variables."
      },
      "50": {
          "title": "Mini Project: To-Do List",
          "desc": "Create an interactive to-do list modifying the DOM and handling click events."
      },
      "75": {
          "title": "Advanced Project: Weather Widget",
          "desc": "Fetch data from a simulated API and update the UI asynchronously."
      },
      "100": {
          "title": "Final Project: Interactive Website",
          "desc": "Build a fully interactive web application with local storage and animations."
      }
  },
  "sql": {
      "25": {
          "title": "Boss Challenge 1: Library Query",
          "desc": "Write queries to SELECT and FILTER books from a library database."
      },
      "50": {
          "title": "Mini Project: Employee Directory",
          "desc": "Use JOINS and GROUP BY to manage an employee and department database."
      },
      "75": {
          "title": "Advanced Project: E-Commerce Reports",
          "desc": "Write subqueries and aggregate functions to generate sales reports."
      },
      "100": {
          "title": "Final Project: Student Database",
          "desc": "Design and query a beginner-friendly student management database system."
      }
  }
,
  "git": {
      "25": {
          "title": "Boss Challenge 1: Local Repo",
          "desc": "Initialize a repo, add files, and make your first commit."
      },
      "50": {
          "title": "Mini Project: Branching Out",
          "desc": "Create a branch, make changes, and merge them back to main."
      },
      "75": {
          "title": "Advanced Project: Remote Sync",
          "desc": "Push changes to a remote repository and handle basic fetch/pull."
      },
      "100": {
          "title": "Final Project: Open Source Collab",
          "desc": "Simulate a complete workflow with pull requests and merging."
      }
  },
  "c": {
      "25": {
          "title": "Boss Challenge 1: Calculator",
          "desc": "Write a program that takes user input and performs basic arithmetic."
      },
      "50": {
          "title": "Mini Project: Temperature Converter",
          "desc": "Create a robust temperature conversion tool using functions and loops."
      },
      "75": {
          "title": "Advanced Project: Contact Book",
          "desc": "Use structs and arrays to store and search through a list of contacts."
      },
      "100": {
          "title": "Final Project: Console Application",
          "desc": "Build a complete beginner-friendly console application using file handling and pointers."
      }
  },
  "cpp": {
      "25": {
          "title": "Boss Challenge 1: Math Quiz",
          "desc": "Build a terminal math quiz using loops and C++ strings."
      },
      "50": {
          "title": "Mini Project: Inventory System",
          "desc": "Manage an inventory using C++ OOP basics and classes."
      },
      "75": {
          "title": "Advanced Project: Student Records",
          "desc": "Create a system utilizing inheritance, polymorphism, and vectors."
      },
      "100": {
          "title": "Final Project: Text Adventure",
          "desc": "Design a complete text adventure game using STL, classes, and file I/O."
      }
  },
  "java": {
      "25": {
          "title": "Boss Challenge 1: Number Guesser",
          "desc": "Build a basic number guessing game using conditionals and loops."
      },
      "50": {
          "title": "Mini Project: Library Manager",
          "desc": "Create a library system using Java classes, methods, and arrays."
      },
      "75": {
          "title": "Advanced Project: Banking App",
          "desc": "Implement a banking app using inheritance, interfaces, and exception handling."
      },
      "100": {
          "title": "Final Project: Employee Directory",
          "desc": "Build an employee management system using Java Collections and file operations."
      }
  },
  "dart": {
      "25": {
          "title": "Boss Challenge 1: Calculator",
          "desc": "Build a simple console calculator using Dart syntax and conditionals."
      },
      "50": {
          "title": "Mini Project: Task Tracker",
          "desc": "Create a task tracker using lists, maps, and basic functions."
      },
      "75": {
          "title": "Advanced Project: E-Commerce Model",
          "desc": "Model an e-commerce backend using OOP, mixins, and null safety."
      },
      "100": {
          "title": "Final Project: Weather Fetcher",
          "desc": "Build an async application that fetches and processes data using Futures."
      }
  },
  "flutter": {
      "25": {
          "title": "Boss Challenge 1: Profile App",
          "desc": "Design a simple profile screen using basic Flutter widgets like Row and Column."
      },
      "50": {
          "title": "Mini Project: Counter App",
          "desc": "Build an interactive counter app utilizing StatefulWidget and buttons."
      },
      "75": {
          "title": "Advanced Project: To-Do App",
          "desc": "Create a functional To-Do list using ListView and basic forms."
      },
      "100": {
          "title": "Final Project: Weather App",
          "desc": "Build a complete weather app with navigation, API integration, and responsive UI."
      }
  }
,
  "firebase": {
      "25": {
          "title": "Boss Challenge 1: Initialize SDK",
          "desc": "Initialize the Firebase SDK and perform a basic connection test."
      },
      "50": {
          "title": "Mini Project: User Auth",
          "desc": "Implement a simple sign-up and sign-in flow using Firebase Authentication."
      },
      "75": {
          "title": "Advanced Project: Realtime Chat",
          "desc": "Use Firestore to read and write messages in a chat application."
      },
      "100": {
          "title": "Final Project: Social Feed",
          "desc": "Build a complete feed app combining Auth, Firestore, and Storage."
      }
  },
  "rest": {
      "25": {
          "title": "Boss Challenge 1: GET Request",
          "desc": "Use fetch() to retrieve data from a public REST API and display it."
      },
      "50": {
          "title": "Mini Project: POST Data",
          "desc": "Create a form that submits data to an API using a POST request."
      },
      "75": {
          "title": "Advanced Project: CRUD Operations",
          "desc": "Implement full Create, Read, Update, and Delete operations."
      },
      "100": {
          "title": "Final Project: Weather Dashboard",
          "desc": "Build a multi-component dashboard fetching real-time data from a weather API."
      }
  },
  "gemini": {
      "25": {
          "title": "Boss Challenge 1: Setup SDK",
          "desc": "Initialize the Google Gen AI SDK and make a basic text generation request."
      },
      "50": {
          "title": "Mini Project: Chatbot",
          "desc": "Build an interactive chatbot that maintains conversation history."
      },
      "75": {
          "title": "Advanced Project: System Instructions",
          "desc": "Create a specialized AI assistant using system instructions and structured output."
      },
      "100": {
          "title": "Final Project: AI Story Generator",
          "desc": "Build an app that takes user prompts to generate long-form stories with different tones."
      }
  },
  "fullstack": {
      "25": {
          "title": "Boss Challenge 1: API Route",
          "desc": "Create a simple backend API route and call it from the frontend."
      },
      "50": {
          "title": "Mini Project: Database Integration",
          "desc": "Connect a database to your backend and render the data on the client."
      },
      "75": {
          "title": "Advanced Project: User Sessions",
          "desc": "Implement authentication sessions across the frontend and backend."
      },
      "100": {
          "title": "Final Project: Full Stack AI App",
          "desc": "Combine frontend, backend, database, and Gemini AI into a complete application."
      }
  }};


export function generateTrackContent(trackId: string, level: number, concept: string, trackName: string) {
  
  
  let title = `Level ${level}: ${concept}`;
  let instruction = `Welcome to Level ${level}!\n\nIn this level, we are focusing on **${concept}**.\n\n### Task\nComplete the task for ${concept}.`;
  let targetCode = "";
  let expectedLogic = "";
  let initialCode = "";
  
  let commentChar = trackId === 'html' ? '<!--' : (['css', 'sql'].includes(trackId) ? '/*' : '#');
  if (['js', 'c', 'cpp', 'java', 'dart', 'flutter', 'firebase', 'rest', 'gemini', 'fullstack'].includes(trackId)) commentChar = '//';
  let commentEnd = ['html'].includes(trackId) ? ' -->' : (['css', 'sql'].includes(trackId) ? ' */' : '');
  
  if (level <= 50) {
    targetCode = getFoundationTargetCode(trackId, level);
    expectedLogic = "The user must implement the correct foundation concept.";
    initialCode = `${commentChar} ${concept}${commentEnd}\n`;
  } else {
    let langMarkdown = trackId === 'html' ? 'html' : trackId === 'css' ? 'css' : trackId === 'js' ? 'javascript' : trackId === 'sql' ? 'sql' : trackId === 'c' || trackId === 'cpp' ? 'cpp' : trackId === 'java' ? 'java' : trackId === 'dart' || trackId === 'flutter' ? 'dart' : 'python';
    instruction = `Welcome to Chapter ${Math.ceil(level/5)} of ${trackName}!\n\nIn this level, we are focusing on **${concept}**.\n\n### Explanation\n${concept} is a more advanced part of ${trackName}. From here on out, you will be writing the actual code yourself without blocks.\n\n### Example\n\`\`\`${langMarkdown}\n${commentChar} Example of ${concept}${commentEnd}\n\`\`\`\n\n### Task\nWrite a complete and correct implementation using ${concept}. Use the code editor below to complete the task.`;
    
    targetCode = `${commentChar} Target code for ${concept} in ${trackName}${commentEnd}\n${commentChar} Advanced implementation${commentEnd}`;
    expectedLogic = `The user must implement advanced logic for ${concept} in ${trackName}.`;
    initialCode = `${commentChar} Type your code here for ${concept}${commentEnd}\n`;
  }
  
  // Handle specific projects
  if (level % 5 === 0 && languageProjects[trackId as keyof typeof languageProjects]?.[level.toString() as keyof (typeof languageProjects)[keyof typeof languageProjects]]) {
    const proj = languageProjects[trackId as keyof typeof languageProjects][level.toString() as keyof (typeof languageProjects)[keyof typeof languageProjects]];
    title = proj.title;
    instruction = `Time for a project!\n\n${proj.desc}\n\n### Task\nApply everything you've learned to complete this project.`;
  } else if (level === 1) {
    title = "Say Hello!";
    
    let specificInstruction = `Follow the comments to complete your first task!`;
    if (trackId === 'html') specificInstruction = `Create a heading that says Hello World.`;
    else if (trackId === 'css') specificInstruction = `Change the text color to blue.`;
    else if (trackId === 'js') specificInstruction = `Display Hello World using console.log.`;
    else if (trackId === 'python') specificInstruction = `Print Hello World.`;
    else if (trackId === 'java' || trackId === 'cpp' || trackId === 'c' || trackId === 'dart') specificInstruction = `Print Hello World.`;
    else if (trackId === 'sql') specificInstruction = `Select all columns from the users table.`;
    else if (trackId === 'git') specificInstruction = `Initialize a new Git repository.`;
    else if (trackId === 'flutter') specificInstruction = `Display a Text widget with Level 1.`;
    else if (trackId === 'firebase') specificInstruction = `Initialize the Firebase app.`;
    else if (trackId === 'rest') specificInstruction = `Fetch data from an API.`;
    else if (trackId === 'gemini') specificInstruction = `Initialize the Gemini AI client.`;
    else if (trackId === 'fullstack') specificInstruction = `Initialize an Express app.`;
    
    instruction = `Welcome to CodeQuest! Let's write your first ${trackName} code.\n\n### Task\n${specificInstruction}`;
    expectedLogic = "The user must write the absolute basics for the language.";
  }

  return { title, instruction, expectedLogic, targetCode, initialCode };
}
