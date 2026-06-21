'use strict';

const KairosI18n = {
  vi: {
    tagline: 'Phòng Chờ Người Lớn',
    live: 'TRỰC TIẾP', guide: 'Hướng dẫn', back: '‹ Quay lại',

    landingTitle: 'Trí tuệ vô đối. Phản xạ không khoan nhượng.',
    landingSub: 'Một drinking game điện ảnh cho TV + điện thoại. Một người trình chiếu, mọi người dùng điện thoại để chơi.',
    hostBtn: '🖥️ Trình chiếu trên màn hình này', hostBtnSub: 'Dùng cho TV / laptop ở giữa phòng',
    joinBtn: '📱 Tham gia bằng mã phòng', joinBtnSub: 'Dùng điện thoại của riêng bạn',

    codeLabel: 'Mã phòng', codePlaceholder: 'VD: K7P2X',
    nameLabel: 'Tên của bạn', namePlaceholder: 'Nhập tên…',
    drinkLabel: 'Chọn đồ uống', beer: 'Bia', spirits: 'Rượu mạnh', cocktail: 'Cocktail', perSip: '/ ngụm',
    sipCal: 'Dung tích ngụm đã hiệu chỉnh', sipFair: 'cân bằng để ai cũng uống công bằng',
    joinSubmit: 'Vào phòng', joinErrorNoRoom: 'Không tìm thấy phòng này. Kiểm tra lại mã.',
    joinErrorName: 'Nhập tên trước khi vào phòng.',

    scanTitle: 'Quét mã để vào', scanHi: 'Thánh Địa', scanSub: 'Bốn bộ óc bước vào. Phản xạ, logic và trí nhớ sẽ bị đo lường — và phải trả giá bằng rượu.',
    roomCodeLabel: 'Mã phòng', playersLabel: 'NGƯỜI CHƠI', waitingForHost: 'Chờ người tổ chức bắt đầu…',
    waitingTitle: 'Đã vào phòng', waitingSub: 'Hướng mắt lên màn hình lớn. Người tổ chức sẽ bắt đầu khi đủ người.',
    readyBtn: 'Tôi đã sẵn sàng', readyDone: '✓ Đã sẵn sàng', startGameBtn: 'Bắt đầu trò chơi ▶',
    needPlayers: 'Cần ít nhất 1 người chơi để bắt đầu.',

    dashNow: 'Sắp bắt đầu', dashArena: 'Đấu Trường', dashTrials: '3 THỬ THÁCH · 1 NGƯỜI SỐNG SÓT',
    dashEyes: 'Hướng mắt lên màn hình lớn', dashEyesSub: 'Điện thoại của bạn giờ là tay cầm im lặng. Giữ ngón tay ở đây — và nhìn lên TV.',
    dashNext: 'Vào vòng Synapse ▶',

    synLabel: 'Synapse · Phản Xạ',
    synArmBtn: 'Vào vòng', synArming: 'ĐANG NẠP…', synNextBtn: '↻ Vòng tiếp theo',
    synStandT: 'Chờ lệnh', synStandS: 'Người tổ chức sẽ vào vòng — nhìn lên TV.',
    synHoldT: 'CHỜ…', synHoldS: 'Đừng chạm cho tới khi màn hình đỏ',
    synStrikeT: 'CHẠM!', synStrikeS: 'chạm bất kỳ đâu — ngay bây giờ',
    synReactT: 'Phản xạ', synReactS: 'mili-giây',
    synFoulT: 'CHẠM SỚM', synFoulS: 'Phạt nửa ngụm — bằng một nửa mức phạt của người chậm nhất vòng này.',
    synFoulConfirm: 'Đã uống — tiếp tục',
    synTimeoutT: 'HẾT GIỜ', synTimeoutS: 'Bạn không chạm kịp trong 10 giây — tính như người chậm nhất, phạt đầy.',
    synHostRising: 'ÂM THANH ĐANG DÂNG', synHostWait: 'CHỜ MÀU ĐỎ XUẤT HIỆN…', synHostNow: 'ĐỎ RỒI — CHẠM NGAY',
    synHostLogged: 'ĐÃ GHI NHẬN PHẢN XẠ', synHostFoul: 'CÓ NGƯỜI CHẠM QUÁ SỚM', synHostTimeout: 'CÓ NGƯỜI KHÔNG CHẠM KỊP',
    synFeedTitle: 'Bảng phản xạ vòng này',

    vltTitle: 'Két Sắt · Câu Đố', vltPlaceBet: 'Đặt cược trước, rồi mở khóa dãy số.',
    vltLedger: 'Sổ Cái Chất Lỏng · Cược Ngụm', vltConfidence: 'Mức cược tự tin',
    vltAllIn: 'TẤT TAY', vltCrackBtn: '🔓 Mở khóa dãy số', vltNextBtn: 'Câu đố tiếp theo ▶',
    vltWonTitle: 'Giải xong!', vltWonSub: 'Chọn người để "bắn" số ngụm cược sang.',
    vltLostTitle: 'Bị khóa.', vltLostSub: 'Uống đúng số ngụm đã cược rồi chạm để tiếp tục.',
    vltDrankBtn: 'Đã uống — tiếp tục', vltSendSips: 'Gửi ngụm',
    vltRiding: 'ngụm đang đặt cược', vltAllinFull: 'cả ly đang đặt cược',

    parLabel: 'Paradox · Đừng tin thứ gì', parTrust: 'Đừng tin thứ gì',
    parMemorize: 'Ghi nhớ các thẻ…', parRecallTpl: 'Thẻ nào ghi chữ "{w}"?',
    parIdle: 'Năm tấm thẻ. Mỗi thẻ tự nói dối về chính nó.',
    parSubRecall1: 'Đã sai một lần — sai thêm là mất tín hiệu.', parSubRecall2: 'Màu sắc là lời nói dối. Chữ viết mới là sự thật.',
    parPhoneMem: 'Nhìn màn hình — thẻ sắp được lật.', parPhoneRecall: 'Vị trí nào giữ chữ "NÓNG"?', parPhoneIdle: 'Người tổ chức sẽ bắt đầu lượt lật thẻ.',
    parStartBtn: '▶ Lật các thẻ', parRevealBtn: 'Hỏi vị trí ▶', parNextBtn: 'Lượt tiếp theo ▶',
    blackoutTitle: 'MẤT TÍN HIỆU', blackoutSub: 'Chế độ Blackout. Uống 1 shot để khởi động lại liên kết thần kinh.', blackoutReset: 'Đã uống — KHỞI ĐỘNG LẠI',

    rptTitle: 'Báo Cáo Sau Cuộc Vui', rptSub: 'Hiệu năng não bộ · tài trợ bởi rượu gin',
    siliconTitle: 'Bộ Não Silicon', siliconSub: 'Phản xạ nhanh nhất, ít sai nhất trong đêm nay.',
    crashTitle: 'Lỗi Hệ Thống', crashSub: 'Nhiều shot phạt nhất, phản xạ chậm nhất trong đêm nay.',
    ledgerTitle: 'Sổ Cái Chất Lỏng', totalSips: 'Tổng số ngụm tối nay', playAgainBtn: 'Chơi lại ↺', noData: 'Chưa có đủ dữ liệu',

    twistTax: '🎲 Thuế Tập Thể! Mọi người uống nửa ngụm — không lý do.',
    twistPolarity: '🔄 Đảo Cực! Vòng Synapse này AI NHANH NHẤT sẽ bị phạt.',
    twistMole: '🕵️ Một kẻ nội gián đã len lỏi vào phòng…',
    twistInversion: '🌀 SỰ ĐẢO NGƯỢC CUỐI CÙNG! Sổ ngụm vừa bị lật ngược.',
    moleRevealToast: '🕵️ Bạn LÀ kẻ nội gián. Lần bị phạt tiếp theo, bạn có thể chuyển nó sang người khác.',
    moleShieldTitle: 'LÁ CHẮN NỘI GIÁN', moleShieldSub: 'Chọn 1 người để gánh ngụm phạt thay bạn:',
    twistTaxBtn: '🎲 Thuế tập thể', twistMoleBtn: '🕵️ Kẻ nội gián',
    invertNextOn: '🔄 Đảo cực: vòng tới (đã kích hoạt)', invertNextOff: '🔄 Đảo cực vòng tới',
    finalInversionBtn: '🌀 Kích hoạt Sự Đảo Ngược Cuối Cùng', finalInversionDone: '🌀 Đã đảo ngược',

    guideTitle: 'Cách chơi KAIROS', guideIntro: 'Một trò chơi uống rượu điện ảnh cho TV + điện thoại.',
    guideLockTitle: 'Trang hướng dẫn được bảo vệ', guideLockSub: 'Nhập mật khẩu để xem luật chơi. (Gợi ý: "admin")',
    guidePassPlaceholder: 'Mật khẩu', guideUnlockBtn: 'Mở khóa', guideWrong: 'Sai mật khẩu. Thử lại.',
    guideOnTV: '📺 Hướng dẫn đang hiển thị trên màn hình lớn',
    guideDevTV: 'MÀN HÌNH TV', guideDevTVd: 'Đặt ở giữa phòng. Hiển thị câu đố, hiệu ứng và bảng xếp hạng cho mọi người cùng xem.',
    guideDevPhone: 'ĐIỆN THOẠI', guideDevPhoned: 'Là tay cầm bảo mật riêng của bạn. Chạm, đặt cược — không cần nhìn, chỉ tập trung vào TV.',
    guideObjective: 'Mục tiêu', guideHow: 'Cách chơi', guidePenalty: 'Hình phạt',
    guideDrinkNote: 'Khi vào phòng, mỗi người chọn loại đồ uống. Hệ thống tự tính "dung tích một ngụm" để bia, rượu mạnh và cocktail đều công bằng như nhau.',

    gSynObj: 'Phản xạ nhanh nhất phòng.', gSynHow: 'Khi vòng tròn chuyển sang đỏ, chạm điện thoại nhanh nhất có thể.', gSynPen: 'Người chậm nhất hoặc chạm sớm: uống 1 shot.',
    gVltObj: 'Giải câu đố IQ và đặt cược thông minh.', gVltHow: 'Cược 1–3 ngụm (hoặc tất tay), rồi giải dãy số.', gVltPen: 'Thua thì uống đúng số ngụm đã cược.',
    gParObj: 'Vượt qua trí nhớ bị đánh lừa.', gParHow: 'Ghi nhớ vị trí thẻ rồi chọn đúng theo yêu cầu.', gParPen: 'Sai 2 lần liên tiếp: điện thoại "Blackout", uống 1 shot để reset.',

    toastJoined: 'đã vào phòng', toastConnLost: 'Mất kết nối — thử bấm lại.', toastConnOk: 'Đã kết nối',
    c_cold: 'LẠNH', c_hot: 'NÓNG', c_stop: 'DỪNG', c_go: 'ĐI', c_up: 'LÊN',

    navLounge: 'Sảnh Chờ', navDashboard: 'Đấu Trường', navSynapse: 'Synapse', navVault: 'Két Sắt', navParadox: 'Paradox', navReport: 'Tổng Kết',
  },

  en: {
    tagline: 'The Adult Lounge',
    live: 'LIVE', guide: 'Guide', back: '‹ Back',

    landingTitle: 'Unmatched Intellect. Unforgiving Reflexes.',
    landingSub: 'A cinematic drinking game for TV + phone. One screen hosts, everyone else plays from their own phone.',
    hostBtn: '🖥️ Host on this screen', hostBtnSub: 'For the TV / laptop in the middle of the room',
    joinBtn: '📱 Join with a room code', joinBtnSub: 'Use your own phone',

    codeLabel: 'Room code', codePlaceholder: 'e.g. K7P2X',
    nameLabel: 'Your name', namePlaceholder: 'Enter your name…',
    drinkLabel: "Tonight's poison", beer: 'Beer', spirits: 'Spirits', cocktail: 'Cocktail', perSip: '/ sip',
    sipCal: 'Calibrated sip volume', sipFair: 'balanced so every player drinks fair',
    joinSubmit: 'Enter room', joinErrorNoRoom: "Couldn't find that room. Check the code.",
    joinErrorName: 'Enter a name before joining.',

    scanTitle: 'Scan to enter the', scanHi: 'Sanctuary', scanSub: 'Four minds enter. Reflexes, logic and memory will be measured — and taxed in liquid.',
    roomCodeLabel: 'Room code', playersLabel: 'PLAYERS', waitingForHost: 'Waiting for the host to start…',
    waitingTitle: "You're in", waitingSub: 'Eyes on the big screen. The host will start once everyone is ready.',
    readyBtn: "I'm ready", readyDone: '✓ Ready', startGameBtn: 'Start the game ▶',
    needPlayers: 'Need at least 1 player to start.',

    dashNow: 'Now Entering', dashArena: 'The Arena', dashTrials: '3 TRIALS · 1 SURVIVOR',
    dashEyes: 'Eyes on the big screen', dashEyesSub: 'Your phone is now a silent controller. Keep your thumb here — look up.',
    dashNext: 'Enter Synapse ▶',

    synLabel: 'Synapse · Reflex',
    synArmBtn: 'Arm the round', synArming: 'ARMING…', synNextBtn: '↻ Next round',
    synStandT: 'Stand by', synStandS: 'The host will arm the round — watch the TV.',
    synHoldT: 'HOLD…', synHoldS: 'do not tap until crimson',
    synStrikeT: 'STRIKE', synStrikeS: 'tap anywhere — now',
    synReactT: 'Reaction', synReactS: 'milliseconds',
    synFoulT: 'FOUL START', synFoulS: 'Half-sip penalty — half of whatever the slowest tapper drinks this round.',
    synFoulConfirm: 'Drank it — continue',
    synTimeoutT: 'OUT OF TIME', synTimeoutS: 'You missed the 10-second window — counted as the slowest tapper, full penalty.',
    synHostRising: 'TONE RISING', synHostWait: 'WAIT FOR CRIMSON…', synHostNow: 'CRIMSON — STRIKE NOW',
    synHostLogged: 'REFLEX LOGGED', synHostFoul: 'SOMEONE JUMPED THE GUN', synHostTimeout: 'SOMEONE MISSED THE WINDOW',
    synFeedTitle: "This round's reflex board",

    vltTitle: 'The Vault · Puzzle', vltPlaceBet: 'Place your wager, then crack the sequence.',
    vltLedger: 'Liquid Ledger · Sip Wager', vltConfidence: 'Confidence wager',
    vltAllIn: 'ALL-IN', vltCrackBtn: '🔓 Crack the sequence', vltNextBtn: 'Next puzzle ▶',
    vltWonTitle: 'Solved!', vltWonSub: 'Pick someone to fling your sip wager onto.',
    vltLostTitle: 'Locked out.', vltLostSub: 'Drink exactly what you wagered, then tap to continue.',
    vltDrankBtn: 'Drank it — continue', vltSendSips: 'Send sips',
    vltRiding: 'riding on this', vltAllinFull: 'the whole glass on the line',

    parLabel: 'Paradox · Trust nothing', parTrust: 'Trust nothing',
    parMemorize: 'Memorise the cards…', parRecallTpl: 'Which card said "{w}"?',
    parIdle: 'Five cards. Each lies about itself.',
    parSubRecall1: 'One wrong already — one more and you black out.', parSubRecall2: 'The colour is the lie. The word is the truth.',
    parPhoneMem: 'Watch the screen — cards flipping soon.', parPhoneRecall: 'Which position held "HOT"?', parPhoneIdle: 'The host will start the reveal.',
    parStartBtn: '▶ Reveal the cards', parRevealBtn: 'Ask the room ▶', parNextBtn: 'Next round ▶',
    blackoutTitle: 'SIGNAL LOST', blackoutSub: 'Blackout Mode. Take 1 shot to reboot your neural link.', blackoutReset: 'Drank it — REBOOT',

    rptTitle: 'The Hangover Report', rptSub: 'Cognitive performance · brought to you by gin',
    siliconTitle: 'The Silicon Brain', siliconSub: 'Fastest reflexes, fewest mistakes tonight.',
    crashTitle: 'The System Crash', crashSub: 'Most penalty shots, slowest reflexes tonight.',
    ledgerTitle: 'Liquid Ledger', totalSips: 'Total sips tonight', playAgainBtn: 'Run it back ↺', noData: 'Not enough data yet',

    twistTax: '🎲 Group Tax! Everyone drinks half a sip — no reason given.',
    twistPolarity: '🔄 Polarity Reversal! Whoever is FASTEST this Synapse round gets penalized.',
    twistMole: '🕵️ A mole has slipped into the room…',
    twistInversion: '🌀 THE FINAL INVERSION! The sip ledger just flipped.',
    moleRevealToast: '🕵️ You ARE the mole. Your next penalty can be redirected to someone else.',
    moleShieldTitle: 'MOLE SHIELD', moleShieldSub: 'Pick someone to take this penalty instead of you:',
    twistTaxBtn: '🎲 Group tax', twistMoleBtn: '🕵️ The mole',
    invertNextOn: '🔄 Invert next round (armed)', invertNextOff: '🔄 Invert next round',
    finalInversionBtn: '🌀 Trigger the Final Inversion', finalInversionDone: '🌀 Inverted',

    guideTitle: 'How to play KAIROS', guideIntro: 'A cinematic drinking game for TV + phone.',
    guideLockTitle: 'This guide is protected', guideLockSub: 'Enter the password to view the rules. (Hint: "admin")',
    guidePassPlaceholder: 'Password', guideUnlockBtn: 'Unlock', guideWrong: 'Wrong password. Try again.',
    guideOnTV: '📺 The guide is showing on the big screen',
    guideDevTV: 'THE TV', guideDevTVd: 'Sits in the centre of the room. Shows puzzles, effects and the leaderboard for everyone.',
    guideDevPhone: 'YOUR PHONE', guideDevPhoned: 'Your own private controller. Tap, wager — no need to look, just watch the TV.',
    guideObjective: 'Objective', guideHow: 'How to play', guidePenalty: 'Penalty',
    guideDrinkNote: 'On joining, each player picks their drink. The system auto-calculates a "sip volume" so everyone drinks equally fair.',

    gSynObj: 'Have the fastest reflexes in the room.', gSynHow: 'When the ring turns crimson, tap your phone as fast as you can.', gSynPen: 'Slowest or early tapper: take 1 shot.',
    gVltObj: 'Solve the IQ puzzle and bet smart.', gVltHow: 'Wager 1–3 sips (or all-in), then solve the sequence.', gVltPen: 'Lose and drink exactly what you wagered.',
    gParObj: 'Beat your own tricked memory.', gParHow: 'Memorise card positions, then pick the one asked for.', gParPen: 'Two wrong in a row: phone goes Blackout, 1 shot to reset.',

    toastJoined: 'joined the room', toastConnLost: 'Connection lost — try that again.', toastConnOk: 'Connected',
    c_cold: 'COLD', c_hot: 'HOT', c_stop: 'STOP', c_go: 'GO', c_up: 'UP',

    navLounge: 'The Lounge', navDashboard: 'The Arena', navSynapse: 'Synapse', navVault: 'The Vault', navParadox: 'Paradox', navReport: 'Hangover',
  },
};

function kt(lang, key, vars) {
  const dict = KairosI18n[lang] || KairosI18n.vi;
  let s = dict[key] != null ? dict[key] : (KairosI18n.vi[key] || key);
  if (vars) Object.keys(vars).forEach(k => { s = s.replace('{' + k + '}', vars[k]); });
  return s;
}
