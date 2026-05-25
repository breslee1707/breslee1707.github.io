# P05 - Fall Detection wearable bằng accelerometer TinyML

## Nguồn gốc nên học

- Edge Impulse Arduino x K-Way TinyML Fall Detection: https://docs.edgeimpulse.com/projects/expert-network/arduino-kway-fall-detection
- Edge Impulse Bluetooth Fall Detection - Arduino Nano 33 BLE Sense: https://docs.edgeimpulse.com/projects/expert-network/bluetooth-fall-detection-arduino-nano-33

## Mục tiêu

Project này giúp các bạn hiểu dữ liệu IMU 3 trục và bài toán wearable AI. Fall detection nghe đơn giản, nhưng khó ở chỗ model dễ nhầm giữa ngã thật, ngồi mạnh, chạy, cúi người hoặc thả thiết bị xuống bàn.

## Cách triển khai tối thiểu

1. Thu dữ liệu các hành động: đứng yên, đi bộ, ngồi xuống, cúi người, mô phỏng ngã an toàn.
2. Chia dữ liệu thành window cố định.
3. Train model phân loại fall/non-fall hoặc anomaly detection.
4. Deploy thử trên board hoặc chạy inference offline bằng file CSV.
5. Đánh giá riêng các hành động dễ nhầm, ví dụ ngồi phịch xuống ghế.

## Các bạn cần nộp

- Bảng nhãn hành động đã thu.
- Biểu đồ 3 trục accelerometer cho ít nhất 3 hành động.
- Kết quả model trên các hành động dễ nhầm.
- Ghi chú an toàn khi thu dữ liệu. Tuyệt đối không tự ngã nguy hiểm.

## Nâng cấp để đưa vào CV

- Thêm ngưỡng confidence và cơ chế xác nhận nhiều window liên tiếp.
- Thêm Bluetooth/MQTT/HTTP event khi phát hiện fall.
- Thêm power-saving mode: chỉ inference khi gia tốc vượt ngưỡng sơ bộ.
- Thêm hard-negative data: cúi người, chạy nhẹ, ngồi mạnh, nhảy nhỏ.

## Câu hỏi mentor

- Dữ liệu normal đã đủ phong phú chưa?
- Mô hình nhầm giữa fall và non-fall ở tình huống nào?
- Nếu triển khai thật, các bạn sẽ giảm báo động giả bằng cách nào?

## Tiêu chí hoàn thành

Project đạt yêu cầu khi các bạn không chỉ train được model, mà còn chứng minh model không báo động lung tung trước các hành động bình thường nhưng dễ nhầm.
