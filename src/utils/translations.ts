export type Language = 'en' | 'id' | 'zh' | 'ko' | 'ja' | 'he' | 'ar' | 'nl';

export interface Translations {
  // Common
  back: string;
  save: string;
  cancel: string;
  close: string;
  confirm: string;
  and: string;
  
  // Settings
  settings: string;
  settingsTitle: string;
  appearance: string;
  theme: string;
  lightMode: string;
  darkMode: string;
  language: string;
  selectLanguage: string;
  switchThemeDescription: string;
  
  // Profile
  profile: string;
  profilePicture: string;
  changePhoto: string;
  username: string;
  clickCameraToChange: string;
  
  // Wallet
  walletTitle: string;
  walletSubtitle: string;
  sacredAddress: string;
  copyAddress: string;
  copied: string;
  tokenEntrusted: string;
  refreshBalances: string;
  downloadTreasury: string;
  createWallet: string;
  creatingWallet: string;
  walletDescription: string;
  
  // Spiritual Note
  spiritualNoteRemember: string;
  spiritualNoteFaith: string;
  spiritualNoteLove: string;
  spiritualNoteJust: string;
  spiritualNoteStored: string;
  spiritualNoteHeaven: string;
  
  // Scripture
  scriptureMatthew: string;
  scriptureVerse19: string;
  scriptureVerse20: string;
  scriptureVerse21: string;
  
  // PFI Metrics
  pfiMetrics: string;
  pfiScore: string;
  pfiIndex: string;
  pfiShare: string;
  pfiPerformanceIndicator: string;
  pfiShareValue: string;
  refreshMetrics: string;
  
  // Chat
  chatTitle: string;
  selectRoom: string;
  typeMessage: string;
  send: string;
  online: string;
  offline: string;
  
  // Chat List Page
  helloUser: string;
  chooseChat: string;
  searchChats: string;
  loadingChats: string;
  noChatsFound: string;
  tryDifferentSearch: string;
  tapToOpen: string;
  
  // Room Names
  roomGeneral: string;
  roomStore: string;
  roomOrders: string;
  roomPayment: string;
  roomFriends: string;
  roomChurch: string;
  roomFamily: string;
  
  // Chat Page
  members: string;
  typing: string;
  sendMessage: string;
  noMessages: string;
  startConversation: string;
  messageDeleted: string;
  
  // Notifications
  walletCreated: string;
  walletCreationFailed: string;
  balanceRefreshFailed: string;
  addressCopied: string;
  copyFailed: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Common
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',
    and: 'and',
    
    // Settings
    settings: 'Settings',
    settingsTitle: 'Settings',
    appearance: 'Appearance',
    theme: 'Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    language: 'Language',
    selectLanguage: 'Select Language',
    switchThemeDescription: 'Switch between light and dark theme',
    
    // Profile
    profile: 'Profile',
    profilePicture: 'Profile Picture',
    changePhoto: 'Change Photo',
    username: 'Username',
    clickCameraToChange: 'Click camera icon to change photo',
    
    // Wallet
    walletTitle: 'Your Treasure (Heaven Network)',
    walletSubtitle: 'Heavenly Treasure Vault',
    sacredAddress: 'Sacred Address:',
    copyAddress: 'Copy',
    copied: 'Copied!',
    tokenEntrusted: 'Token Entrusted',
    refreshBalances: 'Refresh Balances',
    downloadTreasury: 'Download Treasury',
    createWallet: 'Create Heavenly Treasure Vault',
    creatingWallet: 'Creating Treasury...',
    walletDescription: 'Create a Heavenly Treasure Vault to hold your good works score all in one address.',
    
    // Spiritual Note
    spiritualNoteRemember: 'Remember:',
    spiritualNoteFaith: 'Light & Truth',
    spiritualNoteLove: 'Love & Mercy',
    spiritualNoteJust: 'Just & Peace',
    spiritualNoteStored: 'True wealth is not measured in tokens, but in faith of',
    spiritualNoteHeaven: 'stored in heaven',
    
    // Scripture
    scriptureMatthew: 'Matthew 6:19–21',
    scriptureVerse19: '"Do not store up for yourselves treasures on earth, where moths and vermin destroy, and where thieves break in and steal.',
    scriptureVerse20: 'But store up for yourselves treasures in heaven, where moths and vermin do not destroy, and where thieves do not break in and steal.',
    scriptureVerse21: 'For where your treasure is, there your heart will be also."',
    
    // PFI Metrics
    pfiMetrics: 'PFI Metrics',
    pfiScore: 'PFI Score',
    pfiIndex: 'PFI Index',
    pfiShare: 'PFI Share',
    pfiPerformanceIndicator: 'Performance indicator',
    pfiShareValue: 'Your share value',
    refreshMetrics: 'Refresh Metrics',
    
    // Chat
    chatTitle: 'XChat Lite',
    selectRoom: 'Select a room to start chatting',
    typeMessage: 'Type a message...',
    send: 'Send',
    online: 'Online',
    offline: 'Offline',
    
    // Chat List Page
    helloUser: 'Hello',
    chooseChat: 'Choose a chat to start',
    searchChats: 'Search chats...',
    loadingChats: 'Loading chats...',
    noChatsFound: 'No chats found',
    tryDifferentSearch: 'Try a different search',
    tapToOpen: 'Tap to open chat',
    
    // Room Names
    roomGeneral: 'General',
    roomStore: 'Store',
    roomOrders: 'Orders',
    roomPayment: 'Payment',
    roomFriends: 'Friends',
    roomChurch: 'Church',
    roomFamily: 'Family',
    
    // Chat Page
    members: 'members',
    typing: 'typing...',
    sendMessage: 'Send message...',
    noMessages: 'No messages yet',
    startConversation: 'Start the conversation',
    messageDeleted: 'This message was deleted',
    
    // Notifications
    walletCreated: 'Wallet Created Successfully!',
    walletCreationFailed: 'Failed to create wallet. Please try again.',
    balanceRefreshFailed: 'Failed to refresh balances. Please try again.',
    addressCopied: 'Address copied to clipboard!',
    copyFailed: 'Failed to copy address to clipboard',
  },
  
  id: {
    // Common
    back: 'Kembali',
    save: 'Simpan',
    cancel: 'Batal',
    close: 'Tutup',
    confirm: 'Konfirmasi',
    and: 'dan',
    
    // Settings
    settings: 'Pengaturan',
    settingsTitle: 'Pengaturan',
    appearance: 'Tampilan',
    theme: 'Tema',
    lightMode: 'Mode Terang',
    darkMode: 'Mode Gelap',
    language: 'Bahasa',
    selectLanguage: 'Pilih Bahasa',
    switchThemeDescription: 'Beralih antara tema terang dan gelap',
    
    // Profile
    profile: 'Profil',
    profilePicture: 'Foto Profil',
    changePhoto: 'Ubah Foto',
    username: 'Nama Pengguna',
    clickCameraToChange: 'Klik ikon kamera untuk mengubah foto',
    
    // Wallet
    walletTitle: 'Harta Anda (Jaringan Surga)',
    walletSubtitle: 'Brankas Harta Surgawi',
    sacredAddress: 'Alamat Suci:',
    copyAddress: 'Salin',
    copied: 'Tersalin!',
    tokenEntrusted: 'Token Dipercayakan',
    refreshBalances: 'Perbarui Saldo',
    downloadTreasury: 'Unduh Perbendaharaan',
    createWallet: 'Buat Brankas Harta Surgawi',
    creatingWallet: 'Membuat Perbendaharaan...',
    walletDescription: 'Buat Brankas Harta Surgawi untuk menyimpan skor amal baik Anda dalam satu alamat.',
    
    // Spiritual Note
    spiritualNoteRemember: 'Ingat:',
    spiritualNoteFaith: 'Terang & Kebenaran',
    spiritualNoteLove: 'Kasih & Rahmat',
    spiritualNoteJust: 'Adil & Damai',
    spiritualNoteStored: 'Kekayaan sejati tidak diukur dalam token, tetapi dalam iman',
    spiritualNoteHeaven: 'tersimpan di surga',
    
    // Scripture
    scriptureMatthew: 'Matius 6:19–21',
    scriptureVerse19: '"Jangan kamu mengumpulkan harta di bumi; di bumi ngengat dan karat merusakkannya dan pencuri membongkar serta mencurinya.',
    scriptureVerse20: 'Tetapi kumpulkanlah bagimu harta di sorga; di sorga ngengat dan karat tidak merusakkannya dan pencuri tidak membongkar serta mencurinya.',
    scriptureVerse21: 'Karena di mana hartamu berada, di situ juga hatimu berada."',
    
    // PFI Metrics
    pfiMetrics: 'Metrik PFI',
    pfiScore: 'Skor PFI',
    pfiIndex: 'Indeks PFI',
    pfiShare: 'Bagian PFI',
    pfiPerformanceIndicator: 'Indikator kinerja',
    pfiShareValue: 'Nilai bagian Anda',
    refreshMetrics: 'Perbarui Metrik',
    
    // Chat
    chatTitle: 'XChat Lite',
    selectRoom: 'Pilih ruangan untuk mulai mengobrol',
    typeMessage: 'Ketik pesan...',
    send: 'Kirim',
    online: 'Daring',
    offline: 'Luring',
    
    // Chat List Page
    helloUser: 'Halo',
    chooseChat: 'Pilih obrolan untuk memulai',
    searchChats: 'Cari obrolan...',
    loadingChats: 'Memuat obrolan...',
    noChatsFound: 'Tidak ada obrolan ditemukan',
    tryDifferentSearch: 'Coba pencarian lain',
    tapToOpen: 'Ketuk untuk membuka obrolan',
    
    // Room Names
    roomGeneral: 'Umum',
    roomStore: 'Toko',
    roomOrders: 'Pesanan',
    roomPayment: 'Pembayaran',
    roomFriends: 'Teman',
    roomChurch: 'Gereja',
    roomFamily: 'Keluarga',
    
    // Chat Page
    members: 'anggota',
    typing: 'mengetik...',
    sendMessage: 'Kirim pesan...',
    noMessages: 'Belum ada pesan',
    startConversation: 'Mulai percakapan',
    messageDeleted: 'Pesan ini telah dihapus',
    
    // Notifications
    walletCreated: 'Dompet Berhasil Dibuat!',
    walletCreationFailed: 'Gagal membuat dompet. Silakan coba lagi.',
    balanceRefreshFailed: 'Gagal memperbarui saldo. Silakan coba lagi.',
    addressCopied: 'Alamat disalin ke clipboard!',
    copyFailed: 'Gagal menyalin alamat ke clipboard',
  },
  
  zh: {
    // Common
    back: '返回',
    save: '保存',
    cancel: '取消',
    close: '关闭',
    confirm: '确认',
    and: '和',
    
    // Settings
    settings: '设置',
    settingsTitle: '设置',
    appearance: '外观',
    theme: '主题',
    lightMode: '亮色模式',
    darkMode: '暗色模式',
    language: '语言',
    selectLanguage: '选择语言',
    switchThemeDescription: '在亮色和暗色主题之间切换',
    
    // Profile
    profile: '个人资料',
    profilePicture: '头像',
    changePhoto: '更换照片',
    username: '用户名',
    clickCameraToChange: '点击相机图标更换照片',
    
    // Wallet
    walletTitle: '您的财宝（天国网络）',
    walletSubtitle: '天国财宝库',
    sacredAddress: '神圣地址：',
    copyAddress: '复制',
    copied: '已复制！',
    tokenEntrusted: '托管代币',
    refreshBalances: '刷新余额',
    downloadTreasury: '下载财库',
    createWallet: '创建天国财宝库',
    creatingWallet: '正在创建财库...',
    walletDescription: '创建天国财宝库，在一个地址中保存您的善行积分。',
    
    // Spiritual Note
    spiritualNoteRemember: '记住：',
    spiritualNoteFaith: '光明与真理',
    spiritualNoteLove: '爱与怜悯',
    spiritualNoteJust: '公义与和平',
    spiritualNoteStored: '真正的财富不是用代币衡量，而是用信仰',
    spiritualNoteHeaven: '存于天国',
    
    // Scripture
    scriptureMatthew: '马太福音 6:19–21',
    scriptureVerse19: '"不要为自己积攒财宝在地上，地上有虫子咬，能锈坏，也有贼挖窟窿来偷。',
    scriptureVerse20: '只要积攒财宝在天上，天上没有虫子咬，不能锈坏，也没有贼挖窟窿来偷。',
    scriptureVerse21: '因为你的财宝在哪里，你的心也在那里。"',
    
    // PFI Metrics
    pfiMetrics: 'PFI指标',
    pfiScore: 'PFI评分',
    pfiIndex: 'PFI指数',
    pfiShare: 'PFI份额',
    pfiPerformanceIndicator: '绩效指标',
    pfiShareValue: '您的份额价值',
    refreshMetrics: '刷新指标',
    
    // Chat
    chatTitle: 'XChat Lite',
    selectRoom: '选择房间开始聊天',
    typeMessage: '输入消息...',
    send: '发送',
    online: '在线',
    offline: '离线',
    
    // Chat List Page
    helloUser: '你好',
    chooseChat: '选择聊天开始',
    searchChats: '搜索聊天...',
    loadingChats: '正在加载聊天...',
    noChatsFound: '未找到聊天',
    tryDifferentSearch: '尝试其他搜索',
    tapToOpen: '点击打开聊天',
    
    // Room Names
    roomGeneral: '综合',
    roomStore: '商店',
    roomOrders: '订单',
    roomPayment: '支付',
    roomFriends: '朋友',
    roomChurch: '教会',
    roomFamily: '家庭',
    
    // Chat Page
    members: '成员',
    typing: '正在输入...',
    sendMessage: '发送消息...',
    noMessages: '暂无消息',
    startConversation: '开始对话',
    messageDeleted: '此消息已删除',
    
    // Notifications
    walletCreated: '钱包创建成功！',
    walletCreationFailed: '创建钱包失败。请重试。',
    balanceRefreshFailed: '刷新余额失败。请重试。',
    addressCopied: '地址已复制到剪贴板！',
    copyFailed: '无法复制地址到剪贴板',
  },
  
  ko: {
    // Common
    back: '뒤로',
    save: '저장',
    cancel: '취소',
    close: '닫기',
    confirm: '확인',
    and: '그리고',
    
    // Settings
    settings: '설정',
    settingsTitle: '설정',
    appearance: '외관',
    theme: '테마',
    lightMode: '라이트 모드',
    darkMode: '다크 모드',
    language: '언어',
    selectLanguage: '언어 선택',
    switchThemeDescription: '라이트 및 다크 테마 간 전환',
    
    // Profile
    profile: '프로필',
    profilePicture: '프로필 사진',
    changePhoto: '사진 변경',
    username: '사용자 이름',
    clickCameraToChange: '카메라 아이콘을 클릭하여 사진을 변경하세요',
    
    // Wallet
    walletTitle: '당신의 보물 (천국 네트워크)',
    walletSubtitle: '천국 보물 금고',
    sacredAddress: '신성한 주소:',
    copyAddress: '복사',
    copied: '복사됨!',
    tokenEntrusted: '위탁된 토큰',
    refreshBalances: '잔액 새로고침',
    downloadTreasury: '보물 다운로드',
    createWallet: '천국 보물 금고 만들기',
    creatingWallet: '금고 생성 중...',
    walletDescription: '하나의 주소에 선행 점수를 보관할 천국 보물 금고를 만드세요.',
    
    // Spiritual Note
    spiritualNoteRemember: '기억하세요:',
    spiritualNoteFaith: '빛과 진리',
    spiritualNoteLove: '사랑과 자비',
    spiritualNoteJust: '정의와 평화',
    spiritualNoteStored: '진정한 부는 토큰으로 측정되는 것이 아니라 믿음으로',
    spiritualNoteHeaven: '천국에 저장됨',
    
    // Scripture
    scriptureMatthew: '마태복음 6:19–21',
    scriptureVerse19: '"너희를 위하여 보물을 땅에 쌓아 두지 말라 거기는 좀과 동록이 해하며 도둑이 구멍을 뚫고 도둑질하느니라',
    scriptureVerse20: '오직 너희를 위하여 보물을 하늘에 쌓아 두라 거기는 좀이나 동록이 해하지 못하며 도둑이 구멍을 뚫지도 못하고 도둑질도 못하느니라',
    scriptureVerse21: '네 보물 있는 그곳에는 네 마음도 있느니라"',
    
    // PFI Metrics
    pfiMetrics: 'PFI 지표',
    pfiScore: 'PFI 점수',
    pfiIndex: 'PFI 인덱스',
    pfiShare: 'PFI 몫',
    pfiPerformanceIndicator: '성과 지표',
    pfiShareValue: '귀하의 몫 가치',
    refreshMetrics: '지표 새로고침',
    
    // Chat
    chatTitle: 'XChat Lite',
    selectRoom: '대화를 시작할 방을 선택하세요',
    typeMessage: '메시지 입력...',
    send: '전송',
    online: '온라인',
    offline: '오프라인',
    
    // Chat List Page
    helloUser: '안녕하세요',
    chooseChat: '대화를 시작할 채팅을 선택하세요',
    searchChats: '채팅 검색...',
    loadingChats: '채팅 로딩 중...',
    noChatsFound: '채팅을 찾을 수 없습니다',
    tryDifferentSearch: '다른 검색어를 시도하세요',
    tapToOpen: '탭하여 채팅 열기',
    
    // Room Names
    roomGeneral: '일반',
    roomStore: '상점',
    roomOrders: '주문',
    roomPayment: '결제',
    roomFriends: '친구',
    roomChurch: '교회',
    roomFamily: '가족',
    
    // Chat Page
    members: '멤버',
    typing: '입력 중...',
    sendMessage: '메시지 보내기',
    noMessages: '아직 메시지가 없습니다',
    startConversation: '대화를 시작하세요!',
    messageDeleted: '메시지가 삭제되었습니다',
    
    // Notifications
    walletCreated: '지갑이 성공적으로 생성되었습니다!',
    walletCreationFailed: '지갑 생성에 실패했습니다. 다시 시도해주세요.',
    balanceRefreshFailed: '잔액 새로고침에 실패했습니다. 다시 시도해주세요.',
    addressCopied: '주소가 클립보드에 복사되었습니다!',
    copyFailed: '주소 복사에 실패했습니다',
  },
  
  ja: {
    // Common
    back: '戻る',
    save: '保存',
    cancel: 'キャンセル',
    close: '閉じる',
    confirm: '確認',
    and: 'と',
    
    // Settings
    settings: '設定',
    settingsTitle: '設定',
    appearance: '外観',
    theme: 'テーマ',
    lightMode: 'ライトモード',
    darkMode: 'ダークモード',
    language: '言語',
    selectLanguage: '言語を選択',
    switchThemeDescription: 'ライトテーマとダークテーマを切り替え',
    
    // Profile
    profile: 'プロフィール',
    profilePicture: 'プロフィール写真',
    changePhoto: '写真を変更',
    username: 'ユーザー名',
    clickCameraToChange: 'カメラアイコンをクリックして写真を変更',
    
    // Wallet
    walletTitle: 'あなたの宝（天国ネットワーク）',
    walletSubtitle: '天国の宝庫',
    sacredAddress: '神聖なアドレス：',
    copyAddress: 'コピー',
    copied: 'コピーしました！',
    tokenEntrusted: '委託されたトークン',
    refreshBalances: '残高を更新',
    downloadTreasury: '宝庫をダウンロード',
    createWallet: '天国の宝庫を作成',
    creatingWallet: '宝庫を作成中...',
    walletDescription: '善行スコアを一つのアドレスに保管する天国の宝庫を作成しましょう。',
    
    // Spiritual Note
    spiritualNoteRemember: '覚えておいてください：',
    spiritualNoteFaith: '光と真理',
    spiritualNoteLove: '愛と慈悲',
    spiritualNoteJust: '正義と平和',
    spiritualNoteStored: '真の富はトークンで測られるものではなく、信仰で',
    spiritualNoteHeaven: '天に蓄えられる',
    
    // Scripture
    scriptureMatthew: 'マタイによる福音書 6:19–21',
    scriptureVerse19: '「あなたがたは地上に富を積んではならない。そこでは、虫が食ったり、さび付いたりするし、また、盗人が忍び込んで盗み出したりする。',
    scriptureVerse20: 'むしろ、自分のために、天に富を積みなさい。そこでは、虫が食うことも、さび付くこともなく、また、盗人が忍び込むことも盗み出すこともない。',
    scriptureVerse21: 'あなたの富のあるところに、あなたの心もあるのだ。」',
    
    // PFI Metrics
    pfiMetrics: 'PFI指標',
    pfiScore: 'PFIスコア',
    pfiIndex: 'PFI指数',
    pfiShare: 'PFIシェア',
    pfiPerformanceIndicator: 'パフォーマンス指標',
    pfiShareValue: 'あなたのシェア価値',
    refreshMetrics: '指標を更新',
    
    // Chat
    chatTitle: 'XChat Lite',
    selectRoom: 'チャットを開始するルームを選択',
    typeMessage: 'メッセージを入力...',
    send: '送信',
    online: 'オンライン',
    offline: 'オフライン',
    
    // Chat List Page
    helloUser: 'こんにちは',
    chooseChat: 'チャットを選択して開始',
    searchChats: 'チャット検索...',
    loadingChats: 'チャットを読み込み中...',
    noChatsFound: 'チャットが見つかりません',
    tryDifferentSearch: '別の検索を試してください',
    tapToOpen: 'タップしてチャットを開く',
    
    // Room Names
    roomGeneral: '一般',
    roomStore: 'ストア',
    roomOrders: '注文',
    roomPayment: '支払い',
    roomFriends: '友達',
    roomChurch: '教会',
    roomFamily: '家族',
    
    // Chat Page
    members: 'メンバー',
    typing: '入力中...',
    sendMessage: 'メッセージを送信',
    noMessages: 'まだメッセージがありません',
    startConversation: '会話を始めましょう！',
    messageDeleted: 'メッセージが削除されました',
    
    // Notifications
    walletCreated: 'ウォレットが正常に作成されました！',
    walletCreationFailed: 'ウォレットの作成に失敗しました。もう一度お試しください。',
    balanceRefreshFailed: '残高の更新に失敗しました。もう一度お試しください。',
    addressCopied: 'アドレスがクリップボードにコピーされました！',
    copyFailed: 'アドレスのコピーに失敗しました',
  },
  
  he: {
    // Common
    back: 'חזרה',
    save: 'שמור',
    cancel: 'ביטול',
    close: 'סגור',
    confirm: 'אישור',
    and: 'ו',
    
    // Settings
    settings: 'הגדרות',
    settingsTitle: 'הגדרות',
    appearance: 'מראה',
    theme: 'ערכת נושא',
    lightMode: 'מצב בהיר',
    darkMode: 'מצב כהה',
    language: 'שפה',
    selectLanguage: 'בחר שפה',
    switchThemeDescription: 'מעבר בין ערכת נושא בהירה לכהה',
    
    // Profile
    profile: 'פרופיל',
    profilePicture: 'תמונת פרופיל',
    changePhoto: 'שנה תמונה',
    username: 'שם משתמש',
    clickCameraToChange: 'לחץ על סמל המצלמה כדי לשנות תמונה',
    
    // Wallet
    walletTitle: 'האוצר שלך (רשת שמים)',
    walletSubtitle: 'כספת אוצרות שמימיים',
    sacredAddress: 'כתובת קדושה:',
    copyAddress: 'העתק',
    copied: 'הועתק!',
    tokenEntrusted: 'אסימונים מופקדים',
    refreshBalances: 'רענן יתרות',
    downloadTreasury: 'הורד אוצר',
    createWallet: 'צור כספת אוצרות שמימיים',
    creatingWallet: 'יוצר אוצר...',
    walletDescription: 'צור כספת אוצרות שמימיים לשמור את ציון המעשים הטובים שלך בכתובת אחת.',
    
    // Spiritual Note
    spiritualNoteRemember: 'זכור:',
    spiritualNoteFaith: 'אור ואמת',
    spiritualNoteLove: 'אהבה ורחמים',
    spiritualNoteJust: 'צדק ושלום',
    spiritualNoteStored: 'עושר אמיתי אינו נמדד באסימונים, אלא באמונה',
    spiritualNoteHeaven: 'מאוחסן בשמיים',
    
    // Scripture
    scriptureMatthew: 'מתי ו:יט–כא',
    scriptureVerse19: '"אַל תַּצְבְּרוּ לָכֶם אוֹצָרוֹת בָּאָרֶץ, שֶׁבָּהּ הָעָשׁ וְהַחֲלוּדָה מְאַבְּדִים, וְגַנָּבִים פּוֹרְצִים וְגוֹנְבִים.',
    scriptureVerse20: 'אֶלָּא צִבְרוּ לָכֶם אוֹצָרוֹת בַּשָּׁמַיִם, שֶׁבָּהֶם עָשׁ וַחֲלוּדָה אֵינָם מְאַבְּדִים, וְגַנָּבִים אֵינָם פּוֹרְצִים וְגוֹנְבִים.',
    scriptureVerse21: 'כִּי בַּמָּקוֹם שֶׁבּוֹ אוֹצָרְךָ, שָׁם יִהְיֶה גַּם לִבֶּךָ."',
    
    // PFI Metrics
    pfiMetrics: 'מדדי PFI',
    pfiScore: 'ציון PFI',
    pfiIndex: 'מדד PFI',
    pfiShare: 'חלק PFI',
    pfiPerformanceIndicator: 'מחוון ביצועים',
    pfiShareValue: 'ערך החלק שלך',
    refreshMetrics: 'רענן מדדים',
    
    // Chat
    chatTitle: 'XChat Lite',
    selectRoom: 'בחר חדר להתחיל לשוחח',
    typeMessage: 'הקלד הודעה...',
    send: 'שלח',
    online: 'מחובר',
    offline: 'לא מחובר',
    
    // Chat List Page
    helloUser: 'שלום',
    chooseChat: 'בחר צ׳אט להתחיל',
    searchChats: 'חפש צ׳אטים...',
    loadingChats: 'טוען צ׳אטים...',
    noChatsFound: 'לא נמצאו צ׳אטים',
    tryDifferentSearch: 'נסה חיפוש אחר',
    tapToOpen: 'הקש לפתיחת הצ׳אט',
    
    // Room Names
    roomGeneral: 'כללי',
    roomStore: 'חנות',
    roomOrders: 'הזמנות',
    roomPayment: 'תשלום',
    roomFriends: 'חברים',
    roomChurch: 'כנסייה',
    roomFamily: 'משפחה',
    
    // Chat Page
    members: 'חברים',
    typing: 'מקליד...',
    sendMessage: 'שלח הודעה...',
    noMessages: 'אין הודעות עדיין',
    startConversation: 'התחל שיחה',
    messageDeleted: 'הודעה זו נמחקה',
    
    // Notifications
    walletCreated: 'הארנק נוצר בהצלחה!',
    walletCreationFailed: 'יצירת הארנק נכשלה. נסה שוב.',
    balanceRefreshFailed: 'רענון היתרות נכשל. נסה שוב.',
    addressCopied: 'הכתובת הועתקה ללוח!',
    copyFailed: 'העתקת הכתובת נכשלה',
  },
  
  ar: {
    // Common
    back: 'رجوع',
    save: 'حفظ',
    cancel: 'إلغاء',
    close: 'إغلاق',
    confirm: 'تأكيد',
    and: 'و',
    
    // Settings
    settings: 'الإعدادات',
    settingsTitle: 'الإعدادات',
    appearance: 'المظهر',
    theme: 'السمة',
    lightMode: 'الوضع الفاتح',
    darkMode: 'الوضع الداكن',
    language: 'اللغة',
    selectLanguage: 'اختر اللغة',
    switchThemeDescription: 'التبديل بين السمة الفاتحة والداكنة',
    
    // Profile
    profile: 'الملف الشخصي',
    profilePicture: 'صورة الملف الشخصي',
    changePhoto: 'تغيير الصورة',
    username: 'اسم المستخدم',
    clickCameraToChange: 'انقر على رمز الكاميرا لتغيير الصورة',
    
    // Wallet
    walletTitle: 'كنزك (شبكة السماء)',
    walletSubtitle: 'خزانة الكنوز السماوية',
    sacredAddress: 'العنوان المقدس:',
    copyAddress: 'نسخ',
    copied: 'تم النسخ!',
    tokenEntrusted: 'الرموز المودعة',
    refreshBalances: 'تحديث الأرصدة',
    downloadTreasury: 'تحميل الخزانة',
    createWallet: 'إنشاء خزانة الكنوز السماوية',
    creatingWallet: 'جارٍ إنشاء الخزانة...',
    walletDescription: 'أنشئ خزانة كنوز سماوية لحفظ نقاط أعمالك الصالحة في عنوان واحد.',
    
    // Spiritual Note
    spiritualNoteRemember: 'تذكر:',
    spiritualNoteFaith: 'النور والحق',
    spiritualNoteLove: 'الحب والرحمة',
    spiritualNoteJust: 'العدل والسلام',
    spiritualNoteStored: 'الثروة الحقيقية لا تُقاس بالرموز، بل بالإيمان',
    spiritualNoteHeaven: 'مخزنة في السماء',
    
    // Scripture
    scriptureMatthew: 'متى ٦:١٩-٢١',
    scriptureVerse19: '"لا تَكْنِزُوا لَكُمْ كُنُوزًا عَلَى الأَرْضِ حَيْثُ يُفْسِدُ السُّوسُ وَالصَّدَأُ، وَحَيْثُ يَنْقُبُ السَّارِقُونَ وَيَسْرِقُونَ.',
    scriptureVerse20: 'بَلِ اكْنِزُوا لَكُمْ كُنُوزًا فِي السَّمَاءِ، حَيْثُ لا يُفْسِدُ سُوسٌ وَلا صَدَأٌ، وَحَيْثُ لا يَنْقُبُ سَارِقُونَ وَلا يَسْرِقُونَ،',
    scriptureVerse21: 'لأَنَّهُ حَيْثُ يَكُونُ كَنْزُكَ هُنَاكَ يَكُونُ قَلْبُكَ أَيْضًا."',
    
    // PFI Metrics
    pfiMetrics: 'مقاييس PFI',
    pfiScore: 'نقاط PFI',
    pfiIndex: 'مؤشر PFI',
    pfiShare: 'حصة PFI',
    pfiPerformanceIndicator: 'مؤشر الأداء',
    pfiShareValue: 'قيمة حصتك',
    refreshMetrics: 'تحديث المقاييس',
    
    // Chat
    chatTitle: 'XChat Lite',
    selectRoom: 'اختر غرفة لبدء المحادثة',
    typeMessage: 'اكتب رسالة...',
    send: 'إرسال',
    online: 'متصل',
    offline: 'غير متصل',
    
    // Chat List Page
    helloUser: 'مرحبا',
    chooseChat: 'اختر محادثة للبدء',
    searchChats: 'ابحث عن محادثات...',
    loadingChats: 'جارٍ تحميل المحادثات...',
    noChatsFound: 'لم يتم العثور على محادثات',
    tryDifferentSearch: 'جرب بحثًا مختلفًا',
    tapToOpen: 'اضغط لفتح المحادثة',
    
    // Room Names
    roomGeneral: 'عام',
    roomStore: 'متجر',
    roomOrders: 'الطلبات',
    roomPayment: 'الدفع',
    roomFriends: 'الأصدقاء',
    roomChurch: 'الكنيسة',
    roomFamily: 'العائلة',
    
    // Chat Page
    members: 'الأعضاء',
    typing: 'يكتب...',
    sendMessage: 'إرسال رسالة...',
    noMessages: 'لا توجد رسائل بعد',
    startConversation: 'ابدأ المحادثة',
    messageDeleted: 'تم حذف هذه الرسالة',
    
    // Notifications
    walletCreated: 'تم إنشاء المحفظة بنجاح!',
    walletCreationFailed: 'فشل إنشاء المحفظة. حاول مرة أخرى.',
    balanceRefreshFailed: 'فشل تحديث الأرصدة. حاول مرة أخرى.',
    addressCopied: 'تم نسخ العنوان إلى الحافظة!',
    copyFailed: 'فشل نسخ العنوان إلى الحافظة',
  },
  
  nl: {
    // Common
    back: 'Terug',
    save: 'Opslaan',
    cancel: 'Annuleren',
    close: 'Sluiten',
    confirm: 'Bevestigen',
    and: 'en',
    
    // Settings
    settings: 'Instellingen',
    settingsTitle: 'Instellingen',
    appearance: 'Uiterlijk',
    theme: 'Thema',
    lightMode: 'Lichte Modus',
    darkMode: 'Donkere Modus',
    language: 'Taal',
    selectLanguage: 'Selecteer Taal',
    switchThemeDescription: 'Schakel tussen licht en donker thema',
    
    // Profile
    profile: 'Profiel',
    profilePicture: 'Profielfoto',
    changePhoto: 'Foto Wijzigen',
    username: 'Gebruikersnaam',
    clickCameraToChange: 'Klik op het camerapictogram om de foto te wijzigen',
    
    // Wallet
    walletTitle: 'Uw Schat (Hemel Netwerk)',
    walletSubtitle: 'Hemelse Schatkist',
    sacredAddress: 'Heilig Adres:',
    copyAddress: 'Kopiëren',
    copied: 'Gekopieerd!',
    tokenEntrusted: 'Toevertrouwde Tokens',
    refreshBalances: 'Saldi Vernieuwen',
    downloadTreasury: 'Schatkist Downloaden',
    createWallet: 'Hemelse Schatkist Aanmaken',
    creatingWallet: 'Schatkist Aanmaken...',
    walletDescription: 'Maak een Hemelse Schatkist om uw goede werken score op één adres te bewaren.',
    
    // Spiritual Note
    spiritualNoteRemember: 'Onthoud:',
    spiritualNoteFaith: 'Licht & Waarheid',
    spiritualNoteLove: 'Liefde & Genade',
    spiritualNoteJust: 'Rechtvaardig & Vrede',
    spiritualNoteStored: 'Ware rijkdom wordt niet gemeten in tokens, maar in geloof van',
    spiritualNoteHeaven: 'opgeslagen in de hemel',
    
    // Scripture
    scriptureMatthew: 'Mattheüs 6:19–21',
    scriptureVerse19: '"Verzamel geen schatten op aarde, waar mot en roest ze vernielen en waar dieven inbreken en stelen.',
    scriptureVerse20: 'Maar verzamel schatten in de hemel, waar geen mot of roest ze kan vernielen en waar geen dieven inbreken of stelen.',
    scriptureVerse21: 'Want waar je schat is, daar is ook je hart."',
    
    // PFI Metrics
    pfiMetrics: 'PFI Statistieken',
    pfiScore: 'PFI Score',
    pfiIndex: 'PFI Index',
    pfiShare: 'PFI Aandeel',
    pfiPerformanceIndicator: 'Prestatie-indicator',
    pfiShareValue: 'Uw aandeelwaarde',
    refreshMetrics: 'Statistieken Vernieuwen',
    
    // Chat
    chatTitle: 'XChat Lite',
    selectRoom: 'Selecteer een kamer om te chatten',
    typeMessage: 'Typ een bericht...',
    send: 'Verzenden',
    online: 'Online',
    offline: 'Offline',
    
    // Chat List Page
    helloUser: 'Hallo',
    chooseChat: 'Kies een chat om te beginnen',
    searchChats: 'Chats zoeken...',
    loadingChats: 'Chats laden...',
    noChatsFound: 'Geen chats gevonden',
    tryDifferentSearch: 'Probeer een andere zoekopdracht',
    tapToOpen: 'Tik om chat te openen',
    
    // Room Names
    roomGeneral: 'Algemeen',
    roomStore: 'Winkel',
    roomOrders: 'Bestellingen',
    roomPayment: 'Betaling',
    roomFriends: 'Vrienden',
    roomChurch: 'Kerk',
    roomFamily: 'Familie',
    
    // Chat Page
    members: 'leden',
    typing: 'aan het typen...',
    sendMessage: 'Bericht verzenden',
    noMessages: 'Nog geen berichten',
    startConversation: 'Start het gesprek!',
    messageDeleted: 'Bericht verwijderd',
    
    // Notifications
    walletCreated: 'Portemonnee Succesvol Aangemaakt!',
    walletCreationFailed: 'Aanmaken portemonnee mislukt. Probeer opnieuw.',
    balanceRefreshFailed: 'Vernieuwen saldi mislukt. Probeer opnieuw.',
    addressCopied: 'Adres gekopieerd naar klembord!',
    copyFailed: 'Kopiëren van adres naar klembord mislukt',
  },
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  id: 'Bahasa Indonesia',
  zh: '中文',
  ko: '한국어',
  ja: '日本語',
  he: 'עברית',
  ar: 'العربية',
  nl: 'Nederlands',
};

export const isRTL = (lang: Language): boolean => {
  return lang === 'he' || lang === 'ar';
};
