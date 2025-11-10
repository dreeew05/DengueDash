export function VectorBackground() {
  return (
    <div className="absolute inset-0 z-0">
      {/* Main background color is set in the parent component */}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-900/50 to-transparent"></div>

      {/* Animated dots */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-1/4 top-1/4 h-2 w-2 rounded-full bg-white"></div>
        <div className="absolute left-3/4 top-1/3 h-3 w-3 rounded-full bg-white"></div>
        <div className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-white"></div>
        <div className="absolute left-1/5 top-2/3 h-2 w-2 rounded-full bg-white"></div>
        <div className="absolute left-4/5 top-3/4 h-3 w-3 rounded-full bg-white"></div>
      </div>

      {/* Vector patterns */}
      <svg
        className="absolute inset-0 h-full w-full opacity-10"
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hexagonal grid pattern - representing molecular/cellular structure */}
        <g stroke="white" strokeWidth="1" fill="none">
          {Array.from({ length: 10 }).map((_, i) => (
            <g key={`hex-row-${i}`}>
              {Array.from({ length: 10 }).map((_, j) => {
                const x = j * 100 + (i % 2) * 50;
                const y = i * 86.6;
                return (
                  <path
                    key={`hex-${i}-${j}`}
                    d={`M${x},${y + 50} L${x + 50},${y} L${x + 100},${y + 50} L${x + 100},${y + 100} L${x + 50},${y + 150} L${x},${y + 100} Z`}
                  />
                );
              })}
            </g>
          ))}
        </g>

        {/* Data visualization elements */}
        <g stroke="white" strokeWidth="2" fill="none">
          {/* Line chart */}
          <path d="M100,800 L200,750 L300,780 L400,720 L500,740 L600,690 L700,710 L800,650 L900,670" />

          {/* Bar chart */}
          <rect x="100" y="600" width="30" height="100" strokeWidth="1" />
          <rect x="150" y="550" width="30" height="150" strokeWidth="1" />
          <rect x="200" y="580" width="30" height="120" strokeWidth="1" />
          <rect x="250" y="530" width="30" height="170" strokeWidth="1" />
          <rect x="300" y="560" width="30" height="140" strokeWidth="1" />
        </g>

        {/* Mosquito silhouette - subtle representation */}
        <g
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
          transform="translate(700, 300) scale(0.15)"
        >
          <path d="M200,200 C250,150 300,180 350,150 C400,120 420,80 450,50 C480,20 520,10 550,30 C580,50 590,90 570,120 C550,150 520,160 490,150 C460,140 440,120 410,150 C380,180 330,150 280,200 L200,200 Z" />
          <path d="M200,200 C150,250 180,300 150,350 C120,400 80,420 50,450 C20,480 10,520 30,550 C50,580 90,590 120,570 C150,550 160,520 150,490 C140,460 120,440 150,410 C180,380 150,330 200,280 L200,200 Z" />
          <ellipse cx="200" cy="200" rx="30" ry="20" />
          <path d="M230,200 C260,210 290,230 320,220 C350,210 370,190 400,200" />
          <path d="M170,200 C140,210 110,230 80,220 C50,210 30,190 0,200" />
        </g>

        {/* World map outline - very subtle in background */}
        <path
          d="M150,300 C200,280 250,290 300,270 C350,250 400,260 450,240 C500,220 550,230 600,210 C650,190 700,200 750,180 C800,160 850,170 900,150"
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0.3"
        />
      </svg>

      {/* Additional decorative elements */}
      <div className="absolute right-10 bottom-10">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="60"
            cy="60"
            r="59"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.3"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke="white"
            strokeWidth="1"
            opacity="0.2"
          />
          <circle
            cx="60"
            cy="60"
            r="30"
            stroke="white"
            strokeWidth="1"
            opacity="0.1"
          />
        </svg>
      </div>
    </div>
  );
}
