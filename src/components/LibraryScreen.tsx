import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Library, Code2, ChevronDown, ChevronRight, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-dart';
import 'prismjs/themes/prism-tomorrow.css';
import { playSound, triggerHaptic } from '../lib/sounds';

interface Snippet {
  id: string;
  title: string;
  code: string;
  description: string;
}

interface LanguageSection {
  id: string;
  name: string;
  snippets: Snippet[];
}

const libraryData: LanguageSection[] = [
  {
    id: 'python', name: 'Python',
    snippets: [
      { id: 'p1', title: 'Beginner Example', description: 'Print a simple message to the console.', code: "print('Hello, Python!')" },
      { id: 'p2', title: 'Basic Syntax', description: 'Variables and basic math.', code: "name = 'Alice'\nage = 25\nprint(name, 'is', age)" },
      { id: 'p3', title: 'Common Code', description: 'A function that adds two numbers.', code: "def add(a, b):\n    return a + b\n\nresult = add(5, 10)\nprint(result)" },
      { id: 'p4', title: 'Small Program', description: 'A loop that prints numbers.', code: "for i in range(1, 6):\n    print(f'Number: {i}')" },
      { id: 'p5', title: 'Mini Project', description: 'A simple number guessing logic.', code: "secret = 7\nguess = 7\nif guess == secret:\n    print('You won!')\nelse:\n    print('Try again.')" },
      { id: 'p6', title: 'Useful Snippets', description: 'Reading a file.', code: "with open('file.txt', 'r') as f:\n    content = f.read()\n    print(content)" }
    ]
  },
  {
    id: 'html', name: 'HTML',
    snippets: [
      { id: 'h1', title: 'Beginner Example', description: 'A basic HTML document structure.', code: "<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>" },
      { id: 'h2', title: 'Syntax Example', description: 'Links and images.', code: "<a href=\"https://example.com\">Click Here</a>\n<img src=\"image.jpg\" alt=\"Description\">" },
      { id: 'h3', title: 'Common Code', description: 'A simple form.', code: "<form action=\"/submit\">\n  <input type=\"text\" placeholder=\"Enter name\">\n  <button type=\"submit\">Submit</button>\n</form>" },
      { id: 'h4', title: 'Small Program', description: 'An ordered list of items.', code: "<ol>\n  <li>First Item</li>\n  <li>Second Item</li>\n</ol>" },
      { id: 'h5', title: 'Mini Project', description: 'A basic pricing table.', code: "<table>\n  <tr><th>Plan</th><th>Price</th></tr>\n  <tr><td>Basic</td><td>$9</td></tr>\n</table>" },
      { id: 'h6', title: 'Useful Snippets', description: 'Meta tags for responsive design.', code: "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" }
    ]
  },
  {
    id: 'css', name: 'CSS',
    snippets: [
      { id: 'c1', title: 'Beginner Example', description: 'Changing background and text color.', code: "body {\n  background-color: #f0f0f0;\n  color: #333;\n}" },
      { id: 'c2', title: 'Syntax Example', description: 'Styling a button.', code: ".btn {\n  background-color: blue;\n  color: white;\n  padding: 10px 20px;\n  border-radius: 5px;\n}" },
      { id: 'c3', title: 'Common Code', description: 'Centering a div with Flexbox.', code: ".container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n}" },
      { id: 'c4', title: 'Small Program', description: 'A simple CSS grid.', code: ".grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 10px;\n}" },
      { id: 'c5', title: 'Mini Project', description: 'A responsive card hover effect.', code: ".card:hover {\n  transform: translateY(-5px);\n  box-shadow: 0 10px 20px rgba(0,0,0,0.2);\n}" },
      { id: 'c6', title: 'Useful Snippets', description: 'Media query for mobile.', code: "@media (max-width: 600px) {\n  .sidebar { display: none; }\n}" }
    ]
  },
  {
    id: 'js', name: 'JavaScript',
    snippets: [
      { id: 'j1', title: 'Beginner Example', description: 'Logging a message.', code: "console.log('Hello, JS!');" },
      { id: 'j2', title: 'Syntax Example', description: 'Variables and Conditionals.', code: "let isRaining = true;\nif (isRaining) {\n  console.log('Take an umbrella');\n}" },
      { id: 'j3', title: 'Common Code', description: 'Arrow function example.', code: "const multiply = (a, b) => a * b;\nconsole.log(multiply(4, 5));" },
      { id: 'j4', title: 'Small Program', description: 'Filtering an array.', code: "const ages = [12, 18, 25, 8];\nconst adults = ages.filter(age => age >= 18);\nconsole.log(adults);" },
      { id: 'j5', title: 'Mini Project', description: 'Fetching data from an API.', code: "fetch('https://api.example.com/data')\n  .then(res => res.json())\n  .then(data => console.log(data));" },
      { id: 'j6', title: 'Useful Snippets', description: 'Selecting a DOM element.', code: "document.querySelector('.btn').addEventListener('click', () => {\n  alert('Clicked!');\n});" }
    ]
  },
  {
    id: 'sql', name: 'SQL',
    snippets: [
      { id: 's1', title: 'Beginner Example', description: 'Selecting all records.', code: "SELECT * FROM users;" },
      { id: 's2', title: 'Syntax Example', description: 'Filtering records.', code: "SELECT name, email FROM users WHERE age > 18;" },
      { id: 's3', title: 'Common Code', description: 'Joining two tables.', code: "SELECT u.name, o.total\nFROM users u\nJOIN orders o ON u.id = o.user_id;" },
      { id: 's4', title: 'Small Program', description: 'Grouping and aggregating.', code: "SELECT department, COUNT(*) as count\nFROM employees\nGROUP BY department;" },
      { id: 's5', title: 'Mini Project', description: 'Updating records safely.', code: "UPDATE products\nSET price = price * 0.9\nWHERE category = 'Sale';" },
      { id: 's6', title: 'Useful Snippets', description: 'Creating a table.', code: "CREATE TABLE users (\n  id INT PRIMARY KEY,\n  name VARCHAR(100)\n);" }
    ]
  },
  {
    id: 'c', name: 'C',
    snippets: [
      { id: 'c1', title: 'Beginner Example', description: 'Hello world in C.', code: "#include <stdio.h>\n\nint main() {\n  printf(\"Hello World!\\n\");\n  return 0;\n}" },
      { id: 'c2', title: 'Syntax Example', description: 'Variables and math.', code: "int a = 5;\nint b = 10;\nint sum = a + b;" },
      { id: 'c3', title: 'Common Code', description: 'A basic for loop.', code: "for(int i=0; i<5; i++) {\n  printf(\"%d\\n\", i);\n}" },
      { id: 'c4', title: 'Small Program', description: 'Pointers basics.', code: "int var = 20;\nint *ptr = &var;\nprintf(\"Value: %d\", *ptr);" },
      { id: 'c5', title: 'Mini Project', description: 'Defining a struct.', code: "struct Point {\n  int x;\n  int y;\n};\nstruct Point p1 = {10, 20};" },
      { id: 'c6', title: 'Useful Snippets', description: 'Memory allocation.', code: "int *arr = (int*)malloc(5 * sizeof(int));\nfree(arr);" }
    ]
  },
  {
    id: 'cpp', name: 'C++',
    snippets: [
      { id: 'cpp1', title: 'Beginner Example', description: 'Hello world in C++.', code: "#include <iostream>\n\nint main() {\n  std::cout << \"Hello World!\" << std::endl;\n  return 0;\n}" },
      { id: 'cpp2', title: 'Syntax Example', description: 'Taking user input.', code: "int age;\nstd::cin >> age;\nstd::cout << \"Age: \" << age;" },
      { id: 'cpp3', title: 'Common Code', description: 'Using Vectors.', code: "#include <vector>\nstd::vector<int> nums = {1, 2, 3};\nnums.push_back(4);" },
      { id: 'cpp4', title: 'Small Program', description: 'Basic Class definition.', code: "class Car {\npublic:\n  void honk() { std::cout << \"Beep!\"; }\n};" },
      { id: 'cpp5', title: 'Mini Project', description: 'Constructor example.', code: "class User {\n  std::string name;\npublic:\n  User(std::string n) : name(n) {}\n};" },
      { id: 'cpp6', title: 'Useful Snippets', description: 'File writing.', code: "#include <fstream>\nstd::ofstream file(\"data.txt\");\nfile << \"Save this!\";" }
    ]
  },
  {
    id: 'java', name: 'Java',
    snippets: [
      { id: 'jv1', title: 'Beginner Example', description: 'Hello world in Java.', code: "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello World!\");\n  }\n}" },
      { id: 'jv2', title: 'Syntax Example', description: 'Variables and types.', code: "String name = \"Alice\";\nint age = 25;" },
      { id: 'jv3', title: 'Common Code', description: 'Using an ArrayList.', code: "ArrayList<String> list = new ArrayList<>();\nlist.add(\"Item 1\");" },
      { id: 'jv4', title: 'Small Program', description: 'Exception handling.', code: "try {\n  int result = 10 / 0;\n} catch (ArithmeticException e) {\n  System.out.println(\"Error!\");\n}" },
      { id: 'jv5', title: 'Mini Project', description: 'Class and Object.', code: "class Dog {\n  void bark() { System.out.println(\"Woof!\"); }\n}\nDog d = new Dog();\nd.bark();" },
      { id: 'jv6', title: 'Useful Snippets', description: 'Enhanced for loop.', code: "int[] nums = {1, 2, 3};\nfor(int n : nums) {\n  System.out.println(n);\n}" }
    ]
  },
  {
    id: 'dart', name: 'Dart',
    snippets: [
      { id: 'd1', title: 'Beginner Example', description: 'Print to console.', code: "void main() {\n  print('Hello Dart!');\n}" },
      { id: 'd2', title: 'Syntax Example', description: 'Variables and typing.', code: "String name = 'Bob';\nint age = 30;" },
      { id: 'd3', title: 'Common Code', description: 'Arrow function.', code: "int add(int a, int b) => a + b;\nprint(add(2, 3));" },
      { id: 'd4', title: 'Small Program', description: 'Null safety.', code: "String? nullableName;\nprint(nullableName?.length ?? 0);" },
      { id: 'd5', title: 'Mini Project', description: 'Async function.', code: "Future<void> fetchData() async {\n  await Future.delayed(Duration(seconds: 1));\n  print('Done!');\n}" },
      { id: 'd6', title: 'Useful Snippets', description: 'Map iteration.', code: "var user = {'name': 'Alice', 'role': 'Admin'};\nuser.forEach((k, v) => print('$k: $v'));" }
    ]
  },
  {
    id: 'flutter', name: 'Flutter',
    snippets: [
      { id: 'f1', title: 'Beginner Example', description: 'A basic Text widget.', code: "Text('Hello Flutter!', style: TextStyle(fontSize: 24))" },
      { id: 'f2', title: 'Syntax Example', description: 'A simple column.', code: "Column(\n  children: [\n    Text('Line 1'),\n    Text('Line 2')\n  ]\n)" },
      { id: 'f3', title: 'Common Code', description: 'ElevatedButton.', code: "ElevatedButton(\n  onPressed: () {\n    print('Pressed!');\n  },\n  child: Text('Click Me'),\n)" },
      { id: 'f4', title: 'Small Program', description: 'Container styling.', code: "Container(\n  padding: EdgeInsets.all(16),\n  decoration: BoxDecoration(\n    color: Colors.blue,\n    borderRadius: BorderRadius.circular(8),\n  ),\n  child: Text('Box'),\n)" },
      { id: 'f5', title: 'Mini Project', description: 'ListView builder.', code: "ListView.builder(\n  itemCount: 10,\n  itemBuilder: (context, index) {\n    return ListTile(title: Text('Item $index'));\n  }\n)" },
      { id: 'f6', title: 'Useful Snippets', description: 'StatelessWidget.', code: "class MyWidget extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return Center(child: Text('Hi'));\n  }\n}" }
    ]
  }
];
export default function LibraryScreen({ onOpenInPlayground }: { onOpenInPlayground: (lang: string, code: string) => void }) {
  const { t } = useLanguage();
  const [expandedSection, setExpandedSection] = useState<string | null>('python');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    playSound('click'); triggerHaptic('light');
    setExpandedSection(expandedSection === id ? null : id);
  };

  const handleCopy = async (snippet: Snippet) => {
    playSound('click'); triggerHaptic('light');
    await navigator.clipboard.writeText(snippet.code);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenPlayground = (langId: string, code: string) => {
    playSound('click'); triggerHaptic('light');
    // Save to local storage for the playground to pick up
    localStorage.setItem(`codequest_playground_${langId}`, code);
    onOpenInPlayground(langId, code);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 flex flex-col gap-6 pb-32">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-surface-elevated rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
          <Library className="w-8 h-8 text-brand-500" />
        </div>
        <h1 className="text-3xl font-black mb-2 text-content-primary">{t('Code Library')}</h1>
        <p className="text-content-secondary font-medium">{t('Examples, snippets, and references for all languages.')}</p>
      </div>

      <div className="flex flex-col gap-4">
        {libraryData.map(section => {
          const isExpanded = expandedSection === section.id;
          
          return (
            <div key={section.id} className="liquid-glass overflow-hidden rounded-3xl">
              <button 
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Code2 className="w-6 h-6 text-brand-500" />
                  <span className="text-lg font-bold">{section.name}</span>
                </div>
                {isExpanded ? <ChevronDown className="w-5 h-5 text-content-muted" /> : <ChevronRight className="w-5 h-5 text-content-muted" />}
              </button>

              {isExpanded && (
                <div className="p-4 flex flex-col gap-6 bg-surface-main/30 border-t border-outline">
                  {section.snippets.map(snippet => (
                    <div key={snippet.id} className="flex flex-col gap-3">
                      <div>
                        <h3 className="font-bold text-content-primary">{snippet.title}</h3>
                        <p className="text-sm text-content-secondary">{snippet.description}</p>
                      </div>
                      
                      <div className="rounded-xl overflow-hidden bg-[#1e1e2e] border border-[#313244]">
                        <div className="flex justify-end bg-[#181825] px-2 py-1 border-b border-[#313244]">
                          <button 
                            onClick={() => handleCopy(snippet)}
                            className="p-1.5 text-[#a6e3a1] hover:bg-[#313244] rounded-md flex items-center gap-1.5 text-xs font-bold transition-colors"
                          >
                            {copiedId === snippet.id ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedId === snippet.id ? t('Copied!') : t('Copy')}
                          </button>
                          <button 
                            onClick={() => handleOpenPlayground(section.id, snippet.code)}
                            className="p-1.5 text-[#89b4fa] hover:bg-[#313244] rounded-md flex items-center gap-1.5 text-xs font-bold transition-colors ml-2"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> {t('Open in Playground')}
                          </button>
                        </div>
                        <div className="p-4 overflow-x-auto text-[14px]">
                          <pre className="!bg-transparent !m-0 !p-0">
                            <code 
                              className={`language-${section.id === 'html' ? 'markup' : section.id === 'c' || section.id === 'cpp' ? 'cpp' : section.id}`}
                              dangerouslySetInnerHTML={{ 
                                __html: Prism.highlight(
                                  snippet.code, 
                                  Prism.languages[section.id === 'html' ? 'markup' : section.id === 'c' || section.id === 'cpp' ? 'cpp' : section.id] || Prism.languages.javascript, 
                                  section.id
                                ) 
                              }}
                            />
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
