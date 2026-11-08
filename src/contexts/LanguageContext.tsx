import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'gu' | 'hinglish';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    "CodeQuest Python": "CodeQuest Python",
    "XP": "XP",
    "Chapter": "Chapter",
    "Levels": "Levels",
    "Level": "Level",
    "Start": "Start",
    "Python": "Python",
    "Run Code": "Run Code",
    "Checking...": "Checking...",
    "Check Answer": "Check Answer",
    "Next Lesson": "Next Lesson",
    "Console Output": "Console Output",
    "Run your code to see the output here...": "Run your code to see the output here...",
    "Challenge Level": "Challenge Level",
    "Boss Challenge": "Boss Challenge",
    "Mini Project": "Mini Project",
    "Bigger Project": "Bigger Project",
    "Final Project": "Final Project",
    "This is level {level}. We will learn about **{concept}**.": "This is level {level}. We will learn about **{concept}**.",
    "Write some Python code to practice this concept.": "Write some Python code to practice this concept.",
    "Time for a challenge! Apply what you've learned about **{concept}** in this special challenge level.": "Time for a challenge! Apply what you've learned about **{concept}** in this special challenge level.",
    "Welcome to Boss Challenge {number}! Prove your mastery of all concepts learned so far.": "Welcome to Boss Challenge {number}! Prove your mastery of all concepts learned so far.",
    "Welcome to the Mini Project! Build a simple application using everything you've learned up to Level 50.": "Welcome to the Mini Project! Build a simple application using everything you've learned up to Level 50.",
    "Welcome to the Bigger Project! Apply your skills to build a more complex Python program.": "Welcome to the Bigger Project! Apply your skills to build a more complex Python program.",
    "Congratulations on reaching Level 100! Build a complete beginner-friendly application or game using all the Python skills you have acquired.": "Congratulations on reaching Level 100! Build a complete beginner-friendly application or game using all the Python skills you have acquired.",
    "Welcome to CodeQuest! Let's write your first Python code.\n\nType the exact code shown below to make the computer say 'Hello World!'.\n\n```python\nprint('Hello World!')\n```": "Welcome to CodeQuest! Let's write your first Python code.\n\nType the exact code shown below to make the computer say 'Hello World!'.\n\n```python\nprint('Hello World!')\n```",
    "Variables store data. Copy the code below to store your name in a variable.\n\n```python\nname = 'Alice'\n```": "Variables store data. Copy the code below to store your name in a variable.\n\n```python\nname = 'Alice'\n```",
    "Python can do math! Copy the code to add two numbers.\n\n```python\nscore = 10 + 5\n```": "Python can do math! Copy the code to add two numbers.\n\n```python\nscore = 10 + 5\n```",
    "Say Hello!": "Say Hello!",
    "Store a Value": "Store a Value",
    "Number Crunching": "Number Crunching",
    "Basics: print() & Comments": "Basics: print() & Comments",
    "Variables & Data Types": "Variables & Data Types",
    "Numbers & Math": "Numbers & Math",
    "Strings & Text": "Strings & Text",
    "Input & Output": "Input & Output",
    "Booleans & Logic": "Booleans & Logic",
    "if Statements": "if Statements",
    "elif & else": "elif & else",
    "Lists Basics": "Lists Basics",
    "List Operations": "List Operations",
    "for Loops": "for Loops",
    "while Loops": "while Loops",
    "Dictionaries Basics": "Dictionaries Basics",
    "Functions Basics": "Functions Basics",
    "Return Values": "Return Values",
    "Modules & Imports": "Modules & Imports",
    "Error Handling": "Error Handling",
    "File Handling": "File Handling",
    "Classes & Objects": "Classes & Objects",
    "Advanced Python": "Advanced Python",
    "Python Practice": "Python Practice",
    "Failed to connect to the server to run code.": "Failed to connect to the server to run code.",
    "Failed to connect to the evaluation server. Please try again.": "Failed to connect to the evaluation server. Please try again."
  },
  hi: {
    "CodeQuest Python": "कोडक्वेस्ट पाइथन (CodeQuest Python)",
    "XP": "XP",
    "Chapter": "अध्याय",
    "Levels": "स्तर",
    "Level": "स्तर",
    "Start": "शुरू करें",
    "Python": "Python",
    "Run Code": "कोड रन करें",
    "Checking...": "जाँच हो रही है...",
    "Check Answer": "उत्तर जाँचें",
    "Next Lesson": "अगला पाठ",
    "Console Output": "कंसोल आउटपुट",
    "Run your code to see the output here...": "आउटपुट देखने के लिए अपना कोड रन करें...",
    "Challenge Level": "चुनौती स्तर",
    "Boss Challenge": "बॉस चुनौती",
    "Mini Project": "मिनी प्रोजेक्ट",
    "Bigger Project": "बड़ा प्रोजेक्ट",
    "Final Project": "अंतिम प्रोजेक्ट",
    "This is level {level}. We will learn about **{concept}**.": "यह स्तर {level} है। हम **{concept}** के बारे में सीखेंगे।",
    "Write some Python code to practice this concept.": "इस कॉन्सेप्ट का अभ्यास करने के लिए कुछ Python कोड लिखें।",
    "Time for a challenge! Apply what you've learned about **{concept}** in this special challenge level.": "अब एक चुनौती का समय है! आपने **{concept}** के बारे में जो कुछ सीखा है, उसे इस विशेष चुनौती स्तर में लागू करें।",
    "Welcome to Boss Challenge {number}! Prove your mastery of all concepts learned so far.": "बॉस चुनौती {number} में आपका स्वागत है! अब तक सीखे गए सभी कॉन्सेप्ट्स पर अपनी महारत साबित करें।",
    "Welcome to the Mini Project! Build a simple application using everything you've learned up to Level 50.": "मिनी प्रोजेक्ट में आपका स्वागत है! लेवल 50 तक आपने जो कुछ भी सीखा है, उसका उपयोग करके एक साधारण एप्लिकेशन बनाएं।",
    "Welcome to the Bigger Project! Apply your skills to build a more complex Python program.": "बड़े प्रोजेक्ट में आपका स्वागत है! एक अधिक जटिल Python प्रोग्राम बनाने के लिए अपने कौशल का उपयोग करें।",
    "Congratulations on reaching Level 100! Build a complete beginner-friendly application or game using all the Python skills you have acquired.": "लेवल 100 तक पहुँचने पर बधाई! आपके द्वारा सीखे गए सभी Python कौशल का उपयोग करके एक संपूर्ण शुरुआती-अनुकूल एप्लिकेशन या गेम बनाएं।",
    "Welcome to CodeQuest! Let's write your first Python code.\n\nType the exact code shown below to make the computer say 'Hello World!'.\n\n```python\nprint('Hello World!')\n```": "कोडक्वेस्ट में आपका स्वागत है! आइए अपना पहला Python कोड लिखें।\n\nकंप्यूटर से 'Hello World!' बुलवाने के लिए नीचे दिखाया गया सटीक कोड टाइप करें।\n\n```python\nprint('Hello World!')\n```",
    "Variables store data. Copy the code below to store your name in a variable.\n\n```python\nname = 'Alice'\n```": "Variables डेटा स्टोर करते हैं। अपना नाम एक Variable में स्टोर करने के लिए नीचे दिए गए कोड को कॉपी करें।\n\n```python\nname = 'Alice'\n```",
    "Python can do math! Copy the code to add two numbers.\n\n```python\nscore = 10 + 5\n```": "Python गणित कर सकता है! दो संख्याओं को जोड़ने के लिए कोड कॉपी करें।\n\n```python\nscore = 10 + 5\n```",
    "Say Hello!": "नमस्ते कहो!",
    "Store a Value": "एक वैल्यू स्टोर करें",
    "Number Crunching": "संख्याओं की गणना",
    "Basics: print() & Comments": "मूल बातें: print() और Comments",
    "Variables & Data Types": "Variables और Data Types",
    "Numbers & Math": "संख्याएं और गणित",
    "Strings & Text": "Strings और Text",
    "Input & Output": "इनपुट और आउटपुट",
    "Booleans & Logic": "Booleans और लॉजिक",
    "if Statements": "if Statements",
    "elif & else": "elif और else",
    "Lists Basics": "Lists की मूल बातें",
    "List Operations": "List के ऑपरेशन्स",
    "for Loops": "for Loops",
    "while Loops": "while Loops",
    "Dictionaries Basics": "Dictionaries की मूल बातें",
    "Functions Basics": "Functions की मूल बातें",
    "Return Values": "Return Values",
    "Modules & Imports": "Modules और Imports",
    "Error Handling": "Error Handling",
    "File Handling": "File Handling",
    "Classes & Objects": "Classes और Objects",
    "Advanced Python": "एडवांस्ड Python",
    "Python Practice": "Python अभ्यास",
    "Failed to connect to the server to run code.": "कोड रन करने के लिए सर्वर से कनेक्ट करने में विफल।",
    "Failed to connect to the evaluation server. Please try again.": "मूल्यांकन सर्वर से कनेक्ट करने में विफल। कृपया पुनः प्रयास करें।"
  },
  gu: {
    "CodeQuest Python": "કોડક્વેસ્ટ પાયથન (CodeQuest Python)",
    "XP": "XP",
    "Chapter": "પ્રકરણ",
    "Levels": "સ્તરો",
    "Level": "સ્તર",
    "Start": "શરૂ કરો",
    "Python": "Python",
    "Run Code": "કોડ રન કરો",
    "Checking...": "ચકાસણી ચાલુ છે...",
    "Check Answer": "જવાબ ચકાસો",
    "Next Lesson": "આગળનો પાઠ",
    "Console Output": "કન્સોલ આઉટપુટ",
    "Run your code to see the output here...": "આઉટપુટ જોવા માટે તમારો કોડ રન કરો...",
    "Challenge Level": "ચેલેન્જ સ્તર",
    "Boss Challenge": "બૉસ ચેલેન્જ",
    "Mini Project": "મિની પ્રોજેક્ટ",
    "Bigger Project": "મોટો પ્રોજેક્ટ",
    "Final Project": "અંતિમ પ્રોજેક્ટ",
    "This is level {level}. We will learn about **{concept}**.": "આ સ્તર {level} છે. આપણે **{concept}** વિશે શીખીશું.",
    "Write some Python code to practice this concept.": "આ કોન્સેપ્ટની પ્રેક્ટિસ કરવા માટે થોડો Python કોડ લખો.",
    "Time for a challenge! Apply what you've learned about **{concept}** in this special challenge level.": "હવે એક ચેલેન્જનો સમય છે! તમે **{concept}** વિશે જે શીખ્યા છો તે આ વિશેષ ચેલેન્જ સ્તરમાં લાગુ કરો.",
    "Welcome to Boss Challenge {number}! Prove your mastery of all concepts learned so far.": "બૉસ ચેલેન્જ {number} માં તમારું સ્વાગત છે! અત્યાર સુધી શીખેલા બધા કોન્સેપ્ટ્સ પર તમારી નિપુણતા સાબિત કરો.",
    "Welcome to the Mini Project! Build a simple application using everything you've learned up to Level 50.": "મિની પ્રોજેક્ટમાં તમારું સ્વાગત છે! લેવલ 50 સુધી તમે જે શીખ્યા છો તેનો ઉપયોગ કરીને એક સરળ એપ્લિકેશન બનાવો.",
    "Welcome to the Bigger Project! Apply your skills to build a more complex Python program.": "મોટા પ્રોજેક્ટમાં તમારું સ્વાગત છે! વધુ જટિલ Python પ્રોગ્રામ બનાવવા માટે તમારી કુશળતાનો ઉપયોગ કરો.",
    "Congratulations on reaching Level 100! Build a complete beginner-friendly application or game using all the Python skills you have acquired.": "લેવલ 100 સુધી પહોંચવા બદલ અભિનંદન! તમે મેળવેલ તમામ Python કુશળતાનો ઉપયોગ કરીને એક સંપૂર્ણ પ્રારંભિક-મૈત્રીપૂર્ણ એપ્લિકેશન અથવા રમત બનાવો.",
    "Welcome to CodeQuest! Let's write your first Python code.\n\nType the exact code shown below to make the computer say 'Hello World!'.\n\n```python\nprint('Hello World!')\n```": "કોડક્વેસ્ટમાં તમારું સ્વાગત છે! ચાલો તમારો પહેલો Python કોડ લખીએ.\n\nકમ્પ્યુટર પાસે 'Hello World!' બોલાવવા માટે નીચે દર્શાવેલ ચોક્કસ કોડ લખો.\n\n```python\nprint('Hello World!')\n```",
    "Variables store data. Copy the code below to store your name in a variable.\n\n```python\nname = 'Alice'\n```": "Variables ડેટા સ્ટોર કરે છે. તમારું નામ Variable માં સ્ટોર કરવા માટે નીચેનો કોડ કૉપિ કરો.\n\n```python\nname = 'Alice'\n```",
    "Python can do math! Copy the code to add two numbers.\n\n```python\nscore = 10 + 5\n```": "Python ગણિત કરી શકે છે! બે નંબરો ઉમેરવા માટે કોડ કૉપિ કરો.\n\n```python\nscore = 10 + 5\n```",
    "Say Hello!": "નમસ્તે કહો!",
    "Store a Value": "એક વેલ્યુ સ્ટોર કરો",
    "Number Crunching": "નંબરોની ગણતરી",
    "Basics: print() & Comments": "મૂળભૂત બાબતો: print() અને Comments",
    "Variables & Data Types": "Variables અને Data Types",
    "Numbers & Math": "નંબરો અને ગણિત",
    "Strings & Text": "Strings અને Text",
    "Input & Output": "ઇનપુટ અને આઉટપુટ",
    "Booleans & Logic": "Booleans અને લૉજિક",
    "if Statements": "if Statements",
    "elif & else": "elif અને else",
    "Lists Basics": "Lists ની મૂળભૂત બાબતો",
    "List Operations": "List ના ઓપરેશન્સ",
    "for Loops": "for Loops",
    "while Loops": "while Loops",
    "Dictionaries Basics": "Dictionaries ની મૂળભૂત બાબતો",
    "Functions Basics": "Functions ની મૂળભૂત બાબતો",
    "Return Values": "Return Values",
    "Modules & Imports": "Modules અને Imports",
    "Error Handling": "Error Handling",
    "File Handling": "File Handling",
    "Classes & Objects": "Classes અને Objects",
    "Advanced Python": "એડવાન્સ્ડ Python",
    "Python Practice": "Python પ્રેક્ટિસ",
    "Failed to connect to the server to run code.": "કોડ રન કરવા માટે સર્વર સાથે કનેક્ટ કરવામાં નિષ્ફળ.",
    "Failed to connect to the evaluation server. Please try again.": "મૂલ્યાંકન સર્વર સાથે કનેક્ટ કરવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો."
  },
  hinglish: {
    "CodeQuest Python": "CodeQuest Python",
    "XP": "XP",
    "Chapter": "Chapter",
    "Levels": "Levels",
    "Level": "Level",
    "Start": "Start karein",
    "Python": "Python",
    "Run Code": "Code Run karein",
    "Checking...": "Check ho raha hai...",
    "Check Answer": "Answer check karein",
    "Next Lesson": "Next Lesson",
    "Console Output": "Console Output",
    "Run your code to see the output here...": "Output dekhne ke liye apna code run karein...",
    "Challenge Level": "Challenge Level",
    "Boss Challenge": "Boss Challenge",
    "Mini Project": "Mini Project",
    "Bigger Project": "Bigger Project",
    "Final Project": "Final Project",
    "This is level {level}. We will learn about **{concept}**.": "Yeh level {level} hai. Hum **{concept}** ke baare mein seekhenge.",
    "Write some Python code to practice this concept.": "Is concept ki practice karne ke liye kuch Python code likhein.",
    "Time for a challenge! Apply what you've learned about **{concept}** in this special challenge level.": "Ab ek challenge ka time hai! Aapne **{concept}** ke baare mein jo kuch seekha hai, use is special challenge level mein apply karein.",
    "Welcome to Boss Challenge {number}! Prove your mastery of all concepts learned so far.": "Boss Challenge {number} mein aapka swagat hai! Ab tak seekhe gaye sabhi concepts par apni mastery prove karein.",
    "Welcome to the Mini Project! Build a simple application using everything you've learned up to Level 50.": "Mini Project mein aapka swagat hai! Level 50 tak aapne jo kuch bhi seekha hai uska use karke ek simple application banayein.",
    "Welcome to the Bigger Project! Apply your skills to build a more complex Python program.": "Bigger Project mein aapka swagat hai! Ek aur complex Python program banane ke liye apni skills ka use karein.",
    "Congratulations on reaching Level 100! Build a complete beginner-friendly application or game using all the Python skills you have acquired.": "Level 100 tak pahunchne par congratulations! Apni sabhi Python skills ka use karke ek complete beginner-friendly application ya game banayein.",
    "Welcome to CodeQuest! Let's write your first Python code.\n\nType the exact code shown below to make the computer say 'Hello World!'.\n\n```python\nprint('Hello World!')\n```": "CodeQuest mein aapka swagat hai! Chalo apna pehla Python code likhein.\n\nComputer se 'Hello World!' bulwane ke liye neeche dikhaya gaya exact code type karein.\n\n```python\nprint('Hello World!')\n```",
    "Variables store data. Copy the code below to store your name in a variable.\n\n```python\nname = 'Alice'\n```": "Variables data store karte hain. Apna naam ek Variable mein store karne ke liye neeche diya gaya code copy karein.\n\n```python\nname = 'Alice'\n```",
    "Python can do math! Copy the code to add two numbers.\n\n```python\nscore = 10 + 5\n```": "Python math kar sakta hai! Do numbers ko add karne ke liye code copy karein.\n\n```python\nscore = 10 + 5\n```",
    "Say Hello!": "Hello kaho!",
    "Store a Value": "Ek value store karein",
    "Number Crunching": "Numbers ki calculation",
    "Basics: print() & Comments": "Basics: print() aur Comments",
    "Variables & Data Types": "Variables aur Data Types",
    "Numbers & Math": "Numbers aur Math",
    "Strings & Text": "Strings aur Text",
    "Input & Output": "Input aur Output",
    "Booleans & Logic": "Booleans aur Logic",
    "if Statements": "if Statements",
    "elif & else": "elif aur else",
    "Lists Basics": "Lists Basics",
    "List Operations": "List Operations",
    "for Loops": "for Loops",
    "while Loops": "while Loops",
    "Dictionaries Basics": "Dictionaries Basics",
    "Functions Basics": "Functions Basics",
    "Return Values": "Return Values",
    "Modules & Imports": "Modules aur Imports",
    "Error Handling": "Error Handling",
    "File Handling": "File Handling",
    "Classes & Objects": "Classes aur Objects",
    "Advanced Python": "Advanced Python",
    "Python Practice": "Python Practice",
    "Failed to connect to the server to run code.": "Code run karne ke liye server se connect hone mein fail.",
    "Failed to connect to the evaluation server. Please try again.": "Evaluation server se connect hone mein fail. Kripya phir se try karein."
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('app_language');
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'gu' || saved === 'hinglish')) {
      setLanguageState(saved as Language);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string, variables?: Record<string, string | number>): string => {
    let result = translations[language][key];
    if (!result) {
      result = translations['en'][key] || key;
    }
    
    if (variables) {
      Object.keys(variables).forEach(k => {
        result = result.replace(new RegExp(`{${k}}`, 'g'), String(variables[k]));
      });
    }
    
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
