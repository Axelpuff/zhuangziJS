// philosophers.js

export const schools = [
  {
    id: "confucian",
    name: "Confucian/Rujia",
    chineseName: "...",
    color: "vermillion",
  },
  {
    id: "mohist",
    name: "Mohist",
    chineseName: "...",
    color: "gray",
  },
  {
    id: "yangist",
    name: "Yangist",
    chineseName: "...",
    color: "green",
  },
  {
    id: "daoist",
    name: "Daoist",
    chineseName: "...",
    color: "blue",
  },
  {
    id: "legalist",
    name: "Legalist",
    chineseName: "...",
    color: "gold",
  },
  {
    id: "mingjia",
    name: "School of Names",
    chineseName: "...",
    color: "white",
  }
  // ... more schools
]

export const philosophers = [
  {
    id: "confucius",
    name: "Confucius",
    chineseName: "孔子",            // Optional but useful for UI
    school: "confucian",            // Used to derive color + legend
    major: true,                    // Distinguish scope/importance
    timePosition: 600,              // Chronological time, determines position along zither strings in the neutral view
    string: 3,                      // String to display on in neutral view

    // Perspective-specific target layouts
    // Only Mencius and Xunzi will have full entries initially.
    // (This is a tentative way of handling this since it adds extra coupling)
    focusLayouts: {
      // e.g., where this philosopher *moves to* when Mencius is selected
      mencius: {
        targetPosition: [x, y, z],
        fade: 1.0,                  // 1 = fully visible, 0 = faded out
        scale: 1.0                  // For emphasis or de-emphasis
      },
      xunzi: {
        targetPosition: [x, y, z],
        fade: 0.5,
        scale: 0.9
      }
    },

    // Current descriptions are stubs
    keyTerms: [
      {
        term: "德",
        pinyin: "dé",
        description: "Virtue, moral charisma, cultivated through ritual practice."
      },
      {
        term: "道",
        pinyin: "dào",
        description: "The Way; a tradition transmitted from antiquity."
      }
    ],

    quote: "I transmit but do not innovate. I trust and love the ancients.",

    relationships: [
      {
        targetId: "odes",
        kind: "buildsOn",
        tone: "positive",        // positive | negative | mixed | playful | ambiguous
        strength: 0.8,             // 0–1; could drive line opacity or thickness
        notes: "Confucius places the odes as one of the main documents of culture."
      },
    ],

    imageRefs: [
      "assets/images/confucius_rubbing.jpg",
      "assets/images/bronze_inscription.jpg"
    ]
  },
  {
    id: "zhuangzi",
    name: "Zhuangzi",
    chineseName: "莊子",
    school: "daoist",
    major: true,
    timePosition: 320,
    string: 3,

    // How this orb behaves when *others* are the perspective
    focusLayouts: {
      xunzi:   { targetPosition: [x, y, z], fade: 0.4, scale: 0.8 }
      // etc.
    },

    /**
     * 1) Generic graph-like relationships (directional, labeled edges)
     */
    relationships: [
      {
        targetId: "laozi",
        kind: "buildsOn",          // e.g. buildsOn | critiques | parodies | playsWith
        tone: "respectful",        // positive | negative | mixed | playful | ambiguous
        strength: 0.5,             // 0–1; could drive line opacity or thickness
        notes: "Often riffing on Daodejing themes but more playful."
      },
      {
        targetId: "confucius",
        kind: "playsWithCharacter",
        tone: "playful",
        strength: 0.7,
        notes: "Uses Kongzi as a foil in stories."
      },
      {
        targetId: "huizi",
        kind: "friendRival",
        tone: "affectionate",
        strength: 0.9,
        notes: "Intellectual sparring partner; deep respect and teasing."
      }
    ],

    /**
     * 2) Perspective-specific “view” data:
     * what it looks like when *this* philosopher is the perspective
     * and you click on someone else.
     */
    views: {
      huizi: {
        quote: "Master Bright Works playing his lute, Huizi leaning at his desk...",
        explanation:
          "Zhuangzi treats Huizi as a brilliant but anxious logician—someone he respects deeply " +
          "but also thinks is trapped in distinctions and argument.",
        visualHint: {
          emphasis: 1.3,          // extra scale or brightness for Huizi in Zhuangzi-view
          connectionStyle: "loop",// e.g. you might pick a special line style between them
          proximityBias: -0.2     // maybe pull Huizi slightly closer / farther in layout
        }
      },
      confucius: {
        quote: "This would make Huang Di’s ears ring. How could Kongzi understand it?",
        explanation:
          "Kongzi becomes a kind of straight man or foil—worthy but limited, bound to names and rituals.",
        visualHint: {
          emphasis: 1.1,
          connectionStyle: "zigzag"
        }
      }
      // …other targets from Zhuangzi’s perspective if you want
    },

    keyTerms: [
      { term: "道", pinyin: "dào", description: "The wandering, shifting Way beyond fixed distinctions." }
    ],

    quote: "There is nothing that is not 'that'; there is nothing that is not 'this'.",
    imageRefs: [
      "assets/images/zhuangzi_bamboo_slip.jpg"
    ]
  },

  // Huizi entry might have his *own* relationships + views, independently:
  {
    id: "huizi",
    name: "Huizi",
    chineseName: "惠子",
    school: "mingjia",
    major: false,
    // basePosition: [x2, y2, z2],
    relationships: [
    //   { targetId: "zhuangzi", kind: "debates", tone: "mixed", strength: 0.9 }
    ],
    views: {
    //   zhuangzi: {
    //     quote: "You are not a fish; how do you know the joy of fish?",
    //     explanation:
    //       "From Huizi’s standpoint, Zhuangzi’s appeals to knowing are suspect; he pushes for stricter logic.",
    //     visualHint: { emphasis: 1.2, connectionStyle: "cross" }
    //   }
    }
  }
  // … repeat objects for Mozi, Mencius, Laozi, Zhuangzi, Xunzi, etc.
];