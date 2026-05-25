# P04 - Predictive Maintenance bằng vibration anomaly detection

## Nguồn gốc nên học

- Edge Impulse Industrial Compressor Predictive Maintenance - Nordic Thingy:53: https://docs.edgeimpulse.com/projects/expert-network/compressor-predictive-maintenance-nordic-thingy53
- Edge Impulse Predictive Maintenance - Nordic Thingy:91: https://docs.edgeimpulse.com/projects/expert-network/predictive-maintenance-with-nordic-thingy91
- Edge Impulse deployment docs: https://docs.edgeimpulse.com/studio/projects/deployment

## Mục tiêu

Project này đưa các bạn ra khỏi vùng camera AI và đi vào sensor/time-series Edge AI. Đây là hướng rất thực tế trong công nghiệp: đọc vibration, phát hiện bất thường và cảnh báo trước khi máy hỏng nặng.

## Cách triển khai tối thiểu

1. Nếu có board/sensor, thu dữ liệu rung bình thường và rung bất thường.
2. Nếu chưa có board, mô phỏng tín hiệu rung trong Python hoặc dùng dataset mẫu để học pipeline trước.
3. Chia dữ liệu thành window cố định.
4. Trích feature hoặc dùng pipeline Edge Impulse để tạo spectral features.
5. Train model phân biệt normal/anomaly.
6. Chạy inference theo window thời gian.

## Các bạn cần nộp

- Mô tả cách tạo dữ liệu normal và anomaly.
- Biểu đồ tín hiệu theo thời gian và phổ tần số nếu có.
- Confusion matrix hoặc kết quả anomaly score.
- Payload cảnh báo mẫu: device_id, timestamp, anomaly_score, status.

## Nâng cấp để đưa vào CV

- So sánh feature thủ công với model học trực tiếp từ raw signal.
- Thêm cảnh báo sớm khi anomaly kéo dài N window liên tiếp.
- Thêm logging offline khi mất mạng.
- Viết case study giống công nghiệp: động cơ, quạt, bơm hoặc máy nén.

## Câu hỏi mentor

- Dữ liệu anomaly có đại diện cho lỗi thật không, hay chỉ là rung giả lập?
- Window dài/ngắn ảnh hưởng latency cảnh báo thế nào?
- Nếu sensor bị lỏng hoặc mất gói, hệ thống có báo sai không?

## Tiêu chí hoàn thành

Project đạt yêu cầu khi các bạn giải thích được toàn bộ pipeline sensor -> window -> feature -> model -> anomaly score -> event. Phần đáng giá nhất không phải accuracy cao, mà là cách các bạn xử lý dữ liệu thật và cảnh báo đáng tin cậy.
