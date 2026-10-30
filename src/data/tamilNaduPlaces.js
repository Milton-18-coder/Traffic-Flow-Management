/**
 * Comprehensive Tamil Nadu City, Municipality & District Database
 * Covers all 38 Districts, Major Municipalities, Industrial Hubs & Tourist Centers.
 * Allows users to select, search, or calculate routes to ANY location across Tamil Nadu.
 */

export const TAMIL_NADU_ALL_PLACES = [
  // ================= 1. MAJOR CORPORATIONS & METROPOLITAN HUBS =================
  { id: 'CHN', name: 'Chennai Central', district: 'Chennai', lat: 13.0827, lng: 80.2707, type: 'transit', desc: 'State Capital, Port Gateway & Central Hub' },
  { id: 'CBE', name: 'Coimbatore', district: 'Coimbatore', lat: 11.0168, lng: 76.9558, type: 'commercial', desc: 'Manchester of South India & Tech Hub' },
  { id: 'MDU', name: 'Madurai', district: 'Madurai', lat: 9.9252, lng: 78.1198, type: 'commercial', desc: 'Temple City & Southern Cultural Capital' },
  { id: 'TRY', name: 'Tiruchirappalli (Trichy)', district: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, type: 'transit', desc: 'Heart of Tamil Nadu & Cauvery Basin Hub' },
  { id: 'SLM', name: 'Salem', district: 'Salem', lat: 11.6643, lng: 78.1460, type: 'industrial', desc: 'Steel City & Western Express Crossroads' },
  { id: 'TIR', name: 'Tirunelveli', district: 'Tirunelveli', lat: 8.7139, lng: 77.7567, type: 'transit', desc: 'Southern Highway Gateway & Halwa City' },
  { id: 'ERD', name: 'Erode', district: 'Erode', lat: 11.3410, lng: 77.7172, type: 'industrial', desc: 'Textile Capital & Kaveri Industrial Basin' },
  { id: 'TPR', name: 'Tiruppur', district: 'Tiruppur', lat: 11.1085, lng: 77.3411, type: 'industrial', desc: 'Knitwear & Apparel Export Capital' },
  { id: 'VEL', name: 'Vellore', district: 'Vellore', lat: 12.9165, lng: 79.1325, type: 'civic', desc: 'Fort City & Golden Quadrilateral Hub' },
  { id: 'THJ', name: 'Thanjavur', district: 'Thanjavur', lat: 10.7870, lng: 79.1378, type: 'civic', desc: 'Chola Heritage & Rice Bowl of Tamil Nadu' },
  { id: 'DGL', name: 'Dindigul', district: 'Dindigul', lat: 10.3673, lng: 77.9803, type: 'industrial', desc: 'Lock City & NH-44 Southern Expressway Link' },
  { id: 'TUT', name: 'Thoothukudi (Tuticorin)', district: 'Thoothukudi', lat: 8.7642, lng: 78.1348, type: 'commercial', desc: 'Pearl City & Major Deepwater Seaport' },
  { id: 'KAN', name: 'Kanchipuram', district: 'Kanchipuram', lat: 12.8342, lng: 79.7036, type: 'commercial', desc: 'Silk City & Western Highway Corridor' },
  { id: 'TVM', name: 'Tiruvannamalai', district: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747, type: 'civic', desc: 'Spiritual Capital & Annamalaiyar Heritage' },
  { id: 'VPM', name: 'Villupuram', district: 'Villupuram', lat: 11.9401, lng: 79.4861, type: 'transit', desc: 'Central Railway Junction & NH-45 Arterial' },
  { id: 'CUD', name: 'Cuddalore', district: 'Cuddalore', lat: 11.7480, lng: 79.7714, type: 'commercial', desc: 'East Coast Port & Silver Beach Corridor' },

  // ================= 2. SOUTHERN TAMIL NADU HUBS (INCLUDING KOVILPATTI) =================
  { id: 'KVP', name: 'Kovilpatti', district: 'Thoothukudi', lat: 9.1727, lng: 77.8682, type: 'industrial', desc: 'Matchstick & Kadalai Mittai Hub, NH-44 Highway Corridor' },
  { id: 'STR', name: 'Sattur', district: 'Virudhunagar', lat: 9.3639, lng: 77.9272, type: 'industrial', desc: 'Fountain Pen & Kara Sevu Hub on NH-44' },
  { id: 'VRD', name: 'Virudhunagar', district: 'Virudhunagar', lat: 9.5680, lng: 77.9624, type: 'commercial', desc: 'Trade Capital & NH-44 Four-Lane Corridor' },
  { id: 'SVK', name: 'Sivakasi', district: 'Virudhunagar', lat: 9.4533, lng: 77.7972, type: 'industrial', desc: 'Printing & Industrial Fireworks Capital' },
  { id: 'RJP', name: 'Rajapalayam', district: 'Virudhunagar', lat: 9.4533, lng: 77.5540, type: 'commercial', desc: 'Textile Mills & Western Ghats Gateway' },
  { id: 'SVP', name: 'Srivilliputhur', district: 'Virudhunagar', lat: 9.5103, lng: 77.6322, type: 'civic', desc: 'Andal Temple Gopuram (TN State Emblem) & Palkova City' },
  { id: 'APK', name: 'Aruppukkottai', district: 'Virudhunagar', lat: 9.5107, lng: 78.0988, type: 'industrial', desc: 'Handloom & Textile Weaving Center' },
  { id: 'TEN', name: 'Tenkasi', district: 'Tenkasi', lat: 8.9594, lng: 77.3161, type: 'civic', desc: 'Kasi Viswanathar Temple & Western Ghats Gateway' },
  { id: 'SKV', name: 'Sankarankovil', district: 'Tenkasi', lat: 9.1706, lng: 77.5333, type: 'civic', desc: 'Sankara Narayanan Temple Heritage Town' },
  { id: 'SGT', name: 'Sengottai', district: 'Tenkasi', lat: 8.9806, lng: 77.2472, type: 'transit', desc: 'Ghat Pass Gateway to Kerala & Aryankavu' },
  { id: 'CTM', name: 'Courtallam', district: 'Tenkasi', lat: 8.9312, lng: 77.2743, type: 'civic', desc: 'Spa of South India & Natural Waterfalls' },
  { id: 'TCD', name: 'Tiruchendur', district: 'Thoothukudi', lat: 8.4975, lng: 78.1228, type: 'civic', desc: 'Lord Murugan Seashore Temple & Pilgrimage Hub' },
  { id: 'KYP', name: 'Kayalpattinam', district: 'Thoothukudi', lat: 8.5714, lng: 78.1361, type: 'commercial', desc: 'Historic Maritime Port on Gulf of Mannar' },
  { id: 'ABS', name: 'Ambasamudram', district: 'Tirunelveli', lat: 8.7075, lng: 77.4560, type: 'civic', desc: 'Thamirabarani River Valley Agricultural Hub' },
  { id: 'VLR', name: 'Valliyur', district: 'Tirunelveli', lat: 8.3789, lng: 77.6152, type: 'transit', desc: 'NH-44 Express Hub near Southern Tip' },
  { id: 'NGN', name: 'Nanguneri', district: 'Tirunelveli', lat: 8.4897, lng: 77.6582, type: 'industrial', desc: 'Vanamamalai Perumal Temple & SEZ Tech Hub' },
  { id: 'KYK', name: 'Kanyakumari', district: 'Kanyakumari', lat: 8.0883, lng: 77.5385, type: 'transit', desc: 'Cape Comorin & Southernmost Tip of India' },
  { id: 'NAG', name: 'Nagercoil', district: 'Kanyakumari', lat: 8.1833, lng: 77.4119, type: 'commercial', desc: 'Administrative & Agricultural Headquarters' },
  { id: 'MTD', name: 'Marthandam', district: 'Kanyakumari', lat: 8.3094, lng: 77.2217, type: 'commercial', desc: 'Honey Capital & NH-66 Commercial Corridor' },

  // ================= 3. CENTRAL DELTA & CAUVERY BASIN =================
  { id: 'KMB', name: 'Kumbakonam', district: 'Thanjavur', lat: 10.9602, lng: 79.3845, type: 'civic', desc: 'Temple Town, Brassware & Mahamaham Delta Center' },
  { id: 'PKT', name: 'Pattukkottai', district: 'Thanjavur', lat: 10.4286, lng: 79.3175, type: 'commercial', desc: 'Delta Agricultural & Coconut Hub' },
  { id: 'TVR', name: 'Tiruvarur', district: 'Tiruvarur', lat: 10.7725, lng: 79.6365, type: 'civic', desc: 'Thyagaraja Chariot Temple Heritage Center' },
  { id: 'MNG', name: 'Mannargudi', district: 'Tiruvarur', lat: 10.6667, lng: 79.4500, type: 'civic', desc: 'Rajagopalaswamy Temple & Rice Granary' },
  { id: 'TTP', name: 'Thiruthuraipoondi', district: 'Tiruvarur', lat: 10.5333, lng: 79.6500, type: 'transit', desc: 'Muthupet Mangrove Gateway & Delta Way' },
  { id: 'NGP', name: 'Nagapattinam', district: 'Nagapattinam', lat: 10.7672, lng: 79.8449, type: 'commercial', desc: 'Port Town & Maritime Heritage Center' },
  { id: 'VLK', name: 'Velankanni', district: 'Nagapattinam', lat: 10.6800, lng: 79.8500, type: 'civic', desc: 'Basilica of Our Lady of Good Health Pilgrimage' },
  { id: 'VDN', name: 'Vedaranyam', district: 'Nagapattinam', lat: 10.3750, lng: 79.8500, type: 'civic', desc: 'Salt March Memorial & Point Calimere Sanctuary' },
  { id: 'MYL', name: 'Mayiladuthurai', district: 'Mayiladuthurai', lat: 11.1075, lng: 79.6524, type: 'transit', desc: 'Cauvery Delta Northern Rail Junction' },
  { id: 'SKZ', name: 'Sirkazhi', district: 'Mayiladuthurai', lat: 11.2333, lng: 79.7333, type: 'civic', desc: 'Brahmapureeswarar Temple & Music Heritage' },
  { id: 'PUD', name: 'Pudukkottai', district: 'Pudukkottai', lat: 10.3797, lng: 78.8208, type: 'civic', desc: 'Historical Royal Principality & Rock-Cut Art' },
  { id: 'ATG', name: 'Aranthangi', district: 'Pudukkottai', lat: 10.1636, lng: 78.9950, type: 'commercial', desc: 'Southern Delta Transit & Agricultural Hub' },
  { id: 'KKD', name: 'Karaikudi', district: 'Sivaganga', lat: 10.0735, lng: 78.7732, type: 'civic', desc: 'Chettinad Heritage Capital, Palaces & Education Hub' },
  { id: 'SVG', name: 'Sivaganga', district: 'Sivaganga', lat: 9.8483, lng: 78.4833, type: 'civic', desc: 'Maruthu Pandiyar Memorial & District Capital' },
  { id: 'RMD', name: 'Ramanathapuram', district: 'Ramanathapuram', lat: 9.3639, lng: 78.8395, type: 'commercial', desc: 'Coastal Gateway & Sethu Expressway' },
  { id: 'RAM', name: 'Rameswaram', district: 'Ramanathapuram', lat: 9.2876, lng: 79.3129, type: 'civic', desc: 'Pamban Sea Bridge & Ramanathaswamy Temple' },
  { id: 'PMK', name: 'Paramakudi', district: 'Ramanathapuram', lat: 9.5447, lng: 78.5911, type: 'commercial', desc: 'Vaigai River Trade & Weaving Center' },

  // ================= 4. WESTERN INDUSTRIAL & HILL CORRIDOR =================
  { id: 'PLC', name: 'Pollachi', district: 'Coimbatore', lat: 10.6609, lng: 77.0048, type: 'commercial', desc: 'Coconut Capital, Anamalai Tiger Reserve Gateway' },
  { id: 'MTP', name: 'Mettupalayam', district: 'Coimbatore', lat: 11.3000, lng: 76.9500, type: 'transit', desc: 'Nilgiri Mountain Railway Foothill Junction' },
  { id: 'VLP', name: 'Valparai', district: 'Coimbatore', lat: 10.3267, lng: 76.9554, type: 'civic', desc: 'Anamalai Tea Plantation Hill Station' },
  { id: 'OOT', name: 'Ooty (Udhagamandalam)', district: 'Nilgiris', lat: 11.4102, lng: 76.6950, type: 'civic', desc: 'Queen of Hill Stations, Nilgiris' },
  { id: 'CNR', name: 'Coonoor', district: 'Nilgiris', lat: 11.3530, lng: 76.7959, type: 'civic', desc: 'Tea Gardens & Sim Park Hill Haven' },
  { id: 'KOD', name: 'Kodaikanal', district: 'Dindigul', lat: 10.2381, lng: 77.4892, type: 'civic', desc: 'Princess of Hill Stations, Palani Hills' },
  { id: 'PLN', name: 'Palani', district: 'Dindigul', lat: 10.4500, lng: 77.5167, type: 'civic', desc: 'Dhandayuthapani Murugan Temple Hill Shrine' },
  { id: 'THN', name: 'Theni', district: 'Theni', lat: 10.0104, lng: 77.4768, type: 'commercial', desc: 'Cardamom & Cotton Gateway to Kerala' },
  { id: 'BDN', name: 'Bodinayakanur', district: 'Theni', lat: 10.0104, lng: 77.3500, type: 'commercial', desc: 'Cardamom City of India at Foot of Western Ghats' },
  { id: 'CUM', name: 'Cumbum', district: 'Theni', lat: 9.7347, lng: 77.2811, type: 'commercial', desc: 'Cumbum Grape Valley & Agricultural Center' },
  { id: 'AVN', name: 'Avinashi', district: 'Tiruppur', lat: 11.1930, lng: 77.2690, type: 'transit', desc: 'NH-544 6-Lane Industrial Expressway Hub' },
  { id: 'DHP', name: 'Dharapuram', district: 'Tiruppur', lat: 10.7300, lng: 77.5300, type: 'commercial', desc: 'Amaravathi River Agricultural & Textile Belt' },
  { id: 'KNG', name: 'Kangeyam', district: 'Tiruppur', lat: 11.0050, lng: 77.5600, type: 'industrial', desc: 'Kangeyam Bull Capital & Rice Mill Hub' },
  { id: 'BHV', name: 'Bhavani', district: 'Erode', lat: 11.4500, lng: 77.6833, type: 'commercial', desc: 'Sangameswarar Triveni Sangam & Carpet Town' },
  { id: 'GBC', name: 'Gobichettipalayam', district: 'Erode', lat: 11.4500, lng: 77.4333, type: 'commercial', desc: 'Cinema City & Silk Cocoon Market' },
  { id: 'STM', name: 'Sathyamangalam', district: 'Erode', lat: 11.5033, lng: 77.2344, type: 'transit', desc: 'Tiger Reserve Foothills & Bannari Amman Shrine' },
  { id: 'KAR', name: 'Karur', district: 'Karur', lat: 10.9601, lng: 78.0766, type: 'industrial', desc: 'Home Textile Export Hub on Amaravathi River' },
  { id: 'KLT', name: 'Kulithalai', district: 'Karur', lat: 10.9300, lng: 78.4200, type: 'transit', desc: 'Cauvery River Agricultural Crossing' },

  // ================= 5. NORTHERN & INDUSTRIAL CORRIDORS =================
  { id: 'HSR', name: 'Hosur', district: 'Krishnagiri', lat: 12.7409, lng: 77.8253, type: 'industrial', desc: 'Automobile & Electronics Manufacturing Hub' },
  { id: 'KRI', name: 'Krishnagiri', district: 'Krishnagiri', lat: 12.5186, lng: 78.2137, type: 'transit', desc: 'Mango Capital & NH-44 Express Arterial' },
  { id: 'DHA', name: 'Dharmapuri', district: 'Dharmapuri', lat: 12.1211, lng: 78.1582, type: 'transit', desc: 'Hogenakkal Falls Gateway & NH-44 Corridor' },
  { id: 'HAR', name: 'Harur', district: 'Dharmapuri', lat: 12.0622, lng: 78.4900, type: 'civic', desc: 'Theerthamalai Temple & Ghat Pass Highway' },
  { id: 'NMK', name: 'Namakkal', district: 'Namakkal', lat: 11.2189, lng: 78.1674, type: 'industrial', desc: 'Poultry & Truck Transport Capital, NH-44 Link' },
  { id: 'TCG', name: 'Tiruchengode', district: 'Namakkal', lat: 11.3800, lng: 77.8900, type: 'industrial', desc: 'Rig Drilling Capital & Ardhanareeswarar Shrine' },
  { id: 'RSP', name: 'Rasipuram', district: 'Namakkal', lat: 11.4644, lng: 78.1750, type: 'commercial', desc: 'Sago & Kolli Hills Gateway' },
  { id: 'MTR', name: 'Mettur', district: 'Salem', lat: 11.7950, lng: 77.8000, type: 'industrial', desc: 'Stanley Reservoir Dam & Chemical Industrial Belt' },
  { id: 'ATR', name: 'Attur', district: 'Salem', lat: 11.5975, lng: 78.5986, type: 'transit', desc: 'Vashista River Sago Hub & NH-79 Expressway' },
  { id: 'YRC', name: 'Yercaud', district: 'Salem', lat: 11.7753, lng: 78.2093, type: 'civic', desc: 'Jewel of the South, Shevaroy Hills' },
  { id: 'PER', name: 'Perambalur', district: 'Perambalur', lat: 11.2342, lng: 78.8821, type: 'transit', desc: 'NH-45 Express Center Point' },
  { id: 'ARI', name: 'Ariyalur', district: 'Ariyalur', lat: 11.1401, lng: 79.0786, type: 'industrial', desc: 'Cement Manufacturing Capital & Fossil Belt' },
  { id: 'JKD', name: 'Jayankondam', district: 'Ariyalur', lat: 11.2167, lng: 79.3500, type: 'civic', desc: 'Gangaikonda Cholapuram World Heritage Temple' },
  { id: 'KLK', name: 'Kallakurichi', district: 'Kallakurichi', lat: 11.7383, lng: 78.9639, type: 'transit', desc: 'Kalvarayan Hills Gateway & NH-79' },
  { id: 'ULD', name: 'Ulundurpet', district: 'Kallakurichi', lat: 11.6883, lng: 79.2900, type: 'transit', desc: 'NH-45 & NH-79 Strategic Highway Junction' },
  { id: 'CDM', name: 'Chidambaram', district: 'Cuddalore', lat: 11.3992, lng: 79.6936, type: 'civic', desc: 'Thillai Nataraja Temple & Annamalai University' },
  { id: 'NVL', name: 'Neyveli', district: 'Cuddalore', lat: 11.5372, lng: 79.4861, type: 'industrial', desc: 'Lignite Mining & Thermal Energy Township' },
  { id: 'TDV', name: 'Tindivanam', district: 'Villupuram', lat: 12.2286, lng: 79.6500, type: 'transit', desc: 'NH-45 & NH-66 Major North-South Crossroads' },
  { id: 'GNG', name: 'Gingee', district: 'Villupuram', lat: 12.2533, lng: 79.4183, type: 'civic', desc: 'Troy of the East Historic Hill Fort' },
  { id: 'RPT', name: 'Ranipet', district: 'Ranipet', lat: 12.9224, lng: 79.3328, type: 'industrial', desc: 'Leather Export & Engineering Industrial Belt' },
  { id: 'WLP', name: 'Walajapet', district: 'Ranipet', lat: 12.9250, lng: 79.3800, type: 'transit', desc: 'Oldest Municipality in TN on NH-48' },
  { id: 'AKM', name: 'Arakkonam', district: 'Ranipet', lat: 13.0786, lng: 79.6681, type: 'transit', desc: 'Major Railway Junction & INS Rajali Naval Air Station' },
  { id: 'SHL', name: 'Sholinghur', district: 'Ranipet', lat: 13.1133, lng: 79.4267, type: 'civic', desc: 'Yoga Narasimha Hill Temple & Industrial Foundry' },
  { id: 'TPT', name: 'Tirupattur', district: 'Tirupattur', lat: 12.4965, lng: 78.5724, type: 'transit', desc: 'Yelagiri Hills Gateway & Railway Hub' },
  { id: 'AMB', name: 'Ambur', district: 'Tirupattur', lat: 12.7904, lng: 78.7166, type: 'industrial', desc: 'Leather Shoes Export Capital & Ambur Biryani' },
  { id: 'VNB', name: 'Vaniyambadi', district: 'Tirupattur', lat: 12.6825, lng: 78.6203, type: 'industrial', desc: 'Palar River Leather Hub on NH-48' },
  { id: 'KTP', name: 'Katpadi', district: 'Vellore', lat: 12.9806, lng: 79.1353, type: 'transit', desc: 'VIT University & Major Northern Rail Junction' },
  { id: 'GDM', name: 'Gudiyatham', district: 'Vellore', lat: 12.9467, lng: 78.8717, type: 'industrial', desc: 'Matchstick & Handloom Weaving Center' },
  { id: 'ARN', name: 'Arani', district: 'Tiruvannamalai', lat: 12.6700, lng: 79.2800, type: 'industrial', desc: 'Arani Silk Sarees & Rice Mill Capital' },
  { id: 'CYR', name: 'Cheyyar', district: 'Tiruvannamalai', lat: 12.6583, lng: 79.5417, type: 'industrial', desc: 'SIPCOT Industrial Park & Vedapureeswarar Temple' },
  { id: 'PLR', name: 'Polur', district: 'Tiruvannamalai', lat: 12.5083, lng: 79.1250, type: 'transit', desc: 'NH-234 Vellore-Tiruvannamalai Highway Hub' },
  { id: 'VDV', name: 'Vandavasi', district: 'Tiruvannamalai', lat: 12.5000, lng: 79.6100, type: 'civic', desc: 'Battle of Wandiwash Historic Fort Town' },

  // ================= 6. CHENNAI METROPOLITAN REGION =================
  { id: 'TBM', name: 'Tambaram', district: 'Chengalpattu', lat: 12.9249, lng: 80.1000, type: 'transit', desc: 'Southern Gateway Terminal & GST Road Corridors' },
  { id: 'CGL', name: 'Chengalpattu', district: 'Chengalpattu', lat: 12.6841, lng: 79.9836, type: 'transit', desc: 'GST Road NH-32 Junction & Kolavai Lake' },
  { id: 'SPB', name: 'Sriperumbudur', district: 'Kanchipuram', lat: 12.9699, lng: 79.9400, type: 'industrial', desc: 'Automobile Manufacturing & High-Tech SEZ' },
  { id: 'MAM', name: 'Mahabalipuram (Mamallapuram)', district: 'Chengalpattu', lat: 12.6269, lng: 80.1927, type: 'civic', desc: 'UNESCO Shore Temple & ECR Coastal Paradise' },
  { id: 'KPK', name: 'Kalpakkam', district: 'Chengalpattu', lat: 12.5186, lng: 80.1742, type: 'industrial', desc: 'Madras Atomic Power Station & Research Hub' },
  { id: 'MDT', name: 'Madurantakam', district: 'Chengalpattu', lat: 12.5097, lng: 79.8847, type: 'civic', desc: 'Eri Katha Ramar Temple & Vedanthangal Bird Sanctuary' },
  { id: 'MMR', name: 'Melmaruvathur', district: 'Chengalpattu', lat: 12.4419, lng: 79.8317, type: 'civic', desc: 'Adhiparasakthi Siddhar Peetam Pilgrimage' },
  { id: 'AVD', name: 'Avadi', district: 'Tiruvallur', lat: 13.1147, lng: 80.1098, type: 'industrial', desc: 'Heavy Vehicles Factory (Battle Tanks) & Military Hub' },
  { id: 'PNM', name: 'Poonamallee', district: 'Tiruvallur', lat: 13.0489, lng: 80.1100, type: 'transit', desc: 'Western Arterial Gateway to Chennai' },
  { id: 'TVL', name: 'Tiruvallur', district: 'Tiruvallur', lat: 13.1438, lng: 79.9083, type: 'industrial', desc: 'Veeraraghava Perumal Temple & Industrial Belt' },
  { id: 'TTN', name: 'Tiruttani', district: 'Tiruvallur', lat: 13.1789, lng: 79.6106, type: 'civic', desc: 'Fifth Arupadaiveedu Murugan Hill Temple' },
  { id: 'PNR', name: 'Ponneri', district: 'Tiruvallur', lat: 13.3333, lng: 80.2000, type: 'industrial', desc: 'Northern Industrial Corridor & Pulicat Lake' },
  { id: 'GMD', name: 'Gummidipoondi', district: 'Tiruvallur', lat: 13.4072, lng: 80.1286, type: 'industrial', desc: 'SIPCOT Industrial Park & Andhra Pradesh Border' },

  // ================= 7. COASTAL & UNION TERRITORY HUBS =================
  { id: 'PDY', name: 'Puducherry (Pondicherry)', district: 'Puducherry', lat: 11.9416, lng: 79.8083, type: 'civic', desc: 'French Quarter, Promenade Beach & Sri Aurobindo Ashram' },
  { id: 'AVR', name: 'Auroville', district: 'Viluppuram', lat: 12.0069, lng: 79.8106, type: 'civic', desc: 'City of Dawn & Matrimandir International Township' },
  { id: 'KKL', name: 'Karaikal', district: 'Karaikal', lat: 10.9254, lng: 79.8380, type: 'transit', desc: 'Deepwater Port & Thirunallar Saneeswara Shrine' }
];

/**
 * Calculates Haversine great-circle distance between any 2 coordinates in km
 */
export function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}
