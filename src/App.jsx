import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Check, ChevronDown, Eye, EyeOff, GripVertical, Minus, Pause, Play,
  Plus, RotateCcw, Settings as SettingsIcon, Trash2, Users, X, Languages,
  Volume2, VolumeX, Vibrate, Moon, Sun, Trophy, Clock3, Sparkles, Pencil,
  ShieldAlert, Search, PartyPopper, ChevronLeft, ChevronRight
} from "lucide-react";

/* ============================== DATA: 32 THEMES ============================== */
const THEMES = [
  {id:"animals",emoji:"🐾",color:"#22c55e",name:{ru:"Животные",en:"Animals",tj:"Ҳайвонот"},words:{ru:["Жираф","Слон","Лев","Тигр","Зебра","Крокодил","Пингвин","Дельфин","Кит","Акула","Орёл","Сова","Волк","Лиса","Медведь","Панда","Коала","Кенгуру","Черепаха","Змея"],en:["Giraffe","Elephant","Lion","Tiger","Zebra","Crocodile","Penguin","Dolphin","Whale","Shark","Eagle","Owl","Wolf","Fox","Bear","Panda","Koala","Kangaroo","Turtle","Snake"],tj:["Зурофа","Фил","Шер","Паланг","Зебра","Тимсоҳ","Пингвин","Делфин","Наҳанг","Акула","Уқоб","Бум","Гург","Рӯбоҳ","Хирс","Панда","Коала","Кенгуру","Сангпушт","Мор"]}},
  {id:"food",emoji:"🍔",color:"#f97316",name:{ru:"Еда и напитки",en:"Food & Drinks",tj:"Хӯрок ва нӯшокӣ"},words:{ru:["Пицца","Суши","Борщ","Плов","Тако","Бургер","Паста","Шоколад","Мороженое","Кофе","Чай","Смузи","Блины","Пельмени","Салат","Стейк","Круассан","Мёд","Йогурт","Попкорн"],en:["Pizza","Sushi","Borscht","Pilaf","Taco","Burger","Pasta","Chocolate","Ice cream","Coffee","Tea","Smoothie","Pancakes","Dumplings","Salad","Steak","Croissant","Honey","Yogurt","Popcorn"],tj:["Питса","Суши","Борщ","Ош","Тако","Бургер","Макарон","Шоколад","Яхмос","Қаҳва","Чой","Смузи","Панкейк","Пелмени","Салат","Стейк","Круассан","Асал","Ҷурғот","Попкорн"]}},
  {id:"professions",emoji:"👷",color:"#3b82f6",name:{ru:"Профессии",en:"Professions",tj:"Касбҳо"},words:{ru:["Врач","Учитель","Пожарный","Пилот","Повар","Программист","Актёр","Музыкант","Полицейский","Строитель","Фермер","Журналист","Юрист","Парикмахер","Архитектор","Ветеринар","Астронавт","Художник","Электрик","Садовник"],en:["Doctor","Teacher","Firefighter","Pilot","Chef","Programmer","Actor","Musician","Police officer","Builder","Farmer","Journalist","Lawyer","Hairdresser","Architect","Veterinarian","Astronaut","Artist","Electrician","Gardener"],tj:["Табиб","Муаллим","Оташнишон","Халабон","Ошпаз","Барномасоз","Актёр","Мусиқачӣ","Милитсионер","Бинокор","Деҳқон","Рӯзноманигор","Ҳуқуқшинос","Сартарош","Меъмор","Духтури байторӣ","Астронавт","Рассом","Барқчӣ","Боғбон"]}},
  {id:"sport",emoji:"⚽",color:"#ef4444",name:{ru:"Спорт",en:"Sport",tj:"Варзиш"},words:{ru:["Футбол","Баскетбол","Теннис","Плавание","Бокс","Хоккей","Волейбол","Гимнастика","Бег","Йога","Лыжи","Сёрфинг","Дзюдо","Гольф","Бадминтон","Регби","Скалолазание","Фигурное катание","Велоспорт","Стрельба из лука"],en:["Football","Basketball","Tennis","Swimming","Boxing","Hockey","Volleyball","Gymnastics","Running","Yoga","Skiing","Surfing","Judo","Golf","Badminton","Rugby","Rock climbing","Figure skating","Cycling","Archery"],tj:["Футбол","Баскетбол","Теннис","Шиноварӣ","Бокс","Хоккей","Волейбол","Гимнастика","Давидан","Йога","Лижаронӣ","Мавҷсаворӣ","Дзюдо","Гольф","Бадминтон","Регби","Кӯҳнавардӣ","Пайраҳаронии рӯи ях","Велоспорт","Тирандозӣ аз камон"]}},
  {id:"transport",emoji:"🚗",color:"#0ea5e9",name:{ru:"Транспорт",en:"Transport",tj:"Нақлиёт"},words:{ru:["Автомобиль","Автобус","Поезд","Самолёт","Корабль","Велосипед","Мотоцикл","Вертолёт","Метро","Трамвай","Такси","Подводная лодка","Воздушный шар","Ракета","Скутер","Грузовик","Паром","Канатная дорога","Электросамокат","Сани"],en:["Car","Bus","Train","Airplane","Ship","Bicycle","Motorcycle","Helicopter","Subway","Tram","Taxi","Submarine","Hot air balloon","Rocket","Scooter","Truck","Ferry","Cable car","Electric scooter","Sled"],tj:["Мошин","Автобус","Қатора","Ҳавопаймо","Киштӣ","Велосипед","Мотоцикл","Чархболад","Метро","Трамвай","Такси","Зериобхока","Балони ҳавоӣ","Ракета","Скутер","Мошини боркаш","Паром","Роҳи ресмонӣ","Скутери барқӣ","Чана"]}},
  {id:"space",emoji:"🚀",color:"#8b5cf6",name:{ru:"Космос",en:"Space",tj:"Кайҳон"},words:{ru:["Луна","Марс","Комета","Астероид","Галактика","Чёрная дыра","Спутник","Скафандр","Метеорит","Созвездие","Телескоп","Сатурн","Млечный путь","Невесомость","Ракета","Орбита","Солнце","Туманность","Астронавт","Затмение"],en:["Moon","Mars","Comet","Asteroid","Galaxy","Black hole","Satellite","Spacesuit","Meteorite","Constellation","Telescope","Saturn","Milky Way","Weightlessness","Rocket","Orbit","Sun","Nebula","Astronaut","Eclipse"],tj:["Моҳ","Миррих","Комета","Астероид","Каҳкашон","Сӯрохи сиёҳ","Моҳвора","Либоси кайҳонӣ","Метеорит","Бурҷ","Телескоп","Зуҳал","Роҳи каҳкашон","Бевазнӣ","Ракета","Мадор","Офтоб","Туманнокӣ","Астронавт","Хусуф"]}},
  {id:"instruments",emoji:"🎸",color:"#ec4899",name:{ru:"Музыкальные инструменты",en:"Musical Instruments",tj:"Асбобҳои мусиқӣ"},words:{ru:["Гитара","Пианино","Скрипка","Барабаны","Флейта","Труба","Саксофон","Виолончель","Арфа","Аккордеон","Укулеле","Кларнет","Орган","Ксилофон","Волынка","Балалайка","Синтезатор","Тромбон","Банджо","Гонг"],en:["Guitar","Piano","Violin","Drums","Flute","Trumpet","Saxophone","Cello","Harp","Accordion","Ukulele","Clarinet","Organ","Xylophone","Bagpipes","Balalaika","Synthesizer","Trombone","Banjo","Gong"],tj:["Гитара","Пианино","Скрипка","Табл","Най","Карнай","Саксофон","Виолончель","Чанг","Аккордеон","Укулеле","Кларнет","Орган","Ксилофон","Волынка","Балалайка","Синтезатор","Тромбон","Банҷо","Гонг"]}},
  {id:"countries",emoji:"🌍",color:"#14b8a6",name:{ru:"Страны и города",en:"Countries & Cities",tj:"Кишварҳо ва шаҳрҳо"},words:{ru:["Париж","Токио","Нью-Йорк","Рим","Каир","Москва","Лондон","Рио-де-Жанейро","Дубай","Сидней","Барселона","Стамбул","Пекин","Амстердам","Венеция","Прага","Марракеш","Сеул","Бангкок","Лиссабон"],en:["Paris","Tokyo","New York","Rome","Cairo","Moscow","London","Rio de Janeiro","Dubai","Sydney","Barcelona","Istanbul","Beijing","Amsterdam","Venice","Prague","Marrakesh","Seoul","Bangkok","Lisbon"],tj:["Париж","Токио","Ню-Йорк","Рим","Қоҳира","Маскав","Лондон","Рио-де-Жанейро","Дубай","Сидней","Барселона","Истамбул","Пекин","Амстердам","Венетсия","Прага","Марокаш","Сеул","Бангкок","Лиссабон"]}},
  {id:"weather",emoji:"🌦️",color:"#38bdf8",name:{ru:"Погода и природные явления",en:"Weather & Nature",tj:"Обу ҳаво ва падидаҳои табиӣ"},words:{ru:["Дождь","Снег","Радуга","Гроза","Туман","Ураган","Град","Молния","Засуха","Наводнение","Торнадо","Иней","Роса","Землетрясение","Северное сияние","Метель","Цунами","Гром","Жара","Заморозки"],en:["Rain","Snow","Rainbow","Thunderstorm","Fog","Hurricane","Hail","Lightning","Drought","Flood","Tornado","Frost","Dew","Earthquake","Northern lights","Blizzard","Tsunami","Thunder","Heat","Cold snap"],tj:["Борон","Барф","Тирукамон","Тӯфон","Туман","Гирдбод","Жола","Барқ","Хушксолӣ","Обхезӣ","Торнадо","Шабнами яхкарда","Шабнам","Зилзила","Шафақи шимолӣ","Бӯрони барф","Сунами","Раъд","Гармои сахт","Яхбандӣ"]}},
  {id:"school",emoji:"📚",color:"#f59e0b",name:{ru:"Школьные предметы",en:"School Subjects",tj:"Фанҳои мактабӣ"},words:{ru:["Математика","История","Физика","Химия","Биология","География","Литература","Информатика","Музыка","Рисование","Физкультура","Английский язык","Труд","Обществознание","Астрономия","Геометрия","Экономика","Черчение","Экология","Психология"],en:["Math","History","Physics","Chemistry","Biology","Geography","Literature","Computer science","Music","Art class","Physical education","English","Technology class","Social studies","Astronomy","Geometry","Economics","Drafting","Ecology","Psychology"],tj:["Математика","Таърих","Физика","Химия","Биология","Ҷуғрофия","Адабиёт","Информатика","Мусиқӣ","Расмкашӣ","Тарбияи ҷисмонӣ","Забони англисӣ","Меҳнат","Ҷомеашиносӣ","Астрономия","Геометрия","Иқтисод","Нақшакашӣ","Экология","Психология"]}},
  {id:"appliances",emoji:"🔌",color:"#6366f1",name:{ru:"Бытовая техника",en:"Home Appliances",tj:"Техникаи рӯзгор"},words:{ru:["Холодильник","Стиральная машина","Микроволновка","Пылесос","Утюг","Тостер","Кофемашина","Фен","Блендер","Посудомоечная машина","Кондиционер","Мультиварка","Соковыжималка","Электрочайник","Обогреватель","Увлажнитель воздуха","Миксер","Швейная машина","Робот-пылесос","Вафельница"],en:["Refrigerator","Washing machine","Microwave","Vacuum cleaner","Iron","Toaster","Coffee maker","Hair dryer","Blender","Dishwasher","Air conditioner","Slow cooker","Juicer","Electric kettle","Heater","Humidifier","Mixer","Sewing machine","Robot vacuum","Waffle maker"],tj:["Яхдон","Мошини ҷомашӯӣ","Печи микромавҷ","Чангкашак","Дарзмол","Тостер","Мошини қаҳвапазӣ","Фен","Блендер","Мошини зарфшӯӣ","Кондитсионер","Мултиварка","Афшурагир","Чойники барқӣ","Гармкунак","Намнокунандаи ҳаво","Миксер","Мошини дӯзандагӣ","Роботи чангкашак","Вафелпаз"]}},
  {id:"furniture",emoji:"🛋️",color:"#a855f7",name:{ru:"Мебель",en:"Furniture",tj:"Мебел"},words:{ru:["Диван","Кровать","Шкаф","Стол","Стул","Кресло","Комод","Полка","Табурет","Тумбочка","Зеркало","Книжный шкаф","Гардероб","Качели","Люстра","Вешалка","Пуфик","Сервант","Кушетка","Секретер"],en:["Sofa","Bed","Wardrobe","Table","Chair","Armchair","Chest of drawers","Shelf","Stool","Nightstand","Mirror","Bookcase","Closet","Swing","Chandelier","Coat rack","Pouf","Sideboard","Couch","Writing desk"],tj:["Диван","Кат","Ҷевон","Миз","Курсӣ","Кресло","Комод","Раф","Курсии кӯтоҳ","Тумбочка","Оина","Ҷевони китоб","Гардероб","Тобхӯрак","Люстра","Ҷевраки либос","Пуфик","Серванд","Кушетка","Секретер"]}},
  {id:"clothes",emoji:"👗",color:"#f43f5e",name:{ru:"Одежда",en:"Clothes",tj:"Либос"},words:{ru:["Платье","Джинсы","Куртка","Свитер","Шапка","Шарф","Перчатки","Ботинки","Костюм","Юбка","Футболка","Пальто","Кроссовки","Пижама","Купальник","Галстук","Плащ","Шорты","Сандалии","Жилет"],en:["Dress","Jeans","Jacket","Sweater","Hat","Scarf","Gloves","Boots","Suit","Skirt","T-shirt","Coat","Sneakers","Pajamas","Swimsuit","Tie","Raincoat","Shorts","Sandals","Vest"],tj:["Курта","Ҷинс","Куртка","Свитер","Телпак","Шарф","Дастпӯшак","Мӯза","Костюм","Юбка","Футболка","Пальто","Кроссовка","Пижама","Либоси шиноварӣ","Галстук","Плаш","Шорт","Сандал","Жилет"]}},
  {id:"holidays",emoji:"🎉",color:"#eab308",name:{ru:"Праздники",en:"Holidays",tj:"Ҷашнҳо"},words:{ru:["Новый год","День рождения","Свадьба","Хэллоуин","Пасха","8 марта","День Победы","Масленица","Выпускной","Юбилей","Карнавал","День святого Валентина","Рождество","День учителя","Первое сентября","Новоселье","День защитника Отечества","Крещение","День города","Медовый месяц"],en:["New Year","Birthday","Wedding","Halloween","Easter","Women's Day","Victory Day","Maslenitsa","Graduation","Anniversary","Carnival","Valentine's Day","Christmas","Teacher's Day","First Day of School","Housewarming","Defender of the Fatherland Day","Epiphany","City Day","Honeymoon"],tj:["Соли Нав","Рӯзи таваллуд","Тӯй","Хэллоуин","Пасха","Рӯзи 8-уми март","Рӯзи Ғалаба","Масленица","Хатми таҳсил","Солгард","Карнавал","Рӯзи ошиқон","Мавлуди Исо","Рӯзи муаллимон","Якуми сентябр","Ҷашни хонаи нав","Рӯзи ҳимоятгари Ватан","Крещение","Рӯзи шаҳр","Моҳи асал"]}},
  {id:"colors",emoji:"🎨",color:"#06b6d4",name:{ru:"Цвета",en:"Colors",tj:"Рангҳо"},words:{ru:["Красный","Синий","Жёлтый","Зелёный","Фиолетовый","Оранжевый","Розовый","Бирюзовый","Коричневый","Чёрный","Белый","Серый","Бордовый","Золотой","Серебряный","Малиновый","Бирюза","Хаки","Лавандовый","Изумрудный"],en:["Red","Blue","Yellow","Green","Purple","Orange","Pink","Turquoise","Brown","Black","White","Gray","Maroon","Gold","Silver","Crimson","Teal","Khaki","Lavender","Emerald"],tj:["Сурх","Кабуд","Зард","Сабз","Бунафш","Норанҷӣ","Гулобӣ","Фирӯзаранг","Қаҳваранг","Сиёҳ","Сафед","Хокистарӣ","Лаълӣ","Тиллоӣ","Нуқрагӣ","Ало","Фирӯза","Хакӣ","Лавандарӣ","Зумуррадӣ"]}},
  {id:"emotions",emoji:"😊",color:"#fb7185",name:{ru:"Эмоции",en:"Emotions",tj:"Эҳсосот"},words:{ru:["Радость","Грусть","Гнев","Страх","Удивление","Стыд","Гордость","Ревность","Скука","Восторг","Тревога","Смущение","Разочарование","Умиление","Отвращение","Ностальгия","Любопытство","Облегчение","Вина","Вдохновение"],en:["Joy","Sadness","Anger","Fear","Surprise","Shame","Pride","Jealousy","Boredom","Delight","Anxiety","Embarrassment","Disappointment","Tenderness","Disgust","Nostalgia","Curiosity","Relief","Guilt","Inspiration"],tj:["Шодӣ","Ғам","Хашм","Тарс","Тааҷҷуб","Шарм","Ифтихор","Рашк","Дилгирӣ","Хурсандии беохир","Изтироб","Хиҷолат","Ноумедӣ","Меҳрубонӣ","Нафрат","Ҳасрати гузашта","Кунҷковӣ","Сабукшавӣ","Гунаҳкорӣ","Илҳом"]}},
  {id:"fruits",emoji:"🍎",color:"#65a30d",name:{ru:"Фрукты и овощи",en:"Fruits & Vegetables",tj:"Мева ва сабзавот"},words:{ru:["Яблоко","Банан","Апельсин","Виноград","Арбуз","Морковь","Картофель","Помидор","Огурец","Клубника","Ананас","Манго","Лимон","Свёкла","Капуста","Персик","Гранат","Тыква","Груша","Авокадо"],en:["Apple","Banana","Orange","Grapes","Watermelon","Carrot","Potato","Tomato","Cucumber","Strawberry","Pineapple","Mango","Lemon","Beetroot","Cabbage","Peach","Pomegranate","Pumpkin","Pear","Avocado"],tj:["Себ","Банан","Афлесун","Ангур","Тарбуз","Сабзӣ","Картошка","Помидор","Бодиринг","Тути фарангӣ","Ананас","Манго","Лимӯ","Лаблабу","Карам","Шафтолу","Анор","Каду","Нок","Авокадо"]}},
  {id:"insects",emoji:"🐝",color:"#84cc16",name:{ru:"Насекомые",en:"Insects",tj:"Ҳашарот"},words:{ru:["Пчела","Бабочка","Муравей","Кузнечик","Божья коровка","Стрекоза","Жук","Комар","Муха","Оса","Паук","Гусеница","Сверчок","Богомол","Таракан","Мотылёк","Термит","Клоп","Шмель","Светлячок"],en:["Bee","Butterfly","Ant","Grasshopper","Ladybug","Dragonfly","Beetle","Mosquito","Fly","Wasp","Spider","Caterpillar","Cricket","Mantis","Cockroach","Moth","Termite","Bedbug","Bumblebee","Firefly"],tj:["Занбӯри асал","Шабпарак","Мӯрча","Малах","Каҷалак","Стрекоза","Гамбӯсак","Пашша","Магас","Занбӯри ёбоӣ","Тортанак","Кирм","Чирчирак","Модаркушак","Таракан","Парвонаи шабона","Термит","Клоп","Занбӯри калон","Кирми шабтоб"]}},
  {id:"sea",emoji:"🐠",color:"#0891b2",name:{ru:"Рыбы и морские обитатели",en:"Sea Creatures",tj:"Мохиён ва мавҷудоти баҳрӣ"},words:{ru:["Осьминог","Медуза","Морской конёк","Краб","Дельфин","Кит","Акула","Скат","Морская звезда","Лобстер","Тунец","Морж","Тюлень","Устрица","Пиранья","Морской ёж","Кальмар","Черепаха","Угорь","Кораллы"],en:["Octopus","Jellyfish","Seahorse","Crab","Dolphin","Whale","Shark","Stingray","Starfish","Lobster","Tuna","Walrus","Seal","Oyster","Piranha","Sea urchin","Squid","Turtle","Eel","Coral"],tj:["Ҳаштпо","Медуза","Аспаки баҳрӣ","Харчанг","Делфин","Наҳанг","Акула","Скат","Ситораи баҳрӣ","Лобстер","Тунец","Морж","Мӯҳри баҳрӣ","Садафак","Пиранья","Хорпушти баҳрӣ","Калмар","Сангпушт","Мормоҳӣ","Марҷон"]}},
  {id:"dinosaurs",emoji:"🦖",color:"#16a34a",name:{ru:"Динозавры",en:"Dinosaurs",tj:"Динозаврҳо"},words:{ru:["Тираннозавр","Трицератопс","Велоцираптор","Стегозавр","Бронтозавр","Птеродактиль","Диплодок","Анкилозавр","Спинозавр","Пахицефалозавр","Игуанодон","Аллозавр","Компсогнат","Мозазавр","Плезиозавр","Дилофозавр","Паразауролоф","Карнотавр","Археоптерикс","Гигантозавр"],en:["Tyrannosaurus","Triceratops","Velociraptor","Stegosaurus","Brontosaurus","Pterodactyl","Diplodocus","Ankylosaurus","Spinosaurus","Pachycephalosaurus","Iguanodon","Allosaurus","Compsognathus","Mosasaurus","Plesiosaurus","Dilophosaurus","Parasaurolophus","Carnotaurus","Archaeopteryx","Giganotosaurus"],tj:["Тираннозавр","Трицератопс","Велосираптор","Стегозавр","Бронтозавр","Птеродактил","Диплодок","Анкилозавр","Спинозавр","Пахисефалозавр","Игуанодон","Аллозавр","Компсогнат","Мозазавр","Плезиозавр","Дилофозавр","Паразауролоф","Карнотавр","Археоптерикс","Гигантозавр"]}},
  {id:"myth",emoji:"🐉",color:"#7c3aed",name:{ru:"Сказочные существа",en:"Mythical Creatures",tj:"Мавҷудоти афсонавӣ"},words:{ru:["Дракон","Единорог","Русалка","Фея","Гном","Тролль","Оборотень","Вампир","Феникс","Кентавр","Эльф","Гоблин","Пегас","Циклоп","Сфинкс","Гидра","Йети","Баба-яга","Джинн","Кикимора"],en:["Dragon","Unicorn","Mermaid","Fairy","Gnome","Troll","Werewolf","Vampire","Phoenix","Centaur","Elf","Goblin","Pegasus","Cyclops","Sphinx","Hydra","Yeti","Baba Yaga","Genie","Kikimora"],tj:["Аждаҳо","Якшох","Пари обӣ","Пари","Гном","Тролл","Гургнамо","Вампир","Феникс","Кентавр","Элф","Гоблин","Пегас","Сиклоп","Сфинкс","Гидра","Йети","Баба-яга","Ҷин","Кикимора"]}},
  {id:"tools",emoji:"🔧",color:"#78716c",name:{ru:"Инструменты",en:"Tools",tj:"Асбобҳо"},words:{ru:["Молоток","Отвёртка","Пила","Гаечный ключ","Дрель","Плоскогубцы","Рубанок","Стамеска","Уровень","Топор","Шуруповёрт","Напильник","Клещи","Ножовка","Кисть малярная","Рулетка","Степлер","Тиски","Лом","Паяльник"],en:["Hammer","Screwdriver","Saw","Wrench","Drill","Pliers","Hand plane","Chisel","Level","Axe","Power drill","File","Tongs","Hacksaw","Paintbrush","Tape measure","Stapler","Vise","Crowbar","Soldering iron"],tj:["Болға","Печгардон","Арра","Калиди гайка","Дрель","Анбурак","Рубанок","Стамеска","Сатҳсанҷ","Табар","Шуруповёрт","Сӯҳон","Анбур","Арраи дастӣ","Мӯйқалами рангмолӣ","Рулетка","Степлер","Тиски","Лом","Паяльник"]}},
  {id:"construction",emoji:"🚜",color:"#ca8a04",name:{ru:"Строительная техника",en:"Construction Vehicles",tj:"Техникаи сохтмонӣ"},words:{ru:["Экскаватор","Бульдозер","Кран башенный","Самосвал","Бетономешалка","Каток дорожный","Погрузчик","Автовышка","Грейдер","Трактор","Асфальтоукладчик","Буровая установка","Землеройная машина","Сваебойная машина","Автокран","Скрепер","Мини-погрузчик","Трубоукладчик","Компрессор","Виброплита"],en:["Excavator","Bulldozer","Tower crane","Dump truck","Concrete mixer","Road roller","Loader","Aerial lift","Grader","Tractor","Asphalt paver","Drilling rig","Earthmover","Pile driver","Mobile crane","Scraper","Mini loader","Pipe layer","Compressor","Vibrating plate"],tj:["Экскаватор","Бульдозер","Крани бошӣ","Самосвал","Бетономешалка","Каток","Погрузчик","Автовышка","Грейдер","Трактор","Асфальтрезгар","Дастгоҳи бурғӣ","Мошини заминков","Мошини сутункӯб","Автокран","Скрепер","Мини-погрузчик","Мошини қубургузор","Компрессор","Виброплита"]}},
  {id:"winter",emoji:"⛄",color:"#38bdf8",name:{ru:"Зимние развлечения",en:"Winter Fun",tj:"Фароғати зимистона"},words:{ru:["Лыжи","Сноуборд","Коньки","Санки","Снеговик","Снежки","Каток","Хоккей на льду","Ледянка","Горка ледяная","Зимняя рыбалка","Сноутюбинг","Керлинг","Прогулка в снегопад","Ёлка наряженная","Морж (купание)","Ледяная скульптура","Собачья упряжка","Биатлон","Зимний поход"],en:["Skiing","Snowboarding","Ice skating","Sledding","Snowman","Snowball fight","Ice rink","Ice hockey","Sled ride","Ice slide","Winter fishing","Snow tubing","Curling","Walk in the snowfall","Decorated Christmas tree","Winter swimming","Ice sculpture","Dog sled","Biathlon","Winter hike"],tj:["Лижаронӣ","Сноуборд","Пойафзоли яхгард","Чана","Одами барфӣ","Барфбозӣ","Катаки ях","Хоккейи рӯи ях","Ледянка","Теппаи яхин","Моҳигирии зимистона","Сноутюбинг","Керлинг","Сайругашт дар барфбор","Дарахти солинавии ороишдодашуда","Шиноварии зимистона","Ҳайкали яхин","Аробаи сагкашон","Биатлон","Сайругашти зимистона"]}},
  {id:"summer",emoji:"🏖️",color:"#fbbf24",name:{ru:"Летние развлечения",en:"Summer Fun",tj:"Фароғати тобистона"},words:{ru:["Пляж","Купание в море","Пикник","Велопрогулка","Роликовые коньки","Батут","Аквапарк","Поход в горы","Рыбалка","Мороженое","Фестиваль","Барбекю","Кемпинг","Серфинг","Дайвинг","Волейбол на пляже","Костёр","Зорбинг","Парасейлинг","Ночёвка в палатке"],en:["Beach","Sea swimming","Picnic","Bike ride","Roller skating","Trampoline","Water park","Mountain hike","Fishing","Ice cream","Festival","Barbecue","Camping","Surfing","Diving","Beach volleyball","Campfire","Zorbing","Parasailing","Tent camping overnight"],tj:["Соҳил","Шиноварӣ дар баҳр","Пикник","Сайругашти дучарха","Пойафзоли ғилдиракдор","Батут","Аквапарк","Сайругашт ба кӯҳ","Моҳигирӣ","Яхмос","Фестивал","Барбекю","Кемпинг","Мавҷсаворӣ","Ғаввосӣ","Волейбол дар соҳил","Гулхан","Зорбинг","Парасейлинг","Шабгузаронӣ дар хайма"]}},
  {id:"drinks",emoji:"🥤",color:"#d946ef",name:{ru:"Напитки",en:"Drinks",tj:"Нӯшокиҳо"},words:{ru:["Кофе","Чай","Сок","Лимонад","Квас","Какао","Морс","Компот","Минеральная вода","Молочный коктейль","Энергетик","Кокосовая вода","Смузи","Глинтвейн","Айран","Кисель","Матча","Газировка","Холодный чай","Молоко"],en:["Coffee","Tea","Juice","Lemonade","Kvass","Cocoa","Fruit drink","Compote","Mineral water","Milkshake","Energy drink","Coconut water","Smoothie","Mulled wine","Ayran","Kissel","Matcha","Soda","Iced tea","Milk"],tj:["Қаҳва","Чой","Афшура","Лимонад","Квас","Какао","Шарбат","Компот","Оби минералӣ","Коктейли ширӣ","Нӯшобаи энергетикӣ","Оби кокос","Смузи","Шароби гарм","Айрон","Кисел","Матча","Газировка","Чойи хунук","Шир"]}},
  {id:"desserts",emoji:"🍰",color:"#f472b6",name:{ru:"Десерты",en:"Desserts",tj:"Ширинӣ"},words:{ru:["Торт","Мороженое","Пирожное","Чизкейк","Тирамису","Эклер","Пончик","Маффин","Штрудель","Безе","Панкейк","Печенье","Зефир","Вафли","Конфеты","Крем-брюле","Пахлава","Мороженое-рожок","Пудинг","Медовик"],en:["Cake","Ice cream","Pastry","Cheesecake","Tiramisu","Eclair","Donut","Muffin","Strudel","Meringue","Pancake","Cookie","Marshmallow","Waffles","Candy","Creme brulee","Baklava","Ice cream cone","Pudding","Honey cake"],tj:["Торт","Яхмос","Ширинӣ","Чизкейк","Тирамису","Эклер","Пончик","Маффин","Штрудель","Безе","Панкейк","Кулча","Зефир","Вафли","Конфет","Крем-брюле","Пахлава","Мороженое дар вафли","Пудинг","Кулчаи асал"]}},
  {id:"bodytypes",emoji:"🚙",color:"#334155",name:{ru:"Виды автомобильных кузовов",en:"Car Body Types",tj:"Намудҳои кузови мошин"},words:{ru:["Седан","Внедорожник","Хэтчбек","Универсал","Кабриолет","Купе","Минивэн","Пикап","Кроссовер","Лимузин","Фургон","Родстер","Гоночный болид","Багги","Вездеход","Микроавтобус","Тарга","Лифтбек","Спорткар","Ретроавтомобиль"],en:["Sedan","SUV","Hatchback","Station wagon","Convertible","Coupe","Minivan","Pickup truck","Crossover","Limousine","Van","Roadster","Race car","Buggy","All-terrain vehicle","Minibus","Targa","Liftback","Sports car","Vintage car"],tj:["Седан","Внедорожник","Хетчбек","Универсал","Кабриолет","Купе","Минивэн","Пикап","Кроссовер","Лимузин","Фургон","Родстер","Мошини мусобиқавӣ","Багги","Вездеход","Микроавтобус","Тарга","Лифтбек","Мошини варзишӣ","Мошини кӯҳна"]}},
  {id:"hobbies",emoji:"🎯",color:"#10b981",name:{ru:"Хобби",en:"Hobbies",tj:"Машғулиятҳо"},words:{ru:["Рыбалка","Вязание","Фотография","Шахматы","Рисование","Коллекционирование марок","Садоводство","Кулинария","Танцы","Пазлы","Оригами","Скрапбукинг","Настольные игры","Караоке","Вышивка","Бег","Йога","Моделирование","Каллиграфия","Пивоварение"],en:["Fishing","Knitting","Photography","Chess","Drawing","Stamp collecting","Gardening","Cooking","Dancing","Puzzles","Origami","Scrapbooking","Board games","Karaoke","Embroidery","Running","Yoga","Modeling","Calligraphy","Brewing"],tj:["Моҳигирӣ","Бофандагӣ","Аксбардорӣ","Шоҳмот","Расмкашӣ","Ҷамъоварии маркаҳо","Боғдорӣ","Ошпазӣ","Рақс","Пазл","Оригами","Скрапбукинг","Бозиҳои рӯимизӣ","Караоке","Гулдӯзӣ","Давидан","Йога","Моделсозӣ","Хушнависӣ","Пивопазӣ"]}},
  {id:"genres",emoji:"🎬",color:"#e11d48",name:{ru:"Жанры кино и сериалов",en:"Movie & TV Genres",tj:"Жанрҳои филм ва сериал"},words:{ru:["Комедия","Драма","Триллер","Ужасы","Боевик","Детектив","Мелодрама","Фантастика","Фэнтези","Мультфильм","Документальный фильм","Мюзикл","Приключения","Военный фильм","Криминал","Исторический фильм","Вестерн","Антиутопия","Биография","Семейный фильм"],en:["Comedy","Drama","Thriller","Horror","Action","Detective","Melodrama","Sci-fi","Fantasy","Cartoon","Documentary","Musical","Adventure","War film","Crime","Historical film","Western","Dystopia","Biography","Family film"],tj:["Комедия","Драма","Триллер","Даҳшатнок","Боевик","Детектив","Мелодрама","Фантастика","Фэнтези","Мултфилм","Филми ҳуҷҷатӣ","Мюзикл","Саргузашт","Филми ҷангӣ","Ҷинояткорӣ","Филми таърихӣ","Вестерн","Антиутопия","Тарҷумаи ҳол","Филми оилавӣ"]}},
  {id:"islam",emoji:"☪️",color:"#0d9488",name:{ru:"Ислам",en:"Islam",tj:"Ислом"},words:{ru:["Адам","Идрис","Нух","Худ","Салих","Ибрахим","Лут","Исмаил","Исхак","Якуб","Юсуф","Айюб","Шуайб","Муса","Харун","Заль-Кифль","Дауд","Сулейман","Ильяс","Альяса","Юнус","Закария","Яхья","Иса","Мухаммад","Намаз","Тахарат","Альхамдулиллах","Бисмиллах","Иншаллах","Субханаллах","Аллаху Акбар","Ля иляха илля Ллах","Рамадан","Ураза","Ифтар","Сухур","Закят","Хадж","Умра","Кааба","Кыбла","Коран","Хадис","Сунна","Мечеть","Имам","Азан","Иман","Джаннат"],en:["Adam","Idris","Nuh","Hud","Salih","Ibrahim","Lut","Ismail","Ishaq","Yaqub","Yusuf","Ayyub","Shuayb","Musa","Harun","Dhul-Kifl","Dawud","Sulayman","Ilyas","Al-Yasa","Yunus","Zakariya","Yahya","Isa","Muhammad","Prayer (Salah)","Purification (Taharah)","Alhamdulillah","Bismillah","InshaAllah","SubhanAllah","Allahu Akbar","La ilaha illallah","Ramadan","Fasting (Sawm)","Iftar","Suhoor","Zakat","Hajj","Umrah","Kaaba","Qibla","Quran","Hadith","Sunnah","Mosque","Imam","Adhan","Iman","Jannah"],tj:["Одам","Идрис","Нӯҳ","Ҳуд","Солеҳ","Иброҳим","Лут","Исмоил","Исҳоқ","Яъқуб","Юсуф","Айюб","Шуайб","Мӯсо","Ҳорун","Зулкифл","Довуд","Сулаймон","Ильёс","Алясаъ","Юнус","Закариё","Яҳё","Исо","Муҳаммад","Намоз","Тоҳарат","Алҳамдулиллаҳ","Бисмиллаҳ","Иншооллоҳ","Субҳоноллоҳ","Аллоҳу акбар","Ло илоҳа иллаллоҳ","Рамазон","Рӯза","Ифтор","Саҳарӣ","Закот","Ҳаҷ","Умра","Каъба","Қибла","Қуръон","Ҳадис","Суннат","Масҷид","Имом","Азон","Имон","Ҷаннат"]}},
  {id:"hobgokh",emoji:"👥",color:"#f59e0b",name:{ru:"Хобгох",en:"Hobgokh",tj:"Ҳобгоҳ"},words:{ru:["Аюб","Ахмад","Анас","Зайнулло","Мустафо","Амин","акаи Аслиддин","акаи Умед","акаи Мухаммадюсуф","акаи Самандар"],en:["Ayub","Ahmad","Anas","Zaynullo","Mustafo","Amin","akai Asliddin","akai Umed","akai Muhammadyusuf","akai Samandar"],tj:["Аюб","Ахмад","Анас","Зайнулло","Мустафо","Амин","акаи Аслиддин","акаи Умед","акаи Мухаммадюсуф","акаи Самандар"]}}
];
function themeName(theme, lang) { return (theme.name && theme.name[lang]) || theme.name.ru; }
function themeWords(theme, lang) { return (theme.words && theme.words[lang]) || theme.words.ru; }

/* ============================== I18N ============================== */
const STRINGS = {
  ru: {
    appName: "ШПИОН", tagline: "Слово знают все. Кроме одного.",
    play: "Играть", players: "Игроки", themes: "Темы", settings: "Настройки",
    playersCount: "Игроков", themesCount: "Активных тем",
    addPlayerPlaceholder: "Имя игрока", quickAdd: "Быстрое добавление",
    minPlayers: "⚠️ Нужно минимум 3 игрока", maxPlayers: "Максимум — 20 игроков",
    duplicateName: "Такое имя уже есть", chooseAvatar: "Выбери аватар",
    selectAll: "Выбрать все", clearAll: "Снять всё", selected: "Выбрано",
    of: "из", needTheme: "Выбери хотя бы одну тему", preview: "Превью слов",
    spiesCount: "Количество шпионов", roundTime: "Время на раунд", minutes: "мин",
    spyDifficulty: "Что видит шпион", diffNone: "Ничего", diffTheme: "Только тему",
    diffHints: "Тему и 3 слова-подсказки", allowSpyGuess: "Кнопка «Я — шпион»",
    sound: "Звук", vibration: "Вибрация", darkTheme: "Тёмная тема", language: "Язык",
    back: "Назад", ready: "ГОТОВЫ?", roundTitle: "Раунд шпиона",
    startDeal: "Начать раздачу слов →", playersWord: "игроков", spiesWord: "шпионов",
    randomWordFrom: "Секретное слово будет выбрано из", activeThemes: "активных тем",
    passDevice: "Передайте устройство игроку", holdToReveal: "Нажми и удерживай, чтобы увидеть своё слово",
    holdCard: "Нажми и удерживай", youAreSpy: "Ты — ШПИОН", spyNoInfo: "Постарайся понять тему по разговору.",
    spyThemeOnly: "Тема раунда:", spyHints: "Слова-подсказки из темы:",
    theme: "Тема", doneNext: "Готово → Передать дальше", startGame: "Перейти к игре →",
    playerOf: "Игрок", ofWord: "из", pause: "Пауза", resume: "Продолжить",
    exile: "Изгнать", iAmSpy: "Я — шпион", whoToExile: "Кого изгоняем?",
    exileSelected: "Изгнать выбранного", exiled: "изгнан", notSpyBanner: "не шпион! Игра продолжается",
    guessTitle: "Выбери секретное слово", guessSubtitle: "Тема:",
    confirmGuess: "Ты уверен, что это слово —", noWayBack: "Обратной дороги нет.",
    yes: "Да", cancel: "Отмена", spyWon: "ШПИОН ПОБЕДИЛ", playersWon: "ИГРОКИ ПОБЕДИЛИ",
    spyGuessedRight: "Шпион угадал слово и победил!", exiledSpyWin: "Игроки изгнали шпиона и победили!",
    spyGuessedWrong: "Шпион попытался угадать слово, но ошибся — победили игроки!",
    secretWordWas: "Секретное слово было:", spyWas: "Шпион", spyGuessed: "Шпион выбрал",
    playAgain: "Играть снова", newGame: "Новая игра", wins: "побед",
    edit: "Изменить", delete: "Удалить", cancelBtn: "Отмена", confirmDelete: "Удалить?",
    close: "Закрыть", notEnough: "Недостаточно игроков или тем для начала игры",
    leaveRoundWarning: "Вы уверены, что хотите выйти? Прогресс текущего раунда будет потерян.",
    leaveRound: "Выйти из раунда",
  },
  en: {
    appName: "SPY", tagline: "Everyone knows the word. Except one.",
    play: "Play", players: "Players", themes: "Topics", settings: "Settings",
    playersCount: "Players", themesCount: "Active topics",
    addPlayerPlaceholder: "Player name", quickAdd: "Quick add",
    minPlayers: "⚠️ You need at least 3 players", maxPlayers: "Maximum is 20 players",
    duplicateName: "That name is taken", chooseAvatar: "Choose an avatar",
    selectAll: "Select all", clearAll: "Clear all", selected: "Selected",
    of: "of", needTheme: "Pick at least one topic", preview: "Preview words",
    spiesCount: "Number of spies", roundTime: "Round time", minutes: "min",
    spyDifficulty: "What the spy sees", diffNone: "Nothing", diffTheme: "Topic only",
    diffHints: "Topic + 3 hint words", allowSpyGuess: "\u201cI'm the spy\u201d button",
    sound: "Sound", vibration: "Vibration", darkTheme: "Dark theme", language: "Language",
    back: "Back", ready: "READY?", roundTitle: "Spy round",
    startDeal: "Deal the words →", playersWord: "players", spiesWord: "spies",
    randomWordFrom: "The secret word will be picked from", activeThemes: "active topics",
    passDevice: "Pass the device to", holdToReveal: "Press and hold to see your word",
    holdCard: "Press and hold", youAreSpy: "You are the SPY", spyNoInfo: "Try to figure out the topic from the talk.",
    spyThemeOnly: "Round topic:", spyHints: "Hint words from the topic:",
    theme: "Topic", doneNext: "Done → Pass along", startGame: "Start the round →",
    playerOf: "Player", ofWord: "of", pause: "Pause", resume: "Resume",
    exile: "Vote out", iAmSpy: "I'm the spy", whoToExile: "Who do we vote out?",
    exileSelected: "Vote out selected", exiled: "voted out", notSpyBanner: "is not the spy! Game continues",
    guessTitle: "Pick the secret word", guessSubtitle: "Topic:",
    confirmGuess: "Are you sure the word is", noWayBack: "There's no turning back.",
    yes: "Yes", cancel: "Cancel", spyWon: "THE SPY WON", playersWon: "PLAYERS WON",
    spyGuessedRight: "The spy guessed the word and won!", exiledSpyWin: "Players voted out the spy and won!",
    spyGuessedWrong: "The spy tried to guess but got it wrong — players won!",
    secretWordWas: "The secret word was:", spyWas: "Spy", spyGuessed: "Spy picked",
    playAgain: "Play again", newGame: "New game", wins: "wins",
    edit: "Edit", delete: "Delete", cancelBtn: "Cancel", confirmDelete: "Delete?",
    close: "Close", notEnough: "Not enough players or topics to start",
    leaveRoundWarning: "Are you sure you want to leave? Progress in this round will be lost.",
    leaveRound: "Leave round",
  },
  tj: {
    appName: "ҶОСУС", tagline: "Ҳама калимаро медонанд. Ба ғайр аз як нафар.",
    play: "Бозӣ кардан", players: "Бозингарон", themes: "Мавзӯъҳо", settings: "Танзимот",
    playersCount: "Бозингарон", themesCount: "Мавзӯъҳои фаъол",
    addPlayerPlaceholder: "Номи бозингар", quickAdd: "Иловаи зуд",
    minPlayers: "⚠️ Ҳадди ақал 3 бозингар лозим аст", maxPlayers: "Ҳадди аксар — 20 бозингар",
    duplicateName: "Чунин ном аллакай ҳаст", chooseAvatar: "Аватарро интихоб кунед",
    selectAll: "Ҳамаро интихоб кардан", clearAll: "Ҳамаро тоза кардан", selected: "Интихобшуда",
    of: "аз", needTheme: "Ҳадди ақал як мавзӯъро интихоб кунед", preview: "Пешнамоиши калимаҳо",
    spiesCount: "Шумораи ҷосусон", roundTime: "Вақти давра", minutes: "дақ",
    spyDifficulty: "Ҷосус чиро мебинад", diffNone: "Ҳеҷ чиз", diffTheme: "Танҳо мавзӯъ",
    diffHints: "Мавзӯъ ва 3 калимаи ишоракунанда", allowSpyGuess: "Тугмаи «Ман — ҷосусам»",
    sound: "Садо", vibration: "Ларзиш", darkTheme: "Мавзӯи торик", language: "Забон",
    back: "Бозгашт", ready: "ОМОДА?", roundTitle: "Давраи ҷосус",
    startDeal: "Тақсими калимаҳоро сар кунед →", playersWord: "бозингар", spiesWord: "ҷосус",
    randomWordFrom: "Калимаи махфӣ аз", activeThemes: "мавзӯи фаъол интихоб мешавад",
    passDevice: "Дастгоҳро ба бозингар диҳед", holdToReveal: "Барои дидани калимаи худ пахш карда нигоҳ доред",
    holdCard: "Пахш карда нигоҳ доред", youAreSpy: "Шумо — ҶОСУС ҳастед", spyNoInfo: "Кӯшиш кунед мавзӯъро аз сӯҳбат бифаҳмед.",
    spyThemeOnly: "Мавзӯи давра:", spyHints: "Калимаҳои ишоракунанда аз мавзӯъ:",
    theme: "Мавзӯъ", doneNext: "Тайёр → Ба навбати дигар диҳед", startGame: "Гузариш ба бозӣ →",
    playerOf: "Бозингар", ofWord: "аз", pause: "Таваққуф", resume: "Идома додан",
    exile: "Хориҷ кардан", iAmSpy: "Ман — ҷосусам", whoToExile: "Киро хориҷ мекунем?",
    exileSelected: "Интихобшударо хориҷ кардан", exiled: "хориҷ шуд", notSpyBanner: "ҷосус нест! Бозӣ идома дорад",
    guessTitle: "Калимаи махфиро интихоб кунед", guessSubtitle: "Мавзӯъ:",
    confirmGuess: "Шумо мутмаин ҳастед, ки калима ин аст —", noWayBack: "Роҳи бозгашт нест.",
    yes: "Ҳа", cancel: "Бекор кардан", spyWon: "ҶОСУС ҒОЛИБ ШУД", playersWon: "БОЗИНГАРОН ҒОЛИБ ШУДАНД",
    spyGuessedRight: "Ҷосус калимаро ёфт ва ғолиб омад!", exiledSpyWin: "Бозингарон ҷосусро хориҷ карданд ва ғолиб омаданд!",
    spyGuessedWrong: "Ҷосус кӯшиши ёфтани калимаро кард, аммо хато кард — бозингарон ғолиб омаданд!",
    secretWordWas: "Калимаи махфӣ ин буд:", spyWas: "Ҷосус", spyGuessed: "Ҷосус интихоб кард",
    playAgain: "Аз нав бозӣ кардан", newGame: "Бозии нав", wins: "ғалаба",
    edit: "Тағйир додан", delete: "Нест кардан", cancelBtn: "Бекор кардан", confirmDelete: "Нест карда шавад?",
    close: "Пӯшидан", notEnough: "Барои сар кардани бозӣ бозингарон ё мавзӯъҳо кофӣ нестанд",
    leaveRoundWarning: "Шумо мутмаин ҳастед, ки мехоҳед бароед? Пешрафти давраи ҷорӣ гум мешавад.",
    leaveRound: "Баромадан аз давра",
  }
};

const EMOJIS = ["😀","😎","🤠","🥸","🧐","🤓","😈","👽","🤖","🥷","🥳","🤩","😇","🙃","😜","🤪","🥶","🤯","🧑‍🚀","🧙",
  "🐱","🐶","🦊","🐼","🦁","🐸","🐵","🦄","🐲","🐧","🦖","🐯","🦋","🐨","🐰","🐺","🦉","🐙","🦕","🐳",
  "🍕","🍔","🍩","🍪","🍉","🥑","🥚","🍿","🍭","🍦",
  "🎮","🎸","🚀","⚽","🎯","🎩","🕵️","🔍","💣","🎭","🌵","⭐","🍀","👻","🎃","🎲","🧩","🎨","🎧","🏆"];

/* ============================== UTILS ============================== */
function colorFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h} 62% 42%)`;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

let audioCtx = null;
function beep(freq = 440, dur = 0.08, type = "sine", vol = 0.05) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) {}
}

const STORAGE_KEY = "spy-word-game-state-v1";
async function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
async function saveState(state) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

/* ============================== STATE ============================== */
const defaultSettings = {
  spies: 1, minutes: 5, difficulty: "theme", allowSpyGuess: true,
  sound: true, vibration: true, dark: true, language: "ru",
};
const initialState = {
  screen: "splash",
  players: [],
  themeIds: [],
  settings: defaultSettings,
  round: null,
  wins: {},
  loaded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload, screen: "home", loaded: true };
    case "SET_SCREEN":
      return { ...state, screen: action.screen };
    case "ADD_PLAYER":
      return { ...state, players: [...state.players, { id: uid(), name: action.name, emoji: action.emoji }] };
    case "UPDATE_PLAYER":
      return { ...state, players: state.players.map(p => p.id === action.id ? { ...p, name: action.name ?? p.name, emoji: action.emoji ?? p.emoji } : p) };
    case "REMOVE_PLAYER":
      return { ...state, players: state.players.filter(p => p.id !== action.id) };
    case "REORDER_PLAYERS": {
      const arr = state.players.slice();
      const from = arr.findIndex(p => p.id === action.dragId);
      const to = arr.findIndex(p => p.id === action.overId);
      if (from < 0 || to < 0) return state;
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { ...state, players: arr };
    }
    case "TOGGLE_THEME": {
      const has = state.themeIds.includes(action.id);
      return { ...state, themeIds: has ? state.themeIds.filter(t => t !== action.id) : [...state.themeIds, action.id] };
    }
    case "SELECT_ALL_THEMES":
      return { ...state, themeIds: THEMES.map(t => t.id) };
    case "CLEAR_THEMES":
      return { ...state, themeIds: [] };
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case "START_ROUND": {
      const activeThemes = THEMES.filter(t => state.themeIds.includes(t.id));
      const theme = activeThemes[Math.floor(Math.random() * activeThemes.length)];
      const wordCount = theme.words.ru.length;
      const wordIndex = Math.floor(Math.random() * wordCount);
      const spyCount = Math.min(state.settings.spies, Math.max(1, state.players.length - 2));
      const order = shuffle(state.players.map(p => p.id));
      const spyIds = order.slice(0, spyCount);
      const otherIndices = Array.from({ length: wordCount }, (_, i) => i).filter(i => i !== wordIndex);
      const hintIndices = shuffle(otherIndices).slice(0, 3);
      const revealOrder = shuffle(state.players.map(p => p.id));
      return {
        ...state,
        round: {
          themeId: theme.id, wordIndex, spyIds, hintIndices,
          revealOrder, revealIndex: 0,
          aliveIds: state.players.map(p => p.id),
          exiledIds: [],
          phase: "reveal",
          seconds: state.settings.minutes * 60,
          finished: false, winner: null, endReason: null,
          spyGuessIndex: null,
        },
      };
    }
    case "NEXT_REVEAL":
      return { ...state, round: { ...state.round, revealIndex: state.round.revealIndex + 1 } };
    case "SET_ROUND_PHASE":
      return { ...state, round: { ...state.round, phase: action.phase } };
    case "TICK": {
      if (!state.round) return state;
      const seconds = Math.max(0, state.round.seconds - 1);
      return { ...state, round: { ...state.round, seconds } };
    }
    case "ADD_TIME":
      return { ...state, round: { ...state.round, seconds: state.round.seconds + action.amount } };
    case "EXILE_PLAYER": {
      const r = state.round;
      const isSpy = r.spyIds.includes(action.id);
      const aliveIds = r.aliveIds.filter(id => id !== action.id);
      const exiledIds = [...r.exiledIds, action.id];
      if (isSpy) {
        return { ...state, round: { ...r, aliveIds, exiledIds, finished: true, winner: "players", endReason: "exiled" } };
      }
      const aliveNonSpy = aliveIds.filter(id => !r.spyIds.includes(id));
      if (aliveNonSpy.length < 1) {
        return { ...state, round: { ...r, aliveIds, exiledIds, finished: true, winner: "spy", endReason: "exiled" } };
      }
      return { ...state, round: { ...r, aliveIds, exiledIds, phase: "timer", lastExiledWasSpy: false, lastExiledId: action.id } };
    }
    case "CLEAR_EXILE_BANNER":
      return { ...state, round: { ...state.round, lastExiledId: null } };
    case "SPY_GUESS": {
      const r = state.round;
      const correct = action.wordIndex === r.wordIndex;
      return { ...state, round: { ...r, finished: true, spyGuessIndex: action.wordIndex, winner: correct ? "spy" : "players", endReason: "guess" } };
    }
    case "RECORD_WIN": {
      const wins = { ...state.wins };
      action.playerIds.forEach(id => { wins[id] = (wins[id] || 0) + 1; });
      return { ...state, wins };
    }
    case "NEW_GAME":
      return { ...state, round: null, screen: "home" };
    default:
      return state;
  }
}

const GameContext = createContext(null);
function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within provider");
  return ctx;
}
function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const saved = await loadState();
      if (mounted) dispatch({ type: "HYDRATE", payload: saved || {} });
    })();
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    if (!state.loaded) return;
    saveState({ players: state.players, themeIds: state.themeIds, settings: state.settings, wins: state.wins });
  }, [state.players, state.themeIds, state.settings, state.wins, state.loaded]);
  useEffect(() => {
    document.documentElement.dataset.spyTheme = state.settings.dark ? "dark" : "light";
  }, [state.settings.dark]);
  const t = STRINGS[state.settings.language] || STRINGS.ru;
  const value = useMemo(() => ({ state, dispatch, t }), [state]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

/* ============================== UI ATOMS ============================== */
function SpyLogo({ className = "" }) {
  return (
    <svg viewBox="0 0 200 200" className={"sw-logo-svg " + className} role="img" aria-label="Spy logo">
      <defs>
        <linearGradient id="spyBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="55%" stopColor="#c026d3" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <radialGradient id="spyGlow" cx="32%" cy="26%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="spyRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="97" fill="url(#spyBadgeGrad)" />
      <circle cx="100" cy="100" r="93" fill="none" stroke="url(#spyRimGrad)" strokeWidth="2.5" opacity="0.7" />
      <circle cx="100" cy="100" r="97" fill="url(#spyGlow)" />
      <path d="M38 182 Q100 138 162 182 L162 205 L38 205 Z" fill="#1c1730" />
      <path d="M38 182 Q100 138 162 182" fill="none" stroke="#2d2650" strokeWidth="4" />
      <ellipse cx="100" cy="118" rx="33" ry="35" fill="#f2c396" />
      <ellipse cx="100" cy="128" rx="24" ry="10" fill="#e0a978" opacity="0.6" />
      <ellipse cx="100" cy="90" rx="54" ry="13" fill="#181622" />
      <path d="M70 92 Q73 54 100 51 Q127 54 130 92 Z" fill="#221f33" />
      <path d="M76 85 h48 v7 h-48 z" fill="#3a3560" />
      <rect x="68" y="108" width="26" height="15" rx="7" fill="#0d0d14" />
      <rect x="106" y="108" width="26" height="15" rx="7" fill="#0d0d14" />
      <rect x="94" y="112" width="12" height="4.5" rx="2" fill="#0d0d14" />
      <circle cx="146" cy="150" r="21" fill="none" stroke="#fff" strokeWidth="7.5" />
      <circle cx="146" cy="150" r="21" fill="#ffffff" opacity="0.08" />
      <line x1="161" y1="165" x2="179" y2="183" stroke="#fff" strokeWidth="8.5" strokeLinecap="round" />
    </svg>
  );
}

function Screen({ children, className = "" }) {
  return (
    <motion.main
      className={"sw-screen " + className}
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -28 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      {children}
    </motion.main>
  );
}
function Header({ title, onBack, right }) {
  return (
    <header className="sw-header">
      <button className="sw-icon-btn" onClick={onBack} aria-label="back"><ArrowLeft size={20} /></button>
      <h1>{title}</h1>
      <div className="sw-header-right">{right}</div>
    </header>
  );
}
function Button({ children, onClick, primary, danger, disabled, className = "", style }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      disabled={disabled}
      style={style}
      className={"sw-btn " + (primary ? "sw-btn-primary " : "") + (danger ? "sw-btn-danger " : "") + className}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
function Toggle({ value, onChange, label }) {
  return (
    <button className={"sw-toggle " + (value ? "on" : "")} onClick={() => onChange(!value)} type="button">
      <span className="sw-toggle-knob" />
      {label && <em>{label}</em>}
    </button>
  );
}

/* Generic modal: closes via X, backdrop click, and Escape */
function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="sw-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={"sw-modal " + (wide ? "wide" : "")}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sw-modal-head">
              <h3>{title}</h3>
              <button className="sw-icon-btn" onClick={onClose} aria-label="close"><X size={19} /></button>
            </div>
            <div className="sw-modal-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel, danger }) {
  const { t } = useGame();
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="sw-muted">{message}</p>
      <div className="sw-modal-actions">
        <Button onClick={onClose}>{t.cancel}</Button>
        <Button primary={!danger} danger={danger} onClick={onConfirm}>{confirmLabel || t.yes}</Button>
      </div>
    </Modal>
  );
}

function EmojiPickerModal({ open, onClose, onPick, current }) {
  const { t } = useGame();
  return (
    <Modal open={open} onClose={onClose} title={t.chooseAvatar} wide>
      <div className="sw-emoji-grid">
        {EMOJIS.map((e) => (
          <button
            key={e}
            className={"sw-emoji " + (current === e ? "selected" : "")}
            onClick={() => { onPick(e); onClose(); }}
          >
            {e}
          </button>
        ))}
      </div>
    </Modal>
  );
}

function ThemePreviewModal({ open, onClose, theme, lang }) {
  const { t } = useGame();
  if (!theme) return null;
  const words = themeWords(theme, lang);
  return (
    <Modal open={open} onClose={onClose} title={theme.emoji + " " + themeName(theme, lang)} wide>
      <div className="sw-preview-grid">
        {words.map((w, i) => <span key={i} className="sw-preview-word" style={{ "--accent": theme.color }}>{w}</span>)}
      </div>
    </Modal>
  );
}

function Confetti({ variant = "players" }) {
  const pieces = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 0.6,
    rotate: Math.random() * 360, size: 6 + Math.random() * 8,
    duration: 2 + Math.random() * 1.4,
  })), []);
  const colors = variant === "spy" ? ["#fbbf24", "#a78bfa", "#f472b6"] : ["#34d399", "#38bdf8", "#a3e635"];
  return (
    <div className="sw-confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <motion.span
          key={p.id}
          initial={{ top: "-5%", left: p.x + "%", opacity: 1, rotate: 0 }}
          animate={{ top: "105%", rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{ position: "absolute", width: p.size, height: p.size * 0.4, background: colors[i % colors.length], borderRadius: 2 }}
        />
      ))}
    </div>
  );
}

/* ============================== SCREENS ============================== */
function Splash() {
  const { dispatch, state } = useGame();
  useEffect(() => {
    if (!state.loaded) return;
    const id = setTimeout(() => dispatch({ type: "SET_SCREEN", screen: "home" }), 1600);
    return () => clearTimeout(id);
  }, [state.loaded]);
  return (
    <Screen className="sw-splash">
      <motion.div
        className="sw-splash-logo"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.35 }}
      >
        <div className="sw-logo-mark"><SpyLogo /></div>
        <h1>ШПИОН</h1>
        <p>Слово знают все. Кроме одного.</p>
      </motion.div>
    </Screen>
  );
}

function Home() {
  const { state, dispatch, t } = useGame();
  const { players, themeIds, settings } = state;
  const canPlay = players.length >= 3 && themeIds.length >= 1;
  return (
    <Screen className="sw-home">
      <div className="sw-home-layout">
        <div className="sw-home-hero">
          <motion.div
            className="sw-emblem"
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.55, type: "spring", bounce: 0.3 }}
          >
            <div className="sw-emblem-particles" />
            <SpyLogo />
          </motion.div>
        </div>
        <div className="sw-home-main">
          <motion.h1 className="sw-title-pulse" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{t.appName}</motion.h1>
          <p className="sw-tagline">{t.tagline}</p>
          <div className="sw-menu">
            {[
              { key: "play", label: t.play, icon: <Sparkles size={20} />, primary: true, onClick: () => dispatch({ type: "SET_SCREEN", screen: canPlay ? "pregame" : "players" }) },
              { key: "players", label: t.players, icon: <Users size={19} />, badge: players.length, onClick: () => dispatch({ type: "SET_SCREEN", screen: "players" }) },
              { key: "themes", label: t.themes, icon: <Eye size={19} />, badge: themeIds.length, onClick: () => dispatch({ type: "SET_SCREEN", screen: "themes" }) },
              { key: "settings", label: t.settings, icon: <SettingsIcon size={19} />, onClick: () => dispatch({ type: "SET_SCREEN", screen: "settings" }) },
            ].map((item, i) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.09 }}
              >
                <Button primary={item.primary} onClick={item.onClick} className="sw-menu-btn">
                  {item.icon} {item.label} {item.badge != null && <span className="sw-badge">{item.badge}</span>}
                </Button>
              </motion.div>
            ))}
          </div>
          <div className="sw-home-stats">
            <span>{players.length} {t.playersCount.toLowerCase()}</span>
            <span>{themeIds.length} {t.themesCount.toLowerCase()}</span>
          </div>
        </div>
      </div>
    </Screen>
  );
}

function PlayersScreen() {
  const { state, dispatch, t } = useGame();
  const { players } = state;
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🙂");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [shake, setShake] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const isDuplicate = (n) => players.some(p => p.name.trim().toLowerCase() === n.trim().toLowerCase());

  const add = () => {
    const n = name.trim();
    if (!n) return;
    if (isDuplicate(n)) { setShake(true); setTimeout(() => setShake(false), 400); return; }
    if (players.length >= 20) return;
    dispatch({ type: "ADD_PLAYER", name: n, emoji });
    setName(""); setEmoji("🙂");
  };
  const quickAdd = () => {
    let i = 1;
    while (players.some(p => p.name === "Игрок " + i)) i++;
    dispatch({ type: "ADD_PLAYER", name: "Игрок " + i, emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)] });
  };

  return (
    <Screen>
      <Header title={t.players} onBack={() => dispatch({ type: "SET_SCREEN", screen: "home" })} />
      <div className={"sw-add-row " + (shake ? "sw-shake" : "")}>
        <button className="sw-avatar-btn" onClick={() => setPickerOpen(true)}>{emoji}</button>
        <div className="sw-name-input">
          <input
            value={name} maxLength={16} placeholder={t.addPlayerPlaceholder}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }}
          />
          <small>{16 - name.length}</small>
        </div>
        <button className="sw-round-btn" onClick={add} disabled={!name.trim() || players.length >= 20}><Plus size={20} /></button>
      </div>
      {isDuplicate(name) && name.trim() && <div className="sw-warning">{t.duplicateName}</div>}

      <div className="sw-player-list">
        {players.map((p) => (
          <motion.div
            layout key={p.id}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scaleY: 0, height: 0 }}
            className={"sw-player-card " + (dragId === p.id ? "dragging" : "")}
            draggable
            onDragStart={() => setDragId(p.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragId && dragId !== p.id) dispatch({ type: "REORDER_PLAYERS", dragId, overId: p.id }); setDragId(null); }}
            onDragEnd={() => setDragId(null)}
          >
            <span className="sw-drag"><GripVertical size={16} /></span>
            <div className="sw-player-avatar" style={{ background: colorFor(p.name) }}>{p.emoji}</div>
            {editing === p.id ? (
              <input
                className="sw-inline-edit" autoFocus defaultValue={p.name} maxLength={16}
                onBlur={(e) => { dispatch({ type: "UPDATE_PLAYER", id: p.id, name: e.target.value.trim() || p.name }); setEditing(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
              />
            ) : (
              <span className="sw-player-name">{p.name}</span>
            )}
            {state.wins[p.id] > 0 && <span className="sw-win-count"><Trophy size={12} /> {state.wins[p.id]}</span>}
            <button className="sw-small-icon" onClick={() => setEditing(p.id)}><Pencil size={15} /></button>
            <button className="sw-small-icon danger" onClick={() => setConfirmDelete(p.id)}><Trash2 size={15} /></button>
          </motion.div>
        ))}
      </div>

      {players.length < 3 && <div className="sw-warning">{t.minPlayers}</div>}
      {players.length >= 20 && <div className="sw-warning">{t.maxPlayers}</div>}
      <Button onClick={quickAdd} disabled={players.length >= 20}><Plus size={17} /> {t.quickAdd}</Button>

      <EmojiPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={setEmoji} current={emoji} />
      <ConfirmModal
        open={!!confirmDelete} onClose={() => setConfirmDelete(null)} danger
        title={t.confirmDelete} message={t.delete + "?"} confirmLabel={t.delete}
        onConfirm={() => { dispatch({ type: "REMOVE_PLAYER", id: confirmDelete }); setConfirmDelete(null); }}
      />
    </Screen>
  );
}

function ThemesScreen() {
  const { state, dispatch, t } = useGame();
  const { themeIds } = state;
  const [preview, setPreview] = useState(null);
  return (
    <Screen className="sw-themes-screen">
      <Header title={t.themes} onBack={() => dispatch({ type: "SET_SCREEN", screen: "home" })} />
      <div className="sw-subline">
        <span>{t.selected}: {themeIds.length} {t.of} {THEMES.length}</span>
        <div className="sw-subline-actions">
          <button onClick={() => dispatch({ type: "SELECT_ALL_THEMES" })}>{t.selectAll}</button>
          <button onClick={() => dispatch({ type: "CLEAR_THEMES" })}>{t.clearAll}</button>
        </div>
      </div>
      <div className="sw-theme-grid">
        {THEMES.map((th) => {
          const active = themeIds.includes(th.id);
          return (
            <button
              key={th.id}
              className={"sw-theme-card " + (active ? "active" : "")}
              style={{ "--accent": th.color }}
              onClick={() => dispatch({ type: "TOGGLE_THEME", id: th.id })}
            >
              <button className="sw-theme-preview-btn" onClick={(e) => { e.stopPropagation(); setPreview(th); }}><Eye size={14} /></button>
              <span className="sw-theme-emoji">{th.emoji}</span>
              <b>{themeName(th, state.settings.language)}</b>
              {active && (
                <span className="sw-theme-check">
                  <Check size={15} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      {themeIds.length === 0 && <div className="sw-warning">{t.needTheme}</div>}
      <ThemePreviewModal open={!!preview} onClose={() => setPreview(null)} theme={preview} lang={state.settings.language} />
    </Screen>
  );
}

function SettingsScreen() {
  const { state, dispatch, t } = useGame();
  const { settings, players } = state;
  const maxSpies = Math.max(1, players.length - 2);
  const upd = (payload) => dispatch({ type: "UPDATE_SETTINGS", payload });
  return (
    <Screen>
      <Header title={t.settings} onBack={() => dispatch({ type: "SET_SCREEN", screen: "home" })} />
      <div className="sw-settings-grid">
        <SettingRow icon={<Users size={18} />} title={t.spiesCount}>
          <div className="sw-stepper">
            <button onClick={() => upd({ spies: Math.max(1, settings.spies - 1) })}><Minus size={16} /></button>
            <b>{Math.min(settings.spies, maxSpies)}</b>
            <button onClick={() => upd({ spies: Math.min(maxSpies, settings.spies + 1) })}><Plus size={16} /></button>
          </div>
        </SettingRow>
        <SettingRow icon={<Clock3 size={18} />} title={t.roundTime}>
          <div className="sw-range-value">{settings.minutes} {t.minutes}</div>
          <input type="range" min="3" max="15" value={settings.minutes} onChange={(e) => upd({ minutes: +e.target.value })} />
        </SettingRow>
        <SettingRow icon={<ShieldAlert size={18} />} title={t.spyDifficulty} full>
          <div className="sw-stacked-options">
            {[["none", t.diffNone], ["theme", t.diffTheme], ["hints", t.diffHints]].map(([val, label]) => (
              <button key={val} className={settings.difficulty === val ? "active" : ""} onClick={() => upd({ difficulty: val })}>{label}</button>
            ))}
          </div>
        </SettingRow>
        <SettingRow icon={<Search size={18} />} title={t.allowSpyGuess}>
          <Toggle value={settings.allowSpyGuess} onChange={(v) => upd({ allowSpyGuess: v })} />
        </SettingRow>
        <SettingRow icon={settings.sound ? <Volume2 size={18} /> : <VolumeX size={18} />} title={t.sound}>
          <Toggle value={settings.sound} onChange={(v) => upd({ sound: v })} />
        </SettingRow>
        <SettingRow icon={<Vibrate size={18} />} title={t.vibration}>
          <Toggle value={settings.vibration} onChange={(v) => upd({ vibration: v })} />
        </SettingRow>
        <SettingRow icon={settings.dark ? <Moon size={18} /> : <Sun size={18} />} title={t.darkTheme}>
          <Toggle value={settings.dark} onChange={(v) => upd({ dark: v })} />
        </SettingRow>
        <SettingRow icon={<Languages size={18} />} title={t.language} full>
          <div className="sw-lang-options">
            <button className={settings.language === "ru" ? "active" : ""} onClick={() => upd({ language: "ru" })}>Русский</button>
            <button className={settings.language === "en" ? "active" : ""} onClick={() => upd({ language: "en" })}>English</button>
            <button className={settings.language === "tj" ? "active" : ""} onClick={() => upd({ language: "tj" })}>Тоҷикӣ</button>
          </div>
        </SettingRow>
      </div>
    </Screen>
  );
}
function SettingRow({ icon, title, children, full }) {
  return (
    <div className={"sw-setting-row " + (full ? "full" : "")}>
      <span className="sw-setting-icon">{icon}</span>
      <div className="sw-setting-main">
        <b>{title}</b>
        <div className="sw-setting-control">{children}</div>
      </div>
    </div>
  );
}

function PreGame() {
  const { state, dispatch, t } = useGame();
  const { players, themeIds, settings } = state;
  const canStart = players.length >= 3 && themeIds.length >= 1;
  const [shake, setShake] = useState(false);
  const tryStart = () => {
    if (!canStart) { setShake(true); setTimeout(() => setShake(false), 400); return; }
    dispatch({ type: "START_ROUND" });
    dispatch({ type: "SET_SCREEN", screen: "reveal" });
  };
  return (
    <Screen className="sw-center">
      <div className="sw-eyebrow">{t.ready}</div>
      <h2>{t.roundTitle}</h2>
      <div className="sw-stack-avatars">
        {players.map((p) => <span key={p.id} style={{ background: colorFor(p.name) }}>{p.emoji}</span>)}
      </div>
      <div className="sw-summary">
        <div><b>{players.length}</b><small>{t.playersWord}</small></div>
        <div><b>{Math.min(settings.spies, Math.max(1, players.length - 2))}</b><small>{t.spiesWord}</small></div>
        <div><b>{settings.minutes}</b><small>{t.minutes}</small></div>
      </div>
      <p className="sw-muted">{t.randomWordFrom} {themeIds.length} {t.activeThemes}.</p>
      <div className={shake ? "sw-shake" : ""}>
        <Button primary disabled={false} onClick={tryStart} className={!canStart ? "sw-btn-soft-disabled" : ""}>{t.startDeal}</Button>
      </div>
      {!canStart && <div className="sw-warning">{t.notEnough}</div>}
      <Button onClick={() => dispatch({ type: "SET_SCREEN", screen: "home" })}>{t.back}</Button>
    </Screen>
  );
}

function Reveal() {
  const { state, dispatch, t } = useGame();
  const { round, players, settings } = state;
  const lang = settings.language;
  const [held, setHeld] = useState(false);
  const [opened, setOpened] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const playerId = round.revealOrder[round.revealIndex];
  const player = players.find((p) => p.id === playerId);
  const isSpy = round.spyIds.includes(playerId);
  const theme = THEMES.find((th) => th.id === round.themeId);
  const words = themeWords(theme, lang);
  const word = words[round.wordIndex];
  const hints = round.hintIndices.map((i) => words[i]);
  const done = round.revealIndex >= round.revealOrder.length - 1;

  useEffect(() => { setHeld(false); setOpened(false); }, [round.revealIndex]);

  const press = (v) => {
    setHeld(v);
    if (v) { setOpened(true); if (settings.sound) beep(520, 0.05, "triangle"); if (settings.vibration && navigator.vibrate) navigator.vibrate(15); }
  };

  return (
    <Screen className="sw-center sw-reveal-screen">
      <button className="sw-icon-btn sw-corner-back" onClick={() => setConfirmLeave(true)} aria-label="back"><ArrowLeft size={20} /></button>
      <div className="sw-progress">
        <span>{t.playerOf} {round.revealIndex + 1} {t.ofWord} {round.revealOrder.length}</span>
        <div className="sw-progress-track"><div className="sw-progress-fill" style={{ width: `${((round.revealIndex + 1) / round.revealOrder.length) * 100}%` }} /></div>
      </div>
      <div className="sw-pass-label">{t.passDevice}</div>
      <div className="sw-reveal-player">
        <span>{player.emoji}</span><b>{player.name}</b>
      </div>
      <p className="sw-muted">{t.holdToReveal}</p>
      <div
        className={"sw-secret-card " + (held ? "open" : "") + (isSpy ? " spy" : "")}
        onPointerDown={() => press(true)} onPointerUp={() => press(false)}
        onPointerLeave={() => press(false)} onPointerCancel={() => press(false)}
      >
        <div className="sw-card-inner">
          <div className="sw-card-front"><span>🔒</span><b>{t.holdCard}</b></div>
          <div className="sw-card-back">
            {isSpy ? (
              <>
                <span className="sw-spy-big">🕵️</span>
                <h2>{t.youAreSpy}</h2>
                {settings.difficulty === "none" && <p>{t.spyNoInfo}</p>}
                {settings.difficulty === "theme" && <p className="sw-theme-tag" style={{ "--accent": theme.color }}>{t.spyThemeOnly} {theme.emoji} {themeName(theme, lang)}</p>}
                {settings.difficulty === "hints" && (
                  <>
                    <p className="sw-theme-tag" style={{ "--accent": theme.color }}>{t.spyThemeOnly} {theme.emoji} {themeName(theme, lang)}</p>
                    <p className="sw-hints-label">{t.spyHints}</p>
                    <div className="sw-hints-row">{hints.map((h, i) => <span key={i}>{h}</span>)}</div>
                  </>
                )}
              </>
            ) : (
              <>
                <span className="sw-theme-tag" style={{ "--accent": theme.color }}>{theme.emoji} {themeName(theme, lang)}</span>
                <h2>{word}</h2>
                <p>{t.holdToReveal}</p>
              </>
            )}
          </div>
        </div>
      </div>
      <Button primary disabled={!opened} onClick={() => { if (done) dispatch({ type: "SET_SCREEN", screen: "timer" }); else dispatch({ type: "NEXT_REVEAL" }); }}>
        {done ? t.startGame : t.doneNext}
      </Button>
      <ConfirmModal
        open={confirmLeave} onClose={() => setConfirmLeave(false)} danger
        title={t.back} message={t.leaveRoundWarning}
        confirmLabel={t.leaveRound}
        onConfirm={() => { setConfirmLeave(false); dispatch({ type: "NEW_GAME" }); }}
      />
    </Screen>
  );
}

function TimerScreen() {
  const { state, dispatch, t } = useGame();
  const { round, settings } = state;
  const lang = settings.language;
  const [paused, setPaused] = useState(false);
  const [votingOpen, setVotingOpen] = useState(false);
  const [guessOpen, setGuessOpen] = useState(false);
  const [exileBanner, setExileBanner] = useState(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  useEffect(() => {
    if (paused || round.finished || votingOpen || guessOpen) return;
    const id = setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);
    return () => clearInterval(id);
  }, [paused, round.finished, votingOpen, guessOpen]);

  useEffect(() => {
    if (round.seconds === 0 && !round.finished) {
      if (settings.sound) beep(220, 0.3, "square");
      if (settings.vibration && navigator.vibrate) navigator.vibrate([80, 40, 80]);
      setVotingOpen(true);
    }
  }, [round.seconds]);

  useEffect(() => {
    if (round.seconds <= 10 && round.seconds > 0 && settings.sound) beep(880, 0.05, "sine", 0.03);
  }, [round.seconds]);

  useEffect(() => {
    if (round.finished) dispatch({ type: "SET_SCREEN", screen: "results" });
  }, [round.finished]);

  const theme = THEMES.find((th) => th.id === round.themeId);
  const words = themeWords(theme, lang);
  const total = settings.minutes * 60;
  const pct = round.seconds / total;
  const r = 108, circ = 2 * Math.PI * r;
  const urgent = round.seconds <= 10 && round.seconds > 0;
  const mm = String(Math.floor(round.seconds / 60)).padStart(2, "0");
  const ss = String(round.seconds % 60).padStart(2, "0");

  const alivePlayers = state.players.filter((p) => round.aliveIds.includes(p.id));

  const handleExile = (id) => {
    const wasSpy = round.spyIds.includes(id);
    dispatch({ type: "EXILE_PLAYER", id });
    setVotingOpen(false);
    if (!wasSpy) {
      const p = state.players.find((pp) => pp.id === id);
      setExileBanner(p.name);
      setTimeout(() => setExileBanner(null), 2300);
      dispatch({ type: "ADD_TIME", amount: round.seconds <= 0 ? 60 : 0 });
    }
  };

  return (
    <Screen className="sw-center">
      <button className="sw-icon-btn sw-corner-back" onClick={() => setConfirmLeave(true)} aria-label="back"><ArrowLeft size={20} /></button>
      <div className="sw-eyebrow">{t.theme}: {theme.emoji} {themeName(theme, lang)}</div>
      <div className="sw-timer-ring">
        <svg viewBox="0 0 240 240">
          <circle className="sw-track" cx="120" cy="120" r={r} />
          <circle
            className={"sw-progress-ring " + (urgent ? "urgent" : "")}
            cx="120" cy="120" r={r}
            style={{ strokeDasharray: circ, strokeDashoffset: circ * (1 - pct) }}
          />
        </svg>
        <div className={"sw-timer-digits " + (urgent ? "urgent" : "")}>{mm}:{ss}</div>
      </div>
      <div className="sw-timer-actions">
        <Button onClick={() => setPaused(!paused)}>{paused ? <Play size={18} /> : <Pause size={18} />} {paused ? t.resume : t.pause}</Button>
        <Button onClick={() => setVotingOpen(true)}>{t.exile}</Button>
        {settings.allowSpyGuess && (
          <Button className="sw-spy-cta" onClick={() => setGuessOpen(true)}>🕵️ {t.iAmSpy}</Button>
        )}
      </div>

      <div className="sw-exiled-row">
        {state.players.filter((p) => round.exiledIds.includes(p.id)).map((p) => (
          <span key={p.id} className="sw-exiled-chip">{p.emoji} {p.name} ✕</span>
        ))}
      </div>

      <Modal open={votingOpen} onClose={() => setVotingOpen(false)} title={t.whoToExile} wide>
        <VotingBody players={alivePlayers} exiledIds={round.exiledIds} allPlayers={state.players} onExile={handleExile} />
      </Modal>

      <ConfirmModal
        open={confirmLeave} onClose={() => setConfirmLeave(false)} danger
        title={t.back} message={t.leaveRoundWarning}
        confirmLabel={t.leaveRound}
        onConfirm={() => { setConfirmLeave(false); dispatch({ type: "NEW_GAME" }); }}
      />

      <Modal open={guessOpen} onClose={() => setGuessOpen(false)} title={t.guessTitle} wide>
        <GuessWordBody theme={theme} lang={lang} correctIndex={round.wordIndex} onGuess={(wordIndex) => { setGuessOpen(false); dispatch({ type: "SPY_GUESS", wordIndex }); }} />
      </Modal>

      {exileBanner && (
        <div className="sw-exile-banner">
          ❌ {exileBanner} — {t.notSpyBanner}
        </div>
      )}
    </Screen>
  );
}

function VotingBody({ players, exiledIds, allPlayers, onExile }) {
  const { t } = useGame();
  const [chosen, setChosen] = useState(null);
  const exiled = allPlayers.filter((p) => exiledIds.includes(p.id));
  return (
    <div>
      <div className="sw-vote-grid">
        {players.map((p) => (
          <button key={p.id} className={"sw-vote-card " + (chosen === p.id ? "chosen" : "")} onClick={() => setChosen(p.id)}>
            <span style={{ background: colorFor(p.name) }}>{p.emoji}</span>
            <b>{p.name}</b>
            {chosen === p.id && <Check className="sw-vote-check" size={16} />}
          </button>
        ))}
      </div>
      {exiled.length > 0 && (
        <div className="sw-exiled-list">
          {exiled.map((p) => <span key={p.id} className="sw-exiled-muted">{p.emoji} {p.name} ✕</span>)}
        </div>
      )}
      <Button primary disabled={!chosen} onClick={() => onExile(chosen)}>{t.exileSelected}</Button>
    </div>
  );
}

function GuessWordBody({ theme, lang, correctIndex, onGuess }) {
  const { t } = useGame();
  const words = themeWords(theme, lang);
  const [candidateIndex, setCandidateIndex] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const optionIndices = useMemo(() => {
    const total = words.length;
    const limit = Math.min(9, total);
    const others = Array.from({ length: total }, (_, i) => i).filter((i) => i !== correctIndex);
    const picked = shuffle(others).slice(0, limit - 1);
    return shuffle([correctIndex, ...picked]);
  }, [theme.id, lang, correctIndex]);
  return (
    <div>
      <p className="sw-muted">{t.guessSubtitle} {theme.emoji} {themeName(theme, lang)}</p>
      <div className="sw-guess-grid">
        {optionIndices.map((i) => (
          <button key={i} className="sw-guess-word" style={{ "--accent": theme.color }} onClick={() => { setCandidateIndex(i); setConfirming(true); }}>{words[i]}</button>
        ))}
      </div>
      <ConfirmModal
        open={confirming} onClose={() => setConfirming(false)}
        title={t.guessTitle}
        message={`${t.confirmGuess} «${candidateIndex != null ? words[candidateIndex] : ""}»? ${t.noWayBack}`}
        onConfirm={() => { setConfirming(false); onGuess(candidateIndex); }}
      />
    </div>
  );
}

function Results() {
  const { state, dispatch, t } = useGame();
  const { round, players } = state;
  const lang = state.settings.language;
  const theme = THEMES.find((th) => th.id === round.themeId);
  const words = themeWords(theme, lang);
  const word = words[round.wordIndex];
  const spyWon = round.winner === "spy";
  const spies = players.filter((p) => round.spyIds.includes(p.id));
  const winnerIds = spyWon ? round.spyIds : players.filter((p) => !round.spyIds.includes(p.id)).map((p) => p.id);

  const recorded = useRef(false);
  useEffect(() => {
    if (!recorded.current) { dispatch({ type: "RECORD_WIN", playerIds: winnerIds }); recorded.current = true; }
  }, []);

  let headline;
  if (round.endReason === "exiled") headline = t.exiledSpyWin;
  else if (spyWon) headline = t.spyGuessedRight;
  else headline = t.spyGuessedWrong;

  return (
    <Screen className="sw-center sw-results">
      <Confetti variant={spyWon ? "spy" : "players"} />
      <Trophy size={52} className={spyWon ? "sw-trophy-spy" : "sw-trophy-players"} />
      <div className={"sw-eyebrow " + (spyWon ? "spy" : "players")}>{spyWon ? t.spyWon : t.playersWon}</div>
      <h2>{theme.emoji} {themeName(theme, lang)} — {word}</h2>
      <p className="sw-muted">{headline}</p>
      <p className="sw-muted">{t.spyWas}{spies.length > 1 ? "ы" : ""}: <b>{spies.map((s) => s.emoji + " " + s.name).join(", ")}</b></p>

      {round.endReason === "guess" && (
        <div className="sw-guess-compare">
          <div className={"sw-guess-pill " + (spyWon ? "hide" : "wrong")}>{!spyWon && "✕ "}{words[round.spyGuessIndex]}</div>
          {!spyWon && <div className="sw-guess-pill correct">✅ {word}</div>}
        </div>
      )}

      <div className="sw-result-card">
        {players.map((p) => (
          <div key={p.id} className={round.exiledIds.includes(p.id) ? "sw-result-exiled" : ""}>
            <span>{p.emoji}</span><b>{p.name}</b>
            <small>{round.spyIds.includes(p.id) ? "🕵️ ШПИОН" : "👤 " + t.players.slice(0, -1)}</small>
          </div>
        ))}
      </div>

      <Button primary onClick={() => { dispatch({ type: "START_ROUND" }); dispatch({ type: "SET_SCREEN", screen: "reveal" }); }}>{t.playAgain}</Button>
      <Button onClick={() => dispatch({ type: "NEW_GAME" })}>{t.newGame}</Button>
    </Screen>
  );
}

/* ============================== STYLES ============================== */
function StyleSheet() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; }
.sw-app {
  --bg1:#0f0c29; --bg2:#302b63; --bg3:#24243e;
  --ink:#f4f2ff; --ink-dim:#b9b3d9;
  --glass:rgba(255,255,255,0.07); --glass-border:rgba(255,255,255,0.14);
  --accent-teal:#2dd4bf; --accent-violet:#a78bfa; --accent-pink:#f472b6;
  --accent-gold:#fbbf24; --accent-green:#34d399; --accent-red:#f87171;
  --radius:20px;
  position:relative; min-height:100dvh; width:100%; overflow-x:hidden;
  font-family:'Inter',system-ui,sans-serif; color:var(--ink);
  padding-top:env(safe-area-inset-top); padding-bottom:env(safe-area-inset-bottom);
}
.sw-app[data-spy-theme="light"] {
  --bg1:#eef2ff; --bg2:#e0e7ff; --bg3:#f5f3ff;
  --ink:#241f42; --ink-dim:#5b5480;
  --glass:rgba(255,255,255,0.55); --glass-border:rgba(120,110,180,0.18);
}
.sw-app::before {
  content:""; position:fixed; inset:0; z-index:-2;
  background:linear-gradient(160deg,var(--bg1),var(--bg2) 55%,var(--bg3));
}
.sw-ambient { position:fixed; inset:0; z-index:-1; pointer-events:none; overflow:hidden; }
.sw-rainbow {
  position: absolute;
  inset: -10% -10% 0 -10%;
  z-index: -1;
  background: linear-gradient(120deg, #ff3d81, #7c5cff, #3ddcff, #5cff8f, #ffe23d, #ff9a3d, #ff3d81);
  background-size: 300% 300%;
  opacity: 0.14;
  mix-blend-mode: screen;
  /* анимация только на десктопе */
  animation: none;
}
.sw-app[data-spy-theme="light"] .sw-rainbow {
  opacity: 0.08;
  mix-blend-mode: multiply;
}

/* Анимация радуги — только широкие экраны без reduced-motion */
@media (min-width: 900px) and (prefers-reduced-motion: no-preference) {
  .sw-rainbow {
    animation: sw-rainbow-flow 22s ease-in-out infinite;
  }
}
@keyframes sw-rainbow-flow {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.sw-skyline {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;                    /* на весь экран */
  height: auto;
  width: 100%;
  opacity: 0.55;
  pointer-events: none;
  z-index: 0;
  display: flex;
  align-items: flex-end;     /* здания прижаты к низу */
}
.sw-skyline {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;          /* прижат к низу */
  top: auto;          /* важно: не top: 0 */
  width: 100%;
  height: 42vh;
  min-height: 180px;
  max-height: 380px;
  opacity: 0.75;
  pointer-events: none;
  z-index: 0;
  display: block;
  transform: translateZ(0);
  contain: layout paint;
}
.sw-skyline svg {
  width: 100%;
  height: 100%;
  display: block;
}
.sw-app[data-spy-theme="light"] .sw-skyline {
  opacity: 0.28;
}

/* Телефон */
@media (max-width: 600px) {
  .sw-skyline {
    height: 36vh;
    min-height: 190px;
    max-height: 300px;
  }
}

/* Планшет */
@media (min-width: 601px) and (max-width: 1024px) {
  .sw-skyline {
    height: 38vh;
    min-height: 220px;
    max-height: 360px;
  }
}

/* Ноут / ПК */
@media (min-width: 1025px) {
  .sw-skyline {
    height: 40vh;
    min-height: 260px;
    max-height: 420px;
  }
}

/* Горизонтальный телефон */
@media (max-height: 500px) {
  .sw-skyline {
    height: 30vh;
    min-height: 100px;
  }
}
.sw-screen {
  position:relative; max-width:520px; margin:0 auto; padding:20px 20px 48px;
  min-height:100dvh; display:flex; flex-direction:column; gap:14px;
}
.sw-screen.sw-center { align-items:center; text-align:center; justify-content:flex-start; padding-top:40px; }
/* Themes screen needs extra bottom padding for mobile scroll */
.sw-themes-screen { padding-bottom:80px; }

h1,h2,h3 { font-family:'Manrope',sans-serif; font-weight:800; margin:0; }
.sw-muted { color:var(--ink-dim); font-size:0.92rem; line-height:1.5; margin:0; }

/* Splash */
.sw-splash { align-items:center; justify-content:center; text-align:center; }
.sw-splash-logo .sw-logo-mark { width:clamp(120px,32vw,180px); height:clamp(120px,32vw,180px); margin:0 auto; }
.sw-logo-svg { width:100%; height:100%; display:block; }
.sw-splash-logo h1 { font-size:clamp(1.8rem,6vw,2.4rem); letter-spacing:0.06em; margin-top:6px; }
.sw-splash-logo p { color:var(--ink-dim); margin-top:6px; }

/* Home */
.sw-home { justify-content:center; }
.sw-home-layout { display:flex; flex-direction:column; align-items:center; gap:8px; width:100%; }
.sw-emblem { position:relative; width:min(28vw,140px); height:min(28vw,140px); border-radius:50%; display:flex; align-items:center; justify-content:center; background:rgba(167,139,250,0.18); margin-bottom:6px; padding:6px; }
.sw-home-main { width:100%; max-width:420px; display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px; margin:0 auto; }
.sw-title-pulse { font-size:clamp(2.2rem,9vw,3rem); letter-spacing:0.08em; text-shadow:0 0 24px rgba(167,139,250,0.5); }
.sw-tagline { color:var(--ink-dim); margin-bottom:8px; }
.sw-menu { width:100%; display:flex; flex-direction:column; gap:10px; margin-top:6px; }
.sw-menu-btn { width:100%; justify-content:center; font-size:1.05rem; }
.sw-badge { background:rgba(255,255,255,0.18); border-radius:999px; padding:1px 9px; font-size:0.8rem; margin-left:6px; }
.sw-home-stats { display:flex; gap:16px; margin-top:14px; color:var(--ink-dim); font-size:0.85rem; }

/* Buttons */
.sw-btn {
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:14px 20px; border-radius:16px; border:1px solid var(--glass-border);
  background:var(--glass); color:var(--ink);
  font-weight:600; font-size:0.98rem; cursor:pointer; min-height:48px;
  box-shadow:0 6px 18px rgba(0,0,0,0.18);
}
.sw-btn:disabled { opacity:0.4; cursor:not-allowed; }
.sw-btn-primary { background:linear-gradient(135deg,var(--accent-violet),var(--accent-pink)); border:none; color:#fff; }
.sw-btn-danger { background:linear-gradient(135deg,#ef4444,#b91c1c); border:none; color:#fff; }
.sw-spy-cta { background:linear-gradient(135deg,#7c3aed,#c026d3); border:none; color:#fff; }
.sw-icon-btn { width:44px; height:44px; border-radius:12px; border:none; background:var(--glass); color:var(--ink); display:flex; align-items:center; justify-content:center; cursor:pointer; }

/* Header */
.sw-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; }
.sw-corner-back { position:absolute; top:16px; left:16px; z-index:10; }
.sw-reveal-screen, .sw-center { position:relative; }
.sw-header h1 { font-size:1.2rem; }

/* Toggle */
.sw-toggle { display:inline-flex; align-items:center; gap:8px; border:none; background:rgba(255,255,255,0.12); border-radius:999px; width:52px; height:30px; padding:3px; cursor:pointer; position:relative; }
.sw-toggle-knob { width:24px; height:24px; border-radius:50%; background:#fff; transition:transform 0.2s; }
.sw-toggle.on { background:linear-gradient(135deg,var(--accent-violet),var(--accent-pink)); }
.sw-toggle.on .sw-toggle-knob { transform:translateX(22px); }
.sw-toggle em { font-style:normal; font-size:0.85rem; margin-left:4px; white-space:nowrap; }

/* Modal */
.sw-backdrop { position:fixed; inset:0; background:rgba(10,8,24,0.6); display:flex; align-items:flex-end; justify-content:center; z-index:100; }
.sw-modal { width:100%; max-width:100%; background:var(--bg3); border:1px solid var(--glass-border); border-radius:24px 24px 0 0; padding:18px 18px 26px; max-height:82vh; overflow-y:auto; }
.sw-modal-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.sw-modal-actions { display:flex; gap:10px; margin-top:16px; }
.sw-modal-actions .sw-btn { flex:1; }

/* Emoji grid */
.sw-emoji-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:8px; }
.sw-emoji { font-size:1.6rem; background:var(--glass); border:1px solid transparent; border-radius:12px; padding:8px 0; cursor:pointer; min-height:48px; }
.sw-emoji.selected { border-color:var(--accent-violet); box-shadow:0 0 0 2px rgba(167,139,250,0.5); }

/* Preview */
.sw-preview-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
.sw-preview-word { background:var(--glass); border-left:3px solid var(--accent); border-radius:10px; padding:9px 12px; font-size:0.92rem; }

/* Add player row */
.sw-add-row { display:flex; gap:10px; align-items:center; }
.sw-avatar-btn { width:52px; height:52px; border-radius:16px; background:var(--glass); border:1px solid var(--glass-border); font-size:1.5rem; cursor:pointer; flex-shrink:0; }
.sw-name-input { flex:1; position:relative; background:var(--glass); border:1px solid var(--glass-border); border-radius:14px; padding:0 12px; display:flex; align-items:center; }
.sw-name-input input { flex:1; background:transparent; border:none; outline:none; color:var(--ink); padding:14px 0; font-size:1rem; }
.sw-name-input small { color:var(--ink-dim); font-size:0.75rem; }
.sw-round-btn { width:48px; height:48px; border-radius:14px; border:none; background:linear-gradient(135deg,var(--accent-violet),var(--accent-pink)); color:#fff; cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
.sw-round-btn:disabled { opacity:0.4; }

.sw-warning { background:rgba(248,113,113,0.14); border:1px solid rgba(248,113,113,0.4); color:#fca5a5; padding:10px 14px; border-radius:12px; font-size:0.88rem; }
.sw-shake { animation:sw-shake 0.4s; }
@keyframes sw-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }

.sw-player-list { display:flex; flex-direction:column; gap:8px; }
.sw-player-card { display:flex; align-items:center; gap:10px; background:var(--glass); border:1px solid var(--glass-border); border-radius:16px; padding:10px 12px; }
.sw-player-card.dragging { opacity:0.5; }
.sw-drag { color:var(--ink-dim); cursor:grab; }
.sw-player-avatar { width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0; }
.sw-player-name, .sw-inline-edit { flex:1; font-weight:600; overflow-wrap:anywhere; }
.sw-inline-edit { background:transparent; border:none; border-bottom:1px solid var(--accent-violet); outline:none; color:var(--ink); font-weight:600; width:100%; }
.sw-win-count { display:flex; align-items:center; gap:3px; font-size:0.75rem; color:var(--accent-gold); }
.sw-small-icon { width:36px; height:36px; border-radius:10px; border:none; background:rgba(255,255,255,0.08); color:var(--ink); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
.sw-small-icon.danger { color:var(--accent-red); }

.sw-subline { display:flex; align-items:center; justify-content:space-between; font-size:0.85rem; color:var(--ink-dim); position:sticky; top:0; padding:8px 4px; z-index:5; background:transparent; }
.sw-subline-actions button { background:none; border:none; color:var(--accent-violet); font-weight:600; cursor:pointer; margin-left:12px; }

.sw-theme-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
.sw-theme-card { position:relative; background:var(--glass); border:1px solid var(--glass-border); border-radius:16px; padding:16px 10px; display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; min-height:48px; }
.sw-theme-card.active { border-color:var(--accent); box-shadow:0 0 0 2px var(--accent) inset; }
.sw-theme-emoji { font-size:1.7rem; }
.sw-theme-card b { font-size:0.85rem; text-align:center; }
.sw-theme-check { position:absolute; bottom:8px; right:8px; background:var(--accent); border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; color:#fff; }
.sw-theme-preview-btn { position:absolute; top:6px; right:6px; width:26px; height:26px; border-radius:50%; border:none; background:rgba(0,0,0,0.25); color:#fff; display:flex; align-items:center; justify-content:center; }

.sw-settings-grid { display:flex; flex-direction:column; gap:10px; }
.sw-setting-row { display:flex; align-items:center; gap:12px; background:var(--glass); border:1px solid var(--glass-border); border-radius:16px; padding:12px 14px; }
.sw-setting-icon { width:38px; height:38px; border-radius:11px; background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.sw-setting-main { flex:1; display:flex; flex-direction:column; gap:8px; }
.sw-setting-row.full { flex-direction:column; align-items:stretch; }
.sw-setting-control { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.sw-stepper { display:flex; align-items:center; justify-content:center; gap:16px; width:100%; }
.sw-stepper b { min-width:24px; text-align:center; font-size:1.15rem; }
.sw-stepper button { width:36px; height:36px; border-radius:10px; border:none; background:rgba(255,255,255,0.12); color:var(--ink); cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.sw-range-value { font-weight:700; }
input[type="range"] { width:100%; accent-color:var(--accent-violet); }

.sw-stacked-options { display:flex; flex-direction:column; gap:8px; width:100%; }
.sw-stacked-options button { width:100%; text-align:center; background:rgba(255,255,255,0.06); border:1px solid transparent; border-radius:12px; padding:12px 14px; font-size:0.9rem; font-weight:600; color:var(--ink-dim); cursor:pointer; line-height:1.3; }
.sw-stacked-options button.active { background:var(--accent-teal); color:#022; box-shadow:0 4px 14px rgba(45,212,191,0.35); }

.sw-lang-options { display:flex; gap:6px; width:100%; flex-wrap:wrap; }
.sw-lang-options button { flex:1; min-width:96px; background:rgba(255,255,255,0.06); border:1px solid transparent; border-radius:12px; padding:11px 8px; font-weight:600; font-size:0.86rem; color:var(--ink-dim); cursor:pointer; }
.sw-lang-options button.active { background:var(--accent-teal); color:#022; box-shadow:0 4px 14px rgba(45,212,191,0.35); }

.sw-eyebrow { text-transform:none; color:var(--accent-teal); font-weight:700; letter-spacing:0.04em; }
.sw-eyebrow.spy { color:var(--accent-gold); }
.sw-eyebrow.players { color:var(--accent-green); }
.sw-stack-avatars { display:flex; }
.sw-stack-avatars span { width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.3rem; margin-left:-12px; border:2px solid var(--bg3); }
.sw-summary { display:flex; gap:20px; }
.sw-summary div { display:flex; flex-direction:column; align-items:center; }
.sw-summary b { font-size:1.5rem; }
.sw-summary small { color:var(--ink-dim); font-size:0.75rem; }

.sw-progress { width:100%; font-size:0.8rem; color:var(--ink-dim); }
.sw-progress-track { height:5px; background:rgba(255,255,255,0.1); border-radius:99px; margin-top:6px; overflow:hidden; }
.sw-progress-fill { height:100%; background:linear-gradient(90deg,var(--accent-teal),var(--accent-violet)); transition:width 0.3s; }
.sw-pass-label { color:var(--ink-dim); font-size:0.9rem; }
.sw-reveal-player { display:flex; align-items:center; gap:10px; font-size:1.4rem; }
.sw-reveal-player span { font-size:2rem; }

.sw-secret-card { width:100%; max-width:340px; aspect-ratio:3/4; perspective:1200px; cursor:pointer; user-select:none; touch-action:none; }
.sw-card-inner { position:relative; width:100%; height:100%; transform-style:preserve-3d; transition:transform 0.5s; }
.sw-secret-card.open .sw-card-inner { transform:rotateY(180deg); }
.sw-card-front, .sw-card-back { position:absolute; inset:0; backface-visibility:hidden; border-radius:22px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:20px; text-align:center; border:1px solid var(--glass-border); }
.sw-card-front { background:linear-gradient(160deg,rgba(167,139,250,0.25),rgba(45,212,191,0.15)); font-size:2.4rem; }
.sw-card-front b { font-size:1rem; }
.sw-card-back { transform:rotateY(180deg); background:linear-gradient(160deg,rgba(45,212,191,0.22),rgba(167,139,250,0.18)); }
.sw-secret-card.spy .sw-card-back { background:linear-gradient(160deg,rgba(190,24,93,0.35),rgba(124,58,237,0.3)); }
.sw-spy-big { font-size:2.6rem; }
.sw-theme-tag { background:var(--accent); color:#fff; padding:6px 14px; border-radius:999px; font-weight:700; font-size:0.85rem; }
.sw-card-back h2 { font-size:clamp(1.6rem,7vw,2.2rem); }
.sw-hints-label { font-size:0.8rem; color:var(--ink-dim); margin-top:6px; }
.sw-hints-row { display:flex; gap:6px; flex-wrap:wrap; justify-content:center; }
.sw-hints-row span { background:rgba(255,255,255,0.12); padding:4px 10px; border-radius:999px; font-size:0.8rem; }

.sw-timer-ring { position:relative; width:min(70vw,240px); aspect-ratio:1; }
.sw-timer-ring svg { width:100%; height:100%; transform:rotate(-90deg); }
.sw-track { fill:none; stroke:rgba(255,255,255,0.1); stroke-width:12; }
.sw-progress-ring { fill:none; stroke:var(--accent-green); stroke-width:12; stroke-linecap:round; transition:stroke-dashoffset 1s linear, stroke 0.3s; }
.sw-progress-ring.urgent { stroke:var(--accent-red); }
.sw-timer-digits { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:clamp(1.8rem,8vw,2.6rem); font-weight:800; font-family:'Manrope',sans-serif; }
.sw-timer-digits.urgent { color:var(--accent-red); }
.sw-timer-actions { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
.sw-exiled-row { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
.sw-exiled-chip { background:rgba(255,255,255,0.08); color:var(--ink-dim); padding:6px 10px; border-radius:999px; font-size:0.78rem; text-decoration:line-through; }

.sw-exile-banner { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(20,15,40,0.95); border:1px solid var(--accent-red); color:#fff; padding:16px 22px; border-radius:16px; font-weight:700; z-index:200; text-align:center; max-width:80vw; }

.sw-vote-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
.sw-vote-card { position:relative; display:flex; flex-direction:column; align-items:center; gap:6px; background:var(--glass); border:1px solid var(--glass-border); border-radius:14px; padding:12px 8px; cursor:pointer; }
.sw-vote-card span { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.2rem; }
.sw-vote-card.chosen { border-color:var(--accent-violet); box-shadow:0 0 0 2px var(--accent-violet) inset; }
.sw-vote-check { position:absolute; top:6px; right:6px; color:var(--accent-violet); }
.sw-exiled-list { display:flex; gap:6px; flex-wrap:wrap; margin-top:10px; }
.sw-exiled-muted { opacity:0.4; font-size:0.8rem; text-decoration:line-through; }

.sw-guess-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; max-height:44vh; overflow-y:auto; margin:10px 0; }
.sw-guess-word { background:var(--glass); border:1px solid var(--accent); border-radius:12px; padding:10px 6px; font-weight:600; font-size:0.9rem; cursor:pointer; color:var(--ink); }

.sw-results { padding-top:24px; }
.sw-trophy-spy { color:var(--accent-gold); }
.sw-trophy-players { color:var(--accent-green); }
.sw-guess-compare { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; }
.sw-guess-pill { padding:8px 14px; border-radius:999px; font-weight:700; }
.sw-guess-pill.wrong { background:rgba(248,113,113,0.18); color:#fca5a5; text-decoration:line-through; }
.sw-guess-pill.correct { background:rgba(52,211,153,0.18); color:#6ee7b7; }
.sw-guess-pill.hide { display:none; }
.sw-result-card { width:100%; display:flex; flex-direction:column; gap:8px; }
.sw-result-card > div { display:flex; align-items:center; gap:10px; background:var(--glass); border:1px solid var(--glass-border); border-radius:12px; padding:10px 12px; text-align:left; }
.sw-result-card > div small { margin-left:auto; color:var(--ink-dim); }
.sw-result-exiled { opacity:0.55; }

.sw-confetti { position:fixed; inset:0; overflow:hidden; pointer-events:none; z-index:5; }

/* ============ TABLET / LANDSCAPE ============ */
@media (min-width:768px) {
  .sw-screen { padding:32px 40px 48px; max-width:min(90vw,760px); }
  .sw-player-list { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
  .sw-theme-grid { grid-template-columns:repeat(4,1fr); }
  .sw-settings-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
  .sw-setting-row.full { grid-column:1/-1; }
  .sw-emoji-grid { grid-template-columns:repeat(8,1fr); }
  .sw-guess-grid { grid-template-columns:repeat(4,1fr); }
  .sw-vote-grid { grid-template-columns:repeat(3,1fr); }
  .sw-backdrop { align-items:center; }
  .sw-modal { max-width:520px; border-radius:24px; max-height:80vh; }
  .sw-secret-card { max-width:400px; }
}
@media (min-width:1024px) {
  .sw-screen { max-width:820px; }
  .sw-theme-grid { grid-template-columns:repeat(5,1fr); }
  .sw-guess-grid { grid-template-columns:repeat(5,1fr); }
  .sw-vote-grid { grid-template-columns:repeat(4,1fr); }
}
@media (min-width:1440px) {
  .sw-screen { max-width:900px; }
  .sw-theme-grid { grid-template-columns:repeat(6,1fr); }
}
@media (prefers-reduced-motion:reduce) {
  * { animation-duration:0.01ms !important; transition-duration:0.01ms !important; }
}
    `}</style>
  );
}

function CitySkyline() {
  return (
    <div className="sw-skyline" aria-hidden="true">
   <svg
  viewBox="0 0 1000 300"
  preserveAspectRatio="xMidYMax meet"
  xmlns="http://www.w3.org/2000/svg"
>
        <defs>
          <linearGradient id="bldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1040"/>
            <stop offset="100%" stopColor="#0d0820"/>
          </linearGradient>
          <linearGradient id="bldGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#211550"/>
            <stop offset="100%" stopColor="#120c2e"/>
          </linearGradient>
        </defs>

        {/* Far background buildings */}
        <g fill="url(#bldGrad2)" opacity="0.55">
          <rect x="0" y="180" width="45" height="120"/>
          <rect x="43" y="200" width="30" height="100"/>
          <rect x="71" y="170" width="38" height="130"/>
          <rect x="870" y="185" width="40" height="115"/>
          <rect x="908" y="205" width="35" height="95"/>
          <rect x="941" y="175" width="59" height="125"/>
          <rect x="300" y="195" width="35" height="105"/>
          <rect x="650" y="190" width="40" height="110"/>
          <rect x="690" y="210" width="28" height="90"/>
        </g>

        {/* Main city silhouette */}
        <g fill="url(#bldGrad)">
          {/* Left cluster */}
          <rect x="0" y="200" width="48" height="100"/>
          <rect x="46" y="220" width="32" height="80"/>
          <rect x="76" y="185" width="42" height="115"/>
          <rect x="116" y="230" width="22" height="70"/>

          {/* Tall tower left */}
          <rect x="136" y="110" width="68" height="190"/>
          <rect x="148" y="72" width="44" height="40"/>
          <rect x="158" y="48" width="24" height="26"/>
          <rect x="165" y="28" width="10" height="22"/>
          <polygon points="166,28 174,28 170,6"/>

          {/* Mid-left buildings */}
          <rect x="206" y="175" width="36" height="125"/>
          <rect x="240" y="195" width="28" height="105"/>
          <rect x="266" y="148" width="50" height="152"/>
          <rect x="278" y="128" width="26" height="22"/>
          <rect x="314" y="210" width="24" height="90"/>

          {/* Central tall tower */}
          <rect x="336" y="85" width="78" height="215"/>
          <rect x="348" y="58" width="54" height="30"/>
          <rect x="358" y="36" width="34" height="24"/>
          <rect x="368" y="14" width="14" height="24"/>
          <polygon points="369,14 383,14 376,-8"/>

          {/* Center cluster */}
          <rect x="412" y="190" width="30" height="110"/>
          <rect x="440" y="155" width="44" height="145"/>
          {/* Dome building */}
          <rect x="482" y="175" width="60" height="125"/>
          <ellipse cx="512" cy="175" rx="30" ry="22"/>
          <rect x="508" y="128" width="8" height="50"/>

          {/* Right-center */}
          <rect x="540" y="200" width="36" height="100"/>
          <rect x="574" y="162" width="52" height="138"/>
          <rect x="586" y="140" width="28" height="24"/>

          {/* Right tall tower */}
          <rect x="624" y="92" width="74" height="208"/>
          <polygon points="624,92 661,48 698,92"/>
          <rect x="657" y="34" width="8" height="16"/>

          {/* Right cluster */}
          <rect x="696" y="188" width="38" height="112"/>
          <rect x="732" y="172" width="30" height="128"/>
          <rect x="760" y="198" width="26" height="102"/>
          <rect x="784" y="152" width="50" height="148"/>
          <rect x="796" y="130" width="26" height="24"/>

          {/* Far right */}
          <rect x="832" y="218" width="34" height="82"/>
          <rect x="864" y="195" width="40" height="105"/>
          <rect x="902" y="210" width="30" height="90"/>
          <rect x="930" y="180" width="44" height="120"/>
          <rect x="972" y="215" width="28" height="85"/>
        </g>

        {/* Windows - pink/violet/yellow */}
        <g opacity="0.6">
          {/* Left tower windows */}
          <rect x="145" y="122" width="8" height="6" rx="1" fill="#f472b6"/>
          <rect x="159" y="122" width="8" height="6" rx="1" fill="#a78bfa"/>
          <rect x="173" y="122" width="8" height="6" rx="1" fill="#fbbf24"/>
          <rect x="187" y="122" width="8" height="6" rx="1" fill="#f472b6"/>
          <rect x="145" y="142" width="8" height="6" rx="1" fill="#a78bfa"/>
          <rect x="159" y="142" width="8" height="6" rx="1" fill="#fbbf24"/>
          <rect x="173" y="142" width="8" height="6" rx="1" fill="#f472b6"/>
          <rect x="187" y="142" width="8" height="6" rx="1" fill="#a78bfa"/>
          <rect x="145" y="162" width="8" height="6" rx="1" fill="#fbbf24"/>
          <rect x="159" y="162" width="8" height="6" rx="1" fill="#f472b6"/>
          <rect x="173" y="162" width="8" height="6" rx="1" fill="#a78bfa"/>
          <rect x="187" y="162" width="8" height="6" rx="1" fill="#fbbf24"/>
          <rect x="145" y="182" width="8" height="6" rx="1" fill="#f472b6"/>
          <rect x="173" y="182" width="8" height="6" rx="1" fill="#fbbf24"/>
          {/* Center tower windows */}
          <rect x="344" y="98" width="9" height="7" rx="1" fill="#a78bfa"/>
          <rect x="358" y="98" width="9" height="7" rx="1" fill="#fbbf24"/>
          <rect x="372" y="98" width="9" height="7" rx="1" fill="#f472b6"/>
          <rect x="386" y="98" width="9" height="7" rx="1" fill="#a78bfa"/>
          <rect x="344" y="120" width="9" height="7" rx="1" fill="#fbbf24"/>
          <rect x="358" y="120" width="9" height="7" rx="1" fill="#f472b6"/>
          <rect x="372" y="120" width="9" height="7" rx="1" fill="#a78bfa"/>
          <rect x="386" y="120" width="9" height="7" rx="1" fill="#fbbf24"/>
          <rect x="344" y="142" width="9" height="7" rx="1" fill="#f472b6"/>
          <rect x="372" y="142" width="9" height="7" rx="1" fill="#fbbf24"/>
          <rect x="344" y="164" width="9" height="7" rx="1" fill="#a78bfa"/>
          <rect x="358" y="164" width="9" height="7" rx="1" fill="#f472b6"/>
          <rect x="386" y="164" width="9" height="7" rx="1" fill="#a78bfa"/>
          {/* Right tower windows */}
          <rect x="632" y="105" width="9" height="7" rx="1" fill="#f472b6"/>
          <rect x="646" y="105" width="9" height="7" rx="1" fill="#a78bfa"/>
          <rect x="660" y="105" width="9" height="7" rx="1" fill="#fbbf24"/>
          <rect x="674" y="105" width="9" height="7" rx="1" fill="#f472b6"/>
          <rect x="688" y="105" width="9" height="7" rx="1" fill="#a78bfa"/>
          <rect x="632" y="127" width="9" height="7" rx="1" fill="#fbbf24"/>
          <rect x="646" y="127" width="9" height="7" rx="1" fill="#f472b6"/>
          <rect x="674" y="127" width="9" height="7" rx="1" fill="#fbbf24"/>
          <rect x="632" y="149" width="9" height="7" rx="1" fill="#a78bfa"/>
          <rect x="660" y="149" width="9" height="7" rx="1" fill="#f472b6"/>
          <rect x="688" y="149" width="9" height="7" rx="1" fill="#fbbf24"/>
          <rect x="632" y="171" width="9" height="7" rx="1" fill="#f472b6"/>
          <rect x="646" y="171" width="9" height="7" rx="1" fill="#a78bfa"/>
          <rect x="674" y="171" width="9" height="7" rx="1" fill="#f472b6"/>
          {/* Misc windows scattered */}
          <rect x="270" y="160" width="7" height="5" rx="1" fill="#a78bfa"/>
          <rect x="282" y="160" width="7" height="5" rx="1" fill="#f472b6"/>
          <rect x="270" y="178" width="7" height="5" rx="1" fill="#fbbf24"/>
          <rect x="282" y="178" width="7" height="5" rx="1" fill="#a78bfa"/>
          <rect x="448" y="168" width="7" height="5" rx="1" fill="#f472b6"/>
          <rect x="460" y="168" width="7" height="5" rx="1" fill="#fbbf24"/>
          <rect x="448" y="184" width="7" height="5" rx="1" fill="#a78bfa"/>
          <rect x="580" y="175" width="7" height="5" rx="1" fill="#f472b6"/>
          <rect x="592" y="175" width="7" height="5" rx="1" fill="#a78bfa"/>
          <rect x="580" y="191" width="7" height="5" rx="1" fill="#fbbf24"/>
          <rect x="790" y="165" width="7" height="5" rx="1" fill="#a78bfa"/>
          <rect x="802" y="165" width="7" height="5" rx="1" fill="#f472b6"/>
          <rect x="814" y="165" width="7" height="5" rx="1" fill="#fbbf24"/>
          <rect x="790" y="181" width="7" height="5" rx="1" fill="#f472b6"/>
          <rect x="814" y="181" width="7" height="5" rx="1" fill="#a78bfa"/>
        </g>

        {/* Ground */}
        <rect x="0" y="295" width="1000" height="5" fill="#0d0820"/>
      </svg>
    </div>
  );
}

/* ============================== ROOT APP ============================== */
function Shell() {
  const { state } = useGame();
  const screens = {
    splash: <Splash key="splash" />,
    home: <Home key="home" />,
    players: <PlayersScreen key="players" />,
    themes: <ThemesScreen key="themes" />,
    settings: <SettingsScreen key="settings" />,
    pregame: <PreGame key="pregame" />,
    reveal: state.round && <Reveal key="reveal" />,
    timer: state.round && <TimerScreen key="timer" />,
    results: state.round && <Results key="results" />,
  };
  return (
    <div className="sw-app" data-spy-theme={state.settings.dark ? "dark" : "light"}>
      <StyleSheet />
      <div className="sw-ambient">
        <div className="sw-rainbow" />
        <CitySkyline />
      </div>
      <AnimatePresence mode="wait">
        {screens[state.screen] || <Home key="home" />}
      </AnimatePresence>
    </div>
  );
}

export default function SpyWordGame() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  );
}
