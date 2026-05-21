import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

const STORAGE_KEY = "sena_guide_posts_v1";
const SETTINGS_KEY = "sena_guide_site_settings_v1";

const defaultSettings = {
  guildCode: "1234",
  favoriteHeroOrders: {
    guildWarDefense: ["라드그리드", "손오공", "엘리시아", "여포", "브란즈&브란셀", "란드그리드", "태오", "델론즈", "콜트"],
    guildWarAttack: ["파이", "밀리아", "겔리두스", "여포", "란드그리드", "로지", "미스트", "아킬라", "레긴레이프", "오목", "프레이야"],

    totalWar: ["파이", "밀리아", "겔리두스", "여포", "란드그리드", "로지", "미스트", "아킬라", "레긴레이프", "오목", "프레이야"],
    arena: ["라드그리드", "손오공", "엘리시아", "여포", "브란즈&브란셀", "란드그리드", "태오", "델론즈", "콜트", "미스트", "아킬라"],
    highArena: ["라드그리드", "손오공", "엘리시아", "여포", "브란즈&브란셀", "란드그리드", "태오", "델론즈", "콜트", "미스트", "아킬라"],

    pveCommon: ["파이", "미스트", "레이첼", "세인", "비스킷", "아일린", "크리스", "델론즈", "레긴레이프"],

    // 기존 저장 데이터 호환용. 당장 안 써도 남겨둬도 됨.
    fiveHero: ["파이", "미스트", "레이첼", "세인", "비스킷", "아일린", "크리스", "델론즈"],
  },
};

const heroFileMap = {
  "브란즈&브란셀": "브브",
  "칼 헤론": "칼헤론",
};

const heroAliasMap = {
  "브란즈&브란셀": ["브브", "브란즈", "브란셀", "브란즈브란셀"],
  "칼 헤론": ["칼헤론", "칼"],
};

const petFileMap = {
  "멜패로": "멜패로",
};

const allHeroes = [
  "파이", "밀리아", "겔리두스", "쥬리", "로지", "카구라", "칼 헤론", "태오", "델론즈", "콜트", "라이언", "카일",
  "브란즈&브란셀", "여포", "란드그리드", "연희", "실베스타", "바네사", "멜키르", "키리엘",
  "프레이야", "린", "레긴레이프", "성진우", "오목", "루디", "아킬라", "라드그리드", "플라튼",
  "비스킷", "크리스", "아일린", "레이첼", "제이브", "스파이크", "엘리시아", "트루드", "카르마",
  "팔라누스", "손오공", "미스트", "오를리", "나타", "에이스", "클라한", "세인",
  "에스파다", "파스칼", "백룡", "데이지", "소교", "돼오", "비담", "발리스타", "타카",
  "아멜리아", "유신", "벨리카", "루리", "미호", "녹스", "룩", "아라곤", "리나", "엘리스",
  "니아", "지크", "챈슬러", "백각", "관우", "초선", "차해인", "레오", "헤브니아", "풍연",
  "쥬피", "제인", "블랙로즈", "진", "조운", "샤오", "유리", "아리엘", "세라", "노호",
  "리", "에반", "유진호", "카린", "카론", "루시", "유이", "클로에", "이주희", "빅토리아",
  "아수라", "호킨", "소이", "메이", "캐티", "레이", "베인", "클레오", "조커", "실비아",
  "라쿤", "헬레니아", "사라", "라니아", "링링",
];

const pets = ["루", "유", "이린", "카람", "멜패로", "리첼", "요랑", "제오", "파이크", "크리", "윈디"];

const baseNavItems = [
  { id: "home", label: "홈" },
  { id: "notices", label: "공지사항" },
  { id: "posts", label: "공략 보기" },
  { id: "write", label: "공략 작성" },
  { id: "mistCut", label: "미스트 즉사컷" },
  { id: "heroes", label: "영웅 도감" },
];

const adminNavItem = { id: "admin", label: "관리자 설정" };

const speedBattleLabels = {
  win: "속공 승",
  lose: "속공 패",
  unknown: "모름",
};

const skillOptions = ["1스", "2스", "각성"];

const equipmentSets = ["선봉장", "추적자", "성기사", "수문장", "수호자", "암살자", "복수자", "주술사", "조율자"];
const formationOptions = ["기본 진형", "밸런스 진형", "공격 진형", "보호 진형"];
const weaponMainOptions = ["약공", "치확", "치피", "모공퍼", "방퍼", "생퍼", "효적", "깡생", "깡방", "깡공"];
const armorMainOptions = ["받피감", "막기", "모공퍼", "효저", "깡모공", "방퍼", "생퍼", "깡방", "깡생"];
const accessoryGradeOptions = ["4", "5", "6"];
const accessoryTypeOptions = ["부활", "권능", "불사", "기타"];

const BASE_ATK_WUKONG = 1306;
const BASE_ATK_MIST = 1306;
const PET_BASE_ATK = 564;
const WUKONG_HEAL_RATE = 0.45;

const yuHealReductionOptions = [
  { key: "none", label: "유 없음", reduction: 0 },
  { key: "yu0", label: "기본", reduction: 0.32 },
  { key: "yu1", label: "1강", reduction: 0.34 },
  { key: "yu2", label: "2강", reduction: 0.37 },
  { key: "yu3", label: "3강", reduction: 0.4 },
];

const KALHERON_HEAL_REDUCTION = 0.52;
const REGINLEIF_HEAL_REDUCTION = 0.44;

const wukongFormationOptions = [
  { key: "attackBack", label: "공격진형 뒷줄", value: 0.105 },
  { key: "protect", label: "보호진형", value: 0.42 },
  { key: "none", label: "없음/기타", value: 0 },
  { key: "custom", label: "직접 입력", value: 0 },
];

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function calculateMistKillCut({
  wukongHeal,
  yuCondition,
  hasKalheron,
  hasReginleif,
  wukongFormationKey,
  customFormationPercent,
  wukongPetPotentialAtkPercent,
  mistPetPotentialAtkPercent,
}) {

  const yuOption = yuHealReductionOptions.find((item) => item.key === yuCondition);
  const yuReduction = yuOption?.reduction ?? 0;

  const totalHealReduction =
    yuReduction +
    (hasKalheron ? KALHERON_HEAL_REDUCTION : 0) +
    (hasReginleif ? REGINLEIF_HEAL_REDUCTION : 0);

  const healCorrection = 1 - totalHealReduction;

  const formationOption = wukongFormationOptions.find((item) => item.key === wukongFormationKey);
  const wukongFormationRate =
    wukongFormationKey === "custom"
      ? toNumber(customFormationPercent) / 100
      : formationOption?.value ?? 0;

  const safeHeal = toNumber(wukongHeal);

  if (safeHeal <= 0) {
    return null;
  }

  if (healCorrection <= 0) {
    return {
      error: "회복 감소율이 100% 이상이라 힐량 기반 역산이 어렵습니다. 선택 조건이 실제로 동시에 적용됐는지 확인해줘.",
      totalHealReduction,
      healCorrection,
    };
  }



  const wukongBattleAtk = safeHeal / (WUKONG_HEAL_RATE * healCorrection);

  const wukongPetPotentialRate = toNumber(wukongPetPotentialAtkPercent) / 100;
  const mistPetPotentialRate = toNumber(mistPetPotentialAtkPercent) / 100;

  const estimatedWukongStatAtk =
    wukongBattleAtk -
    PET_BASE_ATK -
    BASE_ATK_WUKONG * (wukongFormationRate + wukongPetPotentialRate);

  const requiredMistStatAtkRaw =
    wukongBattleAtk -
    PET_BASE_ATK -
    BASE_ATK_MIST * (0.42 + mistPetPotentialRate);

  return {
    wukongBattleAtk,
    estimatedWukongStatAtk: Math.round(estimatedWukongStatAtk),
    requiredMistStatAtk: Math.ceil(requiredMistStatAtkRaw),
  };
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "-";
  return Math.round(value).toLocaleString();
}

function emptyHeroSetting() {
  return {
    set: "",
    weapon1: "",
    weapon2: "",
    armor1: "",
    armor2: "",
    accessoryGrade: "",
    accessoryType: "",
    accessoryReforge: "",
    memo: "",
  };
}

function splitLegacyOptionText(value) {
  return String(value || "")
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeHeroSetting(setting = {}) {
  const legacyWeapons = splitLegacyOptionText(setting.weaponOptions);
  const legacyArmors = splitLegacyOptionText(setting.armorOptions);

  return {
    ...emptyHeroSetting(),
    ...setting,
    weapon1: setting.weapon1 || legacyWeapons[0] || "",
    weapon2: setting.weapon2 || legacyWeapons[1] || "",
    armor1: setting.armor1 || legacyArmors[0] || "",
    armor2: setting.armor2 || legacyArmors[1] || "",
    accessoryGrade: setting.accessoryGrade || "",
    accessoryType: setting.accessoryType || "",
    accessoryReforge: setting.accessoryReforge || "",
    memo: setting.memo || "",
  };
}

function accessorySummary(setting = {}) {
  const normalized = normalizeHeroSetting(setting);
  const grade = normalized.accessoryGrade ? `${normalized.accessoryGrade}성` : "";
  const type = normalized.accessoryType || "";
  const legacy = setting.accessory || "";
  const base = [grade, type].filter(Boolean).join(" ") || legacy || "-";
  const reforge = normalized.accessoryReforge ? ` / 세공: ${normalized.accessoryReforge}` : "";
  return `${base}${reforge}`;
}

function getSetImage(setName) {
  return `/sets/${setName}.png`;
}

function SetIcon({ setName, selected = false }) {
  const [failed, setFailed] = useState(false);
  const initial = setName?.slice(0, 1) || "?";

  return (
    <div className={`set-icon ${selected ? "selected" : ""}`} title={setName}>
      {!failed ? (
        <img src={getSetImage(setName)} alt={setName} onError={() => setFailed(true)} />
      ) : (
        <span className="set-fallback">{initial}</span>
      )}
      <b>{setName}</b>
    </div>
  );
}

function SetPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);

  const pickSet = (setName) => {
    onChange(setName);
    setOpen(false);
  };

  return (
    <div className="set-picker">
      <button type="button" className={`set-picker-button ${value ? "selected" : ""}`} onClick={() => setOpen((prev) => !prev)}>
        {value ? (
          <SetIcon setName={value} selected />
        ) : (
          <span className="set-picker-empty">세트 선택</span>
        )}
      </button>

      {open && (
        <div className="set-picker-panel">
          <button type="button" className="set-option reset" onClick={() => pickSet("")}>
            선택 안함
          </button>
          {equipmentSets.map((setName) => (
            <button
              type="button"
              key={`set-pick-${setName}`}
              className={`set-option ${value === setName ? "selected" : ""}`}
              onClick={() => pickSet(setName)}
            >
              <SetIcon setName={setName} selected={value === setName} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const boardTypes = {
  guildWar: {
    group: "PVP",
    label: "길드전 공격",
    short: "공격",
    description: "상대 방어덱과 공격덱을 작성합니다.",
    mode: "guildWar",
  },
  guildWarDefenseDeck: {
    group: "PVP",
    label: "길드전 방어덱",
    short: "방어",
    description: "길드전 방어덱을 작성합니다.",
    mode: "guildWarDefense",
  },
  totalWar: {
    group: "PVP",
    label: "총력전",
    short: "총력전",
    description: "총력전 공략을 작성합니다.",
    mode: "fiveHero",
  },
  arena: {
    group: "PVP",
    label: "결투장",
    short: "결투장",
    description: "결투장 덱과 운영 공략을 작성합니다.",
    mode: "fiveHero",
  },
  highArena: {
    group: "PVP",
    label: "상급결투장",
    short: "상결",
    description: "상급 결투장 덱과 운영 공략을 작성합니다.",
    mode: "fiveHero",
  },

  destroyer: {
    group: "PVE",
    label: "파괴신",
    short: "파괴신",
    description: "파괴신 공략을 작성합니다.",
    mode: "fiveHero",
  },
  adventTaeo: {
    group: "PVE",
    label: "강림 태오",
    short: "태오",
    description: "강림 태오 공략을 작성합니다.",
    mode: "fiveHero",
  },
  adventKyle: {
    group: "PVE",
    label: "강림 카일",
    short: "카일",
    description: "강림 카일 공략을 작성합니다.",
    mode: "fiveHero",
  },
  adventYeonhee: {
    group: "PVE",
    label: "강림 연희",
    short: "연희",
    description: "강림 연희 공략을 작성합니다.",
    mode: "fiveHero",
  },
  adventKarma: {
    group: "PVE",
    label: "강림 카르마",
    short: "카르마",
    description: "강림 카르마 공략을 작성합니다.",
    mode: "fiveHero",
  },

  siegeMon: {
    group: "PVE",
    label: "공성전 월요일",
    short: "공성 월",
    description: "월요일 공성전 공략을 작성합니다.",
    mode: "fiveHero",
  },
  siegeTue: {
    group: "PVE",
    label: "공성전 화요일",
    short: "공성 화",
    description: "화요일 공성전 공략을 작성합니다.",
    mode: "fiveHero",
  },
  siegeWed: {
    group: "PVE",
    label: "공성전 수요일",
    short: "공성 수",
    description: "수요일 공성전 공략을 작성합니다.",
    mode: "fiveHero",
  },
  siegeThu: {
    group: "PVE",
    label: "공성전 목요일",
    short: "공성 목",
    description: "목요일 공성전 공략을 작성합니다.",
    mode: "fiveHero",
  },
  siegeFri: {
    group: "PVE",
    label: "공성전 금요일",
    short: "공성 금",
    description: "금요일 공성전 공략을 작성합니다.",
    mode: "fiveHero",
  },
  siegeSat: {
    group: "PVE",
    label: "공성전 토요일",
    short: "공성 토",
    description: "토요일 공성전 공략을 작성합니다.",
    mode: "fiveHero",
  },
  siegeSun: {
    group: "PVE",
    label: "공성전 일요일",
    short: "공성 일",
    description: "일요일 공성전 공략을 작성합니다.",
    mode: "fiveHero",
  },

  raidKallistra: {
    group: "PVE",
    label: "레이드 칼리스트라",
    short: "칼리",
    description: "칼리스트라 레이드 공략을 작성합니다.",
    mode: "fiveHero",
  },
  raidAstraea: {
    group: "PVE",
    label: "레이드 아스트레아",
    short: "아스트",
    description: "아스트레아 레이드 공략을 작성합니다.",
    mode: "fiveHero",
  },
  raidLeonid: {
    group: "PVE",
    label: "레이드 레오니드",
    short: "레오니드",
    description: "레오니드 레이드 공략을 작성합니다.",
    mode: "fiveHero",
  },
  raidEyeOfRuin: {
    group: "PVE",
    label: "레이드 파멸의 눈동자",
    short: "파눈",
    description: "파멸의 눈동자 레이드 공략을 작성합니다.",
    mode: "fiveHero",
  },
  raidUmaKing: {
    group: "PVE",
    label: "레이드 우마왕",
    short: "우마왕",
    description: "우마왕 레이드 공략을 작성합니다.",
    mode: "fiveHero",
  },
  raidSteelPredator: {
    group: "PVE",
    label: "레이드 강철의 포식자",
    short: "강철",
    description: "강철의 포식자 레이드 공략을 작성합니다.",
    mode: "fiveHero",
  },

  adventure: {
    group: "PVE",
    label: "모험",
    short: "모험",
    description: "모험 공략을 작성합니다.",
    mode: "fiveHero",
  },
  tower: {
    group: "PVE",
    label: "무한의 탑",
    short: "무탑",
    description: "무한의 탑 공략을 작성합니다.",
    mode: "fiveHero",
  },

  fiveHero: {
    group: "PVE",
    label: "기타 5인 콘텐츠",
    short: "5인 기타",
    description: "분류되지 않은 5인 콘텐츠 공략을 작성합니다.",
    mode: "fiveHero",
  },
  feedback: {
    group: "기타",
    label: "건의/불편사항",
    short: "건의",
    description: "사이트 사용 중 불편한 점, 추가 요청, 오류 제보를 남기는 게시판입니다.",
    mode: "free",
  },
  free: {
    group: "기타",
    label: "자유 공략",
    short: "자유글",
    description: "형식 없이 메모, 팁, 질문성 공략을 남깁니다.",
    mode: "free",
  },
};

const boardGroups = ["PVP", "PVE", "기타"];

function getBoardType(type) {
  return boardTypes[type] || boardTypes.free;
}

function isGuildWarType(type) {
  return getBoardType(type).mode === "guildWar";
}

function isGuildWarDefenseType(type) {
  return getBoardType(type).mode === "guildWarDefense";
}

function isFiveHeroLikeType(type) {
  return getBoardType(type).mode === "fiveHero";
}

function isFreeType(type) {
  return getBoardType(type).mode === "free";
}

function isFeedbackType(type) {
  return type === "feedback";
}

function getBoardEntriesByGroup(group) {
  return Object.entries(boardTypes).filter(([, value]) => value.group === group);
}

function getFirstBoardKeyByGroup(group) {
  return getBoardEntriesByGroup(group)[0]?.[0] || "free";
}

function getFavoriteHeroOrderKey(type) {
  if (type === "totalWar") return "totalWar";
  if (type === "arena") return "arena";
  if (type === "highArena") return "highArena";

  const boardType = getBoardType(type);

  if (boardType.group === "PVE") return "pveCommon";

  return "pveCommon";
}

const initialForm = {
  type: "guildWar",
  title: "",
  author: "",
  password: "",
  difficulty: "보통",
  speedBattle: "unknown",
  enemyDeck: [],
  enemyPet: "",
  attackDeck: [],
  attackPet: "",
  defenseDeck: [],
  defensePet: "",
  defenseSkillSteps: [],
  formation: "",
  backlineHero: "",
  backlineHeroes: [],
  heroSettings: {},
  contentName: "",
  deck: [],
  pet: "",
  attackSkillSteps: [],
  enemySkillSteps: [],
  skillOrder: "",
  requirement: "",
  caution: "",
  content: "",
  image: "",
  images: [],
};

const initialNoticeForm = {
  title: "",
  content: "",
  images: [],
};

function normalizeSearchText(value) {
  return String(value || "").trim().replace(/\s+/g, "").toLowerCase();
}

function getHeroSearchText(heroName) {
  const aliases = heroAliasMap[heroName] || [];
  return [heroName, ...aliases].map(normalizeSearchText).join(" ");
}

function getHeroImage(heroName) {
  const fileName = heroFileMap[heroName] || heroName;
  return `/heroes/${fileName}.png`;
}

function getPetImage(petName) {
  const fileName = petFileMap[petName] || petName;
  return `/pets/${fileName}.png`;
}

function shortHeroName(name) {
  if (name === "브란즈&브란셀") return "브브";
  if (name === "칼 헤론") return "칼헤론";
  return name;
}

function todayText() {
  return new Date().toISOString().slice(0, 10);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function compressImageFile(file, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.75,
    type = "image/jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(type, quality);

        resolve({
          id: `image-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          size: file.size,
          compressed: true,
          dataUrl,
        });
      };

      img.onerror = reject;
      img.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || "image/jpeg";

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

function safeFileName(fileName = "image.jpg") {
  const extension = fileName.includes(".")
    ? fileName.split(".").pop().toLowerCase()
    : "jpg";

  return `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension || "jpg"}`;
}

async function uploadImageToStorage(image, folder = "posts") {
  const bucketName = "guide-images";
  const safeFolder = folder || "posts";
  const blob = dataUrlToBlob(image.dataUrl);
  const filePath = `${safeFolder}/${todayText()}/${safeFileName(image.name)}`;

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, blob, {
      contentType: blob.type || "image/jpeg",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);

  return {
    id: image.id,
    name: image.name,
    size: image.size,
    compressed: image.compressed,
    path: filePath,
    url: data.publicUrl,
  };
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file, "utf-8");
  });
}

function downloadJsonFile(fileName, data) {
  const jsonText = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonText], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

async function fetchPostsFromSupabase() {
  const { data, error } = await supabase
    .from("posts")
    .select("id, data, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || [])
    .map((row) => row.data)
    .filter(Boolean);
}

function sanitizeSettings(settings) {
  const { adminId, adminPassword, ...safeSettings } = settings || {};
  return safeSettings;
}

async function fetchSettingsFromSupabase() {
  const { data, error } = await supabase
    .from("app_settings")
    .select("id, data, updated_at")
    .eq("id", "main")
    .maybeSingle();

  if (error) throw error;

  return data?.data || null;
}

async function saveSettingsToSupabase(settings) {
  const { error } = await supabase.from("app_settings").upsert({
    id: "main",
    data: sanitizeSettings(settings),
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

async function savePostToSupabase(post) {
  const { error } = await supabase.from("posts").upsert({
    id: post.id,
    data: post,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

async function savePostsToSupabase(posts) {
  const rows = posts.map((post) => ({
    id: post.id,
    data: post,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("posts").upsert(rows);

  if (error) throw error;
}

async function deletePostFromSupabase(postId) {
  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) throw error;
}

async function fetchNoticesFromSupabase() {
  const { data, error } = await supabase
    .from("notices")
    .select("id, title, content, images, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    title: row.title || "",
    content: row.content || "",
    images: Array.isArray(row.images) ? row.images : [],
    createdAt: row.created_at ? row.created_at.slice(0, 10) : todayText(),
    updatedAt: row.updated_at ? row.updated_at.slice(0, 10) : undefined,
  }));
}

async function saveNoticeToSupabase(notice) {
  const now = new Date().toISOString();

  const payload = {
    id: notice.id,
    title: notice.title,
    content: notice.content || "",
    images: notice.images || [],
    updated_at: now,
  };

  const { error } = await supabase.from("notices").upsert(payload);

  if (error) throw error;
}

async function deleteNoticeFromSupabase(noticeId) {
  const { error } = await supabase.from("notices").delete().eq("id", noticeId);

  if (error) throw error;
}

function removePrivatePostData(post) {
  const { password, image, images = [], comments = [], ...rest } = post;
  const imageCount = images?.length || (image ? 1 : 0);

  return {
    ...rest,
    hasImage: imageCount > 0,
    imageCount,
    comments: comments.map((comment) => {
      const { password: commentPassword, ...safeComment } = comment;
      return safeComment;
    }),
  };
}

function HeroIcon({ name, size = "md", showName = true }) {
  const [failed, setFailed] = useState(false);
  const initial = name?.slice(0, 1) || "?";

  return (
    <div className={`hero-icon hero-icon-${size}`} title={name}>
      {!failed ? (
        <img src={getHeroImage(name)} alt={name} onError={() => setFailed(true)} />
      ) : (
        <div className="hero-fallback">{initial}</div>
      )}
      {showName && <span>{shortHeroName(name)}</span>}
    </div>
  );
}

function PetChip({ name }) {
  const [failed, setFailed] = useState(false);
  if (!name) return null;

  return (
    <div className="pet-chip" title={`펫 ${name}`}>
      {!failed ? (
        <img src={getPetImage(name)} alt={name} onError={() => setFailed(true)} />
      ) : (
        <span className="pet-dot">P</span>
      )}
      <span>{name}</span>
    </div>
  );
}

function HeroRow({ heroes = [], size = "sm" }) {
  if (!heroes || heroes.length === 0) {
    return <p className="muted small-text">선택된 영웅 없음</p>;
  }

  return (
    <div className="hero-row">
      {heroes.map((hero) => (
        <HeroIcon key={hero} name={hero} size={size} />
      ))}
    </div>
  );
}

function FormationBoard({ heroes = [], pet, formation = "", backlineHero = "", backlineHeroes = [], steps = [], title = "추천 공격덱" }) {
  if (!heroes || heroes.length === 0) {
    return (
      <section className="detail-card formation-board-card">
        <h3>{title}</h3>
        <p className="muted small-text">선택된 영웅 없음</p>
      </section>
    );
  }

  const normalizedBacklineHeroes = normalizeBacklineHeroes(heroes, backlineHeroes, backlineHero);
  const frontHeroes = heroes.filter((hero) => !normalizedBacklineHeroes.includes(hero));

  return (
    <section className="detail-card formation-board-card">
      <div className="formation-card-head">
        <h3>{title}</h3>
        <div className="formation-tags">
          {formation && <span>{formation}</span>}
          {normalizedBacklineHeroes.length > 0 && (
            <span>후열 {normalizedBacklineHeroes.map(shortHeroName).join(", ")}</span>
          )}
        </div>
      </div>

      <div className="formation-board">
        <div className="formation-row back-row">
          {normalizedBacklineHeroes.length > 0 ? (
            normalizedBacklineHeroes.map((hero) => (
              <div className="formation-position backline-position" key={`${title}-back-${hero}`}>
                <span className="position-label">후열</span>
                <div className="formation-hero-with-skill">
                  <HeroIcon name={hero} size="lg" />
                  <SkillSlotPair hero={hero} steps={steps} />
                </div>
              </div>
            ))
          ) : (
            <div className="formation-empty-position">후열 미선택</div>
          )}
        </div>
        <div className="formation-row front-row">
          {frontHeroes.map((hero) => (

            <div className="formation-position" key={`${title}-${hero}`}>
              <span className="position-label">전열</span>
              <div className="formation-hero-with-skill">
                <HeroIcon name={hero} size="lg" />
                <SkillSlotPair hero={hero} steps={steps} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <PetChip name={pet} />
    </section>
  );
}

function HeroSettingsTable({ heroes = [], settings = {} }) {
  const [activeHero, setActiveHero] = useState(heroes?.[0] || "");

  useEffect(() => {
    if (!heroes || heroes.length === 0) return;
    if (!heroes.includes(activeHero)) {
      setActiveHero(heroes[0]);
    }
  }, [heroes, activeHero]);

  if (!heroes || heroes.length === 0) return null;

  const selectedHero = heroes.includes(activeHero) ? activeHero : heroes[0];
  const selectedSetting = normalizeHeroSetting(settings?.[selectedHero]);

  const renderValue = (value) => value || "-";

  return (
    <section className="detail-card hero-settings-card">
      <h3>영웅별 세팅</h3>

      <div className="settings-table-wrap desktop-settings-table">
        <table className="hero-settings-table equipment-v2-table">
          <thead>
            <tr>
              <th>영웅</th>
              <th>세트</th>
              <th>무기 1</th>
              <th>무기 2</th>
              <th>방어구 1</th>
              <th>방어구 2</th>
              <th>장신구</th>
              <th>메모</th>
            </tr>
          </thead>
          <tbody>
            {heroes.map((hero) => {
              const setting = normalizeHeroSetting(settings?.[hero]);
              return (
                <tr key={`setting-${hero}`}>
                  <td><HeroIcon name={hero} size="xs" /></td>
                  <td>{setting.set || "-"}</td>
                  <td>{setting.weapon1 || "-"}</td>
                  <td>{setting.weapon2 || "-"}</td>
                  <td>{setting.armor1 || "-"}</td>
                  <td>{setting.armor2 || "-"}</td>
                  <td>{accessorySummary(setting)}</td>
                  <td>{setting.memo || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mobile-hero-setting-view">
        <div className="mobile-setting-hero-tabs" role="tablist" aria-label="영웅별 세팅 선택">
          {heroes.map((hero) => (
            <button
              type="button"
              key={`mobile-setting-tab-${hero}`}
              className={selectedHero === hero ? "active" : ""}
              onClick={() => setActiveHero(hero)}
            >
              <HeroIcon name={hero} size="xs" />
            </button>
          ))}
        </div>

        <div className="mobile-setting-card">
          <div className="mobile-setting-card-head">
            <HeroIcon name={selectedHero} size="sm" />
            <div>
              <strong>{shortHeroName(selectedHero)}</strong>
              <span>세팅 상세</span>
            </div>
          </div>

          <div className="mobile-setting-set-row">
            <b>세트</b>
            {selectedSetting.set ? (
              <SetIcon setName={selectedSetting.set} selected />
            ) : (
              <span className="mobile-setting-empty">세트 없음</span>
            )}
          </div>

          <div className="mobile-setting-info-grid">
            <div>
              <b>무기</b>
              <span>{renderValue(selectedSetting.weapon1)} / {renderValue(selectedSetting.weapon2)}</span>
            </div>
            <div>
              <b>방어구</b>
              <span>{renderValue(selectedSetting.armor1)} / {renderValue(selectedSetting.armor2)}</span>
            </div>
            <div>
              <b>장신구</b>
              <span>{accessorySummary(selectedSetting)}</span>
            </div>
            <div>
              <b>메모</b>
              <span>{selectedSetting.memo || "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSettingsEditor({ heroes = [], settings = {}, onChange }) {
  if (!heroes || heroes.length === 0) {
    return <div className="empty-inline">추천 공격덱을 선택하면 영웅별 세팅 입력칸이 표시됨.</div>;
  }

  const updateSetting = (hero, field, value) => {
    onChange({
      ...(settings || {}),
      [hero]: {
        ...normalizeHeroSetting(settings?.[hero]),
        [field]: value,
      },
    });
  };

  const renderOptionSelect = (hero, field, value, options, placeholder) => (
    <select value={value || ""} onChange={(event) => updateSetting(hero, field, event.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={`${hero}-${field}-${option}`} value={option}>{option}</option>)}
    </select>
  );

  return (
    <div className="hero-settings-editor equipment-v3-editor">
      {heroes.map((hero) => {
        const setting = normalizeHeroSetting(settings?.[hero]);
        return (
          <section className="hero-setting-edit-card equipment-v3-card" key={`edit-setting-${hero}`}>
            <div className="hero-setting-topline">
              <div className="hero-setting-title compact-title">
                <HeroIcon name={hero} size="xs" />
                <strong>{shortHeroName(hero)}</strong>
              </div>
              <div className="set-inline-control">
                <span>세트</span>
                <SetPicker value={setting.set || ""} onChange={(value) => updateSetting(hero, "set", value)} />
              </div>
            </div>

            <div className="equipment-v3-field-stack">
              <div className="equipment-pair-row">
                <label className="field-label">
                  무기 1 주옵션
                  {renderOptionSelect(hero, "weapon1", setting.weapon1, weaponMainOptions, "선택 안함")}
                </label>
                <label className="field-label">
                  무기 2 주옵션
                  {renderOptionSelect(hero, "weapon2", setting.weapon2, weaponMainOptions, "선택 안함")}
                </label>
              </div>

              <div className="equipment-pair-row">
                <label className="field-label">
                  방어구 1 주옵션
                  {renderOptionSelect(hero, "armor1", setting.armor1, armorMainOptions, "선택 안함")}
                </label>
                <label className="field-label">
                  방어구 2 주옵션
                  {renderOptionSelect(hero, "armor2", setting.armor2, armorMainOptions, "선택 안함")}
                </label>
              </div>

              <div className="equipment-accessory-row">
                <label className="field-label">
                  장신구 등급
                  {renderOptionSelect(hero, "accessoryGrade", setting.accessoryGrade, accessoryGradeOptions, "선택 안함")}
                </label>
                <label className="field-label">
                  장신구 종류
                  {renderOptionSelect(hero, "accessoryType", setting.accessoryType, accessoryTypeOptions, "선택 안함")}
                </label>
                <label className="field-label reforge-field">
                  세공
                  <input value={setting.accessoryReforge || ""} placeholder="없으면 비워두기" onChange={(event) => updateSetting(hero, "accessoryReforge", event.target.value)} />
                </label>
              </div>

              <label className="field-label memo-field">
                영웅별 특이사항
                <input value={setting.memo || ""} placeholder="예: 후열 추천, 효저 필요" onChange={(event) => updateSetting(hero, "memo", event.target.value)} />
              </label>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SkillSlotPair({ hero, steps = [], interactive = false, onPick }) {
  const stepsWithOrder = (steps || []).map((step, index) => ({ ...step, order: index + 1 }));
  const heroSteps = stepsWithOrder.filter((step) => step.hero === hero);
  const topOrders = heroSteps.filter((step) => step.skill === "2스").map((step) => step.order);
  const bottomOrders = heroSteps.filter((step) => step.skill === "1스").map((step) => step.order);

  const renderSlot = (orders, skill, position) => {
    const content = orders.length > 0 ? orders : [];

    if (interactive) {
      return (
        <button
          type="button"
          className={`plain-skill-slot ${content.length ? "filled" : "empty"}`}
          title={`${hero} ${skill}`}
          aria-label={`${hero} ${skill} 추가`}
          onClick={() => onPick?.(hero, skill)}
        >
          {content.length > 0 ? content.map((order) => <b key={`${hero}-${skill}-${order}`}>{order}</b>) : <span />}
        </button>
      );
    }

    return (
      <div
        className={`plain-skill-slot ${content.length ? "filled" : "empty"}`}
        title={`${hero} ${skill}`}
        aria-label={`${hero} ${skill}`}
      >
        {content.length > 0 ? content.map((order) => <b key={`${hero}-${skill}-${order}`}>{order}</b>) : <span />}
      </div>
    );
  };

  return (
    <div className="plain-skill-pair">
      {renderSlot(topOrders, "2스", "top")}
      {renderSlot(bottomOrders, "1스", "bottom")}
    </div>
  );
}

function DeckSkillDisplay({ title, heroes = [], pet, steps = [], size = "lg" }) {
  return (
    <section className="detail-card deck-skill-card">
      <h3>{title}</h3>
      {heroes && heroes.length > 0 ? (
        <div className="deck-skill-list">
          {heroes.map((hero) => (
            <div className="deck-skill-unit" key={`${title}-${hero}`}>
              <HeroIcon name={hero} size={size} />
              <SkillSlotPair hero={hero} steps={steps} />
            </div>
          ))}
        </div>
      ) : (
        <p className="muted small-text">선택된 영웅 없음</p>
      )}
      <PetChip name={pet} />
    </section>
  );
}

function SkillOrderBuilder({ title, heroes = [], steps = [], onChange }) {
  const addStep = (hero, skill) => {
    if (!hero) return;
    onChange([...(steps || []), { hero, skill }]);
  };

  const removeLast = () => onChange((steps || []).slice(0, -1));
  const clearSteps = () => onChange([]);

  return (
    <div className="skill-builder compact-skill-builder">
      <div className="skill-builder-head">
        <div>
          <h4>{title}</h4>
          <p className="muted small-text">위칸은 2스, 아래칸은 1스. 누르는 순서대로 번호가 들어감.</p>
        </div>
        <div className="skill-builder-actions">
          <button type="button" className="ghost-button tiny-button" onClick={removeLast} disabled={!steps?.length}>되돌리기</button>
          <button type="button" className="ghost-button tiny-button" onClick={clearSteps} disabled={!steps?.length}>초기화</button>
        </div>
      </div>

      {heroes.length === 0 ? (
        <div className="empty-inline">먼저 영웅을 선택해줘.</div>
      ) : (
        <div className="skill-input-list">
          {heroes.map((hero) => (
            <div className="skill-input-unit" key={`${title}-${hero}`}>
              <HeroIcon name={hero} size="sm" />
              <SkillSlotPair hero={hero} steps={steps} interactive onPick={addStep} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({ post, onClick }) {
  const typeInfo = getBoardType(post.type);
  return (
    <button type="button" className="post-card" onClick={onClick}>
      <div className="post-card-head">
        <div>
          <p className="eyebrow">{typeInfo.label}</p>
          <h3>{post.title}</h3>
        </div>
        <span className="tag">{typeInfo.short}</span>
      </div>

      {isGuildWarType(post.type) && (
        <div className="post-status-row">
          <span>{speedBattleLabels[post.speedBattle || "unknown"]}</span>
          <span>{post.difficulty || "평가 없음"}</span>
        </div>
      )}

      {isGuildWarType(post.type) && (
        <div className="mini-matchup">
          <div>
            <span className="mini-label">상대 방덱</span>
            <HeroRow heroes={post.enemyDeck} size="xs" />
            <PetChip name={post.enemyPet} />
          </div>
          <div>
            <span className="mini-label">추천 공격덱</span>
            <HeroRow heroes={post.attackDeck} size="xs" />
            <PetChip name={post.attackPet} />
          </div>
        </div>
      )}

{isGuildWarDefenseType(post.type) && (
        <div className="mini-matchup single">
          <div>
            <span className="mini-label">방어덱 배치</span>
            <HeroRow heroes={post.defenseDeck} size="xs" />
            <PetChip name={post.defensePet} />
          </div>
        </div>
      )}

      {isFiveHeroLikeType(post.type) && (
        <div className="mini-matchup single">
          <div>
            <span className="mini-label">{post.contentName || "5인 콘텐츠"}</span>
            <HeroRow heroes={post.deck} size="xs" />
            <PetChip name={post.pet} />
          </div>
        </div>
      )}

      <p className="post-preview">{post.caution || post.content || "내용 없음"}</p>
      <div className="post-meta">
        <span>{post.author || "익명"}</span>
        <span>{post.createdAt}</span>
      </div>
    </button>
  );
}


function mergeHeroOrder(favorites = [], heroes = allHeroes) {
  const favoriteSet = new Set(favorites);
  return [
    ...favorites.filter((hero) => heroes.includes(hero)),
    ...heroes.filter((hero) => !favoriteSet.has(hero)),
  ];
}

function moveArrayItem(array, index, direction) {
  const next = [...array];
  const target = index + direction;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function normalizeBacklineHeroes(heroes = [], backlineHeroes = [], backlineHero = "") {
  const list = Array.isArray(backlineHeroes) && backlineHeroes.length > 0
    ? backlineHeroes
    : backlineHero
      ? [backlineHero]
      : [];

  return list.filter((hero) => heroes.includes(hero));
}

function toggleBacklineHero(current = [], hero, formation = "") {
  const safeCurrent = Array.isArray(current) ? current : [];

  if (formation === "보호 진형") {
    return safeCurrent.includes(hero) ? [] : [hero];
  }

  if (safeCurrent.includes(hero)) {
    return safeCurrent.filter((item) => item !== hero);
  }

  return [...safeCurrent, hero];
}

function PostDetail({ post, onClose, onEdit, onDelete, onAddComment, onDeleteComment, accessMode, onOpenImage }) {
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentPassword, setCommentPassword] = useState("");
  const [commentContent, setCommentContent] = useState("");
  if (!post) return null;
  const typeInfo = getBoardType(post.type);
  const submitComment = (event) => {
    event.preventDefault();

    if (!commentAuthor.trim()) {
      alert("댓글 닉네임을 입력해줘.");
      return;
    }

    if (!commentPassword.trim()) {
      alert("댓글 삭제용 비밀번호를 입력해줘.");
      return;
    }

    if (!commentContent.trim()) {
      alert("댓글 내용을 입력해줘.");
      return;
    }

    onAddComment(post.id, {
      author: commentAuthor,
      password: commentPassword,
      content: commentContent,
    });

    setCommentAuthor("");
    setCommentPassword("");
    setCommentContent("");
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <article className="post-detail" onClick={(event) => event.stopPropagation()}>
        <div className="detail-top">
          <div>
            <p className="eyebrow">{typeInfo.label}</p>
            <h2>{post.title}</h2>
            <p className="muted">{post.author || "익명"} · {post.createdAt}</p>
          </div>
          <div className="detail-actions">
            <button type="button" className="ghost-button" onClick={() => onEdit(post)}>수정</button>
            <button type="button" className="delete-button" onClick={() => onDelete(post)}>삭제</button>
            <button type="button" className="ghost-button" onClick={onClose}>닫기</button>
          </div>
        </div>

        {isGuildWarType(post.type) && (
          <div className="guild-war-board-detail">
            <div className="matchup-board-row">
              <DeckSkillDisplay
                title="상대 방어덱"
                heroes={post.enemyDeck || []}
                pet={post.enemyPet}
                steps={post.enemySkillSteps || []}
              />
              <section className="detail-card central-strategy-card">
                <h3>전략 메모</h3>
                <div className="strategy-chip-row">
                  <span>{speedBattleLabels[post.speedBattle || "unknown"]}</span>
                  <span>{post.difficulty || "평가 없음"}</span>
                </div>

                <div className="strategy-note-block">
                  <strong>주의사항</strong>
                  <p>{post.caution || "주의사항 미기록"}</p>
                </div>

                {post.requirement && (
                  <div className="strategy-note-block">
                    <strong>필수 조건/세팅</strong>
                    <p>{post.requirement}</p>
                  </div>
                )}

                {post.skillOrder && (
                  <div className="strategy-note-block">
                    <strong>스킬 순서 추가 메모</strong>
                    <p>{post.skillOrder}</p>
                  </div>
                )}
              </section>
              <FormationBoard
                title="추천 공격덱"
                heroes={post.attackDeck || []}
                pet={post.attackPet}
                formation={post.formation}
                backlineHero={post.backlineHero}
                backlineHeroes={post.backlineHeroes || []}
                steps={post.attackSkillSteps || []}
              />
            </div>
            <HeroSettingsTable heroes={post.attackDeck || []} settings={post.heroSettings || {}} />
          </div>
        )}

{isGuildWarDefenseType(post.type) && (
          <div className="guild-war-board-detail">
            <div className="matchup-board-row">
              <FormationBoard
                title="방어덱 배치"
                heroes={post.defenseDeck || []}
                pet={post.defensePet}
                formation={post.formation}
                backlineHero={post.backlineHero}
                backlineHeroes={post.backlineHeroes || []}
                steps={post.defenseSkillSteps || []}
              />
              <section className="detail-card central-strategy-card">
                <h3>방어덱 운영 메모</h3>
                <div className="strategy-chip-row">
                  {post.formation && <span>{post.formation}</span>}
                  {post.difficulty && <span>{post.difficulty}</span>}
                </div>

                {post.requirement && (
                  <div className="strategy-note-block">
                    <strong>방어 의도 / 노리는 덱</strong>
                    <p>{post.requirement}</p>
                  </div>
                )}

                <div className="strategy-note-block">
                  <strong>주의사항</strong>
                  <p>{post.caution || "주의사항 미기록"}</p>
                </div>

                {post.skillOrder && (
                  <div className="strategy-note-block">
                    <strong>스킬 순서 추가 메모</strong>
                    <p>{post.skillOrder}</p>
                  </div>
                )}
              </section>
            </div>
            <HeroSettingsTable heroes={post.defenseDeck || []} settings={post.heroSettings || {}} />
          </div>
        )}

        {isFiveHeroLikeType(post.type) && (
          <div className="detail-grid five-detail">
            <section className="detail-card">
              <h3>{post.contentName || "5인 콘텐츠"}</h3>
              <HeroRow heroes={post.deck} size="lg" />
              <PetChip name={post.pet} />
            </section>
            <section className="detail-card">
              <h3>진형 / 조건</h3>
              <p>{post.formation || "진형 미기록"}</p>
              <p>{post.requirement || "조건 미기록"}</p>
            </section>
            <section className="detail-card">
              <h3>스킬 순서</h3>
              <p>{post.skillOrder || "미기록"}</p>
            </section>
            <section className="detail-card">
              <h3>주의사항</h3>
              <p>{post.caution || "미기록"}</p>
            </section>
          </div>
        )}

        {(post.images?.length > 0 || post.image) && (
          <div className="detail-image-gallery">
            {(post.images?.length
              ? post.images
              : [{ id: "legacy-detail-image", dataUrl: post.image }]
            ).map((image, index) => {
              const imageSrc = image.url || image.dataUrl || image;

              return (
                <button
                  type="button"
                  key={image.id || `detail-image-${index}`}
                  className="detail-image-button"
                  onClick={() => onOpenImage(imageSrc)}
                >
                  <img
                    className="detail-image"
                    src={imageSrc}
                    alt={`첨부 이미지 ${index + 1}`}
                  />
                </button>
              );
            })}
          </div>
        )}
        <section className="detail-card content-card">
          <h3>본문</h3>
          <p>{post.content || "본문 없음"}</p>
        </section>
        <section className="detail-card comment-card">
          <div className="comment-head">
            <h3>댓글</h3>
            <span>{(post.comments || []).length}개</span>
          </div>

          <form className="comment-form" onSubmit={submitComment}>
            <div className="comment-input-row">
              <input
                value={commentAuthor}
                placeholder="닉네임"
                onChange={(event) => setCommentAuthor(event.target.value)}
              />
              <input
                type="password"
                value={commentPassword}
                placeholder="삭제용 비밀번호"
                onChange={(event) => setCommentPassword(event.target.value)}
              />
            </div>

            <textarea
              value={commentContent}
              placeholder="공략 보완점, 성공/실패 제보, 세팅 차이 등을 남겨줘."
              onChange={(event) => setCommentContent(event.target.value)}
            />

            <button type="submit" className="primary-button small-primary">
              댓글 등록
            </button>
          </form>

          <div className="comment-list">
            {(post.comments || []).length === 0 ? (
              <div className="empty-inline">아직 댓글이 없음.</div>
            ) : (
              (post.comments || []).map((comment) => (
                <article className="comment-item" key={comment.id}>
                  <div className="comment-item-head">
                    <div>
                      <strong>{comment.author || "익명"}</strong>
                      <span>{comment.createdAt}</span>
                    </div>
                    <button
                      type="button"
                      className="delete-button tiny-button"
                      onClick={() => onDeleteComment(post.id, comment.id)}
                    >
                      삭제
                    </button>
                  </div>
                  <p>{comment.content}</p>
                </article>
              ))
            )}
          </div>

          {accessMode === "admin" && (
            <p className="muted small-text">관리자는 댓글 비밀번호 없이 삭제할 수 있음.</p>
          )}
        </section>
      </article>
    </div>
  );
}


function NoticeDetail({ notice, isRealAdmin, onClose, onEdit, onDelete, onOpenImage }) {
  if (!notice) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <article className="post-detail notice-detail" onClick={(event) => event.stopPropagation()}>
        <div className="detail-top">
          <div>
            <p className="eyebrow">Notice</p>
            <h2>{notice.title}</h2>
            <p className="muted">관리자 · {notice.createdAt}</p>
          </div>

          <div className="detail-actions">
            {isRealAdmin && (
              <>
                <button type="button" className="ghost-button" onClick={() => onEdit(notice)}>수정</button>
                <button type="button" className="delete-button" onClick={() => onDelete(notice)}>삭제</button>
              </>
            )}
            <button type="button" className="ghost-button" onClick={onClose}>닫기</button>
          </div>
        </div>

        {(notice.images || []).length > 0 && (
          <div className="detail-image-gallery">
            {(notice.images || []).map((image, index) => {
              const imageSrc = image.url || image.dataUrl || image;
              return (
                <button
                  type="button"
                  key={image.id || `notice-detail-image-${index}`}
                  className="detail-image-button"
                  onClick={() => onOpenImage(imageSrc)}
                >
                  <img
                    className="detail-image"
                    src={imageSrc}
                    alt={`공지 이미지 ${index + 1}`}
                  />
                </button>
              );
            })}
          </div>
        )}

        <section className="detail-card content-card">
          <h3>공지 내용</h3>
          <p>{notice.content || "내용 없음"}</p>
        </section>
      </article>
    </div>
  );
}

function HeroSelector({ label, selected, max, onChange, favoriteHeroes = [], favoriteLabel = "자주 쓰는 영웅" }) {
  const [keyword, setKeyword] = useState("");
  const normalized = normalizeSearchText(keyword);

  const orderedHeroes = useMemo(() => mergeHeroOrder(favoriteHeroes, allHeroes), [favoriteHeroes]);

  const filteredHeroes = useMemo(() => {
    if (!normalized) return orderedHeroes;
    return orderedHeroes.filter((hero) => getHeroSearchText(hero).includes(normalized));
  }, [normalized, orderedHeroes]);

  const favoriteFiltered = useMemo(() => {
    if (normalized) return [];
    return favoriteHeroes.filter((hero) => allHeroes.includes(hero));
  }, [favoriteHeroes, normalized]);

  const normalFiltered = useMemo(() => {
    if (normalized) return filteredHeroes;
    const favoriteSet = new Set(favoriteFiltered);
    return filteredHeroes.filter((hero) => !favoriteSet.has(hero));
  }, [filteredHeroes, favoriteFiltered, normalized]);

  const toggleHero = (hero) => {
    if (selected.includes(hero)) {
      onChange(selected.filter((item) => item !== hero));
      return;
    }

    if (selected.length >= max) return;
    onChange([...selected, hero]);
  };

  const renderHeroButton = (hero) => (
    <button
      key={hero}
      type="button"
      className={`hero-select-button ${selected.includes(hero) ? "selected" : ""}`}
      onClick={() => toggleHero(hero)}
    >
      <HeroIcon name={hero} size="xs" />
    </button>
  );

  return (
    <div className="selector-box">
      <div className="selector-head">
        <div>
          <h4>{label}</h4>
          <p className="muted small-text">{selected.length}/{max}명 선택</p>
        </div>
        <div className="selected-mini-row">
          {selected.map((hero) => <HeroIcon key={hero} name={hero} size="xs" />)}
        </div>
      </div>
      <input
        value={keyword}
        placeholder="영웅 검색"
        onChange={(event) => setKeyword(event.target.value)}
      />

      {!normalized && favoriteFiltered.length > 0 && (
        <div className="favorite-picker-block">
          <div className="picker-subtitle">{favoriteLabel}</div>
          <div className="hero-select-grid favorite-hero-grid">
            {favoriteFiltered.map(renderHeroButton)}
          </div>
        </div>
      )}

      <div className="favorite-picker-block">
        <div className="picker-subtitle">{normalized ? "검색 결과" : "전체 영웅"}</div>
        <div className="hero-select-grid">
          {normalFiltered.map(renderHeroButton)}
        </div>
      </div>
    </div>
  );
}

function PetSelect({ label, value, onChange }) {
  return (
    <div className="field-label pet-picker-field">
      <span>{label}</span>

      <div className="pet-picker-grid">
        <button
          type="button"
          className={`pet-picker-button empty ${!value ? "selected" : ""}`}
          onClick={() => onChange("")}
        >
          선택 안함
        </button>

        {pets.map((pet) => (
          <button
            type="button"
            key={`pet-pick-${label}-${pet}`}
            className={`pet-picker-button ${value === pet ? "selected" : ""}`}
            onClick={() => onChange(value === pet ? "" : pet)}
          >
            <img src={getPetImage(pet)} alt={pet} />
            <span>{pet}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Nav({ activeTab, setActiveTab, closeMenu, navItems }) {
  return (
    <nav className="nav-list">
      {navItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={activeTab === item.id ? "active" : ""}
          onClick={() => {
            setActiveTab(item.id);
            closeMenu?.();
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}


function AccessScreen({ onMemberLogin, onAdminLogin }) {
  const [guildCodeInput, setGuildCodeInput] = useState("");
  const [adminIdInput, setAdminIdInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");

  return (
    <main className="access-page">
      <section className="access-hero">
        <div className="brand-mark large">S</div>
        <p className="eyebrow">Seven Knights Re:Birth</p>
        <h1>세나 공략 허브</h1>
        <p>세나 공략 모음집</p>
      </section>

      <section className="access-grid">
        <form className="access-card" onSubmit={(event) => { event.preventDefault(); onMemberLogin(guildCodeInput); }}>
          <h2>길드원 입장</h2>
          <p className="muted">카톡방 공지 확인 부탁드립니다.</p>
          <input value={guildCodeInput} placeholder="접속 코드" onChange={(event) => setGuildCodeInput(event.target.value)} />
          <button type="submit" className="primary-button">입장하기</button>
        </form>

        <form className="access-card" onSubmit={(event) => { event.preventDefault(); onAdminLogin(adminIdInput, adminPasswordInput); }}>
          <h2>관리자 로그인</h2>
          <p className="muted">관리자 계정으로 로그인합니다.</p>
          <input
            type="email"
            value={adminIdInput}
            placeholder="관리자 이메일"
            onChange={(event) => setAdminIdInput(event.target.value)}
          />
          <input
            type="password"
            value={adminPasswordInput}
            placeholder="관리자 비밀번호"
            onChange={(event) => setAdminPasswordInput(event.target.value)}
          />
          <button type="submit" className="ghost-button">관리자로 입장</button>
        </form>
      </section>
    </main>
  );
}

function FavoriteHeroManager({ title, description, orderKey, favorites, onChange }) {
  const [keyword, setKeyword] = useState("");
  const normalized = normalizeSearchText(keyword);
  const favoriteSet = new Set(favorites);

  const availableHeroes = useMemo(() => {
    return allHeroes.filter((hero) => {
      if (!normalized) return true;
      return getHeroSearchText(hero).includes(normalized);
    });
  }, [normalized]);

  const toggleFavorite = (hero) => {
    if (favoriteSet.has(hero)) {
      onChange(favorites.filter((item) => item !== hero));
      return;
    }
    onChange([...favorites, hero]);
  };

  const moveFavorite = (index, direction) => {
    onChange(moveArrayItem(favorites, index, direction));
  };

  return (
    <section className="admin-card hero-order-card">
      <div className="admin-card-head">
        <div>
          <h3>{title}</h3>
          <p className="muted small-text">{description}</p>
        </div>
        <span className="count-pill">{favorites.length}명</span>
      </div>

      <div className="favorite-order-list">
        {favorites.length === 0 ? (
          <div className="empty-inline">아직 선택된 영웅 없음.</div>
        ) : (
          favorites.map((hero, index) => (
            <div className="favorite-order-item" key={`${orderKey}-${hero}`}>
              <HeroIcon name={hero} size="xs" />
              <span>{shortHeroName(hero)}</span>
              <div className="order-buttons">
                <button type="button" className="ghost-button tiny-button" onClick={() => moveFavorite(index, -1)} disabled={index === 0}>↑</button>
                <button type="button" className="ghost-button tiny-button" onClick={() => moveFavorite(index, 1)} disabled={index === favorites.length - 1}>↓</button>
                <button type="button" className="delete-button tiny-button" onClick={() => toggleFavorite(hero)}>해제</button>
              </div>
            </div>
          ))
        )}
      </div>

      <input className="admin-hero-search" value={keyword} placeholder="추가할 영웅 검색" onChange={(event) => setKeyword(event.target.value)} />
      <div className="admin-hero-check-grid">
        {availableHeroes.map((hero) => (
          <button
            type="button"
            key={`${orderKey}-pick-${hero}`}
            className={`admin-hero-check ${favoriteSet.has(hero) ? "selected" : ""}`}
            onClick={() => toggleFavorite(hero)}
          >
            <HeroIcon name={hero} size="xs" />
            <span>{favoriteSet.has(hero) ? "선택됨" : "추가"}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function MistCutCalculator() {
  const [wukongHeal, setWukongHeal] = useState("");
  const [yuCondition, setYuCondition] = useState("none");
  const [hasKalheron, setHasKalheron] = useState(false);
  const [hasReginleif, setHasReginleif] = useState(false);
  const [wukongFormationKey, setWukongFormationKey] = useState("attackBack");
  const [customFormationPercent, setCustomFormationPercent] = useState("");
  const [wukongPetPotentialAtkPercent, setWukongPetPotentialAtkPercent] = useState("0");
  const [mistPetPotentialAtkPercent, setMistPetPotentialAtkPercent] = useState("0");

  const result = useMemo(() => {
    return calculateMistKillCut({
      wukongHeal,
      yuCondition,
      hasKalheron,
      hasReginleif,
      wukongFormationKey,
      customFormationPercent,
      wukongPetPotentialAtkPercent,
      mistPetPotentialAtkPercent,
    });
  }, [
    wukongHeal,
    yuCondition,
    hasKalheron,
    hasReginleif,
    wukongFormationKey,
    customFormationPercent,
    wukongPetPotentialAtkPercent,
    mistPetPotentialAtkPercent,
  ]);

  const selectedFormation = wukongFormationOptions.find((item) => item.key === wukongFormationKey);

  return (
    <section className="panel-section mist-cut-panel">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Calculator</p>
          <h2>미스트 즉사컷 계산기</h2>
          <p className="muted">
            상대 오공의 표시 힐량으로 오공 스탯창 공격력과 미스트 필요 스탯창 공격력을 계산합니다.
          </p>
        </div>
      </div>

      <div className="mist-cut-grid">
        <section className="mist-cut-card">
          <h3>상대 오공 정보</h3>

          <label className="field-label">
            오공 표시 힐량
            <input
              type="number"
              value={wukongHeal}
              placeholder="예: 1187"
              onChange={(event) => setWukongHeal(event.target.value)}
            />
          </label>

          <div className="field-label">
            <span>우리 팀 회복 감소 조건</span>

            <div className="heal-icon-section">
              <div className="heal-icon-title">
                <img src={getPetImage("유")} alt="유" />
                <strong>유</strong>
              </div>

              <div className="heal-icon-button-row">
                {yuHealReductionOptions.map((option) => (
                  <button
                    type="button"
                    key={option.key}
                    className={`heal-icon-button ${yuCondition === option.key ? "selected" : ""}`}
                    onClick={() => setYuCondition(option.key)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="heal-toggle-grid">
              <button
                type="button"
                className={`heal-toggle-card ${hasKalheron ? "selected" : ""}`}
                onClick={() => setHasKalheron((prev) => !prev)}
              >
                <HeroIcon name="칼 헤론" size="xs" />
                <span>칼헤론</span>
                <em>회복량 52% 감소</em>
              </button>

              <button
                type="button"
                className={`heal-toggle-card ${hasReginleif ? "selected" : ""}`}
                onClick={() => setHasReginleif((prev) => !prev)}
              >
                <HeroIcon name="레긴레이프" size="xs" />
                <span>레긴레이프</span>
                <em>받는 회복량 44% 감소</em>
              </button>
            </div>
          </div>

          <label className="field-label">
            상대 오공 위치
            <select value={wukongFormationKey} onChange={(event) => setWukongFormationKey(event.target.value)}>
              {wukongFormationOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {wukongFormationKey === "custom" && (
            <label className="field-label">
              직접 입력 진형 보정 %
              <input
                type="number"
                value={customFormationPercent}
                placeholder="예: 10.5"
                onChange={(event) => setCustomFormationPercent(event.target.value)}
              />
            </label>
          )}

          <label className="field-label">
            상대 펫 잠재 모공퍼 %
            <input
              type="number"
              value={wukongPetPotentialAtkPercent}
              placeholder="예: 0, 20, 40, 51"
              onChange={(event) => setWukongPetPotentialAtkPercent(event.target.value)}
            />
          </label>
        </section>

        <section className="mist-cut-card">
          <h3>미스트 정보</h3>

          <label className="field-label">
            미스트 펫 잠재 모공퍼 %
            <input
              type="number"
              value={mistPetPotentialAtkPercent}
              placeholder="예: 0, 20, 40, 51"
              onChange={(event) => setMistPetPotentialAtkPercent(event.target.value)}
            />
          </label>

          <div className="mist-cut-note">
            <strong>계산 기준</strong>
            <p>오공/미스트 기본공격력 1306, 펫 기본공격력 564 기준.</p>
            <p>진형 보정과 펫 잠재 모공퍼는 스탯창 공격력이 아니라 영웅 기본공격력 기준으로 계산.</p>
          </div>
        </section>

        <section className="mist-cut-result">
          <h3>계산 결과</h3>

          {!result ? (
            <div className="mist-result-empty">오공 힐량을 입력하면 결과가 표시됨.</div>
          ) : result.error ? (
            <div className="mist-result-empty">{result.error}</div>
          ) : (
            <>
              <div className="mist-result-main">
                <span>상대 오공 추정 스탯창 공격력</span>
                <strong>{formatNumber(result.estimatedWukongStatAtk)}</strong>
              </div>

              <div className="mist-result-main highlight">
                <span>미스트 필요 스탯창 공격력</span>
                <strong>{formatNumber(result.requiredMistStatAtk)} 이상</strong>
              </div>

              <div className="mist-result-sub">
                <p>총 회복 감소율: {Math.round(result.totalHealReduction * 100)}%</p>
                <p>실제 표시 회복 비율: {Math.round(result.healCorrection * 100)}%</p>
                <p>내부 계산용 오공 전투 공격력: {formatNumber(result.wukongBattleAtk)}</p>
                <p>실전에서는 오차를 고려해 계산값보다 +10 이상 여유 권장.</p>
              </div>
            </>
          )}
        </section>
      </div>
    </section>
  );
}

function App() {
  useEffect(() => {
    const initAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Supabase Auth 세션 확인 오류:", error);
        setAuthLoading(false);
        return;
      }

      setAuthSession(data.session || null);

      if (data.session) {
        setAccessMode("admin");
        sessionStorage.setItem("sena_guide_access_mode", "admin");
      } else {
        if (sessionStorage.getItem("sena_guide_access_mode") === "admin") {
          sessionStorage.removeItem("sena_guide_access_mode");
        }
      }

      setAuthLoading(false);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session || null);

      if (session) {
        setAccessMode("admin");
        sessionStorage.setItem("sena_guide_access_mode", "admin");
      } else if (sessionStorage.getItem("sena_guide_access_mode") === "admin") {
        setAccessMode("");
        sessionStorage.removeItem("sena_guide_access_mode");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const [authSession, setAuthSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [supabaseStatus, setSupabaseStatus] = useState("확인 중");
  useEffect(() => {
    const loadSupabaseData = async () => {
      try {
        const [cloudPosts, cloudSettings, cloudNotices] = await Promise.all([
          fetchPostsFromSupabase(),
          fetchSettingsFromSupabase(),
          fetchNoticesFromSupabase(),
        ]);

        setSupabaseStatus("연결 성공");

        setPosts(cloudPosts);
        setNotices(cloudNotices);

        if (cloudSettings) {
          setSettings({
            ...defaultSettings,
            ...cloudSettings,
            favoriteHeroOrders: {
              ...defaultSettings.favoriteHeroOrders,
              ...(cloudSettings.favoriteHeroOrders || {}),
            },
          });
        }
      } catch (error) {
        console.error("Supabase 불러오기 오류:", error);
        setSupabaseStatus("연결 실패");
      }
    };

    loadSupabaseData();
  }, []);
  const [activeTab, setActiveTab] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBoardGroup, setSelectedBoardGroup] = useState("PVP");
  const [selectedPostGroup, setSelectedPostGroup] = useState("PVP");
  const [accessMode, setAccessMode] = useState(() => {
    const savedMode = sessionStorage.getItem("sena_guide_access_mode");
    return savedMode === "member" ? "member" : "";
  });
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved), favoriteHeroOrders: { ...defaultSettings.favoriteHeroOrders, ...(JSON.parse(saved).favoriteHeroOrders || {}) } } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [viewerImage, setViewerImage] = useState(null);
  const [postFilter, setPostFilter] = useState("all");
  const [postSearch, setPostSearch] = useState("");
  const [heroSearch, setHeroSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingPostId, setEditingPostId] = useState(null);
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [noticeForm, setNoticeForm] = useState(initialNoticeForm);
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [showNoticeForm, setShowNoticeForm] = useState(false);

  const isRealAdmin = accessMode === "admin" && Boolean(authSession);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const navItems = useMemo(() => (isRealAdmin ? [...baseNavItems, adminNavItem] : baseNavItems), [isRealAdmin]);

  const favoriteOrders = settings.favoriteHeroOrders || defaultSettings.favoriteHeroOrders;

  const filteredPosts = useMemo(() => {
    const keyword = normalizeSearchText(postSearch);

    return posts.filter((post) => {
      const postGroup = getBoardType(post.type).group;

      if (postGroup !== selectedPostGroup) return false;
      if (postFilter !== "all" && post.type !== postFilter) return false; if (!keyword) return true;

      const searchPool = [
        post.title,
        post.author,
        post.content,
        post.caution,
        post.skillOrder,
        ...(post.enemyDeck || []),
        ...(post.attackDeck || []),
        ...(post.defenseDeck || []),
        ...(post.deck || []),
        post.enemyPet,
        post.attackPet,
        post.defensePet,
        post.pet,
      ].join(" ");

      return normalizeSearchText(searchPool).includes(keyword);
    });
  }, [posts, postFilter, postSearch, selectedPostGroup]);

  const filteredHeroes = useMemo(() => {
    const keyword = normalizeSearchText(heroSearch);
    if (!keyword) return allHeroes;
    return allHeroes.filter((hero) => getHeroSearchText(hero).includes(keyword));
  }, [heroSearch]);

  const stats = useMemo(() => ({
    total: posts.length,
    pvp: posts.filter((post) => getBoardType(post.type).group === "PVP").length,
    pve: posts.filter((post) => getBoardType(post.type).group === "PVE").length,
    free: posts.filter((post) => getBoardType(post.type).group === "기타").length,
  }), [posts]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const currentImages = form.images || [];
    const legacyImage = form.image
      ? [
        {
          id: "legacy-image",
          name: "기존 이미지",
          url: form.image,
          compressed: false,
        },
      ]
      : [];

    const existingImages = currentImages.length > 0 ? currentImages : legacyImage;

    if (existingImages.length + files.length > 6) {
      alert("이미지는 공략글당 최대 6장까지만 첨부 가능.");
      event.target.value = "";
      return;
    }

    try {
      const compressedImages = await Promise.all(
        files.map((file) =>
          compressImageFile(file, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.75,
            type: "image/jpeg",
          })
        )
      );

      const uploadedImages = await Promise.all(
        compressedImages.map((image) => uploadImageToStorage(image, "posts"))
      );

      const nextImages = [...existingImages, ...uploadedImages];

      updateForm("images", nextImages);
      updateForm("image", nextImages[0]?.url || nextImages[0]?.dataUrl || "");
    } catch (error) {
      console.error(error);
      alert("이미지 업로드 중 오류가 발생함.");
    } finally {
      event.target.value = "";
    }
  };

  const removeFormImage = (imageId) => {
    const currentImages = form.images?.length
      ? form.images
      : form.image
        ? [{ id: "legacy-image", name: "기존 이미지", url: form.image }]
        : [];

    const nextImages = currentImages.filter((image) => image.id !== imageId);

    updateForm("images", nextImages);
    updateForm("image", nextImages[0]?.url || nextImages[0]?.dataUrl || "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("제목을 입력해줘.");
      return;
    }

    if (!isFeedbackType(form.type)) {
      if (!form.author.trim()) {
        alert("닉네임을 입력해줘.");
        return;
      }

      if (!form.password.trim()) {
        alert("나중에 수정/삭제용으로 쓸 비밀번호를 입력해줘.");
        return;
      }
    }

    if (isGuildWarType(form.type)) {
      if (form.enemyDeck.length !== 3) {
        alert("길드전 공격 공략은 상대 방덱 3명을 선택해야 함.");
        return;
      }
      if (form.attackDeck.length > 0 && form.attackDeck.length !== 3) {
        alert("추천 공격덱은 입력하려면 3명을 선택해야 함.");
        return;
      }
    }

    if (isGuildWarDefenseType(form.type) && form.defenseDeck.length !== 3) {
      alert("길드전 방어덱은 방어 영웅 3명을 선택해야 함.");
      return;
    }

    if (isFiveHeroLikeType(form.type) && form.deck.length !== 5) {
      alert("5인 콘텐츠 공략은 사용 덱 5명을 선택해야 함.");
      return;
    }

    const normalizedImages = form.images?.length
      ? form.images
      : form.image
        ? [{ id: "legacy-image", name: "기존 이미지", url: form.image }]
        : [];

    const normalizedPost = {
      ...form,
      images: normalizedImages,
      image: normalizedImages[0]?.url || normalizedImages[0]?.dataUrl || "",
      backlineHero: (form.backlineHeroes || [])[0] || form.backlineHero || "",
      comments: form.comments || [],
      id: editingPostId || `post-${Date.now()}`,
      createdAt: editingPostId ? posts.find((post) => post.id === editingPostId)?.createdAt || todayText() : todayText(),
      updatedAt: editingPostId ? todayText() : undefined,
      author: isFeedbackType(form.type) ? "건의" : form.author.trim(),
      title: form.title.trim(),
      password: isFeedbackType(form.type) ? "" : form.password.trim(),
    };

    try {
      await savePostToSupabase(normalizedPost);
    } catch (error) {
      console.error("Supabase 저장 오류:", error);
      alert("Supabase에 공략을 저장하지 못함.");
      return;
    }

    if (editingPostId) {
      setPosts((prev) => prev.map((post) => (post.id === editingPostId ? normalizedPost : post)));
      setSelectedPost(normalizedPost);
      setEditingPostId(null);
    } else {
      setPosts((prev) => [normalizedPost, ...prev]);
      setSelectedPost(normalizedPost);
    }

    setForm(initialForm);
    setActiveTab("posts");
  };

  const startEditPost = (post) => {
    let password = post.password || "";
    if (!isRealAdmin) {
      password = prompt("글 작성 시 입력한 비밀번호를 입력해줘.");
      if (password === null) return;

      if ((post.password || "") !== password) {
        alert("비밀번호가 맞지 않음.");
        return;
      }
    }

    setForm({
      ...initialForm,
      ...post,
      password,
      images: post.images || (post.image ? [{ id: "legacy-image", name: "기존 이미지", url: post.image }] : []),
      enemyDeck: post.enemyDeck || [],
      attackDeck: post.attackDeck || [],
      defenseDeck: post.defenseDeck || [],
      defensePet: post.defensePet || "",
      deck: post.deck || [],
      attackSkillSteps: post.attackSkillSteps || [],
      enemySkillSteps: post.enemySkillSteps || [],
      defenseSkillSteps: post.defenseSkillSteps || [],
      formation: post.formation || "",
      backlineHero: post.backlineHero || "",
      backlineHeroes: post.backlineHeroes || (post.backlineHero ? [post.backlineHero] : []),
      heroSettings: post.heroSettings || {},
    });
    setEditingPostId(post.id);
    setSelectedPost(null);
    setActiveTab("write");
  };

  const deletePost = async (post) => {
    if (!isRealAdmin) {
      const password = prompt("삭제하려면 글 비밀번호를 입력해줘.");
      if (password === null) return;

      if ((post.password || "") !== password) {
        alert("비밀번호가 맞지 않음.");
        return;
      }
    }

    const confirmed = confirm("이 공략글을 삭제할까?");
    if (!confirmed) return;

    try {
      await deletePostFromSupabase(post.id);
    } catch (error) {
      console.error("Supabase 삭제 오류:", error);
      alert("Supabase에서 공략을 삭제하지 못함.");
      return;
    }

    setPosts((prev) => prev.filter((item) => item.id !== post.id));
    setSelectedPost(null);

    if (editingPostId === post.id) {
      setEditingPostId(null);
      setForm(initialForm);
    }
  };

  const addCommentToPost = async (postId, comment) => {
    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      author: comment.author.trim(),
      password: comment.password.trim(),
      content: comment.content.trim(),
      createdAt: todayText(),
    };

    const updatedPost = {
      ...targetPost,
      comments: [...(targetPost.comments || []), newComment],
    };

    try {
      await savePostToSupabase(updatedPost);
    } catch (error) {
      console.error("Supabase 댓글 저장 오류:", error);
      alert("Supabase에 댓글을 저장하지 못함.");
      return;
    }

    setPosts((prev) => prev.map((post) => (post.id === postId ? updatedPost : post)));

    setSelectedPost((prev) => {
      if (!prev || prev.id !== postId) return prev;
      return updatedPost;
    });
  };

  const deleteCommentFromPost = async (postId, commentId) => {
    const targetPost = posts.find((post) => post.id === postId);
    const targetComment = targetPost?.comments?.find((comment) => comment.id === commentId);

    if (!targetComment) return;

    if (!isRealAdmin) {
      const password = prompt("댓글 삭제 비밀번호를 입력해줘.");
      if (password === null) return;

      if ((targetComment.password || "") !== password) {
        alert("비밀번호가 맞지 않음.");
        return;
      }
    }

    const confirmed = confirm("이 댓글을 삭제할까?");
    if (!confirmed) return;

    const updatedPost = {
      ...targetPost,
      comments: (targetPost.comments || []).filter((comment) => comment.id !== commentId),
    };

    try {
      await savePostToSupabase(updatedPost);
    } catch (error) {
      console.error("Supabase 댓글 삭제 오류:", error);
      alert("Supabase에서 댓글을 삭제하지 못함.");
      return;
    }

    setPosts((prev) => prev.map((post) => (post.id === postId ? updatedPost : post)));

    setSelectedPost((prev) => {
      if (!prev || prev.id !== postId) return prev;
      return updatedPost;
    });
  };

  const cancelEditPost = () => {
    const confirmed = confirm("수정을 취소할까?");
    if (!confirmed) return;
    setEditingPostId(null);
    setForm(initialForm);
  };

  const handleMemberLogin = (code) => {
    if (String(code || "").trim() !== settings.guildCode) {
      alert("접속 코드가 맞지 않음.");
      return;
    }
    setAccessMode("member");
    sessionStorage.setItem("sena_guide_access_mode", "member");
  };

  const handleAdminLogin = async (email, password) => {
    const safeEmail = String(email || "").trim();
    const safePassword = String(password || "");

    if (!safeEmail || !safePassword) {
      alert("관리자 이메일과 비밀번호를 입력해줘.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: safeEmail,
      password: safePassword,
    });

    if (error || !data.session) {
      console.error("관리자 로그인 오류:", error);
      alert("관리자 계정이 맞지 않음.");
      return;
    }

    setAuthSession(data.session);
    setAccessMode("admin");
    sessionStorage.setItem("sena_guide_access_mode", "admin");
  };

  const logout = async () => {
    if (authSession) {
      await supabase.auth.signOut({ scope: "local" });
    }

    sessionStorage.removeItem("sena_guide_access_mode");
    setAuthSession(null);
    setAccessMode("");
    setActiveTab("home");
  };


  const updateFavoriteOrder = async (orderKey, value) => {
    const nextSettings = {
      ...settings,
      favoriteHeroOrders: {
        ...(settings.favoriteHeroOrders || {}),
        [orderKey]: value,
      },
    };

    setSettings(nextSettings);

    try {
      await saveSettingsToSupabase(nextSettings);
    } catch (error) {
      console.error("Supabase 설정 저장 오류:", error);
      alert("Supabase에 영웅 순서 설정을 저장하지 못함.");
    }
  };

  const updateSettingsField = async (field, value) => {
    const nextSettings = {
      ...settings,
      [field]: value,
    };

    setSettings(nextSettings);

    try {
      await saveSettingsToSupabase(nextSettings);
    } catch (error) {
      console.error("Supabase 설정 저장 오류:", error);
      alert("Supabase에 설정을 저장하지 못함.");
    }
  };


  const downloadFullBackup = () => {
    const backup = {
      version: "sena-guide-v1",
      type: "full",
      exportedAt: new Date().toISOString(),
      settings,
      posts,
      notices,
    };

    downloadJsonFile(`sena-guide-full-backup-${todayText()}.json`, backup);
  };

  const downloadAnalysisBackup = () => {
    const backup = {
      version: "sena-guide-v1",
      type: "analysis",
      exportedAt: new Date().toISOString(),
      posts: posts.map(removePrivatePostData),
    };

    downloadJsonFile(`sena-guide-analysis-backup-${todayText()}.json`, backup);
  };

  const handleBackupImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await readFileAsText(file);
      const backup = JSON.parse(text);

      if (!backup || !Array.isArray(backup.posts)) {
        alert("백업 파일 형식이 맞지 않음. posts 배열이 필요함.");
        event.target.value = "";
        return;
      }

      const confirmed = confirm(
        "백업을 불러오면 현재 브라우저에 저장된 공략/댓글/설정이 백업 파일 기준으로 바뀜. 계속할까?"
      );

      if (!confirmed) {
        event.target.value = "";
        return;
      }

      const importedPosts = backup.posts;

      const importedSettings = backup.settings
        ? sanitizeSettings({
          ...defaultSettings,
          ...backup.settings,
          favoriteHeroOrders: {
            ...defaultSettings.favoriteHeroOrders,
            ...(backup.settings.favoriteHeroOrders || {}),
          },
        })
        : settings;

      try {
        await savePostsToSupabase(importedPosts);

        if (backup.settings) {
          await saveSettingsToSupabase(importedSettings);
        }
      } catch (error) {
        console.error("Supabase 백업 업로드 오류:", error);
        alert("백업은 읽었지만 Supabase 업로드에 실패함.");
        event.target.value = "";
        return;
      }

      setPosts(importedPosts);

      if (backup.settings) {
        setSettings(importedSettings);
      }

      setSelectedPost(null);
      setEditingPostId(null);
      setForm(initialForm);

      alert("백업 불러오기 완료. Supabase에도 업로드됨.");


    } catch (error) {
      console.error(error);
      alert("백업 파일을 읽는 중 오류가 발생함.");
    } finally {
      event.target.value = "";
    }
  };


  const updateNoticeForm = (field, value) => {
    setNoticeForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetNoticeEditor = () => {
    setNoticeForm(initialNoticeForm);
    setEditingNoticeId(null);
    setShowNoticeForm(false);
  };

  const handleNoticeImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const existingImages = noticeForm.images || [];

    if (existingImages.length + files.length > 6) {
      alert("공지 이미지는 최대 6장까지만 첨부 가능.");
      event.target.value = "";
      return;
    }

    try {
      const compressedImages = await Promise.all(
        files.map((file) =>
          compressImageFile(file, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.75,
            type: "image/jpeg",
          })
        )
      );

      const uploadedImages = await Promise.all(
        compressedImages.map((image) => uploadImageToStorage(image, "notices"))
      );

      updateNoticeForm("images", [...existingImages, ...uploadedImages]);
    } catch (error) {
      console.error("공지 이미지 업로드 오류:", error);
      alert("공지 이미지를 업로드하지 못함.");
    } finally {
      event.target.value = "";
    }
  };

  const removeNoticeImage = (imageId) => {
    const nextImages = (noticeForm.images || []).filter((image) => image.id !== imageId);
    updateNoticeForm("images", nextImages);
  };

  const handleNoticeSubmit = async (event) => {
    event.preventDefault();

    if (!isRealAdmin) {
      alert("공지 작성은 관리자만 가능함.");
      return;
    }

    if (!noticeForm.title.trim()) {
      alert("공지 제목을 입력해줘.");
      return;
    }

    const existingNotice = editingNoticeId
      ? notices.find((notice) => notice.id === editingNoticeId)
      : null;

    const normalizedNotice = {
      id: editingNoticeId || `notice-${Date.now()}`,
      title: noticeForm.title.trim(),
      content: noticeForm.content.trim(),
      images: noticeForm.images || [],
      createdAt: existingNotice?.createdAt || todayText(),
      updatedAt: editingNoticeId ? todayText() : undefined,
    };

    try {
      await saveNoticeToSupabase(normalizedNotice);
    } catch (error) {
      console.error("공지 저장 오류:", error);
      alert("Supabase에 공지를 저장하지 못함.");
      return;
    }

    if (editingNoticeId) {
      setNotices((prev) => prev.map((notice) => (notice.id === editingNoticeId ? normalizedNotice : notice)));
      setSelectedNotice(normalizedNotice);
    } else {
      setNotices((prev) => [normalizedNotice, ...prev]);
      setSelectedNotice(normalizedNotice);
    }

    resetNoticeEditor();
  };

  const startEditNotice = (notice) => {
    if (!isRealAdmin) return;

    setNoticeForm({
      title: notice.title || "",
      content: notice.content || "",
      images: notice.images || [],
    });
    setEditingNoticeId(notice.id);
    setShowNoticeForm(true);
    setSelectedNotice(null);
    setActiveTab("notices");
  };

  const deleteNotice = async (notice) => {
    if (!isRealAdmin) return;

    const confirmed = confirm("이 공지사항을 삭제할까?");
    if (!confirmed) return;

    try {
      await deleteNoticeFromSupabase(notice.id);
    } catch (error) {
      console.error("공지 삭제 오류:", error);
      alert("Supabase에서 공지를 삭제하지 못함.");
      return;
    }

    setNotices((prev) => prev.filter((item) => item.id !== notice.id));
    setSelectedNotice(null);

    if (editingNoticeId === notice.id) {
      resetNoticeEditor();
    }
  };

  const renderHome = () => (
    <>
      <section className="hero-section">
        <p className="eyebrow">Seven Knights Re:Birth</p>
        <h1>세나 공략 공유집</h1>
        <p>
          바다 화이팅!!
        </p>
        <div className="hero-actions">
          <button type="button" className="primary-button" onClick={() => setActiveTab("write")}>공략 작성하기</button>
          <button type="button" className="ghost-button" onClick={() => setActiveTab("posts")}>공략 보러가기</button>
        </div>
      </section>

      <section className="stats-grid">
        <div><span>{stats.pvp}</span><p>PVP 공략</p></div>
        <div><span>{stats.pve}</span><p>PVE 공략</p></div>
        <div><span>{stats.free}</span><p>자유 공략</p></div>
      </section>

      <section className="panel-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Recent</p>
            <h2>최근 공략</h2>
          </div>
          <button type="button" className="ghost-button" onClick={() => setActiveTab("posts")}>전체 보기</button>
        </div>
        <div className="post-grid compact-grid">
          {posts.slice(0, 4).map((post) => <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />)}
        </div>
      </section>
    </>
  );


  const renderNotices = () => (
    <section className="panel-section">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Notice</p>
          <h2>공지사항</h2>
          <p className="muted">한번씩 읽어 주세요.</p>
        </div>

        {isRealAdmin && (
          <button
            type="button"
            className="primary-button small-primary"
            onClick={() => {
              setShowNoticeForm((prev) => !prev);
              if (!showNoticeForm) {
                setNoticeForm(initialNoticeForm);
                setEditingNoticeId(null);
              }
            }}
          >
            {showNoticeForm ? "작성 닫기" : "공지 작성"}
          </button>
        )}
      </div>

      {isRealAdmin && showNoticeForm && (
        <form className="form-card write-form" onSubmit={handleNoticeSubmit}>
          <h3>{editingNoticeId ? "공지 수정" : "공지 작성"}</h3>

          <label className="field-label">
            제목
            <input
              value={noticeForm.title}
              placeholder="예: 길드전 공략 작성 규칙"
              onChange={(event) => updateNoticeForm("title", event.target.value)}
            />
          </label>

          <label className="field-label">
            내용
            <textarea
              value={noticeForm.content}
              placeholder="공지 내용을 입력해줘."
              onChange={(event) => updateNoticeForm("content", event.target.value)}
            />
          </label>

          <div className="field-label">
            <span>이미지 첨부</span>
            <p className="muted small-text">공지 이미지는 최대 6장까지 가능. 업로드 시 자동으로 압축됨.</p>
            <input type="file" accept="image/*" multiple onChange={handleNoticeImageUpload} />
          </div>

          {(noticeForm.images || []).length > 0 && (
            <div className="image-preview-grid">
              {(noticeForm.images || []).map((image, index) => (
                <div className="image-preview-item" key={image.id || `notice-preview-${index}`}>
                  <img src={image.url || image.dataUrl || image} alt={`공지 미리보기 ${index + 1}`} />
                  <div className="image-preview-meta">
                    <span>{image.name || `이미지 ${index + 1}`}</span>
                    <button
                      type="button"
                      className="delete-button tiny-button"
                      onClick={() => removeNoticeImage(image.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="backup-button-row">
            <button type="submit" className="primary-button">
              {editingNoticeId ? "공지 수정 저장" : "공지 등록"}
            </button>
            <button type="button" className="ghost-button" onClick={resetNoticeEditor}>
              취소
            </button>
          </div>
        </form>
      )}

      <div className="post-grid">
        {notices.length === 0 ? (
          <div className="empty-box">등록된 공지사항이 없음.</div>
        ) : (
          notices.map((notice) => (
            <button
              type="button"
              key={notice.id}
              className="post-card"
              onClick={() => setSelectedNotice(notice)}
            >
              <div className="post-card-head">
                <div>
                  <p className="eyebrow">공지사항</p>
                  <h3>{notice.title}</h3>
                </div>
                <span className="tag">공지</span>
              </div>
              <p className="post-preview">{notice.content || "내용 없음"}</p>
              <div className="post-meta">
                <span>관리자</span>
                <span>{notice.createdAt}</span>
                {(notice.images || []).length > 0 && <span>이미지 {(notice.images || []).length}장</span>}
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );

  const renderPosts = () => (
    <section className="panel-section">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Boards</p>
          <h2>공략 보기</h2>
          <p className="muted">길드원이 작성한 공략이 양식에 맞춰 자동 정리됩니다.</p>
        </div>
        <button type="button" className="primary-button small-primary" onClick={() => setActiveTab("write")}>글쓰기</button>
      </div>

      <div className="post-filter-stack">
        <div className="board-group-tabs post-group-tabs">
          {boardGroups.map((group) => (
            <button
              type="button"
              key={`post-group-tab-${group}`}
              className={selectedPostGroup === group ? "selected" : ""}
              onClick={() => {
                setSelectedPostGroup(group);
                setPostFilter("all");
              }}
            >
              {group}
            </button>
          ))}
        </div>

        <div className="filter-bar">
          <select value={postFilter} onChange={(event) => setPostFilter(event.target.value)}>
            <option value="all">전체 {selectedPostGroup} 공략</option>
            {getBoardEntriesByGroup(selectedPostGroup).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>

          <input
            value={postSearch}
            placeholder="방덱, 공격덱, 영웅명 검색"
            onChange={(event) => setPostSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="post-grid">
        {filteredPosts.length === 0 ? (
          <div className="empty-box">검색 결과가 없음.</div>
        ) : (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />)
        )}
      </div>
    </section>
  );

  const renderWrite = () => (
    <section className="panel-section write-panel">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Write</p>
          <h2>{editingPostId ? "공략 수정" : "공략 작성"}</h2>
          <p className="muted">여러분의 공략을 적어주세요!</p>
        </div>
        {editingPostId && <button type="button" className="ghost-button" onClick={cancelEditPost}>수정 취소</button>}
      </div>


      <form className="write-form" onSubmit={handleSubmit}>
        <div className="form-card board-select-card">
          <h3>게시판 선택</h3>

          <div className="board-group-tabs">
            {boardGroups.map((group) => (
              <button
                type="button"
                key={`board-group-tab-${group}`}
                className={selectedBoardGroup === group ? "selected" : ""}
                onClick={() => {
                  setSelectedBoardGroup(group);
                  updateForm("type", getFirstBoardKeyByGroup(group));
                }}
              >
                {group}
              </button>
            ))}
          </div>

          <div className="board-type-group active-board-group">
            <h4>{selectedBoardGroup} 콘텐츠</h4>

            <div className="type-grid">
              {getBoardEntriesByGroup(selectedBoardGroup).map(([key, value]) => (
                <button
                  type="button"
                  key={key}
                  className={`type-card ${form.type === key ? "selected" : ""}`}
                  onClick={() => updateForm("type", key)}
                >
                  <strong>{value.label}</strong>
                  <span>{value.short}</span>
                  <p>{value.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {isFeedbackType(form.type) ? (
          <div className="form-card feedback-write-card">
            <h3>건의/불편사항 작성</h3>
            <label className="field-label">
              제목
              <input
                value={form.title}
                placeholder="예: 모바일에서 공략 보기 필터가 불편해요"
                onChange={(event) => updateForm("title", event.target.value)}
              />
            </label>
          </div>
        ) : (
          <div className="form-card form-grid-two">
            <label className="field-label">
              제목
              <input value={form.title} placeholder="예: 즉사로 라오엘 상대" onChange={(event) => updateForm("title", event.target.value)} />
            </label>
            <label className="field-label">
              난이도/평가
              <select value={form.difficulty} onChange={(event) => updateForm("difficulty", event.target.value)}>
                <option value="쉬움">쉬움</option>
                <option value="보통">보통</option>
                <option value="어려움">어려움</option>
                <option value="실험중">실험중</option>
              </select>
            </label>
            <label className="field-label">
              닉네임
              <input value={form.author} placeholder="작성자 닉네임" onChange={(event) => updateForm("author", event.target.value)} />
            </label>
            <label className="field-label">
              비밀번호
              <input type="password" value={form.password} placeholder="숫자 4자리" onChange={(event) => updateForm("password", event.target.value)} />
            </label>
          </div>
        )}

        {isGuildWarType(form.type) && (
          <div className="form-card">
            <h3>길드전 3 vs 3 정보</h3>
            <div className="guildwar-write-flow guildwar-write-flow-v2">
              <div className="guildwar-write-step enemy-step enemy-heroes-step">
                <HeroSelector
                  label="상대 방어덱"
                  selected={form.enemyDeck}
                  max={3}
                  onChange={(value) => updateForm("enemyDeck", value)}
                  favoriteHeroes={favoriteOrders.guildWarDefense || []}
                  favoriteLabel="자주 쓰는 방어덱 영웅"
                />
              </div>

              <div className="guildwar-write-step enemy-step enemy-pet-step">
                <PetSelect
                  label="상대 펫"
                  value={form.enemyPet}
                  onChange={(value) => updateForm("enemyPet", value)}
                />
              </div>

              <div className="guildwar-write-step enemy-step enemy-skill-step">
                <SkillOrderBuilder
                  title="상대 스킬 순서"
                  heroes={form.enemyDeck}
                  steps={form.enemySkillSteps}
                  onChange={(value) => updateForm("enemySkillSteps", value)}
                />
              </div>

              <div className="guildwar-write-step attack-step attack-heroes-step">
                <HeroSelector
                  label="추천 공격덱"
                  selected={form.attackDeck}
                  max={3}
                  onChange={(value) => updateForm("attackDeck", value)}
                  favoriteHeroes={favoriteOrders.guildWarAttack || []}
                  favoriteLabel="자주 쓰는 공격덱 영웅"
                />
              </div>

              <div className="guildwar-write-step attack-step attack-pet-step">
                <PetSelect
                  label="내 펫"
                  value={form.attackPet}
                  onChange={(value) => updateForm("attackPet", value)}
                />
              </div>

              <div className="guildwar-write-step attack-step attack-skill-step">
                <SkillOrderBuilder
                  title="내 공격덱 스킬 순서"
                  heroes={form.attackDeck}
                  steps={form.attackSkillSteps}
                  onChange={(value) => updateForm("attackSkillSteps", value)}
                />
              </div>
            </div>

            {form.attackDeck.length === 3 && (
              <div className="formation-edit-box">
                <div className="form-grid-two">
                  <label className="field-label">
                    진형
                    <select
                      value={form.formation}
                      onChange={(event) => {
                        const nextFormation = event.target.value;
                        const currentBacklines = normalizeBacklineHeroes(form.attackDeck, form.backlineHeroes || [], form.backlineHero);
                        const nextBacklines = nextFormation === "보호 진형" ? currentBacklines.slice(0, 1) : currentBacklines;

                        updateForm("formation", nextFormation);
                        updateForm("backlineHeroes", nextBacklines);
                        updateForm("backlineHero", nextBacklines[0] || "");
                      }}
                    >
                      <option value="">진형 선택</option>
                      {formationOptions.map((name) => <option key={name} value={name}>{name}</option>)}
                    </select>
                  </label>
                  <div className="field-label backline-picker-field">
                    <span>후열 영웅</span>
                    <div className="backline-picker-row">
                      {form.attackDeck.map((hero) => {
                        const selectedBacklines = normalizeBacklineHeroes(form.attackDeck, form.backlineHeroes || [], form.backlineHero);
                        const isSelected = selectedBacklines.includes(hero);

                        return (
                          <button
                            type="button"
                            key={`backline-pick-${hero}`}
                            className={`backline-picker-button ${isSelected ? "selected" : ""}`}
                            onClick={() => {
                              const nextBacklines = toggleBacklineHero(selectedBacklines, hero, form.formation);
                              updateForm("backlineHeroes", nextBacklines);
                              updateForm("backlineHero", nextBacklines[0] || "");
                            }}
                          >
                            <HeroIcon name={hero} size="xs" />
                            <span>{isSelected ? "후열" : "전열"}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="muted small-text">
                      보호 진형은 후열 1명만 선택되고, 나머지 진형은 여러 명 선택 가능.
                    </p>
                  </div>
                </div>
                <FormationBoard
                  title="진형 미리보기"
                  heroes={form.attackDeck}
                  pet={form.attackPet}
                  formation={form.formation}
                  backlineHero={form.backlineHero}
                  backlineHeroes={form.backlineHeroes || []}
                  steps={form.attackSkillSteps}
                />
              </div>
            )}

            <div className="speed-select-box">
              <h4>속공 싸움</h4>
              <div className="speed-button-row">
                {Object.entries(speedBattleLabels).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={form.speedBattle === key ? "selected" : ""}
                    onClick={() => updateForm("speedBattle", key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hero-settings-form-block">
              <div className="form-block-title-row">
                <div>
                  <h4>영웅별 세팅</h4>
                  <p className="muted small-text">선택 입력. 비워도 공략 등록은 가능함.</p>
                </div>
              </div>
              <HeroSettingsEditor
                heroes={form.attackDeck}
                settings={form.heroSettings}
                onChange={(value) => updateForm("heroSettings", value)}
              />
            </div>
          </div>
        )}

{isGuildWarDefenseType(form.type) && (
          <div className="form-card">
            <h3>길드전 방어덱 배치</h3>
            <div className="guildwar-write-flow guildwar-write-flow-v2">
              <div className="guildwar-write-step defense-step defense-heroes-step">
                <HeroSelector
                  label="내 방어덱"
                  selected={form.defenseDeck}
                  max={3}
                  onChange={(value) => updateForm("defenseDeck", value)}
                  favoriteHeroes={favoriteOrders.guildWarDefense || []}
                  favoriteLabel="자주 쓰는 방어덱 영웅"
                />
              </div>

              <div className="guildwar-write-step defense-step defense-pet-step">
                <PetSelect
                  label="방어 펫"
                  value={form.defensePet}
                  onChange={(value) => updateForm("defensePet", value)}
                />
              </div>

              <div className="guildwar-write-step defense-step defense-skill-step">
                <SkillOrderBuilder
                  title="방어덱 스킬 순서"
                  heroes={form.defenseDeck}
                  steps={form.defenseSkillSteps}
                  onChange={(value) => updateForm("defenseSkillSteps", value)}
                />
              </div>
            </div>

            {form.defenseDeck.length === 3 && (
              <div className="formation-edit-box">
                <div className="form-grid-two">
                  <label className="field-label">
                    진형
                    <select
                      value={form.formation}
                      onChange={(event) => {
                        const nextFormation = event.target.value;
                        const currentBacklines = normalizeBacklineHeroes(form.defenseDeck, form.backlineHeroes || [], form.backlineHero);
                        const nextBacklines = nextFormation === "보호 진형" ? currentBacklines.slice(0, 1) : currentBacklines;

                        updateForm("formation", nextFormation);
                        updateForm("backlineHeroes", nextBacklines);
                        updateForm("backlineHero", nextBacklines[0] || "");
                      }}
                    >
                      <option value="">진형 선택</option>
                      {formationOptions.map((name) => <option key={name} value={name}>{name}</option>)}
                    </select>
                  </label>
                  <div className="field-label backline-picker-field">
                    <span>후열 영웅</span>
                    <div className="backline-picker-row">
                      {form.defenseDeck.map((hero) => {
                        const selectedBacklines = normalizeBacklineHeroes(form.defenseDeck, form.backlineHeroes || [], form.backlineHero);
                        const isSelected = selectedBacklines.includes(hero);

                        return (
                          <button
                            type="button"
                            key={`defense-backline-pick-${hero}`}
                            className={`backline-picker-button ${isSelected ? "selected" : ""}`}
                            onClick={() => {
                              const nextBacklines = toggleBacklineHero(selectedBacklines, hero, form.formation);
                              updateForm("backlineHeroes", nextBacklines);
                              updateForm("backlineHero", nextBacklines[0] || "");
                            }}
                          >
                            <HeroIcon name={hero} size="xs" />
                            <span>{isSelected ? "후열" : "전열"}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="muted small-text">
                      보호 진형은 후열 1명만 선택되고, 나머지 진형은 여러 명 선택 가능.
                    </p>
                  </div>
                </div>

                <FormationBoard
                  title="방어덱 미리보기"
                  heroes={form.defenseDeck}
                  pet={form.defensePet}
                  formation={form.formation}
                  backlineHero={form.backlineHero}
                  backlineHeroes={form.backlineHeroes || []}
                  steps={form.defenseSkillSteps}
                />
              </div>
            )}

            <div className="hero-settings-form-block">
              <div className="form-block-title-row">
                <div>
                  <h4>영웅별 세팅</h4>
                  <p className="muted small-text">선택 입력. 비워도 방어덱 등록은 가능함.</p>
                </div>
              </div>
              <HeroSettingsEditor
                heroes={form.defenseDeck}
                settings={form.heroSettings}
                onChange={(value) => updateForm("heroSettings", value)}
              />
            </div>
          </div>
        )}

        {isFiveHeroLikeType(form.type) && (
          <div className="form-card">
            <h3>{getBoardType(form.type).label} 정보</h3>
            <div className="form-grid-two">
              <label className="field-label">
                콘텐츠 이름
                <input value={form.contentName} placeholder="예: 레이드, 보스전" onChange={(event) => updateForm("contentName", event.target.value)} />
              </label>
              <label className="field-label">
                진형
                <input value={form.formation} placeholder="예: 보호 진형" onChange={(event) => updateForm("formation", event.target.value)} />
              </label>
            </div>
            <HeroSelector
              label="사용 덱"
              selected={form.deck}
              max={5}
              onChange={(value) => updateForm("deck", value)}
              favoriteHeroes={favoriteOrders[getFavoriteHeroOrderKey(form.type)] || favoriteOrders.pveCommon || []}
              favoriteLabel={`${getBoardType(form.type).label} 자주 쓰는 영웅`}
            />            <PetSelect label="사용 펫" value={form.pet} onChange={(value) => updateForm("pet", value)} />
          </div>
        )}

        {isFeedbackType(form.type) ? (
          <div className="form-card feedback-write-card">
            <label className="field-label">
              내용
              <textarea
                value={form.content}
                placeholder="불편한 점, 오류 상황, 추가되면 좋을 기능을 적어줘."
                onChange={(event) => updateForm("content", event.target.value)}
              />
            </label>
          </div>
        ) : (
          <div className="form-card form-grid-two">
            <label className="field-label">
              스킬 순서 추가 메모
              <textarea value={form.skillOrder} placeholder="예: 왜 이 순서인지, 예외 상황, 수동 입력 메모" onChange={(event) => updateForm("skillOrder", event.target.value)} />
            </label>
            <label className="field-label">
              주의사항
              <textarea value={form.caution} placeholder="예: 속공 지면 위험 / 특정 영웅 생존 시 불안정" onChange={(event) => updateForm("caution", event.target.value)} />
            </label>
            <label className="field-label wide-field">
              {isGuildWarDefenseType(form.type) ? "방어 의도 / 노리는 덱" : "필수 조건/세팅"}
              <textarea
                value={form.requirement}
                placeholder={isGuildWarDefenseType(form.type) ? "예: 라오엘 소모 유도, 여포 선스킬 압박, 오공 생존 기반" : "예: 6권 필요, 효저 100 권장"}
                onChange={(event) => updateForm("requirement", event.target.value)}
              />
            </label>
            <label className="field-label wide-field">
              본문
              <textarea value={form.content} placeholder="실제 사용 후기, 상황별 팁, 실패 조건 등을 자유롭게 작성" onChange={(event) => updateForm("content", event.target.value)} />
            </label>
          </div>
        )}

        <div className="form-card">
          <h3>이미지 첨부</h3>
          <p className="muted small-text">
            {isFeedbackType(form.type)
              ? "오류 화면이나 불편한 부분을 캡처해서 첨부할 수 있음. 이미지는 최대 6장까지 가능."
              : "이미지는 최대 6장까지 첨부 가능. 업로드 시 자동으로 압축됨."}
          </p>

          <input type="file" accept="image/*" multiple onChange={handleImageUpload} />

          {(form.images?.length > 0 || form.image) && (
            <div className="image-preview-grid">
              {(form.images?.length
                ? form.images
                : [{ id: "legacy-image", name: "기존 이미지", dataUrl: form.image }]
              ).map((image, index) => (
                <div className="image-preview-item" key={image.id || `preview-${index}`}>
                  <img src={image.url || image.dataUrl || image} alt={`첨부 미리보기 ${index + 1}`} />

                  <div className="image-preview-meta">
                    <span>{image.name || `이미지 ${index + 1}`}</span>
                    <button
                      type="button"
                      className="delete-button tiny-button"
                      onClick={() => removeFormImage(image.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="primary-button submit-button">{editingPostId ? "공략 수정 저장" : "공략 등록"}</button>
      </form>
    </section >
  );

  const renderHeroes = () => (
    <section className="panel-section">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Heroes</p>
          <h2>영웅 도감</h2>
          <p className="muted">이미지가 없는 영웅은 기본 글자 아이콘으로 표시됩니다.</p>
        </div>
        <span className="count-pill">{filteredHeroes.length}명</span>
      </div>
      <input className="hero-search-input" value={heroSearch} placeholder="영웅 검색: 라드, 브브, 칼헤론" onChange={(event) => setHeroSearch(event.target.value)} />
      <div className="hero-gallery-grid">
        {filteredHeroes.map((hero) => <HeroIcon key={hero} name={hero} size="gallery" />)}
      </div>
    </section>
  );

  const renderAdmin = () => (
    <section className="panel-section admin-panel">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>관리자 설정</h2>
          <p className="muted">접속 코드와 글쓰기 화면의 자주 쓰는 영웅 순서를 관리합니다.</p>
        </div>
        <button type="button" className="ghost-button" onClick={logout}>로그아웃</button>
      </div>

      <section className="admin-card">
        <h3>Supabase 연결 상태</h3>
        <p className="muted small-text">{supabaseStatus}</p>
      </section>

      <section className="admin-card access-setting-card">
        <h3>접속 설정</h3>
        <div className="form-grid-two">
          <label className="field-label">
            길드원 접속 코드
            <input
              value={settings.guildCode}
              maxLength={12}
              onChange={(event) => updateSettingsField("guildCode", event.target.value)}
            />
          </label>
        </div>
        <p className="muted small-text">
          길드원 접속 코드와 영웅 순서는 Supabase에 저장됩니다. 관리자 계정은 Supabase Auth에서 관리합니다.
        </p>
      </section>

      <section className="admin-card backup-admin-card">
        <h3>데이터 백업 / 불러오기</h3>
        <p className="muted small-text">
          전체 백업은 사이트 복구용이고, 분석용 백업은 비밀번호와 원본 이미지를 제거한 GPT 분석용 파일입니다.
        </p>

        <div className="backup-button-row">
          <button type="button" className="primary-button" onClick={downloadFullBackup}>
            전체 백업 다운로드
          </button>

          <button type="button" className="ghost-button" onClick={downloadAnalysisBackup}>
            분석용 백업 다운로드
          </button>

          <label className="backup-import-button">
            백업 불러오기
            <input type="file" accept="application/json,.json" onChange={handleBackupImport} />
          </label>
        </div>

        <p className="muted small-text">
          주의: 전체 백업 파일에는 글 비밀번호와 관리자 설정이 포함될 수 있으니 외부 공유하지 않는 게 좋음.
        </p>
      </section>

      <div className="admin-manager-grid">
        <FavoriteHeroManager
          title="길드전 - 상대 방어덱용"
          description="길드전 상대 방어덱 3명을 고를 때 상단에 먼저 표시될 영웅입니다."
          orderKey="guildWarDefense"
          favorites={favoriteOrders.guildWarDefense || []}
          onChange={(value) => updateFavoriteOrder("guildWarDefense", value)}
        />

        <FavoriteHeroManager
          title="길드전 - 추천 공격덱용"
          description="길드전 공격덱 3명을 고를 때 상단에 먼저 표시될 영웅입니다."
          orderKey="guildWarAttack"
          favorites={favoriteOrders.guildWarAttack || []}
          onChange={(value) => updateFavoriteOrder("guildWarAttack", value)}
        />

        <FavoriteHeroManager
          title="총력전용"
          description="총력전 공략 작성 시 사용 덱 선택창 상단에 먼저 표시될 영웅입니다."
          orderKey="totalWar"
          favorites={favoriteOrders.totalWar || []}
          onChange={(value) => updateFavoriteOrder("totalWar", value)}
        />

        <FavoriteHeroManager
          title="결투장용"
          description="결투장 공략 작성 시 사용 덱 선택창 상단에 먼저 표시될 영웅입니다."
          orderKey="arena"
          favorites={favoriteOrders.arena || []}
          onChange={(value) => updateFavoriteOrder("arena", value)}
        />

        <FavoriteHeroManager
          title="상급결투장용"
          description="상급결투장 공략 작성 시 사용 덱 선택창 상단에 먼저 표시될 영웅입니다."
          orderKey="highArena"
          favorites={favoriteOrders.highArena || []}
          onChange={(value) => updateFavoriteOrder("highArena", value)}
        />

        <FavoriteHeroManager
          title="PVE 통합"
          description="파괴신, 강림, 공성전, 레이드, 모험, 무탑 등 PVE 공략 작성 시 공통으로 사용할 영웅 순서입니다."
          orderKey="pveCommon"
          favorites={favoriteOrders.pveCommon || []}
          onChange={(value) => updateFavoriteOrder("pveCommon", value)}
        />
      </div>
    </section>
  );

  if (authLoading) {
    return (
      <main className="access-page">
        <section className="access-card">
          <h2>로그인 상태 확인 중...</h2>
          <p className="muted">Supabase Auth 세션을 확인하고 있습니다.</p>
        </section>
      </main>
    );
  }

  if (!accessMode) {
    return <AccessScreen onMemberLogin={handleMemberLogin} onAdminLogin={handleAdminLogin} />;
  }

  return (
    <div className={`app-shell ${isRealAdmin ? "admin-mode" : "member-mode"}`}>
      <aside className="desktop-sidebar">
        <div className="brand-box">
          <div className="brand-mark">S</div>
          <div>
            <strong>세나 공략 허브</strong>
            <span>Guild War Guide</span>
          </div>
        </div>
        <Nav activeTab={activeTab} setActiveTab={setActiveTab} navItems={navItems} />
        <div className="mode-box">
          <span>{isRealAdmin ? "관리자 모드" : "길드원 모드"}</span>
          <button type="button" className="ghost-button tiny-button" onClick={logout}>나가기</button>
        </div>
      </aside>

      <header className="mobile-topbar">
        <button type="button" className="menu-button" onClick={() => setMobileMenuOpen(true)}>☰</button>
        <div>
          <strong>세나 공략 허브</strong>
          <span>{navItems.find((item) => item.id === activeTab)?.label}</span>
        </div>
        <button type="button" className="write-shortcut" onClick={() => setActiveTab("write")}>글쓰기</button>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <aside className="mobile-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="brand-box">
              <div className="brand-mark">S</div>
              <div>
                <strong>세나 공략 허브</strong>
                <span>Mobile Menu</span>
              </div>
            </div>
            <Nav activeTab={activeTab} setActiveTab={setActiveTab} closeMenu={() => setMobileMenuOpen(false)} navItems={navItems} />
            <div className="mode-box mobile-mode-box">
              <span>{isRealAdmin ? "관리자 모드" : "길드원 모드"}</span>
              <button type="button" className="ghost-button tiny-button" onClick={logout}>나가기</button>
            </div>
            <button type="button" className="ghost-button" onClick={() => setMobileMenuOpen(false)}>닫기</button>
          </aside>
        </div>
      )}

      <main className="main-content">
        {activeTab === "home" && renderHome()}
        {activeTab === "notices" && renderNotices()}
        {activeTab === "posts" && renderPosts()}
        {activeTab === "write" && renderWrite()}
        {activeTab === "mistCut" && <MistCutCalculator />}
        {activeTab === "heroes" && renderHeroes()}
        {activeTab === "admin" && isRealAdmin && renderAdmin()}
      </main>

      {selectedNotice && (
        <NoticeDetail
          notice={selectedNotice}
          isRealAdmin={isRealAdmin}
          onClose={() => setSelectedNotice(null)}
          onEdit={startEditNotice}
          onDelete={deleteNotice}
          onOpenImage={setViewerImage}
        />
      )}

      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onEdit={startEditPost}
          onDelete={deletePost}
          onAddComment={addCommentToPost}
          onDeleteComment={deleteCommentFromPost}
          accessMode={isRealAdmin ? "admin" : accessMode}
          onOpenImage={setViewerImage}

        />
      )}
      {viewerImage && (
        <div className="image-viewer-backdrop" onClick={() => setViewerImage(null)}>
          <div className="image-viewer" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="image-viewer-close"
              onClick={() => setViewerImage(null)}
            >
              닫기
            </button>
            <img src={viewerImage} alt="확대 이미지" />
          </div>
        </div>
      )}

    </div>
  );
}

export default App;

