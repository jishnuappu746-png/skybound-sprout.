(() => {
  'use strict';

  const W = 960, H = 540, GRAVITY = 1450;
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  ctx.scale(DPR, DPR);
  ctx.imageSmoothingEnabled = true;
  const $ = (selector) => document.querySelector(selector);
  const ui = {
    hud: $('#hud'), level: $('#hud-level'), coins: $('#hud-coins'), lives: $('#hud-lives'), score: $('#hud-score'),
    timer: $('#hud-timer'), hearts: $('#health-hearts'), bossHud: $('#boss-hud'), bossHealth: $('#boss-health'),
    menu: $('#main-menu'), pause: $('#pause-screen'), info: $('#info-screen'), levels: $('#level-screen'), result: $('#result-screen'),
    mobile: $('#mobile-controls'), touchHint: $('#touch-hint'), toast: $('#toast'),
  };

  const levelBook = [
    { name: 'Sunpetal Meadow', short: 'MEADOW', icon: '🌼', sky: ['#75d4f2','#ddf5d4'], groundColor: '#69bf79', earth: '#945f4b', theme: 'meadow', width: 3400, time: 300,
      spawn: { x: 70, y: 420 }, goal: 3260,
      ground: [[0,780,475],[880,1590,475],[1690,2470,475],[2570,3400,475]],
      platforms: [[340,382,155],[555,315,132],[790,390,130],[1010,350,138],[1220,285,125],[1470,370,145],[1730,315,130],[1940,250,140],[2160,350,155],[2440,290,150],[2690,370,145],[2940,300,130]],
      blocks: [{x:235,y:388,type:'question',item:'coin'},{x:665,y:228,type:'question',item:'mushroom'},{x:1100,y:263,type:'brick'},{x:1126,y:263,type:'question',item:'coin'},{x:2020,y:163,type:'question',item:'fire'},{x:2790,y:283,type:'question',item:'star'}],
      pipes: [[1340,415,68,60],[2380,415,76,60]], hazards: [{x:790,y:478,w:90,h:62,type:'water'},{x:1590,y:478,w:100,h:62,type:'water'},{x:2470,y:478,w:100,h:62,type:'water'}],
      moving: [{x:1660,y:390,w:96,h:17,from:1635,to:1800,speed:62,axis:'x'}],
      enemies: [{x:470,y:420,type:'walker',from:410,to:545},{x:970,y:420,type:'walker',from:920,to:1100},{x:1510,y:420,type:'turtle',from:1430,to:1570},{x:2240,y:420,type:'hopper',from:2160,to:2350},{x:2820,y:420,type:'walker',from:2760,to:2900}],
      coins: [[175,425],[220,420],[350,340],[382,340],[414,340],[580,274],[616,274],[744,350],[865,410],[1015,315],[1050,315],[1085,315],[1230,250],[1270,250],[1440,330],[1655,365],[1690,340],[1725,320],[1950,215],[1985,215],[2020,215],[2190,310],[2225,310],[2440,250],[2480,250],[2700,330],[2960,260],[3000,260]],
      powerups: [{x:1860,y:420,type:'life'},{x:2540,y:420,type:'star'}], checkpoint: 1760 },
    { name: 'Mushroom Canopy', short: 'CANOPY', icon: '🍄', sky: ['#8bdbef','#d7f2d5'], groundColor: '#559d69', earth: '#775442', theme: 'forest', width: 3600, time: 280,
      spawn: { x: 65, y: 420 }, goal: 3460,
      ground: [[0,650,475],[760,1340,475],[1460,2160,475],[2270,2930,475],[3030,3600,475]],
      platforms: [[245,365,120],[430,290,135],[665,350,100],[820,280,115],[1010,210,112],[1200,340,115],[1450,370,120],[1640,300,112],[1830,230,135],[2050,330,120],[2280,380,115],[2460,295,115],[2650,215,130],[2860,335,115],[3100,365,130],[3280,280,120]],
      blocks: [{x:500,y:203,type:'question',item:'mushroom'},{x:1085,y:123,type:'question',item:'coin'},{x:1880,y:143,type:'question',item:'fire'},{x:2720,y:128,type:'question',item:'coin'},{x:3200,y:278,type:'question',item:'life'}],
      pipes: [[1370,405,58,70],[2960,405,60,70]], hazards: [{x:650,y:478,w:110,h:62,type:'water'},{x:1340,y:478,w:120,h:62,type:'water'},{x:2160,y:478,w:110,h:62,type:'water'},{x:2930,y:478,w:100,h:62,type:'water'}],
      moving: [{x:680,y:380,w:88,h:16,from:650,to:820,speed:80,axis:'x'},{x:2170,y:390,w:100,h:16,from:2140,to:2300,speed:68,axis:'x'},{x:2950,y:350,w:90,h:16,from:330,to:400,speed:72,axis:'y'}],
      enemies: [{x:355,y:325,type:'flyer',from:295,to:520},{x:900,y:240,type:'flyer',from:820,to:1020},{x:1260,y:300,type:'hopper',from:1180,to:1320},{x:1750,y:260,type:'turtle',from:1640,to:1810},{x:2380,y:340,type:'flyer',from:2290,to:2520},{x:2800,y:420,type:'hopper',from:2710,to:2900},{x:3200,y:235,type:'flyer',from:3100,to:3370}],
      coins: [[245,330],[280,330],[430,255],[470,255],[510,255],[830,245],[870,245],[1030,175],[1065,175],[1200,305],[1240,305],[1510,335],[1660,265],[1700,265],[1850,195],[1890,195],[2050,295],[2300,345],[2340,345],[2470,260],[2510,260],[2670,180],[2710,180],[2870,300],[3110,330],[3150,330],[3290,245],[3330,245]],
      powerups: [{x:1420,y:420,type:'star'},{x:2580,y:420,type:'life'}], checkpoint: 1830 },
    { name: 'Glimmerdeep Grotto', short: 'GROTTO', icon: '💎', sky: ['#172b47','#55476f'], groundColor: '#665377', earth: '#473952', theme: 'cave', width: 3450, time: 260,
      spawn: { x: 65, y: 420 }, goal: 3310,
      ground: [[0,620,475],[720,1290,475],[1410,2070,475],[2200,2740,475],[2860,3450,475]],
      platforms: [[200,375,120],[390,300,120],[610,365,105],[780,280,120],[965,205,115],[1135,320,120],[1430,370,120],[1605,285,120],[1790,210,125],[1990,330,120],[2210,370,120],[2390,285,120],[2570,205,125],[2780,330,120],[3000,365,125],[3170,275,120]],
      blocks: [{x:430,y:213,type:'question',item:'coin'},{x:1000,y:118,type:'question',item:'star'},{x:1670,y:198,type:'brick'},{x:1820,y:123,type:'question',item:'fire'},{x:2430,y:198,type:'question',item:'coin'},{x:3210,y:188,type:'question',item:'mushroom'}],
      pipes: [], hazards: [{x:620,y:478,w:100,h:62,type:'spikes'},{x:1290,y:478,w:120,h:62,type:'spikes'},{x:2070,y:478,w:130,h:62,type:'water'},{x:2740,y:478,w:120,h:62,type:'spikes'}],
      moving: [{x:1295,y:390,w:100,h:15,from:1270,to:1420,speed:72,axis:'x'},{x:2080,y:365,w:100,h:15,from:2050,to:2220,speed:86,axis:'x'},{x:2745,y:390,w:96,h:15,from:365,to:418,speed:75,axis:'y'}],
      enemies: [{x:315,y:335,type:'walker',from:250,to:375},{x:840,y:240,type:'hopper',from:780,to:900},{x:1170,y:280,type:'flyer',from:1100,to:1280},{x:1540,y:330,type:'walker',from:1460,to:1590},{x:1870,y:170,type:'flyer',from:1800,to:1970},{x:2470,y:245,type:'hopper',from:2380,to:2540},{x:3060,y:325,type:'turtle',from:2990,to:3150}],
      coins: [[220,340],[255,340],[390,265],[425,265],[610,330],[800,245],[835,245],[980,170],[1015,170],[1150,285],[1190,285],[1450,335],[1615,250],[1650,250],[1800,175],[1835,175],[2000,295],[2225,335],[2260,335],[2400,250],[2440,250],[2580,170],[2620,170],[2790,295],[3020,330],[3060,330],[3180,240],[3220,240]],
      powerups: [{x:1360,y:420,type:'life'},{x:2900,y:420,type:'star'}], checkpoint: 1790 },
    { name: 'Cinderpeak Keep', short: 'KEEP', icon: '🔥', sky: ['#f4a978','#773e58'], groundColor: '#8b5550', earth: '#563e49', theme: 'lava', width: 3700, time: 250,
      spawn: { x: 65, y: 420 }, goal: 3560,
      ground: [[0,610,475],[710,1260,475],[1370,1900,475],[2020,2580,475],[2700,3200,475],[3330,3700,475]],
      platforms: [[180,365,115],[365,285,115],[575,355,100],[735,285,110],[915,205,110],[1085,320,115],[1390,365,115],[1560,280,115],[1740,195,120],[1930,315,110],[2050,370,110],[2220,285,115],[2400,200,115],[2590,315,110],[2730,365,115],[2900,280,115],[3080,195,120],[3260,315,110],[3380,365,115],[3500,280,120]],
      blocks: [{x:400,y:198,type:'question',item:'fire'},{x:940,y:118,type:'question',item:'coin'},{x:1600,y:193,type:'question',item:'mushroom'},{x:2300,y:198,type:'question',item:'star'},{x:2960,y:193,type:'brick'},{x:3450,y:278,type:'question',item:'life'}],
      pipes: [[1280,410,58,65],[2620,410,62,65]], hazards: [{x:610,y:478,w:100,h:62,type:'lava'},{x:1260,y:478,w:110,h:62,type:'lava'},{x:1900,y:478,w:120,h:62,type:'lava'},{x:2580,y:478,w:120,h:62,type:'lava'},{x:3200,y:478,w:130,h:62,type:'lava'}],
      moving: [{x:620,y:393,w:95,h:15,from:600,to:730,speed:80,axis:'x'},{x:1900,y:365,w:105,h:15,from:1880,to:2040,speed:90,axis:'x'},{x:3205,y:390,w:100,h:15,from:370,to:425,speed:83,axis:'y'}],
      enemies: [{x:285,y:325,type:'walker',from:210,to:340},{x:800,y:240,type:'flyer',from:740,to:920},{x:1120,y:285,type:'hopper',from:1080,to:1230},{x:1490,y:325,type:'turtle',from:1400,to:1550},{x:1810,y:160,type:'flyer',from:1740,to:1890},{x:2300,y:245,type:'hopper',from:2210,to:2390},{x:2820,y:325,type:'walker',from:2750,to:2890},{x:3120,y:160,type:'flyer',from:3060,to:3230},{x:3440,y:325,type:'turtle',from:3370,to:3510}],
      coins: [[180,330],[220,330],[365,250],[400,250],[575,320],[755,250],[790,250],[930,170],[970,170],[1090,285],[1130,285],[1390,330],[1560,245],[1600,245],[1740,160],[1780,160],[1930,280],[2050,335],[2090,335],[2220,250],[2260,250],[2400,165],[2440,165],[2590,280],[2750,330],[2790,330],[2900,245],[2940,245],[3080,160],[3120,160],[3270,285],[3390,330],[3430,330],[3510,245]],
      powerups: [{x:1310,y:420,type:'life'},{x:2670,y:420,type:'star'}], checkpoint: 2025 },
    { name: 'Brambleback Citadel', short: 'CITADEL', icon: '👑', sky: ['#533958','#171d38'], groundColor: '#53445d', earth: '#322e47', theme: 'castle', width: 2300, time: 240,
      spawn: { x: 65, y: 420 }, goal: 2140,
      ground: [[0,620,475],[700,1170,475],[1270,1710,475],[1810,2300,475]],
      platforms: [[220,365,120],[410,285,120],[610,355,90],[730,330,120],[900,260,120],[1070,190,120],[1300,360,120],[1480,280,120],[1660,205,120],[1840,355,120],[2020,285,120]],
      blocks: [{x:450,y:198,type:'question',item:'fire'},{x:950,y:173,type:'question',item:'mushroom'},{x:1510,y:193,type:'question',item:'star'}],
      pipes: [], hazards: [{x:620,y:478,w:80,h:62,type:'lava'},{x:1170,y:478,w:100,h:62,type:'lava'},{x:1710,y:478,w:100,h:62,type:'lava'}],
      moving: [{x:620,y:390,w:92,h:15,from:365,to:418,speed:84,axis:'y'},{x:1170,y:390,w:100,h:15,from:1160,to:1280,speed:85,axis:'x'},{x:1710,y:380,w:95,h:15,from:365,to:420,speed:85,axis:'y'}],
      enemies: [{x:310,y:325,type:'turtle',from:250,to:380},{x:820,y:290,type:'flyer',from:740,to:930},{x:1010,y:220,type:'hopper',from:930,to:1080},{x:1400,y:325,type:'walker',from:1320,to:1460},{x:1900,y:320,type:'turtle',from:1840,to:1990}],
      coins: [[220,330],[260,330],[410,250],[450,250],[610,320],[765,300],[800,300],[900,225],[940,225],[1070,155],[1110,155],[1300,325],[1340,325],[1480,245],[1520,245],[1660,170],[1700,170],[1840,320],[1880,320],[2020,250],[2060,250]],
      powerups: [{x:680,y:420,type:'life'},{x:1745,y:420,type:'star'}], checkpoint: 1285,
      boss: { x: 1940, y: 380, hp: 7, arena: [1760,2240] } },
    { name: 'Cloudbreak Causeway', short: 'CLOUDBREAK', icon: '☁️', sky: ['#68c7f4','#e4f8ff'], groundColor: '#8bd5a0', earth: '#786092', theme: 'sky', width: 3260, time: 280,
      spawn: { x: 65, y: 420 }, goal: 3160,
      ground: [[0,610,475],[750,1280,475],[1420,1980,475],[2120,2700,475],[2840,3260,475]],
      platforms: [[210,390,125],[410,318,115],[585,365,120],[780,390,110],[930,316,115],[1120,355,115],[1380,365,120],[1550,305,115],[1770,365,120],[1950,310,115],[2090,375,120],[2280,320,115],[2490,375,120],[2670,305,120],[2850,360,115],[3020,300,120]],
      blocks: [{x:455,y:245,type:'question',item:'coin'},{x:1010,y:238,type:'question',item:'mushroom'},{x:1690,y:230,type:'brick'},{x:1718,y:230,type:'question',item:'coin'},{x:2380,y:245,type:'question',item:'fire'},{x:2930,y:225,type:'question',item:'star'}],
      pipes: [], hazards: [{x:610,y:478,w:140,h:62,type:'cloud'},{x:1280,y:478,w:140,h:62,type:'cloud'},{x:1980,y:478,w:140,h:62,type:'cloud'},{x:2700,y:478,w:140,h:62,type:'cloud'}],
      moving: [{x:1260,y:390,w:95,h:16,from:1240,to:1395,speed:75,axis:'x'},{x:2690,y:390,w:95,h:16,from:2660,to:2820,speed:76,axis:'x'}],
      enemies: [{x:345,y:420,type:'walker',from:275,to:500},{x:850,y:420,type:'turtle',from:790,to:990},{x:1150,y:320,type:'flyer',from:1080,to:1230},{x:1600,y:420,type:'hopper',from:1510,to:1750},{x:2310,y:420,type:'walker',from:2250,to:2460},{x:2990,y:420,type:'flyer',from:2900,to:3110}],
      coins: [[230,345],[270,345],[430,273],[470,273],[610,320],[805,345],[960,270],[1000,270],[1140,310],[1430,320],[1570,260],[1610,260],[1800,320],[1970,265],[2140,330],[2300,275],[2340,275],[2510,330],[2700,260],[2880,315],[3060,255],[3100,255]],
      powerups: [{x:1360,y:420,type:'life'},{x:2580,y:420,type:'star'}], checkpoint: 1700 },
    { name: 'Sunken Pearl Reef', short: 'REEF', icon: '🫧', sky: ['#59c9da','#124a77'], groundColor: '#54b7a2', earth: '#405c72', theme: 'ocean', width: 3340, time: 280,
      spawn: { x: 65, y: 420 }, goal: 3240,
      ground: [[0,620,475],[760,1320,475],[1460,2050,475],[2190,2760,475],[2900,3340,475]],
      platforms: [[230,385,120],[420,310,120],[610,370,120],[800,390,115],[980,320,120],[1170,365,120],[1435,370,120],[1620,300,120],[1810,365,120],[2020,315,120],[2180,375,120],[2370,305,120],[2550,365,120],[2740,315,120],[2910,370,120],[3100,300,120]],
      blocks: [{x:450,y:235,type:'question',item:'coin'},{x:1050,y:245,type:'question',item:'mushroom'},{x:1660,y:222,type:'question',item:'fire'},{x:2430,y:230,type:'brick'},{x:2458,y:230,type:'question',item:'coin'},{x:3020,y:225,type:'question',item:'life'}],
      pipes: [[1340,410,58,65],[2780,410,58,65]], hazards: [{x:620,y:478,w:140,h:62,type:'water'},{x:1320,y:478,w:140,h:62,type:'water'},{x:2050,y:478,w:140,h:62,type:'water'},{x:2760,y:478,w:140,h:62,type:'water'}],
      moving: [{x:1290,y:388,w:95,h:16,from:1260,to:1415,speed:78,axis:'x'},{x:2730,y:390,w:95,h:16,from:2700,to:2855,speed:80,axis:'x'}],
      enemies: [{x:340,y:330,type:'flyer',from:270,to:510},{x:860,y:420,type:'turtle',from:790,to:1000},{x:1180,y:315,type:'hopper',from:1110,to:1280},{x:1700,y:420,type:'walker',from:1630,to:1840},{x:2300,y:420,type:'flyer',from:2230,to:2480},{x:3030,y:420,type:'turtle',from:2950,to:3160}],
      coins: [[250,340],[290,340],[440,265],[480,265],[620,325],[830,345],[1000,275],[1040,275],[1200,320],[1480,325],[1640,255],[1680,255],[1850,320],[2030,270],[2220,330],[2390,260],[2430,260],[2580,320],[2760,270],[2940,325],[3120,255],[3160,255]],
      powerups: [{x:1370,y:420,type:'star'},{x:2820,y:420,type:'life'}], checkpoint: 1740 },
    { name: 'Amberwind Dunes', short: 'AMBERWIND', icon: '🌵', sky: ['#f5bd79','#f9e6b2'], groundColor: '#d4a55e', earth: '#875449', theme: 'desert', width: 3420, time: 270,
      spawn: { x: 65, y: 420 }, goal: 3320,
      ground: [[0,650,475],[800,1380,475],[1530,2110,475],[2260,2840,475],[2990,3420,475]],
      platforms: [[200,385,125],[400,310,120],[600,370,120],[820,390,120],[1010,315,120],[1200,370,120],[1500,355,120],[1690,300,120],[1880,360,120],[2080,305,120],[2250,375,120],[2440,300,120],[2630,365,120],[2810,315,120],[3000,375,120],[3190,300,120]],
      blocks: [{x:430,y:235,type:'question',item:'coin'},{x:1070,y:235,type:'question',item:'fire'},{x:1740,y:220,type:'question',item:'mushroom'},{x:2490,y:220,type:'brick'},{x:2518,y:220,type:'question',item:'coin'},{x:3110,y:225,type:'question',item:'star'}],
      pipes: [[1395,410,58,65],[2860,410,58,65]], hazards: [{x:650,y:478,w:150,h:62,type:'sand'},{x:1380,y:478,w:150,h:62,type:'sand'},{x:2110,y:478,w:150,h:62,type:'sand'},{x:2840,y:478,w:150,h:62,type:'sand'}],
      moving: [{x:1360,y:385,w:100,h:16,from:1330,to:1490,speed:84,axis:'x'},{x:2820,y:385,w:100,h:16,from:2790,to:2950,speed:86,axis:'x'}],
      enemies: [{x:350,y:420,type:'walker',from:280,to:520},{x:900,y:420,type:'hopper',from:830,to:1050},{x:1260,y:330,type:'flyer',from:1190,to:1340},{x:1750,y:420,type:'turtle',from:1670,to:1900},{x:2380,y:420,type:'walker',from:2310,to:2530},{x:2700,y:320,type:'flyer',from:2630,to:2800},{x:3110,y:420,type:'hopper',from:3030,to:3250}],
      coins: [[230,345],[270,345],[420,265],[460,265],[620,325],[850,345],[1030,270],[1070,270],[1220,325],[1550,335],[1710,255],[1750,255],[1900,315],[2100,260],[2280,330],[2460,255],[2500,255],[2650,320],[2830,270],[3010,330],[3200,255],[3240,255]],
      powerups: [{x:1450,y:420,type:'life'},{x:2910,y:420,type:'star'}], checkpoint: 1810 },
  ];

  const bossStageIndex = levelBook.findIndex(level => level.boss);
  function addLongRoute(level, index) {
    const start = level.width;
    const span = 1840;
    const hazardType = level.theme === 'sky' ? 'cloud' : level.theme === 'ocean' ? 'water' : level.theme === 'desert' ? 'sand' : level.theme === 'lava' || level.theme === 'castle' ? 'lava' : level.theme === 'cave' ? 'spikes' : 'water';
    level.ground.push([start,start+210,475],[start+390,start+605,475],[start+800,start+1015,475],[start+1200,start+1415,475],[start+1600,start+span,475]);
    level.hazards.push({x:start+210,y:478,w:180,h:62,type:hazardType},{x:start+605,y:478,w:195,h:62,type:hazardType},{x:start+1015,y:478,w:185,h:62,type:hazardType},{x:start+1415,y:478,w:185,h:62,type:hazardType});
    level.platforms.push([start+130,375,105],[start+340,290,92],[start+565,355,96],[start+825,265,88],[start+1050,350,94],[start+1245,275,88],[start+1360,365,96],[start+1640,335,100]);
    level.moving.push({x:start+230,y:400,w:86,h:15,from:start+220,to:start+345,speed:82+index*2,axis:'x'},{x:start+1040,y:395,w:88,h:15,from:start+1025,to:start+1170,speed:88+index*2,axis:'x'});
    level.blocks.push({x:start+155,y:278,type:'question',item:'coin'},{x:start+950,y:250,type:'question',item:index%2?'fire':'mushroom'},{x:start+1385,y:255,type:'brick'},{x:start+1413,y:255,type:'question',item:'star'});
    level.enemies.push({x:start+100,y:420,type:index%2?'turtle':'walker',from:start+45,to:start+210},{x:start+455,y:420,type:'hopper',from:start+400,to:start+620},{x:start+900,y:420,type:'walker',from:start+850,to:start+1030},{x:start+1280,y:420,type:index%2?'hopper':'turtle',from:start+1240,to:start+1470},{x:start+1580,y:260,type:'flyer',from:start+1550,to:start+1670});
    level.coins.push([start+150,345],[start+330,268],[start+370,268],[start+525,320],[start+735,263],[start+775,263],[start+935,320],[start+970,320],[start+1130,263],[start+1350,325],[start+1390,325],[start+1555,260],[start+1600,260],[start+1730,310],[start+1770,310]);
    level.powerups.push({x:start+920,y:420,type:'life'},{x:start+1740,y:420,type:index%2?'star':'fire'});
    level.checkpoint = start+900;
    level.goal = start+1700;
    level.width = start+span;
  }
  function lengthenBossStage(level) {
    const threshold = 700, offset = 1100;
    const shift = x => x >= threshold ? x+offset : x;
    level.ground = level.ground.flatMap(([x1,x2,y]) => x1 >= threshold ? [[x1+offset,x2+offset,y]] : x2 > threshold ? [[x1,threshold,y],[threshold+offset,x2+offset,y]] : [[x1,x2,y]]);
    level.platforms = level.platforms.map(([x,y,w]) => [shift(x),y,w]);
    level.blocks = level.blocks.map(b => ({...b,x:shift(b.x)}));
    level.pipes = level.pipes.map(([x,y,w,h]) => [shift(x),y,w,h]);
    level.hazards = level.hazards.map(h => ({...h,x:shift(h.x)}));
    level.moving = level.moving.map(m => ({...m,x:shift(m.x),...(m.axis==='x'?{from:shift(m.from),to:shift(m.to)}:{})}));
    level.enemies = level.enemies.map(e => ({...e,x:shift(e.x),from:shift(e.from),to:shift(e.to)}));
    level.coins = level.coins.map(([x,y]) => [shift(x),y]);
    level.powerups = level.powerups.map(p => ({...p,x:shift(p.x)}));
    level.goal = shift(level.goal); level.checkpoint = shift(level.checkpoint); level.width += offset;
    level.boss = {...level.boss,x:shift(level.boss.x),arena:level.boss.arena.map(shift)};
    level.ground.push([700,900,475],[1045,1260,475],[1405,1600,475],[1740,1800,475]);
    level.hazards.push({x:900,y:478,w:130,h:62,type:'lava'},{x:1260,y:478,w:130,h:62,type:'lava'},{x:1600,y:478,w:130,h:62,type:'lava'});
    level.platforms.push([660,390,104],[845,305,90],[1070,375,96],[1280,295,88],[1505,365,96],[1685,305,90]);
    level.moving.push({x:905,y:395,w:95,h:15,from:900,to:935,speed:84,axis:'x'},{x:1610,y:390,w:95,h:15,from:1600,to:1690,speed:90,axis:'x'});
    level.blocks.push({x:860,y:250,type:'question',item:'coin'},{x:1450,y:245,type:'question',item:'fire'});
    level.enemies.push({x:745,y:420,type:'walker',from:710,to:870},{x:1090,y:420,type:'hopper',from:1050,to:1220},{x:1480,y:420,type:'turtle',from:1420,to:1570},{x:1620,y:255,type:'flyer',from:1580,to:1700});
    level.coins.push([730,335],[870,265],[910,265],[1090,320],[1310,255],[1515,325],[1550,325],[1630,260],[1670,260]);
    level.powerups.push({x:1470,y:420,type:'life'});
  }
  for (const [index,level] of levelBook.entries()) {
    if (index === bossStageIndex) lengthenBossStage(level);
    else addLongRoute(level,index);
  }

  // Thin out crowded ledges and keep only occasional steep steps for harder routes.
  for (const level of levelBook) {
    const movingPaths = level.moving.map(p => ({
      x1: p.axis === 'x' ? Math.min(p.from,p.to) : p.x,
      x2: (p.axis === 'x' ? Math.max(p.from,p.to) : p.x) + p.w,
      y1: p.axis === 'y' ? Math.min(p.from,p.to) : p.y,
      y2: (p.axis === 'y' ? Math.max(p.from,p.to) : p.y) + (p.h||15),
    }));
    const platforms = level.platforms
      .filter(([x,y,w]) => !movingPaths.some(m =>
        x+w+24 > m.x1 && x < m.x2+24 && y+44 > m.y1 && y < m.y2+24
      ))
      .sort((a,b) => a[0]-b[0]);
    const kept = [];
    for (const platform of platforms) {
      const [x,y,w] = platform;
      const previous = kept[kept.length-1];
      const gap = previous ? x-previous[0] : Infinity;
      const steepStep = previous && gap >= 255 && y <= previous[1]-80;
      if (previous && gap < 360 && !steepStep) continue;
      const narrowedWidth = Math.max(86,Math.min(125,Math.round(w*.82)));
      kept.push([x+(w-narrowedWidth)/2,y,narrowedWidth]);
    }
    level.platforms = kept;
    const narrowedMoving = level.moving.map(p => {
      const narrowedWidth = Math.max(82,p.w-10);
      const inset = (p.w-narrowedWidth)/2;
      return {...p,x:p.x+inset,w:narrowedWidth,from:p.from+(p.axis==='x'?inset:0),to:p.to+(p.axis==='x'?inset:0)};
    });
    level.moving = narrowedMoving.filter((p,index) => {
      const bounds = movingPaths[index];
      return !narrowedMoving.slice(0,index).some((other,otherIndex) => {
        const prior = movingPaths[otherIndex];
        return bounds.x1 < prior.x2+24 && bounds.x2+24 > prior.x1 && bounds.y1 < prior.y2+24 && bounds.y2+24 > prior.y1;
      });
    });
  }

  const saved = loadSave();
  const completedStages = Array.isArray(saved.completed) ? saved.completed : [];
  const savedUnlockCount = completedStages.includes(bossStageIndex) ? Math.max(saved.unlocked || 1, bossStageIndex + 2) : saved.unlocked || 1;
  const game = {
    mode: 'menu', levelIndex: 0, level: null, player: null, cameraX: 0, time: 300, score: saved.score || 0,
    totalCoins: saved.totalCoins || 0, runCoins: 0, lives: 3, particles: [], projectiles: [], enemyShots: [],
    shake: 0, toastTimer: 0, lastTime: 0, accumulator: 0, muted: saved.muted ?? false, boxHintShown: false,
    unlocked: Math.max(1, Math.min(levelBook.length, savedUnlockCount)), completed: completedStages,
    best: saved.best || {}, touch: { left: false, right: false, jump: false, action: false },
    mobile: matchMedia('(pointer: coarse)').matches || innerWidth < 700,
  };

  function loadSave() {
    try { return JSON.parse(localStorage.getItem('skyboundSproutSave') || '{}'); }
    catch { return {}; }
  }
  function saveGame() {
    try { localStorage.setItem('skyboundSproutSave', JSON.stringify({ unlocked: game.unlocked, completed: game.completed, best: game.best, score: game.score, totalCoins: game.totalCoins, muted: game.muted })); }
    catch { /* Browser storage can be disabled; the game remains playable. */ }
  }

  class AudioBox {
    constructor() { this.context = null; this.musicTimer = null; this.step = 0; }
    init() {
      if (!this.context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        this.context = new AudioContext();
      }
      if (this.context.state === 'suspended') this.context.resume();
    }
    tone(freq, duration = .1, type = 'sine', volume = .045, endFreq = null) {
      if (game.muted || !this.context) return;
      const now = this.context.currentTime;
      const osc = this.context.createOscillator(), gain = this.context.createGain();
      osc.type = type; osc.frequency.setValueAtTime(freq, now);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), now + duration);
      gain.gain.setValueAtTime(volume, now); gain.gain.exponentialRampToValueAtTime(.001, now + duration);
      osc.connect(gain).connect(this.context.destination); osc.start(now); osc.stop(now + duration);
    }
    effect(name) {
      this.init();
      const patterns = {
        jump: [[430,.08,'square',.025,680]], double: [[520,.07,'triangle',.035,840],[760,.09,'sine',.03,1120]],
        coin: [[820,.07,'sine',.04,1160],[1120,.11,'sine',.035,1420]], stomp: [[180,.11,'triangle',.06,70]],
        hit: [[260,.16,'sawtooth',.045,95]], power: [[520,.1,'sine',.05,820],[760,.13,'sine',.04,1220]],
        shoot: [[650,.08,'triangle',.025,280]], boss: [[135,.3,'sawtooth',.05,55]], win: [[523,.13,'triangle',.04,660],[659,.13,'triangle',.04,830],[784,.22,'triangle',.04,1050]],
        death: [[260,.32,'triangle',.05,90]], checkpoint: [[520,.08,'sine',.035,660],[690,.12,'sine',.035,920]],
      };
      (patterns[name] || []).forEach(([f,d,t,v,e], i) => setTimeout(() => this.tone(f,d,t,v,e), i * 75));
    }
    startMusic() {
      this.init(); if (!this.context || this.musicTimer) return;
      const meadow = [392,494,587,494,440,523,659,523,392,494,587,698,659,587,494,440];
      const cave = [196,0,247,0,220,0,294,0];
      const boss = [146,0,174,196,0,174,220,0,196,174,146,0];
      this.musicTimer = setInterval(() => {
        if (game.mode !== 'play' && game.mode !== 'boss') return;
        const seq = game.mode === 'boss' && !game.boss?.defeated ? boss : game.level?.theme === 'cave' || game.level?.theme === 'castle' ? cave : meadow;
        const note = seq[this.step++ % seq.length];
        if (note) this.tone(note, .22, 'triangle', .012);
        if (this.step % 4 === 0) this.tone(note ? note / 2 : 110, .3, 'sine', .009);
      }, 265);
    }
    stopMusic() { if (this.musicTimer) clearInterval(this.musicTimer); this.musicTimer = null; }
  }
  const audio = new AudioBox();

  function freshPlayer(at = game.level?.spawn || { x: 70, y: 420 }) {
    return { x: at.x, y: at.y, w: 31, h: 43, vx: 0, vy: 0, facing: 1, grounded: false, coyote: 0, jumpBuffer: 0,
      jumpsLeft: 2, jumpHeld: false, runTime: 0, animTime: 0, health: 3, maxHealth: 3, lives: game.lives,
      big: false, fire: false, invincible: 0, invuln: 0, dead: false, deathTime: 0, blink: 0, groundedOn: null,
      checkpoint: { x: at.x, y: at.y }, shotCooldown: 0, wasGrounded: false };
  }

  function beginLevel(index, keepLives = true) {
    game.levelIndex = index;
    game.level = structuredClone(levelBook[index]);
    game.mode = levelBook[index].boss ? 'boss' : 'play';
    game.time = game.level.time;
    game.runCoins = 0; game.cameraX = 0; game.particles = []; game.projectiles = []; game.enemyShots = [];
    game.shake = 0; game.lives = keepLives ? Math.max(1, game.lives) : 3;
    if (!keepLives) game.score = 0;
    game.player = freshPlayer(); game.player.lives = game.lives;
    game.enemies = game.level.enemies.map((e, i) => ({ ...e, startX: e.x, startY: e.y, w: e.type === 'flyer' ? 34 : 36, h: e.type === 'flyer' ? 28 : 31,
      dir: i % 2 ? -1 : 1, phase: Math.random() * 6, alive: true, squish: 0, shell: false, shellSpeed: 0, vy: 0, grounded: false }));
    const landingSurfaces = [
      ...game.level.ground.map(([x1,x2,y]) => ({x:x1,w:x2-x1,y})),
      ...game.level.platforms.map(([x,y,w]) => ({x,w,y})),
    ];
    game.coins = game.level.coins.map(([x,y], i) => {
      const surface = landingSurfaces
        .filter(s => x+9 > s.x && x-9 < s.x+s.w && s.y > y)
        .sort((a,b) => a.y-b.y)[0];
      const reachableY = Math.max(y, Math.min(y+22, surface ? surface.y-16 : y+22));
      return { x, y: reachableY, r: 9, phase: i * .7, alive: true };
    });
    game.powerups = game.level.powerups.map(p => ({ ...p, startY: p.y, alive: true, vx: 0, vy: 0 }));
    game.moving = game.level.moving.map(m => ({ ...m, start: m.axis === 'x' ? m.x : m.y, dir: 1, dx: 0, dy: 0 }));
    game.blocks = game.level.blocks.map(b => {
      const surface = landingSurfaces
        .filter(s => b.x+32 > s.x && b.x < s.x+s.w && s.y > b.y+32)
        .sort((a,c) => a.y-c.y)[0];
      return { ...b, y: surface ? surface.y-84 : b.y-4, w: 32, h: 32, used: false, bump: 0 };
    });
    game.checkpointLit = false; game.boxHintShown = false;
    game.boss = game.level.boss ? { ...game.level.boss, w: 83, h: 93, hp: game.level.boss.hp, maxHp: game.level.boss.hp, dir: -1,
      phase: 0, attack: 1.6, jump: 2.8, vy: 0, grounded: false, flash: 0, defeated: false } : null;
    ui.menu.hidden = true; ui.pause.hidden = true; ui.info.hidden = true; ui.levels.hidden = true; ui.result.hidden = true;
    ui.hud.hidden = false; ui.bossHud.hidden = !game.boss; ui.mobile.hidden = !game.mobile; ui.touchHint.hidden = !game.mobile;
    audio.startMusic(); updateHud(); saveGame();
  }

  function showMenu() {
    game.mode = 'menu'; audio.stopMusic();
    ui.menu.hidden = false; ui.pause.hidden = true; ui.info.hidden = true; ui.levels.hidden = true; ui.result.hidden = true;
    ui.hud.hidden = true; ui.bossHud.hidden = true; ui.mobile.hidden = true; ui.touchHint.hidden = true;
    $('#unlocked-label').textContent = `${String(game.unlocked).padStart(2,'0')} / ${String(levelBook.length).padStart(2,'0')}`;
  }
  function pauseGame() {
    if (!['play','boss'].includes(game.mode)) return;
    game.mode = 'paused'; ui.pause.hidden = false; ui.mobile.hidden = true;
  }
  function resumeGame() {
    if (game.boss && !game.boss.defeated) game.mode = 'boss'; else game.mode = 'play';
    ui.pause.hidden = true; ui.mobile.hidden = !game.mobile;
  }
  function showInfo(kind) {
    const content = $('#info-content');
    if (kind === 'credits') {
      $('#info-kicker').textContent = 'A SMALL TEAM OF ONE'; $('#info-title').textContent = 'Made with care';
      content.innerHTML = '<p><strong>Skybound Sprout</strong> is an original little platform adventure.</p><p>Game design, code, art direction, and sound: OpenAI Codex</p><div class="info-tip">Every character, world, and sound is made for this game. Thanks for playing!</div>';
    } else if (kind === 'settings') {
      $('#info-kicker').textContent = 'MAKE IT YOURS'; $('#info-title').textContent = 'Settings';
      content.innerHTML = `<div class="control-row"><span>Music and sound effects</span><button class="button button-secondary" data-sound-toggle style="width:auto;min-height:32px">Sound ${game.muted?'off':'on'}</button></div><div class="info-tip">Your sound preference is saved on this device. The game also adapts its controls to touch screens.</div>`;
    } else {
      $('#info-kicker').textContent = 'YOUR FIELD GUIDE'; $('#info-title').textContent = 'How to play';
      content.innerHTML = `<div class="control-row"><span>Move around</span><span><b class="keycap">A</b> <b class="keycap">D</b> / <b class="keycap">←</b> <b class="keycap">→</b></span></div><div class="control-row"><span>Jump · jump again in air</span><span><b class="keycap">SPACE</b> / <b class="keycap">↑</b></span></div><div class="control-row"><span>Open a question box</span><span>Jump into its underside</span></div><div class="control-row"><span>Run faster</span><span><b class="keycap">SHIFT</b></span></div><div class="control-row"><span>Throw a seed (after a flower)</span><span><b class="keycap">X</b></span></div><div class="control-row"><span>Pause</span><span><b class="keycap">ESC</b></span></div><div class="info-tip">Land on the little critters to bounce them away. Find the checkpoint flag, gather coins, and jump into the bottom of glowing ? boxes to open them.</div>`;
    }
    ui.info.hidden = false;
  }
  function showLevels() {
    const grid = $('#level-grid'); grid.innerHTML = '';
    levelBook.forEach((level, i) => {
      const button = document.createElement('button'); button.className = 'level-card'; button.dataset.theme = level.theme; button.disabled = i + 1 > game.unlocked;
      button.innerHTML = `<div class="level-art">${level.icon}</div><span class="level-number">LEVEL 0${i+1}</span><span class="level-name">${level.name}</span>${button.disabled ? '<span class="level-lock">🔒</span>' : ''}`;
      button.addEventListener('click', () => { if (!button.disabled) beginLevel(i, false); }); grid.append(button);
    });
    ui.levels.hidden = false;
  }

  function showToast(text) {
    ui.toast.textContent = text; ui.toast.classList.add('visible'); game.toastTimer = 1.8;
  }

  function updateHud() {
    if (!game.level || !game.player) return;
    ui.level.textContent = `${game.level.short} 0${game.levelIndex + 1}`;
    ui.coins.textContent = String(game.runCoins).padStart(2,'0');
    ui.lives.textContent = game.lives;
    ui.score.textContent = String(game.score).padStart(6,'0');
    ui.timer.textContent = Math.max(0, Math.ceil(game.time));
    ui.hearts.textContent = `${'♥ '.repeat(Math.max(0, game.player.health)).trim()}${game.player.health < game.player.maxHealth ? ` ${'♡ '.repeat(game.player.maxHealth-game.player.health).trim()}` : ''}`;
    if (game.boss) ui.bossHealth.style.width = `${Math.max(0,game.boss.hp)/game.boss.maxHp*100}%`;
  }

  const keys = new Set();
  let jumpQueued = false, actionQueued = false;
  const keyAliases = { ArrowLeft:'left', KeyA:'left', ArrowRight:'right', KeyD:'right', Space:'jump', ArrowUp:'jump', KeyW:'jump', ShiftLeft:'run', ShiftRight:'run', KeyX:'action', KeyJ:'action', Escape:'pause', KeyP:'pause' };
  window.addEventListener('keydown', (event) => {
    const action = keyAliases[event.code];
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code)) event.preventDefault();
    if (event.repeat && action === 'jump') return;
    if (action === 'jump' && !keys.has('jump')) jumpQueued = true;
    if (action === 'action' && !keys.has('action')) actionQueued = true;
    if (action === 'pause' && !event.repeat) { if (game.mode === 'paused') resumeGame(); else pauseGame(); }
    if (action) keys.add(action);
  });
  window.addEventListener('keyup', event => { const action = keyAliases[event.code]; if (action) keys.delete(action); });
  window.addEventListener('blur', () => { keys.clear(); if (['play','boss'].includes(game.mode)) pauseGame(); });

  document.querySelectorAll('.touch-button').forEach(button => {
    const control = button.dataset.control;
    const press = event => { event.preventDefault(); button.classList.add('pressed'); if (control === 'jump' && !game.touch.jump) jumpQueued = true; if (control === 'action' && !game.touch.action) actionQueued = true; game.touch[control] = true; };
    const release = event => { event.preventDefault(); button.classList.remove('pressed'); game.touch[control] = false; };
    button.addEventListener('pointerdown', press); button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
  });

  $('#play-button').addEventListener('click', () => { audio.init(); beginLevel(Math.min(game.unlocked - 1, levelBook.length - 1), false); });
  $('#levels-button').addEventListener('click', showLevels);
  $('#how-button').addEventListener('click', () => showInfo('how'));
  $('#settings-button').addEventListener('click', () => showInfo('settings'));
  $('#credits-button').addEventListener('click', () => showInfo('credits'));
  function toggleSound() { game.muted = !game.muted; $('#sound-button').innerHTML = `${game.muted ? '♫̸' : '♫'} <span>Sound ${game.muted ? 'off' : 'on'}</span>`; const setting=$('[data-sound-toggle]'); if(setting)setting.textContent=`Sound ${game.muted?'off':'on'}`; saveGame(); if (!game.muted) audio.init(); }
  $('#sound-button').addEventListener('click', toggleSound);
  $('#info-content').addEventListener('click', event => { if (event.target.closest('[data-sound-toggle]')) toggleSound(); });
  $('#pause-button').addEventListener('click', pauseGame);
  $('#resume-button').addEventListener('click', resumeGame);
  $('#restart-button').addEventListener('click', () => beginLevel(game.levelIndex));
  $('#pause-menu-button').addEventListener('click', showMenu);
  $('#info-close').addEventListener('click', () => ui.info.hidden = true); $('#info-ok').addEventListener('click', () => ui.info.hidden = true);
  $('#levels-close').addEventListener('click', () => ui.levels.hidden = true);
  $('#result-secondary').addEventListener('click', showMenu);
  $('#result-primary').addEventListener('click', () => {
    if (game.mode === 'levelDone') beginLevel(Math.min(game.levelIndex + 1, levelBook.length - 1));
    else if (game.mode === 'victory') { game.lives = 3; beginLevel(0, false); }
    else if (game.mode === 'gameover') beginLevel(game.levelIndex, false);
  });

  function completeLevel() {
    if (game.mode === 'levelDone' || game.mode === 'victory') return;
    const victory = game.levelIndex === levelBook.length - 1;
    game.mode = victory ? 'victory' : 'levelDone';
    audio.effect('win'); audio.stopMusic();
    if (!game.completed.includes(game.levelIndex)) game.completed.push(game.levelIndex);
    game.unlocked = Math.max(game.unlocked, Math.min(levelBook.length, game.levelIndex + 2));
    const oldBest = game.best[game.levelIndex] || 0; game.best[game.levelIndex] = Math.max(oldBest, game.score);
    saveGame(); ui.hud.hidden = true; ui.bossHud.hidden = true; ui.mobile.hidden = true; ui.touchHint.hidden = true;
    $('#result-badge').textContent = victory ? '♛' : '✦';
    $('#result-kicker').textContent = victory ? 'THE HORIZON IS YOURS' : 'PATH CLEARED';
    $('#result-title').textContent = victory ? 'Every world explored!' : `${game.level.name} cleared!`;
    $('#result-copy').textContent = victory ? 'You crossed every world and brought the light back home.' : 'A bright new path is waiting just ahead.';
    $('#result-stats').innerHTML = `<div class="stat-box"><strong>${victory?game.totalCoins:game.runCoins}</strong><span>${victory?'TOTAL COINS':'COINS FOUND'}</span></div><div class="stat-box"><strong>${String(game.score).padStart(6,'0')}</strong><span>YOUR SCORE</span></div><div class="stat-box"><strong>${game.completed.length}/${levelBook.length}</strong><span>PATHS CLEARED</span></div>`;
    $('#result-primary').innerHTML = victory ? 'Play again <span class="button-arrow">↻</span>' : 'Continue <span class="button-arrow">→</span>';
    $('#result-secondary').textContent = victory ? 'Back to main menu' : 'Back to the map';
    ui.result.hidden = false;
  }

  function failGame() {
    game.mode = 'gameover'; audio.stopMusic(); audio.effect('death'); ui.hud.hidden = true; ui.mobile.hidden = true; ui.bossHud.hidden = true;
    $('#result-badge').textContent = '♡'; $('#result-kicker').textContent = 'EVERY SPROUT NEEDS A REST';
    $('#result-title').textContent = 'A little setback'; $('#result-copy').textContent = 'The path will be here when you are ready.';
    $('#result-stats').innerHTML = `<div class="stat-box"><strong>${game.runCoins}</strong><span>COINS FOUND</span></div><div class="stat-box"><strong>${String(game.score).padStart(6,'0')}</strong><span>YOUR SCORE</span></div>`;
    $('#result-primary').innerHTML = 'Try this level again <span class="button-arrow">↻</span>'; $('#result-secondary').textContent = 'Back to the map'; ui.result.hidden = false;
  }

  function respawn() {
    const checkpoint = game.player.checkpoint;
    const oldHealth = game.player.health;
    game.player = freshPlayer(checkpoint); game.player.health = Math.max(1, oldHealth); game.player.lives = game.lives; game.player.invuln = 1.5;
    game.cameraX = Math.max(0, checkpoint.x - 250); game.particles = []; game.projectiles = []; game.enemyShots = [];
    showToast(game.checkpointLit ? 'Back at your checkpoint!' : 'Take a breath and try again!');
  }

  function damagePlayer(sourceX) {
    const p = game.player;
    if (p.invuln > 0 || p.dead || p.invincible > 0) return;
    audio.effect('hit'); game.shake = .2; p.invuln = 1.3; p.health -= 1; p.vx = (p.x + p.w/2 < sourceX ? -245 : 245); p.vy = -240; p.grounded = false; p.groundedOn = null;
    if (p.big) { p.big = false; p.h = 43; p.y += 15; }
    if (p.health <= 0) {
      game.lives--; p.dead = true; p.deathTime = .9; p.vy = -390; game.player.lives = game.lives;
      burst(p.x + p.w/2, p.y + p.h/2, '#f27c66', 14); audio.effect('death');
      if (game.lives <= 0) setTimeout(() => { if (game.mode === 'play' || game.mode === 'boss') failGame(); }, 950);
    }
    updateHud();
  }

  function burst(x, y, color, count = 9) {
    for (let i=0;i<count;i++) game.particles.push({ x, y, vx:(Math.random()-.5)*260, vy:(Math.random()-.8)*260, life:.35+Math.random()*.55, max:.8, color, r:2+Math.random()*3 });
  }
  function addScore(points) { game.score += points; updateHud(); }

  function movePlatforms(dt) {
    game.moving.forEach(platform => {
      platform.dx = 0; platform.dy = 0;
      const axis = platform.axis === 'x' ? 'x' : 'y';
      const low = Math.min(platform.from,platform.to), high = Math.max(platform.from,platform.to);
      const old = platform[axis];
      if (high <= low) { platform[axis]=low; return; }
      let position = Math.max(low,Math.min(high,old));
      let direction = platform.dir >= 0 ? 1 : -1;
      let remaining = platform.speed * dt;
      while (remaining > 0) {
        const edge = direction > 0 ? high : low;
        const distance = Math.abs(edge-position);
        if (remaining <= distance) { position += direction*remaining; remaining=0; }
        else { position=edge; remaining-=distance; direction=-direction; }
      }
      platform[axis]=position; platform.dir=direction;
      if (axis === 'x') platform.dx = platform.x-old;
      else platform.dy = platform.y-old;
    });
  }

  function getSolids() { return [...game.level.ground.map(([x1,x2,y]) => ({x:x1,y,w:x2-x1,h:H-y,oneWay:true})), ...game.level.platforms.map(([x,y,w]) => ({x,y,w,h:20,oneWay:true})), ...game.moving, ...game.blocks.map(b => ({...b, oneWay:false, block:b})), ...game.level.pipes.map(([x,y,w,h]) => ({x,y,w,h,oneWay:false}))]; }
  function overlaps(a,b) { return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }

  function updatePlayer(dt) {
    const p = game.player;
    if (p.dead) {
      p.deathTime -= dt; p.vy += GRAVITY * dt; p.y += p.vy * dt;
      if (p.deathTime <= 0 && game.lives > 0) respawn(); return;
    }
    p.animTime += dt; p.invuln = Math.max(0,p.invuln-dt); p.invincible = Math.max(0,p.invincible-dt); p.shotCooldown = Math.max(0,p.shotCooldown-dt);
    p.jumpBuffer = Math.max(0,p.jumpBuffer-dt); if (jumpQueued) { p.jumpBuffer = .14; jumpQueued = false; }
    const left = keys.has('left') || game.touch.left, right = keys.has('right') || game.touch.right;
    const run = keys.has('run'); const maxSpeed = run ? 340 : 238, acceleration = p.grounded ? 1950 : 1320;
    const direction = (right?1:0) - (left?1:0);
    if (direction) { p.vx += direction * acceleration * dt; p.vx = Math.max(-maxSpeed,Math.min(maxSpeed,p.vx)); p.facing = direction; }
    else p.vx = Math.abs(p.vx) < 18 ? 0 : p.vx - Math.sign(p.vx)*Math.min(Math.abs(p.vx), (p.grounded?1900:500)*dt);
    if (p.grounded) { p.coyote = .105; p.jumpsLeft = 2; } else p.coyote = Math.max(0,p.coyote-dt);
    if (p.jumpBuffer > 0 && (p.grounded || p.coyote > 0 || p.jumpsLeft > 0)) {
      if (p.grounded || p.coyote > 0) { p.vy = -560; p.jumpsLeft = 1; audio.effect('jump'); }
      else { p.vy = -505; p.jumpsLeft = 0; burst(p.x+p.w/2,p.y+p.h,'#d7f1ba',5); audio.effect('double'); }
      p.grounded = false; p.groundedOn = null; p.coyote = 0; p.jumpBuffer = 0;
    }
    p.jumpHeld = keys.has('jump') || game.touch.jump;
    if (p.jumpHeld && p.vy < -160) p.vy += GRAVITY * dt * .46;
    p.vy = Math.min(900,p.vy+GRAVITY*dt);

    const solids = getSolids();
    if (p.grounded && p.groundedOn && game.moving.includes(p.groundedOn)) {
      const platform = p.groundedOn;
      const previousX=platform.x-platform.dx, previousY=platform.y-platform.dy;
      const wasRiding = p.x+p.w>previousX && p.x<previousX+platform.w && Math.abs(p.y+p.h-previousY)<10;
      if (wasRiding) {
        const carried = {x:p.x+platform.dx,y:p.y+platform.dy,w:p.w,h:p.h};
        const blocked = solids.some(s => !s.oneWay && overlaps(carried,s));
        if (!blocked) { p.x=carried.x; p.y=carried.y; }
        else { p.grounded=false; p.groundedOn=null; }
      }
    }
    p.x += p.vx*dt;
    for (const s of solids) {
      if (s.oneWay || !overlaps(p,s)) continue;
      if (p.vx > 0) p.x = s.x-p.w; else if (p.vx < 0) p.x = s.x+s.w;
      p.vx = 0;
    }
    const prevY = p.y, prevBottom = p.y + p.h;
    p.y += p.vy*dt; p.grounded = false; p.groundedOn = null;
    let landing = null, ceiling = null;
    for (const s of solids) {
      if (p.x+p.w <= s.x+2 || p.x >= s.x+s.w-2) continue;
      if (p.vy >= 0 && prevBottom <= s.y+10 && p.y+p.h >= s.y) {
        if (!landing || s.y < landing.y) landing = s;
      } else if (!s.oneWay && p.vy < 0 && prevY >= s.y+s.h-8 && p.y < s.y+s.h) {
        if (!ceiling || s.y+s.h > ceiling.y+ceiling.h) ceiling = s;
      }
    }
    if (landing) { p.y=landing.y-p.h; p.vy=0; p.grounded=true; p.groundedOn=landing; }
    else if (ceiling) { p.y=ceiling.y+ceiling.h; p.vy=45; if (ceiling.block) hitBlock(ceiling.block); }
    if (p.x < 0) p.x = 0;
    if (p.y > H+80) { p.invuln=0; p.health=1; damagePlayer(p.x); return; }
    p.runTime = Math.abs(p.vx) > 30 && p.grounded ? p.runTime+dt*Math.abs(p.vx)*.035 : 0;
    if (actionQueued) { if (p.fire && p.shotCooldown <= 0) shootSeed(); actionQueued = false; }
    if ((keys.has('action') || game.touch.action) && p.fire && p.shotCooldown <= 0) shootSeed();
    if (!game.boxHintShown) {
      const nearbyBox = game.blocks.find(b => b.type === 'question' && !b.used && Math.abs((p.x+p.w/2)-(b.x+b.w/2)) < 72 && p.y < b.y+b.h+95 && p.y+p.h > b.y-110);
      if (nearbyBox) { game.boxHintShown = true; showToast('Press Space / ↑ to jump into the underside of the ? box.'); }
    }
    if (p.x > game.level.checkpoint && !game.checkpointLit) {
      game.checkpointLit = true; p.checkpoint = { x: game.level.checkpoint+12, y: 420 }; audio.effect('checkpoint'); showToast('Checkpoint reached!'); burst(game.level.checkpoint, 395, '#ffe586', 14);
    }
    if (!game.boss && p.x > game.level.goal) completeLevel();
    if (game.boss?.defeated && p.x > game.level.goal-120) completeLevel();
  }

  function hitBlock(block) {
    if (block.bump > 0) return;
    block.bump = .19;
    if (block.used) { burst(block.x+16,block.y+5,'#bf8c55',3); return; }
    block.used = true;
    if (block.item === 'coin') collectCoin(block.x+16,block.y-15);
    else spawnPowerup(block.x+2,block.y-40,block.item);
    addScore(50); audio.effect('coin');
  }

  function collectCoin(x,y) {
    game.runCoins++; game.totalCoins++; addScore(100); audio.effect('coin'); burst(x,y,'#ffd04e',8); updateHud(); saveGame();
  }
  function spawnPowerup(x,y,type) { game.powerups.push({x,y,type,startY:y,alive:true,vx: type==='mushroom'?50:0,vy:0,born:true}); }
  function collectPowerup(item) {
    item.alive = false; audio.effect('power'); burst(item.x+15,item.y+15,item.type==='star'?'#ffe45e':'#91de8d',12); addScore(500);
    const p = game.player;
    if (item.type === 'mushroom') { p.big = true; p.h = 56; p.y -= 13; p.health = Math.min(p.maxHealth,p.health+1); showToast('A little extra spring!'); }
    else if (item.type === 'fire') { p.fire = true; showToast('Seed power! Press X to toss a spark.'); }
    else if (item.type === 'star') { p.invincible = 8; showToast('Star bright! You are unstoppable!'); }
    else if (item.type === 'life') { game.lives = Math.min(9,game.lives+1); p.lives = game.lives; showToast('One more little life!'); }
    updateHud(); saveGame();
  }
  function shootSeed() {
    const p = game.player; p.shotCooldown = .45;
    game.projectiles.push({x:p.facing>0?p.x+p.w:p.x-12,y:p.y+p.h*.44,w:14,h:14,vx:p.facing*500,vy:-40,life:1.7,r:7});
    audio.effect('shoot');
  }

  function updateEnemies(dt) {
    for (const e of game.enemies) {
      if (!e.alive) { e.squish -= dt; continue; }
      e.phase += dt;
      if (e.shell) { e.x += e.shellSpeed*dt; e.shellSpeed *= Math.pow(.985,dt*60); if (Math.abs(e.shellSpeed)<20) e.shellSpeed=0; }
      else if (e.type === 'flyer') { e.x += e.dir * 45 * dt; e.y = e.startY + Math.sin(e.phase*2.1)*22; if (e.x < e.from || e.x > e.to) e.dir *= -1; }
      else {
        const speed = e.type === 'turtle' ? 46 : e.type === 'hopper' ? 56 : 68;
        e.x += e.dir*speed*dt;
        if (e.x < e.from || e.x > e.to) { e.dir *= -1; e.x = Math.max(e.from,Math.min(e.to,e.x)); }
        e.vy = Math.min(700,e.vy+GRAVITY*dt); const prevBottom=e.y+e.h; e.y+=e.vy*dt; e.grounded=false;
        for (const s of getSolids()) if (e.x+e.w>s.x+3 && e.x<s.x+s.w-3 && e.vy>=0 && prevBottom<=s.y+8 && e.y+e.h>=s.y) { e.y=s.y-e.h; e.vy=0; e.grounded=true; }
        if (e.type==='hopper' && e.grounded && Math.sin(e.phase*2.8)>.94) e.vy=-390;
      }
      const p=game.player;
      if (overlaps(p,e)) {
        if (p.invincible > 0) { e.alive=false; e.squish=.28; burst(e.x+e.w/2,e.y+e.h/2,'#ffe46d',10); addScore(250); audio.effect('stomp'); continue; }
        const wasAbove = p.vy > 20 && p.y+p.h-e.h*.45 < e.y+5;
        if (wasAbove && !p.dead) {
          if (e.type==='turtle' && !e.shell) { e.shell=true; e.h=23; e.y+=8; e.vy=0; showToast('Turtle tucked in!'); }
          else { e.alive=false; e.squish=.28; burst(e.x+e.w/2,e.y+e.h/2,'#a5d878',9); addScore(250); audio.effect('stomp'); }
          p.vy=-410; p.grounded=false; p.jumpsLeft=Math.max(1,p.jumpsLeft);
        } else if (e.shell && Math.abs(e.shellSpeed)<20) { e.shellSpeed=p.x<e.x?330:-330; }
        else if (!e.shell && p.invincible<=0) damagePlayer(e.x+e.w/2);
      }
      if (e.x < -100 || e.x > game.level.width+100) e.alive=false;
    }
  }

  function updateItems(dt) {
    for (const coin of game.coins) {
      if (!coin.alive) continue;
      const cx=coin.x+Math.sin(coin.phase)*2, cy=coin.y+Math.sin(coin.phase*2.3)*2;
      coin.phase+=dt*4;
      if (Math.abs(game.player.x+game.player.w/2-cx)<20 && Math.abs(game.player.y+game.player.h/2-cy)<28) { coin.alive=false; collectCoin(cx,cy); }
    }
    for (const item of game.powerups) {
      if (!item.alive) continue;
      item.phase=(item.phase||0)+dt*3;
      if (item.born) { item.vy=Math.min(150,item.vy+420*dt); item.y+=item.vy*dt; if (item.y>item.startY) {item.y=item.startY;item.vy=0;item.born=false;} }
      else if (item.type==='mushroom') {
        item.x+=item.vx*dt;
        for (const s of getSolids()) if (s.oneWay && item.x+27>s.x && item.x<s.x+s.w && item.y+28>s.y && item.y+28<s.y+20+8) { item.y=s.y-28; }
      } else item.y=item.startY+Math.sin(item.phase)*4;
      if (overlaps(game.player,{x:item.x,y:item.y,w:28,h:28})) collectPowerup(item);
    }
    game.blocks.forEach(b=>b.bump=Math.max(0,b.bump-dt));
  }

  function updateProjectiles(dt) {
    game.projectiles = game.projectiles.filter(s => {
      s.life-=dt; s.x+=s.vx*dt; s.y+=s.vy*dt; s.vy+=500*dt;
      if (game.boss && !game.boss.defeated && overlaps(s,{x:game.boss.x,y:game.boss.y,w:game.boss.w,h:game.boss.h})) { hitBoss(); return false; }
      for (const e of game.enemies) if (e.alive && overlaps(s,e)) { e.alive=false;e.squish=.3;addScore(250);burst(e.x+e.w/2,e.y+e.h/2,'#ffce5d',10);audio.effect('stomp');return false; }
      return s.life>0 && s.x>game.cameraX-80 && s.x<game.cameraX+W+80 && s.y<H;
    });
    game.enemyShots = game.enemyShots.filter(s => {
      s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=260*dt;
      if (overlaps(s,game.player)) { damagePlayer(s.x);burst(s.x,s.y,'#ff8056',6);return false; }
      return s.life>0 && s.x>game.cameraX-100 && s.x<game.cameraX+W+100 && s.y<H;
    });
  }

  function updateBoss(dt) {
    const b=game.boss, p=game.player; if (!b || b.defeated) return;
    b.phase+=dt;b.attack-=dt;b.jump-=dt;b.flash=Math.max(0,b.flash-dt);
    const playerCenter=p.x+p.w/2, bossCenter=b.x+b.w/2;
    if (Math.abs(playerCenter-bossCenter)<430) {
      b.dir=playerCenter<bossCenter?-1:1;
      b.x+=b.dir*(b.grounded?56:34)*dt;
    }
    b.x=Math.max(b.arena[0],Math.min(b.arena[1]-b.w,b.x));
    b.vy=Math.min(850,b.vy+GRAVITY*dt);const prev=b.y+b.h;b.y+=b.vy*dt;b.grounded=false;
    for(const s of getSolids())if(s.oneWay&&b.x+b.w>s.x&&b.x<s.x+s.w&&b.vy>=0&&prev<=s.y+12&&b.y+b.h>=s.y){b.y=s.y-b.h;b.vy=0;b.grounded=true;}
    if(b.jump<=0&&b.grounded){b.vy=-470;b.jump=3.1;game.shake=.12;}
    if(b.attack<=0){
      const aim=Math.sign((p.x+p.w/2)-(b.x+b.w/2))||-1;
      game.enemyShots.push({x:b.x+(aim>0?b.w:0),y:b.y+35,vx:aim*205,vy:-100,life:4,w:24,h:18});
      if(Math.random()>.45)game.enemyShots.push({x:b.x+(aim>0?b.w:0),y:b.y+49,vx:aim*155,vy:-190,life:4,w:20,h:16});
      b.attack=1.8;audio.effect('boss');
    }
    if(overlaps(p,b)){
      const above=p.vy>10&&p.y+p.h-b.h*.45<b.y+10;
      if(above){p.vy=-520;p.grounded=false;hitBoss();}
      else damagePlayer(b.x+b.w/2);
    }
  }
  function hitBoss(){
    const b=game.boss;if(!b||b.defeated||b.flash>.05)return;
    b.hp--;b.flash=.38;game.shake=.3;burst(b.x+b.w/2,b.y+30,'#ffc45b',14);audio.effect('stomp');addScore(800);updateHud();
    if(b.hp<=0){b.defeated=true;game.enemyShots=[];showToast('The thorn king is all out of puff!');burst(b.x+b.w/2,b.y+b.h/2,'#ffda74',32);audio.effect('win');}
  }

  function updateHazards() {
    const p=game.player;
    for(const h of game.level.hazards){
      if(p.x+p.w>h.x+5&&p.x<h.x+h.w-5&&p.y+p.h>h.y+5){
        if(h.type==='water'||h.type==='sand'){p.vy=Math.max(p.vy,80);p.vx*=.82;if(p.y+p.h>h.y+27)damagePlayer(p.x);}
        else damagePlayer(p.x+p.w/2);
      }
    }
  }

  function update(dt) {
    if(game.toastTimer>0){game.toastTimer-=dt;if(game.toastTimer<=0)ui.toast.classList.remove('visible');}
    if(game.shake>0)game.shake=Math.max(0,game.shake-dt);
    game.particles=game.particles.filter(pt=>{pt.life-=dt;pt.x+=pt.vx*dt;pt.y+=pt.vy*dt;pt.vy+=500*dt;return pt.life>0;});
    if(!['play','boss'].includes(game.mode))return;
    game.time-=dt;
    if(game.time<=0){game.time=0;damagePlayer(game.player.x);game.time=game.level.time;showToast('Time to take a breath!');}
    movePlatforms(dt);updatePlayer(dt);updateEnemies(dt);updateItems(dt);updateProjectiles(dt);updateBoss(dt);updateHazards(dt);
    const target=Math.max(0,Math.min(game.level.width-W,game.player.x-W*.36));
    game.cameraX+=(target-game.cameraX)*Math.min(1,dt*6.5);
    updateHud();
  }

  function roundedRect(c,x,y,w,h,r) {
    c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();
  }
  function drawBackground() {
    const level=game.level||levelBook[0];
    const t=level.theme;
    const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,level.sky[0]);grad.addColorStop(.58,level.sky[1]);grad.addColorStop(1,t==='cave'?'#31364f':t==='castle'?'#302d4c':t==='ocean'?'#0b3b66':t==='sky'?'#b8e8f0':t==='desert'?'#dba269':'#a7d4a0');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
    const glow=ctx.createRadialGradient(W*.76,105,5,W*.76,145,480);glow.addColorStop(0,t==='lava'?'rgba(255,191,112,.48)':t==='ocean'?'rgba(133,255,234,.22)':t==='cave'||t==='castle'?'rgba(141,128,205,.17)':t==='sky'?'rgba(255,255,255,.62)':t==='desert'?'rgba(255,221,158,.5)':'rgba(255,244,196,.55)');glow.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
    if(level.theme==='cave'||level.theme==='castle'){
      ctx.fillStyle=level.theme==='cave'?'rgba(20,22,42,.34)':'rgba(28,24,53,.28)';
      for(let i=0;i<18;i++){const x=((i*97-game.cameraX*.17)%(W+150)+W+150)%(W+150)-75, depth=65+(i%5)*23;ctx.beginPath();ctx.moveTo(x-28,0);ctx.lineTo(x-14,depth*.6);ctx.lineTo(x+((i*7)%28),depth);ctx.lineTo(x+30,0);ctx.fill();}
      for(let i=0;i<12;i++){const x=((i*153-game.cameraX*.23)%(W+190)+W+190)%(W+190)-95,y=115+(i%4)*78;const haze=ctx.createRadialGradient(x,y,4,x,y,135);haze.addColorStop(0,i%2?'rgba(108,144,198,.18)':'rgba(248,177,105,.13)');haze.addColorStop(1,'rgba(70,82,128,0)');ctx.fillStyle=haze;ctx.fillRect(x-135,y-135,270,270);}
      if(level.theme==='cave'){ctx.fillStyle='rgba(12,18,35,.2)';ctx.fillRect(0,0,W,H);}
    } else {
      if(t==='ocean')drawOceanLight();
      else drawSun(t);
      for(let i=0;i<(t==='desert'?3:6);i++){
        const x=((i*230-game.cameraX*.2)%(W+200)+W+200)%(W+200)-80, y=68+(i%3)*51;
        if(t!=='ocean')drawCloud(x,y,.7+(i%2)*.22);
      }
      if(t==='lava'){const emberHaze=ctx.createLinearGradient(0,300,0,H);emberHaze.addColorStop(0,'rgba(255,126,73,0)');emberHaze.addColorStop(1,'rgba(230,82,66,.2)');ctx.fillStyle=emberHaze;ctx.fillRect(0,300,W,H-300);}
    }
    if(t==='sky')drawSkyIslands();
    else if(t==='ocean')drawOceanScenery();
    else if(t==='desert')drawDesertLandscape();
    else {drawHills();if(t==='meadow'||t==='forest')drawTrees();if(t==='lava'||t==='castle')drawCastleSilhouette();if(t==='cave')drawCrystalSilhouette();}
    drawAtmosphericMotes(level.theme);
  }
  function drawSun(theme){const x=770,y=113,r=48;const halo=ctx.createRadialGradient(x,y,8,x,y,210);halo.addColorStop(0,theme==='lava'?'rgba(255,217,153,.48)':'rgba(255,246,196,.52)');halo.addColorStop(1,'rgba(255,239,190,0)');ctx.fillStyle=halo;ctx.fillRect(x-210,y-210,420,420);const sun=ctx.createRadialGradient(x-15,y-18,3,x,y,r);sun.addColorStop(0,'#fffbe0');sun.addColorStop(.55,theme==='lava'?'#ffd49a':'#fff0b4');sun.addColorStop(1,theme==='lava'?'#f4a278':'#f8c96f');ctx.fillStyle=sun;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,250,218,.23)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r+10,0,Math.PI*2);ctx.stroke();}
  function drawCloud(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.shadowColor='rgba(69,120,140,.12)';ctx.shadowBlur=15;ctx.shadowOffsetY=8;const cloud=ctx.createLinearGradient(0,-24,0,18);cloud.addColorStop(0,'rgba(255,255,251,.92)');cloud.addColorStop(1,'rgba(227,248,239,.64)');ctx.fillStyle=cloud;ctx.beginPath();ctx.ellipse(0,8,44,12,0,0,Math.PI*2);ctx.ellipse(-20,1,19,15,0,0,Math.PI*2);ctx.ellipse(1,-6,25,22,0,0,Math.PI*2);ctx.ellipse(25,3,20,14,0,0,Math.PI*2);ctx.fill();ctx.shadowColor='transparent';ctx.fillStyle='rgba(255,255,255,.46)';ctx.beginPath();ctx.ellipse(-1,-9,14,8,-.2,Math.PI,Math.PI*2);ctx.fill();ctx.restore();}
  function drawHills(){const t=game.level?.theme||'meadow',width=game.level?.width||W;ctx.save();ctx.translate(-game.cameraX*.36,0);const far=ctx.createLinearGradient(0,260,0,515);far.addColorStop(0,t==='cave'||t==='castle'?'#535879':t==='lava'?'#c7837a':'#92d8a6');far.addColorStop(1,t==='cave'||t==='castle'?'#343d5c':t==='lava'?'#8a5367':'#6dbb8c');ctx.fillStyle=far;
    for(let i=-2;i<width/190+3;i++){let x=i*190+(i%2)*17;ctx.beginPath();ctx.moveTo(x-15,432);ctx.bezierCurveTo(x+28,370+(i%3)*15,x+40,282+(i%4)*17,x+104,298+(i%3)*24);ctx.bezierCurveTo(x+157,314+(i%3)*20,x+146,393,x+192,432);ctx.lineTo(x+192,540);ctx.lineTo(x-15,540);ctx.closePath();ctx.fill();}
    ctx.translate(-game.cameraX*.19,0);const near=ctx.createLinearGradient(0,345,0,540);near.addColorStop(0,t==='cave'||t==='castle'?'rgba(64,67,100,.8)':t==='lava'?'rgba(170,91,91,.88)':'rgba(105,195,133,.9)');near.addColorStop(1,t==='cave'||t==='castle'?'rgba(32,39,62,.96)':t==='lava'?'rgba(108,58,69,.96)':'rgba(69,157,105,.96)');ctx.fillStyle=near;
    for(let i=-2;i<width/145+3;i++){let x=i*145+50;ctx.beginPath();ctx.moveTo(x-18,474);ctx.bezierCurveTo(x+6,430+(i%2)*10,x+35,366+(i%3)*21,x+73,374+(i%2)*22);ctx.bezierCurveTo(x+108,382+(i%3)*16,x+111,443,x+147,474);ctx.lineTo(x+147,540);ctx.lineTo(x-18,540);ctx.closePath();ctx.fill();}
    ctx.restore();}
  function drawTrees(){const width=game.level?.width||W;ctx.save();ctx.translate(-game.cameraX*.57,0);for(let i=-1;i<width/180+2;i++){const x=i*180+25,treeY=427+(i%3)*16;const trunk=ctx.createLinearGradient(x+20,0,x+52,0);trunk.addColorStop(0,'#704f49');trunk.addColorStop(.45,'#b07a50');trunk.addColorStop(1,'#614b4a');ctx.fillStyle=trunk;ctx.beginPath();ctx.moveTo(x+25,treeY);ctx.lineTo(x+30,treeY-78);ctx.quadraticCurveTo(x+38,treeY-92,x+46,treeY-75);ctx.lineTo(x+52,treeY);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(247,198,132,.35)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+35,treeY-10);ctx.lineTo(x+38,treeY-72);ctx.stroke();
      const canopy=ctx.createRadialGradient(x+24,treeY-103,5,x+37,treeY-71,66);canopy.addColorStop(0,i%2?'#8ee18e':'#a4e58d');canopy.addColorStop(.55,i%2?'#49ad76':'#65c67c');canopy.addColorStop(1,i%2?'#317b65':'#388c67');ctx.fillStyle=canopy;ctx.beginPath();ctx.arc(x+36,treeY-80,35,0,Math.PI*2);ctx.arc(x+10,treeY-63,24,0,Math.PI*2);ctx.arc(x+61,treeY-59,25,0,Math.PI*2);ctx.arc(x+35,treeY-49,24,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(241,255,198,.31)';ctx.beginPath();ctx.ellipse(x+24,treeY-95,10,5,-.6,0,Math.PI*2);ctx.ellipse(x+51,treeY-73,8,4,.5,0,Math.PI*2);ctx.fill();}ctx.restore();}
  function drawCastleSilhouette(){const width=game.level?.width||W;ctx.save();ctx.translate(-game.cameraX*.32,0);for(let i=0;i<width/235+2;i++){const x=i*235+18,y=206+(i%3)*24,w=64+(i%2)*12,h=540-y;const tower=ctx.createLinearGradient(x,0,x+w,0);tower.addColorStop(0,'rgba(44,43,68,.28)');tower.addColorStop(.5,'rgba(94,64,81,.48)');tower.addColorStop(1,'rgba(40,40,68,.34)');ctx.fillStyle=tower;ctx.fillRect(x,y,w,h);ctx.fillRect(x-13,y+15,w+26,19);ctx.beginPath();ctx.moveTo(x-14,y+15);ctx.lineTo(x+w/2,y-45);ctx.lineTo(x+w+14,y+15);ctx.closePath();ctx.fill();ctx.fillRect(x+9,y-3,8,20);ctx.fillRect(x+w-17,y-3,8,20);ctx.fillStyle='rgba(255,209,153,.14)';for(let wy=y+46;wy<500;wy+=57){roundedRect(ctx,x+w/2-5,wy,10,22,5);ctx.fill();}}ctx.restore();}
  function drawCrystalSilhouette(){const width=game.level?.width||W;ctx.save();ctx.translate(-game.cameraX*.3,0);for(let i=-1;i<width/190+2;i++){const x=i*190+30,y=350+(i%3)*17,h=105+(i%4)*27,crystal=ctx.createLinearGradient(x,0,x+46,0);crystal.addColorStop(0,'rgba(96,124,184,.12)');crystal.addColorStop(.42,'rgba(187,172,231,.3)');crystal.addColorStop(1,'rgba(101,112,174,.13)');ctx.fillStyle=crystal;ctx.shadowColor='rgba(164,193,255,.28)';ctx.shadowBlur=15;ctx.beginPath();ctx.moveTo(x,455);ctx.lineTo(x+16,y+14);ctx.lineTo(x+26,y);ctx.lineTo(x+52,455);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='rgba(225,232,255,.26)';ctx.beginPath();ctx.moveTo(x+26,y);ctx.lineTo(x+29,440);ctx.stroke();}ctx.restore();}
  function drawOceanLight(){ctx.save();ctx.globalAlpha=.18;for(let i=0;i<7;i++){const x=i*175-80;const beam=ctx.createLinearGradient(x,0,x+95,H);beam.addColorStop(0,'rgba(220,255,240,.72)');beam.addColorStop(1,'rgba(91,223,222,0)');ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+58,0);ctx.lineTo(x+155,H);ctx.lineTo(x+70,H);ctx.closePath();ctx.fill();}ctx.restore();}
  function drawSkyIslands(){const width=game.level?.width||W;ctx.save();ctx.translate(-game.cameraX*.28,0);for(let i=-1;i<width/190+2;i++){const x=i*190+35,y=255+(i%4)*27,w=92+(i%3)*24;ctx.fillStyle='rgba(255,255,255,.26)';ctx.beginPath();ctx.ellipse(x+w*.5,y+18,w*.67,18,0,0,Math.PI*2);ctx.fill();const island=ctx.createLinearGradient(x,y,x,y+50);island.addColorStop(0,'#9bd8b3');island.addColorStop(.24,'#719c9e');island.addColorStop(1,'#786890');ctx.fillStyle=island;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+w*.5,y-22,x+w,y);ctx.lineTo(x+w*.81,y+27);ctx.lineTo(x+w*.58,y+43);ctx.lineTo(x+w*.34,y+30);ctx.lineTo(x+w*.17,y+47);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(248,255,219,.5)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+8,y+2);ctx.quadraticCurveTo(x+w*.5,y-14,x+w-7,y+2);ctx.stroke();}ctx.restore();}
  function drawOceanScenery(){const width=game.level?.width||W;ctx.save();ctx.translate(-game.cameraX*.26,0);for(let i=-1;i<width/104+2;i++){const x=i*104+24,base=493+(i%3)*12,coral=i%3;ctx.fillStyle=coral===0?'rgba(67,158,153,.42)':coral===1?'rgba(81,126,171,.43)':'rgba(96,174,152,.4)';ctx.beginPath();ctx.ellipse(x,base+15,54,30,0,Math.PI,Math.PI*2);ctx.fill();ctx.strokeStyle=coral===0?'rgba(255,166,160,.7)':coral===1?'rgba(255,217,143,.72)':'rgba(174,246,194,.72)';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();if(coral===0){ctx.moveTo(x,base);ctx.lineTo(x,base-37);ctx.moveTo(x,base-18);ctx.lineTo(x-16,base-31);ctx.moveTo(x,base-23);ctx.lineTo(x+16,base-38);ctx.moveTo(x-16,base-31);ctx.lineTo(x-23,base-42);ctx.moveTo(x+16,base-38);ctx.lineTo(x+23,base-48);}else if(coral===1){ctx.moveTo(x-10,base);ctx.quadraticCurveTo(x-18,base-28,x-3,base-42);ctx.moveTo(x+9,base);ctx.quadraticCurveTo(x+22,base-20,x+12,base-34);ctx.moveTo(x+12,base-34);ctx.lineTo(x+20,base-40);}else{ctx.moveTo(x-15,base);ctx.quadraticCurveTo(x-6,base-18,x-18,base-36);ctx.moveTo(x,base);ctx.quadraticCurveTo(x+12,base-20,x+2,base-44);ctx.moveTo(x+17,base);ctx.quadraticCurveTo(x+8,base-18,x+22,base-31);}ctx.stroke();ctx.lineCap='butt';}ctx.restore();}
  function drawDesertLandscape(){const width=game.level?.width||W;ctx.save();ctx.translate(-game.cameraX*.24,0);const dunes=['#e7bc7e','#dba76c','#ca8d61'];for(let layer=0;layer<3;layer++){const base=390+layer*44;ctx.fillStyle=dunes[layer];ctx.beginPath();ctx.moveTo(-50,H);for(let i=-1;i<width/190+2;i++){const x=i*190+layer*57;ctx.quadraticCurveTo(x+68,base-58+(i%3)*15,x+160,base+((i+layer)%2)*18);}ctx.lineTo(width+100,H);ctx.closePath();ctx.fill();}for(let i=-1;i<width/230+2;i++){const x=i*230+50,y=415-(i%3)*28;ctx.fillStyle='rgba(91,67,61,.6)';ctx.fillRect(x-5,y,10,58);ctx.fillRect(x-24,y+17,19,8);ctx.fillRect(x+6,y+30,18,8);ctx.beginPath();ctx.ellipse(x,y,5,6,0,0,Math.PI*2);ctx.ellipse(x-20,y+20,5,6,0,0,Math.PI*2);ctx.ellipse(x+22,y+33,5,6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,230,173,.22)';ctx.fillRect(x-2,y+7,2,46);}ctx.restore();}
  function drawAtmosphericMotes(theme){const warm=theme==='lava'||theme==='desert',cold=theme==='cave'||theme==='castle',underwater=theme==='ocean',time=game.accumulator;ctx.save();for(let i=0;i<30;i++){const speed=8+(i%7)*3,x=((i*173+time*speed-game.cameraX*.08)%(W+40)+W+40)%(W+40)-20,y=72+(i*83%380)+Math.sin(time*1.2+i*2)*9,r=1+(i%3)*.6;ctx.globalAlpha=.15+.22*(.5+.5*Math.sin(time*2+i));ctx.fillStyle=underwater?'rgba(211,255,247,.8)':warm?'#ffd18b':cold?'#c5d5ff':'#fff9bf';ctx.strokeStyle=ctx.fillStyle;ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=8;ctx.beginPath();if(underwater){ctx.arc(x,y,2+r,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(x-r*.4,y-r*.5,.7,0,Math.PI*2);ctx.fill();}else{ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}}ctx.restore();}

  function drawWorld(){
    const l=game.level;
    for(const h of l.hazards){
      if(h.type==='cloud'){const cloud=ctx.createLinearGradient(0,h.y,0,h.y+h.h);cloud.addColorStop(0,'rgba(250,255,255,.92)');cloud.addColorStop(.34,'rgba(216,240,255,.8)');cloud.addColorStop(1,'rgba(146,184,221,.46)');ctx.fillStyle=cloud;ctx.fillRect(h.x,h.y+13,h.w,h.h-13);ctx.fillStyle='rgba(255,255,255,.86)';for(let x=h.x-4;x<h.x+h.w+18;x+=30){const bob=Math.sin(game.accumulator*1.5+x*.04)*3;ctx.beginPath();ctx.ellipse(x+14,h.y+13+bob,19,12,0,0,Math.PI*2);ctx.fill();}ctx.fillStyle='rgba(255,255,255,.62)';ctx.fillRect(h.x,h.y+9,h.w,2);}
      else if(h.type==='sand'){const sand=ctx.createLinearGradient(0,h.y,0,h.y+h.h);sand.addColorStop(0,'#efc67d');sand.addColorStop(.2,'#d4a15e');sand.addColorStop(1,'#9b654c');ctx.fillStyle=sand;ctx.fillRect(h.x,h.y,h.w,h.h);ctx.fillStyle='rgba(255,241,185,.7)';for(let x=h.x;x<h.x+h.w;x+=25){const ripple=Math.sin(game.accumulator*2+x*.06)*2;ctx.beginPath();ctx.ellipse(x+10,h.y+5+ripple,12,2,0,0,Math.PI*2);ctx.fill();}ctx.fillStyle='rgba(112,71,57,.3)';for(let i=0;i<6;i++){const x=h.x+12+i*27+Math.sin(game.accumulator+i)*4;ctx.beginPath();ctx.ellipse(x,h.y+26+i%3*15,3,1.5,0,0,Math.PI*2);ctx.fill();}}
      else if(h.type==='water'){const water=ctx.createLinearGradient(0,h.y,0,h.y+h.h);water.addColorStop(0,'#76d7e3');water.addColorStop(.16,'#38a9ce');water.addColorStop(1,'#275b91');ctx.fillStyle=water;ctx.fillRect(h.x,h.y,h.w,h.h);ctx.fillStyle='rgba(224,255,249,.72)';ctx.fillRect(h.x,h.y,h.w,2);for(let x=h.x;x<h.x+h.w;x+=24){const wave=Math.sin(game.accumulator*4+x*.08);ctx.fillStyle='rgba(220,255,249,.52)';ctx.beginPath();ctx.ellipse(x+10,h.y+4+wave*2,10+wave,2.2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(32,97,151,.34)';ctx.beginPath();ctx.ellipse(x+22,h.y+27+Math.sin(game.accumulator*2+x)*3,4,1.5,0,0,Math.PI*2);ctx.fill();}}
      else if(h.type==='lava'){const lava=ctx.createLinearGradient(0,h.y,0,h.y+h.h);lava.addColorStop(0,'#ffd06d');lava.addColorStop(.13,'#ef7044');lava.addColorStop(.6,'#b73f48');lava.addColorStop(1,'#532e51');ctx.fillStyle=lava;ctx.shadowColor='rgba(255,105,55,.7)';ctx.shadowBlur=19;ctx.fillRect(h.x,h.y,h.w,h.h);ctx.shadowBlur=0;ctx.fillStyle='rgba(255,235,151,.78)';ctx.fillRect(h.x,h.y,h.w,2);for(let i=0;i<5;i++){let x=h.x+12+i*27+Math.sin(game.accumulator*2+i)*8,cy=h.y+18+(i%3)*13+Math.sin(game.accumulator*3+i*2)*4;ctx.fillStyle=i%2?'#ff8a4d':'#ffbd5d';ctx.shadowColor='#ff7447';ctx.shadowBlur=11;ctx.beginPath();ctx.arc(x,cy,2.5+(i%3),0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}}
      else {const stone=ctx.createLinearGradient(0,h.y,0,h.y+25);stone.addColorStop(0,'#8d8090');stone.addColorStop(1,'#3f4058');ctx.fillStyle=stone;ctx.fillRect(h.x,h.y,h.w,h.h);ctx.fillStyle='#e5dae0';ctx.strokeStyle='rgba(53,48,64,.6)';ctx.lineWidth=1.5;for(let x=h.x;x<h.x+h.w;x+=16){ctx.beginPath();ctx.moveTo(x,h.y+12);ctx.lineTo(x+8,h.y-3);ctx.lineTo(x+16,h.y+12);ctx.closePath();ctx.fill();ctx.stroke();}}
    }
    for(const [x1,x2,y] of l.ground){drawPlatform(x1,y,x2-x1,y<H-1?H-y:80,true);}
    for(const [x,y,w] of l.platforms)drawPlatform(x,y,w,20,false);
    for(const p of game.moving) {const height=p.h||15;drawPlatform(p.x,p.y,p.w,height,false);ctx.fillStyle='rgba(255,255,255,.34)';ctx.fillRect(p.x+8,p.y+4,p.w-16,3);}
    for(const pipe of l.pipes){const [x,y,w,h]=pipe,pipeColors=l.theme==='ocean'?['#225a6e','#64c6bd','#378b89','#21495e']:l.theme==='desert'?['#79513f','#d49a60','#a96d4d','#60454a']:['#256c58','#59b879','#398c68','#245d55'],rimColors=l.theme==='ocean'?['#c0f4dc','#60c8bb','#287b7a']:l.theme==='desert'?['#f2d38b','#d9a45f','#9d604b']:['#b2ef9c','#68cb80','#31815e'];const pipeGrad=ctx.createLinearGradient(x,0,x+w,0);pipeGrad.addColorStop(0,pipeColors[0]);pipeGrad.addColorStop(.25,pipeColors[1]);pipeGrad.addColorStop(.58,pipeColors[2]);pipeGrad.addColorStop(1,pipeColors[3]);ctx.fillStyle=pipeGrad;roundedRect(ctx,x,y,w,h,8);ctx.fill();ctx.strokeStyle='rgba(26,88,68,.72)';ctx.lineWidth=2;roundedRect(ctx,x,y,w,h,8);ctx.stroke();const rim=ctx.createLinearGradient(0,y,0,y+18);rim.addColorStop(0,rimColors[0]);rim.addColorStop(.4,rimColors[1]);rim.addColorStop(1,rimColors[2]);ctx.fillStyle=rim;roundedRect(ctx,x-6,y,w+12,17,6);ctx.fill();ctx.strokeStyle='rgba(30,91,67,.55)';ctx.stroke();ctx.fillStyle='rgba(229,255,204,.54)';roundedRect(ctx,x+8,y+22,5,Math.max(3,h-28),3);ctx.fill();}
    for(const b of game.blocks){const y=b.y-(b.bump>0?Math.sin((b.bump/.19)*Math.PI)*7:0),base=b.used?'#9d7257':b.type==='question'?'#f6b94e':'#b76f52';const block=ctx.createLinearGradient(b.x,y,b.x+b.w,y+b.h);block.addColorStop(0,b.used?'#c99b6f':b.type==='question'?'#ffe27d':'#e99b69');block.addColorStop(.52,base);block.addColorStop(1,b.used?'#765644':'#854d4b');ctx.fillStyle=block;ctx.shadowColor=b.type==='question'&&!b.used?'rgba(255,202,88,.5)':'rgba(41,34,43,.28)';ctx.shadowBlur=b.type==='question'&&!b.used?9:6;ctx.shadowOffsetY=3;roundedRect(ctx,b.x,y,b.w,b.h,5);ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.strokeStyle=b.used?'rgba(91,65,53,.48)':'rgba(255,247,190,.92)';ctx.lineWidth=2;roundedRect(ctx,b.x+1,y+1,b.w-2,b.h-2,4);ctx.stroke();ctx.strokeStyle='rgba(105,64,51,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(b.x+5,y+5);ctx.lineTo(b.x+b.w-5,y+5);ctx.stroke();ctx.fillStyle=b.used?'#94694f':'#fff7ce';ctx.font='bold 21px sans-serif';ctx.textAlign='center';ctx.shadowColor='rgba(120,74,41,.4)';ctx.shadowBlur=4;ctx.fillText(b.used?'·':'?',b.x+16,y+23);ctx.shadowBlur=0;ctx.textAlign='left';}
    for(const [i,cp] of [l.checkpoint].entries())drawCheckpoint(cp,game.checkpointLit);
    drawGoal(l.goal,!!game.boss&&!game.boss.defeated);
    if(l.theme==='cave'||l.theme==='castle'){const px=game.player.x+game.player.w/2,py=game.player.y+game.player.h/2;const light=ctx.createRadialGradient(px,py,22,px,py,300);light.addColorStop(0,'rgba(255,224,151,.15)');light.addColorStop(1,'rgba(15,14,31,.72)');ctx.fillStyle=light;ctx.fillRect(game.cameraX,0,W,H);}
  }
  function drawPlatform(x,y,w,h,ground){
    const theme=game.level.theme,earth=game.level.earth;
    const palettes={cave:{top:'#a792b8',shade:'#72678e',mid:'#403b57',bottom:'#282d44',detail:'rgba(191,177,221,.45)'},lava:{top:'#d18468',shade:'#9f605f',mid:'#5b3c4b',bottom:'#382e40',detail:'rgba(255,192,143,.42)'},castle:{top:'#d18468',shade:'#9f605f',mid:'#5b3c4b',bottom:'#382e40',detail:'rgba(255,192,143,.42)'},ocean:{top:'#70d1c4',shade:'#348c8d',mid:'#315e70',bottom:'#203c55',detail:'rgba(129,242,215,.55)'},sky:{top:'#c1efff',shade:'#789fc2',mid:'#625879',bottom:'#3d4263',detail:'rgba(238,252,255,.62)'},desert:{top:'#edca83',shade:'#b28050',mid:'#835448',bottom:'#5a3f43',detail:'rgba(255,225,161,.55)'}};
    const colors=palettes[theme]||{top:'#91df8c',shade:'#58a96e',mid:'#725043',bottom:'#503d45',detail:'rgba(190,249,167,.65)'};
    const top=ground?game.level.groundColor:colors.top;
    const body=ctx.createLinearGradient(0,y,0,y+h);body.addColorStop(0,earth);body.addColorStop(.42,colors.mid);body.addColorStop(1,colors.bottom);
    ctx.save();ctx.shadowColor='rgba(22,34,43,.28)';ctx.shadowBlur=ground?12:9;ctx.shadowOffsetY=ground?7:5;ctx.fillStyle=body;roundedRect(ctx,x,y+3,w,Math.max(2,h-3),5);ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    const cap=ctx.createLinearGradient(0,y,0,y+Math.min(15,h));cap.addColorStop(0,top);cap.addColorStop(.46,top);cap.addColorStop(1,colors.shade);ctx.fillStyle=cap;roundedRect(ctx,x,y,w,Math.min(15,h),5);ctx.fill();
    ctx.fillStyle='rgba(255,255,240,.42)';roundedRect(ctx,x+4,y+2,Math.max(0,w-8),2,1);ctx.fill();ctx.fillStyle='rgba(20,31,42,.15)';ctx.fillRect(x+5,y+Math.min(13,h-1),Math.max(0,w-10),2);
    for(let bx=x+12;bx<x+w-7;bx+=31){const n=Math.abs(Math.sin(bx*12.9898+y*4.141));if(ground&&n>.52){ctx.strokeStyle=colors.detail;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(bx,y+2);ctx.quadraticCurveTo(bx-2,y-2-n*4,bx-4,y-5-n*4);ctx.moveTo(bx,y+2);ctx.quadraticCurveTo(bx+2,y-1-n*3,bx+4,y-4-n*3);ctx.stroke();}
      if(h>25&&n>.25){ctx.fillStyle='rgba(28,36,49,.24)';roundedRect(ctx,bx,y+19+(n*12),5+(n*5),2+(n*2),2);ctx.fill();ctx.fillStyle='rgba(255,226,183,.16)';ctx.fillRect(bx+2,y+18+n*12,2,1);}}
    ctx.strokeStyle='rgba(40,37,51,.28)';ctx.lineWidth=1;roundedRect(ctx,x+.5,y+.5,w-1,Math.max(1,h-1),5);ctx.stroke();ctx.restore();
  }
  function drawCheckpoint(x,lit){ctx.fillStyle='#a46950';ctx.fillRect(x,410,5,65);ctx.fillStyle=lit?'#ffdf6b':'#d8eee0';ctx.beginPath();ctx.moveTo(x+5,414);ctx.lineTo(x+47,425);ctx.lineTo(x+5,440);ctx.closePath();ctx.fill();ctx.fillStyle='#b89050';ctx.beginPath();ctx.arc(x+2,408,5,0,Math.PI*2);ctx.fill();}
  function drawGoal(x,locked){ctx.fillStyle='#795747';ctx.fillRect(x,360,8,115);ctx.fillStyle=locked?'#b68d67':'#ffcf50';ctx.beginPath();ctx.moveTo(x+8,363);ctx.lineTo(x+68,377);ctx.lineTo(x+8,398);ctx.closePath();ctx.fill();ctx.fillStyle='#f8edcb';ctx.beginPath();ctx.arc(x+25,381,4,0,Math.PI*2);ctx.fill();if(!game.boss){ctx.fillStyle='#ffe788';roundedRect(ctx,x+77,417,54,58,12);ctx.fill();ctx.fillStyle='#c8863c';ctx.beginPath();ctx.arc(x+104,443,5,0,Math.PI*2);ctx.fill();}}

  function drawCoin(c){const s=.26+.74*Math.abs(Math.sin(c.phase*2));ctx.save();ctx.translate(c.x,c.y);const pulse=.72+.28*Math.sin(c.phase*3);ctx.globalAlpha=.35*pulse;ctx.fillStyle='#ffd65f';ctx.shadowColor='#ffd967';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.shadowBlur=7;ctx.scale(s,1);const gold=ctx.createLinearGradient(-8,-12,8,12);gold.addColorStop(0,'#fff4a9');gold.addColorStop(.24,'#ffdc69');gold.addColorStop(.55,'#e99623');gold.addColorStop(.83,'#ffd450');gold.addColorStop(1,'#b96721');ctx.fillStyle=gold;ctx.beginPath();ctx.ellipse(0,0,8,11,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff0a4';ctx.lineWidth=1.8;ctx.stroke();ctx.fillStyle='rgba(255,255,232,.88)';ctx.fillRect(-1,-6,2,12);ctx.shadowBlur=0;if(s>.72){ctx.fillStyle='rgba(255,255,231,.78)';ctx.beginPath();ctx.arc(-3,-6,1.6,0,Math.PI*2);ctx.fill();}ctx.restore();}
  function drawPowerup(i){const x=i.x,y=i.y+Math.sin((i.phase||0)*3)*2;ctx.save();ctx.translate(x+14,y+14);if(i.type==='mushroom'||i.type==='life'){ctx.fillStyle=i.type==='life'?'#72c57c':'#e97a5f';ctx.beginPath();ctx.arc(0,-2,13,Math.PI,0);ctx.lineTo(13,4);ctx.lineTo(-13,4);ctx.closePath();ctx.fill();ctx.fillStyle='#fff5dd';ctx.fillRect(-9,3,18,12);ctx.fillStyle='#375650';ctx.fillRect(-5,0,3,4);ctx.fillRect(3,0,3,4);if(i.type==='life'){ctx.fillStyle='#f5dc70';ctx.beginPath();ctx.arc(0,-3,3,0,Math.PI*2);ctx.fill();}}
    else if(i.type==='fire'){ctx.fillStyle='#ff9e49';ctx.beginPath();ctx.moveTo(-9,11);ctx.quadraticCurveTo(-16,-2,-2,-14);ctx.quadraticCurveTo(-3,-3,5,-10);ctx.quadraticCurveTo(17,2,8,12);ctx.closePath();ctx.fill();ctx.fillStyle='#ffe88b';ctx.beginPath();ctx.moveTo(0,8);ctx.quadraticCurveTo(-7,0,2,-6);ctx.quadraticCurveTo(1,1,6,3);ctx.fill();}
    else {ctx.fillStyle='#ffe16a';ctx.shadowColor='#ffec6c';ctx.shadowBlur=12;ctx.beginPath();for(let n=0;n<10;n++){const a=-Math.PI/2+n*Math.PI/5,r=n%2?6:14;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-4,1,2,0,Math.PI*2);ctx.arc(4,1,2,0,Math.PI*2);ctx.fill();}ctx.restore();}

  function drawPlayer(){
    const p=game.player;if(!p)return;const x=p.x,y=p.y;if(p.invuln>0&&Math.floor(p.invuln*12)%2===0)return;
    const air=Math.max(0,Math.min(1,(475-(p.y+p.h))/160));ctx.save();ctx.globalAlpha=.28-air*.16;const shadow=ctx.createRadialGradient(x+p.w/2,y+p.h+7,2,x+p.w/2,y+p.h+7,23);shadow.addColorStop(0,'rgba(20,39,47,.58)');shadow.addColorStop(1,'rgba(20,39,47,0)');ctx.fillStyle=shadow;ctx.beginPath();ctx.ellipse(x+p.w/2,y+p.h+7,20-air*7,5-air*1.5,0,0,Math.PI*2);ctx.fill();ctx.restore();
    ctx.save();ctx.translate(x+p.w/2,y+p.h);if(p.facing<0)ctx.scale(-1,1);if(p.invincible>0){ctx.shadowColor='#fff181';ctx.shadowBlur=24;}
    const bodyH=p.big?40:31,headY=-p.h+5,faceY=-bodyH*.65,run=Math.abs(p.vx)>25&&p.grounded,step=run?Math.sin(p.runTime*13)*3:0;
    const body=ctx.createLinearGradient(-15,-bodyH,14,0);body.addColorStop(0,p.invincible>0?'#fff19b':p.big?'#9ce78b':'#b4ef99');body.addColorStop(.48,p.invincible>0?'#efbf4e':p.big?'#69c77c':'#73d28e');body.addColorStop(1,p.invincible>0?'#cd8546':p.big?'#388a70':'#408f72');
    ctx.fillStyle='rgba(38,66,65,.24)';ctx.beginPath();ctx.ellipse(0,-4,16,5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(0,-bodyH/2-2,14,bodyH/2+2,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(36,95,78,.62)';ctx.lineWidth=1.7;ctx.stroke();
    ctx.strokeStyle='rgba(220,255,183,.68)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-9,-bodyH+10);ctx.quadraticCurveTo(-13,-bodyH/2,-10,-8);ctx.stroke();
    const armSwing=run?Math.sin(p.runTime*13+Math.PI)*5:Math.sin(game.accumulator*2)*1.5;ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(-11,-bodyH*.57+armSwing,4,8,-.3,0,Math.PI*2);ctx.ellipse(12,-bodyH*.48-armSwing,4,8,.35,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(36,95,78,.4)';ctx.lineWidth=1;ctx.stroke();
    const leaf=ctx.createLinearGradient(-8,headY-14,11,headY+7);leaf.addColorStop(0,'#b3ed83');leaf.addColorStop(.47,'#67bf75');leaf.addColorStop(1,'#318364');ctx.fillStyle=leaf;ctx.beginPath();ctx.ellipse(-4,headY+2,8,12,-.5,0,Math.PI*2);ctx.ellipse(6,headY+1,7,11,.5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(37,111,77,.65)';ctx.lineWidth=1.2;ctx.stroke();ctx.strokeStyle='rgba(225,255,181,.62)';ctx.beginPath();ctx.moveTo(-3,headY+8);ctx.lineTo(-5,headY-5);ctx.moveTo(5,headY+8);ctx.lineTo(7,headY-5);ctx.stroke();
    const face=ctx.createRadialGradient(0,faceY-3,2,2,faceY+1,13);face.addColorStop(0,'#fffbe4');face.addColorStop(.72,'#f6e7c5');face.addColorStop(1,'#d9c89f');ctx.fillStyle=face;ctx.beginPath();ctx.ellipse(2,faceY,9,10,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(81,111,88,.5)';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(5,faceY-2,3.5,4.7,.15,0,Math.PI*2);ctx.fill();ctx.fillStyle='#315754';ctx.beginPath();ctx.ellipse(6,faceY-1,1.6,2.8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.arc(6.5,faceY-2,0.8,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(236,124,113,.5)';ctx.beginPath();ctx.ellipse(9,faceY+3,2.3,1.4,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#568b69';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(5,faceY+6,3.8,.2,1.1);ctx.stroke();
    const shoe=ctx.createLinearGradient(0,-8,0,-1);shoe.addColorStop(0,'#ffad74');shoe.addColorStop(1,'#ca514a');ctx.fillStyle=shoe;roundedRect(ctx,-15,-6+step,14,8,4);ctx.fill();roundedRect(ctx,2,-6-step,14,8,4);ctx.fill();ctx.strokeStyle='rgba(116,56,55,.58)';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='rgba(255,231,194,.8)';ctx.fillRect(-12,-5+step,7,1);ctx.fillRect(5,-5-step,7,1);
    if(p.fire){ctx.shadowColor='#ffbd4e';ctx.shadowBlur=10;const flame=ctx.createRadialGradient(-9,-bodyH*.53,1,-9,-bodyH*.53,6);flame.addColorStop(0,'#fff3a1');flame.addColorStop(1,'#f18a3c');ctx.fillStyle=flame;ctx.beginPath();ctx.arc(-9,-bodyH*.53,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
    ctx.restore();
  }
  function drawEnemy(e){
    if(!e.alive&&e.squish<=0)return;const x=e.x,y=e.y;ctx.save();ctx.translate(x+e.w/2,y+e.h);if(e.dir<0)ctx.scale(-1,1);if(!e.alive)ctx.scale(1,.25);
    const body=ctx.createLinearGradient(-18,-30,18,0);body.addColorStop(0,e.type==='flyer'?'#d4c6ff':e.type==='turtle'?'#a5dc87':e.type==='hopper'?'#ffe080':'#f2a37d');body.addColorStop(.5,e.type==='flyer'?'#9077c5':e.type==='turtle'?'#65a96b':e.type==='hopper'?'#d69a43':'#ca705f');body.addColorStop(1,e.type==='flyer'?'#554977':e.type==='turtle'?'#376d5b':e.type==='hopper'?'#946345':'#8f4d58');
    ctx.fillStyle='rgba(25,34,48,.18)';ctx.beginPath();ctx.ellipse(0,-2,18,4,0,0,Math.PI*2);ctx.fill();
    if(e.type==='flyer'){
      const wing=ctx.createLinearGradient(0,-30,0,-16);wing.addColorStop(0,'rgba(245,232,255,.95)');wing.addColorStop(1,'rgba(148,126,198,.35)');ctx.fillStyle=wing;ctx.beginPath();ctx.ellipse(-12,-25,10,4,-.5+Math.sin(e.phase*9)*.18,0,Math.PI*2);ctx.ellipse(12,-25,10,4,.5-Math.sin(e.phase*9)*.18,0,Math.PI*2);ctx.fill();ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(0,-14,17,13,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(56,47,88,.55)';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='rgba(255,255,255,.78)';ctx.beginPath();ctx.ellipse(-5,-18,4,5,0,0,Math.PI*2);ctx.ellipse(6,-18,4,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#443852';ctx.beginPath();ctx.arc(-4,-17,1.6,0,Math.PI*2);ctx.arc(7,-17,1.6,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,237,255,.7)';ctx.beginPath();ctx.moveTo(-10,-8);ctx.quadraticCurveTo(0,-4,10,-8);ctx.stroke();
    } else if(e.type==='turtle'){
      ctx.fillStyle='#d5b873';ctx.beginPath();ctx.ellipse(3,-8,18,10,0,0,Math.PI*2);ctx.fill();const shell=ctx.createLinearGradient(-14,-28,13,-7);shell.addColorStop(0,'#b3d878');shell.addColorStop(.5,'#538d60');shell.addColorStop(1,'#345b55');ctx.fillStyle=shell;ctx.beginPath();ctx.ellipse(-2,-15,17,e.shell?11:14,0,Math.PI,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(31,76,64,.72)';ctx.lineWidth=1.4;ctx.stroke();ctx.strokeStyle='rgba(205,232,143,.54)';ctx.beginPath();ctx.moveTo(-2,-27);ctx.lineTo(-2,-7);ctx.moveTo(-16,-15);ctx.lineTo(12,-15);ctx.moveTo(-12,-23);ctx.lineTo(8,-8);ctx.stroke();ctx.fillStyle=body;roundedRect(ctx,4,-19,16,12,5);ctx.fill();ctx.fillStyle='#fff6d9';ctx.beginPath();ctx.arc(13,-15,3.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#314c4d';ctx.beginPath();ctx.arc(14,-15,1.4,0,Math.PI*2);ctx.fill();
    } else {
      ctx.fillStyle=body;ctx.beginPath();ctx.moveTo(-17,-7);ctx.lineTo(-16,-18);ctx.quadraticCurveTo(-14,-31,0,-29);ctx.quadraticCurveTo(14,-31,17,-18);ctx.lineTo(17,-7);ctx.quadraticCurveTo(0,1,-17,-7);ctx.fill();ctx.strokeStyle='rgba(81,56,57,.55)';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#fff7e0';ctx.beginPath();ctx.ellipse(-5,-16,4,5,0,0,Math.PI*2);ctx.ellipse(6,-16,4,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#364d4a';ctx.beginPath();ctx.arc(-4,-15,1.7,0,Math.PI*2);ctx.arc(7,-15,1.7,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.arc(-4.5,-16,0.7,0,Math.PI*2);ctx.arc(6.5,-16,0.7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f9e9c5';ctx.beginPath();ctx.moveTo(-12,-25);ctx.lineTo(-10,-32);ctx.lineTo(-5,-25);ctx.closePath();ctx.moveTo(5,-25);ctx.lineTo(10,-33);ctx.lineTo(12,-25);ctx.closePath();ctx.fill();ctx.fillStyle=e.type==='hopper'?'#fff1a6':'#ffd3ae';ctx.beginPath();ctx.ellipse(-9,-4,6,3,0,0,Math.PI*2);ctx.ellipse(9,-4,6,3,0,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  function drawBoss(){
    const b=game.boss;if(!b||b.defeated)return;const x=b.x,y=b.y;ctx.save();ctx.translate(x+b.w/2,y+b.h);if(b.dir<0)ctx.scale(-1,1);if(b.flash>0&&Math.floor(b.flash*22)%2===0)ctx.globalAlpha=.55;
    ctx.shadowColor='rgba(255,112,71,.72)';ctx.shadowBlur=22;const armor=ctx.createLinearGradient(-44,-120,40,0);armor.addColorStop(0,'#b68b9b');armor.addColorStop(.34,'#765a82');armor.addColorStop(.72,'#4c4665');armor.addColorStop(1,'#2e344e');ctx.fillStyle=armor;ctx.beginPath();ctx.ellipse(0,-47,43,47,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,207,173,.55)';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='rgba(232,202,186,.28)';ctx.beginPath();ctx.ellipse(0,-47,31,32,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(239,202,155,.48)';ctx.lineWidth=1.5;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(0,-47,18+i*8,Math.PI*.15,Math.PI*.85);ctx.stroke();}
    const head=ctx.createLinearGradient(-25,-110,29,-56);head.addColorStop(0,'#91b68c');head.addColorStop(.5,'#587d76');head.addColorStop(1,'#344f5b');ctx.fillStyle=head;ctx.beginPath();ctx.arc(0,-91,30,Math.PI,Math.PI*2);ctx.lineTo(30,-70);ctx.quadraticCurveTo(0,-51,-30,-70);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(220,236,182,.5)';ctx.lineWidth=1.5;ctx.stroke();
    const crown=ctx.createLinearGradient(0,-132,0,-95);crown.addColorStop(0,'#fff0a1');crown.addColorStop(.5,'#e7b754');crown.addColorStop(1,'#a96a4d');ctx.fillStyle=crown;ctx.beginPath();ctx.moveTo(-25,-101);ctx.lineTo(-19,-126);ctx.lineTo(-5,-105);ctx.lineTo(1,-133);ctx.lineTo(13,-103);ctx.lineTo(25,-121);ctx.lineTo(28,-94);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(255,246,194,.78)';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#e97867';ctx.shadowColor='#ff775c';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(1,-111,4.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#fae7ce';ctx.beginPath();ctx.ellipse(13,-80,12,15,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3d364c';ctx.beginPath();ctx.arc(17,-78,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(18,-80,1.2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#332e46';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(5,-94);ctx.lineTo(24,-91);ctx.stroke();
    const boot=ctx.createLinearGradient(0,-14,0,1);boot.addColorStop(0,'#f2c57c');boot.addColorStop(1,'#a6664c');ctx.fillStyle=boot;ctx.beginPath();ctx.ellipse(-8,-5,17,9,0,0,Math.PI*2);ctx.ellipse(24,-5,15,9,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function drawEffects(){for(const s of game.projectiles){ctx.fillStyle='#fff09c';ctx.shadowColor='#ffad4e';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x-2,s.y-2,2,0,Math.PI*2);ctx.fill();}for(const s of game.enemyShots){ctx.fillStyle='#fa7651';ctx.shadowColor='#ff533a';ctx.shadowBlur=11;ctx.beginPath();ctx.ellipse(s.x,s.y,s.w/2,s.h/2,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}for(const p of game.particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}

  function drawScreenGrade(){
    if(!game.level||game.mode==='menu')return;ctx.save();
    const theme=game.level.theme,edge=ctx.createRadialGradient(W*.5,H*.46,H*.18,W*.5,H*.46,H*.78);edge.addColorStop(0,'rgba(15,27,39,0)');edge.addColorStop(.72,'rgba(15,27,39,.035)');edge.addColorStop(1,theme==='cave'||theme==='castle'?'rgba(9,12,30,.36)':'rgba(22,39,43,.2)');ctx.fillStyle=edge;ctx.fillRect(0,0,W,H);
    const warmth=ctx.createLinearGradient(0,H*.5,0,H);warmth.addColorStop(0,'rgba(255,255,255,0)');warmth.addColorStop(1,theme==='lava'?'rgba(255,115,65,.055)':'rgba(255,224,166,.045)');ctx.fillStyle=warmth;ctx.fillRect(0,H*.5,W,H*.5);ctx.restore();
  }

  function render(){
    ctx.clearRect(0,0,W,H);
    const shake=game.shake>0?(Math.random()-.5)*game.shake*25:0;
    ctx.save();ctx.translate(shake,0);drawBackground();
    if(game.level){ctx.save();ctx.translate(-game.cameraX,0);if(game.level.theme==='cave'||game.level.theme==='castle')ctx.shadowColor='#5c526f';drawWorld();game.coins?.forEach(c=>c.alive&&drawCoin(c));game.powerups?.forEach(i=>i.alive&&drawPowerup(i));game.enemies?.forEach(drawEnemy);drawBoss();drawEffects();drawPlayer();ctx.restore();}
    drawScreenGrade();
    ctx.restore();
    if(game.mode==='menu'){
      // Give the title screen a little more life behind the paper-like menu panel.
      const t=performance.now()/1000;ctx.fillStyle='rgba(255,255,255,.38)';
      for(let i=0;i<8;i++){const x=(i*147+t*10)%W;ctx.beginPath();ctx.arc(x,80+Math.sin(t+i)*23,2+(i%2),0,Math.PI*2);ctx.fill();}
    }
  }

  function frame(now){const dt=Math.min(.033,(now-game.lastTime)/1000||0);game.lastTime=now;game.accumulator+=dt;update(dt);render();requestAnimationFrame(frame);}
  $('#sound-button').innerHTML = `${game.muted ? '♫̸' : '♫'} <span>Sound ${game.muted ? 'off' : 'on'}</span>`;
  $('#unlocked-label').textContent = `${String(game.unlocked).padStart(2,'0')} / ${String(levelBook.length).padStart(2,'0')}`;
  game.level=structuredClone(levelBook[0]);game.player=freshPlayer();game.enemies=[];game.coins=[];game.powerups=[];game.moving=[];game.blocks=[];game.levelIndex=0;
  requestAnimationFrame(frame);
})();
