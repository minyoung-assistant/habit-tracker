export type Language = 'ko' | 'en'

export type TranslationKey =
  | 'auth.title'
  | 'auth.subtitle'
  | 'auth.login'
  | 'auth.signup'
  | 'auth.email'
  | 'auth.password'
  | 'auth.passwordPlaceholder'
  | 'auth.submit_login'
  | 'auth.submit_signup'
  | 'auth.loading'
  | 'auth.error_login'
  | 'auth.error_signup'
  | 'auth.success_signup'
  | 'auth.pw_length'
  | 'auth.pw_uppercase'
  | 'auth.pw_lowercase'
  | 'auth.pw_number'
  | 'auth.pw_special'
  | 'auth.error_pw_weak'
  | 'nav.today'
  | 'nav.habits'
  | 'nav.calendar'
  | 'dashboard.title'
  | 'dashboard.logout'
  | 'dashboard.progress'
  | 'dashboard.allDone'
  | 'dashboard.empty_title'
  | 'dashboard.empty_desc'
  | 'dashboard.add_habit'
  | 'habits.title'
  | 'habits.empty_title'
  | 'habits.empty_desc'
  | 'habits.new_habit'
  | 'habits.edit_habit'
  | 'habits.name_label'
  | 'habits.name_placeholder'
  | 'habits.desc_label'
  | 'habits.desc_placeholder'
  | 'habits.notify_label'
  | 'habits.color_label'
  | 'habits.save'
  | 'habits.saving'
  | 'habits.cancel'
  | 'habits.notify_prefix'
  | 'habits.delete_confirm'
  | 'calendar.title'
  | 'calendar.legend_full'
  | 'calendar.legend_partial'
  | 'calendar.no_habits'
  | 'push.title'
  | 'push.desc'
  | 'push.allow'

type Translations = Record<Language, Record<string, Record<string, string>>>

const translations: Translations = {
  ko: {
    auth: {
      title: 'Habit Tracker',
      subtitle: '매일 습관을 기록하고 성장하세요',
      login: '로그인',
      signup: '회원가입',
      email: '이메일',
      password: '비밀번호',
      passwordPlaceholder: '6자 이상',
      submit_login: '로그인',
      submit_signup: '회원가입',
      loading: '처리 중...',
      error_login: '이메일 또는 비밀번호가 올바르지 않습니다.',
      error_signup: '회원가입에 실패했습니다. 다시 시도해주세요.',
      success_signup: '이메일을 확인해주세요. 인증 링크가 발송되었습니다.',
      pw_length: '8자 이상',
      pw_uppercase: '영문 대문자 포함',
      pw_lowercase: '영문 소문자 포함',
      pw_number: '숫자 포함',
      pw_special: '특수문자 포함 (!@#$%^&* 등)',
      error_pw_weak: '비밀번호 조건을 모두 충족해주세요.',
    },
    nav: {
      today: '오늘',
      habits: '습관',
      calendar: '달력',
    },
    dashboard: {
      title: '오늘의 습관',
      logout: '로그아웃',
      progress: '오늘 진행률',
      allDone: '🎉 오늘 모든 습관 완료!',
      empty_title: '아직 등록된 습관이 없어요',
      empty_desc: '습관 탭에서 첫 번째 습관을 추가해보세요',
      add_habit: '습관 추가하기',
    },
    habits: {
      title: '내 습관',
      empty_title: '등록된 습관이 없어요',
      empty_desc: '+ 버튼을 눌러 첫 번째 습관을 추가해보세요',
      new_habit: '새 습관 추가',
      edit_habit: '습관 수정',
      name_label: '습관 이름 *',
      name_placeholder: '예: 물 2L 마시기',
      desc_label: '설명 (선택)',
      desc_placeholder: '예: 하루 종일 수분 보충',
      notify_label: '알림 시간',
      color_label: '색상',
      save: '저장',
      saving: '저장 중...',
      cancel: '취소',
      notify_prefix: '알림: ',
      delete_confirm: '정말 삭제하시겠어요? 관련 기록도 모두 삭제됩니다.',
    },
    calendar: {
      title: '달력',
      legend_full: '모두 완료',
      legend_partial: '일부 완료',
      no_habits: '등록된 습관이 없어요',
    },
    push: {
      title: '알림 허용하기',
      desc: '습관 시간에 맞춰 알림을 받으세요',
      allow: '허용',
    },
  },
  en: {
    auth: {
      title: 'Habit Tracker',
      subtitle: 'Track your habits and grow every day',
      login: 'Login',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      passwordPlaceholder: 'At least 6 characters',
      submit_login: 'Login',
      submit_signup: 'Sign Up',
      loading: 'Processing...',
      error_login: 'Invalid email or password.',
      error_signup: 'Sign up failed. Please try again.',
      success_signup: 'Check your email for the confirmation link.',
      pw_length: 'At least 8 characters',
      pw_uppercase: 'One uppercase letter',
      pw_lowercase: 'One lowercase letter',
      pw_number: 'One number',
      pw_special: 'One special character (!@#$%^&* etc.)',
      error_pw_weak: 'Password does not meet all requirements.',
    },
    nav: {
      today: 'Today',
      habits: 'Habits',
      calendar: 'Calendar',
    },
    dashboard: {
      title: "Today's Habits",
      logout: 'Logout',
      progress: "Today's Progress",
      allDone: '🎉 All habits done today!',
      empty_title: 'No habits yet',
      empty_desc: 'Go to the Habits tab to add your first habit',
      add_habit: 'Add Habit',
    },
    habits: {
      title: 'My Habits',
      empty_title: 'No habits registered',
      empty_desc: 'Tap + to add your first habit',
      new_habit: 'New Habit',
      edit_habit: 'Edit Habit',
      name_label: 'Habit Name *',
      name_placeholder: 'e.g. Drink 2L of water',
      desc_label: 'Description (optional)',
      desc_placeholder: 'e.g. Stay hydrated throughout the day',
      notify_label: 'Notification Time',
      color_label: 'Color',
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel',
      notify_prefix: 'Notify: ',
      delete_confirm: 'Are you sure? All related records will also be deleted.',
    },
    calendar: {
      title: 'Calendar',
      legend_full: 'All done',
      legend_partial: 'Partial',
      no_habits: 'No habits registered',
    },
    push: {
      title: 'Enable Notifications',
      desc: 'Get reminded at your habit times',
      allow: 'Allow',
    },
  },
}

export function getTranslation(language: Language, key: string): string {
  const parts = key.split('.')
  if (parts.length !== 2) return key
  const [section, field] = parts
  return translations[language]?.[section]?.[field] ?? key
}

export default translations
