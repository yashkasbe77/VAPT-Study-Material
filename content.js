// content.js - Corrected & Verified
const curriculum = [
  // MODULE 1 - COMPUTER SCIENCE FOUNDATIONS
  {
    id: "foundations",
    title: "1. Computer Science Foundations",
    description: "Fundamentals: architecture, OS, and memory.",
    lessons: [
      {
        id: "cs-arch",
        title: "CPU, Registers & Memory",
        objectives: ["CPU registers", "Stack vs Heap", "Endianness"],
        theory: "Programs interact with hardware through memory/registers. EIP/RIP controls execution. Stack holds local vars; Heap is dynamic.",
        codeSamples: [],
        labs: [],
        reading: [
          {
            file: "Erickson",
            path: "./Hacking - The Art of Exploitation, 2nd Edition by Jon Erickson.pdf",
            startPage: 115
          },
          {
            file: "Shellcoder",
            path: "./The Shellcoder's Handbook - Discovering and Exploiting Security Holes by Chris Anley, John Heasman, Felix Lindner and Gerardo Richarte.pdf",
            startPage: 42
          }
        ],
        quiz: [{q: "Stack is?", options: ["LIFO", "FIFO"], a: 0}]
      },
      {
        id: "cs-os",
        title: "Operating Systems",
        objectives: ["Syscalls", "Kernel Mode", "Mitigations"],
        theory: "Kernel has high privilege. ASLR/DEP prevent exploits.",
        reading: [
          {
             file: "Shellcoder",
             path: "./The Shellcoder's Handbook - Discovering and Exploiting Security Holes by Chris Anley, John Heasman, Felix Lindner and Gerardo Richarte.pdf",
             startPage: 1
          }
        ]
      }
    ]
  },
  {
    id: "web",
    title: "4. Web Security",
    description: "OWASP Top 10, SQLi, XSS.",
    lessons: [
       {
         id: "sqli",
         title: "SQL Injection",
         theory: "SQLi occurs when input is concatenated into queries.",
         reading: [
            {
               file: "Weidman",
               path: "./Penetration Testing A Hands-On Introduction to Hacking by Georgia Weidman.pdf",
               startPage: 1
            }
         ]
       }
    ]
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { curriculum };
} else {
  window.curriculum = curriculum;
}
