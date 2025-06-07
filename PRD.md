# PRD: BeepRunner
**버전**: 1.0  
**작성일**: 2025.06.07  
**개발 플랫폼**: React Native Expo (Cross-platform)  
**목표 개발 기간**: 1개월 (유연 조정)

---

## Executive Summary

**BeepRunner**는 셔틀런 전용 타이머 앱으로, 사용자가 **표준 20m 비프테스트** 또는 **개인 맞춤 설정**으로 훈련할 수 있도록 지원합니다. 기존 YouTube 비프음 영상의 제약을 해결하여, 다양한 공간에서도 효과적인 심폐지구력 훈련이 가능합니다.

**핵심 차별화**: 표준 비프테스트 + 공간 제약 극복 맞춤형 설정

---

## Problem Statement & Market Opportunity

### 문제점
1. **공간 제약**: 기존 20m 비프테스트는 넓은 공간 필요
2. **커스터마이징 불가**: YouTube 영상은 고정 거리와 페이스만 지원
3. **진도 추적 어려움**: 운동 기록 관리 도구 부재
4. **유연성 부족**: 개인의 체력 수준이나 공간에 맞는 조절 불가

### 시장 기회
- **1차 타겟**: 공간 제약이 있는 운동자 (아파트, 좁은 체육관, 군부대)
- **2차 타겟**: 표준 비프테스트 준비자 (스포츠 팀, 개인 훈련)
- **3차 타겟**: 개인 맞춤 훈련을 원하는 사용자

### 기존 솔루션의 한계
- **YouTube 비프음**: 20m 고정, 레벨 조절 불가
- **일반 런닝앱**: GPS 기반, 셔틀런 기능 없음
- **타이머앱**: 셔틀런 특화 기능 부재, 진행률 추적 없음

---

## Target Users & Use Cases

### Primary Persona: 공간 제약 운동자 (유저A)
- **목표**: 제한된 공간에서 효과적인 심폐지구력 훈련
- **사용 환경**: 아파트, 실내 체육관, 군부대, 좁은 야외 공간
- **핵심 니즈**: 개인 공간에 맞는 맞춤형 설정, 진도 추적
- **선호 모드**: Personal Beep Test

### Secondary Persona: 표준 테스트 준비자 (유저B)
- **목표**: 정확한 표준 비프테스트로 훈련 및 측정
- **사용 환경**: 체육관, 운동장 (20m 측정 가능)
- **핵심 니즈**: 정확한 표준 기준, 일관된 측정
- **선호 모드**: Standard Beep Test

---

## Features & Requirements

### Epic 0: 홈 화면 및 모드 선택
**Priority**: P0 (MVP 필수)

#### Story 0.1: 운동 모드 선택
**사용자 스토리**: 사용자가 자신의 목적에 맞는 운동 모드를 선택할 수 있다.

**Acceptance Criteria**:
- [ ] 홈 화면에 두 가지 주요 운동 모드 표시
  - "Standard Beep Test" (20m 표준 비프테스트)
  - "Personal Beep Test" (개인 공간 맞춤형)
- [ ] 각 모드에 대한 간단한 설명 제공
- [ ] 선택한 모드에 따라 다른 플로우로 진행
- [ ] 설정에서 기본 모드 변경 가능

### Epic 1: Standard Beep Test (표준 모드)
**Priority**: P0 (MVP 필수)

#### Story 1.1: 표준 20m 비프테스트
**사용자 스토리**: 사용자가 정확한 표준 비프테스트를 진행할 수 있다.

**Acceptance Criteria**:
- [ ] 20m 고정 거리 사용
- [ ] 1-9단계 표준 진행 (커스터마이징 불가)
- [ ] 각 단계별 정해진 회차와 속도로 진행
- [ ] 표준 비프음과 음성 안내 제공
- [ ] 진행률 및 현재 단계/회차 실시간 표시
- [ ] 일시정지/재개/중단 기능

**표준 설정값**:
```typescript
const STANDARD_LEVELS = [
  { level: 1, reps: 7, interval: 9.0 },    // 1-7회, 9초 간격
  { level: 2, reps: 8, interval: 8.0 },    // 8-15회, 8초 간격
  { level: 3, reps: 8, interval: 7.5 },    // 16-23회, 7.5초 간격
  { level: 4, reps: 8, interval: 7.0 },    // 24-31회, 7초 간격
  { level: 5, reps: 9, interval: 6.5 },    // 32-40회, 6.5초 간격
  { level: 6, reps: 9, interval: 6.2 },    // 41-49회, 6.2초 간격
  { level: 7, reps: 9, interval: 6.0 },    // 50-58회, 6초 간격
  { level: 8, reps: 9, interval: 5.9 },    // 59-67회, 5.9초 간격
  { level: 9, reps: 16, interval: 5.8 }    // 68-83회, 5.8초 간격
];
```

### Epic 2: Personal Beep Test (개인 맞춤 모드)
**Priority**: P0 (MVP 필수)

#### Story 2.1: 공간 캘리브레이션
**사용자 스토리**: 사용자가 자신의 운동 공간에 맞는 설정을 할 수 있다.

**Acceptance Criteria**:
- [ ] 친절한 캘리브레이션 안내 화면 제공
- [ ] "시작" 버튼 → 3,2,1 카운트다운 (화면 + 음성)
- [ ] 사용자가 A→B 지점을 천천히 달리며 시간 측정
- [ ] B지점 도착 시 "도착" 버튼으로 측정 완료
- [ ] 20m 표준 기준 대비 비례 계산하여 시간 간격 자동 설정
- [ ] 측정 결과 확인 및 "다시 측정" 옵션 제공
- [ ] 캘리브레이션 결과 저장 및 "재캘리브레이션" 기능

**측정 가이드라인**:
- **달리기 속도**: "대화할 수 있을 정도의 천천히 달리기"
- **일관성**: "평상시와 같은 편안한 속도 유지"

**UX 플로우**:
1. 안내 화면 → 준비 확인
2. 시작 버튼 → 3초 카운트다운 (시각+청각)
3. 달리기 시작 → 실시간 시간 표시
4. 도착 버튼 → 측정 완료
5. 결과 확인 → 승인/재측정 선택

**계산 로직**:
```typescript
user_time = measured_time  // 사용자 측정 시간
standard_time = 9.0  // 20m 레벨1 기준값 (셔틀런 공식 시간)
distance_ratio = standard_time / user_time  // 거리 비율 계산
scaled_intervals = STANDARD_LEVELS.map(level => level.interval / distance_ratio)
```

#### Story 2.2: 적응형 난이도 보정 (개인 모드 전용)
**사용자 스토리**: 사용자가 첫 운동 후 피드백을 통해 개인에게 최적화된 난이도로 자동 조정할 수 있다.

**Acceptance Criteria**:
- [ ] 운동 완료 후 난이도 피드백 화면 표시
- [ ] 3가지 선택지 제공: "너무 쉬웠어요" / "적당했어요" / "너무 어려웠어요"
- [ ] 피드백에 따른 자동 난이도 조정
  - 너무 쉬웠음: 시간 10% 단축 (더 빠르게)
  - 적당했음: 현재 설정 유지
  - 너무 어려웠음: 시간 15% 연장 (더 느리게)
- [ ] 조정된 설정을 다음 운동에 자동 적용
- [ ] 피드백 히스토리 저장 (학습 데이터)

**피드백 UX**:
```
운동 완료 후 화면:
┌─────────────────────────────┐
│      🎉 운동 완료!          │
├─────────────────────────────┤
│ 레벨 4까지 도달했습니다!    │
│ 총 31회 완주                │
│                             │
│ 방금 운동은 어떠셨나요?      │
├─────────────────────────────┤
│ 😅 너무 쉬웠어요           │
│    (다음엔 더 빠르게)       │
├─────────────────────────────┤
│ 👍 적당했어요              │
│    (이 설정 유지)          │
├─────────────────────────────┤
│ 😰 너무 어려웠어요         │
│    (다음엔 더 천천히)       │
└─────────────────────────────┘
```

**조정 로직**:
```typescript
function adjustDifficulty(currentIntervals: number[], feedback: string): number[] {
  const multiplier = {
    'too_easy': 0.9,      // 10% 시간 단축 (더 빠르게)
    'perfect': 1.0,       // 현재 설정 유지
    'too_hard': 1.15      // 15% 시간 연장 (더 느리게)
  }[feedback];
  
  return currentIntervals.map(interval => interval * multiplier);
}
```

#### Story 2.3: 고급 커스터마이징 (테이블 입력)
**사용자 스토리**: 사용자가 레벨 수, 각 레벨별 회차, 시간 간격을 완전히 커스터마이징할 수 있다.

**Acceptance Criteria**:
- [ ] 총 레벨 수 설정 (1-20 레벨)
- [ ] 각 레벨별 왕복 회차 수 설정
- [ ] 각 레벨별 시간 간격 설정 (초 단위)
- [ ] 테이블 형태로 모든 설정값 표시 및 편집
- [ ] 프리셋 저장 및 불러오기 기능
- [ ] 설정값 검증 (논리적 오류 방지)

**테이블 입력 인터페이스**:
```
레벨 | 회차 | 간격(초) | 예상시간
-----|------|----------|----------
1    | 5    | 10.0     | 0:50
2    | 6    | 9.5      | 0:57
3    | 7    | 9.0      | 1:03
...  | ...  | ...      | ...
```

#### Story 2.4: 재캘리브레이션 기능
**사용자 스토리**: 사용자가 운동 거리가 변경되었을 때 쉽게 재설정할 수 있다.

**Acceptance Criteria**:
- [ ] 설정 화면에서 "재캘리브레이션" 버튼 제공
- [ ] 기존 설정 백업 후 새로운 측정 진행
- [ ] 측정 실패 시 이전 설정으로 복원 옵션
- [ ] 캘리브레이션 히스토리 저장 (최근 3개)

### Epic 3: 셔틀런 타이머 코어
**Priority**: P0 (MVP 필수)

#### Story 3.1: 통합 타이머 엔진
**사용자 스토리**: 두 모드 모두에서 일관된 타이머 경험을 제공한다.

**Acceptance Criteria**:
- [ ] 선택된 설정(표준/커스텀)에 따른 타이머 진행
- [ ] 각 회차별 비프음 재생
- [ ] 음성으로 현재 회차 숫자 안내
- [ ] 레벨 변경 시 음성 안내 ("레벨 2")
- [ ] 백그라운드 실행 지원

### Epic 4: 기록 관리 시스템
**Priority**: P1 (MVP 이후 우선)

#### Story 4.1: 운동 일지 저장
**사용자 스토리**: 사용자가 매일의 셔틀런 기록을 저장하고 확인할 수 있다.

**Acceptance Criteria**:
- [ ] 운동 완료 시 자동 기록 저장 (날짜, 모드, 최대 도달 단계, 총 회차)
- [ ] 캘린더 뷰로 운동 일지 확인
- [ ] 모드별 기록 구분 표시 (Standard/Custom)
- [ ] 개별 운동 세션 상세 정보 조회

#### Story 4.2: 진도 분석
**사용자 스토리**: 사용자가 모드별로 자신의 실력 향상을 확인할 수 있다.

**Acceptance Criteria**:
- [ ] 모드별 최대 도달 단계 추이 그래프
- [ ] 총 운동 회차 추이 그래프
- [ ] 연속 운동 일수 표시
- [ ] 개인 최고 기록 하이라이트 (모드별)

### Epic 5: 앱 설정 및 개인화 (App Settings & Personalization)
**Priority**: P1 (MVP 이후 우선)

#### Story 5.1: 다국어 지원 (Multi-language Support)
**사용자 스토리**: 사용자가 한국어와 영어 중에서 선택하여 앱을 사용할 수 있다.

**Acceptance Criteria**:
- [ ] 설정 화면에서 언어 선택 옵션 제공 (한국어/English)
- [ ] 선택한 언어로 모든 UI 텍스트 표시
- [ ] 언어 변경 시 즉시 적용 (앱 재시작 불필요)
- [ ] 시스템 언어에 따른 기본 언어 설정 (한국어/영어만 지원)
- [ ] 언어별 폰트 최적화 (한글 텍스트 가독성)

**지원 언어**:
- **한국어**: 기본 개발 언어
- **English**: 글로벌 사용자 대상

**번역 범위**:
- 홈 화면 모든 텍스트 (앱 제목, 모드 설명, 기능 설명)
- 타이머 화면 텍스트 (레벨, 회차, 시간, 버튼)
- 캘리브레이션 가이드 및 피드백 메시지
- 설정 화면 및 메뉴 항목
- 오류 메시지 및 알림

#### Story 5.2: 테마 설정 (Theme Configuration)
**사용자 스토리**: 사용자가 다크 모드와 라이트 모드 중에서 선택하여 사용할 수 있다.

**Acceptance Criteria**:
- [ ] 설정 화면에서 테마 선택 옵션 제공 (다크/라이트/시스템 따라가기)
- [ ] 선택한 테마로 즉시 앱 전체 테마 변경
- [ ] 시스템 테마에 따른 기본 설정 (시스템 따라가기)
- [ ] 테마별 최적화된 색상 적용
- [ ] 모드별 색상 구분 유지 (Personal: 파랑, Standard: 초록)

**테마 옵션**:
- **라이트 모드**: 밝은 배경, 어두운 텍스트
- **다크 모드**: 어두운 배경, 밝은 텍스트
- **시스템 따라가기**: 기기 설정에 따른 자동 변경

**색상 설계**:
```typescript
// 다크 모드 색상 팔레트
const DARK_THEME = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#BB86FC',
  secondary: '#03DAC6',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  border: '#333333',
  personal: '#3F51B5',    // Personal 모드 (파랑 계열)
  standard: '#4CAF50',    // Standard 모드 (초록 계열)
  accent: '#FF9800',      // 강조 색상
  danger: '#F44336',      // 경고/중단 색상
};

// 라이트 모드 색상 팔레트  
const LIGHT_THEME = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  primary: '#6200EE',
  secondary: '#018786',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  personal: '#2196F3',    // Personal 모드 (파랑 계열)
  standard: '#4CAF50',    // Standard 모드 (초록 계열)
  accent: '#FF9800',      // 강조 색상
  danger: '#F44336',      // 경고/중단 색상
};
```

#### Story 5.3: 설정 화면 구현
**사용자 스토리**: 사용자가 직관적인 설정 화면에서 앱을 개인화할 수 있다.

**Acceptance Criteria**:
- [ ] 설정 화면 접근성 (홈 화면 설정 버튼)
- [ ] 그룹별 설정 구성 (일반, 운동, 앱 정보)
- [ ] 각 설정 항목에 대한 명확한 설명
- [ ] 설정 변경 시 즉시 미리보기 제공
- [ ] 설정값 로컬 저장 및 앱 재시작 시 유지

**설정 화면 구성**:
```
┌─────────────────────────────────┐
│          ⚙️ 설정               │
├─────────────────────────────────┤
│ 📱 일반                        │
│   🌐 언어 설정     한국어 >    │
│   🎨 테마 설정     다크 모드 >  │
│                                 │
│ 🏃 운동 설정                   │
│   🔊 음성 안내     켜짐 >      │
│   📳 진동 피드백   켜짐 >      │
│   🎯 기본 모드     개인 훈련 > │
│                                 │
│ ℹ️ 앱 정보                     │
│   📄 버전 정보     1.0.0       │
│   📜 오픈소스 라이선스          │
│   📞 문의하기                  │
└─────────────────────────────────┘
```

---

## Technical Architecture Overview

### 기술 스택
- **Framework**: React Native Expo
- **로컬 저장소**: SQLite (expo-sqlite)
- **오디오**: expo-av (비프음 + 카운트다운 음성)
- **백그라운드**: expo-background-task
- **차트**: react-native-chart-kit
- **내비게이션**: React Navigation v6
- **다국어 지원**: expo-localization + i18next
- **테마 관리**: React Context + AsyncStorage
- **설정 저장**: AsyncStorage (expo-async-storage)

**오디오 파일 (MVP에서는 Mock)**:
- `countdown_3.mp3`, `countdown_2.mp3`, `countdown_1.mp3`, `start.mp3`
- `beep.mp3` (셔틀런 비프음)
- `level_up.mp3` (레벨 변경 알림)

### 데이터 모델
```sql
-- 사용자 캘리브레이션 설정
CREATE TABLE calibration (
    id INTEGER PRIMARY KEY,
    measured_time REAL NOT NULL,
    estimated_distance REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 운동 기록
CREATE TABLE workout_sessions (
    id INTEGER PRIMARY KEY,
    date DATE NOT NULL,
    workout_mode TEXT NOT NULL, -- 'personal' | 'standard'
    max_level INTEGER NOT NULL,
    total_reps INTEGER NOT NULL,
    duration_minutes INTEGER,
    calibration_suggestion_shown BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 캘리브레이션 제안 기록 (개인 모드 전용)
CREATE TABLE calibration_suggestions (
    id INTEGER PRIMARY KEY,
    workout_session_id INTEGER NOT NULL,
    suggestion_type TEXT NOT NULL, -- 'too_easy' | 'too_hard' | 'perfect'
    user_action TEXT, -- 'accepted' | 'declined' | 'ignored'
    difficulty_multiplier REAL, -- 적용된 난이도 배율 (0.9, 1.0, 1.15)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_session_id) REFERENCES workout_sessions(id)
);

-- 단계별 기준 시간 (20m 표준)
CREATE TABLE level_standards (
    level INTEGER PRIMARY KEY,
    rep_start INTEGER NOT NULL,
    rep_end INTEGER NOT NULL,
    base_interval REAL NOT NULL -- 20m 기준 시간
);

-- 앱 설정 저장
CREATE TABLE app_settings (
    id INTEGER PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 기본 설정값
INSERT INTO app_settings (setting_key, setting_value) VALUES 
    ('language', 'auto'), -- 'ko', 'en', 'auto'
    ('theme', 'system'), -- 'light', 'dark', 'system'
    ('voice_guidance', 'true'),
    ('haptic_feedback', 'true'),
    ('default_mode', 'personal'); -- 'personal', 'standard'
```

---

## API Specifications

### 로컬 API (오프라인 동작)

#### 캘리브레이션 API
```typescript
interface CalibrationService {
  saveCalibration(measuredTime: number): Promise<void>;
  getCalibration(): Promise<Calibration | null>;
  calculatePersonalStandards(measuredTime: number): LevelStandard[];
}
```

#### 운동 기록 API
```typescript
interface WorkoutService {
  saveWorkout(session: WorkoutSession): Promise<number>;
  getWorkoutHistory(mode?: 'personal' | 'standard', limit?: number): Promise<WorkoutSession[]>;
  getWorkoutsByDateRange(start: Date, end: Date): Promise<WorkoutSession[]>;
  deleteWorkout(id: number): Promise<void>;
  getProgressData(mode: 'personal' | 'standard'): Promise<ProgressData>;
}
```

#### 적응형 제안 API (개인 모드 전용)
```typescript
interface AdaptiveService {
  analyzePerformance(recentSessions: WorkoutSession[]): Promise<PerformanceAnalysis>;
  shouldSuggestCalibration(analysis: PerformanceAnalysis): Promise<SuggestionType | null>;
  recordSuggestionResponse(suggestionId: number, response: 'accepted' | 'declined'): Promise<void>;
  getOptimalDifficulty(userId: string): Promise<DifficultySettings>;
}
```

#### 통계 API
```typescript
interface StatsService {
  getProgressData(period: 'week' | 'month', mode?: string): Promise<ProgressData>;
  getPersonalBest(mode?: string): Promise<PersonalBest>;
  getStreakData(): Promise<StreakData>;
}
```

#### 설정 관리 API
```typescript
interface SettingsService {
  // 언어 설정
  getLanguage(): Promise<'ko' | 'en' | 'auto'>;
  setLanguage(language: 'ko' | 'en' | 'auto'): Promise<void>;
  
  // 테마 설정
  getTheme(): Promise<'light' | 'dark' | 'system'>;
  setTheme(theme: 'light' | 'dark' | 'system'): Promise<void>;
  
  // 운동 설정
  getVoiceGuidance(): Promise<boolean>;
  setVoiceGuidance(enabled: boolean): Promise<void>;
  
  getHapticFeedback(): Promise<boolean>;
  setHapticFeedback(enabled: boolean): Promise<void>;
  
  getDefaultMode(): Promise<'personal' | 'standard'>;
  setDefaultMode(mode: 'personal' | 'standard'): Promise<void>;
  
  // 전체 설정
  getAllSettings(): Promise<AppSettings>;
  resetSettings(): Promise<void>;
}

interface AppSettings {
  language: 'ko' | 'en' | 'auto';
  theme: 'light' | 'dark' | 'system';
  voiceGuidance: boolean;
  hapticFeedback: boolean;
  defaultMode: 'personal' | 'standard';
}
```

#### 다국어 지원 API
```typescript
interface LocalizationService {
  getCurrentLanguage(): Promise<'ko' | 'en'>;
  getSystemLanguage(): 'ko' | 'en';
  getSupportedLanguages(): string[];
  
  // 번역 텍스트 가져오기
  t(key: string, params?: Record<string, any>): string;
  
  // 언어 변경
  changeLanguage(language: 'ko' | 'en'): Promise<void>;
}

// 번역 키 예시
interface TranslationKeys {
  // 홈 화면
  'home.title': 'BeepRunner';
  'home.subtitle': 'Shuttle Run Timer';
  'home.personal.title': 'Personal Training';
  'home.personal.description': 'Customized for your space';
  'home.standard.title': 'Standard Shuttle Run';
  'home.standard.description': 'Official 20m regulation test';
  
  // 타이머 화면
  'timer.level': 'Level {{level}}';
  'timer.rep': 'Rep {{current}} of {{total}}';
  'timer.totalReps': 'Total Reps: {{count}}';
  'timer.start': 'Start';
  'timer.pause': 'Pause';
  'timer.resume': 'Resume';
  'timer.stop': 'Stop';
  
  // 설정 화면
  'settings.title': 'Settings';
  'settings.general': 'General';
  'settings.language': 'Language';
  'settings.theme': 'Theme';
  'settings.workout': 'Workout';
  'settings.voiceGuidance': 'Voice Guidance';
  'settings.hapticFeedback': 'Haptic Feedback';
}
```

---

## UX Flow Design

### 캘리브레이션 플로우 (개인 모드)

#### 1단계: 준비 화면
```
┌─────────────────────────────┐
│    🏃 공간 캘리브레이션      │
├─────────────────────────────┤
│ A지점에서 B지점까지의       │
│ 거리를 측정하겠습니다       │
│                             │
│ 💡 천천히 달려주세요        │
│   (레벨1 속도로 편안하게)   │
│                             │
│ 📍 A지점에 서서            │
│    준비되면 시작을 눌러주세요 │
│                             │
│        [시작하기]           │
└─────────────────────────────┘
```

#### 2단계: 카운트다운
```
┌─────────────────────────────┐
│           🏃‍♂️               │
│                             │
│            3                │
│                             │
│      곧 시작합니다!         │
└─────────────────────────────┘
```
**오디오**: "3, 2, 1, 시작!" (미리 녹음된 파일)

#### 3단계: 측정 중
```
┌─────────────────────────────┐
│       ⏱️ 측정 중...         │
│                             │
│        05.23초              │
│                             │
│ 천천히 달려서 B지점에 도착하면 │
│     아래 버튼을 눌러주세요    │
│                             │
│       [🎯 도착!]            │
└─────────────────────────────┘
```

#### 4단계: 결과 확인
```
┌─────────────────────────────┐
│      ✅ 측정 완료!          │
├─────────────────────────────┤
│ 측정 시간: 5.23초           │
│ 예상 거리: 약 11.6m         │
│ (20m 기준 대비 58% 크기)    │
│                             │
│ 이 설정으로 맞춤형 셔틀런을  │
│ 진행하시겠습니까?           │
│                             │
│   [다시 측정] [확인]        │
└─────────────────────────────┘
```

### 적응형 보정 플로우

#### 운동 완료 후 피드백
```
┌─────────────────────────────┐
│      🎉 운동 완료!          │
├─────────────────────────────┤
│ 레벨 4까지 도달했습니다!    │
│ 총 31회 완주 (5분 23초)     │
│                             │
│ 방금 운동은 어떠셨나요?      │
├─────────────────────────────┤
│ 😅 너무 쉬웠어요           │
│    (다음엔 더 빠르게)       │
├─────────────────────────────┤
│ 👍 적당했어요              │
│    (이 설정 유지)          │
├─────────────────────────────┤
│ 😰 너무 어려웠어요         │
│    (다음엔 더 천천히)       │
└─────────────────────────────┘
```

#### 조정 완료 안내
```
┌─────────────────────────────┐
│      ⚙️ 설정 업데이트      │
├─────────────────────────────┤
│ 다음 운동은 조금 더 빠른    │
│ 페이스로 진행됩니다!        │
│                             │
│ 🔄 자동 조정 완료           │
│                             │
│      [다음 운동 시작]       │
│      [기록 보기]           │
└─────────────────────────────┘
```

---

## UI/UX Requirements

### 핵심 화면 정의

#### 1. 홈 화면
- **목적**: 운동 모드 선택 및 빠른 접근
- **구성요소**:
  ```
  ┌─────────────────────────┐
  │      BeepRunner         │
  ├─────────────────────────┤
  │  🏃 개인 맞춤 훈련      │
  │  자신만의 공간에서      │
  │  • 시간 기반 자동 설정   │
  │  • 적응형 난이도 조절   │
  ├─────────────────────────┤  
  │  📏 표준 셔틀런         │
  │  정확한 20m 기준으로    │
  │  • 표준 비프테스트      │
  │  • 일관된 측정 기준     │
  ├─────────────────────────┤
  │  📊 운동 기록 보기      │
  │  📋 설정                │
  └─────────────────────────┘
  ```
- **사용성**: 명확한 모드 구분과 직관적인 선택

#### 2. 캘리브레이션 화면 (개인 모드 전용)
- **목적**: 개인 공간 크기 자동 측정
- **구성요소**:
  - 친절한 안내 메시지 ("A지점에서 B지점까지 천천히 달려주세요")
  - 크고 명확한 "시작하기" 버튼
  - 카운트다운 화면 (3,2,1 + 음성)
  - 측정 중 화면 (실시간 시간 표시 + "도착!" 버튼)
  - 결과 확인 화면 (측정시간, 예상거리, 확인/재측정)
- **사용성**: 단계별 명확한 가이드와 즉각적 피드백

#### 3. 운동 화면
- **목적**: 셔틀런 진행 중 정보 표시
- **구성요소**:
  - 현재 단계/회차 (큰 폰트)
  - 다음 비프음까지 카운트다운
  - 일시정지/중단 버튼
  - 진행률 바
  - 모드별 다른 정보 표시:
    - **개인 모드**: 현재 페이스, 개인 기록 대비
    - **표준 모드**: 표준 기준 정보, 전체 진행률
- **사용성**: 운동 중에도 쉽게 읽을 수 있는 대형 텍스트

#### 4. 운동 완료 화면
- **목적**: 결과 확인 및 다음 액션 안내
- **구성요소**:
  - 운동 결과 요약 (도달 단계, 총 회차, 소요 시간)
  - 모드별 다른 피드백:
    - **개인 모드**: 캘리브레이션 제안 (조건부), 개인 기록 비교
    - **표준 모드**: 표준 기준 대비 평가, 다음 목표 제시
  - 다음 운동 제안
- **사용성**: 성취감 제공 및 지속적 동기 부여

#### 5. 기록 화면
- **목적**: 운동 히스토리 및 진도 확인
- **구성요소**:
  - 캘린더 뷰 (모드별 색상 구분)
  - 진도 그래프 (모드별 분리 표시)
  - 개인 최고 기록 (모드별)
  - 연속 운동 일수, 평균 성과
- **사용성**: 스와이프로 월간 이동, 터치로 세부 정보

### 디자인 가이드라인
- **색상**: 
  - 개인 모드: 파랑 계열 (개인화, 유연성)
  - 표준 모드: 초록 계열 (정확성, 안정성)
  - 공통: 운동 앱다운 활기찬 색상
- **폰트**: 운동 중에도 읽기 쉬운 큰 사이즈
- **버튼**: 충분한 터치 영역 (최소 44x44pt)
- **피드백**: 모든 액션에 즉각적인 시각/청각 피드백
- **모드 구분**: 명확한 시각적 차별화로 혼동 방지

---

## Success Metrics & KPIs

### 사용자 참여 지표
- **일일 활성 사용자 (DAU)**: 목표 1,000명 (6개월)
- **월간 활성 사용자 (MAU)**: 목표 5,000명 (6개월)
- **사용자 유지율**: 1주일 50%, 1개월 25%

### 제품 성과 지표
- **평균 세션 길이**: 15-20분
- **주간 평균 운동 횟수**: 3-4회
- **캘리브레이션 완료율**: 80%+

### 비즈니스 지표
- **앱스토어 평점**: 4.5+
- **다운로드 수**: 10,000+ (3개월)
- **사용자 피드백**: 긍정적 리뷰 비율 85%+

---

## Development Milestones

### Phase 1: MVP 개발 (3주)
**Week 1**: 핵심 타이머 기능
- [ ] 셔틀런 타이머 로직 구현
- [ ] 홈 화면 모드 선택 UI
- [ ] 기본 오디오 시스템 구축 (Mock 파일 포함)
- [ ] 표준 모드 (20m 고정) 구현

**Week 2**: 개인 맞춤 모드
- [ ] 시간 기반 캘리브레이션 기능 (카운트다운 UX 포함)
- [ ] 개인 모드 타이머 구현
- [ ] 적응형 피드백 시스템 구현
- [ ] 모드별 다른 UI/UX 적용

**Week 3**: 통합 및 완성
- [ ] 전체 기능 통합
- [ ] 백그라운드 동작 구현
- [ ] 기록 관리 시스템 구현
- [ ] 기본 버그 수정 및 테스트

### Phase 2: 고도화 기능 (1주)
**Week 4**: UX 개선
- [ ] 적응형 난이도 조정 로직 고도화
- [ ] 진도 그래프 및 통계 기능
- [ ] 오디오 파일 최적화 (실제 녹음 파일로 교체)
- [ ] 성능 최적화
- [ ] 최종 테스트 및 출시 준비

---

## Risk Assessment

### 높은 위험도 (High Risk)
1. **백그라운드 오디오 이슈**
   - **위험**: iOS/Android 백그라운드 정책 변경
   - **대응**: 포그라운드 서비스 활용, 대체 알림 방식

2. **정확도 의존성**
   - **위험**: 사용자의 부정확한 캘리브레이션
   - **대응**: 가이드라인 강화, 재측정 유도 기능

### 중간 위험도 (Medium Risk)
3. **사용자 채택률**
   - **위험**: 기존 YouTube 솔루션에 만족하는 사용자
   - **대응**: 명확한 차별화 포인트 강조, 초기 사용자 경험 최적화

4. **플랫폼 정책 변경**
   - **위험**: 앱스토어 심사 기준 변경
   - **대응**: 정책 모니터링, 대체 배포 방안 준비

### 낮은 위험도 (Low Risk)
5. **기술적 복잡성**
   - **위험**: React Native Expo 제약사항
   - **대응**: 검증된 라이브러리 사용, 점진적 기능 추가

---

## Future Roadmap

### Phase 4: 고급 테스트 모드 (MVP 이후)
**예상 개발 시기**: 첫 출시 후 3-6개월

#### Yo-Yo Test 기능
- **Yo-Yo Intermittent Recovery Test Level 1**: 스포츠 선수용 표준 테스트
- **Yo-Yo Intermittent Recovery Test Level 2**: 고급 선수용 고강도 테스트  
- **핵심 차별점**: 
  - 40m 왕복 (20m + 20m) 후 회복 시간 제공
  - 간헐적 회복을 통한 실제 경기 상황 시뮬레이션
  - 축구, 농구, 테니스 등 구기 종목 선수들의 표준 측정 도구
- **기술적 고려사항**: 회복 시간 타이머, 단계별 다른 회복 간격, 레벨별 프로토콜

#### 기타 확장 기능
- **멀티플레이어 모드**: 팀원들과 함께 운동 및 기록 비교
- **코치 모드**: 선수들의 기록 관리 및 분석 도구  
- **스포츠별 특화**: 축구, 농구, 배드민턴 등 종목별 맞춤 프로토콜
- **웨어러블 연동**: Apple Watch, Galaxy Watch 심박수 연동
- **클라우드 백업**: 기록 동기화 및 백업 기능

### 확장성 고려 사항
현재 MVP 아키텍처는 향후 yo-yo test 추가를 염두에 두고 설계되었습니다:
- **모듈화된 타이머 엔진**: 다양한 테스트 프로토콜 지원 가능
- **유연한 데이터 모델**: 회복 시간, 다단계 테스트 저장 구조
- **확장 가능한 UI 구조**: 추가 테스트 모드 쉽게 통합 가능

---

## Appendix

### 표준 셔틀런 단계별 기준 (20m 기준)
| 단계 | 회차 범위 | 기준 시간 | 속도 (km/h) |
|------|-----------|-----------|-------------|
| 1    | 1-7       | 9.0초     | 8.0         |
| 2    | 8-15      | 8.0초     | 9.0         |
| 3    | 16-23     | 7.5초     | 9.6         |
| 4    | 24-31     | 7.0초     | 10.3        |
| 5    | 32-40     | 6.5초     | 11.1        |
| 6    | 41-49     | 6.2초     | 11.6        |
| 7    | 50-58     | 6.0초     | 12.0        |
| 8    | 59-67     | 5.9초     | 12.2        |
| 9    | 68-83     | 5.8초     | 12.4        |

---

## 참고 자료
- [20m Shuttle Run Test Standards](https://www.topendsports.com/testing/tests/20mshuttle.htm)
- [Expo Audio Documentation](https://docs.expo.dev/versions/latest/sdk/audio/)
- [React Native Background Tasks](https://docs.expo.dev/versions/latest/sdk/background-task/)