// content.js
// NeonHack Academy curriculum (neon style).
// Local PDF references:
// - /mnt/data/Hacking - The Art of Exploitation, 2nd Edition by Jon Erickson.pdf
// - /mnt/data/Penetration Testing A Hands-On Introduction to Hacking by Georgia Weidman.pdf
// - /mnt/data/The Shellcoder's Handbook - Discovering and Exploiting Security Holes by Chris Anley, John Heasman, Felix Lindner and Gerardo Richarte.pdf

const curriculum = [
  // MODULE 1 - COMPUTER SCIENCE FOUNDATIONS
  {
    id: "foundations",
    title: "1. Computer Science Foundations",
    description: "Non-negotiable fundamentals: architecture, OS internals, DS&A, scripting, programming, virtualization.",
    lessons: [
      {
        id: "cs-arch",
        title: "CPU, Registers & Memory Layout",
        objectives: [
          "Understand CPU registers and instruction pointer behavior",
          "Stack vs heap: allocation, lifetime and overflow mechanics",
          "Endianness and how it affects binary data"
        ],
        theory: `
          Every program interacts with hardware through memory and CPU registers.
          The instruction pointer (EIP/RIP) determines which instruction executes next.
          When a function is called, return addresses and local variables sit on the stack.
          If input overwrites the saved return address, you can change execution flow.
          Heap memory is used for dynamic allocation — leaks and corruptions here require different techniques.
        `,
        codeSamples: [
          {
            language: "C",
            code: `// simple buffer example (lab only)
#include <stdio.h>
#include <string.h>
int vuln(char *s){
  char buf[64];
  strcpy(buf, s); // unsafe copy - source of stack overflow
  return 0;
}
int main(int argc,char **argv){ if(argc>1) vuln(argv[1]); return 0; }`
          }
        ],
        labs: [
          {
            title: "Lab: Inspect stack & saved return address",
            steps: [
              "Compile with: gcc -g -fno-stack-protector -z execstack vuln.c -o vuln",
              "Run in gdb: gdb ./vuln",
              "Set a breakpoint in vuln, run with a long argument, examine `$rbp` and memory around it with `x/64x $rbp-80`",
              "Observe where the return address is stored and calculate overflow offset"
            ],
            expected: "Identify buffer location and offset to saved RIP/EIP"
          }
        ],
        reading: [
          {
            file: "Erickson",
            path: "./Hacking - The Art of Exploitation, 2nd Edition by Jon Erickson.pdf",
            startPage: 115 // Page number for Memory/Assembly
          },
          {
            file: "Shellcoder",
            path: "./The Shellcoder's Handbook - Discovering and Exploiting Security Holes by Chris Anley, John Heasman, Felix Lindner and Gerardo Richarte.pdf",
            startPage: 42 // Page number for Stack internals
          }
        ],
        quiz: [
          {
            q: "What is the main difference between stack and heap?",
            options: [
              "Stack is LIFO allocated, heap is dynamic allocated",
              "Stack is persistent across reboots",
              "Heap executes instructions",
              "Stack holds only kernel data"
            ],
            a: 0
          }
        ]
      },

      {
        id: "cs-os",
        title: "Operating Systems Internals",
        objectives: [
          "System calls and context switches",
          "User vs kernel mode privileges",
          "Common exploit mitigations: ASLR, DEP/NX, stack canaries"
        ],
        theory: `
          User processes request services from kernel through syscalls (int 0x80 / syscall).
          Kernel mode has higher privilege; a bug there can lead to system-wide compromise.
          Modern OSs force mitigations: ASLR randomizes addresses, DEP marks pages non-executable, stack canaries detect overflows.
          Knowing these allows you to craft bypass techniques: info leaks defeat ASLR, ROP bypasses DEP.
        `,
        labs: [
          {
            title: "Lab: Observe ASLR and disable for experiment",
            steps: [
              "Check ASLR: cat /proc/sys/kernel/randomize_va_space",
              "Run a small app and inspect /proc/<pid>/maps for base addresses",
              "Temporarily disable for reproducible testing: echo 0 | sudo tee /proc/sys/kernel/randomize_va_space"
            ],
            expected: "Addresses stop changing between runs when ASLR is disabled"
          }
        ],
        reading: [
          {
            file: "Shellcoder",
            path: "./The Shellcoder's Handbook - Discovering and Exploiting Security Holes by Chris Anley, John Heasman, Felix Lindner and Gerardo Richarte.pdf",
            pages: "OS internals & mitigations",
            startPage: 1 // TODO: Update this to the exact page number
          }
        ],
        quiz: [
          {
            q: "Which mitigation makes executing code in writable pages fail?",
            options: ["ASLR", "DEP/NX", "Canaries", "PIE"],
            a: 1
          }
        ]
      },

      {
        id: "cs-dsa",
        title: "Data Structures & Algorithms for Security",
        objectives: [
          "Graphs for attack path analysis",
          "Hash tables for fast lookup",
          "Sorting & complexity basics for scanners"
        ],
        theory: `
          Practical pentesting tools rely on algorithmic efficiency: port scanners, graph traversal, and pattern matching.
          Implement BFS/DFS for service discovery graphs; hash maps to deduplicate hosts and services; sort to prioritize targets.
        `,
        labs: [
          {
            title: "Lab: Build a tiny port-scanner result aggregator",
            steps: [
              "Run basic nmap scan and export XML",
              "Parse XML with Python and store services in a dict keyed by host",
              "Produce a prioritized list of hosts by number of high-risk ports"
            ],
            expected: "Script that reads nmap output and ranks targets"
          }
        ],
        reading: []
      },

      {
        id: "cs-scripting",
        title: "Scripting & Programming (Python, C, Bash, PowerShell)",
        objectives: [
          "Python for automation and parsing",
          "C for low-level exploits & shellcode understanding",
          "Bash/PowerShell for quick automation and ops"
        ],
        theory: `
          Python is the glue for pentesting: wrappers around nmap, requests, JSON parsing.
          C teaches you memory layout and is necessary to write compact shellcode or understand manual heap manipulations.
          PowerShell is the Swiss Army knife on Windows for discovery, persistence or defensive testing.
        `,
        labs: [
          {
            title: "Lab: Simple Python recon script",
            steps: [
              "Write Python script to run nmap -sV -oX output.xml",
              "Parse output.xml and list hosts with Apache servers",
              "Save results to reconnaissance.json"
            ],
            expected: "Automation pipeline for scanning and reporting"
          }
        ],
        reading: []
      }
    ]
  },

  // MODULE 2 - LINUX & WINDOWS MASTERY
  {
    id: "os-mastery",
    title: "2. Linux & Windows Mastery",
    description: "Hands-on admin knowledge, logs, AD, registry, tokens and process internals.",
    lessons: [
      {
        id: "linux-core",
        title: "Linux Internals - Permissions, Services, Logs",
        objectives: [
          "Filesystem permissions and SUID & SGID implications",
          "Systemd units & service debugging",
          "Syslog/journal analysis for forensics"
        ],
        theory: `
          Filesystem permissions (user/group/others) govern access. SUID can escalate privileges when misused.
          Systemd units replace init scripts - understanding unit files and journalctl is essential for troubleshooting.
          Logs are the defenders' breadcrumbs: reading syslog and journalctl reveals persistence and lateral movement attempts.
        `,
        labs: [
          {
            title: "Lab: Find SUID binaries and analyze a candidate",
            steps: [
              "Run: sudo find / -perm -4000 -type f 2>/dev/null",
              "Pick a candidate and analyze source or behavior in a sandbox",
              "Test potential exploitation vector in an isolated VM"
            ],
            expected: "A report describing if a binary can be abused for privilege escalation"
          }
        ],
        reading: [
          {
            file: "Weidman",
            path: "./Penetration Testing A Hands-On Introduction to Hacking by Georgia Weidman.pdf",
            pages: "Linux chapters",
            startPage: 1 // TODO: Update page
          }
        ]
      },

      {
        id: "windows-core",
        title: "Windows Internals & AD Fundamentals",
        objectives: [
          "Registry hives and persistence patterns",
          "Event logs & detection",
          "Active Directory structure, Kerberos basics, GPO"
        ],
        theory: `
          The Windows registry stores configuration for software and system behavior; attackers misuse Run keys for persistence.
          AD organizes users/computers into domains - understanding users, groups, trusts and Kerberos ticketing is central to AD attacks and defense.
        `,
        labs: [
          {
            title: "Lab: Collect AD info using PowerShell (lab domain only)",
            steps: [
              "In lab, use Get-ADUser/Get-ADComputer to collect basic AD inventory",
              "Export to CSV and visualize with a small script",
              "Look for users with password never expires or service accounts"
            ],
            expected: "AD inventory highlighting risky accounts"
          }
        ],
        reading: [
          {
            file: "Weidman",
            path: "./Penetration Testing A Hands-On Introduction to Hacking by Georgia Weidman.pdf",
            pages: "Windows & AD chapters",
            startPage: 1 // TODO: Update page
          }
        ]
      }
    ]
  },

  // MODULE 3 - NETWORKS + PROTOCOLS
  {
    id: "networks",
    title: "3. Networking & Protocols",
    description: "Deep network protocol mastery: TCP/UDP/TLS/DNS/SMB/SSH/RDP/VPNs and packet inspection.",
    lessons: [
      {
        id: "tcp-ip",
        title: "TCP/IP & Packet Anatomy",
        objectives: [
          "Understand the 3-way handshake and TCP flags",
          "IP headers, fragmentation, MTU and reassembly",
          "Use Wireshark/tcpdump for analysis"
        ],
        theory: `
          Packets are structured frames. TCP ensures reliability with seq/ack; understanding retransmissions is crucial for performance/fingerprinting.
          Fragmentation happens when MTU is smaller than payload; fragment offsets and reassembly fields are important for certain attack vectors.
        `,
        labs: [
          {
            title: "Lab: Capture and analyze a TCP handshake",
            steps: [
              "Use tcpdump on port 80 while visiting a HTTP site",
              "Open pcap in Wireshark and follow the TCP stream"
            ],
            expected: "Identify SYN,SYN-ACK,ACK and payload segments"
          }
        ],
        reading: [
          {
            file: "Erickson",
            path: "./Hacking - The Art of Exploitation, 2nd Edition by Jon Erickson.pdf",
            pages: "Networking chapters",
            startPage: 1 // TODO: Update page
          }
        ]
      },

      {
        id: "tls-http",
        title: "HTTP, TLS & Certificate Trust",
        objectives: [
          "TLS handshake and certificate validation",
          "How to inspect and debug certificate issues",
          "Understanding MITM indicators and how to verify"
        ],
        theory: `
          TLS creates an encrypted channel via handshake and key exchange. Certificate chains prove identity through trusted CAs.
          Misconfigured certs or self-signed certs are frequent sources of 'not private' warnings and can indicate MITM in untrusted networks.
        `,
        labs: [
          {
            title: "Lab: Use openssl s_client to inspect a server certificate",
            steps: [
              "openssl s_client -connect example.com:443 -showcerts",
              "Analyze expiry, CN, SAN and chain"
            ],
            expected: "A clear report of certificate validity"
          }
        ],
        reading: [
          {
            file: "Weidman",
            path: "./Penetration Testing A Hands-On Introduction to Hacking by Georgia Weidman.pdf",
            pages: "Web & TLS sections",
            startPage: 1 // TODO: Update page
          }
        ]
      }
    ]
  },

  // MODULE 4 - WEB APPLICATION SECURITY
  {
    id: "web",
    title: "4. Web Application Security",
    description: "OWASP Top 10 plus advanced topics: SQLi, XSS, SSRF, CSRF, deserialization, GraphQL, API auth.",
    lessons: [
      {
        id: "sqli",
        title: "SQL Injection - Detection & Exploitation (fully explained)",
        objectives: [
          "Understand how user input creates SQL queries",
          "Blind vs error-based vs union-based vs time-based SQLi",
          "Defensive coding & parameterized queries"
        ],
        theory: `
          SQLi occurs when untrusted input is concatenated into an SQL statement. Attackers manipulate query logic to extract data, escalate privileges, or write to the DB.
          There are multiple exploitation styles:
            - Error-based: cause SQL errors that reveal schema info
            - Union-based: append UNION SELECT to merge query results
            - Time-based blind: cause delays to infer true/false
          The defense is consistent: never assemble SQL with raw input - use parameterized queries/ORM or strong input validation.
        `,
        labs: [
          {
            title: "Lab: Hands-on SQLi with DVWA",
            steps: [
              "Deploy DVWA in a local VM",
              "Use a targeted payload to find exploitable parameters",
              "Use sqlmap in detection mode and then manual payloads to extract a small table"
            ],
            expected: "Proof-of-concept that extracts a single column from a target table"
          }
        ],
        reading: [
          {
            file: "Weidman",
            path: "./Penetration Testing A Hands-On Introduction to Hacking by Georgia Weidman.pdf",
            pages: "SQLi and Web chapters",
            startPage: 1 // TODO: Update page
          }
        ],
        quiz: [
          {
            q: "Which defense prevents SQL injection reliably?",
            options: [
              "String replacement",
              "Parameterized queries (prepared statements)",
              "Input trimming",
              "Client-side validation only"
            ],
            a: 1
          }
        ]
      },

      {
        id: "xss",
        title: "Cross Site Scripting (XSS) - Types & Prevention",
        objectives: [
          "Stored vs reflected vs DOM XSS",
          "Why CSP and proper escaping stop XSS",
          "How to craft safe payloads for testing"
        ],
        theory: `
          XSS injects JavaScript into victims' browsers. Stored XSS is persisted and most dangerous; reflected XSS needs a crafted link; DOM XSS arises purely in client-side DOM handling.
          Defense requires correct output encoding, Content Security Policy (CSP), and input sanitation where appropriate.
        `,
        labs: [
          {
            title: "Lab: Test stored XSS vulnerability",
            steps: [
              "Install Juice Shop",
              "Find an input that stores user data (comments)",
              "Insert a safe exfil payload to demonstrate cookie theft (lab-only)"
            ],
            expected: "Demonstrate exfil via controlled environment"
          }
        ]
      }
    ],
    tools: ["Burp Suite", "FFUF", "SQLmap", "Nmap", "Dirsearch"]
  },

  // MODULES 5-15 scaffolds
  {
    id: "network-pentest",
    title: "5. Network Pentesting",
    description: "Scanning, enumeration, pivoting, lateral movement.",
    lessons: [ /* scaffolded lessons */ ],
    tools: ["Nmap","Masscan","Impacket","CrackMapExec"]
  },
  {
    id: "active-directory",
    title: "6. Active Directory Attacks",
    description: "Kerberoast, PTHash, Golden Ticket, BloodHound mapping.",
    lessons: [ /* scaffolded lessons */ ],
    tools: ["Impacket","Rubeus","Mimikatz","BloodHound","SharpHound"]
  },
  {
    id: "exploit-development",
    title: "7. Exploit Development",
    description: "Memory corruption, ROP, shellcode, reverse engineering.",
    lessons: [ /* scaffolded */ ],
    tools: ["gdb","pwntools","Ghidra","radare2"]
  },
  {
    id: "malware-evasion",
    title: "8. Malware & Evasion",
    description: "In-memory loaders, process injection, packing - lab-only.",
    lessons: [ /* scaffolded */ ],
    tools: ["Procmon","Sysmon","Donut","YARA"]
  },
  {
    id: "red-team",
    title: "9. Red Teaming",
    description: "Infra, OPSEC, C2 frameworks, full-adversary emulation.",
    lessons: [ /* scaffolded */ ],
    tools: ["Cobalt Strike (licensed)","Sliver","Havoc"]
  },
  {
    id: "cloud",
    title: "10. Cloud Hacking",
    description: "IAM, metadata SSRF, serverless and container attacks.",
    lessons: [ /* scaffolded */ ],
    tools: ["awscli","gcloud","kubectl"]
  },
  {
    id: "mobile",
    title: "11. Mobile Hacking",
    description: "Android/iOS reversing, Frida instrumentation.",
    lessons: [ /* scaffolded */ ],
    tools: ["apktool","jadx","Frida"]
  },
  {
    id: "wireless",
    title: "12. Wireless Hacking",
    description: "WPA2/3, PMKID, evil twin and BLE issues.",
    lessons: [ /* scaffolded */ ],
    tools: ["hcxdumptool","aircrack-ng","bettercap"]
  },
  {
    id: "crypto",
    title: "13. Crypto & Stego",
    description: "AES modes, padding oracles, hashing, steganography",
    lessons: [ /* scaffolded */ ],
    tools: ["openssl","hashcat","stegseek"]
  },
  {
    id: "blue",
    title: "14. DFIR & Blue Team",
    description: "SIEM, logs, memory forensics, incident response.",
    lessons: [ /* scaffolded */ ],
    tools: ["Splunk","ELK","Volatility","YARA"]
  },
  {
    id: "soft",
    title: "15. Soft Skills",
    description: "Report writing, communication, OPSEC, portfolio building.",
    lessons: [ /* scaffolded */ ]
  }
];

// export for browser and node
if (typeof module !== "undefined" && module.exports) {
  module.exports = { curriculum };
} else {
  window.curriculum = curriculum;
}