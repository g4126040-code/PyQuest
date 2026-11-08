const fs = require('fs');

const foundationSnippets = {
  html: [
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
  css: [
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
  js: [
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
  sql: [
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
  git: [
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
  c: [
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
  cpp: [
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
  java: [
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
  dart: [
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
  flutter: [
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
  firebase: [
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
  rest: [
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
  gemini: [
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
  fullstack: [
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

let output = `
function getFoundationTargetCode(trackId: string, level: number): string {
  const snippets: Record<string, string[]> = ${JSON.stringify(foundationSnippets, null, 2)};
  const trackSnippets = snippets[trackId];
  if (!trackSnippets) return "";
  const chapter = Math.min(10, Math.ceil(level / 5));
  const snippet = trackSnippets[chapter - 1];
  return snippet.replace(/\\{level\\}/g, level.toString());
}
`;

fs.writeFileSync('src/data/foundation.ts', output);
