# KAIROS — Hướng Dẫn Tổ Chức Chi Tiết (dành cho Quản Trò)

Tài liệu này dành cho người sẽ **cầm trịch** buổi chơi (mở app trên TV/laptop và bấm các nút điều khiển). Đọc trước khi vào buổi chơi — đừng chiếu tài liệu này lên màn hình lớn, vì phần "khi nào tung plot twist" là bí mật của quản trò, lộ ra sẽ mất bất ngờ.

---

## 1. Tổng quan trong 30 giây

- KAIROS cần **1 màn hình chung** (TV, laptop, hoặc máy tính bảng đặt giữa phòng) và **mỗi người chơi 1 điện thoại riêng**.
- Người mở màn hình chung bấm "Trình chiếu trên màn hình này" → trở thành **quản trò (host)**. Quản trò không tự chơi các vòng đấu, mà điều khiển nhịp độ: bấm nút bắt đầu vòng, chuyển cảnh, và tung plot twist.
- Mọi người khác quét QR hoặc nhập mã phòng trên điện thoại → trở thành **người chơi**. Họ không cần nhìn điện thoại liên tục, vì luật chơi và hiệu ứng chính đều hiện trên màn hình chung.
- Quản trò *có thể* vừa host vừa chơi, bằng cách mở thêm 1 tab/thiết bị khác và vào phòng như người chơi bình thường.

## 2. Số lượng người tham gia

- **Tối thiểu: 2 người.** Chơi được, nhưng vài plot twist (đặc biệt "Kẻ Nội Gián" và "Song Đấu" kiểu 1-1) sẽ kém vui vì không có ai để đổ phạt sang.
- **Lý tưởng: 4–8 người.** Đủ đông để bảng phản xạ Synapse có cảm giác thi đấu, đủ ít để quản trò gọi tên từng người mà không bị rối.
- **Trên 8–10 người:** vẫn chơi được, nhưng vòng Synapse/Paradox sẽ có nhiều dòng kết quả hơn, quản trò nên đợi lâu hơn một chút trước khi bấm "Vòng tiếp theo" để ai cũng kịp bấm.
- Mỗi người tham gia **tự chọn loại đồ uống** (bia / rượu mạnh / cocktail) khi vào Sảnh Chờ — hệ thống tự quy đổi "1 ngụm" theo thể tích tương ứng (≈50ml bia / ≈15ml rượu mạnh / ≈30ml cocktail) để công bằng giữa người uống nhẹ và người uống nặng.

## 3. Chuẩn bị trước giờ chơi

- Đảm bảo Supabase project chưa bị "Paused" (vào dashboard kiểm tra) và đã chạy `supabase/schema.sql` ít nhất 1 lần.
- Mở https://ngthnam.github.io/lamchuyen/ trên màn hình chung, bấm **"🖥️ Trình chiếu trên màn hình này"**.
- Đợi mọi người vào phòng (quét QR hiện trên màn hình, hoặc gõ mã 5 ký tự).
- Mẹo: nhắc mọi người **để âm lượng điện thoại đủ lớn** — vài hiệu ứng (rung + tiếng "tách") chỉ phát trên điện thoại của riêng họ, không qua loa TV.
- Quản trò chỉ cần ≥1 người vào phòng là có thể bấm **"Bắt đầu trò chơi"** để qua Đấu Trường, nhưng nên đợi gần đủ người để ai cũng được chứng kiến màn giới thiệu.

## 4. Trình tự chơi — từng bước

### Bước 1 — Sảnh Chờ (Lounge)
- Màn hình chung hiện mã phòng + QR to.
- Mỗi điện thoại: nhập tên, chọn đồ uống, rồi chờ.
- Quản trò: khi thấy đủ người, bấm **"Bắt đầu trò chơi"**.

### Bước 2 — Đấu Trường (Dashboard)
- Màn hình chung hiện tên 3 thử thách sắp tới + bảng thống kê (trống lúc đầu, sẽ tự lấp đầy sau mỗi vòng).
- Điện thoại mọi người chỉ hiện "hãy nhìn lên màn hình lớn" — đây là lúc nhắc mọi người **tập trung vào TV** vì từ giờ điện thoại chỉ còn là tay cầm.
- Quản trò bấm **"Vào vòng Synapse"**.

### Bước 3 — Synapse (Phản xạ)
- Quản trò bấm **"Vào vòng"**: hệ thống chờ ngẫu nhiên 0.1–10 giây rồi phát tiếng "bíp" báo hiệu — mọi thiết bị nghe/rung cùng lúc.
- Người chơi: chạm điện thoại ngay khi vòng tròn chuyển đỏ. Chạm sớm = phạt nửa ngụm ngay. Không chạm trong 10 giây = coi như thua, phạt đầy 1 ngụm.
- Quản trò theo dõi bảng phản xạ hiện trực tiếp trên màn hình chung (xếp từ nhanh → chậm → phạm luật → hết giờ).
- Khi thấy đủ người đã chạm (không cần 100%), bấm **"Vòng tiếp theo"** — hệ thống tự phạt người chậm nhất 1 ngụm và mở vòng mới ngay.
- Lặp lại 3–5 vòng là đủ để có dữ liệu cho phần Tổng Kết. Muốn dùng "Đảo Cực" thì bấm nút đó *trước khi* bấm "Vào vòng" (xem mục 6).
- Xong thì bấm **"Két Sắt ▶"**.

### Bước 4 — Két Sắt (Vault)
- Màn hình chung hiện 1 dãy số (ví dụ `2 · 6 · 12 · 20 · 30 · ?`).
- Mỗi người tự đặt cược riêng (1 / 2 / 3 / Tất tay) rồi gõ số họ đoán là số tiếp theo, bấm "Mở khóa".
- Đoán đúng: được chọn 1 người khác để "bắn" 1 ngụm phạt sang.
- Đoán sai: tự uống đúng số ngụm đã cược.
- Quản trò bấm **"Câu đố tiếp theo"** để đổi câu đố mới (xoay vòng qua 6 câu có sẵn), hoặc bấm **"Paradox ▶"** khi muốn chuyển cảnh.

### Bước 5 — Paradox (Trí nhớ ngược)
- Quản trò bấm **"▶ Lật các thẻ"**: màn hình chung hiện 5 thẻ chữ/màu mâu thuẫn nhau trong ~3 giây để mọi người ghi nhớ, rồi tự úp lại.
- Màn hình hỏi: "Vị trí nào giữ chữ NÓNG?" — mỗi người chọn 1 trong 5 vị trí trên điện thoại.
- Sai 2 lần liên tiếp → điện thoại người đó bị "Blackout" (đen toàn màn hình), phải tự uống 1 ngụm và chạm "KHỞI ĐỘNG LẠI" để chơi tiếp.
- Quản trò bấm **"Lượt tiếp theo"** để lặp lại, hoặc **"Tổng Kết ▶"** khi muốn kết thúc.

### Bước 6 — Tổng Kết (Hangover Report)
- Hiện 2 danh hiệu: "Bộ Não Silicon" (người chơi tốt nhất đêm) và "Lỗi Hệ Thống" (người tệ nhất), cùng sổ ngụm đầy đủ.
- Đây là lúc dùng **Sự Đảo Ngược Cuối Cùng** nếu muốn (xem mục 6) — chỉ dùng được 1 lần.
- Bấm **"Chơi lại"** để reset toàn bộ (vẫn giữ mã phòng cũ, mọi người không cần quét lại QR) và chơi vòng mới từ Sảnh Chờ.

## 5. Cách khuấy động cao trào

- **Bình luận to, sống động như host gameshow thật** — đừng để màn hình tự nói chuyện một mình. Khi bảng phản xạ Synapse hiện kết quả, đọc to tên người chậm nhất, trêu vài câu trước khi bấm "Vòng tiếp theo".
- **Đừng vội chuyển cảnh.** Mỗi khi có người bị phạt (chạm sớm, hết giờ, thua Két Sắt, Blackout Paradox), màn hình chung sẽ tự nháy đỏ + phát âm thanh trầm ("BRAAM") — đợi vài giây cho cả phòng "ồ" lên rồi mới bấm tiếp.
- **Tăng dần độ khó/tốc độ theo thời gian.** Vài vòng Synapse đầu cho mọi người làm quen, sau đó xen Két Sắt/Paradox để đổi nhịp, rồi quay lại Synapse với Đảo Cực để gây bất ngờ.
- **Dùng bảng xếp hạng ở Đấu Trường/Két Sắt** để chỉ ra ai đang "dẫn đầu số ngụm" — tạo áp lực ngầm, khiến người đó dè chừng hơn ở vòng sau.
- **Không cần làm hết cả 3 trò chơi theo đúng 1 lượt.** Có thể quay lại Synapse nhiều lần xen giữa Két Sắt/Paradox nếu cả phòng đang sung — quản trò có toàn quyền nhảy giữa các màn qua thanh điều hướng cảnh dưới màn hình.

## 6. Khi nào nên tung Plot Twist?

Đây là phần **chỉ quản trò nên biết** — đọc trước, không nói ra cho người chơi.

- **🕵️ Kẻ Nội Gián — tung SỚM.** Bấm ngay từ Sảnh Chờ hoặc Đấu Trường, trước khi vào Synapse vòng đầu. Lý do: hiệu ứng tâm lý ("ai trong phòng đang là nội gián?") cần thời gian để "ủ" và lan tỏa sự nghi ngờ suốt buổi. Tung quá muộn (gần cuối) sẽ không còn đất để phát huy. Mỗi lần bấm sẽ chọn lại người mới, làm mất khiên của người cũ — chỉ bấm lại nếu muốn "thay nội gián" có chủ đích.
- **🔄 Đảo Cực — tung GIỮA game, sau khi mọi người đã quen luật gốc.** Bật toggle này trước khi bấm "Vào vòng" ở Synapse, lý tưởng là sau 2–3 vòng bình thường (để ai cũng hiểu "nhanh = thắng" trước khi bị đảo ngược). Hệ thống tự thông báo cho cả phòng ngay khi vòng được tung ra ("vòng này ai NHANH NHẤT sẽ bị phạt") — nên đây là bất ngờ về *luật*, không phải bất ngờ bị giấu kín, sẽ vui nhất khi vài người theo phản xạ cũ vẫn cố chạm nhanh.
- **🎲 Thuế Tập Thể — tung NGẪU NHIÊN, bất cứ lúc nào không khí đang chững.** Không cần lý do, không cần thời điểm đẹp — đây là nút "gây chaos" để làm mới năng lượng phòng khi mọi người đang tập trung quá nghiêm túc vào việc thắng/thua.
- **🌀 Sự Đảo Ngược Cuối Cùng — CHỈ tung 1 lần, ngay trước khi chốt Tổng Kết.** Đây là plot twist kết thúc theo đúng nghĩa: nó đảo ngược toàn bộ sổ ngụm, biến người uống ít nhất thành người phải "trả nợ" toàn bộ chênh lệch trong 1 lần. Đừng tung sớm — sức nặng của nó nằm ở việc mọi người vừa mới thấy bảng xếp hạng, tưởng đã "thoát nạn" cả đêm.
- **Nguyên tắc chung:** không tung 2 twist liên tiếp trong vòng 1–2 phút — để mỗi twist có không gian riêng để cả phòng phản ứng, bàn tán, rồi mới tới twist tiếp theo.

## 7. Mẹo nhỏ khác

- Mã phòng hiện ở góc trên màn hình chung mọi lúc (bấm vào để copy link) — ai vào muộn vẫn join được giữa game.
- Quên đăng nhập lại do refresh trang? Không sao, phiên chơi tự lưu lại theo thiết bị (localStorage) — mở lại đúng trình duyệt cũ là vào lại đúng vai trò cũ.
- Có nút "⏏" ở góc màn hình để rời phòng hẳn (xoá phiên cục bộ) — dùng khi đổi máy host hoặc kết thúc hẳn buổi chơi.
